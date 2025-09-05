// Simple Raindrop Testing Script (No external dependencies)
// This script uses Node.js built-in modules to test the Raindrop integration

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const BASE_URL = 'http://localhost:3000';

// User profiles for testing
const USER_PROFILES = [
  {
    id: 'user_premium_dev',
    name: 'Alex Developer',
    email: 'alex.dev@company.com',
    plan: 'premium',
    role: 'senior_developer'
  },
  {
    id: 'user_business_analyst',
    name: 'Sarah Analyst',
    email: 'sarah.analyst@business.com',
    plan: 'enterprise',
    role: 'business_analyst'
  },
  {
    id: 'user_student',
    name: 'Mike Student',
    email: 'mike.student@university.edu',
    plan: 'free',
    role: 'student'
  }
];

// Test messages for different scenarios
const TEST_MESSAGES = [
  // Basic questions
  'Hello, how are you?',
  'What is the weather like today?',
  'Can you help me with a coding problem?',
  
  // Search queries (triggers web search tool)
  'Search for latest AI news',
  'Find information about React hooks',
  'Look up Python best practices',
  
  // Calculator usage (triggers calculator tool)
  'Calculate 25 * 4 + 10',
  'What is 100 / 3.14?',
  'Solve: (5 + 3) * 2 - 4',
  
  // Translation requests (triggers translator tool)
  'Translate "Hello world" to Spanish',
  'Translate "Good morning" to French',
  
  // Code questions
  'How do I create a React component?',
  'Show me a Python function for sorting',
  'What is the difference between let and const?',
  
  // Complex technical questions
  'Explain microservices architecture with examples',
  'How do I implement authentication in Next.js?',
  
  // Error scenarios
  'Calculate 10 / 0',
  'Search for invalid query with special characters: @#$%^&*()'
];

// Feedback scenarios
const FEEDBACK_SCENARIOS = [
  { type: 'positive', comment: 'Great response, very helpful!' },
  { type: 'positive', comment: 'Perfect, exactly what I needed' },
  { type: 'negative', comment: 'This doesn\'t answer my question' },
  { type: 'negative', comment: 'The response is too technical' },
  { type: 'positive', comment: '' },
  { type: 'negative', comment: '' }
];

