const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('.'));
app.use(bodyParser.json());

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'How\'s My Day? server is running!' });
});

// Upload moods.json to Algolia index (run once to setup)
app.post('/api/setup-algolia', async (req, res) => {
    const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
    const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
    
    console.log('Algolia setup - App ID:', ALGOLIA_APP_ID);
    console.log('Algolia setup - API Key exists:', !!ALGOLIA_API_KEY);
    
    if (!ALGOLIA_APP_ID || !ALGOLIA_API_KEY || ALGOLIA_APP_ID === 'your_algolia_app_id') {
        return res.status(500).json({ error: 'Algolia credentials not set properly in .env' });
    }
    try {
        const moodsData = JSON.parse(fs.readFileSync('moods.json', 'utf8'));
        const records = moodsData.moods.map(mood => ({
            objectID: mood.id,
            ...mood
        }));
        
        console.log('Records to upload:', records.length);
        
        // Add records directly (skip clear for now)
        const result = await axios.post(
            `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/moods/batch`,
            { requests: records.map(record => ({ action: 'updateObject', body: record })) },
            {
                headers: {
                    'X-Algolia-API-Key': ALGOLIA_API_KEY,
                    'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                },
            }
        );
        
        console.log('Algolia response:', result.data);
        
        res.json({ 
            message: 'Moods uploaded to Algolia successfully', 
            records: records.length,
            result: result.data 
        });
    } catch (e) {
        console.error('Algolia setup error:', e.response?.data || e.message);
        res.status(500).json({ 
            error: e.message, 
            details: e.response?.data 
        });
    }
});

// Algolia MCP proxy endpoint
app.post('/api/mcp', async (req, res) => {
    const { query, index, filters } = req.body;
    const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
    const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
    
    console.log('MCP request:', { query, index, filters });
    
    if (!ALGOLIA_APP_ID || !ALGOLIA_API_KEY) {
        return res.status(500).json({ error: 'Algolia credentials not set in .env' });
    }
    
    try {
        // Try Algolia first
        const result = await axios.post(
            `https://${ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${index}/query`,
            { query, filters },
            {
                headers: {
                    'X-Algolia-API-Key': ALGOLIA_API_KEY,
                    'X-Algolia-Application-Id': ALGOLIA_APP_ID,
                },
            }
        );
        console.log('Algolia search successful:', result.data);
        res.json(result.data);
    } catch (e) {
        console.log('Algolia search failed, using enhanced local fallback:', e.response?.data || e.message);
        
        // Log specific Algolia issues
        if (e.response?.status === 404) {
            console.log('💡 Note: Algolia index "moods" does not exist. You need to:');
            console.log('   1. Use an Admin API key (not Search-only key)');
            console.log('   2. Call POST /api/setup-algolia to create the index');
            console.log('   3. Or continue using the enhanced local search below');
        } else if (e.response?.status === 400) {
            console.log('💡 Note: Algolia API key lacks write permissions. Using local search.');
        }
        
        // Fallback: Local search using moods.json
        try {
            const moodsData = JSON.parse(fs.readFileSync('moods.json', 'utf8'));
            const queryLower = query.toLowerCase();
            
            console.log('Searching locally for:', queryLower);
            
            // Enhanced search algorithm
            const searchWords = queryLower.split(/\s+/).filter(word => word.length > 2);
            let moodScores = new Map();
            
            // Score each mood based on keyword matches
            moodsData.moods.forEach(mood => {
                let score = 0;
                
                // Direct keyword matches (highest score)
                mood.keywords.forEach(keyword => {
                    const keywordLower = keyword.toLowerCase();
                    if (queryLower.includes(keywordLower) || keywordLower.includes(queryLower)) {
                        score += 10;
                    }
                    
                    // Partial word matches
                    searchWords.forEach(word => {
                        if (keywordLower.includes(word) || word.includes(keywordLower)) {
                            score += 5;
                        }
                    });
                });
                
                // Check mood name matches
                const moodNameLower = mood.name.toLowerCase();
                if (queryLower.includes(moodNameLower) || moodNameLower.includes(queryLower)) {
                    score += 8;
                }
                
                // Common emotion words detection
                const emotionMap = {
                    'good': ['happy', 'content', 'optimistic'],
                    'bad': ['sad', 'angry', 'frustrated'],
                    'tired': ['burnt-out', 'exhausted'],
                    'scared': ['anxious', 'worried'],
                    'alone': ['lonely', 'isolated'],
                    'fine': ['neutral', 'okay'],
                    'okay': ['neutral', 'content'],
                    'great': ['happy', 'excited'],
                    'terrible': ['sad', 'angry'],
                    'awful': ['sad', 'angry'],
                    'worried': ['anxious', 'stressed'],
                    'stressed': ['anxious', 'overwhelmed']
                };
                
                Object.entries(emotionMap).forEach(([queryWord, moodIds]) => {
                    if (queryLower.includes(queryWord) && moodIds.includes(mood.id)) {
                        score += 7;
                    }
                });
                
                if (score > 0) {
                    moodScores.set(mood, score);
                }
            });
            
            // Sort by score and get top matches
            let matchingMoods = Array.from(moodScores.entries())
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);
                
            console.log('Mood scores:', Array.from(moodScores.entries()).map(([mood, score]) => `${mood.name}: ${score}`));
            
            // If no matches, use neutral as fallback
            if (matchingMoods.length === 0) {
                console.log('No matches found, using neutral mood');
                const neutralMood = moodsData.moods.find(mood => mood.id === 'neutral');
                if (neutralMood) {
                    matchingMoods = [neutralMood];
                }
            }
            
            const formattedMoods = matchingMoods.slice(0, 5).map(mood => ({
                ...mood,
                objectID: mood.id,
                _highlightResult: {
                    name: { value: mood.name }
                }
            }));
            
            // Return in Algolia format
            const response = {
                hits: formattedMoods,
                nbHits: formattedMoods.length,
                page: 0,
                nbPages: 1,
                hitsPerPage: 5,
                exhaustiveNbHits: true,
                query: query,
                params: `query=${query}`
            };
            
            console.log('Local search results:', response.hits.length, 'matches:', response.hits.map(h => h.name));
            res.json(response);
        } catch (localError) {
            console.error('Local fallback failed:', localError);
            res.status(500).json({ error: 'Both Algolia and local search failed: ' + localError.message });
        }
    }
});

