// ── Klinik App — Entry Point ──────────────────────────────────────────
import './styles/global.css';
import { initAuth, isLoggedIn, onAuthChange, checkAccess, getUser } from './core/auth';
import { renderAuthGate } from './components/AuthGate';
import { renderPricingPage } from './components/PricingPage';
import { renderDashboard } from './components/Dashboard';
import { renderNav } from './components/Nav';
import { mountFeedbackButton } from './components/FeedbackButton';

const app = document.getElementById('app')!;

// ── Loading state ──────────────────────────────────────────────────────
app.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;gap:12px;color:var(--text-3)">
    <div class="spinner" style="border-color:var(--border);border-top-color:var(--accent)"></div>
    <span style="font-size:14px">Memuat...</span>
  </div>
`;

// ── Boot ───────────────────────────────────────────────────────────────
initAuth().then(async (loggedIn) => {
    if (loggedIn) {
        await bootApp();
    } else {
        showAuthGate();
    }
});

// ── Auth Gate ──────────────────────────────────────────────────────────
function showAuthGate() {
    app.innerHTML = '';
    renderAuthGate(app, async () => {
        app.innerHTML = '';
        await bootApp();
    });
}

// ── Pricing Page ───────────────────────────────────────────────────────
function showPricingPage() {
    app.innerHTML = '';
    renderPricingPage(app, async () => {
        app.innerHTML = '';
        await bootApp();
    });
}

// ── Full App ───────────────────────────────────────────────────────────
async function bootApp() {
    const user = getUser();
    const isAdmin = user?.role === 'admin';

    if (!isAdmin) {
        const hasAccess = await checkAccess();
        if (!hasAccess) {
            showPricingPage();
            return;
        }
    }

    // App shell
    app.innerHTML = `
    <div id="nav-container"></div>
    <div id="main-container"></div>
  `;

    const navContainer = document.getElementById('nav-container')!;
    const mainContainer = document.getElementById('main-container')!;

    renderNav(navContainer, () => {
        // On logout
        window.location.reload();
    });

    renderDashboard(mainContainer);
    mountFeedbackButton();

    // Watch for logout
    onAuthChange(() => {
        if (!isLoggedIn()) window.location.reload();
    });
}
