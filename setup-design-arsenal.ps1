# Self-Healing Master Installer for Noble Antigravity Design Arsenal
# Target: Windows Powershell (Run as Administrator or User-level Task)

$ErrorActionPreference = "Stop"

# Define Paths
$ProjectRoot = "C:\Users\kinge\StudentMarketplace\student-hub"
$UserHome = [System.Environment]::GetFolderPath("UserProfile")
$CursorSkillsDir = "$UserHome\.cursor\skills"
$ClaudeConfigDir = "$env:APPDATA\Claude"
$ClaudeConfigFile = "$ClaudeConfigDir\claude_desktop_config.json"
$SelfPath = $MyInvocation.MyCommand.Path

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  NOBLE ANTIGRAVITY DESIGN ARSENAL SELF-HEALING BUILDER  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

# 1. Ensure Project Design Guidelines Persist
function Ensure-ProjectFiles {
    Write-Host "[*] Checking project-level design guidelines..." -ForegroundColor Cyan
    
    $DesignMDPath = "$ProjectRoot\DESIGN.md"
    $ClaudeMDPath = "$ProjectRoot\CLAUDE.md"
    $CursorRulesPath = "$ProjectRoot\.cursorrules"

    # Restore DESIGN.md if missing
    if (-not (Test-Path $DesignMDPath)) {
        Write-Host "[!] DESIGN.md missing! Restoring..." -ForegroundColor Yellow
        $DesignContent = @"
# DESIGN.md — LaHustle Brand Guidelines

This document establishes the official visual rules and design tokens for the **LaHustle** marketplace platform.

## 🎨 Design Tokens

### Color Palette (Forest Emerald & Electric Green)
- Background (Light): Solid White (#ffffff)
- Background (Dark): Pitch Black (#050505)
- Surface (Dark): Navy Grey (#0d1117)
- Primary Accent (Light): Forest Emerald (#059669 / #10B981)
- Primary Accent (Dark): Electric Lime Green (#39FF14)
- Brand Glow: rgba(57, 255, 20, 0.35)
- Brand Gradient: linear-gradient(135deg, #000000 0%, #1a3a00 50%, #39FF14 100%)
"@
        Set-Content -Path $DesignMDPath -Value $DesignContent
    }

    # Restore CLAUDE.md if missing or does not contain aesthetics tag
    if (-not (Test-Path $ClaudeMDPath) -or -not (Select-String -Path $ClaudeMDPath -Pattern "<frontend_aesthetics>")) {
        Write-Host "[!] CLAUDE.md missing or incomplete! Restoring..." -ForegroundColor Yellow
        $ClaudeContent = @"
# CLAUDE.md — Workspace Design & Styling Instructions

## 🎨 Front-End Aesthetics Instructions

<frontend_aesthetics>
Avoid generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic.
Make creative, distinctive frontends that surprise and delight the user. Focus on:

- Typography: Choose Outfit / Syne / Plus Jakarta Sans.
- Color & Theme: LaHustle theme. Pitch Black (#050505) and Navy Grey (#0d1117) with Forest Emerald (#059669) and Electric Lime Green (#39FF14) accents.
- Motion: CSS animations, GSAP or Framer Motion transitions.
- Layout: Asymmetry, overlapping cards, distinctive design.
- Design Rules: Refer to DESIGN.md for exact colors, fonts, margins, and animation specs.
</frontend_aesthetics>
"@
        Set-Content -Path $ClaudeMDPath -Value $ClaudeContent
    }

    # Restore .cursorrules
    if (-not (Test-Path $CursorRulesPath) -or -not (Select-String -Path $CursorRulesPath -Pattern "<frontend_aesthetics>")) {
        Write-Host "[!] .cursorrules missing or incomplete! Restoring..." -ForegroundColor Yellow
        $CursorContent = @"
# Cursor Rules for Design & Code Quality

<frontend_aesthetics>
Avoid generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic.
Make creative, distinctive frontends that surprise and delight the user. Focus on:
- Typography: Outfit / Syne / Plus Jakarta Sans.
- Color & Theme: LaHustle theme. Pitch Black (#050505) and Navy Grey (#0d1117) with Forest Emerald (#059669) and Electric Lime Green (#39FF14) accents.
- Motion: CSS animations, GSAP or Framer Motion transitions.
- Layout: Asymmetry, overlapping cards, distinctive design.
- Design Rules: Refer to DESIGN.md for exact colors, fonts, margins, and animation specs.
</frontend_aesthetics>
"@
        Set-Content -Path $CursorRulesPath -Value $CursorContent
    }
    Write-Host "[+] Project design guidelines validated and active." -ForegroundColor Green
}

# 2. Clone Design Repos & Install Skills
function Install-DesignSkills {
    Write-Host "[*] Checking and installing AI Agent design skills..." -ForegroundColor Cyan

    # Ensure .cursor/skills folder exists
    if (-not (Test-Path $CursorSkillsDir)) {
        New-Item -ItemType Directory -Force -Path $CursorSkillsDir | Out-Null
    }

    # Clone ui-design-brain
    $TargetBrainRepo = "$CursorSkillsDir\ui-design-brain"
    if (-not (Test-Path $TargetBrainRepo)) {
        Write-Host "[!] Cloning ui-design-brain into user profile..." -ForegroundColor Yellow
        try {
            git clone --depth=1 https://github.com/carmahhawwari/ui-design-brain.git $TargetBrainRepo
        } catch {
            Write-Host "[-] Git clone failed. Ensure git is installed and online." -ForegroundColor Red
        }
    } else {
        Write-Host "[+] ui-design-brain skill folder exists." -ForegroundColor Green
    }
}

# 3. Configure/Check MCP Settings
function Check-MCPServers {
    Write-Host "[*] Validating MCP configuration..." -ForegroundColor Cyan
    
    # Ensure Claude Config folder exists
    if (-not (Test-Path $ClaudeConfigDir)) {
        New-Item -ItemType Directory -Force -Path $ClaudeConfigDir | Out-Null
    }

    # Setup baseline configuration
    $DefaultConfig = @{
        mcpServers = @{
            "figma-framelink" = @{
                command = "npx"
                args = @("-y", "figma-developer-mcp", "--figma-api-key=YOUR_FIGMA_API_KEY")
            }
            "meigen-ai-design" = @{
                command = "npx"
                args = @("-y", "meigen-ai-design-mcp")
            }
        }
    }

    if (-not (Test-Path $ClaudeConfigFile)) {
        Write-Host "[!] Claude desktop config missing. Creating clean config..." -ForegroundColor Yellow
        $DefaultConfig | ConvertTo-Json -Depth 5 | Set-Content -Path $ClaudeConfigFile
    } else {
        # Config exists, make sure figma server is configured
        $CurrentConfigJson = Get-Content -Path $ClaudeConfigFile -Raw | ConvertFrom-Json
        if (-not $CurrentConfigJson.mcpServers) {
            $CurrentConfigJson | Add-Member -MemberType NoteProperty -Name mcpServers -Value $DefaultConfig.mcpServers -Force
            $CurrentConfigJson | ConvertTo-Json -Depth 5 | Set-Content -Path $ClaudeConfigFile
            Write-Host "[+] Config updated with baseline design MCP servers." -ForegroundColor Green
        } else {
            Write-Host "[+] MCP settings are already configured." -ForegroundColor Green
        }
    }
}

# 4. Windows Background Self-Healing (User Startup Shortcut)
function Enable-SelfHealing {
    Write-Host "[*] Configuring Windows Startup folder background self-healing..." -ForegroundColor Cyan

    $StartupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
    $ShortcutPath = "$StartupFolder\NobleDesignArsenalSelfHealer.lnk"
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
        $Shortcut.TargetPath = "powershell.exe"
        $Shortcut.Arguments = "-NoProfile -WindowStyle Hidden -File `"$SelfPath`""
        $Shortcut.WindowStyle = 7 # Minimized/Hidden
        $Shortcut.Save()
        Write-Host "[+] Background self-healing shortcut successfully created in Startup folder." -ForegroundColor Green
    } catch {
        Write-Host "[-] Failed to write Startup folder shortcut: $_" -ForegroundColor Red
    }
}

# Run tasks
Ensure-ProjectFiles
Install-DesignSkills
Check-MCPServers
Enable-SelfHealing

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE! Environment is active and self-healing.  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
