const API_BASE = "https://vercelbackenddeploy-teal.vercel.app/api";

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("campuseats_token");
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Auth verify failed");

        const data = await response.json();

        if (data.user.role !== "superadmin") {
            alert("Forbidden: You are not a superadmin.");
            window.location.href = "index.html";
            return;
        }

        document.getElementById("loader").style.display = "none";

        // Load initial data
        loadDashboard();
        loadUsers();
        loadVerifications();
        loadAuditLogs();

    } catch (err) {
        console.error(err);
        localStorage.removeItem("campuseats_token");
        window.location.href = "index.html";
    }
});

function logout() {
    localStorage.removeItem("campuseats_token");
    localStorage.removeItem("campuseats_user");
    window.location.href = "index.html";
}

function switchTab(tabId) {
    document.querySelectorAll(".tab-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    event.target.classList.add("active");
}

function getAuthHeaders() {
    return {
        "Authorization": `Bearer ${localStorage.getItem("campuseats_token")}`,
        "Content-Type": "application/json"
    };
}

// DASHBOARD
async function loadDashboard() {
    try {
        const users = await fetch(`${API_BASE}/admin/users?limit=1`, { headers: getAuthHeaders() }).then(r => r.json());
        const audit = await fetch(`${API_BASE}/admin/audit?limit=1`, { headers: getAuthHeaders() }).then(r => r.json());
        const verif = await fetch(`${API_BASE}/admin/verifications?status=pending`, { headers: getAuthHeaders() }).then(r => r.json());

        document.getElementById("dashTotalUsers").textContent = users.total || 0;
        document.getElementById("dashTotalLogs").textContent = audit.total || 0;
        document.getElementById("dashPendingVerifications").textContent = verif.verifications.length || 0;
    } catch (err) {
        console.error("Dashboard error", err);
    }
}

// USERS
async function loadUsers() {
    const search = document.getElementById("userSearch").value;
    try {
        const response = await fetch(`${API_BASE}/admin/users?search=${encodeURIComponent(search)}&limit=50`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const tbody = document.querySelector("#usersTable tbody");
        tbody.innerHTML = "";

        data.users.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.phone}</td>
                <td>
                    <b>${user.full_name || "-"}</b><br>
                    <small style="color:#aaa">${user.role}</small>
                </td>
                <td><span class="badge ${user.status}">${user.status.toUpperCase()}</span></td>
                <td>
                    ${user.status === 'active'
                    ? `<button class="danger" onclick="toggleUserStatus(${user.id}, 'block')">Block</button>`
                    : `<button class="success" onclick="toggleUserStatus(${user.id}, 'unblock')">Unblock</button>`}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Load users error", err);
    }
}

async function toggleUserStatus(id, action) {
    try {
        const res = await fetch(`${API_BASE}/admin/users/${id}/${action}`, {
            method: "POST",
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Status change failed");
        loadUsers();
    } catch (err) {
        alert(err.message);
    }
}

// RESTAURANTS
async function createRestaurant() {
    const phone = document.getElementById("restPhone").value;
    const name = document.getElementById("restName").value;

    try {
        const res = await fetch(`${API_BASE}/admin/restaurants/create`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({ phone, restaurant_name: name })
        });
        const data = await res.json();

        const box = document.getElementById("restResult");
        box.style.display = "block";

        if (!res.ok) {
            box.style.borderColor = "#f00";
            box.style.backgroundColor = "rgba(255,0,0,0.1)";
            box.style.color = "#f00";
            box.innerText = "Error: " + data.message;
        } else {
            box.style.borderColor = "#0f0";
            box.style.backgroundColor = "rgba(0,255,0,0.1)";
            box.style.color = "#0f0";
            box.innerHTML = `
                <b>${data.message}</b><br><br>
                ID: ${data.restaurant.phone}<br>
                Temp Password: <span style="font-size:20px; color:#fff">${data.restaurant.temporary_password}</span>
            `;
            document.getElementById("restPhone").value = "";
            document.getElementById("restName").value = "";
            loadUsers();
        }
    } catch (err) {
        alert("Creation failed: " + err.message);
    }
}

// VERIFICATIONS
async function loadVerifications() {
    try {
        const response = await fetch(`${API_BASE}/admin/verifications?status=pending`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const tbody = document.querySelector("#verificationsTable tbody");
        tbody.innerHTML = "";

        data.verifications.forEach(v => {
            const host = API_BASE.replace("/api", "");
            const front = v.front_image_url.startsWith('http') ? v.front_image_url : host + v.front_image_url;
            const back = v.back_image_url.startsWith('http') ? v.back_image_url : host + v.back_image_url;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${v.id}</td>
                <td>${v.full_name} (${v.phone})</td>
                <td>
                    <img src="${front}" class="img-preview" onclick="window.open('${front}', '_blank')">
                    <img src="${back}" class="img-preview" onclick="window.open('${back}', '_blank')">
                </td>
                <td><span class="badge pending">${v.status.toUpperCase()}</span></td>
                <td>
                    <button class="success" onclick="reviewVerif(${v.id}, 'approve')">Approve</button>
                    <button class="danger" onclick="reviewVerif(${v.id}, 'reject')">Reject</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Load verifications error", err);
    }
}

async function reviewVerif(id, action) {
    let body = {};
    if (action === 'reject') {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        body.rejection_reason = reason;
    }

    try {
        const res = await fetch(`${API_BASE}/admin/verifications/${id}/${action}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Action failed");
        loadVerifications();
        loadDashboard();
    } catch (err) {
        alert(err.message);
    }
}

// AUDIT
async function loadAuditLogs() {
    try {
        const response = await fetch(`${API_BASE}/admin/audit?limit=25`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();

        const tbody = document.querySelector("#auditTable tbody");
        tbody.innerHTML = "";

        data.logs.forEach(log => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${log.id}</td>
                <td>${log.admin_name || "Admin"} (${log.admin_phone || ""})</td>
                <td><b style="color:#fe5000">${log.action}</b></td>
                <td><pre style="margin:0; font-size:11px; color:#aaa">${JSON.stringify(log.details)}</pre></td>
                <td>${new Date(log.created_at).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Load audit error", err);
    }
}
