"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Auth error:', error.message);
                router.push('/login?error=' + encodeURIComponent(error.message));
            } else if (session?.user) {
                const user = session.user;
                // Sync profile data from Google metadata
                const { error: profileError } = await supabase.from('profiles').upsert([{
                    id: user.id,
                    full_name: user.user_metadata.full_name || user.user_metadata.name || 'User',
                    email: user.email,
                    updated_at: new Date().toISOString()
                }]);

                if (profileError) {
                    console.error('Profile sync error:', profileError);
                }

                router.push('/products');
            } else {
                router.push('/login');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 2s linear infinite', margin: '0 auto 1rem' }}></div>
                <p style={{ color: '#64748b' }}>กำลังเข้าสู่ระบบ...</p>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
