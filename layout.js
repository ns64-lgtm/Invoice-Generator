import './globals.css'

export const metadata = {
  title: 'InvoiceForge — Free Invoice Generator for Freelancers',
  description: 'Create professional invoices in seconds. Free forever, no signup required.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
