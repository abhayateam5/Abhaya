'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function DiagnosticPage() {
    const [authUser, setAuthUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [familyTest, setFamilyTest] = useState<any>(null);
    const [panicTest, setPanicTest] = useState<any>(null);
    const [checkInTest, setCheckInTest] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function runDiagnostics() {
            // 1. Check auth status
            const { data: { user } } = await supabase.auth.getUser();
            setAuthUser(user);

            if (!user) {
                setLoading(false);
                return;
            }

            // 2. Check profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile({ data: profileData, error: profileError?.message });

            // 3. Test family_links access
            const { data: familyData, error: familyError } = await supabase
                .from('family_links')
                .select('*')
                .eq('parent_id', user.id)
                .limit(1);

            setFamilyTest({ data: familyData, error: familyError?.message });

            // 4. Test panic_words access
            const { data: panicData, error: panicError } = await supabase
                .from('panic_words')
                .select('*')
                .eq('user_id', user.id)
                .limit(1);

            setPanicTest({ data: panicData, error: panicError?.message });

            // 5. Test check_ins access
            const { data: checkInData, error: checkInError } = await supabase
                .from('check_ins')
                .select('*')
                .eq('user_id', user.id)
                .limit(1);

            setCheckInTest({ data: checkInData, error: checkInError?.message });

            setLoading(false);
        }

        runDiagnostics();
    }, []);

    if (loading) {
        return <div className="p-8">Loading diagnostics...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold">🔍 Database Diagnostic Test</h1>

                {/* Auth Status */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">1. Authentication Status</h2>
                    {authUser ? (
                        <div className="space-y-2">
                            <p className="text-green-600 font-bold">✅ LOGGED IN</p>
                            <p className="font-mono text-sm">User ID: {authUser.id}</p>
                            <p className="font-mono text-sm">Email: {authUser.email}</p>
                        </div>
                    ) : (
                        <p className="text-red-600 font-bold">❌ NOT LOGGED IN</p>
                    )}
                </div>

                {/* Profile Status */}
                {authUser && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">2. Profile Access</h2>
                        {profile?.error ? (
                            <div>
                                <p className="text-red-600 font-bold">❌ ERROR</p>
                                <p className="text-sm text-gray-600">{profile.error}</p>
                            </div>
                        ) : profile?.data ? (
                            <div className="space-y-2">
                                <p className="text-green-600 font-bold">✅ SUCCESS</p>
                                <p className="font-mono text-sm">Name: {profile.data.full_name}</p>
                                <p className="font-mono text-sm">Role: {profile.data.role}</p>
                            </div>
                        ) : (
                            <p className="text-yellow-600">⚠️ No profile found</p>
                        )}
                    </div>
                )}

                {/* Family Links Test */}
                {authUser && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">3. Family Links Table Access</h2>
                        {familyTest?.error ? (
                            <div>
                                <p className="text-red-600 font-bold">❌ PERMISSION DENIED</p>
                                <p className="text-sm text-gray-600">{familyTest.error}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    This means RLS policies for family_links are missing or incorrect
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-green-600 font-bold">✅ ACCESS GRANTED</p>
                                <p className="text-sm text-gray-600">
                                    Found {familyTest?.data?.length || 0} family links
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Panic Words Test */}
                {authUser && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">4. Panic Words Table Access</h2>
                        {panicTest?.error ? (
                            <div>
                                <p className="text-red-600 font-bold">❌ PERMISSION DENIED</p>
                                <p className="text-sm text-gray-600">{panicTest.error}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    This means RLS policies for panic_words are missing or incorrect
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-green-600 font-bold">✅ ACCESS GRANTED</p>
                                <p className="text-sm text-gray-600">
                                    Found {panicTest?.data?.length || 0} panic words
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Check-ins Test */}
                {authUser && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">5. Check-ins Table Access</h2>
                        {checkInTest?.error ? (
                            <div>
                                <p className="text-red-600 font-bold">❌ PERMISSION DENIED</p>
                                <p className="text-sm text-gray-600">{checkInTest.error}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    This means RLS policies for check_ins are missing or incorrect
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-green-600 font-bold">✅ ACCESS GRANTED</p>
                                <p className="text-sm text-gray-600">
                                    Found {checkInTest?.data?.length || 0} check-ins
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-2">📋 What This Tells Us:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                        <li>If you see "PERMISSION DENIED" errors, the RLS policies haven't been created yet</li>
                        <li>If you see "ACCESS GRANTED" for all tables, the policies are working!</li>
                        <li>If you're not logged in, go to <a href="/login" className="underline">/login</a> first</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
