import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AIChat } from './components/AIChat';
import { ServicesPortal } from './components/ServicesPortal';
import { IssueReporter } from './components/IssueReporter';
import type { ReportedIssue } from './components/IssueReporter';
import { IssueTracker } from './components/IssueTracker';
import { DocumentSimplifier } from './components/DocumentSimplifier';
import { useAccessibility } from './hooks/useAccessibility';
import { Sparkles, FileText, ClipboardList } from 'lucide-react';

const appTranslations: Record<string, Record<string, string>> = {
  en: {
    bannerTitle: 'Official Citizen Services AI Platform',
    bannerSubtitle: 'Empowering communities through accessible plain-language information and smart incident dispatch.',
    footerCredits: 'CivicAssist AI. Designed for maximum accessibility, security, and smart civic inclusion.',
    reportTabSubmit: 'File New Report',
    reportTabTrack: 'Track Submissions'
  },
  es: {
    bannerTitle: 'Plataforma Oficial de IA de Servicios al Ciudadano',
    bannerSubtitle: 'Empoderando comunidades a través de información cívica clara y despacho inteligente de incidentes.',
    footerCredits: 'CivicAssist AI. Diseñado para la máxima accesibilidad, seguridad e inclusión cívica inteligente.',
    reportTabSubmit: 'Nueva Incidencia',
    reportTabTrack: 'Seguimiento de Reportes'
  },
  fr: {
    bannerTitle: 'Plateforme IA Officielle des Services aux Citoyens',
    bannerSubtitle: 'Faciliter la vie citoyenne grâce à des informations claires et une assistance automatisée.',
    footerCredits: 'CivicAssist AI. Conçu pour une accessibilité maximale, la sécurité et l\'inclusion intelligente.',
    reportTabSubmit: 'Déposer un signalement',
    reportTabTrack: 'Suivre les signalements'
  },
  hi: {
    bannerTitle: 'आधिकारिक नागरिक सेवा एआई मंच',
    bannerSubtitle: 'सरल भाषा में जानकारी और स्मार्ट शिकायत निपटान प्रणाली द्वारा समुदाय को सशक्त बनाना।',
    footerCredits: 'नागरिक सहायता एआई। अधिकतम पहुंच, सुरक्षा और डिजिटल समावेशन के लिए डिज़ाइन किया गया।',
    reportTabSubmit: 'नई शिकायत दर्ज करें',
    reportTabTrack: 'शिकायत का पालन करें'
  }
};

