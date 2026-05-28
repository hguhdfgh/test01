// ═══════════════════════════════════════════════════════════════
//  DIGITALVAULT - Main Application
// ═══════════════════════════════════════════════════════════════

let currentRoute = 'login';

function navigate(route) {
  currentRoute = route;
  render(route);
  window.scrollTo(0, 0);
}

function render(route) {
  const app = document.getElementById('app');
  if (route === 'login' || route === 'register') {
    const db = getDB();
    applyTheme(db.settings.theme);
    app.innerHTML = renderAuth(route);
    if (route === 'login') { setTimeout(attachLogin, 50); }
    else { setTimeout(attachRegister, 50); }
    return;
  }
  if (!requireAuth()) return;
    app.innerHTML = renderDashboardLayout(route);
  setTimeout(() => {
    applyTheme(getDB().settings.theme);
    if (route !== 'login' && route !== 'register') trackVisit(route);
    attachDashboardEvents(route);
    const content = document.getElementById('pageContent');
    if (content) content.innerHTML = getPageContent(route);
    setTimeout(() => attachPageEvents(route), 50);
  }, 50);
}

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD LAYOUT
// ═══════════════════════════════════════════════════════════════

function renderDashboardLayout(route) {
  const u = getCurrentUser();
  const isAdm = u.role === 'admin';
  const navItems = isAdm
    ? [{ icon:'fa-chart-pie', label:'لوحة التحكم', id:'admin' },
       { icon:'fa-box', label:'المنتجات', id:'admin-products' },
       { icon:'fa-database', label:'الحسابات', id:'admin-accounts' },
       { icon:'fa-cart-shopping', label:'الطلبات', id:'admin-orders' },
       { icon:'fa-users', label:'البائعين', id:'admin-sellers' },
       { icon:'fa-wand-magic-sparkles', label:'AI Landing', id:'admin-ai' },
       { icon:'fa-wallet', label:'المحافظ', id:'admin-wallet-all' },
       { icon:'fa-tags', label:'الكوبونات', id:'admin-coupons' },
       { icon:'fa-chart-bar', label:'Analytics', id:'admin-analytics' },
       { icon:'fa-headset', label:'الدعم', id:'admin-tickets' },
       { icon:'fa-comment-dots', label:'المحادثات', id:'admin-chat' },
       { icon:'fa-gear', label:'الإعدادات', id:'admin-settings' },
       { icon:'fa-bell', label:'الإشعارات', id:'admin-notifications' },
       { icon:'fa-clock-rotate', label:'السجلات', id:'admin-logs' },
       { icon:'fa-comments', label:'CRM واتساب', id:'admin-crm' },
       { icon:'fa-robot', label:'DeepSeek AI', id:'admin-deepseek' },
       { icon:'fa-money-bill-transfer', label:'السحوبات', id:'admin-withdrawals' },
       { icon:'fa-database', label:'النسخ الاحتياطي', id:'admin-backups' },
       { icon:'fa-bug', label:'الأخطاء', id:'admin-errors' },
       { icon:'fa-laptop', label:'الجلسات', id:'admin-sessions' }]
    : [{ icon:'fa-chart-simple', label:'الرئيسية', id:'seller' },
       { icon:'fa-box', label:'المنتجات', id:'seller-products' },
       { icon:'fa-cart-plus', label:'طلباتي', id:'seller-orders' },
       { icon:'fa-wallet', label:'المحفظة', id:'seller-wallet' },
       { icon:'fa-exchange-alt', label:'التحويلات', id:'seller-transfers' },
       { icon:'fa-user', label:'الملف الشخصي', id:'seller-profile' },
       { icon:'fa-bell', label:'الإشعارات', id:'seller-notifications' },
       { icon:'fa-money-bill-transfer', label:'السحوبات', id:'seller-withdrawals' },
       { icon:'fa-comment-dots', label:'المحادثات', id:'seller-chat' },
       { icon:'fa-ticket', label:'التذاكر', id:'seller-tickets' },
       { icon:'fa-robot', label:'AI مساعد', id:'seller-aiassist' }];

  const s = getDB().settings;
  const banner = route !== 'login' && route !== 'register' && s.bannerText ? `<div class="banner-bar"><i class="fas fa-bullhorn" style="color:${s.bannerColor||'var(--primary)'}"></i><p>${s.bannerText}</p></div>` : '';
  const qbItems = isAdm
    ? [{icon:'fa-plus',label:'منتج',onclick:"navigate('admin-products');setTimeout(openProductModal,100)"},{icon:'fa-database',label:'حساب',onclick:"navigate('admin-accounts');setTimeout(openAddAccount,100)"},{icon:'fa-cart-shopping',label:'طلبات',onclick:"navigate('admin-orders')"},{icon:'fa-robot',label:'DeepSeek',onclick:"navigate('admin-deepseek')"},{icon:'fa-comments',label:'واتساب',onclick:"navigate('admin-crm')"}]
    : [{icon:'fa-cart-plus',label:'طلب جديد',onclick:"navigate('seller-orders')"},{icon:'fa-box',label:'المنتجات',onclick:"navigate('seller-products')"}];

  return `<div class="app">
    <aside class="sidebar glass" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon gradient-bg" style="color:#fff">DV</div>
        <span class="gradient-text">DigitalVault</span>
      </div>
      <nav class="sidebar-nav">
        ${navItems.map(n => `<a href="#" class="${route === n.id ? 'active' : ''}" onclick="navigate('${n.id}')"><i class="fas ${n.icon}"></i><span>${n.label}</span></a>`).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="avatar gradient-bg" style="color:#fff">${u.name.charAt(0)}</div>
          <div><div style="font-size:13px;font-weight:600">${u.name}</div><div style="font-size:11px;color:var(--muted)">${isAdm ? 'مدير النظام' : 'بائع'}</div></div>
        </div>
        <button class="btn btn-ghost w-full btn-sm" onclick="clearSession();navigate('login')"><i class="fas fa-right-from-bracket"></i> تسجيل خروج</button>
      </div>
    </aside>
    <main class="main" id="mainContent">
      <div class="topbar">
        <div class="topbar-left">
          <button class="btn btn-ghost btn-icon" onclick="toggleSidebar()" id="menuBtn" style="display:none"><i class="fas fa-bars"></i></button>
          <h2 style="font-size:18px;font-weight:700">${isAdm ? 'لوحة تحكم الأدمين' : 'لوحة تحكم البائع'}</h2>
        </div>
        <div class="topbar-right">
          <button class="theme-btn" onclick="toggleTheme()" title="تبديل الثيم" id="themeToggle"><i class="fas fa-moon" id="themeIcon"></i></button>
          <div class="relative">
            <button class="btn btn-ghost btn-icon" onclick="toggleNotif()"><i class="fas fa-bell"></i><span id="notifBadge" style="position:absolute;top:4px;right:4px;width:16px;height:16px;background:var(--danger);border-radius:50%;font-size:9px;display:flex;align-items:center;justify-content:center;color:#fff;display:none"></span></button>
            <div class="notif-dropdown glass" id="notifDropdown"></div>
          </div>
          <span style="font-size:13px;color:var(--text-muted)">${u.name}</span>
        </div>
      </div>
      ${banner}
      <div class="content" id="pageContent"></div>
    </main>
    <nav class="bottom-nav glass">
      <div class="bottom-nav-inner">
        ${navItems.slice(0,5).map(n => `<a href="#" class="bottom-nav-item ${route === n.id ? 'active' : ''}" onclick="navigate('${n.id}')"><i class="fas ${n.icon}"></i><span>${n.label}</span></a>`).join('')}
      </div>
    </nav>
    <div class="quick-bar-wrap" id="quickBarWrap">
      <div class="quick-bar-menu glass" id="quickBarMenu">${qbItems.map(q => `<a href="#" class="qb-item" onclick="${q.onclick};toggleQuickBar(event)"><i class="fas ${q.icon}"></i> ${q.label}</a>`).join('')}</div>
      <button class="quick-bar-btn gradient-bg" id="quickBarBtn" onclick="toggleQuickBar(event)"><i class="fas fa-plus" id="quickBarIcon"></i></button>
    </div>
  </div>`;
}

