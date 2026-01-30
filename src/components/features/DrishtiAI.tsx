'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, X, Sparkles, MapPin, Shield, Phone, AlertCircle } from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

interface DrishtiAIProps {
    isOpen: boolean;
    onClose: () => void;
    userLocation?: { latitude: number; longitude: number };
}

const QUICK_ACTIONS = [
    { icon: Shield, label: 'Safety tips', prompt: 'What are safety tips for tourists in India?' },
    { icon: MapPin, label: 'Nearby help', prompt: 'Find nearest police station or hospital' },
    { icon: Phone, label: 'Emergency', prompt: 'What are emergency numbers in India?' },
    { icon: AlertCircle, label: 'Report issue', prompt: 'How do I report a safety concern?' },
];

const AI_RESPONSES: Record<string, { response: string; suggestions?: string[] }> = {
    'safety': {
        response: `Here are essential safety tips for tourists in India:

🔒 **Personal Safety**
• Keep digital copies of all important documents
• Share your itinerary with family/friends
• Avoid isolated areas after dark
• Trust your instincts - if something feels wrong, leave

📱 **Stay Connected**
• Keep your phone charged at all times
• ABHAYA SOS is always one tap away
• Enable location sharing with trusted contacts

💰 **Financial Safety**
• Use ATMs inside banks during daylight
• Carry minimal cash; prefer digital payments
• Keep valuables in hotel safe

🚕 **Transportation**
• Use only registered taxis or verified ride-shares
• Note vehicle details when traveling
• Avoid shared transport at night`,
        suggestions: ['Emergency numbers', 'Nearby safe zones', 'Report a scam'],
    },
    'emergency': {
        response: `**Emergency Numbers in India:**

🚨 **Universal Emergency**: **112**

🚔 **Police**: **100**
🚒 **Fire**: **101**
🚑 **Ambulance**: **102 / 108**
👩 **Women Helpline**: **1091 / 181**
🏥 **Medical Emergency**: **108**

📱 **ABHAYA SOS**: Use the red SOS button in the app for immediate assistance with your exact location.

💡 Your ABHAYA wristband also has a hidden distress button - double-press to trigger silent SOS.`,
        suggestions: ['Trigger SOS now', 'Find nearest hospital', 'Contact embassy'],
    },
    'police': {
        response: `🚔 **Nearest Police Assistance:**

Based on your location, here are nearby options:

📍 **Tourist Police Station**
   Connaught Place, New Delhi
   Distance: 1.2 km
   📞 +91 11 2336 1235

📍 **Local Police Station**
   Barakhamba Road
   Distance: 0.8 km
   📞 +91 11 2331 5792

🏥 **Nearest Hospital**
   Ram Manohar Lohia Hospital
   Distance: 2.1 km
   📞 +91 11 2336 5525

I can help you navigate to any of these locations or connect you directly.`,
        suggestions: ['Navigate to police', 'Call tourist police', 'File e-FIR'],
    },
    'default': {
        response: `I'm Drishti, your AI safety companion! 👋

I'm here to help you stay safe during your travels in India. I can:

• 🛡️ Provide real-time safety recommendations
• 📍 Help find nearby safe zones and assistance
• 📞 Connect you with emergency services
• 📋 Guide you through reporting issues
• 🗣️ Translate phrases for emergencies
• 🏥 Locate hospitals and police stations

What would you like help with?`,
        suggestions: ['Safety tips', 'Emergency numbers', 'Find help nearby'],
    },
};

export function DrishtiAI({ isOpen, onClose, userLocation }: DrishtiAIProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Send initial greeting
            addBotMessage(AI_RESPONSES.default.response, AI_RESPONSES.default.suggestions);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addBotMessage = (content: string, suggestions?: string[]) => {
        setMessages(prev => [...prev, {
            id: `bot-${Date.now()}`,
            role: 'assistant',
            content,
            timestamp: new Date(),
            suggestions,
        }]);
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

        // Match response based on keywords
        const lowerText = text.toLowerCase();
        let response = AI_RESPONSES.default;

        if (lowerText.includes('safety') || lowerText.includes('tips') || lowerText.includes('safe')) {
            response = AI_RESPONSES.safety;
        } else if (lowerText.includes('emergency') || lowerText.includes('number') || lowerText.includes('call')) {
            response = AI_RESPONSES.emergency;
        } else if (lowerText.includes('police') || lowerText.includes('hospital') || lowerText.includes('near') || lowerText.includes('help')) {
            response = AI_RESPONSES.police;
        }

        setIsTyping(false);
        addBotMessage(response.response, response.suggestions);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
            {/* Header */}
            <header className="px-4 py-3 border-b border-border flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-secondary">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h2 className="font-bold flex items-center gap-2">
                        Drishti AI
                        <Sparkles className="w-4 h-4 text-warning" />
                    </h2>
                    <p className="text-xs text-muted-foreground">Your safety companion</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </header>

            {/* Quick Actions */}
            {messages.length <= 1 && (
                <div className="px-4 py-3 border-b border-border">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {QUICK_ACTIONS.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(action.prompt)}
                                className="flex items-center gap-2 px-3 py-2 bg-background-soft rounded-full text-sm whitespace-nowrap hover:bg-background-muted transition-colors"
                            >
                                <action.icon className="w-4 h-4 text-primary" />
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            'flex',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        <div
                            className={cn(
                                'max-w-[85%] rounded-2xl px-4 py-3',
                                msg.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                    : 'bg-background-soft rounded-bl-md'
                            )}
                        >
                            <p className="text-sm whitespace-pre-line">{msg.content}</p>

                            {/* Suggestions */}
                            {msg.suggestions && msg.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
                                    {msg.suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(suggestion)}
                                            className="px-3 py-1 text-xs bg-background/50 rounded-full hover:bg-background transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-background-soft rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Drishti anything..."
                            className="w-full px-4 py-3 pr-12 bg-background-soft rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary"
                            onClick={() => {/* Voice input */ }}
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                    </div>
                    <Button onClick={() => handleSend()} disabled={!input.trim()}>
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default DrishtiAI;
