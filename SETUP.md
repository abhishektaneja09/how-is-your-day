# API Integration Setup Guide

## 🚀 Quick Start

### 1. Get Your AssemblyAI API Key

1. **Visit AssemblyAI**: Go to [https://www.assemblyai.com/](https://www.assemblyai.com/)
2. **Sign Up**: Create a free account
3. **Get API Key**: Copy your API key from the dashboard
4. **Free Tier**: 5 hours of audio processing per month

### 2. Configure Your API Key

#### Option A: Web Interface (Recommended)
1. Open the app in your browser
2. Click "API Setup" in the sidebar
3. Enter your API key and click "Save"
4. Test the connection

#### Option B: Environment Variables
1. Copy `env.example` to `.env`
2. Replace `your_assemblyai_api_key_here` with your actual key
3. Restart the server

#### Option C: Direct Configuration
1. Edit `config.js`
2. Replace `YOUR_ASSEMBLYAI_API_KEY` with your actual key

### 3. Test the Integration

1. Start the server: `npm start`
2. Visit: `http://localhost:3000`
3. Click the microphone button
4. Speak and see real-time transcription

## 🔧 Advanced Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# AssemblyAI API Key
ASSEMBLYAI_API_KEY=your_actual_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Debug Mode
DEBUG=false
```

### API Key Security

- ✅ **Local Storage**: API key stored securely in browser
- ✅ **Environment Variables**: Server-side configuration
- ✅ **No Hardcoding**: Keys never committed to code
- ✅ **Fallback Support**: Works without API key

## 🎯 Features with API Integration

### With AssemblyAI API
- 🎤 **Real-time transcription** as you speak
- 🌍 **Multi-language support**
- 🔇 **Noise reduction** and background filtering
- 📱 **Mobile-optimized** voice recognition
- ⚡ **High accuracy** speech-to-text

### Without API Key (Fallback)
- 🎤 **Browser speech recognition**
- 📱 **Basic functionality**
- 🔄 **Automatic fallback**
- 💡 **Demo mode available**

## 🐛 Troubleshooting

### Common Issues

#### "API Key Not Valid"
- Check your API key is correct
- Ensure you have credits in your AssemblyAI account
- Try the "Test Connection" button in API Setup

#### "Microphone Access Denied"
- Allow microphone access in your browser
- Use HTTPS in production (required for microphone)
- Check browser permissions

#### "AssemblyAI Not Loading"
- Check internet connection
- Refresh the page
- Clear browser cache

### Error Messages

| Error | Solution |
|-------|----------|
| `API key not configured` | Add your API key via API Setup page |
| `Invalid API key` | Check your key and try again |
| `No microphone access` | Allow microphone permissions |
| `Network error` | Check internet connection |

## 📊 API Usage Monitoring

### AssemblyAI Dashboard
- Monitor usage at [AssemblyAI Dashboard](https://www.assemblyai.com/app/account)
- Track remaining credits
- View usage history

### Free Tier Limits
- **5 hours** of audio processing per month
- **Real-time streaming** included
- **Multiple languages** supported

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for production
3. **Rotate keys regularly** for security
4. **Monitor usage** to prevent overages
5. **Use HTTPS** in production

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment variables
export ASSEMBLYAI_API_KEY=your_production_key
export NODE_ENV=production
export PORT=3000
```

### HTTPS Requirements
- Microphone access requires HTTPS
- Use SSL certificates in production
- Configure reverse proxy if needed

## 📞 Support

### AssemblyAI Support
- [Documentation](https://www.assemblyai.com/docs)
- [API Reference](https://www.assemblyai.com/docs/reference)
- [Community Forum](https://community.assemblyai.com/)

### App Support
- Check the API Setup page for status
- Use the demo mode for testing
- Review browser console for errors

---

**Need help?** Visit the API Setup page in the app or check the troubleshooting section above. 