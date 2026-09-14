import React, { useState } from 'react';
import {
  X, Terminal, Send, Copy, Check, Play, Lock, Code2, Globe,
  CheckCircle2, AlertCircle, Clock, Database, ChevronDown, RotateCcw
} from 'lucide-react';
import { ThemeMode } from './Header';

interface ApiSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface EndpointPreset {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultHeaders: Record<string, string>;
  defaultBody?: string;
  simulatedResponse: {
    status: number;
    statusText: string;
    durationMs: number;
    headers: Record<string, string>;
    body: any;
  };
}

const PRESET_ENDPOINTS: EndpointPreset[] = [
  {
    id: 'checkout',
    name: 'Submit Order Checkout',
    method: 'POST',
    path: '/api/v1/orders/checkout',
    description: 'Processes multi-item cart, charges payment via Stripe, and commits database transaction.',
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    defaultBody: JSON.stringify({
      userId: "usr_99812",
      items: [
        { productId: "prod_m3_pro", quantity: 1, unitPrice: 1999.00 },
        { productId: "prod_usb_c_hub", quantity: 2, unitPrice: 49.50 }
      ],
      shippingAddress: {
        street: "100 Market St",
        city: "San Francisco",
        state: "CA",
        zip: "94105"
      },
      paymentToken: "tok_stripe_visa_4242"
    }, null, 2),
    simulatedResponse: {
      status: 201,
      statusText: 'Created',
      durationMs: 48,
      headers: {
        'content-type': 'application/json',
        'x-trace-id': 'trc_9a8b7c6d5e4f',
        'x-hikari-connection-time': '2.1ms'
      },
      body: {
        orderId: 'ord_2026_88391',
        status: 'PAID',
        totalAmount: 2098.00,
        currency: 'USD',
        transactionId: 'txn_stripe_988102',
        createdAt: '2026-09-14T09:30:00Z',
        itemsCount: 2,
        estimatedDelivery: '2026-09-17T18:00:00Z'
      }
    }
  },
  {
    id: 'auth-login',
    name: 'JWT User Login',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Validates user credentials against BCrypt hash and issues signed JWT bearer token.',
    defaultHeaders: {
      'Content-Type': 'application/json'
    },
    defaultBody: JSON.stringify({
      username: "admin@codeflow.io",
      password: "••••••••••••"
    }, null, 2),
    simulatedResponse: {
      status: 200,
      statusText: 'OK',
      durationMs: 32,
      headers: {
        'content-type': 'application/json',
        'x-rate-limit-remaining': '99'
      },
      body: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTgwMDAwMDAwMH0.signature',
        tokenType: 'Bearer',
        expiresIn: 3600,
        roles: ['ROLE_ADMIN', 'ROLE_ARCHITECT']
      }
    }
  },
  {
    id: 'get-products',
    name: 'Search Product Catalog',
    method: 'GET',
    path: '/api/v1/products?category=electronics&limit=10',
    description: 'Queries indexed catalog with Redis cache layer and PostgreSQL fallback.',
    defaultHeaders: {
      'Accept': 'application/json'
    },
    simulatedResponse: {
      status: 200,
      statusText: 'OK',
      durationMs: 14,
      headers: {
        'content-type': 'application/json',
        'x-cache-hit': 'REDIS_HIT',
        'x-query-duration': '0.8ms'
      },
      body: {
        count: 2,
        page: 1,
        results: [
          { sku: 'prod_m3_pro', name: 'MacBook Pro M3 Max 64GB', price: 3499.00, inStock: true },
          { sku: 'prod_dell_u27', name: 'Dell UltraSharp 27 4K USB-C Hub', price: 649.00, inStock: true }
        ]
      }
    }
  },
  {
    id: 'user-profile',
    name: 'Get Current User Profile',
    method: 'GET',
    path: '/api/v1/users/me',
    description: 'Extracts principal from JWT SecurityContextHolder and returns user metadata.',
    defaultHeaders: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    simulatedResponse: {
      status: 200,
      statusText: 'OK',
      durationMs: 19,
      headers: {
        'content-type': 'application/json'
      },
      body: {
        userId: 'usr_99812',
        name: 'Alex Rivera',
        email: 'alex.rivera@enterprise.org',
        tier: 'ENTERPRISE',
        permissions: ['READ_ARCHITECTURE', 'EXECUTE_CHAOS', 'EXPORT_BLUEPRINT']
      }
    }
  }
];

