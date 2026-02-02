/**
 * BPA Code of Practice Compliance Rules
 * Based on the British Parking Association Code of Practice
 * Last updated: 2024
 */

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'required' | 'recommended' | 'warning';
  signTypes: SignType[];
  check: (sign: Sign) => ComplianceResult;
}

export interface ComplianceResult {
  passed: boolean;
  message: string;
  suggestion?: string;
  autoFixable?: boolean;
}

export type SignType = 
  | 'entrance'
  | 'terms_conditions'
  | 'tariff'
  | 'disabled'
  | 'ev_charging'
  | 'internal'
  | 'wayfinding';

export interface Sign {
  id: string;
  reference: string;
  type: SignType;
  site: string;
  elements: SignElement[];
  metadata: SignMetadata;
}

export interface SignElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'logo' | 'icon' | 'border';
  content: string;
  style: ElementStyle;
  position: Position;
}

export interface ElementStyle {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
}

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignMetadata {
  siteName: string;
  siteCode: string;
  companyName: string;
  companyRegNumber: string;
  helplineNumber: string;
  parkingCharge: number;
  reducedCharge: number;
  paymentPeriod: number;
  reducedPeriod: number;
  hasAnpr: boolean;
  website?: string;
}

// BPA Maximum amounts (2024)
export const BPA_MAX_PARKING_CHARGE = 100;
export const BPA_MAX_REDUCED_CHARGE = 60;
export const BPA_REDUCED_PERIOD_DAYS = 14;
export const BPA_TOTAL_PERIOD_DAYS = 28;
export const BPA_DEBT_RECOVERY_FEE = 70;

// Minimum font sizes for legibility (in points for A4 @ 150 DPI)
export const MIN_HEADER_FONT_SIZE = 48;
export const MIN_BODY_FONT_SIZE = 14;
export const MIN_SMALL_FONT_SIZE = 10;

