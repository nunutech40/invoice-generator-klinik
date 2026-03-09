// ── Hash-based SPA Router ─────────────────────────────────────────────
// Adapted from atomic/src/core/router.ts

type RouteHandler = (params?: Record<string, string>) => void;

interface Route {
    pattern: RegExp;
    keys: string[];
    handler: RouteHandler;
}

const routes: Route[] = [];
let cleanupFn: (() => void) | null = null;

export function addRoute(path: string, handler: RouteHandler) {
    const keys: string[] = [];
    const pattern = new RegExp(
        '^' + path.replace(/:(\w+)/g, (_: string, key: string) => {
            keys.push(key);
            return '([^/]+)';
        }) + '$'
    );
    routes.push({ pattern, keys, handler });
}

export function setCleanup(fn: (() => void) | undefined | null) {
    cleanupFn = fn ?? null;
}

export function navigate(path: string) {
    window.location.hash = '#' + path;
}

export function resolve() {
    if (cleanupFn) { cleanupFn(); cleanupFn = null; }

    const hash = window.location.hash.slice(1) || '/';
    for (const route of routes) {
        const match = hash.match(route.pattern);
        if (match) {
            const params: Record<string, string> = {};
            route.keys.forEach((key, i) => { params[key] = match[i + 1]; });
            route.handler(params);
            return;
        }
    }
    // Fallback: redirect to home
    navigate('/');
}

export function initRouter() {
    window.addEventListener('hashchange', resolve);
    resolve();
}
