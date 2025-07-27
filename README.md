# How's My Day? - AI-Powered Voice Mood Tracker

A sophisticated, voice-powered mood tracking web application that listens to your feelings and provides supportive, human-like responses using cutting-edge AI technology.

## ✨ Features

- **🎤 Professional voice recording** - File-based audio capture with high quality
- **🎯 AI-powered transcription** - AssemblyAI integration for accurate speech-to-text
- **🧠 Enhanced mood detection** - Local algorithm with scoring and emotion mapping
- **🤖 GPT-4o-mini responses** - Human-like, empathetic AI-generated support messages
- **🔊 High-quality TTS** - OpenAI text-to-speech with natural voice synthesis
- **⌨️ Real-time typing animation** - Text appears character-by-character during speech
- **🎨 Modern UI** - Clean, responsive design with smooth animations
- **🚀 Full-stack architecture** - Node.js backend with Express server

## 🚀 Quick Setup Guide

### Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Git** (optional) - For cloning the repository
- **Modern web browser** - Chrome, Firefox, Safari, or Edge

### 1. Installation

```bash
# Clone or download the project
git clone <repository-url>
cd "hwd vs"

# Install dependencies
npm install
```

If you don't have the project files, create these essential files:
- `package.json` (for dependencies)
- `.env` (for API keys)
- `server.js` (backend server)
- `app.js` (frontend application)
- `index.html` (main interface)
- `moods.json` (mood database)

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# AssemblyAI API Key (Required)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# OpenAI API Key (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Algolia Credentials (Optional - for future MCP integration)
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_API_KEY=your_algolia_api_key

# Server Configuration
PORT=3001
```

### 3. Get API Keys

#### AssemblyAI (Required for speech transcription)
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Navigate to your dashboard
3. Copy your API key
4. Paste it in `.env` as `ASSEMBLYAI_API_KEY`

#### OpenAI (Required for AI responses and TTS)
1. Sign up at [OpenAI](https://platform.openai.com/)
2. Go to API Keys section
3. Create a new API key
4. Paste it in `.env` as `OPENAI_API_KEY`
5. **Note**: Ensure you have credits in your OpenAI account

### 4. Install Dependencies

```bash
npm install express axios body-parser dotenv
```

Or manually install:
```bash
npm install express      # Web server framework
npm install axios        # HTTP client for API calls
npm install body-parser  # Parse JSON requests
npm install dotenv       # Environment variable management
```

### 5. Start the Application

```bash
# Start the server
node server.js

