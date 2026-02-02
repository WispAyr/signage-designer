#!/usr/bin/env node
/**
 * Signage Designer MCP Server
 * 
 * Provides tools for:
 * - Creating signs from templates
 * - Checking BPA compliance
 * - Exporting signs to PDF
 * - Managing sign references
 */

const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Sign storage directory
const SIGNS_DIR = path.join(__dirname, '../../signs');

// Ensure signs directory exists
fs.mkdir(SIGNS_DIR, { recursive: true }).catch(() => {});

// ============== BPA COMPLIANCE RULES ==============

const BPA_MAX_PARKING_CHARGE = 100;
const BPA_MAX_REDUCED_CHARGE = 60;

const complianceRules = {
  'header-statement': {
    name: 'Header Statement',
    required: true,
    check: (sign) => {
      const patterns = [
        /parking\s+regulations?\s+apply/i,
        /terms\s*&?\s*conditions?\s+apply/i,
        /private\s+land/i,
      ];
      const text = getSignText(sign);
      return patterns.some(p => p.test(text));
    }
  },
  'private-land': {
    name: 'Private Land Notice',
    required: true,
    check: (sign) => {
      const patterns = [/private\s+(land|property)/i];
      const text = getSignText(sign);
      return patterns.some(p => p.test(text));
    }
  },
  'bpa-logo': {
    name: 'BPA Logo',
    required: true,
    check: (sign) => {
      return sign.elements?.some(e => 
        e.type === 'logo' && e.content?.toLowerCase().includes('bpa')
      );
    }
  },
  'company-details': {
    name: 'Company Details',
    required: true,
    check: (sign) => {
      const text = getSignText(sign);
      return /company\s+reg/i.test(text) && sign.metadata?.companyName;
    }
  },
  'helpline': {
    name: 'Helpline Number',
    required: true,
    check: (sign) => {
      const text = getSignText(sign);
      return /helpline|contact/i.test(text) && /\d{4}\s*\d{3}\s*\d{4}/.test(text);
    }
  },
  'anpr-notice': {
    name: 'ANPR Notice',
    required: true,
    check: (sign) => {
      if (!sign.metadata?.hasAnpr) return true;
      const text = getSignText(sign);
      return /anpr|automatic\s+number\s+plate|camera/i.test(text);
    }
  },
  'charge-amount': {
    name: 'Parking Charge Amount',
    required: true,
    forTypes: ['terms_conditions'],
    check: (sign) => {
      return sign.metadata?.parkingCharge <= BPA_MAX_PARKING_CHARGE;
    }
  },
  'reduced-amount': {
    name: 'Reduced Charge Amount',
    required: true,
    forTypes: ['terms_conditions'],
    check: (sign) => {
      return sign.metadata?.reducedCharge <= BPA_MAX_REDUCED_CHARGE;
    }
  },
  'contract-clause': {
    name: 'Contract Clause',
    required: true,
    forTypes: ['terms_conditions'],
    check: (sign) => {
      const text = getSignText(sign);
      return /by\s+entering\s+(or\s+remaining\s+)?on\s+this\s+land/i.test(text);
    }
  },
  'privacy-notice': {
    name: 'Privacy Notice',
    required: true,
    forTypes: ['terms_conditions'],
    check: (sign) => {
      const text = getSignText(sign);
      return /personal\s+data|privacy/i.test(text);
    }
  },
  'debt-recovery': {
    name: 'Debt Recovery Notice',
    required: true,
    forTypes: ['terms_conditions'],
    check: (sign) => {
      const text = getSignText(sign);
      return /debt\s+recovery|non-?payment/i.test(text);
    }
  }
};

function getSignText(sign) {
  return sign.elements
    ?.filter(e => e.type === 'text')
    .map(e => e.content)
    .join(' ') || '';
}

function checkCompliance(sign) {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const [id, rule] of Object.entries(complianceRules)) {
    // Skip rules not applicable to this sign type
    if (rule.forTypes && !rule.forTypes.includes(sign.type)) {
      continue;
    }

    const isPassed = rule.check(sign);
    results.push({
      id,
      name: rule.name,
      required: rule.required,
      passed: isPassed
    });

    if (isPassed) passed++;
    else if (rule.required) failed++;
  }

  return {
    compliant: failed === 0,
    score: Math.round((passed / results.length) * 100),
    results,
    summary: { passed, failed, total: results.length }
  };
}

// ============== SIGN TEMPLATES ==============

