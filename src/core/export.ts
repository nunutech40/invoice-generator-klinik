// ── Export Utilities — Klinik App ─────────────────────────────────────
// Export invoice data ke CSV/Excel tanpa library tambahan.
// File CSV dengan BOM (agar Excel Indonesia bisa baca dengan benar).

import { Invoice, ServiceItem, totalAmount } from './storage';

function escapeCSV(val: string | number | undefined): string {
    if (val === undefined || val === null) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
}

function csvRow(cells: (string | number | undefined)[]): string {
    return cells.map(escapeCSV).join(',');
}

// ── Export Semua Invoice ke CSV ────────────────────────────────────────

export function exportInvoicesCSV(invoices: Invoice[], filename?: string) {
    const rows: string[] = [];

    // Header — Sheet rekap invoice
    rows.push(csvRow([
        'No Invoice', 'Tanggal', 'Nama Pasien', 'Usia', 'Diagnosa / Keluhan',
        'Layanan', 'Total (Rp)', 'Status', 'Nama Dokter', 'Nama Klinik',
        'Catatan', 'Dibuat'
    ]));

    invoices.forEach(inv => {
        const layanan = inv.services
            .map((s: ServiceItem) => `${s.name} (${s.qty}x Rp ${s.price.toLocaleString('id-ID')})`)
            .join('; ');

        rows.push(csvRow([
            inv.no,
            new Date(inv.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            inv.patientName,
            inv.patientAge || '-',
            inv.diagnose || '-',
            layanan,
            totalAmount(inv.services),
            inv.status === 'paid' ? 'Lunas' : 'Belum Lunas',
            inv.doctorName,
            inv.clinicName,
            inv.notes || '-',
            new Date(inv.createdAt).toLocaleDateString('id-ID'),
        ]));
    });

    const csv = rows.join('\r\n');
    // UTF-8 BOM — wajib agar Excel Indonesia bisa baca karakter latin/special
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `invoice-klinik-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Export Rekap Bulanan ───────────────────────────────────────────────

export function exportMonthlySummaryCSV(invoices: Invoice[]) {
    // Group by year-month
    const byMonth: Record<string, { count: number; lunas: number; pending: number; totalLunas: number; totalPending: number }> = {};

    invoices.forEach(inv => {
        const d = new Date(inv.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!byMonth[key]) {
            byMonth[key] = { count: 0, lunas: 0, pending: 0, totalLunas: 0, totalPending: 0 };
        }
        const total = totalAmount(inv.services);
        byMonth[key].count++;
        if (inv.status === 'paid') {
            byMonth[key].lunas++;
            byMonth[key].totalLunas += total;
        } else {
            byMonth[key].pending++;
            byMonth[key].totalPending += total;
        }
    });

    const rows: string[] = [];
    rows.push(csvRow(['Bulan', 'Total Kunjungan', 'Lunas', 'Belum Lunas', 'Total Lunas (Rp)', 'Total Piutang (Rp)', 'Total Bruto (Rp)']));

    // Sort chronologically
    Object.keys(byMonth).sort().forEach(key => {
        const [year, month] = key.split('-');
        const bulan = new Date(parseInt(year), parseInt(month) - 1, 1)
            .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        const m = byMonth[key];
        rows.push(csvRow([
            bulan,
            m.count,
            m.lunas,
            m.pending,
            m.totalLunas,
            m.totalPending,
            m.totalLunas + m.totalPending,
        ]));
    });

    const csv = rows.join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-bulanan-klinik-${new Date().toISOString().slice(0, 7)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Export PDF (print-to-PDF via window baru) ─────────────────────────

export function exportInvoicesPDF(invoices: Invoice[], title?: string) {
    const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const reportTitle = title || 'Laporan Invoice Klinik';

    const rows = invoices.map((inv, i) => {
        const total = totalAmount(inv.services);
        const layanan = inv.services.map((s: ServiceItem) => `${s.name} (${s.qty}×)`).join(', ');
        const status = inv.status === 'paid'
            ? '<span style="color:#059669;font-weight:700;">Lunas</span>'
            : '<span style="color:#d97706;font-weight:700;">Pending</span>';
        return `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'};">
        <td>${inv.no}</td>
        <td>${new Date(inv.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        <td>${inv.patientName}${inv.patientAge ? ` <span style="color:#94a3b8;font-size:11px;">(${inv.patientAge})</span>` : ''}</td>
        <td style="font-size:12px;color:#475569;">${layanan}</td>
        <td style="text-align:right;font-weight:600;font-family:monospace;">Rp ${total.toLocaleString('id-ID')}</td>
        <td style="text-align:center;">${status}</td>
      </tr>
    `;
    }).join('');

    const totalBruto = invoices.reduce((s, i) => s + totalAmount(i.services), 0);
    const totalLunas = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + totalAmount(i.services), 0);
    const totalPiutang = totalBruto - totalLunas;

    const doctorName = invoices[0]?.doctorName || '';
    const clinicName = invoices[0]?.clinicName || '';

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>${reportTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1e293b; background: #fff; padding: 32px; }
    h1 { font-size: 20px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; }
    .summary { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
    .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; min-width: 160px; }
    .summary-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
    .summary-value { font-size: 18px; font-weight: 700; color: #1e293b; }
    .summary-value.green { color: #059669; }
    .summary-value.orange { color: #d97706; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1e3a8a; color: white; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tfoot td { font-weight: 700; border-top: 2px solid #1e3a8a; background: #f8fafc; font-size: 12px; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 16px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e3a8a;">
    <div>
      <h1>🏥 ${clinicName || 'Klinik'}</h1>
      <div class="meta">${doctorName}${doctorName ? ' · ' : ''}${reportTitle}</div>
    </div>
    <div style="text-align:right;font-size:12px;color:#64748b;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Dicetak</div>
      <strong>${now}</strong>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="summary-label">Total Invoice</div>
      <div class="summary-value">${invoices.length}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Bruto</div>
      <div class="summary-value">Rp ${totalBruto.toLocaleString('id-ID')}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Sudah Lunas</div>
      <div class="summary-value green">Rp ${totalLunas.toLocaleString('id-ID')}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Piutang</div>
      <div class="summary-value orange">Rp ${totalPiutang.toLocaleString('id-ID')}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>No Invoice</th>
        <th>Tanggal</th>
        <th>Pasien</th>
        <th>Layanan</th>
        <th style="text-align:right;">Total</th>
        <th style="text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right;">TOTAL BRUTO</td>
        <td style="text-align:right;font-family:monospace;">Rp ${totalBruto.toLocaleString('id-ID')}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>Dibuat otomatis oleh Klinik App</span>
    <span>Total ${invoices.length} invoice · ${invoices.filter(i => i.status === 'paid').length} lunas · ${invoices.filter(i => i.status === 'pending').length} pending</span>
  </div>

  <script>
    window.onload = () => { window.print(); }
  </script>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
}
