const API = "https://campuseats-backend.vercel.app/api";

// ── Auth guard ───────────────────────────────────────────────
const token = localStorage.getItem("campuseats_token");
const userStr = localStorage.getItem("campuseats_user");

if (!token || !userStr) {
    window.location.href = "index.html";
}
const user = JSON.parse(userStr || "{}");
if (user.role !== "restaurant") {
    alert("Access denied. This panel is for Restaurant Partners only.");
    window.location.href = "index.html";
}

// ── Helpers ──────────────────────────────────────────────────
const AUTH = { Authorization: `Bearer ${token}` };

function showToast(msg, isErr = false) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.borderLeftColor = isErr ? "var(--danger)" : "var(--success)";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3500);
}

function fmt(num) { return "$" + Number(num || 0).toFixed(2); }
function fmtDate(d) {
    const dt = new Date(d);
    return dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function imgSrc(url) {
    if (!url) return "https://placehold.co/46x46/1e2130/444?text=🍽";
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    return API.replace("/api", "") + url;
}

// ── Multi-language ───────────────────────────────────────────
const TRANSLATIONS = {
    en: {
        dashboard: "Dashboard", menu: "Menu Management", orders: "Orders", analytics: "Analytics",
        profile: "Restaurant Profile", security: "Security", help: "Help & Rules",
        today_rev: "Today's Revenue", active_orders: "Active Orders", monthly_rev: "Monthly Revenue",
        order_management: "Live Order Management", no_orders: "No orders yet.",
        add_dish: "Add Dish", photo: "Photo", name: "Name", category: "Category", price: "Price", status: "Status", actions: "Actions",
        save: "Save Changes", logout: "Log Out",
        msg_saved: "Changes saved successfully", msg_error: "An error occurred",
        upload_guidelines: "Upload Guidelines",
        upload_tip1: "Formats: JPG, PNG, WEBP.",
        upload_tip2: "Max Size: 2MB per file (optimized for fast loading).",
        upload_tip3: "Dimensions: Logo (Square), Banner (Wide).",
        faq_title: "Partner Rules & FAQ",
        q1: "How to accept orders?", a1: "Go to 'Orders' section. Click 'Accept' to start preparation.",
        q2: "When do I get paid?", a2: "Payments are processed weekly every Monday.",
        q3: "Service Commission", a3: "CampusEats takes 15% commission on each order.",
        rules_title: "Partner Policy",
        rule1: "Maintain accurate prices and availability.",
        rule2: "Prepare orders within the specified time.",
        rule3: "Maintain hygiene and food quality standards."
    },
    ru: {
        dashboard: "Главная", menu: "Управление меню", orders: "Заказы", analytics: "Аналитика",
        profile: "Профиль ресторана", security: "Безопасность", help: "Помощь и правила",
        today_rev: "Выручка сегодня", active_orders: "Активные заказы", monthly_rev: "Выручка за месяц",
        order_management: "Управление заказами", no_orders: "Заказов пока нет.",
        add_dish: "Добавить блюдо", photo: "Фото", name: "Название", category: "Категория", price: "Цена", status: "Статус", actions: "Действия",
        save: "Сохранить", logout: "Выйти",
        msg_saved: "Изменения сохранены", msg_error: "Произошла ошибка",
        upload_guidelines: "Правила загрузки",
        upload_tip1: "Форматы: JPG, PNG, WEBP.",
        upload_tip2: "Макс. размер: 2МБ (для быстрой загрузки).",
        upload_tip3: "Размеры: Логотип (Квадрат), Баннер (Широкий).",
        faq_title: "Правила для партнеров и FAQ",
        q1: "Как принимать заказы?", a1: "Перейдите в раздел 'Заказы'. Нажмите 'Принять' для начала.",
        q2: "Когда я получу оплату?", a2: "Выплаты производятся еженедельно по понедельникам.",
        q3: "Комиссия сервиса", a3: "CampusEats берет 15% комиссии с каждого заказа.",
        rules_title: "Политика партнерства",
        rule1: "Следите за актуальностью цен и наличия блюд.",
        rule2: "Готовьте заказы в указанное время.",
        rule3: "Соблюдайте стандарты гигиены и качества еды."
    },
    uz: {
        dashboard: "Boshqaruv", menu: "Menyu boshqaruvi", orders: "Buyurtmalar", analytics: "Analitika",
        profile: "Restoran profili", security: "Xavfsizlik", help: "Yordam va qoidalar",
        today_rev: "Bugungi tushum", active_orders: "Faol buyurtmalar", monthly_rev: "Oylik tushum",
        order_management: "Buyurtmalarni boshqarish", no_orders: "Hozircha buyurtmalar yo'q.",
        add_dish: "Taom qo'shish", photo: "Rasm", name: "Nomi", category: "Kategoriya", price: "Narxi", status: "Status", actions: "Amallar",
        save: "Saqlash", logout: "Chiqish",
        msg_saved: "O'zgarishlar saqlandi", msg_error: "Xatolik yuz berdi",
        upload_guidelines: "Yuklash qoidalari",
        upload_tip1: "Formatlar: JPG, PNG, WEBP.",
        upload_tip2: "Maks. hajmi: 2MB (tez yuklanishi uchun).",
        upload_tip3: "O'lchamlari: Logotip (Kvadrat), Banner (Keng).",
        faq_title: "Hamkorlar qoidalari va FAQ",
        q1: "Buyurtmalarni qanday qabul qilish kerak?", a1: "'Buyurtmalar' bo'limiga o'ting. Qabul qilish uchun 'Qabul qilish' tugmasini bosing.",
        q2: "To'lovni qachon olaman?", a2: "To'lovlar har dushanba kuni haftalik amalga oshiriladi.",
        q3: "Xizmat komissiyasi", a3: "CampusEats har bir buyurtmadan 15% komissiya oladi.",
        rules_title: "Hamkorlik qoidalari",
        rule1: "Narxlar va mavjudlikni to'g'ri ko'rsating.",
        rule2: "Buyurtmalarni belgilangan vaqtda tayyorlang.",
        rule3: "Gigiyena va taom sifati standartlariga rioya qiling."
    }
};

let currentLang = localStorage.getItem("campuseats_lang") || "en";

function applyTranslations() {
    const t = TRANSLATIONS[currentLang];

    // Sidebar & Navigation
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            // If it has children (like icons), only update the text node
            const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (textNode) textNode.textContent = " " + t[key];
            else el.textContent = t[key];
        }
    });

    // Page titles and specific labels
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        const key = el.dataset.i18nLabel;
        if (t[key]) el.textContent = t[key];
    });

    // Update active nav text to match translation
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) document.getElementById("pageTitle").textContent = activeNav.textContent.trim();

    // Update language buttons active state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

