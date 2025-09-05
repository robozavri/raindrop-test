# Raindrop Testing Guide

This guide explains how to test the comprehensive Raindrop tracking implementation with simulated users and data variations.

## 🚀 Quick Start

### 1. Start the Application
```bash
npm run dev
```

### 2. Run Tests
```bash
# Simple test (no external dependencies)
npm run test:raindrop

# Full test with comprehensive simulation
npm run test:raindrop:full
```

## 📊 Test Scripts Overview

### Simple Test (`test-simple.js`)
- **No external dependencies** - uses Node.js built-in modules
- Tests 3 user profiles with different plans and roles
- Sends 5-12 messages per user with various scenarios
- Tests tool usage (search, calculator, translator)
- Tests feedback submission
- Tests analytics events

### Full Test (`test-simulation.js`)
- **Requires axios** - installs automatically if missing
- Tests 5 comprehensive user profiles
- Tests 7 different scenario categories
- Tests all tool variations
- Tests comprehensive feedback scenarios
- Tests all analytics events
- More detailed reporting and metrics

## 👥 User Profiles Tested

### 1. Alex Developer (Premium)
- **Plan**: Premium
- **Role**: Senior Developer
- **Company**: TechCorp Inc
- **Department**: Engineering
- **Preferences**: GPT-4o, high temperature, 2000 tokens

### 2. Sarah Analyst (Enterprise)
- **Plan**: Enterprise
- **Role**: Business Analyst
- **Company**: Business Solutions Ltd
- **Department**: Analytics
- **Preferences**: GPT-4o-mini, low temperature, 1000 tokens

### 3. Mike Student (Free)
- **Plan**: Free
- **Role**: Student
- **Company**: University of Technology
- **Department**: Computer Science
- **Preferences**: GPT-4o-mini, high temperature, 500 tokens

### 4. Emma Creative (Pro)
- **Plan**: Pro
- **Role**: Creative Director
- **Company**: Creative Agency
- **Department**: Design
- **Preferences**: GPT-4o, maximum temperature, 1500 tokens

### 5. David Support (Standard)
- **Plan**: Standard
- **Role**: Support Agent
- **Company**: Customer Support Co
- **Department**: Customer Service
- **Preferences**: GPT-4o-mini, medium temperature, 800 tokens

## 🎭 Test Scenarios

### 1. Basic Questions
- "Hello, how are you?"
- "What is the weather like today?"
- "Can you help me with a coding problem?"
- "Tell me a joke"
- "What is machine learning?"

### 2. Search Queries (Triggers Web Search Tool)
- "Search for latest AI news"
- "Find information about React hooks"
- "Search for Python best practices"
- "Look up TypeScript documentation"

### 3. Calculator Usage (Triggers Calculator Tool)
- "Calculate 25 * 4 + 10"
- "What is 100 / 3.14?"
- "Solve: (5 + 3) * 2 - 4"
- "Calculate the square root of 144"

### 4. Translation Requests (Triggers Translator Tool)
- "Translate 'Hello world' to Spanish"
- "Translate 'Good morning' to French"
- "Translate 'Thank you' to German"
- "Translate 'How are you?' to Italian"

### 5. Code Questions
- "How do I create a React component?"
- "Show me a Python function for sorting"
- "Explain this JavaScript code: function add(a, b) { return a + b; }"
- "What is the difference between let and const?"

### 6. Complex Technical Questions
- "Explain microservices architecture with examples"
- "How do I implement authentication in Next.js?"
- "What are the best practices for database design?"
- "How do I optimize React performance?"

### 7. Error Scenarios
- "Calculate 10 / 0"
- "Search for invalid query with special characters: @#$%^&*()"
- "Translate empty string"
- "Process invalid JSON: { invalid json }"

## 👍 Feedback Scenarios

### Positive Feedback
- "Great response, very helpful!"
- "Perfect, exactly what I needed"
- "Excellent explanation, thank you"
- (No comment)

### Negative Feedback
- "This doesn't answer my question"
- "The response is too technical"
- "I need more specific information"
- (No comment)

## 📈 Analytics Events Tested

