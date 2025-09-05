import { NextRequest, NextResponse } from 'next/server';
import { 
  failureTracker, 
  FailureCategory, 
  FailureSeverity, 
  FailureDetails 
} from '@/lib/failure-tracking';
import { raindrop, generateEventId } from '@/lib/raindrop';

// Track AI failures with comprehensive metadata
export async function POST(request: NextRequest) {
  try {
    const { 
      eventId, 
      category, 
      severity, 
      details,
      input,
      response,
      autoDetect = true 
    } = await request.json();

    if (!eventId || !category) {
      return NextResponse.json({ 
        error: 'EventId and category are required' 
      }, { status: 400 });
    }

    const failureDetails: FailureDetails = {
      ...details,
      userId: details.userId || 'unknown',
      sessionId: details.sessionId || 'unknown',
      timestamp: new Date().toISOString(),
      inputLength: input?.length || 0,
      responseLength: response?.length || 0,
      latencyMs: details.latencyMs || 0,
      modelVersion: details.modelVersion || 'gpt-4o-mini',
      autoDetected: details.autoDetected || false
    };

    // Track the failure
    await failureTracker.trackFailure(
      eventId,
      category as FailureCategory,
      severity as FailureSeverity || FailureSeverity.MEDIUM,
      failureDetails
    );

    // If auto-detection is enabled and we have input/response, run detection
    let autoDetections = [];
    if (autoDetect && input && response) {
      autoDetections = failureTracker.detectFailures(input, response, {
        eventId,
        userId: failureDetails.userId,
        sessionId: failureDetails.sessionId
      });

      // Track any auto-detected failures
      for (const detection of autoDetections) {
        await failureTracker.trackFailure(
          eventId,
          detection.category,
          detection.severity,
          {
            ...failureDetails,
            autoDetected: true,
            description: `Auto-detected: ${detection.pattern}`,
            confidence: detection.confidence,
            metadata: detection.metadata
          }
        );
      }
    }

    // Get current failure statistics
    const stats = failureTracker.getFailureStats();

    return NextResponse.json({
      success: true,
      failureId: `failure_${Date.now()}`,
      category,
      severity: severity || FailureSeverity.MEDIUM,
      autoDetections: autoDetections.length,
      stats,
      message: `Failure tracked successfully: ${category}`
    });

  } catch (error) {
    console.error('Failure tracking API error:', error);
    
    // Track the error in Raindrop
    try {
      const errorEventId = generateEventId();
      await raindrop.trackAi({
        eventId: errorEventId,
        event: 'failure_tracking_error',
        userId: 'system',
        model: 'failure_tracker',
        input: 'Failure tracking API error',
        output: error instanceof Error ? error.message : 'Unknown error',
        properties: {
          error_type: 'api_error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          error_severity: 'high',
          timestamp: new Date().toISOString(),
          component: 'failure_tracking_api'
        }
      });
    } catch (trackingError) {
      console.error('Failed to track failure tracking error:', trackingError);
    }

    return NextResponse.json(
      { error: 'Failed to track failure' },
      { status: 500 }
    );
  }
}

// Get failure statistics and analytics
export async function GET(request: NextRequest) {
  try {
    const stats = failureTracker.getFailureStats();
    
    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to get failure stats:', error);
    return NextResponse.json(
      { error: 'Failed to get failure statistics' },
      { status: 500 }
    );
  }
}
