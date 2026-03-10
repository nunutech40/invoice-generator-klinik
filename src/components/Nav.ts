// ── Nav Component ─────────────────────────────────────────────────────
import { getUser, logout } from '../core/auth';

export function renderNav(container: HTMLElement, onLogout: () => void) {
  const user = getUser();
  const initial = user?.name ? user.name[0].toUpperCase() : '?';

  container.innerHTML = `
    <nav class="nav">
      <a href="#/" class="nav-brand" id="nav-home">
        <span class="brand-icon">🏥</span>
        <span class="brand-name">Klinik</span>
      </a>
      <div class="nav-actions">
        <div class="user-badge">
          <div class="avatar">${initial}</div>
          <span class="user-name">${user?.name || user?.email || 'Dokter'}</span>
        </div>
        <button id="logout-btn" class="btn-logout">Keluar</button>
      </div>
    </nav>
  `;

  container.querySelector('#logout-btn')?.addEventListener('click', async () => {
    if (confirm('Yakin ingin keluar?')) {
      await logout();
      onLogout();
    }
  });
}
