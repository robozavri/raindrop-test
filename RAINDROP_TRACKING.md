# Raindrop Tracking Implementation

This document details exactly what data is being tracked and sent to your Raindrop dashboard.

## Event Types Tracked

### 1. Chat Messages (`chat_message`)
**Triggered**: Every time a user sends a message and receives an AI response

**Data Tracked**:
- `eventId`: Unique identifier for the interaction
- `event`: "chat_message"
- `userId`: User identifier (default: "user_123")
- `input`: The user's message
- `output`: The AI's response
- `model`: "gpt-4o-mini"
- `convoId`: Conversation identifier
- `properties`: Rich metadata including:
  - `tool_call`: "chat_completion"
  - `system_prompt`: AI system instructions
  - `experiment`: "raindrop_testing"
  - `timestamp`: ISO timestamp
  - `user_agent`: Browser information
  - `response_length`: Character count of response
  - `response_tokens`: Estimated token count
  - `model_used`: Model name
  - `processing_time`: Processing timestamp

**Attachments**:
- Input message as text attachment (role: "input")
- AI response as text attachment (role: "output")

### 2. Chat Errors (`chat_error`)
**Triggered**: When an error occurs during chat processing

**Data Tracked**:
- `eventId`: Unique identifier
- `event`: "chat_error"
- `userId`: User identifier
- `model`: "gpt-4o-mini"
- `input`: "Error occurred"
- `output`: Error message
- `properties`: Error metadata including:
  - `error_type`: "api_error"
  - `error_message`: Detailed error message
  - `timestamp`: ISO timestamp

### 3. User Feedback (`thumbs_up` / `thumbs_down`)
**Triggered**: When user rates an AI response

**Data Tracked**:
- `eventId`: Links to the original chat event
- `name`: "thumbs_up" or "thumbs_down"
- `type`: "feedback"
- `comment`: User's optional comment
- `sentiment`: "POSITIVE" or "NEGATIVE"

## User Identification

**User Details Set**:
- `userId`: "user_123" (or custom)
- `traits`:
  - `name`: "Test User"
  - `email`: "test@example.com"
  - `plan`: "testing"
  - `os`: "Windows"
  - `browser`: "Chrome"

## Conversation Flow

1. **User sends message** → `chat_message` event created
2. **AI processes request** → Interaction updated with metadata
3. **AI responds** → Response added as attachment, interaction finished
4. **User rates response** → `thumbs_up`/`thumbs_down` signal sent

## Data Richness

This implementation maximizes data collection by tracking:

- **Temporal Data**: Timestamps, processing times, conversation flow
- **Context Data**: User agent, conversation IDs, experiment tags
- **Content Data**: Full messages and responses as attachments
- **Metadata**: Response lengths, model details, error states
- **Feedback Data**: User ratings, comments, sentiment analysis
- **User Data**: Identification, traits, system information

## Dashboard Views

In your Raindrop dashboard, you'll see:

1. **Events Timeline**: All chat interactions with full context
2. **User Journey**: Complete conversation flows
3. **Performance Metrics**: Response times, error rates
4. **Feedback Analysis**: User satisfaction scores
5. **Model Performance**: AI response quality metrics
6. **Error Tracking**: Failed interactions and debugging info

## Testing Checklist

- [ ] Send a test message
- [ ] Verify `chat_message` event appears in dashboard
- [ ] Check attachments contain full conversation
- [ ] Test error handling by causing an API error
- [ ] Rate a response and verify feedback signal
- [ ] Check user identification data
- [ ] Verify conversation ID persistence
- [ ] Test multiple conversations

## Expected Dashboard Data

After testing, your Raindrop dashboard should show:
- Multiple `chat_message` events
- Rich conversation context in each event
- User feedback signals linked to events
- Complete user journey tracking
- Performance and error metrics
- Full conversation transcripts as attachments
