# ShiftTip — Product Requirements Document

**Product Name:** ShiftTip  
**Tagline:** *"Boost Your Earnings, Accept Donations in Any Crypto, On Any Chain."*

Your viewers can donate in any cryptocurrency on any blockchain, and you get paid in your preferred token instantly. Live alerts, TTS notifications, and seamless crypto support make engaging your audience effortless.

**Category:** Crypto / Live Streaming / Donations / Web3

---

## 1. Problem Statement

Streamers rely on donations for income, but crypto donations are fragmented:

- Fans hold many different tokens across multiple chains
- Streamers currently have to ask for specific tokens (ETH only, SOL only, etc.)
- Onboarding fans is hard: they often must convert crypto themselves before donating
- Current donation tools (Twitch, YouTube Superchat) don't support **multi-chain, multi-token crypto donations**

**Impact:** Limits fan participation, lowers donation volume, increases friction, and prevents crypto adoption.

---

## 2. Solution

**ShiftTip** enables:

1. Fans to donate in **any crypto token**
2. Automatic conversion into a **stable, preferred token** (e.g., USDC) for the streamer
3. **Instant live interaction**: donations trigger **on-screen overlays or TTS messages**, enhancing engagement

**Key benefits:**

- Streamers get predictable payouts
- Fans can donate with *whatever crypto they already own*
- Zero friction onboarding for new crypto users
- Fun, hype-driven live experience for viewers

---

## 3. Core Features

| Feature | Description | Hackathon MVP | Post-MVP / Expansion |
|---------|-------------|---------------|---------------------|
| Multi-token donations | Accept any token, on any chain | SideShift API swap on-demand | Support bulk / batch swaps |
| Auto-convert to USDC | Ensure stable payout | SideShift API handles conversion | Option for streamers to choose payout token |
| Donation UI / QR generator | Simple web interface | React + QR code | OBS plugin, direct browser source |
| Overlay / TTS | Visual & audio confirmation | In-browser popup + speechSynthesis | Full OBS integration, voice options, animations |
| Donation tracking | Track incoming donations | Backend DB (SQLite / Redis) | Analytics dashboard, top donors, historical data |
| Anti-fraud / limits | Prevent spam / mistakes | Manual max donation check | AI moderation, tipping limits, multi-chain alerts |

---

## 4. User Flows

### 4.1 Viewer Flow

1. Viewer sees Donation Page URL / "Donate any crypto" button
2. Selects token + amount + name (optional)
3. Optionally enters a short message
4. Viewer tests overlay to preview, proceeds to click send ShiftTip
5. SideShift executes swap with streamer's preferred token, donation sent
6. Viewer sees confirmation: donation processed, overlay triggered live

### 4.2 Streamer Flow

1. Logs into ShiftTip dashboard (or browser overlay)
2. Chooses **preferred payout token**
3. Overlay displays incoming donations with TTS
4. Optional: streamer sees mini-dashboard for donation history

---

## 5. Architecture / Tech Stack

- **Frontend:** Next.js (React), QR generator (`qrcode.react`), overlay UI
- **Backend:** Node.js / Next.js API routes → call SideShift API, track donation status
- **Database:** SQLite / Redis / Firestore (track donation metadata)
- **TTS / Overlay:**
  - Browser: `speechSynthesis` for demo
  - Future: OBS plugin with browser source URL
- **SideShift API:**
  - `createVariableShift` → generate deposit address + swap execution
  - `getShift` → confirm completion and update UI

---

## 6. MVP Scope for Hackathon

- Accept any crypto → swap → payout in preferred token
- Simple web interface with dedicated donation page, and QR optionally
- Donation popup + TTS in browser for live demo
- Backend tracks donation status + basic logging

---

## 7. Success Metrics

- **Demo-ready**: Fans can send crypto and see streamer receive donations instantly
- **Engagement:** Overlay/TTS triggers on each donation
- **Stability:** Successful swap confirmations via SideShift API
- **Ease of use:** < 3 clicks for viewer to donate

---

## 8. Future Enhancements

- OBS / streaming software integration
- Recurring donations / subscription-like donations using contracts
- Analytics dashboard: top donors, donation history, token breakdown
- Multi-token payout options for streamers
- Donation badges, NFT rewards for fans

---

## 9. Wavehack Demo Flow

1. Streamer shares donation page URL in browser
2. Viewer selects token + amount + name (opt) + TTS message (opt)
3. SideShift executes swap → confirms deposit to streamer wallet
4. Popup shows: "ShiftTip from Alex: 5 DOGE or USD equivalent – Love your stream!"
5. TTS plays the message instantly