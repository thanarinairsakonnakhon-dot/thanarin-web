"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Info, 2: OTP

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { sendEmailOTP, verifyOTP } = useAuth();
    const router = useRouter();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email.includes('@')) {
            setError('กรุณากรอกอีเมลให้ถูกต้อง');
            return;
        }

        if (!name) {
            setError('กรุณากรอกชื่อ-นามสกุล');
            return;
        }

        setLoading(true);
        const { error } = await sendEmailOTP(email);

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            setStep(2);
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (otp.length !== 6) {
            setError('กรุณากรอกรหัส OTP 6 หลัก');
            return;
        }

        setLoading(true);
        const { error } = await verifyOTP(email, otp, 'email');

        if (error) {
            setError(error);
            setLoading(false);
        } else {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { error: profileError } = await supabase.from('profiles').upsert([{
                    id: user.id,
                    full_name: name,
                    email: email,
                    updated_at: new Date().toISOString()
                }]);

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                }
            }

            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
                <Navbar />
                <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                    <div className="card-glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>✅</div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', color: '#0F172A' }}>ยินดีต้อนรับสมาชิกใหม่</h1>
                        <p style={{ color: '#475569', marginBottom: '2.5rem', lineHeight: 1.8, fontSize: '1rem' }}>
                            การยืนยันตัวตนผ่านอีเมลเสร็จสมบูรณ์แล้วครับ คุณ <span style={{ fontWeight: 600 }}>{name}</span><br /><br />
                            ท่านสามารถเริ่มต้นใช้บริการจองคิวและเลือกซื้อสินค้าแอร์คุณภาพจากเราได้ทันที<br />
                            <strong>ขอขอบพระคุณที่ให้ความไว้วางใจ ธนรินทร์แอร์</strong>
                        </p>
                        <Link href="/" className="btn-wow" style={{ display: 'inline-block', padding: '0.8rem 2rem', textDecoration: 'none' }}>
                            เริ่มต้นใช้งาน
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                <div className="card-glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>สมัครสมาชิก</h1>
                        <p style={{ color: '#64748b' }}>{step === 1 ? 'ร่วมเป็นส่วนหนึ่งของ ธนรินทร์แอร์' : 'กรุณากรอกรหัส 6 หลักที่ส่งไปยังอีเมล ' + email}</p>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    placeholder="คุณ ธนรินทร์"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>อีเมล <span className="text-red-500">*</span></label>
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
                                style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? 'กำลังส่ง OTP...' : 'ส่งรหัสยืนยันไปยังอีเมล'}
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
                                {loading ? 'กำลังยืนยัน...' : 'ยืนยันและสมัครสมาชิก'}
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

                    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        มีบัญชีอยู่แล้ว? <Link href="/login" style={{ color: 'var(--color-primary-blue)', fontWeight: 600, textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