function toggleSidebar() {
  document.getElementById('sidebar')?.classList.toggle('open');
}

function toggleQuickBar(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('quickBarMenu');
  const icon = document.getElementById('quickBarIcon');
  if (!menu) return;
  const isOpen = menu.classList.toggle('active');
  icon.className = isOpen ? 'fas fa-times' : 'fas fa-plus';
}

document.addEventListener('click', function(e) {
  const wrap = document.getElementById('quickBarWrap');
  if (wrap && !wrap.contains(e.target)) {
    const menu = document.getElementById('quickBarMenu');
    const icon = document.getElementById('quickBarIcon');
    if (menu?.classList.contains('active')) {
      menu.classList.remove('active');
      if (icon) icon.className = 'fas fa-plus';
    }
  }
});

function attachDashboardEvents(route) {
  if (window.innerWidth <= 768) {
    const btn = document.getElementById('menuBtn');
    if (btn) btn.style.display = 'block';
  }
  renderNotifDropdown();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.addEventListener('click', () => { if (window.innerWidth <= 768) document.getElementById('sidebar')?.classList.remove('open'); });
  });
}

function renderNotifDropdown() {
  const u = getCurrentUser(); if (!u) return;
  const db = getDB();
  const notifs = db.notifications.filter(n => n.userId === u.id).slice(0, 10);
  const unread = db.notifications.filter(n => n.userId === u.id && !n.isRead).length;
  const badge = document.getElementById('notifBadge');
  if (badge) {
    badge.style.display = unread > 0 ? 'flex' : 'none';
    badge.textContent = unread > 9 ? '9+' : unread;
  }
  const dd = document.getElementById('notifDropdown');
  if (!dd) return;
  if (notifs.length === 0) {
    dd.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px">لا توجد إشعارات</div>';
  } else {
    const icons = { order_new:'fa-cart-plus', order_approved:'fa-check-circle', order_rejected:'fa-times-circle', stock_low:'fa-exclamation-triangle', system:'fa-bell', commission:'fa-dollar-sign' };
    dd.innerHTML = notifs.map(n => `<div class="notif-item" onclick="markNotifRead('${n.id}')">
      <div class="icon" style="background:${n.isRead ? 'var(--surface)' : 'rgba(59,130,246,.12)'}"><i class="fas ${icons[n.type]||'fa-bell'}" style="color:${n.isRead ? 'var(--muted)' : 'var(--primary)'}"></i></div>
      <div class="text"><h4>${n.title}</h4><p>${n.message}</p></div>
      <div class="time">${timeAgo(n.createdAt)}</div>
    </div>`).join('');
  }
}

