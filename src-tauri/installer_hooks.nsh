; ============================================================
; infoLib NSIS Installer Hooks
; General de Jesus College — Library Management System
; ============================================================
; This file injects custom logic into the Tauri v2 NSIS installer.
; Dependencies: PostgreSQL 16+ Portable, Ollama CLI
; ============================================================

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

; --- NSIS Plugins ---
!addplugindir "${__FILEDIR__}\nsis-plugins"

; --- Variables ---
Var DbHost
Var DbPort
Var DbUser
Var DbPass
Var DbName
Var Dialog
Var LabelHost
Var LabelPort
Var LabelUser
Var LabelPass
Var LabelName
Var InputHost
Var InputPort
Var InputUser
Var InputPass
Var InputName
Var SystemPgFound
Var SystemPgPath
Var SystemOllamaFound
Var SystemOllamaPath
Var ExistingConfigFound
Var InstallMode ; 0 = Admin, 1 = Client
Var DialogSelection
Var RadioAdmin
Var RadioClient
Var LicenseKey
Var MachineId
Var LicenseValid
Var InputLicense

; --- Custom Pages ---
Page custom CUSTOM_PAGE_LICENSE CUSTOM_PAGE_LICENSE_LEAVE
Page custom CUSTOM_PAGE_SELECTION CUSTOM_PAGE_SELECTION_LEAVE
Page custom CUSTOM_PAGE_DATABASE CUSTOM_PAGE_DATABASE_LEAVE

; ============================================================
; CUSTOM PAGE: Component Selection
; ============================================================

Function CUSTOM_PAGE_SELECTION
  nsDialogs::Create 1018
  Pop $DialogSelection
  ${If} $DialogSelection == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 20u "Select Installation Type"
  Pop $0
  CreateFont $1 "Segoe UI" 12 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ${NSD_CreateRadioButton} 0 30u 100% 12u "Admin System (Cataloging, Server, AI)"
  Pop $RadioAdmin
  ${NSD_Check} $RadioAdmin

  ${NSD_CreateLabel} 15u 45u 90% 24u "Installs the full library management system, database, and AI engine. Acts as the central server."
  Pop $0
  CreateFont $1 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $1 0

  ${NSD_CreateRadioButton} 0 75u 100% 12u "Attendance Client (Door PC)"
  Pop $RadioClient

  ${NSD_CreateLabel} 15u 90u 90% 24u "Installs a lightweight kiosk for student check-ins. Connects to an existing Admin Server on the network."
  Pop $0
  CreateFont $1 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $1 0

  nsDialogs::Show
FunctionEnd

Function CUSTOM_PAGE_SELECTION_LEAVE
  ${NSD_GetState} $RadioAdmin $0
  ${If} $0 == ${BST_CHECKED}
    StrCpy $InstallMode "0"
  ${Else}
    StrCpy $InstallMode "1"
  ${EndIf}
FunctionEnd

; ============================================================
; CUSTOM PAGE: License Activation
; ============================================================

Function CUSTOM_PAGE_LICENSE
  ; Skip if already valid (re-entry)
  ${If} $LicenseValid == "1"
    Abort
  ${EndIf}

  nsDialogs::Create 1018
  Pop $Dialog
  ${If} $Dialog == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0 0 100% 20u "Software Activation"
  Pop $0
  CreateFont $1 "Segoe UI" 12 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ${NSD_CreateLabel} 0 30u 100% 24u "Please enter your InfoLib license key to continue installation. This requires an internet connection."
  Pop $0
  CreateFont $1 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $1 0

  ${NSD_CreateLabel} 0 60u 80u 12u "License Key:"
  Pop $0
  ${NSD_CreateText} 0 75u 100% 14u "INFL-"
  Pop $InputLicense
  
  ${NSD_CreateLabel} 0 100u 100% 24u "Format: INFL-XXXXXXXX-XXXXXXXX-XXXXXXXX"
  Pop $0
  CreateFont $1 "Segoe UI" 7 400
  SendMessage $0 ${WM_SETFONT} $1 0

  nsDialogs::Show
FunctionEnd

