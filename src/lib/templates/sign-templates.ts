/**
 * BPA-Compliant Sign Templates
 * Based on existing LCPM signage designs
 */

import { Sign, SignType, SignElement, SignMetadata } from '../compliance/bpa-rules';
import { v4 as uuidv4 } from 'uuid';

export interface SignTemplate {
  id: string;
  name: string;
  description: string;
  type: SignType;
  thumbnail?: string;
  elements: Omit<SignElement, 'id'>[];
  defaultMetadata: Partial<SignMetadata>;
}

// Standard LCPM Colors
export const LCPM_COLORS = {
  orange: '#F5A623',
  blue: '#0077B5',
  darkBlue: '#004E7C',
  yellow: '#FFCC00',
  white: '#FFFFFF',
  black: '#000000',
  red: '#E74C3C',
  darkGray: '#2C3E50',
};

// Standard sizes (in mm for print)
export const SIGN_SIZES = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  A2: { width: 420, height: 594 },
  A1: { width: 594, height: 841 },
  A0: { width: 841, height: 1189 },
};

/**
 * Generate sign reference number
 */
export function generateSignReference(
  siteCode: string,
  type: SignType,
  sequence: number,
  version: number = 1
): string {
  const typeCode = getTypeCode(type);
  const seq = sequence.toString().padStart(3, '0');
  return `${siteCode}-${typeCode}-${seq}-v${version}`;
}

export function getTypeCode(type: SignType): string {
  const codes: Record<SignType, string> = {
    entrance: 'ENT',
    terms_conditions: 'TCS',
    tariff: 'TAR',
    disabled: 'DIS',
    ev_charging: 'EVC',
    internal: 'INT',
    wayfinding: 'WAY',
  };
  return codes[type] || 'GEN';
}

