import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLoans } from '../../hooks/useLoans';
import type { Loan } from '../../types/loan.types';
import {
    HandCoins,
    Plus,
    Search,
    Filter,
    Eye,
    ChevronDown,
    Calendar,
    User,
    TrendingUp,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatCurrency, formatDate } from '../../lib/utils';

const LoansPage = () => {
    // ===== ALL HOOKS MUST BE CALLED FIRST =====
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuth();

    // EVERYONE uses the same hook to see ALL loans (complete transparency)
    const { data, isLoading, error, refetch } = useLoans({
        status: statusFilter || undefined,
        page: currentPage,
    });

    // Debug logs
    useEffect(() => {
        console.log('👤 Current user:', user?.email);
        console.log('👤 User role:', user?.role);
        console.log('📊 Loans data:', data);
    }, [user, data]);

    // Apply client-side search filtering
    const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);

    useEffect(() => {
        if (data?.data) {
            let filtered = [...data.data];

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter(loan =>
                    loan.loanNumber.toLowerCase().includes(term) ||
                    loan.memberName?.toLowerCase().includes(term)
                );
            }

            setFilteredLoans(filtered);
        }
    }, [data, searchTerm]);

    // ===== NOW WE CAN DO CONDITIONAL RETURNS =====
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading loans...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Loans</h2>
                    <p className="text-gray-600 mb-6">Failed to load loans. Please try again.</p>
                    <button
                        onClick={() => refetch()}
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Get displayed loans - ALL users see ALL loans
    const displayedLoans = filteredLoans.length > 0 ? filteredLoans : data?.data || [];
    const totalLoans = data?.total || 0;

    // Calculate stats
    const activeLoans = displayedLoans.filter(l => l.status === 'active').length;
    const pendingLoans = displayedLoans.filter(l => l.status === 'pending').length;
    const readyForApprovalLoans = displayedLoans.filter(l => l.status === 'ready_for_approval').length;
    const completedLoans = displayedLoans.filter(l => l.status === 'completed').length;

    // Get status badge color
    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            ready_for_approval: 'bg-blue-100 text-blue-700 border-blue-200',
            approved: 'bg-indigo-100 text-indigo-700 border-indigo-200',
            active: 'bg-green-100 text-green-700 border-green-200',
            payment_pending: 'bg-purple-100 text-purple-700 border-purple-200',
            completed: 'bg-gray-100 text-gray-700 border-gray-200',
            rejected: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'ready_for_approval':
                return <CheckCircle className="w-4 h-4" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'active':
                return <TrendingUp className="w-4 h-4" />;
            case 'payment_pending':
                return <Clock className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HandCoins className="w-6 h-6 text-primary-600" />
                        All Loans
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View all loans in the Mahber - complete transparency
                    </p>
                </div>

                {/* Request Loan Button - visible to all members */}
                <button
                    onClick={() => navigate('/loans/request')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-lg shadow-primary-600/20"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Request Loan</span>
                </button>
            </div>

            {/* Stats Cards - Show to everyone */}
            {displayedLoans.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Total Loans</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totalLoans}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{activeLoans}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingLoans}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Ready for Approval</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{readyForApprovalLoans}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-gray-600 mt-1">{completedLoans}</p>
                    </div>
                </div>
            )}

            {/* Filters Bar - Everyone can filter */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search - shown to everyone */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by loan number or member name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Status Filter - Everyone can filter */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                        >
                            <Filter className="w-5 h-5 text-gray-600" />
                            <span>Filters</span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row gap-2 w-full lg:w-auto`}>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-45"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="ready_for_approval">Ready for Approval</option>
                                <option value="approved">Approved</option>
                                <option value="active">Active</option>
                                <option value="payment_pending">Payment Pending</option>

                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loans List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {!displayedLoans.length ? (
                    <div className="text-center py-16">
                        <HandCoins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
                        <p className="text-gray-500 mb-6">No loans match your criteria.</p>
                        <button
                            onClick={() => navigate('/loans/request')}
                            className={cn(
                                "px-6 py-3 rounded-xl inline-flex items-center gap-2 font-semibold",
                                "transition-all transform active:scale-[0.97]",

                                // ✅ FIXED gradient
                                "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600",

                                // Text
                                "text-gray-900",

                                // Shadow
                                "shadow-md shadow-yellow-500/30",

                                // Hover
                                "hover:from-yellow-500 hover:to-yellow-700",
                                "hover:scale-[1.03]"
                            )}
                        >
                            <Plus className="w-5 h-5" />
                            Request Loan
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile View - Cards */}
                        <div className="block lg:hidden divide-y divide-gray-200">
                            {displayedLoans.map((loan) => (
                                <div
                                    key={loan._id}
                                    onClick={() => navigate(`/loans/${loan._id}`)}
                                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-gray-900">{loan.loanNumber}</p>
                                            <p className="text-sm text-gray-600 mt-0.5">{loan.memberName}</p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1",
                                            getStatusBadge(loan.status)
                                        )}>
                                            {getStatusIcon(loan.status)}
                                            {loan.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Principal</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(loan.principal)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Remaining</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(loan.remainingPrincipal)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(loan.requestDate)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            View Details
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View - Table - ALL users see full table with all columns */}
                        <table className="hidden lg:table w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loan Number
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Principal
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remaining
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Signatures
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Request Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {displayedLoans.map((loan) => (
                                    <tr
                                        key={loan._id}
                                        onClick={() => navigate(`/loans/${loan._id}`)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">{loan.loanNumber}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-600">{loan.memberName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">
                                                {formatCurrency(loan.principal)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-amber-600">
                                                {formatCurrency(loan.remainingPrincipal)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-full border inline-flex items-center gap-1",
                                                getStatusBadge(loan.status)
                                            )}>
                                                {getStatusIcon(loan.status)}
                                                {loan.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary-600 rounded-full"
                                                        style={{ width: `${(loan.signatures?.length || 0) / (loan.requiredSignatures || 1) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600">
                                                    {loan.signatures?.length || 0}/{loan.requiredSignatures || 0}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(loan.requestDate)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/loans/${loan._id}`);
                                                }}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-5 h-5 text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            {/* Pagination - Everyone sees pagination */}
            {data && data.pages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-medium">{(data.page - 1) * 10 + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(data.page * 10, data.total)}</span> of{' '}
                        <span className="font-medium">{data.total}</span> loans
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm bg-primary-600 text-white rounded-xl">
                            {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, data.pages))}
                            disabled={currentPage === data.pages}
                            className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoansPage;