import React, { useRef, useState } from 'react';
import type { Contribution } from '../../types/contribution.types';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface UploadReceiptModalProps {
    contribution: Contribution;
    onClose: () => void;
    onUpload: (amount: number, file: File) => Promise<void>;
    getMonthName?: (month: number) => string;
}

const UploadReceiptModal: React.FC<UploadReceiptModalProps> = ({
    contribution,
    onClose,
    onUpload,
    getMonthName = (month) => new Date(2024, month - 1).toLocaleString('default', { month: 'long' })
}) => {
    const [amount, setAmount] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const validateAndSetFile = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Only JPEG, PNG, and PDF files are allowed');
            setSelectedFile(null);
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError('File size must be less than 5MB');
            setSelectedFile(null);
            return;
        }

        setError(null);
        setSelectedFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || amount <= 0) {
            setError('Please enter a valid contribution amount');
            return;
        }

        if (!selectedFile) {
            setError('Please select a receipt file');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            await onUpload(amount, selectedFile);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to upload receipt');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Upload Contribution</h2>
                            <p className="text-sm text-gray-500">
                                {getMonthName(contribution.month)} {contribution.year}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Amount Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contribution Amount (ETB) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">ETB</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value))}
                                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                placeholder="0.00"
                                min="1"
                                step="100"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Enter the amount you are contributing
                        </p>
                    </div>

                    {/* File Upload Area */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragActive ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-400'
                            }`}
                        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) validateAndSetFile(file);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileSelect} className="hidden" />

                        {selectedFile ? (
                            <div className="text-center">
                                <FileText className="w-12 h-12 text-green-500 mx-auto mb-2" />
                                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-600">Click or drag file to upload</p>
                                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or PDF (max 5MB)</p>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || !amount || !selectedFile}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-2 rounded-lg hover:from-amber-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                            ) : (
                                <><Upload className="w-4 h-4" /> Upload Receipt</>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-xs text-gray-400 text-center mt-4">
                    After uploading, your contribution will be verified by Super Admin
                </p>
            </div>
        </div>
    );
};

export default UploadReceiptModal;