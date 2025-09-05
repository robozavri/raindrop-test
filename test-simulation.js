// Comprehensive Raindrop Testing Simulation
// This script simulates multiple users and all data variations for maximum dashboard coverage

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const RAINDROP_API_KEY = '52bf8ba1-892e-4917-b533-0a86cd6f9738';

// User profiles for simulation
const USER_PROFILES = [
  {
    id: 'user_premium_dev',
    name: 'Alex Developer',
    email: 'alex.dev@company.com',
    plan: 'premium',
    role: 'senior_developer',
    company: 'TechCorp Inc',
    department: 'engineering',
    preferences: {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000
    }
  },
  {
    id: 'user_business_analyst',
    name: 'Sarah Analyst',
    email: 'sarah.analyst@business.com',
    plan: 'enterprise',
    role: 'business_analyst',
    company: 'Business Solutions Ltd',
    department: 'analytics',
    preferences: {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1000
    }
  },
  {
    id: 'user_student',
    name: 'Mike Student',
    email: 'mike.student@university.edu',
    plan: 'free',
    role: 'student',
    company: 'University of Technology',
    department: 'computer_science',
    preferences: {
      model: 'gpt-4o-mini',
      temperature: 0.9,
      maxTokens: 500
    }
  },
  {
    id: 'user_creative',
    name: 'Emma Creative',
    email: 'emma.creative@design.com',
    plan: 'pro',
    role: 'creative_director',
    company: 'Creative Agency',
    department: 'design',
    preferences: {
      model: 'gpt-4o',
      temperature: 1.0,
      maxTokens: 1500
    }
  },
  {
    id: 'user_support',
    name: 'David Support',
    email: 'david.support@help.com',
    plan: 'standard',
    role: 'support_agent',
    company: 'Customer Support Co',
    department: 'customer_service',
    preferences: {
      model: 'gpt-4o-mini',
      temperature: 0.5,
      maxTokens: 800
    }
  }
];

// Test scenarios for different data variations
const TEST_SCENARIOS = [
  // Basic chat interactions
  {
    name: 'Basic Questions',
    messages: [
      'Hello, how are you?',
      'What is the weather like today?',
      'Can you help me with a coding problem?',
      'Tell me a joke',
      'What is machine learning?'
    ]
  },
  // Tool usage scenarios
  {
    name: 'Search Queries',
    messages: [
      'Search for latest AI news',
      'Find information about React hooks',
      'Search for Python best practices',
      'Look up TypeScript documentation'
    ]
  },
  {
    name: 'Calculator Usage',
    messages: [
      'Calculate 25 * 4 + 10',
      'What is 100 / 3.14?',
      'Solve: (5 + 3) * 2 - 4',
      'Calculate the square root of 144'
    ]
  },
  {
    name: 'Translation Requests',
    messages: [
      'Translate "Hello world" to Spanish',
      'Translate "Good morning" to French',
      'Translate "Thank you" to German',
      'Translate "How are you?" to Italian'
    ]
  },
  // Code-related scenarios
  {
    name: 'Code Questions',
    messages: [
      'How do I create a React component?',
      'Show me a Python function for sorting',
      'Explain this JavaScript code: function add(a, b) { return a + b; }',
      'What is the difference between let and const?'
    ]
  },
  // Complex scenarios
  {
    name: 'Complex Technical Questions',
    messages: [
      'Explain microservices architecture with examples',
      'How do I implement authentication in Next.js?',
      'What are the best practices for database design?',
      'How do I optimize React performance?'
    ]
  },
  // Error scenarios
  {
    name: 'Error-Prone Requests',
    messages: [
      'Calculate 10 / 0',
      'Search for invalid query with special characters: @#$%^&*()',
      'Translate empty string',
      'Process invalid JSON: { invalid json }'
    ]
  }
];

// Feedback variations
const FEEDBACK_SCENARIOS = [
  { type: 'positive', comment: 'Great response, very helpful!' },
  { type: 'positive', comment: 'Perfect, exactly what I needed' },
  { type: 'positive', comment: 'Excellent explanation, thank you' },
  { type: 'negative', comment: 'This doesn\'t answer my question' },
  { type: 'negative', comment: 'The response is too technical' },
  { type: 'negative', comment: 'I need more specific information' },
  { type: 'positive', comment: '' },
  { type: 'negative', comment: '' }
];

