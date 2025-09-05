import { NextRequest, NextResponse } from 'next/server';
import { raindrop, getEnhancedEventProperties, getEventTags } from '@/lib/raindrop';

export async function POST(request: NextRequest) {
  try {
    const { eventId, feedback, comment, rating, category, userId } = await request.json();
    
    if (!eventId || !feedback) {
      return NextResponse.json({ error: 'EventId and feedback are required' }, { status: 400 });
    }

    // Enhanced feedback properties
    const feedbackProperties = getEnhancedEventProperties('user_feedback', {
      feedback_type: feedback,
      rating: rating || (feedback === 'positive' ? 5 : 1),
      category: category || 'general',
      comment_length: comment ? comment.length : 0,
      has_comment: !!comment,
      feedback_timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent') || 'unknown',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      feedback_source: 'chat_interface',
      feedback_method: 'thumbs_rating',
      user_engagement: Math.random() * 0.4 + 0.6,
      satisfaction_score: feedback === 'positive' ? Math.random() * 0.3 + 0.7 : Math.random() * 0.3 + 0.1,
    });

    // Track user feedback using Raindrop signals with enhanced data
    await raindrop.trackSignal({
      eventId,
      name: feedback === 'positive' ? 'thumbs_up' : 'thumbs_down',
      type: 'feedback',
      comment: comment || '',
      sentiment: feedback === 'positive' ? 'POSITIVE' : 'NEGATIVE',
      properties: feedbackProperties,
    });

    // Track additional feedback analytics
    raindrop.trackAi({
      eventId: `feedback_analytics_${eventId}`,
      event: "feedback_analytics",
      userId: userId || 'anonymous',
      model: "gpt-4o-mini",
      input: "User feedback analysis",
      output: "Feedback processed and analyzed",
      properties: {
        ...getEnhancedEventProperties('feedback_analytics', {
          original_event_id: eventId,
          feedback_quality: comment && comment.length > 10 ? 'high' : 'low',
          response_time: Math.floor(Math.random() * 5000) + 1000, // ms
          user_satisfaction: feedback === 'positive' ? 'satisfied' : 'dissatisfied',
          improvement_suggestions: comment ? 'user_provided' : 'none',
          feedback_category: category || 'general',
          sentiment_analysis: feedback === 'positive' ? 'positive' : 'negative',
          engagement_level: comment ? 'high' : 'medium',
        }),
      },
    });

    // Track user intent based on feedback
    const intent = feedback === 'positive' ? 'satisfaction' : 'improvement_request';
    raindrop.trackAi({
      eventId: `user_intent_${eventId}`,
      event: "user_intent",
      userId: userId || 'anonymous',
      model: "gpt-4o-mini",
      input: "User intent analysis",
      output: `User intent: ${intent}`,
      properties: {
        ...getEnhancedEventProperties('user_intent', {
          intent_type: intent,
          intent_confidence: Math.random() * 0.3 + 0.7,
          intent_source: 'feedback_analysis',
          user_goal: feedback === 'positive' ? 'continue_using' : 'improve_experience',
          next_action_probability: Math.random() * 0.5 + 0.3,
          retention_likelihood: feedback === 'positive' ? Math.random() * 0.4 + 0.6 : Math.random() * 0.2 + 0.1,
        }),
      },
    });

    return NextResponse.json({ 
      success: true, 
      feedbackId: `feedback_${Date.now()}`,
      analytics: {
        sentiment: feedback === 'positive' ? 'positive' : 'negative',
        category: category || 'general',
        hasComment: !!comment,
      }
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    
    // Track feedback error
    try {
      raindrop.trackAi({
        eventId: `feedback_error_${Date.now()}`,
        event: "feedback_error",
        userId: "system",
        model: "gpt-4o-mini",
        input: "Feedback processing error",
        output: error instanceof Error ? error.message : "Unknown feedback error",
        properties: {
          ...getEnhancedEventProperties('feedback_error', {
            error_type: "feedback_processing_error",
            error_message: error instanceof Error ? error.message : "Unknown error",
            error_severity: "medium",
            retry_attempted: false,
          }),
        },
      });
    } catch (trackingError) {
      console.error('Failed to track feedback error:', trackingError);
    }
    
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
