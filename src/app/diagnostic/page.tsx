'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticPage() {
    const [diagnostics, setDiagnostics] = useState<any>({});

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        setDiagnostics({
            hasUrl: !!url,
            hasKey: !!key,
            urlLength: url?.length || 0,
            keyLength: key?.length || 0,
            urlPreview: url?.substring(0, 30) + '...',
            keyPreview: key?.substring(0, 20) + '...',
        });
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-2xl font-bold mb-4">Supabase Diagnostics</h1>

            <div className="space-y-2 font-mono text-sm">
                <div>Has URL: {diagnostics.hasUrl ? '✅' : '❌'}</div>
                <div>Has Key: {diagnostics.hasKey ? '✅' : '❌'}</div>
                <div>URL Length: {diagnostics.urlLength}</div>
                <div>Key Length: {diagnostics.keyLength}</div>
                <div>URL Preview: {diagnostics.urlPreview}</div>
                <div>Key Preview: {diagnostics.keyPreview}</div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl mb-2">Expected Values:</h2>
                <div className="text-sm text-gray-400">
                    <div>URL Length: ~40 characters</div>
                    <div>Key Length: ~300+ characters</div>
                    <div>URL should start with: https://</div>
                    <div>Key should start with: eyJ</div>
                </div>
            </div>
        </div>
    );
}
