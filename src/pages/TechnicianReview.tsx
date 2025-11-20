import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string;
  safety_considerations: string;
  expected_outcomes: string;
  timeline_duration: string;
  status: string;
  engineer_id: string;
  created_at: string;
  submitted_at: string;
}

interface Approval {
  id: string;
  status: string;
  comments: string;
  approved_at: string;
}

export function TechnicianReview() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [approval, setApproval] = useState<Approval | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchApproval();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApproval = async () => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('project_id', id)
        .eq('approver_role', 'lab_technician')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setApproval(data);
        setComments(data.comments || '');
      }
    } catch (error) {
      console.error('Error fetching approval:', error);
    }
  };

  const handleApprove = async () => {
    if (!comments.trim()) {
      showToast('Please add comments before approving', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (approval) {
        const { error: updateError } = await supabase
          .from('approvals')
          .update({
            status: 'approved',
            comments,
            approved_at: new Date().toISOString(),
            approver_id: profile?.id
          })
          .eq('id', approval.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('approvals')
          .insert({
            project_id: id,
            approver_id: profile?.id,
            approver_role: 'lab_technician',
            status: 'approved',
            comments,
            approved_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      const { error: projectError } = await supabase
        .from('projects')
        .update({ status: 'approved' })
        .eq('id', id);

      if (projectError) throw projectError;

      showToast('Project approved successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error approving project:', error);
      showToast('Failed to approve project', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!comments.trim()) {
      showToast('Please add comments explaining the required changes', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (approval) {
        const { error: updateError } = await supabase
          .from('approvals')
          .update({
            status: 'changes_requested',
            comments,
            approver_id: profile?.id
          })
          .eq('id', approval.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('approvals')
          .insert({
            project_id: id,
            approver_id: profile?.id,
            approver_role: 'lab_technician',
            status: 'changes_requested',
            comments
          });

        if (insertError) throw insertError;
      }

      const { error: projectError } = await supabase
        .from('projects')
        .update({ status: 'draft' })
        .eq('id', id);

      if (projectError) throw projectError;

      showToast('Change request submitted', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error requesting changes:', error);
      showToast('Failed to request changes', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Project not found</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

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

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Submitted {new Date(project.submitted_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <ProjectStatusBadge status={project.status as any} />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Objectives</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{project.objectives}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Safety Considerations</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{project.safety_considerations}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Expected Outcomes</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{project.expected_outcomes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{project.timeline_duration}</p>
          </CardContent>
        </Card>

        {approval && approval.status !== 'pending' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Your Previous Review</h2>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">
                  Status: {approval.status === 'approved' ? 'Approved' : 'Changes Requested'}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{approval.comments}</p>
                {approval.approved_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(approval.approved_at).toLocaleString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Technician Review</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                label="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your technical review comments here..."
                rows={6}
                required
              />
              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  disabled={submitting || !comments.trim()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Project
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleRequestChanges}
                  disabled={submitting || !comments.trim()}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Request Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
