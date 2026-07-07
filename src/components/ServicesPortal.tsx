import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, CheckSquare, Printer, Info } from 'lucide-react';
import { servicesData } from '../utils/servicesData';
import type { GovernmentService } from '../utils/servicesData';
import { Card } from './UI/Card';
import { Button } from './UI/Button';

interface ServicesPortalProps {
  language: string;
  selectedServiceId?: string;
  onClearServiceSelection?: () => void;
}

const servicesTranslations: Record<string, Record<string, string>> = {
  en: {
    searchPlaceholder: 'Search government services...',
    filterAll: 'All Categories',
    processingTime: 'Processing Time',
    fee: 'Fee',
    documents: 'Required Documents',
    checkEligibility: 'Check Your Eligibility',
    eligibilityTitle: 'Eligibility Calculator',
    ageLabel: 'Your Age',
    incomeLabel: 'Annual Household Income ($)',
    homeownerLabel: 'Do you own your home?',
    employedLabel: 'Are you currently employed?',
    calculateBtn: 'Calculate Eligibility',
    eligibleMsg: 'You appear to be ELIGIBLE!',
    notEligibleMsg: 'You do not meet current criteria.',
    reasonAge: 'Age does not meet requirement',
    reasonIncome: 'Income exceeds threshold of',
    reasonHomeowner: 'Must be a homeowner',
    customChecklist: 'Your Personalized Document Checklist',
    checklistSub: 'Gather these documents to apply for this service. Check them off as you complete.',
    printBtn: 'Save Checklist',
    clearBtn: 'Reset Calculator',
    backBtn: 'Back to Registry',
    yes: 'Yes',
    no: 'No'
  },
  es: {
    searchPlaceholder: 'Buscar servicios gubernamentales...',
    filterAll: 'Todas las categorías',
    processingTime: 'Tiempo de trámite',
    fee: 'Costo',
    documents: 'Documentos requeridos',
    checkEligibility: 'Evaluar Mi Elegibilidad',
    eligibilityTitle: 'Calculadora de Elegibilidad',
    ageLabel: 'Su Edad',
    incomeLabel: 'Ingresos Anuales del Hogar ($)',
    homeownerLabel: '¿Es propietario de su vivienda?',
    employedLabel: '¿Está empleado actualmente?',
    calculateBtn: 'Calcular Elegibilidad',
    eligibleMsg: '¡Parece que cumple con los requisitos!',
    notEligibleMsg: 'No cumple con los criterios actuales.',
    reasonAge: 'La edad no cumple con el requisito',
    reasonIncome: 'Los ingresos exceden el límite de',
    reasonHomeowner: 'Debe ser propietario de vivienda',
    customChecklist: 'Su Lista de Documentos Personalizada',
    checklistSub: 'Reúna estos documentos para solicitar el servicio. Márquelos a medida que los obtenga.',
    printBtn: 'Guardar Lista',
    clearBtn: 'Reiniciar Calculadora',
    backBtn: 'Volver al Registro',
    yes: 'Sí',
    no: 'No'
  },
  fr: {
    searchPlaceholder: 'Rechercher des services...',
    filterAll: 'Toutes les catégories',
    processingTime: 'Délai de traitement',
    fee: 'Frais',
    documents: 'Documents requis',
    checkEligibility: 'Vérifier mon éligibilité',
    eligibilityTitle: 'Calculateur d\'éligibilité',
    ageLabel: 'Votre âge',
    incomeLabel: 'Revenu annuel du foyer ($)',
    homeownerLabel: 'Êtes-vous propriétaire ?',
    employedLabel: 'Êtes-vous actuellement employé ?',
    calculateBtn: 'Calculer l\'éligibilité',
    eligibleMsg: 'Vous semblez être ÉLIGIBLE !',
    notEligibleMsg: 'Vous ne répondez pas aux critères actuels.',
    reasonAge: 'L\'âge ne répond pas aux critères',
    reasonIncome: 'Le revenu dépasse le seuil de',
    reasonHomeowner: 'Doit être propriétaire',
    customChecklist: 'Votre liste de documents personnalisée',
    checklistSub: 'Rassemblez ces documents pour postuler. Cochez-les au fur et à mesure.',
    printBtn: 'Enregistrer la liste',
    clearBtn: 'Réinitialiser',
    backBtn: 'Retour au registre',
    yes: 'Oui',
    no: 'Non'
  },
  hi: {
    searchPlaceholder: 'सरकारी सेवाओं की खोज करें...',
    filterAll: 'सभी श्रेणियां',
    processingTime: 'प्रसंस्करण समय',
    fee: 'शुल्क',
    documents: 'आवश्यक दस्तावेज़',
    checkEligibility: 'अपनी पात्रता जाँचें',
    eligibilityTitle: 'पात्रता कैलकुलेटर',
    ageLabel: 'आपकी आयु',
    incomeLabel: 'वार्षिक पारिवारिक आय ($)',
    homeownerLabel: 'क्या आप अपने घर के मालिक हैं?',
    employedLabel: 'क्या आप वर्तमान में कार्यरत हैं?',
    calculateBtn: 'पात्रता की गणना करें',
    eligibleMsg: 'आप पात्र प्रतीत होते हैं!',
    notEligibleMsg: 'आप वर्तमान मानदंडों को पूरा नहीं करते हैं।',
    reasonAge: 'आयु आवश्यकता को पूरा नहीं करती है',
    reasonIncome: 'आय सीमा से अधिक है:',
    reasonHomeowner: 'गृहस्वामी होना आवश्यक है',
    customChecklist: 'आपकी व्यक्तिगत दस्तावेज़ सूची',
    checklistSub: 'इस सेवा के लिए आवेदन करने हेतु ये दस्तावेज़ एकत्र करें। प्राप्त होने पर टिक करें।',
    printBtn: 'सूची सहेजें',
    clearBtn: 'कैलकुलेटर रीसेट करें',
    backBtn: 'रजिस्ट्री पर वापस जाएं',
    yes: 'हाँ',
    no: 'नहीं'
  }
};

