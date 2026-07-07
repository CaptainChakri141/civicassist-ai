import React, { useState, useMemo } from 'react';
import { Search, Compass, RefreshCw, Clock, CheckCircle2, ShieldCheck, MapPin, Building } from 'lucide-react';
import type { ReportedIssue } from './IssueReporter';
import { Card } from './UI/Card';
import { Button } from './UI/Button';

interface IssueTrackerProps {
  language: string;
  issues: ReportedIssue[];
  onUpdateIssue: (updated: ReportedIssue) => void;
}

const trackerTranslations: Record<string, Record<string, string>> = {
  en: {
    title: 'Report Tracker Dashboard',
    subtitle: 'Search issues by tracking code or keywords to verify real-time civic dispatch updates.',
    statTotal: 'Total Reports',
    statPending: 'In Progress',
    statResolved: 'Resolved',
    searchPlaceholder: 'Search tracking code (e.g. CIVIC-837194) or keywords...',
    noIssues: 'No reports found. File a new public report to see it displayed here.',
    trackingCode: 'Tracking Code',
    reportedOn: 'Reported On',
    department: 'Department',
    priority: 'Priority',
    resolutionTime: 'Est. Resolution Time',
    statusSubmitted: 'Submitted',
    statusReview: 'In Review',
    statusDispatched: 'Dispatched',
    statusResolved: 'Resolved',
    simulateBtn: 'Advance AI Dispatch State',
    completedAtText: 'Resolved at'
  },
  es: {
    title: 'Tablero de Seguimiento de Reportes',
    subtitle: 'Busque incidencias por código de seguimiento o palabras clave para ver actualizaciones de despacho en tiempo real.',
    statTotal: 'Reportes Totales',
    statPending: 'En Progreso',
    statResolved: 'Resueltos',
    searchPlaceholder: 'Buscar código (ej. CIVIC-837194) o palabras clave...',
    noIssues: 'No se encontraron reportes. Registre una nueva incidencia para verla aquí.',
    trackingCode: 'Código de seguimiento',
    reportedOn: 'Reportado el',
    department: 'Departamento',
    priority: 'Prioridad',
    resolutionTime: 'Tiempo estimado',
    statusSubmitted: 'Enviado',
    statusReview: 'En Revisión',
    statusDispatched: 'Despachado',
    statusResolved: 'Resuelto',
    simulateBtn: 'Avanzar Estado del Despacho',
    completedAtText: 'Resuelto el'
  },
  fr: {
    title: 'Tableau de bord de suivi',
    subtitle: 'Recherchez les signalements par code de suivi ou mots-clés pour voir l\'avancement.',
    statTotal: 'Total des rapports',
    statPending: 'En cours',
    statResolved: 'Résolus',
    searchPlaceholder: 'Rechercher un code (ex. CIVIC-837194) ou mots-clés...',
    noIssues: 'Aucun rapport trouvé. Déposez un rapport public pour le voir s\'afficher ici.',
    trackingCode: 'Code de suivi',
    reportedOn: 'Signalé le',
    department: 'Département',
    priority: 'Priorité',
    resolutionTime: 'Temps estimé',
    statusSubmitted: 'Soumis',
    statusReview: 'En examen',
    statusDispatched: 'Dépêché',
    statusResolved: 'Résolu',
    simulateBtn: 'Faire avancer l\'état du dossier',
    completedAtText: 'Résolu le'
  },
  hi: {
    title: 'शिकायत ट्रैकर डैशबोर्ड',
    subtitle: 'वास्तविक समय में अपडेट देखने के लिए ट्रैकिंग कोड या कीवर्ड द्वारा खोजें।',
    statTotal: 'कुल शिकायतें',
    statPending: 'प्रगति पर',
    statResolved: 'समाधान किया गया',
    searchPlaceholder: 'ट्रैकिंग कोड (जैसे CIVIC-837194) या कीवर्ड खोजें...',
    noIssues: 'कोई शिकायत नहीं मिली। यहाँ प्रदर्शित देखने के लिए एक नई शिकायत दर्ज करें।',
    trackingCode: 'ट्रैकिंग कोड',
    reportedOn: 'दर्ज किया गया दिनांक',
    department: 'विभाग',
    priority: 'प्राथमिकता',
    resolutionTime: 'अनुमानित समाधान समय',
    statusSubmitted: 'जमा किया गया',
    statusReview: 'समीक्षा के तहत',
    statusDispatched: 'सौंप दिया गया',
    statusResolved: 'समाधान हुआ',
    simulateBtn: 'एआई प्रेषण स्थिति आगे बढ़ाएं',
    completedAtText: 'समाधान किया गया दिनांक'
  }
};

