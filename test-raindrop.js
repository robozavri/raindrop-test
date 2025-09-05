// Simple test script to verify Raindrop integration
const { raindrop, generateEventId } = require('./src/lib/raindrop.ts');

async function testRaindrop() {
  try {
    console.log('Testing Raindrop integration...');
    
    const eventId = generateEventId();
    
    // Test basic tracking
    raindrop.trackAi({
      eventId,
      event: "test_message",
      userId: "test_user",
      model: "gpt-4o-mini",
      input: "Hello, this is a test message",
      output: "This is a test response from the AI",
      properties: {
        test: "true",
        timestamp: new Date().toISOString(),
      },
    });
    
    console.log('✅ Raindrop tracking test completed');
    console.log('Event ID:', eventId);
    console.log('Check your Raindrop dashboard for the test event');
    
  } catch (error) {
    console.error('❌ Raindrop test failed:', error);
  }
}

testRaindrop();
