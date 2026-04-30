
/**
 * AI Service for Admin Insight Analysis
 * Implements robust fallback for credit limits (402)
 */
export const analyzeAdminInsights = async (stats) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY) {
    return getFallbackSummary(stats, 'No API key configured');
  }

  const prompt = `Analyze these system stats and provide a premium, concise executive summary for the admin dashboard:
    Total Users: ${stats.totalUsers}
    Messages Today: ${stats.messagesToday}
    Active Calls: ${stats.activeCalls}
    Failed Calls Today: ${stats.failedCallsToday}
    Server Uptime: ${stats.serverUptime} seconds
  `;

  try {
    // Attempt 1: Premium High-Token Analysis
    const maxTokens = process.env.OPENROUTER_MAX_TOKENS ? parseInt(process.env.OPENROUTER_MAX_TOKENS, 10) : 800;
    return await callOpenRouter(prompt, maxTokens);
  } catch (err) {
    console.error('[AI] Primary attempt failed:', err.message);
    
    // Attempt 2: Fallback to lower tokens (cost-efficient)
    if (err.message.includes('402') || err.message.includes('credit')) {
      try {
        console.log('[AI] Retrying with 500 tokens...');
        return await callOpenRouter(prompt, 500);
      } catch (fallbackErr) {
        return getFallbackSummary(stats, 'AI limit reached');
      }
    }
    
    return getFallbackSummary(stats, 'AI service unavailable');
  }
};

const callOpenRouter = async (prompt, maxTokens) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://zymi.app',
      'X-Title': 'ZYMI Admin Brain',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemini-flash-1.5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No analysis available';
};

const getFallbackSummary = (stats, reason) => {
  return `[Rule-based Analysis - ${reason}] System is currently ${stats.failedCallsToday > 5 ? 'Experiencing high call failure rates' : 'Operating within normal parameters'}. Total user base is ${stats.totalUsers}. ${stats.activeCalls > 0 ? `There are ${stats.activeCalls} active calls ongoing.` : 'No active calls at the moment.'}`;
};
