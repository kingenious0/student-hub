
'use client';

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';

interface AnalyticsChartsProps {
    salesData: { name: string; total: number }[];
    productData: { name: string; sales: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface border border-surface-border p-3 rounded-xl shadow-xl">
                <p className="font-bold text-foreground text-xs">{label}</p>
                <p className="text-primary font-black text-sm">
                    {payload[0].name === 'sales' ? '' : 'Revenue: '}
                    {payload[0].name === 'sales' ? `${payload[0]!.value} sold` : `₵${payload[0]!.value}`}
                </p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsCharts({ salesData, productData }: AnalyticsChartsProps) {
    if (!salesData || !productData) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Revenue Chart - Enhanced with Neon Glow */}
            <div className="glass border-2 border-green-500/20 rounded-[2rem] p-6 relative overflow-hidden group hover:border-green-500/40 transition-all">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-0 right-0 p-4 opacity-40 font-black text-6xl text-primary">GH₵</div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse omni-glow"></span>
                    <span className="gradient-text">Live Revenue Trend</span>
                </h3>
                <div className="h-[250px] w-full chart-glow relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                                <filter id="neonGlow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#888', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#22c55e"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                filter="url(#neonGlow)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-surface/50 border border-surface-border rounded-[2rem] p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-40 font-black text-6xl text-purple-500">TOP</div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                    Best Selling product
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#fff', fontSize: 10, fontWeight: 700 }}
                            />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
                            <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                                {productData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#a855f7' : '#ec4899'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