window.setLanguage = function (lang) {
    currentLang = lang;
    localStorage.setItem("campuseats_lang", lang);
    applyTranslations();
};

window.addEventListener('storage', (e) => {
    if (e.key === 'campuseats_lang') {
        currentLang = e.newValue || 'en';
        applyTranslations();
    }
});

// Initial apply
setTimeout(applyTranslations, 100);

// Image resize/compress before upload
function resizeImg(file, maxW = 800) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                const canvas = document.createElement("canvas");
                canvas.width = w; canvas.height = h;
                canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                canvas.toBlob(blob => resolve(new File([blob], file.name, { type: "image/jpeg" })), "image/jpeg", 0.72);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ── Navigation ───────────────────────────────────────────────
const sectionLoaders = {
    dashboard: loadDashboard,
    menu: loadMenu,
    orders: loadOrders,
    analytics: loadAnalytics,
    profile: loadProfile,
    security: () => { },
    help: () => { }
};

document.querySelectorAll(".nav-item[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".view-section").forEach(s => s.classList.remove("active"));
        document.getElementById("view-" + target).classList.add("active");
        document.getElementById("pageTitle").textContent = btn.textContent.trim();
        if (sectionLoaders[target]) sectionLoaders[target]();
        // Close mobile sidebar
        if (window.innerWidth <= 768) document.getElementById("sidebar").classList.remove("open");
    });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("campuseats_token");
    localStorage.removeItem("campuseats_user");
    window.location.href = "index.html";
});