Function CUSTOM_PAGE_LICENSE_LEAVE
  ${NSD_GetText} $InputLicense $LicenseKey
  
  ; 1. Generate Machine ID (Hostname + Volume Serial)
  DetailPrint "Generating machine fingerprint..."
  nsExec::ExecToStack 'powershell -NoProfile -Command "[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($env:COMPUTERNAME + (Get-WmiObject Win32_LogicalDisk -Filter DriveType=3 | Select -First 1 VolumeSerialNumber).VolumeSerialNumber))"'
  Pop $0
  Pop $MachineId
  StrCpy $MachineId $MachineId -2 ; Strip CRLF from powershell output

  ; 2. Call Supabase Edge Function
  DetailPrint "Verifying license online..."
  ; Note: Using a temporary file for the response
  GetTempFileName $0
  
  inetc::post '{"license_key":"$LicenseKey","machine_id":"$MachineId","machine_label":"$COMPUTERNAME"}' \
    /SILENT \
    /HEADER "Content-Type: application/json" \
    "https://gjtgotwduereuzpjiinw.supabase.co/functions/v1/verify-license" \
    $0
  Pop $1 ; Status string

  ${If} $1 != "OK"
    MessageBox MB_OK|MB_ICONSTOP "Connection failed: $1$\n$\nPlease ensure you are connected to the internet."
    Abort
  ${EndIf}

  ; 3. Parse JSON Response
  nsJSON::Set /file $0
  nsJSON::Get "status" /END
  Pop $2
  
  ${If} $2 == "activated"
  ${OrIf} $2 == "already_yours"
    StrCpy $LicenseValid "1"
    DetailPrint "License verified: $2"
  ${Else}
    nsJSON::Get "error" /END
    Pop $3
    MessageBox MB_OK|MB_ICONSTOP "Activation Failed: $3$\n$\nPlease check your key and try again."
    Abort
  ${EndIf}
  
  Delete $0
FunctionEnd

; ============================================================
; CUSTOM PAGE: Database Credentials
; ============================================================

Function CUSTOM_PAGE_DATABASE
  ${If} $InstallMode != "0"
    Abort
  ${EndIf}

  nsDialogs::Create 1018
  Pop $Dialog
  ${If} $Dialog == error
    Abort
  ${EndIf}

  ; Title
  ${NSD_CreateLabel} 0 0 100% 20u "Configure PostgreSQL Database"
  Pop $0
  CreateFont $1 "Segoe UI" 11 700
  SendMessage $0 ${WM_SETFONT} $1 0

  ; Host
  ${NSD_CreateLabel} 0 30u 80u 12u "Host:"
  Pop $LabelHost
  ${NSD_CreateText} 85u 28u 200u 14u "localhost"
  Pop $InputHost

  ; Port
  ${NSD_CreateLabel} 0 50u 80u 12u "Port:"
  Pop $LabelPort
  ${NSD_CreateText} 85u 48u 200u 14u "5432"
  Pop $InputPort

  ; Username
  ${NSD_CreateLabel} 0 70u 80u 12u "Username:"
  Pop $LabelUser
  ${NSD_CreateText} 85u 68u 200u 14u "postgres"
  Pop $InputUser

  ; Password
  ${NSD_CreateLabel} 0 90u 80u 12u "Password:"
  Pop $LabelPass
  ${NSD_CreatePassword} 85u 88u 200u 14u ""
  Pop $InputPass

  ; Database Name
  ${NSD_CreateLabel} 0 110u 80u 12u "Database:"
  Pop $LabelName
  ${NSD_CreateText} 85u 108u 200u 14u "lib_mgmt"
  Pop $InputName

  ; --- Detection Status Banner ---
  ${If} $SystemPgFound == "1"
    ${NSD_CreateLabel} 0 132u 100% 12u "✓ PostgreSQL detected at: $SystemPgPath"
    Pop $0
    CreateFont $1 "Segoe UI" 8 700
    SendMessage $0 ${WM_SETFONT} $1 0
  ${Else}
    ${NSD_CreateLabel} 0 132u 100% 12u "⚠ No PostgreSQL found. Bundled PostgreSQL will be installed."
    Pop $0
    CreateFont $1 "Segoe UI" 8 400
    SendMessage $0 ${WM_SETFONT} $1 0
  ${EndIf}

  ${If} $SystemOllamaFound == "1"
    ${NSD_CreateLabel} 0 144u 100% 12u "✓ Ollama detected at: $SystemOllamaPath"
    Pop $0
    CreateFont $1 "Segoe UI" 8 700
    SendMessage $0 ${WM_SETFONT} $1 0
  ${Else}
    ${NSD_CreateLabel} 0 144u 100% 12u "⚠ No Ollama found. Bundled Ollama AI engine will be installed."
    Pop $0
    CreateFont $1 "Segoe UI" 8 400
    SendMessage $0 ${WM_SETFONT} $1 0
  ${EndIf}

  ; Existing config warning
  ${If} $ExistingConfigFound == "1"
    ${NSD_CreateLabel} 0 158u 100% 12u "ℹ Existing configuration found. Credentials below will be ignored (existing preserved)."
    Pop $0
    CreateFont $1 "Segoe UI" 8 400
    SendMessage $0 ${WM_SETFONT} $1 0
  ${EndIf}

  ; Footer
  ${NSD_CreateLabel} 0 172u 100% 24u "These credentials configure your local database. You can change them later in Settings > Database."
  Pop $0
  CreateFont $1 "Segoe UI" 8 400
  SendMessage $0 ${WM_SETFONT} $1 0

  nsDialogs::Show
