import { sanitizeInput } from './validation';
import { servicesData } from './servicesData';

// Constants for translation dictionaries to support multilingual mock GenAI responses
const translations: Record<string, Record<string, string>> = {
  es: {
    welcome: 'Hola! Soy su Asistente Cívico de IA. ¿Cómo puedo ayudarle hoy?',
    eligibility_intro: 'Según mi análisis, aquí están los detalles de elegibilidad para',
    docs_needed: 'Documentos requeridos:',
    no_match: 'Lamento no poder encontrar un servicio coincidente directo para su consulta. Intente preguntar sobre bienestar social, salud, licencias comerciales, tránsito o reembolsos de energía.',
    complaint_received: 'He analizado su reporte de incidencia. Clasificación de IA:',
    dept: 'Departamento Asignado',
    priority: 'Prioridad',
    resolution: 'Tiempo de Resolución Estimado'
  },
  fr: {
    welcome: 'Bonjour! Je suis votre compagnon civique IA. Comment puis-je vous aider aujourd\'hui?',
    eligibility_intro: 'D\'après mon analyse, voici les détails d\'éligibilité pour',
    docs_needed: 'Documents requis:',
    no_match: 'Je suis désolé, je n\'ai pas trouvé de service correspondant directement à votre demande. Essayez de me poser des questions sur les aides sociales, la santé, les licences commerciales ou l\'énergie.',
    complaint_received: 'J\'ai analysé votre rapport d\'incident. Classification IA :',
    dept: 'Département assigné',
    priority: 'Priorité',
    resolution: 'Temps de résolution estimé'
  },
  hi: {
    welcome: 'नमस्ते! मैं आपका नागरिक एआई सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?',
    eligibility_intro: 'मेरे विश्लेषण के अनुसार, यहाँ पात्रता विवरण हैं:',
    docs_needed: 'आवश्यक दस्तावेज़:',
    no_match: 'क्षमा करें, मुझे आपकी पूछताछ के लिए सीधे मेल खाने वाली सेवा नहीं मिली। कृपया सामाजिक कल्याण, स्वास्थ्य, व्यवसाय लाइसेंस या ऊर्जा के बारे में पूछें।',
    complaint_received: 'मैंने आपकी शिकायत का विश्लेषण किया है। एआई वर्गीकरण:',
    dept: 'सौंपा गया विभाग',
    priority: 'प्राथमिकता',
    resolution: 'अनुमानित समाधान समय'
  }
};

function getT(lang: string, key: string): string {
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  // Default to English
  const en: Record<string, string> = {
    welcome: 'Hello! I am your AI Civic Companion. How can I assist you today?',
    eligibility_intro: 'Based on my analysis, here are the eligibility details for',
    docs_needed: 'Required Documents:',
    no_match: 'I apologize, but I could not find a direct matching civic service for your query. Try asking about welfare support, health insurance, business licensing, public transit, or solar rebates.',
    complaint_received: 'I have analyzed your reported issue. AI Classification:',
    dept: 'Assigned Department',
    priority: 'Priority',
    resolution: 'Estimated Resolution Time'
  };
  return en[key] || '';
}

/**
 * Interface representing the structured response from GenAI engine
 */
export interface AIResult {
  text: string;
  source: 'local' | 'gemini';
  data?: any;
}

/**
 * Call the real Gemini API if key is present, otherwise fall back to local rule engine.
 */
async function callGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('API Key missing');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}`);
  }

  const result = await response.json();
  const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error('Malformed Gemini response');
  }

  return generatedText;
}

/**
 * AI Companion main response generator
 */
export async function generateAIResponse(
  query: string,
  lang: string = 'en',
  history: { role: 'user' | 'model'; content: string }[] = []
): Promise<AIResult> {
  const sanitized = sanitizeInput(query);
  const lowercase = sanitized.toLowerCase();

  // If Gemini API Key exists, we use the real API!
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const chatContext = history
        .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
        .join('\n');
      
      const systemPrompt = `You are a helpful, professional AI Civic Companion working for the local government.