const templates = {
  'entrance-standard': {
    id: 'entrance-standard',
    name: 'Standard Entrance Sign',
    type: 'entrance',
    defaultElements: [
      { type: 'border', content: 'checkered-orange-blue' },
      { type: 'text', content: 'PARKING REGULATIONS APPLY' },
      { type: 'text', content: 'PRIVATE LAND' },
      { type: 'text', content: 'Pay to Park for All Vehicles' },
      { type: 'text', content: 'Terms & Conditions Apply' },
      { type: 'text', content: 'This car park is monitored by ANPR camera technology' },
      { type: 'logo', content: 'bpa-approved-operator' },
      { type: 'logo', content: 'lcpm-logo' }
    ]
  },
  'terms-conditions-standard': {
    id: 'terms-conditions-standard',
    name: 'Terms & Conditions Sign',
    type: 'terms_conditions',
    defaultElements: [
      { type: 'border', content: 'checkered-orange-blue' },
      { type: 'text', content: 'Terms & Conditions Apply' },
      { type: 'text', content: 'By entering or remaining on this land you agree to abide by the Terms and Conditions' },
      { type: 'text', content: 'Breach of ANY term or condition will result in a PARKING CHARGE' },
      { type: 'text', content: 'Your Personal Data - Personal data may be obtained' },
      { type: 'text', content: 'Non-payment will result in a debt recovery fee' },
      { type: 'text', content: 'Monitored by ANPR cameras' },
      { type: 'logo', content: 'bpa-approved-operator' },
      { type: 'logo', content: 'lcpm-logo' }
    ]
  },
  'disabled-parking': {
    id: 'disabled-parking',
    name: 'Disabled Parking Sign',
    type: 'disabled'
  },
  'ev-charging': {
    id: 'ev-charging',
    name: 'EV Charging Bay Sign',
    type: 'ev_charging'
  },
  'tariff-standard': {
    id: 'tariff-standard',
    name: 'Tariff Sign',
    type: 'tariff'
  },
  'internal-qr': {
    id: 'internal-qr',
    name: 'Internal QR Code Sign',
    type: 'internal'
  }
};

const typeCodeMap = {
  entrance: 'ENT',
  terms_conditions: 'TCS',
  tariff: 'TAR',
  disabled: 'DIS',
  ev_charging: 'EVC',
  internal: 'INT',
  wayfinding: 'WAY'
};

function generateReference(siteCode, type, sequence = 1, version = 1) {
  const typeCode = typeCodeMap[type] || 'GEN';
  return `${siteCode}-${typeCode}-${String(sequence).padStart(3, '0')}-v${version}`;
}

// ============== MCP TOOLS ==============

const tools = [
  {
    name: 'create_sign',
    description: 'Create a new BPA-compliant sign from a template',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'Template ID (e.g., entrance-standard, terms-conditions-standard)',
          enum: Object.keys(templates)
        },
        siteCode: {
          type: 'string',
          description: 'Site code (e.g., KRS for Kyle Rise)'
        },
        siteName: {
          type: 'string',
          description: 'Full site name'
        },
        companyName: {
          type: 'string',
          description: 'Company name (default: Local Car Park Management Ltd)'
        },
        companyRegNumber: {
          type: 'string',
          description: 'Company registration number (default: 14379954)'
        },
        helplineNumber: {
          type: 'string',
          description: 'Helpline phone number (default: 0345 548 1716)'
        },
        parkingCharge: {
          type: 'number',
          description: 'Parking charge amount in GBP (max £100)'
        },
        reducedCharge: {
          type: 'number',
          description: 'Reduced charge if paid within 14 days (max £60)'
        },
        hasAnpr: {
          type: 'boolean',
          description: 'Whether site uses ANPR (default: true)'
        },
        sequence: {
          type: 'number',
          description: 'Sign sequence number for this site (default: auto-increment)'
        }
      },
      required: ['templateId', 'siteCode', 'siteName']
    }
  },
  {
    name: 'check_compliance',
    description: 'Check if a sign meets BPA Code of Practice requirements',
    inputSchema: {
      type: 'object',
      properties: {
        signReference: {
          type: 'string',
          description: 'Sign reference number (e.g., KRS-ENT-001-v1)'
        },
        signData: {
          type: 'object',
          description: 'Or provide sign data directly'
        }
      }
    }
  },
  {
    name: 'export_pdf',
    description: 'Export a sign to PDF format for printing',
    inputSchema: {
      type: 'object',
      properties: {
        signReference: {
          type: 'string',
          description: 'Sign reference number'
        },
        size: {
          type: 'string',
          description: 'Paper size (A4, A3, A2, A1, A0)',
          enum: ['A4', 'A3', 'A2', 'A1', 'A0'],
          default: 'A4'
        },
        includeBleed: {
          type: 'boolean',
          description: 'Include bleed marks for professional printing',
          default: false
        }
      },
      required: ['signReference']
    }
  },
  {
    name: 'list_templates',
    description: 'List available sign templates',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: 'Filter by sign type',
          enum: ['entrance', 'terms_conditions', 'tariff', 'disabled', 'ev_charging', 'internal', 'wayfinding']
        }
      }
    }
  },
  {
    name: 'get_sign',
    description: 'Retrieve a sign by its reference number',
    inputSchema: {
      type: 'object',
      properties: {
        signReference: {
          type: 'string',
          description: 'Sign reference number'
        }
      },
      required: ['signReference']
    }
  },
  {
    name: 'list_signs',
    description: 'List all signs, optionally filtered by site',
    inputSchema: {
      type: 'object',
      properties: {
        siteCode: {
          type: 'string',
          description: 'Filter by site code'
        },
        type: {
          type: 'string',
          description: 'Filter by sign type'
        }
      }
    }
  },
  {
    name: 'update_sign',
    description: 'Update an existing sign',
    inputSchema: {
      type: 'object',
      properties: {
        signReference: {
          type: 'string',
          description: 'Sign reference number'
        },
        updates: {
          type: 'object',
          description: 'Fields to update (elements, metadata)'
        },
        createNewVersion: {
          type: 'boolean',
          description: 'Create a new version instead of overwriting',
          default: true
        }
      },
      required: ['signReference', 'updates']
    }
  },
  {
    name: 'get_bpa_rules',
    description: 'Get BPA compliance rules for a sign type',
    inputSchema: {
      type: 'object',
      properties: {
        signType: {
          type: 'string',
          description: 'Sign type',
          enum: ['entrance', 'terms_conditions', 'tariff', 'disabled', 'ev_charging', 'internal', 'wayfinding']
        }
      },
      required: ['signType']
    }
  }
];