function toggleNotif() {
  document.getElementById('notifDropdown')?.classList.toggle('active');
}

function markNotifRead(id) {
  const db = getDB();
  const n = db.notifications.find(x => x.id === id);
  if (n) n.isRead = true;
  saveDB(db);
  renderNotifDropdown();
}

// ═══════════════════════════════════════════════════════════════
//  PAGE CONTENT DISPATCHER
// ═══════════════════════════════════════════════════════════════

function getPageContent(route) {
  const pages = {
    'admin': renderAdminDashboard,
    'admin-products': renderAdminProducts,
    'admin-accounts': renderAdminAccounts,
    'admin-orders': renderAdminOrders,
    'admin-sellers': renderAdminSellers,
    'admin-ai': renderAdminAI,
    'admin-settings': renderAdminSettings,
    'admin-notifications': renderNotifPage,
    'admin-logs': renderAuditLogs,
    'admin-crm': renderAdminCRM,
    'admin-deepseek': renderAdminDeepSeek,
    'admin-withdrawals': renderAdminWithdrawals,
    'seller': renderSellerDashboard,
    'seller-products': renderSellerProducts,
    'seller-orders': renderSellerOrders,
    'seller-profile': renderSellerProfile,
    'seller-notifications': renderNotifPage,
    'seller-withdrawals': renderSellerWithdrawals,
    'seller-wallet': renderSellerWallet,
    'seller-transfers': renderSellerTransfers,
    'seller-chat': renderSellerChat,
    'seller-tickets': renderSellerTickets,
    'seller-aiassist': renderSellerAIAssist,
    'admin': renderAdminDashboard,
    'admin-products': renderAdminProducts,
    'admin-accounts': renderAdminAccounts,
    'admin-orders': renderAdminOrders,
    'admin-sellers': renderAdminSellers,
    'admin-ai': renderAdminAI,
    'admin-settings': renderAdminSettings,
    'admin-notifications': renderNotifPage,
    'admin-logs': renderAuditLogs,
    'admin-crm': renderAdminCRM,
    'admin-deepseek': renderAdminDeepSeek,
    'admin-withdrawals': renderAdminWithdrawals,
    'admin-coupons': renderAdminCoupons,
    'admin-tickets': renderAdminTickets,
    'admin-chat': renderAdminChat,
    'admin-analytics': renderAdminAnalytics,
    'admin-backups': renderAdminBackups,
    'admin-errors': renderAdminErrors,
    'admin-sessions': renderAdminSessions,
    'admin-wallet-all': renderAdminWalletAll,
  };
  const fn = pages[route];
  if (!fn) return '<div class="empty-state"><i class="fas fa-circle-exclamation"></i><h3>الصفحة غير موجودة</h3></div>';
  return fn();
}