Your job is to answer citizen queries, simplify government documents, list eligibility rules, explain processes, and support multiple languages.
Answer in the requested language: "${lang}". Keep your answers clear, structural, and accessible. Use markdown format (bullet points, bold text).
Current chat history:
${chatContext}
User Query: ${sanitized}
AI Companion:`;

      const responseText = await callGemini(systemPrompt);
      return { text: responseText, source: 'gemini' };
    } catch (error) {
      console.warn('Gemini API call failed, falling back to local reasoning:', error);
    }
  }

  // Local simulated NLP matching
  // Let's analyze query intents
  if (lowercase.includes('hello') || lowercase.includes('hi') || lowercase.includes('hola') || lowercase.includes('bonjour') || lowercase.includes('hey')) {
    return { text: getT(lang, 'welcome'), source: 'local' };
  }

  // 1. Welfare Support / CivicCare match
  if (lowercase.includes('welfare') || lowercase.includes('care') || lowercase.includes('financial assistance') || lowercase.includes('low income') || lowercase.includes('pension')) {
    const service = servicesData.find(s => s.id === 'civic-care')!;
    let responseText = `### ${service.name}\n\n`;
    responseText += `${getT(lang, 'eligibility_intro')} **${service.name}**:\n`;
    responseText += `- **Age:** Must be 18 or older.\n`;
    responseText += `- **Income Limit:** Household income must be under **$35,000 / year**.\n\n`;
    responseText += `**${getT(lang, 'docs_needed')}**\n`;
    service.requiredDocuments.forEach(doc => {
      responseText += `- [ ] ${doc}\n`;
    });
    
    if (lang === 'es') {
      responseText = `### Apoyo de Bienestar Universal (CivicCare)\n\n${getT(lang, 'eligibility_intro')} **CivicCare**:\n- **Edad:** Mayor de 18 años.\n- **Ingresos máximos:** Menores de **$35,000 / año**.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'fr') {
      responseText = `### Aide Sociale Universelle (CivicCare)\n\n${getT(lang, 'eligibility_intro')} **CivicCare**:\n- **Âge:** 18 ans ou plus.\n- **Revenus max:** Moins de **$35,000 / an**.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'hi') {
      responseText = `### यूनिवर्सल कल्याण सहायता (CivicCare)\n\n${getT(lang, 'eligibility_intro')} **CivicCare**:\n- **आयु:** 18 वर्ष या उससे अधिक।\n- **आय सीमा:** वार्षिक आय **$35,000** से कम होनी चाहिए।\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    }
    
    return { text: responseText, source: 'local', data: { serviceId: 'civic-care' } };
  }

  // 2. Health insurance / CivicHealth match
  if (lowercase.includes('health') || lowercase.includes('insurance') || lowercase.includes('medical') || lowercase.includes('doctor') || lowercase.includes('senior')) {
    const service = servicesData.find(s => s.id === 'civic-health')!;
    let responseText = `### ${service.name}\n\n`;
    responseText += `${getT(lang, 'eligibility_intro')} **${service.name}**:\n`;
    responseText += `- **Coverage:** Full medical, vision, and dental subsidies.\n`;
    responseText += `- **Income Limit:** Under **$50,000 / year**.\n`;
    responseText += `- **Special Category:** Adults 60+ receive free senior premium care.\n\n`;
    responseText += `**${getT(lang, 'docs_needed')}**\n`;
    service.requiredDocuments.forEach(doc => {
      responseText += `- [ ] ${doc}\n`;
    });

    if (lang === 'es') {
      responseText = `### Seguro de Salud Ciudadano (CivicHealth)\n\n${getT(lang, 'eligibility_intro')} **CivicHealth**:\n- **Ingresos máximos:** Menores de **$50,000 / año**.\n- **Séniors (60+):** Cobertura gratuita sin cuotas mensuales.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'fr') {
      responseText = `### Assurance Santé Citoyenne (CivicHealth)\n\n${getT(lang, 'eligibility_intro')} **CivicHealth**:\n- **Revenus max:** Moins de **$50,000 / an**.\n- **Séniors (60+):** Couverture gratuite sans primes mensuelles.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'hi') {
      responseText = `### नागरिक स्वास्थ्य बीमा (CivicHealth)\n\n${getT(lang, 'eligibility_intro')} **CivicHealth**:\n- **आय सीमा:** **$50,000 / वर्ष** से कम।\n- **वरिष्ठ नागरिक (60+):** मुफ्त चिकित्सा सेवा।\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    }

    return { text: responseText, source: 'local', data: { serviceId: 'civic-health' } };
  }

  // 3. Transit/Driver License match
  if (lowercase.includes('driver') || lowercase.includes('license') || lowercase.includes('transit') || lowercase.includes('bus') || lowercase.includes('drive') || lowercase.includes('car')) {
    const service = servicesData.find(s => s.id === 'civic-drive')!;
    let responseText = `### ${service.name}\n\n`;
    responseText += `Here is how you can renew or obtain a driving license or local transit pass:\n`;
    responseText += `- **Minimum Age:** 16 years.\n`;
    responseText += `- **Processing Time:** Same Day (Digital copy generated immediately).\n\n`;
    responseText += `**${getT(lang, 'docs_needed')}**\n`;
    service.requiredDocuments.forEach(doc => {
      responseText += `- [ ] ${doc}\n`;
    });

    if (lang === 'es') {
      responseText = `### Licencia de Conducir y Tránsito Digital (CivicDrive)\n\n- **Edad mínima:** 16 años.\n- **Tiempo:** Entrega el mismo día.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'fr') {
      responseText = `### Permis de Conduire & Transit Numérique (CivicDrive)\n\n- **Âge minimum:** 16 ans.\n- **Délai:** Le jour même.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'hi') {
      responseText = `### डिजिटल ट्रांजिट और ड्राइविंग लाइसेंस (CivicDrive)\n\n- **न्यूनतम आयु:** 16 वर्ष।\n- **समय:** उसी दिन (डिजिटल)।\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    }

    return { text: responseText, source: 'local', data: { serviceId: 'civic-drive' } };
  }

  // 4. Business license / CivicBusiness match
  if (lowercase.includes('business') || lowercase.includes('license') || lowercase.includes('startup') || lowercase.includes('register') || lowercase.includes('shop')) {
    const service = servicesData.find(s => s.id === 'civic-business')!;
    let responseText = `### ${service.name}\n\n`;
    responseText += `To start a new business in our municipality, you must register for the **CivicBusiness License**.\n`;
    responseText += `- **Fee:** $120 one-time registration cost.\n`;
    responseText += `- **Processing Time:** 24 - 48 Hours.\n\n`;
    responseText += `**${getT(lang, 'docs_needed')}**\n`;
    service.requiredDocuments.forEach(doc => {
      responseText += `- [ ] ${doc}\n`;
    });

    if (lang === 'es') {
      responseText = `### Licencia Comercial Inteligente (CivicBusiness)\n\nPara iniciar un negocio, necesita la licencia **CivicBusiness**.\n- **Costo:** $120 (único pago).\n- **Tiempo:** 24 - 48 Horas.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'fr') {
      responseText = `### Licence Commerciale Intelligente (CivicBusiness)\n\nPour démarrer une entreprise, vous devez obtenir la licence **CivicBusiness**.\n- **Frais:** $120 (paiement unique).\n- **Délai:** 24 - 48 Heures.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'hi') {
      responseText = `### स्मार्ट व्यवसाय लाइसेंस (CivicBusiness)\n\nनया व्यवसाय शुरू करने के लिए आपको **CivicBusiness** लाइसेंस की आवश्यकता होगी।\n- **शुल्क:** $120 (एक बार का शुल्क)\n- **समय:** 24 से 48 घंटे।\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    }

    return { text: responseText, source: 'local', data: { serviceId: 'civic-business' } };
  }

  // 5. Rebates / solar energy match
  if (lowercase.includes('solar') || lowercase.includes('rebate') || lowercase.includes('green') || lowercase.includes('energy') || lowercase.includes('home') || lowercase.includes('electric') || lowercase.includes('tax credit')) {
    const service = servicesData.find(s => s.id === 'civic-green')!;
    let responseText = `### ${service.name}\n\n`;
    responseText += `Get reimbursed up to 40% for energy efficiency upgrades:\n`;
    responseText += `- **Eligibility:** Homeowners only.\n`;
    responseText += `- **Processing Time:** 15 - 30 Business Days.\n\n`;
    responseText += `**${getT(lang, 'docs_needed')}**\n`;
    service.requiredDocuments.forEach(doc => {
      responseText += `- [ ] ${doc}\n`;
    });

    if (lang === 'es') {
      responseText = `### Reembolso de Energía Ecológica Hogar (CivicGreen)\n\n- **Elegibilidad:** Propietarios de viviendas.\n- **Reembolso:** Hasta un 40% en instalación de paneles y bombas de calor.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'fr') {
      responseText = `### Remboursement Énergétique Maison Éco (CivicGreen)\n\n- **Éligibilité:** Propriétaires de maison uniquement.\n- **Remboursement:** Jusqu'à 40% sur l'installation solaire.\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    } else if (lang === 'hi') {
      responseText = `### पर्यावरण-अनुकूल गृह ऊर्जा छूट (CivicGreen)\n\n- **पात्रता:** केवल गृहस्वामी।\n- **छूट:** सौर पैनल और हीट पंप पर 40% तक प्रतिपूर्ति।\n\n**${getT(lang, 'docs_needed')}**\n` + service.requiredDocuments.map(d => `- [ ] ${d}`).join('\n');
    }

    return { text: responseText, source: 'local', data: { serviceId: 'civic-green' } };
  }

  // Conversational response default
  return {
    text: getT(lang, 'no_match'),
    source: 'local'
  };
}

/**
 * AI Categorizer for Civic Reports
 */
export async function autoCategorizeIssue(
  description: string,
  location: string
): Promise<{
  category: string;
  assignedDepartment: string;
  priority: 'Low' | 'Medium' | 'High';
  estimatedResolutionTime: string;
  source: 'local' | 'gemini';
}> {
  const sanitizedDesc = sanitizeInput(description);
  const lowercase = sanitizedDesc.toLowerCase();

  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const prompt = `You are a Municipal Service Dispatch AI. Categorize this reported public issue:
Description: "${sanitizedDesc}"
Location: "${sanitizeInput(location)}"

Respond ONLY with a JSON object in this exact format, with no markdown tags or wrapper text:
{
  "category": "Roads & Sidewalks" or "Sanitation & Garbage" or "Water & Utilities" or "Public Safety" or "Parks & Recreation",
  "assignedDepartment": "Name of department responsible",
  "priority": "Low" or "Medium" or "High",
  "estimatedResolutionTime": "e.g. 24-48 Hours, 3-5 Business Days"
}`;
      const responseText = await callGemini(prompt);
      // Clean potential JSON markdown blocks if Gemini outputs them
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        category: parsed.category,
        assignedDepartment: parsed.assignedDepartment,
        priority: parsed.priority,
        estimatedResolutionTime: parsed.estimatedResolutionTime,
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini dispatch categorizer failed, falling back to local:', err);
    }
  }

  // Local Categorizer Rules
  let category = 'Public Works';
  let assignedDepartment = 'Department of Public Works';
  let priority: 'Low' | 'Medium' | 'High' = 'Medium';
  let estimatedResolutionTime = '3 - 5 Business Days';

  if (lowercase.includes('water') || lowercase.includes('leak') || lowercase.includes('pipe') || lowercase.includes('flood') || lowercase.includes('sewer') || lowercase.includes('hydrant')) {
    category = 'Water & Utilities';
    assignedDepartment = 'Municipal Water & Sewer Authority';
    priority = 'High';
    estimatedResolutionTime = '12 - 24 Hours';
  } else if (lowercase.includes('trash') || lowercase.includes('garbage') || lowercase.includes('dump') || lowercase.includes('litter') || lowercase.includes('waste')) {
    category = 'Sanitation & Waste';
    assignedDepartment = 'Department of Sanitation';
    priority = 'Medium';
    estimatedResolutionTime = '1 - 2 Business Days';
  } else if (lowercase.includes('pothole') || lowercase.includes('road') || lowercase.includes('sidewalk') || lowercase.includes('street') || lowercase.includes('asphalt')) {
    category = 'Roads & Sidewalks';
    assignedDepartment = 'Bureau of Highways & Street Repairs';
    priority = 'High';
    estimatedResolutionTime = '24 - 48 Hours';
  } else if (lowercase.includes('light') || lowercase.includes('lamp') || lowercase.includes('dark') || lowercase.includes('electricity') || lowercase.includes('outage')) {
    category = 'Utilities & Lighting';
    assignedDepartment = 'Municipal Power & Grid Management';
    priority = 'Medium';
    estimatedResolutionTime = '2 - 3 Business Days';
  } else if (lowercase.includes('park') || lowercase.includes('tree') || lowercase.includes('grass') || lowercase.includes('playground') || lowercase.includes('bench')) {
    category = 'Parks & Recreation';
    assignedDepartment = 'Parks, Forestry & Recreation Division';
    priority = 'Low';
    estimatedResolutionTime = '5 - 7 Business Days';
  }

  return {
    category,
    assignedDepartment,
    priority,
    estimatedResolutionTime,
    source: 'local'
  };
}

