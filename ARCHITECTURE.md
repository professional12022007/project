# BenefitOS Architecture

## Overview

BenefitOS follows a client-server architecture.

Citizen

↓

React Native (Expo)

↓

API Layer

↓

Express Backend

↓

Neo4j AuraDB

↓

AI Services

---

# Frontend

Framework:

React Native + Expo

Responsibilities:

- Authentication
- Dashboard
- Schemes
- Profile
- OCR
- Assistant
- Document Vault

State Management:

- Auth Store
- API Hooks

---

# Backend

Framework:

Node.js + Express

Responsibilities:

- Authentication
- Business Logic
- Welfare Engine
- Neo4j Queries
- OCR
- AI Assistant

---

# Database

Neo4j AuraDB

Important Relationships:

Citizen

↓

ELIGIBLE_FOR

↓

Scheme

Citizen

↓

BENEFITTING_FROM

↓

Scheme

---

# API Flow

Frontend

↓

API Client

↓

Express Routes

↓

Controllers

↓

Services

↓

Queries

↓

Neo4j

---

# Authentication

JWT

Protected routes

Bearer Token

---

# Environment Variables

Frontend:

- EXPO_PUBLIC_API_URL

Backend:

- PORT
- JWT_SECRET
- NEO4J_URI
- NEO4J_USERNAME
- NEO4J_PASSWORD
- SARVAM_API_KEY

---

# Deployment

Frontend

Expo

↓

EAS

Backend

↓

Render

Database

↓

Neo4j AuraDB

---

# Engineering Principles

- Repository is the source of truth.
- Backend is feature-complete and frozen.
- Frontend evolves incrementally.
- Preserve API compatibility.
- Prefer minimal, verified changes.
- Validate before modifying.

---

# Future Work

- UI polish
- Accessibility
- Performance optimization
- Automated testing
- Analytics
- Monitoring
- Crash reporting