import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft } from 'lucide-react';

export function EditProject() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: '',
    safety_considerations: '',
    expected_outcomes: '',
    timeline_duration: '',
  });

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('engineer_id', profile?.id)
        .single();

      if (error) throw error;

      if (data.status !== 'draft') {
        showToast('Only draft projects can be edited', 'error');
        navigate(`/projects/${id}`);
        return;
      }

      setFormData({
        title: data.title,
        description: data.description,
        objectives: data.objectives,
        safety_considerations: data.safety_considerations,
        expected_outcomes: data.expected_outcomes,
        timeline_duration: data.timeline_duration,
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      showToast('Failed to load project', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('engineer_id', profile?.id);

      if (error) throw error;

      showToast('Project updated successfully', 'success');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      showToast('Failed to update project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading project...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Project
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-gray-600 mt-2">Update your project details and resubmit for approval</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Project Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter a descriptive title for your project"
                />
                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Provide a detailed description of your project"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  label="Objectives"
                  name="objectives"
                  value={formData.objectives}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="List the main objectives and goals of this project"
                />
                <Textarea
                  label="Expected Outcomes"
                  name="expected_outcomes"
                  value={formData.expected_outcomes}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the expected results and deliverables"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Safety & Timeline</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  label="Safety Considerations"
                  name="safety_considerations"
                  value={formData.safety_considerations}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Detail all safety measures and considerations for this project"
                />
                <Input
                  label="Timeline Duration"
                  name="timeline_duration"
                  value={formData.timeline_duration}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 6 weeks, 3 months"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/projects/${id}`)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