// AssemblyAI transcription endpoint
app.post('/api/transcribe', async (req, res) => {
    const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
    
    if (!ASSEMBLYAI_API_KEY || ASSEMBLYAI_API_KEY === 'YOUR_ASSEMBLYAI_API_KEY') {
        return res.status(500).json({ error: 'AssemblyAI API key not set properly in .env' });
    }

    try {
        const { audioData } = req.body; // Base64 encoded audio data
        
        console.log('📤 Uploading audio to AssemblyAI...');
        
        // Step 1: Upload audio file to AssemblyAI
        const uploadResponse = await axios.post(
            'https://api.assemblyai.com/v2/upload',
            Buffer.from(audioData, 'base64'),
            {
                headers: {
                    'authorization': ASSEMBLYAI_API_KEY,
                    'content-type': 'application/octet-stream'
                }
            }
        );
        
        const audioUrl = uploadResponse.data.upload_url;
        console.log('✅ Audio uploaded to AssemblyAI:', audioUrl);
        
        // Step 2: Request transcription
        const transcriptResponse = await axios.post(
            'https://api.assemblyai.com/v2/transcript',
            {
                audio_url: audioUrl,
                language_code: 'en'
            },
            {
                headers: {
                    'authorization': ASSEMBLYAI_API_KEY,
                    'content-type': 'application/json'
                }
            }
        );
        
        const transcriptId = transcriptResponse.data.id;
        console.log('🔄 Transcription job started:', transcriptId);
        
        // Step 3: Poll for completion
        let transcript = null;
        let attempts = 0;
        const maxAttempts = 60; // 5 minutes max wait
        
        while (attempts < maxAttempts) {
            const pollResponse = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                {
                    headers: {
                        'authorization': ASSEMBLYAI_API_KEY
                    }
                }
            );
            
            transcript = pollResponse.data;
            console.log(`🔄 Transcription status (${attempts + 1}/${maxAttempts}):`, transcript.status);
            
            if (transcript.status === 'completed') {
                console.log('✅ Transcription completed:', transcript.text);
                return res.json({ 
                    text: transcript.text,
                    confidence: transcript.confidence,
                    id: transcript.id
                });
            } else if (transcript.status === 'error') {
                console.error('❌ Transcription failed:', transcript.error);
                return res.status(500).json({ 
                    error: 'Transcription failed: ' + transcript.error 
                });
            }
            
            // Wait 5 seconds before next poll
            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
        }
        
        // Timeout
        console.error('⏰ Transcription timeout after 5 minutes');
        res.status(408).json({ error: 'Transcription timeout' });
        
    } catch (error) {
        console.error('❌ AssemblyAI transcription error:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Transcription failed: ' + (error.response?.data?.error || error.message)
        });
    }
});