export const ApiSandboxModal: React.FC<ApiSandboxModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointPreset>(PRESET_ENDPOINTS[0]);
  const [requestUrl, setRequestUrl] = useState<string>(PRESET_ENDPOINTS[0].path);
  const [requestMethod, setRequestMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>(PRESET_ENDPOINTS[0].method);
  const [requestBody, setRequestBody] = useState<string>(PRESET_ENDPOINTS[0].defaultBody || '');
  const [activeTab, setActiveTab] = useState<'BODY' | 'HEADERS' | 'SNIPPETS'>('BODY');
  const [activeSnippetLang, setActiveSnippetLang] = useState<'CURL' | 'FETCH' | 'AXIOS' | 'PYTHON'>('CURL');
  
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<typeof PRESET_ENDPOINTS[0]['simulatedResponse'] | null>(PRESET_ENDPOINTS[0].simulatedResponse);
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

  const handleSelectPreset = (preset: EndpointPreset) => {
    setSelectedEndpoint(preset);
    setRequestUrl(preset.path);
    setRequestMethod(preset.method);
    setRequestBody(preset.defaultBody || '');
    setResponse(preset.simulatedResponse);
  };

  const handleExecute = () => {
    setIsLoading(true);
    setResponse(null);
    setTimeout(() => {
      setResponse(selectedEndpoint.simulatedResponse);
      setIsLoading(false);
    }, 450);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateSnippet = (lang: 'CURL' | 'FETCH' | 'AXIOS' | 'PYTHON') => {
    const fullUrl = `http://localhost:8080${requestUrl}`;
    switch (lang) {
      case 'CURL':
        return `curl -X ${requestMethod} "${fullUrl}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <JWT_TOKEN>" ${
    requestBody && requestMethod !== 'GET' ? `\\\n  -d '${requestBody.replace(/\n/g, ' ')}'` : ''
  }`;
      case 'FETCH':
        return `const response = await fetch('${fullUrl}', {
  method: '${requestMethod}',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
  },${requestBody && requestMethod !== 'GET' ? `\n  body: JSON.stringify(${requestBody}),` : ''}
});
const data = await response.json();`;
      case 'AXIOS':
        return `import axios from 'axios';

const { data } = await axios({
  method: '${requestMethod.toLowerCase()}',
  url: '${fullUrl}',
  headers: {
    Authorization: 'Bearer ' + token,
  },${requestBody && requestMethod !== 'GET' ? `\n  data: ${requestBody},` : ''}
});`;
      case 'PYTHON':
        return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}
${requestBody && requestMethod !== 'GET' ? `payload = ${requestBody}\nresponse = requests.${requestMethod.toLowerCase()}(url, json=payload, headers=headers)` : `response = requests.${requestMethod.toLowerCase()}(url, headers=headers)`}
print(response.json())`;
    }
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m) {
      case 'GET': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'bg-slate-900/90 backdrop-blur-xl border-cyan-500/30 text-white'
            : isNeumorphic
            ? 'bg-[#1e2330] border-slate-700/50 text-slate-100'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">REST API Sandbox & cURL Runner</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  Live Dispatcher
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute authenticated Spring Boot endpoints, test payloads & generate multi-language cURL snippets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Presets Sidebar */}
          <div className="md:col-span-4 border-r border-slate-700/50 p-4 space-y-2 overflow-y-auto bg-slate-800/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Discovered AST Endpoints
            </span>
            {PRESET_ENDPOINTS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                  selectedEndpoint.id === preset.id
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getMethodBadgeClass(preset.method)}`}>
                    {preset.method}
                  </span>
                </div>
                <code className="text-[11px] font-mono text-slate-400 truncate">{preset.path}</code>
              </button>
            ))}
          </div>

          {/* Right Request / Response Workspace */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto p-5 space-y-4">
            {/* Request Bar */}
            <div className="flex items-center gap-2">
              <span className={`px-3 py-2 text-xs font-black rounded-lg border ${getMethodBadgeClass(requestMethod)}`}>
                {requestMethod}
              </span>
              <input
                type="text"
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                className="flex-1 bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleExecute}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow transition flex-shrink-0"
              >
                {isLoading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>

            {/* Request Tabs */}
            <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/20">
              <div className="flex items-center justify-between border-b border-slate-700/50 px-3 py-2 bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('BODY')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                      activeTab === 'BODY' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JSON Body
                  </button>
                  <button
                    onClick={() => setActiveTab('HEADERS')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                      activeTab === 'HEADERS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Headers & Auth
                  </button>
                  <button
                    onClick={() => setActiveTab('SNIPPETS')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                      activeTab === 'SNIPPETS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cURL Snippets
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-3">
                {activeTab === 'BODY' && (
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    rows={6}
                    placeholder="JSON payload..."
                    className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                  />
                )}
                {activeTab === 'HEADERS' && (
                  <div className="space-y-2 text-xs font-mono text-slate-300">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-400">Content-Type:</span>
                      <span className="text-cyan-300">application/json</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-400">Authorization:</span>
                      <span className="text-purple-300 truncate max-w-xs">Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</span>
                    </div>
                  </div>
                )}
                {activeTab === 'SNIPPETS' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {(['CURL', 'FETCH', 'AXIOS', 'PYTHON'] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setActiveSnippetLang(lang)}
                            className={`px-2 py-0.5 text-[11px] font-bold rounded transition ${
                              activeSnippetLang === lang ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => copyToClipboard(generateSnippet(activeSnippetLang), 'snippet')}
                        className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                      >
                        {copied === 'snippet' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied === 'snippet' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900/90 border border-slate-700/60 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
                      {generateSnippet(activeSnippetLang)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Response Section */}
            <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-800/20 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-700/50 px-4 py-2 bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Response</span>
                  {response && (
                    <>
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {response.status} {response.statusText}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {response.durationMs} ms
                      </span>
                    </>
                  )}
                </div>
                {response && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(response.body, null, 2), 'response')}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                  >
                    {copied === 'response' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied === 'response' ? 'Copied' : 'Copy Body'}</span>
                  </button>
                )}
              </div>

              <div className="p-3 flex-1 bg-slate-900/60 overflow-y-auto">
                {response ? (
                  <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                    {JSON.stringify(response.body, null, 2)}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-28 text-xs text-slate-500">
                    Click "Send" to execute request simulation
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
