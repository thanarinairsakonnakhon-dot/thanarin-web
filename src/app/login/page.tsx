"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { sendEmailOTP, verifyOTP, user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/products';

    useEffect(() => {
        if (user) {
            router.push(redirect);
        }
    }, [user, router, redirect]);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email.includes('@')) {
            setError('กรุณากรอกอีเมลให้ถูกต้อง');
            setLoading(false);
            return;
        }

        const result = await sendEmailOTP(email);
        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setStep(2);
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (otp.length !== 6) {
            setError('กรุณากรอกรหัส OTP 6 หลัก');
            setLoading(false);
            return;
        }

        const result = await verifyOTP(email, otp, 'email');
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
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>เข้าสู่ระบบ</h1>
                <p style={{ color: '#64748b' }}>{step === 1 ? 'ยินดีต้อนรับกลับสู่ ธนรินทร์แอร์' : 'กรุณากรอกรหัส 6 หลักที่ส่งไปยังอีเมล ' + email}</p>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {step === 1 ? (
                <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

                    <button
                        disabled={loading}
                        type="submit"
                        className="btn-wow"
                        style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'กำลังส่ง OTP...' : 'ส่งรหัสยืนยันไปที่อีเมล'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}>รหัสยืนยัน 6 หลัก</label>
                        <input
                            required
                            type="text"
                            maxLength={6}
                            placeholder="• • • • • •"
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid var(--color-primary-blue)',
                                textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: 700
                            }}
                            value={otp}
                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                            autoFocus
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="btn-wow"
                        style={{ width: '100%', padding: '0.8rem', opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setStep(1)}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                        ← เปลี่ยนอีเมล
                    </button>
                </form>
            )}

            <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: '#cbd5e1' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                <span style={{ padding: '0 1rem', fontSize: '0.8rem', color: '#94a3b8' }}>หรือดำเนินการต่อด้วย</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            <button
                type="button"
                onClick={() => loginWithGoogle()}
                style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#334155',
                    transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={e => e.currentTarget.style.background = 'white'}
            >
                <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '18px', height: '18px' }} />
                เข้าสู่ระบบด้วย Gmail
            </button>

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
