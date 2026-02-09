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
            <Navbar />
            <ShopBanner />

            <HeroSlider />

            <PromotionBanner />

            {/* Features Section */}
            <section style={{ padding: '4rem 0' }}>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem'
                    }}>

                        {/* BTU Calculator */}
                        <div className="card-glass" style={{
                            padding: '3rem',
                            background: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            border: '1px solid #E2E8F0',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '32px'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    background: '#F0F9FF',
                                    borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.8rem', marginBottom: '1.5rem', color: '#0A84FF'
                                }}>📐</div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: '#1e293b' }}>คำนวณขนาดแอร์ (BTU)</h3>
                                <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    เลือกแอร์ให้เหมาะกับห้องของคุณด้วยเครื่องมือคำนวณที่แม่นยำที่สุด ช่วยให้คุณประหยัดค่าไฟและได้ความเย็นที่พอดี
                                </p>
                            </div>
                            <Link href="/calculator" className="btn-wow" style={{
                                padding: '1.2rem 2.5rem',
                                borderRadius: '50px',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                textDecoration: 'none'
                            }}>
                                เริ่มคำนวณเลย →
                            </Link>

                            {/* Decorative background element */}
                            <div style={{
                                position: 'absolute',
                                right: '-30px',
                                bottom: '-30px',
                                fontSize: '10rem',
                                opacity: 0.05,
                                zIndex: 0
                            }}>📏</div>
                        </div>

                        {/* Online Booking */}
                        <div className="card-glass" style={{
                            padding: '3rem',
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: '32px'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-10px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(10, 132, 255, 0.2)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.8rem', marginBottom: '1.5rem'
                                }}>📅</div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>จองคิวออนไลน์</h3>
                                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '2rem' }}>
                                    นัดหมายบริการล้างแอร์ ซ่อมแอร์ หรือติดตั้งใหม่ ได้ทันทีตลอด 24 ชั่วโมง สะดวก รวดเร็ว ไม่ต้องรอนาน
                                </p>
                            </div>
                            <Link href="/booking" className="btn-wow" style={{
                                padding: '1.2rem 2.5rem',
                                borderRadius: '50px',
                                fontSize: '1.1rem',
                                textAlign: 'center',
                                textDecoration: 'none',
                                background: 'white',
                                color: '#1e293b'
                            }}>
                                จองคิวล้างแอร์ →
                            </Link>

                            {/* Decorative background element */}
                            <div style={{
                                position: 'absolute',
                                right: '-30px',
                                bottom: '-30px',
                                fontSize: '10rem',
                                opacity: 0.1,
                                zIndex: 0
                            }}>✨</div>
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
