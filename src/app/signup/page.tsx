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
    const [addressDetails, setAddressDetails] = useState({
        houseNo: '',
        village: '',
        subdistrict: '',
        district: '',
        province: '',
        lat: null as number | null,
        lng: null as number | null
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const { signUp } = useAuth();
    const router = useRouter();

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddressDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setAddressDetails(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }));
                    alert("ดึงพิกัดตำแหน่งเรียบร้อย! 📍");
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("ไม่สามารถดึงตำแหน่งได้ กรุณาเปิด Location Service");
                }
            );
        } else {
            alert("Browser ของคุณไม่รองรับการระบุตำแหน่ง");
        }
    };

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
            // Insert profile data
            if (result.data?.user) {
                const { error: profileError } = await supabase.from('profiles').insert([{
                    id: result.data.user.id,
                    full_name: name,
                    phone: phone,
                    address_details: addressDetails,
                    location_lat: addressDetails.lat,
                    location_lng: addressDetails.lng
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
                <div className="card-glass" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
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

                        {/* Address Section */}
                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>ที่อยู่สำหรับติดตั้ง (Optional)</label>
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    style={{
                                        fontSize: '0.8rem', color: 'var(--color-primary-blue)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.3rem'
                                    }}
                                >
                                    📍 ปักหมุดตำแหน่งปัจจุบัน
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="text" name="houseNo" placeholder="บ้านเลขที่"
                                        value={addressDetails.houseNo} onChange={handleAddressChange}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                    />
                                    <input
                                        type="text" name="village" placeholder="หมู่บ้าน / อาคาร"
                                        value={addressDetails.village} onChange={handleAddressChange}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <input
                                        type="text" name="subdistrict" placeholder="ตำบล"
                                        value={addressDetails.subdistrict} onChange={handleAddressChange}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                    />
                                    <input
                                        type="text" name="district" placeholder="อำเภอ"
                                        value={addressDetails.district} onChange={handleAddressChange}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                    />
                                    <input
                                        type="text" name="province" placeholder="จังหวัด"
                                        value={addressDetails.province} onChange={handleAddressChange}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                {addressDetails.lat && (
                                    <div style={{
                                        background: '#f0fdf4', color: '#166534', padding: '0.8rem',
                                        borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}>
                                        ✅ พิกัด GPS: {addressDetails.lat.toFixed(6)}, {addressDetails.lng?.toFixed(6)}
                                    </div>
                                )}
                            </div>
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
