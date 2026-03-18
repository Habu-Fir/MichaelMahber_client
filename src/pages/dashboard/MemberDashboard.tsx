
import { HandCoins, History } from 'lucide-react';

const MemberDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's your loan summary</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <HandCoins className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Loans</p>
                            <p className="text-2xl font-bold text-gray-900">2</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Total outstanding: 45,000 ETB</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <History className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Contributions</p>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">Total paid: 12,000 ETB</p>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;