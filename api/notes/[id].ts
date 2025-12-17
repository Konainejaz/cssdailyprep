import { getSupabaseClient } from '../_lib/supabase';

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req);
  const { id } = req.query;

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    try {
      const { title, content, subject, linkedArticleId } = req.body;
      
      const { data, error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          subject,
          linked_article_id: linkedArticleId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id) // Ensure ownership
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
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

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure ownership

      if (error) throw error;

      return res.status(200).json({ message: 'Note deleted' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
