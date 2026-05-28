// ═══════════════════════════════════════════════════════════════
//  DIGITALVAULT - Data Layer
// ═══════════════════════════════════════════════════════════════

const DB_KEY = 'digitalvault_db';
const SESSION_KEY = 'digitalvault_session';

function getDefaultData() {
  return {
    users: [
      { id: 'u1', email: 'admin@dv.com', password: 'admin123', name: 'Admin', role: 'admin', phone: '', avatar: '', sessions: [] },
      { id: 'u2', email: 'seller@dv.com', password: 'seller123', name: 'أحمد البائع', role: 'seller', phone: '0555123456', avatar: '', sessions: [] }
    ],
    sellers: [
      { id: 's1', userId: 'u2', commissionRate: 10, totalSales: 0, totalEarnings: 0, totalOrders: 0, isActive: true, lastActive: '', balance: 0, pendingBalance: 0, withdrawableBalance: 0 }
    ],
    products: [
      { id: 'p1', name: 'Netflix Premium', slug: 'netflix', desc: 'Netflix Premium - مشاهدة بدون إعلانات وجودة 4K', price: 1500, duration: 30, commissionRate: 10, image: '', category: 'netflix', available: true, stock: 50 },
      { id: 'p2', name: 'CapCut Pro', slug: 'capcut', desc: 'CapCut Pro - تحرير فيديو احترافي', price: 800, duration: 30, commissionRate: 10, image: '', category: 'capcut', available: true, stock: 30 },
      { id: 'p3', name: 'TikTok Ads', slug: 'tiktok', desc: 'TikTok Ads - إعلانات تيك توك احترافية', price: 2000, duration: 30, commissionRate: 10, image: '', category: 'tiktok', available: true, stock: 20 },
      { id: 'p4', name: 'Canva Pro', slug: 'canva', desc: 'Canva Pro - تصميم احترافي', price: 1200, duration: 30, commissionRate: 10, image: '', category: 'canva', available: true, stock: 40 },
      { id: 'p5', name: 'Spotify Premium', slug: 'spotify', desc: 'Spotify Premium - موسيقى بدون إعلانات', price: 900, duration: 30, commissionRate: 10, image: '', category: 'spotify', available: true, stock: 100 },
      { id: 'p6', name: 'ChatGPT Plus', slug: 'chatgpt', desc: 'ChatGPT Plus - ذكاء اصطناعي متقدم', price: 2500, duration: 30, commissionRate: 10, image: '', category: 'chatgpt', available: true, stock: 25 },
      { id: 'p7', name: 'YouTube Premium', slug: 'youtube', desc: 'YouTube Premium - فيديو بدون إعلانات', price: 1100, duration: 30, commissionRate: 10, image: '', category: 'youtube', available: true, stock: 60 },
      { id: 'p8', name: 'Disney+', slug: 'disney', desc: 'حساب Disney+ - أفلام ومسلسلات', price: 1300, duration: 30, commissionRate: 10, image: '', category: 'disney', available: true, stock: 35 }
    ],
    accounts: [
      { id: 'a1', productId: 'p1', creds: 'email:netflix1@test.com|pass:test123|pin:1234|country:US', status: 'available', orderId: null, createdAt: new Date().toISOString() },
      { id: 'a2', productId: 'p1', creds: 'email:netflix2@test.com|pass:test456|pin:5678|country:US', status: 'available', orderId: null, createdAt: new Date().toISOString() },
      { id: 'a3', productId: 'p1', creds: 'email:netflix3@test.com|pass:test789|pin:9012|country:UK', status: 'available', orderId: null, createdAt: new Date().toISOString() },
      { id: 'a4', productId: 'p2', creds: 'email:capcut1@test.com|pass:cap123', status: 'available', orderId: null, createdAt: new Date().toISOString() },
      { id: 'a5', productId: 'p3', creds: 'email:tiktok1@test.com|pass:tt123', status: 'available', orderId: null, createdAt: new Date().toISOString() },
      { id: 'a6', productId: 'p4', creds: 'email:canva1@test.com|pass:cv123', status: 'available', orderId: null, createdAt: new Date().toISOString() }
    ],
    orders: [],
    withdrawals: [],
    commissions: [],
    notifications: [],
    landingPages: [],
    aiGenerations: [],
    auditLogs: [],
    transactions: [],
    transfers: [],
    coupons: [],
    tickets: [],
    chatMessages: [],
    analytics: [],
    errorLogs: [],
    backups: [],
    settings: {
      paymentMethods: [
        { type: 'baridimob', label: 'BaridiMob', icon: '💳', minAmount: 0, details: { 'رقم الحساب': '007 99999 999999999 99', 'المالك': 'DigitalVault' }, active: true },
        { type: 'ccp', label: 'CCP', icon: '🏦', minAmount: 0, details: { 'رقم الحساب': '999999999 99', 'المالك': 'DigitalVault' }, active: true },
        { type: 'binance', label: 'Binance', icon: '🪙', minAmount: 0, details: { 'البريد': 'binance@dv.com', 'ID': '999999999' }, active: true },
        { type: 'usdt', label: 'USDT (TRC20)', icon: '💎', minAmount: 0, details: { 'العنوان': 'TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'الشبكة': 'TRC20' }, active: true }
      ],
      appName: 'DigitalVault', logoUrl: '', primaryColor: '#3b82f6',
      pushEnabled: true, emailEnabled: false,
      deepseekKey: '', deepseekModel: 'deepseek-chat',
      supabaseUrl: '', supabaseKey: '', useSupabase: false,
      bannerText: '', bannerColor: '#3b82f6',
      theme: 'dark',
      telegramBotToken: '', telegramChatId: '', telegramEnabled: false
    }
  };
}

function getDB() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) { const d = getDefaultData(); localStorage.setItem(DB_KEY, JSON.stringify(d)); return d; }
  try { const d = JSON.parse(raw); return deepMerge(getDefaultData(), d); }
  catch { return getDefaultData(); }
}

function saveDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }

function deepMerge(def, data) {
  const r = { ...def };
  for (const k of Object.keys(data)) {
    if (Array.isArray(data[k])) r[k] = data[k];
    else if (typeof data[k] === 'object' && data[k] && def[k]) r[k] = { ...def[k], ...data[k] };
    else r[k] = data[k];
  }
  return r;
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 8); }

function getSession() { try { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
function setSession(u) { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

function getCurrentUser() { return getSession(); }
function isAdmin() { const u = getSession(); return u && u.role === 'admin'; }
function isSeller() { const u = getSession(); return u && u.role === 'seller'; }
function requireAuth() { if (!getSession()) { navigate('login'); return false; } return true; }

function getSeller() {
  const u = getCurrentUser(); if (!u) return null;
  return getDB().sellers.find(s => s.userId === u.id) || null;
}

function getProduct(id) { return getDB().products.find(p => p.id === id); }
function getUser(id) { return getDB().users.find(u => u.id === id); }

function formatPrice(n) { return Number(n).toLocaleString('ar-DZ') + ' د.ج'; }

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return formatDate(d);
}

function logAudit(userId, action, entityType, entityId, details = {}) {
  const db = getDB();
  db.auditLogs.unshift({ id: genId(), userId, action, entityType, entityId, details, ip: '', agent: '', createdAt: new Date().toISOString() });
  if (db.auditLogs.length > 500) db.auditLogs = db.auditLogs.slice(0, 500);
  saveDB(db);
}

async function sendTelegramNotification(message) {
  const db = getDB();
  if (!db.settings.telegramEnabled || !db.settings.telegramBotToken || !db.settings.telegramChatId) return false;
  try {
    const url = `https://api.telegram.org/bot${db.settings.telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: db.settings.telegramChatId, text: message, parse_mode: 'HTML' })
    });
    return res.ok;
  } catch { return false; }
}

function addNotification(userId, title, message, type, data = {}) {
  const db = getDB();
  db.notifications.unshift({ id: genId(), userId, title, message, type, isRead: false, data, createdAt: new Date().toISOString() });
  if (db.notifications.length > 200) db.notifications = db.notifications.slice(0, 200);
  saveDB(db);
  if (db.settings.telegramEnabled && db.settings.telegramBotToken && db.settings.telegramChatId) {
    const tgMsg = `<b>${title}</b>\n${message}\n🕐 ${new Date().toLocaleString('ar-DZ')}`;
    sendTelegramNotification(tgMsg);
  }
}

function notifyAdmins(title, message, type, data = {}) {
  const db = getDB();
  db.users.filter(u => u.role === 'admin').forEach(u => addNotification(u.id, title, message, type, data));
}

function statusBadge(s) {
  const m = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', available: 'badge-success', sold: 'badge-secondary' };
  const l = { pending: 'قيد الانتظار', approved: 'مقبول', rejected: 'مرفوض', available: 'متاح', sold: 'تم البيع' };
  return `<span class="badge ${m[s]||'badge-info'}">${l[s]||s}</span>`;
}

function showToast(msg, type = 'success') {
  const colors = { success: '#22c55e', error: '#ef4444', warning: '#eab308', info: '#3b82f6' };
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:30px;right:30px;background:${colors[type]||colors.success};color:#fff;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:999;animation:slideUp .3s ease-out;box-shadow:0 10px 40px rgba(0,0,0,.3);direction:rtl;max-width:400px`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3000);
}

function confirmDialog(msg) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px';
    const box = document.createElement('div');
    box.style.cssText = 'background:#0a0a0f;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:28px;max-width:400px;width:100%;text-align:center';
    box.innerHTML = `<p style="font-size:16px;margin-bottom:20px;line-height:1.6">${msg}</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button id="cYes" class="btn btn-danger" style="min-width:80px">تأكيد</button>
        <button id="cNo" class="btn btn-outline" style="min-width:80px">إلغاء</button>
      </div>`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.getElementById('cYes').onclick = () => { overlay.remove(); resolve(true); };
    document.getElementById('cNo').onclick = () => { overlay.remove(); resolve(false); };
    overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
  });
}

