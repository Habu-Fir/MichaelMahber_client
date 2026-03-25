import { useState } from 'react';
import { useContributions } from '../../hooks/useContributions';
import { formatCurrency } from '../../lib/utils';
import { Wallet, CheckCircle, Clock, TrendingUp, RefreshCw, Eye, FileUp } from 'lucide-react';
import UploadReceiptModal from '../../components/contributions/UploadReceiptModal';
import Loader from '../../components/common/Loader';
import type { Contribution } from '../../types/contribution.types';

const MyContributions = () => {
    const {
        contributions,
        stats,
        loading,
        error,
        uploadReceipt,
        canUpload,
        getMonthName,
        getStatusDisplay,
        fetchMyContributions
    } = useContributions();

    const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

    const handleUploadClick = (contribution: Contribution) => {
        console.log('Upload clicked for contribution:', contribution._id);
        setSelectedContribution(contribution);
        setShowUploadModal(true);
    };

    const handleUpload = async (amount: number, file: File) => {
        if (selectedContribution) {
            await uploadReceipt(selectedContribution._id, amount, file);
            setShowUploadModal(false);
            setSelectedContribution(null);
        }
    };

    if (loading && contributions.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-semibold mb-2">Error Loading Contributions</p>
                    <p>{error}</p>
                    <button
                        onClick={() => fetchMyContributions()}
                        className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-primary-600" />
                        My Contributions
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track your monthly contributions to the Mahber
                    </p>
                </div>
                <button
                    onClick={() => fetchMyContributions()}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Refresh"
                >
                    <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-100">Total Paid</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {formatCurrency(stats?.totalPaid || 0)}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-100">Pending</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {formatCurrency(stats?.totalPending || 0)}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-teal-100">Months Paid</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {stats?.paidCount || 0}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-100">Pending Months</p>
                            <p className="text-3xl font-bold mt-1 text-white">
                                {stats?.pendingCount || 0}
                            </p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {stats && (stats.paidCount + stats.pendingCount) > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Payment Progress</span>
                        <span className="text-gray-600">
                            {stats.paidCount} of {stats.paidCount + stats.pendingCount} months paid
                            ({((stats.paidCount / (stats.paidCount + stats.pendingCount)) * 100).toFixed(0)}%)
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-full h-2 transition-all duration-500"
                            style={{
                                width: `${(stats.paidCount / (stats.paidCount + stats.pendingCount)) * 100}%`
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Contributions List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Contribution History</h2>
                    <span className="text-sm text-gray-500">
                        Total: {contributions.length} months
                    </span>
                </div>

                {contributions.length === 0 ? (
                    <div className="text-center py-12">
                        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No contributions found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Contributions will appear when generated by Super Admin
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contributions.map((contribution) => {
                            const statusDisplay = getStatusDisplay(contribution.status);
                            const canUploadReceipt = canUpload(contribution);
                            const hasReceipt = !!contribution.receipt;

                            return (
                                <div
                                    key={contribution._id}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 bg-white"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {getMonthName(contribution.month)} {contribution.year}
                                            </h3>
                                            <p className="text-2xl font-bold text-primary-600 mt-1">
                                                {formatCurrency(contribution.amount)}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                                            {statusDisplay.text}
                                        </span>
                                    </div>

                                    {contribution.status === 'paid' && contribution.paidDate && (
                                        <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-100">
                                            <p className="text-sm text-green-700">
                                                ✅ Paid on: {new Date(contribution.paidDate).toLocaleDateString()}
                                            </p>
                                            {contribution.verifiedBy && (
                                                <p className="text-xs text-green-600 mt-1">
                                                    Verified by: {contribution.verifiedBy.name}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {hasReceipt && (
                                        <button
                                            onClick={() => setSelectedReceipt(contribution.receipt!)}
                                            className="mb-3 text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Receipt
                                        </button>
                                    )}

                                    {/* Upload Button */}
                                    {canUploadReceipt && (
                                        <button
                                            onClick={() => handleUploadClick(contribution)}
                                            className="w-full mt-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 px-4 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg"
                                        >
                                            <FileUp className="w-5 h-5" />
                                            Upload Receipt
                                        </button>
                                    )}

                                    {/* Message for pending with receipt already uploaded */}
                                    {contribution.status === 'pending' && hasReceipt && !canUploadReceipt && (
                                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-blue-700 text-sm text-center flex items-center justify-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Receipt uploaded - Awaiting verification
                                            </p>
                                        </div>
                                    )}

                                    {/* Message for pending without receipt */}
                                    {contribution.status === 'pending' && !hasReceipt && !canUploadReceipt && (
                                        <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-amber-700 text-sm text-center flex items-center justify-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Payment pending - Upload your receipt
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upload Receipt Modal */}
            {showUploadModal && selectedContribution && (
                <UploadReceiptModal
                    contribution={selectedContribution}
                    onClose={() => {
                        setShowUploadModal(false);
                        setSelectedContribution(null);
                    }}
                    onUpload={handleUpload}
                    getMonthName={getMonthName}
                />
            )}

            {/* Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Payment Receipt</h3>
                            <button
                                onClick={() => setSelectedReceipt(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        {selectedReceipt.endsWith('.pdf') ? (
                            <iframe src={selectedReceipt} className="w-full h-[70vh]" title="Receipt" />
                        ) : (
                            <img src={selectedReceipt} alt="Receipt" className="w-full rounded-lg" />
                        )}
                        <button
                            onClick={() => setSelectedReceipt(null)}
                            className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyContributions;