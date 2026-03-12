// ── AuthGate Component — Login & Register for Klinik ─────────────────
import { login, register } from '../core/auth';

export function renderAuthGate(container: HTMLElement, onSuccess: () => void) {
    let mode: 'login' | 'register' = 'login';

    function render() {
        container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">
            <span class="logo-icon">🏥</span>
            <span class="logo-text">Klinik</span>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab ${mode === 'login' ? 'active' : ''}" id="tab-login">Masuk</button>
            <button class="auth-tab ${mode === 'register' ? 'active' : ''}" id="tab-register">Daftar</button>
          </div>

          <div id="auth-error"></div>
          <div id="auth-success"></div>

          ${mode === 'login' ? renderLogin() : renderRegister()}
        </div>
      </div>
    `;
        wireEvents();
    }

    function renderLogin() {
        return `
      <h2 class="auth-title">Selamat datang kembali</h2>
      <p class="auth-subtitle">Masuk untuk mengakses invoice & kwitansi Anda</p>

      <form id="login-form" autocomplete="on">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input id="inp-email" class="form-input" type="email" placeholder="dokter@email.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="form-input-wrap">
            <input id="inp-pass" class="form-input" type="password" placeholder="••••••••" autocomplete="current-password" required />
            <button type="button" class="pass-toggle" id="toggle-pass">👁</button>
          </div>
        </div>
        <button id="login-btn" class="btn btn-primary" type="submit">
          Masuk ke Klinik
        </button>
      </form>
    `;
    }

    function renderRegister() {
        return `
      <h2 class="auth-title">Buat akun baru</h2>
      <p class="auth-subtitle">Daftar dan mulai buat kwitansi profesional hari ini</p>

      <form id="register-form" autocomplete="on">
        <div class="form-group">
          <label class="form-label">Nama Lengkap</label>
          <input id="inp-name" class="form-input" type="text" placeholder="dr. Budi Santoso" autocomplete="name" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input id="inp-email" class="form-input" type="email" placeholder="dokter@email.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="form-input-wrap">
            <input id="inp-pass" class="form-input" type="password" placeholder="Min. 8 karakter" autocomplete="new-password" required minlength="8" />
            <button type="button" class="pass-toggle" id="toggle-pass">👁</button>
          </div>
        </div>
        <button id="register-btn" class="btn btn-primary" type="submit">
          Buat Akun Gratis
        </button>
      </form>
      <p style="font-size:12px;color:var(--text-3);text-align:center;margin-top:12px;">
        Dengan mendaftar, Anda menyetujui <a href="/terms.html" target="_blank">Syarat & Ketentuan</a>
      </p>
    `;
    }

    function showError(msg: string) {
        const el = container.querySelector('#auth-error')!;
        el.innerHTML = `<div class="error-msg">${msg}</div>`;
    }
    function showSuccess(msg: string) {
        const el = container.querySelector('#auth-success')!;
        el.innerHTML = `<div class="success-msg">${msg}</div>`;
    }
    function clearMessages() {
        const err = container.querySelector('#auth-error');
        const suc = container.querySelector('#auth-success');
        if (err) err.innerHTML = '';
        if (suc) suc.innerHTML = '';
    }

    function setLoading(btnId: string, loading: boolean, label: string) {
        const btn = container.querySelector(`#${btnId}`) as HTMLButtonElement | null;
        if (!btn) return;
        btn.disabled = loading;
        btn.innerHTML = loading ? '<div class="spinner"></div>' : label;
    }

    function wireEvents() {
        // Tab switching
        container.querySelector('#tab-login')?.addEventListener('click', () => {
            mode = 'login'; render();
        });
        container.querySelector('#tab-register')?.addEventListener('click', () => {
            mode = 'register'; render();
        });

        // Password toggle
        container.querySelector('#toggle-pass')?.addEventListener('click', () => {
            const inp = container.querySelector('#inp-pass') as HTMLInputElement;
            if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
        });

        // Login form
        container.querySelector('#login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();
            const email = (container.querySelector('#inp-email') as HTMLInputElement).value.trim();
            const pass = (container.querySelector('#inp-pass') as HTMLInputElement).value;
            setLoading('login-btn', true, 'Masuk ke Klinik');
            const res = await login(email, pass);
            setLoading('login-btn', false, 'Masuk ke Klinik');
            if (res.ok) { onSuccess(); } else { showError(res.error || 'Login gagal.'); }
        });

        // Register form
        container.querySelector('#register-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();
            const name = (container.querySelector('#inp-name') as HTMLInputElement).value.trim();
            const email = (container.querySelector('#inp-email') as HTMLInputElement).value.trim();
            const pass = (container.querySelector('#inp-pass') as HTMLInputElement).value;
            setLoading('register-btn', true, 'Buat Akun Gratis');
            const res = await register(email, pass, name);
            setLoading('register-btn', false, 'Buat Akun Gratis');
            if (res.ok) {
                showSuccess('Akun berhasil dibuat! Silakan masuk.');
                setTimeout(() => { mode = 'login'; render(); }, 1500);
            } else {
                showError(res.error || 'Registrasi gagal.');
                // Auto-switch to login tab if email already exists (409)
                if (res.error?.includes('sudah punya akun')) {
                    const emailValue = email;
                    setTimeout(() => {
                        mode = 'login';
                        render();
                        // Pre-fill email for convenience
                        const emailInput = container.querySelector('#inp-email') as HTMLInputElement;
                        if (emailInput) emailInput.value = emailValue;
                        showError('Akun ditemukan! Login dengan password yang sama untuk lanjut ke Klinik.');
                    }, 1500);
                }
            }
        });
    }

    render();
}
