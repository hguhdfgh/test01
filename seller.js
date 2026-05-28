// ═══════════════════════════════════════════════════════════════
//  SELLER PAGES
// ═══════════════════════════════════════════════════════════════

// ─── Dashboard ───
function renderSellerDashboard() {
  const u = getCurrentUser(); const seller = getSeller();
  const db = getDB(); const orders = db.orders.filter(o => o.sellerId === u.id);
  const pending = orders.filter(o => o.status === 'pending').length;
  const approved = orders.filter(o => o.status === 'approved').length;
  const earnings = seller ? seller.totalEarnings : 0;
  const hidden = seller?.hiddenCreds || [];
  const recent = [...orders].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)).slice(0,10);
  const monthlyData = {};
  orders.filter(o => o.status === 'approved').forEach(o => {
    if (!o.createdAt) return;
    const m = new Date(o.createdAt).toLocaleString('ar-SA',{month:'short'});
    monthlyData[m] = (monthlyData[m] || 0) + o.totalPrice;
  });
  setTimeout(() => {
    const c = document.getElementById('sellerChart');
    if (c) new Chart(c, { type: 'bar', data: { labels: Object.keys(monthlyData), datasets: [{ label: 'الأرباح', data: Object.values(monthlyData), backgroundColor: 'rgba(59,130,246,.6)', borderRadius: 6 }] }, options: { responsive: true, plugins: { legend: { display: false } } } });
  }, 100);
  return `<div class="fade-in">
    <div class="page-title"><h1>مرحباً، ${u.name} 👋</h1><p>نظرة عامة على نشاطك</p></div>
    <div class="grid grid-4 stagger">
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(59,130,246,.12);color:var(--primary)"><i class="fas fa-cart-shopping"></i></div><div class="value">${orders.length}</div><div class="label">إجمالي الطلبات</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(34,197,94,.12);color:var(--success)"><i class="fas fa-dollar-sign"></i></div><div class="value">${formatPrice(earnings)}</div><div class="label">الأرباح</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(234,179,8,.12);color:var(--warning)"><i class="fas fa-clock"></i></div><div class="value">${pending}</div><div class="label">قيد الانتظار</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(139,92,246,.12);color:var(--accent)"><i class="fas fa-check-circle"></i></div><div class="value">${approved}</div><div class="label">مقبولة</div></div>
    </div>
    <div class="grid grid-2" style="margin-top:20px">
      <div class="card glass"><div class="card-header"><span class="card-title"><i class="fas fa-chart-line" style="color:var(--primary)"></i> أرباحي الشهرية</span></div><canvas id="sellerChart" height="200"></canvas></div>
      <div class="card glass"><div class="card-header"><span class="card-title"><i class="fas fa-list" style="color:var(--primary)"></i> آخر الطلبات</span><button class="btn btn-primary btn-sm" onclick="navigate('seller-orders')"><i class="fas fa-plus"></i> طلب جديد</button></div>
        ${recent.length === 0 ? '<div class="empty-state" style="padding:20px"><p>لا توجد طلبات بعد</p></div>' :
        recent.map(o => { const p = getProduct(o.productId); const a = db.accounts.find(x => x.id === o.accountId);
          const isHidden = hidden.includes(o.accountId);
          return `<div style="padding:12px 0;border-bottom:1px solid var(--border)">
            <div class="flex items-center justify-between" style="margin-bottom:6px">
              <div><div style="font-weight:600;font-size:14px">${p?p.name:'—'}</div><div style="font-size:12px;color:var(--muted)">${o.customerName}</div></div>
              <div style="text-align:left"><div style="font-weight:600">${formatPrice(o.totalPrice)}</div><div>${statusBadge(o.status)}</div></div>
            </div>
            ${o.status === 'approved' && a && !isHidden ? `<div class="flex items-center justify-between" style="background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.15);border-radius:10px;padding:10px 12px;margin-top:6px">
              <div style="font-size:13px;font-family:monospace;direction:ltr;text-align:left;color:var(--success);flex:1;overflow:hidden;text-overflow:ellipsis">${a.creds.replace(/\|/g,' | ')}</div>
              <button class="btn btn-ghost btn-sm" onclick="hideSellerCreds('${o.accountId}')" title="إخفاء البيانات" style="flex-shrink:0;color:var(--muted)"><i class="fas fa-eye-slash"></i></button>
            </div>` : o.status === 'approved' && a && isHidden ? `<div style="margin-top:6px"><button class="btn btn-outline btn-sm" onclick="unhideSellerCreds('${o.accountId}')"><i class="fas fa-eye"></i> إظهار البيانات</button></div>` : ''}
          </div>`;}).join('')}
      </div>
    </div>
  </div>`;
}

function hideSellerCreds(accountId) {
  const db = getDB(); const u = getCurrentUser();
  const seller = db.sellers.find(s => s.userId === u.id);
  if (!seller) return;
  if (!seller.hiddenCreds) seller.hiddenCreds = [];
  if (!seller.hiddenCreds.includes(accountId)) seller.hiddenCreds.push(accountId);
  saveDB(db); showToast('✅ تم إخفاء بيانات الحساب'); navigate('seller');
}

function unhideSellerCreds(accountId) {
  const db = getDB(); const u = getCurrentUser();
  const seller = db.sellers.find(s => s.userId === u.id);
  if (!seller || !seller.hiddenCreds) return;
  seller.hiddenCreds = seller.hiddenCreds.filter(id => id !== accountId);
  saveDB(db); showToast('✅ تم إظهار البيانات'); navigate('seller');
}

// ─── Products (View Only) ───
function renderSellerProducts() {
  const db = getDB(); const avail = db.products.filter(p => p.available);
  const catLabels = { netflix:'Netflix', capcut:'CapCut Pro', tiktok:'TikTok Ads', canva:'Canva Pro', spotify:'Spotify', chatgpt:'ChatGPT Plus', youtube:'YouTube Premium', disney:'Disney+', other:'أخرى' };
  return `<div class="fade-in">
    <div class="card-header"><div><h2 style="font-size:20px;font-weight:700">المنتجات المتوفرة</h2></div>
      <input id="spSearch" placeholder="بحث..." oninput="searchSellerProd()" style="width:200px"></div>
    <div class="grid grid-3" id="sellerProdGrid">
      ${avail.length === 0 ? '<div class="empty-state card glass" style="grid-column:1/-1"><i class="fas fa-box"></i><h3>لا توجد منتجات متوفرة حالياً</h3></div>' :
      avail.map(p => `<div class="card glass glass-hover prod-card" data-name="${p.name}" style="cursor:pointer" onclick="showProdDetails('${p.id}')">
        <div style="width:100%;height:100px;border-radius:12px;background:rgba(59,130,246,.08);display:flex;align-items:center;justify-content:center;margin-bottom:12px;font-size:36px"><i class="fas fa-box" style="color:var(--primary)"></i></div>
        <h3 style="font-size:16px;font-weight:700">${p.name}</h3>
        <div class="flex items-center justify-between" style="margin-top:8px">
          <span style="font-weight:700;color:var(--primary);font-size:18px">${formatPrice(p.price)}</span>
          <span style="font-size:12px;color:var(--muted)"><i class="fas fa-clock"></i> ${p.duration} يوم</span></div>
        <div style="margin-top:8px;font-size:12px;color:var(--muted)">${p.desc ? p.desc.slice(0,60)+'...' : ''}</div>
        <div style="margin-top:10px"><span class="badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}">${p.stock > 0 ? `${p.stock} متاح` : 'نفذ من المخزون'}</span></div>
      </div>`).join('')}
    </div>
    <div id="prodDetailModal"></div>
  </div>`;
}

function searchSellerProd() {
  const q = document.getElementById('spSearch')?.value.toLowerCase() || '';
  document.querySelectorAll('.prod-card').forEach(c => {
    c.style.display = c.dataset.name.toLowerCase().includes(q) ? '' : 'none';
  });
}

