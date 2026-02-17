-- Fase 1: Esquema inicial - Ventas
-- Asistente Lisual

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads / Contactos
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  empresa TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
  canal_origen TEXT NOT NULL DEFAULT 'manual' CHECK (canal_origen IN ('reunion', 'manual', 'web', 'referencia')),
  estado TEXT NOT NULL DEFAULT 'prospecto' CHECK (estado IN ('prospecto', 'negociacion', 'convertido', 'perdido')),
  presupuesto_estimado NUMERIC,
  necesidad TEXT,
  fecha_decision_estimada DATE,
  notas TEXT,
  referred_by_lead_id UUID REFERENCES leads(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Presupuestos
CREATE TABLE presupuestos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  numero TEXT NOT NULL UNIQUE,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  vigencia_hasta DATE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  impuestos NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  moneda TEXT NOT NULL DEFAULT 'ARS',
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado', 'aceptado', 'rechazado', 'vencido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seguimientos automáticos
CREATE TABLE seguimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presupuesto_id UUID NOT NULL REFERENCES presupuestos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('d3', 'd7', 'pre_vencimiento')),
  programado_para TIMESTAMPTZ NOT NULL,
  ejecutado_at TIMESTAMPTZ,
  contenido_usado TEXT CHECK (contenido_usado IN ('cont1', 'cont2', 'cont3')),
  canal TEXT CHECK (canal IN ('whatsapp', 'email')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clientes (leads convertidos)
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE RESTRICT,
  id_lisual_pro TEXT,
  id_empresa TEXT,
  fecha_pago DATE NOT NULL,
  monto_pagado NUMERIC NOT NULL,
  metodo_pago TEXT,
  referencia_pago TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reuniones
CREATE TABLE reuniones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  fecha_hora TIMESTAMPTZ NOT NULL,
  duracion_min INTEGER DEFAULT 60,
  notas TEXT,
  google_event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_canal ON leads(canal_origen);
CREATE INDEX idx_presupuestos_lead ON presupuestos(lead_id);
CREATE INDEX idx_presupuestos_estado ON presupuestos(estado);
CREATE INDEX idx_seguimientos_programado ON seguimientos(programado_para) WHERE ejecutado_at IS NULL;
CREATE INDEX idx_clientes_lead ON clientes(lead_id);
CREATE INDEX idx_reuniones_lead ON reuniones(lead_id);
CREATE INDEX idx_reuniones_fecha ON reuniones(fecha_hora);

-- RLS (habilitar; políticas se añadirán con Auth)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reuniones ENABLE ROW LEVEL SECURITY;
