'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
}

interface ComplianceResult {
  id: string;
  name: string;
  passed: boolean;
  required: boolean;
}

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
};

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
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 min-h-[600px] flex items-center justify-center">
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
  // Simplified preview - actual implementation would render full sign
  const isEntrance = templateId === 'entrance-standard';
  const isTCs = templateId === 'terms-conditions-standard';

  return (
    <div className="w-full max-w-md bg-white border-8 border-checkered p-4 text-center" style={{ aspectRatio: '210/297' }}>
      {/* Header */}
      <div className="text-lg font-bold mb-2">
        {isTCs ? 'Terms & Conditions Apply' : 'PARKING REGULATIONS APPLY'}
      </div>
      
      <div className="text-2xl font-bold mb-4">PRIVATE LAND</div>

      {isEntrance && (
        <>
          <div className="text-lg font-bold text-orange-500 mb-2">
            Pay to Park for All Vehicles
          </div>
          <div className="font-bold mb-4">BEYOND THIS POINT ONLY</div>
          <div className="text-blue-600 font-bold mb-4">
            {metadata.siteName || 'Parking for Customers'}
          </div>
        </>
      )}

      {isTCs && (
        <>
          <div className="text-sm text-blue-600 font-bold mb-2">
            Breach of ANY term or condition will result in a PARKING CHARGE of £{metadata.parkingCharge} reduced to £{metadata.reducedCharge} if paid within {metadata.reducedPeriod} days.
          </div>
          <div className="text-xs mb-4">
            By entering or remaining on this land you agree to abide by the Terms and Conditions.
          </div>
        </>
      )}

      <div className="text-sm mb-4">
        Terms & Conditions Apply
        <br />
        See signs in car park for details
      </div>

      {metadata.hasAnpr && (
        <div className="text-xs mb-4">
          This car park is monitored by ANPR camera technology
        </div>
      )}

      {/* Footer */}
      <div className="bg-blue-600 text-white p-3 text-xs text-left mt-auto">
        <p>This car park is private property and is managed on behalf of the Client by {metadata.companyName}.</p>
        <p>Company registration no: {metadata.companyRegNumber}</p>
        <p>Vehicles left at Owners risk.</p>
        <p>Helpline: {metadata.helplineNumber}</p>
        <div className="flex justify-end gap-2 mt-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-xs text-black font-bold">
            BPA
          </div>
          <div className="w-8 h-8 bg-orange-400 rounded flex items-center justify-center text-xs text-white font-bold">
            LCPM
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
