# 📓 Retrospective: The "Ghost in the Machine" Deployment Bugs

This document serves as a "Source of Truth" for the critical deployment issues encountered during the M015 (License System) and M013 (Low-Size Installer) implementation. Use this as a learning guide for future agents.

---

## 🛑 Mistake 1: The "16-Bit Application" Crash
### The Error
Users saw a "Unsupported 16-Bit Application" popup on startup for `ollama.exe`.

### The Root Cause
We moved to a "Low-Size Installer" model by removing the 400MB `ollama.exe` from the installer. However, we left the **Rust code** (`lib.rs`) attempting to launch `ollama` as a Tauri Sidecar on startup. Because the sidecar binary was missing or corrupted (placeholder), Windows threw a 16-bit error trying to execute a null/invalid entry.

### 💡 Learning
Never assume that removing a file from the installer is enough. You must **prune the backend orchestration logic** that expects that file to exist.

---

## 🛑 Mistake 2: The "Configuration Not Found" Loop
### The Error
Even after successful installation, the app crashed with "Configuration file not found. Please re-run the installer."

### The Root Cause
Two-fold mismatch:
1. **Context Mismatch**: The NSIS installer (running as Admin) wrote `app_config.json` to the Admin's `%APPDATA%`, but the App (running as Standard User) looked in the User's `%APPDATA%`.
2. **Hardcoded Path Mismatch**: We updated the Settings Engine to support "Portable Mode" (looking in the installation folder), but we forgot to update the **License Command** (`license.rs`), which remained hardcoded to look only in `%APPDATA%`.

### 💡 Learning
Always use a **Unified Path Helper**. If you have a function like `get_settings_path()`, ensure 100% of your code uses it instead of manual `app_config_dir()` calls.

---

## 🛑 Mistake 3: The "Registry Context" Pitfall
### The Error
After implementing a Registry Fallback, the app reported "License key missing" instead of "File not found."

### The Root Cause
We wrote the fallback data to `HKCU` (HKEY_CURRENT_USER). In Windows, when an installer is elevated (UAC), `HKCU` points to the **Administrator's registry profile**. When the user launches the app normally, the app looks in the **User's registry profile**, which is empty.

### 💡 Learning
When an installer needs to share data with an application across different privilege levels:
1. Use `HKLM` (HKEY_LOCAL_MACHINE) for global settings.
2. Ensure the installer grants `Read` permissions to the registry key for the `Users` group.

---

## 🛑 Mistake 4: The "Max Activations Reached" Loop
### The Error
When users tried to activate the "Attendance Client" on a second machine (or via manual fallback) using the same license key, the app would fail with `max_activations_reached` and return them to the "System Activation Setup" dialog repeatedly.

### The Root Cause
The generator script (`scripts/generate-license-key.ts`) was hardcoded to set `max_activations = 1` for all new license keys. Because the system's architecture requires at least *two* instances (one "Admin System" server and one "Attendance Client" kiosk), a single license key immediately exhausted its activation limit on the primary server, locking out any subsequent kiosks.

### 💡 Learning
Always align licensing limits with the real-world deployment topology. If a distributed system intrinsically requires a minimum of two nodes (Admin + Client) per site, the default license limit must gracefully accommodate that baseline architecture (`max_activations = 2`).

---

## 🛠️ Needed Features for Seamless Fix
To resolve the current "License key missing" issue, the next agent must:
1. **Switch to HKLM**: Update `installer_hooks.nsh` to write to `HKLM "Software\infoLib"` instead of `HKCU`.
2. **Grant Permissions**: Add an NSIS instruction to ensure the `Users` group has read access to that key.
3. **Update Rust**: Update `settings.rs` to read from `HKEY_LOCAL_MACHINE` instead of `HKEY_CURRENT_USER`.
4. **Self-Healing License Input**: If both file and registry are missing, the UI should not just show an error—it should proactively show the **License Input Dialog** so the user can fix it manually without reinstalling.

---

## 🛑 Mistake 5: The "LSA Protection" Block (Windows 11)
### The Error
Users see a "Program Compatibility Assistant" popup: "This module is blocked from loading into the Local Security Authority... \Bonjour\mdnsNSP.dll".

### The Root Cause
Windows 11's **Local Security Authority (LSA) protection** blocks non-Microsoft DLLs from loading into sensitive security processes. Our app uses `mdns-sd` for network discovery. When the networking stack initializes, Windows tries to load the Bonjour Name Service Provider (`mdnsNSP.dll`), triggering the security block.

### 💡 Learning
This is an environmental conflict, not a code bug. However, it creates friction for the user. 
1. **Developer Guidance**: Users should be told to click "Don't show this message again."
2. **Architectural Choice**: If mDNS discovery is not critical for all users, consider making the `mdns-sd` initialization lazy or optional to avoid triggering the NSP load on every startup.

---

## 🚀 Recommendation to Next Agent
> [!IMPORTANT]
> **Priority 1**: Update `settings.rs` to use `HKEY_LOCAL_MACHINE`.
> **Priority 2**: Ensure the NSIS installer uses `SetShellVarContext all` before writing to registry to ensure consistency.
> **Priority 3**: Implement a "Setup Wizard" fallback in the UI. If `license_key` is missing, redirect the user to a settings/activation page instead of a dead-end error dialog.