/**
 * AI Policy Simplifier Engine
 */
export async function simplifyPolicyText(
  rawText: string
): Promise<{
  summary: string;
  actionItems: string[];
  deadlines: string[];
  checklist: string[];
  source: 'local' | 'gemini';
}> {
  const sanitized = sanitizeInput(rawText);

  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const prompt = `You are a Plain Language Policy Engine. Analyze this complex legislative or governmental regulation text:
"${sanitized}"

Respond ONLY with a JSON object in this exact format, with no markdown tags or wrapper text:
{
  "summary": "1-2 sentence plain language summary",
  "actionItems": ["step 1", "step 2", "step 3"],
  "deadlines": ["deadline 1", "deadline 2"],
  "checklist": ["required document 1", "required document 2"]
}`;
      const responseText = await callGemini(prompt);
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        summary: parsed.summary,
        actionItems: parsed.actionItems || [],
        deadlines: parsed.deadlines || [],
        checklist: parsed.checklist || [],
        source: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini policy simplifier failed, falling back to local:', err);
    }
  }

  // Local simulated simplifier
  // Extracts matching terms or falls back to standard summaries
  const lines = sanitized.split(/[.!?]/).map(l => l.trim()).filter(l => l.length > 5);
  
  const summary = lines.length > 0 
    ? `This policy outline regulates the application process and requirements for local operations, ensuring standard standards are met by participants: ${lines[0]}.`
    : 'No readable text was submitted. Please input standard guidelines for analysis.';

  const actionItems = [
    'Complete the verified online application form on the portal.',
    'Assemble all the specified supporting documentation in the checklist.',
    'Submit the finalized application packet and retain the reference ID.'
  ];

  const deadlines = [
    'Regular filing deadline: Within 30 days of beginning operations.',
    'Annual renewal: Prior to December 31st of each calendar year.'
  ];

  const checklist = [
    'Valid Government Photo Identification (ID)',
    'Proof of Address or residency declaration',
    'Financial verification files (Bank statement or tax certificate)'
  ];

  // Try to find custom things if user pasted certain keywords
  if (sanitized.toLowerCase().includes('solar') || sanitized.toLowerCase().includes('tax')) {
    checklist.push('Itemized installation invoices');
    checklist.push('Energy assessment report');
    deadlines.push('Tax rebate credit application: Filed before April 15th.');
  }

  return {
    summary,
    actionItems,
    deadlines,
    checklist,
    source: 'local'
  };
}
