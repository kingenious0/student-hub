// src/app/runner/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface DeliveryRequest {
    id: string;
    product: {
        title: string;
    };
    amount: number;
    pickupLocation: string;
    deliveryLocation: string;
    estimatedEarnings: number;
    estimatedXP: number;
    distance: string;
}

export default function RunnerModePage() {
    const { user } = useUser();
    const [isRunnerMode, setIsRunnerMode] = useState(false);
    const [runnerStats, setRunnerStats] = useState({
        xp: 0,
        level: 1,
        totalEarnings: 0,
        completedDeliveries: 0,
        badges: [] as string[],
    });
    const [availableDeliveries, setAvailableDeliveries] = useState<DeliveryRequest[]>([]);

    useEffect(() => {
        // TODO: Fetch runner stats from API
        // For now, mock data
        setRunnerStats({
            xp: 0,
            level: 1,
            totalEarnings: 0,
            completedDeliveries: 0,
            badges: [],
        });
    }, []);

    const toggleRunnerMode = () => {
        setIsRunnerMode(!isRunnerMode);
        // TODO: Update user's runner status in database
    };

    const getLevelProgress = () => {
        const xpForNextLevel = runnerStats.level * 100;
        return (runnerStats.xp / xpForNextLevel) * 100;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        🏃 Runner Mode
                    </h1>
                    <p className="text-purple-200">
                        Earn money delivering orders around campus
                    </p>
                </div>

                {/* Runner Mode Toggle */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {isRunnerMode ? '🟢 You\'re Online' : '⚫ You\'re Offline'}
                            </h2>
                            <p className="text-purple-200">
                                {isRunnerMode
                                    ? 'Looking for delivery requests nearby...'
                                    : 'Toggle on to start accepting deliveries'}
                            </p>
                        </div>
                        <button
                            onClick={toggleRunnerMode}
                            className={`relative inline-flex h-14 w-28 items-center rounded-full transition-colors ${isRunnerMode ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-10 w-10 transform rounded-full bg-white transition-transform ${isRunnerMode ? 'translate-x-16' : 'translate-x-2'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                        <div className="text-purple-300 text-sm mb-1">Level</div>
                        <div className="text-3xl font-bold text-white">{runnerStats.level}</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                        <div className="text-purple-300 text-sm mb-1">XP</div>
                        <div className="text-3xl font-bold text-white">{runnerStats.xp}</div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                        <div className="text-purple-300 text-sm mb-1">Earnings</div>
                        <div className="text-2xl font-bold text-green-400">
                            GH₵{runnerStats.totalEarnings.toFixed(2)}
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4">
                        <div className="text-purple-300 text-sm mb-1">Deliveries</div>
                        <div className="text-3xl font-bold text-white">{runnerStats.completedDeliveries}</div>
                    </div>
                </div>

                {/* Level Progress */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">
                            Progress to Level {runnerStats.level + 1}
                        </h3>
                        <span className="text-sm text-purple-300">
                            {runnerStats.xp} / {runnerStats.level * 100} XP
                        </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-full transition-all duration-500"
                            style={{ width: `${getLevelProgress()}%` }}
                        />
                    </div>
                </div>

                {/* Badges */}
                {runnerStats.badges.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-8">
                        <h3 className="text-xl font-bold text-white mb-4">🏆 Your Badges</h3>
                        <div className="flex flex-wrap gap-3">
                            {runnerStats.badges.map((badge, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 font-semibold"
                                >
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Available Deliveries */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        {isRunnerMode ? '📍 Nearby Deliveries' : '⚫ Go Online to See Deliveries'}
                    </h2>

                    {!isRunnerMode ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🏃</div>
                            <p className="text-purple-200 text-lg mb-4">
                                Toggle Runner Mode on to start seeing delivery requests
                            </p>
                            <button
                                onClick={toggleRunnerMode}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all"
                            >
                                Go Online
                            </button>
                        </div>
                    ) : availableDeliveries.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-purple-200 text-lg">
                                No deliveries available right now
                            </p>
                            <p className="text-purple-300 text-sm mt-2">
                                We'll notify you when new delivery requests come in
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableDeliveries.map((delivery) => (
                                <div
                                    key={delivery.id}
                                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">
                                                {delivery.product.title}
                                            </h3>
                                            <p className="text-sm text-purple-300">
                                                📍 {delivery.pickupLocation} → {delivery.deliveryLocation}
                                            </p>
                                            <p className="text-sm text-purple-300">
                                                🚶 ~{delivery.distance}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-green-400">
                                                +GH₵{delivery.estimatedEarnings.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-purple-300">
                                                +{delivery.estimatedXP} XP
                                            </div>
                                        </div>
                                    </div>
                                    <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all">
                                        Accept Delivery
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* How It Works */}
                <div className="mt-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        💡 How Runner Mode Works
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-3xl mb-2">1️⃣</div>
                            <h4 className="font-bold text-white mb-1">Go Online</h4>
                            <p className="text-sm text-purple-200">
                                Toggle Runner Mode to start seeing delivery requests near you
                            </p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">2️⃣</div>
                            <h4 className="font-bold text-white mb-1">Accept & Deliver</h4>
                            <p className="text-sm text-purple-200">
                                Pick up the order and deliver it to the student
                            </p>
                        </div>
                        <div>
                            <div className="text-3xl mb-2">3️⃣</div>
                            <h4 className="font-bold text-white mb-1">Earn & Level Up</h4>
                            <p className="text-sm text-purple-200">
                                Get paid instantly and earn XP to unlock higher earnings
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
