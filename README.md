# Open Source Investing

Value investments. Open source.

A five-position model portfolio beginning at the November 10, 2026 market opening. COST 25%, SCHW 15%, GOOGL 35%, GEV 8.75%, VOO 8.75%, and 7.5% cash. Includes market-value mosaic, dollar and percentage gains/losses, investment journal, and holding timeline.

## Website

[Open the hosted portfolio](https://folio-journal-nov10.emeraldtune2.chatgpt.site) (ChatGPT sign-in required).

## Get the code

```sh
git clone https://github.com/nicholasmajcher13-hue/open-source-investing.git
cd open-source-investing
```

## Develop

Requires Node.js 22 or later. Run `npm run dev` and open localhost:3000. No dependency installation is needed. `npm run build` produces dist/server/index.js; `npm run validate` checks the Worker export. The build recreates the generated worker/index.js.

## Hosting

GitHub stores this source code. GitHub Pages alone cannot run the server-side quote API. Keep the existing hosted website, or deploy the built server to compatible Cloudflare Worker hosting. The .openai/hosting.json file contains a placeholder to avoid binding copies to the original site. Replace it with your own Site ID if deploying through Sites.

## Data and limitations

Yahoo Finance's unofficial public quote endpoint is checked every 60 seconds while the page is visible. Quotes may be delayed or unavailable. Saved snapshots are explicitly labeled. Opening prices and fractional model shares remain fixed. Today uses opening purchase prices on the inception date and previous closes thereafter. Since purchase uses the original opening prices. Returns exclude dividends, fees, taxes, and cash interest; corporate actions require review. Notes are browser-local, with published default investment reasoning. This is a model portfolio, not a trading account.

Holding targets: COST January 2027; SCHW October 2027; GOOGL September 2028; GEV April 2027; VOO January 2027.

No license has been selected yet. Choose a license before offering reuse rights to others.
