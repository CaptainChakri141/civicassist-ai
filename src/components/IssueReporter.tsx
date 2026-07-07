import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Mail, 
  Phone, 
  Upload, 
  Wand2, 
  CheckCircle2, 
  ShieldAlert,
  Loader
} from 'lucide-react';
import { Button } from './UI/Button';
import { Card } from './UI/Card';
import { autoCategorizeIssue } from '../utils/aiEngine';

import { isSafeText, isValidEmail, isValidPhone, sanitizeInput } from '../utils/validation';

export interface ReportedIssue {
  id: string;
  trackingCode: string;
  description: string;
  location: string;
  category: string;
  assignedDepartment: string;
  priority: 'Low' | 'Medium' | 'High';
  estimatedResolutionTime: string;
  status: 'Submitted' | 'In Review' | 'Dispatched' | 'Resolved';
  reportedAt: Date;
}

interface IssueReporterProps {
  language: string;
  onIssueSubmitted: (issue: ReportedIssue) => void;
}

const issueTranslations: Record<string, Record<string, string>> = {
  en: {
    title: 'Report a Public Issue',
    subtitle: 'Submit potholes, broken street lights, or utility issues. Civic AI will auto-categorize your ticket.',
    descLabel: 'Describe the Issue',
    descPlaceholder: 'Provide details: e.g. "Deep pothole near the intersection of Elm street..."',
    locLabel: 'Location Address',
    locPlaceholder: 'e.g. 455 Elm St, near Central Park',
    emailLabel: 'Contact Email',
    phoneLabel: 'Contact Phone',
    uploadLabel: 'Upload Photo (Optional)',
    uploadDrop: 'Drag & drop image, or click to browse',
    aiBtn: 'Analyze with AI Assistant',
    aiAnalyzing: 'AI is categorizing report...',
    aiBanner: 'AI Suggestions applied. You can edit the suggestions below.',
    submitBtn: 'Submit Civic Report',
    successTitle: 'Report Filed Successfully!',
    successTracking: 'Your Tracking Code is:',
    successTrackerSub: 'Use this code to follow updates on your issue dashboard.',
    successReset: 'File Another Report',
    categoryLabel: 'Issue Category',
    deptLabel: 'Assigned Department',
    priorityLabel: 'Priority Level',
    resolutionLabel: 'Est. Resolution Time',
    errDesc: 'Please write a descriptive summary of the issue.',
    errLoc: 'Please specify the location.',
    errEmail: 'Please enter a valid email address.',
    errPhone: 'Please enter a valid phone number.'
  },
  es: {
    title: 'Reportar una Incidencia Pública',
    subtitle: 'Reporte baches, farolas rotas o fugas de agua. La IA asignará el departamento adecuado.',
    descLabel: 'Describa el Problema',
    descPlaceholder: 'Detalles: ej. "Bache profundo cerca de la intersección de la calle Elm..."',
    locLabel: 'Dirección / Ubicación',
    locPlaceholder: 'ej. Calle Elm 455, cerca del Parque Central',
    emailLabel: 'Correo de Contacto',
    phoneLabel: 'Teléfono de Contacto',
    uploadLabel: 'Subir Foto (Opcional)',
    uploadDrop: 'Arrastre la imagen aquí o haga clic para examinar',
    aiBtn: 'Analizar con Asistente de IA',
    aiAnalyzing: 'La IA está clasificando su reporte...',
    aiBanner: 'Sugerencias de IA aplicadas. Puede editar los campos a continuación.',
    submitBtn: 'Enviar Reporte Cívico',
    successTitle: '¡Reporte Enviado con Éxito!',
    successTracking: 'Su Código de Seguimiento es:',
    successTrackerSub: 'Use este código para seguir actualizaciones en su tablero de control.',
    successReset: 'Reportar Otro Problema',
    categoryLabel: 'Categoría de la Incidencia',
    deptLabel: 'Departamento Asignado',
    priorityLabel: 'Nivel de Prioridad',
    resolutionLabel: 'Tiempo Estimado de Resolución',
    errDesc: 'Describa el problema de manera comprensible.',
    errLoc: 'Especifique la ubicación del problema.',
    errEmail: 'Ingrese una dirección de correo válida.',
    errPhone: 'Ingrese un número telefónico válido.'
  },
  fr: {
    title: 'Signaler un problème public',
    subtitle: 'Signalez des nids-de-poule, réverbères en panne. L\'IA catégorisera automatiquement.',
    descLabel: 'Description du problème',
    descPlaceholder: 'Détails : ex. "Gros nid-de-poule près de l\'intersection Elm..."',
    locLabel: 'Adresse / Emplacement',
    locPlaceholder: 'ex. 455 rue Elm, près du parc central',
    emailLabel: 'E-mail de contact',
    phoneLabel: 'Téléphone de contact',
    uploadLabel: 'Télécharger une photo (optionnel)',
    uploadDrop: 'Glisser-déposer une image, ou cliquer pour parcourir',
    aiBtn: 'Analyser avec l\'assistant IA',
    aiAnalyzing: 'L\'IA catégorise le signalement...',
    aiBanner: 'Suggestions de l\'IA appliquées. Vous pouvez les modifier ci-dessous.',
    submitBtn: 'Soumettre le rapport civique',
    successTitle: 'Signalement déposé avec succès !',
    successTracking: 'Votre code de suivi est :',
    successTrackerSub: 'Utilisez ce code pour suivre l\'évolution sur votre tableau de bord.',
    successReset: 'Signaler un autre problème',
    categoryLabel: 'Catégorie du problème',
    deptLabel: 'Département assigné',
    priorityLabel: 'Niveau de priorité',
    resolutionLabel: 'Temps de résolution est.',
    errDesc: 'Veuillez décrire le problème rencontré.',
    errLoc: 'Veuillez préciser l\'emplacement.',
    errEmail: 'Veuillez saisir une adresse e-mail valide.',
    errPhone: 'Veuillez saisir un numéro de téléphone valide.'
  },
  hi: {
    title: 'सार्वजनिक शिकायत दर्ज करें',
    subtitle: 'सड़क के गड्ढे, टूटी स्ट्रीट लाइट या उपयोगिता समस्याओं को दर्ज करें। एआई इसे वर्गीकृत करेगा।',
    descLabel: 'समस्या का विवरण',
    descPlaceholder: 'विवरण प्रदान करें: जैसे "एल्म स्ट्रीट के चौराहे के पास एक बड़ा गड्ढा..."',
    locLabel: 'स्थान / पता',
    locPlaceholder: 'जैसे 455 एल्म सेंट, सेंट्रल पार्क के पास',
    emailLabel: 'संपर्क ईमेल',
    phoneLabel: 'संपर्क फोन',
    uploadLabel: 'फोटो अपलोड करें (वैकल्पिक)',
    uploadDrop: 'छवि खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें',
    aiBtn: 'एआई सहायक से विश्लेषण करें',
    aiAnalyzing: 'एआई रिपोर्ट को वर्गीकृत कर रहा है...',
    aiBanner: 'एआई सुझाव लागू किए गए। आप नीचे सुझावों को संपादित कर सकते हैं।',
    submitBtn: 'नागरिक रिपोर्ट जमा करें',
    successTitle: 'रिपोर्ट सफलतापूर्वक दर्ज की गई!',
    successTracking: 'आपका ट्रैकिंग कोड है:',
    successTrackerSub: 'अपने डैशबोर्ड पर अपडेट देखने के लिए इस कोड का उपयोग करें।',
    successReset: 'एक और शिकायत दर्ज करें',
    categoryLabel: 'शिकायत श्रेणी',
    deptLabel: 'सौंपा गया विभाग',
    priorityLabel: 'प्राथमिकता स्तर',
    resolutionLabel: 'अनुमानित समाधान समय',
    errDesc: 'कृपया शिकायत का विवरणात्मक सारांश लिखें।',
    errLoc: 'कृपया स्थान का उल्लेख करें।',
    errEmail: 'कृपया एक वैध ईमेल पता दर्ज करें।',
    errPhone: 'कृपया एक वैध फोन नंबर दर्ज करें।'
  }
};

