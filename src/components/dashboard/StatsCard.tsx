import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: 'primary' | 'green' | 'amber' | 'purple' | 'blue';
    onClick?: () => void;
}

const colorClasses = {
    primary: {
        bg: 'bg-primary-50',
        text: 'text-primary-600',
        iconBg: 'bg-primary-100',
        iconColor: 'text-primary-600',
        border: 'border-primary-200'
    },
    green: {
        bg: 'bg-green-50',
        text: 'text-green-600',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        border: 'border-green-200'
    },
    amber: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
        border: 'border-amber-200'
    },
    purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        border: 'border-purple-200'
    },
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        border: 'border-blue-200'
    }
};

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon: Icon,
    trend,
    color = 'primary',
    onClick
}) => {
    const classes = colorClasses[color];

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white rounded-2xl shadow-sm border border-gray-200 p-6",
                "hover:shadow-md transition-all duration-200",
                onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            )}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>

                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <span className={cn(
                                "text-xs font-medium",
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}>
                                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                            </span>
                            <span className="text-xs text-gray-500">vs last month</span>
                        </div>
                    )}
                </div>

                <div className={cn("p-3 rounded-xl", classes.iconBg)}>
                    <Icon className={cn("w-6 h-6", classes.iconColor)} />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;