export const BPA_RULES: ComplianceRule[] = [
  // ============== REQUIRED RULES ==============
  
  {
    id: 'header-statement',
    name: 'Header Statement',
    description: 'Sign must have "Parking Regulations Apply" or "Terms & Conditions Apply" header',
    category: 'required',
    signTypes: ['entrance', 'terms_conditions', 'tariff'],
    check: (sign) => {
      const headerPatterns = [
        /parking\s+regulations?\s+apply/i,
        /terms\s*&?\s*conditions?\s+apply/i,
        /private\s+land/i,
        /private\s+property/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasHeader = textElements.some(el => 
        headerPatterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasHeader,
        message: hasHeader 
          ? 'Header statement present' 
          : 'Missing required header statement',
        suggestion: 'Add "Parking Regulations Apply" or "Terms & Conditions Apply" at the top of the sign',
        autoFixable: true
      };
    }
  },

  {
    id: 'private-land-notice',
    name: 'Private Land Notice',
    description: 'Sign must indicate this is private property',
    category: 'required',
    signTypes: ['entrance', 'terms_conditions'],
    check: (sign) => {
      const patterns = [
        /private\s+(land|property)/i,
        /privately\s+owned/i,
        /this\s+car\s+park\s+is\s+private/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasNotice = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasNotice,
        message: hasNotice 
          ? 'Private land notice present' 
          : 'Missing private land/property notice',
        suggestion: 'Add "PRIVATE LAND" or "This car park is private property" statement',
        autoFixable: true
      };
    }
  },

  {
    id: 'bpa-logo',
    name: 'BPA Approved Operator Logo',
    description: 'Sign must display the BPA Approved Operator logo',
    category: 'required',
    signTypes: ['entrance', 'terms_conditions'],
    check: (sign) => {
      const hasLogo = sign.elements.some(el => 
        el.type === 'logo' && el.content.toLowerCase().includes('bpa')
      );
      
      return {
        passed: hasLogo,
        message: hasLogo 
          ? 'BPA logo present' 
          : 'Missing BPA Approved Operator logo',
        suggestion: 'Add the BPA Approved Operator logo to the footer area',
        autoFixable: true
      };
    }
  },

  {
    id: 'company-details',
    name: 'Company Details',
    description: 'Sign must include company name and registration number',
    category: 'required',
    signTypes: ['entrance', 'terms_conditions'],
    check: (sign) => {
      const patterns = [
        /company\s+reg(istration)?\s*(no|number)?:?\s*\d+/i,
        /registered\s+in\s+england/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasCompanyReg = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      const hasCompanyName = sign.metadata.companyName && 
        textElements.some(el => el.content.includes(sign.metadata.companyName));
      
      const passed = hasCompanyReg && hasCompanyName;
      
      return {
        passed,
        message: passed 
          ? 'Company details present' 
          : 'Missing company name or registration number',
        suggestion: `Add company name and registration number (e.g., "Company registration no: ${sign.metadata.companyRegNumber || '12345678'}")`,
        autoFixable: true
      };
    }
  },

  {
    id: 'helpline-number',
    name: 'Helpline Number',
    description: 'Sign must include a helpline/contact number',
    category: 'required',
    signTypes: ['entrance', 'terms_conditions'],
    check: (sign) => {
      const phonePattern = /helpline:?\s*[\d\s-]+|contact:?\s*[\d\s-]+|\d{4}\s*\d{3}\s*\d{4}/i;
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasHelpline = textElements.some(el => phonePattern.test(el.content));
      
      return {
        passed: hasHelpline,
        message: hasHelpline 
          ? 'Helpline number present' 
          : 'Missing helpline/contact number',
        suggestion: `Add "Helpline: ${sign.metadata.helplineNumber || '0345 548 1716'}"`,
        autoFixable: true
      };
    }
  },

  {
    id: 'anpr-notice',
    name: 'ANPR Monitoring Notice',
    description: 'If ANPR is used, sign must notify users',
    category: 'required',
    signTypes: ['entrance', 'terms_conditions'],
    check: (sign) => {
      if (!sign.metadata.hasAnpr) {
        return { passed: true, message: 'ANPR not used - notice not required' };
      }
      
      const patterns = [
        /anpr/i,
        /automatic\s+number\s+plate/i,
        /camera\s+(?:technology|monitoring|surveillance)/i,
        /monitored\s+by\s+.*camera/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasNotice = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasNotice,
        message: hasNotice 
          ? 'ANPR notice present' 
          : 'Missing ANPR monitoring notice',
        suggestion: 'Add "Monitored by ANPR cameras" or "This car park is monitored by ANPR camera technology"',
        autoFixable: true
      };
    }
  },

  {
    id: 'parking-charge-amount',
    name: 'Parking Charge Amount',
    description: `Parking charge must not exceed £${BPA_MAX_PARKING_CHARGE}`,
    category: 'required',
    signTypes: ['terms_conditions'],
    check: (sign) => {
      const charge = sign.metadata.parkingCharge;
      
      if (!charge) {
        return {
          passed: false,
          message: 'Parking charge amount not specified',
          suggestion: `Add parking charge amount (max £${BPA_MAX_PARKING_CHARGE})`,
          autoFixable: false
        };
      }
      
      const passed = charge <= BPA_MAX_PARKING_CHARGE;
      
      return {
        passed,
        message: passed 
          ? `Parking charge £${charge} is compliant` 
          : `Parking charge £${charge} exceeds BPA maximum of £${BPA_MAX_PARKING_CHARGE}`,
        suggestion: passed ? undefined : `Reduce parking charge to £${BPA_MAX_PARKING_CHARGE} or less`,
        autoFixable: true
      };
    }
  },

  {
    id: 'reduced-charge-amount',
    name: 'Reduced Charge Amount',
    description: `Reduced charge (if paid within ${BPA_REDUCED_PERIOD_DAYS} days) must not exceed £${BPA_MAX_REDUCED_CHARGE}`,
    category: 'required',
    signTypes: ['terms_conditions'],
    check: (sign) => {
      const charge = sign.metadata.reducedCharge;
      
      if (!charge) {
        return {
          passed: false,
          message: 'Reduced charge amount not specified',
          suggestion: `Add reduced charge amount (max £${BPA_MAX_REDUCED_CHARGE} if paid within ${BPA_REDUCED_PERIOD_DAYS} days)`,
          autoFixable: false
        };
      }
      
      const passed = charge <= BPA_MAX_REDUCED_CHARGE;
      
      return {
        passed,
        message: passed 
          ? `Reduced charge £${charge} is compliant` 
          : `Reduced charge £${charge} exceeds BPA maximum of £${BPA_MAX_REDUCED_CHARGE}`,
        suggestion: passed ? undefined : `Reduce to £${BPA_MAX_REDUCED_CHARGE} or less`,
        autoFixable: true
      };
    }
  },

  {
    id: 'payment-period',
    name: 'Payment Period Notice',
    description: 'Must specify reduced rate period and total payment period',
    category: 'required',
    signTypes: ['terms_conditions'],
    check: (sign) => {
      const patterns = [
        /if\s+paid\s+within\s+\d+\s+days/i,
        /reduced\s+to.*if\s+paid/i,
        /\d+\s+days/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasPeriod = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasPeriod,
        message: hasPeriod 
          ? 'Payment period specified' 
          : 'Missing payment period information',
        suggestion: `Add "reduced to £${sign.metadata.reducedCharge || 60} if paid within ${BPA_REDUCED_PERIOD_DAYS} days"`,
        autoFixable: true
      };
    }
  },

  {
    id: 'contract-clause',
    name: 'Contract Formation Clause',
    description: 'Must include contract formation statement',
    category: 'required',
    signTypes: ['terms_conditions'],
    check: (sign) => {
      const patterns = [
        /by\s+entering\s+(or\s+remaining\s+)?on\s+this\s+land/i,
        /you\s+agree\s+to\s+abide\s+by/i,
        /terms\s+and\s+conditions\s+(of\s+)?signs\s+distributed/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasClause = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasClause,
        message: hasClause 
          ? 'Contract clause present' 
          : 'Missing contract formation clause',
        suggestion: 'Add "By entering or remaining on this land you agree to abide by the Terms and Conditions of Signs Distributed Throughout the Car Park."',
        autoFixable: true
      };
    }
  },

  {
    id: 'privacy-notice',
    name: 'Privacy/Data Notice',
    description: 'Must include personal data collection notice',
    category: 'required',
    signTypes: ['terms_conditions'],
    check: (sign) => {
      const patterns = [
        /personal\s+data/i,
        /privacy\s+notice/i,
        /data\s+protection/i,
        /photographs?\s+of\s+you/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasNotice = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasNotice,
        message: hasNotice 
          ? 'Privacy notice present' 
          : 'Missing personal data/privacy notice',
        suggestion: 'Add personal data collection notice mentioning ANPR, photographs, and DVLA data requests',
        autoFixable: true
      };
    }
  },

  {
    id: 'debt-recovery-notice',
    name: 'Debt Recovery Notice',
    description: 'Must mention debt recovery fee consequences',
    category: 'required',
    signTypes: ['terms_conditions'],
    check: (sign) => {
      const patterns = [
        /debt\s+recovery/i,
        /non-?payment\s+will\s+result/i,
        /collection\s+fees?/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasNotice = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasNotice,
        message: hasNotice 
          ? 'Debt recovery notice present' 
          : 'Missing debt recovery notice',
        suggestion: `Add "Non-payment will result in a debt recovery fee of £${BPA_DEBT_RECOVERY_FEE} being added"`,
        autoFixable: true
      };
    }
  },

  // ============== RECOMMENDED RULES ==============

  {
    id: 'vehicles-at-risk',
    name: 'Vehicles at Risk Notice',
    description: 'Should include "Vehicles left at owner\'s risk" statement',
    category: 'recommended',
    signTypes: ['entrance', 'terms_conditions'],
    check: (sign) => {
      const patterns = [
        /vehicles?\s+left\s+at\s+owners?\s*'?\s*risk/i,
        /park\s+at\s+(your\s+)?own\s+risk/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasNotice = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasNotice,
        message: hasNotice 
          ? 'Risk notice present' 
          : 'Consider adding "Vehicles left at owner\'s risk"',
        suggestion: 'Add "Vehicles left at Owners risk."',
        autoFixable: true
      };
    }
  },

  {
    id: 'company-logo',
    name: 'Company Logo',
    description: 'Should include company/operator logo',
    category: 'recommended',
    signTypes: ['entrance', 'terms_conditions'],
    check: (sign) => {
      const hasLogo = sign.elements.some(el => 
        el.type === 'logo' && !el.content.toLowerCase().includes('bpa')
      );
      
      return {
        passed: hasLogo,
        message: hasLogo 
          ? 'Company logo present' 
          : 'Consider adding company logo',
        suggestion: 'Add LCPM or operator logo for brand recognition',
        autoFixable: true
      };
    }
  },

  {
    id: 'website-reference',
    name: 'Website Reference',
    description: 'Should include website for full terms/privacy policy',
    category: 'recommended',
    signTypes: ['terms_conditions'],
    check: (sign) => {
      const patterns = [
        /www\./i,
        /https?:\/\//i,
        /\.com|\.co\.uk/i,
      ];
      
      const textElements = sign.elements.filter(e => e.type === 'text');
      const hasWebsite = textElements.some(el => 
        patterns.some(pattern => pattern.test(el.content))
      );
      
      return {
        passed: hasWebsite,
        message: hasWebsite 
          ? 'Website reference present' 
          : 'Consider adding website for full privacy policy',
        suggestion: 'Add "Our full Privacy Notice can be found by visiting: www.localcarparkmanagement.com"',
        autoFixable: true
      };
    }
  },

  // ============== WARNING RULES ==============

  {
    id: 'font-size-legibility',
    name: 'Font Size Legibility',
    description: 'Text must be large enough to read',
    category: 'warning',
    signTypes: ['entrance', 'terms_conditions', 'tariff', 'disabled', 'ev_charging', 'internal', 'wayfinding'],
    check: (sign) => {
      const smallTextElements = sign.elements.filter(e => 
        e.type === 'text' && 
        e.style.fontSize && 
        e.style.fontSize < MIN_SMALL_FONT_SIZE
      );
      
      const passed = smallTextElements.length === 0;
      
      return {
        passed,
        message: passed 
          ? 'All text is legible size' 
          : `${smallTextElements.length} text element(s) may be too small to read`,
        suggestion: `Increase font size to at least ${MIN_SMALL_FONT_SIZE}pt for readability`,
        autoFixable: true
      };
    }
  },

  {
    id: 'border-visibility',
    name: 'Border/Edge Visibility',
    description: 'Sign should have clear visible border',
    category: 'warning',
    signTypes: ['entrance', 'terms_conditions', 'tariff'],
    check: (sign) => {
      const hasBorder = sign.elements.some(el => el.type === 'border');
      
      return {
        passed: hasBorder,
        message: hasBorder 
          ? 'Sign has visible border' 
          : 'Consider adding a border for visibility',
        suggestion: 'Add checkered orange/blue border following LCPM brand guidelines',
        autoFixable: true
      };
    }
  },
];

/**
 * Run compliance check on a sign
 */
export function checkCompliance(sign: Sign): {
  compliant: boolean;
  score: number;
  results: Array<ComplianceRule & { result: ComplianceResult }>;
  summary: {
    passed: number;
    failed: number;
    warnings: number;
  };
} {
  const applicableRules = BPA_RULES.filter(rule => 
    rule.signTypes.includes(sign.type)
  );
  
  const results = applicableRules.map(rule => ({
    ...rule,
    result: rule.check(sign)
  }));
  
  const requiredResults = results.filter(r => r.category === 'required');
  const allRequiredPassed = requiredResults.every(r => r.result.passed);
  
  const passed = results.filter(r => r.result.passed).length;
  const failed = results.filter(r => !r.result.passed && r.category === 'required').length;
  const warnings = results.filter(r => !r.result.passed && r.category !== 'required').length;
  
  const score = Math.round((passed / results.length) * 100);
  
  return {
    compliant: allRequiredPassed,
    score,
    results,
    summary: { passed, failed, warnings }
  };
}

/**
 * Get rules for a specific sign type
 */
export function getRulesForSignType(type: SignType): ComplianceRule[] {
  return BPA_RULES.filter(rule => rule.signTypes.includes(type));
}
