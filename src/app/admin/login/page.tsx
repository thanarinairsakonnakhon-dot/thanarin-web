"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (result.error) {
            setError(result.error);
            setIsLoading(false);
        } else {
            router.push('/admin');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)',
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '3rem',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        fontSize: '2rem',
                        fontWeight: 800,
                        color: 'white'
                    }}>
                        T
                    </div>
                    <h1 style={{
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        marginBottom: '0.5rem'
                    }}>
                        TH.AIR Admin
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        เข้าสู่ระบบเพื่อจัดการร้าน
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        background: '#FEE2E2',
                        color: '#DC2626',
                        padding: '1rem',
                        borderRadius: '10px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        ❌ {error === 'Invalid login credentials' ? 'Email หรือรหัสผ่านไม่ถูกต้อง' : error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 500,
                            color: '#374151',
                            fontSize: '0.9rem'
                        }}>
                            📧 Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '10px',
                                border: '2px solid #E5E7EB',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 500,
                            color: '#374151',
                            fontSize: '0.9rem'
                        }}>
                            🔒 รหัสผ่าน
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '10px',
                                border: '2px solid #E5E7EB',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: isLoading
                                ? '#94A3B8'
                                : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
                        }}
                    >
                        {isLoading ? '⏳ กำลังเข้าสู่ระบบ...' : '🚀 เข้าสู่ระบบ'}
                    </button>
                </form>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    color: '#94A3B8',
                    fontSize: '0.8rem'
                }}>
                    © 2024 TH.AIR - ธนรินทร์แอร์
                </p>
            </div>
        </div>
    );
}
