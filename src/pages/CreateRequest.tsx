import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft } from 'lucide-react';

export function CreateRequest() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedRequirements: '',
    requestType: 'problem',
    priority: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('client_requests')
        .insert({
          title: formData.title,
          description: formData.description,
          detailed_requirements: formData.detailedRequirements,
          request_type: formData.requestType,
          priority: formData.priority,
          client_id: profile?.id,
          status: 'new',
        });

      if (error) throw error;

      showToast('Request submitted successfully', 'success');
      navigate('/my-requests');
    } catch (error) {
      console.error('Error creating request:', error);
      showToast('Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/my-requests')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Requests
        </Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Submit New Request</h2>
          <p className="text-gray-600 mt-1">Submit a problem or proposal for review</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Request Type"
              value={formData.requestType}
              onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
              required
            >
              <option value="problem">Problem</option>
              <option value="proposal">Proposal</option>
            </Select>

            <Input
              label="Title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive title"
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief description"
              rows={4}
              required
            />

            <Textarea
              label="Detailed Requirements"
              value={formData.detailedRequirements}
              onChange={(e) => setFormData({ ...formData, detailedRequirements: e.target.value })}
              placeholder="Provide detailed requirements and specifications"
              rows={6}
              required
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/my-requests')}
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
