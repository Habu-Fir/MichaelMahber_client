import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUsers, useCreateUser, useToggleUserStatus, useDeleteUser, useResetPassword } from '../hooks/useUsers';
import CreateMemberModal from '../components/members/CreateMemberModal';
import {
    Users,
    UserPlus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Power,
    Eye,
    Mail,
    Phone,
    Calendar,
    Shield,
    X,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Key
} from 'lucide-react';
import { cn } from '../lib/utils';
import { RoleColors } from '../types/user.types';

const Members = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    const navigate = useNavigate();
    const { isSuperAdmin, isAdmin } = useAuth();

    // Fetch users with filters
    const { data, isLoading } = useUsers({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
        page: currentPage,
        limit: 10
    });

    const createUser = useCreateUser();
    const toggleStatus = useToggleUserStatus();
    const deleteUser = useDeleteUser();
    const resetPassword = useResetPassword();

    const handleCreateMember = async (formData: any) => {
        try {
            await createUser.mutateAsync(formData);
            setShowCreateModal(false);
        } catch (error) {
            // Error handled in hook
        }
    };

    const handleToggleStatus = (id: string, currentStatus: boolean) => {
        toggleStatus.mutate({ id, isActive: !currentStatus });
        setShowActionsFor(null);
    };

    const handleDelete = (id: string) => {
        deleteUser.mutate(id);
        setShowDeleteConfirm(null);
        setShowActionsFor(null);
    };

    const handleResetPassword = (id: string) => {
        resetPassword.mutate(id);
        setShowActionsFor(null);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const resetFilters = () => {
        setSearchTerm('');
        setRoleFilter('');
        setStatusFilter('');
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary-600" />
                        Members
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage all members of the Mahber community
                    </p>
                </div>

                {/* Add Member button - visible only to admins */}
                {(isSuperAdmin || isAdmin) && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-500/30 font-medium"
                    >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-medium">Add Member</span>
                    </button>
                )}
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search members by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-35"
                        >
                            <option value="">All Roles</option>
                            <option value="member">Member</option>
                            <option value="approver">Approver</option>
                            <option value="admin">Admin</option>
                            {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-35"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        {(searchTerm || roleFilter || statusFilter) && (
                            <button
                                onClick={resetFilters}
                                className="px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            {data && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Members</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{data.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Active Members</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                    {data.data.filter(m => m.isActive).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Inactive Members</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">
                                    {data.data.filter(m => !m.isActive).length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Current Page</p>
                                <p className="text-2xl font-bold text-indigo-600 mt-1">
                                    {data.page} / {data.pages}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                            <p className="mt-4 text-sm text-gray-500">Loading members...</p>
                        </div>
                    </div>
                ) : !data?.data.length ? (
                    <div className="text-center py-16">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Mobile View - Cards */}
                        <div className="block lg:hidden divide-y divide-gray-200">
                            {data.data.map((member) => (
                                <div key={member._id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm",
                                                member.role === 'super_admin' ? 'bg-purple-500' :
                                                    member.role === 'admin' ? 'bg-indigo-500' :
                                                        member.role === 'approver' ? 'bg-amber-500' :
                                                            'bg-primary-500'
                                            )}>
                                                {getInitials(member.name)}
                                            </div>

                                            {/* Member info */}
                                            <div>
                                                <h3 className="font-medium text-gray-900">{member.name}</h3>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {member.email}
                                                </p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {member.phone}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action button */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowActionsFor(showActionsFor === member._id ? null : member._id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-5 h-5 text-gray-400" />
                                            </button>

                                            {/* Actions dropdown */}
                                            {showActionsFor === member._id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/members/${member._id}`);
                                                            setShowActionsFor(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            navigate(`/members/${member._id}/edit`);
                                                            setShowActionsFor(null);
                                                        }}
                                                        className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    {isSuperAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => handleResetPassword(member._id)}
                                                                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50"
                                                            >
                                                                <Key className="w-4 h-4" />
                                                                Reset Password
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(member._id, member.isActive)}
                                                                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50"
                                                            >
                                                                <Power className="w-4 h-4" />
                                                                {member.isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => setShowDeleteConfirm(member._id)}
                                                                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-full border",
                                            RoleColors[member.role]?.bg || 'bg-gray-100',
                                            RoleColors[member.role]?.text || 'text-gray-700'
                                        )}>
                                            <Shield className="w-3 h-3 inline mr-1" />
                                            {RoleColors[member.role]?.label || member.role}
                                        </span>
                                        <span className={cn(
                                            "px-3 py-1 text-xs font-medium rounded-full border",
                                            getStatusColor(member.isActive)
                                        )}>
                                            {member.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                                            <Calendar className="w-3 h-3" />
                                            Joined {new Date(member.joinedDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View - Table */}
                        <table className="hidden lg:table w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.data.map((member) => (
                                    <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm",
                                                    member.role === 'super_admin' ? 'bg-purple-500' :
                                                        member.role === 'admin' ? 'bg-indigo-500' :
                                                            member.role === 'approver' ? 'bg-amber-500' :
                                                                'bg-primary-500'
                                                )}>
                                                    {getInitials(member.name)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.name}</p>
                                                    <p className="text-sm text-gray-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{member.phone}</p>
                                            <p className="text-xs text-gray-400">{member.address}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-full border inline-flex items-center gap-1",
                                                RoleColors[member.role]?.bg || 'bg-gray-100',
                                                RoleColors[member.role]?.text || 'text-gray-700'
                                            )}>
                                                <Shield className="w-3 h-3" />
                                                {RoleColors[member.role]?.label || member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-3 py-1 text-xs font-medium rounded-full border",
                                                getStatusColor(member.isActive)
                                            )}>
                                                {member.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(member.joinedDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowActionsFor(showActionsFor === member._id ? null : member._id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-400" />
                                                </button>

                                                {/* Actions dropdown */}
                                                {showActionsFor === member._id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
                                                        <button
                                                            onClick={() => {
                                                                navigate(`/members/${member._id}`);
                                                                setShowActionsFor(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View Details
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                navigate(`/members/${member._id}/edit`);
                                                                setShowActionsFor(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        {isSuperAdmin && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleResetPassword(member._id)}
                                                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50"
                                                                >
                                                                    <Key className="w-4 h-4" />
                                                                    Reset Password
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleStatus(member._id, member.isActive)}
                                                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-amber-600 hover:bg-amber-50"
                                                                >
                                                                    <Power className="w-4 h-4" />
                                                                    {member.isActive ? 'Deactivate' : 'Activate'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setShowDeleteConfirm(member._id)}
                                                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(null)} />
                        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Member?</h3>
                                <p className="text-gray-500 mb-6">
                                    This action cannot be undone. The member will be permanently deleted.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(showDeleteConfirm)}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
                <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-medium">{(data.page - 1) * 10 + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(data.page * 10, data.total)}</span> of{' '}
                        <span className="font-medium">{data.total}</span> members
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

            {/* Create Member Modal */}
            <CreateMemberModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateMember}
                isSubmitting={createUser.isPending}
            />
        </div>
    );
};

export default Members;