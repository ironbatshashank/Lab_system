import { useAuth } from '../contexts/AuthContext';
import { LabDirectorDashboard } from './dashboards/LabDirectorDashboard';
import { EngineerDashboard } from './dashboards/EngineerDashboard';
import { SupervisorDashboard } from './dashboards/SupervisorDashboard';
import { HSMDashboard } from './dashboards/HSMDashboard';
import { LabTechnicianDashboard } from './dashboards/LabTechnicianDashboard';
import { QualityManagerDashboard } from './dashboards/QualityManagerDashboard';
import { ExternalClientDashboard } from './dashboards/ExternalClientDashboard';
import { AccountManagerDashboard } from './dashboards/AccountManagerDashboard';

export function Dashboard() {
  const { profile } = useAuth();

  if (!profile) return null;

  const dashboards = {
    lab_director: <LabDirectorDashboard />,
    engineer: <EngineerDashboard />,
    supervisor: <SupervisorDashboard />,
    hsm: <HSMDashboard />,
    lab_technician: <LabTechnicianDashboard />,
    quality_manager: <QualityManagerDashboard />,
    external_client: <ExternalClientDashboard />,
    account_manager: <AccountManagerDashboard />,
  };

  return dashboards[profile.role] || <div>Dashboard not found</div>;
}
