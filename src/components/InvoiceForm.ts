// ── InvoiceForm Component ─────────────────────────────────────────────
import {
    Invoice, ServiceItem, DoctorProfile,
    getDoctorProfile, saveDoctorProfile, saveInvoice,
    createNewInvoice, formatIDR
} from '../core/storage';

interface InvoiceFormProps {
    existing?: Invoice;         // If set, we're editing
    onSave: (inv: Invoice) => void;
    onCancel: () => void;
}

export function renderInvoiceForm(container: HTMLElement, props: InvoiceFormProps) {
    const { existing, onSave, onCancel } = props;
    const isEdit = !!existing;

    // Load doctor profile as default values
    const profile: DoctorProfile = getDoctorProfile() || {
        name: '', clinicName: '', address: '', phone: '', sip: '',
    };

    // Services rows state
    let services: ServiceItem[] = existing?.services || [
        { name: 'Konsultasi', qty: 1, price: 100000 },
    ];

    function getTotal(): number {
        return services.reduce((sum, s) => sum + s.qty * s.price, 0);
    }

    function render() {
        container.innerHTML = `
      <div class="form-card">
        <h2>${isEdit ? '✏️ Edit Invoice' : '📝 Buat Invoice Baru'}</h2>

        <form id="invoice-form" autocomplete="off">

          <!-- Patient Info -->
          <fieldset style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;">
            <legend style="font-size:12px;font-weight:600;color:var(--text-3);padding:0 8px;text-transform:uppercase;">Data Pasien</legend>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Pasien *</label>
                <input id="inp-patient" class="form-input" type="text" placeholder="Nama lengkap pasien"
                  value="${existing?.patientName || ''}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Usia</label>
                <input id="inp-age" class="form-input" type="text" placeholder="Contoh: 35 tahun"
                  value="${existing?.patientAge || ''}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tanggal Kunjungan *</label>
                <input id="inp-date" class="form-input" type="date"
                  value="${existing?.date || new Date().toISOString().slice(0, 10)}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Diagnosa / Keluhan</label>
                <input id="inp-diagnose" class="form-input" type="text" placeholder="Opsional"
                  value="${existing?.diagnose || ''}" />
              </div>
            </div>
          </fieldset>

          <!-- Services -->
          <fieldset style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;">
            <legend style="font-size:12px;font-weight:600;color:var(--text-3);padding:0 8px;text-transform:uppercase;">Layanan & Biaya</legend>
            <div id="services-list">
              ${renderServices()}
            </div>
            <button type="button" id="add-service-btn" class="btn btn-ghost"
                    style="margin-top:8px;font-size:13px;padding:8px 14px;">
              + Tambah Layanan
            </button>
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
              <div style="text-align:right;">
                <div style="font-size:12px;color:var(--text-3);margin-bottom:2px;">Total</div>
                <div id="total-display" style="font-size:22px;font-weight:700;color:var(--success);">
                  ${formatIDR(getTotal())}
                </div>
              </div>
            </div>
          </fieldset>

          <!-- Doctor Info -->
          <fieldset style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;">
            <legend style="font-size:12px;font-weight:600;color:var(--text-3);padding:0 8px;text-transform:uppercase;">Info Praktek (disimpan otomatis)</legend>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Dokter *</label>
                <input id="inp-doctor" class="form-input" type="text" placeholder="dr. Nama Dokter, Sp.Something"
                  value="${profile.name}" required />
              </div>
              <div class="form-group">
                <label class="form-label">SIP / Nomor Izin</label>
                <input id="inp-sip" class="form-input" type="text" placeholder="Nomor SIP (opsional)"
                  value="${profile.sip || ''}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Klinik / Praktek *</label>
                <input id="inp-clinic" class="form-input" type="text" placeholder="Klinik Sehat"
                  value="${profile.clinicName}" required />
              </div>
              <div class="form-group">
                <label class="form-label">No. Telepon</label>
                <input id="inp-phone" class="form-input" type="text" placeholder="08xxx"
                  value="${profile.phone || ''}" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Alamat Praktek</label>
              <input id="inp-address" class="form-input" type="text" placeholder="Jl. ..."
                value="${profile.address}" />
            </div>
          </fieldset>

          <!-- Notes -->
          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">Catatan Tambahan</label>
            <input id="inp-notes" class="form-input" type="text" placeholder="Opsional — pesan untuk pasien"
              value="${existing?.notes || ''}" />
          </div>

          <!-- Status -->
          <div class="form-group" style="margin-bottom:24px;">
            <label class="form-label">Status Pembayaran</label>
            <select id="inp-status" class="form-input">
              <option value="paid" ${(existing?.status ?? 'paid') === 'paid' ? 'selected' : ''}>✅ Sudah Lunas</option>
              <option value="pending" ${existing?.status === 'pending' ? 'selected' : ''}>⏳ Belum Lunas</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" id="cancel-btn" class="btn btn-ghost">Batal</button>
            <button type="submit" id="save-btn" class="btn btn-primary" style="min-width:160px;">
              ${isEdit ? 'Simpan Perubahan' : '✨ Buat & Preview'}
            </button>
          </div>
        </form>
      </div>
    `;
        wireEvents();
    }

    function renderServices(): string {
        return services.map((s, i) => `
      <div class="form-row" data-service-idx="${i}" style="align-items:flex-end;margin-bottom:8px;">
        <div class="form-group" style="flex:2;margin-bottom:0;">
          <label class="form-label">Nama Layanan</label>
          <input class="form-input svc-name" type="text" placeholder="Konsultasi, Obat, dll"
                 value="${s.name}" data-idx="${i}" />
        </div>
        <div class="form-group" style="flex:1;margin-bottom:0;">
          <label class="form-label">Qty</label>
          <input class="form-input svc-qty" type="number" min="1" value="${s.qty}" data-idx="${i}" style="text-align:center;" />
        </div>
        <div class="form-group" style="flex:2;margin-bottom:0;">
          <label class="form-label">Harga (Rp)</label>
          <div class="form-input-currency">
            <input class="form-input svc-price" type="number" min="0" value="${s.price}" data-idx="${i}" style="padding-left:36px;" />
          </div>
        </div>
        <button type="button" class="btn btn-danger svc-remove" data-idx="${i}"
                style="padding:10px 12px;margin-bottom:0;min-width:40px;${services.length === 1 ? 'opacity:0.3;cursor:default;' : ''}">
          ✕
        </button>
      </div>
    `).join('');
    }

    function readServicesFromDOM() {
        const names = container.querySelectorAll('.svc-name');
        const qtys = container.querySelectorAll('.svc-qty');
        const prices = container.querySelectorAll('.svc-price');
        services = Array.from(names).map((_, i) => ({
            name: (names[i] as HTMLInputElement).value.trim(),
            qty: parseInt((qtys[i] as HTMLInputElement).value) || 1,
            price: parseInt((prices[i] as HTMLInputElement).value) || 0,
        }));
    }

    function refreshTotal() {
        readServicesFromDOM();
        const totalEl = container.querySelector('#total-display');
        if (totalEl) totalEl.textContent = formatIDR(getTotal());
    }

    function refreshServices() {
        readServicesFromDOM();
        const listEl = container.querySelector('#services-list');
        if (listEl) {
            listEl.innerHTML = renderServices();
            wireServiceEvents();
        }
        refreshTotal();
    }

    function wireServiceEvents() {
        // Input changes — update total
        container.querySelectorAll('.svc-qty, .svc-price').forEach(inp => {
            inp.addEventListener('input', refreshTotal);
        });
        // Remove service row
        container.querySelectorAll('.svc-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                if (services.length <= 1) return;
                const idx = parseInt((btn as HTMLElement).dataset.idx!);
                readServicesFromDOM();
                services.splice(idx, 1);
                refreshServices();
            });
        });
    }

    function wireEvents() {
        wireServiceEvents();

        // Add service
        container.querySelector('#add-service-btn')?.addEventListener('click', () => {
            readServicesFromDOM();
            services.push({ name: '', qty: 1, price: 0 });
            refreshServices();
        });

        // Cancel
        container.querySelector('#cancel-btn')?.addEventListener('click', onCancel);

        // Submit
        container.querySelector('#invoice-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            readServicesFromDOM();

            // Save doctor profile
            const doctorProfile: DoctorProfile = {
                name: (container.querySelector('#inp-doctor') as HTMLInputElement).value.trim(),
                clinicName: (container.querySelector('#inp-clinic') as HTMLInputElement).value.trim(),
                address: (container.querySelector('#inp-address') as HTMLInputElement).value.trim(),
                phone: (container.querySelector('#inp-phone') as HTMLInputElement).value.trim(),
                sip: (container.querySelector('#inp-sip') as HTMLInputElement).value.trim(),
            };
            saveDoctorProfile(doctorProfile);

            const invoiceData = {
                patientName: (container.querySelector('#inp-patient') as HTMLInputElement).value.trim(),
                patientAge: (container.querySelector('#inp-age') as HTMLInputElement).value.trim(),
                date: (container.querySelector('#inp-date') as HTMLInputElement).value,
                diagnose: (container.querySelector('#inp-diagnose') as HTMLInputElement).value.trim(),
                notes: (container.querySelector('#inp-notes') as HTMLInputElement).value.trim(),
                status: ((container.querySelector('#inp-status') as HTMLSelectElement).value) as 'paid' | 'pending',
                services,
                doctorName: doctorProfile.name,
                clinicName: doctorProfile.clinicName,
                clinicAddress: doctorProfile.address,
            };

            let invoice: Invoice;
            if (existing) {
                invoice = { ...existing, ...invoiceData };
            } else {
                invoice = createNewInvoice(invoiceData);
            }

            saveInvoice(invoice);
            onSave(invoice);
        });
    }

    render();
}
