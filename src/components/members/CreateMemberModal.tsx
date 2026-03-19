import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Shield, } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface CreateMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
}

const CreateMemberModal: React.FC<CreateMemberModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting
}) => {
    const { isSuperAdmin } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        role: 'member' as const
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone format';

        if (!formData.address.trim()) newErrors.address = 'Address is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg animate-slide-in">

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Create New Member</h2>
                                <p className="text-sm text-gray-500">Add a new member to the Mahber</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={cn(
                                        "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                        errors.name
                                            ? 'border-red-300 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-200'
                                    )}
                                    placeholder="Enter full name"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={cn(
                                        "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                        errors.email
                                            ? 'border-red-300 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-200'
                                    )}
                                    placeholder="email@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className={cn(
                                        "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                        errors.phone
                                            ? 'border-red-300 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-200'
                                    )}
                                    placeholder="+251 912 345 678"
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className={cn(
                                        "w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all",
                                        errors.address
                                            ? 'border-red-300 focus:ring-red-200'
                                            : 'border-gray-200 focus:ring-primary-200'
                                    )}
                                    placeholder="Enter address"
                                />
                            </div>
                            {errors.address && (
                                <p className="text-sm text-red-600">{errors.address}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Member Role <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 appearance-none bg-white"
                                >
                                    <option value="member">Member</option>
                                    <option value="approver">Approver</option>
                                    {isSuperAdmin && <option value="admin">Admin</option>}
                                </select>
                            </div>
                        </div>

                        {/* Info about temporary password */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-sm text-amber-800">
                                <span className="font-medium">Note:</span> A temporary password will be automatically generated and shown after creation.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-3 bg-linear-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Member'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateMemberModal;