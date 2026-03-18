import React from 'react';
import {
    HandCoins,
    CheckCircle,
    UserPlus,
    Clock,
    ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Activity {
    id: string;
    type: 'loan_request' | 'payment' | 'member_joined' | 'loan_approved';
    description: string;
    amount?: number;
    user: string;
    time: string;
    status?: string;
}

interface RecentActivityProps {
    activities: Activity[];
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'loan_request':
            return <HandCoins className="w-4 h-4 text-primary-600" />;
        case 'payment':
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'member_joined':
            return <UserPlus className="w-4 h-4 text-purple-600" />;
        default:
            return <Clock className="w-4 h-4 text-amber-600" />;
    }
};

const getActivityBg = (type: string) => {
    switch (type) {
        case 'loan_request':
            return 'bg-primary-100';
        case 'payment':
            return 'bg-green-100';
        case 'member_joined':
            return 'bg-purple-100';
        default:
            return 'bg-amber-100';
    }
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>

            <div className="divide-y divide-gray-100">
                {activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                getActivityBg(activity.type)
                            )}>
                                {getActivityIcon(activity.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                    {activity.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span>{activity.user}</span>
                                    <span>•</span>
                                    <span>{activity.time}</span>
                                </div>
                            </div>

                            {/* Amount if present */}
                            {activity.amount && (
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {activity.amount.toLocaleString()} ETB
                                    </p>
                                    {activity.status && (
                                        <span className={cn(
                                            "text-xs px-2 py-0.5 rounded-full",
                                            activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                        )}>
                                            {activity.status}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200">
                <button className="flex items-center justify-center gap-2 text-sm text-primary-600 font-medium w-full hover:text-primary-700 transition-colors">
                    View All Activity
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default RecentActivity;