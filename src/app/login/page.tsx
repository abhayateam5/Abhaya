'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Use Supabase Auth
            const { signIn } = await import('@/lib/auth');
            const { user, error: authError } = await signIn({ email, password });

            if (authError) {
                setError(authError.message || 'Invalid email or password');
                return;
            }

            if (user) {
                // Check if profile is complete
                const profileResponse = await fetch('/api/profile/complete');
                const profileData = await profileResponse.json();

                if (!profileData.complete) {
                    router.push('/onboarding');
                } else {
                    // Redirect based on role
                    const res = await fetch('/api/profile');
                    const data = await res.json();

                    if (data.data?.role === 'police') {
                        router.push('/police/dashboard');
                    } else {
                        router.push('/tourist/dashboard');
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async (role: 'tourist' | 'police') => {
        const email = role === 'police' ? 'police@abhaya.app' : 'demo@abhaya.app';
        setEmail(email);
        setPassword('demo123');

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'demo123' }),
            });

            const data = await res.json();

            if (data.success) {
                router.push(role === 'police' ? '/police/dashboard' : '/tourist/dashboard');
            }
        } catch (err) {
            setError('Demo login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">ABHAYA</span>
                    </Link>
                    <p className="text-muted-foreground mt-2">Welcome back, stay safe</p>
                </div>

                {/* Login Form */}
                <div className="glass-card-elevated p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail className="w-5 h-5" />}
                            required
                        />

                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                icon={<Lock className="w-5 h-5" />}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign In
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-background-soft text-muted-foreground">Or try demo</span>
                        </div>
                    </div>

                    {/* Demo Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleDemoLogin('tourist')}
                            disabled={isLoading}
                        >
                            Tourist Demo
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleDemoLogin('police')}
                            disabled={isLoading}
                        >
                            Police Demo
                        </Button>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
