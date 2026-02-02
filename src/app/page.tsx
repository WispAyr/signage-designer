'use client';

import { useState } from 'react';
import Link from 'next/link';

const templates = [
  { id: 'entrance-standard', name: 'Standard Entrance Sign', type: 'entrance', description: 'Primary entrance sign with "Parking Regulations Apply" header' },
  { id: 'terms-conditions-standard', name: 'Terms & Conditions Sign', type: 'terms_conditions', description: 'Full T&Cs with parking charges and legal notices' },
  { id: 'disabled-parking', name: 'Disabled Parking Sign', type: 'disabled', description: 'Blue badge / disabled parking bay sign' },
  { id: 'ev-charging', name: 'EV Charging Bay Sign', type: 'ev_charging', description: 'Electric vehicle charging bay sign' },
  { id: 'tariff-standard', name: 'Tariff Sign', type: 'tariff', description: 'Parking tariff and payment information' },
  { id: 'internal-qr', name: 'Internal QR Code Sign', type: 'internal', description: 'Small QR code sign for payment' },
];

const typeColors: Record<string, string> = {
  entrance: 'bg-blue-500',
  terms_conditions: 'bg-purple-500',
  disabled: 'bg-blue-700',
  ev_charging: 'bg-green-500',
  tariff: 'bg-orange-500',
  internal: 'bg-gray-500',
};

export default function Home() {
  const [recentSigns, setRecentSigns] = useState<any[]>([]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-lcpm-orange rounded-lg flex items-center justify-center text-white font-bold text-xl">
                SD
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Parkwise Signage Designer</h1>
                <p className="text-sm text-gray-500">BPA-compliant signage for car park operators</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/compliance"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Compliance Checker
              </Link>
              <Link
                href="/signs"
                className="px-4 py-2 text-sm font-medium text-white bg-lcpm-blue rounded-lg hover:bg-lcpm-dark-blue"
              >
                My Signs
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Total Signs</div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Compliant</div>
            <div className="text-2xl font-bold text-green-600">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Needs Review</div>
            <div className="text-2xl font-bold text-yellow-600">0</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">Sites</div>
            <div className="text-2xl font-bold">0</div>
          </div>
        </div>

        {/* Create New Sign */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Sign</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Link
                key={template.id}
                href={`/designer?template=${template.id}`}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 border-2 border-transparent hover:border-lcpm-orange"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full ${typeColors[template.type]} mt-1.5`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                    <span className="inline-block mt-2 text-xs font-medium text-lcpm-blue">
                      {template.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BPA Compliance Info */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">BPA Compliance Requirements</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Required Elements</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    "Parking Regulations Apply" or equivalent header
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    "Private Land" notice
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    BPA Approved Operator logo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Company name & registration number
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    Helpline number
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    ANPR notice (if applicable)
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Charge Limits (2024)</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">£100</span>
                    Maximum parking charge
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">£60</span>
                    Maximum reduced charge (if paid in 14 days)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">£70</span>
                    Debt recovery fee
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">28 days</span>
                    Total payment period
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Signs */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Signs</h2>
          {recentSigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No signs created yet. Select a template above to get started.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Sign list would go here */}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Parkwise Signage Designer v1.0.0</span>
            <span>MCP Server: localhost:3450</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
