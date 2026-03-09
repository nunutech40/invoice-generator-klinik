// ── Feedback Component ─────────────────────────────────────────────────
// Floating feedback button + modal. Kirim ke POST /api/feedback.
// Muncul di semua halaman setelah login, di atas Nav.

import { getAccessToken } from '../core/auth';
import { config } from '../core/config';

export function mountFeedbackButton() {
    // Jangan mount dua kali
    if (document.getElementById('feedback-fab')) return;

    const fab = document.createElement('div');
    fab.id = 'feedback-fab';
    fab.innerHTML = `
    <button id="feedback-trigger" title="Kirim Saran / Feedback" aria-label="Beri Feedback">
      💬
    </button>

    <!-- Modal -->
    <div id="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title" style="display:none;">
      <div id="feedback-modal-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 id="feedback-modal-title" style="font-size:15px;font-weight:700;color:var(--text-1);">
            💬 Kirim Saran atau Pertanyaan
          </h3>
          <button id="feedback-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:var(--text-3);line-height:1;">×</button>
        </div>
        <p style="font-size:13px;color:var(--text-3);margin-bottom:16px;">
          Ada yang kurang? Ada request fitur? Ada bug? Cerita aja langsung.
        </p>

        <div id="feedback-form-area">
          <!-- Kategori -->
          <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;">
            <button class="fb-cat-btn active" data-cat="saran"   style="">💡 Saran Fitur</button>
            <button class="fb-cat-btn"         data-cat="pertanyaan" style="">❓ Pertanyaan</button>
            <button class="fb-cat-btn"         data-cat="bug"    style="">🐛 Bug / Error</button>
          </div>

          <!-- Rating -->
          <div style="margin-bottom:14px;">
            <label style="font-size:12px;color:var(--text-3);display:block;margin-bottom:6px;">Seberapa puas dengan Klinik App?</label>
            <div id="star-rating" style="display:flex;gap:6px;">
              ${[1, 2, 3, 4, 5].map(n => `
                <button class="star-btn" data-val="${n}" title="${n} bintang"
                        style="font-size:22px;background:none;border:none;cursor:pointer;opacity:.4;transition:opacity .15s;">★</button>
              `).join('')}
            </div>
          </div>

          <!-- Pesan -->
          <textarea id="feedback-msg" class="form-input" rows="4"
            placeholder="Tulis pesanmu di sini... (min. 10 karakter)"
            style="resize:vertical;min-height:90px;font-size:13px;"></textarea>

          <!-- Error / Success -->
          <div id="feedback-error" style="display:none;color:var(--danger);font-size:13px;margin-top:8px;"></div>

          <button id="feedback-submit" class="btn btn-primary" style="margin-top:12px;width:100%;">
            Kirim Feedback
          </button>
        </div>

        <!-- Success state -->
        <div id="feedback-success" style="display:none;text-align:center;padding:24px 0;">
          <div style="font-size:40px;margin-bottom:12px;">🙏</div>
          <p style="font-weight:600;color:var(--text-1);">Makasih atas feedbacknya!</p>
          <p style="font-size:13px;color:var(--text-3);margin-top:4px;">Gue baca semua pesan yang masuk.</p>
          <button id="feedback-reset" class="btn btn-ghost" style="margin-top:16px;">Kirim lagi</button>
        </div>
      </div>
    </div>
  `;
    document.body.appendChild(fab);

    injectFABStyles();
    wireFABEvents();
}

