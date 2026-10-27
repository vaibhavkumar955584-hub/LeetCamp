import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (!groqKey && !openRouterKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 });
    }

    const prompt = `You are an expert in coding interview questions and company-wise LeetCode problems.
Given the problem title: "${title}" and URL: "${url || ''}", suggest the top companies that have asked this question in technical interviews.

Return ONLY a valid JSON array of company names (strings). Do not include explanations, markdown, or extra text.
Example: ["Amazon", "Google", "Microsoft", "Meta", "Apple"]

Be accurate and focus on real companies. Return at most 8 companies.`;

    let response;
    if (groqKey) {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that returns only valid JSON arrays.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });
    } else if (openRouterKey) {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'LeetCamp',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that returns only valid JSON arrays.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 200,
        }),
      });
    }

    if (!response || !response.ok) {
      const errorText = await response?.text();
      return NextResponse.json({ error: 'API request failed', details: errorText }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    
    try {
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      const companies = JSON.parse(jsonStr);
      return NextResponse.json({ companies: Array.isArray(companies) ? companies.slice(0, 8) : [] });
    } catch (parseError) {
      return NextResponse.json({ companies: [], raw: content });
    }
  } catch (error: any) {
    console.error('AI companies API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
