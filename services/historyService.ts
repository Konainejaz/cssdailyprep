import { supabase } from '../lib/supabase';

const HISTORY_KEY = 'css_prep_search_history_v1';

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: string;
  result_snapshot?: any;
  created_at: string;
}

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
  // Try local storage first as it's the source of truth for now
  return getHistoryLocal().sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const addToHistory = async (query: string, type: string = 'research', resultSnapshot?: any) => {
  const history = getHistoryLocal();
  
  // Remove duplicates for same query
  const filtered = history.filter(h => h.query.toLowerCase() !== query.toLowerCase());
  
  const newItem: SearchHistoryItem = {
    id: crypto.randomUUID(),
    query,
    type,
    result_snapshot: resultSnapshot,
    created_at: new Date().toISOString()
  };
  
  // Keep last 50 items
  const updated = [newItem, ...filtered].slice(0, 50);
  saveHistoryLocal(updated);
};

export const clearHistory = async () => {
  localStorage.removeItem(HISTORY_KEY);
}

export const logAction = async (action: string, entityType?: string, entityId?: string, metadata?: any) => {
  console.log('[Analytics]', { action, entityType, entityId, metadata });
};

export const logError = async (error: unknown, context?: any) => {
  console.error('[Error Log]', { error, context });
};