function injectFABStyles() {
    if (document.getElementById('feedback-fab-styles')) return;
    const style = document.createElement('style');
    style.id = 'feedback-fab-styles';
    style.textContent = `
    #feedback-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
    }
    #feedback-trigger {
      width: 48px; height: 48px; border-radius: 50%;
      background: var(--accent); border: none; cursor: pointer;
      font-size: 20px; box-shadow: 0 4px 16px rgba(59,130,246,.4);
      transition: transform .15s, box-shadow .15s;
      display: flex; align-items: center; justify-content: center;
    }
    #feedback-trigger:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(59,130,246,.5); }
    #feedback-modal {
      position: fixed; inset: 0; background: rgba(0,0,0,.6);
      display: flex; align-items: flex-end; justify-content: flex-end;
      padding: 0 24px 86px; z-index: 9998;
    }
    #feedback-modal-box {
      background: var(--bg-2); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px;
      width: 340px; max-width: calc(100vw - 48px);
      box-shadow: var(--shadow-lg, 0 20px 60px rgba(0,0,0,.5));
      animation: fbSlideUp .2s ease;
    }
    @keyframes fbSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    .fb-cat-btn {
      padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
      border: 1px solid var(--border); background: var(--bg-3);
      color: var(--text-3); cursor: pointer; transition: all .15s;
    }
    .fb-cat-btn.active, .fb-cat-btn:hover {
      background: var(--accent); border-color: var(--accent); color: #fff;
    }
    .star-btn.active { opacity: 1 !important; }
    .star-btn:hover, .star-btn.hovered { opacity: .85 !important; }
  `;
    document.head.appendChild(style);
}

function wireFABEvents() {
    const trigger = document.getElementById('feedback-trigger')!;
    const modal = document.getElementById('feedback-modal')!;
    const closeBtn = document.getElementById('feedback-close')!;
    const submitBtn = document.getElementById('feedback-submit')!;
    const resetBtn = document.getElementById('feedback-reset');
    const msgInput = document.getElementById('feedback-msg') as HTMLTextAreaElement;
    const errorEl = document.getElementById('feedback-error')!;
    const formArea = document.getElementById('feedback-form-area')!;
    const successEl = document.getElementById('feedback-success')!;

    let selectedCat = 'saran';
    let selectedRating: number | null = null;

    const open = () => { modal.style.display = 'flex'; msgInput.focus(); };
    const close = () => { modal.style.display = 'none'; };

    trigger.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

    // Category buttons
    document.querySelectorAll('.fb-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.fb-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCat = (btn as HTMLElement).dataset.cat!;
        });
    });

    // Star rating
    const stars = document.querySelectorAll<HTMLElement>('.star-btn');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.val!);
            stars.forEach((s, i) => s.classList.toggle('active', i < selectedRating!));
        });
        star.addEventListener('mouseenter', () => {
            const hov = parseInt(star.dataset.val!);
            stars.forEach((s, i) => s.classList.toggle('hovered', i < hov));
        });
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hovered'));
        });
    });

    // Submit
    submitBtn.addEventListener('click', async () => {
        const msg = msgInput.value.trim();
        errorEl.style.display = 'none';

        if (msg.length < 10) {
            errorEl.textContent = 'Pesan minimal 10 karakter ya.';
            errorEl.style.display = 'block';
            return;
        }

        submitBtn.textContent = 'Mengirim...';
        (submitBtn as HTMLButtonElement).disabled = true;

        try {
            const token = getAccessToken();
            const res = await fetch(`${config.apiBase}/api/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    category: selectedCat,
                    message: msg,
                    page_url: window.location.href,
                    ...(selectedRating ? { rating: selectedRating } : {}),
                }),
            });

            if (res.ok) {
                formArea.style.display = 'none';
                successEl.style.display = 'block';
            } else {
                const data = await res.json().catch(() => ({}));
                errorEl.textContent = data.error?.message || 'Gagal mengirim. Coba lagi.';
                errorEl.style.display = 'block';
            }
        } catch {
            errorEl.textContent = 'Koneksi gagal. Coba lagi.';
            errorEl.style.display = 'block';
        } finally {
            submitBtn.textContent = 'Kirim Feedback';
            (submitBtn as HTMLButtonElement).disabled = false;
        }
    });

    // Reset to form
    resetBtn?.addEventListener('click', () => {
        formArea.style.display = 'block';
        successEl.style.display = 'none';
        msgInput.value = '';
        selectedRating = null;
        stars.forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.fb-cat-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
        selectedCat = 'saran';
        close();
    });
}
