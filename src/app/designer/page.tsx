'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface SignStyling {
  backgroundColor: string;
  borderStyle: 'none' | 'solid' | 'checkered';
  borderColor: string;
  borderWidth: 4 | 8 | 12;
}

interface SignMetadata {
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
  website: string;
  styling: SignStyling;
}

interface ComplianceResult {
  id: string;
  name: string;
  passed: boolean;
  required: boolean;
}

const defaultStyling: SignStyling = {
  backgroundColor: '#ffffff',
  borderStyle: 'checkered',
  borderColor: '#0077B5',
  borderWidth: 12,
};

const defaultMetadata: SignMetadata = {
  siteName: '',
  siteCode: '',
  companyName: 'Local Car Park Management Ltd',
  companyRegNumber: '14379954',
  helplineNumber: '0345 548 1716',
  parkingCharge: 100,
  reducedCharge: 60,
  paymentPeriod: 28,
  reducedPeriod: 14,
  hasAnpr: true,
  website: 'www.localcarparkmanagement.com',
  styling: defaultStyling,
};

// Background color presets
const bgColorPresets = [
  { color: '#ffffff', name: 'White' },
  { color: '#f5f5f5', name: 'Light Gray' },
  { color: '#e8e8e8', name: 'Gray' },
  { color: '#fffef0', name: 'Cream' },
  { color: '#fff3cd', name: 'Warm' },
];

// Border color presets (LCPM branding)
const borderColorPresets = [
  { color: '#0077B5', name: 'LCPM Blue' },
  { color: '#F5A623', name: 'LCPM Orange' },
  { color: '#004E7C', name: 'Dark Blue' },
  { color: '#2C3E50', name: 'Charcoal' },
  { color: '#000000', name: 'Black' },
];

