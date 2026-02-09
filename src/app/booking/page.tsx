"use client";

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Define available time slots
const TIME_SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

function BookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [step, setStep] = useState(Number(searchParams.get('step')) || 1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]); // Format: "YYYY-MM-DD-HH:mm"

    const [formData, setFormData] = useState({
        serviceType: searchParams.get('service') || 'installation', // installation, cleaning, repair
        selectedDate: '',
        selectedTime: '',
        name: '',
        phone: '',
        addressDetails: {
            houseNo: '',
            village: '',
            subdistrict: '', // Tambon
            district: '',    // Amphoe
            province: '',    // Changwat
            lat: null as number | null,
            lng: null as number | null
        },
        note: searchParams.get('model') ? `จองติดตั้งแอร์รุ่น: ${searchParams.get('model')}` : ''
    });

    const steps = [
        { id: 1, title: 'เลือกบริการ' },
        { id: 2, title: 'วัน-เวลา' },
        { id: 3, title: 'ข้อมูลติดต่อ' },
        { id: 4, title: 'ยืนยัน' }
    ];

    // Auth Guard: Redirect if not logged in
    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push(`/login?redirect=/booking&service=${formData.serviceType}${searchParams.get('model') ? `&model=${searchParams.get('model')}` : ''}`);
        }
    }, [user, isAuthLoading, router]);

    // Fetch existing bookings to determine availability
    useEffect(() => {
        fetchBookedSlots();
    }, []);

    // Auto-fill from profile & metadata
    useEffect(() => {
        if (user) {
            console.log("Booking: User identified, starting auto-fill...", user);

            // Priority 1: User Metadata (Always available if signed up)
            setFormData(prev => ({
                ...prev,
                name: prev.name || user.user_metadata?.full_name || user.user_metadata?.display_name || '',
                phone: prev.phone || user.user_metadata?.phone || '',
            }));

            // Priority 2: In-depth Profile from database
            const fetchProfile = async () => {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error && error.code !== 'PGRST116') {
                        console.error('Error fetching profile:', error);
                    }

                    if (data) {
                        console.log("Booking: Profile data found:", data);
                        setFormData(prev => ({
                            ...prev,
                            name: data.full_name || prev.name,
                            phone: data.phone || prev.phone,
                            addressDetails: {
                                ...prev.addressDetails,
                                // Spread existing details from DB
                                ...(data.address_details || {}),
                                // Explicitly set lat/lng if available at top level
                                lat: data.location_lat !== undefined ? data.location_lat : prev.addressDetails.lat,
                                lng: data.location_lng !== undefined ? data.location_lng : prev.addressDetails.lng
                            }
                        }));
                    } else {
                        console.log("Booking: No profile record found for this user ID.");
                    }
                } catch (err) {
                    console.error('Booking: Unexpected error fetching profile:', err);
                }
            };
            fetchProfile();
        }
    }, [user]);

    const fetchBookedSlots = async () => {
        try {
            // Fetch bookings for the next 30 days
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('bookings')
                .select('date, time')
                .gte('date', today)
                .neq('status', 'cancelled');

            if (error) throw error;

            if (data) {
                const slots = data.map((b: any) => `${b.date}-${b.time}`);
                setBookedSlots(slots);
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const handleSelectSlot = (date: string, time: string) => {
        setFormData({ ...formData, selectedDate: date, selectedTime: time });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            addressDetails: {
                ...prev.addressDetails,
                [name]: value
            }
        }));
    };

    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        if (formatted.replace(/-/g, '').length <= 10) {
            setFormData({ ...formData, phone: formatted });
        }
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        addressDetails: {
                            ...prev.addressDetails,
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
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

    const nextStep = () => {
        if (step === 1 && !formData.serviceType) return;
        if (step === 2 && (!formData.selectedDate || !formData.selectedTime)) return;
        if (step === 3) {
            const { name, phone, addressDetails } = formData;
            if (!name || phone.replace(/-/g, '').length !== 10 || !addressDetails.houseNo || !addressDetails.subdistrict || !addressDetails.district || !addressDetails.province) {
                alert("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง (เบอร์โทร 10 หลัก)");
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmitBooking = async () => {
        try {
            setIsSubmitting(true);

            // Double check availability
            const slotKey = `${formData.selectedDate}-${formData.selectedTime}`;
            if (bookedSlots.includes(slotKey)) {
                alert('ขออภัย! ช่วงเวลานี้ถูกจองไปแล้วในระหว่างที่คุณกำลังทำรายการ กรุณาเลือกเวลาใหม่');
                setIsSubmitting(false);
                setStep(2); // Go back to date selection
                fetchBookedSlots(); // Refresh
                return;
            }

            // Promise.all to handle both booking and profile update
            const [bookingResult, profileResult] = await Promise.all([
                supabase.from('bookings').insert([{
                    service_type: formData.serviceType,
                    date: formData.selectedDate,
                    time: formData.selectedTime,
                    customer_name: formData.name,
                    customer_phone: formData.phone,
                    address_details: formData.addressDetails,
                    location_lat: formData.addressDetails.lat,
                    location_lng: formData.addressDetails.lng,
                    note: formData.note,
                    status: 'pending',
                    user_id: user?.id,
                    order_id: searchParams.get('order_id') // Link to order items
                }]),
                user ? supabase.from('profiles').upsert([{
                    id: user.id,
                    full_name: formData.name,
                    phone: formData.phone,
                    address_details: formData.addressDetails,
                    location_lat: formData.addressDetails.lat,
                    location_lng: formData.addressDetails.lng,
                    updated_at: new Date().toISOString()
                }]) : Promise.resolve({ error: null })
            ]);

            if (bookingResult.error) throw bookingResult.error;
            if (profileResult.error) console.error('Error updating profile:', profileResult.error);

            alert('จองคิวสำเร็จ! 🎉 เจ้าหน้าที่จะติดต่อกลับเพื่อยืนยันภายใน 15 นาที');
            router.push('/'); // Redirect home
        } catch (error) {
            console.error('Booking failed:', error);
            alert('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Generate next 7 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const dates = generateDates();

    return (
        <main className="bg-aurora" style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '120px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                    <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2.5rem' }}>จองคิวบริการ</h1>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4rem', position: 'relative' }}>
                        {/* Line */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '0', right: '0',
                            height: '2px', background: '#e2e8f0', zIndex: 0, transform: 'translateY(-50%)'
                        }}></div>

                        {steps.map((s) => (
                            <div key={s.id} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                                <div style={{
                                    width: '40px', height: '40px',
                                    background: step >= s.id ? 'var(--color-primary-blue)' : 'white',
                                    border: step >= s.id ? 'none' : '2px solid #e2e8f0',
                                    borderRadius: '50%',
                                    color: step >= s.id ? 'white' : '#94a3b8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, margin: '0 auto 0.5rem',
                                    transition: 'all 0.3s'
                                }}>
                                    {s.id}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: step >= s.id ? 'var(--color-text-main)' : '#cbd5e1', fontWeight: 600 }}>
                                    {s.title}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card-glass" style={{ padding: '3rem' }}>

                        {/* Step 1: Service Type */}
                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>คุณต้องการรับบริการอะไร?</h2>
                                <div className="grid-responsive" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
                                    {[
                                        { id: 'installation', icon: '❄️', title: 'ติดตั้งแอร์ใหม่', desc: 'รวมเดินท่อและอุปกรณ์' },
                                        { id: 'cleaning', icon: '✨', title: 'ล้างแอร์', desc: 'ล้างใหญ่ 15 ขั้นตอน' },
                                        { id: 'repair', icon: '🔧', title: 'ซ่อมแซม', desc: 'ตรวจเช็คละเอียด' }
                                    ].map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => setFormData({ ...formData, serviceType: service.id })}
                                            style={{
                                                padding: '2rem',
                                                border: '2px solid',
                                                borderColor: formData.serviceType === service.id ? 'var(--color-primary-blue)' : '#e2e8f0',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                background: formData.serviceType === service.id ? '#eff6ff' : 'white',
                                                transition: 'all 0.2s',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{service.icon}</div>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{service.title}</h3>
                                            <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem' }}>{service.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date & Time */}
                        {step === 2 && (
                            <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
                                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>เลือกวันและเวลาที่สะดวก</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                    {dates.map((date) => (
                                        <div key={date}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-sub)', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                                {new Date(date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                {TIME_SLOTS.map((time) => {
                                                    const slotKey = `${date}-${time}`;
                                                    const isBooked = bookedSlots.includes(slotKey);
                                                    const isSelected = formData.selectedDate === date && formData.selectedTime === time;

                                                    return (
                                                        <button
                                                            key={time}
                                                            disabled={isBooked}
                                                            onClick={() => handleSelectSlot(date, time)}
                                                            style={{
                                                                padding: '0.8rem 1.5rem',
                                                                borderRadius: '12px',
                                                                border: isSelected ? '2px solid #0A84FF' : '1px solid #e2e8f0',
                                                                background: isSelected ? '#0A84FF' : isBooked ? '#f1f5f9' : 'white',
                                                                color: isSelected ? 'white' : isBooked ? '#cbd5e1' : '#334155',
                                                                fontWeight: isSelected ? 700 : 500,
                                                                cursor: isBooked ? 'not-allowed' : 'pointer',
                                                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                                                                boxShadow: isSelected ? '0 4px 12px rgba(10, 132, 255, 0.3)' : 'none',
                                                                transition: 'all 0.2s',
                                                                position: 'relative',
                                                                minWidth: '100px'
                                                            }}
                                                        >
                                                            {time}
                                                            {isSelected && (
                                                                <div style={{
                                                                    position: 'absolute', top: '-8px', right: '-8px',
                                                                    background: '#22c55e', color: 'white',
                                                                    borderRadius: '50%', width: '20px', height: '20px',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: '0.8rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                }}>
                                                                    ✓
                                                                </div>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary Bar Logic ... (Lines 319-350 unchanged) ... */}
                                {formData.selectedDate && formData.selectedTime && (
                                    <div style={{
                                        position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
                                        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
                                        padding: '1rem 2rem', borderRadius: '50px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                        display: 'flex', alignItems: 'center', gap: '1.5rem',
                                        zIndex: 100, border: '1px solid #e2e8f0',
                                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        width: '90%', maxWidth: '500px'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>เวลานัดหมาย</div>
                                            <div style={{ fontWeight: 700, color: '#0F172A' }}>
                                                {new Date(formData.selectedDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} — {formData.selectedTime} น.
                                            </div>
                                        </div>
                                        <button
                                            onClick={nextStep}
                                            className="btn-wow"
                                            style={{
                                                padding: '0.6rem 1.5rem', fontSize: '1rem',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            ยืนยันเวลา <span style={{ fontSize: '1.2rem' }}>→</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Contact Info */}
                        {step === 3 && (
                            <div className="animate-fade-in">
                                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>ข้อมูลการติดต่อ</h2>
                                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>

                                    {/* Name & Phone */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ชื่อ-นามสกุล <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                placeholder="กรอกชื่อของคุณ"
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handlePhoneChange}
                                                maxLength={12}
                                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                placeholder="0xx-xxx-xxxx"
                                            />
                                        </div>
                                    </div>

                                    {/* Address ... (Lines 383-438 unchanged) ... */}
                                    <div>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <label style={{ fontWeight: 600 }}>ที่อยู่หน้างาน</label>
                                        </div>

                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <input
                                                    type="text" name="houseNo" placeholder="บ้านเลขที่"
                                                    value={formData.addressDetails.houseNo} onChange={handleAddressChange}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                />
                                                <input
                                                    type="text" name="village" placeholder="หมู่บ้าน / อาคาร"
                                                    value={formData.addressDetails.village} onChange={handleAddressChange}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                                <input
                                                    type="text" name="subdistrict" placeholder="ตำบล/แขวง"
                                                    value={formData.addressDetails.subdistrict} onChange={handleAddressChange}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                />
                                                <input
                                                    type="text" name="district" placeholder="อำเภอ/เขต"
                                                    value={formData.addressDetails.district} onChange={handleAddressChange}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                />
                                                <input
                                                    type="text" name="province" placeholder="จังหวัด"
                                                    value={formData.addressDetails.province} onChange={handleAddressChange}
                                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                />
                                            </div>
                                            {formData.addressDetails.lat && (
                                                <div style={{
                                                    background: '#f0fdf4', color: '#166534', padding: '0.8rem',
                                                    borderRadius: '8px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                }}>
                                                    ✅ พิกัด GPS: {formData.addressDetails.lat.toFixed(6)}, {formData.addressDetails.lng?.toFixed(6)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Note field for product model */}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>หมายเหตุเพิ่มเติม (ถ้ามี)</label>
                                        <textarea
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '100px' }}
                                            placeholder="ระบุข้อมูลเพิ่มเติม หรือรุ่นแอร์ที่ต้องการ"
                                        />
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirmation ... (Lines 444-503 unchanged) ... */}
                        {step === 4 && (
                            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                                <h2 style={{ marginBottom: '1rem' }}>ยืนยันการจอง?</h2>
                                <p style={{ color: 'var(--color-text-sub)', marginBottom: '2rem' }}>
                                    โปรดตรวจสอบข้อมูลของคุณ ทีมงานจะติดต่อกลับเพื่อยืนยันภายใน 15 นาที
                                </p>

                                <div style={{
                                    background: '#f8fafc', padding: '2rem', borderRadius: '20px',
                                    maxWidth: '500px', margin: '0 auto 2rem', textAlign: 'left'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ color: '#64748b' }}>บริการ:</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {formData.serviceType === 'installation' && 'ติดตั้งแอร์ใหม่'}
                                            {formData.serviceType === 'cleaning' && 'ล้างแอร์'}
                                            {formData.serviceType === 'repair' && 'ซ่อมแอร์'}
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ color: '#64748b' }}>วัน-เวลา:</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {new Date(formData.selectedDate).toLocaleDateString('th-TH')} เวลา {formData.selectedTime}
                                        </div>
                                    </div>
                                    {formData.note && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <div style={{ color: '#64748b' }}>รายละเอียด:</div>
                                            <div style={{ fontWeight: 600 }}>{formData.note}</div>
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ color: '#64748b' }}>ชื่อ:</div>
                                        <div style={{ fontWeight: 600 }}>{formData.name}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div style={{ color: '#64748b' }}>เบอร์โทร:</div>
                                        <div style={{ fontWeight: 600 }}>{formData.phone}</div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '1rem' }}>
                                        <div style={{ color: '#64748b' }}>ที่อยู่:</div>
                                        <div style={{ fontWeight: 600 }}>
                                            {formData.addressDetails.houseNo} {formData.addressDetails.village}<br />
                                            {formData.addressDetails.subdistrict} {formData.addressDetails.district}<br />
                                            {formData.addressDetails.province}
                                            {formData.addressDetails.lat && (
                                                <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '4px' }}>
                                                    (แนบพิกัด GPS แล้ว)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn-wow"
                                    style={{ padding: '1rem 3rem' }}
                                    onClick={handleSubmitBooking}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการจอง ✅'}
                                </button>
                            </div>
                        )}

                        {/* Navigation Buttons ... (Lines 505-518 unchanged) ... */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingBottom: step === 2 ? '80px' : '0' }}>
                            {step > 1 && (
                                <button onClick={prevStep} className="btn" style={{ background: 'transparent', border: '1px solid #cbd5e1' }}>
                                    ← ย้อนกลับ
                                </button>
                            )}
                            <div style={{ flex: 1 }}></div>
                            {step < 4 && !(step === 2 && formData.selectedDate && formData.selectedTime) && (
                                <button onClick={nextStep} className="btn-wow">
                                    ถัดไป →
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div style={{ paddingTop: '120px', textAlign: 'center' }}>กำลังโหลดแบบฟอร์มจองคิว...</div>}>
            <BookingContent />
        </Suspense>
    );
}
