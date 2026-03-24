import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/user.service';
import type { CreateUserData, UpdateUserData, UserFilters } from '../types/user.types';
import toast from 'react-hot-toast';
import { CheckCircle, Copy } from 'lucide-react';

// ==================== GET ALL USERS ====================
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.getUsers(filters),
  });
};

// ==================== GET SINGLE USER ====================
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
  });
};

// ==================== GET USER STATISTICS (NEW) ====================
/**
 * Get user statistics for dashboard
 * Returns:
 * - total: Total number of users
 * - byRole: Breakdown by role (super_admin, admin, approver, member)
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: () => userService.getUserStats(),
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: false,
  });
};

// ==================== GET ACTIVE MEMBERS (NEW) ====================
export const useActiveMembers = () => {
  return useQuery({
    queryKey: ['activeMembers'],
    queryFn: () => userService.getActiveMembers(),
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== GET USERS BY ROLE (NEW) ====================
export const useUsersByRole = (role: string) => {
  return useQuery({
    queryKey: ['usersByRole', role],
    queryFn: () => userService.getUsersByRole(role),
    enabled: !!role,
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== CREATE USER ====================
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => userService.createUser(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] }); // Add this

      // Custom toast with copy functionality
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-primary-100 overflow-hidden`}
          >
            {/* Success Header */}
            <div className="bg-primary-600 px-4 py-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">✅ Member Created Successfully!</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                Share this temporary password with the user securely:
              </p>

              {/* Password Box with Copy Button */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Temporary Password</p>
                    <p className="font-mono text-lg font-bold text-primary-700 tracking-wider">
                      {data.temporaryPassword}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.temporaryPassword);
                      toast.success('Password copied to clipboard!', {
                        duration: 2000,
                        position: 'top-center',
                        style: {
                          background: '#10b981',
                          color: '#fff',
                        }
                      });
                    }}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Copy password"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <span className="text-amber-600 text-lg">⚠️</span>
                <p className="text-xs text-amber-700">
                  The user will be required to change this password on first login.
                  Share this password securely and delete after sharing.
                </p>
              </div>
            </div>
          </div>
        ),
        {
          duration: 20000, // Show for 20 seconds
          position: 'top-center',
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create member');
    },
  });
};

// ==================== UPDATE USER ====================
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] }); // Add this
      toast.success('Member updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update member');
    },
  });
};

// ==================== TOGGLE USER STATUS ====================
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      userService.toggleUserStatus(id, isActive),
    onSuccess: (_, { id, isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] }); // Add this
      toast.success(`Member ${isActive ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update member status');
    },
  });
};

// ==================== DELETE USER ====================
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] }); // Add this
      toast.success('Member deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    },
  });
};

// ==================== RESET PASSWORD ====================
export const useResetPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.resetPassword(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] }); // Add this
      
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto border border-amber-100 overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-amber-600 px-4 py-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">🔐 Password Reset Successfully</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                New temporary password for {data.email}:
              </p>

              {/* Password Box with Copy Button */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">New Temporary Password</p>
                    <p className="font-mono text-lg font-bold text-amber-700 tracking-wider">
                      {data.temporaryPassword}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.temporaryPassword);
                      toast.success('Password copied to clipboard!', {
                        duration: 2000,
                        position: 'top-center',
                        style: {
                          background: '#10b981',
                          color: '#fff',
                        }
                      });
                    }}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Copy password"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: 15000,
          position: 'top-center',
        }
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
};