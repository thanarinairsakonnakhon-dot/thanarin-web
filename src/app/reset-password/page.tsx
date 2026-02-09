"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Is this the "Update Password" phase? (after clicking link in email)
    const [isUpdatePhase, setIsUpdatePhase] = useState(false);

    const { resetPassword, updatePassword } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Supabase sends back to this page with a recovery hash or similar
        // We can check if we are in the update phase
        if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
            setIsUpdatePhase(true);
        }
    }, []);

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await resetPassword(email);
        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        setLoading(true);
        const result = await updatePassword(password);
        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            alert('อัปเดตรหัสผ่านใหม่เรียบร้อยแล้ว');
            router.push('/login');
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                <div className="card-glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                            {isUpdatePhase ? 'ตั้งรหัสผ่านใหม่' : 'ลืมรหัสผ่าน'}
                        </h1>
                        <p style={{ color: '#64748b' }}>
                            {isUpdatePhase ? 'ระบุรหัสผ่านใหม่ที่คุณต้องการใช้งาน' : 'ระบุอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน'}
                        </p>
                    </div>

                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ background: '#f0fdf4', color: '#22c55e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                ✅ ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ {email} เรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณครับ
                            </div>
                            <Link href="/login" style={{ color: 'var(--color-primary-blue)', fontWeight: 600, textDecoration: 'none' }}>
                                กลับหน้าเข้าสู่ระบบ
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                            {isUpdatePhase ? (
                                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>รหัสผ่านใหม่</label>
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>ยืนยันรหัสผ่านใหม่</label>
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className="btn-wow"
                                        style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
                                    >
                                        {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>อีเมลที่ลงทะเบียนไว้</label>
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
                                        {loading ? 'กำลังดำเนินการ...' : 'ขอลิงก์รีเซ็ตรหัสผ่าน'}
                                    </button>
                                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                        <Link href="/login" style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'none' }}>ยกเลิกและกลับไปหน้าเข้าสู่ระบบ</Link>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
