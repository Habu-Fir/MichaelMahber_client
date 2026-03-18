
import { useNavigate } from 'react-router-dom';
import {
    Users,
    HandCoins,
    PiggyBank,
    Clock,
    TrendingUp,
    AlertCircle,
    Shield
} from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentActivity from '../../components/dashboard/RecentActivity';
import PendingPayments from '../../components/dashboard/PendingPayments';
import { LoanTrendChart, LoanStatusPie } from '../../components/dashboard/LoanChart';

// Mock data - will be replaced with real API calls
const mockStats = {
    totalMembers: 156,
    activeMembers: 142,
    totalLoans: 89,
    activeLoans: 34,
    totalPool: 1250000,
    pendingPayments: 12,
    totalInterest: 45000
};

const mockLoanDistribution = [
    { name: 'Active', value: 34, color: '#0d9488' },
    { name: 'Pending', value: 23, color: '#f59e0b' },
    { name: 'Approved', value: 15, color: '#8b5cf6' },
    { name: 'Completed', value: 17, color: '#10b981' }
];

const mockMonthlyData = [
    { month: 'Jan', loans: 45000, contributions: 65000 },
    { month: 'Feb', loans: 52000, contributions: 59000 },
    { month: 'Mar', loans: 48000, contributions: 71000 },
    { month: 'Apr', loans: 61000, contributions: 68000 },
    { month: 'May', loans: 75000, contributions: 82000 },
    { month: 'Jun', loans: 82000, contributions: 78000 }
];

const mockRecentActivity = [
    {
        id: '1',
        type: 'loan_request' as const,
        description: 'New loan request of 50,000 ETB',
        amount: 50000,
        user: 'Abebe Kebede',
        time: '5 minutes ago',
        status: 'pending'
    },
    {
        id: '2',
        type: 'payment' as const,
        description: 'Payment of 3,000 ETB approved',
        amount: 3000,
        user: 'Tigist Haile',
        time: '1 hour ago',
        status: 'approved'
    },
    {
        id: '3',
        type: 'member_joined' as const,
        description: 'New member registered',
        user: 'Dawit Mekonnen',
        time: '3 hours ago'
    },
    {
        id: '4',
        type: 'loan_approved' as const,
        description: 'Loan approved for 20,000 ETB',
        amount: 20000,
        user: 'Helen Gebre',
        time: '5 hours ago',
        status: 'approved'
    }
];

const mockPendingPayments = [
    {
        id: '1',
        memberName: 'Abebe Kebede',
        loanNumber: 'LN-2402-001',
        amount: 5000,
        requestedAt: '2024-02-18T10:30:00Z',
        paymentMethod: 'Bank Transfer'
    },
    {
        id: '2',
        memberName: 'Tigist Haile',
        loanNumber: 'LN-2402-003',
        amount: 3000,
        requestedAt: '2024-02-18T09:15:00Z',
        paymentMethod: 'Mobile Money'
    },
    {
        id: '3',
        memberName: 'Dawit Mekonnen',
        loanNumber: 'LN-2402-002',
        amount: 7500,
        requestedAt: '2024-02-17T16:45:00Z',
        paymentMethod: 'Cash'
    }
];

const SuperAdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary-600" />
                    Super Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Welcome back! Here's what's happening with your Mahber today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Members"
                    value={mockStats.totalMembers}
                    icon={Users}
                    trend={{ value: 12, isPositive: true }}
                    color="primary"
                    onClick={() => navigate('/members')}
                />
                <StatsCard
                    title="Active Loans"
                    value={mockStats.activeLoans}
                    icon={HandCoins}
                    trend={{ value: 8, isPositive: false }}
                    color="amber"
                    onClick={() => navigate('/loans?status=active')}
                />
                <StatsCard
                    title="Total Pool"
                    value={`${(mockStats.totalPool / 1000000).toFixed(1)}M ETB`}
                    icon={PiggyBank}
                    trend={{ value: 15, isPositive: true }}
                    color="green"
                />
                <StatsCard
                    title="Pending Payments"
                    value={mockStats.pendingPayments}
                    icon={Clock}
                    color="purple"
                    onClick={() => navigate('/pending-payments')}
                />
            </div>

            {/* Second Row Stats - More detailed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Interest Earned</p>
                            <p className="text-xl font-bold text-gray-900">
                                {mockStats.totalInterest.toLocaleString()} ETB
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">+12.5%</span>
                        <span className="text-gray-500">vs last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Default Rate</p>
                            <p className="text-xl font-bold text-gray-900">2.3%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">-0.5%</span>
                        <span className="text-gray-500">improving</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Members</p>
                            <p className="text-xl font-bold text-gray-900">
                                {mockStats.activeMembers} / {mockStats.totalMembers}
                            </p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-purple-600 rounded-full h-2"
                            style={{ width: `${(mockStats.activeMembers / mockStats.totalMembers) * 100}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {(mockStats.activeMembers / mockStats.totalMembers * 100).toFixed(1)}% active rate
                    </p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <LoanTrendChart data={mockMonthlyData} />
                </div>
                <div>
                    <LoanStatusPie data={mockLoanDistribution} />
                </div>
            </div>

            {/* Bottom Section - Activity and Pending Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentActivity activities={mockRecentActivity} />
                <PendingPayments payments={mockPendingPayments} />
            </div>
        </div>
    );
};

export default SuperAdminDashboard;