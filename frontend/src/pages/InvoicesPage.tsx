import React, { useState } from 'react';
import { FileText, Printer, CreditCard, X } from 'lucide-react';
import { useInvoices, useUpdatePayment, useAddInvoiceItem } from '@/hooks/useInvoices';
import { formatDate, formatCurrency, cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Invoice, PaymentStatus } from '@/types';

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState({ description: '', quantity: 1, unitPrice: 0 });

  const filters: Record<string, string> = {};
  if (statusFilter) filters.paymentStatus = statusFilter;
  const { data: invoices, isLoading } = useInvoices(Object.keys(filters).length > 0 ? filters : undefined);
  const updatePayment = useUpdatePayment();
  const addItem = useAddInvoiceItem();

  const handleMarkPaid = async (invoice: Invoice) => {
    if (!confirm('Mark this invoice as paid?')) return;
    try { await updatePayment.mutateAsync({ id: invoice.id, paymentStatus: 'PAID' as PaymentStatus, paymentMethod: invoice.paymentMethod }); } catch (err: any) { alert(err.response?.data?.error || 'Failed to update payment'); }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try { await addItem.mutateAsync({ id: selectedInvoice.id, ...itemForm }); setShowAddItem(false); setItemForm({ description: '', quantity: 1, unitPrice: 0 }); } catch (err: any) { alert(err.response?.data?.error || 'Failed to add item'); }
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ─── Toolbar ──────────────────────────────────────── */}
      <div className="page-toolbar">
        <div className="page-toolbar-left">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="page-select">
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending</option><option value="PAID">Paid</option><option value="PARTIAL">Partial</option><option value="REFUNDED">Refunded</option>
          </select>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className="btn-ghost"><X className="w-3.5 h-3.5" /> Clear</button>
          )}
          {invoices && <span className="page-count">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* ─── Invoice Table ─────────────────────────────────── */}
      <div className="page-table-wrap no-print">
        <div className="page-table-scroll">
          <table className="page-table">
            <thead>
              <tr>
                <th className="page-th">Invoice</th>
                <th className="page-th">Guest</th>
                <th className="page-th hidden md:table-cell">Room</th>
                <th className="page-th hidden lg:table-cell">Date</th>
                <th className="page-th">Total</th>
                <th className="page-th">Status</th>
                <th className="page-th page-th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, i) => <tr key={i} className="page-tr"><td colSpan={7} className="page-td"><div className="h-8 bg-gray-50 rounded animate-pulse-soft" /></td></tr>)
              ) : invoices?.length === 0 ? (
                <tr><td colSpan={7} className="page-table-empty">No invoices found</td></tr>
              ) : (
                invoices?.map((invoice) => (
                  <tr key={invoice.id} className="page-tr" style={{ cursor: 'pointer' }} onClick={() => setSelectedInvoice(invoice)}>
                    <td className="page-td" style={{ fontWeight: 600 }}>{invoice.invoiceNumber}</td>
                    <td className="page-td">{invoice.reservation?.guest?.name}</td>
                    <td className="page-td page-td-muted hidden md:table-cell">{invoice.reservation?.room?.roomNumber}</td>
                    <td className="page-td page-td-muted hidden lg:table-cell">{formatDate(invoice.createdAt)}</td>
                    <td className="page-td" style={{ fontWeight: 600, color: 'var(--color-hotel-gold)' }}>{formatCurrency(Number(invoice.totalAmount))}</td>
                    <td className="page-td"><span className={cn('page-badge', getStatusColor(invoice.paymentStatus))}>{getStatusLabel(invoice.paymentStatus)}</span></td>
                    <td className="page-td page-td-right">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        {invoice.paymentStatus === 'PENDING' && (
                          <button onClick={(e) => { e.stopPropagation(); handleMarkPaid(invoice); }} title="Mark as Paid" className="btn-icon success"><CreditCard className="w-4 h-4" /></button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedInvoice(invoice); }} title="View" className="btn-icon"><FileText className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {invoices && invoices.length > 0 && (
          <div className="page-table-footer">Showing {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</div>
        )}
      </div>

      {/* ─── Invoice Detail Modal ──────────────────────────── */}
      {selectedInvoice && (
        <div className="modal-overlay no-print" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h3 className="modal-title">Invoice {selectedInvoice.invoiceNumber}</h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handlePrint} className="btn-icon" title="Print"><Printer className="w-4 h-4" /></button>
                <button onClick={() => setSelectedInvoice(null)} className="btn-icon"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Printable Header */}
            <div className="print-only hidden" style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Hotel Jay Suites</h1>
              <p style={{ fontSize: '13px', color: 'var(--color-hotel-gray)' }}>Smart Hotel Operations</p>
            </div>

            <div style={{ border: '1px solid #ece9e1', borderRadius: '14px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-hotel-dark)', marginBottom: '4px' }}>Hotel Jay Suites</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)' }}>Invoice: {selectedInvoice.invoiceNumber}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)' }}>Date: {formatDate(selectedInvoice.createdAt)}</p>
                </div>
                <span className={cn('page-badge', getStatusColor(selectedInvoice.paymentStatus))} style={{ alignSelf: 'flex-start' }}>{getStatusLabel(selectedInvoice.paymentStatus)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f9f7f4', borderRadius: '10px', padding: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--color-hotel-gray)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Guest</p>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-dark)' }}>{selectedInvoice.reservation?.guest?.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)' }}>{selectedInvoice.reservation?.guest?.phone}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--color-hotel-gray)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Room</p>
                  <p style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-hotel-dark)' }}>Room {selectedInvoice.reservation?.room?.roomNumber}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-hotel-gray)' }}>{selectedInvoice.reservation?.room?.roomType?.name}</p>
                </div>
              </div>

              {/* Line Items */}
              <table className="page-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th className="page-th" style={{ padding: '10px 0' }}>Description</th>
                    <th className="page-th" style={{ padding: '10px 0', textAlign: 'center' }}>Qty</th>
                    <th className="page-th page-th-right" style={{ padding: '10px 0' }}>Unit Price</th>
                    <th className="page-th page-th-right" style={{ padding: '10px 0' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item) => (
                    <tr key={item.id} style={{ borderTop: '1px solid #f0ede8' }}>
                      <td style={{ padding: '10px 0' }}>{item.description}</td>
                      <td style={{ padding: '10px 0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>{formatCurrency(Number(item.unitPrice))}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(Number(item.totalPrice))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="no-print">
                <button onClick={() => setShowAddItem(true)} className="btn-ghost" style={{ fontSize: '12px', color: 'var(--color-hotel-gold)' }}>+ Add Extra Charge</button>
              </div>

              {/* Totals */}
              <div style={{ borderTop: '1px solid #ece9e1', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: 'var(--color-hotel-gray)' }}>Subtotal</span><span>{formatCurrency(Number(selectedInvoice.subtotal))}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: 'var(--color-hotel-gray)' }}>Discount</span><span>-{formatCurrency(Number(selectedInvoice.discount))}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}><span style={{ color: 'var(--color-hotel-gray)' }}>Tax ({Number(selectedInvoice.taxRate)}%)</span><span>{formatCurrency(Number(selectedInvoice.taxAmount))}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: 'var(--color-hotel-dark)', borderTop: '1px solid #ece9e1', paddingTop: '10px', marginTop: '6px' }}>
                  <span>Total</span><span style={{ color: 'var(--color-hotel-gold)' }}>{formatCurrency(Number(selectedInvoice.totalAmount))}</span>
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-hotel-gray)', textAlign: 'center', borderTop: '1px solid #f0ede8', paddingTop: '16px' }}>
                Payment Method: {getStatusLabel(selectedInvoice.paymentMethod)} | Thank you for staying at Hotel Jay Suites
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add Item Form ─────────────────────────────────── */}
      {showAddItem && selectedInvoice && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowAddItem(false)}>
          <div className="modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Extra Charge</h3>
              <button onClick={() => setShowAddItem(false)} className="btn-icon"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label className="form-label">Description</label><input value={itemForm.description} onChange={(e) => setItemForm(p => ({ ...p, description: e.target.value }))} className="form-input" required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label className="form-label">Quantity</label><input type="number" min={1} value={itemForm.quantity} onChange={(e) => setItemForm(p => ({ ...p, quantity: parseInt(e.target.value) }))} className="form-input" /></div>
                <div><label className="form-label">Unit Price</label><input type="number" step="0.01" value={itemForm.unitPrice} onChange={(e) => setItemForm(p => ({ ...p, unitPrice: parseFloat(e.target.value) }))} className="form-input" required /></div>
              </div>
              <button type="submit" disabled={addItem.isPending} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {addItem.isPending ? 'Adding...' : 'Add Charge'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
