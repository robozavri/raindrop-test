// Enhanced AI Failure Tracking for Raindrop
// Implements comprehensive failure detection, categorization, and alerting

import { raindrop, generateEventId } from './raindrop';

// Custom failure categories
export enum FailureCategory {
  LOGIC_ERROR = 'logic_error',
  TIME_OUT = 'time_out',
  IRRELEVANT_RESPONSE = 'irrelevant_response',
  OUTPUT_SCHEMA_MISMATCH = 'output_schema_mismatch',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  INVALID_FORMAT = 'invalid_format',
  HALLUCINATION = 'hallucination',
  BIAS_DETECTED = 'bias_detected',
  CONTEXT_LOSS = 'context_loss',
  TOKEN_LIMIT_EXCEEDED = 'token_limit_exceeded',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  CONTENT_FILTER_VIOLATION = 'content_filter_violation',
  UNKNOWN_ERROR = 'unknown_error'
}

// Failure severity levels
export enum FailureSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Failure detection patterns
export interface FailurePattern {
  name: string;
  pattern: RegExp | ((response: string, input: string) => boolean);
  category: FailureCategory;
  severity: FailureSeverity;
  confidence: number;
}

// Failure tracking configuration
export interface FailureTrackingConfig {
  enableAutoDetection: boolean;
  confidenceThreshold: number;
  alertThresholds: {
    failureRate: number; // percentage
    timeWindow: number; // minutes
  };
  enableAttachments: boolean;
  enableAlerting: boolean;
}

// Default configuration
export const DEFAULT_FAILURE_CONFIG: FailureTrackingConfig = {
  enableAutoDetection: true,
  confidenceThreshold: 0.7,
  alertThresholds: {
    failureRate: 15, // Alert if failure rate > 15%
    timeWindow: 5 // in 5-minute windows
  },
  enableAttachments: true,
  enableAlerting: true
};

// Predefined failure patterns for automatic detection
export const FAILURE_PATTERNS: FailurePattern[] = [
  {
    name: 'Empty Response',
    pattern: (response: string) => !response || response.trim().length === 0,
    category: FailureCategory.OUTPUT_SCHEMA_MISMATCH,
    severity: FailureSeverity.HIGH,
    confidence: 0.9
  },
  {
    name: 'Generic Error Message',
    pattern: /^(I can't|I'm unable to|I don't know|I'm sorry, but)/i,
    category: FailureCategory.IRRELEVANT_RESPONSE,
    severity: FailureSeverity.MEDIUM,
    confidence: 0.8
  },
  {
    name: 'Repetitive Content',
    pattern: (response: string) => {
      const words = response.split(' ');
      const uniqueWords = new Set(words);
      return uniqueWords.size < words.length * 0.3; // Less than 30% unique words
    },
    category: FailureCategory.LOGIC_ERROR,
    severity: FailureSeverity.MEDIUM,
    confidence: 0.7
  },
  {
    name: 'Off-topic Response',
    pattern: (response: string, input: string) => {
      const inputWords = input.toLowerCase().split(' ');
      const responseWords = response.toLowerCase().split(' ');
      const commonWords = inputWords.filter(word => responseWords.includes(word));
      return commonWords.length < inputWords.length * 0.2; // Less than 20% word overlap
    },
    category: FailureCategory.IRRELEVANT_RESPONSE,
    severity: FailureSeverity.HIGH,
    confidence: 0.8
  },
  {
    name: 'Incomplete Response',
    pattern: /\.\.\.$|incomplete|truncated|cut off/i,
    category: FailureCategory.TOKEN_LIMIT_EXCEEDED,
    severity: FailureSeverity.MEDIUM,
    confidence: 0.8
  },
  {
    name: 'JSON Parse Error',
    pattern: /invalid json|json parse error|malformed json/i,
    category: FailureCategory.INVALID_FORMAT,
    severity: FailureSeverity.HIGH,
    confidence: 0.9
  },
  {
    name: 'Timeout Error',
    pattern: /timeout|timed out|request timeout/i,
    category: FailureCategory.TIME_OUT,
    severity: FailureSeverity.HIGH,
    confidence: 0.9
  },
  {
    name: 'Rate Limit Error',
    pattern: /rate limit|too many requests|quota exceeded/i,
    category: FailureCategory.RATE_LIMIT_EXCEEDED,
    severity: FailureSeverity.MEDIUM,
    confidence: 0.9
  },
  {
    name: 'Authentication Error',
    pattern: /unauthorized|authentication failed|invalid api key/i,
    category: FailureCategory.AUTHENTICATION_ERROR,
    severity: FailureSeverity.CRITICAL,
    confidence: 0.95
  },
  {
    name: 'Content Filter Violation',
    pattern: /content filter|inappropriate content|policy violation/i,
    category: FailureCategory.CONTENT_FILTER_VIOLATION,
    severity: FailureSeverity.MEDIUM,
    confidence: 0.9
  }
];

// Failure tracking class
export class FailureTracker {
  private config: FailureTrackingConfig;
  private failureCounts: Map<string, number> = new Map();
  private recentFailures: Array<{ timestamp: number; category: FailureCategory }> = [];

  constructor(config: FailureTrackingConfig = DEFAULT_FAILURE_CONFIG) {
    this.config = config;
  }