export const App: React.FC = () => {
  const { theme, setTheme, fontSize, setFontSize, announceToScreenReader } = useAccessibility();
  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('civic-language') || 'en';
  });

  const [currentTab, setCurrentTab] = useState<string>('chat');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [reportedIssues, setReportedIssues] = useState<ReportedIssue[]>([]);
  const [issueSubTab, setIssueSubTab] = useState<'submit' | 'track'>('submit');

  // Sync language with localStorage
  useEffect(() => {
    localStorage.setItem('civic-language', language);
    const langNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', hi: 'Hindi' };
    announceToScreenReader(`Language changed to ${langNames[language] || language}`);
  }, [language]);

  // Sync tab updates to screen reader announcements
  useEffect(() => {
    const tabNames: Record<string, string> = { 
      chat: 'AI Companion Chat', 
      services: 'Services Registry and Eligibility Calculator', 
      report: 'Report Public Issue Form', 
      simplifier: 'Policy Document Simplifier' 
    };
    announceToScreenReader(`Loaded page ${tabNames[currentTab] || currentTab}`);
  }, [currentTab]);

  // Load reported issues from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('civic-reported-issues');
    if (saved) {
      try {
        setReportedIssues(JSON.parse(saved));
      } catch (e) {
        console.error('Failed loading saved reported issues', e);
      }
    }
  }, []);

  const handleIssueSubmitted = useCallback((newIssue: ReportedIssue) => {
    setReportedIssues((prev) => {
      const updated = [newIssue, ...prev];
      localStorage.setItem('civic-reported-issues', JSON.stringify(updated));
      return updated;
    });
    announceToScreenReader(`Report filed successfully. Tracking code ${newIssue.trackingCode}.`);
    
    // Auto shift view to tracking sub-tab to see their reported item
    setIssueSubTab('track');
  }, [announceToScreenReader]);

  const handleUpdateIssue = useCallback((updatedIssue: ReportedIssue) => {
    setReportedIssues((prev) => {
      const updated = prev.map((issue) => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      );
      localStorage.setItem('civic-reported-issues', JSON.stringify(updated));
      return updated;
    });
    announceToScreenReader(`Ticket ${updatedIssue.trackingCode} advanced to status ${updatedIssue.status}.`);
  }, [announceToScreenReader]);

  const handleNavigateToService = useCallback((serviceId: string) => {
    setSelectedServiceId(serviceId);
    setCurrentTab('services');
  }, []);

  const handleClearServiceSelection = useCallback(() => {
    setSelectedServiceId(undefined);
  }, []);


  const t = appTranslations[language] || appTranslations.en;

  return (
    <div className="app-layout" role="application">
      {/* Header Accessibility controls & routing */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Hero Welcome banner with landmarks */}
      <section className="app-welcome-banner" aria-label="Welcome banner">
        <div className="banner-content">
          <h2 className="banner-title">
            <Sparkles className="inline-sparkle animate-pulse" aria-hidden="true" />
            <span>{t.bannerTitle}</span>
          </h2>
          <p className="banner-sub">{t.bannerSubtitle}</p>
        </div>
      </section>

      {/* Main content grid */}
      <main className="main-content-flow" role="main">
        {currentTab === 'chat' && (
          <AIChat 
            language={language} 
            onNavigateToService={handleNavigateToService}
          />
        )}

        {currentTab === 'services' && (
          <ServicesPortal 
            language={language}
            selectedServiceId={selectedServiceId}
            onClearServiceSelection={handleClearServiceSelection}
          />
        )}

        {currentTab === 'report' && (
          <div className="nested-report-view">
            {/* Sub Nav Toggler for Submitting vs Tracking */}
            <div className="sub-navigation-tabs" role="tablist" aria-label="Issue Reporting Actions">
              <button
                role="tab"
                aria-selected={issueSubTab === 'submit'}
                aria-controls="panel-sub-submit"
                id="tab-sub-submit"
                className={`sub-nav-btn ${issueSubTab === 'submit' ? 'active' : ''}`}
                onClick={() => setIssueSubTab('submit')}
              >
                <FileText size={16} aria-hidden="true" />
                <span>{t.reportTabSubmit}</span>
              </button>
              <button
                role="tab"
                aria-selected={issueSubTab === 'track'}
                aria-controls="panel-sub-track"
                id="tab-sub-track"
                className={`sub-nav-btn ${issueSubTab === 'track' ? 'active' : ''}`}
                onClick={() => setIssueSubTab('track')}
              >
                <ClipboardList size={16} aria-hidden="true" />
                <span>{t.reportTabTrack} ({(reportedIssues.length)})</span>
              </button>
            </div>

            <div className="sub-panel-holder">
              {issueSubTab === 'submit' && (
                <div id="panel-sub-submit" role="tabpanel" aria-labelledby="tab-sub-submit">
                  <IssueReporter 
                    language={language} 
                    onIssueSubmitted={handleIssueSubmitted}
                  />
                </div>
              )}

              {issueSubTab === 'track' && (
                <div id="panel-sub-track" role="tabpanel" aria-labelledby="tab-sub-track">
                  <IssueTracker
                    language={language}
                    issues={reportedIssues}
                    onUpdateIssue={handleUpdateIssue}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'simplifier' && (
          <DocumentSimplifier language={language} />
        )}
      </main>

      {/* Footer landmarks */}
      <footer className="site-footer" role="contentinfo">
        <p>{t.footerCredits}</p>
      </footer>
    </div>
  );
};

export default App;
