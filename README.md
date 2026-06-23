# ResuTailor 🎯

A premium, AI-powered resume tailoring assistant designed to help candidates align their CVs with specific job descriptions through dynamic, context-aware interviews. Built with Next.js, Supabase, and Azure OpenAI.

---

## ✨ Features

- **💎 Premium Glassmorphism UI**: Styled with a cohesive Deep Teal palette, smooth micro-animations, and responsive layouts (desktop collapsible sidebar + mobile bottom dock).
- **📝 Interactive AI Workspace**: Conversational CV auditor that interviews you about key job requirements (rather than assuming skills) and suggests updates.
- **📄 Smart CV Upload**: Integrates an optimized server-side PDF parser with custom binary header verification to intercept corrupted uploads early.
- **🧠 Profile-Adaptive System Prompt**: The backend AI system prompt dynamically adapts to whether you are a cybersecurity student (e.g., UMaT/Adisadel College) or a professional candidate.
- **🔐 Supabase Sync**: Secure Google OAuth authentication that synchronizes profile records dynamically with the `profiles` table.
- **🤖 Azure OpenAI backend**: Integrates with a user-deployed Azure `o4-mini` model for rapid, low-latency, and high-quality tailoring.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Runtime**: Node.js
- **Database / Auth**: [Supabase](https://supabase.com/)
- **AI Core**: Azure OpenAI (`o4-mini`)
- **PDF Extraction**: `pdf-parse` (version 2.4.5) with custom Webpack external configurations
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.dev/)

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js 20+** installed.

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=o4-mini
```

### 4. Database Setup

Execute the schema defined in `SUPABASE_SCHEMA.sql` inside the Supabase SQL Query Editor to set up the `profiles` table, row-level security (RLS), and automatic update triggers.

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