  // Detect failures automatically based on patterns
  detectFailures(input: string, response: string, metadata: any = {}): FailureDetectionResult[] {
    if (!this.config.enableAutoDetection) {
      return [];
    }

    const detections: FailureDetectionResult[] = [];

    for (const pattern of FAILURE_PATTERNS) {
      let matches = false;
      
      if (pattern.pattern instanceof RegExp) {
        matches = pattern.pattern.test(response);
      } else if (typeof pattern.pattern === 'function') {
        matches = pattern.pattern(response, input);
      }

      if (matches) {
        detections.push({
          pattern: pattern.name,
          category: pattern.category,
          severity: pattern.severity,
          confidence: pattern.confidence,
          detectedAt: new Date().toISOString(),
          input: input.substring(0, 200), // Truncate for storage
          response: response.substring(0, 200),
          metadata: {
            ...metadata,
            patternMatched: pattern.name,
            autoDetected: true
          }
        });
      }
    }

    return detections;
  }

  // Track a failure manually
  async trackFailure(
    eventId: string,
    category: FailureCategory,
    severity: FailureSeverity,
    details: FailureDetails
  ): Promise<void> {
    try {
      // Update failure counts
      const key = `${category}_${severity}`;
      this.failureCounts.set(key, (this.failureCounts.get(key) || 0) + 1);
      
      // Track recent failures for alerting
      this.recentFailures.push({
        timestamp: Date.now(),
        category
      });

      // Clean old failures (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      this.recentFailures = this.recentFailures.filter(f => f.timestamp > oneHourAgo);

      // Create failure signal
      const signalData = {
        eventId,
        name: `failure_${category}`,
        type: 'feedback' as const,
        comment: details.description || `AI failure detected: ${category}`,
        sentiment: 'NEGATIVE' as const,
        properties: {
          failure_category: category,
          failure_severity: severity,
          confidence_score: details.confidence || 0.8,
          error_type: details.errorType || 'unknown',
          error_message: details.errorMessage || '',
          latency_ms: details.latencyMs || 0,
          model_version: details.modelVersion || 'unknown',
          user_id: details.userId || 'unknown',
          session_id: details.sessionId || 'unknown',
          input_length: details.inputLength || 0,
          response_length: details.responseLength || 0,
          timestamp: new Date().toISOString(),
          auto_detected: details.autoDetected || false,
          retry_count: details.retryCount || 0,
          ...details.metadata
        }
      };

      // Track the failure signal
      await raindrop.trackSignal(signalData);

      // Check for alerting thresholds
      if (this.config.enableAlerting) {
        await this.checkAlertThresholds();
      }

      console.log(`🚨 Failure tracked: ${category} (${severity}) for event ${eventId}`);
    } catch (error) {
      console.error('Failed to track failure:', error);
    }
  }

  // Check if failure rates exceed thresholds
  private async checkAlertThresholds(): Promise<void> {
    const now = Date.now();
    const timeWindowMs = this.config.alertThresholds.timeWindow * 60 * 1000;
    const recentFailures = this.recentFailures.filter(
      f => now - f.timestamp < timeWindowMs
    );

    const totalRecentEvents = recentFailures.length; // This should be total events, not just failures
    const failureRate = totalRecentEvents > 0 ? (recentFailures.length / totalRecentEvents) * 100 : 0;

    if (failureRate > this.config.alertThresholds.failureRate) {
      await this.triggerAlert(failureRate, recentFailures);
    }
  }

  // Trigger alert for high failure rates
  private async triggerAlert(failureRate: number, recentFailures: FailureCategory[]): Promise<void> {
    try {
      const alertEventId = generateEventId();
      
      // Group failures by category
      const failureCounts = recentFailures.reduce((acc, failure) => {
        acc[failure] = (acc[failure] || 0) + 1;
        return acc;
      }, {} as Record<FailureCategory, number>);

      await raindrop.trackAi({
        eventId: alertEventId,
        event: 'failure_alert',
        userId: 'system',
        model: 'alerting_system',
        input: 'High failure rate detected',
        output: `Failure rate ${failureRate.toFixed(2)}% exceeds threshold of ${this.config.alertThresholds.failureRate}%`,
        properties: {
          alert_type: 'high_failure_rate',
          failure_rate: failureRate,
          threshold: this.config.alertThresholds.failureRate,
          time_window_minutes: this.config.alertThresholds.timeWindow,
          failure_breakdown: JSON.stringify(failureCounts),
          total_failures: recentFailures.length,
          timestamp: new Date().toISOString(),
          severity: 'high',
          requires_attention: true
        }
      });

      console.log(`🚨 ALERT: High failure rate detected: ${failureRate.toFixed(2)}%`);
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  }

  // Get failure statistics
  getFailureStats(): FailureStats {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentFailures = this.recentFailures.filter(f => f.timestamp > oneHourAgo);

    const categoryCounts = recentFailures.reduce((acc, failure) => {
      acc[failure.category] = (acc[failure.category] || 0) + 1;
      return acc;
    }, {} as Record<FailureCategory, number>);

    return {
      totalFailures: recentFailures.length,
      failureRate: 0, // This would need total events to calculate properly
      categoryBreakdown: categoryCounts,
      recentFailures: recentFailures.length,
      timeWindow: '1 hour'
    };
  }
}

// Interfaces
export interface FailureDetectionResult {
  pattern: string;
  category: FailureCategory;
  severity: FailureSeverity;
  confidence: number;
  detectedAt: string;
  input: string;
  response: string;
  metadata: any;
}

export interface FailureDetails {
  description?: string;
  confidence?: number;
  errorType?: string;
  errorMessage?: string;
  latencyMs?: number;
  modelVersion?: string;
  userId?: string;
  sessionId?: string;
  inputLength?: number;
  responseLength?: number;
  autoDetected?: boolean;
  retryCount?: number;
  metadata?: any;
}

export interface FailureStats {
  totalFailures: number;
  failureRate: number;
  categoryBreakdown: Record<FailureCategory, number>;
  recentFailures: number;
  timeWindow: string;
}

// Create global failure tracker instance
export const failureTracker = new FailureTracker();
