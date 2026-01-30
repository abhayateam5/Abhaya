import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'ABHAYA - Smart Tourist Guardian System',
    description: 'AI-powered tourist safety ecosystem for India. Real-time protection, emergency response, and peace of mind for travelers.',
    keywords: ['tourist safety', 'India travel', 'emergency response', 'SOS', 'travel security'],
    authors: [{ name: 'ABHAYA Team' }],
    creator: 'ABHAYA Team',
    publisher: 'ABHAYA',
    robots: 'index, follow',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://abhaya.app',
        siteName: 'ABHAYA',
        title: 'ABHAYA - Smart Tourist Guardian System',
        description: 'AI-powered tourist safety ecosystem for India',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ABHAYA - Smart Tourist Guardian System',
        description: 'AI-powered tourist safety ecosystem for India',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#020617',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className={`${inter.variable} font-sans antialiased`}>
                <div id="root" className="min-h-screen">
                    {children}
                </div>
                <div id="modal-root" />
                <div id="toast-root" />
            </body>
        </html>
    );
}
