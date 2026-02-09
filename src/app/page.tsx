import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import Link from 'next/link';
import Testimonials from '@/components/Testimonials';
import ServiceBadges from '@/components/ServiceBadges';
import PromotionBanner from '@/components/PromotionBanner';
import ShopBanner from '@/components/ShopBanner';



export default function Home() {
    return (
        <main style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <ShopBanner />

            <HeroSlider />

            <PromotionBanner />

            {/* Bento Grid Features Section */}
            <section style={{ padding: '4rem 0 8rem' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <span style={{
                            color: 'var(--color-primary-blue)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '0.9rem'
                        }}>Why Choose Us</span>
                        <h2 style={{ fontSize: '2.5rem', marginTop: '1rem' }}>
                            มากกว่าแค่ความเย็น <br />
                            คือ <span className="text-gradient-blue">มาตรฐานที่คุณวางใจ</span>
                        </h2>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(12, 1fr)',
                        gridTemplateRows: 'repeat(2, minmax(250px, auto))',
                        gap: '1.5rem'
                    }}>

                        {/* Feature 1: Large Box */}
                        <div className="card-glass" style={{
                            gridColumn: 'span 7',
                            gridRow: 'span 2',
                            padding: '3rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(135deg, #FFFFFF 0%, #F0F9FF 100%)'
                        }}>
                            <div>
                                <div style={{
                                    width: '60px', height: '60px',
                                    background: 'var(--color-primary-blue)',
                                    borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.8rem', marginBottom: '2rem', color: 'white'
                                }}>🛠️</div>
                                <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>งานติดตั้งระดับ Masterpiece</h3>
                                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-sub)', maxWidth: '400px' }}>
                                    เราใช้อุปกรณ์เกรดพรีเมียมทุกชิ้น ท่อน้ำยาหนาพิเศษ งานเดินท่อสวยเนี๊ยบเหมือนเดินสายไฟบ้านตัวเอง รับประกันงานติดตั้งนาน 1 ปีเต็ม
                                </p>
                            </div>
                            <div style={{
                                marginTop: '2rem',
                                height: '200px',
                                background: 'white',
                                borderRadius: '1rem',
                                border: '1px solid #E2E8F0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#CBD5E1', fontWeight: 700
                            }}>
                                [Installation Showcase Image]
                            </div>
                        </div>

                        {/* Feature 2: Wide Box Top Right */}
                        <div className="card-glass" style={{
                            gridColumn: 'span 5',
                            padding: '2.5rem',
                            background: 'white'
                        }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>💰 ราคาโปร่งใส</h3>
                            <p style={{ color: 'var(--color-text-sub)' }}>
                                ใบเสนอราคาชัดเจนทุกรายการ ไม่มีค่าใช้จ่ายแอบแฝง หน้างานจบ งบไม่บานปลาย 100%
                            </p>
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                <span style={{ padding: '0.5rem 1rem', background: '#ECFDF5', color: '#059669', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>Free Consultation</span>
                                <span style={{ padding: '0.5rem 1rem', background: '#EFF6FF', color: '#2563EB', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>No Hidden Fee</span>
                            </div>
                        </div>

                        {/* Feature 4: Additional Wide Box for Calculator (Replacing or adding) */}
                        <div className="card-glass" style={{
                            gridColumn: 'span 5',
                            padding: '2.5rem',
                            background: 'linear-gradient(135deg, #0A84FF 0%, #5856d6 100%)',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'white' }}>🧮 คำนวณขนาดแอร์</h3>
                                <span style={{ fontSize: '2rem' }}>✨</span>
                            </div>
                            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>
                                ไม่แน่ใจขนาดแอร์? ลองใช้เครื่องมือคำนวณ BTU ฟรีของเรา
                            </p>
                            <Link href="/calculator" style={{
                                background: 'white',
                                color: '#0A84FF',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '50px',
                                fontWeight: 700,
                                display: 'inline-block',
                                textAlign: 'center'
                            }}>
                                เริ่มคำนวณ →
                            </Link>
                        </div>

                        {/* Feature 3: Box Bottom Right (Original Reservation) */}
                        <div className="card-glass" style={{
                            gridColumn: 'span 12', // Make this one wider to fit new layout
                            padding: '2.5rem',
                            background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-blue) 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '2rem'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '2rem', color: 'white' }}>จองคิวออนไลน์</h3>
                                    <span style={{ fontSize: '2.5rem' }}>📅</span>
                                </div>
                                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem' }}>
                                    ไม่ต้องรอแอดมินตอบ เลือกเวลาช่างว่างได้ทันทีผ่านเว็บไซต์ รู้ผลไวภายใน 30 วินาที
                                </p>
                            </div>
                            <Link href="/booking" style={{
                                background: 'white',
                                color: 'var(--color-primary-blue)',
                                padding: '1.2rem 3rem',
                                borderRadius: '50px',
                                fontWeight: 800,
                                fontSize: '1.2rem',
                                display: 'inline-block',
                                whiteSpace: 'nowrap'
                            }}>
                                จองเลย →
                            </Link>
                        </div>

                    </div>
                </div>
            </section>


            {/* Service Badges */}
            <ServiceBadges />

            {/* Testimonials Section */}
            <Testimonials />

            {/* Brands Ticker (Mock) */}
            <section style={{ padding: '2rem 0', background: 'white', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.5, filter: 'grayscale(100%)' }}>
                    <h4 style={{ fontSize: '1.2rem' }}>DAIKIN</h4>
                    <h4 style={{ fontSize: '1.2rem' }}>MITSUBISHI</h4>
                    <h4 style={{ fontSize: '1.2rem' }}>CARRIER</h4>
                    <h4 style={{ fontSize: '1.2rem' }}>HAIER</h4>
                    <h4 style={{ fontSize: '1.2rem' }}>PANASONIC</h4>
                </div>
            </section>

            <Footer />
        </main>
    );
}
