import Link from 'next/link';
import { Shield, ArrowRight, MapPin, Bell, Users, Lock } from 'lucide-react';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-background to-background" />

                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="relative z-10 container mx-auto px-4 text-center">
                    {/* Logo */}
                    <div className="flex items-center justify-center mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary">
                            <Shield className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 gradient-text">
                        ABHAYA
                    </h1>
                    <p className="text-xl md:text-2xl text-foreground-muted mb-2">
                        अभय — Fearless
                    </p>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
                        Your AI-powered guardian for safe travels across India.
                        Real-time protection, instant emergency response, and peace of mind.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link
                            href="/login"
                            className="btn btn-primary text-lg px-8 py-4 gap-2"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/register"
                            className="btn btn-secondary text-lg px-8 py-4"
                        >
                            Create Account
                        </Link>
                    </div>

                    {/* Feature Icons */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        <FeatureCard
                            icon={<MapPin className="w-6 h-6" />}
                            title="Real-time Tracking"
                            description="GPS-based location monitoring"
                        />
                        <FeatureCard
                            icon={<Bell className="w-6 h-6" />}
                            title="Instant SOS"
                            description="One-tap emergency alerts"
                        />
                        <FeatureCard
                            icon={<Users className="w-6 h-6" />}
                            title="Family Connect"
                            description="Keep loved ones informed"
                        />
                        <FeatureCard
                            icon={<Lock className="w-6 h-6" />}
                            title="Secure ID"
                            description="Blockchain-verified identity"
                        />
                    </div>
                </div>

                {/* Bottom Gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
            </section>

            {/* Quick Access Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-center mb-8">Quick Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link
                            href="/tourist/dashboard"
                            className="glass-card-elevated p-8 text-center hover:border-primary transition-all group"
                        >
                            <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tourist Portal</h3>
                            <p className="text-muted-foreground">Access your safety dashboard, SOS features, and travel tools</p>
                        </Link>

                        <Link
                            href="/police/dashboard"
                            className="glass-card-elevated p-8 text-center hover:border-secondary transition-all group"
                        >
                            <div className="w-16 h-16 rounded-xl bg-secondary/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-8 h-8 text-secondary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Police Command Center</h3>
                            <p className="text-muted-foreground">Real-time monitoring, alerts, and tourist management</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-border">
                <div className="container mx-auto text-center text-muted-foreground text-sm">
                    <p>© 2025 ABHAYA - Smart Tourist Guardian System. All rights reserved.</p>
                    <p className="mt-2">Made with ❤️ for safe travels in India</p>
                </div>
            </footer>
        </main>
    );
}

function FeatureCard({
    icon,
    title,
    description
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="glass-card p-6 text-center hover:scale-105 transition-transform">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-3 text-primary">
                {icon}
            </div>
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
