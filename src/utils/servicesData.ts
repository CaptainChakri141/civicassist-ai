export interface GovernmentService {
  id: string;
  name: string;
  category: 'Welfare' | 'Health' | 'Business' | 'Transport' | 'Housing';
  shortDescription: string;
  longDescription: string;
  processingTime: string;
  fee: string;
  eligibilityRules: {
    minAge?: number;
    maxAge?: number;
    maxIncome?: number;
    requireHomeownership?: boolean;
    requireEmployment?: boolean;
  };
  requiredDocuments: string[];
  conditionalDocuments?: {
    condition: string;
    documents: string[];
  }[];
}

export const servicesData: GovernmentService[] = [
  {
    id: 'civic-care',
    name: 'Universal Welfare Support (CivicCare)',
    category: 'Welfare',
    shortDescription: 'Financial assistance for low-income individuals and families.',
    longDescription: 'The CivicCare program provides monthly financial support to citizens facing economic hardship. It aims to cover basic necessities like food, utilities, and emergency expenses.',
    processingTime: '7 - 10 Business Days',
    fee: 'Free',
    eligibilityRules: {
      minAge: 18,
      maxIncome: 35000
    },
    requiredDocuments: [
      'Government Issued Photo ID (Passport or Driver License)',
      'Proof of Residency (Utility Bill or Rental Agreement under 3 months old)',
      'Last 3 Months Pay Stubs or Employment Verification Letter'
    ],
    conditionalDocuments: [
      {
        condition: 'Income is under $15,000 (Very Low Income)',
        documents: ['Tax returns for the previous physical year', 'Recent bank statement showing all asset balances']
      },
      {
        condition: 'Applicant has dependents',
        documents: ['Birth certificate(s) of child/dependent(s)', 'School enrollment verification forms']
      }
    ]
  },
  {
    id: 'civic-health',
    name: 'Citizen Health Insurance (CivicHealth)',
    category: 'Health',
    shortDescription: 'Subsidized health insurance coverage for seniors and low-income families.',
    longDescription: 'CivicHealth provides comprehensive medical, dental, and vision coverage. Subsidies are automatically calculated based on income bracket, and seniors over 60 receive premium-free care.',
    processingTime: '3 - 5 Business Days',
    fee: 'Free for Seniors, Sliding scale up to $45/mo for others',
    eligibilityRules: {
      minAge: 0,
      maxIncome: 50000
    },
    requiredDocuments: [
      'Social Security Number or Citizen Identity Number',
      'Recent Income Tax Returns (W-2 or 1099 form)',
      'Proof of Citizenship or Legal Permanent Residency status'
    ],
    conditionalDocuments: [
      {
        condition: 'Applicant has chronic medical conditions',
        documents: ['Certified Medical History report from a licensed physician']
      },
      {
        condition: 'Age is 60 or above (Senior Plan)',
        documents: ['Birth certificate or legal proof of age verification']
      }
    ]
  },
  {
    id: 'civic-business',
    name: 'Smart Business License (CivicBusiness)',
    category: 'Business',
    shortDescription: 'Fast-track licensing for local startups and small business owners.',
    longDescription: 'Register and authorize a new business entity to operate legally in the municipal district. The process includes zoning compliance checks and tax registration.',
    processingTime: '24 - 48 Hours',
    fee: '$120 (One-time registration fee)',
    eligibilityRules: {
      minAge: 18,
      requireEmployment: false
    },
    requiredDocuments: [
      'Articles of Organization / Incorporation outline',
      'Employer Identification Number (EIN) certification letter',
      'Lease agreement or proof of commercial property usage'
    ],
    conditionalDocuments: [
      {
        condition: 'Business involves food preparation or service',
        documents: ['County Health Department permit', 'Food Safety Handler certificates']
      },
      {
        condition: 'Home-based business',
        documents: ['Home Occupancy Permit agreement signed by the landlord or HOA']
      }
    ]
  },
  {
    id: 'civic-drive',
    name: 'Digital Transit & Driving License (CivicDrive)',
    category: 'Transport',
    shortDescription: 'Issuance and renewal of driver licenses and digital municipal transit passes.',
    longDescription: 'Schedule road exams, upload medical visual certificates, and access your digital driver license or bus pass directly on your device.',
    processingTime: 'Same Day (Digital)',
    fee: '$35 (Renewals), $50 (First-time issue)',
    eligibilityRules: {
      minAge: 16
    },
    requiredDocuments: [
      'Primary Proof of Identity (Birth Certificate or Passport)',
      'Vision Test Examination Report signed by an optometrist',
      'Proof of completion of Driver Education (For applicants under 18 years old)'
    ],
    conditionalDocuments: [
      {
        condition: 'Renewing an existing expired license',
        documents: ['Previous physical driving license card (to be surrendered)']
      }
    ]
  },
  {
    id: 'civic-green',
    name: 'Eco-Friendly Home Energy Rebate (CivicGreen)',
    category: 'Housing',
    shortDescription: 'Rebates for installing solar panels, heat pumps, and energy-efficient appliances.',
    longDescription: 'Get reimbursed up to 40% of installation costs for eco-friendly home upgrades. Promotes green housing, lower emissions, and energy conservation.',
    processingTime: '15 - 30 Business Days',
    fee: 'Free to apply',
    eligibilityRules: {
      minAge: 18,
      requireHomeownership: true
    },
    requiredDocuments: [
      'Property Deed or Proof of Homeownership',
      'Paid Itemized Invoice from a certified energy contractor',
      'Technical specifications sheet of installed systems (e.g. Solar panel capacity rating)'
    ],
    conditionalDocuments: [
      {
        condition: 'Rebate exceeds $2,500',
        documents: ['Before-and-after home energy audit report conducted by an authorized engineer']
      }
    ]
  }
];
