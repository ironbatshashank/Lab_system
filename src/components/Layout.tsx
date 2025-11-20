import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Beaker,
  LayoutDashboard,
  Users,
  FlaskConical,
  ClipboardCheck,
  ShieldAlert,
  Microscope,
  Award,
  FileText,
  MessagesSquare,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  label: string;
  path: string;
  icon: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      fetchUnreadNotifications();
    }
  }, [profile?.id]);

  const fetchUnreadNotifications = async () => {
    if (!profile?.id) return;

    const { data } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    setUnreadCount(data?.length || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getMenuItems = (): MenuItem[] => {
    if (!profile) return [];

    const commonItems: MenuItem[] = [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    ];

    const roleMenus: Record<string, MenuItem[]> = {
      lab_director: [
        ...commonItems,
        { label: 'User Management', path: '/users', icon: <Users className="w-5 h-5" /> },
        { label: 'All Projects', path: '/projects', icon: <FlaskConical className="w-5 h-5" /> },
        { label: 'Client Requests', path: '/client-requests', icon: <FileText className="w-5 h-5" /> },
      ],
      engineer: [
        ...commonItems,
        { label: 'My Projects', path: '/my-projects', icon: <FlaskConical className="w-5 h-5" /> },
        { label: 'Create Project', path: '/projects/new', icon: <FlaskConical className="w-5 h-5" /> },
      ],
      supervisor: [
        ...commonItems,
        { label: 'Pending Reviews', path: '/reviews/supervisor', icon: <ClipboardCheck className="w-5 h-5" /> },
      ],
      hsm: [
        ...commonItems,
        { label: 'Safety Reviews', path: '/reviews/hsm', icon: <ShieldAlert className="w-5 h-5" /> },
      ],
      lab_technician: [
        ...commonItems,
        { label: 'Training Reviews', path: '/reviews/technician', icon: <Microscope className="w-5 h-5" /> },
      ],
      quality_manager: [
        ...commonItems,
        { label: 'Quality Reviews', path: '/quality', icon: <Award className="w-5 h-5" /> },
        { label: 'All Projects', path: '/projects', icon: <FlaskConical className="w-5 h-5" /> },
      ],
      external_client: [
        ...commonItems,
        { label: 'My Requests', path: '/my-requests', icon: <FileText className="w-5 h-5" /> },
        { label: 'Submit Request', path: '/requests/new', icon: <FileText className="w-5 h-5" /> },
      ],
      account_manager: [
        ...commonItems,
        { label: 'Client Requests', path: '/client-requests', icon: <FileText className="w-5 h-5" /> },
        { label: 'Messages', path: '/messages', icon: <MessagesSquare className="w-5 h-5" /> },
      ],
    };

    return roleMenus[profile.role] || commonItems;
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden mr-2 p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Beaker className="w-6 h-6 text-white" />
                </div>
                <span className="hidden sm:block font-bold text-xl text-gray-900">Lab Manager</span>
              </Link>

              <div className="hidden lg:flex items-center ml-8 space-x-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-6 h-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {profile?.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.role.replace('_', ' ')}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link
                      to="/change-password"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Change Password
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
