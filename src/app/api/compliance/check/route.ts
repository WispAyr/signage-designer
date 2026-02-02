import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SIGNS_DIR = path.join(process.cwd(), 'signs');
const BPA_MAX_PARKING_CHARGE = 100;
const BPA_MAX_REDUCED_CHARGE = 60;

interface ComplianceRule {
  id: string;
  name: string;
  required: boolean;
  forTypes?: string[];
  check: (sign: any) => boolean;
}

const complianceRules: ComplianceRule[] = [
  {
    id: 'site-details',
    name: 'Site Details',
    required: true,
    check: (sign) => !!sign.metadata?.siteName && !!sign.metadata?.siteCode
  },
  {
    id: 'company-details',
    name: 'Company Details',
    required: true,
    check: (sign) => !!sign.metadata?.companyName && !!sign.metadata?.companyRegNumber
  },
  {
    id: 'helpline',
    name: 'Helpline Number',
    required: true,
    check: (sign) => !!sign.metadata?.helplineNumber
  },
  {
    id: 'parking-charge',
    name: 'Parking Charge ≤ £100',
    required: true,
    forTypes: ['terms_conditions'],
    check: (sign) => !sign.metadata?.parkingCharge || sign.metadata.parkingCharge <= BPA_MAX_PARKING_CHARGE
  },
  {
    id: 'reduced-charge',
    name: 'Reduced Charge ≤ £60',
    required: true,
    forTypes: ['terms_conditions'],
    check: (sign) => !sign.metadata?.reducedCharge || sign.metadata.reducedCharge <= BPA_MAX_REDUCED_CHARGE
  },
  {
    id: 'anpr-notice',
    name: 'ANPR Notice (if applicable)',
    required: true,
    check: (sign) => !sign.metadata?.hasAnpr || true // Template handles this
  }
];

function checkCompliance(sign: any) {
  const applicableRules = complianceRules.filter(rule => 
    !rule.forTypes || rule.forTypes.includes(sign.type)
  );

  const results = applicableRules.map(rule => ({
    id: rule.id,
    name: rule.name,
    required: rule.required,
    passed: rule.check(sign)
  }));

  const requiredResults = results.filter(r => r.required);
  const allRequiredPassed = requiredResults.every(r => r.passed);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed && r.required).length;

  return {
    compliant: allRequiredPassed,
    score: Math.round((passed / results.length) * 100),
    results,
    summary: {
      passed,
      failed,
      total: results.length
    },
    bpaLimits: {
      maxParkingCharge: BPA_MAX_PARKING_CHARGE,
      maxReducedCharge: BPA_MAX_REDUCED_CHARGE,
      reducedPeriodDays: 14,
      totalPeriodDays: 28
    }
  };
}

// POST /api/compliance/check - Check sign compliance
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  let sign;
  
  if (body.signReference) {
    // Load sign by reference
    try {
      const signPath = path.join(SIGNS_DIR, `${body.signReference}.json`);
      const data = await fs.readFile(signPath, 'utf-8');
      sign = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { error: 'Sign not found' },
        { status: 404 }
      );
    }
  } else if (body.signData) {
    sign = body.signData;
  } else {
    return NextResponse.json(
      { error: 'Provide either signReference or signData' },
      { status: 400 }
    );
  }

  const compliance = checkCompliance(sign);

  return NextResponse.json(compliance);
}

// GET /api/compliance/check?reference=XXX - Check by reference
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference');
  
  if (!reference) {
    return NextResponse.json(
      { error: 'Missing reference parameter' },
      { status: 400 }
    );
  }

  try {
    const signPath = path.join(SIGNS_DIR, `${reference}.json`);
    const data = await fs.readFile(signPath, 'utf-8');
    const sign = JSON.parse(data);
    const compliance = checkCompliance(sign);
    return NextResponse.json(compliance);
  } catch {
    return NextResponse.json(
      { error: 'Sign not found' },
      { status: 404 }
    );
  }
}