// Analytics events to simulate
const ANALYTICS_EVENTS = [
  'page_loaded',
  'user_typing',
  'input_focused',
  'user_scrolled',
  'page_visibility_changed',
  'feedback_submitted',
  'tool_usage',
  'user_behavior',
  'session_start',
  'session_end'
];

class RaindropSimulator {
  constructor() {
    this.results = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      userSessions: 0,
      feedbackEvents: 0,
      toolUsageEvents: 0,
      analyticsEvents: 0
    };
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async simulateUserSession(userProfile, scenarios) {
    console.log(`\n🚀 Starting session for ${userProfile.name} (${userProfile.plan} user)`);
    
    const conversationId = `convo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let messageCount = 0;

    for (const scenario of scenarios) {
      console.log(`\n📝 Testing scenario: ${scenario.name}`);
      
      for (const message of scenario.messages) {
        try {
          // Simulate typing behavior
          await this.simulateTypingBehavior(userProfile.id);
          
          // Send chat message
          const chatResponse = await this.sendChatMessage(userProfile, message, conversationId);
          messageCount++;
          
          // Simulate user behavior after receiving response
          await this.simulateUserBehavior(userProfile.id, 'message_received');
          
          // Randomly provide feedback (70% chance)
          if (Math.random() > 0.3) {
            await this.simulateFeedback(chatResponse.eventId, userProfile.id);
          }
          
          // Simulate additional analytics events
          await this.simulateAnalyticsEvents(userProfile.id);
          
          // Random delay between messages (1-3 seconds)
          await this.delay(Math.random() * 2000 + 1000);
          
        } catch (error) {
          console.error(`❌ Error in scenario ${scenario.name}:`, error.message);
          this.results.failedEvents++;
        }
      }
    }

    this.results.userSessions++;
    console.log(`✅ Completed session for ${userProfile.name} - ${messageCount} messages sent`);
  }

  async sendChatMessage(userProfile, message, conversationId) {
    try {
      const response = await axios.post(`${BASE_URL}/api/chat`, {
        message,
        conversationId,
        userId: userProfile.id
      });
      
      this.results.successfulEvents++;
      this.results.totalEvents++;
      
      console.log(`  💬 Message sent: "${message.substring(0, 50)}..."`);
      console.log(`  🤖 AI Response: "${response.data.message.substring(0, 50)}..."`);
      
      if (response.data.toolsUsed && response.data.toolsUsed.length > 0) {
        console.log(`  🔧 Tools used: ${response.data.toolsUsed.join(', ')}`);
        this.results.toolUsageEvents += response.data.toolsUsed.length;
      }
      
      return response.data;
    } catch (error) {
      this.results.failedEvents++;
      this.results.totalEvents++;
      console.error(`  ❌ Chat error:`, error.response?.data?.error || error.message);
      throw error;
    }
  }

  async simulateFeedback(eventId, userId) {
    try {
      const feedback = FEEDBACK_SCENARIOS[Math.floor(Math.random() * FEEDBACK_SCENARIOS.length)];
      
      await axios.post(`${BASE_URL}/api/feedback`, {
        eventId,
        feedback: feedback.type,
        comment: feedback.comment,
        rating: feedback.type === 'positive' ? 5 : 1,
        category: 'ai_response_quality',
        userId
      });
      
      this.results.feedbackEvents++;
      console.log(`  👍 Feedback submitted: ${feedback.type} ${feedback.comment ? `(${feedback.comment})` : ''}`);
    } catch (error) {
      console.error(`  ❌ Feedback error:`, error.response?.data?.error || error.message);
    }
  }

  async simulateAnalyticsEvents(userId) {
    const eventsToSend = ANALYTICS_EVENTS.slice(0, Math.floor(Math.random() * 3) + 1);
    
    for (const eventType of eventsToSend) {
      try {
        await axios.post(`${BASE_URL}/api/analytics`, {
          eventType,
          userId,
          data: {
            timestamp: new Date().toISOString(),
            page: 'chat_interface',
            component: 'ChatInterface',
            user_engagement: Math.random() * 0.4 + 0.6,
            session_duration: Math.floor(Math.random() * 3600) + 60,
            scroll_depth: Math.random() * 100,
            click_through_rate: Math.random() * 0.1 + 0.05
          }
        });
        
        this.results.analyticsEvents++;
      } catch (error) {
        console.error(`  ❌ Analytics error for ${eventType}:`, error.response?.data?.error || error.message);
      }
    }
  }

  async simulateTypingBehavior(userId) {
    // Simulate typing events
    const typingEvents = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < typingEvents; i++) {
      try {
        await axios.post(`${BASE_URL}/api/analytics`, {
          eventType: 'user_typing',
          userId,
          data: {
            input_length: Math.floor(Math.random() * 100) + 10,
            typing_speed: Math.floor(Math.random() * 50) + 20,
            has_content: true,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        // Ignore typing errors
      }
    }
  }

  async simulateUserBehavior(userId, behaviorType) {
    try {
      await axios.post(`${BASE_URL}/api/analytics`, {
        eventType: behaviorType,
        userId,
        data: {
          behavior_type: behaviorType,
          timestamp: new Date().toISOString(),
          engagement_level: Math.random() * 0.4 + 0.6,
          interaction_quality: Math.random() * 0.3 + 0.7
        }
      });
    } catch (error) {
      // Ignore behavior tracking errors
    }
  }

  async runSimulation() {
    console.log('🎯 Starting Comprehensive Raindrop Testing Simulation');
    console.log('=' .repeat(60));
    console.log(`📊 Testing with ${USER_PROFILES.length} user profiles`);
    console.log(`📝 Testing ${TEST_SCENARIOS.length} different scenarios`);
    console.log(`🎭 Testing ${FEEDBACK_SCENARIOS.length} feedback variations`);
    console.log(`📈 Testing ${ANALYTICS_EVENTS.length} analytics events`);
    console.log('=' .repeat(60));

    const startTime = Date.now();

    // Test each user profile
    for (let i = 0; i < USER_PROFILES.length; i++) {
      const userProfile = USER_PROFILES[i];
      
      // Select random scenarios for each user (3-5 scenarios)
      const userScenarios = TEST_SCENARIOS
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 3);
      
      await this.simulateUserSession(userProfile, userScenarios);
      
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
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SIMULATION RESULTS');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total Duration: ${duration.toFixed(2)} seconds`);
    console.log(`👥 User Sessions: ${this.results.userSessions}`);
    console.log(`📨 Total Events: ${this.results.totalEvents}`);
    console.log(`✅ Successful Events: ${this.results.successfulEvents}`);
    console.log(`❌ Failed Events: ${this.results.failedEvents}`);
    console.log(`👍 Feedback Events: ${this.results.feedbackEvents}`);
    console.log(`🔧 Tool Usage Events: ${this.results.toolUsageEvents}`);
    console.log(`📈 Analytics Events: ${this.results.analyticsEvents}`);
    console.log(`📊 Success Rate: ${((this.results.successfulEvents / this.results.totalEvents) * 100).toFixed(2)}%`);
    console.log('=' .repeat(60));
    
