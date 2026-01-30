'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Mail, Lock, User, Phone, Globe, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        nationality: 'India',
        role: 'tourist',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const nationalities = [
        { value: 'India', label: 'India' },
        { value: 'USA', label: 'United States' },
        { value: 'UK', label: 'United Kingdom' },
        { value: 'Germany', label: 'Germany' },
        { value: 'France', label: 'France' },
        { value: 'Australia', label: 'Australia' },
        { value: 'Canada', label: 'Canada' },
        { value: 'Japan', label: 'Japan' },
        { value: 'Other', label: 'Other' },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    nationality: formData.nationality,
                    role: formData.role,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Registration failed');
                return;
            }

            // Redirect to dashboard
            router.push('/tourist/dashboard');
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold gradient-text">ABHAYA</span>
                    </Link>
                    <p className="text-muted-foreground mt-2">Create your safety account</p>
                </div>

                {/* Register Form */}
                <div className="glass-card-elevated p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            type="text"
                            name="name"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            icon={<User className="w-5 h-5" />}
                            required
                        />

                        <Input
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            icon={<Mail className="w-5 h-5" />}
                            required
                        />

                        <Input
                            type="tel"
                            name="phone"
                            label="Phone Number"
                            placeholder="+91 XXXXX XXXXX"
                            value={formData.phone}
                            onChange={handleChange}
                            icon={<Phone className="w-5 h-5" />}
                            required
                        />

                        <Select
                            name="nationality"
                            label="Nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            options={nationalities}
                        />

                        <div className="relative">
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                label="Password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
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

                        <Input
                            type={showPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            icon={<Lock className="w-5 h-5" />}
                            required
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Create Account
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
