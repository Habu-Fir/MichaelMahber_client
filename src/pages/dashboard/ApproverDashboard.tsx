
import { Clock, } from 'lucide-react';

const ApproverDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Approver Dashboard</h1>
            <p className="text-gray-500">Loans waiting for your approval</p>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Pending Approvals</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        All loans have been processed
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApproverDashboard;