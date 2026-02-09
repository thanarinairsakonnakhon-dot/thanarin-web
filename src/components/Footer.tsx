"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface SiteSettings {
    [key: string]: string;
}

export default function Footer() {
    const [settings, setSettings] = useState<SiteSettings>({
        footer_description: 'ร้านแอร์ที่คุณวางใจได้ ด้วยมาตรฐานการบริการระดับสากล และความใส่ใจดุจญาติมิตร',
        phone_number: '089-999-9999',
        line_id: '@thanarinair',
        address: 'Bangkok, Thailand',
        services_list: 'ล้างแอร์,ซ่อมแอร์,ติดตั้งแอร์ใหม่,ย้ายจุดติดตั้ง'
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

    const services = settings.services_list.split(',').map(s => s.trim()).filter(s => s);

    return (
        <footer className="footer-section">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>TH.AIR</h3>
                        <p style={{ color: '#94A3B8', lineHeight: 1.6 }}>
                            {settings.footer_description}
                        </p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1rem', color: 'white', fontSize: '1.1rem' }}>บริการของเรา</h4>
                        <ul style={{ listStyle: 'none', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: 0 }}>
                            {services.map((service, index) => (
                                <li key={index}>{service}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1rem', color: 'white', fontSize: '1.1rem' }}>ติดต่อเรา</h4>
                        <div style={{ color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <p style={{ margin: 0 }}>📞 {settings.phone_number}</p>
                            <p style={{ margin: 0 }}>💬 Line: {settings.line_id}</p>
                            <p style={{ margin: 0 }}>📍 {settings.address}</p>
                        </div>
                    </div>
                    {settings.map_iframe_url && (
                        <div className="footer-map-container" style={{ gridColumn: 'span 1', height: '150px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1E293B' }}>
                            <iframe
                                src={settings.map_iframe_url.includes('src="') ? settings.map_iframe_url.split('src="')[1].split('"')[0] : settings.map_iframe_url}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    )}
                </div>
                <div style={{ textAlign: 'center', borderTop: '1px solid #1E293B', paddingTop: '1.5rem', color: '#475569', fontSize: '0.85rem' }}>
                    © {new Date().getFullYear()} Thanarin Air Conditioner. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}
