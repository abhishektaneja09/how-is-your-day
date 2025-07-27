// Configuration file for How's My Day? Voice Mood Tracker
// Copy this file to config.local.js and add your actual API keys

const CONFIG = {
    // AssemblyAI Configuration
    ASSEMBLYAI: {
        API_KEY: process.env.ASSEMBLYAI_API_KEY || localStorage.getItem('assemblyai_api_key') || 'YOUR_ASSEMBLYAI_API_KEY', // Get from https://www.assemblyai.com/
        SAMPLE_RATE: 16000,
        LANGUAGE: 'en-US'
    },

    // App Settings
    APP: {
        NAME: "How's My Day?",
        VERSION: "1.0.0",
        DEBUG: false, // Set to true for console logging
        AUTO_SPEAK: false, // Automatically speak responses
        SPEECH_RATE: 0.9,
        SPEECH_PITCH: 1.0,
        SPEECH_VOLUME: 0.8
    },

    // Mood Detection Settings
    MOOD: {
        CONFIDENCE_THRESHOLD: 0.7,
        MAX_KEYWORDS: 10,
        FALLBACK_MOOD: 'neutral'
    },

    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        PULSE_INTERVAL: 2000,
        TYPING_SPEED: 50
    },

    // Error Messages
    ERRORS: {
        NO_MICROPHONE: 'Microphone access denied. Please allow microphone access and try again.',
        NO_SPEECH: 'No speech detected. Please try speaking again.',
        API_ERROR: 'Speech recognition service error. Please try again.',
        NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
        BROWSER_NOT_SUPPORTED: 'Your browser does not support speech recognition.'
    },

    // Support Messages (can be overridden by moods.json)
    SUPPORT_MESSAGES: {
        'burnt out': {
            emoji: '😴',
            message: "It sounds like you're running on empty. Remember, it's okay to take breaks and recharge. Try stepping away from your work for 10 minutes, or consider what you can delegate. Your well-being matters more than any task.",
            suggestions: ['Take a 10-minute break', 'Delegate one task today', 'Practice deep breathing']
        },
        'anxious': {
            emoji: '😰',
            message: "I hear that worry in your voice. Take a deep breath with me - inhale for 4 counts, hold for 4, exhale for 4. Remember, most of what we worry about never happens. What's one small thing you can do right now to feel more grounded?",
            suggestions: ['4-4-4 breathing exercise', 'Write down your worries', 'Take a walk outside']
        },
        'sad': {
            emoji: '😔',
            message: "I'm sorry you're feeling down. It's okay to not be okay sometimes. Maybe try doing something kind for yourself today - a warm drink, a favorite song, or reaching out to someone who cares about you. You don't have to go through this alone.",
            suggestions: ['Make yourself a warm drink', 'Listen to your favorite music', 'Reach out to a friend']
        },
        'angry': {
            emoji: '😤',
            message: "That frustration is totally valid. Sometimes we need to feel angry to process what's happening. Try taking a few deep breaths or stepping away for a moment. What's really behind this anger? Understanding that might help you feel more in control.",
            suggestions: ['Take deep breaths', 'Step away for 5 minutes', 'Write down your feelings']
        },
        'happy': {
            emoji: '😊',
            message: "Your joy is contagious! It's wonderful to hear you feeling good. Savor this moment and maybe share that positive energy with someone else. Happiness shared is happiness multiplied.",
            suggestions: ['Share your good mood with someone', 'Do something creative', 'Help someone else']
        },
        'hopeful': {
            emoji: '✨',
            message: "That hope in your voice is beautiful. Hold onto that optimism - it's a superpower. When you believe good things are possible, you're more likely to make them happen. Keep that positive energy flowing!",
            suggestions: ['Set a small goal for today', 'Share your optimism with others', 'Write down your hopes']
        },
        'lonely': {
            emoji: '🤗',
            message: "I hear that loneliness, and I want you to know you're not alone in feeling alone. It's a human experience many of us share. Maybe try reaching out to someone today, even just a quick text. You'd be surprised how many people want to connect.",
            suggestions: ['Send a text to a friend', 'Join an online community', 'Call a family member']
        },
        'neutral': {
            emoji: '🤔',
            message: "I'm here to listen, whatever you're feeling. Sometimes just talking things out can help us understand ourselves better. Is there anything specific on your mind that you'd like to explore?",
            suggestions: ['Reflect on your day', 'Try something new', 'Practice gratitude']
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 