function attachPageEvents(route) {
  const handlers = {
    'admin-products': attachAdminProducts,
    'admin-accounts': attachAdminAccounts,
    'admin-orders': attachAdminOrders,
    'admin-sellers': attachAdminSellers,
    'admin-ai': attachAdminAI,
    'admin-settings': attachAdminSettings,
    'admin-crm': attachAdminCRM,
    'admin-deepseek': attachAdminDeepSeek,
    'admin-withdrawals': attachAdminWithdrawals,
    'admin-coupons': attachAdminCoupons,
    'admin-tickets': attachAdminTickets,
    'admin-chat': attachAdminChat,
    'admin-analytics': attachAdminAnalytics,
    'admin-backups': attachAdminBackups,
    'admin-errors': attachAdminErrors,
    'admin-sessions': attachAdminSessions,
    'admin-wallet-all': attachAdminWalletAll,
    'seller-orders': attachSellerOrders,
    'seller-profile': attachSellerProfile,
    'seller-withdrawals': attachSellerWithdrawals,
    'seller-wallet': attachSellerWallet,
    'seller-transfers': attachSellerTransfers,
    'seller-chat': attachSellerChat,
    'seller-tickets': attachSellerTickets,
    'seller-aiassist': attachSellerAIAssist,
  };
  const fn = handlers[route];
  if (fn) setTimeout(fn, 50);
}

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS PAGE (shared between admin & seller)
// ═══════════════════════════════════════════════════════════════

function renderNotifPage() {
  const u = getCurrentUser(); if (!u) return '';
  const db = getDB();
  const notifs = db.notifications.filter(n => n.userId === u.id).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const unread = notifs.filter(n => !n.isRead).length;
  const typeLabels = { order_new:'طلب جديد', order_approved:'تم القبول', order_rejected:'تم الرفض', stock_low:'مخزون منخفض', system:'نظام', commission:'عمولة' };
  const typeIcons = { order_new:'fa-cart-plus', order_approved:'fa-check-circle', order_rejected:'fa-times-circle', stock_low:'fa-exclamation-triangle', system:'fa-bell', commission:'fa-dollar-sign' };
  return `<div class="fade-in">
    <div class="card-header">
      <div><h2 style="font-size:20px;font-weight:700">الإشعارات</h2><p style="font-size:13px;color:var(--muted)">${unread > 0 ? `لديك ${unread} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}</p></div>
      <div class="flex gap-2">
        ${unread > 0 ? `<button class="btn btn-outline btn-sm" onclick="markAllNotifRead()"><i class="fas fa-check-double"></i> تحديد الكل مقروء</button>` : ''}
        <select id="notifFilter" onchange="filterNotifs()" style="width:auto;padding:8px 14px">
          <option value="all">جميع الإشعارات</option>
          ${Object.entries(typeLabels).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="notifList">${notifs.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-bell"></i><h3>لا توجد إشعارات</h3></div>' :
      notifs.map(n => `<div class="card glass glass-hover notif-item-custom" data-type="${n.type}" style="${n.isRead?'':'border-right:3px solid var(--primary)'};padding:16px;margin-bottom:8px;cursor:pointer" onclick="markNotifRead('${n.id}');renderNotifPage();navigate('${currentRoute}')">
        <div class="flex items-start gap-3">
          <div class="icon" style="background:${n.isRead?'var(--surface)':'rgba(59,130,246,.12)'};width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center">
            <i class="fas ${typeIcons[n.type]||'fa-bell'}" style="color:${n.isRead?'var(--muted)':'var(--primary)'}"></i></div>
          <div style="flex:1"><h4 style="font-size:14px;font-weight:600">${n.title}</h4><p style="font-size:13px;color:var(--muted);margin-top:4px">${n.message}</p></div>
          <div style="font-size:11px;color:var(--muted);flex-shrink:0">${timeAgo(n.createdAt)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function filterNotifs() {
  const v = document.getElementById('notifFilter')?.value;
  document.querySelectorAll('.notif-item-custom').forEach(el => {
    el.style.display = (v === 'all' || el.dataset.type === v) ? '' : 'none';
  });
}

function markAllNotifRead() {
  const u = getCurrentUser(); if (!u) return;
  const db = getDB();
  db.notifications.filter(n => n.userId === u.id && !n.isRead).forEach(n => n.isRead = true);
  saveDB(db);
  showToast('✅ تم تحديد الكل كمقروء');
  navigate(currentRoute);
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = '';
}

// ═══════════════════════════════════════════════════════════════
//  THEME TOGGLE
// ═══════════════════════════════════════════════════════════════

function toggleTheme() {
  const db = getDB();
  const newTheme = db.settings.theme === 'light' ? 'dark' : 'light';
  db.settings.theme = newTheme;
  saveDB(db);
  applyTheme(newTheme);
}

function applyTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

// Auto-login check + apply theme
const session = getSession();
if (session) {
  const db = getDB();
  applyTheme(db.settings.theme);
  navigate(session.role === 'admin' ? 'admin' : 'seller');
} else {
  applyTheme('dark');
  navigate('login');
}
