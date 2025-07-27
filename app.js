class MoodTracker {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.fullTranscript = '';
        this.speechSynthesis = window.speechSynthesis;
        this.moodsData = null; // Will hold moods.json data
        this.currentMessage = ''; // Store current support message
        this.currentAudioData = null; // Store audio data from GPT-4o-mini + TTS
        this.initializeElements();
        this.bindEvents();
        this.loadMoodsData();
    }

    async loadMoodsData() {
        try {
            const res = await fetch('moods.json');
            const data = await res.json();
            this.moodsData = data.moods || [];
        } catch (e) {
            console.error('Failed to load moods.json:', e);
            this.moodsData = [];
        }
    }

    initializeElements() {
        this.micButton = document.getElementById('micButton');
        this.micIcon = document.getElementById('micIcon');
        this.micStatus = document.getElementById('micStatus');
        this.transcriptContainer = document.getElementById('transcriptContainer');
        this.liveTranscript = document.getElementById('liveTranscript');
        this.resultContainer = document.getElementById('resultContainer');
        this.loadingContainer = document.getElementById('loadingContainer');
        this.detectedMood = document.getElementById('detectedMood');
        this.moodEmoji = document.getElementById('moodEmoji');
        this.supportMessage = document.getElementById('supportMessage');
        this.speakButton = document.getElementById('speakButton');
    }

    bindEvents() {
        this.micButton.addEventListener('click', () => this.toggleRecording());
        this.speakButton.addEventListener('click', () => this.speakResponseWithAudio());
    }

    async toggleRecording() {
        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            this.isRecording = true;
            this.fullTranscript = '';
            this.audioChunks = [];
            this.updateUI('recording');
            
            this.showProcessingStep('🎤 Getting microphone access...');
            
            // Get microphone stream
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            console.log('✅ Microphone access granted');
            this.showProcessingStep('🔴 Recording... Click stop when finished');
            
            // Create MediaRecorder for audio capture
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                console.log('📼 Recording stopped, processing audio...');
                this.processRecordedAudio();
            };
            
            // Start recording
            this.mediaRecorder.start();
            console.log('🔴 Recording started...');

        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showError('Failed to access microphone: ' + error.message);
            this.isRecording = false;
            this.updateUI('idle');
        }
    }

    async stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.showProcessingStep('⏹️ Stopping recording...');
            this.mediaRecorder.stop();
            
            // Stop all media tracks
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        }
        
        this.isRecording = false;
        this.updateUI('processing');
    }

    async processRecordedAudio() {
        try {
            this.showProcessingStep('🔄 Processing recorded audio...');
            
            // Create audio blob from chunks
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
            console.log('� Created audio blob:', audioBlob.size, 'bytes');
            
            // Convert to base64 for upload
            const base64Audio = await this.blobToBase64(audioBlob);
            console.log('� Converted to base64, length:', base64Audio.length);
            
            this.showProcessingStep('📤 Uploading to AssemblyAI for transcription...');
            
            // Send to backend for AssemblyAI processing
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    audioData: base64Audio
                })
            });
            
            if (!response.ok) {
                throw new Error(`Transcription failed: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ AssemblyAI transcription result:', result);
            
            if (result.text && result.text.trim()) {
                this.fullTranscript = result.text.trim();
                this.liveTranscript.textContent = this.fullTranscript;
                this.showProcessingStep('✅ Transcription complete: ' + this.fullTranscript.substring(0, 40) + '...');
                
                // Process the mood
                await this.processMood(this.fullTranscript);
            } else {
                throw new Error('No transcription received from AssemblyAI');
            }
            
        } catch (error) {
            console.error('❌ Error processing recorded audio:', error);
            this.showError('Failed to process audio: ' + error.message);
            this.updateUI('idle');
        }
    }

    // Helper function to convert blob to base64
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Remove the data:audio/webm;codecs=opus;base64, prefix
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async processMood(text) {
        try {
            console.log('Processing mood for text:', text);
            this.showProcessingStep('🔍 Analyzing your words with Algolia MCP...');
            
            // 1. ONLY use Algolia MCP for mood detection (with local fallback)
            let moodObj = null;
            let detectedMood = null;
            
            try {
                console.log('Calling Algolia MCP...');
                const mcpRes = await fetch('/api/mcp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        index: 'moods',
                        query: text,
                        filters: ''
                    })
                });
                
                if (mcpRes.ok) {
                    const mcpData = await mcpRes.json();
                    console.log('MCP response:', mcpData);
                    if (mcpData.hits && mcpData.hits.length > 0) {
                        moodObj = mcpData.hits[0];
                        detectedMood = moodObj.name;
                        console.log('✅ Mood detected via MCP:', detectedMood);
                        this.showProcessingStep(`✅ Mood detected: ${detectedMood}`);
                    } else {
                        throw new Error('No mood matches found in search results');
                    }
                } else {
                    const errorText = await mcpRes.text();
                    throw new Error(`MCP endpoint error: ${errorText}`);
                }
            } catch (e) {
                console.error('❌ MCP failed:', e);
                this.showError('Failed to detect mood: ' + e.message);
                this.updateUI('idle');
                return;
            }

            // 2. Generate empathetic response with GPT-4o-mini and convert to speech
            this.showProcessingStep('🤖 Generating personalized response with GPT-4o-mini + TTS...');
            let supportMessage = moodObj.support_message || 'I understand how you\'re feeling. You\'re not alone in this.';
            let audioData = null;
            
            try {
                console.log('Calling GPT-4o-mini with TTS for empathetic response...');
                const llmRes = await fetch('/api/llm-audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        mood: detectedMood, 
                        text: text 
                    })
                });
                
                if (llmRes.ok) {
                    const llmData = await llmRes.json();
                    if (llmData.message) {
                        supportMessage = llmData.message;
                        audioData = llmData.audioData; // Get audio from TTS
                        console.log('✅ GPT-4o-mini + TTS response:', supportMessage);
                        this.showProcessingStep('✅ Audio response generated successfully!');
                    }
                } else {
                    const errorText = await llmRes.text();
                    console.warn('⚠️ GPT-4o-mini + TTS error:', errorText);
                    this.showProcessingStep('⚠️ Using default support message');
                }
            } catch (e) {
                console.warn('⚠️ GPT-4o-mini + TTS error, using default support message:', e);
                this.showProcessingStep('⚠️ Using default support message');
            }

            // 3. Display results without showing text first
            this.displayResults(detectedMood, { 
                emoji: moodObj.emoji, 
                message: supportMessage,
                audioData: audioData // Pass audio data directly
            });
            
        } catch (error) {
            console.error('❌ Failed to process mood:', error);
            this.showError('Failed to analyze mood: ' + error.message);
            this.updateUI('idle');
        }
    }
    
    showProcessingStep(message) {
        // Update the processing step indicator
        const stepIndicator = document.getElementById('processingStep');
        if (stepIndicator) {
            stepIndicator.textContent = message;
        }
        console.log('Processing step:', message);
    }

    detectMood(text) {
        const lowerText = text.toLowerCase();
        
        // Simple mood detection heuristics
        if (lowerText.includes('burnt out') || lowerText.includes('exhausted') || lowerText.includes('tired')) {
            return 'burnt out';
        } else if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous') || lowerText.includes('stress')) {
            return 'anxious';
        } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('down') || lowerText.includes('blue')) {
            return 'sad';
        } else if (lowerText.includes('angry') || lowerText.includes('frustrated') || lowerText.includes('mad') || lowerText.includes('upset')) {
            return 'angry';
        } else if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited') || lowerText.includes('great')) {
            return 'happy';
        } else if (lowerText.includes('hopeful') || lowerText.includes('optimistic') || lowerText.includes('positive')) {
            return 'hopeful';
        } else if (lowerText.includes('lonely') || lowerText.includes('alone') || lowerText.includes('isolated')) {
            return 'lonely';
        } else {
            return 'neutral';
        }
    }

    getSupportMessage(mood) {
        const supportMessages = {
            'burnt out': {
                emoji: '😴',
                message: "It sounds like you're running on empty. Remember, it's okay to take breaks and recharge. Try stepping away from your work for 10 minutes, or consider what you can delegate. Your well-being matters more than any task."
            },
            'anxious': {
                emoji: '😰',
                message: "I hear that worry in your voice. Take a deep breath with me - inhale for 4 counts, hold for 4, exhale for 4. Remember, most of what we worry about never happens. What's one small thing you can do right now to feel more grounded?"
            },
            'sad': {
                emoji: '😔',
                message: "I'm sorry you're feeling down. It's okay to not be okay sometimes. Maybe try doing something kind for yourself today - a warm drink, a favorite song, or reaching out to someone who cares about you. You don't have to go through this alone."
            },
            'angry': {
                emoji: '😤',
                message: "That frustration is totally valid. Sometimes we need to feel angry to process what's happening. Try taking a few deep breaths or stepping away for a moment. What's really behind this anger? Understanding that might help you feel more in control."
            },
            'happy': {
                emoji: '😊',
                message: "Your joy is contagious! It's wonderful to hear you feeling good. Savor this moment and maybe share that positive energy with someone else. Happiness shared is happiness multiplied."
            },
            'hopeful': {
                emoji: '✨',
                message: "That hope in your voice is beautiful. Hold onto that optimism - it's a superpower. When you believe good things are possible, you're more likely to make them happen. Keep that positive energy flowing!"
            },
            'lonely': {
                emoji: '🤗',
                message: "I hear that loneliness, and I want you to know you're not alone in feeling alone. It's a human experience many of us share. Maybe try reaching out to someone today, even just a quick text. You'd be surprised how many people want to connect."
            },
            'neutral': {
                emoji: '🤔',
                message: "I'm here to listen, whatever you're feeling. Sometimes just talking things out can help us understand ourselves better. Is there anything specific on your mind that you'd like to explore?"
            }
        };

        return supportMessages[mood] || supportMessages['neutral'];
    }

    displayResults(mood, supportData) {
        this.detectedMood.textContent = mood.charAt(0).toUpperCase() + mood.slice(1);
        this.moodEmoji.textContent = supportData.emoji;
        
        // Hide the support message initially - it will show during TTS playback
        this.supportMessage.textContent = '';
        this.supportMessage.style.visibility = 'hidden';
        
        // Store the message and audio for later use
        this.currentMessage = supportData.message;
        this.currentAudioData = supportData.audioData;
        
        this.updateUI('result');
        
        // Automatically play the audio response after a short delay
        setTimeout(() => {
            console.log('🎵 Auto-playing empathetic audio response...');
            this.speakResponseWithAudio();
        }, 1000); // 1 second delay to let user see the mood detection result
    }

    updateUI(state) {
        // Hide all containers first
        this.transcriptContainer.classList.add('hidden');
        this.resultContainer.classList.add('hidden');
        this.loadingContainer.classList.add('hidden');

        switch (state) {
            case 'idle':
                this.micIcon.className = 'fas fa-microphone text-white text-2xl';
                this.micButton.classList.remove('pulse-animation');
                this.micStatus.textContent = 'Click to start speaking';
                break;
            
            case 'recording':
                this.micIcon.className = 'fas fa-stop text-white text-2xl';
                this.micButton.classList.add('pulse-animation');
                this.micStatus.textContent = 'Recording... Click to stop';
                this.transcriptContainer.classList.remove('hidden');
                break;
            
            case 'processing':
                this.micIcon.className = 'fas fa-microphone text-white text-2xl';
                this.micButton.classList.remove('pulse-animation');
                this.micStatus.textContent = 'Processing...';
                this.loadingContainer.classList.remove('hidden');
                break;
            
            case 'result':
                this.micIcon.className = 'fas fa-microphone text-white text-2xl';
                this.micButton.classList.remove('pulse-animation');
                this.micStatus.textContent = 'Click to speak again';
                this.resultContainer.classList.remove('hidden');
                break;
        }
    }

    async speakResponseWithAudio() {
        if (!this.currentMessage) {
            console.warn('No support message to speak');
            return;
        }

        const textToSpeak = this.currentMessage;
        console.log('🗣️ Speaking response with GPT-4o-mini Audio:', textToSpeak.substring(0, 50) + '...');

        try {
            // If we have audio data from GPT-4o-mini + TTS, use it directly
            if (this.currentAudioData) {
                console.log('✅ Playing GPT-4o-mini + TTS generated audio');
                
                // Show and start typing animation during audio playback
                this.supportMessage.style.visibility = 'visible';
                this.startTypingAnimation(textToSpeak);
                
                // Create audio element and play GPT-4o-mini audio
                const audio = new Audio(this.currentAudioData);
                audio.volume = 0.8;
                
                // Update speak button to show playing state
                const originalText = this.speakButton.textContent;
                this.speakButton.textContent = '🔊 Speaking...';
                this.speakButton.disabled = true;
                
                audio.onended = () => {
                    this.speakButton.textContent = originalText;
                    this.speakButton.disabled = false;
                    this.stopTypingAnimation();
                    console.log('✅ GPT-4o-mini + TTS playback completed');
                };
                
                audio.onerror = (error) => {
                    console.error('❌ Error playing GPT-4o-mini + TTS audio:', error);
                    this.speakButton.textContent = originalText;
                    this.speakButton.disabled = false;
                    this.stopTypingAnimation();
                    this.fallbackToWebSpeech(textToSpeak);
                };
                
                await audio.play();
                
            } else {
                // Fallback to OpenAI TTS if no audio data from GPT-4o-mini + TTS
                console.log('⚠️ No GPT-4o-mini + TTS audio data, trying OpenAI TTS fallback');
                await this.speakResponse();
            }
            
        } catch (error) {
            console.error('❌ GPT-4o-mini + TTS playback failed:', error);
            console.log('⚠️ Falling back to OpenAI TTS');
            await this.speakResponse();
        }
    }

    async speakResponse() {
        if (!this.currentMessage) {
            console.warn('No support message to speak');
            return;
        }

        const textToSpeak = this.currentMessage;
        console.log('🗣️ Speaking response with OpenAI TTS:', textToSpeak.substring(0, 50) + '...');

        try {
            // Try OpenAI text-to-speech as fallback
            const response = await fetch('/api/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: textToSpeak
                })
            });

            if (!response.ok) {
                throw new Error(`Speech API error: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success && result.audioData) {
                console.log('✅ Playing OpenAI TTS generated speech');
                
                // Show and start typing animation
                this.supportMessage.style.visibility = 'visible';
                this.startTypingAnimation(textToSpeak);
                
                // Create audio element and play OpenAI audio
                const audio = new Audio(result.audioData);
                audio.volume = 0.8;
                
                // Update speak button to show playing state
                const originalText = this.speakButton.textContent;
                this.speakButton.textContent = '🔊 Speaking...';
                this.speakButton.disabled = true;
                
                audio.onended = () => {
                    this.speakButton.textContent = originalText;
                    this.speakButton.disabled = false;
                    this.stopTypingAnimation();
                    console.log('✅ OpenAI TTS playback completed');
                };
                
                audio.onerror = (error) => {
                    console.error('❌ Error playing OpenAI TTS audio:', error);
                    this.speakButton.textContent = originalText;
                    this.speakButton.disabled = false;
                    this.stopTypingAnimation();
                    this.fallbackToWebSpeech(textToSpeak);
                };
                
                await audio.play();
                
            } else if (result.fallback) {
                console.log('⚠️ OpenAI TTS not available, using browser fallback');
                this.fallbackToWebSpeech(textToSpeak);
            } else {
                throw new Error('Unknown response format from speech API');
            }
            
        } catch (error) {
            console.error('❌ OpenAI TTS failed:', error);
            console.log('⚠️ Falling back to browser speech synthesis');
            this.fallbackToWebSpeech(textToSpeak);
        }
    }

    startTypingAnimation(text) {
        // Clear existing animation
        this.stopTypingAnimation();
        
        // Store original text
        this.originalMessageText = this.supportMessage.textContent;
        
        // Start typing animation
        let currentIndex = 0;
        this.supportMessage.textContent = '';
        this.supportMessage.classList.add('typing-animation');
        
        this.typingInterval = setInterval(() => {
            if (currentIndex < text.length) {
                this.supportMessage.textContent += text[currentIndex];
                currentIndex++;
            } else {
                this.stopTypingAnimation();
            }
        }, 30); // 30ms per character for natural typing speed
        
        console.log('🎬 Started typing animation');
    }

    stopTypingAnimation() {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
        }
        
        if (this.supportMessage) {
            this.supportMessage.classList.remove('typing-animation');
            // Ensure full text is displayed
            if (this.originalMessageText) {
                this.supportMessage.textContent = this.originalMessageText;
            }
        }
        
        console.log('🎬 Stopped typing animation');
    }

    fallbackToWebSpeech(text) {
        if (this.speechSynthesis) {
            // Stop any current speech
            this.speechSynthesis.cancel();
            
            // Show and start typing animation for fallback too
            this.supportMessage.style.visibility = 'visible';
            this.startTypingAnimation(text);
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Try to use a more natural voice
            const voices = this.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Samantha') || 
                voice.name.includes('Alex') || 
                voice.name.includes('Google') ||
                voice.name.includes('Natural')
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            // Update button state during speech
            const originalText = this.speakButton.textContent;
            this.speakButton.textContent = '🔊 Speaking...';
            this.speakButton.disabled = true;
            
            utterance.onend = () => {
                this.speakButton.textContent = originalText;
                this.speakButton.disabled = false;
                this.stopTypingAnimation();
                console.log('✅ Browser speech synthesis completed');
            };
            
            utterance.onerror = (error) => {
                console.error('❌ Browser speech synthesis error:', error);
                this.speakButton.textContent = originalText;
                this.speakButton.disabled = false;
                this.stopTypingAnimation();
            };
            
            this.speechSynthesis.speak(utterance);
            console.log('🗣️ Using browser speech synthesis with typing animation');
        } else {
            console.error('❌ No speech synthesis available');
            // Still show the text if no speech is available
            this.supportMessage.style.visibility = 'visible';
            this.supportMessage.textContent = text;
        }
    }

    showError(message) {
        this.micStatus.textContent = message;
        setTimeout(() => {
            this.updateUI('idle');
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MoodTracker();
}); 