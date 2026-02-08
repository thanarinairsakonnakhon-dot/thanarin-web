"use client";

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Generate or get session ID from localStorage
const getSessionId = () => {
    if (typeof window === 'undefined') return '';
    let sessionId = localStorage.getItem('chat_session_id');
    if (!sessionId) {
        sessionId = 'guest_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('chat_session_id', sessionId);
    }
    return sessionId;
};

interface Message {
    id: string;
    message: string;
    sender: string;
    created_at: string;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize session
    useEffect(() => {
        const sid = getSessionId();
        setSessionId(sid);

        // Ensure chat session exists
        const initSession = async () => {
            const { data: existing } = await supabase
                .from('chat_sessions')
                .select('session_id')
                .eq('session_id', sid)
                .single();

            if (!existing) {
                await supabase.from('chat_sessions').insert({
                    session_id: sid,
                    customer_name: 'Guest User',
                    is_active: true
                });
            }
        };

        initSession();
    }, []);

    // Load messages
    useEffect(() => {
        if (!sessionId) return;

        const loadMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data);
            }
        };

        loadMessages();

        // Subscribe to real-time updates
        const channel = supabase
            .channel(`chat_${sessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isLoading || !sessionId) return;

        setIsLoading(true);
        const messageText = inputValue;
        setInputValue('');

        try {
            // Insert message
            await supabase.from('chat_messages').insert({
                session_id: sessionId,
                sender: 'user',
                message: messageText
            });

            // Update session's last message
            await supabase.from('chat_sessions').update({
                last_message: messageText,
                last_message_at: new Date().toISOString(),
                unread_count: supabase.rpc ? 1 : 1,
                is_active: true
            }).eq('session_id', sessionId);

        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, fontFamily: 'var(--font-kanit)' }}>

            {/* Chat Window */}
            <div style={{
                position: 'absolute',
                bottom: '5rem',
                right: '0',
                width: '350px',
                height: '500px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transformOrigin: 'bottom right',
                transform: isOpen ? 'scale(1) translate(0, 0)' : 'scale(0.5) translate(20px, 20px)',
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                border: '1px solid #e2e8f0'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.2rem',
                    background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary-blue) 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '50%', padding: '2px' }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Felix") center/cover' }}></div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>Admin Support</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></span> Online
                        </div>
                    </div>
                    <button
                        onClick={toggleChat}
                        style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
                    >✕</button>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👋</div>
                            <div>สวัสดีครับ! มีอะไรให้ช่วยไหมครับ?</div>
                        </div>
                    )}
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                        }}>
                            <div style={{
                                padding: '0.8rem 1rem',
                                borderRadius: '16px',
                                borderTopLeftRadius: msg.sender === 'user' ? '16px' : '4px',
                                borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                                background: msg.sender === 'user' ? 'var(--color-primary-blue)' : 'white',
                                color: msg.sender === 'user' ? 'white' : '#1e293b',
                                boxShadow: msg.sender === 'user' ? '0 4px 6px -1px rgba(10, 132, 255, 0.2)' : '0 2px 4px -1px rgba(0,0,0,0.05)',
                                fontSize: '0.95rem',
                                lineHeight: '1.5'
                            }}>
                                {msg.message}
                            </div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: '#94a3b8',
                                marginTop: '4px',
                                textAlign: msg.sender === 'user' ? 'right' : 'left'
                            }}>
                                {formatTime(msg.created_at)}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} style={{ padding: '1rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="พิมพ์ข้อความ..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '0.8rem',
                            borderRadius: '99px',
                            border: '1px solid #e2e8f0',
                            outline: 'none',
                            background: '#f8fafc'
                        }}
                    />
                    <button
                        type="submit"
                        className="btn-wow"
                        disabled={isLoading}
                        style={{
                            padding: '0.8rem',
                            borderRadius: '50%',
                            width: '45px',
                            height: '45px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'none'
                        }}
                    >
                        ➤
                    </button>
                </form>
            </div>

            {/* Floating Button */}
            <button
                onClick={toggleChat}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-blue)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(10, 132, 255, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'rotate(90deg) scale(0)' : 'scale(1)'
                }}
            >
                💬
            </button>
            <button
                onClick={toggleChat}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
                    pointerEvents: isOpen ? 'auto' : 'none'
                }}
            >
                ✕
            </button>

        </div>
    );
}
