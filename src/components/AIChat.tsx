import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useGenAI } from '../hooks/useGenAI';
import type { ChatMessage } from '../hooks/useGenAI';
import { useSpeech } from '../hooks/useSpeech';
import { isSafeText } from '../utils/validation';
import { Button } from './UI/Button';

interface AIChatProps {
  language: string;
  onNavigateToService?: (serviceId: string) => void;
}

const chatTranslations: Record<string, Record<string, string>> = {
  en: {
    placeholder: 'Ask about eligibility, documents, or register a business...',
    suggestions: 'Quick Suggestions',
    suggestion1: 'Am I eligible for CivicCare?',
    suggestion2: 'What is the CivicHealth income limit?',
    suggestion3: 'How long to get a business license?',
    suggestion4: 'Tell me about solar energy rebates',
    clearBtn: 'Clear History',
    engineLocal: 'Local Engine',
    engineGemini: 'Gemini 2.5 Flash API',
    readAloud: 'Read aloud',
    stopReading: 'Stop reading',
    listening: 'Listening...',
    micLabel: 'Start voice typing',
    sendLabel: 'Send message',
    welcome: 'Hello! I am your AI Civic Companion. Ask me any questions about local municipal services, required documents, or eligibility guidelines.',
    sourceLabel: 'Engine',
    serviceLink: 'Open Service Details'
  },
  es: {
    placeholder: 'Pregunte sobre elegibilidad, documentos o registro de negocios...',
    suggestions: 'Sugerencias rápidas',
    suggestion1: '¿Soy elegible para CivicCare?',
    suggestion2: '¿Cuál es el límite de ingresos para CivicHealth?',
    suggestion3: '¿Cuánto tiempo toma la licencia comercial?',
    suggestion4: 'Reembolsos de energía solar en casa',
    clearBtn: 'Limpiar Historial',
    engineLocal: 'Motor Local',
    engineGemini: 'API de Gemini 2.5 Flash',
    readAloud: 'Leer en voz alta',
    stopReading: 'Detener lectura',
    listening: 'Escuchando...',
    micLabel: 'Iniciar dictado por voz',
    sendLabel: 'Enviar mensaje',
    welcome: '¡Hola! Soy su acompañante cívico de IA. Pregúnteme sobre servicios municipales, documentos requeridos o guías de elegibilidad.',
    sourceLabel: 'Motor',
    serviceLink: 'Ver detalles del servicio'
  },
  fr: {
    placeholder: 'Posez des questions sur l\'éligibilité, les documents...',
    suggestions: 'Suggestions rapides',
    suggestion1: 'Suis-je éligible à CivicCare ?',
    suggestion2: 'Quelle est la limite de revenu de CivicHealth ?',
    suggestion3: 'Délai d\'obtention d\'une licence commerciale ?',
    suggestion4: 'Parlez-moi des aides à l\'énergie solaire',
    clearBtn: 'Effacer l\'historique',
    engineLocal: 'Moteur local',
    engineGemini: 'API Gemini 2.5 Flash',
    readAloud: 'Lire à haute voix',
    stopReading: 'Arrêter la lecture',
    listening: 'Écoute...',
    micLabel: 'Démarrer la saisie vocale',
    sendLabel: 'Envoyer le message',
    welcome: 'Bonjour ! Je suis votre compagnon civique IA. Posez-moi des questions sur les services municipaux, les documents requis ou l\'éligibilité.',
    sourceLabel: 'Moteur',
    serviceLink: 'Détails du service'
  },
  hi: {
    placeholder: 'पात्रता, आवश्यक दस्तावेजों या व्यवसाय पंजीकरण के बारे में पूछें...',
    suggestions: 'त्वरित सुझाव',
    suggestion1: 'क्या मैं CivicCare के लिए पात्र हूँ?',
    suggestion2: 'CivicHealth की आय सीमा क्या है?',
    suggestion3: 'व्यापार लाइसेंस मिलने में कितना समय लगता है?',
    suggestion4: 'सौर ऊर्जा छूट के बारे में बताएं',
    clearBtn: 'इतिहास साफ़ करें',
    engineLocal: 'स्थानीय इंजन',
    engineGemini: 'जेमिनी 2.5 फ़्लैश एपीआई',
    readAloud: 'जोर से पढ़ें',
    stopReading: 'पढ़ना बंद करें',
    listening: 'सुन रहा है...',
    micLabel: 'आवाज टाइपिंग शुरू करें',
    sendLabel: 'संदेश भेजें',
    welcome: 'नमस्ते! मैं आपका एआई नागरिक साथी हूँ। स्थानीय नागरिक सेवाओं, आवश्यक दस्तावेजों या पात्रता नियमों के बारे में मुझसे पूछें।',
    sourceLabel: 'इंजन',
    serviceLink: 'सेवा विवरण खोलें'
  }
};

