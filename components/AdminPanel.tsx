import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeftIcon } from './Icons';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
     setLoading(true);
     try {
       const { data, error } = await supabase
         .from('user_logs')
         .select('*, profiles(email)')
         .order('created_at', { ascending: false })
         .limit(50);
        
        if (error) {
           // Fallback if profiles(email) join fails or table doesn't exist
           console.warn('Error fetching logs with join, trying simple fetch:', error);
           const { data: simpleData, error: simpleError } = await supabase
             .from('user_logs')
             .select('*')
             .order('created_at', { ascending: false })
             .limit(50);
             
           if (simpleError) throw simpleError;
           setLogs(simpleData || []);
           return;
        }
        setLogs(data || []);
     } catch (err) {
       console.error('Error fetching logs:', err);
     } finally {
       setLoading(false);
     }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      // Refresh list
      fetchUsers();
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role');
    }
  };

  const handleTabChange = (tab: 'users' | 'logs') => {
    setActiveTab(tab);
    if (tab === 'users') fetchUsers();
    else fetchLogs();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-2xl font-bold font-serif text-gray-900">User Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
           <div className="flex border-b border-gray-200">
              <button 
                onClick={() => handleTabChange('users')}
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'users' ? 'border-b-2 border-pakGreen-600 text-pakGreen-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Users Management
              </button>
              <button 
                onClick={() => handleTabChange('logs')}
                className={`px-6 py-3 font-medium text-sm ${activeTab === 'logs' ? 'border-b-2 border-pakGreen-600 text-pakGreen-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                System Logs
              </button>
           </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
             {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {user.avatar_url ? (
                                  <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                    {user.email?.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.full_name || 'No Name'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {user.role === 'user' ? (
                              <button onClick={() => updateUserRole(user.id, 'admin')} className="text-indigo-600 hover:text-indigo-900">Make Admin</button>
                            ) : (
                              <button onClick={() => updateUserRole(user.id, 'user')} className="text-red-600 hover:text-red-900">Revoke Admin</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             )}

             {activeTab === 'logs' && (
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log.id}>
                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.profiles?.email || log.user_id}</td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                             {log.entity_type && <span className="bg-gray-100 px-2 py-0.5 rounded text-xs mr-2">{log.entity_type}</span>}
                             {JSON.stringify(log.metadata).slice(0, 30)}...
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
