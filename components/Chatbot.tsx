import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage, ChatMessageSender } from '../types';
import { SendIcon, UserIcon, Tooltip } from './shared/IconComponents';
import { useI18n } from '../contexts/I18nContext';
import { languages } from '../i18n/config';

// A simplified markdown parser for chat messages
const Markdown: React.FC<{ content: string }> = ({ content }) => {
    const htmlContent = content
        .replace(/^### (.*$)/gim, '<h3 class="text-md font-semibold mt-2 mb-1">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/^- (.*$)/gim, '<li>$1</li>');
        
    const processedHtml = htmlContent.replace(/((?:<li>.*?<\/li>\s*)+)/gs, '<ul>$1</ul>');
    
    return <div className="prose prose-sm dark:prose-invert max-w-none break-words text-sm" dangerouslySetInnerHTML={{ __html: processedHtml }} />;
};

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === ChatMessageSender.User;
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-white border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0 overflow-hidden">
          <img src="/logo/logo.png" alt="Bot" className="w-8 h-8 object-contain" />
        </div>
      )}
      <div className={`max-w-md p-3 rounded-lg ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-text-primary dark:text-dark-text-primary rounded-bl-none'}`}>
        {isUser ? (
           <p className="text-sm break-words">{message.text}</p>
        ) : (
           <Markdown content={message.text} />
        )}
      </div>
       {isUser && (
        <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </div>
      )}
    </div>
  );
};

const QuickTips: React.FC<{ onTipClick: (tip: string) => void, disabled: boolean }> = ({ onTipClick, disabled }) => {
  const { t } = useI18n();
  const tips = [
    t('chatbot.quickTips.tip1'),
    t('chatbot.quickTips.tip2'),
    t('chatbot.quickTips.tip3'),
    t('chatbot.quickTips.tip4'),
  ];

  return (
    <div className="px-4 pt-3">
      <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">{t('chatbot.quickTips.title')}</h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tips.map((tip, index) => (
          <button
            key={index}
            onClick={() => onTipClick(tip)}
            disabled={disabled}
            className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-text-primary dark:text-dark-text-primary rounded-full whitespace-nowrap border border-slate-200 dark:border-slate-600 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/50 dark:hover:border-primary/70 hover:text-primary dark:hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {tip}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Chatbot: React.FC = () => {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to reset the chat when language changes
  useEffect(() => {
    setMessages([
        {
          id: 'initial',
          sender: ChatMessageSender.Bot,
          text: t('chatbot.initialMessage'),
        },
    ]);
  }, [lang, t]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (messageText.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: ChatMessageSender.User,
      text: messageText,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessageId = `bot-${Date.now()}`;
    setMessages(prev => [...prev, { id: botMessageId, sender: ChatMessageSender.Bot, text: '' }]);
    
    try {
      const langName = languages[lang as keyof typeof languages].englishName;
      const responseStream = await streamChatResponse(messageText, lang, langName);
      for await (const chunk of responseStream) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, text: msg.text + chunk.text } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error streaming chat response:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === botMessageId ? { ...msg, text: t('chatbot.errorMessage') } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, t, lang]);

  return (
    <div className="h-full flex flex-col bg-card dark:bg-dark-card">
      <div className="flex-grow p-4 overflow-y-auto">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isLoading && messages.length > 0 && messages[messages.length-1].sender === ChatMessageSender.Bot && (
           <div className="flex items-start gap-3 my-4 justify-start">
              <div className="w-12 h-12 rounded-full bg-white border border-border dark:border-dark-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/logo/logo.png" alt="Bot" className="w-10 h-10 object-contain" />
              </div>
              <div className="max-w-md p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-text-primary dark:text-dark-text-primary rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-border dark:border-dark-border">
        <QuickTips onTipClick={handleSendMessage} disabled={isLoading} />
        <div className="p-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSendMessage(input)}
              placeholder={t('chatbot.inputPlaceholder')}
              className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-background text-text-primary dark:text-dark-text-primary border-border dark:border-dark-border"
              disabled={isLoading}
            />
            <Tooltip text={t('tooltips.sendMessage')}>
              <button
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || input.trim() === ''}
                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center disabled:bg-slate-300 hover:bg-primary-dark transition-colors"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};