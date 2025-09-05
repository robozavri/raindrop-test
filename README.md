# Raindrop AI Chat

A Next.js chat application that demonstrates comprehensive Raindrop tracking integration with AI interactions.

## Features

- **Real-time Chat Interface**: Clean, responsive chat UI built with React and Tailwind CSS
- **AI Integration**: Uses Vercel AI SDK with OpenAI for chat completions
- **Comprehensive Tracking**: Full Raindrop integration tracking all user interactions and AI responses
- **User Feedback**: Built-in thumbs up/down feedback system tracked in Raindrop
- **Rich Telemetry**: Tracks conversation context, model details, response metadata, and more

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   RAINDROP_API_KEY=52bf8ba1-892e-4917-b533-0a86cd6f9738
   ```

3. **Get OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create an account and get your API key
   - Replace `your_openai_api_key_here` in `.env.local`

4. **Run the Application**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Raindrop Tracking

This application tracks the following data in Raindrop:

### AI Interactions
- User messages and AI responses
- Model information (GPT-4o-mini)
- Conversation context and IDs
- Response metadata (length, tokens, processing time)

### User Data
- User identification and traits
- Browser and OS information
- Conversation flow and patterns

### Attachments
- Input messages as text attachments
- AI responses as output attachments
- Rich context for debugging and analysis

### Feedback Signals
- Thumbs up/down ratings
- User comments and sentiment
- Quality metrics for AI responses

## What Gets Tracked

Every chat interaction creates a comprehensive event in Raindrop with:

1. **Event Details**: Unique event ID, conversation ID, timestamp
2. **User Context**: User ID, traits, browser info
3. **AI Context**: Model used, prompt, response, metadata
4. **Attachments**: Full conversation context
5. **Properties**: Response length, processing time, experiment tags
6. **Feedback**: User ratings and comments

## Testing

1. Start a conversation by typing a message
2. Check your Raindrop dashboard to see the events
3. Use the feedback buttons to test signal tracking
4. Monitor the comprehensive telemetry data being collected

## Dashboard

Visit your [Raindrop Dashboard](https://app.raindrop.ai) to see all the tracked data in real-time.