'use client';

import { useState, useEffect } from 'react';
import {
    Gift,
    Star,
    Trophy,
    Zap,
    ChevronRight,
    CheckCircle,
    Lock,
    Coins,
    ShoppingBag,
    Coffee,
    Ticket,
    Car,
} from 'lucide-react';
import { Card, CardContent, Button, Badge, Modal } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SafetyRewardsProps {
    isOpen: boolean;
    onClose: () => void;
    safetyScore?: number;
}

interface Reward {
    id: string;
    name: string;
    description: string;
    points: number;
    category: string;
    icon: React.ElementType;
    isUnlocked: boolean;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    isCompleted: boolean;
    progress: number;
    maxProgress: number;
}

const REWARDS: Reward[] = [
    { id: '1', name: 'Free Chai', description: 'Redeem at any partner cafe', points: 100, category: 'food', icon: Coffee, isUnlocked: true },
    { id: '2', name: '10% Taxi Discount', description: 'Valid for one ride', points: 200, category: 'transport', icon: Car, isUnlocked: true },
    { id: '3', name: 'Museum Entry', description: 'Free entry to partner museums', points: 500, category: 'experience', icon: Ticket, isUnlocked: false },
    { id: '4', name: 'Shopping Voucher', description: '₹100 off at partner stores', points: 300, category: 'shopping', icon: ShoppingBag, isUnlocked: false },
];

const ACHIEVEMENTS: Achievement[] = [
    { id: '1', name: 'First Check-in', description: 'Complete your first itinerary check-in', icon: '📍', isCompleted: true, progress: 1, maxProgress: 1 },
    { id: '2', name: 'Safety Star', description: 'Maintain 80+ safety score for 3 days', icon: '⭐', isCompleted: true, progress: 3, maxProgress: 3 },
    { id: '3', name: 'Explorer', description: 'Visit 5 different locations', icon: '🗺️', isCompleted: false, progress: 3, maxProgress: 5 },
    { id: '4', name: 'Community Hero', description: 'Report 3 hazards', icon: '🦸', isCompleted: false, progress: 1, maxProgress: 3 },
    { id: '5', name: 'Family First', description: 'Add 2 family members', icon: '👨‍👩‍👧', isCompleted: false, progress: 0, maxProgress: 2 },
];

export function SafetyRewards({ isOpen, onClose, safetyScore = 75 }: SafetyRewardsProps) {
    const [points, setPoints] = useState(350);
    const [streakDays, setStreakDays] = useState(5);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [showRedeemModal, setShowRedeemModal] = useState(false);

    const handleRedeem = (reward: Reward) => {
        if (points >= reward.points && reward.isUnlocked) {
            setSelectedReward(reward);
            setShowRedeemModal(true);
        }
    };

    const confirmRedeem = () => {
        if (selectedReward) {
            setPoints(prev => prev - selectedReward.points);
            setShowRedeemModal(false);
            setSelectedReward(null);
            // Show success toast
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 bg-background flex flex-col">
                {/* Header */}
                <header className="px-4 py-4 border-b border-border flex items-center gap-3">
                    <button onClick={onClose} className="text-muted-foreground">←</button>
                    <div className="flex-1">
                        <h2 className="font-bold">Safety Rewards</h2>
                        <p className="text-xs text-muted-foreground">Earn points for staying safe</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-warning/20 rounded-full">
                        <Coins className="w-4 h-4 text-warning" />
                        <span className="font-bold text-warning">{points}</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card variant="glass">
                            <CardContent className="p-3 text-center">
                                <Zap className="w-6 h-6 text-warning mx-auto mb-1" />
                                <p className="text-lg font-bold">{streakDays}</p>
                                <p className="text-xs text-muted-foreground">Day Streak</p>
                            </CardContent>
                        </Card>
                        <Card variant="glass">
                            <CardContent className="p-3 text-center">
                                <Star className="w-6 h-6 text-primary mx-auto mb-1" />
                                <p className="text-lg font-bold">{safetyScore}</p>
                                <p className="text-xs text-muted-foreground">Safety Score</p>
                            </CardContent>
                        </Card>
                        <Card variant="glass">
                            <CardContent className="p-3 text-center">
                                <Trophy className="w-6 h-6 text-success mx-auto mb-1" />
                                <p className="text-lg font-bold">{ACHIEVEMENTS.filter(a => a.isCompleted).length}</p>
                                <p className="text-xs text-muted-foreground">Achievements</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Daily Bonus */}
                    <Card variant="elevated" className="bg-gradient-to-r from-primary/20 to-secondary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold">Daily Safety Bonus</h3>
                                    <p className="text-sm text-muted-foreground">Keep your score above 70 to earn</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-success">+25</p>
                                    <p className="text-xs text-muted-foreground">points/day</p>
                                </div>
                            </div>
                            <div className="mt-3 flex gap-1">
                                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                    <div
                                        key={day}
                                        className={cn(
                                            'flex-1 h-2 rounded-full',
                                            day <= streakDays ? 'bg-success' : 'bg-background-muted'
                                        )}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Trophy className="w-5 h-5" /> Achievements
                        </h3>
                        <div className="space-y-2">
                            {ACHIEVEMENTS.map((achievement) => (
                                <Card key={achievement.id} variant="glass">
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
                                                achievement.isCompleted ? 'bg-success/20' : 'bg-background-muted'
                                            )}>
                                                {achievement.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{achievement.name}</span>
                                                    {achievement.isCompleted && (
                                                        <CheckCircle className="w-4 h-4 text-success" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                                {!achievement.isCompleted && (
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex-1 h-1.5 bg-background-muted rounded-full">
                                                            <div
                                                                className="h-full bg-primary rounded-full"
                                                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {achievement.progress}/{achievement.maxProgress}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Rewards */}
                    <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Gift className="w-5 h-5" /> Redeem Rewards
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {REWARDS.map((reward) => (
                                <Card
                                    key={reward.id}
                                    variant="glass"
                                    className={cn(!reward.isUnlocked && 'opacity-60')}
                                >
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className={cn(
                                                'p-2 rounded-lg',
                                                reward.isUnlocked ? 'bg-primary/20' : 'bg-muted'
                                            )}>
                                                {reward.isUnlocked ? (
                                                    <reward.icon className="w-5 h-5 text-primary" />
                                                ) : (
                                                    <Lock className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <Badge variant={reward.isUnlocked ? 'warning' : 'secondary'}>
                                                {reward.points} pts
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium text-sm">{reward.name}</h4>
                                        <p className="text-xs text-muted-foreground">{reward.description}</p>
                                        <Button
                                            size="sm"
                                            variant={reward.isUnlocked && points >= reward.points ? 'default' : 'secondary'}
                                            className="w-full mt-2"
                                            disabled={!reward.isUnlocked || points < reward.points}
                                            onClick={() => handleRedeem(reward)}
                                        >
                                            {reward.isUnlocked ? 'Redeem' : 'Locked'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Redeem Confirmation Modal */}
            <Modal open={showRedeemModal} onOpenChange={setShowRedeemModal}>
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Redeem Reward?</h3>
                    <p className="text-muted-foreground mb-4">
                        Use <span className="font-bold text-warning">{selectedReward?.points} points</span> to redeem{' '}
                        <span className="font-bold">{selectedReward?.name}</span>?
                    </p>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={() => setShowRedeemModal(false)}>
                            Cancel
                        </Button>
                        <Button className="flex-1" onClick={confirmRedeem}>
                            Confirm
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default SafetyRewards;
