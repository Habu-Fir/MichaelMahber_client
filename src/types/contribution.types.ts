/**
 * =========================
 * 📄 Contribution Types
 * =========================
 */

// Contribution status - Only two states
export type ContributionStatus = 'pending' | 'paid';

// User reference (simplified version for contributions)
export interface ContributionUserReference {
  _id: string;
  name: string;
  email: string;
}

// Admin reference for verification
export interface AdminReference {
  _id: string;
  name: string;
}

// Main Contribution interface
export interface Contribution {
  _id: string;
  memberId: ContributionUserReference;
  month: number;           // 1-12
  year: number;            // 2024, 2025, etc.
  amount: number;          // Fixed at 1000 ETB
  status: ContributionStatus;
  
  // Payment fields
  paidDate?: Date | string;         // When payment was verified
  receipt?: string;        // URL to uploaded receipt
  receiptFileName?: string;
  receiptMimeType?: string;
  uploadedBy?: string;     // Member who uploaded
  
  // Verification fields
  verifiedBy?: AdminReference;
  verifiedAt?: Date | string;
  notes?: string;          // Admin notes during verification
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Statistics for member dashboard
export interface ContributionStats {
  totalPaid: number;       // Total amount paid (in ETB)
  totalPending: number;    // Total amount pending (in ETB)
  paidCount: number;       // Number of paid contributions
  pendingCount: number;    // Number of pending contributions
  lastPaid: Date | string | null;   // Date of last payment
}

// Summary for admin dashboard
export interface ContributionSummary {
  year: number;
  totalCollected: number;      // Total amount collected this year
  totalPayments: number;       // Total number of payments this year
  pendingVerifications: number; // Number of uploaded receipts waiting for verification
  monthlyBreakdown: Array<{
    month: number;             // Month number (1-12)
    total: number;             // Amount collected that month
    count: number;             // Number of payments that month
  }>;
}

// Request to generate contributions
export interface GenerateContributionRequest {
  month: number;          // 1-12
  year: number;           // Year
}

// Response after uploading receipt
export interface UploadReceiptResponse {
  id: string;            // Contribution ID
  status: string;        // Current status
  receipt: string;       // Receipt URL
}

// Request to verify a contribution
export interface VerifyContributionRequest {
  notes?: string;        // Optional admin notes
}

// Filters for fetching contributions (admin only)
export interface ContributionFilters {
  month?: number;
  year?: number;
  status?: ContributionStatus;
  memberId?: string;
  page?: number;
  limit?: number;
}

// Paginated response for admin
export interface PaginatedContributions {
  data: Contribution[];
  total: number;
  page: number;
  pages: number;
  count: number;
}