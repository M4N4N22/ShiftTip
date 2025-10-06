# ShiftTip

**Boost Your Earnings, Accept Donations in Any Crypto, On Any Chain.**

ShiftTip enables streamers to accept cryptocurrency donations in any token, on any blockchain, while automatically receiving payouts in their preferred stable token. Built for the SideShift Wavehack, ShiftTip eliminates the friction of multi-chain crypto donations with live alerts, TTS notifications, and seamless SideShift API integration.

---

## Features

- **Multi-Chain Donations**: Accept any cryptocurrency from any blockchain
- **Automatic Conversion**: Donors send any token, you receive your preferred token (USDC, ETH, etc.)
- **Live Overlay Alerts**: Real-time donation notifications with customizable overlays
- **Text-to-Speech**: Hear donation messages read aloud during streams
- **QR Code Generation**: Easy donation links and QR codes for viewers
- **Donation Tracking**: View recent donations and track earnings
- **Zero Friction**: Donors use whatever crypto they already own

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API Integration**: SideShift API for cross-chain swaps
- **TTS**: Browser speechSynthesis API

---

## Project Structure

```
app/
├── (main)/
│   ├── dashboard/
│   │   └── page.tsx          # Streamer dashboard
│   ├── donate/
│   │   └── page.tsx          # Public donation page
│   └── layout.tsx
├── favicon.ico
├── globals.css
├── layout.tsx
└── page.tsx                  # Landing page

components/
├── dashboard/
│   ├── DonationLinks.tsx     # Shareable donation links
│   ├── RecentDonations.tsx   # Recent donations list
│   ├── SettingsForm.tsx      # Streamer settings
│   ├── SetupForm.tsx         # Initial setup
│   └── StatsCards.tsx        # Donation statistics
├── donate/
│   ├── AmountMessageInput.tsx # Donation amount & message
│   ├── DonateHeader.tsx      # Donation page header
│   ├── DonationForm.tsx      # Main donation form
│   ├── DonationResult.tsx    # Donation confirmation
│   ├── TokenSelector.tsx     # Token selection dropdown
│   ├── useSideShift.ts       # SideShift API hook
│   └── WalletInfo.tsx        # Wallet display
├── overlay/
│   └── index.tsx             # Stream overlay component
├── LandingPage.tsx           # Landing page component
└── Navigation.tsx            # Navigation component

lib/
├── fetchSideShiftTokens.ts   # Fetch available tokens
├── fetchTokenBalance.ts      # Get token balance
├── fetchWalletBalances.ts    # Get wallet balances
└── utils.ts                  # Utility functions
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A crypto wallet address for receiving donations

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shifttip.git
cd shifttip
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

1. Navigate to the dashboard at `/dashboard`
2. Complete the setup form with your:
   - Wallet address
   - Preferred payout token
   - Stream settings
3. Share your donation page URL with viewers

---

## Usage

### For Streamers

1. **Setup**: Configure your wallet and preferred payout token in the dashboard
2. **Share**: Send your donation page link to viewers
3. **Stream**: Display the overlay URL in your streaming software (OBS, Streamlabs, etc.)
4. **Receive**: Get donations automatically converted to your preferred token

### For Viewers

1. Visit the streamer's donation page
2. Select any cryptocurrency you own
3. Enter the amount and optional message
4. Send the donation
5. See your donation appear live on stream

---

## How It Works

1. **Viewer initiates donation**: Selects token, amount, and message
2. **SideShift API integration**: Creates a variable shift for token conversion
3. **Deposit address generation**: Viewer receives a deposit address
4. **Token swap**: SideShift automatically swaps to streamer's preferred token
5. **Live notification**: Overlay displays donation with TTS message
6. **Confirmation**: Both viewer and streamer see confirmation

---

## API Integration

ShiftTip uses the SideShift API for cross-chain token swaps:

- **createVariableShift**: Generates deposit address and swap parameters
- **getShift**: Checks swap status and confirms completion

No API key required for basic usage.

---

## Roadmap

- [ ] OBS plugin for native overlay integration
- [ ] Recurring donation subscriptions
- [ ] Advanced analytics dashboard
- [ ] Multi-token payout options
- [ ] Donation badges and NFT rewards
- [ ] Mobile app for streamers
- [ ] Donation goal tracking
- [ ] Custom overlay themes

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Acknowledgments

- Built for the SideShift Wavehack 
- Powered by [SideShift.ai](https://sideshift.ai) for cross-chain swaps
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.

---

Built with passion for the crypto streaming community.
