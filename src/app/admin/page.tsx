export default function AdminDashboard() {
    return (
        <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem', color: '#1e293b' }}>Dashboard Overview</h1>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { title: 'รายได้รวม (เดือนนี้)', value: '฿1,250,500', trend: '+12%', color: '#3b82f6', icon: '💰' },
                    { title: 'งานติดตั้งรอคิว', value: '45 งาน', trend: '+5', color: '#f59e0b', icon: '🔧' },
                    { title: 'สินค้าใกล้หมด', value: '3 รายการ', trend: 'N/A', color: '#ef4444', icon: '📦' },
                    { title: 'คะแนนความพึงพอใจ', value: '4.9/5', trend: 'Top', color: '#10b981', icon: '⭐' },
                ].map((stat, index) => (
                    <div key={index} style={{
                        background: 'white', padding: '1.5rem', borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{
                                width: '45px', height: '45px',
                                background: `${stat.color}20`, color: stat.color,
                                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                            }}>
                                {stat.icon}
                            </div>
                            <span style={{
                                fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '50px',
                                background: '#ecfdf5', color: '#059669', fontWeight: 600, height: 'fit-content'
                            }}>
                                {stat.trend}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.2rem' }}>{stat.title}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                {/* Recent Bookings */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>งานติดตั้งล่าสุด</h3>
                        <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>ดูทั้งหมด</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                                <th style={{ padding: '0.8rem 0' }}>ลูกค้า</th>
                                <th>บริการ</th>
                                <th>วันที่</th>
                                <th>สถานะ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'คุณวิชัย', service: 'ติดตั้งแอร์ใหม่', date: '08 Feb, 10:00', status: 'Pending' },
                                { name: 'ร้านกาแฟ A', service: 'ล้างแอร์ (5 เครื่อง)', date: '08 Feb, 13:00', status: 'Confirmed' },
                                { name: 'คุณส้ม', service: 'ซ่อมแอร์', date: '09 Feb, 09:00', status: 'Pending' },
                            ].map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem 0', fontWeight: 600 }}>{row.name}</td>
                                    <td style={{ color: '#64748b' }}>{row.service}</td>
                                    <td style={{ color: '#64748b' }}>{row.date}</td>
                                    <td>
                                        <span style={{
                                            padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem',
                                            background: row.status === 'Confirmed' ? '#ecfdf5' : '#fff7ed',
                                            color: row.status === 'Confirmed' ? '#059669' : '#f59e0b',
                                            fontWeight: 600
                                        }}>
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Low Stock Alert */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>⚠️ สินค้าใกล้หมด</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { name: 'Daikin Sabai Plus 12,000 BTU', stock: 2, image: '❄️' },
                            { name: 'Mitsubishi Heavy Duty 9,000 BTU', stock: 1, image: '❄️' },
                            { name: 'Samsung WindFree 18,000 BTU', stock: 0, image: '❄️' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderRadius: '8px', background: '#fff1f2' }}>
                                <div style={{ fontSize: '1.5rem' }}>{item.image}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>เหลือเพียง {item.stock} เครื่อง</div>
                                </div>
                                <button style={{ padding: '0.4rem 0.8rem', background: 'white', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                    เติมของ
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