class SimpleRaindropTester {
  constructor() {
    this.results = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      userSessions: 0,
      feedbackEvents: 0,
      toolUsageEvents: 0
    };
  }

  // Make HTTP request using built-in modules
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
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

  async sendChatMessage(userProfile, message, conversationId) {
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/chat`, {
        method: 'POST',
        body: {
          message,
          conversationId,
          userId: userProfile.id
        }
      });

      if (response.status === 200) {
        this.results.successfulEvents++;
        this.results.totalEvents++;
        
        console.log(`  💬 Message: "${message.substring(0, 50)}..."`);
        console.log(`  🤖 Response: "${response.data.message.substring(0, 50)}..."`);
        
        if (response.data.toolsUsed && response.data.toolsUsed.length > 0) {
          console.log(`  🔧 Tools used: ${response.data.toolsUsed.join(', ')}`);
          this.results.toolUsageEvents += response.data.toolsUsed.length;
        }
        
        return response.data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      this.results.failedEvents++;
      this.results.totalEvents++;
      console.error(`  ❌ Chat error:`, error.message);
      throw error;
    }
  }

  async sendFeedback(eventId, userId, feedback) {
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        body: {
          eventId,
          feedback: feedback.type,
          comment: feedback.comment,
          rating: feedback.type === 'positive' ? 5 : 1,
          category: 'ai_response_quality',
          userId
        }
      });

      if (response.status === 200) {
        this.results.feedbackEvents++;
        console.log(`  👍 Feedback: ${feedback.type} ${feedback.comment ? `(${feedback.comment})` : ''}`);
      } else {
        console.error(`  ❌ Feedback error:`, response.data.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`  ❌ Feedback error:`, error.message);
    }
  }

  async sendAnalyticsEvent(userId, eventType, data = {}) {
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/analytics`, {
        method: 'POST',
        body: {
          eventType,
          userId,
          data: {
            timestamp: new Date().toISOString(),
            page: 'chat_interface',
            component: 'ChatInterface',
            ...data
          }
        }
      });

      if (response.status === 200) {
        console.log(`  📊 Analytics: ${eventType}`);
      }
    } catch (error) {
      // Ignore analytics errors
    }
  }

  async simulateUserSession(userProfile) {
    console.log(`\n🚀 Testing user: ${userProfile.name} (${userProfile.plan})`);
    
    const conversationId = `convo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messagesToTest = TEST_MESSAGES.slice(0, Math.floor(Math.random() * 8) + 5); // 5-12 messages per user

    for (let i = 0; i < messagesToTest.length; i++) {
      const message = messagesToTest[i];
      
      try {
        // Send chat message
        const chatResponse = await this.sendChatMessage(userProfile, message, conversationId);
        
        // Simulate analytics events
        await this.sendAnalyticsEvent(userProfile.id, 'user_typing', {
          input_length: message.length,
          typing_speed: Math.floor(Math.random() * 50) + 20
        });
        
        await this.sendAnalyticsEvent(userProfile.id, 'user_behavior', {
          behavior_type: 'message_sent',
          engagement_level: Math.random() * 0.4 + 0.6
        });
        
        // Randomly provide feedback (60% chance)
        if (Math.random() > 0.4) {
          const feedback = FEEDBACK_SCENARIOS[Math.floor(Math.random() * FEEDBACK_SCENARIOS.length)];
          await this.sendFeedback(chatResponse.eventId, userProfile.id, feedback);
        }
        
        // Random delay between messages (1-3 seconds)
        await this.delay(Math.random() * 2000 + 1000);
        
      } catch (error) {
        console.error(`  ❌ Error with message "${message}":`, error.message);
      }
    }

    this.results.userSessions++;
    console.log(`✅ Completed session for ${userProfile.name}`);
  }

  async runTest() {
    console.log('🎯 Starting Simple Raindrop Testing');
    console.log('=' .repeat(50));
    console.log(`📊 Testing with ${USER_PROFILES.length} user profiles`);
    console.log(`📝 Testing ${TEST_MESSAGES.length} different messages`);
    console.log(`🎭 Testing ${FEEDBACK_SCENARIOS.length} feedback variations`);
    console.log('=' .repeat(50));

    const startTime = Date.now();

    // Test each user profile
    for (let i = 0; i < USER_PROFILES.length; i++) {
      const userProfile = USER_PROFILES[i];
      await this.simulateUserSession(userProfile);
      
      // Delay between user sessions
      if (i < USER_PROFILES.length - 1) {
        console.log('\n⏳ Waiting before next user session...');
        await this.delay(2000);
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    this.printResults(duration);
  }

  printResults(duration) {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST RESULTS');
    console.log('=' .repeat(50));
    console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`👥 User Sessions: ${this.results.userSessions}`);
    console.log(`📨 Total Events: ${this.results.totalEvents}`);
    console.log(`✅ Successful: ${this.results.successfulEvents}`);
    console.log(`❌ Failed: ${this.results.failedEvents}`);
    console.log(`👍 Feedback Events: ${this.results.feedbackEvents}`);
    console.log(`🔧 Tool Usage Events: ${this.results.toolUsageEvents}`);
    console.log(`📊 Success Rate: ${((this.results.successfulEvents / this.results.totalEvents) * 100).toFixed(2)}%`);
    console.log('=' .repeat(50));
    
    console.log('\n🎯 EXPECTED RAINDROP DASHBOARD DATA:');
    console.log('• Multiple event types (chat_message, user_behavior, etc.)');
    console.log('• 3 unique user profiles with complete traits');
    console.log('• Tool usage tracking (search, calculator, translator)');
    console.log('• Feedback and sentiment analysis');
    console.log('• User behavior analytics');
    console.log('• Performance metrics and error tracking');
    
    console.log('\n🔍 Check your Raindrop dashboard at: https://app.raindrop.ai');
    console.log('📈 Look for events in the Events timeline');
    console.log('👥 Check user profiles in the Users section');
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
        resolve(res.statusCode === 405); // 405 Method Not Allowed is expected for GET
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
    
    console.log('✅ Application is running, starting test...');
    
    const tester = new SimpleRaindropTester();
    await tester.runTest();
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main();
}

module.exports = { SimpleRaindropTester, USER_PROFILES, TEST_MESSAGES };