export const IssueTracker: React.FC<IssueTrackerProps> = ({
  language,
  issues,
  onUpdateIssue
}) => {
  const t = trackerTranslations[language] || trackerTranslations.en;

  const [searchQuery, setSearchQuery] = useState('');

  // Stats calculation
  const total = issues.length;
  const pending = issues.filter((i) => i.status !== 'Resolved').length;
  const resolved = issues.filter((i) => i.status === 'Resolved').length;

  // Filtered issues list
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const query = searchQuery.toLowerCase();
      return (
        issue.trackingCode.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.location.toLowerCase().includes(query) ||
        issue.category.toLowerCase().includes(query)
      );
    });
  }, [issues, searchQuery]);

  // Status mapping index
  const statusStages: ReportedIssue['status'][] = ['Submitted', 'In Review', 'Dispatched', 'Resolved'];

  const handleSimulateStatus = (issue: ReportedIssue) => {
    const currentIndex = statusStages.indexOf(issue.status);
    if (currentIndex < statusStages.length - 1) {
      const nextStatus = statusStages[currentIndex + 1];
      const updatedIssue: ReportedIssue = {
        ...issue,
        status: nextStatus
      };
      onUpdateIssue(updatedIssue);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(language === 'hi' ? 'hi-IN' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="tracker-dashboard-container">
      {/* Summary Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{total}</span>
          <span className="stat-label">{t.statTotal}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-num">{pending}</span>
          <span className="stat-label">{t.statPending}</span>
        </div>
        <div className="stat-card success">
          <span className="stat-num">{resolved}</span>
          <span className="stat-label">{t.statResolved}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-tracker-bar">
        <Search className="search-icon" size={20} aria-hidden="true" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="tracker-search-input"
        />
      </div>

      {/* Issues Listing */}
      <div className="tracker-feed" role="region" aria-label="Issue Tracker List">
        {filteredIssues.map((issue) => {
          const currentStageIndex = statusStages.indexOf(issue.status);

          return (
            <Card key={issue.id} className="tracker-item-card" tagName="article">
              <div className="tracker-item-header">
                <div>
                  <span className="tracker-code-badge">{issue.trackingCode}</span>
                  <h3 className="tracker-category-title">{issue.category}</h3>
                </div>
                <div className={`priority-badge ${issue.priority.toLowerCase()}`}>
                  {t.priority}: {issue.priority}
                </div>
              </div>

              <p className="tracker-desc-text">{issue.description}</p>

              <div className="tracker-details-meta">
                <span className="meta-item">
                  <MapPin size={14} className="meta-icon" aria-hidden="true" />
                  <span>{issue.location}</span>
                </span>
                <span className="meta-item">
                  <Building size={14} className="meta-icon" aria-hidden="true" />
                  <span>{issue.assignedDepartment}</span>
                </span>
                <span className="meta-item">
                  <Clock size={14} className="meta-icon" aria-hidden="true" />
                  <span>{t.resolutionTime}: {issue.estimatedResolutionTime}</span>
                </span>
              </div>

              {/* Progress Steps Indicator */}
              <div className="progress-steps-container" aria-label={`Issue Status: ${issue.status}`}>
                {statusStages.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isActive = idx === currentStageIndex;

                  return (
                    <div 
                      key={stage} 
                      className={`progress-step-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                    >
                      <div className="step-circle">
                        {isCompleted ? <CheckCircle2 size={16} /> : <div className="dot-node" />}
                      </div>
                      <span className="step-label">
                        {stage === 'Submitted' && t.statusSubmitted}
                        {stage === 'In Review' && t.statusReview}
                        {stage === 'Dispatched' && t.statusDispatched}
                        {stage === 'Resolved' && t.statusResolved}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Simulation update control */}
              <div className="tracker-item-actions">
                <span className="date-stamps">
                  {t.reportedOn}: {formatDate(issue.reportedAt)}
                </span>
                
                {issue.status !== 'Resolved' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSimulateStatus(issue)}
                    className="simulate-state-btn"
                  >
                    <RefreshCw size={14} aria-hidden="true" className="spin-on-hover" />
                    <span>{t.simulateBtn}</span>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="no-issues-banner">
            <Compass size={40} className="compass-icon animate-bounce" aria-hidden="true" />
            <p>{t.noIssues}</p>
          </div>
        )}
      </div>
    </div>
  );
};
