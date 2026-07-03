import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

// Page Wrappers
import { DashboardPage } from '../pages/Dashboard';
import { WalletPage } from '../pages/Wallet';
import { CampaignDashboardPage } from '../pages/CampaignDashboard';
import { FarmerLeadsPage } from '../pages/FarmerLeads';

// Screens (Pending refactoring to pages)
import { CampaignBuilder } from '../components/screens/CampaignBuilder/CampaignBuilder';
import { RewardSettings } from '../components/screens/RewardSettings';
import { FarmerTargeting } from '../components/screens/FarmerTargeting';
import { Analytics } from '../components/screens/Analytics';
import { Notifications } from '../components/screens/Notifications';
import { Registration } from '../components/screens/Registration/Registration';
import { Login } from '../components/screens/Login';
import { CompanyList } from '../components/screens/CompanyList';
import { TeamManagement } from '../components/screens/TeamManagement';

// Protected Route wrapper
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registration />} />

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="campaigns" element={<CampaignDashboardPage />} />
          <Route path="campaigns/new" element={<CampaignBuilder />} />
          <Route path="rewards" element={<RewardSettings />} />
          <Route path="targeting" element={<FarmerTargeting />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="leads" element={<FarmerLeadsPage />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="team" element={<TeamManagement />} />
          
          {/* Stubs */}
          <Route path="settings" element={<Navigate to="/" replace />} />
          <Route path="support" element={<Navigate to="/" replace />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
