import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { RequestStatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { FileText, Clock, CheckCircle, MessageSquare } from 'lucide-react';

export function AccountManagerDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ new: 0, quoted: 0, accepted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select('*, user_profiles!client_requests_client_id_fkey(full_name, organization)')
        .order('submitted_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRequests(data || []);

      const newCount = data?.filter((r) => ['new', 'under_review'].includes(r.status)).length || 0;
      const quoted = data?.filter((r) => r.status === 'quoted').length || 0;
      const accepted = data?.filter((r) => r.status === 'accepted').length || 0;

      setStats({ new: newCount, quoted, accepted });
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
        <h1 className="text-3xl font-bold text-gray-900">Account Manager</h1>
        <p className="text-gray-600 mt-2">Manage client requests and quotations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New Requests</p>
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
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Client Requests</h3>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No client requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <Link key={request.id} to={`/client-requests/${request.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{request.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Client: {request.user_profiles?.full_name} ({request.user_profiles?.organization})
                        </p>
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
