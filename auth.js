// ═══════════════════════════════════════════════════════════════
//  AUTH PAGES
// ═══════════════════════════════════════════════════════════════

function renderAuth(route) {
  const isLogin = route === 'login';
  return `<div class="auth-page">
    <div class="bg-orbs"><div class="o1"></div><div class="o2"></div></div>
    <div class="auth-form glass scale-in">
      <div class="logo">
        <div class="icon gradient-bg" style="color:#fff">DV</div>
        <h1>DigitalVault</h1>
        <p>${isLogin ? 'تسجيل الدخول إلى لوحة التحكم' : 'إنشاء حساب بائع جديد'}</p>
      </div>
      <form id="authForm">
        ${!isLogin ? '<div class="form-group"><label>الاسم الكامل</label><input id="regName" type="text" placeholder="محمد أحمد" required></div>' : ''}
        <div class="form-group"><label>البريد الإلكتروني</label><input id="authEmail" type="email" placeholder="${isLogin ? 'admin@dv.com' : 'seller@example.com'}" required dir="ltr" style="text-align:left"></div>
        <div class="form-group"><label>كلمة المرور</label><input id="authPass" type="password" placeholder="••••••••" required dir="ltr" style="text-align:left"></div>
        <p id="authError" style="color:var(--danger);font-size:13px;display:none;margin-bottom:10px"></p>
        <button type="submit" class="btn btn-primary w-full btn-lg">${isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}</button>
      </form>
      <div class="form-footer">
        ${isLogin ? 'ليس لديك حساب؟ <a onclick="navigate(\'register\')">إنشاء حساب</a>' : 'لديك حساب بالفعل؟ <a onclick="navigate(\'login\')">تسجيل دخول</a>'}
      </div>
      ${isLogin ? '<div style="margin-top:16px;padding:14px;background:rgba(59,130,246,.08);border-radius:12px;font-size:12px;color:var(--muted);text-align:center;line-height:1.8"><strong style="color:var(--text)">حسابات تجريبية:</strong><br>👑 Admin: admin@dv.com / admin123<br>🛒 Seller: seller@dv.com / seller123</div>' : ''}
    </div>
  </div>`;
}

function attachLogin() {
  document.getElementById('authForm').onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPass').value;
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === pass);
    if (!user) {
      document.getElementById('authError').textContent = '❌ البريد الإلكتروني أو كلمة المرور غير صحيحة';
      document.getElementById('authError').style.display = 'block';
      return;
    }
    setSession({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone });
    logAudit(user.id, 'login', 'user', user.id);
    navigate(user.role === 'admin' ? 'admin' : 'seller');
  };
}

function attachRegister() {
  document.getElementById('authForm').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('authEmail').value.trim();
    const pass = document.getElementById('authPass').value;
    if (name.length < 2) { showToast('الاسم قصير جداً', 'error'); return; }
    if (pass.length < 6) { showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error'); return; }
    const db = getDB();
    if (db.users.find(u => u.email === email)) {
      document.getElementById('authError').textContent = '❌ البريد الإلكتروني موجود مسبقاً'; 
      document.getElementById('authError').style.display = 'block'; return;
    }
    const uid = genId();
    db.users.push({ id: uid, email, password: pass, name, role: 'seller', phone: '', avatar: '' });
    db.sellers.push({ id: genId(), userId: uid, commissionRate: 10, totalSales: 0, totalEarnings: 0, totalOrders: 0, isActive: true, lastActive: '' });
    saveDB(db);
    showToast('✅ تم إنشاء الحساب بنجاح');
    navigate('login');
  };
}
