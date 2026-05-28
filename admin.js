// ═══════════════════════════════════════════════════════════════
//  ADMIN PAGES
// ═══════════════════════════════════════════════════════════════

// ─── Dashboard ───
function renderAdminDashboard() {
  const db = getDB();
  const totalRevenue = db.orders.filter(o => o.status === 'approved').reduce((s, o) => s + o.totalPrice, 0);
  const totalOrders = db.orders.length;
  const pendingOrders = db.orders.filter(o => o.status === 'pending').length;
  const availableAccs = db.accounts.filter(a => a.status === 'available').length;
  const topSellers = [...db.sellers].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);
  const recentOrders = [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  const monthlyData = {};
  db.orders.filter(o => o.status === 'approved').forEach(o => {
    if (!o.createdAt) return;
    const m = new Date(o.createdAt).toLocaleString('ar-SA', { month: 'short' });
    monthlyData[m] = (monthlyData[m] || 0) + o.totalPrice;
  });

  setTimeout(() => {
    const c = document.getElementById('salesChart');
    if (!c) return;
    new Chart(c, {
      type: 'line',
      data: { labels: Object.keys(monthlyData), datasets: [{ label: 'الإيرادات', data: Object.values(monthlyData), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)', fill: true, tension: .4 }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => v.toLocaleString() + ' د.ج' } } } }
    });
  }, 100);

  return `<div class="fade-in">
    <div class="page-title"><h1>لوحة تحكم الأدمين</h1><p>مرحباً بعودتك، ${getCurrentUser().name}</p></div>
    <div class="grid grid-4 stagger">
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(59,130,246,.12);color:var(--primary)"><i class="fas fa-dollar-sign"></i></div><div class="value">${formatPrice(totalRevenue)}</div><div class="label">إجمالي الأرباح</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(34,197,94,.12);color:var(--success)"><i class="fas fa-cart-shopping"></i></div><div class="value">${totalOrders}</div><div class="label">إجمالي الطلبات</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(234,179,8,.12);color:var(--warning)"><i class="fas fa-clock"></i></div><div class="value">${pendingOrders}</div><div class="label">طلبات معلقة</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(139,92,246,.12);color:var(--accent)"><i class="fas fa-database"></i></div><div class="value">${availableAccs}</div><div class="label">حسابات متوفرة</div></div>
    </div>
    <div class="grid grid-2" style="margin-top:20px">
      <div class="card glass"><div class="card-header"><span class="card-title"><i class="fas fa-chart-line" style="color:var(--primary)"></i> المبيعات الشهرية</span></div><canvas id="salesChart" height="200"></canvas></div>
      <div class="card glass"><div class="card-header"><span class="card-title"><i class="fas fa-trophy" style="color:var(--warning)"></i> أفضل البائعين</span></div>
        ${topSellers.length === 0 ? '<div class="empty-state" style="padding:30px"><p>لا يوجد بائعون بعد</p></div>' :
        topSellers.map((s, i) => { const u = db.users.find(x => x.id === s.userId); return `<div class="flex items-center justify-between" style="padding:10px 0;border-bottom:1px solid var(--border)"><div class="flex items-center gap-3"><div style="width:28px;height:28px;border-radius:50%;background:${i===0?'rgba(234,179,8,.2)':i===1?'rgba(156,163,175,.2)':i===2?'rgba(180,83,9,.2)':'var(--surface)'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:${i===0?'#eab308':i===1?'#9ca3af':i===2?'#b45309':'var(--muted)'}">${i+1}</div><div><div style="font-size:14px;font-weight:600">${u?u.name:'غير معروف'}</div><div style="font-size:12px;color:var(--muted)">${s.totalSales} مبيعات</div></div></div><div style="font-weight:700;color:var(--success)">${formatPrice(s.totalEarnings)}</div></div>`;}).join('')}
      </div>
    </div>
    <div class="card glass" style="margin-top:20px">
      <div class="card-header"><span class="card-title"><i class="fas fa-list" style="color:var(--primary)"></i> آخر الطلبات</span></div>
      ${recentOrders.length === 0 ? '<div class="empty-state" style="padding:30px"><p>لا توجد طلبات بعد</p></div>' :
      `<div class="table-wrap"><table><thead><tr><th>المنتج</th><th>الزبون</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>${
        recentOrders.map(o => { const p = getProduct(o.productId); return `<tr><td>${p?p.name:'—'}</td><td>${o.customerName}</td><td>${formatPrice(o.totalPrice)}</td><td>${statusBadge(o.status)}</td><td style="font-size:12px;color:var(--muted)">${formatDate(o.createdAt)}</td></tr>`; }).join('')
      }</tbody></table></div>`}
    </div>
  </div>`;
}

// ─── Products ───
function renderAdminProducts() {
  const db = getDB();
  return `<div class="fade-in">
    <div class="card-header"><div><h2 style="font-size:20px;font-weight:700">إدارة المنتجات</h2><p style="font-size:13px;color:var(--muted)">${db.products.length} منتج</p></div>
      <button class="btn btn-primary" onclick="openProductModal()"><i class="fas fa-plus"></i> إضافة منتج</button></div>
    ${db.products.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-box"></i><h3>لا توجد منتجات</h3></div>' :
    `<div class="table-wrap card glass"><table><thead><tr><th>المنتج</th><th>السعر</th><th>المدة</th><th>المخزون</th><th>العمولة</th><th>الحالة</th><th>الإجراءات</th></tr></thead><tbody>${
      db.products.map(p => `<tr><td><div style="font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--muted)">${p.category}</div></td><td>${formatPrice(p.price)}</td><td>${p.duration} يوم</td><td>${p.stock}</td><td>${p.commissionRate}%</td><td>${p.available ? '<span class="badge badge-success">متوفر</span>' : '<span class="badge badge-danger">غير متوفر</span>'}</td><td><div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="editProduct('${p.id}')"><i class="fas fa-pen"></i></button><button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button></div></td></tr>`).join('')
    }</tbody></table></div>`}
    <div id="productModal"></div>
  </div>`;
}

function attachAdminProducts() {}

function openProductModal(editId) {
  const db = getDB();
  const p = editId ? db.products.find(x => x.id === editId) : null;
  const cats = ['netflix','capcut','tiktok','canva','spotify','chatgpt','youtube','disney','other'];
  const catLabels = { netflix:'Netflix', capcut:'CapCut Pro', tiktok:'TikTok Ads', canva:'Canva Pro', spotify:'Spotify', chatgpt:'ChatGPT Plus', youtube:'YouTube Premium', disney:'Disney+', other:'أخرى' };
  document.getElementById('productModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('productModal')">
    <div class="modal glass scale-in"><button class="modal-close" onclick="closeModal('productModal')"><i class="fas fa-times"></i></button>
      <h2>${editId ? 'تعديل منتج' : 'إضافة منتج جديد'}</h2>
      <form id="productForm" onsubmit="return saveProduct(event,'${editId||''}')">
        <div class="form-grid">
          <div class="input-group"><label>اسم المنتج</label><input id="pf_name" value="${p?p.name:''}" required></div>
          <div class="input-group"><label>السعر (د.ج)</label><input id="pf_price" type="number" value="${p?p.price:''}" required min="1"></div>
          <div class="input-group"><label>المدة (أيام)</label><input id="pf_dur" type="number" value="${p?p.duration:'30'}" required min="1"></div>
          <div class="input-group"><label>العمولة (%)</label><input id="pf_comm" type="number" value="${p?p.commissionRate:'10'}" min="0" max="100"></div>
          <div class="input-group"><label>المخزون</label><input id="pf_stock" type="number" value="${p?p.stock:'0'}" min="0"></div>
          <div class="input-group"><label>التصنيف</label><select id="pf_cat">${cats.map(c => `<option value="${c}" ${p&&p.category===c?'selected':''}>${catLabels[c]}</option>`).join('')}</select></div>
          <div class="input-group full"><label>الوصف</label><textarea id="pf_desc">${p?p.desc||'':''}</textarea></div>
          <div class="input-group" style="flex-direction:row;align-items:center;gap:10px"><label>متوفر</label><label class="toggle"><input type="checkbox" id="pf_avail" ${p&&!p.available?'':'checked'}><span class="slider"></span></label></div>
        </div>
        <div class="btn-group"><button type="submit" class="btn btn-primary">${editId ? 'حفظ التغييرات' : 'إضافة المنتج'}</button><button type="button" class="btn btn-outline" onclick="closeModal('productModal')">إلغاء</button></div>
      </form>
    </div>
  </div>`;
}

function saveProduct(e, id) {
  e.preventDefault();
  const db = getDB();
  const data = {
    name: document.getElementById('pf_name').value.trim(),
    price: Number(document.getElementById('pf_price').value),
    duration: Number(document.getElementById('pf_dur').value),
    commissionRate: Number(document.getElementById('pf_comm').value) || 10,
    stock: Number(document.getElementById('pf_stock').value) || 0,
    category: document.getElementById('pf_cat').value,
    desc: document.getElementById('pf_desc').value.trim(),
    available: document.getElementById('pf_avail').checked,
  };
  if (!data.name) { showToast('اسم المنتج مطلوب', 'error'); return; }
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  if (id) {
    const idx = db.products.findIndex(x => x.id === id);
    if (idx >= 0) db.products[idx] = { ...db.products[idx], ...data, slug };
    showToast('✅ تم تعديل المنتج');
  } else {
    db.products.push({ id: genId(), ...data, slug, image: '' });
    showToast('✅ تم إضافة المنتج');
  }
  saveDB(db); closeModal('productModal'); navigate('admin-products');
}

function editProduct(id) { openProductModal(id); }

async function deleteProduct(id) {
  const p = getProduct(id); if (!p) return;
  if (!await confirmDialog(`حذف "${p.name}"؟`)) return;
  const db = getDB(); db.products = db.products.filter(x => x.id !== id);
  saveDB(db); showToast('✅ تم حذف المنتج'); navigate('admin-products');
}

// ─── Accounts ───
function renderAdminAccounts() {
  const db = getDB();
  const accs = [...db.accounts].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  return `<div class="fade-in">
    <div class="card-header"><div><h2 style="font-size:20px;font-weight:700">الحسابات الرقمية</h2><p style="font-size:13px;color:var(--muted)">${accs.filter(a=>a.status==='available').length} متاح | ${accs.filter(a=>a.status==='sold').length} مباع</p></div>
      <div class="flex gap-2"><button class="btn btn-primary" onclick="openAddAccount()"><i class="fas fa-plus"></i> إضافة حساب</button><button class="btn btn-outline" onclick="openImportAccounts()"><i class="fas fa-upload"></i> استيراد</button></div></div>
    ${accs.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-database"></i><h3>لا توجد حسابات</h3></div>' :
    `<div class="table-wrap card glass"><table><thead><tr><th>المنتج</th><th>بيانات الحساب</th><th>الحالة</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>${
      accs.map(a => { const p = getProduct(a.productId); return `<tr><td>${p?p.name:'—'}</td>
        <td><span style="color:var(--muted);font-size:13px" id="creds_${a.id}">${a.creds ? a.creds.split('|')[0].split(':')[1]+'@***' : '—'}</span> <button class="btn btn-ghost btn-sm" onclick="revealCreds('${a.id}')"><i class="fas fa-eye"></i></button></td>
        <td>${statusBadge(a.status)}</td><td style="font-size:12px;color:var(--muted)">${formatDate(a.createdAt)}</td>
        <td>${a.status === 'available' ? `<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteAccount('${a.id}')"><i class="fas fa-trash"></i></button>` : ''}</td></tr>`; }).join('')
    }</tbody></table></div>`}
    <div id="accModal"></div><div id="importModal"></div>
  </div>`;
}

function attachAdminAccounts() {}

function openAddAccount() {
  const db = getDB();
  document.getElementById('accModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('accModal')">
    <div class="modal glass scale-in"><button class="modal-close" onclick="closeModal('accModal')"><i class="fas fa-times"></i></button>
      <h2>إضافة حساب</h2>
      <form onsubmit="return saveAccount(event)">
        <div class="input-group" style="margin-bottom:14px"><label>المنتج</label><select id="ac_prod">${db.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
        <div class="input-group" style="margin-bottom:14px"><label>بيانات الحساب (email:pass:pin:country)</label><textarea id="ac_creds" placeholder="email:password:1234:US" required style="min-height:80px"></textarea></div>
        <div class="btn-group"><button type="submit" class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal('accModal')">إلغاء</button></div>
      </form>
    </div></div>`;
}

function saveAccount(e) {
  e.preventDefault();
  const db = getDB();
  const pid = document.getElementById('ac_prod').value;
  const creds = document.getElementById('ac_creds').value.trim();
  if (!pid || !creds) { showToast('يرجى ملء جميع الحقول', 'error'); return; }
  db.accounts.push({ id: genId(), productId: pid, creds, status: 'available', orderId: null, createdAt: new Date().toISOString() });
  saveDB(db); showToast('✅ تم إضافة الحساب'); closeModal('accModal'); navigate('admin-accounts');
}

function openImportAccounts() {
  const db = getDB();
  document.getElementById('importModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('importModal')">
    <div class="modal glass scale-in"><button class="modal-close" onclick="closeModal('importModal')"><i class="fas fa-times"></i></button>
      <h2>استيراد حسابات</h2>
      <form onsubmit="return importAccounts(event)">
        <div class="input-group" style="margin-bottom:14px"><label>المنتج</label><select id="im_prod">${db.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
        <div class="input-group" style="margin-bottom:14px"><label>الحسابات (واحد في كل سطر)</label><textarea id="im_creds" placeholder="email1:pass1:pin1:US&#10;email2:pass2:pin2:UK" required style="min-height:120px"></textarea></div>
        <div class="btn-group"><button type="submit" class="btn btn-primary"><i class="fas fa-upload"></i> استيراد</button><button type="button" class="btn btn-outline" onclick="closeModal('importModal')">إلغاء</button></div>
      </form>
    </div></div>`;
}

function importAccounts(e) {
  e.preventDefault();
  const db = getDB();
  const pid = document.getElementById('im_prod').value;
  const lines = document.getElementById('im_creds').value.trim().split('\n').filter(l => l.trim());
  if (!pid || lines.length === 0) { showToast('يرجى إدخال حسابات', 'error'); return; }
  lines.forEach(line => { db.accounts.push({ id: genId(), productId: pid, creds: line.trim(), status: 'available', orderId: null, createdAt: new Date().toISOString() }); });
  saveDB(db); showToast(`✅ تم استيراد ${lines.length} حساب`); closeModal('importModal'); navigate('admin-accounts');
}

function revealCreds(id) {
  const db = getDB(); const a = db.accounts.find(x => x.id === id); if (!a) return;
  const el = document.getElementById('creds_'+id); if (!el) return;
  el.textContent = el.dataset.revealed === 'true' ? (a.creds.split('|')[0].split(':')[1]+'@***') : a.creds.replace(/\|/g,' | ');
  el.dataset.revealed = el.dataset.revealed === 'true' ? 'false' : 'true';
}

async function deleteAccount(id) {
  if (!await confirmDialog('حذف هذا الحساب؟')) return;
  const db = getDB(); db.accounts = db.accounts.filter(x => x.id !== id);
  saveDB(db); showToast('✅ تم حذف الحساب'); navigate('admin-accounts');
}

// ─── Orders ───
function renderAdminOrders() {
  const db = getDB();
  const orders = [...db.orders].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  return `<div class="fade-in">
    <div class="card-header"><div><h2 style="font-size:20px;font-weight:700">إدارة الطلبات</h2><p style="font-size:13px;color:var(--muted)">${orders.length} طلب | ${pendingCount} معلق</p></div>
      <select id="orderFilter" onchange="filterAdminOrders()" style="width:auto;padding:8px 14px">
        <option value="all">جميع الطلبات</option><option value="pending">قيد الانتظار</option><option value="approved">مقبول</option><option value="rejected">مرفوض</option>
      </select></div>
    ${orders.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-cart-shopping"></i><h3>لا توجد طلبات</h3></div>' :
    `<div class="table-wrap card glass"><table id="adminOrdersTable"><thead><tr><th>#</th><th>البائع</th><th>المنتج</th><th>الزبون</th><th>المبلغ</th><th>الحالة</th><th>التاريخ</th><th>الإجراءات</th></tr></thead><tbody>${
      orders.map(o => { const u = db.users.find(x => x.id === o.sellerId); const p = getProduct(o.productId); return `<tr data-status="${o.status}">
        <td style="font-size:12px;color:var(--muted)">#${o.id.slice(-5)}</td>
        <td>${u?u.name:'—'}</td><td>${p?p.name:'—'}</td>
        <td><div>${o.customerName}</div><div style="font-size:11px;color:var(--muted)">${o.customerPhone}</div></td>
        <td style="font-weight:600">${formatPrice(o.totalPrice)}</td>
        <td>${statusBadge(o.status)}</td>
        <td style="font-size:12px;color:var(--muted)">${formatDate(o.createdAt)}</td>
        <td>${o.status === 'pending' ? `<div class="flex gap-2"><button class="btn btn-success btn-sm" onclick="approveOrder('${o.id}')"><i class="fas fa-check"></i> قبول</button><button class="btn btn-danger btn-sm" onclick="rejectOrder('${o.id}')"><i class="fas fa-times"></i> رفض</button></div>` : ''}</td>
      </tr>`; }).join('')
    }</tbody></table></div>`}
  </div>`;
}

function attachAdminOrders() {}

function filterAdminOrders() {
  const v = document.getElementById('orderFilter').value;
  document.querySelectorAll('#adminOrdersTable tbody tr').forEach(tr => { tr.style.display = (v === 'all' || tr.dataset.status === v) ? '' : 'none'; });
}

async function approveOrder(id) {
  const db = getDB(); const order = db.orders.find(o => o.id === id); if (!order) return;
  const avail = db.accounts.find(a => a.productId === order.productId && a.status === 'available');
  if (!avail) { showToast('لا توجد حسابات متوفرة لهذا المنتج!', 'error'); return; }
  if (!await confirmDialog('قبول هذا الطلب؟')) return;
  const product = getProduct(order.productId);
  const commission = order.totalPrice * (product ? product.commissionRate : 10) / 100;
  order.status = 'approved'; order.accountId = avail.id;
  avail.status = 'sold'; avail.orderId = id;
  if (product) product.stock = Math.max(0, product.stock - 1);
  const seller = db.sellers.find(s => s.userId === order.sellerId);
  if (seller) { seller.totalSales++; seller.totalEarnings += commission; seller.totalOrders++; }
  db.commissions.push({ id: genId(), sellerId: seller?seller.id:'', orderId: id, amount: commission, rate: product?product.commissionRate:10, isPaid: false, createdAt: new Date().toISOString() });
  addNotification(order.sellerId, '✅ تم قبول طلبك', `تم قبول طلب ${product?product.name:''} بقيمة ${formatPrice(order.totalPrice)}`, 'order_approved');
  saveDB(db); showToast('✅ تم قبول الطلب وتم تخصيص حساب'); navigate('admin-orders');
}

async function rejectOrder(id) {
  if (!await confirmDialog('رفض هذا الطلب؟')) return;
  const db = getDB(); const order = db.orders.find(o => o.id === id); if (!order) return;
  order.status = 'rejected';
  const product = getProduct(order.productId);
  addNotification(order.sellerId, '❌ تم رفض طلبك', `تم رفض طلب ${product?product.name:''}`, 'order_rejected');
  saveDB(db); showToast('✅ تم رفض الطلب'); navigate('admin-orders');
}

// ─── Sellers ───
function renderAdminSellers() {
  const db = getDB();
  return `<div class="fade-in">
    <div class="card-header"><div><h2 style="font-size:20px;font-weight:700">إدارة البائعين</h2><p style="font-size:13px;color:var(--muted)">${db.sellers.filter(s=>s.isActive).length} بائع نشط</p></div>
      <button class="btn btn-primary" onclick="openSellerModal()"><i class="fas fa-user-plus"></i> إضافة بائع</button></div>
    ${db.sellers.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-users"></i><h3>لا يوجد بائعين</h3></div>' :
    `<div class="grid grid-2">${db.sellers.map(s => { const u = db.users.find(x => x.id === s.userId);
      const withdrawn = db.withdrawals.filter(w => w.sellerId === s.id && w.status === 'approved').reduce((a,w) => a + w.amount, 0);
      const pm = db.settings.paymentMethods.find(p => p.type === s.defaultPM);
      return `<div class="card glass glass-hover">
        <div class="flex items-center justify-between" style="margin-bottom:12px">
          <div class="flex items-center gap-3"><div class="avatar gradient-bg" style="color:#fff;width:40px;height:40px">${u?u.name.charAt(0):'?'}</div>
            <div><div style="font-weight:600">${u?u.name:'—'}</div><div style="font-size:12px;color:var(--muted)">${u?u.email:''}</div>
            ${u?.phone ? `<div style="font-size:11px;color:var(--muted);direction:ltr;text-align:right">${u.phone}</div>` : ''}</div></div>
          ${s.isActive ? '<span class="badge badge-success">نشط</span>' : '<span class="badge badge-danger">موقوف</span>'}</div>
        <div class="grid grid-4" style="gap:8px;margin-bottom:12px">
          <div class="stat-card" style="padding:8px"><div class="value" style="font-size:16px">${s.totalSales}</div><div class="label" style="font-size:11px">مبيعات</div></div>
          <div class="stat-card" style="padding:8px"><div class="value" style="font-size:16px;color:var(--success)">${formatPrice(s.totalEarnings)}</div><div class="label" style="font-size:11px">أرباح</div></div>
          <div class="stat-card" style="padding:8px"><div class="value" style="font-size:16px">${s.totalOrders}</div><div class="label" style="font-size:11px">طلبات</div></div>
          <div class="stat-card" style="padding:8px"><div class="value" style="font-size:16px">${s.commissionRate}%</div><div class="label" style="font-size:11px">عمولة</div></div></div>
        ${s.defaultPM ? `<div style="font-size:12px;color:var(--muted);margin-bottom:8px">${pm?pm.icon+' ':''}${s.defaultPMDetails||'—'}</div>` : ''}
        <div style="font-size:12px;color:var(--muted);margin-bottom:8px">تم السحب: ${formatPrice(withdrawn)} | الرصيد: ${formatPrice(Math.max(0, s.totalEarnings - withdrawn))}</div>
        <div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="editSeller('${s.id}')"><i class="fas fa-pen"></i></button>
          ${s.isActive ? `<button class="btn btn-ghost btn-sm" style="color:var(--warning)" onclick="toggleSeller('${s.id}')"><i class="fas fa-pause"></i></button>` : `<button class="btn btn-ghost btn-sm" style="color:var(--success)" onclick="toggleSeller('${s.id}')"><i class="fas fa-play"></i></button>`}
          <button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteSeller('${s.id}')"><i class="fas fa-trash"></i></button></div>
      </div>`;}).join('')}</div>`}
    <div id="sellerModal"></div>
  </div>`;
}

function attachAdminSellers() {}

function openSellerModal(editId) {
  const db = getDB(); const s = editId ? db.sellers.find(x => x.id === editId) : null;
  const u = s ? db.users.find(x => x.id === s.userId) : null;
  const activePMs = db.settings.paymentMethods.filter(p => p.active);
  document.getElementById('sellerModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('sellerModal')">
    <div class="modal glass scale-in"><button class="modal-close" onclick="closeModal('sellerModal')"><i class="fas fa-times"></i></button>
      <h2>${editId ? 'تعديل بائع' : 'إضافة بائع جديد'}</h2>
      <form onsubmit="return saveSeller(event,'${editId||''}')">
        ${!editId ? `<div class="form-grid"><div class="input-group"><label>الاسم الكامل</label><input id="sf_name" required></div>
          <div class="input-group"><label>البريد الإلكتروني</label><input id="sf_email" type="email" required dir="ltr"></div>
          <div class="input-group"><label>كلمة المرور</label><input id="sf_pass" type="password" required minlength="6" dir="ltr"></div>
          <div class="input-group"><label>العمولة (%)</label><input id="sf_comm" type="number" value="10" min="0" max="100"></div></div>` :
          `<div class="form-grid"><div class="input-group"><label>الاسم الكامل</label><input id="sf_name_e" value="${u?u.name:''}" required></div>
          <div class="input-group"><label>رقم الهاتف</label><input id="sf_phone_e" value="${u?u.phone||'':''}" dir="ltr"></div>
          <div class="input-group"><label>العمولة (%)</label><input id="sf_comm_e" type="number" value="${s?s.commissionRate:10}" min="0" max="100"></div>
          <div class="input-group"><label>وسيلة الدفع</label>
            <select id="sf_pm_e">${activePMs.map(pm => `<option value="${pm.type}" ${s?.defaultPM===pm.type?'selected':''}>${pm.icon||''} ${pm.label}</option>`).join('')}</select></div>
          <div class="input-group full"><label>معلومات الدفع</label><input id="sf_pmd_e" value="${s?.defaultPMDetails||''}" placeholder="رقم الحساب"></div></div>`}
        <div class="btn-group"><button type="submit" class="btn btn-primary">${editId ? 'حفظ' : 'إضافة'}</button><button type="button" class="btn btn-outline" onclick="closeModal('sellerModal')">إلغاء</button></div>
      </form></div></div>`;
}

function saveSeller(e, id) {
  e.preventDefault(); const db = getDB();
  if (id) {
    const s = db.sellers.find(x => x.id === id);
    if (s) s.commissionRate = Number(document.getElementById('sf_comm_e').value) || 10;
    const nameE = document.getElementById('sf_name_e');
    const phoneE = document.getElementById('sf_phone_e');
    const pmE = document.getElementById('sf_pm_e');
    const pmdE = document.getElementById('sf_pmd_e');
    const u = db.users.find(x => x.id === s.userId);
    if (u) { if (nameE) u.name = nameE.value.trim() || u.name; if (phoneE) u.phone = phoneE.value.trim(); }
    if (pmE) s.defaultPM = pmE.value;
    if (pmdE) s.defaultPMDetails = pmdE.value.trim();
    showToast('✅ تم تعديل البائع');
  } else {
    const name = document.getElementById('sf_name').value.trim();
    const email = document.getElementById('sf_email').value.trim();
    const pass = document.getElementById('sf_pass').value;
    const comm = Number(document.getElementById('sf_comm').value) || 10;
    if (!name||!email||!pass) { showToast('يرجى ملء جميع الحقول','error'); return; }
    if (db.users.find(x => x.email === email)) { showToast('البريد موجود مسبقاً','error'); return; }
    const uid = genId();
    db.users.push({ id: uid, email, password: pass, name, role: 'seller', phone: '', avatar: '' });
    db.sellers.push({ id: genId(), userId: uid, commissionRate: comm, totalSales: 0, totalEarnings: 0, totalOrders: 0, isActive: true, lastActive: '' });
    showToast('✅ تم إضافة البائع');
  }
  saveDB(db); closeModal('sellerModal'); navigate('admin-sellers');
}

function editSeller(id) { openSellerModal(id); }

function toggleSeller(id) {
  const db = getDB(); const s = db.sellers.find(x => x.id === id); if (!s) return;
  s.isActive = !s.isActive; saveDB(db);
  showToast(s.isActive ? '✅ تم التفعيل' : '⏸️ تم الإيقاف'); navigate('admin-sellers');
}

async function deleteSeller(id) {
  if (!await confirmDialog('حذف هذا البائع؟')) return;
  const db = getDB(); const s = db.sellers.find(x => x.id === id);
  if (s) db.users = db.users.filter(u => u.id !== s.userId);
  db.sellers = db.sellers.filter(x => x.id !== id);
  saveDB(db); showToast('✅ تم الحذف'); navigate('admin-sellers');
}

// ─── AI Landing Page ───
function renderAdminAI() {
  const db = getDB(); const history = [...db.landingPages].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const cats = ['netflix','capcut','tiktok','canva','spotify','chatgpt','youtube','disney','other'];
  const catLabels = { netflix:'Netflix', capcut:'CapCut Pro', tiktok:'TikTok Ads', canva:'Canva Pro', spotify:'Spotify', chatgpt:'ChatGPT Plus', youtube:'YouTube Premium', disney:'Disney+', other:'أخرى' };
  return `<div class="fade-in">
    <div class="card-header"><div><h2 style="font-size:20px;font-weight:700">AI Landing Page Generator</h2><p style="font-size:13px;color:var(--muted)">تعديل المنتج وتوليد صفحة هبوط احترافية</p></div></div>
    <div class="ai-layout">
      <div class="card glass">
        <div style="margin-bottom:12px"><label style="font-weight:600;display:block;margin-bottom:6px">اختر المنتج للتعديل</label>
          <select id="aiProduct" style="width:100%" onchange="loadAIProduct()">${db.products.map(p => `<option value="${p.id}">${p.name} - ${formatPrice(p.price)}</option>`).join('')}</select></div>
        <div id="aiProductForm" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <p style="font-size:13px;color:var(--muted);text-align:center">اختر منتجاً لعرض تفاصيله</p>
        </div>
        <hr style="border:none;border-top:1px solid var(--border);margin:20px 0">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:12px">السجل السابق</h3>
        ${history.length === 0 ? '<p style="color:var(--muted);font-size:13px">لا توجد صفحات مولدة</p>' :
        history.map(lp => { const p = getProduct(lp.productId); return `<div class="flex items-center justify-between" style="padding:10px 0;border-bottom:1px solid var(--border)">
          <div><div style="font-weight:600;font-size:14px">${p?p.name:'—'}</div><div style="font-size:12px;color:var(--muted)">${formatDate(lp.createdAt)}</div></div>
          <div class="flex gap-2"><button class="btn btn-ghost btn-sm" onclick="previewLanding('${lp.id}')"><i class="fas fa-eye"></i></button>
          <button class="btn btn-ghost btn-sm" onclick="toggleLP('${lp.id}')">${lp.isPublished ? '<span style="color:var(--success)"><i class="fas fa-globe"></i></span>' : '<span style="color:var(--muted)"><i class="fas fa-eye-slash"></i></span>'}</button></div>
        </div>`;}).join('')}
      </div>
      <div class="ai-preview glass" id="aiPreview"><div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:400px;color:var(--muted);padding:40px;text-align:center">
        <i class="fas fa-wand-magic-sparkles" style="font-size:48px;margin-bottom:16px;opacity:.3"></i><h3 style="color:var(--text);margin-bottom:8px">معاينة Landing Page</h3><p style="font-size:14px">اختر منتجاً واضغط توليد</p></div></div>
    </div>
    <div id="landingPreviewModal"></div>
  </div>`;
}

function attachAdminAI() { setTimeout(loadAIProduct, 50); }

function loadAIProduct() {
  const pid = document.getElementById('aiProduct')?.value;
  if (!pid) return;
  const p = getProduct(pid); if (!p) return;
  const cats = ['netflix','capcut','tiktok','canva','spotify','chatgpt','youtube','disney','other'];
  const catLabels = { netflix:'Netflix', capcut:'CapCut Pro', tiktok:'TikTok Ads', canva:'Canva Pro', spotify:'Spotify', chatgpt:'ChatGPT Plus', youtube:'YouTube Premium', disney:'Disney+', other:'أخرى' };
  document.getElementById('aiProductForm').innerHTML = `
    <div class="form-grid" style="grid-template-columns:1fr 1fr;gap:10px">
      <div class="input-group"><label>اسم المنتج</label><input id="aif_name" value="${p.name}" required></div>
      <div class="input-group"><label>السعر (د.ج)</label><input id="aif_price" type="number" value="${p.price}" required min="1"></div>
      <div class="input-group"><label>المدة (أيام)</label><input id="aif_dur" type="number" value="${p.duration}" required min="1"></div>
      <div class="input-group"><label>التصنيف</label><select id="aif_cat">${cats.map(c => `<option value="${c}" ${p.category===c?'selected':''}>${catLabels[c]}</option>`).join('')}</select></div>
      <div class="input-group full"><label>الوصف</label><textarea id="aif_desc" style="min-height:50px">${p.desc||''}</textarea></div>
    </div>
    <div class="flex gap-2" style="margin-top:14px">
      <button class="btn btn-primary" onclick="generateLanding()" id="aiBtn"><i class="fas fa-wand-magic-sparkles"></i> توليد Landing Page</button>
      <button class="btn btn-outline" onclick="saveAIProduct()"><i class="fas fa-save"></i> حفظ المنتج فقط</button>
    </div>
    <div id="aiProgress" class="ai-progress" style="display:none"><div id="aiStep" class="step">جاري التحضير...</div><div class="bar"><div class="bar-fill" id="aiBarFill"></div></div></div>`;
}

function saveAIProduct() {
  const pid = document.getElementById('aiProduct').value;
  if (!pid) return;
  const db = getDB(); const idx = db.products.findIndex(x => x.id === pid);
  if (idx < 0) return;
  const data = {
    name: document.getElementById('aif_name').value.trim(),
    price: Number(document.getElementById('aif_price').value),
    duration: Number(document.getElementById('aif_dur').value),
    category: document.getElementById('aif_cat').value,
    desc: document.getElementById('aif_desc').value.trim()
  };
  if (!data.name) { showToast('اسم المنتج مطلوب', 'error'); return; }
  data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  db.products[idx] = { ...db.products[idx], ...data };
  saveDB(db); showToast('✅ تم حفظ المنتج');
}

function generateLanding() {
  const pid2 = document.getElementById('aiProduct').value;
  if (!pid2) { showToast('اختر منتجاً أولاً','error'); return; }
  saveAIProduct();
  const product = getProduct(pid2); if (!product) { showToast('اختر منتجاً أولاً','error'); return; }
  const btn = document.getElementById('aiBtn'); btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التوليد...';
  document.getElementById('aiProgress').style.display = 'block';
  const steps = [{text:'🔍 تحليل المنتج...',pct:15},{text:'🧠 AI يولد التصميم...',pct:35},{text:'🎨 بناء الهيكل...',pct:55},{text:'✍️ كتابة المحتوى...',pct:75},{text:'⚡ تحسين الأداء...',pct:90},{text:'✅ تم التوليد!',pct:100}];
  let idx = 0;
  function go() {
    if (idx < steps.length) {
      document.getElementById('aiStep').textContent = steps[idx].text;
      document.getElementById('aiBarFill').style.width = steps[idx].pct + '%';
      idx++; setTimeout(go, idx === steps.length ? 500 : 1000);
    } else finishGenerate(product);
  }
  go();
}

function finishGenerate(product) {
  const html = generateLandingHTML(product, getDB());
  const db = getDB();
  const existing = db.landingPages.find(lp => lp.productId === product.id);
  if (existing) { existing.content = html; existing.updatedAt = new Date().toISOString(); }
  else { db.landingPages.push({ id: genId(), productId: product.id, title: `Landing - ${product.name}`, content: html, isPublished: false, seoData: {}, createdAt: new Date().toISOString() }); }
  saveDB(db);
  document.getElementById('aiPreview').innerHTML = `<iframe srcdoc="${encodeURIComponent(html)}" style="width:100%;height:100%;min-height:500px;border:none;border-radius:12px"></iframe>`;
  showToast('✅ تم توليد Landing Page');
  navigate('admin-ai');
}

function previewLanding(id) {
  const db = getDB(); const lp = db.landingPages.find(x => x.id === id); if (!lp) return;
  document.getElementById('landingPreviewModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('landingPreviewModal')">
    <div class="modal glass scale-in" style="max-width:90%;height:90%"><button class="modal-close" onclick="closeModal('landingPreviewModal')"><i class="fas fa-times"></i></button>
      <h2>معاينة Landing Page</h2>
      <iframe srcdoc="${encodeURIComponent(lp.content)}" style="width:100%;height:calc(100% - 60px);border:none;border-radius:12px;background:#fff"></iframe></div></div>`;
}

function toggleLP(id) {
  const db = getDB(); const lp = db.landingPages.find(x => x.id === id); if (!lp) return;
  lp.isPublished = !lp.isPublished; saveDB(db); showToast(lp.isPublished ? '✅ تم النشر' : '⏸️ تم الإلغاء'); navigate('admin-ai');
}

// ─── Settings ───
function renderAdminSettings() {
  const s = getDB().settings;
  return `<div class="fade-in">
    <div class="page-title"><h1>الإعدادات</h1></div>
    <div class="grid grid-2">
      <div class="card glass"><div class="card-title" style="margin-bottom:16px"><i class="fas fa-credit-card" style="color:var(--primary)"></i> وسائل الدفع</div>
        <div id="pmList">${s.paymentMethods.map((pm,i) => `<div class="flex items-center justify-between" style="padding:12px;border-bottom:1px solid var(--border)">
          <div class="d-flex"><span style="font-size:22px;margin-left:10px">${pm.icon||'💳'}</span>
            <div><div style="font-weight:600">${pm.label}</div><div style="font-size:12px;color:var(--muted)">${Object.values(pm.details).join(' | ')}</div>
            ${pm.minAmount > 0 ? `<div style="font-size:11px;color:var(--warning)">الحد الأدنى: ${formatPrice(pm.minAmount)}</div>` : ''}</div></div>
          <div class="flex items-center gap-3"><label class="toggle"><input type="checkbox" ${pm.active?'checked':''} onchange="togglePM(${i})"><span class="slider"></span></label>
            <button class="btn btn-ghost btn-sm" onclick="editPM(${i})"><i class="fas fa-pen"></i></button></div></div>`).join('')}</div>
        <button class="btn btn-outline btn-sm w-full mt-2" onclick="addPM()"><i class="fas fa-plus"></i> إضافة وسيلة دفع</button></div>
      <div class="card glass"><div class="card-title" style="margin-bottom:16px"><i class="fas fa-palette" style="color:var(--accent)"></i> الإعدادات العامة</div>
        <div class="input-group" style="margin-bottom:14px"><label>اسم التطبيق</label><input id="s_name" value="${s.appName}"></div>
        <div class="input-group" style="margin-bottom:14px"><label>اللون الأساسي</label><input id="s_color" value="${s.primaryColor}" dir="ltr"></div>
        <div class="input-group" style="flex-direction:row;align-items:center;gap:10px;margin-bottom:14px"><label>الإشعارات</label><label class="toggle"><input type="checkbox" id="s_push" ${s.pushEnabled?'checked':''}><span class="slider"></span></label></div>
        <div class="input-group" style="flex-direction:row;align-items:center;gap:10px;margin-bottom:14px"><label>الوضع النهاري</label><label class="toggle"><input type="checkbox" id="s_theme" onchange="document.getElementById('s_theme_v').value=this.checked?'light':'dark'" ${s.theme==='light'?'checked':''}><span class="slider"></span></label><input id="s_theme_v" type="hidden" value="${s.theme}"></div>
        <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
        <div class="card-title" style="margin-bottom:12px"><i class="fas fa-robot" style="color:var(--accent)"></i> DeepSeek AI</div>
        <div class="input-group" style="margin-bottom:14px"><label>مفتاح API</label><input id="s_dskey" value="${s.deepseekKey||''}" placeholder="sk-..." dir="ltr"></div>
        <div class="input-group" style="margin-bottom:14px"><label>الموديل</label><input id="s_dsmodel" value="${s.deepseekModel||'deepseek-chat'}" dir="ltr"></div>
        <button class="btn btn-primary" onclick="saveGenSettings()"><i class="fas fa-save"></i> حفظ</button></div>
      <div class="card glass"><div class="card-title" style="margin-bottom:16px"><i class="fas fa-cloud" style="color:var(--primary)"></i> Supabase</div>
        <p style="font-size:13px;color:var(--muted);margin-bottom:14px">اختياري - للتخزين السحابي بدلاً من localStorage</p>
        <div class="input-group" style="margin-bottom:14px"><label>رابط Supabase URL</label><input id="s_sburl" value="${s.supabaseUrl||''}" placeholder="https://xxxxx.supabase.co" dir="ltr"></div>
        <div class="input-group" style="margin-bottom:14px"><label>مفتاح Anon Key</label><input id="s_sbkey" value="${s.supabaseKey||''}" placeholder="eyJhbGciOiJIUzI1NiIs..." dir="ltr"></div>
        <div class="input-group" style="flex-direction:row;align-items:center;gap:10px"><label>استخدام Supabase</label><label class="toggle"><input type="checkbox" id="s_sbsync" ${s.useSupabase?'checked':''}><span class="slider"></span></label></div>
        <div class="flex gap-2 mt-2">
          <button class="btn btn-primary" onclick="saveGenSettings()"><i class="fas fa-save"></i> حفظ</button>
          <button class="btn btn-outline" onclick="saveGenSettings();setTimeout(()=>syncNow(this),100)"><i class="fas fa-cloud-upload-alt"></i> مزامنة الآن</button>
          <button class="btn btn-outline" onclick="loadFromSupabase().then(d=>{if(d){localStorage.clear();window.location.reload()}})"><i class="fas fa-cloud-download-alt"></i> تحميل</button>
        </div></div>
    </div>
    <div class="card glass" style="margin-top:16px"><div class="card-title" style="margin-bottom:12px"><i class="fas fa-bullhorn" style="color:var(--warning)"></i> البنر الإعلاني</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:10px">يظهر في أعلى كل صفحات الداشبورد (للبائعين والأدمين)</p>
      <div class="input-group" style="margin-bottom:12px"><label>نص البنر (اترك فارغاً للإخفاء)</label><input id="s_banner" value="${s.bannerText||''}" placeholder="مثال: 🔥 عروض الصيف - خصم 20% على جميع المنتجات"></div>
      <div class="input-group" style="margin-bottom:12px"><label>لون الأيقونة</label><input id="s_bcolor" value="${s.bannerColor||'#3b82f6'}" dir="ltr" placeholder="#3b82f6"></div>
      <button class="btn btn-primary" onclick="saveGenSettings()"><i class="fas fa-save"></i> حفظ البنر</button></div>
    <div class="card glass" style="margin-top:16px"><div class="card-title" style="margin-bottom:12px"><i class="fab fa-telegram-plane" style="color:var(--primary)"></i> تلغرام (إشعارات فورية)</div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:10px">يُرسل إشعار فوري إلى مجموعة تلغرام عند كل حدث مهم (طلب جديد، سحب، رفض، الخ)</p>
      <div class="grid grid-2" style="gap:14px;margin-bottom:14px">
        <div class="input-group"><label>Bot Token</label><input id="s_tgbot" value="${s.telegramBotToken||''}" placeholder="1234567890:ABCdef..." dir="ltr"></div>
        <div class="input-group"><label>Chat ID</label><input id="s_tgchat" value="${s.telegramChatId||''}" placeholder="-1001234567890" dir="ltr"></div>
      </div>
      <div class="input-group" style="flex-direction:row;align-items:center;gap:10px;margin-bottom:14px"><label>تفعيل الإشعارات</label><label class="toggle"><input type="checkbox" id="s_tgenable" ${s.telegramEnabled?'checked':''}><span class="slider"></span></label></div>
      <div class="flex gap-2">
        <button class="btn btn-primary" onclick="saveGenSettings()"><i class="fas fa-save"></i> حفظ</button>
        <button class="btn btn-outline" onclick="testTelegram()"><i class="fab fa-telegram-plane"></i> إرسال اختبار</button>
      </div>
    </div>
    <div id="paymentModal"></div>
  </div>`;
}

function attachAdminSettings() {}

function togglePM(i) { const db = getDB(); db.settings.paymentMethods[i].active = !db.settings.paymentMethods[i].active; saveDB(db); }
function addPM() { showPMModal(-1); }
function editPM(i) { showPMModal(i); }

function showPMModal(i) {
  const db = getDB(); const pm = i >= 0 ? db.settings.paymentMethods[i] : null;
  const types = ['baridimob','ccp','binance','usdt','other']; const typeLabels = { baridimob:'BaridiMob', ccp:'CCP', binance:'Binance', usdt:'USDT', other:'أخرى' };
  document.getElementById('paymentModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('paymentModal')">
    <div class="modal glass scale-in"><button class="modal-close" onclick="closeModal('paymentModal')"><i class="fas fa-times"></i></button>
      <h2>${pm ? 'تعديل' : 'إضافة'} وسيلة دفع</h2>
      <form onsubmit="return savePM(event,${i})">
        <div class="form-grid">
          <div class="input-group"><label>النوع</label><select id="pm_type">${types.map(t => `<option value="${t}" ${pm&&pm.type===t?'selected':''}>${typeLabels[t]}</option>`).join('')}</select></div>
          <div class="input-group"><label>الاسم</label><input id="pm_label" value="${pm?pm.label:''}" required></div>
          <div class="input-group"><label>الرمز/الإيموجي</label><input id="pm_icon" value="${pm?pm.icon||'':''}" placeholder="💳 أو بنك" maxlength="4"></div>
          <div class="input-group"><label>الحد الأدنى (د.ج)</label><input id="pm_min" type="number" value="${pm?pm.minAmount??0:0}" min="0"></div>
          <div class="input-group full"><label>التفاصيل (مفتاح:قيمة في كل سطر)</label><textarea id="pm_details">${pm?Object.entries(pm.details).map(([k,v])=>k+':'+v).join('\n'):''}</textarea></div></div>
        <div class="btn-group"><button type="submit" class="btn btn-primary">حفظ</button><button type="button" class="btn btn-outline" onclick="closeModal('paymentModal')">إلغاء</button></div>
      </form></div></div>`;
}

function savePM(e, i) {
  e.preventDefault();
  const db = getDB(); const type = document.getElementById('pm_type').value;
  const label = document.getElementById('pm_label').value.trim();
  const icon = document.getElementById('pm_icon')?.value.trim() || '💳';
  const minAmount = Number(document.getElementById('pm_min')?.value) || 0;
  const detailsRaw = document.getElementById('pm_details').value.trim(); const details = {};
  detailsRaw.split('\n').filter(l=>l.trim()).forEach(l => { const [k,...v] = l.split(':'); if(k&&v.length) details[k.trim()]=v.join(':').trim(); });
  const pm = { type, label, icon, minAmount, details, active: true };
  if (i >= 0) db.settings.paymentMethods[i] = pm; else db.settings.paymentMethods.push(pm);
  saveDB(db); showToast('✅ تم الحفظ'); closeModal('paymentModal'); navigate('admin-settings');
}

async function syncNow(btn) {
  if (!btn && window.event) btn = window.event.target || window.event.srcElement;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري...'; }
  const ok = await syncToSupabase(getDB());
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> مزامنة الآن'; }
  if (ok) showToast('✅ تمت المزامنة مع Supabase بنجاح');
}

function saveGenSettings() {
  const db = getDB();
  db.settings.appName = document.getElementById('s_name').value.trim() || 'DigitalVault';
  db.settings.primaryColor = document.getElementById('s_color').value.trim() || '#3b82f6';
  db.settings.pushEnabled = document.getElementById('s_push').checked;
  db.settings.deepseekKey = document.getElementById('s_dskey').value.trim();
  db.settings.deepseekModel = document.getElementById('s_dsmodel').value.trim() || 'deepseek-chat';
  const sbUrl = document.getElementById('s_sburl');
  const sbKey = document.getElementById('s_sbkey');
  const sbSync = document.getElementById('s_sbsync');
  if (sbUrl) db.settings.supabaseUrl = sbUrl.value.trim();
  if (sbKey) db.settings.supabaseKey = sbKey.value.trim();
  if (sbSync) db.settings.useSupabase = sbSync.checked;
  const bText = document.getElementById('s_banner');
  const bColor = document.getElementById('s_bcolor');
  if (bText) db.settings.bannerText = bText.value.trim();
  if (bColor) db.settings.bannerColor = bColor.value.trim() || '#3b82f6';
  db.settings.theme = document.getElementById('s_theme_v')?.value || 'dark';
  const tgBot = document.getElementById('s_tgbot');
  const tgChat = document.getElementById('s_tgchat');
  const tgEn = document.getElementById('s_tgenable');
  if (tgBot) db.settings.telegramBotToken = tgBot.value.trim();
  if (tgChat) db.settings.telegramChatId = tgChat.value.trim();
  if (tgEn) db.settings.telegramEnabled = tgEn.checked;
  saveDB(db); showToast('✅ تم حفظ الإعدادات');
  applyTheme(db.settings.theme);
  navigate('admin-settings');
}

async function testTelegram() {
  const btn = window.event?.target;
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري...'; }
  const ok = await sendTelegramNotification('<b>🔔 اختبار الإشعارات</b>\n✅ تم إعداد تلغرام بنجاح!\n📅 ' + new Date().toLocaleString('ar-DZ'));
  if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fab fa-telegram-plane"></i> إرسال اختبار'; }
  if (ok) showToast('✅ تم إرسال رسالة الاختبار بنجاح'); else showToast('❌ فشل الإرسال - تحقق من التوكن والـ ID', 'error');
}

// ─── Audit Logs ───
function renderAuditLogs() {
  const db = getDB(); const logs = [...db.auditLogs].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)).slice(0,100);
  return `<div class="fade-in">
    <div class="card-header"><div><h2 style="font-size:20px;font-weight:700">سجل النشاطات</h2><p style="font-size:13px;color:var(--muted)">آخر ${logs.length} نشاط</p></div>
      <button class="btn btn-outline btn-sm" onclick="exportCSV()"><i class="fas fa-download"></i> تصدير CSV</button></div>
    ${logs.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-clock-rotate"></i><h3>لا توجد نشاطات</h3></div>' :
    `<div class="table-wrap card glass"><table><thead><tr><th>المستخدم</th><th>الإجراء</th><th>النوع</th><th>التفاصيل</th><th>التاريخ</th></tr></thead><tbody>${
      logs.map(l => { const u = db.users.find(x => x.id === l.userId); return `<tr>
        <td>${u?u.name:'system'}</td>
        <td><span class="badge ${l.action==='create'||l.action==='approve'?'badge-success':l.action==='delete'||l.action==='reject'?'badge-danger':'badge-info'}">${l.action}</span></td>
        <td style="font-size:13px">${l.entityType}</td>
        <td style="font-size:12px;color:var(--muted);max-width:200px" class="truncate">${JSON.stringify(l.details||'')}</td>
        <td style="font-size:12px;color:var(--muted)">${formatDate(l.createdAt)}</td>
      </tr>`;}).join('')
    }</tbody></table></div>`}
  </div>`;
}

function exportCSV() {
  const db = getDB(); const logs = [...db.auditLogs].sort((a,b) => new Date(b.createdAt||0)-new Date(a.createdAt||0));
  let csv = 'المستخدم,الإجراء,النوع,الكيان,التفاصيل,التاريخ\n';
  logs.forEach(l => { const u = db.users.find(x => x.id === l.userId); csv += `"${u?u.name:'system'}","${l.action}","${l.entityType}","${l.entityId}","${JSON.stringify(l.details||'')}","${l.createdAt}"\n`; });
  const blob = new Blob(['\uFEFF'+csv], {type:'text/csv;charset=utf-8;'});
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'audit-logs.csv'; link.click();
  showToast('✅ تم التصدير');
}

// ═══════════════════════════════════════════════════════════════
//  CRM WHATSAPP
// ═══════════════════════════════════════════════════════════════

function renderAdminCRM() {
  const db = getDB();
  const customers = [];
  const seen = new Set();
  db.orders.forEach(o => {
    const key = o.customerPhone;
    if (key && !seen.has(key)) {
      seen.add(key);
      customers.push({ name: o.customerName, phone: o.customerPhone, lastOrder: o.createdAt, totalOrders: db.orders.filter(x => x.customerPhone === o.customerPhone).length });
    }
  });
  return `<div class="fade-in">
    <div class="page-title"><h1>CRM - واتساب</h1><p>التواصل مع الزبائن عبر واتساب</p></div>
    <div class="grid grid-2">
      <div class="card glass">
        <div class="card-header"><span class="card-title"><i class="fas fa-users" style="color:var(--primary)"></i> الزبائن (${customers.length})</span>
          <div class="flex gap-2"><button class="btn btn-outline btn-sm" onclick="crmSelectAll()"><i class="fas fa-check-double"></i> تحديد الكل</button><button class="btn btn-outline btn-sm" onclick="crmDeselectAll()"><i class="fas fa-times"></i> إلغاء</button></div></div>
        <div id="crmList" style="max-height:400px;overflow-y:auto">
          ${customers.length === 0 ? '<div class="empty-state"><p>لا يوجد زبائن بعد</p></div>' :
          customers.map((c,i) => `<label class="crm-item" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-bottom:1px solid var(--border);cursor:pointer">
            <input type="checkbox" class="crm-check" data-phone="${c.phone}" data-name="${c.name}" onchange="crmUpdateCount()">
            <div style="width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,.12);display:flex;align-items:center;justify-content:center;font-weight:700;color:var(--primary);flex-shrink:0">${c.name.charAt(0)}</div>
            <div style="flex:1"><div style="font-weight:600;font-size:14px">${c.name}</div><div style="font-size:12px;color:var(--muted);direction:ltr;text-align:right">${c.phone}</div></div>
            <span style="font-size:11px;color:var(--muted)">${c.totalOrders} طلب</span>
          </label>`).join('')}
        </div>
      </div>
      <div class="card glass">
        <div class="card-title" style="margin-bottom:16px"><i class="fas fa-comment" style="color:var(--success)"></i> إرسال رسالة</div>
        <div class="input-group" style="margin-bottom:14px"><label>الرسالة</label>
          <textarea id="crmMsg" placeholder="اكتب رسالتك هنا..." style="min-height:120px">مرحباً {name}،

نقدم لك عروضاً حصرية على منتجاتنا الرقمية. تواصل معنا للحصول على أفضل الأسعار!

DigitalVault</textarea></div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px">المتغيرات: <code>{name}</code> لاسم الزبون</div>
        <div style="margin-bottom:14px">
          <label style="display:flex;align-items:center;gap:8px;font-size:14px">
            <input type="checkbox" id="crmOpenNew" checked>
            فتح كل رسالة في تبويب منفصل
          </label>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-success w-full btn-lg" onclick="crmSend()" id="crmSendBtn"><i class="fab fa-whatsapp"></i> إرسال (<span id="crmCount">0</span>)</button>
        </div>
      </div>
    </div>
  </div>`;
}

function attachAdminCRM() {}

function crmSelectAll() { document.querySelectorAll('.crm-check').forEach(c => c.checked = true); crmUpdateCount(); }
function crmDeselectAll() { document.querySelectorAll('.crm-check').forEach(c => c.checked = false); crmUpdateCount(); }

function crmUpdateCount() {
  const count = document.querySelectorAll('.crm-check:checked').length;
  document.getElementById('crmCount').textContent = count;
}

function crmSend() {
  const checks = document.querySelectorAll('.crm-check:checked');
  if (checks.length === 0) { showToast('اختر زبوناً واحداً على الأقل', 'error'); return; }
  const template = document.getElementById('crmMsg').value;
  const openNew = document.getElementById('crmOpenNew').checked;
  let opened = 0;
  checks.forEach(c => {
    const phone = c.dataset.phone.replace(/[^0-9]/g, '');
    const name = c.dataset.name;
    const msg = encodeURIComponent(template.replace(/\{name\}/g, name));
    const url = `https://wa.me/${phone}?text=${msg}`;
    if (openNew) {
      window.open(url, '_blank');
      opened++;
    } else {
      window.location.href = url;
    }
  });
  const total = checks.length;
  showToast(`✅ تم فتح ${opened} محادثة واتساب لـ ${total} زبون`);
  logAudit(getCurrentUser().id, 'crm_send', 'crm', '', { count: total, template: template.slice(0,100) });
}

// ═══════════════════════════════════════════════════════════════
//  DEEPSEEK AI
// ═══════════════════════════════════════════════════════════════

async function deepseekCall(messages, systemPrompt) {
  const db = getDB();
  const key = db.settings.deepseekKey;
  if (!key) { showToast('يجب إضافة مفتاح DeepSeek API في الإعدادات أولاً', 'error'); return null; }
  const model = db.settings.deepseekModel || 'deepseek-chat';
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({
        model,
        messages: systemPrompt ? [{ role: 'system', content: systemPrompt }, ...messages] : messages,
        temperature: 0.7, max_tokens: 4096
      })
    });
    if (!res.ok) { const err = await res.text(); showToast('خطأ DeepSeek: ' + err.slice(0,100), 'error'); return null; }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (e) {
    showToast('فشل الاتصال بـ DeepSeek: ' + e.message, 'error');
    return null;
  }
}

function renderAdminDeepSeek() {
  const db = getDB();
  const hasKey = !!db.settings.deepseekKey;
  return `<div class="fade-in">
    <div class="page-title"><h1>DeepSeek AI</h1><p>مساعد ذكي لإدارة النظام والتواصل</p></div>
    ${!hasKey ? `<div class="card glass" style="text-align:center;padding:40px">
      <i class="fas fa-key" style="font-size:48px;color:var(--warning);margin-bottom:16px;opacity:.7"></i>
      <h3 style="margin-bottom:8px">مفتاح API غير مضبوط</h3>
      <p style="color:var(--muted);margin-bottom:16px">يرجى إضافة مفتاح DeepSeek API في الإعدادات</p>
      <button class="btn btn-primary" onclick="navigate('admin-settings')"><i class="fas fa-gear"></i> الذهاب للإعدادات</button>
    </div>` : `
    <div class="ds-layout">
      <div class="card glass ds-chat">
        <div class="ds-chat-header">
          <span class="card-title"><i class="fas fa-robot" style="color:var(--primary)"></i> محادثة DeepSeek</span>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" onclick="dsClearChat()"><i class="fas fa-trash"></i> مسح</button>
          </div>
        </div>
        <div class="ds-messages" id="dsMessages">
          <div class="ds-msg ds-ai">
            <div class="ds-avatar" style="background:rgba(139,92,246,.15);color:var(--accent)"><i class="fas fa-robot"></i></div>
            <div class="ds-bubble">
              <p>مرحباً! أنا مساعد DeepSeek. أستطيع مساعدتك في:</p>
              <ul style="margin:8px 0 0 16px;font-size:13px;color:var(--muted)">
                <li>إنشاء رسائل للعملاء</li>
                <li>توليد محتوى لصفحات الهبوط</li>
                <li>تحليل بيانات النظام</li>
                <li>إنشاء نصوص إشعارات</li>
                <li>الإجابة على استفساراتك</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="ds-input">
          <div class="ds-tools">
            <button class="btn btn-ghost btn-sm" onclick="dsSystemContext()" title="سياق النظام"><i class="fas fa-database"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="dsGenerateNotif()" title="إنشاء إشعار"><i class="fas fa-bell"></i></button>
            <button class="btn btn-ghost btn-sm" onclick="dsGenerateLanding()" title="توليد Landing Page"><i class="fas fa-wand-magic-sparkles"></i></button>
          </div>
          <div style="display:flex;gap:8px">
            <textarea id="dsInput" placeholder="اكتب رسالتك هنا..." style="flex:1;min-height:44px;max-height:120px" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();dsSend()}"></textarea>
            <button class="btn btn-primary" onclick="dsSend()" id="dsSendBtn"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
      <div class="card glass ds-info">
        <div class="card-title" style="margin-bottom:16px"><i class="fas fa-info-circle" style="color:var(--primary)"></i> أدوات سريعة</div>
        <div class="ds-quick" onclick="dsQuick('أنشئ رسالة تسويقية لمنتج Netflix Premium، موجهة للعملاء باللغة العربية، بأسلوب احترافي')">
          <i class="fas fa-bullhorn" style="color:var(--primary)"></i>
          <span>رسالة تسويقية</span>
        </div>
        <div class="ds-quick" onclick="dsQuick('صمم إشعاراً للنظام يخبر البائعين بوجود عروض جديدة على المنصة')">
          <i class="fas fa-bell" style="color:var(--warning)"></i>
          <span>نص إشعار</span>
        </div>
        <div class="ds-quick" onclick="dsQuick('حلل بيانات المنصة الحالية وقدم اقتراحات لتحسين المبيعات')">
          <i class="fas fa-chart-line" style="color:var(--success)"></i>
          <span>تحليل البيانات</span>
        </div>
        <div class="ds-quick" onclick="dsQuick('أكتب وصفاً مميزاً لمنتج ChatGPT Plus ليظهر في صفحة المنتجات، 100 كلمة')">
          <i class="fas fa-pen" style="color:var(--accent)"></i>
          <span>وصف منتج</span>
        </div>
        <div class="ds-quick" onclick="dsQuick('قم بإنشاء رسالة واتساب قصيرة ومحترفة للتواصل مع زبون جديد، تحتوي على ترحيب وتعريف بالخدمات')">
          <i class="fab fa-whatsapp" style="color:var(--success)"></i>
          <span>رسالة واتساب</span>
        </div>
        <div class="ds-quick" onclick="dsQuick('ساعدني في كتابة برومت كامل لتوليد صفحة هبوط لمنتج YouTube Premium')">
          <i class="fas fa-wand-magic-sparkles" style="color:var(--accent)"></i>
          <span>برومت Landing Page</span>
        </div>
      </div>
    </div>`}
    <div id="dsGenModal"></div>
  </div>`;
}

function attachAdminDeepSeek() {}

async function dsSend() {
  const input = document.getElementById('dsInput');
  const msg = input?.value.trim();
  if (!msg) return;
  input.value = '';
  appendDSMessage('user', msg);
  const sendBtn = document.getElementById('dsSendBtn');
  sendBtn.disabled = true; sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  const reply = await deepseekCall([{ role: 'user', content: msg }]);
  sendBtn.disabled = false; sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
  if (reply) appendDSMessage('ai', reply);
}

function dsClearChat() {
  const container = document.getElementById('dsMessages');
  if (container) container.innerHTML = '';
}

function appendDSMessage(type, content) {
  const container = document.getElementById('dsMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'ds-msg ' + (type === 'user' ? 'ds-user' : 'ds-ai');
  const avatar = type === 'user'
    ? '<div class="ds-avatar" style="background:rgba(59,130,246,.15);color:var(--primary)"><i class="fas fa-user"></i></div>'
    : '<div class="ds-avatar" style="background:rgba(139,92,246,.15);color:var(--accent)"><i class="fas fa-robot"></i></div>';
  div.innerHTML = avatar + '<div class="ds-bubble"><p>' + content.replace(/\n/g, '<br>') + '</p></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function dsQuick(prompt) {
  document.getElementById('dsInput').value = prompt;
  dsSend();
}

async function dsSystemContext() {
  const db = getDB();
  const stats = {
    products: db.products.length,
    orders: db.orders.length,
    accounts: db.accounts.length,
    sellers: db.sellers.length,
    revenue: db.orders.filter(o => o.status === 'approved').reduce((s, o) => s + o.totalPrice, 0)
  };
  const context = `إحصائيات المنصة الحالية:
- المنتجات: ${stats.products}
- الطلبات: ${stats.orders}
- الحسابات: ${stats.accounts}
- البائعون: ${stats.sellers}
- الإيرادات: ${formatPrice(stats.revenue)}
- المنتجات المتوفرة: ${db.products.filter(p => p.available).length}
- الحسابات المتاحة: ${db.accounts.filter(a => a.status === 'available').length}
- الطلبات المعلقة: ${db.orders.filter(o => o.status === 'pending').length}`;
  appendDSMessage('ai', '📊 **إحصائيات النظام**\n\n' + context);
}

async function dsGenerateNotif() {
  const msg = 'أنشئ إشعاراً قصيراً وجذاباً للنظام عن عروض وخصومات جديدة على المنصة، باللغة العربية';
  appendDSMessage('user', '🛎️ إنشاء إشعار جديد');
  const reply = await deepseekCall([{ role: 'user', content: msg }]);
  if (reply) {
    appendDSMessage('ai', reply);
    setTimeout(async () => {
      if (await confirmDialog('هل تريد إرسال هذا الإشعار لجميع المستخدمين؟')) {
        const db = getDB();
        const title = reply.split('\n')[0].replace(/[*#]/g, '').trim().slice(0, 60);
        const body = reply.replace(/[*#]/g, '').trim();
        db.users.forEach(u => addNotification(u.id, title || 'إشعار من النظام', body.slice(0, 200), 'system'));
        showToast('✅ تم إرسال الإشعار للجميع');
      }
    }, 300);
  }
}

async function dsGenerateLanding() {
  const db = getDB();
  const productId = await new Promise((resolve) => {
    const modal = document.getElementById('dsGenModal');
    window._dsResolve = resolve;
    modal.innerHTML = `<div class="modal-overlay active" onclick="_dsResolve(null)">
      <div class="modal glass scale-in" style="max-width:400px"><button class="modal-close" onclick="_dsResolve(null)"><i class="fas fa-times"></i></button>
        <h2>توليد Landing Page بـ AI</h2>
        <div class="input-group" style="margin-bottom:14px"><label>اختر المنتج</label>
          <select id="dsLpProduct">${db.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
        <div class="btn-group"><button class="btn btn-primary" id="dsLpGo">توليد</button><button class="btn btn-outline" onclick="_dsResolve(null)">إلغاء</button></div>
      </div></div>`;
    document.getElementById('dsLpGo').onclick = () => { closeModal('dsGenModal'); resolve(document.getElementById('dsLpProduct').value); };
  });
  delete window._dsResolve;
  if (!productId) return;
  const product = getProduct(productId);
  if (!product) return;
  const prompt = `قم بإنشاء صفحة HTML كاملة (بدون أي أنماط خارجية أو CDN غير Tailwind) باللغة العربية لصفحة هبوط (Landing Page) لمنتج "${product.name}" بسعر ${product.price} د.ج لمدة ${product.duration} يوماً. استخدم Tailwind CSS من CDN. الصفحة يجب أن تحتوي على: شريط تنقل علوي، قسم بطولي مع عنوان جذاب، قسم المميزات، قسم الأسعار (3 باقات: أساسي، برو، ألتميت)، قسم آراء العملاء، قسم طرق الدفع، وتذييل. استخدم ألوان داكنة مع لمسات زرقاء وبنفسجية. اجعلها احترافية وجذابة.`;
  appendDSMessage('user', '🎨 توليد Landing Page لـ ' + product.name);
  const reply = await deepseekCall([{ role: 'user', content: prompt }]);
  if (reply) {
    const html = extractHTML(reply) || reply;
    const db2 = getDB();
    const existing = db2.landingPages.find(lp => lp.productId === product.id);
    const lp = { id: existing?.id || genId(), productId: product.id, title: `Landing - ${product.name}`, content: html, isPublished: false, seoData: {}, createdAt: new Date().toISOString() };
    if (existing) { Object.assign(existing, lp); } else { db2.landingPages.push(lp); }
    saveDB(db2);
    appendDSMessage('ai', '✅ تم توليد Landing Page بنجاح! يمكنك معاينتها من <a href="#" onclick="navigate(\'admin-ai\')">صفحة AI Landing</a>');
  }
}

function extractHTML(text) {
  const m = text.match(/<!DOCTYPE html[\s\S]*?<\/html>/i) || text.match(/<html[\s\S]*?<\/html>/i);
  return m ? m[0] : null;
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN WITHDRAWALS
// ═══════════════════════════════════════════════════════════════

function renderAdminWithdrawals() {
  const db = getDB();
  const pending = db.withdrawals.filter(w => w.status === 'pending').sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const processed = db.withdrawals.filter(w => w.status !== 'pending').sort((a,b) => new Date(b.processedAt||0) - new Date(a.processedAt||0));
  const activePMs = db.settings.paymentMethods.filter(p => p.active);
  const statuses = { pending: { label: 'قيد الانتظار', cls: 'badge-warning' }, approved: { label: 'تم الدفع', cls: 'badge-success' }, rejected: { label: 'مرفوض', cls: 'badge-danger' } };
  return `<div class="fade-in">
    <div class="page-title"><h1>إدارة السحوبات</h1><p>${pending.length} طلب سحب pending</p></div>
    <div class="tabs"><button class="tab active" id="wdTabPend" onclick="switchWDTab('pend')"><i class="fas fa-clock"></i> قيد الانتظار (${pending.length})</button>
      <button class="tab" id="wdTabDone" onclick="switchWDTab('done')"><i class="fas fa-check-circle"></i> تمت المعالجة (${processed.length})</button></div>
    <div id="wdPendContent" class="tab-content active">
      ${pending.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-inbox"></i><h3>لا توجد طلبات سحب pending</h3></div>' :
      pending.map(w => { const seller = db.sellers.find(s => s.id === w.sellerId); const u = seller ? db.users.find(x => x.id === seller.userId) : null; const pm = activePMs.find(p => p.type === w.paymentMethod);
        return `<div class="card glass" style="margin-bottom:12px">
          <div class="flex items-center justify-between" style="margin-bottom:10px">
            <div><div style="font-weight:700;font-size:18px;color:var(--success)">${formatPrice(w.amount)}</div>
              <div style="font-size:13px">${u?u.name:'—'} <span style="color:var(--muted);font-size:12px">${u?u.email:''}</span></div></div>
            <span class="badge badge-warning">قيد الانتظار</span>
          </div>
          <div style="font-size:13px;color:var(--muted);margin-bottom:10px">${pm?pm.icon+' '+pm.label:''} | ${w.paymentDetails||'—'}</div>
          ${w.notes ? `<div style="font-size:12px;color:var(--muted);background:var(--surface);padding:8px 10px;border-radius:8px;margin-bottom:10px">📝 ${w.notes}</div>` : ''}
          <div style="font-size:11px;color:var(--muted);margin-bottom:12px">${formatDate(w.createdAt)}</div>
          <div class="flex gap-2 flex-wrap">
            <button class="btn btn-success btn-sm" onclick="approveWD('${w.id}')"><i class="fas fa-check"></i> تأكيد الدفع</button>
            <button class="btn btn-danger btn-sm" onclick="rejectWD('${w.id}')"><i class="fas fa-times"></i> رفض</button>
          </div>
        </div>`;}).join('')}
    </div>
    <div id="wdDoneContent" class="tab-content">
      ${processed.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-check-circle"></i><h3>لا توجد سحوبات معالجة</h3></div>' :
      processed.map(w => { const seller = db.sellers.find(s => s.id === w.sellerId); const u = seller ? db.users.find(x => x.id === seller.userId) : null; const pm = activePMs.find(p => p.type === w.paymentMethod); const st = statuses[w.status]||statuses.pending;
        return `<div style="padding:14px;border-bottom:1px solid var(--border)">
          <div class="flex items-center justify-between">
            <div><span style="font-weight:700">${formatPrice(w.amount)}</span> <span style="font-size:12px;color:var(--muted)">- ${u?u.name:'—'}</span></div>
            <span class="badge ${st.cls}">${st.label}</span>
          </div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">${pm?pm.icon+' '+pm.label:''} ${w.paymentDetails||''}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${formatDate(w.processedAt||w.createdAt)}</div>
          ${w.adminNote ? `<div style="font-size:12px;color:var(--muted);margin-top:6px">📝 ${w.adminNote}</div>` : ''}
        </div>`;}).join('')}
    </div>
    <div id="wdModal"></div>
  </div>`;
}

function attachAdminWithdrawals() {}

function switchWDTab(t) {
  document.querySelectorAll('.tabs .tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('wdTab' + (t === 'pend' ? 'Pend' : 'Done')).classList.add('active');
  document.getElementById('wd' + t + 'Content').classList.add('active');
}

function approveWD(id) {
  const db = getDB(); const w = db.withdrawals.find(x => x.id === id); if (!w) return;
  document.getElementById('wdModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('wdModal')">
    <div class="modal glass scale-in" style="max-width:500px"><button class="modal-close" onclick="closeModal('wdModal')"><i class="fas fa-times"></i></button>
      <h2>💰 تأكيد دفع السحب</h2>
      <p style="font-size:14px;color:var(--muted);margin-bottom:16px">المبلغ: <strong style="color:var(--success)">${formatPrice(w.amount)}</strong></p>
      <form onsubmit="return confirmApproveWD(event,'${id}')">
        <div class="input-group" style="margin-bottom:14px"><label>ملاحظة (اختياري)</label><textarea id="wd_note" placeholder="تم الدفع عبر ..."></textarea></div>
        <div class="input-group" style="margin-bottom:14px"><label>وصل الدفع (صورة/مستند)</label><input id="wd_receipt" type="file" accept="image/*,.pdf" onchange="previewWDReceipt(event)"><div id="wdReceiptPreview"></div></div>
        <div class="btn-group"><button type="submit" class="btn btn-success"><i class="fas fa-check"></i> تأكيد الدفع</button><button type="button" class="btn btn-outline" onclick="closeModal('wdModal')">إلغاء</button></div>
      </form>
    </div></div>`;
}

function previewWDReceipt(e) {
  const file = e.target.files[0];
  const p = document.getElementById('wdReceiptPreview');
  if (!file) { p.innerHTML = ''; return; }
  if (file.size > 5 * 1024 * 1024) { p.innerHTML = '<span style="color:var(--danger);font-size:13px">⚠️ الملف كبير جداً</span>'; e.target.value = ''; return; }
  if (file.type.startsWith('image/')) {
    const r = new FileReader();
    r.onload = () => { p.innerHTML = `<img src="${r.result}" style="max-height:100px;border-radius:8px;border:1px solid var(--border);margin-top:6px">`; };
    r.readAsDataURL(file);
  } else { p.innerHTML = `<span style="font-size:13px;color:var(--muted)">📄 ${file.name}</span>`; }
}

async function confirmApproveWD(e, id) {
  e.preventDefault();
  const db = getDB(); const w = db.withdrawals.find(x => x.id === id); if (!w) return;
  const note = document.getElementById('wd_note')?.value.trim() || '';
  const file = document.getElementById('wd_receipt')?.files?.[0];
  w.status = 'approved'; w.adminNote = note; w.processedAt = new Date().toISOString();
  if (file) {
    try { w.receiptFile = await readFileAsBase64(file); } catch (err) { showToast(err.message, 'error'); return; }
  }
  const seller = db.sellers.find(s => s.id === w.sellerId);
  if (seller) addNotification(seller.userId, '💰 تم صرف السحب', `تم صرف مبلغ ${formatPrice(w.amount)} لحسابك`, 'commission', { withdrawalId: id });
  saveDB(db); showToast('✅ تم تأكيد الدفع'); closeModal('wdModal'); navigate('admin-withdrawals');
}

function rejectWD(id) {
  const db = getDB(); const w = db.withdrawals.find(x => x.id === id); if (!w) return;
  document.getElementById('wdModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('wdModal')">
    <div class="modal glass scale-in" style="max-width:450px"><button class="modal-close" onclick="closeModal('wdModal')"><i class="fas fa-times"></i></button>
      <h2>❌ رفض طلب السحب</h2>
      <form onsubmit="return confirmRejectWD(event,'${id}')">
        <div class="input-group" style="margin-bottom:14px"><label>سبب الرفض</label><textarea id="wd_rnote" required placeholder="يرجى ذكر سبب الرفض"></textarea></div>
        <div class="btn-group"><button type="submit" class="btn btn-danger"><i class="fas fa-times"></i> تأكيد الرفض</button><button type="button" class="btn btn-outline" onclick="closeModal('wdModal')">إلغاء</button></div>
      </form>
    </div></div>`;
}

function confirmRejectWD(e, id) {
  e.preventDefault();
  const db = getDB(); const w = db.withdrawals.find(x => x.id === id); if (!w) return;
  const note = document.getElementById('wd_rnote').value.trim();
  w.status = 'rejected'; w.adminNote = note; w.processedAt = new Date().toISOString();
  const seller = db.sellers.find(s => s.id === w.sellerId);
  if (seller) addNotification(seller.userId, '❌ تم رفض السحب', `رفض طلب سحب ${formatPrice(w.amount)}: ${note}`, 'system');
  saveDB(db); showToast('✅ تم رفض الطلب'); closeModal('wdModal'); navigate('admin-withdrawals');
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN COUPONS
// ═══════════════════════════════════════════════════════════════

function renderAdminCoupons() {
  const db = getDB(); const coupons = [...db.coupons].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  return `<div class="fade-in">
    <div class="page-title"><h1>الكوبونات والخصومات</h1><p>${coupons.length} كوبون</p></div>
    <div class="card glass" style="margin-bottom:20px">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px">إضافة كوبون</h3>
      <form onsubmit="return saveCoupon(event)">
        <div class="grid grid-2" style="gap:14px">
          <div class="input-group"><label>الكود</label><input id="cp_code" required placeholder="مثال: SUMMER20" dir="ltr"></div>
          <div class="input-group"><label>النوع</label><select id="cp_type"><option value="percentage">نسبة %</option><option value="fixed">مبلغ ثابت</option></select></div>
          <div class="input-group"><label>القيمة</label><input id="cp_value" type="number" required min="1" placeholder="20 أو 500"></div>
          <div class="input-group"><label>الحد الأقصى للاستخدام</label><input id="cp_limit" type="number" value="100" min="1"></div>
          <div class="input-group"><label>تاريخ الانتهاء</label><input id="cp_expires" type="date" required></div>
          <div class="input-group"><label>المنتج (اختياري للكل)</label><select id="cp_product"><option value="">جميع المنتجات</option>${db.products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}</select></div>
        </div>
        <button type="submit" class="btn btn-primary w-full mt-2"><i class="fas fa-tag"></i> إضافة الكوبون</button>
      </form>
    </div>
    <div class="card glass"><div class="card-title" style="margin-bottom:12px">الكوبونات</div>
      ${coupons.length === 0 ? '<div class="empty-state" style="padding:30px"><p style="color:var(--muted)">لا توجد كوبونات بعد</p></div>' :
      `<div class="table-wrap"><table><thead><tr><th>الكود</th><th>القيمة</th><th>النوع</th><th>المنتج</th><th>استخدام</th><th>صلاحية</th><th>الحالة</th><th></th></tr></thead><tbody>${
        coupons.map(c => `<tr><td style="font-weight:700;font-family:monospace;direction:ltr;text-align:right">${c.code}</td>
          <td>${c.type==='percentage'?c.value+'%':formatPrice(c.value)}</td>
          <td>${c.type==='percentage'?'نسبة':'ثابت'}</td>
          <td style="font-size:12px">${c.productId?getProduct(c.productId)?.name||'—':'الكل'}</td>
          <td>${c.usedCount||0}/${c.usageLimit}</td>
          <td style="font-size:12px">${formatDate(c.expiresAt)}</td>
          <td>${new Date(c.expiresAt)<new Date()?'<span class="badge badge-danger">منتهي</span>':c.active?'<span class="badge badge-success">نشط</span>':'<span class="badge badge-danger">موقوف</span>'}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="toggleCoupon('${c.id}')"><i class="fas ${c.active?'fa-pause':'fa-play'}"></i></button></td></tr>`).join('')}
      </tbody></table></div>`}
    </div>
  </div>`;
}
function attachAdminCoupons() {}
function saveCoupon(e) {
  e.preventDefault(); const db = getDB();
  db.coupons.unshift({ id: genId(), code: document.getElementById('cp_code').value.trim().toUpperCase(), type: document.getElementById('cp_type').value, value: Number(document.getElementById('cp_value').value), usageLimit: Number(document.getElementById('cp_limit').value)||100, usedCount: 0, productId: document.getElementById('cp_product').value || '', active: true, expiresAt: document.getElementById('cp_expires').value, createdAt: new Date().toISOString() });
  saveDB(db); showToast('✅ تم إضافة الكوبون'); navigate('admin-coupons');
}
function toggleCoupon(id) { const db = getDB(); const c = db.coupons.find(x => x.id === id); if (c) c.active = !c.active; saveDB(db); showToast('✅ تم التغيير'); navigate('admin-coupons'); }

// ═══════════════════════════════════════════════════════════════
//  ADMIN TICKETS
// ═══════════════════════════════════════════════════════════════

function renderAdminTickets() {
  const db = getDB(); const tickets = [...db.tickets].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const pLbls = { low:'منخفضة', medium:'متوسطة', high:'عالية', urgent:'عاجلة' }; const pCls = { low:'badge-info', medium:'badge-warning', high:'badge-danger', urgent:'badge-danger' };
  const sLbls = { open:'مفتوحة', in_progress:'قيد المعالجة', resolved:'تم الحل', closed:'مغلقة' }; const sCls = { open:'badge-warning', in_progress:'badge-info', resolved:'badge-success', closed:'badge-secondary' };
  const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  return `<div class="fade-in">
    <div class="page-title"><h1>تذاكر الدعم</h1><p>${open.length} تذكرة مفتوحة</p></div>
    ${tickets.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-ticket"></i><h3>لا توجد تذاكر</h3></div>' :
    tickets.map(t => { const u = db.users.find(x => x.id === t.userId);
      return `<div class="card glass" style="margin-bottom:10px">
        <div class="flex items-center justify-between" style="margin-bottom:8px">
          <div><span style="font-weight:700;font-size:15px">${t.subject}</span> <span class="badge ${pCls[t.priority]||'badge-info'}">${pLbls[t.priority]||t.priority}</span></div>
          <div class="d-flex gap-2"><span class="badge ${sCls[t.status]||'badge-info'}">${sLbls[t.status]||t.status}</span></div>
        </div>
        <div style="font-size:13px;color:var(--muted)">من: ${u?u.name:'?'} | ${formatDate(t.createdAt)}</div>
        <div style="font-size:13px;margin-top:6px;background:var(--surface);padding:10px;border-radius:8px">${t.message}</div>
        ${t.response ? `<div style="font-size:13px;margin-top:6px;background:rgba(59,130,246,.06);padding:10px;border-radius:8px;border-right:3px solid var(--primary)"><span style="color:var(--muted);font-size:12px">الرد:</span> ${t.response}</div>` : ''}
        ${t.status === 'open' || t.status === 'in_progress' ? `<form onsubmit="return replyTicket(event,'${t.id}')" class="mt-2"><div class="d-flex gap-2"><input id="tk_reply_${t.id}" placeholder="اكتب ردك..." required style="flex:1"><select id="tk_status_${t.id}" style="width:auto"><option value="in_progress">قيد المعالجة</option><option value="resolved">تم الحل</option><option value="closed">إغلاق</option></select><button type="submit" class="btn btn-primary btn-sm"><i class="fas fa-reply"></i></button></div></form>` : ''}
      </div>`; }).join('')}
  </div>`;
}
function attachAdminTickets() {}
function replyTicket(e, id) {
  e.preventDefault(); const db = getDB(); const t = db.tickets.find(x => x.id === id); if (!t) return;
  const response = document.getElementById('tk_reply_'+id).value.trim();
  const status = document.getElementById('tk_status_'+id).value;
  if (!response) return;
  t.response = (t.response?t.response+'\n---\n':'')+response;
  t.status = status; t.updatedAt = new Date().toISOString();
  const u = db.users.find(x => x.id === t.userId);
  if (u) addNotification(u.id, '📩 رد على تذكرتك', response, 'system');
  saveDB(db); showToast('✅ تم الرد'); navigate('admin-tickets');
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN CHAT
// ═══════════════════════════════════════════════════════════════

function renderAdminChat() {
  const db = getDB(); const u = getCurrentUser();
  const sellers = db.sellers.filter(s => s.isActive);
  const msgs = db.chatMessages;
  const unread = {};
  sellers.forEach(s => { const uu = db.users.find(x => x.id === s.userId); if (!uu) return;
    const count = msgs.filter(m => m.from === uu.id && m.to === u.id && !m.read).length;
    if (count > 0) unread[uu.id] = count;
  });
  return `<div class="fade-in">
    <div class="page-title"><h1>المحادثات</h1><p>تواصل مع البائعين</p></div>
    <div class="card glass"><div class="card-title" style="margin-bottom:12px">قائمة المحادثات</div>
      ${sellers.length === 0 ? '<div class="empty-state" style="padding:30px"><p style="color:var(--muted)">لا يوجد بائعون نشطون</p></div>' :
      sellers.map(s => { const su = db.users.find(x => x.id === s.userId); if (!su) return '';
        const chatMsgs = msgs.filter(m => (m.from === su.id && m.to === u.id) || (m.from === u.id && m.to === su.id));
        const last = chatMsgs[chatMsgs.length - 1];
        return `<div class="d-flex items-center justify-between" style="padding:14px;border-bottom:1px solid var(--border);cursor:pointer" onclick="showChatWith('${su.id}')">
          <div class="d-flex gap-3"><div class="avatar gradient-bg" style="color:#fff;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">${su.name.charAt(0)}</div>
            <div><div style="font-weight:600">${su.name} <span style="font-size:12px;color:var(--muted)">(${s.totalOrders||0} طلب)</span></div>
            ${last ? `<div style="font-size:12px;color:var(--muted)">${last.message.slice(0,50)}${last.message.length>50?'...':''}</div>` : '<div style="font-size:12px;color:var(--muted)">لا توجد رسائل</div>'}</div></div>
          ${unread[su.id] ? `<span class="badge badge-danger" style="font-size:10px">${unread[su.id]}</span>` : ''}
        </div>`; }).join('')}
    </div>
    <div id="chatModal"></div>
  </div>`;
}
function attachAdminChat() {}
function showChatWith(userId) {
  const db = getDB(); const u = getCurrentUser(); const other = db.users.find(x => x.id === userId);
  if (!other) return;
  const msgs = db.chatMessages.filter(m => (m.from === userId && m.to === u.id) || (m.from === u.id && m.to === userId));
  msgs.forEach(m => { if (m.to === u.id) m.read = true; }); saveDB(db);
  document.getElementById('chatModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('chatModal')">
    <div class="modal glass scale-in" style="max-width:500px;padding:0;overflow:hidden"><button class="modal-close" onclick="closeModal('chatModal')"><i class="fas fa-times"></i></button>
      <div class="ds-chat-header"><div class="d-flex"><div class="avatar gradient-bg" style="color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">${other.name.charAt(0)}</div><span style="font-weight:600">${other.name}</span></div></div>
      <div class="ds-messages" id="chatModalMsgs" style="max-height:350px">${msgs.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--muted)">لا توجد رسائل</div>' :
        msgs.map(m => `<div class="ds-msg ${m.from===u.id?'ds-user':'ds-ai'}"><div class="ds-avatar" style="background:${m.from===u.id?'var(--primary)':'var(--accent)'};color:#fff;font-size:12px">${m.from===u.id?'أنت':other.name.charAt(0)}</div><div class="ds-bubble">${m.message}<div style="font-size:10px;color:var(--muted);margin-top:4px">${formatDate(m.createdAt)}</div></div></div>`).join('')}
      </div>
      <div class="ds-input"><form onsubmit="return adminChatSend(event,'${userId}')"><div class="d-flex" style="gap:8px"><input id="adminChatInput" placeholder="اكتب رسالة..." required style="flex:1"><button type="submit" class="btn btn-primary btn-icon"><i class="fas fa-paper-plane"></i></button></div></form></div>
    </div></div>`;
  setTimeout(() => { const el = document.getElementById('chatModalMsgs'); if (el) el.scrollTop = el.scrollHeight; }, 100);
}
function adminChatSend(e, toId) {
  e.preventDefault(); const u = getCurrentUser(); const db = getDB();
  const msg = document.getElementById('adminChatInput').value.trim();
  if (!msg) return;
  db.chatMessages.push({ id: genId(), from: u.id, to: toId, message: msg, read: false, createdAt: new Date().toISOString() });
  const other = db.users.find(x => x.id === toId);
  if (other) addNotification(other.id, '💬 رد من الإدارة', msg, 'system');
  saveDB(db); document.getElementById('adminChatInput').value = '';
  showChatWith(toId);
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN ANALYTICS
// ═══════════════════════════════════════════════════════════════

function renderAdminAnalytics() {
  const db = getDB(); const a = getAnalytics();
  const totalOrders = db.orders.length;
  const approvedOrders = db.orders.filter(o => o.status === 'approved').length;
  const totalRevenue = db.orders.filter(o => o.status === 'approved').reduce((s, o) => s + o.totalPrice, 0);
  const totalSellers = db.sellers.length;
  return `<div class="fade-in">
    <div class="page-title"><h1>Analytics</h1><p>إحصائيات متقدمة</p></div>
    <div class="grid grid-4 stagger" style="margin-bottom:20px">
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(59,130,246,.12);color:var(--primary)"><i class="fas fa-users"></i></div><div class="value">${a.unique}</div><div class="label">زوار فريدون</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(34,197,94,.12);color:var(--success)"><i class="fas fa-shopping-cart"></i></div><div class="value">${approvedOrders}</div><div class="label">طلبات مكتملة</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(139,92,246,.12);color:var(--accent)"><i class="fas fa-percent"></i></div><div class="value">${a.conversions}%</div><div class="label">Conversion Rate</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(234,179,8,.12);color:var(--warning)"><i class="fas fa-chart-line"></i></div><div class="value">${a.bounceRate}%</div><div class="label">Bounce Rate</div></div>
    </div>
    <div class="grid grid-2" style="gap:20px">
      <div class="card glass"><div class="card-title" style="margin-bottom:12px">أفضل الصفحات زيارة</div>
        ${a.topPages.length === 0 ? '<div style="color:var(--muted);font-size:13px">لا توجد بيانات كافية</div>' :
        a.topPages.map(([page, count], i) => `<div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>${i+1}. ${page}</span><span style="font-weight:700">${count}</span></div>`).join('')}
      </div>
      <div class="card glass"><div class="card-title" style="margin-bottom:12px">مصادر الزيارات</div>
        ${a.topSources.length === 0 ? '<div style="color:var(--muted);font-size:13px">لا توجد بيانات كافية</div>' :
        a.topSources.map(([src, count]) => `<div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>${src === 'direct' ? 'مباشر' : src}</span><span style="font-weight:700">${count}</span></div>`).join('')}
      </div>
    </div>
    <div class="card glass mt-4"><div class="card-title" style="margin-bottom:12px">نظرة عامة</div>
      <div class="grid grid-4" style="gap:14px">
        <div><span style="color:var(--muted);font-size:12px">إجمالي الطلبات</span><div style="font-size:20px;font-weight:800">${totalOrders}</div></div>
        <div><span style="color:var(--muted);font-size:12px">الإيرادات</span><div style="font-size:20px;font-weight:800;color:var(--success)">${formatPrice(totalRevenue)}</div></div>
        <div><span style="color:var(--muted);font-size:12px">البائعون</span><div style="font-size:20px;font-weight:800">${totalSellers}</div></div>
        <div><span style="color:var(--muted);font-size:12px">الزوار</span><div style="font-size:20px;font-weight:800">${a.total}</div></div>
      </div>
    </div>
  </div>`;
}
function attachAdminAnalytics() {}

// ═══════════════════════════════════════════════════════════════
//  ADMIN BACKUPS
// ═══════════════════════════════════════════════════════════════

function renderAdminBackups() {
  const db = getDB(); const backups = [...db.backups].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  return `<div class="fade-in">
    <div class="page-title"><h1>النسخ الاحتياطي</h1><p>حماية بياناتك</p></div>
    <div class="grid grid-2" style="gap:20px;margin-bottom:20px">
      <div class="card glass"><div class="card-title" style="margin-bottom:12px"><i class="fas fa-download" style="color:var(--primary)"></i> تصدير / استيراد</div>
        <button class="btn btn-primary w-full mb-2" onclick="exportDB()"><i class="fas fa-file-export"></i> تصدير JSON</button>
        <div class="input-group"><label>استيراد ملف JSON</label><input type="file" accept=".json" onchange="if(this.files[0])importDB(this.files[0]).then(()=>setTimeout(()=>navigate('admin'),500)).catch(e=>showToast('❌ فشل الاستيراد: '+e.message,'error'))"></div>
      </div>
      <div class="card glass"><div class="card-title" style="margin-bottom:12px"><i class="fas fa-clock" style="color:var(--primary)"></i> إنشاء نسخة</div>
        <button class="btn btn-primary w-full mb-2" onclick="createBackup('نسخة يدوية');navigate('admin-backups')"><i class="fas fa-plus"></i> إنشاء نسخة احتياطية</button>
        <p style="font-size:12px;color:var(--muted)">يتم إنشاء نسخة احتياطية كاملة من جميع البيانات</p>
      </div>
    </div>
    <div class="card glass"><div class="card-title" style="margin-bottom:12px">النسخ المحفوظة (${backups.length})</div>
      ${backups.length === 0 ? '<div class="empty-state" style="padding:30px"><p style="color:var(--muted)">لا توجد نسخ احتياطية</p></div>' :
      backups.map(b => `<div style="padding:12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-weight:600">${b.label} <span style="font-size:12px;color:var(--muted)">(${formatFileSize(b.size)})</span></div><div style="font-size:12px;color:var(--muted)">${formatDate(b.createdAt)}</div></div>
        <div class="d-flex gap-2"><button class="btn btn-sm btn-outline" onclick="restoreBackup('${b.id}')" style="color:var(--warning)"><i class="fas fa-undo"></i></button>
          <button class="btn btn-sm btn-ghost" onclick="(async()=>{const db=getDB();db.backups=db.backups.filter(x=>x.id!=='${b.id}');saveDB(db);showToast('✅ تم الحذف');navigate('admin-backups')})()"><i class="fas fa-trash" style="color:var(--danger)"></i></button></div>
      </div>`).join('')}
    </div>
  </div>`;
}
function attachAdminBackups() {}

// ═══════════════════════════════════════════════════════════════
//  ADMIN ERRORS
// ═══════════════════════════════════════════════════════════════

function renderAdminErrors() {
  const db = getDB(); const errors = [...db.errorLogs].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)).slice(0,100);
  return `<div class="fade-in">
    <div class="page-title"><h1>مراقبة الأخطاء</h1><p>${errors.length} خطأ مسجل</p></div>
    <div class="d-flex gap-2" style="margin-bottom:16px">
      <button class="btn btn-outline btn-sm" onclick="const db=getDB();db.errorLogs=[];saveDB(db);showToast('✅ تم المسح');navigate('admin-errors')"><i class="fas fa-trash"></i> مسح الكل</button>
    </div>
    ${errors.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-check-circle" style="color:var(--success);opacity:1"></i><h3>لا توجد أخطاء مسجلة</h3></div>' :
    `<div class="table-wrap card glass"><table><thead><tr><th>المصدر</th><th>الرسالة</th><th>الرابط</th><th>التاريخ</th></tr></thead><tbody>${
      errors.map(e => `<tr><td><span class="badge badge-danger">${e.source||'?'}</span></td>
        <td style="font-size:13px;max-width:300px;overflow:hidden;text-overflow:ellipsis">${e.message||''}</td>
        <td style="font-size:11px;color:var(--muted);direction:ltr;max-width:200px;overflow:hidden;text-overflow:ellipsis">${e.url||''}</td>
        <td style="font-size:12px;color:var(--muted)">${formatDate(e.createdAt)}</td></tr>`).join('')}
    </tbody></table></div>`}
  </div>`;
}
function attachAdminErrors() {}

// ═══════════════════════════════════════════════════════════════
//  ADMIN SESSIONS
// ═══════════════════════════════════════════════════════════════

function renderAdminSessions() {
  const db = getDB();
  return `<div class="fade-in">
    <div class="page-title"><h1>جلسات الأجهزة</h1><p>الأجهزة المتصلة والنشاط</p></div>
    ${db.users.map(u => { const sessions = u.sessions || [];
      return `<div class="card glass" style="margin-bottom:12px">
        <div class="card-title" style="margin-bottom:12px"><i class="fas fa-user"></i> ${u.name} (${u.email}) <span class="badge ${u.role==='admin'?'badge-info':'badge-success'}">${u.role}</span> <span style="font-size:12px;color:var(--muted)">${sessions.length} جلسة</span></div>
        ${sessions.length === 0 ? '<div style="color:var(--muted);font-size:13px">لا توجد جلسات</div>' :
        sessions.map(s => `<div style="padding:10px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-size:13px;direction:ltr;text-align:right">${s.platform||'—'}</div><div style="font-size:11px;color:var(--muted)">${s.userAgent?.slice(0,60)||''}...</div><div style="font-size:11px;color:var(--muted)">آخر نشاط: ${formatDate(s.lastActive)} | منذ ${timeAgo(s.lastActive)}</div></div>
          <button class="btn btn-ghost btn-sm" onclick="removeSession('${u.id}','${s.id}');showToast('✅ تم قطع الجلسة');navigate('admin-sessions')" style="color:var(--danger)"><i class="fas fa-sign-out-alt"></i></button>
        </div>`).join('')}
      </div>`; }).join('')}
  </div>`;
}
function attachAdminSessions() {}

// ═══════════════════════════════════════════════════════════════
//  ADMIN WALLET ALL
// ═══════════════════════════════════════════════════════════════

function renderAdminWalletAll() {
  const db = getDB();
  const totalBalance = db.sellers.reduce((s, x) => s + (x.balance||0), 0);
  const totalWithdrawn = db.withdrawals.filter(w => w.status === 'approved').reduce((s, w) => s + w.amount, 0);
  const totalPending = db.orders.filter(o => o.status === 'pending').reduce((s, o) => {
    const comm = db.commissions.find(c => c.orderId === o.id);
    return s + (comm ? comm.amount : 0);
  }, 0);
  return `<div class="fade-in">
    <div class="page-title"><h1>المحافظ</h1><p>إدارة أرصدة البائعين</p></div>
    <div class="grid grid-3 stagger" style="margin-bottom:20px">
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(59,130,246,.12);color:var(--primary)"><i class="fas fa-wallet"></i></div><div class="value" style="color:var(--primary)">${formatPrice(totalBalance)}</div><div class="label">إجمالي الأرصدة</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(34,197,94,.12);color:var(--success)"><i class="fas fa-hand-holding-usd"></i></div><div class="value" style="color:var(--success)">${formatPrice(totalWithdrawn)}</div><div class="label">تم السحب</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(234,179,8,.12);color:var(--warning)"><i class="fas fa-clock"></i></div><div class="value" style="color:var(--warning)">${formatPrice(totalPending)}</div><div class="label">Pending</div></div>
    </div>
    <div class="card glass"><div class="card-title" style="margin-bottom:12px">أرصدة البائعين</div>
      <div class="table-wrap"><table><thead><tr><th>البائع</th><th>الإجمالي</th><th>Pending</th><th>قابل للسحب</th><th>تم السحب</th><th>الإجراءات</th></tr></thead><tbody>${
        db.sellers.map(s => { const u = db.users.find(x => x.id === s.userId); recalcWallet(s.id);
          const withdrawn = db.withdrawals.filter(w => w.sellerId === s.id && w.status === 'approved').reduce((a,w) => a + w.amount, 0);
          return `<tr><td><div style="font-weight:600">${u?u.name:'—'}</div><div style="font-size:12px;color:var(--muted)">${u?u.email:''}</div></td>
            <td style="font-weight:700;color:var(--primary)">${formatPrice(s.balance||0)}</td>
            <td style="color:var(--warning)">${formatPrice(s.pendingBalance||0)}</td>
            <td style="color:var(--success);font-weight:700">${formatPrice(s.withdrawableBalance||0)}</td>
            <td>${formatPrice(withdrawn)}</td>
            <td><button class="btn btn-ghost btn-sm" onclick="editSeller('${s.id}')"><i class="fas fa-pen"></i></button></td></tr>`; }).join('')}
      </tbody></table></div>
    </div>
  </div>`;
}
function attachAdminWalletAll() {}
