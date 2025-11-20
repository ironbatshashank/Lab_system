import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RequestStatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export function ExternalClientDashboard() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ new: 0, quoted: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchRequests();
    }
  }, [profile?.id]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select('*')
        .eq('client_id', profile?.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setRequests(data || []);

      const newCount = data?.filter((r) => ['new', 'under_review'].includes(r.status)).length || 0;
      const quoted = data?.filter((r) => r.status === 'quoted').length || 0;
      const accepted = data?.filter((r) => r.status === 'accepted').length || 0;
      const rejected = data?.filter((r) => r.status === 'rejected').length || 0;

      setStats({ new: newCount, quoted, accepted, rejected });
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-600 mt-2">Track your project requests and quotations</p>
        </div>
        <Link to="/requests/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold">{stats.new}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quoted</p>
                <p className="text-2xl font-bold">{stats.quoted}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Requests</h3>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No requests yet</p>
              <Link to="/requests/new">
                <Button>Submit Your First Request</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Link key={request.id} to={`/requests/${request.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                      </div>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <PriorityBadge priority={request.priority} />
                      <span className="text-xs text-gray-500 capitalize">{request.request_type}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(request.submitted_at).toLocaleDateString()}
                      </span>
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
