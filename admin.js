/* ═══════════════════════════════════════════════════════════════
   CampusEats SuperAdmin Panel — Full JavaScript
   ═══════════════════════════════════════════════════════════════ */

const API_BASE = "https://campuseats-backend.vercel.app/api";

// ═══════════════════════════════════════════
// AUTH & INITIALIZATION
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// MULTI-LANGUAGE SUPPORT
// ═══════════════════════════════════════════
const TRANSLATIONS = {
    en: {
        dashboard: "Dashboard", users: "Users", restaurants: "Restaurants", verifications: "Verifications",
        orders: "Orders", logs: "Audit Logs", system: "System", logout: "Log Out",
        welcome: "Welcome Back", overview: "Platform Overview",
        total_users: "Total Users", pending_identities: "Pending Verifications",
        active_partners: "Active Partners", platform_revenue: "Platform Revenue",
        recent_activity: "Recent Activity", search: "Search...",
        refresh: "Refresh",
        pending_verifications: "Pending Verifications",
        actions: "Actions", admin: "Admin", time: "Time",
        user: "User", submitted: "Submitted", action: "Action",
        user_mgmt: "User Management", manage_users: "Manage platform users",
        search_users: "Search by phone or name...", all_roles: "All Roles",
        all_status: "All Status", active: "Active", blocked: "Blocked",
        id: "ID", role: "Role", status: "Status", verified: "Verified", registered: "Registered",
        msg_auth_failed: "Auth verify failed", msg_forbidden: "Forbidden: You are not a superadmin."
    },
    ru: {
        dashboard: "Главная", users: "Пользователи", restaurants: "Рестораны", verifications: "Верификации",
        orders: "Заказы", logs: "Логи аудита", system: "Система", logout: "Выйти",
        welcome: "С возвращением", overview: "Обзор платформы",
        total_users: "Всего пользователей", pending_identities: "Ожидают проверки",
        active_partners: "Активные партнеры", platform_revenue: "Доход платформы",
        recent_activity: "Последние действия", search: "Поиск...",
        refresh: "Обновить",
        pending_verifications: "Ожидают проверки",
        actions: "Действия", admin: "Админ", time: "Время",
        user: "Пользователь", submitted: "Отправлено", action: "Действие",
        user_mgmt: "Управление пользователями", manage_users: "Управление всеми пользователями",
        search_users: "Поиск по телефону или имени...", all_roles: "Все роли",
        all_status: "Все статусы", active: "Активен", blocked: "Заблокирован",
        id: "ID", role: "Роль", status: "Статус", verified: "Верификация", registered: "Регистрация",
        msg_auth_failed: "Ошибка авторизации", msg_forbidden: "Доступ запрещен: Вы не суперадмин."
    },
    uz: {
        dashboard: "Boshqaruv", users: "Foydalanuvchilar", restaurants: "Restoranlar", verifications: "Verifikatsiya",
        orders: "Buyurtmalar", logs: "Audit loglari", system: "Tizim", logout: "Chiqish",
        welcome: "Xush kelibsiz", overview: "Platforma sharhi",
        total_users: "Jami foydalanuvchilar", pending_identities: "Kutilayotgan tasdiqlar",
        active_partners: "Faol hamkorlar", platform_revenue: "Platforma tushumi",
        recent_activity: "Oxirgi harakatlar", search: "Qidirish...",
        refresh: "Yangilash",
        pending_verifications: "Tasdiq kutilmoqda",
        actions: "Harakatlar", admin: "Admin", time: "Vaqt",
        user: "Foydalanuvchi", submitted: "Yuborilgan", action: "Harakat",
        user_mgmt: "Foydalanuvchilar boshqaruvi", manage_users: "Tizim foydalanuvchilarini boshqarish",
        search_users: "Telefon yoki ism bo'yicha...", all_roles: "Barcha rollar",
        all_status: "Barcha holatlar", active: "Faol", blocked: "Bloklangan",
        id: "ID", role: "Rol", status: "Holat", verified: "Tasdiqlangan", registered: "Ro'yxatdan o'tgan",
        msg_auth_failed: "Avtorizatsiya xatosi", msg_forbidden: "Taqiqlangan: Siz superadmin emassiz."
    }
};

let currentLang = localStorage.getItem("campuseats_lang") || "en";

function applyTranslations() {
    const t = TRANSLATIONS[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-label]').forEach(el => {
        const key = el.dataset.i18nLabel;
        if (t[key]) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.dataset.i18nPh;
        if (t[key]) el.placeholder = t[key];
    });
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

