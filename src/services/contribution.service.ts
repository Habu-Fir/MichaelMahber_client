/**
 * =========================
 * 📤 Contribution Service
 * =========================
 */

import api from './api';
import type {
    Contribution,
    ContributionStats,
    ContributionSummary,
    GenerateContributionRequest,
    UploadReceiptResponse,
    VerifyContributionRequest,
    ContributionFilters,
    PaginatedContributions
} from '../types/contribution.types';

class ContributionService {
  private baseUrl = '/contributions';

  /**
   * =========================
   * 👤 MEMBER FUNCTIONS
   * =========================
   */

  /**
   * Get current user's contributions with stats
   */
  async getMyContributions(): Promise<{ contributions: Contribution[]; stats: ContributionStats }> {
    try {
      const response = await api.get(`${this.baseUrl}/my`);
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch your contributions');
    }
  }

  /**
   * Upload receipt for a contribution
   */
  async uploadReceipt(contributionId: string, file: File): Promise<UploadReceiptResponse> {
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const response = await api.post(`${this.baseUrl}/${contributionId}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to upload receipt');
    }
  }

  /**
   * =========================
   * 👑 ADMIN/SUPER ADMIN FUNCTIONS
   * =========================
   */

  /**
   * Generate monthly contributions for all members
   */
  async generateMonthlyContributions(data: GenerateContributionRequest): Promise<{
    message: string;
    count: number;
    month: number;
    year: number;
  }> {
    try {
      const response = await api.post(`${this.baseUrl}/generate`, data);
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to generate contributions');
    }
  }

  /**
   * Get all contributions with filters (Admin only)
   */
  async getAllContributions(filters?: ContributionFilters): Promise<PaginatedContributions> {
    try {
      const response = await api.get(this.baseUrl, { params: filters });
      return {
        data: response.data.data,
        total: response.data.total,
        page: response.data.page,
        pages: response.data.pages,
        count: response.data.count
      };
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch contributions');
    }
  }

  /**
   * Get contribution summary statistics (Admin only)
   */
  async getContributionSummary(year?: number): Promise<ContributionSummary> {
    try {
      const response = await api.get(`${this.baseUrl}/summary`, { 
        params: { year: year || new Date().getFullYear() } 
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to fetch contribution summary');
    }
  }

  /**
   * Verify a contribution (Super Admin only)
   */
  async verifyContribution(contributionId: string, data: VerifyContributionRequest): Promise<Contribution> {
    try {
      const response = await api.put(`${this.baseUrl}/${contributionId}/verify`, data);
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error, 'Failed to verify contribution');
    }
  }

  /**
   * =========================
   * 🛠️ UTILITY FUNCTIONS
   * =========================
   */

  /**
   * Check if a contribution can be verified (has receipt uploaded)
   */
  canBeVerified(contribution: Contribution): boolean {
    return contribution.status === 'pending' && !!contribution.receipt;
  }

  /**
   * Check if a member can upload receipt for a contribution
   */
  canUploadReceipt(contribution: Contribution, currentUserId: string): boolean {
    return (
      contribution.memberId._id === currentUserId &&
      contribution.status === 'pending'
    );
  }

  /**
   * Format month number to month name
   */
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  /**
   * Get display text for status
   */
  getStatusText(status: string): string {
    return status === 'paid' ? 'Paid ✓' : 'Pending ⏳';
  }

  /**
   * Get status color for badges
   */
  getStatusColor(status: string): string {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any, defaultMessage: string): Error {
    console.error('Contribution Service Error:', error);
    const message = error.response?.data?.message || defaultMessage;
    return new Error(message);
  }
}

export default new ContributionService();