export const ServicesPortal: React.FC<ServicesPortalProps> = ({
  language,
  selectedServiceId,
  onClearServiceSelection
}) => {
  const t = servicesTranslations[language] || servicesTranslations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Detail views and calculator states
  const [detailService, setDetailService] = useState<GovernmentService | null>(null);
  
  // Form input states
  const [age, setAge] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [isHomeowner, setIsHomeowner] = useState<boolean>(false);
  const [isEmployed, setIsEmployed] = useState<boolean>(true);
  
  // Results states
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isEligible, setIsEligible] = useState(false);
  const [failures, setFailures] = useState<string[]>([]);
  const [dynamicChecklist, setDynamicChecklist] = useState<string[]>([]);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // Sync selectedServiceId if triggered by AI chat
  React.useEffect(() => {
    if (selectedServiceId) {
      const match = servicesData.find(s => s.id === selectedServiceId);
      if (match) {
        setDetailService(match);
        // Reset form states
        setAge('');
        setIncome('');
        setIsHomeowner(false);
        setIsEmployed(true);
        setHasCalculated(false);
        setFailures([]);
        setDynamicChecklist([]);
        setCheckedDocs({});
      }
    }
  }, [selectedServiceId]);

  // List of unique categories for filters
  const categories = useMemo(() => {
    const list = new Set(servicesData.map(s => s.category));
    return ['All', ...Array.from(list)];
  }, []);

  // Filtered services list
  const filteredServices = useMemo(() => {
    return servicesData.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            service.longDescription.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenDetails = (service: GovernmentService) => {
    setDetailService(service);
    // Reset form states
    setAge('');
    setIncome('');
    setIsHomeowner(false);
    setIsEmployed(true);
    setHasCalculated(false);
    setFailures([]);
    setDynamicChecklist([]);
    setCheckedDocs({});
  };

  const handleBackToRegistry = () => {
    setDetailService(null);
    if (onClearServiceSelection) {
      onClearServiceSelection();
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailService) return;

    const applicantAge = parseInt(age, 10);
    const applicantIncome = parseFloat(income);

    const reasons: string[] = [];
    const rules = detailService.eligibilityRules;

    // Validate rules
    if (rules.minAge !== undefined && (isNaN(applicantAge) || applicantAge < rules.minAge)) {
      reasons.push(`${t.reasonAge} (Min: ${rules.minAge})`);
    }
    if (rules.maxAge !== undefined && !isNaN(applicantAge) && applicantAge > rules.maxAge) {
      reasons.push(`${t.reasonAge} (Max: ${rules.maxAge})`);
    }
    if (rules.maxIncome !== undefined && (isNaN(applicantIncome) || applicantIncome > rules.maxIncome)) {
      reasons.push(`${t.reasonIncome} $${rules.maxIncome.toLocaleString()}`);
    }
    if (rules.requireHomeownership && !isHomeowner) {
      reasons.push(t.reasonHomeowner);
    }

    const eligible = reasons.length === 0;
    setIsEligible(eligible);
    setFailures(reasons);

    // Compile dynamic checklist
    // Standard docs are always required
    const list = [...detailService.requiredDocuments];

    // Check conditions
    if (detailService.conditionalDocuments) {
      detailService.conditionalDocuments.forEach(cond => {
        if (cond.condition.includes('Low Income') && applicantIncome < 15000) {
          list.push(...cond.documents);
        }
        if (cond.condition.includes('dependents') && applicantAge >= 18 && applicantIncome < 35000) {
          // Mock assumption: standard low-income with welfare checklist
          list.push(...cond.documents);
        }
        if (cond.condition.includes('60 or above') && applicantAge >= 60) {
          list.push(...cond.documents);
        }
        if (cond.condition.includes('food preparation') && detailService.id === 'civic-business') {
          // Business conditionals
          list.push(...cond.documents);
        }
      });
    }

    setDynamicChecklist(list);
    
    // Set checkbox initial states to unchecked
    const initialChecked: Record<string, boolean> = {};
    list.forEach(doc => {
      initialChecked[doc] = false;
    });
    setCheckedDocs(initialChecked);
    
    setHasCalculated(true);
  };

  const handleCheckboxChange = (doc: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  const handlePrint = () => {
    // Print/Save checklist simulation
    alert('PDF Checklist generated! Ready for download.');
  };

  // Main Registry View
  if (!detailService) {
    return (
      <div className="services-view-container">
        {/* Search and Filters */}
        <div className="registry-controls">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={20} aria-hidden="true" />
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
            />
          </div>

          <div className="category-filters-scroll" role="group" aria-label="Filter Services">
            <Filter size={16} className="filter-icon" aria-hidden="true" />
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
              >
                {cat === 'All' ? t.filterAll : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="services-grid" role="region" aria-label="Services List">
          {filteredServices.map(service => (
            <Card 
              key={service.id} 
              className="service-item-card"
              onClick={() => handleOpenDetails(service)}
              tagName="article"
            >
              <div className="card-badge">{service.category}</div>
              <h3 className="card-title">{service.name}</h3>
              <p className="card-description">{service.shortDescription}</p>
              
              <div className="card-footer-info">
                <span><strong>{t.fee}:</strong> {service.fee}</span>
                <span><strong>{t.processingTime}:</strong> {service.processingTime}</span>
              </div>
            </Card>
          ))}
          {filteredServices.length === 0 && (
            <div className="no-results-banner">
              <Info size={24} aria-hidden="true" />
              <p>No matching government services found. Try typing another search keyword.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Detailed Program & Calculator View
  return (
    <div className="service-details-container">
      <Button 
        variant="ghost" 
        onClick={handleBackToRegistry} 
        className="back-registry-btn"
      >
        &larr; {t.backBtn}
      </Button>

      <div className="details-layout-grid">
        {/* Left Side: Program Details */}
        <article className="details-info-section">
          <div className="details-badge">{detailService.category}</div>
          <h2 className="details-title">{detailService.name}</h2>
          <p className="details-description">{detailService.longDescription}</p>

          <div className="details-specs">
            <div className="spec-card">
              <span className="spec-label">{t.processingTime}</span>
              <span className="spec-value">{detailService.processingTime}</span>
            </div>
            <div className="spec-card">
              <span className="spec-label">{t.fee}</span>
              <span className="spec-value">{detailService.fee}</span>
            </div>
          </div>

          <div className="details-static-docs">
            <h3 className="section-subtitle">{t.documents}</h3>
            <ul className="docs-list">
              {detailService.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="docs-item">
                  <span className="docs-bullet" aria-hidden="true">&bull;</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* Right Side: Eligibility Form & Custom Checklist */}
        <section className="details-calculator-section">
          <div className="calculator-box">
            <h3 className="calculator-title">{t.eligibilityTitle}</h3>

            <form onSubmit={handleCalculate} className="calculator-form">
              <div className="form-group-grid">
                <div className="form-input-group">
                  <label htmlFor="input-age" className="input-label">{t.ageLabel}</label>
                  <input
                    id="input-age"
                    type="number"
                    min="1"
                    max="120"
                    required
                    className="calc-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className="form-input-group">
                  <label htmlFor="input-income" className="input-label">{t.incomeLabel}</label>
                  <input
                    id="input-income"
                    type="number"
                    min="0"
                    required
                    className="calc-input"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>
              </div>

              {detailService.eligibilityRules.requireHomeownership && (
                <div className="form-check-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isHomeowner}
                      onChange={(e) => setIsHomeowner(e.target.checked)}
                    />
                    <span className="checkbox-label">{t.homeownerLabel}</span>
                  </label>
                </div>
              )}

              <div className="form-actions">
                <Button type="submit" variant="primary" className="calc-submit-btn">
                  {t.calculateBtn}
                </Button>
                {hasCalculated && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => {
                      setHasCalculated(false);
                      setAge('');
                      setIncome('');
                      setIsHomeowner(false);
                      setFailures([]);
                      setDynamicChecklist([]);
                    }}
                  >
                    {t.clearBtn}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Calculator Results */}
          {hasCalculated && (
            <div className={`results-container ${isEligible ? 'eligible' : 'ineligible'}`} role="region" aria-label="Eligibility results">
              <div className="results-header">
                {isEligible ? (
                  <div className="status-badge success">
                    <ShieldCheck size={20} aria-hidden="true" />
                    <span>{t.eligibleMsg}</span>
                  </div>
                ) : (
                  <div className="status-badge error">
                    <ShieldAlert size={20} aria-hidden="true" />
                    <span>{t.notEligibleMsg}</span>
                  </div>
                )}
              </div>

              {!isEligible && (
                <ul className="failure-reasons-list">
                  {failures.map((fail, idx) => (
                    <li key={idx} className="failure-item">{fail}</li>
                  ))}
                </ul>
              )}

              {/* Dynamic checklist for applicants */}
              <div className="dynamic-checklist-wrapper">
                <div className="checklist-heading">
                  <h4 className="checklist-title">{t.customChecklist}</h4>
                  <button 
                    className="print-checklist-btn"
                    onClick={handlePrint}
                    title={t.printBtn}
                    aria-label={t.printBtn}
                  >
                    <Printer size={16} />
                  </button>
                </div>
                <p className="checklist-sub">{t.checklistSub}</p>

                <div className="interactive-checklist">
                  {dynamicChecklist.map((doc, idx) => (
                    <label key={idx} className={`checklist-item-row ${checkedDocs[doc] ? 'completed' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checkedDocs[doc] || false}
                        onChange={() => handleCheckboxChange(doc)}
                      />
                      <span className="checklist-item-text">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
