import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const SIGNS_DIR = path.join(process.cwd(), 'signs');

// Ensure signs directory exists
async function ensureSignsDir() {
  try {
    await fs.mkdir(SIGNS_DIR, { recursive: true });
  } catch {}
}

// Load all signs
async function loadSigns() {
  await ensureSignsDir();
  try {
    const indexPath = path.join(SIGNS_DIR, 'index.json');
    const data = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Save sign
async function saveSign(sign: any) {
  await ensureSignsDir();
  const signs = await loadSigns();
  const existingIndex = signs.findIndex((s: any) => s.reference === sign.reference);
  
  if (existingIndex >= 0) {
    signs[existingIndex] = sign;
  } else {
    signs.push(sign);
  }

  const indexPath = path.join(SIGNS_DIR, 'index.json');
  await fs.writeFile(indexPath, JSON.stringify(signs, null, 2));
  
  const signPath = path.join(SIGNS_DIR, `${sign.reference}.json`);
  await fs.writeFile(signPath, JSON.stringify(sign, null, 2));
  
  return sign;
}

// GET /api/signs - List all signs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const siteCode = searchParams.get('siteCode');
  const type = searchParams.get('type');

  let signs = await loadSigns();

  if (siteCode) {
    signs = signs.filter((s: any) => s.site === siteCode);
  }
  if (type) {
    signs = signs.filter((s: any) => s.type === type);
  }

  return NextResponse.json({
    signs,
    count: signs.length
  });
}

// POST /api/signs - Create new sign
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const {
    templateId,
    siteCode,
    siteName,
    companyName = 'Local Car Park Management Ltd',
    companyRegNumber = '14379954',
    helplineNumber = '0345 548 1716',
    parkingCharge = 100,
    reducedCharge = 60,
    hasAnpr = true,
    website = 'www.localcarparkmanagement.com',
    sequence
  } = body;

  if (!templateId || !siteCode || !siteName) {
    return NextResponse.json(
      { error: 'Missing required fields: templateId, siteCode, siteName' },
      { status: 400 }
    );
  }

  // Validate charges
  if (parkingCharge > 100) {
    return NextResponse.json(
      { error: 'Parking charge cannot exceed £100 (BPA limit)' },
      { status: 400 }
    );
  }
  if (reducedCharge > 60) {
    return NextResponse.json(
      { error: 'Reduced charge cannot exceed £60 (BPA limit)' },
      { status: 400 }
    );
  }

  // Get type from template
  const typeMap: Record<string, string> = {
    'entrance-standard': 'entrance',
    'terms-conditions-standard': 'terms_conditions',
    'disabled-parking': 'disabled',
    'ev-charging': 'ev_charging',
    'tariff-standard': 'tariff',
    'internal-qr': 'internal',
  };

  const typeCodeMap: Record<string, string> = {
    'entrance': 'ENT',
    'terms_conditions': 'TCS',
    'disabled': 'DIS',
    'ev_charging': 'EVC',
    'tariff': 'TAR',
    'internal': 'INT',
  };

  const signType = typeMap[templateId] || 'entrance';
  const typeCode = typeCodeMap[signType] || 'GEN';

  // Generate sequence number
  const existingSigns = await loadSigns();
  const siteSignsOfType = existingSigns.filter((s: any) => 
    s.site === siteCode.toUpperCase() && s.type === signType
  );
  const seq = sequence || siteSignsOfType.length + 1;

  // Generate reference
  const reference = `${siteCode.toUpperCase()}-${typeCode}-${String(seq).padStart(3, '0')}-v1`;

  const sign = {
    id: uuidv4(),
    reference,
    type: signType,
    site: siteCode.toUpperCase(),
    templateId,
    metadata: {
      siteName,
      siteCode: siteCode.toUpperCase(),
      companyName,
      companyRegNumber,
      helplineNumber,
      parkingCharge,
      reducedCharge,
      paymentPeriod: 28,
      reducedPeriod: 14,
      hasAnpr,
      website,
    },
    createdAt: new Date().toISOString(),
    version: 1,
    compliance: {
      checked: true,
      compliant: true,
      checkedAt: new Date().toISOString(),
    }
  };

  await saveSign(sign);

  return NextResponse.json(sign, { status: 201 });
}
