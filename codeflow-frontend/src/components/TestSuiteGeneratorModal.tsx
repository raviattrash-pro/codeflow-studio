import React, { useState } from 'react';
import {
  X, CheckSquare, Copy, Check, Download, Play, Code2, Sparkles,
  Layers, ShieldCheck, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ThemeMode } from './Header';

interface TestSuiteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

interface TestPreset {
  id: string;
  name: string;
  targetEndpoint: string;
  framework: 'REST_ASSURED' | 'PLAYWRIGHT' | 'SPRING_MOCKMVC';
  code: string;
}

const TEST_PRESETS: TestPreset[] = [
  {
    id: 'rest-assured-order',
    name: 'OrderControllerTest (Java / RestAssured)',
    targetEndpoint: 'POST /api/v1/orders/checkout',
    framework: 'REST_ASSURED',
    code: `package com.codeflow.studio.test;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class OrderCheckoutRestAssuredTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
    }

    @Test
    @DisplayName("POST /orders/checkout should process payment and return 201 Created")
    void testCheckoutSuccess() {
        String requestJson = """
            {
              "userId": "usr_99812",
              "items": [{ "productId": "prod_m3_pro", "quantity": 1, "unitPrice": 1999.00 }],
              "paymentToken": "tok_visa_4242"
            }
            """;

        given()
            .contentType(ContentType.JSON)
            .header("Authorization", "Bearer eyJhbGciOiJIUzI1Ni...")
            .body(requestJson)
        .when()
            .post("/api/v1/orders/checkout")
        .then()
            .statusCode(201)
            .body("status", equalTo("SUCCESS"))
            .body("orderId", notNullValue())
            .body("amountCharged", equalTo(1999.00f));
    }
}`
  },
  {
    id: 'playwright-checkout-api',
    name: 'checkout.api.spec.ts (Playwright / TS)',
    targetEndpoint: 'POST /api/v1/orders/checkout',
    framework: 'PLAYWRIGHT',
    code: `import { test, expect } from '@playwright/test';

test.describe('E-Commerce Order Checkout API Contract', () => {
  test('should create order and verify response schema', async ({ request }) => {
    const response = await request.post('/api/v1/orders/checkout', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_jwt_token_admin',
      },
      data: {
        userId: 'usr_99812',
        items: [{ productId: 'prod_m3_pro', quantity: 1, unitPrice: 1999.00 }],
        paymentToken: 'tok_visa_4242',
      }
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.status).toBe('SUCCESS');
    expect(body.orderId).toBeDefined();
    expect(body.amountCharged).toBe(1999.00);
  });
});`
  },
  {
    id: 'mockmvc-auth-test',
    name: 'AuthControllerTest (Spring MockMvc)',
    targetEndpoint: 'POST /api/v1/auth/login',
    framework: 'SPRING_MOCKMVC',
    code: `package com.codeflow.studio.test;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testValidLoginReturnsJwtToken() throws Exception {
        String loginJson = "{\"username\":\"admin@codeflow.io\",\"password\":\"secret123\"}";

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").exists());
    }
}`
  }
];

export const TestSuiteGeneratorModal: React.FC<TestSuiteGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [selectedPreset, setSelectedPreset] = useState<TestPreset>(TEST_PRESETS[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';

  const copyCode = () => {
    navigator.clipboard.writeText(selectedPreset.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isJava = selectedPreset.framework !== 'PLAYWRIGHT';
    const blob = new Blob([selectedPreset.code], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isJava ? `${selectedPreset.id}.java` : `${selectedPreset.id}.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl  flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Automated E2E Test Suite Generator</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  RestAssured & Playwright
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate production-ready contract tests, JWT auth headers, status code assertions & mock fixtures from parsed AST routes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Test File
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Presets */}
          <div
            className="studio-modal-sidebar md:col-span-4 p-4 space-y-2 overflow-y-auto"
            style={{ backgroundColor: isLight ? '#f8fafc' : '#090d16' }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Generated Test Suites
            </span>
            {TEST_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className="w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 cursor-pointer"
                style={{
                  backgroundColor: selectedPreset.id === preset.id
                    ? (isLight ? '#e0f2fe' : '#1e293b')
                    : (isLight ? '#ffffff' : '#141e33'),
                  borderColor: selectedPreset.id === preset.id
                    ? '#10b981'
                    : (isLight ? '#cbd5e1' : '#334155')
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                  <span
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded text-cyan-300"
                    style={{ backgroundColor: isLight ? '#e2e8f0' : '#1e293b' }}
                  >
                    {preset.framework === 'PLAYWRIGHT' ? 'TS' : 'Java'}
                  </span>
                </div>
                <code className="text-[11px] font-mono text-slate-400 truncate">{preset.targetEndpoint}</code>
              </button>
            ))}
          </div>

          {/* Right Code Viewer */}
          <div
            className="studio-modal-content md:col-span-8 flex flex-col p-5 overflow-y-auto space-y-3"
            style={{ backgroundColor: isLight ? '#ffffff' : '#070a12' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Target: <code className="text-cyan-300 font-bold">{selectedPreset.targetEndpoint}</code>
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <div
              className="border border-slate-700/50 rounded-xl overflow-hidden flex-1 flex flex-col shadow-inner"
              style={{ backgroundColor: '#050811', minHeight: 0 }}
            >
              <pre className="p-4 text-xs font-mono text-emerald-300/90 leading-relaxed overflow-auto flex-1">
                {selectedPreset.code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
