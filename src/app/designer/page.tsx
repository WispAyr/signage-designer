'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

interface SignStyling {
  backgroundColor: string;
  borderStyle: 'none' | 'solid' | 'checkered';
  borderColor: string;
  borderWidth: 4 | 8 | 12;
}

interface TariffRate {
  duration: string;
  price: string;
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
  // New fields for additional templates
  maxStay: string;
  qrUrl: string;
  qrLabel: string;
  tariffRates: TariffRate[];
  operatingHours: string;
  paymentMethods: string[];
  evInstructions: string;
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
  // New fields for additional templates
  maxStay: '3 hours',
  qrUrl: 'https://pay.localcarparkmanagement.com',
  qrLabel: 'Scan to Pay',
  tariffRates: [
    { duration: 'Up to 1 hour', price: '£2.00' },
    { duration: 'Up to 2 hours', price: '£3.50' },
    { duration: 'Up to 3 hours', price: '£5.00' },
    { duration: 'Up to 4 hours', price: '£7.00' },
    { duration: 'All day (max)', price: '£10.00' },
  ],
  operatingHours: '24 hours',
  paymentMethods: ['Card', 'Phone', 'App'],
  evInstructions: 'Connect charger before paying. Vehicles must be actively charging.',
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

            {/* Disabled Parking Settings */}
            {templateId === 'disabled-parking' && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">♿</span>
                  Disabled Parking Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Stay
                    </label>
                    <input
                      type="text"
                      value={metadata.maxStay}
                      onChange={(e) => setMetadata({ ...metadata, maxStay: e.target.value })}
                      placeholder="e.g., 3 hours"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EV Charging Settings */}
            {templateId === 'ev-charging' && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  EV Charging Settings
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Stay
                    </label>
                    <input
                      type="text"
                      value={metadata.maxStay}
                      onChange={(e) => setMetadata({ ...metadata, maxStay: e.target.value })}
                      placeholder="e.g., 4 hours"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Charging Instructions
                    </label>
                    <textarea
                      value={metadata.evInstructions}
                      onChange={(e) => setMetadata({ ...metadata, evInstructions: e.target.value })}
                      placeholder="e.g., Connect charger before paying..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tariff Settings */}
            {templateId === 'tariff-standard' && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-900 mb-4">Tariff Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={metadata.operatingHours}
                      onChange={(e) => setMetadata({ ...metadata, operatingHours: e.target.value })}
                      placeholder="e.g., 24 hours or Mon-Sat 8am-6pm"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rates
                    </label>
                    <div className="space-y-2">
                      {metadata.tariffRates.map((rate, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={rate.duration}
                            onChange={(e) => {
                              const newRates = [...metadata.tariffRates];
                              newRates[index].duration = e.target.value;
                              setMetadata({ ...metadata, tariffRates: newRates });
                            }}
                            placeholder="Duration"
                            className="flex-1 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-lcpm-blue"
                          />
                          <input
                            type="text"
                            value={rate.price}
                            onChange={(e) => {
                              const newRates = [...metadata.tariffRates];
                              newRates[index].price = e.target.value;
                              setMetadata({ ...metadata, tariffRates: newRates });
                            }}
                            placeholder="£0.00"
                            className="w-20 px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-lcpm-blue"
                          />
                          <button
                            onClick={() => {
                              const newRates = metadata.tariffRates.filter((_, i) => i !== index);
                              setMetadata({ ...metadata, tariffRates: newRates });
                            }}
                            className="px-2 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setMetadata({
                            ...metadata,
                            tariffRates: [...metadata.tariffRates, { duration: '', price: '' }]
                          });
                        }}
                        className="text-sm text-lcpm-blue hover:text-blue-700"
                      >
                        + Add rate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Methods (comma separated)
                    </label>
                    <input
                      type="text"
                      value={metadata.paymentMethods.join(', ')}
                      onChange={(e) => setMetadata({ 
                        ...metadata, 
                        paymentMethods: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="e.g., Card, Phone, App"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      QR Code URL
                    </label>
                    <input
                      type="url"
                      value={metadata.qrUrl}
                      onChange={(e) => setMetadata({ ...metadata, qrUrl: e.target.value })}
                      placeholder="https://pay.example.com"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Settings */}
            {templateId === 'internal-qr' && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-gray-900 mb-4">QR Code Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      QR Code URL *
                    </label>
                    <input
                      type="url"
                      value={metadata.qrUrl}
                      onChange={(e) => setMetadata({ ...metadata, qrUrl: e.target.value })}
                      placeholder="https://pay.example.com"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">The URL the QR code will link to</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label Text
                    </label>
                    <input
                      type="text"
                      value={metadata.qrLabel}
                      onChange={(e) => setMetadata({ ...metadata, qrLabel: e.target.value })}
                      placeholder="e.g., Scan to Pay"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-lcpm-blue focus:border-transparent"
                    />
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

  // Render checkered border version
  if (styling.borderStyle === 'checkered') {
    return (
      <div 
        className="w-full max-w-md shadow-lg sign-with-checkered-border"
        style={{ padding: `${styling.borderWidth}px` }}
      >
        <div 
          className="text-center relative overflow-hidden"
          style={{ 
            backgroundColor: styling.backgroundColor,
            aspectRatio: '210/297',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SignContent 
            templateId={templateId}
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
      display: 'flex',
      flexDirection: 'column' as const,
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
        className="text-center relative overflow-hidden"
        style={getSignStyles()}
      >
        <SignContent 
          templateId={templateId}
          metadata={metadata} 
        />
      </div>
    </div>
  );
}

function SignContent({ 
  templateId,
  metadata 
}: { 
  templateId: string;
  metadata: SignMetadata;
}) {
  const isEntrance = templateId === 'entrance-standard';
  const isTCs = templateId === 'terms-conditions-standard';
  const isDisabled = templateId === 'disabled-parking';
  const isEV = templateId === 'ev-charging';
  const isTariff = templateId === 'tariff-standard';
  const isQR = templateId === 'internal-qr';

  // Disabled Parking Template
  if (isDisabled) {
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          {/* Blue background header */}
          <div className="w-full bg-blue-600 text-white py-4 px-2 mb-4">
            <div className="text-7xl mb-2">♿</div>
            <div className="text-2xl font-bold tracking-wide">
              BLUE BADGE HOLDERS ONLY
            </div>
          </div>
          
          <div className="text-xl font-bold mb-4 text-blue-700">
            {metadata.siteName || 'Disabled Parking Bay'}
          </div>

          <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4 mb-4 w-full">
            <div className="text-lg font-bold text-blue-800 mb-2">
              Maximum Stay: {metadata.maxStay}
            </div>
            <div className="text-sm text-blue-700">
              Badge must be clearly displayed on dashboard
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 w-full">
            <div className="text-sm font-bold text-red-600">
              ⚠️ WARNING: Misuse of disabled parking bays may result in a Parking Charge Notice of £{metadata.parkingCharge}
            </div>
          </div>

          {metadata.hasAnpr && (
            <div className="text-xs text-gray-600 mt-4">
              This car park is monitored by ANPR camera technology
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-blue-600 text-white p-4 text-left">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 text-xs leading-relaxed">
              <p className="font-medium">Managed by {metadata.companyName}</p>
              <p>Helpline: {metadata.helplineNumber}</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xs text-black font-bold">
              BPA
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EV Charging Template
  if (isEV) {
    return (
      <div className="flex flex-col h-full justify-between">
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          {/* Green background header */}
          <div className="w-full bg-green-600 text-white py-4 px-2 mb-4">
            <div className="text-6xl mb-2">⚡</div>
            <div className="text-xl font-bold tracking-wide">
              ELECTRIC VEHICLE CHARGING ONLY
            </div>
          </div>
          
          <div className="text-lg font-bold mb-4 text-green-700">
            {metadata.siteName || 'EV Charging Bay'}
          </div>

          <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4 mb-4 w-full">
            <div className="text-base font-bold text-green-800 mb-2">
              Charging Instructions
            </div>
            <div className="text-sm text-green-700">
              {metadata.evInstructions}
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-3 w-full mb-4">
            <div className="text-sm font-bold text-yellow-700">
              ⚠️ Vehicles MUST be actively charging
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              Non-charging vehicles may receive a Parking Charge Notice
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Maximum Stay: {metadata.maxStay}
          </div>

          {metadata.hasAnpr && (
            <div className="text-xs text-gray-500 mt-2">
              This car park is monitored by ANPR camera technology
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-green-600 text-white p-4 text-left">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 text-xs leading-relaxed">
              <p className="font-medium">Managed by {metadata.companyName}</p>
              <p>Helpline: {metadata.helplineNumber}</p>
            </div>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xs text-black font-bold">
              BPA
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tariff Template
  if (isTariff) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center p-4 min-h-0 overflow-auto">
          {/* Header */}
          <div className="w-full bg-lcpm-blue text-white py-3 px-2 mb-4">
            <div className="text-2xl font-bold tracking-wide">
              TARIFF
            </div>
            <div className="text-sm">
              {metadata.siteName || 'Car Park'}
            </div>
          </div>

          {/* Rate Table */}
          <div className="w-full bg-gray-50 border-2 border-lcpm-blue rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-lcpm-blue text-white">
                <tr>
                  <th className="py-2 px-3 text-left font-bold">Duration</th>
                  <th className="py-2 px-3 text-right font-bold">Price</th>
                </tr>
              </thead>
              <tbody>
                {metadata.tariffRates.map((rate, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-3 text-left">{rate.duration}</td>
                    <td className="py-2 px-3 text-right font-bold">{rate.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Operating Hours */}
          <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="text-sm font-bold text-blue-800">
              Hours of Operation
            </div>
            <div className="text-sm text-blue-700">
              {metadata.operatingHours}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="text-sm font-bold text-green-800 mb-1">
              Payment Methods
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {metadata.paymentMethods.map((method, index) => (
                <span key={index} className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Small QR Code */}
          <div className="flex items-center gap-3">
            <QRCodeSVG 
              value={metadata.qrUrl} 
              size={60}
              level="M"
            />
            <div className="text-xs text-gray-600">
              Scan to pay online
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-lcpm-blue text-white p-3 text-left flex-shrink-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 text-xs leading-relaxed">
              <p className="font-medium">{metadata.companyName}</p>
              <p>Helpline: {metadata.helplineNumber}</p>
            </div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[10px] text-black font-bold">
                BPA
              </div>
              <div className="w-8 h-8 bg-lcpm-orange rounded flex items-center justify-center text-[10px] text-white font-bold">
                LCPM
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Internal QR Template
  if (isQR) {
    return (
      <div className="flex flex-col h-full justify-center items-center p-6">
        {/* Main QR Code - large and centered */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-lcpm-blue">
            <QRCodeSVG 
              value={metadata.qrUrl} 
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="text-2xl font-bold text-lcpm-blue mt-6 mb-2">
            {metadata.qrLabel}
          </div>
          
          <div className="text-base text-gray-600 mb-4">
            {metadata.siteName || 'Scan with your phone camera'}
          </div>

          <div className="text-sm text-gray-500 text-center max-w-xs">
            Point your camera at the QR code above
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="w-full text-center pb-2">
          <div className="text-xs text-gray-500">
            {metadata.companyName} | {metadata.helplineNumber}
          </div>
        </div>
      </div>
    );
  }

  // Default templates (Entrance and T&Cs)
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
