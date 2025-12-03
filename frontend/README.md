# Altera System - Frontend

Microfrontend architecture for Altera System with separate web and mobile applications.

## 🏗️ Architecture Overview


Altera-System/
├── frontend/ # This repository
│ ├── web/ # Web applications (Microfrontends)
│ └── mobile/ # Mobile applications (React Native)
└── backend/ # Backend services


## 📱 Applications

| Application | Type | Port | Description |
|-------------|------|------|-------------|
| Shell | Web (Container) | 5000 | Main container app that orchestrates microfrontends |
| Teacher Web App | Web (Microfrontend) | 5001 | Teacher portal for class management |
| Admin Web App | Web (Microfrontend) | 5002 | Administrative dashboard and system management |
| Parent Mobile App | Mobile (React Native) | - | Mobile app for parents (separate development) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- For mobile: React Native development environment

### Installation

```bash
# Install all web applications (workspace)
npm install

# Install mobile dependencies (separate)
cd mobile/parent
npm install

Development
# Start all web applications
npm run dev

# Start mobile application (separate terminal)
npm run dev:mobile

# Start individual applications
npm run dev --workspace=web/shell
npm run dev --workspace=web/apps/teacher-web-app
npm run dev --workspace=web/apps/admin-web-app


📁 Project Structure

frontend/
├── web/                 # Web applications (Workspace)
│   ├── shell/          # Main container app
│   ├── apps/           # Microfrontend applications
│   └── shared/         # Shared web components & utilities
├── mobile/             # Mobile applications
│   └── parent/ # React Native parent app
└── package.json        # Root workspace configuration

🛠️ Build & Deployment
# Build all web applications
npm run build

# Build individual applications
npm run build --workspace=web/shell
npm run build --workspace=web/apps/teacher-web-app

# Preview production build
npm run preview --workspace=web/shell


🔧 Technology Stack
Web Applications
Framework: React 18

Build Tool: Vite 4

Microfrontends: Module Federation

Routing: React Router DOM

Package Management: npm Workspaces

Mobile Application
Framework: React Native 0.72

Navigation: React Navigation

State Management: React Context / Redux (optional)

🌐 Development URLs
Shell: http://localhost:5000

Teacher App: http://localhost:5001

Admin App: http://localhost:5002

Mobile: Metro bundler on :8081

📚 Documentation
Web Applications Documentation

Mobile Application Documentation

Shared Components Documentation

🤝 Development Workflow
All web apps share a single node_modules (workspace)

Mobile app has separate node_modules (different platform)

Each microfrontend can be developed and deployed independently

Shared components are available across web applications

🐛 Troubleshooting
Common Issues
Module Federation errors: Ensure all apps are running on correct ports
Dependency conflicts: Use npm ls to check for version mismatches
Mobile build issues: Check React Native environment setup

📄 License
Proprietary - Altera System


## 2. Web Applications README.md

```markdown
# Altera System - Web Applications

Microfrontend architecture for Altera System web applications using Module Federation.

## 🎯 Overview

This workspace contains all web applications for Altera System:
- **Shell**: Main container application
- **Teacher Web App**: Teacher portal microfrontend
- **Admin Web App**: Administration portal microfrontend
- **Shared**: Common components and utilities

## 🏗️ Architecture
web/
├── shell/ # Container app (Port 5000)
│ ├── src/
│ ├── vite.config.js
│ └── package.json
├── apps/
│ ├── teacher-web-app/ # Teacher portal (Port 5001)
│ └── admin-web-app/ # Admin portal (Port 5002)
└── shared/ # Shared resources
├── components/
├── utils/
└── styles/


## 🚀 Quick Start

### Installation

```bash
# From frontend root
npm install

# Or directly in web directory
cd web
npm install

Development
# Start all applications concurrently
npm run dev

# Start individual applications
npm run dev --workspace=shell
npm run dev --workspace=apps/teacher-web-app
npm run dev --workspace=apps/admin-web-app

## Access Applications
Main Application: http://localhost:5000

Teacher App: http://localhost:5001 (direct access)

Admin App: http://localhost:5002 (direct access)

🔧 Technology Stack
React 18 with modern hooks

Vite 4 for fast development and building

Module Federation for microfrontend architecture

React Router DOM for routing

CSS3 with CSS Variables for theming

📦 Module Federation Configuration