/**
 * =========================
 * 📅 Generate Contributions Modal
 * =========================
 * Modal for Super Admin to generate monthly contributions
 * - Select month and year
 * - Creates pending contributions for all active members
 * - Shows success/error messages
 */

import React, { useState } from 'react';
import { X, Calendar, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useAdminContributions } from '../../hooks/useAdminContributions';
import Loader from '../common/Loader';

interface GenerateContributionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const GenerateContributionsModal: React.FC<GenerateContributionsModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

    const { generateMonthly, fetchSummary } = useAdminContributions();

    const months = [
        { value: 1, name: 'January' },
        { value: 2, name: 'February' },
        { value: 3, name: 'March' },
        { value: 4, name: 'April' },
        { value: 5, name: 'May' },
        { value: 6, name: 'June' },
        { value: 7, name: 'July' },
        { value: 8, name: 'August' },
        { value: 9, name: 'September' },
        { value: 10, name: 'October' },
        { value: 11, name: 'November' },
        { value: 12, name: 'December' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    const handleGenerate = async () => {
        setGenerating(true);
        setResult(null);

        try {
            const response = await generateMonthly(month, year);

            setResult({
                success: true,
                message: response.message,
                count: response.count
            });

            // Refresh summary data
            await fetchSummary(year);

            // Notify parent component
            if (onSuccess) {
                onSuccess();
            }

            // Auto close after 3 seconds on success
            setTimeout(() => {
                onClose();
            }, 3000);

        } catch (error: any) {
            setResult({
                success: false,
                message: error.message || 'Failed to generate contributions'
            });
        } finally {
            setGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-linear-to-r from-amber-100 to-yellow-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Generate Contributions</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-amber-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6">
                    Generate contribution records for all active members for the selected month and year.
                    Each member will be required to pay <strong className="text-amber-600">1,000 ETB</strong>.
                </p>

                {/* Result Display */}
                {result && (
                    <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${result.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {result.success ? (
                            <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.message}
                            </p>
                            {result.success && result.count && (
                                <p className="text-xs text-green-700 mt-1">
                                    {result.count} contribution records created
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Form */}
                {!result || (!result.success && result !== null) ? (
                    <>
                        {/* Month Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                            </label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                disabled={generating}
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Year Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Year
                            </label>
                            <select
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                disabled={generating}
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Info Box */}
                        <div className="bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 mb-6">
                            <div className="flex items-start gap-2">
                                <DollarSign className="w-4 h-4 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-xs text-amber-800">
                                        This will create a <strong>1,000 ETB</strong> contribution record for:
                                    </p>
                                    <ul className="text-xs text-amber-700 mt-1 list-disc list-inside">
                                        <li>All active members</li>
                                        <li>Members with role: member, approver, admin, super_admin</li>
                                    </ul>
                                    <p className="text-xs text-amber-800 mt-1">
                                        ⚠️ This action cannot be undone for the selected month/year.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={generating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="flex-1 bg-linear-to-r from-amber-500 to-yellow-600 text-white py-2 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-md"
                            >
                                {generating ? (
                                    <>
                                        <Loader />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Calendar className="w-4 h-4" />
                                        <span>Generate</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    // Success message with close button
                    <button
                        onClick={onClose}
                        className="w-full mt-4 px-4 py-2 bg-linear-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all font-semibold"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );
};

export default GenerateContributionsModal;