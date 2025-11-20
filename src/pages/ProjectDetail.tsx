import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { ArrowLeft, Calendar, Upload, FileSpreadsheet } from 'lucide-react';

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
  updated_at: string;
}

interface ProjectResult {
  id: string;
  file_name: string;
  file_type: string;
  uploaded_at: string;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [results, setResults] = useState<ProjectResult[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchResults();
      fetchApprovals();
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

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('approvals')
        .select('*, user_profiles(full_name)')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApprovals(data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('project_results')
        .select('id, file_name, file_type, uploaded_at')
        .eq('project_id', id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          status: 'pending_supervisor',
          submitted_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      showToast('Project submitted for approval', 'success');
      fetchProject();
    } catch (error) {
      console.error('Error submitting project:', error);
      showToast('Failed to submit project', 'error');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'csv' && fileType !== 'xlsx') {
      showToast('Please upload a CSV or XLSX file', 'error');
      return;
    }

    setUploading(true);

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `project-results/${id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('project_results')
        .insert({
          project_id: id,
          uploaded_by: profile?.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: fileType,
        });

      if (insertError) throw insertError;

      showToast('File uploaded successfully', 'success');
      fetchResults();
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Failed to upload file', 'error');
    } finally {
      setUploading(false);
      event.target.value = '';
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

  const isEngineer = profile?.role === 'engineer' && project.engineer_id === profile.id;

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
                    Created {new Date(project.created_at).toLocaleDateString()}
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

        {approvals.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Review History</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className={`p-4 rounded-lg border ${
                      approval.status === 'approved'
                        ? 'bg-green-50 border-green-200'
                        : approval.status === 'changes_requested'
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {approval.approver_role.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {approval.user_profiles?.full_name || 'Unknown'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          approval.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : approval.status === 'changes_requested'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {approval.status === 'approved'
                          ? 'Approved'
                          : approval.status === 'changes_requested'
                          ? 'Changes Requested'
                          : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{approval.comments}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {approval.approved_at
                        ? new Date(approval.approved_at).toLocaleString()
                        : new Date(approval.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isEngineer && project.status === 'draft' && approvals.some(a => a.status === 'changes_requested') && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <h2 className="text-xl font-semibold text-orange-900">Action Required: Changes Requested</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-white border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800 mb-3">
                    Your project has been returned with change requests. Please review the comments above, make the necessary changes, and resubmit for approval.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleSubmitForApproval}>Resubmit for Approval</Button>
                    <Button variant="secondary" onClick={() => navigate(`/projects/${id}/edit`)}>
                      Edit Project
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEngineer && project.status === 'draft' && !approvals.some(a => a.status === 'changes_requested') && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Project Actions</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    Your project is currently in draft status. Review all details and submit for approval when ready.
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={handleSubmitForApproval}>Submit for Approval</Button>
                    <Button variant="secondary" onClick={() => navigate(`/projects/${id}/edit`)}>
                      Edit Project
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isEngineer && project.status === 'approved' && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Upload Results</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    Your project has been approved! You can now upload experimental results.
                  </p>
                </div>
                <div>
                  <label className="block">
                    <div className="flex items-center justify-center w-full px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          {uploading ? 'Uploading...' : 'Click to upload CSV or XLSX file'}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>

                {results.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Uploaded Files</h3>
                    <div className="space-y-2">
                      {results.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <FileSpreadsheet className="w-5 h-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{result.file_name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded {new Date(result.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 uppercase">{result.file_type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {isEngineer && ['pending_supervisor', 'pending_hsm', 'pending_technician'].includes(project.status) && (
          <Card>
            <CardContent className="pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Your project is currently under review. You'll be notified once it's approved and you can upload results.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