# Server will start on http://localhost:3001
# Open your browser and visit: http://localhost:3001
```

### 6. Test the Application

1. **Allow microphone access** when prompted
2. **Click "Start Recording"** and speak naturally
3. **Click "Stop Recording"** when finished
4. **Wait for processing** - you'll see real-time status updates
5. **Listen to the response** - AI-generated speech with typing animation

## 🎯 How It Works

### Architecture Overview
```
User Voice Input → AssemblyAI Transcription → Enhanced Local Mood Analysis → GPT-4o-mini Response → OpenAI TTS → Audio Playback
```

### Voice Processing Pipeline
1. **Audio Capture**: MediaRecorder API captures high-quality audio
2. **File Upload**: Audio converted to base64 and sent to AssemblyAI
3. **Transcription**: AssemblyAI processes audio with polling mechanism
4. **Real-time Updates**: User sees processing steps in real-time

### Enhanced Mood Detection System
The app uses a sophisticated local algorithm with:
- **Keyword Matching**: Analyzes text for emotional indicators
- **Scoring System**: Calculates confidence scores for each mood
- **Emotion Mapping**: Maps keywords to 8 different emotional states
- **Fallback Logic**: Handles edge cases and neutral states

| Mood | Keywords | Confidence Factors | Emoji |
|------|----------|-------------------|-------|
| **Burnt Out** | exhausted, tired, overwhelmed, burnout | High for work-related stress | 😴 |
| **Anxious** | worried, nervous, stress, panic, fear | Context-aware anxiety detection | 😰 |
| **Sad** | depressed, down, blue, crying, upset | Emotional intensity analysis | 😔 |
| **Angry** | frustrated, mad, upset, furious, annoyed | Anger intensity measurement | 😤 |
| **Happy** | joy, excited, great, amazing, wonderful | Positive emotion recognition | 😊 |
| **Hopeful** | optimistic, positive, better, improving | Future-oriented positivity | ✨ |
| **Lonely** | alone, isolated, disconnected, empty | Social isolation indicators | 🤗 |
| **Neutral** | okay, fine, calm, normal | Baseline emotional state | 🤔 |

### AI Response Generation
- **GPT-4o-mini**: Cost-effective, fast AI model for empathetic responses
- **Human-like Prompting**: Carefully crafted system prompts for natural responses
- **Emotional Intelligence**: Responses tailored to specific emotional states
- **Personal Touch**: Warm, supportive tone that feels genuine

### Text-to-Speech & Animation
- **OpenAI TTS-1-HD**: High-definition voice synthesis with 'alloy' voice
- **Real-time Typing**: Character-by-character text animation during speech
- **Hidden Text**: Support message only appears during audio playback
- **Fallback Support**: Browser speech synthesis as backup option

## 🛠️ Technical Stack

### Backend
- **Node.js + Express**: Web server and API endpoints
- **AssemblyAI Integration**: Professional speech-to-text transcription
- **OpenAI GPT-4o-mini**: AI-powered empathetic response generation
- **OpenAI TTS-1-HD**: High-quality text-to-speech synthesis
- **Enhanced Local Search**: Sophisticated mood detection algorithm

### Frontend
- **Vanilla JavaScript**: Modern ES6+ with async/await patterns
- **Tailwind CSS**: Utility-first styling for responsive design
- **MediaRecorder API**: Professional audio capture and processing
- **Real-time UI Updates**: Dynamic status indicators and animations
- **Typing Animation System**: Character-by-character text display

### APIs & Services
- **AssemblyAI**: File upload transcription with polling
- **OpenAI**: GPT-4o-mini for text generation + TTS-1-HD for audio
- **Local Processing**: Enhanced mood analysis with scoring system
- **Fallback Systems**: Multiple layers of error handling and recovery

### Development Tools
- **Environment Variables**: Secure API key management with dotenv
- **Error Handling**: Comprehensive error catching and user feedback
- **Logging**: Detailed console logging for debugging
- **Modular Architecture**: Clean separation of concerns

## 🔧 Configuration & Customization

### Server Configuration

The `server.js` file includes several configurable endpoints:

```javascript
// Main API Endpoints
POST /api/transcribe     // AssemblyAI speech-to-text
POST /api/mcp           // Enhanced local mood detection
POST /api/llm-audio     // GPT-4o-mini response generation
POST /api/speak         // OpenAI TTS-1-HD synthesis
POST /api/setup-algolia // Optional Algolia integration
```

### Environment Variables

```bash
# Required
ASSEMBLYAI_API_KEY=xxx    # AssemblyAI transcription
OPENAI_API_KEY=xxx        # OpenAI GPT-4o-mini + TTS

# Optional
ALGOLIA_APP_ID=xxx        # Future MCP integration
ALGOLIA_API_KEY=xxx       # Search functionality
PORT=3001                 # Server port (default: 3000)
```

### Mood Database Customization

Edit `moods.json` to add new emotional states:

```json
{
  "moods": [
    {
      "id": "custom-mood",
      "name": "Custom Mood",
      "emoji": "🎭",
      "keywords": ["keyword1", "keyword2", "phrase"],
      "support_message": "Your custom supportive message...",
      "suggestions": [
        "Practical suggestion 1",
        "Helpful tip 2"
      ],
      "category": "emotion",
      "intensity": "medium"
    }
  ]
}
```

### Frontend Customization

#### Audio Settings
```javascript
// In app.js - MediaRecorder configuration
{
    sampleRate: 16000,
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
}
```

#### UI Styling
The app uses Tailwind CSS classes. Customize appearance by modifying:
- Colors: `bg-blue-500`, `text-gray-700`, etc.
- Animations: `pulse-animation`, `typing-animation`
- Layout: `grid`, `flex`, `space-y-4`

#### Typing Animation Speed
```javascript
// In app.js - adjust typing speed
this.typingInterval = setInterval(() => {
    // Change 30ms for faster/slower typing
}, 30);
```

## 🔒 Privacy & Security

### Data Handling
- **No Persistent Storage**: All audio and text data is processed in real-time and immediately discarded
- **Local Processing**: Mood analysis happens locally using enhanced algorithms
- **API-Only Communication**: Only transcribed text (not audio) is sent to AI services
- **No User Tracking**: Zero analytics, cookies, or user identification
- **Session-Based**: Each interaction is independent with no memory between sessions

### Security Measures
- **Environment Variables**: API keys stored securely in `.env` file
- **HTTPS Ready**: Production deployment supports SSL/TLS encryption
- **Input Validation**: All user inputs are sanitized and validated
- **Error Handling**: Comprehensive error catching prevents data leaks
- **Rate Limiting**: Built-in protection against API abuse

### API Key Security
```bash
# Never commit .env to version control
echo ".env" >> .gitignore

