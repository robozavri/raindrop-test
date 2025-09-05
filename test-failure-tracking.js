// Comprehensive AI Failure Tracking Test
// This script tests all failure categories, auto-detection, and alerting

const http = require('http');
const { URL } = require('url');

const BASE_URL = 'http://localhost:3000';

// Test scenarios designed to trigger different failure types
const FAILURE_TEST_SCENARIOS = [
  // Empty response scenarios
  {
    name: 'Empty Response Test',
    message: 'Generate an empty response',
    expectedFailures: ['output_schema_mismatch'],
    description: 'Tests detection of empty or missing responses'
  },
  
  // Generic error message scenarios
  {
    name: 'Generic Error Test',
    message: 'I can\'t help you with that specific request',
    expectedFailures: ['irrelevant_response'],
    description: 'Tests detection of generic error messages'
  },
  
  // Repetitive content scenarios
  {
    name: 'Repetitive Content Test',
    message: 'Tell me about the same thing over and over again',
    expectedFailures: ['logic_error'],
    description: 'Tests detection of repetitive or low-quality responses'
  },
  
  // Off-topic response scenarios
  {
    name: 'Off-topic Response Test',
    message: 'What is the weather like today?',
    expectedFailures: ['irrelevant_response'],
    description: 'Tests detection of responses that don\'t match the input'
  },
  
  // Incomplete response scenarios
  {
    name: 'Incomplete Response Test',
    message: 'Write a very long response that gets cut off...',
    expectedFailures: ['token_limit_exceeded'],
    description: 'Tests detection of truncated or incomplete responses'
  },
  
  // JSON parse error scenarios
  {
    name: 'JSON Error Test',
    message: 'Return invalid JSON: { invalid json }',
    expectedFailures: ['invalid_format'],
    description: 'Tests detection of malformed JSON responses'
  },
  
  // Timeout scenarios
  {
    name: 'Timeout Test',
    message: 'This request will timeout',
    expectedFailures: ['time_out'],
    description: 'Tests detection of timeout errors'
  },
  
  // Rate limit scenarios
  {
    name: 'Rate Limit Test',
    message: 'Make too many requests quickly',
    expectedFailures: ['rate_limit_exceeded'],
    description: 'Tests detection of rate limit errors'
  },
  
  // Authentication error scenarios
  {
    name: 'Auth Error Test',
    message: 'Use invalid API key',
    expectedFailures: ['authentication_error'],
    description: 'Tests detection of authentication failures'
  },
  
  // Content filter scenarios
  {
    name: 'Content Filter Test',
    message: 'Generate inappropriate content',
    expectedFailures: ['content_filter_violation'],
    description: 'Tests detection of content policy violations'
  }
];

// Manual failure tracking scenarios
const MANUAL_FAILURE_SCENARIOS = [
  {
    category: 'logic_error',
    severity: 'high',
    details: {
      description: 'AI provided incorrect mathematical calculation',
      confidence: 0.9,
      errorType: 'calculation_error',
      errorMessage: '2 + 2 = 5 (incorrect)',
      latencyMs: 1500,
      modelVersion: 'gpt-4o-mini',
      userId: 'test_user_1',
      sessionId: 'session_123',
      inputLength: 50,
      responseLength: 100,
      autoDetected: false,
      metadata: {
        expectedAnswer: 4,
        actualAnswer: 5,
        calculationSteps: ['2 + 2 = 5']
      }
    }
  },
  {
    category: 'hallucination',
    severity: 'medium',
    details: {
      description: 'AI provided false information about non-existent events',
      confidence: 0.8,
      errorType: 'factual_error',
      errorMessage: 'Claimed event never happened',
      latencyMs: 2000,
      modelVersion: 'gpt-4o-mini',
      userId: 'test_user_2',
      sessionId: 'session_456',
      inputLength: 100,
      responseLength: 200,
      autoDetected: false,
      metadata: {
        falseClaim: 'The moon landing was in 1968',
        correctFact: 'The moon landing was in 1969',
        source: 'NASA official records'
      }
    }
  },
  {
    category: 'bias_detected',
    severity: 'high',
    details: {
      description: 'AI response showed gender bias in hiring recommendations',
      confidence: 0.85,
      errorType: 'bias_detection',
      errorMessage: 'Gender-biased language detected',
      latencyMs: 1800,
      modelVersion: 'gpt-4o-mini',
      userId: 'test_user_3',
      sessionId: 'session_789',
      inputLength: 80,
      responseLength: 150,
      autoDetected: false,
      metadata: {
        biasType: 'gender',
        biasedPhrases: ['aggressive', 'assertive'],
        context: 'hiring_recommendation',
        severity: 'moderate'
      }
    }
  },
  {
    category: 'context_loss',
    severity: 'medium',
    details: {
      description: 'AI lost context from previous conversation',
      confidence: 0.7,
      errorType: 'context_error',
      errorMessage: 'Referenced non-existent previous topic',
      latencyMs: 1200,
      modelVersion: 'gpt-4o-mini',
      userId: 'test_user_4',
      sessionId: 'session_101',
      inputLength: 60,
      responseLength: 120,
      autoDetected: false,
      metadata: {
        lostContext: 'previous_discussion_about_react',
        currentTopic: 'vue.js',
        conversationLength: 15
      }
    }
  }
];