document.addEventListener("DOMContentLoaded", async () => {
    applyTranslations();
    const token = localStorage.getItem("campuseats_token");
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Auth verify failed");

        const data = await response.json();

        if (data.user.role !== "superadmin") {
            showToast("Forbidden: You are not a superadmin.", "error");
            setTimeout(() => (window.location.href = "index.html"), 1500);
            return;
        }

        // Set admin info in sidebar
        const name = data.user.full_name || data.user.phone || "SuperAdmin";
        document.getElementById("adminName").textContent = name;
        document.getElementById("adminAvatar").textContent = name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        // Hide loader
        document.getElementById("loader").style.display = "none";

        // Load all data
        loadDashboard();
        loadUsers();
        loadRestaurants();
        loadVerifications();
        loadOrders();
        loadAuditLogs();
        loadNotifications();
    } catch (err) {
        console.error("Auth error:", err);
        localStorage.removeItem("campuseats_token");
        window.location.href = "index.html";
    }
});

// ═══════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════
function getAuthHeaders() {
    return {
        Authorization: `Bearer ${localStorage.getItem("campuseats_token")}`,
        "Content-Type": "application/json",
    };
}

function logout() {
    localStorage.removeItem("campuseats_token");
    localStorage.removeItem("campuseats_user");
    window.location.href = "index.html";
}

