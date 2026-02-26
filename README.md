# InvoiceForge — Free Invoice Generator for Freelancers

A clean, professional invoice generator built with Next.js, Tailwind CSS, and zero backend costs.

## Features

- ✏️ Create professional invoices in seconds
- 📄 Download as PDF
- 🖨️ Print-ready design
- 💾 Save drafts to localStorage (no account needed)
- 💱 12 currency options
- 📱 Fully responsive
- 🌐 Deploy free on Vercel

## Tech Stack

- **Next.js 14** — React framework
- **Tailwind CSS** — Styling
- **html2canvas + jsPDF** — PDF generation
- **localStorage** — Persistent storage (no backend)

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel (Free)

### Option 1: One-click deploy
1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Import your repo
4. Click "Deploy" — done!

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel
```

## Customization

- **Colors**: Edit `tailwind.config.js` to change the color palette
- **Currencies**: Add/remove currencies in the `CURRENCIES` array in `app/page.js`
- **Default terms**: Modify `defaultInvoice()` in `app/page.js`
- **Branding**: Change "InvoiceForge" to your brand name

## License

MIT — Use it however you want, free forever.
