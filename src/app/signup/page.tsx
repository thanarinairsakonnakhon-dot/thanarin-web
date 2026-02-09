"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('รหัสผ่านไม่ตรงกัน');
            return;
        }

        if (password.length < 6) {
            setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setLoading(true);
        const result = await signUp(email, password, name);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
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
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>ขอบคุณที่เข้าร่วมกับเรา!</h1>
                        <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.6 }}>
                            เราได้ส่งอีเมลยืนยันการสมัครไปที่ {email} เรียบร้อยแล้ว <br />
                            กรุณาตรวจสอบอีเมลของคุณเพื่อเปิดใช้งานบัญชีครับ
                        </p>
                        <Link href="/login" className="btn-wow" style={{ display: 'inline-block', padding: '0.8rem 2rem', textDecoration: 'none' }}>
                            ไปหน้าเข้าสู่ระบบ
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
                <div className="card-glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>สมัครสมาชิกใหม่</h1>
                        <p style={{ color: '#64748b' }}>ร่วมเป็นส่วนหนึ่งของ ธนรินทร์แอร์</p>
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', color: '#ef4444', padding: '0.8rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>ชื่อ-นามสกุล</label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>รหัสผ่าน</label>
                            <input
                                required
                                type="password"
                                placeholder="อย่างน้อย 6 ตัวอักษร"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>ยืนยันรหัสผ่าน</label>
                            <input
                                required
                                type="password"
                                placeholder="ระบุรหัสผ่านอีกครั้ง"
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
                            {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        มีบัญชีอยู่แล้ว? <Link href="/login" style={{ color: 'var(--color-primary-blue)', fontWeight: 600, textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
