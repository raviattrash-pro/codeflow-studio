import React, { useState } from 'react';
import {
  X, Cloud, Copy, Check, Download, Layers, Server, Database, CheckCircle2
} from 'lucide-react';
import { ThemeMode } from './Header';

interface CloudInfraSynthesizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: ThemeMode;
}

export const CloudInfraSynthesizerModal: React.FC<CloudInfraSynthesizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme = 'NIGHT',
}) => {
  const [activeTab, setActiveTab] = useState<'DOCKER' | 'TERRAFORM' | 'KUBERNETES'>('DOCKER');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isLight = currentTheme === 'NORMAL';

  const getCode = () => {
    switch (activeTab) {
      case 'DOCKER':
        return `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: codeflow-backend
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/codeflow_db
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=secret
      - SPRING_DATA_REDIS_HOST=redis
      - SPRING_DATA_REDIS_PORT=6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    container_name: codeflow-postgres
    environment:
      POSTGRES_DB: codeflow_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: codeflow-redis
    ports:
      - "6379:6379"

volumes:
  pgdata:`;

      case 'TERRAFORM':
        return `# Terraform AWS Infrastructure for CodeFlow Architecture
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# 1. VPC & Networking
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  name    = "codeflow-vpc"
  cidr    = "10.0.0.0/16"
  azs     = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
}

# 2. RDS PostgreSQL 16
resource "aws_db_instance" "postgres" {
  identifier        = "codeflow-db"
  engine            = "postgres"
  engine_version    = "16.1"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  db_name           = "codeflow_prod"
  username          = "codeflow_admin"
  password          = var.db_password
  skip_final_snapshot = true
}

# 3. ECS Fargate Service
resource "aws_ecs_cluster" "main" {
  name = "codeflow-cluster"
}`;

      case 'KUBERNETES':
        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: codeflow-api
  labels:
    app: codeflow-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: codeflow-api
  template:
    metadata:
      labels:
        app: codeflow-api
    spec:
      containers:
      - name: codeflow-api
        image: registry.codeflow.io/api:8.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        resources:
          limits:
            cpu: "1000m"
            memory: "1024Mi"
          requests:
            cpu: "250m"
            memory: "512Mi"
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: codeflow-api-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8080
  selector:
    app: codeflow-api`;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'DOCKER' ? 'docker-compose.yml' : activeTab === 'TERRAFORM' ? 'main.tf' : 'k8s-deployment.yaml';
    const blob = new Blob([getCode()], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ext;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="studio-modal-overlay">
      <div
        className="studio-modal-card w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: isLight ? '#ffffff' : '#0f172a' }}
      >
        {/* Header */}
        <div
          className="studio-modal-header flex items-center justify-between px-6 py-4"
          style={{ backgroundColor: isLight ? '#f1f5f9' : '#1e293b' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Cloud Infrastructure & Docker / Terraform Synthesizer</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  IaC Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Synthesize production Docker Compose files, AWS Terraform modules & Kubernetes manifests directly from AST database/service requirements
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download IaC File
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
          className="studio-modal-content flex-1 overflow-hidden flex flex-col p-5 space-y-4"
          style={{ backgroundColor: isLight ? '#ffffff' : '#070a12' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {[
                { id: 'DOCKER', name: 'Docker Compose (Multi-Container)' },
                { id: 'TERRAFORM', name: 'AWS Terraform (ECS + RDS)' },
                { id: 'KUBERNETES', name: 'Kubernetes Helm Manifest' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer"
                  style={{
                    backgroundColor: activeTab === t.id ? '#0ea5e9' : (isLight ? '#f1f5f9' : '#1e293b'),
                    color: activeTab === t.id ? '#000000' : (isLight ? '#334155' : '#94a3b8')
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy IaC'}
            </button>
          </div>

          <div
            className="border border-slate-700/50 rounded-xl overflow-hidden flex-1 flex flex-col shadow-inner"
            style={{ backgroundColor: '#050811' }}
          >
            <pre className="p-4 text-xs font-mono text-cyan-300/90 leading-relaxed overflow-x-auto flex-1">
              {getCode()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