export const AIChat: React.FC<AIChatProps> = ({ language, onNavigateToService }) => {
  const t = chatTranslations[language] || chatTranslations.en;
  
  const [input, setInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  
  const { messages, isLoading, error, sendMessage, clearChat } = useGenAI();
  const { 
    isListening, 
    transcript, 
    isSpeaking, 
    hasSpeechSupport,
    startListening, 
    stopListening, 
    speakText, 
    stopSpeaking 
  } = useSpeech();

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync transcription to input bar
  useEffect(() => {
    if (transcript) {
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current?.scrollIntoView) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setInputError(null);
    const textCheck = isSafeText(input, 1000);
    if (!textCheck.isValid) {
      setInputError(textCheck.error || 'Invalid input.');
      return;
    }

    const messageToSend = input.trim();
    setInput('');
    await sendMessage(messageToSend, language);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInput('');
    setInputError(null);
    await sendMessage(suggestion, language);
  };

  return (
    <div className="chat-view-container">
      <div className="chat-card">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="header-info">
            <Sparkles className="sparkles-icon" size={20} aria-hidden="true" />
            <div>
              <h2 className="chat-title">AI Civic Companion</h2>
              <p className="chat-subtitle">Supporting multilingual civic guides & document discovery</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                clearChat();
                stopSpeaking();
              }}
              className="clear-chat-btn"
            >
              <Trash2 size={16} aria-hidden="true" />
              <span>{t.clearBtn}</span>
            </Button>
          )}
        </div>

        {/* Chat Feed */}
        <div className="chat-feed" role="log" aria-label="Conversation Feed">
          {/* Welcome Message */}
          <div className="message-wrapper assistant">
            <div className="message-bubble">
              <p>{t.welcome}</p>
            </div>
            <div className="message-meta">
              <span>{t.engineLocal}</span>
            </div>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
              <div className="message-bubble">
                <div className="message-text">
                  {msg.role === 'model' ? (
                    // Convert line breaks and simple list items into HTML paragraphs & bullets
                    // This avoids full Markdown parsers while ensuring clean visual rendering
                    msg.content.split('\n').map((line, idx) => {
                      if (line.startsWith('- ')) {
                        return <li key={idx} className="chat-bullet">{line.replace(/-\s+/, '')}</li>;
                      }
                      if (line.startsWith('### ')) {
                        return <h4 key={idx} className="chat-h4">{line.replace(/###\s+/, '')}</h4>;
                      }
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <strong key={idx} className="chat-strong-block">{line.replace(/\*\*/g, '')}</strong>;
                      }
                      return line.trim() ? <p key={idx} className="chat-paragraph">{line}</p> : <div key={idx} className="chat-spacer" />;
                    })
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>

                {/* AI Interactive controls (TTS and Service Portal links) */}
                {msg.role === 'model' && (
                  <div className="message-actions">
                    <button
                      className={`action-btn-tts ${isSpeaking ? 'active' : ''}`}
                      onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content, language)}
                      title={isSpeaking ? t.stopReading : t.readAloud}
                      aria-label={isSpeaking ? t.stopReading : t.readAloud}
                    >
                      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      <span>{isSpeaking ? 'Stop' : 'Read'}</span>
                    </button>
                    
                    {msg.data?.serviceId && onNavigateToService && (
                      <button
                        className="action-btn-link"
                        onClick={() => onNavigateToService(msg.data.serviceId)}
                      >
                        <ArrowRight size={14} />
                        <span>{t.serviceLink}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="message-meta">
                <span>{msg.role === 'user' ? 'You' : `${t.sourceLabel}: ${msg.source === 'gemini' ? t.engineGemini : t.engineLocal}`}</span>
              </div>
            </div>
          ))}

          {/* AI Loader */}
          {isLoading && (
            <div className="message-wrapper assistant">
              <div className="message-bubble bubble-loading">
                <span className="dot-spinner"></span>
                <span className="dot-spinner"></span>
                <span className="dot-spinner"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="chat-error-banner" role="alert">
              <ShieldAlert size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length === 0 && (
          <div className="suggestions-container">
            <h3 className="suggestions-title">{t.suggestions}</h3>
            <div className="suggestions-grid">
              <button 
                className="suggestion-chip" 
                onClick={() => handleSuggestionClick(t.suggestion1)}
              >
                {t.suggestion1}
              </button>
              <button 
                className="suggestion-chip" 
                onClick={() => handleSuggestionClick(t.suggestion2)}
              >
                {t.suggestion2}
              </button>
              <button 
                className="suggestion-chip" 
                onClick={() => handleSuggestionClick(t.suggestion3)}
              >
                {t.suggestion3}
              </button>
              <button 
                className="suggestion-chip" 
                onClick={() => handleSuggestionClick(t.suggestion4)}
              >
                {t.suggestion4}
              </button>
            </div>
          </div>
        )}

        {/* Input Controls */}
        <form onSubmit={handleSend} className="chat-input-form" role="search">
          <div className="input-group">
            {/* Voice Input Button */}
            {hasSpeechSupport && (
              <button
                type="button"
                className={`voice-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={isListening ? stopListening : () => startListening(language)}
                title={t.micLabel}
                aria-label={t.micLabel}
                aria-pressed={isListening}
              >
                {isListening ? <MicOff size={20} className="mic-icon animate-pulse" /> : <Mic size={20} className="mic-icon" />}
              </button>
            )}

            <input
              type="text"
              className="chat-text-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder={isListening ? t.listening : t.placeholder}
              aria-label="Ask AI Companion"
              disabled={isListening}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={!input.trim() || isLoading || isListening}
              ariaLabel={t.sendLabel}
            >
              <Send size={18} aria-hidden="true" />
            </Button>
          </div>

          {inputError && (
            <div className="input-error-message" role="alert">
              <ShieldAlert size={14} aria-hidden="true" />
              <span>{inputError}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
