"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Setting {
    id?: string;
    setting_key: string;
    setting_value: string;
    setting_type: string;
}

export default function AdminSettings() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    const settingLabels: Record<string, string> = {
        // Footer Settings
        'footer_description': 'คำแนะนำร้าน (Footer Description)',
        'phone_number': 'เบอร์โทรศัพท์',
        'line_id': 'Line ID',
        'address': 'ที่อยู่ร้าน',
        'services_list': 'รายการบริการ (คั่นด้วยเครื่องหมายคอมม่า ,)',
        'map_iframe_url': 'พิกัดแผนที่ร้าน (Google Maps Embed URL)'
    };

    const defaultSettings: Setting[] = Object.keys(settingLabels).map(key => ({
        setting_key: key,
        setting_value: '',
        setting_type: 'text'
    }));

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('site_settings')
            .select('*')
            .order('setting_key');

        if (data) {
            // Merge fetched data with default settings to ensure all keys exist
            const mergedSettings = defaultSettings.map(defaultSetting => {
                const found = data.find(d => d.setting_key === defaultSetting.setting_key);
                return found ? found : defaultSetting;
            });
            setSettings(mergedSettings);
        } else {
            setSettings(defaultSettings);
        }
        setIsLoading(false);
    };

    const handleChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s =>
            s.setting_key === key ? { ...s, setting_value: value } : s
        ));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');

        try {
            for (const setting of settings) {
                // Remove id if it's undefined (new setting)
                const { id, ...settingData } = setting;

                await supabase
                    .from('site_settings')
                    .upsert({
                        setting_key: settingData.setting_key,
                        setting_value: settingData.setting_value,
                        setting_type: settingData.setting_type,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'setting_key' });
            }

            setMessage('✅ บันทึกข้อมูลเรียบร้อย!');
            // Reload to get IDs for new settings
            loadSettings();
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('❌ เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>⚙️ ตั้งค่าเว็บไซต์</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>แก้ไขข้อมูลส่วนต่างๆ ของเว็บไซต์</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {message && (
                        <span style={{ color: message.includes('❌') ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                            {message}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-wow"
                        style={{ padding: '0.8rem 1.5rem', opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? '💾 กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
            ) : (
                <div style={{ display: 'grid', gap: '2rem' }}>


                    {/* Footer Settings */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 700, color: '#1e293b' }}>
                            🦶 ส่วนท้ายเว็บ (Footer)
                        </div>
                        <div style={{ padding: '1.5rem 2rem' }}>
                            {settings.map((setting) => (
                                <div key={setting.setting_key} style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                                        {settingLabels[setting.setting_key]}
                                    </label>
                                    {setting.setting_key === 'footer_description' || setting.setting_key === 'address' ? (
                                        <textarea
                                            value={setting.setting_value || ''}
                                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                                            rows={3}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', resize: 'vertical' }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={setting.setting_value || ''}
                                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                        />
                                    )}
                                    {setting.setting_key === 'services_list' && (
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            * ใส่รายการบริการต่างๆ โดยคั่นด้วยเครื่องหมายจุลภาค (,) เช่น ล้างแอร์, ซ่อมแอร์, ติดตั้งแอร์
                                        </p>
                                    )}
                                    {setting.setting_key === 'map_iframe_url' && (
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            * นำโค้ดจาก Google Maps (Share {'->'} Embed a map) มาเฉพาะส่วน src="..." หรือวางทั้งกิฟต์ก็ได้ระบบจะพยายามล้างให้ครับ
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
