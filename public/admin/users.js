checkLogin();
if(!checkRole("admin")) {
    window.location.href = "/user/dashboard.html";
}

async function initializeUsers() {
    //Load shared components
    await loadComponent("sidebar","../components/admin-sidebar.html");
    await loadComponent("navbar","../components/navbar.html");
    initializeSidebar()
    initializeNavbar();

    //Load users
    await loadUsers();
}

async function loadUsers() {
    try {
        const response = await fetch("/users");

        const data = await response.json();

        if(!response.ok) {
            console.error("Failed to load users:", data);
            return;
        }
        const userTableBody = document.getElementById("userTableBody");
        userTableBody.innerHTML ="";
        data.users.forEach(userData => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${userData.id}</td>
            <td>${userData.name}</td>
            <td>${userData.email}</td>
            <td>${userData.role}</td>
            <td class="status-cell"><button class="saveButton" onclick="viewUser(${userData.id})">Views</button></td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users', error)
    }
}

function viewUser(id) {
    console.log("View user:", id);
    alert(`User ID: ${id}`);
}
initializeUsers();