// Show restaurant name in sidebar
if (user.full_name) document.getElementById("sidebarRestName").textContent = user.full_name;

// ── 1. Dashboard ─────────────────────────────────────────────
async function loadDashboard() {
    try {
        const res = await fetch(`${API}/restaurant/dashboard`, { headers: AUTH });
        if (!res.ok) throw new Error("Dashboard load failed: " + res.status);
        const d = await res.json();

        document.getElementById("dashRevToday").textContent = fmt(d.today_revenue);
        document.getElementById("dashOrdersToday").textContent = d.today_orders;
        document.getElementById("dashRevMonth").textContent = fmt(d.monthly_revenue);

        // Status toggle
        setStatusUI(d.is_open);

        // Active orders preview
        const ordRes = await fetch(`${API}/restaurant/orders`, { headers: AUTH });
        const orders = await ordRes.json();
        const active = Array.isArray(orders)
            ? orders.filter(o => ["pending", "accepted", "preparing", "ready"].includes(o.status)).slice(0, 6)
            : [];
        const tbody = document.getElementById("dashOrdersBody");
        tbody.innerHTML = active.length ? active.map(o => `
            <tr>
                <td style="font-weight:700;color:var(--text-secondary)">#${o.id}</td>
                <td>${o.user_name || "—"}</td>
                <td style="font-weight:700;color:var(--success)">${fmt(o.total_price)}</td>
                <td><span class="badge ${o.status}">${o.status}</span></td>
            </tr>`).join("")
            : `<tr><td colspan="4" style="text-align:center;color:var(--text-secondary);padding:32px;">No active orders right now 🎉</td></tr>`;
    } catch (err) {
        console.error(err);
        showToast("Error loading dashboard: " + err.message, true);
    }
}

// ── Status Toggle ─────────────────────────────────────────────
let currentStatus = false;

function setStatusUI(isOpen) {
    currentStatus = isOpen;
    const dot = document.getElementById("statusDot");
    const track = document.getElementById("statusTrack");
    const label = document.getElementById("statusLabel");
    if (isOpen) {
        dot.className = "status-dot open";
        track.className = "toggle-track on";
        label.textContent = "OPEN";
    } else {
        dot.className = "status-dot closed";
        track.className = "toggle-track";
        label.textContent = "CLOSED";
    }
}

async function toggleStatus() {
    const newStatus = !currentStatus;
    try {
        const res = await fetch(`${API}/restaurant/profile/status`, {
            method: "PUT",
            headers: { ...AUTH, "Content-Type": "application/json" },
            body: JSON.stringify({ is_open: newStatus })
        });
        if (!res.ok) throw new Error("Failed to update status");
        setStatusUI(newStatus);
        showToast(`Restaurant is now ${newStatus ? "🟢 OPEN" : "🔴 CLOSED"}`);
    } catch (err) {
        showToast("Error: " + err.message, true);
    }
}
window.toggleStatus = toggleStatus;

// ── 2. Menu ───────────────────────────────────────────────────
async function loadMenu() {
    try {
        const res = await fetch(`${API}/restaurant/menu`, { headers: AUTH });
        if (!res.ok) throw new Error("Menu load failed");
        const items = await res.json();

        // Populate category datalist
        const cats = [...new Set(items.map(i => i.category))];
        const dl = document.getElementById("categoryList");
        if (dl) dl.innerHTML = cats.map(c => `<option value="${c}">`).join("");

        const tbody = document.getElementById("menuBody");
        tbody.innerHTML = items.length ? items.map(m => `
            <tr>
                <td><img src="${imgSrc(m.image_url)}" class="img-thumb" onerror="this.src='https://placehold.co/46x46/1e2130/444?text=🍽'"></td>
                <td>
                    <div style="font-weight:600">${m.name}</div>
                    <div style="font-size:11px;color:var(--text-secondary)">${(m.description || "").substring(0, 50)}${m.description && m.description.length > 50 ? "…" : ""}</div>
                </td>
                <td><span class="badge accepted">${m.category}</span></td>
                <td style="font-weight:700">${fmt(m.price)}</td>
                <td><span class="badge ${m.is_available ? "avail" : "hidden"}">${m.is_available ? "Available" : "Hidden"}</span></td>
                <td>
                    <div class="btn-sm-group">
                        <button class="btn-sm" onclick='editMenuItem(${JSON.stringify(m).replace(/'/g, "&#39;").replace(/"/g, "&quot;")})'><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-sm del" onclick="deleteMenuItem(${m.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>`).join("")
            : `<tr><td colspan="6" style="text-align:center;color:var(--text-secondary);padding:40px;">No menu items yet. Click "Add Dish" to get started!</td></tr>`;
    } catch (err) {
        showToast("Error loading menu: " + err.message, true);
    }
}

