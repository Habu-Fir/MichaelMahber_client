import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SuperAdminDashboard from '../../pages/dashboard/SuperAdminDashboard';
import ApproverDashboard from '../../pages/dashboard/SuperAdminDashboard';
import MemberDashboard from '../../pages/dashboard/MemberDashboard';
import Loader from '../common/Loader'

const DashboardRouter: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <Loader />;
    }

    if (!user) {
        return null;
    }

    switch (user.role) {
        case 'super_admin':
            return <SuperAdminDashboard />;
        case 'admin':
            return <SuperAdminDashboard />; // Admin sees similar dashboard
        case 'approver':
            return <ApproverDashboard />;
        default:
            return <MemberDashboard />;
    }
};

export default DashboardRouter;