- `page_loaded` - Page lifecycle tracking
- `user_typing` - Input behavior tracking
- `input_focused` - Interaction engagement
- `user_scrolled` - Content consumption
- `page_visibility_changed` - User engagement
- `feedback_submitted` - Feedback analytics
- `tool_usage` - Tool execution tracking
- `user_behavior` - Comprehensive behavior tracking
- `session_start` - Session initiation
- `session_end` - Session completion

## 🔧 Tool Usage Testing

### Web Search Tool
- **Trigger**: Messages containing "search" or "find"
- **Tracking**: Query, results, performance metrics
- **Data**: Search terms, result count, response time

### Calculator Tool
- **Trigger**: Messages containing math operators (+, -, *, /)
- **Tracking**: Expression, calculation, error handling
- **Data**: Mathematical expressions, results, error states

### Translator Tool
- **Trigger**: Messages containing "translate"
- **Tracking**: Text, target language, translation quality
- **Data**: Source text, target language, translation result

## 📊 Expected Dashboard Data

After running the tests, your Raindrop dashboard should show:

### Events Timeline
- **14+ different event types** with rich context
- **Complete conversation flows** for each user
- **Tool usage patterns** and performance metrics
- **Error tracking** and debugging information
- **User behavior analytics** and engagement data

### User Profiles
- **5 unique user profiles** with complete traits
- **Plan and subscription information**
- **System and device details**
- **Usage patterns and preferences**
- **Business context and roles**

### Performance Metrics
- **Response times** for each interaction
- **Error rates** and failure patterns
- **Tool execution performance**
- **System load and resource usage**
- **User satisfaction scores**

### Feedback Analysis
- **User ratings** (thumbs up/down)
- **Sentiment analysis** and comments
- **Quality metrics** and improvement suggestions
- **Engagement levels** and retention data

### Business Intelligence
- **User value scoring**
- **Conversion probability tracking**
- **A/B testing data**
- **Cohort analysis**
- **Retention metrics**

## 🎯 Testing Checklist

### Before Running Tests
- [ ] Application is running (`npm run dev`)
- [ ] OpenAI API key is configured in `.env.local`
- [ ] Raindrop API key is set (already configured)
- [ ] No firewall blocking localhost:3000

### During Testing
- [ ] Watch console output for test progress
- [ ] Check for any error messages
- [ ] Verify tool usage is being triggered
- [ ] Confirm feedback is being submitted

### After Testing
- [ ] Check Raindrop dashboard for new events
- [ ] Verify user profiles are created
- [ ] Review event timeline for comprehensive data
- [ ] Analyze performance metrics
- [ ] Check feedback and sentiment data

## 🔍 Troubleshooting

### Common Issues

1. **"Application is not running"**
   - Start the app with `npm run dev`
   - Wait for "Ready" message
   - Check localhost:3000 in browser

2. **"OpenAI API key not configured"**
   - Add your OpenAI API key to `.env.local`
   - Restart the application

3. **"Connection refused"**
   - Check if port 3000 is available
   - Try a different port: `npm run dev -- -p 3001`

4. **"No events in dashboard"**
   - Wait 1-2 minutes for data to appear
   - Check Raindrop API key is correct
   - Verify network connectivity

### Debug Mode

Enable debug logging by setting in `.env.local`:
```
RAINDROP_DEBUG=true
```

## 📈 Success Metrics

A successful test run should show:

- **100+ events** in Raindrop dashboard
- **5 user profiles** with complete traits
- **Multiple tool usage events** (search, calculator, translator)
- **Feedback events** with ratings and comments
- **Analytics events** for user behavior
- **Error tracking** for failed scenarios
- **Performance metrics** for all interactions

## 🎉 Next Steps

After successful testing:

1. **Explore the dashboard** - Navigate through different sections
2. **Analyze the data** - Look for patterns and insights
3. **Test edge cases** - Try unusual inputs and scenarios
4. **Monitor in production** - Deploy and monitor real usage
5. **Optimize based on data** - Use insights to improve the application

The comprehensive tracking implementation provides maximum visibility into user behavior, AI performance, and system metrics for data-driven decision making.