function openMenuModal() {
    document.getElementById("menuForm").reset();
    document.getElementById("menuItemId").value = "";
    document.getElementById("menuModalTitle").textContent = "Add Menu Item";
    document.getElementById("menuPhotoPreview").style.display = "none";
    document.getElementById("menuModal").classList.add("active");
}
window.openMenuModal = openMenuModal;

function closeMenuModal() { document.getElementById("menuModal").classList.remove("active"); }
window.closeMenuModal = closeMenuModal;

window.editMenuItem = function (m) {
    if (typeof m === "string") m = JSON.parse(m);
    document.getElementById("menuItemId").value = m.id;
    document.getElementById("menuName").value = m.name;
    document.getElementById("menuDesc").value = m.description || "";
    document.getElementById("menuPrice").value = Number(m.price).toFixed(2);
    document.getElementById("menuCategory").value = m.category;
    document.getElementById("menuAvail").checked = m.is_available;
    const prev = document.getElementById("menuPhotoPreview");
    if (m.image_url) { prev.src = imgSrc(m.image_url); prev.style.display = "block"; } else prev.style.display = "none";
    document.getElementById("menuModalTitle").textContent = "Edit Menu Item";
    document.getElementById("menuModal").classList.add("active");
};

window.deleteMenuItem = async function (id) {
    if (!confirm("Delete this menu item?")) return;
    try {
        const res = await fetch(`${API}/restaurant/menu/${id}`, { method: "DELETE", headers: AUTH });
        if (!res.ok) throw new Error("Delete failed");
        showToast("Item deleted");
        loadMenu();
    } catch (err) { showToast("Error: " + err.message, true); }
};

document.getElementById("menuForm").addEventListener("submit", async e => {
    e.preventDefault();
    const id = document.getElementById("menuItemId").value;
    const isEdit = !!id;
    const btn = e.submitter;

    const fd = new FormData();
    fd.append("name", document.getElementById("menuName").value);
    fd.append("description", document.getElementById("menuDesc").value);
    fd.append("price", document.getElementById("menuPrice").value);
    fd.append("category", document.getElementById("menuCategory").value);
    fd.append("is_available", document.getElementById("menuAvail").checked);

    const file = document.getElementById("menuPhoto").files[0];
    if (file) fd.append("image", await resizeImg(file, 700));

    btn.disabled = true; btn.textContent = "Saving…";
    try {
        const res = await fetch(`${API}/restaurant/menu${isEdit ? "/" + id : ""}`, {
            method: isEdit ? "PUT" : "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Save failed"); }
        showToast(isEdit ? "Item updated ✓" : "Item added ✓");
        closeMenuModal();
        loadMenu();
    } catch (err) { showToast("Error: " + err.message, true); }
    finally { btn.disabled = false; btn.textContent = "Save Item"; }
});

// ── 3. Orders ─────────────────────────────────────────────────
// Live polling orders every 20s
let lastOrderCount = -1;
setInterval(async () => {
    // We check for new orders regardless of current view to play sound
    try {
        const res = await fetch(`${API}/restaurant/orders`, { headers: AUTH });
        if (!res.ok) return;
        const orders = await res.json();

        if (Array.isArray(orders)) {
            const pendingCount = orders.filter(o => o.status === 'pending').length;
            if (lastOrderCount !== -1 && pendingCount > lastOrderCount) {
                // New order arrived!
                if (document.getElementById('profNotifSound').checked) {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                    audio.play().catch(e => console.log("Sound play error:", e));
                }
                showToast("🔔 New Order Received!");
            }
            lastOrderCount = pendingCount;

            // If we are currently in orders view, refresh the list
            if (document.getElementById("view-orders").classList.contains("active")) {
                renderOrders(orders);
            }
            // If we are in dashboard, refresh dashboard
            if (document.getElementById("view-dashboard").classList.contains("active")) {
                loadDashboard();
            }
        }
    } catch (e) { }
}, 20000);

