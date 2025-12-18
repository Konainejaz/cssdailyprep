import { supabase } from '../lib/supabase';

const HISTORY_KEY = 'css_prep_search_history_v1';

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: string;
  result_snapshot?: any;
  created_at: string;
}

const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
};

const getHistoryLocal = (): SearchHistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveHistoryLocal = (items: SearchHistoryItem[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
};

export const fetchSearchHistory = async (): Promise<SearchHistoryItem[]> => {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return getHistoryLocal().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    const { data, error } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) throw error;

    return data.map((row: any) => ({
      id: String(row.id),
      query: String(row.query ?? ''),
      type: String(row.type ?? 'research'),
      result_snapshot: row.result_snapshot ?? undefined,
      created_at: String(row.created_at),
    }));
  } catch {
    return getHistoryLocal().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
};

export const addToHistory = async (query: string, type: string = 'research', resultSnapshot?: any) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return;

  const history = getHistoryLocal();
  const filtered = history.filter(
    h => !(h.type === type && h.query.toLowerCase() === trimmedQuery.toLowerCase())
  );

  const newItem: SearchHistoryItem = {
    id: crypto.randomUUID(),
    query: trimmedQuery,
    type,
    result_snapshot: resultSnapshot,
    created_at: new Date().toISOString(),
  };

  saveHistoryLocal([newItem, ...filtered].slice(0, 50));

  try {
    const session = await getSession();
    if (!session?.user?.id) return;

    await supabase
      .from('search_history')
      .delete()
      .eq('user_id', session.user.id)
      .eq('type', type)
      .ilike('query', trimmedQuery);

    const { error: insertError } = await supabase.from('search_history').insert({
      user_id: session.user.id,
      query: trimmedQuery,
      type,
      result_snapshot: resultSnapshot ?? null,
    });

    if (insertError) return;

    const { data: ids, error: idsError } = await supabase
      .from('search_history')
      .select('id')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (idsError || !ids) return;
    if (ids.length <= 50) return;

    const toDelete = ids.slice(50).map((r: any) => r.id);
    await supabase.from('search_history').delete().in('id', toDelete);
  } catch {
    return;
  }
};

export const clearHistory = async () => {
  localStorage.removeItem(HISTORY_KEY);
  try {
    const session = await getSession();
    if (!session?.user?.id) return;
    await supabase.from('search_history').delete().eq('user_id', session.user.id);
  } catch {
    return;
  }
};

export const logAction = async (action: string, entityType?: string, entityId?: string, metadata?: any) => {
  try {
    const session = await getSession();
    if (!session?.user?.id) return;

    await supabase.from('user_logs').insert({
      user_id: session.user.id,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    return;
  }
};

export const logError = async (error: unknown, context?: any) => {
  try {
    const session = await getSession();
    if (!session?.user?.id) return;

    const safeError =
      error instanceof Error
        ? { message: error.message, name: error.name, stack: error.stack }
        : { message: String(error) };

    await supabase.from('user_logs').insert({
      user_id: session.user.id,
      action: 'error',
      entity_type: 'client',
      entity_id: null,
      metadata: { error: safeError, context: context ?? null },
    });
  } catch {
    return;
  }
};
