import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft } from 'lucide-react';

export function CreateProject() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    safetyConsiderations: '',
    expectedOutcomes: '',
    timelineDuration: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: formData.title,
          description: formData.description,
          objectives: formData.objectives,
          safety_considerations: formData.safetyConsiderations,
          expected_outcomes: formData.expectedOutcomes,
          timeline_duration: formData.timelineDuration,
          engineer_id: profile?.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      showToast('Project created successfully', 'success');
      navigate(`/projects/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <p className="text-gray-600 mt-1">Submit a new experimental project for approval</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Project Title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive project title"
              required
            />

            <Textarea
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a detailed description of the project"
              rows={4}
              required
            />

            <Textarea
              label="Objectives"
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              placeholder="What are the main objectives of this project?"
              rows={3}
              required
            />

            <Textarea
              label="Safety Considerations"
              value={formData.safetyConsiderations}
              onChange={(e) => setFormData({ ...formData, safetyConsiderations: e.target.value })}
              placeholder="Describe safety protocols and considerations"
              rows={4}
              required
            />

            <Textarea
              label="Expected Outcomes"
              value={formData.expectedOutcomes}
              onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
              placeholder="What outcomes do you expect from this project?"
              rows={3}
              required
            />

            <Input
              label="Timeline Duration"
              type="text"
              value={formData.timelineDuration}
              onChange={(e) => setFormData({ ...formData, timelineDuration: e.target.value })}
              placeholder="e.g., 3 months, 6 weeks"
              required
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Project...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
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
