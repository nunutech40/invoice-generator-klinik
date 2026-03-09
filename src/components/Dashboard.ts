// ── Dashboard Component ───────────────────────────────────────────────
import { getAllInvoices, deleteInvoice, Invoice, formatIDR, totalAmount } from '../core/storage';
import { exportInvoicesCSV, exportMonthlySummaryCSV, exportInvoicesPDF } from '../core/export';
import { renderInvoiceForm } from './InvoiceForm';
import { renderInvoicePreview } from './InvoicePreview';

export function renderDashboard(container: HTMLElement) {
  // ── Filter State ──────────────────────────────────────────────────
  let searchQuery = '';
  let filterStatus: 'all' | 'paid' | 'pending' = 'all';
  let filterMonth = '';         // 'YYYY-MM' atau '' untuk semua

  function getFilteredInvoices(): Invoice[] {
    let all = getAllInvoices();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      all = all.filter(inv =>
        inv.patientName.toLowerCase().includes(q) ||
        inv.no.toLowerCase().includes(q) ||
        (inv.diagnose || '').toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      all = all.filter(inv => inv.status === filterStatus);
    }
    if (filterMonth) {
      all = all.filter(inv => inv.date.startsWith(filterMonth));
    }
    return all;
  }

  function getAvailableMonths(): string[] {
    const keys = new Set<string>();
    getAllInvoices().forEach(inv => { if (inv.date) keys.add(inv.date.slice(0, 7)); });
    return Array.from(keys).sort();
  }

  function renderList() {
    const allInvoices = getAllInvoices();
    const shown = getFilteredInvoices();
    const totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + totalAmount(i.services), 0);
    const pending = allInvoices.filter(i => i.status === 'pending').length;
    const isFiltered = searchQuery || filterStatus !== 'all' || filterMonth;

    container.innerHTML = `
      <div class="main-content">
        <!-- Header -->
        <div class="dashboard-header">
          <div>
            <h1 class="page-title">Dashboard Klinik</h1>
            <p class="page-subtitle">Kelola invoice & kwitansi pasien Anda</p>
          </div>
          <button id="new-invoice-btn" class="btn btn-primary">+ Buat Invoice Baru</button>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-label">Total Invoice</div>
            <div class="stat-value">${allInvoices.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-label">Total Pendapatan</div>
            <div class="stat-value" style="font-size:20px;">${formatIDR(totalRevenue)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-label">Belum Lunas</div>
            <div class="stat-value" style="color:var(--warning);">${pending}</div>
          </div>
        </div>

        <!-- Invoice List -->
        <div class="section-card">
          <div class="section-head">
            <h2>🧾 Riwayat Invoice</h2>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              ${allInvoices.length > 0 ? `
              <div class="export-menu" style="position:relative;">
                <button id="export-btn" class="btn btn-ghost" style="padding:6px 12px;font-size:13px;">
                  📊 Export ▾
                </button>
                <div id="export-dropdown" style="
                  display:none;position:absolute;right:0;top:calc(100% + 4px);
                  background:var(--bg-2);border:1px solid var(--border);
                  border-radius:var(--radius-sm);min-width:200px;z-index:50;
                  box-shadow:var(--shadow);overflow:hidden;">
                  <button id="export-all-btn" style="
                    display:block;width:100%;padding:10px 16px;text-align:left;
                    font-size:13px;background:none;cursor:pointer;color:var(--text-2);
                    border-bottom:1px solid var(--border-subtle);">
                    📋 Export Semua Invoice (.csv)
                  </button>
                  <button id="export-filtered-btn" style="
                    display:block;width:100%;padding:10px 16px;text-align:left;
                    font-size:13px;background:none;cursor:pointer;color:var(--text-2);
                    border-bottom:1px solid var(--border-subtle);">
                    🔍 Export Hasil Filter (.csv)
                  </button>
                  <button id="export-monthly-btn" style="
                    display:block;width:100%;padding:10px 16px;text-align:left;
                    font-size:13px;background:none;cursor:pointer;color:var(--text-2);
                    border-bottom:1px solid var(--border-subtle);">
                    📅 Rekap Bulanan (.csv)
                  </button>
                  <button id="export-pdf-btn" style="
                    display:block;width:100%;padding:10px 16px;text-align:left;
                    font-size:13px;background:none;cursor:pointer;color:var(--text-2);">
                    📄 Laporan PDF (print/save)
                  </button>
                </div>
              </div>
              ` : ''}
              <span style="font-size:12px;color:var(--text-3);">
                ${isFiltered ? `${shown.length} dari ${allInvoices.length}` : `${allInvoices.length}`} invoice
              </span>
            </div>
          </div>

          <!-- Filter Bar -->
          ${allInvoices.length > 0 ? `
          <div style="padding:12px 20px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <input
              id="search-input"
              class="form-input"
              type="search"
              placeholder="🔍 Cari nama pasien, no invoice..."
              value="${searchQuery}"
              style="flex:1;min-width:200px;max-width:320px;height:36px;padding:6px 12px;font-size:13px;"
            />
            <select id="filter-status" class="form-input" style="height:36px;padding:6px 10px;font-size:13px;width:auto;">
              <option value="all" ${filterStatus === 'all' ? 'selected' : ''}>Semua Status</option>
              <option value="paid" ${filterStatus === 'paid' ? 'selected' : ''}>✅ Lunas</option>
              <option value="pending" ${filterStatus === 'pending' ? 'selected' : ''}>⏳ Belum Lunas</option>
            </select>
            <select id="filter-month" class="form-input" style="height:36px;padding:6px 10px;font-size:13px;width:auto;">
              <option value="">📅 Semua Bulan</option>
              ${getAvailableMonths().map(m => {
      const [y, mo] = m.split('-');
      const label = new Date(parseInt(y), parseInt(mo) - 1, 1)
        .toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      return `<option value="${m}" ${filterMonth === m ? 'selected' : ''}>${label}</option>`;
    }).join('')}
            </select>
            ${isFiltered ? `
            <button id="clear-filter-btn" class="btn btn-ghost"
                    style="height:36px;padding:6px 12px;font-size:12px;color:var(--danger);">
              ✕ Reset
            </button>
            ` : ''}
          </div>
          ` : ''}

          ${allInvoices.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Belum ada invoice</h3>
            <p>Buat invoice pertama Anda untuk pasien hari ini</p>
            <button id="empty-new-btn" class="btn btn-primary" style="margin:0 auto;display:inline-flex;">
              + Buat Invoice Pertama
            </button>
          </div>

          ` : shown.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Tidak ada hasil</h3>
            <p>Tidak ada invoice yang cocok dengan filter yang dipilih</p>
            <button id="clear-filter-btn2" class="btn btn-ghost" style="margin:0 auto;display:inline-flex;">
              Reset Filter
            </button>
          </div>
          ` : `
          <table class="invoice-table">
            <thead>
              <tr>
                <th>No Invoice</th>
                <th>Pasien</th>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Status</th>
                <th style="text-align:center;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${shown.map(inv => `
                <tr>
                  <td style="font-family:monospace;font-size:13px;color:var(--accent);">${inv.no}</td>
                  <td class="col-name">${inv.patientName}</td>
                  <td>${new Date(inv.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td class="col-amount">${formatIDR(totalAmount(inv.services))}</td>
                  <td>
                    <span class="badge ${inv.status === 'paid' ? 'badge-success' : 'badge-pending'}">
                      ${inv.status === 'paid' ? 'Lunas' : 'Pending'}
                    </span>
                  </td>
                  <td style="text-align:center;">
                    <div style="display:flex;gap:6px;justify-content:center;">
                      <button class="btn btn-ghost btn-preview" data-id="${inv.id}"
                              style="padding:5px 10px;font-size:12px;">👁 Preview</button>
                      <button class="btn btn-ghost btn-edit" data-id="${inv.id}"
                              style="padding:5px 10px;font-size:12px;">✏️</button>
                      <button class="btn btn-danger btn-delete" data-id="${inv.id}"
                              style="padding:5px 10px;font-size:12px;">🗑</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${isFiltered && shown.length > 0 ? `
          <div style="padding:10px 20px;border-top:1px solid var(--border-subtle);font-size:13px;color:var(--text-3);display:flex;justify-content:space-between;align-items:center;">
            <span>Total hasil filter: <strong style="color:var(--success)">${formatIDR(shown.reduce((s, i) => s + totalAmount(i.services), 0))}</strong></span>
            <span>${shown.filter(i => i.status === 'paid').length} lunas · ${shown.filter(i => i.status === 'pending').length} pending</span>
          </div>
          ` : ''}
          `}
        </div>
      </div>
    `;
    wireListEvents();
  }

  function wireListEvents() {
    container.querySelector('#new-invoice-btn')?.addEventListener('click', () => showNewForm());
    container.querySelector('#empty-new-btn')?.addEventListener('click', () => showNewForm());

    // ── Filter events ──────────────────────────────────────────────
    const searchInput = container.querySelector('#search-input') as HTMLInputElement | null;
    searchInput?.addEventListener('input', () => {
      searchQuery = searchInput.value;
      renderList();
    });

    const statusSelect = container.querySelector('#filter-status') as HTMLSelectElement | null;
    statusSelect?.addEventListener('change', () => {
      filterStatus = statusSelect.value as 'all' | 'paid' | 'pending';
      renderList();
    });

    const monthInput = container.querySelector('#filter-month') as HTMLSelectElement | null;
    monthInput?.addEventListener('change', () => {
      filterMonth = monthInput.value;
      renderList();
    });

    const clearReset = (btn: Element | null) => {
      btn?.addEventListener('click', () => {
        searchQuery = ''; filterStatus = 'all'; filterMonth = '';
        renderList();
      });
    };
    clearReset(container.querySelector('#clear-filter-btn'));
    clearReset(container.querySelector('#clear-filter-btn2'));

    // ── Export dropdown ────────────────────────────────────────────
    const exportBtn = container.querySelector('#export-btn');
    const dropdown = container.querySelector('#export-dropdown') as HTMLElement | null;
    exportBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => { if (dropdown) dropdown.style.display = 'none'; }, { once: true });

    container.querySelector('#export-all-btn')?.addEventListener('click', () => {
      exportInvoicesCSV(getAllInvoices());
    });
    container.querySelector('#export-filtered-btn')?.addEventListener('click', () => {
      exportInvoicesCSV(getFilteredInvoices(), `invoice-filter-${new Date().toISOString().slice(0, 10)}.csv`);
    });
    container.querySelector('#export-monthly-btn')?.addEventListener('click', () => {
      exportMonthlySummaryCSV(getAllInvoices());
    });
    container.querySelector('#export-pdf-btn')?.addEventListener('click', () => {
      const label = filterMonth ? `Laporan ${filterMonth}` : 'Laporan Invoice Klinik';
      exportInvoicesPDF(getFilteredInvoices(), label);
    });

    // ── Invoice actions ────────────────────────────────────────────
    container.querySelectorAll('.btn-preview').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id!;
        const inv = getAllInvoices().find(i => i.id === id);
        if (inv) renderInvoicePreview(inv, () => renderList(), () => showEditForm(inv));
      });
    });
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id!;
        const inv = getAllInvoices().find(i => i.id === id);
        if (inv) showEditForm(inv);
      });
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id!;
        if (confirm('Hapus invoice ini? Tindakan tidak bisa dibatalkan.')) {
          deleteInvoice(id);
          renderList();
        }
      });
    });
  }

  function showNewForm() {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'main-content';
    container.appendChild(wrap);
    renderInvoiceForm(wrap, {
      onSave: (inv) => { renderInvoicePreview(inv, () => renderList(), () => showEditForm(inv)); },
      onCancel: () => renderList(),
    });
  }

  function showEditForm(inv: Invoice) {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'main-content';
    container.appendChild(wrap);
    renderInvoiceForm(wrap, {
      existing: inv,
      onSave: (updated) => { renderInvoicePreview(updated, () => renderList(), () => showEditForm(updated)); },
      onCancel: () => renderList(),
    });
  }

  renderList();
}
