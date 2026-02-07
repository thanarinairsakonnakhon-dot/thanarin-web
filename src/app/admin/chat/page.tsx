"use client";

import { useState } from 'react';

// Mock Data: Active Chat Sessions
const initialChats = [
    {
        id: 1,
        customer: 'คุณวิชัย (สุขุมวิท)',
        lastMsg: 'ขอสอบถามราคาติดตั้งแอร์ 24000 BTU ครับ',
        time: '10:30',
        unread: 2,
        avatar: '👨🏻‍💼',
        messages: [
            { id: 1, sender: 'user', text: 'สวัสดีครับ', time: '10:28' },
            { id: 2, sender: 'user', text: 'ขอสอบถามราคาติดตั้งแอร์ 24000 BTU ครับ', time: '10:30' },
        ]
    },
    {
        id: 2,
        customer: 'Guest User #8821',
        lastMsg: 'ร้านเปิดกี่โมงคะ?',
        time: '09:15',
        unread: 0,
        avatar: '👤',
        messages: [
            { id: 1, sender: 'user', text: 'ร้านเปิดกี่โมงคะ?', time: '09:15' },
            { id: 2, sender: 'admin', text: 'เปิดทำการทุกวัน 08:00 - 18:00 ครับ', time: '09:20' },
        ]
    },
    {
        id: 3,
        customer: 'ร้านกาแฟ Space',
        lastMsg: 'ขอบคุณมากครับ',
        time: 'Yesterday',
        unread: 0,
        avatar: '☕',
        messages: [
            { id: 1, sender: 'user', text: 'นัดช่างวันพรุ่งนี้ 13:00 นะครับ', time: 'Yesterday' },
            { id: 2, sender: 'admin', text: 'รับทราบครับ ช่างเอกจะเข้าไปนะครับ', time: 'Yesterday' },
            { id: 3, sender: 'user', text: 'ขอบคุณมากครับ', time: 'Yesterday' },
        ]
    },
];

export default function AdminChatPage() {
    const [selectedChatId, setSelectedChatId] = useState<number>(1);
    const [chats, setChats] = useState(initialChats);
    const [replyText, setReplyText] = useState('');

    const activeChat = chats.find(c => c.id === selectedChatId);

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !activeChat) return;

        const newMsg = {
            id: Date.now(),
            sender: 'admin',
            text: replyText,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };

        const updatedChats = chats.map(c => {
            if (c.id === selectedChatId) {
                return {
                    ...c,
                    messages: [...c.messages, newMsg],
                    lastMsg: `You: ${replyText}`,
                    time: 'Now'
                };
            }
            return c;
        });

        setChats(updatedChats);
        setReplyText('');
    };

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

            {/* Sidebar: Chat List */}
            <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>💬 แชทลูกค้า</h2>
                    <input
                        type="text"
                        placeholder="🔍 ค้นหา..."
                        style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                background: selectedChatId === chat.id ? '#eff6ff' : 'white',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <div style={{
                                    width: '45px', height: '45px',
                                    background: '#e2e8f0', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', flexShrink: 0
                                }}>
                                    {chat.avatar}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {chat.customer}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{chat.time}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                            {chat.lastMsg}
                                        </div>
                                        {chat.unread > 0 && (
                                            <div style={{
                                                background: '#ef4444', color: 'white',
                                                fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 700
                                            }}>
                                                {chat.unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>{activeChat.avatar}</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeChat.customer}</div>
                                <div style={{ fontSize: '0.8rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span> กำลังใช้งาน
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <button style={{ marginRight: '0.5rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>📞 โทร</button>
                                <button style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}>📝 สร้างใบจอง</button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {activeChat.messages.map(msg => (
                                <div key={msg.id} style={{
                                    alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                                    maxWidth: '70%'
                                }}>
                                    <div style={{
                                        padding: '1rem',
                                        borderRadius: '16px',
                                        borderTopLeftRadius: msg.sender === 'admin' ? '16px' : '4px',
                                        borderTopRightRadius: msg.sender === 'admin' ? '4px' : '16px',
                                        background: msg.sender === 'admin' ? '#3b82f6' : 'white',
                                        color: msg.sender === 'admin' ? 'white' : '#1e293b',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', textAlign: msg.sender === 'admin' ? 'right' : 'left' }}>
                                        {msg.time}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendReply} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                            <button type="button" style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>📎</button>
                            <button type="button" style={{ fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}>📷</button>
                            <input
                                type="text"
                                placeholder="พิมพ์ข้อความตอบกลับ..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <button type="submit" className="btn-wow" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px' }}>ส่ง</button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        เลือกแชทเพื่อเริ่มสนทนา
                    </div>
                )}
            </div>

        </div>
    );
}