// ============== TOOL HANDLERS ==============

async function handleCreateSign(args) {
  const template = templates[args.templateId];
  if (!template) {
    throw new Error(`Template not found: ${args.templateId}`);
  }

  // Get next sequence number for this site
  const existingSigns = await loadSigns();
  const siteSignsOfType = existingSigns.filter(s => 
    s.site === args.siteCode && s.type === template.type
  );
  const sequence = args.sequence || siteSignsOfType.length + 1;

  const reference = generateReference(args.siteCode, template.type, sequence);
  
  const sign = {
    id: uuidv4(),
    reference,
    type: template.type,
    site: args.siteCode,
    templateId: args.templateId,
    elements: template.defaultElements?.map(el => ({
      ...el,
      id: uuidv4()
    })) || [],
    metadata: {
      siteName: args.siteName,
      siteCode: args.siteCode,
      companyName: args.companyName || 'Local Car Park Management Ltd',
      companyRegNumber: args.companyRegNumber || '14379954',
      helplineNumber: args.helplineNumber || '0345 548 1716',
      parkingCharge: args.parkingCharge || 100,
      reducedCharge: args.reducedCharge || 60,
      paymentPeriod: 28,
      reducedPeriod: 14,
      hasAnpr: args.hasAnpr !== false
    },
    createdAt: new Date().toISOString(),
    version: 1
  };

  // Validate charges
  if (sign.metadata.parkingCharge > BPA_MAX_PARKING_CHARGE) {
    throw new Error(`Parking charge £${sign.metadata.parkingCharge} exceeds BPA maximum of £${BPA_MAX_PARKING_CHARGE}`);
  }
  if (sign.metadata.reducedCharge > BPA_MAX_REDUCED_CHARGE) {
    throw new Error(`Reduced charge £${sign.metadata.reducedCharge} exceeds BPA maximum of £${BPA_MAX_REDUCED_CHARGE}`);
  }

  // Save sign
  await saveSign(sign);

  // Run compliance check
  const compliance = checkCompliance(sign);

  return {
    sign,
    compliance,
    message: compliance.compliant 
      ? `Sign ${reference} created and is BPA compliant (score: ${compliance.score}%)`
      : `Sign ${reference} created but has compliance issues (score: ${compliance.score}%)`
  };
}

async function handleCheckCompliance(args) {
  let sign;
  
  if (args.signReference) {
    sign = await loadSign(args.signReference);
    if (!sign) {
      throw new Error(`Sign not found: ${args.signReference}`);
    }
  } else if (args.signData) {
    sign = args.signData;
  } else {
    throw new Error('Provide either signReference or signData');
  }

  return checkCompliance(sign);
}

async function handleExportPdf(args) {
  const sign = await loadSign(args.signReference);
  if (!sign) {
    throw new Error(`Sign not found: ${args.signReference}`);
  }

  // For now, return a placeholder - actual PDF generation would use puppeteer
  const pdfPath = path.join(SIGNS_DIR, 'pdf', `${args.signReference}.pdf`);
  
  return {
    message: `PDF export queued for ${args.signReference}`,
    size: args.size || 'A4',
    outputPath: pdfPath,
    note: 'Use the web UI at http://localhost:3450 for actual PDF generation'
  };
}