function showProdDetails(id) {
  const p = getProduct(id); if (!p) return;
  document.getElementById('prodDetailModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('prodDetailModal')">
    <div class="modal glass scale-in"><button class="modal-close" onclick="closeModal('prodDetailModal')"><i class="fas fa-times"></i></button>
      <h2>${p.name}</h2>
      <div style="margin-bottom:16px;height:120px;border-radius:12px;background:rgba(59,130,246,.08);display:flex;align-items:center;justify-content:center;font-size:48px"><i class="fas fa-box" style="color:var(--primary)"></i></div>
      <div class="grid grid-2" style="gap:12px;margin-bottom:16px">
        <div class="stat-card" style="padding:12px;background:var(--surface);border-radius:12px"><div class="value" style="font-size:20px;color:var(--primary)">${formatPrice(p.price)}</div><div class="label">السعر</div></div>
        <div class="stat-card" style="padding:12px;background:var(--surface);border-radius:12px"><div class="value" style="font-size:20px">${p.duration}</div><div class="label">المدة (أيام)</div></div></div>
      <p style="color:var(--muted);font-size:14px;margin-bottom:16px">${p.desc || 'لا يوجد وصف'}</p>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">المخزون: <strong style="color:${p.stock>0?'var(--success)':'var(--danger)'}">${p.stock}</strong></p>
      <button class="btn btn-primary w-full" onclick="closeModal('prodDetailModal');navigate('seller-orders')"><i class="fas fa-cart-plus"></i> إنشاء طلب</button>
    </div></div>`;
}

// ─── Orders (Create + View) ───
function renderSellerOrders() {
  const u = getCurrentUser(); const db = getDB();
  const seller = getSeller();
  const hidden = seller?.hiddenCreds || [];
  const orders = db.orders.filter(o => o.sellerId === u.id).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const activePMs = db.settings.paymentMethods.filter(pm => pm.active);
  return `<div class="fade-in">
    <div class="tabs"><button class="tab active" id="tabNew" onclick="switchSellerTab('new')"><i class="fas fa-plus"></i> طلب جديد</button><button class="tab" id="tabMy" onclick="switchSellerTab('my')"><i class="fas fa-list"></i> طلباتي (${orders.length})</button></div>
    <div id="tabNewContent" class="tab-content active">
      <div class="card glass"><h3 style="font-size:18px;font-weight:700;margin-bottom:16px">إنشاء طلب جديد</h3>
        <form id="newOrderForm" onsubmit="return createOrder(event)">
          <div class="grid grid-2" style="gap:14px">
            <div class="input-group"><label>المنتج</label><select id="or_prod" required onchange="calcOrderPrice()">
              ${db.products.filter(p=>p.available).map(p => `<option value="${p.id}" data-price="${p.price}" data-dur="${p.duration}">${p.name} - ${formatPrice(p.price)}</option>`).join('')}</select></div>
            <div class="input-group"><label>المدة (أيام)</label><input id="or_dur" type="number" value="30" required min="1" onchange="calcOrderPrice()"></div>
            <div class="input-group"><label>اسم الزبون</label><input id="or_name" required></div>
            <div class="input-group"><label>رقم الهاتف</label><input id="or_phone" required></div>
            <div class="input-group full"><label>وسيلة الدفع</label>
              <select id="or_payment">${activePMs.map(pm => `<option value="${pm.type}" data-min="${pm.minAmount||0}">${pm.icon||'💳'} ${pm.label}${pm.minAmount>0?' (الحد الأدنى: '+formatPrice(pm.minAmount)+')':''}</option>`).join('')}</select></div>
            <div class="input-group full"><label>إثبات الدفع (صورة/مستند - حد أقصى 5MB)</label>
              <input id="or_proof_file" type="file" accept="image/*,.pdf,.doc,.docx" onchange="previewProofFile(event)">
              <div id="proofPreview" style="margin-top:6px"></div>
              <input id="or_proof_link" placeholder="أو رابط صورة (اختياري)" style="margin-top:6px"></div>
            <div class="input-group full"><label>ملاحظات</label><textarea id="or_notes" placeholder="اختياري"></textarea></div>
            <div class="input-group full" style="flex-direction:row;justify-content:space-between;align-items:center;padding:14px;background:var(--surface);border-radius:12px">
              <span style="font-weight:600">الإجمالي:</span><span id="or_total" style="font-size:22px;font-weight:800;color:var(--primary)">${formatPrice(db.products.find(p=>p.available)?db.products.find(p=>p.available).price:0)}</span></div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg w-full mt-2"><i class="fas fa-paper-plane"></i> إرسال الطلب</button>
        </form>
      </div>
    </div>
    <div id="tabMyContent" class="tab-content">
      <div class="card-header"><div><h3 style="font-size:18px;font-weight:700">طلباتي</h3></div>
        <select id="myOrderFilter" onchange="filterMyOrders()" style="width:auto;padding:8px 14px">
          <option value="all">الكل</option><option value="pending">قيد الانتظار</option><option value="approved">مقبول</option><option value="rejected">مرفوض</option></select></div>
      ${orders.length === 0 ? '<div class="empty-state card glass"><i class="fas fa-cart-shopping"></i><h3>لا توجد طلبات</h3></div>' :
      `<div class="table-wrap card glass"><table id="myOrdersTable"><thead><tr><th>المنتج</th><th>الزبون</th><th>المبلغ</th><th>العمولة</th><th>الحالة</th><th>بيانات الحساب</th><th>التاريخ</th></tr></thead><tbody>${
        orders.map(o => { const p = getProduct(o.productId); const a = db.accounts.find(x => x.id === o.accountId);
          const comm = db.commissions.find(c => c.orderId === o.id);
          const isHidden = hidden.includes(o.accountId);
          const pm = activePMs.find(x => x.type === o.paymentMethod);
          return `<tr data-st="${o.status}">
            <td><div style="font-weight:600;font-size:13px">${p?p.name:'—'}</div></td>
            <td><div style="font-size:13px">${o.customerName}</div><div style="font-size:11px;color:var(--muted);direction:ltr;text-align:right">${o.customerPhone}</div></td>
            <td style="font-weight:600">${formatPrice(o.totalPrice)}</td>
            <td style="font-weight:600;color:var(--success)">${o.status === 'approved' && comm ? formatPrice(comm.amount) : '—'}</td>
            <td>${statusBadge(o.status)}</td>
            <td style="max-width:240px">${o.status === 'approved' && a ? (isHidden ? `<button class="btn btn-outline btn-sm" onclick="unhideSellerCreds('${o.accountId}');navigate('seller-orders')"><i class="fas fa-eye"></i> إظهار</button>` :
              `<div style="display:flex;align-items:center;gap:4px"><span style="font-size:12px;font-family:monospace;direction:ltr;color:var(--success);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px" title="${a.creds.replace(/\|/g,' | ')}">${a.creds.replace(/\|/g,' | ')}</span>
              <button class="btn btn-ghost btn-sm" onclick="hideSellerCreds('${o.accountId}');navigate('seller-orders')" title="إخفاء" style="padding:2px 6px;font-size:10px"><i class="fas fa-eye-slash"></i></button>
              <button class="btn btn-ghost btn-sm" onclick="copyText('${a.creds.replace(/'/g,"\\'")}')" title="نسخ" style="padding:2px 6px;font-size:10px"><i class="fas fa-copy"></i></button></div>`)
              : o.status === 'pending' ? '<span class="badge badge-warning">انتظار</span>' : o.status === 'rejected' ? '<span class="badge badge-danger">مرفوض</span>' : '—'}</td>
            <td style="font-size:12px;color:var(--muted)">${formatDate(o.createdAt)}
              ${o.paymentProof ? `<br><span style="font-size:10px;color:var(--primary);cursor:pointer" onclick="viewProof('${o.id}')">📎 إثبات دفع</span>` : ''}
              ${pm ? `<br><span style="font-size:10px">${pm.icon||''} ${pm.label}</span>` : ''}</td>
          </tr>`;}).join('')
      }</tbody></table></div>`}
    </div>
    <div id="credsModal"></div>
  </div>`;
}

function attachSellerOrders() { calcOrderPrice(); }

function previewProofFile(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('proofPreview');
  if (!file) { preview.innerHTML = ''; return; }
  if (file.size > 5 * 1024 * 1024) { preview.innerHTML = '<span style="color:var(--danger);font-size:13px">⚠️ الملف كبير جداً (الحد الأقصى 5MB)</span>'; e.target.value = ''; return; }
  if (file.type.startsWith('image/')) {
    const r = new FileReader();
    r.onload = () => { preview.innerHTML = `<img src="${r.result}" style="max-height:80px;border-radius:8px;border:1px solid var(--border)">`; };
    r.readAsDataURL(file);
  } else {
    preview.innerHTML = `<span style="font-size:13px;color:var(--muted)">📄 ${file.name} (${formatFileSize(file.size)})</span>`;
  }
}

function switchSellerTab(t) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab' + (t === 'new' ? 'New' : 'My')).classList.add('active');
  document.getElementById('tab' + t + 'Content').classList.add('active');
}

function calcOrderPrice() {
  const sel = document.getElementById('or_prod');
  const opt = sel.options[sel.selectedIndex];
  if (!opt) return;
  const price = Number(opt.dataset.price);
  const dur = Number(document.getElementById('or_dur').value) || 30;
  const baseDur = Number(opt.dataset.dur) || 30;
  const total = Math.round(price * (dur / baseDur));
  document.getElementById('or_total').textContent = formatPrice(total);
}

function copyText(t) { navigator.clipboard.writeText(t.replace(/\|/g,'\n')).then(() => showToast('✅ تم النسخ')); }

function viewProof(orderId) {
  const db = getDB(); const o = db.orders.find(x => x.id === orderId);
  if (!o || !o.paymentProof) return;
  if (o.paymentProof.startsWith('data:')) {
    document.getElementById('credsModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('credsModal')">
      <div class="modal glass scale-in" style="max-width:600px"><button class="modal-close" onclick="closeModal('credsModal')"><i class="fas fa-times"></i></button>
        <h2>📎 إثبات الدفع</h2><img src="${o.paymentProof}" style="width:100%;border-radius:12px"></div></div>`;
  } else {
    window.open(o.paymentProof, '_blank');
  }
}

