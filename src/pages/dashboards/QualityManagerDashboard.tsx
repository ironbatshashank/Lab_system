import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { ProjectStatusBadge } from '../../components/ui/Badge';
import { Award } from 'lucide-react';

export function QualityManagerDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, user_profiles!projects_engineer_id_fkey(full_name)')
        .in('status', ['approved', 'in_progress', 'completed'])
        .order('updated_at', { ascending: false })
        .limit(20);

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
        <h1 className="text-3xl font-bold text-gray-900">Quality Management</h1>
        <p className="text-gray-600 mt-2">Monitor and ensure project quality standards</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Active & Completed Projects ({projects.length})</h3>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No projects to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Engineer: {project.user_profiles?.full_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Updated {new Date(project.updated_at).toLocaleDateString()}
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
