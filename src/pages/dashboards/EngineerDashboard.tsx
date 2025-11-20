import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProjectStatusBadge } from '../../components/ui/Badge';
import { FlaskConical, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function EngineerDashboard() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsWithChanges, setProjectsWithChanges] = useState<any[]>([]);
  const [stats, setStats] = useState({ draft: 0, pending: 0, active: 0, completed: 0, changesRequested: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchProjects();
      fetchProjectsWithChanges();
    }
  }, [profile?.id]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('engineer_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);

      const draft = data?.filter((p) => p.status === 'draft').length || 0;
      const pending = data?.filter((p) => ['pending_supervisor', 'pending_hsm', 'pending_technician'].includes(p.status)).length || 0;
      const active = data?.filter((p) => ['approved', 'in_progress'].includes(p.status)).length || 0;
      const completed = data?.filter((p) => p.status === 'completed').length || 0;

      setStats({ draft, pending, active, completed, changesRequested: 0 });
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsWithChanges = async () => {
    try {
      const { data: approvals, error } = await supabase
        .from('approvals')
        .select('*, projects!inner(*)')
        .eq('status', 'changes_requested')
        .eq('projects.engineer_id', profile?.id)
        .eq('projects.status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjectsWithChanges(approvals || []);
      setStats(prev => ({ ...prev, changesRequested: approvals?.length || 0 }));
    } catch (error) {
      console.error('Error fetching projects with changes:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track your experimental projects</p>
        </div>
        <Link to="/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold">{stats.draft}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <FlaskConical className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {projectsWithChanges.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-900">Action Required: Changes Requested</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projectsWithChanges.map((approval) => (
                <Link key={approval.id} to={`/projects/${approval.projects.id}`}>
                  <div className="p-4 bg-white border border-orange-300 rounded-lg hover:border-orange-400 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{approval.projects.title}</h4>
                        <div className="mt-2 p-3 bg-orange-100 rounded-md">
                          <p className="text-sm font-medium text-orange-900 mb-1">
                            Comments from {approval.approver_role.replace('_', ' ')}:
                          </p>
                          <p className="text-sm text-orange-800">{approval.comments}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Requested {new Date(approval.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Projects</h3>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Link to="/projects/new">
                <Button>Create Your First Project</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
