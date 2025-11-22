import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { ClipboardCheck, ShieldAlert, Microscope } from 'lucide-react';

interface ReviewsListProps {
  role: 'supervisor' | 'hsm' | 'lab_technician';
}

export function ReviewsList({ role }: ReviewsListProps) {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [role]);

  const fetchProjects = async () => {
    try {
      const statusMap = {
        supervisor: 'pending_supervisor',
        hsm: 'pending_hsm',
        lab_technician: 'pending_technician',
      };

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', statusMap[role])
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const titles = {
      supervisor: 'Supervisor Reviews',
      hsm: 'Safety Reviews',
      lab_technician: 'Training Reviews',
    };
    return titles[role];
  };

  const getDescription = () => {
    const descriptions = {
      supervisor: 'Projects pending your supervisory review',
      hsm: 'Projects pending health and safety review',
      lab_technician: 'Projects pending training and equipment review',
    };
    return descriptions[role];
  };

  const getIcon = () => {
    const icons = {
      supervisor: ClipboardCheck,
      hsm: ShieldAlert,
      lab_technician: Microscope,
    };
    const Icon = icons[role];
    return <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />;
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{getTitle()}</h1>
        <p className="text-gray-600 mt-2">{getDescription()}</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pending Reviews</h3>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              {getIcon()}
              <p className="text-gray-600">No projects pending review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <Link key={project.id} to={`/reviews/${role}/${project.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted {project.submitted_at ? new Date(project.submitted_at).toLocaleDateString() : 'Recently'}
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
