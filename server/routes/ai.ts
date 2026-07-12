import { Hono } from 'hono';

export const aiRouter = new Hono<{ Bindings: { AI: any } }>();

aiRouter.post('/draft-email', async (c) => {
  const { name, jobTitle, organization } = await c.req.json();
  
  if (!name) {
    return c.json({ error: 'Name is required' }, 400);
  }

  const prompt = `You are a professional sales representative. Write a short, personalized outreach email to a contact.
Contact Name: ${name}
Job Title: ${jobTitle || 'Professional'}
Organization: ${organization || 'their company'}

Keep it under 100 words, polite, and focused on establishing a connection. Do not include subject line, just the email body.`;

  try {
    const response = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a helpful sales assistant. Return ONLY the email body text.' },
        { role: 'user', content: prompt }
      ]
    });
    
    // Cloudflare AI response format
    const draft = response.response || 'Could not generate draft.';
    return c.json({ draft: draft.trim() });
  } catch (err: any) {
    console.error('AI error:', err);
    return c.json({ error: 'Failed to generate draft' }, 500);
  }
});
