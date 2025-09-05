import { NextRequest, NextResponse } from 'next/server';
import { raindrop } from '@/lib/raindrop';

export async function POST(request: NextRequest) {
  try {
    const { eventId, feedback, comment } = await request.json();
    
    if (!eventId || !feedback) {
      return NextResponse.json({ error: 'EventId and feedback are required' }, { status: 400 });
    }

    // Track user feedback using Raindrop signals
    await raindrop.trackSignal({
      eventId,
      name: feedback === 'positive' ? 'thumbs_up' : 'thumbs_down',
      type: 'feedback',
      comment: comment || '',
      sentiment: feedback === 'positive' ? 'POSITIVE' : 'NEGATIVE',
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