FunctionEnd

Function CUSTOM_PAGE_DATABASE_LEAVE
  ${NSD_GetText} $InputHost $DbHost
  ${NSD_GetText} $InputPort $DbPort
  ${NSD_GetText} $InputUser $DbUser
  ${NSD_GetText} $InputPass $DbPass
  ${NSD_GetText} $InputName $DbName
FunctionEnd

; ============================================================
; HOOK: PREINSTALL — Detect system deps + show DB page
; ============================================================

!macro NSIS_HOOK_PREINSTALL
  ; --- Detect System PostgreSQL ---
  StrCpy $SystemPgFound "0"
  StrCpy $SystemPgPath ""

  ; Check 1: pg_ctl in PATH
  nsExec::ExecToStack 'where pg_ctl'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemPgFound "1"
    StrCpy $SystemPgPath "System PATH"
    DetailPrint "System PostgreSQL detected via PATH."
    Goto pg_detect_done
  ${EndIf}

  ; Check 2: PostgreSQL service running (try versions 18, 17, 16)
  nsExec::ExecToStack 'sc query postgresql-x64-18'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemPgFound "1"
    StrCpy $SystemPgPath "Service: postgresql-x64-18"
    DetailPrint "PostgreSQL 18 service detected."
    Goto pg_detect_done
  ${EndIf}

  nsExec::ExecToStack 'sc query postgresql-x64-17'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemPgFound "1"
    StrCpy $SystemPgPath "Service: postgresql-x64-17"
    DetailPrint "PostgreSQL 17 service detected."
    Goto pg_detect_done
  ${EndIf}

  nsExec::ExecToStack 'sc query postgresql-x64-16'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemPgFound "1"
    StrCpy $SystemPgPath "Service: postgresql-x64-16"
    DetailPrint "PostgreSQL 16 service detected."
    Goto pg_detect_done
  ${EndIf}

  ; Check 3: Common install paths (18 → 17 → 16)
  IfFileExists "$PROGRAMFILES\PostgreSQL\18\bin\pg_ctl.exe" 0 +4
    StrCpy $SystemPgFound "1"
    StrCpy $SystemPgPath "$PROGRAMFILES\PostgreSQL\18"
    DetailPrint "PostgreSQL 18 found at $PROGRAMFILES."
    Goto pg_detect_done

  IfFileExists "$PROGRAMFILES\PostgreSQL\17\bin\pg_ctl.exe" 0 +4
    StrCpy $SystemPgFound "1"
    StrCpy $SystemPgPath "$PROGRAMFILES\PostgreSQL\17"
    DetailPrint "PostgreSQL 17 found at $PROGRAMFILES."
    Goto pg_detect_done

  IfFileExists "$PROGRAMFILES\PostgreSQL\16\bin\pg_ctl.exe" 0 +4
    StrCpy $SystemPgFound "1"
    StrCpy $SystemPgPath "$PROGRAMFILES\PostgreSQL\16"
    DetailPrint "PostgreSQL 16 found at $PROGRAMFILES."
    Goto pg_detect_done

  pg_detect_done:

  ; --- Detect System Ollama ---
  StrCpy $SystemOllamaFound "0"
  StrCpy $SystemOllamaPath ""

  ; Check 1: ollama in PATH
  nsExec::ExecToStack 'where ollama'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemOllamaFound "1"
    StrCpy $SystemOllamaPath "System PATH"
    DetailPrint "System Ollama detected via PATH."
    Goto ollama_detect_done
  ${EndIf}

  ; Check 2: Ollama running (API check)
  nsExec::ExecToStack 'curl -s http://localhost:11434/api/version'
  Pop $0
  ${If} $0 == "0"
    StrCpy $SystemOllamaFound "1"
    StrCpy $SystemOllamaPath "API: localhost:11434"
    DetailPrint "Ollama API responding on localhost:11434."
    Goto ollama_detect_done
  ${EndIf}

  ; Check 3: Common install paths
  IfFileExists "$LOCALAPPDATA\Programs\Ollama\ollama.exe" 0 +4
    StrCpy $SystemOllamaFound "1"
    StrCpy $SystemOllamaPath "$LOCALAPPDATA\Programs\Ollama"
    DetailPrint "Ollama found at $LOCALAPPDATA."
    Goto ollama_detect_done

  IfFileExists "$PROGRAMFILES\Ollama\ollama.exe" 0 +4
    StrCpy $SystemOllamaFound "1"
    StrCpy $SystemOllamaPath "$PROGRAMFILES\Ollama"
    DetailPrint "Ollama found at $PROGRAMFILES."
    Goto ollama_detect_done

  ollama_detect_done:

  ; --- Detect existing app_config.json ---
  StrCpy $ExistingConfigFound "0"
  IfFileExists "$APPDATA\solutions.jansoft.infolib\app_config.json" 0 +2
    StrCpy $ExistingConfigFound "1"
