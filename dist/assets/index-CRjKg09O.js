(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const u of document.querySelectorAll('link[rel="modulepreload"]'))i(u);new MutationObserver(u=>{for(const p of u)if(p.type==="childList")for(const s of p.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(u){const p={};return u.integrity&&(p.integrity=u.integrity),u.referrerPolicy&&(p.referrerPolicy=u.referrerPolicy),u.crossOrigin==="use-credentials"?p.credentials="include":u.crossOrigin==="anonymous"?p.credentials="omit":p.credentials="same-origin",p}function i(u){if(u.ep)return;u.ep=!0;const p=t(u);fetch(u.href,p)}})();const k={product:"klinik",apiBase:"https://sains-atomic.web.id"};let y={user:null,type:null,accessToken:null},E=[];const D="klinik_access_token",A="klinik_user";function I(){y.accessToken?localStorage.setItem(D,y.accessToken):localStorage.removeItem(D),y.user?localStorage.setItem(A,JSON.stringify({user:y.user,type:y.type})):localStorage.removeItem(A)}function H(){const e=localStorage.getItem(D),a=localStorage.getItem(A);if(e&&a)try{const t=JSON.parse(a);return y.accessToken=e,y.user=t.user,y.type=t.type,!0}catch{}return!1}async function B(e,a={}){const t=new Headers(a.headers||{});return y.accessToken&&t.set("Authorization",`Bearer ${y.accessToken}`),fetch(e,{...a,headers:t,credentials:"include"})}function O(){return y.user}function _(){return y.user!==null}function j(){return y.accessToken}function U(e){return E.push(e),()=>{E=E.filter(a=>a!==e)}}function N(){E.forEach(e=>e())}async function J(e,a){try{const t=await fetch(`${k.apiBase}/api/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({email:e,password:a})});if(!t.ok){const s=await t.json().catch(()=>({}));return{ok:!1,error:s?.error?.message||s?.message||"Login gagal. Periksa email dan password."}}const i=await t.json(),u=i?.data?.access_token||i?.access_token;u&&(y.accessToken=u);const p=i?.data?.user||i?.user;return p&&(y.user={id:p.id,email:p.email,name:p.name||"",role:p.role||"subscriber",is_active:!0},y.type="subscriber"),I(),N(),{ok:!0}}catch{return{ok:!1,error:"Koneksi gagal — coba lagi."}}}async function Y(e,a,t){try{const i=await fetch(`${k.apiBase}/api/auth/register`,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({email:e,password:a,name:t})});if(!i.ok){const u=await i.json().catch(()=>({})),p=u?.error?.message||u?.message||"Registrasi gagal.";return u?.error?.code==="CONFLICT"||i.status===409?{ok:!1,error:"Email sudah terdaftar. Silakan login."}:{ok:!1,error:p}}return{ok:!0}}catch{return{ok:!1,error:"Koneksi gagal — coba lagi."}}}async function G(){try{await B(`${k.apiBase}/api/auth/logout`,{method:"POST"})}catch{}y={user:null,type:null,accessToken:null},I(),N()}async function V(){try{return(await B(`${k.apiBase}/api/access-check?product=${k.product}`)).ok}catch{return!1}}async function Q(){if(!y.accessToken)return null;try{const e=await B(`${k.apiBase}/api/auth/me`);if(!e.ok)return y={user:null,type:null,accessToken:null},I(),null;const a=await e.json(),t=a?.data||a?.user||a;return y.user={id:t.id,email:t.email,name:t.name||"",role:t.role||"subscriber",is_active:t.is_active??!0},y.type||(y.type="subscriber"),I(),y.user}catch{return null}}async function W(){return H()&&await Q()?(N(),!0):!1}function X(e,a){let t="login";function i(){e.innerHTML=`
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-logo">
            <span class="logo-icon">🏥</span>
            <span class="logo-text">Klinik</span>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab ${t==="login"?"active":""}" id="tab-login">Masuk</button>
            <button class="auth-tab ${t==="register"?"active":""}" id="tab-register">Daftar</button>
          </div>

          <div id="auth-error"></div>
          <div id="auth-success"></div>

          ${t==="login"?u():p()}
        </div>
      </div>
    `,o()}function u(){return`
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
    `}function p(){return`
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
    `}function s(n){const r=e.querySelector("#auth-error");r.innerHTML=`<div class="error-msg">${n}</div>`}function c(n){const r=e.querySelector("#auth-success");r.innerHTML=`<div class="success-msg">${n}</div>`}function b(){const n=e.querySelector("#auth-error"),r=e.querySelector("#auth-success");n&&(n.innerHTML=""),r&&(r.innerHTML="")}function f(n,r,v){const m=e.querySelector(`#${n}`);m&&(m.disabled=r,m.innerHTML=r?'<div class="spinner"></div>':v)}function o(){e.querySelector("#tab-login")?.addEventListener("click",()=>{t="login",i()}),e.querySelector("#tab-register")?.addEventListener("click",()=>{t="register",i()}),e.querySelector("#toggle-pass")?.addEventListener("click",()=>{const n=e.querySelector("#inp-pass");n&&(n.type=n.type==="password"?"text":"password")}),e.querySelector("#login-form")?.addEventListener("submit",async n=>{n.preventDefault(),b();const r=e.querySelector("#inp-email").value.trim(),v=e.querySelector("#inp-pass").value;f("login-btn",!0,"Masuk ke Klinik");const m=await J(r,v);f("login-btn",!1,"Masuk ke Klinik"),m.ok?a():s(m.error||"Login gagal.")}),e.querySelector("#register-form")?.addEventListener("submit",async n=>{n.preventDefault(),b();const r=e.querySelector("#inp-name").value.trim(),v=e.querySelector("#inp-email").value.trim(),m=e.querySelector("#inp-pass").value;f("register-btn",!0,"Buat Akun Gratis");const l=await Y(v,m,r);f("register-btn",!1,"Buat Akun Gratis"),l.ok?(c("Akun berhasil dibuat! Silakan masuk."),setTimeout(()=>{t="login",i()},1500)):s(l.error||"Registrasi gagal.")})}i()}function Z(e){return"Rp "+e.toLocaleString("id-ID")}function ee(e){return{monthly:"/ bulan","3month":"/ 3 bulan","6month":"/ 6 bulan",yearly:"/ tahun"}[e]||"/ periode"}function te(e,a){let t=[],i=null,u=!0,p=!1,s="";async function c(){u=!0,b();try{const o=await fetch(`${k.apiBase}/api/plans?product=${k.product}`);o.ok&&(t=((await o.json())?.data||[]).filter(v=>v.is_active),t.length>0&&(i=t[0].id))}catch{}u=!1,b()}function b(){e.innerHTML=`
      <div class="pricing-container">
        <div class="pricing-header">
          <div class="pricing-badge">🏥 Klinik Invoice</div>
          <h1 class="pricing-title">Pilih Paket Berlangganan</h1>
          <p class="pricing-subtitle">Buat kwitansi & invoice pasien tanpa batas. Profesional, print-ready, legal.</p>
        </div>

        ${s?`<div class="error-msg" style="max-width:480px;margin-bottom:24px;">${s}</div>`:""}

        ${u?'<div class="spinner" style="margin:40px auto"></div>':t.length===0?`<div style="text-align:center;color:var(--text-2);padding:40px">
                     Paket belum tersedia. Hubungi admin.
                   </div>`:`
            <div class="plans-grid">
              ${t.map(o=>`
                <div class="plan-card ${i===o.id?"selected":""}"
                     data-plan-id="${o.id}"
                     id="plan-${o.id}">
                  <div class="plan-name">${o.label||o.duration}</div>
                  <div class="plan-price">
                    ${Z(o.price_idr)}
                    <small>${ee(o.duration)}</small>
                  </div>
                  <ul class="plan-features">
                    <li>Invoice & kwitansi unlimited</li>
                    <li>Nomor invoice otomatis</li>
                    <li>Print & ekspor PDF</li>
                    <li>Riwayat transaksi</li>
                    <li>Support via WhatsApp</li>
                  </ul>
                </div>
              `).join("")}
            </div>

            <button id="checkout-btn" class="btn btn-primary"
                    style="max-width:320px;width:100%;font-size:16px;padding:14px"
                    ${i?"":"disabled"}>
              ${p?'<div class="spinner"></div>':"Mulai Berlangganan →"}
            </button>

            <p style="font-size:13px;color:var(--text-3);margin-top:12px;text-align:center;">
              Bayar aman via Midtrans · QRIS · Transfer Bank · GoPay
            </p>
          `}
      </div>
    `,f()}function f(){e.querySelectorAll(".plan-card").forEach(o=>{o.addEventListener("click",()=>{i=o.dataset.planId||null,e.querySelectorAll(".plan-card").forEach(r=>r.classList.remove("selected")),o.classList.add("selected");const n=e.querySelector("#checkout-btn");n&&(n.disabled=!i)})}),e.querySelector("#checkout-btn")?.addEventListener("click",async()=>{if(!(!i||p)){s="",p=!0,b();try{const o=await fetch(`${k.apiBase}/api/checkout`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${j()}`},body:JSON.stringify({plan_id:i,utm_source:"klinik-app"})}),n=await o.json();o.ok&&n?.data?.checkout_url?window.location.href=n.data.checkout_url:o.status===409?a():(s=n?.error?.message||"Gagal membuat transaksi. Coba lagi.",p=!1,b())}catch{s="Koneksi gagal. Periksa internet Anda.",p=!1,b()}}})}c(),window.location.hash.startsWith("#/payment/success")&&a()}const K="klinik_invoices",R="klinik_doctor_profile";function ae(){try{const e=localStorage.getItem(R);return e?JSON.parse(e):null}catch{return null}}function ne(e){localStorage.setItem(R,JSON.stringify(e))}function h(){try{const e=localStorage.getItem(K);return e?JSON.parse(e):[]}catch{return[]}}function F(e){localStorage.setItem(K,JSON.stringify(e))}function ie(e){const a=h(),t=a.findIndex(i=>i.id===e.id);t>=0?a[t]=e:a.unshift(e),F(a)}function oe(e){F(h().filter(a=>a.id!==e))}function se(){const e=h(),a=new Date().getFullYear(),t=e.length+1;return`INV-${a}-${String(t).padStart(4,"0")}`}function re(e){return{...e,id:crypto.randomUUID(),no:se(),createdAt:new Date().toISOString()}}function $(e){return"Rp "+e.toLocaleString("id-ID")}function S(e){return e.reduce((a,t)=>a+t.qty*t.price,0)}function le(e){return e==null?'""':`"${String(e).replace(/"/g,'""')}"`}function T(e){return e.map(le).join(",")}function C(e,a){const t=[];t.push(T(["No Invoice","Tanggal","Nama Pasien","Usia","Diagnosa / Keluhan","Layanan","Total (Rp)","Status","Nama Dokter","Nama Klinik","Catatan","Dibuat"])),e.forEach(c=>{const b=c.services.map(f=>`${f.name} (${f.qty}x Rp ${f.price.toLocaleString("id-ID")})`).join("; ");t.push(T([c.no,new Date(c.date).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric"}),c.patientName,c.patientAge||"-",c.diagnose||"-",b,S(c.services),c.status==="paid"?"Lunas":"Belum Lunas",c.doctorName,c.clinicName,c.notes||"-",new Date(c.createdAt).toLocaleDateString("id-ID")]))});const i=t.join(`\r
`),u=new Blob(["\uFEFF"+i],{type:"text/csv;charset=utf-8"}),p=URL.createObjectURL(u),s=document.createElement("a");s.href=p,s.download=a||`invoice-klinik-${new Date().toISOString().slice(0,10)}.csv`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(p)}function de(e){const a={};e.forEach(c=>{const b=new Date(c.date),f=`${b.getFullYear()}-${String(b.getMonth()+1).padStart(2,"0")}`;a[f]||(a[f]={count:0,lunas:0,pending:0,totalLunas:0,totalPending:0});const o=S(c.services);a[f].count++,c.status==="paid"?(a[f].lunas++,a[f].totalLunas+=o):(a[f].pending++,a[f].totalPending+=o)});const t=[];t.push(T(["Bulan","Total Kunjungan","Lunas","Belum Lunas","Total Lunas (Rp)","Total Piutang (Rp)","Total Bruto (Rp)"])),Object.keys(a).sort().forEach(c=>{const[b,f]=c.split("-"),o=new Date(parseInt(b),parseInt(f)-1,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"}),n=a[c];t.push(T([o,n.count,n.lunas,n.pending,n.totalLunas,n.totalPending,n.totalLunas+n.totalPending]))});const i=t.join(`\r
`),u=new Blob(["\uFEFF"+i],{type:"text/csv;charset=utf-8"}),p=URL.createObjectURL(u),s=document.createElement("a");s.href=p,s.download=`rekap-bulanan-klinik-${new Date().toISOString().slice(0,7)}.csv`,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(p)}function ce(e,a){const t=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}),i=a||"Laporan Invoice Klinik",u=e.map((r,v)=>{const m=S(r.services),l=r.services.map(g=>`${g.name} (${g.qty}×)`).join(", "),d=r.status==="paid"?'<span style="color:#059669;font-weight:700;">Lunas</span>':'<span style="color:#d97706;font-weight:700;">Pending</span>';return`
      <tr style="background:${v%2===0?"#fff":"#f8fafc"};">
        <td>${r.no}</td>
        <td>${new Date(r.date).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</td>
        <td>${r.patientName}${r.patientAge?` <span style="color:#94a3b8;font-size:11px;">(${r.patientAge})</span>`:""}</td>
        <td style="font-size:12px;color:#475569;">${l}</td>
        <td style="text-align:right;font-weight:600;font-family:monospace;">Rp ${m.toLocaleString("id-ID")}</td>
        <td style="text-align:center;">${d}</td>
      </tr>
    `}).join(""),p=e.reduce((r,v)=>r+S(v.services),0),s=e.filter(r=>r.status==="paid").reduce((r,v)=>r+S(v.services),0),c=p-s,b=e[0]?.doctorName||"",f=e[0]?.clinicName||"",o=`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>${i}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1e293b; background: #fff; padding: 32px; }
    h1 { font-size: 20px; font-weight: 800; color: #1e3a8a; margin-bottom: 4px; }
    .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; }
    .summary { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
    .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; min-width: 160px; }
    .summary-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
    .summary-value { font-size: 18px; font-weight: 700; color: #1e293b; }
    .summary-value.green { color: #059669; }
    .summary-value.orange { color: #d97706; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #1e3a8a; color: white; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
    td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    tfoot td { font-weight: 700; border-top: 2px solid #1e3a8a; background: #f8fafc; font-size: 12px; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 16px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1e3a8a;">
    <div>
      <h1>🏥 ${f||"Klinik"}</h1>
      <div class="meta">${b}${b?" · ":""}${i}</div>
    </div>
    <div style="text-align:right;font-size:12px;color:#64748b;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Dicetak</div>
      <strong>${t}</strong>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card">
      <div class="summary-label">Total Invoice</div>
      <div class="summary-value">${e.length}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Bruto</div>
      <div class="summary-value">Rp ${p.toLocaleString("id-ID")}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Sudah Lunas</div>
      <div class="summary-value green">Rp ${s.toLocaleString("id-ID")}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Piutang</div>
      <div class="summary-value orange">Rp ${c.toLocaleString("id-ID")}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>No Invoice</th>
        <th>Tanggal</th>
        <th>Pasien</th>
        <th>Layanan</th>
        <th style="text-align:right;">Total</th>
        <th style="text-align:center;">Status</th>
      </tr>
    </thead>
    <tbody>${u}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:right;">TOTAL BRUTO</td>
        <td style="text-align:right;font-family:monospace;">Rp ${p.toLocaleString("id-ID")}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>Dibuat otomatis oleh Klinik App</span>
    <span>Total ${e.length} invoice · ${e.filter(r=>r.status==="paid").length} lunas · ${e.filter(r=>r.status==="pending").length} pending</span>
  </div>

  <script>
    window.onload = () => { window.print(); }
  <\/script>
</body>
</html>`,n=window.open("","_blank");n&&(n.document.write(o),n.document.close())}function M(e,a){const{existing:t,onSave:i,onCancel:u}=a,p=!!t,s=ae()||{name:"",clinicName:"",address:"",phone:"",sip:""};let c=t?.services||[{name:"Konsultasi",qty:1,price:1e5}];function b(){return c.reduce((d,g)=>d+g.qty*g.price,0)}function f(){e.innerHTML=`
      <div class="form-card">
        <h2>${p?"✏️ Edit Invoice":"📝 Buat Invoice Baru"}</h2>

        <form id="invoice-form" autocomplete="off">

          <!-- Patient Info -->
          <fieldset style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;">
            <legend style="font-size:12px;font-weight:600;color:var(--text-3);padding:0 8px;text-transform:uppercase;">Data Pasien</legend>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Pasien *</label>
                <input id="inp-patient" class="form-input" type="text" placeholder="Nama lengkap pasien"
                  value="${t?.patientName||""}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Usia</label>
                <input id="inp-age" class="form-input" type="text" placeholder="Contoh: 35 tahun"
                  value="${t?.patientAge||""}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tanggal Kunjungan *</label>
                <input id="inp-date" class="form-input" type="date"
                  value="${t?.date||new Date().toISOString().slice(0,10)}" required />
              </div>
              <div class="form-group">
                <label class="form-label">Diagnosa / Keluhan</label>
                <input id="inp-diagnose" class="form-input" type="text" placeholder="Opsional"
                  value="${t?.diagnose||""}" />
              </div>
            </div>
          </fieldset>

          <!-- Services -->
          <fieldset style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;">
            <legend style="font-size:12px;font-weight:600;color:var(--text-3);padding:0 8px;text-transform:uppercase;">Layanan & Biaya</legend>
            <div id="services-list">
              ${o()}
            </div>
            <button type="button" id="add-service-btn" class="btn btn-ghost"
                    style="margin-top:8px;font-size:13px;padding:8px 14px;">
              + Tambah Layanan
            </button>
            <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--border-subtle);display:flex;justify-content:flex-end;">
              <div style="text-align:right;">
                <div style="font-size:12px;color:var(--text-3);margin-bottom:2px;">Total</div>
                <div id="total-display" style="font-size:22px;font-weight:700;color:var(--success);">
                  ${$(b())}
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
                  value="${s.name}" required />
              </div>
              <div class="form-group">
                <label class="form-label">SIP / Nomor Izin</label>
                <input id="inp-sip" class="form-input" type="text" placeholder="Nomor SIP (opsional)"
                  value="${s.sip||""}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nama Klinik / Praktek *</label>
                <input id="inp-clinic" class="form-input" type="text" placeholder="Klinik Sehat"
                  value="${s.clinicName}" required />
              </div>
              <div class="form-group">
                <label class="form-label">No. Telepon</label>
                <input id="inp-phone" class="form-input" type="text" placeholder="08xxx"
                  value="${s.phone||""}" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Alamat Praktek</label>
              <input id="inp-address" class="form-input" type="text" placeholder="Jl. ..."
                value="${s.address}" />
            </div>
          </fieldset>

          <!-- Notes -->
          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label">Catatan Tambahan</label>
            <input id="inp-notes" class="form-input" type="text" placeholder="Opsional — pesan untuk pasien"
              value="${t?.notes||""}" />
          </div>

          <!-- Status -->
          <div class="form-group" style="margin-bottom:24px;">
            <label class="form-label">Status Pembayaran</label>
            <select id="inp-status" class="form-input">
              <option value="paid" ${(t?.status??"paid")==="paid"?"selected":""}>✅ Sudah Lunas</option>
              <option value="pending" ${t?.status==="pending"?"selected":""}>⏳ Belum Lunas</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" id="cancel-btn" class="btn btn-ghost">Batal</button>
            <button type="submit" id="save-btn" class="btn btn-primary" style="min-width:160px;">
              ${p?"Simpan Perubahan":"✨ Buat & Preview"}
            </button>
          </div>
        </form>
      </div>
    `,l()}function o(){return c.map((d,g)=>`
      <div class="form-row" data-service-idx="${g}" style="align-items:flex-end;margin-bottom:8px;">
        <div class="form-group" style="flex:2;margin-bottom:0;">
          <label class="form-label">Nama Layanan</label>
          <input class="form-input svc-name" type="text" placeholder="Konsultasi, Obat, dll"
                 value="${d.name}" data-idx="${g}" />
        </div>
        <div class="form-group" style="flex:1;margin-bottom:0;">
          <label class="form-label">Qty</label>
          <input class="form-input svc-qty" type="number" min="1" value="${d.qty}" data-idx="${g}" style="text-align:center;" />
        </div>
        <div class="form-group" style="flex:2;margin-bottom:0;">
          <label class="form-label">Harga (Rp)</label>
          <div class="form-input-currency">
            <input class="form-input svc-price" type="number" min="0" value="${d.price}" data-idx="${g}" style="padding-left:36px;" />
          </div>
        </div>
        <button type="button" class="btn btn-danger svc-remove" data-idx="${g}"
                style="padding:10px 12px;margin-bottom:0;min-width:40px;${c.length===1?"opacity:0.3;cursor:default;":""}">
          ✕
        </button>
      </div>
    `).join("")}function n(){const d=e.querySelectorAll(".svc-name"),g=e.querySelectorAll(".svc-qty"),x=e.querySelectorAll(".svc-price");c=Array.from(d).map((w,q)=>({name:d[q].value.trim(),qty:parseInt(g[q].value)||1,price:parseInt(x[q].value)||0}))}function r(){n();const d=e.querySelector("#total-display");d&&(d.textContent=$(b()))}function v(){n();const d=e.querySelector("#services-list");d&&(d.innerHTML=o(),m()),r()}function m(){e.querySelectorAll(".svc-qty, .svc-price").forEach(d=>{d.addEventListener("input",r)}),e.querySelectorAll(".svc-remove").forEach(d=>{d.addEventListener("click",()=>{if(c.length<=1)return;const g=parseInt(d.dataset.idx);n(),c.splice(g,1),v()})})}function l(){m(),e.querySelector("#add-service-btn")?.addEventListener("click",()=>{n(),c.push({name:"",qty:1,price:0}),v()}),e.querySelector("#cancel-btn")?.addEventListener("click",u),e.querySelector("#invoice-form")?.addEventListener("submit",d=>{d.preventDefault(),n();const g={name:e.querySelector("#inp-doctor").value.trim(),clinicName:e.querySelector("#inp-clinic").value.trim(),address:e.querySelector("#inp-address").value.trim(),phone:e.querySelector("#inp-phone").value.trim(),sip:e.querySelector("#inp-sip").value.trim()};ne(g);const x={patientName:e.querySelector("#inp-patient").value.trim(),patientAge:e.querySelector("#inp-age").value.trim(),date:e.querySelector("#inp-date").value,diagnose:e.querySelector("#inp-diagnose").value.trim(),notes:e.querySelector("#inp-notes").value.trim(),status:e.querySelector("#inp-status").value,services:c,doctorName:g.name,clinicName:g.clinicName,clinicAddress:g.address};let w;t?w={...t,...x}:w=re(x),ie(w),i(w)})}f()}function z(e,a,t){const i=document.createElement("div");i.className="preview-modal-backdrop";const u=S(e.services),p=new Date(e.date).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}),s=new Date(e.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});i.innerHTML=`
    <div class="preview-modal">
      <!-- Toolbar (hidden on print) -->
      <div class="preview-toolbar">
        <span>Preview Invoice — ${e.no}</span>
        <div class="preview-toolbar-actions">
          ${t?'<button id="preview-edit-btn" class="btn btn-ghost" style="padding:6px 14px;font-size:13px;">✏️ Edit</button>':""}
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
              🏥 ${e.clinicName}
            </h1>
            ${e.clinicAddress?`<p style="font-size:13px;color:#64748b;">${e.clinicAddress}</p>`:""}
            <p style="font-size:13px;color:#64748b;">
              ${e.doctorName}
              ${e.doctorName,""}
            </p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">
              KWITANSI / INVOICE
            </div>
            <div style="font-size:18px;font-weight:800;color:#1e3a8a;">${e.no}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px;">Tanggal: ${p}</div>
            <div style="margin-top:6px;">
              <span style="
                display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:700;
                background:${e.status==="paid"?"#d1fae5":"#fef3c7"};
                color:${e.status==="paid"?"#065f46":"#92400e"};
              ">
                ${e.status==="paid"?"LUNAS":"BELUM LUNAS"}
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
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${e.patientName}</div>
            </div>
            ${e.patientAge?`
            <div>
              <div style="font-size:12px;color:#94a3b8;">Usia</div>
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${e.patientAge}</div>
            </div>`:""}
            ${e.diagnose?`
            <div style="grid-column:1/-1;">
              <div style="font-size:12px;color:#94a3b8;">Diagnosa / Keluhan</div>
              <div style="font-size:14px;color:#334155;">${e.diagnose}</div>
            </div>`:""}
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
            ${e.services.map((c,b)=>`
              <tr style="border-bottom:1px solid ${b===e.services.length-1?"transparent":"#e2e8f0"};">
                <td style="padding:10px 12px;font-size:14px;color:#1e293b;">${c.name||"-"}</td>
                <td style="padding:10px 12px;text-align:center;font-size:14px;color:#475569;">${c.qty}</td>
                <td style="padding:10px 12px;text-align:right;font-size:14px;color:#475569;font-family:monospace;">${$(c.price)}</td>
                <td style="padding:10px 12px;text-align:right;font-size:14px;font-weight:600;color:#1e293b;font-family:monospace;">${$(c.qty*c.price)}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot>
            <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
              <td colspan="3" style="padding:12px;font-weight:700;font-size:14px;color:#475569;text-align:right;">TOTAL</td>
              <td style="padding:12px;text-align:right;font-size:20px;font-weight:800;color:#1e3a8a;font-family:monospace;">${$(u)}</td>
            </tr>
          </tfoot>
        </table>

        ${e.notes?`
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
          <div style="font-size:12px;font-weight:700;color:#92400e;margin-bottom:4px;">Catatan</div>
          <div style="font-size:13px;color:#78350f;">${e.notes}</div>
        </div>`:""}

        <!-- Signature -->
        <div style="display:flex;justify-content:flex-end;margin-top:32px;">
          <div style="text-align:center;min-width:180px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:48px;">${p}</div>
            <div style="border-top:1px solid #334155;padding-top:8px;">
              <div style="font-size:13px;font-weight:600;color:#1e293b;">${e.doctorName}</div>
              <div style="font-size:11px;color:#94a3b8;">${e.clinicName}</div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center;">
          Dibuat via Klinik App · ${s}
        </div>

      </div><!-- /invoice-paper -->
    </div><!-- /preview-modal -->
  `,document.body.appendChild(i),i.querySelector("#preview-close-btn")?.addEventListener("click",()=>{i.remove(),a()}),i.querySelector("#preview-print-btn")?.addEventListener("click",()=>{const c=i.querySelector("#invoice-print-area"),b=document.body.innerHTML;document.body.innerHTML=c.outerHTML,window.print(),document.body.innerHTML=b,window.location.reload()}),t&&i.querySelector("#preview-edit-btn")?.addEventListener("click",()=>{i.remove(),t()}),i.addEventListener("click",c=>{c.target===i&&(i.remove(),a())})}function pe(e){let a="",t="all",i="";function u(){let o=h();if(a){const n=a.toLowerCase();o=o.filter(r=>r.patientName.toLowerCase().includes(n)||r.no.toLowerCase().includes(n)||(r.diagnose||"").toLowerCase().includes(n))}return t!=="all"&&(o=o.filter(n=>n.status===t)),i&&(o=o.filter(n=>n.date.startsWith(i))),o}function p(){const o=new Set;return h().forEach(n=>{n.date&&o.add(n.date.slice(0,7))}),Array.from(o).sort()}function s(){const o=h(),n=u(),r=o.filter(l=>l.status==="paid").reduce((l,d)=>l+S(d.services),0),v=o.filter(l=>l.status==="pending").length,m=a||t!=="all"||i;e.innerHTML=`
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
            <div class="stat-value">${o.length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-label">Total Pendapatan</div>
            <div class="stat-value" style="font-size:20px;">${$(r)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-label">Belum Lunas</div>
            <div class="stat-value" style="color:var(--warning);">${v}</div>
          </div>
        </div>

        <!-- Invoice List -->
        <div class="section-card">
          <div class="section-head">
            <h2>🧾 Riwayat Invoice</h2>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              ${o.length>0?`
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
              `:""}
              <span style="font-size:12px;color:var(--text-3);">
                ${m?`${n.length} dari ${o.length}`:`${o.length}`} invoice
              </span>
            </div>
          </div>

          <!-- Filter Bar -->
          ${o.length>0?`
          <div style="padding:12px 20px;border-bottom:1px solid var(--border-subtle);display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
            <input
              id="search-input"
              class="form-input"
              type="search"
              placeholder="🔍 Cari nama pasien, no invoice..."
              value="${a}"
              style="flex:1;min-width:200px;max-width:320px;height:36px;padding:6px 12px;font-size:13px;"
            />
            <select id="filter-status" class="form-input" style="height:36px;padding:6px 10px;font-size:13px;width:auto;">
              <option value="all" ${t==="all"?"selected":""}>Semua Status</option>
              <option value="paid" ${t==="paid"?"selected":""}>✅ Lunas</option>
              <option value="pending" ${t==="pending"?"selected":""}>⏳ Belum Lunas</option>
            </select>
            <select id="filter-month" class="form-input" style="height:36px;padding:6px 10px;font-size:13px;width:auto;">
              <option value="">📅 Semua Bulan</option>
              ${p().map(l=>{const[d,g]=l.split("-"),x=new Date(parseInt(d),parseInt(g)-1,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"});return`<option value="${l}" ${i===l?"selected":""}>${x}</option>`}).join("")}
            </select>
            ${m?`
            <button id="clear-filter-btn" class="btn btn-ghost"
                    style="height:36px;padding:6px 12px;font-size:12px;color:var(--danger);">
              ✕ Reset
            </button>
            `:""}
          </div>
          `:""}

          ${o.length===0?`
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Belum ada invoice</h3>
            <p>Buat invoice pertama Anda untuk pasien hari ini</p>
            <button id="empty-new-btn" class="btn btn-primary" style="margin:0 auto;display:inline-flex;">
              + Buat Invoice Pertama
            </button>
          </div>

          `:n.length===0?`
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>Tidak ada hasil</h3>
            <p>Tidak ada invoice yang cocok dengan filter yang dipilih</p>
            <button id="clear-filter-btn2" class="btn btn-ghost" style="margin:0 auto;display:inline-flex;">
              Reset Filter
            </button>
          </div>
          `:`
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
              ${n.map(l=>`
                <tr>
                  <td style="font-family:monospace;font-size:13px;color:var(--accent);">${l.no}</td>
                  <td class="col-name">${l.patientName}</td>
                  <td>${new Date(l.date).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</td>
                  <td class="col-amount">${$(S(l.services))}</td>
                  <td>
                    <span class="badge ${l.status==="paid"?"badge-success":"badge-pending"}">
                      ${l.status==="paid"?"Lunas":"Pending"}
                    </span>
                  </td>
                  <td style="text-align:center;">
                    <div style="display:flex;gap:6px;justify-content:center;">
                      <button class="btn btn-ghost btn-preview" data-id="${l.id}"
                              style="padding:5px 10px;font-size:12px;">👁 Preview</button>
                      <button class="btn btn-ghost btn-edit" data-id="${l.id}"
                              style="padding:5px 10px;font-size:12px;">✏️</button>
                      <button class="btn btn-danger btn-delete" data-id="${l.id}"
                              style="padding:5px 10px;font-size:12px;">🗑</button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          ${m&&n.length>0?`
          <div style="padding:10px 20px;border-top:1px solid var(--border-subtle);font-size:13px;color:var(--text-3);display:flex;justify-content:space-between;align-items:center;">
            <span>Total hasil filter: <strong style="color:var(--success)">${$(n.reduce((l,d)=>l+S(d.services),0))}</strong></span>
            <span>${n.filter(l=>l.status==="paid").length} lunas · ${n.filter(l=>l.status==="pending").length} pending</span>
          </div>
          `:""}
          `}
        </div>
      </div>
    `,c()}function c(){e.querySelector("#new-invoice-btn")?.addEventListener("click",()=>b()),e.querySelector("#empty-new-btn")?.addEventListener("click",()=>b());const o=e.querySelector("#search-input");o?.addEventListener("input",()=>{a=o.value,s()});const n=e.querySelector("#filter-status");n?.addEventListener("change",()=>{t=n.value,s()});const r=e.querySelector("#filter-month");r?.addEventListener("change",()=>{i=r.value,s()});const v=d=>{d?.addEventListener("click",()=>{a="",t="all",i="",s()})};v(e.querySelector("#clear-filter-btn")),v(e.querySelector("#clear-filter-btn2"));const m=e.querySelector("#export-btn"),l=e.querySelector("#export-dropdown");m?.addEventListener("click",d=>{d.stopPropagation(),l&&(l.style.display=l.style.display==="none"?"block":"none")}),document.addEventListener("click",()=>{l&&(l.style.display="none")},{once:!0}),e.querySelector("#export-all-btn")?.addEventListener("click",()=>{C(h())}),e.querySelector("#export-filtered-btn")?.addEventListener("click",()=>{C(u(),`invoice-filter-${new Date().toISOString().slice(0,10)}.csv`)}),e.querySelector("#export-monthly-btn")?.addEventListener("click",()=>{de(h())}),e.querySelector("#export-pdf-btn")?.addEventListener("click",()=>{const d=i?`Laporan ${i}`:"Laporan Invoice Klinik";ce(u(),d)}),e.querySelectorAll(".btn-preview").forEach(d=>{d.addEventListener("click",()=>{const g=d.dataset.id,x=h().find(w=>w.id===g);x&&z(x,()=>s(),()=>f(x))})}),e.querySelectorAll(".btn-edit").forEach(d=>{d.addEventListener("click",()=>{const g=d.dataset.id,x=h().find(w=>w.id===g);x&&f(x)})}),e.querySelectorAll(".btn-delete").forEach(d=>{d.addEventListener("click",()=>{const g=d.dataset.id;confirm("Hapus invoice ini? Tindakan tidak bisa dibatalkan.")&&(oe(g),s())})})}function b(){e.innerHTML="";const o=document.createElement("div");o.className="main-content",e.appendChild(o),M(o,{onSave:n=>{z(n,()=>s(),()=>f(n))},onCancel:()=>s()})}function f(o){e.innerHTML="";const n=document.createElement("div");n.className="main-content",e.appendChild(n),M(n,{existing:o,onSave:r=>{z(r,()=>s(),()=>f(r))},onCancel:()=>s()})}s()}function ue(e,a){const t=O(),i=t?.name?t.name[0].toUpperCase():"?";e.innerHTML=`
    <nav class="nav">
      <a href="#/" class="nav-brand" id="nav-home">
        <span class="brand-icon">🏥</span>
        <span class="brand-name">Klinik</span>
      </a>
      <div class="nav-actions">
        <div class="user-badge">
          <div class="avatar">${i}</div>
          <span>${t?.name||t?.email||"Dokter"}</span>
        </div>
        <button id="logout-btn" class="btn-logout">Keluar</button>
      </div>
    </nav>
  `,e.querySelector("#logout-btn")?.addEventListener("click",async()=>{confirm("Yakin ingin keluar?")&&(await G(),a())})}function me(){if(document.getElementById("feedback-fab"))return;const e=document.createElement("div");e.id="feedback-fab",e.innerHTML=`
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
              ${[1,2,3,4,5].map(a=>`
                <button class="star-btn" data-val="${a}" title="${a} bintang"
                        style="font-size:22px;background:none;border:none;cursor:pointer;opacity:.4;transition:opacity .15s;">★</button>
              `).join("")}
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
  `,document.body.appendChild(e),fe(),ge()}function fe(){if(document.getElementById("feedback-fab-styles"))return;const e=document.createElement("style");e.id="feedback-fab-styles",e.textContent=`
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
  `,document.head.appendChild(e)}function ge(){const e=document.getElementById("feedback-trigger"),a=document.getElementById("feedback-modal"),t=document.getElementById("feedback-close"),i=document.getElementById("feedback-submit"),u=document.getElementById("feedback-reset"),p=document.getElementById("feedback-msg"),s=document.getElementById("feedback-error"),c=document.getElementById("feedback-form-area"),b=document.getElementById("feedback-success");let f="saran",o=null;const n=()=>{a.style.display="flex",p.focus()},r=()=>{a.style.display="none"};e.addEventListener("click",n),t.addEventListener("click",r),a.addEventListener("click",m=>{m.target===a&&r()}),document.querySelectorAll(".fb-cat-btn").forEach(m=>{m.addEventListener("click",()=>{document.querySelectorAll(".fb-cat-btn").forEach(l=>l.classList.remove("active")),m.classList.add("active"),f=m.dataset.cat})});const v=document.querySelectorAll(".star-btn");v.forEach(m=>{m.addEventListener("click",()=>{o=parseInt(m.dataset.val),v.forEach((l,d)=>l.classList.toggle("active",d<o))}),m.addEventListener("mouseenter",()=>{const l=parseInt(m.dataset.val);v.forEach((d,g)=>d.classList.toggle("hovered",g<l))}),m.addEventListener("mouseleave",()=>{v.forEach(l=>l.classList.remove("hovered"))})}),i.addEventListener("click",async()=>{const m=p.value.trim();if(s.style.display="none",m.length<10){s.textContent="Pesan minimal 10 karakter ya.",s.style.display="block";return}i.textContent="Mengirim...",i.disabled=!0;try{const l=j(),d=await fetch(`${k.apiBase}/api/feedback`,{method:"POST",headers:{"Content-Type":"application/json",...l?{Authorization:`Bearer ${l}`}:{}},body:JSON.stringify({category:f,message:m,page_url:window.location.href,...o?{rating:o}:{}})});if(d.ok)c.style.display="none",b.style.display="block";else{const g=await d.json().catch(()=>({}));s.textContent=g.error?.message||"Gagal mengirim. Coba lagi.",s.style.display="block"}}catch{s.textContent="Koneksi gagal. Coba lagi.",s.style.display="block"}finally{i.textContent="Kirim Feedback",i.disabled=!1}}),u?.addEventListener("click",()=>{c.style.display="block",b.style.display="none",p.value="",o=null,v.forEach(m=>m.classList.remove("active")),document.querySelectorAll(".fb-cat-btn").forEach((m,l)=>m.classList.toggle("active",l===0)),f="saran",r()})}const L=document.getElementById("app");L.innerHTML=`
  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;gap:12px;color:var(--text-3)">
    <div class="spinner" style="border-color:var(--border);border-top-color:var(--accent)"></div>
    <span style="font-size:14px">Memuat...</span>
  </div>
`;W().then(async e=>{e?await P():be()});function be(){L.innerHTML="",X(L,async()=>{L.innerHTML="",await P()})}function ve(){L.innerHTML="",te(L,async()=>{L.innerHTML="",await P()})}async function P(){if(!(O()?.role==="admin")&&!await V()){ve();return}L.innerHTML=`
    <div id="nav-container"></div>
    <div id="main-container"></div>
  `;const t=document.getElementById("nav-container"),i=document.getElementById("main-container");ue(t,()=>{window.location.reload()}),pe(i),me(),U(()=>{_()||window.location.reload()})}
