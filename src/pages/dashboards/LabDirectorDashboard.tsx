import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, FlaskConical, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export function LabDirectorDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingApprovals: 0,
    clientRequests: 0,
    activeProjects: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, projects, clientRequests] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id, status', { count: 'exact' }),
        supabase.from('client_requests').select('id', { count: 'exact', head: true }).in('status', ['new', 'under_review']),
      ]);

      const projectsData = projects.data || [];
      const pendingApprovals = projectsData.filter(
        (p) => ['pending_supervisor', 'pending_hsm', 'pending_technician'].includes(p.status)
      ).length;
      const activeProjects = projectsData.filter((p) => ['approved', 'in_progress'].includes(p.status)).length;
      const completedProjects = projectsData.filter((p) => p.status === 'completed').length;

      setStats({
        totalUsers: users.count || 0,
        totalProjects: projects.count || 0,
        pendingApprovals,
        clientRequests: clientRequests.count || 0,
        activeProjects,
        completedProjects,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500', link: '/users' },
    { title: 'Total Projects', value: stats.totalProjects, icon: FlaskConical, color: 'bg-green-500', link: '/projects' },
    { title: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'bg-yellow-500', link: '/projects' },
    { title: 'Client Requests', value: stats.clientRequests, icon: FileText, color: 'bg-orange-500', link: '/client-requests' },
    { title: 'Active Projects', value: stats.activeProjects, icon: AlertCircle, color: 'bg-teal-500', link: '/projects' },
    { title: 'Completed Projects', value: stats.completedProjects, icon: CheckCircle, color: 'bg-green-500', link: '/projects' },
  ];

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lab Director Dashboard</h1>
        <p className="text-gray-600 mt-2">Complete overview of laboratory operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-full`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/users/new">
                <Button fullWidth variant="secondary">
                  <Users className="w-4 h-4 mr-2" />
                  Create New User
                </Button>
              </Link>
              <Link to="/projects">
                <Button fullWidth variant="secondary">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  View All Projects
                </Button>
              </Link>
              <Link to="/client-requests">
                <Button fullWidth variant="secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  View Client Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">System Information</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="text-lg font-medium text-green-600">All Systems Operational</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-medium">Laboratory Director</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Access Level</p>
                <p className="text-lg font-medium">Full Access</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
