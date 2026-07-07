import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  FileCheck,
  Calendar,
  ListTodo
} from 'lucide-react';

import { useGenAI } from '../hooks/useGenAI';
import { useSpeech } from '../hooks/useSpeech';
import { isSafeText } from '../utils/validation';
import { Card } from './UI/Card';
import { Button } from './UI/Button';

interface DocumentSimplifierProps {
  language: string;
}

const simplifierTranslations: Record<string, Record<string, string>> = {
  en: {
    title: 'Policy Legalese Simplifier',
    subtitle: 'Paste complex municipal bylaws, rules, or agreements. Civic AI will translate them into plain language, action points, and deadlines.',
    placeholder: 'Paste the complex government policy text here...',
    sampleBtn: 'Load Sample Legalese Clause',
    simplifyBtn: 'Simplify Policy with AI',
    simplifying: 'AI is simplifying text...',
    tabSummary: 'TL;DR Summary',
    tabActions: 'Action Items',
    tabDeadlines: 'Deadlines',
    tabChecklist: 'Document Checklist',
    readAloud: 'Read Summary Aloud',
    stopReading: 'Stop Reading',
    noResult: 'No simplified policy to display. Paste text above and click simplify.',
    sampleText: 'Pursuant to Municipal Code Section 12-4B, sub-section (iv), any residential real property owner seeking an exemption, credit, or rebate for photovoltaic conversion apparatus installation must submit a verified certification of capacity parameters within thirty (30) days of execution of contract. Failure to file by April 15th will result in a forfeit of municipal matches. All files must be accompanied by a property deed registry copy and an engineer invoice.'
  },
  es: {
    title: 'Simplificador de Textos Legales',
    subtitle: 'Pegue reglamentos cívicos o contratos complejos. La IA los convertirá en resúmenes simples, puntos de acción y plazos.',
    placeholder: 'Pegue el texto legal complejo aquí...',
    sampleBtn: 'Cargar Cláusula de Ejemplo',
    simplifyBtn: 'Simplificar con IA',
    simplifying: 'La IA está simplificando el texto...',
    tabSummary: 'Resumen Simple',
    tabActions: 'Pasos a Seguir',
    tabDeadlines: 'Fechas Límite',
    tabChecklist: 'Lista de Requisitos',
    readAloud: 'Leer Resumen en voz alta',
    stopReading: 'Detener Lectura',
    noResult: 'No hay políticas simplificadas que mostrar. Pegue texto arriba y presione simplificar.',
    sampleText: 'De conformidad con la Sección 12-4B del Código Municipal, subsección (iv), cualquier propietario de bienes raíces residenciales que busque una exención, crédito o reembolso por la instalación de un aparato de conversión fotovoltaica debe presentar una certificación verificada de los parámetros de capacidad dentro de los treinta (30) días de la ejecución del contrato. No presentar la solicitud antes del 15 de abril resultará en la pérdida de los fondos de contrapartida municipales. Todos los archivos deben estar acompañados de una copia del registro de la escritura de propiedad y una factura del ingeniero.'
  },
  fr: {
    title: 'Simplificateur de Directives Civiques',
    subtitle: 'Collez les règlements municipaux complexes. L\'IA en extraira un résumé simple, des étapes d\'action et les dates butoirs.',
    placeholder: 'Collez le texte réglementaire complexe ici...',
    sampleBtn: 'Charger un exemple de clause',
    simplifyBtn: 'Simplifier avec l\'IA',
    simplifying: 'L\'IA simplifie le texte...',
    tabSummary: 'Résumé simple',
    tabActions: 'Étapes d\'action',
    tabDeadlines: 'Délais & Dates',
    tabChecklist: 'Documents requis',
    readAloud: 'Lire le résumé à haute voix',
    stopReading: 'Arrêter la lecture',
    noResult: 'Aucun document simplifié à afficher. Collez du texte ci-dessus et cliquez sur simplifier.',
    sampleText: 'Conformément à la section 12-4B du code municipal, paragraphe (iv), tout propriétaire de biens immobiliers résidentiels demandant une exonération, un crédit ou un remboursement pour l\'installation d\'un appareil de conversion photovoltaïque doit soumettre une certification vérifiée des paramètres de capacité dans les trente (30) jours suivant l\'exécution du contrat. Le fait de ne pas déposer de dossier avant le 15 avril entraînera la déchéance des contreparties municipales. Tous les dossiers doivent être accompagnés d\'une copie du registre des titres de propriété et d\'une facture d\'ingénieur.'
  },
  hi: {
    title: 'सरकारी नीति सरलीकरण',
    subtitle: 'जटिल सरकारी नियमों या दस्तावेजों को यहाँ पेस्ट करें। एआई इसे सरल भाषा, मुख्य कार्यों और समय सीमा में विभाजित करेगा।',
    placeholder: 'जटिल सरकारी नीति पाठ यहाँ पेस्ट करें...',
    sampleBtn: 'नमूना दस्तावेज़ लोड करें',
    simplifyBtn: 'एआई से सरल बनाएं',
    simplifying: 'एआई सरलीकरण कर रहा है...',
    tabSummary: 'सरल सारांश',
    tabActions: 'मुख्य कार्य',
    tabDeadlines: 'समय सीमा',
    tabChecklist: 'दस्तावेज़ सूची',
    readAloud: 'सारांश जोर से पढ़ें',
    stopReading: 'पढ़ना बंद करें',
    noResult: 'प्रदर्शित करने के लिए कोई सरलीकृत नीति नहीं है। ऊपर पाठ पेस्ट करें और सरल बनाएं पर क्लिक करें।',
    sampleText: 'नगर पालिका कोड धारा 12-4B, उप-धारा (iv) के अनुसार, सौर ऊर्जा पैनल स्थापना के लिए छूट या रिफंड चाहने वाले किसी भी आवासीय संपत्ति मालिक को अनुबंध निष्पादन के तीस (30) दिनों के भीतर क्षमता मापदंडों का एक सत्यापित प्रमाण पत्र प्रस्तुत करना होगा। 15 अप्रैल तक आवेदन करने में विफल रहने पर सरकारी छूट का लाभ समाप्त हो जाएगा। सभी फाइलों के साथ संपत्ति विलेख की रजिस्ट्री प्रति और इंजीनियर का बिल संलग्न होना आवश्यक है।'
  }
};

