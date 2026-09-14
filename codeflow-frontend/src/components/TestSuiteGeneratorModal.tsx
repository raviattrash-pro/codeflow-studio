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
            .body("status", equalTo("PAID"))
            .body("totalAmount", equalTo(1999.00f))
            .body("orderId", notNullValue());
    }
}`
  },
  {
    id: 'playwright-api-order',
    name: 'checkout.api.spec.ts (Playwright / TS)',
    targetEndpoint: 'POST /api/v1/orders/checkout',
    framework: 'PLAYWRIGHT',
    code: `import { test, expect } from '@playwright/test';

test.describe('Order Checkout REST API Contract', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:8080';
  const authToken = 'Bearer eyJhbGciOiJIUzI1Ni...';

  test('should validate checkout payload, process payment and return 201', async ({ request }) => {
    const response = await request.post(baseURL + '/api/v1/orders/checkout', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken,
      },
      data: {
        userId: 'usr_99812',
        items: [{ productId: 'prod_m3_pro', quantity: 1, unitPrice: 1999.00 }],
        paymentToken: 'tok_visa_4242',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 'PAID',
      totalAmount: 1999.00,
    });
    expect(body.orderId).toBeDefined();
  });
});`
  },
  {
    id: 'spring-mockmvc-auth',
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
  const isGlass = currentTheme === 'GLASSMORPHISM';
  const isNeumorphic = currentTheme === 'NEUMORPHIC';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : isGlass
            ? 'bg-[#0f172a] backdrop-blur-xl border-cyan-500/30 text-white'
            : isNeumorphic
            ? 'bg-[#1e2330] border-slate-700/50 text-slate-100'
            : 'bg-[#0f172a] border-slate-700 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Test File
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Presets */}
          <div className="md:col-span-4 border-r border-slate-700/50 p-4 space-y-2 overflow-y-auto bg-slate-800/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Generated Test Suites
            </span>
            {TEST_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                  selectedPreset.id === preset.id
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-700/40 text-slate-300 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{preset.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                    {preset.framework === 'PLAYWRIGHT' ? 'TS' : 'Java'}
                  </span>
                </div>
                <code className="text-[11px] font-mono text-slate-400 truncate">{preset.targetEndpoint}</code>
              </button>
            ))}
          </div>

          {/* Right Code Viewer */}
          <div className="md:col-span-8 flex flex-col p-5 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Target: <code className="text-cyan-300 font-bold">{selectedPreset.targetEndpoint}</code>
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <div className="border border-slate-700/50 rounded-xl overflow-hidden bg-slate-950 flex-1 flex flex-col shadow-inner">
              <pre className="p-4 text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto flex-1">
                {selectedPreset.code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
