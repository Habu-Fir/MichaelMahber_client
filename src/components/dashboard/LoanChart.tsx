import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
interface LoanChartProps {
    data: Array<{ month: string; loans: number; contributions: number }>;
}

interface LoanPieChartProps {
    data: Array<{ name: string; value: number; color: string }>;
}

const COLORS = ['#0d9488', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

export const LoanTrendChart: React.FC<LoanChartProps> = ({ data }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Loan & Contribution Trends</h3>
            <div className="h-75 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: any) => {
                                if (value === undefined || value === null) return ['0 ETB', ''];
                                const numValue = typeof value === 'string' ? parseFloat(value) : value;
                                return [`${numValue.toLocaleString()} ETB`, ''];
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="loans"
                            stroke="#0d9488"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorLoans)"
                            name="Loans"
                        />
                        <Area
                            type="monotone"
                            dataKey="contributions"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorContributions)"
                            name="Contributions"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const LoanStatusPie: React.FC<LoanPieChartProps> = ({ data }) => {
    // Custom label renderer that safely handles percent
    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        // Safely handle percent
        const percentage = percent ? (percent * 100).toFixed(0) : '0';

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${percentage}%`}
            </text>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Loan Distribution</h3>
            <div className="h-62.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            labelLine={false}
                            label={renderCustomizedLabel}
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                padding: '12px'
                            }}
                            formatter={(value: any) => [`${Number(value || 0).toLocaleString()} ETB`, '']}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {data.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-gray-600">{item.name}</span>
                        <span className="text-xs font-medium text-gray-900 ml-auto">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};