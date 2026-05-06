# 📚 InfoLib: Library Management Infrastructure

[![GSD-2](https://img.shields.io/badge/Workflow-GSD--2-blue?style=for-the-badge)](https://github.com/gsd-build/gsd-2)
[![Caveman](https://img.shields.io/badge/Efficiency-Caveman-orange?style=for-the-badge)](https://github.com/JuliusBrussee/caveman)
[![OS](https://img.shields.io/badge/Platform-Windows%2011-0078d4?style=for-the-badge&logo=windows)](https://www.microsoft.com/windows)

A premium, state-of-the-art Library Management System built with a focus on speed, aesthetics, and agentic autonomy. This repository contains the core infrastructure, provider configurations, and the GSD-2 workflow definitions.

---

## 🚀 Development Quickstart

This repository is designed for rapid replication and seamless handoff between human developers and AI agents.

### 📋 Prerequisites

Ensure your environment meets the following requirements:

*   **OS**: Windows 11 (Optimized for Powershell/WSL2)
*   **AI Engine**: [Ollama](https://ollama.com/) (Must be running for local intelligence)
*   **Sync Provider**: [Firebase](https://firebase.google.com/) (Target for auto-sync and data persistence)
*   **Runtimes & Languages**:
    *   **Bun**: (Recommended) High-performance JavaScript runtime.
    *   **Node.js**: (Supported) Standard JavaScript runtime.
    *   **Rust**: **(Required)** For the Tauri backend and native modules.
*   **Frameworks**:
    *   **GSD-2**: Located at `c:\projects\ai\gsd-2`
    *   **Caveman**: Located at `c:\projects\ai\caveman` (Agentic compression skills)

### 🛠️ Installation Guide

1.  **Clone & Initialize**:
    ```powershell
    git clone https://github.com/flor-dev25/opac-lib.git
    cd opac-lib
    ```

2.  **Environment Setup**:
    *   Install **Astral UV**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
    *   Install **Python 3.14**: `uv python install 3.14`
    *   Configure `.env` using `.env.example`.

3.  **Dependency Management**:
    ```powershell
    # Install frontend dependencies (Bun recommended)
    bun install
    
    # Alternative: Use npm if Bun is not available
    # npm install

    # Verify Rust/Tauri toolchain (Cargo/Rust required)
    cargo tauri --version
    ```

4.  **Agentic Initialization**:
    Run the caveman installer to wire the agentic skills:
    ```powershell
    irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex
    ```

---

## 🤖 Agentic Roles & Workflow

We utilize a multi-agent orchestration strategy powered by **gsd-2** and **caveman**.

### 👑 Lead Project Manager
Orchestrates the high-level roadmap (`ROADMAP.md`) and defines atomic tasks. The PM ensures that every implementation step aligns with the core architectural vision of InfoLib.

### ✍️ Senior Documentator
Responsible for maintaining the "Source of Truth". This role ensures that all system changes are reflected in the `docs/` directory and that the `PROJECT-TRACKER.md` is updated with zero latency.

### 🔄 Workflow (PM → Code → QA → Tracker)
1.  **Plan**: PM defines the scope in `CONTEXT.md`.
2.  **Execute**: Surgical implementation using **Caveman** for ultra-terse, high-speed communication.
3.  **Verify**: Multi-stage verification (Static → Logic → Browser).
4.  **Document**: Senior Documentator finalizes the state and propagates changes.

---

## ☁️ Synchronization & Providers

The system is architected for modular provider support:

*   **Primary Sync**: **Firebase** (Real-time synchronization for multi-device support). [Setup Guide](docs/FIREBASE-SETUP-2026.md)
*   **Health Monitoring**: **Supabase** (Healthchecks for legacy infrastructure).

---

## 📝 Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Spin up the local development server |
| `npm run tauri dev` | Launch the Tauri desktop environment |
| `npm run health` | Verify connectivity to Firebase/Supabase |
| `uv run ruff format` | Standardize code formatting |

---

> [!TIP]
> This repository is optimized for **Windows 11**. For the best experience, use a modern terminal (Windows Terminal) and ensure your local Ollama instance has the required models pulled.