function StylePanel({ 
  styling, 
  onStyleChange 
}: { 
  styling: SignStyling; 
  onStyleChange: (styling: SignStyling) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lcpm-blue" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
        </svg>
        Sign Styling
      </h2>
      <div className="space-y-5">
        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Color
          </label>
          <div className="flex items-center gap-2">
            {bgColorPresets.map((preset) => (
              <button
                key={preset.color}
                title={preset.name}
                onClick={() => onStyleChange({ ...styling, backgroundColor: preset.color })}
                className={`color-swatch ${styling.backgroundColor === preset.color ? 'selected' : ''}`}
                style={{ 
                  backgroundColor: preset.color,
                  border: preset.color === '#ffffff' ? '2px solid #e5e7eb' : undefined
                }}
              />
            ))}
            <div className="relative">
              <input
                type="color"
                value={styling.backgroundColor}
                onChange={(e) => onStyleChange({ ...styling, backgroundColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0"
                title="Custom color"
              />
            </div>
          </div>
        </div>

        {/* Border Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Border Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onStyleChange({ ...styling, borderStyle: 'none' })}
              className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                styling.borderStyle === 'none'
                  ? 'border-lcpm-blue bg-blue-50 text-lcpm-blue font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              None
            </button>
            <button
              onClick={() => onStyleChange({ ...styling, borderStyle: 'solid' })}
              className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                styling.borderStyle === 'solid'
                  ? 'border-lcpm-blue bg-blue-50 text-lcpm-blue font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Solid
            </button>
            <button
              onClick={() => onStyleChange({ ...styling, borderStyle: 'checkered' })}
              className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                styling.borderStyle === 'checkered'
                  ? 'border-lcpm-blue bg-blue-50 text-lcpm-blue font-medium'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              Checkered
            </button>
          </div>
        </div>

        {/* Border Color (only for solid borders) */}
        {styling.borderStyle === 'solid' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Color
            </label>
            <div className="flex items-center gap-2">
              {borderColorPresets.map((preset) => (
                <button
                  key={preset.color}
                  title={preset.name}
                  onClick={() => onStyleChange({ ...styling, borderColor: preset.color })}
                  className={`color-swatch ${styling.borderColor === preset.color ? 'selected' : ''}`}
                  style={{ backgroundColor: preset.color }}
                />
              ))}
              <div className="relative">
                <input
                  type="color"
                  value={styling.borderColor}
                  onChange={(e) => onStyleChange({ ...styling, borderColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                  title="Custom color"
                />
              </div>
            </div>
          </div>
        )}

        {/* Border Width */}
        {styling.borderStyle !== 'none' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Border Width
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([4, 8, 12] as const).map((width) => (
                <button
                  key={width}
                  onClick={() => onStyleChange({ ...styling, borderWidth: width })}
                  className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                    styling.borderWidth === width
                      ? 'border-lcpm-blue bg-blue-50 text-lcpm-blue font-medium'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {width}px
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Checkered pattern preview */}
        {styling.borderStyle === 'checkered' && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">Preview</div>
            <div 
              className="h-6 rounded"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  #0077B5 0px,
                  #0077B5 8px,
                  #F5A623 8px,
                  #F5A623 16px
                )`
              }}
            />
            <div className="text-xs text-gray-500 mt-2">LCPM Blue / Orange diagonal pattern</div>
          </div>
        )}
      </div>
    </div>
  );
}

function DesignerContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') || 'entrance-standard';
  
  const [metadata, setMetadata] = useState<SignMetadata>(defaultMetadata);
  const [compliance, setCompliance] = useState<ComplianceResult[]>([]);
  const [isCompliant, setIsCompliant] = useState(false);
  const [signReference, setSignReference] = useState<string>('');

  // Generate reference when site code changes
  useEffect(() => {
    if (metadata.siteCode) {
      const typeMap: Record<string, string> = {
        'entrance-standard': 'ENT',
        'terms-conditions-standard': 'TCS',
        'disabled-parking': 'DIS',
        'ev-charging': 'EVC',
        'tariff-standard': 'TAR',
        'internal-qr': 'INT',
      };
      const typeCode = typeMap[templateId] || 'GEN';
      setSignReference(`${metadata.siteCode.toUpperCase()}-${typeCode}-001-v1`);
    }
  }, [metadata.siteCode, templateId]);

  // Run compliance check
  useEffect(() => {
    const results: ComplianceResult[] = [];
    
    // Check required fields based on template
    results.push({
      id: 'site-code',
      name: 'Site Code',
      passed: !!metadata.siteCode,
      required: true
    });
    
    results.push({
      id: 'site-name',
      name: 'Site Name',
      passed: !!metadata.siteName,
      required: true
    });

    results.push({
      id: 'company-details',
      name: 'Company Details',
      passed: !!metadata.companyName && !!metadata.companyRegNumber,
      required: true
    });

    results.push({
      id: 'helpline',
      name: 'Helpline Number',
      passed: !!metadata.helplineNumber,
      required: true
    });

    if (templateId === 'terms-conditions-standard') {
      results.push({
        id: 'parking-charge',
        name: 'Parking Charge ≤ £100',
        passed: metadata.parkingCharge <= 100,
        required: true
      });

      results.push({
        id: 'reduced-charge',
        name: 'Reduced Charge ≤ £60',
        passed: metadata.reducedCharge <= 60,
        required: true
      });
    }

    setCompliance(results);
    setIsCompliant(results.every(r => !r.required || r.passed));
  }, [metadata, templateId]);

  const handleExportPDF = async () => {
    if (!isCompliant) {
      alert('Please fix compliance issues before exporting');
      return;
    }
    
    // Create sign via API
    try {
      const response = await fetch('/api/signs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          ...metadata
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Sign created: ${data.reference}\n\nPDF export will be available at /api/signs/${data.reference}/pdf`);
      }
    } catch (error) {
      console.error('Failed to create sign:', error);
    }
  };

  const handleStyleChange = (styling: SignStyling) => {
    setMetadata({ ...metadata, styling });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ← Back
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Sign Designer</h1>
              {signReference && (
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {signReference}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                disabled={!isCompliant}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  isCompliant
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Styling Panel - NEW */}
            <StylePanel 
              styling={metadata.styling} 
              onStyleChange={handleStyleChange}
            />

            {/* Site Details */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Site Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Code *
                  </label>
                  <input
                    type="text"
                    value={metadata.siteCode}
                    onChange={(e) => setMetadata({ ...metadata, siteCode: e.target.value.toUpperCase() })}
                    placeholder="e.g., KRS"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                    maxLength={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">3-5 letter site identifier</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    value={metadata.siteName}
                    onChange={(e) => setMetadata({ ...metadata, siteName: e.target.value })}
                    placeholder="e.g., Kyle Rise Car Park"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={metadata.hasAnpr}
                      onChange={(e) => setMetadata({ ...metadata, hasAnpr: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Site uses ANPR</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Company Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={metadata.companyName}
                    onChange={(e) => setMetadata({ ...metadata, companyName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={metadata.companyRegNumber}
                    onChange={(e) => setMetadata({ ...metadata, companyRegNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Helpline Number
                  </label>
                  <input
                    type="text"
                    value={metadata.helplineNumber}
                    onChange={(e) => setMetadata({ ...metadata, helplineNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={metadata.website}
                    onChange={(e) => setMetadata({ ...metadata, website: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Charges (for T&C signs) */}
            {templateId === 'terms-conditions-standard' && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-900 mb-4">Parking Charges</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parking Charge (max £100)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">£</span>
                      <input
                        type="number"
                        value={metadata.parkingCharge}
                        onChange={(e) => setMetadata({ ...metadata, parkingCharge: parseInt(e.target.value) || 0 })}
                        max={100}
                        className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent ${
                          metadata.parkingCharge > 100 ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {metadata.parkingCharge > 100 && (
                      <p className="text-xs text-red-500 mt-1">Exceeds BPA maximum of £100</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reduced Charge (max £60)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">£</span>
                      <input
                        type="number"
                        value={metadata.reducedCharge}
                        onChange={(e) => setMetadata({ ...metadata, reducedCharge: parseInt(e.target.value) || 0 })}
                        max={60}
                        className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent ${
                          metadata.reducedCharge > 60 ? 'border-red-500' : ''
                        }`}
                      />
                    </div>
                    {metadata.reducedCharge > 60 && (
                      <p className="text-xs text-red-500 mt-1">Exceeds BPA maximum of £60</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Status */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Compliance Check
                {isCompliant ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
              </h2>
              <div className="space-y-2">
                {compliance.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 text-sm ${
                      item.passed ? 'text-green-600' : item.required ? 'text-red-600' : 'text-yellow-600'
                    }`}
                  >
                    <span>{item.passed ? '✓' : '✗'}</span>
                    <span>{item.name}</span>
                    {item.required && !item.passed && (
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">Required</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Preview</h2>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 min-h-[600px] flex items-center justify-center bg-gray-50">
                <SignPreview templateId={templateId} metadata={metadata} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SignPreview({ templateId, metadata }: { templateId: string; metadata: SignMetadata }) {
  const { styling } = metadata;
  const isEntrance = templateId === 'entrance-standard';
  const isTCs = templateId === 'terms-conditions-standard';

  // Render checkered border version
  if (styling.borderStyle === 'checkered') {
    return (
      <div 
        className="w-full max-w-md shadow-lg sign-with-checkered-border"
        style={{ padding: `${styling.borderWidth}px` }}
      >
        <div 
          className="text-center relative h-full"
          style={{ 
            backgroundColor: styling.backgroundColor,
            aspectRatio: '210/297',
          }}
        >
          <SignContent 
            isEntrance={isEntrance} 
            isTCs={isTCs} 
            metadata={metadata} 
          />
        </div>
      </div>
    );
  }

  // Build border styles for solid/none
  const getSignStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {
      backgroundColor: styling.backgroundColor,
      aspectRatio: '210/297',
    };

    if (styling.borderStyle === 'solid') {
      styles.borderWidth = `${styling.borderWidth}px`;
      styles.borderStyle = 'solid';
      styles.borderColor = styling.borderColor;
    }

    return styles;
  };

  return (
    <div className="w-full max-w-md shadow-lg">
      <div 
        className="text-center relative h-full"
        style={getSignStyles()}
      >
        <SignContent 
          isEntrance={isEntrance} 
          isTCs={isTCs} 
          metadata={metadata} 
        />
      </div>
    </div>
  );
}

function SignContent({ 
  isEntrance, 
  isTCs, 
  metadata 
}: { 
  isEntrance: boolean; 
  isTCs: boolean; 
  metadata: SignMetadata;
}) {
  return (
    <div className="flex flex-col h-full justify-between">
      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {/* Header */}
        <div className="text-xl font-bold mb-3 tracking-wide">
          {isTCs ? 'TERMS & CONDITIONS APPLY' : 'PARKING REGULATIONS APPLY'}
        </div>
        
        <div className="text-3xl font-bold mb-6">PRIVATE LAND</div>

        {isEntrance && (
          <>
            <div className="text-xl font-bold text-lcpm-orange mb-3">
              Pay to Park for All Vehicles
            </div>
            <div className="text-lg font-bold mb-4">BEYOND THIS POINT ONLY</div>
            <div className="text-xl text-lcpm-blue font-bold mb-6">
              {metadata.siteName || 'Parking for Customers'}
            </div>
          </>
        )}

        {isTCs && (
          <>
            <div className="text-base text-lcpm-blue font-bold mb-3 px-2">
              Breach of ANY term or condition will result in a PARKING CHARGE of £{metadata.parkingCharge} reduced to £{metadata.reducedCharge} if paid within {metadata.reducedPeriod} days.
            </div>
            <div className="text-sm mb-4">
              By entering or remaining on this land you agree to abide by the Terms and Conditions.
            </div>
          </>
        )}

        <div className="text-base mb-4">
          Terms & Conditions Apply
          <br />
          See signs in car park for details
        </div>

        {metadata.hasAnpr && (
          <div className="text-sm mb-2">
            This car park is monitored by ANPR camera technology
          </div>
        )}
      </div>

      {/* Footer - always at bottom */}
      <div className="bg-lcpm-blue text-white p-5 text-left -mx-0">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-medium">This car park is private property and is managed on behalf of the Client by {metadata.companyName}.</p>
            <p className="mt-1">Company registration no: {metadata.companyRegNumber}</p>
            <p>Vehicles left at Owners risk.</p>
            <p className="font-medium mt-1">Helpline: {metadata.helplineNumber}</p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <div className="w-14 h-14 bg-lcpm-yellow rounded-full flex items-center justify-center text-base text-black font-bold shadow-md">
              BPA
            </div>
            <div className="w-14 h-14 bg-lcpm-orange rounded-lg flex items-center justify-center text-base text-white font-bold shadow-md">
              LCPM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DesignerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DesignerContent />
    </Suspense>
  );
}
