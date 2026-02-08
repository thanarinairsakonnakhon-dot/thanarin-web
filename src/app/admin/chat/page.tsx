"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ChatSession {
    id: string;
    session_id: string;
    customer_name: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
    is_active: boolean;
}

interface Message {
    id: string;
    session_id: string;
    sender: string;
    message: string;
    created_at: string;
}

export default function AdminChatPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [replyText, setReplyText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load chat sessions
    useEffect(() => {
        const loadSessions = async () => {
            const { data } = await supabase
                .from('chat_sessions')
                .select('*')
                .order('last_message_at', { ascending: false });

            if (data) {
                setSessions(data);
                // Select first unread session
                const unreadSession = data.find(s => s.unread_count > 0);
                if (unreadSession && !selectedSessionId) {
                    setSelectedSessionId(unreadSession.session_id);
                } else if (data.length > 0 && !selectedSessionId) {
                    setSelectedSessionId(data[0].session_id);
                }
            }
        };

        loadSessions();

        // Subscribe to new sessions
        const channel = supabase
            .channel('admin_chat_sessions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'chat_sessions'
            }, () => {
                loadSessions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedSessionId]);

    // Load messages for selected session
    useEffect(() => {
        if (!selectedSessionId) return;

        const loadMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', selectedSessionId)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data);
            }

            // Reset unread count
            await supabase
                .from('chat_sessions')
                .update({ unread_count: 0 })
                .eq('session_id', selectedSessionId);
        };

        loadMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`admin_messages_${selectedSessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${selectedSessionId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedSessionId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedSessionId || isLoading) return;

        setIsLoading(true);
        const messageText = replyText;
        setReplyText('');

        try {
            // Insert admin message
            await supabase.from('chat_messages').insert({
                session_id: selectedSessionId,
                sender: 'admin',
                message: messageText
            });

            // Update session's last message
            await supabase.from('chat_sessions').update({
                last_message: `Admin: ${messageText}`,
                last_message_at: new Date().toISOString()
            }).eq('session_id', selectedSessionId);

        } catch (error) {
            console.error('Error sending reply:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        } else if (hours < 48) {
            return 'เมื่อวาน';
        } else {
            return date.toLocaleDateString('th-TH');
        }
    };

    const activeSession = sessions.find(s => s.session_id === selectedSessionId);

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 140px)', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>

            {/* Sidebar: Chat List */}
            <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>💬 แชทลูกค้า</h2>
                        <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {sessions.filter(s => s.unread_count > 0).length} รอตอบ
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={() => setShowAll(false)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: !showAll ? '#3b82f6' : '#e2e8f0',
                                color: !showAll ? 'white' : '#64748b',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                        >
                            รอตอบ
                        </button>
                        <button
                            onClick={() => setShowAll(true)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: showAll ? '#3b82f6' : '#e2e8f0',
                                color: showAll ? 'white' : '#64748b',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600
                            }}
                        >
                            ทั้งหมด
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {(showAll ? sessions : sessions.filter(s => s.unread_count > 0)).length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{showAll ? '📭' : '✅'}</div>
                            <div>{showAll ? 'ยังไม่มีแชทลูกค้า' : 'ไม่มีแชทรอตอบ'}</div>
                        </div>
                    )}
                    {(showAll ? sessions : sessions.filter(s => s.unread_count > 0)).map(session => (
                        <div
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.session_id)}
                            style={{
                                padding: '1rem',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                background: selectedSessionId === session.session_id ? '#eff6ff' : 'white',
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
                                    👤
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {session.customer_name || 'Guest User'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                            {session.last_message_at ? formatTime(session.last_message_at) : ''}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                            {session.last_message || 'เริ่มการสนทนา...'}
                                        </div>
                                        {session.unread_count > 0 && (
                                            <div style={{
                                                background: '#ef4444', color: 'white',
                                                fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 700
                                            }}>
                                                {session.unread_count}
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
                {activeSession ? (
                    <>
                        {/* Chat Header */}
                        <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ fontSize: '1.5rem' }}>👤</div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeSession.customer_name || 'Guest User'}</div>
                                <div style={{ fontSize: '0.8rem', color: activeSession.is_active ? '#22c55e' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '8px', height: '8px', background: activeSession.is_active ? '#22c55e' : '#94a3b8', borderRadius: '50%' }}></span>
                                    {activeSession.is_active ? 'กำลังใช้งาน' : 'ออฟไลน์'}
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8' }}>
                                Session: {activeSession.session_id.substring(0, 15)}...
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {messages.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                                    <div>ยังไม่มีข้อความ</div>
                                </div>
                            )}
                            {messages.map(msg => (
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
                                        {msg.message}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', textAlign: msg.sender === 'admin' ? 'right' : 'left' }}>
                                        {formatTime(msg.created_at)}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendReply} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
                            <input
                                type="text"
                                placeholder="พิมพ์ข้อความตอบกลับ..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={isLoading}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                            <button type="submit" className="btn-wow" disabled={isLoading} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px' }}>
                                {isLoading ? '...' : 'ส่ง'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                            <div>เลือกแชทเพื่อเริ่มสนทนา</div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
