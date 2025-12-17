import { getSupabaseClient } from './_lib/supabase';

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req);

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform keys to match frontend if necessary (snake_case -> camelCase)
      // Frontend expects: id, title, content, createdAt, updatedAt, subject, linkedArticleId
      // DB has: id, title, content, created_at, updated_at, subject, linked_article_id
      const formattedNotes = data.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        createdAt: new Date(note.created_at).getTime(),
        updatedAt: new Date(note.updated_at).getTime(),
        subject: note.subject,
        linkedArticleId: note.linked_article_id
      }));

      return res.status(200).json(formattedNotes);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, content, subject, linkedArticleId, createdAt } = req.body;
      
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title,
          content,
          subject,
          linked_article_id: linkedArticleId,
          created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        id: data.id,
        title: data.title,
        content: data.content,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        subject: data.subject,
        linkedArticleId: data.linked_article_id
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
