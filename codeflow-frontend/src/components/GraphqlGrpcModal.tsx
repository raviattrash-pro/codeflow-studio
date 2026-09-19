import React, { useState } from 'react';
import {
  X, Zap, Copy, Check, Download, Layers, Code2, ArrowRight
} from 'lucide-react';
import { ThemeMode } from './Header';

interface GraphqlGrpcModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const GraphqlGrpcModal: React.FC<GraphqlGrpcModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [activeTab, setActiveTab] = useState<'GRAPHQL_SDL' | 'PROTOBUF_V3'>('GRAPHQL_SDL');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;
  const isLight = currentTheme === 'NORMAL';

  const graphqlSdlCode = `# GraphQL Schema Definition synthesized from Spring Data JPA Entities
type Order {
  id: ID!
  userId: String!
  totalAmount: Float!
  status: OrderStatus!
  items: [OrderItem!]!
  createdAt: String!
}

type OrderItem {
  productId: ID!
  quantity: Int!
  unitPrice: Float!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

type Query {
  getOrderById(id: ID!): Order
  listOrdersByUser(userId: String!, limit: Int = 10): [Order!]!
}

type Mutation {
  createOrder(userId: String!, items: [OrderItemInput!]!): Order!
  cancelOrder(id: ID!): Boolean!
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
  unitPrice: Float!
}`;

  const protobufCode = `syntax = "proto3";

package com.codeflow.studio.grpc;

option java_multiple_files = true;
option java_package = "com.codeflow.studio.grpc";

// High-Performance gRPC Order Service
service OrderGrpcService {
  rpc CreateOrder (CreateOrderRequest) returns (OrderResponse);
  rpc GetOrderStatus (OrderStatusRequest) returns (OrderResponse);
  rpc StreamOrderTelemetry (StreamTelemetryRequest) returns (stream TelemetryUpdate);
}

message OrderItemProto {
  string product_id = 1;
  int32 quantity = 2;
  double unit_price = 3;
}

message CreateOrderRequest {
  string user_id = 1;
  repeated OrderItemProto items = 2;
  string idempotency_key = 3;
}

message OrderResponse {
  string order_id = 1;
  string status = 2;
  double total_amount = 3;
  int64 created_epoch_ms = 4;
}`;

  const getCode = () => {
    return activeTab === 'GRAPHQL_SDL' ? graphqlSdlCode : protobufCode;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">GraphQL & gRPC Protobuf Schema Synthesizer</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  SDL & Proto3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synthesize high-performance GraphQL schemas and Protobuf contracts directly from Spring Boot DTOs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Schema'}
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
        <div
          className="studio-modal-content flex-1 flex flex-col p-5 space-y-4"
          style={{ backgroundColor: isLight ? '#ffffff' : '#070a12', minHeight: 0 }}
        >
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {[
                { id: 'GRAPHQL_SDL', name: 'GraphQL Schema (SDL)' },
                { id: 'PROTOBUF_V3', name: 'gRPC Protocol Buffers (v3)' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                  style={{
                    backgroundColor: activeTab === t.id ? '#ec4899' : (isLight ? '#f1f5f9' : '#1e293b'),
                    color: activeTab === t.id ? '#ffffff' : (isLight ? '#334155' : '#94a3b8')
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div
            className="border border-slate-700/50 rounded-xl overflow-hidden flex-1 flex flex-col shadow-inner"
            style={{ backgroundColor: '#050811', minHeight: 0 }}
          >
            <pre className="p-4 text-xs font-mono text-pink-300/90 leading-relaxed overflow-auto flex-1">
              {getCode()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