function renderOrders(orders) {
    const tbody = document.getElementById("ordersBody");
    const nextStatus = { pending: "accepted", accepted: "preparing", preparing: "ready", ready: "completed" };
    const nextLabel = { pending: "✓ Accept", accepted: "🧑‍🍳 Cook", preparing: "🛍 Ready", ready: "✅ Complete" };

    tbody.innerHTML = Array.isArray(orders) && orders.length ? orders.map(o => {
        const items = Array.isArray(o.items) ? o.items.map(i => `${i.quantity}×${i.item_name}`).join(", ") : "—";
        const nxt = nextStatus[o.status];
        const actions = nxt
            ? `<button class="btn-accept" onclick="updateOrderStatus(${o.id}, '${nxt}')">${nextLabel[o.status]}</button>` + (o.status === "pending" ? `<button class="btn-reject" onclick="updateOrderStatus(${o.id}, 'cancelled')">✕ Reject</button>` : "")
            : `<span style="font-size:11px;color:var(--text-secondary)">—</span>`;
        return `<tr>
            <td style="font-weight:700;color:var(--text-secondary)">#${o.id}</td>
            <td style="white-space:nowrap;font-size:12px;color:var(--text-secondary)">${fmtDate(o.created_at)}</td>
            <td><div style="font-weight:600">${o.user_name || "User"}</div><div style="font-size:11px;color:var(--text-secondary)">${o.user_phone || ""}</div></td>
            <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;" title="${items}">${items}</td>
            <td style="font-weight:700;color:var(--success)">${fmt(o.total_price)}</td>
            <td><span class="badge ${o.status}">${o.status}</span></td>
            <td><div class="btn-sm-group">${actions}</div></td>
        </tr>`;
    }).join("")
        : `<tr><td colspan="7" style="text-align:center;color:var(--text-secondary);padding:40px;">No orders yet.</td></tr>`;
}

async function loadOrders() {
    try {
        const res = await fetch(`${API}/restaurant/orders`, { headers: AUTH });
        if (!res.ok) throw new Error("Orders load failed");
        const orders = await res.json();
        renderOrders(orders);
    } catch (err) {
        showToast("Error loading orders: " + err.message, true);
    }
}

