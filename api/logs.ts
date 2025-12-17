import { getSupabaseClient } from './_lib/supabase';

export default async function handler(req, res) {
  const supabase = getSupabaseClient(req);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    try {
      const { action, entityType, entityId, metadata } = req.body;
      const { error } = await supabase
        .from('user_logs')
        .insert({
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata
        });

      if (error) throw error;
      return res.status(201).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
