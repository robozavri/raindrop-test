#!/usr/bin/env node

// Quick Start Test Runner for Raindrop Testing
// This script checks prerequisites and runs the appropriate test

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎯 Raindrop Testing Quick Start');
console.log('=' .repeat(40));

// Check if we're in the right directory
function checkDirectory() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ Not in the correct directory. Please run from raindrop-chat folder.');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (packageJson.name !== 'raindrop-chat') {
    console.log('❌ Not in the raindrop-chat project directory.');
    process.exit(1);
  }
  
  console.log('✅ Correct directory detected');
}

// Check if .env.local exists and has required keys
function checkEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found');
    console.log('   Please create .env.local with your OpenAI API key');
    console.log('   Example:');
    console.log('   OPENAI_API_KEY=your_openai_api_key_here');
    console.log('   RAINDROP_API_KEY=52bf8ba1-892e-4917-b533-0a86cd6f9738');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (!envContent.includes('OPENAI_API_KEY=') || envContent.includes('your_openai_api_key_here')) {
    console.log('❌ OpenAI API key not configured in .env.local');
    console.log('   Please add your actual OpenAI API key');
    process.exit(1);
  }
  
  if (!envContent.includes('RAINDROP_API_KEY=')) {
    console.log('❌ Raindrop API key not found in .env.local');
    console.log('   Adding default Raindrop API key...');
    fs.appendFileSync(envPath, '\nRAINDROP_API_KEY=52bf8ba1-892e-4917-b533-0a86cd6f9738');
  }
  
  console.log('✅ Environment configuration looks good');
}

// Check if application is running
async function checkApplication() {
  return new Promise((resolve) => {
    const http = require('http');
    
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'GET'
    }, (res) => {
      resolve(res.statusCode === 405); // 405 Method Not Allowed is expected
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Start the application if not running
function startApplication() {
  console.log('🚀 Starting the application...');
  
  const child = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });
  
  child.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Ready')) {
      console.log('✅ Application is ready!');
      setTimeout(() => {
        runTest();
      }, 2000);
    }
  });
  
  child.stderr.on('data', (data) => {
    console.error('Application error:', data.toString());
  });
  
  // Timeout after 30 seconds
  setTimeout(() => {
    console.log('⏰ Application startup timeout');
    process.exit(1);
  }, 30000);
}

// Run the test
function runTest() {
  console.log('\n🧪 Running Raindrop test...');
  console.log('=' .repeat(40));
  
  try {
    execSync('node test-simple.js', { stdio: 'inherit' });
    console.log('\n🎉 Test completed successfully!');
    console.log('🔍 Check your Raindrop dashboard at: https://app.raindrop.ai');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    checkDirectory();
    checkEnvironment();
    
    const isRunning = await checkApplication();
    
    if (isRunning) {
      console.log('✅ Application is already running');
      runTest();
    } else {
      console.log('⚠️  Application is not running');
      startApplication();
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Test terminated');
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main();
}