type SimplifierTab = 'summary' | 'actions' | 'deadlines' | 'checklist';

export const DocumentSimplifier: React.FC<DocumentSimplifierProps> = ({ language }) => {
  const t = simplifierTranslations[language] || simplifierTranslations.en;

  const [rawText, setRawText] = useState('');
  const [activeTab, setActiveTab] = useState<SimplifierTab>('summary');
  
  // Local simplified state
  const [simplifiedResult, setSimplifiedResult] = useState<{
    summary: string;
    actionItems: string[];
    deadlines: string[];
    checklist: string[];
    source: string;
  } | null>(null);

  const [inputError, setInputError] = useState<string | null>(null);

  const { simplifyPolicy, isLoading, error } = useGenAI();
  const { isSpeaking, speakText, stopSpeaking } = useSpeech();

  const handleLoadSample = () => {
    setRawText(t.sampleText);
    setInputError(null);
  };

  const handleSimplify = async (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const safeCheck = isSafeText(rawText, 3000);
    if (!safeCheck.isValid) {
      setInputError(safeCheck.error || 'Invalid text input.');
      return;
    }

    try {
      stopSpeaking();
      const res = await simplifyPolicy(rawText);
      setSimplifiedResult({
        summary: res.summary,
        actionItems: res.actionItems,
        deadlines: res.deadlines,
        checklist: res.checklist,
        source: res.source
      });
      setActiveTab('summary');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="simplifier-view-container">
      <Card className="simplifier-form-card">
        <h2 className="simplifier-title">{t.title}</h2>
        <p className="simplifier-subtitle">{t.subtitle}</p>

        <form onSubmit={handleSimplify} className="simplifier-form">
          <div className="form-group">
            <div className="label-with-sample">
              <label htmlFor="policy-textarea" className="sr-only">Government policy text</label>
              <button 
                type="button" 
                className="load-sample-btn"
                onClick={handleLoadSample}
              >
                {t.sampleBtn}
              </button>
            </div>

            <textarea
              id="policy-textarea"
              className={`simplifier-textarea ${inputError ? 'error' : ''}`}
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder={t.placeholder}
              required
            />
            {inputError && (
              <span className="error-text" role="alert">
                <ShieldAlert size={12} aria-hidden="true" />
                {inputError}
              </span>
            )}
          </div>

          <div className="form-actions-simplifier">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!rawText.trim() || isLoading}
              className="simplify-btn-submit"
            >
              {t.simplifyBtn}
            </Button>
          </div>
        </form>
      </Card>

      {/* Simplified Display Area */}
      {simplifiedResult && (
        <Card className="simplifier-result-card" role="region" aria-label="Simplified Policy Results">
          {/* Tab Navigation */}
          <div className="result-tabs-bar" role="tablist" aria-label="Simplified policy details">
            <button
              role="tab"
              aria-selected={activeTab === 'summary'}
              aria-controls="panel-summary"
              id="tab-summary"
              className={`result-tab ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <FileText size={16} aria-hidden="true" />
              <span>{t.tabSummary}</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'actions'}
              aria-controls="panel-actions"
              id="tab-actions"
              className={`result-tab ${activeTab === 'actions' ? 'active' : ''}`}
              onClick={() => setActiveTab('actions')}
            >
              <ListTodo size={16} aria-hidden="true" />
              <span>{t.tabActions}</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'deadlines'}
              aria-controls="panel-deadlines"
              id="tab-deadlines"
              className={`result-tab ${activeTab === 'deadlines' ? 'active' : ''}`}
              onClick={() => setActiveTab('deadlines')}
            >
              <Calendar size={16} aria-hidden="true" />
              <span>{t.tabDeadlines}</span>
            </button>

            <button
              role="tab"
              aria-selected={activeTab === 'checklist'}
              aria-controls="panel-checklist"
              id="tab-checklist"
              className={`result-tab ${activeTab === 'checklist' ? 'active' : ''}`}
              onClick={() => setActiveTab('checklist')}
            >
              <FileCheck size={16} aria-hidden="true" />
              <span>{t.tabChecklist}</span>
            </button>
          </div>

          {/* Tab Panels */}
          <div className="tab-panel-content">
            {activeTab === 'summary' && (
              <div 
                id="panel-summary" 
                role="tabpanel" 
                aria-labelledby="tab-summary"
                className="panel-content animate-fade"
              >
                <div className="summary-text-block">
                  <p>{simplifiedResult.summary}</p>
                </div>

                <div className="summary-audio-controls">
                  <Button
                    variant="secondary"
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(simplifiedResult.summary, language)}
                  >
                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div 
                id="panel-actions" 
                role="tabpanel" 
                aria-labelledby="tab-actions"
                className="panel-content animate-fade"
              >
                <ol className="ordered-action-list">
                  {simplifiedResult.actionItems.map((item, idx) => (
                    <li key={idx} className="action-step-item">
                      <div className="step-number-bullet" aria-hidden="true">{idx + 1}</div>
                      <p className="step-content">{item}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {activeTab === 'deadlines' && (
              <div 
                id="panel-deadlines" 
                role="tabpanel" 
                aria-labelledby="tab-deadlines"
                className="panel-content animate-fade"
              >
                <ul className="deadline-bullet-list">
                  {simplifiedResult.deadlines.map((item, idx) => (
                    <li key={idx} className="deadline-item-row">
                      <Calendar size={18} className="deadline-icon" aria-hidden="true" />
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'checklist' && (
              <div 
                id="panel-checklist" 
                role="tabpanel" 
                aria-labelledby="tab-checklist"
                className="panel-content animate-fade"
              >
                <ul className="checklist-bullet-list">
                  {simplifiedResult.checklist.map((item, idx) => (
                    <li key={idx} className="checklist-item-row">
                      <FileCheck size={18} className="checklist-icon" aria-hidden="true" />
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="simplifier-meta-source">
            <span>AI Translation Source: {simplifiedResult.source}</span>
          </div>
        </Card>
      )}

      {error && (
        <div className="simplifier-error-banner" role="alert">
          <ShieldAlert size={16} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!simplifiedResult && !isLoading && (
        <div className="empty-simplifier-banner">
          <HelpCircle size={32} className="help-icon" aria-hidden="true" />
          <p>{t.noResult}</p>
        </div>
      )}
    </div>
  );
};