!macroend

; ============================================================
; HOOK: POSTCOPY — Install dependencies + write config
; ============================================================

!macro NSIS_HOOK_POSTCOPY
  SetDetailsPrint textonly

  ; --- Step 1: PostgreSQL ---
  ${If} $InstallMode == "1"
    DetailPrint "Attendance Client selected. Skipping local database installation."
    Goto pg_done
  ${EndIf}

  ${If} $SystemPgFound == "1"
    DetailPrint "Using system PostgreSQL ($SystemPgPath). Skipping bundled install."
  ${Else}
    ; Check if bundled PG already extracted from a prior install
    IfFileExists "$INSTDIR\pgsql\bin\pg_ctl.exe" pg_already_extracted pg_extract

    pg_extract:
      DetailPrint "Extracting PostgreSQL Portable..."
      SetOutPath "$INSTDIR\pgsql"
      File /r "${__FILEDIR__}\..\..\deps\pgsql\*.*"

      ; Create log directory
      CreateDirectory "$INSTDIR\pgsql\log"

      ; Initialize database cluster (only if data dir doesn't exist)
      IfFileExists "$INSTDIR\pgsql\data\PG_VERSION" pg_init_skip pg_init_do

      pg_init_do:
        DetailPrint "Initializing PostgreSQL data directory..."
        nsExec::ExecToLog '"$INSTDIR\pgsql\bin\initdb.exe" -D "$INSTDIR\pgsql\data" -U $DbUser -E UTF8 --no-locale'
        Pop $0
        ${If} $0 != "0"
          DetailPrint "WARNING: initdb returned error code $0"
        ${EndIf}

      pg_init_skip:

      ; Start PostgreSQL
      DetailPrint "Starting PostgreSQL..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\pg_ctl.exe" -D "$INSTDIR\pgsql\data" -l "$INSTDIR\pgsql\log\postgresql.log" start'
      Pop $0
      ${If} $0 != "0"
        DetailPrint "WARNING: pg_ctl start returned error code $0"
      ${EndIf}

      ; Wait for PG to become ready
      DetailPrint "Waiting for PostgreSQL to start..."
      Sleep 4000

      ; Set password for the user
      DetailPrint "Setting database user password..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\psql.exe" -U $DbUser -c "ALTER USER $DbUser PASSWORD $\'$DbPass$\'"'

      ; Create database (ignore error if already exists)
      DetailPrint "Creating database: $DbName..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\createdb.exe" -U $DbUser $DbName'

      Goto pg_done

    pg_already_extracted:
      DetailPrint "Bundled PostgreSQL already present. Ensuring service is running..."
      nsExec::ExecToLog '"$INSTDIR\pgsql\bin\pg_ctl.exe" -D "$INSTDIR\pgsql\data" -l "$INSTDIR\pgsql\log\postgresql.log" start'

    pg_done:
  ${EndIf}

  ; --- Step 2: Ollama ---
  DetailPrint "Skipping bundled Ollama installation to keep installer size low."

  ; --- Step 3: Write app_config.json (preserve existing on re-install) ---
  StrCpy $ExistingConfigFound "0"
  IfFileExists "$INSTDIR\app_config.json" 0 +2
    StrCpy $ExistingConfigFound "1"

  ${If} $ExistingConfigFound == "1"
    DetailPrint "Existing app_config.json found. Preserving user configuration."
  ${Else}
    DetailPrint "Writing database configuration to $INSTDIR..."
    
    ; Resolve pg_home: system path or bundled
    ${If} $SystemPgFound == "1"
      StrCpy $R0 "$SystemPgPath"
    ${Else}
      StrCpy $R0 "$INSTDIR\pgsql"
    ${EndIf}

    ; Resolve ollama_home: system path or bundled
    ${If} $SystemOllamaFound == "1"
      StrCpy $R1 "$SystemOllamaPath"
    ${Else}
      StrCpy $R1 "$INSTDIR\ollama"
    ${EndIf}

    ; --- REGISTRY FALLBACK ---
    ; Write to HKLM so it's accessible to all users
    SetShellVarContext all
    WriteRegStr HKLM "Software\infoLib" "LicenseKey" "$LicenseKey"
    WriteRegStr HKLM "Software\infoLib" "MachineId" "$MachineId"
    WriteRegStr HKLM "Software\infoLib" "SystemMode" "$InstallMode" ; 0=admin, 1=client
    WriteRegStr HKLM "Software\infoLib" "PgHome" "$R0"
    WriteRegStr HKLM "Software\infoLib" "OllamaHome" "$R1"

    ; Grant Users group read access to the registry key
    nsExec::ExecToLog 'powershell -NoProfile -Command "$Acl = Get-Acl HKLM:\Software\infoLib; $Rule = New-Object System.Security.AccessControl.RegistryAccessRule(\"BUILTIN\Users\", \"ReadKey\", \"Allow\"); $Acl.SetAccessRule($Rule); Set-Acl HKLM:\Software\infoLib $Acl"'

    FileOpen $0 "$INSTDIR\app_config.json" w
    FileWrite $0 '{$\r$\n'
    ${If} $InstallMode == "0"
      FileWrite $0 '  "system_mode": "admin",$\r$\n'
      FileWrite $0 '  "database_url": "postgres://$DbUser:$DbPass@$DbHost:$DbPort/$DbName",$\r$\n'
    ${Else}
      FileWrite $0 '  "system_mode": "client",$\r$\n'
      FileWrite $0 '  "database_url": "",$\r$\n'
    ${EndIf}
    FileWrite $0 '  "pg_home": "$R0",$\r$\n'
    FileWrite $0 '  "ollama_home": "$R1",$\r$\n'
    FileWrite $0 '  "app_logo": null,$\r$\n'
    FileWrite $0 '  "license_key": "$LicenseKey",$\r$\n'
    FileWrite $0 '  "machine_id": "$MachineId",$\r$\n'
    FileWrite $0 '  "last_validated_at": "${__DATE__}T${__TIME__}Z"$\r$\n'
    FileWrite $0 '}$\r$\n'
    FileClose $0
    DetailPrint "Configuration saved to installation directory and registry."
  ${EndIf}

  ; --- Step 4: Specific Shortcuts ---
  ; We use the product name for the EXE, usually the name from tauri.conf.json
  ; For this project, it's infoLib.
  ${If} $InstallMode == "0"
    CreateShortcut "$DESKTOP\infoLib Admin.lnk" "$INSTDIR\infoLib.exe" "" "$INSTDIR\infoLib.exe" 0
  ${Else}
    CreateShortcut "$DESKTOP\infoLib Attendance.lnk" "$INSTDIR\infoLib.exe" "" "$INSTDIR\infoLib.exe" 0
  ${EndIf}

  ; --- Step 4: Register environment ---
  WriteRegStr HKCU "Environment" "INFOLIB_HOME" "$INSTDIR"

  ; Notify system of environment change
  SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=500

  DetailPrint "infoLib setup complete."
  SetDetailsPrint lastused
!macroend

; ============================================================
; HOOK: PREUNINSTALL — Stop services before removal
; ============================================================

!macro NSIS_HOOK_PREUNINSTALL
  ; Stop bundled PostgreSQL if present
  IfFileExists "$INSTDIR\pgsql\bin\pg_ctl.exe" 0 skip_pg_stop
    DetailPrint "Stopping bundled PostgreSQL..."
    nsExec::ExecToLog '"$INSTDIR\pgsql\bin\pg_ctl.exe" -D "$INSTDIR\pgsql\data" stop -m fast'
  skip_pg_stop:

  ; Clean registry
  DeleteRegValue HKCU "Environment" "INFOLIB_HOME"

  ; Notify system of environment change
  SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=500

  ; NOTE: app_config.json is NOT deleted — it contains user data
  DetailPrint "Services stopped. User configuration preserved at %APPDATA%."
  DetailPrint "Proceeding with uninstall."
!macroend
