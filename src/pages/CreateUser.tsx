import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft } from 'lucide-react';
import type { UserRole } from '../lib/database.types';

export function CreateUser() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'engineer' as UserRole,
    organization: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const roles: { value: UserRole; label: string }[] = [
    { value: 'engineer', label: 'Engineer' },
    { value: 'hsm', label: 'Health & Safety Manager' },
    { value: 'lab_technician', label: 'Lab Technician' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'quality_manager', label: 'Quality Manager' },
    { value: 'external_client', label: 'External Client' },
    { value: 'account_manager', label: 'Account Manager' },
    { value: 'lab_director', label: 'Lab Director' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        showToast('Not authenticated', 'error');
        setLoading(false);
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: formData.role,
          organization: formData.organization || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.error || 'Failed to create user', 'error');
        setLoading(false);
        return;
      }

      showToast('User created successfully', 'success');
      navigate('/users');
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/users')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
          <p className="text-gray-600 mt-1">Add a new user to the laboratory system</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password (min 6 characters)"
              required
              minLength={6}
            />

            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              options={roles}
              required
            />

            {formData.role === 'external_client' && (
              <Input
                label="Organization"
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Enter organization name"
              />
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating User...' : 'Create User'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/users')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