export const IssueReporter: React.FC<IssueReporterProps> = ({ language, onIssueSubmitted }) => {
  const t = issueTranslations[language] || issueTranslations.en;

  // Form states
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // AI Categorizer fields
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiApplied, setAiApplied] = useState(false);
  const [category, setCategory] = useState('Public Works');
  const [assignedDepartment, setAssignedDepartment] = useState('Department of Public Works');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [estimatedResolutionTime, setEstimatedResolutionTime] = useState('3 - 5 Business Days');

  // Submit flow states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleAiAnalyze = async () => {
    if (!description.trim()) {
      setErrors({ description: t.errDesc });
      return;
    }
    setErrors({});
    setIsAiProcessing(true);
    try {
      const res = await autoCategorizeIssue(description, location);
      setCategory(res.category);
      setAssignedDepartment(res.assignedDepartment);
      setPriority(res.priority);
      setEstimatedResolutionTime(res.estimatedResolutionTime);
      setAiApplied(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate inputs
    const descCheck = isSafeText(description, 1000);
    if (!descCheck.isValid) {
      newErrors.description = descCheck.error || t.errDesc;
    }

    const locCheck = isSafeText(location, 200);
    if (!locCheck.isValid) {
      newErrors.location = locCheck.error || t.errLoc;
    }

    if (!isValidEmail(email)) {
      newErrors.email = t.errEmail;
    }

    if (!isValidPhone(phone)) {
      newErrors.phone = t.errPhone;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Generate tracking code
    const randomCode = `CIVIC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newIssue: ReportedIssue = {
      id: `issue-${Date.now()}`,
      trackingCode: randomCode,
      description: sanitizeInput(description),
      location: sanitizeInput(location),
      category,
      assignedDepartment,
      priority,
      estimatedResolutionTime,
      status: 'Submitted',
      reportedAt: new Date()
    };

    onIssueSubmitted(newIssue);
    setSubmittedCode(randomCode);
  };

  const handleResetForm = () => {
    setDescription('');
    setLocation('');
    setEmail('');
    setPhone('');
    setCategory('Public Works');
    setAssignedDepartment('Department of Public Works');
    setPriority('Medium');
    setEstimatedResolutionTime('3 - 5 Business Days');
    setAiApplied(false);
    setSubmittedCode(null);
    setErrors({});
  };

  // Success view
  if (submittedCode) {
    return (
      <div className="reporter-success-container" role="alert" aria-live="polite">
        <Card className="success-card">
          <CheckCircle2 className="success-icon" size={64} aria-hidden="true" />
          <h2 className="success-title">{t.successTitle}</h2>
          
          <div className="tracking-code-box">
            <span className="tracking-label">{t.successTracking}</span>
            <span className="tracking-code">{submittedCode}</span>
          </div>

          <p className="success-subtitle">{t.successTrackerSub}</p>

          <Button variant="primary" onClick={handleResetForm} className="reset-form-btn">
            {t.successReset}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="issue-reporter-container">
      <Card className="reporter-form-card">
        <h2 className="reporter-title">{t.title}</h2>
        <p className="reporter-subtitle">{t.subtitle}</p>

        <form onSubmit={handleSubmit} className="reporter-form">
          {/* Issue Description */}
          <div className="form-group">
            <label htmlFor="issue-desc" className="form-label">{t.descLabel}</label>
            <textarea
              id="issue-desc"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder={t.descPlaceholder}
              required
            />
            {errors.description && (
              <span className="error-text" role="alert">
                <ShieldAlert size={12} aria-hidden="true" />
                {errors.description}
              </span>
            )}
          </div>

          {/* Location and AI Assistant Trigger */}
          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="issue-loc" className="form-label">{t.locLabel}</label>
              <div className="input-with-icon">
                <MapPin className="field-icon" size={16} aria-hidden="true" />
                <input
                  id="issue-loc"
                  type="text"
                  className={`form-text-input ${errors.location ? 'error' : ''}`}
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) setErrors(prev => ({ ...prev, location: '' }));
                  }}
                  placeholder={t.locPlaceholder}
                  required
                />
              </div>
              {errors.location && (
                <span className="error-text" role="alert">
                  <ShieldAlert size={12} aria-hidden="true" />
                  {errors.location}
                </span>
              )}
            </div>

            {/* AI Assistant Button */}
            <div className="ai-trigger-group">
              <span className="sr-only">AI ticket classification</span>
              <Button
                type="button"
                variant="accent"
                onClick={handleAiAnalyze}
                isLoading={isAiProcessing}
                className="ai-assist-btn"
                disabled={!description.trim()}
              >
                <Wand2 size={16} aria-hidden="true" />
                <span>{t.aiBtn}</span>
              </Button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-row-grid">
            <div className="form-group">
              <label htmlFor="issue-email" className="form-label">{t.emailLabel}</label>
              <div className="input-with-icon">
                <Mail className="field-icon" size={16} aria-hidden="true" />
                <input
                  id="issue-email"
                  type="email"
                  className={`form-text-input ${errors.email ? 'error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. citizen@email.com"
                  required
                />
              </div>
              {errors.email && (
                <span className="error-text" role="alert">
                  <ShieldAlert size={12} aria-hidden="true" />
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="issue-phone" className="form-label">{t.phoneLabel}</label>
              <div className="input-with-icon">
                <Phone className="field-icon" size={16} aria-hidden="true" />
                <input
                  id="issue-phone"
                  type="tel"
                  className={`form-text-input ${errors.phone ? 'error' : ''}`}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="e.g. 555-019-2831"
                  required
                />
              </div>
              {errors.phone && (
                <span className="error-text" role="alert">
                  <ShieldAlert size={12} aria-hidden="true" />
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          {/* Photo upload UI mockup */}
          <div className="form-group">
            <label className="form-label">{t.uploadLabel}</label>
            <div 
              className="dropzone-area" 
              tabIndex={0} 
              role="button" 
              aria-label="Upload issue photos. Press Enter to select files."
            >
              <Upload className="upload-icon" size={24} aria-hidden="true" />
              <p className="dropzone-text">{t.uploadDrop}</p>
            </div>
          </div>

          {/* AI Categorized Metadata display */}
          {aiApplied && (
            <div className="ai-metadata-display-box" role="region" aria-label="AI classifications info">
              <div className="ai-banner-heading">
                <Wand2 size={16} className="spark-sparkles animate-pulse" aria-hidden="true" />
                <p>{t.aiBanner}</p>
              </div>

              <div className="meta-inputs-grid">
                <div className="meta-field">
                  <label htmlFor="meta-category" className="meta-label">{t.categoryLabel}</label>
                  <input
                    id="meta-category"
                    type="text"
                    value={category}
                    className="meta-value-input"
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="meta-field">
                  <label htmlFor="meta-dept" className="meta-label">{t.deptLabel}</label>
                  <input
                    id="meta-dept"
                    type="text"
                    value={assignedDepartment}
                    className="meta-value-input"
                    onChange={(e) => setAssignedDepartment(e.target.value)}
                  />
                </div>

                <div className="meta-field">
                  <label htmlFor="meta-priority" className="meta-label">{t.priorityLabel}</label>
                  <select
                    id="meta-priority"
                    value={priority}
                    className="meta-value-select"
                    onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}

                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="meta-field">
                  <label htmlFor="meta-resolution" className="meta-label">{t.resolutionLabel}</label>
                  <input
                    id="meta-resolution"
                    type="text"
                    value={estimatedResolutionTime}
                    className="meta-value-input"
                    onChange={(e) => setEstimatedResolutionTime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-submit-row">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="submit-report-btn"
            >
              {t.submitBtn}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
