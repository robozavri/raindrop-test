import { NextRequest, NextResponse } from 'next/server';
import { raindrop, getEnhancedEventProperties, generateEventId, generateUserId } from '@/lib/raindrop';

export async function POST(request: NextRequest) {
  try {
    const { eventType, userId, data } = await request.json();
    
    if (!eventType) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    const eventId = generateEventId();
    const user = userId || generateUserId();

    // Track various analytics events
    const analyticsProperties = getEnhancedEventProperties(eventType, {
      ...data,
      analytics_timestamp: new Date().toISOString(),
      session_id: `session_${Date.now()}`,
      page_url: request.headers.get('referer') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    });

    await raindrop.trackAi({
      eventId,
      event: eventType,
      userId: user,
      model: "analytics",
      input: `Analytics event: ${eventType}`,
      output: `Analytics data processed for ${eventType}`,
      properties: analyticsProperties,
    });

    return NextResponse.json({ 
      success: true, 
      eventId,
      eventType,
      userId: user,
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics event' },
      { status: 500 }
    );
  }
}
