import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai';
import { raindrop, generateEventId, generateConversationId } from '@/lib/raindrop';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationId, userId = 'user_123' } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate unique IDs for tracking
    const eventId = generateEventId();
    const convoId = conversationId || generateConversationId();
    
    // Start Raindrop interaction tracking
    const interaction = raindrop.begin({
      eventId,
      event: "chat_message",
      userId,
      input: message,
      model: "gpt-4o-mini",
      convoId,
      properties: {
        tool_call: "chat_completion",
        system_prompt: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
        experiment: "raindrop_testing",
        timestamp: new Date().toISOString(),
        user_agent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Add input as attachment
    interaction.addAttachments([
      {
        type: "text",
        name: "User Message",
        value: message,
        role: "input",
      },
    ]);

    // Generate AI response
    const aiResponse = await generateAIResponse(message);
    
    // Add AI response as attachment
    interaction.addAttachments([
      {
        type: "text",
        name: "AI Response",
        value: aiResponse,
        role: "output",
      },
    ]);

    // Update interaction with response metadata
    interaction.setProperties({
      response_length: aiResponse.length.toString(),
      response_tokens: "estimated", // In a real app, you'd calculate actual tokens
      model_used: "gpt-4o-mini",
      processing_time: Date.now().toString(),
    });

    // Finish the interaction
    interaction.finish({
      output: aiResponse,
    });

    // Set user details for better tracking
    raindrop.setUserDetails({
      userId,
      traits: {
        name: "Test User",
        email: "test@example.com",
        plan: "testing",
        os: "Windows",
        browser: "Chrome",
      },
    });

    return NextResponse.json({
      message: aiResponse,
      eventId,
      conversationId: convoId,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Track the error in Raindrop
    try {
      const eventId = generateEventId();
      raindrop.trackAi({
        eventId,
        event: "chat_error",
        userId: "user_123",
        model: "gpt-4o-mini",
        input: "Error occurred",
        output: error instanceof Error ? error.message : "Unknown error",
        properties: {
          error_type: "api_error",
          error_message: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
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