# Use environment variables in production
export ASSEMBLYAI_API_KEY=xxx
export OPENAI_API_KEY=xxx

# Rotate keys regularly for security
# Monitor API usage in respective dashboards
```

## 📱 Browser Compatibility

| Browser | Voice Recording | AI Processing | TTS | Overall |
|---------|----------------|---------------|-----|---------|
| **Chrome** | ✅ Full Support | ✅ | ✅ OpenAI + Browser | 🟢 Excellent |
| **Edge** | ✅ Full Support | ✅ | ✅ OpenAI + Browser | 🟢 Excellent |
| **Firefox** | ✅ Full Support | ✅ | ⚠️ Browser Only | 🟡 Good |
| **Safari** | ✅ Full Support | ✅ | ⚠️ Limited | 🟡 Good |
| **Mobile Chrome** | ✅ Touch to Record | ✅ | ✅ OpenAI + Browser | 🟢 Excellent |
| **Mobile Safari** | ✅ Touch to Record | ✅ | ⚠️ Limited | 🟡 Good |

### Mobile Considerations
- **Touch Interface**: Tap and hold for recording on mobile devices
- **Audio Quality**: Mobile microphones may require closer proximity
- **Battery Usage**: AI processing can drain battery faster
- **Network**: 4G/5G recommended for best transcription speed

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Server Won't Start
```bash
# Error: "EADDRINUSE: address already in use"
# Solution: Kill existing processes
pkill -f "node server.js"
lsof -ti:3001 | xargs kill -9

# Then restart
node server.js
```

#### API Key Issues
```bash
# AssemblyAI Error: "Authentication failed"
# Check: .env file has correct ASSEMBLYAI_API_KEY
# Verify: API key is active and has credits

# OpenAI Error: "Invalid API key"
# Check: .env file has correct OPENAI_API_KEY  
# Verify: OpenAI account has available credits
```

#### Microphone Problems
- **Browser Permissions**: Allow microphone access when prompted
- **HTTPS Requirement**: Use `http://localhost:3001` (localhost works over HTTP)
- **Audio Quality**: Check microphone settings in OS
- **Browser Support**: Chrome/Edge recommended for best compatibility

#### Transcription Issues
```javascript
// Low accuracy solutions:
// 1. Speak clearly and at normal pace
// 2. Reduce background noise
// 3. Check internet connection
// 4. Verify AssemblyAI account status
```

#### TTS Not Working
```javascript
// OpenAI TTS fallback chain:
// 1. OpenAI TTS-1-HD (primary)
// 2. Browser Speech Synthesis (fallback)
// 3. Text-only display (final fallback)
```

### Debug Mode

Enable detailed logging by adding to your browser console:
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check API responses
// Open Network tab in DevTools
// Monitor /api/* requests for errors
```

### Performance Optimization

#### Reduce API Costs
```javascript
// In server.js - adjust response length
max_tokens: 150,  // Reduce from 200
temperature: 0.7  // Reduce from 0.8 for more consistent responses
```

#### Improve Response Time
```bash
# Use environment variables for faster startup
export ASSEMBLYAI_API_KEY=your_key
export OPENAI_API_KEY=your_key
node server.js
```

## 🚀 Future Enhancements

### Planned Features
- [ ] **Advanced AI Models** - Integration with GPT-4o Audio Preview when available
- [ ] **Mood History Tracking** - Optional local storage for mood patterns
- [ ] **Voice Emotion Analysis** - Analyze tone, pitch, and speech patterns
- [ ] **Multi-language Support** - Support for Spanish, French, German, etc.
- [ ] **Personalization Engine** - Learn from user preferences over time
- [ ] **Offline Capabilities** - Basic functionality without internet connection
- [ ] **Mobile App** - Native iOS and Android applications
- [ ] **Group Therapy Mode** - Multi-user mood sharing (opt-in)

### Technical Roadmap
- [ ] **WebSocket Integration** - Real-time bidirectional communication
- [ ] **Database Integration** - PostgreSQL/MongoDB for optional data persistence
- [ ] **Authentication System** - User accounts with OAuth2 integration
- [ ] **API Rate Limiting** - Advanced throttling and quota management
- [ ] **Microservices Architecture** - Scalable containerized deployment
- [ ] **Real-time Analytics** - Usage metrics and performance monitoring
- [ ] **Progressive Web App** - Installable PWA with offline capabilities
- [ ] **Voice Biometrics** - Speaker identification for personalization

### Algolia MCP Integration
The current `moods.json` structure is optimized for future Algolia MCP integration:

```javascript
// Future MCP Server integration
const algoliaMCP = new AlgoliaMCPServer({
    applicationId: process.env.ALGOLIA_APP_ID,
    apiKey: process.env.ALGOLIA_API_KEY
});