// OpenAI LLM endpoint with GPT-4o-mini for generating empathetic responses
app.post('/api/llm-audio', async (req, res) => {
    const { mood, text } = req.body;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not set in .env' });
    }
    try {
        const systemPrompt = `You are a deeply caring friend who genuinely understands human emotions. The person you're talking to is feeling "${mood}" and they just shared: "${text}"

        Respond as a real human would - with genuine emotion, personal warmth, and authentic care. Your response should:
        
        - Sound like you're actually feeling their emotions with them
        - Use natural, conversational language (contractions, casual phrases)
        - Show vulnerability and humanity in your words
        - Include emotional expressions that feel real
        - Offer comfort that comes from the heart, not a textbook
        - Be 2-3 sentences that feel like a warm hug in words
        
        Don't sound clinical, robotic, or overly professional. Sound like a best friend who truly cares and has been through life's ups and downs themselves. Show real human empathy and connection.`;

        // First, generate the text response with GPT-4o-mini
        const textResult = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini', // Using GPT-4o-mini for faster, cost-effective text generation
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `I said: "${text}"` }
                ],
                max_tokens: 200,
                temperature: 0.8
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const message = textResult.data.choices[0].message.content;
        console.log('✅ GPT-4o-mini text response generated:', message.substring(0, 50) + '...');
        
        // Then, convert to speech using OpenAI TTS
        try {
            console.log('🗣️ Converting to speech with OpenAI TTS...');
            const speechResult = await axios.post(
                'https://api.openai.com/v1/audio/speech',
                {
                    model: 'tts-1-hd', // High-definition model for better quality
                    input: message,
                    voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
                    response_format: 'mp3',
                    speed: 1.0
                },
                {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer' // Important for audio data
                }
            );
            
            console.log('✅ OpenAI TTS audio generated successfully');
            
            // Convert audio buffer to base64
            const audioBase64 = Buffer.from(speechResult.data).toString('base64');
            
            // Return both text and audio
            res.json({ 
                success: true,
                message: message,
                audioData: `data:audio/mp3;base64,${audioBase64}`,
                format: 'mp3'
            });
            
        } catch (ttsError) {
            console.error('❌ OpenAI TTS error:', ttsError.response?.data || ttsError.message);
            // Return just the text if TTS fails
            res.json({ message });
        }
        
    } catch (e) {
        console.error('OpenAI error:', e.response?.data || e.message);
        res.status(500).json({ error: e.message });
    }
});

// OpenAI text-to-speech endpoint
app.post('/api/speak', async (req, res) => {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY') {
        return res.status(500).json({ error: 'OpenAI API key not set properly in .env' });
    }

    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required for speech synthesis' });
        }

        console.log('🗣️ Converting text to speech with OpenAI:', text.substring(0, 50) + '...');
        
        // Call OpenAI text-to-speech API
        const response = await axios.post(
            'https://api.openai.com/v1/audio/speech',
            {
                model: 'tts-1-hd', // High-definition model for better quality
                input: text,
                voice: 'alloy', // Options: alloy, echo, fable, onyx, nova, shimmer
                response_format: 'mp3',
                speed: 1.0
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer' // Important for audio data
            }
        );
        
        console.log('✅ OpenAI speech synthesis successful');
        
        // Convert audio buffer to base64
        const audioBase64 = Buffer.from(response.data).toString('base64');
        
        // Return the audio as base64 data URL
        res.json({
            success: true,
            audioData: `data:audio/mp3;base64,${audioBase64}`,
            format: 'mp3',
            text: text // Include text for typing animation
        });
        
    } catch (error) {
        console.error('❌ OpenAI speech synthesis error:', error.response?.data || error.message);
        
        // Log more detailed error information
        if (error.response?.data) {
            const errorData = error.response.data;
            console.error('📄 OpenAI TTS error details:', errorData);
        }
        
        // Fallback: Return text for browser's built-in speech synthesis
        res.json({
            success: false,
            fallback: true,
            text: req.body.text,
            error: 'OpenAI TTS not available, please use browser speech synthesis'
        });
    }
});

// For development - HTTP server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser and visit: http://localhost:${PORT}`);
    console.log(`⚠️  Note: Microphone access requires HTTPS in production`);
});

// Optional: HTTPS server for production (requires SSL certificates)
// Uncomment the following code if you have SSL certificates
/*
const httpsOptions = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem')
};

https.createServer(httpsOptions, app).listen(443, () => {
    console.log('🔒 HTTPS Server running on https://localhost:443');
});
*/