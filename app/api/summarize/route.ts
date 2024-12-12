import { Anthropic } from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

console.log('API Key exists:', !!process.env.CLAUDE_API_KEY);

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Starting API request handler');
    const { content } = await request.json();

    if (!content) {
      console.log('No content provided');
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!process.env.CLAUDE_API_KEY) {
      console.error('Claude API key is not set');
      return NextResponse.json(
        { error: 'API key configuration error' },
        { status: 500 }
      );
    }

    console.log('Sending request to Claude');
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Please provide a concise summary of the following text: ${content}`
      }],
    });

    console.log('Received response from Claude');
    const textContent = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ summary: textContent });
  } catch (error) {
    console.error('Detailed error:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error,
      keys: error instanceof Object ? Object.keys(error) : []
    });
    
    return NextResponse.json(
      { 
        error: `Failed to generate summary: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}
