# Application Hub — HTML/CSS/JavaScript Prototype

A Windows desktop prototype using **Electron + HTML + CSS + JavaScript**. It is intentionally UI-first so the Steam-inspired experience can be iterated quickly.

## Run
1. Install Node.js (LTS recommended).
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.

## Current prototype features
- Steam-inspired dark application library UI
- Home, Library, Running and Favorites views
- Search, sorting and category filtering
- Manual application / portable executable entry
- Launch bridge from renderer to Windows
- Local in-memory usage-hour examples
- Offline-first design; no account required

## Next implementation stage
Replace the demo data and placeholder scanner with a Windows service/core that discovers Start Menu shortcuts, Registry/ARP entries, Microsoft Store apps and winget packages; monitor all processes; persist usage sessions in SQLite; detect newly installed apps; add version management, metadata providers, icons, hidden apps and startup-at-login.