    console.log('\n🎯 EXPECTED RAINDROP DASHBOARD DATA:');
    console.log('• 14+ different event types');
    console.log('• 5 unique user profiles with complete traits');
    console.log('• Comprehensive user behavior tracking');
    console.log('• Tool usage analytics (search, calculator, translator)');
    console.log('• Feedback and sentiment analysis');
    console.log('• Performance metrics and error tracking');
    console.log('• Business intelligence and conversion data');
    console.log('• Rich attachments and context data');
    
    console.log('\n🔍 Check your Raindrop dashboard at: https://app.raindrop.ai');
    console.log('📈 Look for events in the Events timeline');
    console.log('👥 Check user profiles in the Users section');
    console.log('📊 Analyze performance in the Analytics section');
  }
}

// Error handling for missing dependencies
async function checkDependencies() {
  try {
    require('axios');
  } catch (error) {
    console.log('📦 Installing required dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install axios', { stdio: 'inherit' });
  }
}

// Main execution
async function main() {
  try {
    await checkDependencies();
    
    console.log('🔍 Checking if the application is running...');
    try {
      await axios.get(`${BASE_URL}/api/chat`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Application is not running. Please start it with: npm run dev');
        process.exit(1);
      }
    }
    
    const simulator = new RaindropSimulator();
    await simulator.runSimulation();
    
  } catch (error) {
    console.error('💥 Simulation failed:', error.message);
    process.exit(1);
  }
}

// Run the simulation
if (require.main === module) {
  main();
}

module.exports = { RaindropSimulator, USER_PROFILES, TEST_SCENARIOS };
