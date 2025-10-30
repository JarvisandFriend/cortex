import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import AIAvatar from "./AIAvatar";
import CodeBlock from "./CodeBlock";
import "./styles/ChatArea.css";

function ChatArea() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const messagesEndRef = useRef(null);
    const chatIdRef = useRef(null);

    // Initialize chatId
    useEffect(() => {
        const storedChatId = localStorage.getItem('cortex_chatId');
        if (storedChatId) {
            chatIdRef.current = storedChatId;
            loadChatHistory(storedChatId);
        } else {
            const newChatId = generateChatId();
            chatIdRef.current = newChatId;
            localStorage.setItem('cortex_chatId', newChatId);
        }
    }, []);

    // Save messages to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('cortex_messages', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, streamingMessage]);

    // Listen for new messages from Bottombar
    useEffect(() => {
        const handleNewMessage = (event) => {
            const { message, files } = event.detail;
            sendMessage(message, files);
        };

        window.addEventListener('sendMessage', handleNewMessage);
        return () => window.removeEventListener('sendMessage', handleNewMessage);
    }, []);

    function generateChatId() {
        return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadChatHistory = async (chatId) => {
        try {
            const response = await fetch(`https://rtgcortex-ai.onrender.com/cortex/chat/history/${chatId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    const formattedMessages = data.messages.map(msg => [
                        { type: 'user', content: msg.You },
                        { type: 'ai', content: msg.Cortex, isMarkdown: true }
                    ]).flat();
                    setMessages(formattedMessages);
                }
            }
        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    };

    const sendMessage = async (messageText, attachedFiles) => {
        if (!messageText.trim() && (!attachedFiles || attachedFiles.length === 0)) return;

        const userMessage = {
            type: 'user',
            content: messageText,
            files: attachedFiles || []
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setStreamingMessage("");

        try {
            const response = await fetch('https://rtgcortex-ai.onrender.com/cortex', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    sender: 'User',
                    chatId: chatIdRef.current
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = "";
            let imageUrl = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const jsonData = JSON.parse(line.slice(6));

                            if (jsonData.type === 'token') {
                                accumulatedContent += jsonData.content;
                                setStreamingMessage(accumulatedContent);
                            } else if (jsonData.type === 'image') {
                                imageUrl = jsonData.url;
                            } else if (jsonData.type === 'done') {
                                const finalContent = imageUrl 
                                    ? `${accumulatedContent}\n\n![Generated Image](${imageUrl})`
                                    : accumulatedContent;

                                const aiMessage = {
                                    type: 'ai',
                                    content: finalContent,
                                    isMarkdown: true
                                };
                                
                                setMessages(prev => [...prev, aiMessage]);
                                setStreamingMessage("");
                            } else if (jsonData.type === 'error') {
                                console.error('Stream error:', jsonData.message);
                                const errorMessage = {
                                    type: 'ai',
                                    content: '❌ Sorry, I encountered an error. Please try again.',
                                    isMarkdown: false
                                };
                                setMessages(prev => [...prev, errorMessage]);
                                setStreamingMessage("");
                            } else if (jsonData.type === 'reset') {
                                clearChat();
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage = {
                type: 'ai',
                content: '❌ Sorry, I encountered an error. Please try again.',
                isMarkdown: false
            };
            setMessages(prev => [...prev, errorMessage]);
            setStreamingMessage("");
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = async () => {
        try {
            await fetch(`https://rtgcortex-ai.onrender.com/cortex/chat/history/${chatIdRef.current}`, {
                method: 'DELETE'
            });
            
            setMessages([]);
            setStreamingMessage("");
            localStorage.removeItem('cortex_messages');
            
            const newChatId = generateChatId();
            chatIdRef.current = newChatId;
            localStorage.setItem('cortex_chatId', newChatId);
        } catch (error) {
            console.error("Error clearing chat:", error);
        }
    };

    const renderContent = (content, isMarkdown) => {
        if (isMarkdown) {
            return (
                <ReactMarkdown
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeString = String(children).replace(/\n$/, '');
                            
                            return !inline && match ? (
                                <CodeBlock
                                    language={match[1]}
                                    value={codeString}
                                />
                            ) : (
                                <code className="inline-code" {...props}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            );
        }
        return <div>{content}</div>;
    };

    return (
        <div className="chat-area">
            {messages.length === 0 && !streamingMessage ? (
                <div className="welcome-screen">
                    <div className="welcome-content">
                        <div className="cortex-logo">
                            <svg viewBox="0 0 100 100" className="logo-svg">
                                <defs>
                                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#667eea" />
                                        <stop offset="100%" stopColor="#764ba2" />
                                    </linearGradient>
                                    <filter id="logoGlow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle cx="50" cy="50" r="20" fill="url(#logoGradient)" filter="url(#logoGlow)" className="logo-core" />
                                <circle cx="50" cy="50" r="35" fill="none" stroke="url(#logoGradient)" strokeWidth="3" className="logo-ring" />
                            </svg>
                        </div>
                        <h1>Hello, I'm Cortex</h1>
                        <p>How can I help you today?</p>
                        
                        <div className="suggestion-chips">
                            <button 
                                className="suggestion-chip"
                                onClick={() => sendMessage("Explain quantum computing in simple terms", [])}
                            >
                                <span className="material-icons-outlined">science</span>
                                <span>Explain quantum computing</span>
                            </button>
                            <button 
                                className="suggestion-chip"
                                onClick={() => sendMessage("Write a creative story about space", [])}
                            >
                                <span className="material-icons-outlined">auto_stories</span>
                                <span>Write a creative story</span>
                            </button>
                            <button 
                                className="suggestion-chip"
                                onClick={() => sendMessage("Help me with coding", [])}
                            >
                                <span className="material-icons-outlined">code</span>
                                <span>Help with coding</span>
                            </button>
                            <button 
                                className="suggestion-chip"
                                onClick={() => sendMessage("Generate an image of a sunset", [])}
                            >
                                <span className="material-icons-outlined">image</span>
                                <span>Generate an image</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="messages-container">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.type}`}>
                            <div className="message-avatar">
                                {msg.type === 'user' ? (
                                    <span className="material-icons-outlined">person</span>
                                ) : (
                                    <AIAvatar />
                                )}
                            </div>
                            <div className="message-content">
                                {msg.files && msg.files.length > 0 && (
                                    <div className="message-files">
                                        {msg.files.map((file, i) => (
                                            <div key={i} className="file-badge">
                                                <span className="material-icons-outlined">description</span>
                                                <span>{file.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="message-text">
                                    {renderContent(msg.content, msg.isMarkdown)}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {streamingMessage && (
                        <div className="message ai streaming">
                            <div className="message-avatar">
                                <AIAvatar isStreaming={true} />
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    {renderContent(streamingMessage, true)}
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {isLoading && !streamingMessage && (
                        <div className="message ai">
                            <div className="message-avatar">
                                <AIAvatar isLoading={true} />
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    <span className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
            )}

            {messages.length > 0 && (
                <button className="clear-chat-btn" onClick={clearChat} title="Clear chat">
                    <span className="material-icons-outlined">delete</span>
                </button>
            )}
        </div>
    );
}

export default ChatArea;