function switchTab(tabId, navEl) {
    document.querySelectorAll(".tab-section").forEach((s) => s.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach((a) => a.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
    if (navEl) navEl.classList.add("active");

    // Close sidebar on mobile
    document.getElementById("sidebar").classList.remove("open");
}

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = { success: "fa-check-circle", error: "fa-exclamation-circle", info: "fa-info-circle" };
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${escapeHtml(message)}`;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(40px)";
        toast.style.transition = "0.3s";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
        " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatDateShort(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function timeAgo(dateStr) {
    if (!dateStr) return "—";
    const now = new Date();
    const d = new Date(dateStr);
    const secs = Math.floor((now - d) / 1000);

    if (secs < 60) return "Just now";
    if (secs < 3600) return Math.floor(secs / 60) + "m ago";
    if (secs < 86400) return Math.floor(secs / 3600) + "h ago";
    if (secs < 604800) return Math.floor(secs / 86400) + "d ago";
    return formatDateShort(dateStr);
}

// Debounce
let userSearchTimer, orderSearchTimer;
function debounceLoadUsers() {
    clearTimeout(userSearchTimer);
    userSearchTimer = setTimeout(loadUsers, 350);
}
function debounceLoadOrders() {
    clearTimeout(orderSearchTimer);
    orderSearchTimer = setTimeout(loadOrders, 350);
}

// Modal
function openModal(title, html) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = html;
    document.getElementById("modalOverlay").classList.add("active");
}

function closeModal(e) {
    if (e && e.target !== document.getElementById("modalOverlay")) return;
    document.getElementById("modalOverlay").classList.remove("active");
}

// Action tag styling
function getActionTag(action) {
    const map = {
        VERIFICATION_APPROVED: { cls: "approve", icon: "fa-check" },
        VERIFICATION_REJECTED: { cls: "reject", icon: "fa-times" },
        USER_BLOCKED: { cls: "block", icon: "fa-ban" },
        USER_UNBLOCKED: { cls: "unblock", icon: "fa-check-circle" },
        USER_DELETED: { cls: "delete", icon: "fa-trash" },
        RESTAURANT_CREATED: { cls: "create", icon: "fa-plus" },
        PASSWORD_RESET: { cls: "reset", icon: "fa-key" },
        ROLE_CHANGED: { cls: "role", icon: "fa-exchange-alt" },
        // legacy mappings
        approve_verification: { cls: "approve", icon: "fa-check" },
        reject_verification: { cls: "reject", icon: "fa-times" },
        block_user: { cls: "block", icon: "fa-ban" },
        unblock_user: { cls: "unblock", icon: "fa-check-circle" },
        soft_delete_user: { cls: "delete", icon: "fa-trash" },
        hard_delete_user: { cls: "delete", icon: "fa-trash" },
        create_restaurant: { cls: "create", icon: "fa-plus" },
        reset_password: { cls: "reset", icon: "fa-key" },
    };
    const m = map[action] || { cls: "create", icon: "fa-circle" };
    return `<span class="action-tag ${m.cls}"><i class="fas ${m.icon}"></i> ${action}</span>`;
}

// ═══════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════
async function loadDashboard() {
    try {
        const dashRes = await fetch(`${API_BASE}/admin/dashboard`, { headers: getAuthHeaders() });
        const d = await dashRes.json();

        document.getElementById("dashboardStats").innerHTML = `
            <div class="stat-card orange">
                <div class="stat-header">
                    <span class="stat-label">Total Users</span>
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                </div>
                <div class="stat-value">${d.totalUsers || 0}</div>
                <div class="stat-change">${d.newUsersToday || 0} new today</div>
            </div>
            <div class="stat-card blue">
                <div class="stat-header">
                    <span class="stat-label">Restaurants</span>
                    <div class="stat-icon"><i class="fas fa-utensils"></i></div>
                </div>
                <div class="stat-value">${d.totalRestaurants || 0}</div>
                <div class="stat-change">Active partners</div>
            </div>
            <div class="stat-card green">
                <div class="stat-header">
                    <span class="stat-label">Total Orders</span>
                    <div class="stat-icon"><i class="fas fa-shopping-bag"></i></div>
                </div>
                <div class="stat-value">${d.totalOrders || 0}</div>
                <div class="stat-change">All time</div>
            </div>
            <div class="stat-card purple">
                <div class="stat-header">
                    <span class="stat-label">Revenue</span>
                    <div class="stat-icon"><i class="fas fa-coins"></i></div>
                </div>
                <div class="stat-value">${Number(d.totalRevenue || 0).toLocaleString()}</div>
                <div class="stat-change">UZS total</div>
            </div>
            <div class="stat-card yellow">
                <div class="stat-header">
                    <span class="stat-label">Pending Verifs</span>
                    <div class="stat-icon"><i class="fas fa-hourglass-half"></i></div>
                </div>
                <div class="stat-value">${d.pendingVerifications || 0}</div>
                <div class="stat-change">Awaiting review</div>
            </div>
            <div class="stat-card green">
                <div class="stat-header">
                    <span class="stat-label">Verified Students</span>
                    <div class="stat-icon"><i class="fas fa-graduation-cap"></i></div>
                </div>
                <div class="stat-value">${d.verifiedPercent || 0}%</div>
                <div class="stat-change">${d.verifiedStudents || 0} / ${d.totalStudents || 0}</div>
            </div>
            <div class="stat-card red">
                <div class="stat-header">
                    <span class="stat-label">Blocked</span>
                    <div class="stat-icon"><i class="fas fa-ban"></i></div>
                </div>
                <div class="stat-value">${d.blockedPercent || 0}%</div>
                <div class="stat-change">${d.blockedAccounts || 0} accounts</div>
            </div>
            <div class="stat-card blue">
                <div class="stat-header">
                    <span class="stat-label">Audit Logs</span>
                    <div class="stat-icon"><i class="fas fa-scroll"></i></div>
                </div>
                <div class="stat-value">${d.totalLogs || 0}</div>
                <div class="stat-change">Total entries</div>
            </div>
        `;

        // Update pending badge
        const badge = document.getElementById("pendingBadge");
        if (d.pendingVerifications > 0) {
            badge.style.display = "inline";
            badge.textContent = d.pendingVerifications;
        } else {
            badge.style.display = "none";
        }

        // Load recent activity
        const auditRes = await fetch(`${API_BASE}/admin/audit?limit=5`, { headers: getAuthHeaders() });
        const auditData = await auditRes.json();
        const actBody = document.getElementById("recentActivity");
        if (auditData.logs && auditData.logs.length > 0) {
            actBody.innerHTML = auditData.logs.map(
                (log) => `<tr>
                    <td>${getActionTag(log.action)}</td>
                    <td style="color: var(--text-secondary); font-size: 12px;">${escapeHtml(log.admin_name || "Admin")}</td>
                    <td style="color: var(--text-muted); font-size: 12px;">${timeAgo(log.created_at)}</td>
                </tr>`
            ).join("");
        } else {
            actBody.innerHTML = `<tr><td colspan="3" class="empty-state"><p>No activity yet</p></td></tr>`;
        }

        // Load pending verifs on dashboard
        const vRes = await fetch(`${API_BASE}/admin/verifications?status=pending&limit=5`, { headers: getAuthHeaders() });
        const vData = await vRes.json();
        const pvBody = document.getElementById("dashPendingList");
        if (vData.verifications && vData.verifications.length > 0) {
            pvBody.innerHTML = vData.verifications.map(
                (v) => `<tr>
                    <td style="font-size:13px;">${escapeHtml(v.full_name || "—")} <br><small style="color:var(--text-muted)">${escapeHtml(v.phone || "")}</small></td>
                    <td style="color: var(--text-muted); font-size: 12px;">${timeAgo(v.created_at)}</td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-success" onclick="reviewVerif(${v.id}, 'approve')"><i class="fas fa-check"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="reviewVerif(${v.id}, 'reject')"><i class="fas fa-times"></i></button>
                        </div>
                    </td>
                </tr>`
            ).join("");
        } else {
            pvBody.innerHTML = `<tr><td colspan="3" class="empty-state"><p>No pending verifications</p></td></tr>`;
        }

    } catch (err) {
        console.error("Dashboard error:", err);
        showToast("Failed to load dashboard", "error");
    }
}

// ═══════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════
let usersPage = 1;
const USERS_LIMIT = 20;

async function loadUsers(page = 1) {
    usersPage = page;
    const search = document.getElementById("userSearch").value;
    const role = document.getElementById("userRoleFilter").value;
    const status = document.getElementById("userStatusFilter").value;

    try {
        const url = `${API_BASE}/admin/users?search=${encodeURIComponent(search)}&role=${role}&status=${status}&limit=${USERS_LIMIT}&page=${page}`;
        const res = await fetch(url, { headers: getAuthHeaders() });
        const data = await res.json();

        const tbody = document.getElementById("usersTableBody");

        if (!data.users || data.users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-users"></i><p>No users found</p></div></td></tr>`;
            document.getElementById("usersPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.users.map((u) => {
            const statusBadge = `<span class="badge ${u.status || "active"}">${(u.status || "active").toUpperCase()}</span>`;
            const roleBadge = `<span class="badge ${u.role}">${u.role.toUpperCase()}</span>`;
            const verified = u.is_student_verified
                ? `<i class="fas fa-check-circle verified-icon" title="Verified"></i>`
                : `<i class="fas fa-minus-circle unverified-icon" title="Not verified"></i>`;

            let actions = "";
            if (u.role !== "superadmin") {
                const blockBtn = (u.status === "active")
                    ? `<button class="btn btn-sm btn-danger" onclick="userAction(${u.id}, 'block')" title="Block"><i class="fas fa-ban"></i></button>`
                    : `<button class="btn btn-sm btn-success" onclick="userAction(${u.id}, 'unblock')" title="Unblock"><i class="fas fa-check"></i></button>`;

                actions = `
                    <div class="btn-group">
                        <button class="btn btn-sm btn-info" onclick="viewUserDetail(${u.id})" title="Details"><i class="fas fa-eye"></i></button>
                        ${blockBtn}
                        <button class="btn btn-sm btn-warning" onclick="resetPassword(${u.id})" title="Reset Password"><i class="fas fa-key"></i></button>
                        <button class="btn btn-sm btn-default" onclick="changeRole(${u.id}, '${u.role}')" title="Change Role"><i class="fas fa-exchange-alt"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            } else {
                actions = `<span style="color:var(--text-muted); font-size: 11px;">Protected</span>`;
            }

            return `<tr>
                <td style="color:var(--text-muted); font-weight:600;">#${u.id}</td>
                <td>
                    <div style="font-weight:600;">${escapeHtml(u.full_name || "—")}</div>
                    <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(u.phone)}</div>
                </td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td>${verified}</td>
                <td style="color:var(--text-muted); font-size:12px;">${formatDateShort(u.created_at)}</td>
                <td>${actions}</td>
            </tr>`;
        }).join("");

        renderPagination("usersPagination", data.total, data.page, data.limit, loadUsers);

    } catch (err) {
        console.error("Load users error:", err);
        showToast("Failed to load users", "error");
    }
}

async function userAction(id, action) {
    const confirmMsg = action === "block" ? "Block this user?" : "Unblock this user?";
    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}/${action}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }
        showToast(`User ${action}ed successfully`, "success");
        loadUsers(usersPage);
        loadDashboard();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function resetPassword(id) {
    if (!confirm("Reset this user's password? A new temporary password will be generated.")) return;

    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}/reset-password`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        openModal("Password Reset", `
            <div style="text-align: center; padding: 20px;">
                <i class="fas fa-key" style="font-size: 48px; color: var(--warning); margin-bottom: 16px;"></i>
                <p style="margin-bottom: 20px; color: var(--text-secondary);">New temporary password for <strong style="color: var(--text-primary);">${escapeHtml(data.user.phone)}</strong></p>
                <div class="password-display">${escapeHtml(data.user.temporary_password)}</div>
                <p style="margin-top: 16px; font-size: 12px; color: var(--danger);">
                    <i class="fas fa-exclamation-triangle"></i> Save this password — it will NOT be shown again!
                </p>
            </div>
        `);

        showToast("Password reset successfully", "success");
        loadAuditLogs();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function changeRole(id, currentRole) {
    const newRole = currentRole === "user" ? "restaurant" : "user";
    if (!confirm(`Change role from "${currentRole}" to "${newRole}"?`)) return;

    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}/change-role`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ newRole }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showToast(data.message, "success");
        loadUsers(usersPage);
        loadDashboard();
        loadAuditLogs();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function deleteUser(id) {
    const choice = prompt("Type 'soft' for soft delete or 'hard' for permanent delete:");
    if (!choice) return;

    const endpoint = choice.toLowerCase() === "hard" ? "hard-delete" : "delete";
    const confirmMsg = endpoint === "hard-delete"
        ? "⚠️ PERMANENT DELETE! This cannot be undone. Are you sure?"
        : "Soft-delete this user? (Can be restored later)";

    if (!confirm(confirmMsg)) return;

    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}/${endpoint}`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showToast(data.message, "success");
        loadUsers(usersPage);
        loadDashboard();
        loadAuditLogs();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function viewUserDetail(id) {
    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}`, { headers: getAuthHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const u = data.user;
        let html = `
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="label">Phone</div>
                    <div class="value">${escapeHtml(u.phone)}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Role</div>
                    <div class="value"><span class="badge ${u.role}">${u.role.toUpperCase()}</span></div>
                </div>
                <div class="detail-item">
                    <div class="label">Status</div>
                    <div class="value"><span class="badge ${u.status || 'active'}">${(u.status || 'active').toUpperCase()}</span></div>
                </div>
                <div class="detail-item">
                    <div class="label">Verified</div>
                    <div class="value">${u.is_student_verified ? '<i class="fas fa-check-circle verified-icon"></i> Yes' : '<i class="fas fa-times-circle unverified-icon"></i> No'}</div>
                </div>
                <div class="detail-item">
                    <div class="label">Balance</div>
                    <div class="value">${u.balance || 0} UZS</div>
                </div>
                <div class="detail-item">
                    <div class="label">Registered</div>
                    <div class="value" style="font-size:12px;">${formatDate(u.created_at)}</div>
                </div>
            </div>
        `;

        // Orders
        if (data.orders && data.orders.length > 0) {
            html += `<h4 style="margin: 16px 0 8px; font-size: 14px; color: var(--text-secondary);"><i class="fas fa-shopping-bag" style="color: var(--accent);"></i> Orders (${data.orders.length})</h4>`;
            html += `<div style="max-height: 200px; overflow-y: auto;">
                <table style="font-size: 12px;">
                    <thead><tr><th>ID</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                        ${data.orders.map(o => `<tr>
                            <td>#${o.id}</td>
                            <td>${o.total_price} UZS</td>
                            <td><span class="badge ${o.status}">${o.status}</span></td>
                            <td>${formatDateShort(o.created_at)}</td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>`;
        }

        // Verifications
        if (data.verifications && data.verifications.length > 0) {
            html += `<h4 style="margin: 16px 0 8px; font-size: 14px; color: var(--text-secondary);"><i class="fas fa-id-card" style="color: var(--info);"></i> Verifications (${data.verifications.length})</h4>`;
            html += data.verifications.map(v => `
                <div style="background: var(--bg-secondary); padding: 10px; border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border);">
                    <span class="badge ${v.status}">${v.status}</span>
                    <span style="font-size: 11px; color: var(--text-muted); margin-left: 8px;">${formatDate(v.created_at)}</span>
                    ${v.rejection_reason ? `<p style="font-size: 12px; color: var(--danger); margin-top: 6px;">Reason: ${escapeHtml(v.rejection_reason)}</p>` : ""}
                </div>
            `).join("");
        }

        openModal(`User #${id} — ${escapeHtml(u.full_name || u.phone)}`, html);
    } catch (err) {
        showToast("Failed to load user details: " + err.message, "error");
    }
}

// ═══════════════════════════════════════════
// RESTAURANTS
// ═══════════════════════════════════════════
async function loadRestaurants() {
    try {
        const res = await fetch(`${API_BASE}/admin/restaurants?limit=50`, { headers: getAuthHeaders() });
        const data = await res.json();

        const tbody = document.getElementById("restaurantsTableBody");

        if (!data.restaurants || data.restaurants.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-utensils"></i><p>No restaurants yet</p></div></td></tr>`;
            return;
        }

        tbody.innerHTML = data.restaurants.map((r) => `
            <tr>
                <td style="color:var(--text-muted); font-weight:600;">#${r.id}</td>
                <td style="font-weight:600;">${escapeHtml(r.full_name || "—")}</td>
                <td style="color:var(--text-secondary);">${escapeHtml(r.phone)}</td>
                <td><span class="badge ${r.status || 'active'}">${(r.status || 'active').toUpperCase()}</span></td>
                <td>${r.order_count || 0}</td>
                <td>${Number(r.total_revenue || 0).toLocaleString()} UZS</td>
                <td>
                    <div class="btn-group">
                        ${(r.status === 'active')
                ? `<button class="btn btn-sm btn-danger" onclick="userAction(${r.id}, 'block')" title="Block"><i class="fas fa-ban"></i></button>`
                : `<button class="btn btn-sm btn-success" onclick="userAction(${r.id}, 'unblock')" title="Activate"><i class="fas fa-check"></i></button>`}
                        <button class="btn btn-sm btn-warning" onclick="resetPassword(${r.id})" title="Reset Password"><i class="fas fa-key"></i></button>
                    </div>
                </td>
            </tr>
        `).join("");

    } catch (err) {
        console.error("Load restaurants error:", err);
    }
}

async function createRestaurant() {
    const phone = document.getElementById("restPhone").value.trim();
    const name = document.getElementById("restName").value.trim();
    const resultBox = document.getElementById("restResult");

    if (!phone) {
        resultBox.className = "result-box error";
        resultBox.textContent = "Phone number is required.";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/restaurants/create`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ phone, restaurant_name: name }),
        });
        const data = await res.json();

        if (!res.ok) {
            resultBox.className = "result-box error";
            resultBox.textContent = "Error: " + data.message;
            return;
        }

        resultBox.className = "result-box success";
        resultBox.innerHTML = `
            <strong><i class="fas fa-check-circle"></i> ${escapeHtml(data.message)}</strong><br><br>
            <strong>Phone:</strong> ${escapeHtml(data.restaurant.phone)}<br>
            <strong>Temp Password:</strong> <span class="password-display" style="font-size: 16px;">${escapeHtml(data.restaurant.temporary_password)}</span>
        `;

        document.getElementById("restPhone").value = "";
        document.getElementById("restName").value = "";

        showToast("Restaurant created!", "success");
        loadRestaurants();
        loadUsers(usersPage);
        loadDashboard();
        loadAuditLogs();

    } catch (err) {
        resultBox.className = "result-box error";
        resultBox.textContent = "Creation failed: " + err.message;
    }
}

// ═══════════════════════════════════════════
// VERIFICATIONS
// ═══════════════════════════════════════════
let verifsPage = 1;
const VERIFS_LIMIT = 50;

async function loadVerifications(page = 1) {
    verifsPage = page;
    const status = document.getElementById("verifStatusFilter").value;

    try {
        const url = `${API_BASE}/admin/verifications?status=${status}&limit=${VERIFS_LIMIT}&page=${page}`;
        const res = await fetch(url, { headers: getAuthHeaders() });
        const data = await res.json();

        const tbody = document.getElementById("verificationsTableBody");
        const host = API_BASE.replace("/api", "");

        if (!data.verifications || data.verifications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-user-check"></i><p>No verifications found</p></div></td></tr>`;
            document.getElementById("verifPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.verifications.map((v) => {
            // Handle both old (file_url) and new (front/back) schema
            let imagesHtml = "";
            if (v.front_image_url) {
                const front = v.front_image_url.startsWith("http") || v.front_image_url.startsWith("data:") ? v.front_image_url : host + v.front_image_url;
                imagesHtml += `<img src="${front}" class="img-preview" onclick="const w=window.open('','_blank');w.document.write('<img src=\\''+'${front}'+'\\'>');" alt="Front" onerror="this.style.display='none'">`;
            }
            if (v.back_image_url) {
                const back = v.back_image_url.startsWith("http") || v.back_image_url.startsWith("data:") ? v.back_image_url : host + v.back_image_url;
                imagesHtml += ` <img src="${back}" class="img-preview" onclick="const w=window.open('','_blank');w.document.write('<img src=\\''+'${back}'+'\\'>');" alt="Back" onerror="this.style.display='none'">`;
            }
            if (v.file_url && !v.front_image_url) {
                const file = v.file_url.startsWith("http") || v.file_url.startsWith("data:") ? v.file_url : host + v.file_url;
                imagesHtml = `<img src="${file}" class="img-preview" onclick="const w=window.open('','_blank');w.document.write('<img src=\\''+'${file}'+'\\'>');" alt="Photo" onerror="this.style.display='none'">`;
            }
            if (!imagesHtml) imagesHtml = `<span style="color:var(--text-muted);">No images</span>`;

            const statusBadge = `<span class="badge ${v.status}">${v.status.toUpperCase()}</span>`;

            let actions = "";
            if (v.status === "pending") {
                actions = `
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" onclick="reviewVerif(${v.id}, 'approve')"><i class="fas fa-check"></i> Approve</button>
                        <button class="btn btn-sm btn-danger" onclick="reviewVerif(${v.id}, 'reject')"><i class="fas fa-times"></i> Reject</button>
                    </div>
                `;
            } else if (v.rejection_reason) {
                actions = `<span style="font-size: 11px; color: var(--danger);">${escapeHtml(v.rejection_reason)}</span>`;
            } else {
                actions = `<span style="color:var(--text-muted); font-size:11px;">Processed</span>`;
            }

            return `<tr>
                <td style="color:var(--text-muted); font-weight:600;">#${v.id}</td>
                <td>
                    <div style="font-weight:600;">${escapeHtml(v.full_name || "—")}</div>
                    <div style="font-size:12px; color:var(--text-muted);">${escapeHtml(v.phone || "")}</div>
                </td>
                <td>${imagesHtml}</td>
                <td>${statusBadge}</td>
                <td style="color:var(--text-muted); font-size:12px;">${formatDate(v.created_at)}</td>
                <td>${actions}</td>
            </tr>`;
        }).join("");

        renderPagination("verifPagination", data.total, data.page, data.limit, loadVerifications);

    } catch (err) {
        console.error("Load verifications error:", err);
        showToast("Failed to load verifications", "error");
    }
}

async function reviewVerif(id, action) {
    let body = {};
    if (action === "reject") {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        body.rejection_reason = reason;
    } else {
        if (!confirm("Approve this verification?")) return;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/verifications/${id}/${action}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        showToast(`Verification ${action}d successfully`, "success");
        loadVerifications(verifsPage);
        loadDashboard();
        loadAuditLogs();
    } catch (err) {
        showToast(err.message, "error");
    }
}

// ═══════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════
let ordersPage = 1;
const ORDERS_LIMIT = 50;

async function loadOrders(page = 1) {
    ordersPage = page;
    const userId = document.getElementById("orderUserSearch").value.trim();
    const status = document.getElementById("orderStatusFilter").value;
    const dateFrom = document.getElementById("orderDateFrom").value;
    const dateTo = document.getElementById("orderDateTo").value;

    let url = `${API_BASE}/admin/orders?limit=${ORDERS_LIMIT}&page=${page}`;
    if (userId) url += `&user_id=${encodeURIComponent(userId)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    if (dateFrom) url += `&date_from=${encodeURIComponent(dateFrom)}`;
    if (dateTo) url += `&date_to=${encodeURIComponent(dateTo)}`;

    try {
        const res = await fetch(url, { headers: getAuthHeaders() });
        const data = await res.json();

        const tbody = document.getElementById("ordersTableBody");

        if (!data.orders || data.orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-shopping-bag"></i><p>No orders found</p></div></td></tr>`;
            document.getElementById("ordersPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.orders.map((o) => `
            <tr>
                <td style="color:var(--text-muted); font-weight:600;">#${o.id}</td>
                <td>
                    <div style="font-weight:500;">${escapeHtml(o.user_name || "—")}</div>
                    <div style="font-size:11px; color:var(--text-muted);">${escapeHtml(o.user_phone || "")}</div>
                </td>
                <td style="color:var(--text-secondary);">${escapeHtml(o.restaurant_name || "—")}</td>
                <td style="font-weight:600;">${Number(o.total_price || 0).toLocaleString()} UZS</td>
                <td><span class="badge ${o.status}">${(o.status || "—").toUpperCase()}</span></td>
                <td style="color:var(--text-muted); font-size:12px; max-width:180px; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(o.delivery_address || "—")}</td>
                <td style="color:var(--text-muted); font-size:12px;">${formatDate(o.created_at)}</td>
            </tr>
        `).join("");

        renderPagination("ordersPagination", data.total, data.page, data.limit, loadOrders);

    } catch (err) {
        console.error("Load orders error:", err);
        const tbody = document.getElementById("ordersTableBody");
        tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-shopping-bag"></i><p>Could not load orders</p></div></td></tr>`;
    }
}

// ═══════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════
let auditPage = 1;
const AUDIT_LIMIT = 25;

async function loadAuditLogs(page = 1) {
    auditPage = page;
    const action = document.getElementById("auditActionFilter").value;

    let url = `${API_BASE}/admin/audit?limit=${AUDIT_LIMIT}&page=${page}`;
    if (action) url += `&action=${encodeURIComponent(action)}`;

    try {
        const res = await fetch(url, { headers: getAuthHeaders() });
        const data = await res.json();

        const tbody = document.getElementById("auditTableBody");

        if (!data.logs || data.logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-scroll"></i><p>No audit logs found</p></div></td></tr>`;
            document.getElementById("auditPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.logs.map((log) => {
            const detailsObj = log.details || log.metadata || {};
            const detailsStr = typeof detailsObj === "string" ? detailsObj : JSON.stringify(detailsObj, null, 0);

            return `<tr>
                <td style="color:var(--text-muted); font-weight:600;">#${log.id}</td>
                <td>
                    <div style="font-weight:500;">${escapeHtml(log.admin_name || "Admin")}</div>
                    <div style="font-size:11px; color:var(--text-muted);">${escapeHtml(log.admin_phone || "")}</div>
                </td>
                <td>${getActionTag(log.action)}</td>
                <td style="font-size:11px; color:var(--text-muted); max-width:250px; overflow:hidden; text-overflow:ellipsis;">
                    <code style="background:var(--bg-primary); padding:2px 6px; border-radius:4px; font-size:10px;">${escapeHtml(detailsStr)}</code>
                </td>
                <td style="color:var(--text-muted); font-size:12px;">${formatDate(log.created_at)}</td>
            </tr>`;
        }).join("");

        renderPagination("auditPagination", data.total, data.page, data.limit, loadAuditLogs);

    } catch (err) {
        console.error("Load audit error:", err);
        showToast("Failed to load audit logs", "error");
    }
}

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════
let notifPage = 1;
const NOTIF_LIMIT = 50;

async function loadNotifications(page = 1) {
    notifPage = page;

    try {
        const res = await fetch(`${API_BASE}/admin/notifications?limit=${NOTIF_LIMIT}&page=${page}`, { headers: getAuthHeaders() });
        const data = await res.json();

        const tbody = document.getElementById("notificationsTableBody");

        if (!data.notifications || data.notifications.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-bell"></i><p>No notifications yet</p></div></td></tr>`;
            document.getElementById("notifPagination").innerHTML = "";
            return;
        }

        tbody.innerHTML = data.notifications.map((n) => `
            <tr>
                <td style="color:var(--text-muted); font-weight:600;">#${n.id}</td>
                <td>
                    <div style="font-weight:500;">${escapeHtml(n.full_name || "—")}</div>
                    <div style="font-size:11px; color:var(--text-muted);">${escapeHtml(n.phone || "")}</div>
                </td>
                <td><span class="badge user">${escapeHtml(n.type || "—")}</span></td>
                <td style="font-size:12px; color:var(--text-secondary); max-width:300px; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(n.message)}</td>
                <td>${n.is_read ? '<i class="fas fa-check-circle verified-icon"></i>' : '<i class="fas fa-circle" style="color:var(--info); font-size:8px;"></i>'}</td>
                <td style="color:var(--text-muted); font-size:12px;">${formatDate(n.created_at)}</td>
            </tr>
        `).join("");

        renderPagination("notifPagination", data.total, data.page, data.limit, loadNotifications);

    } catch (err) {
        console.error("Load notifications error:", err);
    }
}

// ═══════════════════════════════════════════
// PAGINATION HELPER
// ═══════════════════════════════════════════
function renderPagination(containerId, total, currentPage, limit, loadFn) {
    const container = document.getElementById(containerId);
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) {
        container.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">Showing ${total} result${total !== 1 ? "s" : ""}</span>`;
        return;
    }

    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, total);

    container.innerHTML = `
        <span>Showing ${start}–${end} of ${total}</span>
        <div class="pagination-buttons">
            <button ${currentPage <= 1 ? "disabled" : ""} onclick="(${loadFn.name})(${currentPage - 1})">
                <i class="fas fa-chevron-left"></i> Prev
            </button>
            <span style="padding:6px 12px; color:var(--text-secondary); font-weight:600;">${currentPage} / ${totalPages}</span>
            <button ${currentPage >= totalPages ? "disabled" : ""} onclick="(${loadFn.name})(${currentPage + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;
}
