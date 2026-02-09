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
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // New Profile Fields
    const [phone, setPhone] = useState('');

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

        if (phone.length < 9) {
            setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง');
            return;
        }

        setLoading(true);
        const result = await signUp(email, password, name);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            // Insert profile data (Basic info only)
            if (result.data?.user) {
                const { error: profileError } = await supabase.from('profiles').insert([{
                    id: result.data.user.id,
                    full_name: name,
                    phone: phone
                }]);

                if (profileError) {
                    console.error('Error creating profile:', profileError);
                    // Continue anyway, auth is successful
                }
            }

            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        // ... (Success view remains unchanged)
        return (
            <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
                <Navbar />
                <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', display: 'flex', justifyContent: 'center' }}>
                    <div className="card-glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>✅</div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', color: '#0F172A' }}>การลงทะเบียนสมาชิกเสร็จสมบูรณ์</h1>
                        <p style={{ color: '#475569', marginBottom: '2.5rem', lineHeight: 1.8, fontSize: '1rem' }}>
                            ระบบได้จัดส่งอีเมลยืนยันการสมัครไปยังที่อยู่บุคคลของท่าน: <span style={{ fontWeight: 600, color: 'var(--color-primary-blue)' }}>{email}</span><br /><br />
                            กรุณาตรวจสอบกล่องข้อความและดำเนินการตามขั้นตอนในอีเมล เพื่อความปลอดภัยและเพื่อเริ่มต้นใช้บริการอย่างเต็มรูปแบบ<br />
                            <strong>ขอขอบพระคุณที่ให้ความไว้วางใจเลือกใช้บริการ ธนรินทร์แอร์</strong>
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
                <div className="card-glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="0xx-xxx-xxxx"
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>รหัสผ่าน <span className="text-red-500">*</span></label>
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
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>ยืนยันรหัสผ่าน <span className="text-red-500">*</span></label>
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
                            style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
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
