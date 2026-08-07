checkLogin();
if(!checkRole("admin")) {
    window.location.href = "/user/dashboard.html";
}
async function initializeIncidents(){
    //Load shared components
    await loadComponent("sidebar","../components/admin-sidebar.html");
    await loadComponent("navbar","../components/navbar.html");
    initializeSidebar()
    initializeNavbar();

    //Load incident dashboard
    await loadIncidents();
}

async function loadIncidents(){
    try {
        const response = await fetch("/admin/incidents", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        if(!response.ok){
            console.error("Failed to load incidents", data);
            return;
        }
        console.log("Admin incidents:", data);

        const incidentTableBody = document.getElementById("incidentTableBody");
        incidentTableBody.innerHTML = "";
        data.incidents.forEach(incident => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${incident.id}</td>
            <td>${user.name}</td>
            <td>${incident.title}</td>
            <td>${incident.description}</td>
            <td class="status-cell">
            <select class="status-dropdown" id="status-${incident.id}">
            <option value="Open" ${incident.status === "Open" ? "selected" : ""}>Open</option>
            <option value="In Progress" ${incident.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Resolved" ${incident.status === "Resolved" ? "selected" : ""}>Resolved</option>
            </select></td>
            <td>${new Date(incident.created_at).toLocaleString()}</td>
            <td class="status-cell"><button class="saveButton" onClick="updateIncident(${incident.id})">Save</button>
            </td>
            `;
            incidentTableBody.appendChild(row);
        });
    }catch(error){
        console.error("Error loading incidents", error);
    }
}

async function updateIncident(id){
    const status = document.getElementById(`status-${id}`).value;
    try {
        const response = await fetch(`/admin/incidents/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                status: status
            })
        }
        );
        const data = await response.json();
        if(!response.ok){
            alert(data.message);
            return;
        }
        alert("Incident updated successfuly");
        //Reload incidents
        await loadIncidents();
    }catch(error){
        console.error("Update incident failed", error);
    }
}
initializeIncidents();