"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/products';

    useEffect(() => {
        if (user) {
            router.push(redirect);
        }
    }, [user, router, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(email, password);
        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push(redirect);
        }
    };

    return (
        <div className="card-glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>เข้าสู่ระบบลูกค้า</h1>
                <p style={{ color: '#64748b' }}>ยินดีต้อนรับกลับสู่ ธนรินทร์แอร์</p>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                    {error === 'Invalid login credentials' ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>อีเมล</label>
                    <input
                        required
                        type="email"
                        placeholder="name@example.com"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>รหัสผ่าน</label>
                        <Link href="/reset-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary-blue)', textDecoration: 'none' }}>ลืมรหัสผ่าน?</Link>
                    </div>
                    <input
                        required
                        type="password"
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="btn-wow"
                    style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                ยังไม่มีบัญชี? <Link href="/signup" style={{ color: 'var(--color-primary-blue)', fontWeight: 600, textDecoration: 'none' }}>สมัครสมาชิกใหม่</Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                <Suspense fallback={
                    <div className="card-glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'center' }}>
                        <p style={{ color: '#64748b' }}>กำลังโหลด...</p>
                    </div>
                }>
                    <LoginForm />
                </Suspense>
            </div>

            <Footer />
        </main>
    );
}