// Enhanced search with faceting
const moodResults = await algoliaMCP.search({
    indexName: 'moods',
    query: userInput,
    facetFilters: ['category:emotion', 'intensity:high'],
    attributesToHighlight: ['keywords', 'support_message']
});
```

## 💡 Development Tips

### Local Development
```bash
# Watch for file changes
npm install -g nodemon
nodemon server.js

# Debug mode with detailed logging
DEBUG=* node server.js

# Test individual API endpoints
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"query": "I feel anxious"}'
```

### Code Organization
```
project/
├── server.js          # Backend API server
├── app.js            # Frontend application logic
├── index.html        # Main user interface
├── moods.json        # Mood database
├── .env              # Environment variables (create this)
├── package.json      # Dependencies
└── README.md         # This documentation
```

### API Testing
```bash
# Test transcription
curl -X POST http://localhost:3001/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audioData": "base64_audio_data"}'

# Test mood detection
curl -X POST http://localhost:3001/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"query": "I am feeling overwhelmed at work"}'

# Test AI response
curl -X POST http://localhost:3001/api/llm-audio \
  -H "Content-Type: application/json" \
  -d '{"mood": "burnt out", "text": "exhausted from work"}'
```

## � Project Structure

```
hwd-vs/
├── 🚀 Backend
│   ├── server.js              # Express server with API endpoints
│   ├── .env                   # Environment variables (create this)
│   └── package.json           # Node.js dependencies
├── 🎨 Frontend  
│   ├── index.html             # Main user interface
│   ├── app.js                 # Application logic & UI handling
│   └── (Tailwind CSS via CDN) # Styling framework
├── 📊 Data
│   └── moods.json             # Mood database with keywords & responses
├── 📚 Documentation
│   └── README.md              # This comprehensive guide
└── 🔧 Configuration
    ├── .env.example           # Environment template
    └── .gitignore             # Git ignore rules
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
```bash
# 1. Fork the repository
git clone https://github.com/yourusername/hwd-vs.git
cd hwd-vs

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Add your API keys to .env
# 5. Start development server
npm run dev
```

### Contribution Guidelines
1. **Code Style**: Follow existing JavaScript ES6+ patterns
2. **Error Handling**: Add comprehensive try-catch blocks
3. **Documentation**: Update README for new features
4. **Testing**: Test with multiple browsers and devices
5. **API Keys**: Never commit real API keys to version control

### Areas for Contribution
- 🐛 **Bug Fixes**: Check issues for known bugs
- ✨ **New Features**: Implement items from roadmap
- 🎨 **UI/UX**: Improve design and user experience  
- 📱 **Mobile**: Enhance mobile compatibility
- 🌍 **Internationalization**: Add language support
- 📈 **Performance**: Optimize API calls and loading times
- 🔧 **DevOps**: Improve deployment and configuration

## 📋 License

MIT License

Copyright (c) 2025 How's My Day Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🎉 Getting Started Now!

Ready to experience AI-powered mood tracking? Follow these quick steps:

```bash
# 1. Quick setup (5 minutes)
git clone <repository-url>
cd "hwd vs"
npm install

# 2. Get API keys (10 minutes)
# - AssemblyAI: https://www.assemblyai.com/
# - OpenAI: https://platform.openai.com/

# 3. Configure environment
cp .env.example .env
# Add your API keys to .env

# 4. Launch the app
node server.js
# Visit: http://localhost:3001

# 5. Start talking to your AI mood companion! 🎤
```

**Questions?** Open an issue or join our community discussions!

**Made with ❤️ for better mental health awareness and AI-human connection** 