class FailureTrackingTester {
  constructor() {
    this.results = {
      totalTests: 0,
      successfulTests: 0,
      failedTests: 0,
      autoDetections: 0,
      manualFailures: 0,
      alertsTriggered: 0
    };
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? require('https') : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({ status: res.statusCode, data: jsonData });
          } catch (error) {
            resolve({ status: res.statusCode, data: data });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (options.body) {
        req.write(JSON.stringify(options.body));
      }

      req.end();
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testAutoDetection() {
    console.log('\n🔍 Testing Automatic Failure Detection');
    console.log('=' .repeat(50));

    for (const scenario of FAILURE_TEST_SCENARIOS) {
      try {
        console.log(`\n📝 Testing: ${scenario.name}`);
        console.log(`   Description: ${scenario.description}`);
        console.log(`   Message: "${scenario.message}"`);

        // Send chat message to trigger auto-detection
        const chatResponse = await this.makeRequest(`${BASE_URL}/api/chat`, {
          method: 'POST',
          body: {
            message: scenario.message,
            userId: 'failure_test_user'
          }
        });

        if (chatResponse.status === 200) {
          const failures = chatResponse.data.failures;
          console.log(`   ✅ Response received`);
          console.log(`   🚨 Failures detected: ${failures.detected}`);
          
          if (failures.detected > 0) {
            console.log(`   📊 Categories: ${failures.categories.join(', ')}`);
            console.log(`   ⚠️  Severities: ${failures.severities.join(', ')}`);
            console.log(`   🎯 Patterns: ${failures.patterns.join(', ')}`);
            console.log(`   📈 Confidence: ${failures.confidenceScores.map(c => c.toFixed(2)).join(', ')}`);
            this.results.autoDetections += failures.detected;
          } else {
            console.log(`   ℹ️  No failures auto-detected`);
          }

          this.results.successfulTests++;
        } else {
          console.log(`   ❌ Chat request failed: ${chatResponse.data.error}`);
          this.results.failedTests++;
        }

        this.results.totalTests++;

        // Delay between tests
        await this.delay(1000);

      } catch (error) {
        console.error(`   ❌ Test error:`, error.message);
        this.results.failedTests++;
        this.results.totalTests++;
      }
    }
  }

  async testManualFailureTracking() {
    console.log('\n📝 Testing Manual Failure Tracking');
    console.log('=' .repeat(50));

    for (const scenario of MANUAL_FAILURE_SCENARIOS) {
      try {
        console.log(`\n🚨 Testing: ${scenario.category} (${scenario.severity})`);
        console.log(`   Description: ${scenario.details.description}`);

        const failureResponse = await this.makeRequest(`${BASE_URL}/api/failures`, {
          method: 'POST',
          body: {
            eventId: `test_event_${Date.now()}`,
            category: scenario.category,
            severity: scenario.severity,
            details: scenario.details
          }
        });

        if (failureResponse.status === 200) {
          console.log(`   ✅ Failure tracked successfully`);
          console.log(`   📊 Failure ID: ${failureResponse.data.failureId}`);
          console.log(`   📈 Auto-detections: ${failureResponse.data.autoDetections}`);
          console.log(`   📋 Stats: ${JSON.stringify(failureResponse.data.stats, null, 2)}`);
          this.results.manualFailures++;
        } else {
          console.log(`   ❌ Failure tracking failed: ${failureResponse.data.error}`);
        }

        this.results.totalTests++;

        // Delay between tests
        await this.delay(500);

      } catch (error) {
        console.error(`   ❌ Test error:`, error.message);
        this.results.failedTests++;
        this.results.totalTests++;
      }
    }
  }

  async testFailureStatistics() {
    console.log('\n📊 Testing Failure Statistics');
    console.log('=' .repeat(50));

    try {
      const statsResponse = await this.makeRequest(`${BASE_URL}/api/failures`, {
        method: 'GET'
      });

      if (statsResponse.status === 200) {
        console.log('✅ Failure statistics retrieved');
        console.log('📈 Current Stats:');
        console.log(JSON.stringify(statsResponse.data.stats, null, 2));
      } else {
        console.log(`❌ Failed to get statistics: ${statsResponse.data.error}`);
      }
    } catch (error) {
      console.error('❌ Statistics test error:', error.message);
    }
  }

  async testHighFailureRateAlert() {
    console.log('\n🚨 Testing High Failure Rate Alert');
    console.log('=' .repeat(50));

    try {
      // Send multiple failures quickly to trigger alert
      const rapidFailures = [
        { category: 'logic_error', severity: 'high' },
        { category: 'time_out', severity: 'high' },
        { category: 'irrelevant_response', severity: 'medium' },
        { category: 'api_error', severity: 'critical' },
        { category: 'network_error', severity: 'high' }
      ];

      console.log('📤 Sending rapid failures to trigger alert...');
      
      for (let i = 0; i < rapidFailures.length; i++) {
        const failure = rapidFailures[i];
        await this.makeRequest(`${BASE_URL}/api/failures`, {
          method: 'POST',
          body: {
            eventId: `alert_test_${Date.now()}_${i}`,
            category: failure.category,
            severity: failure.severity,
            details: {
              description: `Rapid failure test ${i + 1}`,
              confidence: 0.9,
              userId: 'alert_test_user',
              sessionId: 'alert_session',
              autoDetected: false
            }
          }
        });
        
        console.log(`   📤 Sent failure ${i + 1}: ${failure.category}`);
        await this.delay(100); // Very short delay
      }

      console.log('✅ Rapid failures sent - check for alerts in Raindrop dashboard');
      this.results.alertsTriggered++;

    } catch (error) {
      console.error('❌ Alert test error:', error.message);
    }
  }

  async runAllTests() {
    console.log('🎯 Starting Comprehensive AI Failure Tracking Test');
    console.log('=' .repeat(60));
    console.log('📊 Testing automatic failure detection');
    console.log('📝 Testing manual failure tracking');
    console.log('📈 Testing failure statistics');
    console.log('🚨 Testing alerting system');
    console.log('=' .repeat(60));

    const startTime = Date.now();

    // Run all test suites
    await this.testAutoDetection();
    await this.testManualFailureTracking();
    await this.testFailureStatistics();
    await this.testHighFailureRateAlert();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    this.printResults(duration);
  }

  printResults(duration) {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FAILURE TRACKING TEST RESULTS');
    console.log('=' .repeat(60));
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`🧪 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Successful: ${this.results.successfulTests}`);
    console.log(`❌ Failed: ${this.results.failedTests}`);
    console.log(`🔍 Auto-detections: ${this.results.autoDetections}`);
    console.log(`📝 Manual Failures: ${this.results.manualFailures}`);
    console.log(`🚨 Alerts Triggered: ${this.results.alertsTriggered}`);
    console.log(`📊 Success Rate: ${((this.results.successfulTests / this.results.totalTests) * 100).toFixed(2)}%`);
    console.log('=' .repeat(60));
    
    console.log('\n🎯 EXPECTED RAINDROP DASHBOARD DATA:');
    console.log('• Multiple failure signal events');
    console.log('• Auto-detected failures with patterns');
    console.log('• Manual failure tracking with rich metadata');
    console.log('• Failure statistics and analytics');
    console.log('• High failure rate alerts');
    console.log('• Failure categorization and severity tracking');
    console.log('• Confidence scores and error metadata');
    console.log('• User and session-based failure analysis');
    
    console.log('\n🔍 Check your Raindrop dashboard at: https://app.raindrop.ai');
    console.log('📈 Look for failure signals in the Events timeline');
    console.log('🚨 Check for alerts in the Analytics section');
    console.log('📊 Review failure statistics and trends');
  }
}

// Check if application is running
async function checkApplication() {
  try {
    const http = require('http');
    const { URL } = require('url');
    
    const urlObj = new URL(BASE_URL);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: '/api/chat',
      method: 'GET'
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        resolve(res.statusCode === 405); // 405 Method Not Allowed is expected
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.end();
    });
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  try {
    console.log('🔍 Checking if the application is running...');
    
    const isRunning = await checkApplication();
    if (!isRunning) {
      console.log('❌ Application is not running. Please start it with: npm run dev');
      console.log('   Then run this test script again.');
      process.exit(1);
    }
    
    console.log('✅ Application is running, starting failure tracking tests...');
    
    const tester = new FailureTrackingTester();
    await tester.runAllTests();
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = { FailureTrackingTester, FAILURE_TEST_SCENARIOS, MANUAL_FAILURE_SCENARIOS };
