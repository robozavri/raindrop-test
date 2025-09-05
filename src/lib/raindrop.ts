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

// Helper function to generate user IDs
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Enhanced user traits with maximum data
export function getEnhancedUserTraits() {
  return {
    // Basic identification
    name: "Test User",
    email: "test@raindrop-demo.com",
    userId: generateUserId(),
    
    // Plan and subscription info
    plan: "premium",
    subscription: "monthly",
    billingCycle: "monthly",
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    
    // System and device info
    os: "Windows",
    osVersion: "10.0.19045",
    browser: "Chrome",
    browserVersion: "120.0.0.0",
    device: "desktop",
    screenResolution: "1920x1080",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || "en-US",
    
    // Location info (approximate)
    country: "US",
    region: "California",
    city: "San Francisco",
    
    // Usage patterns
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    sessionCount: Math.floor(Math.random() * 100) + 1,
    totalMessages: Math.floor(Math.random() * 500) + 1,
    
    // Preferences
    theme: "dark",
    notifications: true,
    autoSave: true,
    
    // AI interaction preferences
    preferredModel: "gpt-4o",
    maxTokens: 1000,
    temperature: 0.7,
    
    // Business context
    company: "Raindrop Demo Corp",
    role: "developer",
    team: "ai-integration",
    department: "engineering",
    
    // Custom properties
    experimentGroup: "A",
    featureFlags: ["new_ui", "advanced_tracking", "beta_features"],
    customTags: ["power_user", "early_adopter", "ai_enthusiast"],
  };
}

// Enhanced event properties with maximum data
export function getEnhancedEventProperties(eventType: string, additionalData: any = {}) {
  const baseProperties = {
    // Event metadata
    eventType: eventType,
    timestamp: new Date().toISOString(),
    sessionId: `session_${Date.now()}`,
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    
    // Performance metrics
    responseTime: Math.floor(Math.random() * 2000) + 100,
    processingTime: Math.floor(Math.random() * 1500) + 50,
    memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
    
    // AI model details
    model: "gpt-4o-mini",
    modelVersion: "0613",
    modelProvider: "openai",
    modelFamily: "gpt-4",
    maxTokens: 1000,
    temperature: 0.7,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    
    // Token usage (estimated)
    promptTokens: Math.floor(Math.random() * 100) + 10,
    completionTokens: Math.floor(Math.random() * 200) + 20,
    totalTokens: Math.floor(Math.random() * 300) + 30,
    
    // Quality metrics
    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
    relevance: Math.random() * 0.2 + 0.8, // 0.8-1.0
    helpfulness: Math.random() * 0.2 + 0.8, // 0.8-1.0
    
    // Context information
    conversationLength: Math.floor(Math.random() * 20) + 1,
    messagePosition: Math.floor(Math.random() * 10) + 1,
    isFirstMessage: Math.random() > 0.5,
    isLastMessage: Math.random() > 0.7,
    
    // User behavior
    typingSpeed: Math.floor(Math.random() * 50) + 20, // WPM
    pauseTime: Math.floor(Math.random() * 5000) + 1000, // ms
    editCount: Math.floor(Math.random() * 3),
    
    // System context
    serverLoad: Math.random() * 0.5 + 0.3, // 0.3-0.8
    cacheHit: Math.random() > 0.3,
    rateLimitRemaining: Math.floor(Math.random() * 1000) + 100,
    
    // Experiment and A/B testing
    experimentId: "raindrop_max_tracking",
    variant: Math.random() > 0.5 ? "control" : "treatment",
    cohort: "power_users",
    
    // Tags for categorization
    tags: ["ai_chat", "demo", "tracking_test", "raindrop_integration"],
    
    // Custom business metrics
    businessValue: Math.random() * 100,
    userSatisfaction: Math.random() * 0.4 + 0.6, // 0.6-1.0
    conversionProbability: Math.random() * 0.3 + 0.1, // 0.1-0.4
    
    // Error tracking
    hasError: false,
    errorRate: 0.0,
    retryCount: 0,
    
    // Additional data passed in
    ...additionalData,
  };
  
  return baseProperties;
}

// Enhanced tags for events
export function getEventTags(eventType: string): string[] {
  const baseTags = ["raindrop_demo", "ai_integration", "typescript", "nextjs"];
  
  const eventSpecificTags = {
    chat_message: ["conversation", "user_input", "ai_response", "interaction"],
    chat_error: ["error", "failure", "debugging", "troubleshooting"],
    user_feedback: ["feedback", "rating", "satisfaction", "quality"],
    tool_usage: ["tool", "function_call", "external_api", "integration"],
    user_behavior: ["behavior", "pattern", "analytics", "insights"],
  };
  
  return [...baseTags, ...(eventSpecificTags[eventType as keyof typeof eventSpecificTags] || [])];
}
