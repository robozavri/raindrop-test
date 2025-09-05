import Raindrop from "raindrop-ai";

// Initialize Raindrop with your API key
export const raindrop = new Raindrop({
  writeKey: process.env.RAINDROP_API_KEY!,
  debugLogs: process.env.NODE_ENV !== "production",
  redactPii: true, // Enable PII redaction for privacy
});

// Helper function to generate unique event IDs
export function generateEventId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to generate conversation IDs
export function generateConversationId(): string {
  return `convo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
