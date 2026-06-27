# Raahtech Command Center

AI-assisted enterprise IT operations command center — unified incident management, digital twin simulation, AI autopilot remediation, and real-time threat monitoring. Built for Microsoft environments (Azure, Entra ID, M365, Defender).

https://comcenter.raahtech.org


## Current Stage

**MVP / Demo-Ready Prototype** — fully functional UI with mock data, real-time simulation mode, and interactive visualizations. Ready for stakeholder demos and investor presentations.

## Features

| Module | Description |
|---|---|
| **Dashboard** | Operational overview with KPIs, incident trends, system health, and AI insights. Persona toggle switches between Operations and Security views. |
| **Incidents** | Incident triage with priority, status, AI summaries, and team assignment |
| **Service Requests** | Workflow-stage tracking, approval status, and department routing |
| **Assets** | IT asset inventory with compliance state, lifecycle stage, and location |
| **AI Copilot** | Conversational AI assistant for operational queries and recommendations |
| **Digital Twin** | Interactive infrastructure topology with 24-hour time-travel slider and health propagation |
| **AI Autopilot** | Automated incident remediation with 5-step decision pipeline and runbook execution |
| **Real-Time Simulation** | Live Demo Mode generates random service health changes, notifications, and live threat counter increments |
| **Notification System** | Bell icon dropdown with severity-coded alerts, timestamps, and read status |
| **Security Persona** | Threat Origin Map with interactive actor detail dialogs, IP blocking, geo-fencing, and SOC escalation |
| **Security Audit Log** | Filterable audit trail of security actions with framer-motion animations, CSV export, and filter pills |
| **Live Threat Counters** | Real-time animated attempt count increments on threat actors during Live Demo Mode |
| **Threat Heatmap** | Mini heatmap widget with region-level attempt counts and pulsing total badge |

## Architecture

```
Microsoft Enterprise (Azure, Entra ID, M365, Defender, Intune)
        ↓
Raahtech Command Center (this platform)
        ↓
AI Insights & Automation (Copilot, Autopilot, Digital Twin)
```

- **Cloud**: Azure East/West US, Azure SQL, Azure Cache, Storage Clusters
- **Identity**: Microsoft Entra ID (Azure AD)
- **Productivity**: Exchange Online, SharePoint Online
- **Security**: Microsoft Defender for Endpoint
- **Network**: Azure VPN Gateway

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS + custom design system (dark theme, HSL tokens)
- **Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Routing**: React Router v6
- **State**: React Query, React Context

## DevOps

- Built with [Lovable](https://lovable.dev) — AI-powered development platform
- Auto-deployed on every change
- GitHub integration for version control
- No external backend required (mock data, client-side state)

## Getting Started

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run dev
```

## License

Proprietary — Raahtech

AI-assisted enterprise IT operations command center — unified incident management, digital twin simulation, AI autopilot remediation, and real-time threat monitoring. Built for Microsoft environments (Azure, Entra ID, M365, Defender).

azure, cloud-infrastructure, incident-management, servicenow, ai-operations, digital-twin, security-operations, react, typescript, enterprise, itsm, siem, devops, managed-services


