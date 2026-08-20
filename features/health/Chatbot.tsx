import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatMessage } from '../../shared/types';
import { GoogleGenAI } from "@google/genai";
import { XMarkIcon, PaperAirplaneIcon, StethoscopeIcon } from '../../shared/Icons';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Use Gemini as primary, fallback to OpenAI if Gemini fails
const useGemini = !!GEMINI_API_KEY;
const useOpenAI = !!OPENAI_API_KEY;

if (!useGemini && !useOpenAI) {
  console.warn("Neither GEMINI_API_KEY nor OPENAI_API_KEY environment variables are set. Using mock responses for development.");
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const geminiAI = useMemo(() => {
    if (!useGemini || !GEMINI_API_KEY || GEMINI_API_KEY === 'undefined' || GEMINI_API_KEY === '') {
      return null;
    }
    return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }, []);

  const chatHistory = useRef<string[]>([]);

  // Mock responses for development when API key is not set
  const getMockResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('headache')) {
      return "I'm sorry to hear you're experiencing a headache. Can you tell me more about it? For example, how long has it been going on, and is it accompanied by any other symptoms like nausea or sensitivity to light?";
    } else if (lowerMessage.includes('fever')) {
      return "A fever can be concerning. What's your temperature, and have you noticed any other symptoms? Rest and hydration are important. If your fever is high or persistent, please consult a healthcare professional.";
    } else if (lowerMessage.includes('cough')) {
      return "Coughs can be caused by many things. Is it dry or productive? How long have you had it? For now, staying hydrated and using a humidifier might help.";
    } else if (lowerMessage.includes('stomach') || lowerMessage.includes('pain')) {
      return "Stomach pain can have various causes. Can you describe the pain - is it sharp, dull, constant? Any nausea, vomiting, or changes in bowel habits?";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help with your health concerns. What symptoms are you experiencing today?";
    } else {
      return "Thank you for sharing that. To better understand your health situation, could you provide more details about your symptoms? Based on what you've told me, would you like me to help analyze this for potential health insights?";
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 'initial', text: 'Hello! I\'m your AI Health Assistant. How are you feeling today? You can describe your symptoms to me.', sender: 'bot' }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), text: trimmedInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let botResponse = '';
      let usedGemini = false;

      // Try Gemini first
      if (useGemini && geminiAI) {
        try {
          // Build conversation history for context
          const conversationHistory = chatHistory.current.concat([`User: ${trimmedInput}`]).join('\n');

          const prompt = `You are a friendly and helpful AI Health Assistant. Your goal is to understand the user's health concerns by asking clarifying questions. Keep your responses concise, empathetic, and conversational. When you have enough information, ask the user if they would like you to perform a full health analysis based on the conversation.

Previous conversation:
${conversationHistory}

Current user message: ${trimmedInput}

Respond as a helpful health assistant.`;

          const response = await geminiAI.models.generateContent({
            model: "gemini-1.5-pro",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          });

          botResponse = response.text.trim();
          usedGemini = true;

          // Update conversation history
          chatHistory.current.push(`User: ${trimmedInput}`);
          chatHistory.current.push(`Assistant: ${botResponse}`);

          // Keep only last 10 exchanges to avoid token limits
          if (chatHistory.current.length > 20) {
            chatHistory.current = chatHistory.current.slice(-20);
          }

        } catch (geminiError) {
          console.warn("Gemini API failed, trying OpenAI:", geminiError);
        }
      }

      // Fallback to OpenAI if Gemini failed or not available
      if (!botResponse && useOpenAI) {
        try {
          const conversationHistory = chatHistory.current.concat([`User: ${trimmedInput}`]).join('\n');

          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are a friendly and helpful AI Health Assistant. Your goal is to understand the user\'s health concerns by asking clarifying questions. Keep your responses concise, empathetic, and conversational. When you have enough information, ask the user if they would like you to perform a full health analysis based on the conversation.'
                },
                {
                  role: 'user',
                  content: `${conversationHistory}\n\nCurrent user message: ${trimmedInput}`
                }
              ],
              temperature: 0.7,
              max_tokens: 500,
            }),
          });

          if (openaiResponse.ok) {
            const openaiData = await openaiResponse.json();
            botResponse = openaiData.choices[0].message.content.trim();

            // Update conversation history
            chatHistory.current.push(`User: ${trimmedInput}`);
            chatHistory.current.push(`Assistant: ${botResponse}`);

            // Keep only last 10 exchanges
            if (chatHistory.current.length > 20) {
              chatHistory.current = chatHistory.current.slice(-20);
            }
          } else {
            throw new Error(`OpenAI API error: ${openaiResponse.status}`);
          }
        } catch (openaiError) {
          console.warn("OpenAI API failed:", openaiError);
        }
      }

      // Use mock response if both APIs failed or not configured
      if (!botResponse) {
        console.log('Using mock response for message:', trimmedInput);
        botResponse = getMockResponse(trimmedInput);
      }

      // Add bot response to messages
      const botMessageId = `bot-${Date.now()}`;
      setMessages(prev => [...prev, { id: botMessageId, text: botResponse, sender: 'bot' }]);

    } catch (error) {
      console.error('Error in chatbot:', error);
      setMessages(prev => [...prev, { id: 'error', text: 'Sorry, I\'m having trouble connecting right now. Please try again later.', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out">
      <header className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-white rounded-t-2xl shadow-lg">
        <div className="flex items-center space-x-2">
          <StethoscopeIcon className="w-6 h-6" />
          <h3 className="font-bold text-lg">AI Health Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-black/20">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </header>

      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-brand-teal-100 flex items-center justify-center flex-shrink-0"><StethoscopeIcon className="w-5 h-5 text-brand-teal-600" /></div>}
            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl shadow ${message.sender === 'user'
              ? 'bg-brand-teal-600 text-white rounded-br-none'
              : 'bg-slate-700 text-slate-200 rounded-bl-none'
              }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-8 h-8 rounded-full bg-brand-teal-100 flex items-center justify-center flex-shrink-0"><StethoscopeIcon className="w-5 h-5 text-brand-teal-600" /></div>
            <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-2xl bg-slate-700 text-slate-200 rounded-bl-none shadow">
              <div className="flex items-center space-x-1">
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/80 bg-slate-800/50 rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="w-full px-4 py-3 pr-12 border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-teal-500"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-gradient-to-r from-brand-teal-500 to-brand-green-500 text-white hover:from-brand-teal-600 hover:to-brand-green-600 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;