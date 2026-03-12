// ── PricingPage Component ─────────────────────────────────────────────
import { config } from '../core/config';
import { getAccessToken } from '../core/auth';

interface Plan {
    id: string;
    product_id: string;
    segment: string;
    duration: string;
    duration_days: number;
    price_idr: number;
    label: string;
    is_active: boolean;
}

function formatIDR(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
}

function durationLabel(duration: string): string {
    const map: Record<string, string> = {
        monthly: '/ bulan',
        '3month': '/ 3 bulan',
        '6month': '/ 6 bulan',
        yearly: '/ tahun',
    };
    return map[duration] || '/ periode';
}

export function renderPricingPage(container: HTMLElement, onAccessGranted: () => void) {
    let plans: Plan[] = [];
    let selectedPlanId: string | null = null;
    let loading = true;
    let checkoutLoading = false;
    let errorMsg = '';

    async function fetchPlans() {
        loading = true; render();
        try {
            const res = await fetch(`${config.apiBase}/api/plans?product=${config.product}`);
            if (res.ok) {
                const data = await res.json();
                const raw: Plan[] = data?.data || [];
                plans = raw.filter(p => p.is_active);
                if (plans.length > 0) selectedPlanId = plans[0].id;
            }
        } catch { /* Keep empty */ }
        loading = false; render();
    }

    function render() {
        container.innerHTML = `
      <div class="pricing-container">
        <div class="pricing-header">
          <div class="pricing-badge">🏥 Klinik Invoice</div>
          <h1 class="pricing-title">Pilih Paket Berlangganan</h1>
          <p class="pricing-subtitle">Buat kwitansi & invoice pasien tanpa batas. Profesional, print-ready, legal.</p>
        </div>

        ${errorMsg ? `<div class="error-msg" style="max-width:480px;margin-bottom:24px;">${errorMsg}</div>` : ''}

        ${loading
                ? '<div class="spinner" style="margin:40px auto"></div>'
                : plans.length === 0
                    ? `<div style="text-align:center;color:var(--text-2);padding:40px">
                     Paket belum tersedia. Hubungi admin.
                   </div>`
                    : `
            <div class="plans-grid">
              ${plans.map(p => `
                <div class="plan-card ${selectedPlanId === p.id ? 'selected' : ''}"
                     data-plan-id="${p.id}"
                     id="plan-${p.id}">
                  <div class="plan-name">${p.label || p.duration}</div>
                  <div class="plan-price">
                    ${formatIDR(p.price_idr)}
                    <small>${durationLabel(p.duration)}</small>
                  </div>
                  <ul class="plan-features">
                    <li>Invoice & kwitansi unlimited</li>
                    <li>Nomor invoice otomatis</li>
                    <li>Print & ekspor PDF</li>
                    <li>Riwayat transaksi</li>
                    <li>Support via WhatsApp</li>
                  </ul>
                </div>
              `).join('')}
            </div>

            <button id="checkout-btn" class="btn btn-primary"
                    style="max-width:320px;width:100%;font-size:16px;padding:14px"
                    ${!selectedPlanId ? 'disabled' : ''}>
              ${checkoutLoading ? '<div class="spinner"></div>' : 'Mulai Berlangganan →'}
            </button>

            <p style="font-size:13px;color:var(--text-3);margin-top:12px;text-align:center;">
              Bayar aman via Midtrans · QRIS · Transfer Bank · GoPay
            </p>
          `
            }
      </div>
    `;
        wireEvents();
    }

    function wireEvents() {
        // Plan selection
        container.querySelectorAll('.plan-card').forEach(card => {
            card.addEventListener('click', () => {
                selectedPlanId = (card as HTMLElement).dataset.planId || null;
                container.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                const btn = container.querySelector('#checkout-btn') as HTMLButtonElement | null;
                if (btn) btn.disabled = !selectedPlanId;
            });
        });

        // Checkout
        container.querySelector('#checkout-btn')?.addEventListener('click', async () => {
            if (!selectedPlanId || checkoutLoading) return;
            errorMsg = '';
            checkoutLoading = true;
            render();

            try {
                const res = await fetch(`${config.apiBase}/api/checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getAccessToken()}`,
                    },
                    body: JSON.stringify({ plan_id: selectedPlanId, utm_source: 'klinik-app', return_url: window.location.origin }),
                });

                const data = await res.json();
                if (res.ok && data?.data?.checkout_url) {
                    // Redirect to Midtrans
                    window.location.href = data.data.checkout_url;
                } else if (res.status === 409) {
                    // Already has active subscription
                    onAccessGranted();
                } else {
                    errorMsg = data?.error?.message || 'Gagal membuat transaksi. Coba lagi.';
                    checkoutLoading = false;
                    render();
                }
            } catch {
                errorMsg = 'Koneksi gagal. Periksa internet Anda.';
                checkoutLoading = false;
                render();
            }
        });
    }

    fetchPlans();

    // Handle payment success redirect
    if (window.location.hash.startsWith('#/payment/success')) {
        onAccessGranted();
    }
}
