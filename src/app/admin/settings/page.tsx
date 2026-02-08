"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Setting {
    id: string;
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
        'hero_title': 'หัวข้อหลัก (Hero Title)',
        'hero_subtitle': 'คำอธิบาย (Hero Subtitle)',
        'phone_number': 'เบอร์โทร',
        'line_id': 'Line ID',
        'address': 'ที่อยู่ร้าน (Footer)',
        'footer_description': 'คำแนะนำร้าน (Footer)',
        'services_list': 'รายการบริการ (คั่นด้วยเครื่องหมาย ,)'
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('site_settings')
            .select('*')
            .order('setting_key');
        if (data) setSettings(data);
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

        for (const setting of settings) {
            await supabase
                .from('site_settings')
                .update({
                    setting_value: setting.setting_value,
                    updated_at: new Date().toISOString()
                })
                .eq('setting_key', setting.setting_key);
        }

        setMessage('✅ บันทึกเรียบร้อย!');
        setIsSaving(false);

        setTimeout(() => setMessage(''), 3000);
    };

    const handleAddSetting = async () => {
        const key = prompt('ใส่ชื่อ Setting Key (ภาษาอังกฤษ):');
        if (!key) return;

        await supabase.from('site_settings').insert({
            setting_key: key.toLowerCase().replace(/\s+/g, '_'),
            setting_value: '',
            setting_type: 'text'
        });

        loadSettings();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>⚙️ ตั้งค่าเว็บไซต์</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>แก้ไขข้อความในหน้า Homepage</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {message && (
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>{message}</span>
                    )}
                    <button onClick={handleAddSetting} style={{ padding: '0.8rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>
                        + เพิ่ม Setting
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-wow"
                        style={{ padding: '0.8rem 1.5rem', opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? '💾 กำลังบันทึก...' : '💾 บันทึก'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>กำลังโหลด...</div>
            ) : (
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    {settings.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
                            <div>ยังไม่มีการตั้งค่า</div>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                กรุณาสร้างตาราง site_settings ใน Supabase ก่อน
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {settings.map((setting, index) => (
                                <div
                                    key={setting.id}
                                    style={{
                                        padding: '1.5rem 2rem',
                                        borderBottom: index < settings.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <label style={{ fontWeight: 600, color: '#1e293b' }}>
                                        {settingLabels[setting.setting_key] || setting.setting_key}
                                    </label>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                                        Key: {setting.setting_key}
                                    </div>
                                    {setting.setting_key.includes('subtitle') || setting.setting_key.includes('description') ? (
                                        <textarea
                                            value={setting.setting_value || ''}
                                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '1rem',
                                                resize: 'vertical'
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={setting.setting_value || ''}
                                            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.8rem',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Preview Section */}
            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>👁️ ตัวอย่าง Hero Section</h2>
                <div style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    padding: '3rem',
                    borderRadius: '16px',
                    textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>
                        {settings.find(s => s.setting_key === 'hero_title')?.setting_value || 'หัวข้อหลัก'}
                    </h1>
                    <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto' }}>
                        {settings.find(s => s.setting_key === 'hero_subtitle')?.setting_value || 'คำอธิบาย'}
                    </p>
                </div>
            </div>
        </div>
    );
}
