// ── Invoice Storage & Types ───────────────────────────────────────────
export interface Invoice {
    id: string;
    no: string;                  // Nomor invoice, e.g. "INV-2026-0001"
    patientName: string;
    patientAge?: string;
    date: string;                // ISO date string
    services: ServiceItem[];
    diagnose?: string;
    doctorName: string;
    clinicName: string;
    clinicAddress?: string;
    notes?: string;
    status: 'paid' | 'pending';
    createdAt: string;
}

export interface ServiceItem {
    name: string;
    qty: number;
    price: number;
}

const STORAGE_KEY = 'klinik_invoices';
const DOCTOR_KEY = 'klinik_doctor_profile';

export interface DoctorProfile {
    name: string;
    clinicName: string;
    address: string;
    phone?: string;
    sip?: string; // Surat Izin Praktik
}

// ── Doctor Profile ────────────────────────────────────────────────────

export function getDoctorProfile(): DoctorProfile | null {
    try {
        const raw = localStorage.getItem(DOCTOR_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function saveDoctorProfile(profile: DoctorProfile) {
    localStorage.setItem(DOCTOR_KEY, JSON.stringify(profile));
}

// ── Invoice Storage ───────────────────────────────────────────────────

export function getAllInvoices(): Invoice[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveAll(invoices: Invoice[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export function saveInvoice(invoice: Invoice) {
    const all = getAllInvoices();
    const idx = all.findIndex(inv => inv.id === invoice.id);
    if (idx >= 0) { all[idx] = invoice; } else { all.unshift(invoice); }
    saveAll(all);
}

export function deleteInvoice(id: string) {
    saveAll(getAllInvoices().filter(inv => inv.id !== id));
}

export function generateInvoiceNo(): string {
    const all = getAllInvoices();
    const year = new Date().getFullYear();
    const next = all.length + 1;
    return `INV-${year}-${String(next).padStart(4, '0')}`;
}

export function createNewInvoice(data: Omit<Invoice, 'id' | 'no' | 'createdAt'>): Invoice {
    return {
        ...data,
        id: crypto.randomUUID(),
        no: generateInvoiceNo(),
        createdAt: new Date().toISOString(),
    };
}

export function formatIDR(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID');
}

export function totalAmount(services: ServiceItem[]): number {
    return services.reduce((sum, s) => sum + s.qty * s.price, 0);
}
