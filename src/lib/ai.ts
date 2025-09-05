import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function generateAIResponse(prompt: string, model: string = 'gpt-4o-mini') {
  try {
    // Check if API key is configured
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.');
    }

    const { text } = await generateText({
      model: openai(model, {
        apiKey: apiKey,
      }),
      prompt: prompt,
      maxTokens: 1000,
      temperature: 0.7,
    });
    
    return text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
}