async function handleListTemplates(args) {
  let result = Object.values(templates);
  
  if (args.type) {
    result = result.filter(t => t.type === args.type);
  }

  return {
    templates: result,
    count: result.length
  };
}

async function handleGetSign(args) {
  const sign = await loadSign(args.signReference);
  if (!sign) {
    throw new Error(`Sign not found: ${args.signReference}`);
  }
  return sign;
}

async function handleListSigns(args) {
  let signs = await loadSigns();
  
  if (args.siteCode) {
    signs = signs.filter(s => s.site === args.siteCode);
  }
  if (args.type) {
    signs = signs.filter(s => s.type === args.type);
  }

  return {
    signs: signs.map(s => ({
      reference: s.reference,
      type: s.type,
      site: s.site,
      siteName: s.metadata?.siteName,
      createdAt: s.createdAt,
      version: s.version
    })),
    count: signs.length
  };
}

async function handleUpdateSign(args) {
  const sign = await loadSign(args.signReference);
  if (!sign) {
    throw new Error(`Sign not found: ${args.signReference}`);
  }

  if (args.createNewVersion) {
    // Create new version
    const newVersion = (sign.version || 1) + 1;
    const newReference = args.signReference.replace(/-v\d+$/, `-v${newVersion}`);
    
    const updatedSign = {
      ...sign,
      ...args.updates,
      reference: newReference,
      version: newVersion,
      updatedAt: new Date().toISOString(),
      previousVersion: args.signReference
    };

    await saveSign(updatedSign);
    
    return {
      sign: updatedSign,
      message: `Created new version ${newReference}`
    };
  } else {
    const updatedSign = {
      ...sign,
      ...args.updates,
      updatedAt: new Date().toISOString()
    };

    await saveSign(updatedSign);
    
    return {
      sign: updatedSign,
      message: `Updated ${args.signReference}`
    };
  }
}

async function handleGetBpaRules(args) {
  const applicableRules = Object.entries(complianceRules)
    .filter(([_, rule]) => !rule.forTypes || rule.forTypes.includes(args.signType))
    .map(([id, rule]) => ({
      id,
      name: rule.name,
      required: rule.required
    }));

  return {
    signType: args.signType,
    rules: applicableRules,
    maxParkingCharge: BPA_MAX_PARKING_CHARGE,
    maxReducedCharge: BPA_MAX_REDUCED_CHARGE,
    reducedPeriodDays: 14,
    totalPeriodDays: 28
  };
}

// ============== STORAGE ==============

async function loadSigns() {
  try {
    const indexPath = path.join(SIGNS_DIR, 'index.json');
    const data = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function loadSign(reference) {
  const signs = await loadSigns();
  return signs.find(s => s.reference === reference);
}

async function saveSign(sign) {
  const signs = await loadSigns();
  const existingIndex = signs.findIndex(s => s.reference === sign.reference);
  
  if (existingIndex >= 0) {
    signs[existingIndex] = sign;
  } else {
    signs.push(sign);
  }

  const indexPath = path.join(SIGNS_DIR, 'index.json');
  await fs.writeFile(indexPath, JSON.stringify(signs, null, 2));
  
  // Also save individual file
  const signPath = path.join(SIGNS_DIR, `${sign.reference}.json`);
  await fs.writeFile(signPath, JSON.stringify(sign, null, 2));
}

// ============== MCP PROTOCOL ==============

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function send(message) {
  console.log(JSON.stringify(message));
}

async function handleMessage(message) {
  const { id, method, params } = message;

  try {
    switch (method) {
      case 'initialize':
        send({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
              name: 'signage-designer',
              version: '1.0.0'
            }
          }
        });
        break;

      case 'notifications/initialized':
        // Acknowledgment, no response needed
        break;

      case 'tools/list':
        send({
          jsonrpc: '2.0',
          id,
          result: { tools }
        });
        break;

      case 'tools/call':
        const { name, arguments: args } = params;
        let result;

        switch (name) {
          case 'create_sign':
            result = await handleCreateSign(args);
            break;
          case 'check_compliance':
            result = await handleCheckCompliance(args);
            break;
          case 'export_pdf':
            result = await handleExportPdf(args);
            break;
          case 'list_templates':
            result = await handleListTemplates(args);
            break;
          case 'get_sign':
            result = await handleGetSign(args);
            break;
          case 'list_signs':
            result = await handleListSigns(args);
            break;
          case 'update_sign':
            result = await handleUpdateSign(args);
            break;
          case 'get_bpa_rules':
            result = await handleGetBpaRules(args);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        send({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          }
        });
        break;

      default:
        send({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        });
    }
  } catch (error) {
    send({
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: error.message
      }
    });
  }
}

rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    handleMessage(message);
  } catch (error) {
    console.error('Failed to parse message:', error);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
