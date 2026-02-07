"use client";

export default function ServiceBadges() {
    const badges = [
        {
            icon: "🛡️",
            title: "รับประกันงานติดตั้ง 1 ปี",
            desc: "มีปัญหาจากการติดตั้ง แก้ไขฟรีทันที"
        },
        {
            icon: "⚡",
            title: "ทีมช่างมืออาชีพ",
            desc: "ผ่านการอบรมและมีใบรับรองความสามารถ"
        },
        {
            icon: "💎",
            title: "อุปกรณ์เกรดพรีเมียม",
            desc: "ท่อน้ำยาหนา สายไฟยี่ห้อดัง ไม่ลดสเปค"
        },
        {
            icon: "🕒",
            title: "ตรงต่อเวลา",
            desc: "นัดกี่โมง ไปถึงหน้างานก่อนเวลาเสมอ"
        }
    ];

    return (
        <section style={{ padding: '4rem 0', background: 'white' }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {badges.map((badge, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            alignItems: 'start',
                            gap: '1rem',
                            padding: '1.5rem',
                            borderRadius: '16px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                flexShrink: 0,
                                width: '50px',
                                height: '50px',
                                background: 'white',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {badge.icon}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1E293B' }}>
                                    {badge.title}
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748B', lineHeight: 1.5 }}>
                                    {badge.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
