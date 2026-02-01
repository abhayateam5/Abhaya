'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Shield, ArrowRight, MapPin, Bell, Users, Lock } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-background to-background" />

        {/* Glow */}
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
              href="/auth/login"
              className="btn btn-primary text-lg px-8 py-4 gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/auth/signup"
              className="btn btn-secondary text-lg px-8 py-4"
            >
              Create Account
            </Link>
            <LogoutButton />
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

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
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
