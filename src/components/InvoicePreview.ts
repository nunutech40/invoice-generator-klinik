// ── InvoicePreview Component — Print-ready invoice viewer ────────────
import { Invoice, ServiceItem, formatIDR, totalAmount } from '../core/storage';

export function renderInvoicePreview(invoice: Invoice, onClose: () => void, onEdit?: () => void) {
  const backdrop = document.createElement('div');
  backdrop.className = 'preview-modal-backdrop';

  const total = totalAmount(invoice.services);
  const dateFormatted = new Date(invoice.date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const createdFormatted = new Date(invoice.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  backdrop.innerHTML = `
    <div class="preview-modal">
      <!-- Toolbar (hidden on print) -->
      <div class="preview-toolbar">
        <span>Preview Invoice — ${invoice.no}</span>
        <div class="preview-toolbar-actions">
          ${onEdit ? `<button id="preview-edit-btn" class="btn btn-ghost" style="padding:6px 14px;font-size:13px;">✏️ Edit</button>` : ''}
          <button id="preview-wa-btn" class="btn" style="padding:6px 14px;font-size:13px;background:#25d366;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;">📲 Kirim via WA</button>
          <button id="preview-print-btn" class="btn btn-success" style="padding:6px 14px;font-size:13px;">🖨️ Print / PDF</button>
          <button id="preview-close-btn" class="btn btn-ghost" style="padding:6px 14px;font-size:13px;">✕ Tutup</button>
        </div>
      </div>

      <!-- Invoice Paper -->
      <div class="invoice-paper" id="invoice-print-area">

        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #e2e8f0;">
          <div>
            <h1 style="font-size:22px;font-weight:800;color:#1e3a8a;margin-bottom:4px;">
              🏥 ${invoice.clinicName}
            </h1>
            ${invoice.clinicAddress ? `<p style="font-size:13px;color:#64748b;">${invoice.clinicAddress}</p>` : ''}
            <p style="font-size:13px;color:#64748b;">
              ${invoice.doctorName}
              ${invoice.doctorName ? '' : ''}
            </p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">
              KWITANSI / INVOICE
            </div>
            <div style="font-size:18px;font-weight:800;color:#1e3a8a;">${invoice.no}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">Tanggal: ${dateFormatted}</div>
            <div style="margin-top:6px;">
              <span style="
                display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;
                background:${invoice.status === 'paid' ? '#d1fae5' : '#fef3c7'};
                color:${invoice.status === 'paid' ? '#065f46' : '#92400e'};
              ">
                ${invoice.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
              </span>
            </div>
          </div>
        </div>

        <!-- Patient Info -->
        <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
          <div style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Data Pasien</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div>
              <div style="font-size:12px;color:#94a3b8;">Nama</div>
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${invoice.patientName}</div>
            </div>
            ${invoice.patientAge ? `
            <div>
              <div style="font-size:12px;color:#94a3b8;">Usia</div>
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${invoice.patientAge}</div>
            </div>` : ''}
            ${invoice.diagnose ? `
            <div style="grid-column:1/-1;">
              <div style="font-size:12px;color:#94a3b8;">Diagnosa / Keluhan</div>
              <div style="font-size:14px;color:#334155;">${invoice.diagnose}</div>
            </div>` : ''}
          </div>
        </div>

        <!-- Services Table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Layanan / Tindakan</th>
              <th style="text-align:center;padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;width:60px;">Qty</th>
              <th style="text-align:right;padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Harga</th>
              <th style="text-align:right;padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;border-bottom:2px solid #e2e8f0;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.services.map((s: ServiceItem, i: number) => `
              <tr style="border-bottom:1px solid ${i === invoice.services.length - 1 ? 'transparent' : '#e2e8f0'};">
                <td style="padding:10px 12px;font-size:14px;color:#1e293b;">${s.name || '-'}</td>
                <td style="padding:10px 12px;text-align:center;font-size:14px;color:#475569;">${s.qty}</td>
                <td style="padding:10px 12px;text-align:right;font-size:14px;color:#475569;font-family:monospace;">${formatIDR(s.price)}</td>
                <td style="padding:10px 12px;text-align:right;font-size:14px;font-weight:600;color:#1e293b;font-family:monospace;">${formatIDR(s.qty * s.price)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
              <td colspan="3" style="padding:12px;font-weight:700;font-size:14px;color:#475569;text-align:right;">TOTAL</td>
              <td style="padding:12px;text-align:right;font-size:20px;font-weight:800;color:#1e3a8a;font-family:monospace;">${formatIDR(total)}</td>
            </tr>
          </tfoot>
        </table>

        ${invoice.notes ? `
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
          <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:4px;">Catatan</div>
          <div style="font-size:13px;color:#78350f;">${invoice.notes}</div>
        </div>` : ''}

        <!-- Signature -->
        <div style="display:flex;justify-content:flex-end;margin-top:32px;">
          <div style="text-align:center;min-width:180px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:48px;">${dateFormatted}</div>
            <div style="border-top:1px solid #334155;padding-top:8px;">
              <div style="font-size:13px;font-weight:600;color:#1e293b;">${invoice.doctorName}</div>
              <div style="font-size:11px;color:#94a3b8;">${invoice.clinicName}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
          Dibuat via Klinik App · ${createdFormatted}
        </div>

      </div><!-- /invoice-paper -->
    </div><!-- /preview-modal -->
  `;

  document.body.appendChild(backdrop);

  // Wire close
  backdrop.querySelector('#preview-close-btn')?.addEventListener('click', () => {
    backdrop.remove();
    onClose();
  });

  // Wire print
  backdrop.querySelector('#preview-print-btn')?.addEventListener('click', () => {
    const printArea = backdrop.querySelector('#invoice-print-area') as HTMLElement;
    const original = document.body.innerHTML;
    document.body.innerHTML = printArea.outerHTML;
    window.print();
    document.body.innerHTML = original;
    window.location.reload();
  });

  // Wire WhatsApp
  backdrop.querySelector('#preview-wa-btn')?.addEventListener('click', async () => {
    const serviceLines = invoice.services
      .map(s => `  - ${s.name} (${s.qty}x): ${formatIDR(s.qty * s.price)}`)
      .join('\n');
    const waText =
      `🏥 *Kwitansi dari ${invoice.clinicName}*\n` +
      `*No:* ${invoice.no}\n` +
      `*Tanggal:* ${dateFormatted}\n` +
      `*Pasien:* ${invoice.patientName}\n` +
      (invoice.diagnose ? `*Diagnosa:* ${invoice.diagnose}\n` : '') +
      `\n*Layanan:*\n${serviceLines}\n` +
      `\n*Total: ${formatIDR(total)}*\n` +
      `*Status:* ${invoice.status === 'paid' ? '✅ LUNAS' : '⏳ BELUM LUNAS'}\n` +
      `\n_Kwitansi digital via Klinik App_`;

    // Try native share (mobile) — opens native share sheet
    if ('share' in navigator) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: `Kwitansi ${invoice.no}`,
          text: waText,
        });
        return;
      } catch (_) {
        // user cancelled or not supported — fall through to wa.me
      }
    }

    // Fallback: open wa.me with pre-filled text
    const encoded = encodeURIComponent(waText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  });

  // Wire edit
  if (onEdit) {
    backdrop.querySelector('#preview-edit-btn')?.addEventListener('click', () => {
      backdrop.remove();
      onEdit();
    });
  }

  // Close on backdrop click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) { backdrop.remove(); onClose(); }
  });
}