// ═══════════════════════════════════════════════════════════════
//  FILE UPLOAD UTILITY
// ═══════════════════════════════════════════════════════════════

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) { reject(new Error('حجم الملف يتجاوز 5 ميجابايت')); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ═══════════════════════════════════════════════════════════════
//  WALLET HELPERS
// ═══════════════════════════════════════════════════════════════

function addTransaction(sellerId, type, amount, description, refId = '') {
  const db = getDB();
  db.transactions.unshift({ id: genId(), sellerId, type, amount, description, refId, balance: 0, createdAt: new Date().toISOString() });
  if (db.transactions.length > 500) db.transactions = db.transactions.slice(0, 500);
  saveDB(db);
}

function addTransfer(fromSellerId, toSellerId, amount, note = '') {
  const db = getDB();
  db.transfers.unshift({ id: genId(), fromSellerId, toSellerId, amount, note, status: 'completed', createdAt: new Date().toISOString() });
  const from = db.sellers.find(s => s.id === fromSellerId);
  const to = db.sellers.find(s => s.id === toSellerId);
  if (from && to && from.withdrawableBalance >= amount) {
    from.withdrawableBalance -= amount;
    to.withdrawableBalance += amount;
    addTransaction(fromSellerId, 'transfer_out', -amount, `تحويل إلى ${to.userId}`, note);
    addTransaction(toSellerId, 'transfer_in', amount, `تحويل من ${from.userId}`, note);
  }
  saveDB(db);
}

function recalcWallet(sellerId) {
  const db = getDB();
  const s = db.sellers.find(x => x.id === sellerId);
  if (!s) return;
  const approvedOrders = db.orders.filter(o => o.sellerId === s.userId && o.status === 'approved');
  const total = approvedOrders.reduce((sum, o) => {
    const comm = db.commissions.find(c => c.orderId === o.id);
    return sum + (comm ? comm.amount : 0);
  }, 0);
  const withdrawn = db.withdrawals.filter(w => w.sellerId === sellerId && w.status === 'approved').reduce((a, w) => a + w.amount, 0);
  const pendingOrders = db.orders.filter(o => o.sellerId === s.userId && o.status === 'pending');
  const pendingTotal = pendingOrders.reduce((sum, o) => {
    const comm = db.commissions.find(c => c.orderId === o.id);
    return sum + (comm ? comm.amount : 0);
  }, 0);
  s.balance = total;
  s.pendingBalance = pendingTotal;
  s.withdrawableBalance = Math.max(0, total - withdrawn);
  saveDB(db);
}

// ═══════════════════════════════════════════════════════════════
//  COUPON HELPERS
// ═══════════════════════════════════════════════════════════════

function validateCoupon(code, productId) {
  const db = getDB();
  const c = db.coupons.find(x => x.code.toLowerCase() === code.toLowerCase());
  if (!c) return { valid: false, reason: 'كوبون غير صالح' };
  if (!c.active) return { valid: false, reason: 'الكوبون غير نشط' };
  if (new Date(c.expiresAt) < new Date()) return { valid: false, reason: 'الكوبون منتهي الصلاحية' };
  if (c.usedCount >= c.usageLimit) return { valid: false, reason: 'تم استنفاد عدد الاستخدامات' };
  if (c.productId && c.productId !== productId) return { valid: false, reason: 'هذا الكوبون غير صالح لهذا المنتج' };
  return { valid: true, coupon: c };
}

function applyCoupon(code, productId, price) {
  const check = validateCoupon(code, productId);
  if (!check.valid) return { ...check, finalPrice: price, discount: 0 };
  const c = check.coupon;
  let discount = c.type === 'percentage' ? Math.round(price * c.value / 100) : c.value;
  discount = Math.min(discount, price);
  return { valid: true, finalPrice: price - discount, discount, coupon: c };
}

// ═══════════════════════════════════════════════════════════════
//  SESSION HELPERS
// ═══════════════════════════════════════════════════════════════

function addSession(userId) {
  const db = getDB();
  const u = db.users.find(x => x.id === userId);
  if (!u) return;
  if (!u.sessions) u.sessions = [];
  u.sessions.unshift({ id: genId(), userAgent: navigator.userAgent.slice(0, 200), platform: navigator.platform || '', ip: '', lastActive: new Date().toISOString(), createdAt: new Date().toISOString() });
  if (u.sessions.length > 20) u.sessions = u.sessions.slice(0, 20);
  saveDB(db);
}

function removeSession(userId, sessionId) {
  const db = getDB();
  const u = db.users.find(x => x.id === userId);
  if (u && u.sessions) {
    u.sessions = u.sessions.filter(s => s.id !== sessionId);
    saveDB(db);
  }
}

// ═══════════════════════════════════════════════════════════════
//  ERROR LOGGING
// ═══════════════════════════════════════════════════════════════

function logError(source, message, details = {}) {
  const db = getDB();
  db.errorLogs.unshift({ id: genId(), source, message, details, url: window.location.href, createdAt: new Date().toISOString() });
  if (db.errorLogs.length > 200) db.errorLogs = db.errorLogs.slice(0, 200);
  saveDB(db);
  if (db.settings.telegramEnabled && db.settings.telegramBotToken && db.settings.telegramChatId) {
    sendTelegramNotification(`<b>⚠️ خطأ: ${source}</b>\n${message}\n📎 ${window.location.href}`);
  }
}

// ═══════════════════════════════════════════════════════════════
//  BACKUP HELPERS
// ═══════════════════════════════════════════════════════════════

function createBackup(label = 'يدوي') {
  const db = getDB();
  const backup = { id: genId(), label, data: JSON.stringify(db), size: new Blob([JSON.stringify(db)]).size, createdAt: new Date().toISOString() };
  db.backups.unshift(backup);
  if (db.backups.length > 30) db.backups = db.backups.slice(0, 30);
  saveDB(db);
  showToast(`✅ تم إنشاء نسخة احتياطية: ${label}`);
  return backup;
}

function restoreBackup(backupId) {
  const db = getDB();
  const b = db.backups.find(x => x.id === backupId);
  if (!b) { showToast('❌ النسخة غير موجودة', 'error'); return false; }
  try {
    const data = JSON.parse(b.data);
    Object.assign(db, data);
    saveDB(db);
    showToast('✅ تم استعادة النسخة الاحتياطية');
    return true;
  } catch (e) {
    showToast('❌ فشل استعادة النسخة: ' + e.message, 'error');
    logError('Backup', 'Restore failed', { backupId, error: e.message });
    return false;
  }
}

function exportDB() {
  const db = getDB();
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `digitalvault_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDB(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const db = getDB();
        Object.assign(db, data);
        saveDB(db);
        showToast('✅ تم استيراد البيانات بنجاح');
        resolve(true);
      } catch (e) { reject(e); }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// ═══════════════════════════════════════════════════════════════
//  AI PRICING HELPER
// ═══════════════════════════════════════════════════════════════

function getSmartPricing(productId) {
  const db = getDB();
  const p = getProduct(productId);
  if (!p) return null;
  const orders = db.orders.filter(o => o.productId === productId);
  const totalSold = orders.filter(o => o.status === 'approved').length;
  const totalRevenue = orders.filter(o => o.status === 'approved').reduce((s, o) => s + o.totalPrice, 0);
  const avgPrice = totalSold > 0 ? Math.round(totalRevenue / totalSold) : p.price;
  const competitors = db.products.filter(x => x.category === p.category && x.id !== p.id);
  const compAvg = competitors.length > 0 ? Math.round(competitors.reduce((s, x) => s + x.price, 0) / competitors.length) : 0;
  const suggestedPrice = compAvg > 0 ? Math.round((avgPrice + compAvg) / 2) : avgPrice;
  const demand = totalSold > 5 ? 'مرتفع' : totalSold > 2 ? 'متوسط' : 'منخفض';
  const bestTime = orders.length > 0 ? (() => {
    const hours = orders.map(o => new Date(o.createdAt).getHours());
    const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);
    return avgHour > 18 ? 'مساءً (بعد الساعة 6)' : avgHour > 12 ? 'بعد الظهر' : 'صباحاً';
  })() : 'غير محدد';
  return { suggestedPrice, avgPrice, compAvg, totalSold, demand, bestTime };
}

// ═══════════════════════════════════════════════════════════════
//  ANALYTICS HELPERS
// ═══════════════════════════════════════════════════════════════

function trackVisit(page) {
  const db = getDB();
  db.analytics.unshift({ id: genId(), page, referrer: document.referrer || 'direct', userAgent: navigator.userAgent.slice(0, 100), timestamp: new Date().toISOString() });
  if (db.analytics.length > 1000) db.analytics = db.analytics.slice(0, 1000);
  saveDB(db);
}

function getAnalytics() {
  const db = getDB();
  const total = db.analytics.length;
  const unique = new Set(db.analytics.map(a => a.userAgent)).size;
  const pages = {};
  db.analytics.forEach(a => { pages[a.page] = (pages[a.page] || 0) + 1; });
  const topPages = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const sources = {};
  db.analytics.forEach(a => { sources[a.referrer] = (sources[a.referrer] || 0) + 1; });
  const topSources = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const orders = db.orders.length;
  const conversions = orders > 0 ? Math.round((orders / Math.max(total, 1)) * 100) : 0;
  const bounceRate = total > 50 ? Math.round((db.analytics.filter(a => !a.page.includes('admin') && !a.page.includes('seller')).length / total) * 100) : 0;
  return { total, unique, conversions, bounceRate, topPages, topSources };
}

// ═══════════════════════════════════════════════════════════════
//  SUPABASE SYNC
// ═══════════════════════════════════════════════════════════════

function getSupabaseConfig() {
  const db = getDB();
  return { url: db.settings.supabaseUrl, key: db.settings.supabaseKey, enabled: db.settings.useSupabase };
}

async function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  const sb = getSupabaseConfig();
  if (sb.enabled && sb.url && sb.key) {
    try { await syncToSupabase(db); } catch (e) { console.warn('Supabase sync failed:', e); }
  }
}

async function syncToSupabase(data) {
  const sb = getSupabaseConfig();
  if (!sb.url || !sb.key) { showToast('بيانات Supabase غير مكتملة', 'error'); return false; }
  const tables = ['users','sellers','products','accounts','orders','commissions','withdrawals','notifications','landingPages','aiGenerations','auditLogs','settings','transactions','transfers','coupons','tickets','chatMessages','analytics','errorLogs','backups'];
  let success = 0;
  for (const table of tables) {
    try {
      const payload = { key: table, data: JSON.stringify(data[table] || []), updated_at: new Date().toISOString() };
      const res = await fetch(sb.url + '/rest/v1/digitalvault_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sb.key,
          'Authorization': 'Bearer ' + sb.key,
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok || res.status === 201) success++;
    } catch (e) { console.warn('Supabase table ' + table + ' error:', e); }
  }
  return success === tables.length;
}

async function loadFromSupabase() {
  const sb = getSupabaseConfig();
  if (!sb.url || !sb.key) { showToast('بيانات Supabase غير مكتملة', 'error'); return null; }
  const tables = ['users','sellers','products','accounts','orders','commissions','withdrawals','notifications','landingPages','aiGenerations','auditLogs','settings','transactions','transfers','coupons','tickets','chatMessages','analytics','errorLogs','backups'];
  const result = {};
  try {
    for (const table of tables) {
      const res = await fetch(sb.url + '/rest/v1/digitalvault_data?key=eq.' + table + '&select=data', {
        headers: { 'apikey': sb.key, 'Authorization': 'Bearer ' + sb.key }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].data) {
          result[table] = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
        }
      }
    }
    if (Object.keys(result).length > 0) {
      const merged = getDefaultData();
      Object.keys(result).forEach(k => { if (result[k] !== undefined) merged[k] = result[k]; });
      localStorage.setItem(DB_KEY, JSON.stringify(merged));
      showToast('✅ تم تحميل البيانات من Supabase');
      return merged;
    }
    showToast('لا توجد بيانات في Supabase', 'info');
    return null;
  } catch (e) {
    showToast('فشل التحميل من Supabase: ' + e.message, 'error');
    return null;
  }
}
