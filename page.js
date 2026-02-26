'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
]

function generateInvoiceNumber() {
  const date = new Date()
  const y = date.getFullYear().toString().slice(2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const r = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `INV-${y}${m}-${r}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function dueDateStr() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

const emptyLineItem = () => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  rate: 0,
})

const defaultInvoice = () => ({
  invoiceNumber: generateInvoiceNumber(),
  issueDate: todayStr(),
  dueDate: dueDateStr(),
  currency: 'USD',
  from: { name: '', email: '', address: '', phone: '' },
  to: { name: '', email: '', address: '', phone: '' },
  items: [emptyLineItem()],
  taxRate: 0,
  discount: 0,
  notes: '',
  paymentTerms: 'Payment is due within 30 days of the invoice date.',
})

// ─── Small UI Components ────────────────────────────────

function Label({ children }) {
  return <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-1.5">{children}</label>
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 bg-white border border-line rounded-lg text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all ${className}`}
      {...props}
    />
  )
}

function TextArea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 bg-white border border-line rounded-lg text-sm text-ink placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none ${className}`}
      {...props}
    />
  )
}

// ─── Main App ───────────────────────────────────────────

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState(null)
  const [activeTab, setActiveTab] = useState('edit')
  const [saving, setSaving] = useState(false)
  const [savedInvoices, setSavedInvoices] = useState([])
  const [showSaved, setShowSaved] = useState(false)
  const printRef = useRef(null)

  // Initialize on client only
  useEffect(() => {
    setInvoice(defaultInvoice())
    const saved = localStorage.getItem('invoiceforge_invoices')
    if (saved) setSavedInvoices(JSON.parse(saved))
  }, [])

  const updateField = useCallback((path, value) => {
    setInvoice(prev => {
      const copy = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return copy
    })
  }, [])

  const updateItem = useCallback((id, field, value) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }, [])

  const addItem = useCallback(() => {
    setInvoice(prev => ({ ...prev, items: [...prev.items, emptyLineItem()] }))
  }, [])

  const removeItem = useCallback((id) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter(i => i.id !== id) : prev.items,
    }))
  }, [])

  const saveInvoice = useCallback(() => {
    setSaving(true)
    const updated = [...savedInvoices.filter(i => i.invoiceNumber !== invoice.invoiceNumber), invoice]
    setSavedInvoices(updated)
    localStorage.setItem('invoiceforge_invoices', JSON.stringify(updated))
    setTimeout(() => setSaving(false), 800)
  }, [invoice, savedInvoices])

  const loadInvoice = useCallback((inv) => {
    setInvoice(inv)
    setShowSaved(false)
  }, [])

  const deleteInvoice = useCallback((num) => {
    const updated = savedInvoices.filter(i => i.invoiceNumber !== num)
    setSavedInvoices(updated)
    localStorage.setItem('invoiceforge_invoices', JSON.stringify(updated))
  }, [savedInvoices])

  const newInvoice = useCallback(() => {
    setInvoice(defaultInvoice())
  }, [])

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const handleDownloadPDF = useCallback(async () => {
    const el = printRef.current
    if (!el) return
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfW = pdf.internal.pageSize.getWidth()
    const pdfH = (canvas.height * pdfW) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH)
    pdf.save(`${invoice.invoiceNumber}.pdf`)
  }, [invoice?.invoiceNumber])

  if (!invoice) return null

  const curr = CURRENCIES.find(c => c.code === invoice.currency) || CURRENCIES[0]
  const fmt = (n) => `${curr.symbol}${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const subtotal = invoice.items.reduce((s, i) => s + (i.quantity * i.rate), 0)
  const discountAmt = (invoice.discount / 100) * subtotal
  const taxableAmt = subtotal - discountAmt
  const taxAmt = (invoice.taxRate / 100) * taxableAmt
  const total = taxableAmt + taxAmt

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8 no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h1 className="font-display text-2xl text-ink tracking-tight">InvoiceForge</h1>
              <p className="text-xs text-muted">Free invoice generator for freelancers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSaved(!showSaved)}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-ink border border-line rounded-lg hover:bg-white transition-all">
              Saved ({savedInvoices.length})
            </button>
            <button onClick={newInvoice}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-ink border border-line rounded-lg hover:bg-white transition-all">
              + New
            </button>
          </div>
        </div>

        {/* Saved invoices dropdown */}
        {showSaved && savedInvoices.length > 0 && (
          <div className="mt-3 bg-white border border-line rounded-xl p-3 shadow-lg fade-in">
            {savedInvoices.map(inv => (
              <div key={inv.invoiceNumber} className="flex items-center justify-between py-2 px-3 hover:bg-surface rounded-lg group">
                <button onClick={() => loadInvoice(inv)} className="flex-1 text-left">
                  <span className="text-sm font-medium font-mono text-ink">{inv.invoiceNumber}</span>
                  <span className="text-xs text-muted ml-3">{inv.to.name || 'No client'}</span>
                </button>
                <button onClick={() => deleteInvoice(inv.invoiceNumber)}
                  className="text-xs text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ml-2">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Edit / Preview tabs */}
        <div className="mt-6 flex gap-1 bg-surface rounded-xl p-1 w-fit">
          {['edit', 'preview'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ─── EDIT MODE ──────────────────────────────────── */}
      {activeTab === 'edit' && (
        <main className="max-w-5xl mx-auto space-y-6 no-print slide-up">

          {/* Invoice meta */}
          <section className="bg-white rounded-2xl border border-line p-6 shadow-sm">
            <h2 className="font-display text-lg mb-4">Invoice Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <Input value={invoice.invoiceNumber} onChange={e => updateField('invoiceNumber', e.target.value)} />
              </div>
              <div>
                <Label>Issue Date</Label>
                <Input type="date" value={invoice.issueDate} onChange={e => updateField('issueDate', e.target.value)} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={invoice.dueDate} onChange={e => updateField('dueDate', e.target.value)} />
              </div>
              <div>
                <Label>Currency</Label>
                <select
                  value={invoice.currency}
                  onChange={e => updateField('currency', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-line rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* From / To */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[['from', 'From (Your Details)'], ['to', 'Bill To (Client)']].map(([key, title]) => (
              <section key={key} className="bg-white rounded-2xl border border-line p-6 shadow-sm">
                <h2 className="font-display text-lg mb-4">{title}</h2>
                <div className="space-y-3">
                  <div><Label>Name / Business</Label><Input placeholder="John Doe / Acme Inc." value={invoice[key].name} onChange={e => updateField(`${key}.name`, e.target.value)} /></div>
                  <div><Label>Email</Label><Input type="email" placeholder="hello@example.com" value={invoice[key].email} onChange={e => updateField(`${key}.email`, e.target.value)} /></div>
                  <div><Label>Address</Label><TextArea rows={2} placeholder="123 Main St, City, Country" value={invoice[key].address} onChange={e => updateField(`${key}.address`, e.target.value)} /></div>
                  <div><Label>Phone</Label><Input placeholder="+1 234 567 890" value={invoice[key].phone} onChange={e => updateField(`${key}.phone`, e.target.value)} /></div>
                </div>
              </section>
            ))}
          </div>

          {/* Line Items */}
          <section className="bg-white rounded-2xl border border-line p-6 shadow-sm">
            <h2 className="font-display text-lg mb-4">Line Items</h2>
            <div className="space-y-3">
              {/* Header */}
              <div className="hidden sm:grid grid-cols-12 gap-3 px-1">
                <div className="col-span-5"><Label>Description</Label></div>
                <div className="col-span-2"><Label>Quantity</Label></div>
                <div className="col-span-2"><Label>Rate</Label></div>
                <div className="col-span-2"><Label>Amount</Label></div>
                <div className="col-span-1"></div>
              </div>

              {invoice.items.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-start fade-in">
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      placeholder="Web design, consulting, etc."
                      value={item.description}
                      onChange={e => updateItem(item.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      value={item.quantity || ''}
                      onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={item.rate || ''}
                      onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2 flex items-center h-[42px]">
                    <span className="font-mono text-sm font-medium text-ink">{fmt(item.quantity * item.rate)}</span>
                  </div>
                  <div className="col-span-1 flex items-center h-[42px]">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted hover:text-red-500 transition-colors p-1"
                      title="Remove item"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              ))}

              <button onClick={addItem}
                className="mt-2 px-4 py-2 text-sm font-medium text-accent hover:text-white border border-accent/30 hover:bg-accent rounded-lg transition-all">
                + Add Item
              </button>
            </div>
          </section>

          {/* Tax, Discount, Notes */}
          <div className="grid sm:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-line p-6 shadow-sm">
              <h2 className="font-display text-lg mb-4">Notes & Terms</h2>
              <div className="space-y-3">
                <div><Label>Notes</Label><TextArea rows={3} placeholder="Thank you for your business!" value={invoice.notes} onChange={e => updateField('notes', e.target.value)} /></div>
                <div><Label>Payment Terms</Label><TextArea rows={2} value={invoice.paymentTerms} onChange={e => updateField('paymentTerms', e.target.value)} /></div>
              </div>
            </section>
            <section className="bg-white rounded-2xl border border-line p-6 shadow-sm">
              <h2 className="font-display text-lg mb-4">Adjustments</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" min="0" max="100" step="any" className="w-28 text-right" value={invoice.taxRate || ''} onChange={e => updateField('taxRate', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Discount (%)</Label>
                  <Input type="number" min="0" max="100" step="any" className="w-28 text-right" value={invoice.discount || ''} onChange={e => updateField('discount', parseFloat(e.target.value) || 0)} />
                </div>
                <hr className="border-line" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted"><span>Subtotal</span><span className="font-mono">{fmt(subtotal)}</span></div>
                  {invoice.discount > 0 && <div className="flex justify-between text-muted"><span>Discount ({invoice.discount}%)</span><span className="font-mono">-{fmt(discountAmt)}</span></div>}
                  {invoice.taxRate > 0 && <div className="flex justify-between text-muted"><span>Tax ({invoice.taxRate}%)</span><span className="font-mono">{fmt(taxAmt)}</span></div>}
                  <div className="flex justify-between text-ink font-semibold text-lg pt-2 border-t border-line">
                    <span>Total</span>
                    <span className="font-mono text-accent">{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-end pb-10">
            <button onClick={saveInvoice}
              className="px-6 py-2.5 text-sm font-medium border border-line rounded-xl hover:bg-white transition-all">
              {saving ? '✓ Saved!' : 'Save Draft'}
            </button>
            <button onClick={() => setActiveTab('preview')}
              className="px-6 py-2.5 text-sm font-medium border border-line rounded-xl hover:bg-white transition-all">
              Preview
            </button>
            <button onClick={handleDownloadPDF}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl shadow-lg shadow-accent/20 transition-all">
              Download PDF
            </button>
          </div>
        </main>
      )}

      {/* ─── PREVIEW MODE ─────────────────────────────────── */}
      {activeTab === 'preview' && (
        <div className="max-w-4xl mx-auto pb-10">
          {/* Preview controls */}
          <div className="flex gap-3 justify-end mb-4 no-print">
            <button onClick={handlePrint}
              className="px-5 py-2.5 text-sm font-medium border border-line rounded-xl hover:bg-white transition-all">
              Print
            </button>
            <button onClick={handleDownloadPDF}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-accent hover:bg-accent/90 rounded-xl shadow-lg shadow-accent/20 transition-all">
              Download PDF
            </button>
          </div>

          {/* The printable invoice */}
          <div ref={printRef} className="invoice-paper bg-white rounded-2xl shadow-xl border border-line/50 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-accent via-orange-400 to-amber-400" />

            <div className="p-8 sm:p-12">
              {/* Header row */}
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="font-display text-3xl text-ink tracking-tight">INVOICE</h2>
                  <p className="font-mono text-sm text-accent mt-1">{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right text-sm text-muted space-y-1">
                  <p><span className="text-xs uppercase tracking-wider">Issued:</span> {formatDate(invoice.issueDate)}</p>
                  <p><span className="text-xs uppercase tracking-wider">Due:</span> {formatDate(invoice.dueDate)}</p>
                </div>
              </div>

              {/* From / To */}
              <div className="grid sm:grid-cols-2 gap-8 mb-10 pb-8 border-b border-line">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted mb-2">From</p>
                  <p className="font-semibold text-ink">{invoice.from.name || '—'}</p>
                  {invoice.from.email && <p className="text-sm text-muted">{invoice.from.email}</p>}
                  {invoice.from.address && <p className="text-sm text-muted whitespace-pre-line">{invoice.from.address}</p>}
                  {invoice.from.phone && <p className="text-sm text-muted">{invoice.from.phone}</p>}
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Bill To</p>
                  <p className="font-semibold text-ink">{invoice.to.name || '—'}</p>
                  {invoice.to.email && <p className="text-sm text-muted">{invoice.to.email}</p>}
                  {invoice.to.address && <p className="text-sm text-muted whitespace-pre-line">{invoice.to.address}</p>}
                  {invoice.to.phone && <p className="text-sm text-muted">{invoice.to.phone}</p>}
                </div>
              </div>

              {/* Line items table */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-ink">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-ink py-3 pr-4">Description</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider text-ink py-3 px-4 w-20">Qty</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider text-ink py-3 px-4 w-28">Rate</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider text-ink py-3 pl-4 w-32">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-line">
                      <td className="py-3 pr-4 text-sm text-ink">{item.description || '—'}</td>
                      <td className="py-3 px-4 text-sm text-muted text-right font-mono">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-muted text-right font-mono">{fmt(item.rate)}</td>
                      <td className="py-3 pl-4 text-sm text-ink text-right font-mono font-medium">{fmt(item.quantity * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end mb-10">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span className="font-mono">{fmt(subtotal)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-sm text-muted">
                      <span>Discount ({invoice.discount}%)</span>
                      <span className="font-mono">-{fmt(discountAmt)}</span>
                    </div>
                  )}
                  {invoice.taxRate > 0 && (
                    <div className="flex justify-between text-sm text-muted">
                      <span>Tax ({invoice.taxRate}%)</span>
                      <span className="font-mono">{fmt(taxAmt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-ink">
                    <span className="text-lg font-semibold text-ink">Total Due</span>
                    <span className="text-lg font-bold font-mono text-accent">{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Terms */}
              {(invoice.notes || invoice.paymentTerms) && (
                <div className="pt-8 border-t border-line space-y-4">
                  {invoice.notes && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Notes</p>
                      <p className="text-sm text-muted whitespace-pre-line">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.paymentTerms && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted mb-1">Payment Terms</p>
                      <p className="text-sm text-muted whitespace-pre-line">{invoice.paymentTerms}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 sm:px-12 py-4 bg-surface/50 text-center">
              <p className="text-xs text-muted">Generated with InvoiceForge — Free Invoice Generator for Freelancers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
