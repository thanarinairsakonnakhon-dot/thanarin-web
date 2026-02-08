"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface SiteSettings {
    [key: string]: string;
}

export default function HeroSection() {
    const [settings, setSettings] = useState<SiteSettings>({
        hero_title: 'ความเย็นที่... เหนือระดับ',
        hero_subtitle: 'ติดตั้งใจถึงบ้าน หมดห่วงการันตีคุณภาพ',
        phone_number: '089-999-9999',
        line_id: '@thanarinair'
    });

    useEffect(() => {
        const loadSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('setting_key, setting_value');

            if (data && data.length > 0) {
                const settingsMap: SiteSettings = {};
                data.forEach(item => {
                    settingsMap[item.setting_key] = item.setting_value;
                });
                setSettings(prev => ({ ...prev, ...settingsMap }));
            }
        };

        loadSettings();
    }, []);

    // Parse title - split by "..." or first space for gradient effect
    const titleParts = settings.hero_title.includes('...')
        ? settings.hero_title.split('...')
        : [settings.hero_title, ''];

    return (
        <section className="bg-mesh" style={{
            position: 'relative',
            padding: '180px 0 120px',
            overflow: 'hidden',
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center'
        }}>
            {/* Decorative Blobs */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }}></div>
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '-10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(10,132,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }}></div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="grid-responsive">


                    {/* Text Content */}
                    <div>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(10, 132, 255, 0.2)',
                            borderRadius: '99px',
                            marginBottom: '2rem',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                        }}>
                            <span style={{ display: 'block', width: '8px', height: '8px', background: '#22C55E', borderRadius: '50%' }} className="animate-pulse-glow"></span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                                อันดับ 1 งานติดตั้งแอร์
                            </span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            fontWeight: 800
                        }}>
                            {titleParts[0]}{titleParts[1] && '...'}<br />
                            {titleParts[1] && <span className="text-gradient-blue">{titleParts[1].trim()}</span>}
                        </h1>

                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--color-text-sub)',
                            marginBottom: '3rem',
                            maxWidth: '90%',
                            lineHeight: 1.7
                        }}>
                            {settings.hero_subtitle}
                        </p>

                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <Link href="/calculator" className="btn-wow">
                                คำนวณ BTU ฟรี ✨
                            </Link>
                            <a href={`tel:${settings.phone_number.replace(/-/g, '')}`} style={{
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: 'var(--color-text-main)',
                                textDecoration: 'underline',
                                textUnderlineOffset: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                📞 {settings.phone_number}
                            </a>

                        </div>

                        {/* Stats */}
                        <div style={{ marginTop: '4rem', display: 'flex', gap: '3rem' }}>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-blue)' }}>12k+</div>
                                <div style={{ color: 'var(--color-text-sub)' }}>Happy Clients</div>
                            </div>
                            <div style={{ width: '1px', background: '#CBD5E1' }}></div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary-blue)' }}>24/7</div>
                                <div style={{ color: 'var(--color-text-sub)' }}>Support</div>
                            </div>
                        </div>
                    </div>

                    {/* Graphical/Visual Side */}
                    <div style={{ position: 'relative', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Circle Background */}
                        <div style={{
                            position: 'absolute',
                            width: '500px',
                            height: '500px',
                            background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                            borderRadius: '50%',
                            filter: 'blur(40px)',
                            opacity: 0.6,
                            zIndex: 0
                        }}></div>

                        {/* Main Aircon Image Placeholder (Floating) */}
                        <div className="animate-float" style={{
                            position: 'relative',
                            zIndex: 10,
                            width: '100%',
                            maxWidth: '500px',
                            height: '280px',
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 30px 60px -10px rgba(10, 132, 255, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.8)'
                        }}>
                            {/* Internal Mock Graphic */}
                            <div style={{ width: '90%', height: '85%', background: '#F1F5F9', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', background: 'linear-gradient(to top, rgba(10,132,255,0.1), transparent)' }}></div>
                                <div style={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: '#94A3B8'
                                }}>
                                    PREMIUM AIRFLOW
                                </div>
                            </div>

                            {/* Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                right: '-20px',
                                background: '#F59E0B',
                                color: 'white',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '50px',
                                fontWeight: 800,
                                boxShadow: '0 10px 20px rgba(245, 158, 11, 0.3)',
                                transform: 'rotate(5deg)'
                            }}>
                                SALE -20%
                            </div>
                        </div>

                        {/* Floating Card 1: Temperature */}
                        <div className="animate-float-delayed" style={{
                            position: 'absolute',
                            bottom: '100px',
                            left: '0px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            padding: '1.2rem',
                            borderRadius: '20px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            zIndex: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <div style={{ width: '40px', height: '40px', background: '#E0F2FE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>❄️</div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Room Temp</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A' }}>24.5°C</div>
                            </div>
                        </div>

                        {/* Floating Card 2: Energy Saving */}
                        <div className="card-glass animate-float" style={{
                            position: 'absolute',
                            top: '80px',
                            right: '-20px',
                            padding: '1rem',
                            zIndex: 15,
                            animationDelay: '2s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                                <span style={{ fontWeight: 600, color: '#0F172A' }}>INVERTER</span>
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#22C55E', fontWeight: 600 }}>Up to 60% Savings</div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
