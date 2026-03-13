# 🖥️ HRMS Frontend — Enterprise HR Management Dashboard

<div align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

> A modern, role-driven HR dashboard for managing employees, attendance, payroll, and more — built for **Cortexa Global**.

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Role-Based Access](#-role-based-access)

---

## 🚀 Overview

The **HRMS Frontend** is a fully responsive, single-page application (SPA) built with React 19 and Vite. It provides a role-based dashboard experience for Admins, HR, Managers, Team Leads, and Employees — each with tailored views and access permissions.

---

## ✨ Key Features

### 🏠 Role-Based Dashboards
- Separate dashboard views for `ADMIN`, `HR`, `MANAGER`, `TL`, and `EMPLOYEE`
- Protected routes with JWT-based auth guards
- Persistent sessions with token storage

### 👥 Employee Management
- Full employee directory with search and filters
- Employee profile pages with document management
- Photo uploads and dossier view
- Onboarding approval workflow UI

### 📍 Attendance Tracking
- Live attendance status per employee
- Daily / Monthly attendance history views
- Geo-location check-in/out with map (Leaflet)
- Multi-punch display support

### 💰 Payroll & Reports
- Monthly payroll summary tables
- PDF payslip download (jsPDF + AutoTable)
- Excel export for HR reports (XLSX)
- Violation & discipline reports

### ⏰ Shift Management
- Shift creation and assignment UI
- Branch-wise shift scheduling

### 📊 Admin Dashboard
- Real-time stats: active employees, attendance rate, pending approvals
- Branch performance overview
- Payroll summary widgets

### 🗺️ Map Integration
- Interactive Leaflet maps for geo-fenced check-in/out visualization

---

## 🛠 Tech Stack

| Category | Technology | Version |
|:---|:---|:---|
| **Framework** | React | `^19.2.0` |
| **Build Tool** | Vite | `^7.3.1` |
| **Styling** | TailwindCSS | `^4.1.18` |
| **Routing** | React Router DOM | `^7.13.0` |
| **HTTP Client** | Axios | `^1.13.5` |
| **Icons** | Lucide React | `^0.575.0` |
| **Date & Time** | Luxon | `^3.7.2` |
| **Maps** | Leaflet + React Leaflet | `^1.9.4` |
| **PDF Export** | jsPDF + jsPDF-AutoTable | `^4.2.0` |
| **Excel Export** | XLSX | `^0.18.5` |

---

## 📁 Project Structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, logos, icons
│   ├── components/     # Reusable UI components
│   │   ├── Admin/      # Admin-specific components
│   │   ├── HR/         # HR-specific components
│   │   ├── Employee/   # Employee-specific components
│   │   └── shared/     # Shared/common components
│   ├── context/        # React Context (auth, theme, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page-level components
│   ├── services/       # Axios API service calls
│   ├── utils/          # Helper functions
│   ├── App.jsx         # Root component with router
│   └── main.jsx        # App entry point
├── index.html
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) `v18+`
- Backend server running at `http://localhost:5000`

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/rohitsamariya/frontend.git
cd frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
# Then edit .env with your values
```

**4. Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000
```

> ⚠️ All environment variables must be prefixed with `VITE_` to be accessible in the app.

---

## 📜 Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production + generate 404.html for SPA routing |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🔒 Role-Based Access

| Role | Access Level |
|:---|:---|
| `ADMIN` | Full access — all modules, user management, system config |
| `HR` | Employee management, payroll, reports, onboarding |
| `MANAGER` | Branch team management, attendance, discipline |
| `TL` | Team attendance view, limited reports |
| `EMPLOYEE` | Own dashboard, attendance, payslips |

---

<div align="center">

Made with ❤️ by [Rohit Samariya](https://github.com/rohitsamariya) · Cortexa Global

</div>
