"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface BannerSettings {
    image_url: string;
    title: string;
    subtitle: string;
    link: string;
    is_active: boolean;
}

export default function ShopBanner() {
    const [banner, setBanner] = useState<BannerSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadBanner = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('setting_key, setting_value')
                .or('setting_key.eq.shop_banner_image_url,setting_key.eq.shop_banner_title,setting_key.eq.shop_banner_subtitle,setting_key.eq.shop_banner_link,setting_key.eq.shop_banner_is_active');

            if (data && data.length > 0) {
                const settings: any = {};
                data.forEach(item => {
                    settings[item.setting_key] = item.setting_value;
                });

                if (settings.shop_banner_is_active === 'true' && settings.shop_banner_image_url) {
                    setBanner({
                        image_url: settings.shop_banner_image_url,
                        title: settings.shop_banner_title || '',
                        subtitle: settings.shop_banner_subtitle || '',
                        link: settings.shop_banner_link || '',
                        is_active: true
                    });
                }
            }
            setIsLoading(false);
        };

        loadBanner();
    }, []);

    if (isLoading || !banner) return null;

    return (
        <section style={{ padding: '80px 0 1rem 0' }}>
            <div className="container">
                <div style={{
                    position: 'relative',
                    height: '320px',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'white',
                    background: '#1e293b'
                }}>
                    {/* Background Image with Overlay */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${banner.image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: 0
                    }} />

                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6))',
                        zIndex: 1
                    }} />

                    {/* Content */}
                    <div style={{ position: 'relative', zIndex: 2, padding: '0 2rem', maxWidth: '800px' }}>
                        {banner.title && (
                            <h2 style={{
                                fontSize: '2.8rem',
                                fontWeight: 900,
                                marginBottom: '1rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                opacity: 0,
                                animation: 'fadeInUp 0.8s forwards'
                            }}>
                                {banner.title}
                            </h2>
                        )}
                        {banner.subtitle && (
                            <p style={{
                                fontSize: '1.2rem',
                                marginBottom: '2.5rem',
                                color: 'rgba(255,255,255,0.9)',
                                lineHeight: 1.6,
                                opacity: 0,
                                animation: 'fadeInUp 0.8s 0.2s forwards'
                            }}>
                                {banner.subtitle}
                            </p>
                        )}
                        {banner.link && (
                            <Link
                                href={banner.link}
                                className="btn-wow"
                                style={{
                                    padding: '1.2rem 3rem',
                                    fontSize: '1.1rem',
                                    borderRadius: '50px',
                                    opacity: 0,
                                    animation: 'fadeInUp 0.8s 0.4s forwards'
                                }}
                            >
                                ดูรายละเอียดเพิ่มเติม
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </section>
    );
}