function createOrder(e) {
  e.preventDefault();
  const db = getDB(); const u = getCurrentUser();
  const pid = document.getElementById('or_prod').value;
  const dur = Number(document.getElementById('or_dur').value) || 30;
  const name = document.getElementById('or_name').value.trim();
  const phone = document.getElementById('or_phone').value.trim();
  const notes = document.getElementById('or_notes').value.trim();
  const paymentMethod = document.getElementById('or_payment')?.value || '';
  const proofLink = document.getElementById('or_proof_link')?.value.trim() || '';
  const proofFile = document.getElementById('or_proof_file')?.files?.[0] || null;
  if (!name || !phone) { showToast('يرجى ملء جميع الحقول المطلوبة','error'); return; }
  const product = getProduct(pid);
  const total = Math.round(product.price * (dur / product.duration));
  const pm = db.settings.paymentMethods.find(p => p.type === paymentMethod);
  if (pm && pm.minAmount > 0 && total < pm.minAmount) {
    showToast(`الحد الأدنى لـ ${pm.label} هو ${formatPrice(pm.minAmount)}`, 'error'); return;
  }
  const orderId = genId();
  const doCreate = async (proofVal) => {
    db.orders.unshift({ id: orderId, sellerId: u.id, productId: pid, customerName: name, customerPhone: phone, customerNotes: notes, durationDays: dur, totalPrice: total, paymentMethod, paymentProof: proofVal, status: 'pending', accountId: null, createdAt: new Date().toISOString() });
    notifyAdmins('🆕 طلب جديد', `طلب جديد من ${u.name} - ${product.name} بقيمة ${formatPrice(total)}`, 'order_new', { orderId });
    saveDB(db);
    showToast('✅ تم إنشاء الطلب بنجاح');
    switchSellerTab('my'); navigate('seller-orders');
  };
  if (proofFile) {
    readFileAsBase64(proofFile).then(b64 => doCreate(b64)).catch(err => showToast(err.message, 'error'));
  } else {
    doCreate(proofLink || '');
  }
}

function filterMyOrders() {
  const v = document.getElementById('myOrderFilter').value;
  document.querySelectorAll('#myOrdersTable tbody tr').forEach(tr => { tr.style.display = (v === 'all' || tr.dataset.st === v) ? '' : 'none'; });
}

