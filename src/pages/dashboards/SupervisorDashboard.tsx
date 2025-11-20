import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { ProjectStatusBadge } from '../../components/ui/Badge';
import { ClipboardCheck } from 'lucide-react';

export function SupervisorDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, user_profiles!projects_engineer_id_fkey(full_name)')
        .eq('status', 'pending_supervisor')
        .order('submitted_at', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Supervisor Reviews</h1>
        <p className="text-gray-600 mt-2">Projects pending your approval</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pending Reviews ({projects.length})</h3>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No projects pending review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} to={`/reviews/supervisor/${project.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Engineer: {project.user_profiles?.full_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted {new Date(project.submitted_at).toLocaleDateString()}
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
