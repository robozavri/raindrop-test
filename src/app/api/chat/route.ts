import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai';
import { 
  raindrop, 
  generateEventId, 
  generateConversationId, 
  generateUserId,
  getEnhancedUserTraits,
  getEnhancedEventProperties,
  getEventTags
} from '@/lib/raindrop';
import { ChatTools } from '@/lib/tools';
import { 
  failureTracker, 
  FailureCategory, 
  FailureSeverity 
} from '@/lib/failure-tracking';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId = generateUserId() } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate unique IDs for tracking
    const eventId = generateEventId();
    const convoId = conversationId || generateConversationId();
    
    // Get enhanced user traits
    const userTraits = getEnhancedUserTraits();
    userTraits.userId = userId;
    
    // Set comprehensive user details
    raindrop.setUserDetails({
      userId,
      traits: userTraits,
    });

    // Get enhanced event properties
    const enhancedProperties = getEnhancedEventProperties('chat_message', {
      tool_call: "chat_completion",
      system_prompt: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
      experiment: "raindrop_max_tracking",
      user_agent: request.headers.get('user-agent') || 'unknown',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      referer: request.headers.get('referer') || 'direct',
      content_type: request.headers.get('content-type') || 'application/json',
      message_length: message.length,
      message_word_count: message.split(/\s+/).length,
      message_has_question: message.includes('?'),
      message_has_code: message.includes('```') || message.includes('function') || message.includes('const'),
      message_sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
    });
    
    // Start Raindrop interaction tracking with enhanced data
    const interaction = raindrop.begin({
      eventId,
      event: "chat_message",
      userId,
      input: message,
      model: "gpt-4o-mini",
      convoId,
      properties: enhancedProperties,
    });

    // Add comprehensive attachments
    interaction.addAttachments([
      {
        type: "text",
        name: "User Message",
        value: message,
        role: "input",
      },
      {
        type: "text",
        name: "Request Headers",
        value: JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2),
        role: "input",
      },
      {
        type: "text",
        name: "User Context",
        value: JSON.stringify(userTraits, null, 2),
        role: "input",
      },
    ]);

    // Track tool usage if message contains specific keywords
    let toolResults: any[] = [];
    
    if (message.toLowerCase().includes('search') || message.toLowerCase().includes('find')) {
      const searchResult = await interaction.withTool(
        {
          name: "web_search",
          version: 1,
          properties: { query: message, source: "user_request" },
          inputParameters: { query: message },
        },
        async () => {
          return await ChatTools.webSearch(message);
        }
      );
      toolResults.push({ tool: 'web_search', result: searchResult });
    }

    if (message.includes('+') || message.includes('-') || message.includes('*') || message.includes('/')) {
      const calcResult = await interaction.withTool(
        {
          name: "calculator",
          version: 1,
          properties: { expression: message, operation: "arithmetic" },
          inputParameters: { expression: message },
        },
        async () => {
          return await ChatTools.calculator(message);
        }
      );
      toolResults.push({ tool: 'calculator', result: calcResult });
    }

    if (message.toLowerCase().includes('translate')) {
      const translateResult = await interaction.withTool(
        {
          name: "translator",
          version: 1,
          properties: { text: message, target_language: "es" },
          inputParameters: { text: message, targetLanguage: "es" },
        },
        async () => {
          return await ChatTools.translate(message, 'es');
        }
      );
      toolResults.push({ tool: 'translator', result: translateResult });
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message);
    
    // Detect failures automatically
    const failureDetections = failureTracker.detectFailures(message, aiResponse, {
      eventId,
      userId,
      sessionId: convoId,
      model: 'gpt-4o-mini',
      toolsUsed: toolResults.map(t => t.tool)
    });

    // Track any detected failures
    for (const detection of failureDetections) {
      await failureTracker.trackFailure(
        eventId,
        detection.category,
        detection.severity,
        {
          description: `Auto-detected: ${detection.pattern}`,
          confidence: detection.confidence,
          errorType: detection.category,
          errorMessage: `Pattern matched: ${detection.pattern}`,
          userId,
          sessionId: convoId,
          modelVersion: 'gpt-4o-mini',
          inputLength: message.length,
          responseLength: aiResponse.length,
          autoDetected: true,
          metadata: detection.metadata
        }
      );
    }
    
    // Add AI response and tool results as attachments
    const outputAttachments = [
      {
        type: "text",
        name: "AI Response",
        value: aiResponse,
        role: "output",
      },
    ];

    if (toolResults.length > 0) {
      outputAttachments.push({
        type: "text",
        name: "Tool Results",
        value: JSON.stringify(toolResults, null, 2),
        role: "output",
      });
    }

    interaction.addAttachments(outputAttachments);

    // Update interaction with comprehensive response metadata
    interaction.setProperties({
      response_length: aiResponse.length.toString(),
      response_word_count: aiResponse.split(/\s+/).length.toString(),
      response_paragraphs: aiResponse.split('\n\n').length.toString(),
      response_has_code: aiResponse.includes('```') ? 'true' : 'false',
      response_has_links: aiResponse.includes('http') ? 'true' : 'false',
      response_sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
      response_confidence: (Math.random() * 0.3 + 0.7).toFixed(2),
      tools_used: toolResults.map(t => t.tool).join(','),
      tools_count: toolResults.length.toString(),
      model_used: "gpt-4o-mini",
      processing_time: Date.now().toString(),
      response_time_ms: (Math.random() * 2000 + 500).toString(),
      // Failure tracking metadata
      failures_detected: failureDetections.length.toString(),
      failure_categories: failureDetections.map(f => f.category).join(','),
      failure_severities: failureDetections.map(f => f.severity).join(','),
      auto_detection_enabled: 'true',
      failure_confidence_scores: failureDetections.map(f => f.confidence.toFixed(2)).join(',')
    });

    // Add tags to the interaction
    const tags = getEventTags('chat_message');
    interaction.setProperties({
      tags: tags.join(','),
      event_tags: tags.join(','),
    });

    // Finish the interaction
    interaction.finish({
      output: aiResponse,
    });

    // Track additional events for comprehensive analytics
    raindrop.trackAi({
      eventId: `behavior_${eventId}`,
      event: "user_behavior",
      userId,
      model: "gpt-4o-mini",
      input: "User interaction pattern",
      output: "Behavior tracked",
      properties: {
        ...getEnhancedEventProperties('user_behavior', {
          interaction_type: "chat_message",
          message_complexity: message.length > 100 ? 'high' : message.length > 50 ? 'medium' : 'low',
          user_engagement: Math.random() * 0.4 + 0.6,
          session_duration: Math.floor(Math.random() * 3600) + 60, // seconds
          page_views: Math.floor(Math.random() * 10) + 1,
          scroll_depth: Math.random() * 100,
          click_through_rate: Math.random() * 0.1 + 0.05,
        }),
      },
    });

    return NextResponse.json({
      message: aiResponse,
      eventId,
      conversationId: convoId,
      toolsUsed: toolResults.map(t => t.tool),
      userTraits: userTraits,
      failures: {
        detected: failureDetections.length,
        categories: failureDetections.map(f => f.category),
        severities: failureDetections.map(f => f.severity),
        patterns: failureDetections.map(f => f.pattern),
        confidenceScores: failureDetections.map(f => f.confidence)
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Track the error in Raindrop with enhanced data
    try {
      const eventId = generateEventId();
      const errorProperties = getEnhancedEventProperties('chat_error', {
        error_type: "api_error",
        error_message: error instanceof Error ? error.message : "Unknown error",
        error_stack: error instanceof Error ? error.stack : undefined,
        error_severity: "high",
        error_category: "api_failure",
        retry_attempted: false,
        fallback_used: false,
      });
      
      raindrop.trackAi({
        eventId,
        event: "chat_error",
        userId: "user_123",
        model: "gpt-4o-mini",
        input: "Error occurred",
        output: error instanceof Error ? error.message : "Unknown error",
        properties: errorProperties,
      });
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