function showCreds(id) {
  const db = getDB(); const a = db.accounts.find(x => x.id === id); if (!a) return;
  const parts = a.creds.split('|'); const formatted = parts.map(p => { const [k,v] = p.split(':'); return `<div style="padding:6px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted);font-size:13px">${k}: </span><strong>${v||''}</strong></div>`; }).join('');
  document.getElementById('credsModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('credsModal')">
    <div class="modal glass scale-in" style="max-width:450px"><button class="modal-close" onclick="closeModal('credsModal')"><i class="fas fa-times"></i></button>
      <h2><i class="fas fa-key" style="color:var(--success)"></i> بيانات الحساب</h2>
      <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:12px;padding:16px;margin-bottom:16px">
        ${formatted}
      </div>
      <button class="btn btn-success w-full" onclick="copyCreds('${a.creds}')"><i class="fas fa-copy"></i> نسخ البيانات</button>
    </div></div>`;
}

function copyCreds(creds) {
  navigator.clipboard.writeText(creds.replace(/\|/g,'\n')).then(() => showToast('✅ تم نسخ البيانات')); 
}

// ─── Profile ───
function renderSellerProfile() {
  const u = getCurrentUser(); const seller = getSeller(); const db = getDB();
  const orders = db.orders.filter(o => o.sellerId === u.id);
  const approved = orders.filter(o => o.status === 'approved');
  const withdrawn = db.withdrawals.filter(w => w.sellerId === seller?.id && w.status === 'approved').reduce((s,w) => s + w.amount, 0);
  const balance = (seller?.totalEarnings || 0) - withdrawn;
  const activePMs = db.settings.paymentMethods.filter(p => p.active);
  return `<div class="fade-in">
    <div class="grid grid-2">
      <div class="card glass">
        <div class="card-title" style="margin-bottom:16px"><i class="fas fa-user" style="color:var(--primary)"></i> الملف الشخصي</div>
        <div class="flex items-center gap-4" style="margin-bottom:20px">
          <div class="avatar gradient-bg" style="color:#fff;width:60px;height:60px;font-size:24px">${u.name.charAt(0)}</div>
          <div><h3 style="font-size:20px;font-weight:700">${u.name}</h3><p style="color:var(--muted);font-size:13px">${u.email}</p></div>
        </div>
        <form onsubmit="return updateProfile(event)">
          <div class="input-group" style="margin-bottom:14px"><label>الاسم الكامل</label><input id="prof_name" value="${u.name}" required></div>
          <div class="input-group" style="margin-bottom:14px"><label>رقم الهاتف</label><input id="prof_phone" value="${u.phone||''}" dir="ltr"></div>
          <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
          <div class="card-title" style="margin-bottom:12px"><i class="fas fa-credit-card" style="color:var(--success)"></i> وسيلة الدفع الافتراضية للسحب</div>
          <div class="grid grid-2" style="gap:10px;margin-bottom:14px">
            <div class="input-group"><label>وسيلة الدفع</label>
              <select id="prof_pm">${activePMs.map(pm => `<option value="${pm.type}" ${seller?.defaultPM===pm.type?'selected':''}>${pm.icon||''} ${pm.label}</option>`).join('')}</select></div>
            <div class="input-group"><label>معلومات الدفع</label><input id="prof_pm_details" value="${seller?.defaultPMDetails||''}" placeholder="رقم الحساب أو العنوان"></div>
          </div>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ التغييرات</button>
        </form>
      </div>
      <div class="card glass">
        <div class="card-title" style="margin-bottom:16px"><i class="fas fa-chart-bar" style="color:var(--success)"></i> إحصائياتي</div>
        <div class="grid grid-2" style="gap:12px">
          <div class="stat-card" style="padding:16px;background:var(--surface);border-radius:12px"><div class="value" style="font-size:22px">${orders.length}</div><div class="label">إجمالي الطلبات</div></div>
          <div class="stat-card" style="padding:16px;background:var(--surface);border-radius:12px"><div class="value" style="font-size:22px;color:var(--success)">${formatPrice(seller?seller.totalEarnings:0)}</div><div class="label">إجمالي الأرباح</div></div>
          <div class="stat-card" style="padding:16px;background:var(--surface);border-radius:12px"><div class="value" style="font-size:22px">${seller?seller.totalSales:0}</div><div class="label">المبيعات</div></div>
          <div class="stat-card" style="padding:16px;background:var(--surface);border-radius:12px"><div class="value" style="font-size:22px">${seller?seller.commissionRate:0}%</div><div class="label">العمولة</div></div>
        </div>
        <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
        <div style="padding:16px;background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.15);border-radius:12px;margin-bottom:12px">
          <div style="font-size:13px;color:var(--muted);margin-bottom:4px">الرصيد القابل للسحب</div>
          <div style="font-size:28px;font-weight:800;color:var(--success)">${formatPrice(balance)}</div>
        </div>
        <div class="flex items-center justify-between" style="padding:8px 0;font-size:13px">
          <span style="color:var(--muted)">تم سحبه</span><span>${formatPrice(withdrawn)}</span>
        </div>
        <div class="flex items-center justify-between" style="padding:8px 0;font-size:13px">
          <span style="color:var(--muted)">آخر نشاط</span><span>${seller?.lastActive ? formatDate(seller.lastActive) : '—'}</span>
        </div>
        <button class="btn btn-success w-full mt-2" onclick="navigate('seller-withdrawals')" ${balance < 500 ? 'disabled style="opacity:.5"' : ''}><i class="fas fa-money-bill-transfer"></i> طلب سحب الأرباح</button>
      </div>
    </div>
  </div>`;
}

function attachSellerProfile() {}

function updateProfile(e) {
  e.preventDefault();
  const db = getDB(); const u = getCurrentUser(); if (!u) return;
  const name = document.getElementById('prof_name').value.trim();
  const phone = document.getElementById('prof_phone').value.trim();
  const defaultPM = document.getElementById('prof_pm')?.value || '';
  const defaultPMDetails = document.getElementById('prof_pm_details')?.value.trim() || '';
  const user = db.users.find(x => x.id === u.id);
  if (user) { user.name = name; user.phone = phone; }
  const seller = db.sellers.find(s => s.userId === u.id);
  if (seller) { seller.defaultPM = defaultPM; seller.defaultPMDetails = defaultPMDetails; }
  u.name = name; u.phone = phone; setSession(u);
  saveDB(db); showToast('✅ تم حفظ التغييرات'); navigate('seller-profile');
}

// ═══════════════════════════════════════════════════════════════
//  SELLER WITHDRAWALS
// ═══════════════════════════════════════════════════════════════

function renderSellerWithdrawals() {
  const u = getCurrentUser(); const seller = getSeller(); const db = getDB();
  const orders = db.orders.filter(o => o.sellerId === u.id);
  const approvedOrders = orders.filter(o => o.status === 'approved');
  const withdrawn = db.withdrawals.filter(w => w.sellerId === seller?.id && w.status === 'approved').reduce((s,w) => s + w.amount, 0);
  const balance = (seller?.totalEarnings || 0) - withdrawn;
  const withdrawals = db.withdrawals.filter(w => w.sellerId === seller?.id).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const activePMs = db.settings.paymentMethods.filter(p => p.active);
  const statuses = { pending: { label: 'قيد الانتظار', cls: 'badge-warning' }, approved: { label: 'تم الدفع', cls: 'badge-success' }, rejected: { label: 'مرفوض', cls: 'badge-danger' } };
  return `<div class="fade-in">
    <div class="page-title"><h1>السحوبات</h1><p>الرصيد المتاح: ${formatPrice(balance)}</p></div>
    <div class="grid grid-2">
      <div class="card glass">
        <div class="card-title" style="margin-bottom:16px"><i class="fas fa-plus-circle" style="color:var(--success)"></i> طلب سحب جديد</div>
        ${balance < 500 ? `<div style="padding:20px;text-align:center;color:var(--muted)"><p>الحد الأدنى للسحب هو ${formatPrice(500)}. رصيدك الحالي ${formatPrice(balance)}.</p></div>` :
        `<form onsubmit="return requestWithdrawal(event)">
          <div class="input-group" style="margin-bottom:14px"><label>المبلغ</label><input id="wd_amount" type="number" value="${balance}" min="500" max="${balance}" required></div>
          <div class="input-group" style="margin-bottom:14px"><label>وسيلة الدفع</label>
            <select id="wd_pm">${activePMs.map(pm => `<option value="${pm.type}" ${seller?.defaultPM===pm.type?'selected':''}>${pm.icon||''} ${pm.label}</option>`).join('')}</select></div>
          <div class="input-group" style="margin-bottom:14px"><label>معلومات الدفع</label><textarea id="wd_details" placeholder="رقم الحساب، CCP، Binance ID، ..." required>${seller?.defaultPMDetails||''}</textarea></div>
          <div class="input-group" style="margin-bottom:14px"><label>ملاحظات (اختياري)</label><textarea id="wd_notes" placeholder="ملاحظات إضافية"></textarea></div>
          <button type="submit" class="btn btn-success btn-lg w-full"><i class="fas fa-paper-plane"></i> إرسال طلب السحب</button>
        </form>`}
      </div>
      <div class="card glass">
        <div class="card-title" style="margin-bottom:16px"><i class="fas fa-history" style="color:var(--primary)"></i> سجل السحوبات (${withdrawals.length})</div>
        ${withdrawals.length === 0 ? '<div class="empty-state" style="padding:30px"><p style="color:var(--muted)">لا توجد سحوبات سابقة</p></div>' :
        withdrawals.map(w => { const pm = activePMs.find(p => p.type === w.paymentMethod); const st = statuses[w.status]||statuses.pending;
          return `<div style="padding:14px;border-bottom:1px solid var(--border)">
            <div class="flex items-center justify-between" style="margin-bottom:6px">
              <div><span style="font-weight:700;font-size:16px">${formatPrice(w.amount)}</span></div>
              <span class="badge ${st.cls}">${st.label}</span>
            </div>
            <div style="font-size:12px;color:var(--muted)">${pm?pm.icon+' '+pm.label:''} ${w.paymentDetails||''}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px">${formatDate(w.createdAt)}</div>
            ${w.adminNote ? `<div style="font-size:12px;color:var(--warning);margin-top:6px;background:rgba(234,179,8,.06);padding:8px 10px;border-radius:8px">📝 ${w.adminNote}</div>` : ''}
            ${w.receiptFile ? `<div style="margin-top:6px"><button class="btn btn-ghost btn-sm" onclick="viewReceipt('${w.id}')"><i class="fas fa-paperclip"></i> عرض الوصل</button></div>` : ''}
          </div>`;}).join('')}
      </div>
    </div>
    <div id="receiptModal"></div>
  </div>`;
}

function attachSellerWithdrawals() {}

// ═══════════════════════════════════════════════════════════════
//  SELLER WALLET
// ═══════════════════════════════════════════════════════════════

function renderSellerWallet() {
  const u = getCurrentUser(); const seller = getSeller(); const db = getDB();
  recalcWallet(seller.id);
  const txns = db.transactions.filter(t => t.sellerId === seller.id).slice(0, 50);
  return `<div class="fade-in">
    <div class="page-title"><h1>المحفظة</h1><p>رصيدك وإيراداتك</p></div>
    <div class="grid grid-3 stagger" style="margin-bottom:20px">
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(59,130,246,.12);color:var(--primary)"><i class="fas fa-wallet"></i></div><div class="value" style="color:var(--primary)">${formatPrice(seller.balance||0)}</div><div class="label">الرصيد الإجمالي</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(234,179,8,.12);color:var(--warning)"><i class="fas fa-clock"></i></div><div class="value" style="color:var(--warning)">${formatPrice(seller.pendingBalance||0)}</div><div class="label">رصيد pending</div></div>
      <div class="stat-card glass glass-hover"><div class="icon" style="background:rgba(34,197,94,.12);color:var(--success)"><i class="fas fa-hand-holding-usd"></i></div><div class="value" style="color:var(--success)">${formatPrice(seller.withdrawableBalance||0)}</div><div class="label">قابل للسحب</div></div>
    </div>
    <div class="card glass"><div class="card-title" style="margin-bottom:16px"><i class="fas fa-list" style="color:var(--primary)"></i> آخر المعاملات</div>
      ${txns.length === 0 ? '<div class="empty-state" style="padding:30px"><p style="color:var(--muted)">لا توجد معاملات بعد</p></div>' :
      `<div class="table-wrap"><table><thead><tr><th>النوع</th><th>المبلغ</th><th>الوصف</th><th>التاريخ</th></tr></thead><tbody>${
        txns.map(t => `<tr><td><span class="badge ${t.type.includes('in')||t.type==='commission'?'badge-success':'badge-warning'}">${t.type}</span></td>
          <td style="color:${t.amount>0?'var(--success)':'var(--danger)'};font-weight:700">${t.amount>0?'+':''}${formatPrice(t.amount)}</td>
          <td style="font-size:13px;color:var(--muted)">${t.description||''}</td>
          <td style="font-size:12px;color:var(--muted)">${formatDate(t.createdAt)}</td></tr>`).join('')}
      </tbody></table></div>`}
    </div>
  </div>`;
}
function attachSellerWallet() { recalcWallet(getSeller()?.id); }

// ═══════════════════════════════════════════════════════════════
//  SELLER TRANSFERS
// ═══════════════════════════════════════════════════════════════

function renderSellerTransfers() {
  const u = getCurrentUser(); const seller = getSeller(); const db = getDB();
  const transfers = db.transfers.filter(t => t.fromSellerId === seller.id || t.toSellerId === seller.id).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  const sellers = db.sellers.filter(s => s.id !== seller.id);
  return `<div class="fade-in">
    <div class="page-title"><h1>التحويلات</h1><p>تحويل رصيد إلى بائع آخر</p></div>
    <div class="card glass" style="margin-bottom:20px">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px">تحويل جديد</h3>
      <form onsubmit="return doTransfer(event)">
        <div class="grid grid-2" style="gap:14px">
          <div class="input-group"><label>إلى بائع</label><select id="tf_to" required>${sellers.map(s => { const su = db.users.find(x => x.id === s.userId); return `<option value="${s.id}">${su?su.name:'—'} (رصيده: ${formatPrice(s.withdrawableBalance||0)})</option>`; }).join('')}</select></div>
          <div class="input-group"><label>المبلغ</label><input id="tf_amount" type="number" required min="1" max="${seller.withdrawableBalance||0}" placeholder="المبلغ"></div>
          <div class="input-group full"><label>ملاحظة (اختياري)</label><input id="tf_note" placeholder="سبب التحويل"></div>
        </div>
        <button type="submit" class="btn btn-primary w-full mt-2"><i class="fas fa-exchange-alt"></i> تحويل</button>
      </form>
    </div>
    <div class="card glass"><div class="card-title" style="margin-bottom:12px">سجل التحويلات (${transfers.length})</div>
      ${transfers.length === 0 ? '<div class="empty-state" style="padding:30px"><p style="color:var(--muted)">لا توجد تحويلات</p></div>' :
      transfers.map(t => { const from = db.users.find(x => x.id === (db.sellers.find(s=>s.id===t.fromSellerId)?.userId||'')); const to = db.users.find(x => x.id === (db.sellers.find(s=>s.id===t.toSellerId)?.userId||'')); return `<div style="padding:12px;border-bottom:1px solid var(--border)"><div class="flex items-center justify-between"><div><span style="font-weight:700">${formatPrice(t.amount)}</span> <span style="font-size:12px;color:var(--muted)">من ${from?from.name:'?'} → ${to?to.name:'?'}</span></div>${statusBadge(t.status)}</div>${t.note?`<div style="font-size:12px;color:var(--muted);margin-top:4px">📝 ${t.note}</div>`:''}<div style="font-size:11px;color:var(--muted);margin-top:2px">${formatDate(t.createdAt)}</div></div>`; }).join('')}
    </div>
  </div>`;
}
function attachSellerTransfers() {}
function doTransfer(e) {
  e.preventDefault(); const db = getDB(); const seller = getSeller();
  const toId = document.getElementById('tf_to').value;
  const amount = Number(document.getElementById('tf_amount').value);
  const note = document.getElementById('tf_note')?.value.trim() || '';
  if (!amount || amount < 1) { showToast('أدخل مبلغ صحيح', 'error'); return; }
  if (amount > (seller.withdrawableBalance||0)) { showToast('رصيدك غير كافٍ', 'error'); return; }
  addTransfer(seller.id, toId, amount, note);
  showToast('✅ تم التحويل بنجاح'); navigate('seller-transfers');
}

// ═══════════════════════════════════════════════════════════════
//  SELLER CHAT
// ═══════════════════════════════════════════════════════════════

function renderSellerChat() {
  const u = getCurrentUser(); const db = getDB();
  const admin = db.users.find(x => x.role === 'admin');
  const msgs = db.chatMessages.filter(m => (m.from === u.id && m.to === admin.id) || (m.from === admin.id && m.to === u.id)).slice(-100);
  return `<div class="fade-in"><div class="page-title"><h1>المحادثات</h1><p>تواصل مع الإدارة</p></div>
    <div class="card glass" style="padding:0;overflow:hidden">
      <div class="ds-chat-header"><div class="d-flex"><div class="avatar gradient-bg" style="color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700">${admin?admin.name.charAt(0):'?'}</div><span style="font-weight:600">${admin?admin.name:'الإدارة'}</span></div><span class="badge badge-success" style="font-size:10px">متصل</span></div>
      <div class="ds-messages" id="chatMsgs" style="max-height:400px">${msgs.length === 0 ? '<div style="text-align:center;padding:40px;color:var(--muted)">لا توجد رسائل بعد. ابدأ المحادثة!</div>' :
        msgs.map(m => `<div class="ds-msg ${m.from===u.id?'ds-user':'ds-ai'}"><div class="ds-avatar" style="background:${m.from===u.id?'var(--primary)':'var(--accent)'};color:#fff;font-size:12px">${m.from===u.id?'أنت':(admin?admin.name.charAt(0):'?')}</div><div class="ds-bubble">${m.message}${m.createdAt?`<div style="font-size:10px;color:var(--muted);margin-top:4px">${formatDate(m.createdAt)}</div>`:''}</div></div>`).join('')}
      </div>
      <div class="ds-input"><form onsubmit="return sendChatMsg(event)"><div class="d-flex" style="gap:8px"><input id="chatInput" placeholder="اكتب رسالتك..." required style="flex:1"><button type="submit" class="btn btn-primary btn-icon"><i class="fas fa-paper-plane"></i></button></div></form></div>
    </div>
  </div>`;
}
function attachSellerChat() { setTimeout(() => { const c = document.getElementById('chatMsgs'); if(c) c.scrollTop = c.scrollHeight; }, 100); }
function sendChatMsg(e) {
  e.preventDefault(); const u = getCurrentUser(); const db = getDB();
  const msg = document.getElementById('chatInput').value.trim();
  if (!msg) return;
  const admin = db.users.find(x => x.role === 'admin');
  db.chatMessages.push({ id: genId(), from: u.id, to: admin.id, message: msg, read: false, createdAt: new Date().toISOString() });
  addNotification(admin.id, '💬 رسالة جديدة من '+u.name, msg, 'system');
  saveDB(db); document.getElementById('chatInput').value = '';
  navigate('seller-chat');
}

// ═══════════════════════════════════════════════════════════════
//  SELLER TICKETS
// ═══════════════════════════════════════════════════════════════

function renderSellerTickets() {
  const u = getCurrentUser(); const db = getDB();
  const tickets = db.tickets.filter(t => t.userId === u.id).sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
  return `<div class="fade-in">
    <div class="page-title"><h1>تذاكر الدعم</h1><p>تواصل مع فريق الدعم الفني</p></div>
    <div class="card glass" style="margin-bottom:20px">
      <h3 style="font-size:16px;font-weight:700;margin-bottom:14px">فتح تذكرة جديدة</h3>
      <form onsubmit="return openTicket(event)">
        <div class="grid grid-2" style="gap:14px">
          <div class="input-group full"><label>الموضوع</label><input id="tk_subject" required placeholder="ملخص المشكلة"></div>
          <div class="input-group full"><label>الأولوية</label><select id="tk_priority"><option value="low">منخفضة</option><option value="medium" selected>متوسطة</option><option value="high">عالية</option><option value="urgent">عاجلة</option></select></div>
          <div class="input-group full"><label>الرسالة</label><textarea id="tk_msg" required style="min-height:100px" placeholder="اشرح المشكلة بالتفصيل..."></textarea></div>
          <div class="input-group full"><label>مرفق (اختياري)</label><input id="tk_file" type="file" accept="image/*,.pdf,.zip"></div>
        </div>
        <button type="submit" class="btn btn-primary w-full"><i class="fas fa-ticket"></i> فتح التذكرة</button>
      </form>
    </div>
    <div class="card glass"><div class="card-title" style="margin-bottom:12px">تذاكري (${tickets.length})</div>
      ${tickets.length === 0 ? '<div class="empty-state" style="padding:30px"><p style="color:var(--muted)">لا توجد تذاكر</p></div>' :
      tickets.map(t => { const pLbls = { low:'منخفضة', medium:'متوسطة', high:'عالية', urgent:'عاجلة' }; const pCls = { low:'badge-info', medium:'badge-warning', high:'badge-danger', urgent:'badge-danger' }; const sLbls = { open:'مفتوحة', in_progress:'قيد المعالجة', resolved:'تم الحل', closed:'مغلقة' }; const sCls = { open:'badge-warning', in_progress:'badge-info', resolved:'badge-success', closed:'badge-secondary' };
        return `<div style="padding:14px;border-bottom:1px solid var(--border)">
          <div class="flex items-center justify-between"><div><span style="font-weight:600;font-size:14px">${t.subject}</span> <span class="badge ${pCls[t.priority]||'badge-info'}" style="font-size:10px">${pLbls[t.priority]||t.priority}</span></div><span class="badge ${sCls[t.status]||'badge-info'}">${sLbls[t.status]||t.status}</span></div>
          <div style="font-size:12px;color:var(--muted);margin-top:6px">${t.message?.slice(0,100)}${(t.message?.length||0)>100?'...':''}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">${formatDate(t.createdAt)} ${t.response?`| رد: ${t.response.slice(0,80)}`:''}</div>
        </div>`; }).join('')}
    </div>
  </div>`;
}
function attachSellerTickets() {}
async function openTicket(e) {
  e.preventDefault(); const u = getCurrentUser(); const db = getDB();
  const subject = document.getElementById('tk_subject').value.trim();
  const priority = document.getElementById('tk_priority').value;
  const msg = document.getElementById('tk_msg').value.trim();
  const file = document.getElementById('tk_file')?.files?.[0];
  let attachment = '';
  if (file) { try { attachment = await readFileAsBase64(file); } catch { showToast('فشل قراءة المرفق', 'error'); return; } }
  db.tickets.unshift({ id: genId(), userId: u.id, subject, priority, message: msg, attachment, status: 'open', response: '', respondedBy: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  notifyAdmins('🎫 تذكرة جديدة', `تذكرة من ${u.name}: ${subject}`, 'system');
  saveDB(db); showToast('✅ تم فتح التذكرة'); navigate('seller-tickets');
}

// ═══════════════════════════════════════════════════════════════
//  SELLER AI ASSISTANT
// ═══════════════════════════════════════════════════════════════

function renderSellerAIAssist() {
  const db = getDB(); const seller = getSeller();
  const u = getCurrentUser();
  const hasKey = !!db.settings.deepseekKey;
  return `<div class="fade-in">
    <div class="page-title"><h1>🤖 AI مساعد ذكي</h1><p>يساعدك في البيع والتسويق وإدارة منتجاتك</p></div>
    <div class="grid grid-2" style="margin-bottom:20px">
      <div class="card glass glass-hover" style="cursor:pointer" onclick="genAICopy('tiktok')"><div class="d-flex gap-3"><i class="fab fa-tiktok" style="font-size:28px;color:var(--text-muted)"></i><div><div style="font-weight:700">نص إعلان TikTok</div><div style="font-size:12px;color:var(--muted)">توليد script احترافي لتيك توك</div></div></div></div>
      <div class="card glass glass-hover" style="cursor:pointer" onclick="genAICopy('facebook')"><div class="d-flex gap-3"><i class="fab fa-facebook" style="font-size:28px;color:var(--text-muted)"></i><div><div style="font-weight:700">إعلان Facebook</div><div style="font-size:12px;color:var(--muted)">نص إعلاني فيسبوك جذاب</div></div></div></div>
      <div class="card glass glass-hover" style="cursor:pointer" onclick="genAICopy('landing')"><div class="d-flex gap-3"><i class="fas fa-globe" style="font-size:28px;color:var(--text-muted)"></i><div><div style="font-weight:700">نصوص Landing Page</div><div style="font-size:12px;color:var(--muted)">عناوين ووصف لصفحة هبوط</div></div></div></div>
      <div class="card glass glass-hover" style="cursor:pointer" onclick="genAICopy('whatsapp')"><div class="d-flex gap-3"><i class="fab fa-whatsapp" style="font-size:28px;color:var(--text-muted)"></i><div><div style="font-weight:700">رسائل واتساب</div><div style="font-size:12px;color:var(--muted)">رسائل تسويقية جاهزة للعملاء</div></div></div></div>
    </div>
    <div class="card glass">
      <div class="card-title" style="margin-bottom:12px"><i class="fas fa-chart-line" style="color:var(--primary)"></i> تحليلات ذكية لمنتجاتك</div>
      <div class="grid grid-2" style="gap:14px">
        ${db.products.filter(p=>p.available).slice(0,6).map(p => { const sp = getSmartPricing(p.id); return `<div class="card" style="background:var(--surface);padding:14px;border-radius:12px">
          <div style="font-weight:700;font-size:14px;margin-bottom:8px">${p.name}</div>
          <div class="grid grid-2" style="gap:4px;font-size:12px">
            <span style="color:var(--muted)">السعر الحالي: <strong>${formatPrice(p.price)}</strong></span>
            <span style="color:var(--primary)">مقترح: <strong>${formatPrice(sp?.suggestedPrice||p.price)}</strong></span>
            <span style="color:var(--muted)">مباع: ${sp?.totalSold||0}</span>
            <span style="color:var(--muted)">الطلب: ${sp?.demand||'—'}</span>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:6px">🕐 أفضل وقت للتسويق: ${sp?.bestTime||'—'}</div>
          <button class="btn btn-sm btn-outline w-full mt-2" onclick="genAICopy('marketing','${p.id}')"><i class="fas fa-wand-magic-sparkles"></i> توليد إعلان</button>
        </div>`; }).join('')}
      </div>
    </div>
    <div id="aiResultModal"></div>
  </div>`;
}
function attachSellerAIAssist() {}
async function genAICopy(type, productId) {
  const db = getDB();
  if (!db.settings.deepseekKey) { showToast('⚠️ يرجى تفعيل DeepSeek AI أولاً في الإعدادات', 'error'); return; }
  const prods = productId ? [getProduct(productId)] : db.products.filter(p => p.available);
  if (prods.length === 0) { showToast('لا توجد منتجات', 'error'); return; }
  const prod = prods[0];
  const prompts = {
    tiktok: `أنشئ نص إعلان TikTok بالعربية لمنتج "${prod.name}" بسعر ${prod.price} د.ج. اجعله قصيراً حماسياً (30-60 كلمة) مناسباً لفيديو تيك توك مع هاشتاغات في النهاية.`,
    facebook: `أنشئ نص إعلان Facebook بالعربية لمنتج "${prod.name}" بسعر ${prod.price} د.ج مع call to action. 3-4 جمل.`,
    landing: `أكتب عنواناً رئيسياً وعنواناً فرعياً ووصفاً قصيراً (150 حرفاً) لصفحة هبوط لمنتج "${prod.name}" بسعر ${prod.price} د.ج.`,
    whatsapp: `أنشئ 3 رسائل واتساب تسويقية قصيرة بالعربية لمنتج "${prod.name}" بسعر ${prod.price} د.ج. كل رسالة بجملتين مع أيقونات مناسبة.`,
    marketing: `أنشئ محتوى تسويقي كامل لمنتج "${prod.name}" بسعر ${prod.price} د.ج. اكتب: عنوان جذاب، فقرة تعريفية، 3 نقاط بيع، وعبارة CTA.`
  };
  const prompt = prompts[type] || Object.values(prompts)[0];
  showToast('🔄 جاري التوليد...', 'info');
  const res = await deepseekCall([{ role: 'user', content: prompt }]);
  if (!res) return;
  const icons = { tiktok:'<i class="fab fa-tiktok"></i>', facebook:'<i class="fab fa-facebook"></i>', landing:'<i class="fas fa-globe"></i>', whatsapp:'<i class="fab fa-whatsapp"></i>', marketing:'<i class="fas fa-bullhorn"></i>' };
  const titles = { tiktok:'نص إعلان TikTok', facebook:'إعلان Facebook', landing:'نصوص Landing Page', whatsapp:'رسائل واتساب', marketing:'مواد تسويقية' };
  document.getElementById('aiResultModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('aiResultModal')">
    <div class="modal glass scale-in" style="max-width:600px"><button class="modal-close" onclick="closeModal('aiResultModal')"><i class="fas fa-times"></i></button>
      <h2>${icons[type]||''} ${titles[type]||'توليد'} - ${prod.name}</h2>
      <div style="background:var(--surface);padding:20px;border-radius:12px;font-size:14px;line-height:1.8;white-space:pre-wrap">${res}</div>
      <button class="btn btn-primary w-full mt-3" onclick="copyText(document.querySelector('#aiResultModal .modal div:last-child').textContent)"><i class="fas fa-copy"></i> نسخ النص</button>
    </div></div>`;
}

function viewReceipt(id) {
  const db = getDB(); const w = db.withdrawals.find(x => x.id === id);
  if (!w || !w.receiptFile) return;
  document.getElementById('receiptModal').innerHTML = `<div class="modal-overlay active" onclick="if(event.target===this)closeModal('receiptModal')">
    <div class="modal glass scale-in" style="max-width:600px"><button class="modal-close" onclick="closeModal('receiptModal')"><i class="fas fa-times"></i></button>
      <h2>📎 وصل الدفع</h2>
      ${w.receiptFile.startsWith('data:') ? `<img src="${w.receiptFile}" style="width:100%;border-radius:12px">` : `<a href="${w.receiptFile}" target="_blank" class="btn btn-primary">فتح الوصل</a>`}
    </div></div>`;
}

function requestWithdrawal(e) {
  e.preventDefault();
  const u = getCurrentUser(); const seller = getSeller(); const db = getDB();
  const amount = Number(document.getElementById('wd_amount').value);
  const pm = document.getElementById('wd_pm').value;
  const details = document.getElementById('wd_details').value.trim();
  const notes = document.getElementById('wd_notes').value.trim();
  const approvedOrders = db.orders.filter(o => o.sellerId === u.id && o.status === 'approved');
  const withdrawn = db.withdrawals.filter(w => w.sellerId === seller?.id && w.status === 'approved').reduce((s,w) => s + w.amount, 0);
  const balance = (seller?.totalEarnings || 0) - withdrawn;
  if (!amount || amount < 500) { showToast('الحد الأدنى للسحب هو 500 د.ج', 'error'); return; }
  if (amount > balance) { showToast('المبلغ يتجاوز الرصيد المتاح', 'error'); return; }
  if (!details) { showToast('يرجى إدخال معلومات الدفع', 'error'); return; }
  db.withdrawals.unshift({ id: genId(), sellerId: seller.id, amount, paymentMethod: pm, paymentDetails: details, notes, status: 'pending', adminNote: '', receiptFile: '', createdAt: new Date().toISOString(), processedAt: '' });
  addNotification(db.users.find(u => u.role === 'admin')?.id || '', '💰 طلب سحب جديد', `طلب سحب بمبلغ ${formatPrice(amount)} من ${u.name}`, 'system');
  saveDB(db); showToast('✅ تم إرسال طلب السحب'); navigate('seller-withdrawals');
}

// ═══════════════════════════════════════════════════════════════
//  LANDING PAGE HTML GENERATOR
// ═══════════════════════════════════════════════════════════════

function generateLandingHTML(product, db) {
  const price = Number(product.price).toLocaleString('ar-DZ');
  const pms = (db?.settings?.paymentMethods || []).filter(p => p.active);
  const catColors = { netflix:'#e50914', capcut:'#00c4cc', tiktok:'#fe2c55', canva:'#00c4cc', spotify:'#1db954', chatgpt:'#10a37f', youtube:'#ff0000', disney:'#113ccf', other:'#3b82f6' };
  const catColor = catColors[product.category] || '#3b82f6';
  return `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${product.name} - DigitalVault</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{primary:'${catColor}',accent:'#8b5cf6',dark:'#0a0a0f'}}}}</script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
*{font-family:'Cairo',sans-serif;scroll-behavior:smooth}
body{background:#0a0a0f;color:#fff;overflow-x:hidden}
.glass{background:rgba(255,255,255,.05);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08)}
.gradient-text{background:linear-gradient(135deg,${catColor},#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.gradient-bg{background:linear-gradient(135deg,${catColor}33,#2d1b69)}
.pulse-ring{animation:pulse-ring 2s infinite}
@keyframes pulse-ring{0%{box-shadow:0 0 0 0 ${catColor}66}70%{box-shadow:0 0 0 20px ${catColor}00}100%{box-shadow:0 0 0 0 ${catColor}00}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
.animate-float{animation:float 6s ease-in-out infinite}
.animate-float-d{animation:float 8s ease-in-out infinite;animation-delay:1s}
.para{opacity:0;transform:translateY(30px);transition:all .6s ease-out}
.para.show{opacity:1;transform:translateY(0)}
.countdown{display:inline-flex;gap:8px;direction:ltr}
.countdown-item{background:rgba(255,255,255,.08);padding:6px 12px;border-radius:8px;min-width:44px;text-align:center}
.countdown-item .num{font-size:20px;font-weight:800}
.countdown-item .lbl{font-size:9px;color:#888;display:block}
</style></head><body class="dark">
<div class="fixed inset-0 pointer-events-none overflow-hidden">
<div class="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-20" style="background:radial-gradient(circle,${catColor},transparent 70%)"></div>
<div class="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-15" style="background:radial-gradient(circle,#8b5cf6,transparent 70%)"></div>
</div>
<nav class="fixed top-0 left-0 right-0 z-50 glass"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex items-center justify-between h-16">
<div class="flex items-center gap-8"><a href="#" class="text-xl font-bold"><span class="gradient-text">DigitalVault</span></a>
<div class="hidden md:flex items-center gap-6 text-sm text-gray-400"><a href="#" class="hover:text-white transition">الرئيسية</a><a href="#features" class="hover:text-white transition">المميزات</a><a href="#pricing" class="hover:text-white transition">الأسعار</a><a href="#reviews" class="hover:text-white transition">التقييمات</a></div></div>
<a href="https://wa.me/213000000000?text=${encodeURIComponent('أريد شراء '+product.name)}" target="_blank" class="px-6 py-2 rounded-full text-sm font-semibold transition" style="background:${catColor};color:#fff">اشتر الآن</a></div></div></nav>
<section class="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
<div class="absolute inset-0 gradient-bg opacity-20"></div>
<div class="relative z-10 max-w-6xl mx-auto px-4 text-center">
<div class="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm mb-8" style="color:${catColor}"><i class="fas fa-bolt"></i><span>🔥 عرض خاص - لفترة محدودة</span></div>
<div class="countdown mb-8" id="cd"></div>
<h1 class="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">${product.name}<br><span class="gradient-text">${price} د.ج فقط</span></h1>
<p class="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">${product.desc||'احصل على حساب premium مع ضمان الجودة والتوصيل الفوري.'}</p>
<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
<a href="#pricing" class="px-10 py-4 rounded-full text-lg font-semibold transition shadow-lg" style="background:${catColor};color:#fff"><i class="fas fa-shopping-cart ml-2"></i>اشتر الآن - ${price} د.ج</a>
<a href="#features" class="px-10 py-4 glass hover:bg-white/10 rounded-full text-lg font-semibold transition"><i class="fas fa-play ml-2"></i>تعرف علينا</a></div>
<div class="flex items-center justify-center gap-8 mt-12 text-sm text-gray-500">
<span><i class="fas fa-bolt ml-1" style="color:${catColor}"></i> توصيل فوري</span>
<span><i class="fas fa-shield-alt ml-1" style="color:${catColor}"></i> ضمان الجودة</span>
<span><i class="fas fa-headset ml-1" style="color:${catColor}"></i> دعم 24/7</span>
</div></div></section>
<section id="features" class="py-24"><div class="max-w-7xl mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl md:text-5xl font-black mb-4">لماذا <span class="gradient-text">${product.name}</span>؟</h2><p class="text-gray-400">المزايا التي تجعلنا الخيار الأمثل لك</p></div>
<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
<div class="glass p-8 rounded-3xl text-center hover:border-opacity-30 transition-all duration-300 hover:-translate-y-1" style="border-color:${catColor}22"><div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style="background:${catColor}22;color:${catColor}"><i class="fas fa-bolt"></i></div><h3 class="text-xl font-bold mb-3">توصيل فوري</h3><p class="text-gray-400 leading-relaxed">بعد تأكيد الدفع، يصلك الحساب مباشرة عبر البريد الإلكتروني. لا انتظار ولا تأخير.</p></div>
<div class="glass p-8 rounded-3xl text-center hover:border-opacity-30 transition-all duration-300 hover:-translate-y-1" style="border-color:${catColor}22"><div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style="background:${catColor}22;color:${catColor}"><i class="fas fa-shield-alt"></i></div><h3 class="text-xl font-bold mb-3">ضمان الجودة</h3><p class="text-gray-400 leading-relaxed">جميع حساباتنا مختبرة ومضمونة. نوفر لك حسابات أصلية مع ضمان استبدال خلال 24 ساعة.</p></div>
<div class="glass p-8 rounded-3xl text-center hover:border-opacity-30 transition-all duration-300 hover:-translate-y-1" style="border-color:${catColor}22"><div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style="background:${catColor}22;color:${catColor}"><i class="fas fa-headset"></i></div><h3 class="text-xl font-bold mb-3">دعم 24/7</h3><p class="text-gray-400 leading-relaxed">فريق الدعم الفني جاهز لمساعدتك في أي وقت. نوفر لك تجربة شراء سلسة وآمنة.</p></div></div></div></section>
<section id="pricing" class="py-24"><div class="max-w-6xl mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl md:text-5xl font-black mb-4">اختر باقة <span class="gradient-text">${product.name}</span></h2><p class="text-gray-400">اختر الخطة التي تناسب احتياجاتك</p></div>
<div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
<div class="glass p-8 rounded-3xl text-center transition-all duration-300 hover:-translate-y-2"><div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style="background:rgba(255,255,255,.05);color:gray"><i class="fas fa-rocket"></i></div><h3 class="text-2xl font-bold mb-2">أساسي</h3><p class="text-gray-400 text-sm mb-4">${product.duration} يوم</p><p class="text-4xl font-black mb-6">${(Number(product.price)*0.7).toLocaleString('ar-DZ')} <span class="text-base text-gray-500">د.ج</span></p><ul class="text-right space-y-3 text-sm text-gray-400 mb-8"><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>حساب أساسي</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>${product.duration} يوم صلاحية</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>دعم عادي</li></ul><a href="#" class="block w-full py-3 glass hover:bg-white/10 rounded-2xl font-semibold transition">اشتر الآن</a></div>
<div class="glass p-8 rounded-3xl text-center transition-all duration-300 hover:-translate-y-2 relative scale-105" style="border:2px solid ${catColor}"><span class="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-full text-xs font-bold" style="background:${catColor};color:#fff">الأكثر طلباً</span><div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style="background:${catColor}22;color:${catColor}"><i class="fas fa-crown"></i></div><h3 class="text-2xl font-bold mb-2">برو</h3><p class="text-gray-400 text-sm mb-4">${product.duration} يوم</p><p class="text-4xl font-black mb-6 gradient-text">${price} <span class="text-base text-gray-500">د.ج</span></p><ul class="text-right space-y-3 text-sm text-gray-400 mb-8"><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>حساب بريميوم</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>${product.duration} يوم صلاحية</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>أولوية في الدعم</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>إمكانية التمديد</li></ul><a href="#" class="block w-full py-3 rounded-2xl font-semibold transition shadow-lg pulse-ring" style="background:${catColor};color:#fff">اشتر الآن</a></div>
<div class="glass p-8 rounded-3xl text-center transition-all duration-300 hover:-translate-y-2"><div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl" style="background:rgba(255,255,255,.05);color:var(--accent)"><i class="fas fa-gem"></i></div><h3 class="text-2xl font-bold mb-2">ألتميت</h3><p class="text-gray-400 text-sm mb-4">${product.duration*2} يوم</p><p class="text-4xl font-black mb-6">${(Number(product.price)*1.5).toLocaleString('ar-DZ')} <span class="text-base text-gray-500">د.ج</span></p><ul class="text-right space-y-3 text-sm text-gray-400 mb-8"><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>حساب VIP</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>${product.duration*2} يوم صلاحية</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>دعم VIP 24/7</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>ضمان مضاعف</li><li><i class="fas fa-check ml-2" style="color:var(--success)"></i>هدية مجانية</li></ul><a href="#" class="block w-full py-3 glass hover:bg-white/10 rounded-2xl font-semibold transition">اشتر الآن</a></div></div></div></section>
<section id="reviews" class="py-24"><div class="max-w-6xl mx-auto px-4"><div class="text-center mb-16"><h2 class="text-4xl md:text-5xl font-black mb-4">ماذا يقول <span class="gradient-text">عملاؤنا</span></h2><p class="text-gray-400">آلاف العملاء يثقون في DigitalVault</p></div>
<div class="grid md:grid-cols-3 gap-6">
<div class="glass p-8 rounded-3xl"><div class="flex items-center gap-1 mb-4" style="color:#eab308"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p class="text-gray-300 mb-6 leading-relaxed">خدمة ممتازة وسريعة جداً. الحساب وصل خلال دقائق. أنصح الجميع بالتعامل مع DigitalVault.</p><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style="background:${catColor}33;color:${catColor}">أ</div><div><div class="font-semibold">أحمد</div><div class="text-xs text-gray-500">مشتري موثوق</div></div></div></div>
<div class="glass p-8 rounded-3xl"><div class="flex items-center gap-1 mb-4" style="color:#eab308"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p class="text-gray-300 mb-6 leading-relaxed">أفضل موقع متخصص في الحسابات الرقمية. أسعار مناسبة وجودة عالية. تعاملت معهم أكثر من مرة.</p><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style="background:#8b5cf633;color:#8b5cf6">س</div><div><div class="font-semibold">سارة</div><div class="text-xs text-gray-500">عميلة دائمة</div></div></div></div>
<div class="glass p-8 rounded-3xl"><div class="flex items-center gap-1 mb-4" style="color:#eab308"><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i></div><p class="text-gray-300 mb-6 leading-relaxed">الدعم الفني ممتاز وسريع في الرد. أنصح أي شخص يبحث عن حسابات رقمية أن يتعامل معهم.</p><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style="background:${catColor}33;color:${catColor}">م</div><div><div class="font-semibold">محمد</div><div class="text-xs text-gray-500">مشتري موثوق</div></div></div></div></div></div></section>
<section class="py-16"><div class="max-w-5xl mx-auto px-4 text-center"><h2 class="text-3xl md:text-4xl font-black mb-4">طرق <span class="gradient-text">الدفع</span></h2><p class="text-gray-400 mb-10">نقبل طرق دفع متعددة لراحتك</p>
<div class="grid grid-cols-2 md:grid-cols-${Math.min(pms.length||4,4)} gap-4 max-w-2xl mx-auto">
${pms.length ? pms.map(pm => `<div class="glass p-6 rounded-2xl transition-all hover:-translate-y-1"><div class="text-4xl mb-2">${pm.icon||'💳'}</div><p class="font-semibold">${pm.label}</p>${pm.minAmount>0?`<p class="text-xs text-gray-500 mt-1">الحد الأدنى: ${Number(pm.minAmount).toLocaleString('ar-DZ')} د.ج</p>`:''}</div>`).join('') : `
<div class="glass p-6 rounded-2xl"><i class="fas fa-university text-4xl mb-2" style="color:${catColor}"></i><p class="font-semibold">BaridiMob</p></div>
<div class="glass p-6 rounded-2xl"><i class="fas fa-building-columns text-4xl mb-2" style="color:${catColor}"></i><p class="font-semibold">CCP</p></div>
<div class="glass p-6 rounded-2xl"><i class="fab fa-bitcoin text-4xl mb-2" style="color:${catColor}"></i><p class="font-semibold">Binance</p></div>
<div class="glass p-6 rounded-2xl"><i class="fas fa-coins text-4xl mb-2" style="color:${catColor}"></i><p class="font-semibold">USDT</p></div>`}
</div></div></section>
<section class="pb-24 pt-8"><div class="max-w-3xl mx-auto px-4 text-center">
<div class="glass p-12 rounded-3xl"><h2 class="text-3xl md:text-4xl font-black mb-4">هل أنت مستعد <span class="gradient-text">للبدء؟</span></h2><p class="text-gray-400 mb-8">احصل على ${product.name} الآن واستمتع بأفضل تجربة</p>
<a href="https://wa.me/213000000000?text=${encodeURIComponent('أريد شراء '+product.name)}" target="_blank" class="inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-lg font-bold transition shadow-lg" style="background:${catColor};color:#fff"><i class="fab fa-whatsapp"></i> تواصل معنا عبر واتساب</a></div></div></section>
<footer class="border-t border-white/5 py-8"><div class="max-w-7xl mx-auto px-4"><div class="flex flex-col md:flex-row items-center justify-between gap-4"><p class="text-sm text-gray-600">© 2026 DigitalVault. جميع الحقوق محفوظة.</p>
<div class="flex items-center gap-4 text-sm text-gray-600"><a href="#" class="hover:text-gray-400 transition">سياسة الخصوصية</a><a href="#" class="hover:text-gray-400 transition">الشروط والأحكام</a></div></div></div></footer>
<script>
const observer=new IntersectionObserver(e=>e.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('show')}}),{threshold:.1});
document.querySelectorAll('.para').forEach(el=>observer.observe(el));
document.querySelectorAll('[data-para]').forEach(el=>{el.classList.add('para');observer.observe(el)});
const cd=document.getElementById('cd');if(cd){const end=new Date(Date.now()+3*24*60*60*1000);function update(){const d=end-Date.now();if(d<=0){cd.innerHTML='<span style="color:${catColor};font-weight:700">العرض انتهى</span>';return}const h=Math.floor(d/36e5),m=Math.floor(d%36e5/6e4),s=Math.floor(d%6e4/1e3);cd.innerHTML='<div class="countdown-item"><div class="num">'+String(h).padStart(2,'0')+'</div><span class="lbl">ساعة</span></div><div class="countdown-item"><div class="num">'+String(m).padStart(2,'0')+'</div><span class="lbl">دقيقة</span></div><div class="countdown-item"><div class="num">'+String(s).padStart(2,'0')+'</div><span class="lbl">ثانية</span></div>'}update();setInterval(update,1e3)}
</script>
</body></html>`;
}
