import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Mail, Building, CheckCircle, XCircle } from 'lucide-react';
import type { UserRole } from '../lib/database.types';

interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  organization: string | null;
  is_active: boolean;
  created_at: string;
}

export function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      lab_director: 'bg-red-100 text-red-800',
      engineer: 'bg-blue-100 text-blue-800',
      hsm: 'bg-green-100 text-green-800',
      lab_technician: 'bg-yellow-100 text-yellow-800',
      supervisor: 'bg-indigo-100 text-indigo-800',
      quality_manager: 'bg-pink-100 text-pink-800',
      external_client: 'bg-gray-100 text-gray-800',
      account_manager: 'bg-teal-100 text-teal-800',
    };
    return colors[role];
  };

  const formatRole = (role: UserRole) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage laboratory users and access</p>
        </div>
        <Link to="/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New User
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">{user.full_name}</h3>
                  <Badge className={`mt-2 ${getRoleBadgeColor(user.role)}`}>
                    {formatRole(user.role)}
                  </Badge>
                </div>
                <div>
                  {user.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-xs">{user.id.substring(0, 8)}...</span>
                </div>
                {user.organization && (
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{user.organization}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Created: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No users found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