export const SIGN_TEMPLATES: SignTemplate[] = [
  // ============== ENTRANCE SIGNS ==============
  {
    id: 'entrance-standard',
    name: 'Standard Entrance Sign',
    description: 'Primary entrance sign with "Parking Regulations Apply" header',
    type: 'entrance',
    defaultMetadata: {
      hasAnpr: true,
    },
    elements: [
      // Checkered border
      {
        type: 'border',
        content: 'checkered-orange-blue',
        style: { color: LCPM_COLORS.orange, backgroundColor: LCPM_COLORS.blue },
        position: { x: 0, y: 0, width: 100, height: 100 },
      },
      // Header
      {
        type: 'text',
        content: 'PARKING REGULATIONS APPLY',
        style: { 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 5, width: 90, height: 8 },
      },
      // Private Land
      {
        type: 'text',
        content: 'PRIVATE LAND',
        style: { 
          fontSize: 48, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 14, width: 90, height: 10 },
      },
      // Instruction text
      {
        type: 'text',
        content: 'Pay to Park for All Vehicles',
        style: { 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.orange,
          textAlign: 'center'
        },
        position: { x: 5, y: 25, width: 90, height: 6 },
      },
      {
        type: 'text',
        content: 'BEYOND THIS POINT ONLY',
        style: { 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 32, width: 90, height: 5 },
      },
      // Customer info
      {
        type: 'text',
        content: 'Parking for Validated\nPark & Fly Customers\n&\nElectric Vehicles Only\n(whilst charging)',
        style: { 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.blue,
          textAlign: 'center'
        },
        position: { x: 5, y: 40, width: 90, height: 20 },
      },
      // T&C reference
      {
        type: 'text',
        content: 'Terms & Conditions Apply',
        style: { 
          fontSize: 22, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 62, width: 90, height: 4 },
      },
      {
        type: 'text',
        content: 'See signs in car park for details',
        style: { 
          fontSize: 18, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 67, width: 90, height: 3 },
      },
      // ANPR notice
      {
        type: 'text',
        content: 'This car park is monitored by ANPR camera technology',
        style: { 
          fontSize: 14, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 72, width: 90, height: 3 },
      },
      // Footer background
      {
        type: 'text',
        content: '',
        style: { 
          backgroundColor: LCPM_COLORS.blue,
        },
        position: { x: 2, y: 77, width: 96, height: 20 },
      },
      // Camera icon
      {
        type: 'icon',
        content: 'camera-anpr',
        style: {},
        position: { x: 5, y: 79, width: 12, height: 12 },
      },
      // Footer text
      {
        type: 'text',
        content: 'This car park is private property and is managed on\nbehalf of the Client by Local Car Park Management\nLtd (registered in England & Wales).\nCompany registration no: {{companyRegNumber}}\nVehicles left at Owners risk.\nHelpline: {{helplineNumber}}',
        style: { 
          fontSize: 11, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.white,
          textAlign: 'left'
        },
        position: { x: 18, y: 79, width: 50, height: 16 },
      },
      // BPA Logo
      {
        type: 'logo',
        content: 'bpa-approved-operator',
        style: {},
        position: { x: 70, y: 79, width: 12, height: 12 },
      },
      // LCPM Logo
      {
        type: 'logo',
        content: 'lcpm-logo',
        style: {},
        position: { x: 84, y: 79, width: 12, height: 12 },
      },
    ],
  },

  // ============== TERMS & CONDITIONS SIGN ==============
  {
    id: 'terms-conditions-standard',
    name: 'Terms & Conditions Sign',
    description: 'Full T&Cs sign with parking charges and legal notices',
    type: 'terms_conditions',
    defaultMetadata: {
      hasAnpr: true,
      parkingCharge: 100,
      reducedCharge: 60,
      paymentPeriod: 28,
      reducedPeriod: 14,
    },
    elements: [
      // Checkered border
      {
        type: 'border',
        content: 'checkered-orange-blue',
        style: { color: LCPM_COLORS.orange, backgroundColor: LCPM_COLORS.blue },
        position: { x: 0, y: 0, width: 100, height: 100 },
      },
      // Header
      {
        type: 'text',
        content: 'Terms & Conditions Apply',
        style: { 
          fontSize: 36, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 3, width: 90, height: 6 },
      },
      // Subheader
      {
        type: 'text',
        content: 'Pay to Park Open to Public',
        style: { 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 9, width: 90, height: 5 },
      },
      // Icons row
      {
        type: 'icon',
        content: 'qr-stopwatch',
        style: {},
        position: { x: 10, y: 15, width: 20, height: 15 },
      },
      {
        type: 'icon',
        content: 'pay-to-park',
        style: {},
        position: { x: 40, y: 15, width: 20, height: 15 },
      },
      {
        type: 'icon',
        content: 'phone-keypad',
        style: {},
        position: { x: 70, y: 15, width: 20, height: 15 },
      },
      // Icon labels
      {
        type: 'text',
        content: 'Maximum Parking Time\nConfirmed via QR Code.',
        style: { 
          fontSize: 10, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 31, width: 30, height: 5 },
      },
      {
        type: 'text',
        content: 'ALL vehicles\nmust\nPay to Park',
        style: { 
          fontSize: 10, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 35, y: 31, width: 30, height: 5 },
      },
      {
        type: 'text',
        content: 'Motorists must enter their full and\ncorrect vehicle registration\nnumber when making payment for\nparking.',
        style: { 
          fontSize: 10, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 65, y: 31, width: 30, height: 5 },
      },
      // Parking charge notice (red/prominent)
      {
        type: 'text',
        content: 'Breach of ANY term or condition will result in the driver being liable for a PARKING\nCHARGE of £{{parkingCharge}} reduced to £{{reducedCharge}}\nif paid within {{reducedPeriod}} days.',
        style: { 
          fontSize: 14, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.blue,
          textAlign: 'center'
        },
        position: { x: 5, y: 38, width: 90, height: 7 },
      },
      // Contract clause
      {
        type: 'text',
        content: 'By entering or remaining on this land you agree to abide by the Terms and Conditions of\nSigns Distributed Throughout the Car Park.',
        style: { 
          fontSize: 12, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 46, width: 90, height: 5 },
      },
      // Full T&Cs paragraph
      {
        type: 'text',
        content: 'Parking charges are to be paid within {{paymentPeriod}} days. Additional parking charges apply for each 24-hour period, or part thereof, that the vehicle remains in breach or if it returns at any time. Terms and conditions apply 24 hours a day, all year round. Non-payment will result in a debt recovery fee of £70 being added to the value of the parking charge. The driver shall be liable for any outstanding charges, collection fees, interest, and costs on an indemnity basis. Where any statutory basis exists for any monies due under this contract to be recovered from anyone other than the driver, they too shall be recoverable on an indemnity basis. We are not liable for any loss or damage howsoever caused to any person or property whilst on this site save under any statutory exceptions.',
        style: { 
          fontSize: 9, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'left'
        },
        position: { x: 5, y: 52, width: 90, height: 13 },
      },
      // Personal data header
      {
        type: 'text',
        content: 'Your Personal Data',
        style: { 
          fontSize: 11, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'left'
        },
        position: { x: 5, y: 66, width: 90, height: 3 },
      },
      // Personal data paragraph
      {
        type: 'text',
        content: 'Personal data in the form of registration number, photographs of you and your vehicle may be obtained to ensure compliance with your obligations when entering on to this land. Automatic Number Plate Recognition will be in use. The data may be retained for enforcement purposes. Where a parking charge becomes due an application may be made to the DVLA for the keeper\'s details to allow notices to be sent through the post.',
        style: { 
          fontSize: 9, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'left'
        },
        position: { x: 5, y: 69, width: 90, height: 8 },
      },
      // Privacy notice link
      {
        type: 'text',
        content: 'Our full Privacy Notice can be found by visiting: {{website}}',
        style: { 
          fontSize: 9, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'left'
        },
        position: { x: 5, y: 77, width: 90, height: 2 },
      },
      // ANPR notice
      {
        type: 'text',
        content: 'Monitored by ANPR cameras',
        style: { 
          fontSize: 14, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 80, width: 90, height: 3 },
      },
      // Footer background
      {
        type: 'text',
        content: '',
        style: { 
          backgroundColor: LCPM_COLORS.blue,
        },
        position: { x: 2, y: 84, width: 96, height: 14 },
      },
      // Camera icon
      {
        type: 'icon',
        content: 'camera-anpr',
        style: {},
        position: { x: 4, y: 85, width: 10, height: 10 },
      },
      // Footer text
      {
        type: 'text',
        content: 'This car park is private property and is managed by\nLocal Car Park Management Ltd (registered in\nEngland & Wales) on behalf of the Client.\nVehicles left at Owners risk.\nHelpline: {{helplineNumber}}\nCompany registration no: {{companyRegNumber}}',
        style: { 
          fontSize: 10, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.white,
          textAlign: 'left'
        },
        position: { x: 15, y: 85, width: 55, height: 12 },
      },
      // BPA Logo
      {
        type: 'logo',
        content: 'bpa-approved-operator',
        style: {},
        position: { x: 72, y: 85, width: 10, height: 10 },
      },
      // LCPM Logo
      {
        type: 'logo',
        content: 'lcpm-logo',
        style: {},
        position: { x: 85, y: 85, width: 10, height: 10 },
      },
    ],
  },

  // ============== DISABLED PARKING SIGN ==============
  {
    id: 'disabled-parking',
    name: 'Disabled Parking Sign',
    description: 'Blue badge / disabled parking bay sign',
    type: 'disabled',
    defaultMetadata: {
      hasAnpr: true,
    },
    elements: [
      {
        type: 'border',
        content: 'checkered-orange-blue',
        style: { color: LCPM_COLORS.orange, backgroundColor: LCPM_COLORS.blue },
        position: { x: 0, y: 0, width: 100, height: 100 },
      },
      {
        type: 'text',
        content: 'DISABLED PARKING ONLY',
        style: { 
          fontSize: 36, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 5, width: 90, height: 10 },
      },
      {
        type: 'icon',
        content: 'disabled-symbol',
        style: { color: LCPM_COLORS.blue },
        position: { x: 30, y: 18, width: 40, height: 40 },
      },
      {
        type: 'text',
        content: 'Blue Badge Holders Only',
        style: { 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.blue,
          textAlign: 'center'
        },
        position: { x: 5, y: 60, width: 90, height: 6 },
      },
      {
        type: 'text',
        content: 'Badge must be displayed',
        style: { 
          fontSize: 18, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 67, width: 90, height: 4 },
      },
      // Footer
      {
        type: 'text',
        content: '',
        style: { backgroundColor: LCPM_COLORS.blue },
        position: { x: 2, y: 80, width: 96, height: 17 },
      },
      {
        type: 'logo',
        content: 'bpa-approved-operator',
        style: {},
        position: { x: 70, y: 82, width: 12, height: 12 },
      },
      {
        type: 'logo',
        content: 'lcpm-logo',
        style: {},
        position: { x: 84, y: 82, width: 12, height: 12 },
      },
    ],
  },

  // ============== EV CHARGING SIGN ==============
  {
    id: 'ev-charging',
    name: 'EV Charging Bay Sign',
    description: 'Electric vehicle charging bay sign',
    type: 'ev_charging',
    defaultMetadata: {
      hasAnpr: true,
    },
    elements: [
      {
        type: 'border',
        content: 'checkered-orange-blue',
        style: { color: LCPM_COLORS.orange, backgroundColor: LCPM_COLORS.blue },
        position: { x: 0, y: 0, width: 100, height: 100 },
      },
      {
        type: 'text',
        content: 'ELECTRIC VEHICLE',
        style: { 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 5, width: 90, height: 7 },
      },
      {
        type: 'text',
        content: 'CHARGING ONLY',
        style: { 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 12, width: 90, height: 7 },
      },
      {
        type: 'icon',
        content: 'ev-charging',
        style: { color: '#27AE60' },
        position: { x: 30, y: 22, width: 40, height: 35 },
      },
      {
        type: 'text',
        content: 'Actively Drawing a Charge',
        style: { 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.blue,
          textAlign: 'center'
        },
        position: { x: 5, y: 60, width: 90, height: 6 },
      },
      {
        type: 'text',
        content: 'Vehicles not charging will receive a\nParking Charge Notice',
        style: { 
          fontSize: 16, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 68, width: 90, height: 7 },
      },
      // Footer
      {
        type: 'text',
        content: '',
        style: { backgroundColor: LCPM_COLORS.blue },
        position: { x: 2, y: 80, width: 96, height: 17 },
      },
      {
        type: 'logo',
        content: 'bpa-approved-operator',
        style: {},
        position: { x: 70, y: 82, width: 12, height: 12 },
      },
      {
        type: 'logo',
        content: 'lcpm-logo',
        style: {},
        position: { x: 84, y: 82, width: 12, height: 12 },
      },
    ],
  },

  // ============== TARIFF SIGN ==============
  {
    id: 'tariff-standard',
    name: 'Tariff Sign',
    description: 'Parking tariff and payment information',
    type: 'tariff',
    defaultMetadata: {
      hasAnpr: true,
    },
    elements: [
      {
        type: 'border',
        content: 'checkered-orange-blue',
        style: { color: LCPM_COLORS.orange, backgroundColor: LCPM_COLORS.blue },
        position: { x: 0, y: 0, width: 100, height: 100 },
      },
      {
        type: 'text',
        content: 'PARKING TARIFFS APPLY',
        style: { 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 5, width: 90, height: 8 },
      },
      {
        type: 'text',
        content: 'via {{paymentMethod}}',
        style: { 
          fontSize: 24, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.orange,
          textAlign: 'center'
        },
        position: { x: 5, y: 14, width: 90, height: 5 },
      },
      // QR Code placeholder
      {
        type: 'qr',
        content: '{{paymentUrl}}',
        style: {},
        position: { x: 35, y: 22, width: 30, height: 30 },
      },
      // Tariff table placeholder
      {
        type: 'text',
        content: '{{tariffTable}}',
        style: { 
          fontSize: 14, 
          fontWeight: 'normal', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 55, width: 90, height: 20 },
      },
      // Footer
      {
        type: 'text',
        content: '',
        style: { backgroundColor: LCPM_COLORS.blue },
        position: { x: 2, y: 80, width: 96, height: 17 },
      },
      {
        type: 'logo',
        content: 'bpa-approved-operator',
        style: {},
        position: { x: 70, y: 82, width: 12, height: 12 },
      },
      {
        type: 'logo',
        content: 'lcpm-logo',
        style: {},
        position: { x: 84, y: 82, width: 12, height: 12 },
      },
    ],
  },

  // ============== INTERNAL QR SIGN ==============
  {
    id: 'internal-qr',
    name: 'Internal QR Code Sign',
    description: 'Small internal sign with QR code for payment',
    type: 'internal',
    defaultMetadata: {},
    elements: [
      {
        type: 'border',
        content: 'checkered-orange-blue',
        style: { color: LCPM_COLORS.orange, backgroundColor: LCPM_COLORS.blue },
        position: { x: 0, y: 0, width: 100, height: 100 },
      },
      {
        type: 'text',
        content: 'SCAN TO PAY',
        style: { 
          fontSize: 28, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.black,
          textAlign: 'center'
        },
        position: { x: 5, y: 5, width: 90, height: 10 },
      },
      {
        type: 'qr',
        content: '{{paymentUrl}}',
        style: {},
        position: { x: 20, y: 18, width: 60, height: 60 },
      },
      {
        type: 'text',
        content: 'Location Code: {{locationCode}}',
        style: { 
          fontSize: 14, 
          fontWeight: 'bold', 
          color: LCPM_COLORS.blue,
          textAlign: 'center'
        },
        position: { x: 5, y: 82, width: 90, height: 5 },
      },
      {
        type: 'logo',
        content: 'lcpm-logo',
        style: {},
        position: { x: 40, y: 88, width: 20, height: 10 },
      },
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): SignTemplate | undefined {
  return SIGN_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: SignType): SignTemplate[] {
  return SIGN_TEMPLATES.filter(t => t.type === type);
}

/**
 * Create sign from template
 */
export function createSignFromTemplate(
  templateId: string,
  metadata: SignMetadata,
  siteCode: string,
  sequence: number
): Sign {
  const template = getTemplate(templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const reference = generateSignReference(siteCode, template.type, sequence);
  
  // Process template variables
  const processedElements: SignElement[] = template.elements.map(el => ({
    ...el,
    id: uuidv4(),
    content: replaceTemplateVariables(el.content, metadata),
  }));

  return {
    id: uuidv4(),
    reference,
    type: template.type,
    site: siteCode,
    elements: processedElements,
    metadata: {
      ...template.defaultMetadata,
      ...metadata,
    } as SignMetadata,
  };
}

/**
 * Replace template variables with actual values
 */
function replaceTemplateVariables(content: string, metadata: SignMetadata): string {
  const replacements: Record<string, string> = {
    '{{siteName}}': metadata.siteName || '',
    '{{siteCode}}': metadata.siteCode || '',
    '{{companyName}}': metadata.companyName || 'Local Car Park Management Ltd',
    '{{companyRegNumber}}': metadata.companyRegNumber || '14379954',
    '{{helplineNumber}}': metadata.helplineNumber || '0345 548 1716',
    '{{parkingCharge}}': (metadata.parkingCharge || 100).toString(),
    '{{reducedCharge}}': (metadata.reducedCharge || 60).toString(),
    '{{paymentPeriod}}': (metadata.paymentPeriod || 28).toString(),
    '{{reducedPeriod}}': (metadata.reducedPeriod || 14).toString(),
    '{{website}}': metadata.website || 'www.localcarparkmanagement.com',
  };

  let result = content;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value);
  }
  return result;
}