window.updateOrderStatus = async function (id, status) {
    try {
        const res = await fetch(`${API}/restaurant/orders/${id}/status`, {
            method: "PUT",
            headers: { ...AUTH, "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error("Status update failed");
        showToast(`Order #${id} → ${status}`);
        loadOrders();
        loadDashboard();
    } catch (err) { showToast("Error: " + err.message, true); }
};

// ── 4. Analytics ─────────────────────────────────────────────
let chartO, chartR;
async function loadAnalytics() {
    try {
        const res = await fetch(`${API}/restaurant/analytics`, { headers: AUTH });
        if (!res.ok) throw new Error("Analytics load failed");
        const d = await res.json();

        // Top items
        const tb = document.getElementById("topItemsBody");
        tb.innerHTML = (d.topItems || []).length ? d.topItems.map(t => `
            <tr><td style="font-weight:600">${t.item_name}</td><td><span class="badge accepted" style="background:var(--bg-input)">${t.count} sold</span></td></tr>`)
            .join("") : `<tr><td colspan="2" style="text-align:center;color:var(--text-secondary);padding:28px;">No data yet</td></tr>`;

        // Charts
        Chart.defaults.color = "#8b8fa3";
        Chart.defaults.font.family = "'Inter', sans-serif";
        if (chartO) chartO.destroy();
        chartO = new Chart(document.getElementById("ordersChart").getContext("2d"), {
            type: "bar",
            data: {
                labels: (d.dailyOrders || []).map(x => fmtDate(x.date).split(",")[0]),
                datasets: [{ label: "Orders", data: (d.dailyOrders || []).map(x => parseInt(x.count)), backgroundColor: "#3b82f6", borderRadius: 5 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: "#2a2d3a" } }, x: { grid: { display: false } } } }
        });
        if (chartR) chartR.destroy();
        chartR = new Chart(document.getElementById("revenueChart").getContext("2d"), {
            type: "line",
            data: {
                labels: (d.weeklyRev || []).map(x => fmtDate(x.week).split(",")[0]),
                datasets: [{ label: "Revenue ($)", data: (d.weeklyRev || []).map(x => Number(x.revenue)), borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,.1)", borderWidth: 2.5, fill: true, tension: 0.4, pointRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: "#2a2d3a" } }, x: { grid: { display: false } } } }
        });
    } catch (err) {
        showToast("Error loading analytics: " + err.message, true);
    }
}

// ── 5. Profile ────────────────────────────────────────────────
async function loadProfile() {
    try {
        const res = await fetch(`${API}/restaurant/profile`, { headers: AUTH });
        if (!res.ok) throw new Error("Profile load failed");
        const p = await res.json();
        document.getElementById("profDesc").value = p.description || "";
        document.getElementById("profAddress").value = p.address || "";
        document.getElementById("profPhone").value = p.phone || "";
        document.getElementById("profHours").value = p.working_hours || "";
        document.getElementById("profMin").value = Number(p.min_order || 0).toFixed(2);
        document.getElementById("profFee").value = Number(p.delivery_fee || 0).toFixed(2);
        const lp = document.getElementById("profLogoPreview");
        if (p.logo_url) { lp.src = imgSrc(p.logo_url); lp.style.display = "block"; }
        const bp = document.getElementById("profBannerPreview");
        if (p.banner_url) { bp.src = imgSrc(p.banner_url); bp.style.display = "block"; }
    } catch (err) {
        showToast("Error loading profile: " + err.message, true);
    }
}

document.getElementById("profileForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = e.submitter;
    const fd = new FormData();
    fd.append("description", document.getElementById("profDesc").value);
    fd.append("address", document.getElementById("profAddress").value);
    fd.append("phone", document.getElementById("profPhone").value);
    fd.append("working_hours", document.getElementById("profHours").value);
    fd.append("min_order", document.getElementById("profMin").value);
    fd.append("delivery_fee", document.getElementById("profFee").value);
    const logoFile = document.getElementById("profLogo").files[0];
    if (logoFile) fd.append("logo", await resizeImg(logoFile, 300));
    const bannerFile = document.getElementById("profBanner").files[0];
    if (bannerFile) fd.append("banner", await resizeImg(bannerFile, 1200));

    btn.disabled = true; btn.textContent = "Saving…";
    try {
        const res = await fetch(`${API}/restaurant/profile`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: fd
        });
        if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Save failed"); }
        showToast("Profile saved ✓");
        loadProfile();
    } catch (err) { showToast("Error: " + err.message, true); }
    finally { btn.disabled = false; btn.textContent = "Save Profile"; }
});

// ── 6. Security ───────────────────────────────────────────────
document.getElementById("passwordForm").addEventListener("submit", async e => {
    e.preventDefault();
    const currentPassword = document.getElementById("currentPass").value;
    const newPassword = document.getElementById("newPass").value;
    const confirmPassword = document.getElementById("confirmPass").value;

    if (newPassword !== confirmPassword) {
        return showToast("Passwords do not match", true);
    }

    const btn = e.submitter;
    btn.disabled = true; btn.textContent = "Updating…";
    try {
        const res = await fetch(`${API}/auth/profile/password`, {
            method: "POST",
            headers: { ...AUTH, "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message || "Password update failed");
        showToast("Password updated successfully ✓");
        document.getElementById("passwordForm").reset();
    } catch (err) {
        showToast(err.message, true);
    } finally {
        btn.disabled = false; btn.textContent = "Update Password";
    }
});

// ── Start ─────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => document.getElementById("loader").style.display = "none", 400);
    loadDashboard();
});
