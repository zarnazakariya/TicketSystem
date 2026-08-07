checkLogin();
if(!checkRole("admin")) {
    window.location.href = "/user/dashboard.html";
}

async function initializeDashboard(){
    //Load shared components
    await loadComponent("sidebar","../components/admin-sidebar.html");
    await loadComponent("navbar","../components/navbar.html");
    initializeSidebar()
    initializeNavbar();
    
    //Displayy admin information
    const welcomeName = document.getElementById("welcomeName");

    if (welcomeName) {
        welcomeName.textContent = user.name;
    }

    //Load incident dashboard
    await loadIncidentDashboard();
}

async function loadIncidentDashboard() {
    try {
        const response = await fetch("/admin/incidents", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
        );

        const data = await response.json();
        console.log("data admin dashboard", data);
        if (!response.ok){
            console.error("Status", response.status);
            console.error("Response", data);
            console.error("Failed to load incidents", data.message);
            return;
        }

        const incidents = data.incidents || [];
        console.log("Dashboard incidents:", incidents);
        
        //Calculate statistics
        const total = incidents.length;
        const open = incidents.filter(incidents => incidents.status.toLowerCase() === "open").length;
        const inProgress = incidents.filter(incidents => incidents.status.toLowerCase() === "in progress").length;
        const resolved = incidents.filter(incidents => incidents.status.toLowerCase() === "resolved").length;

        //Display statistics
        document.getElementById("totalIncidents").textContent = total;
        document.getElementById("openIncidents").textContent = open;
        document.getElementById("inProgressIncidents").textContent = inProgress;
        document.getElementById("resolvedIncidents").textContent = resolved;

        //Display recent incidents
        displayRecentIncidents(incidents);

        //Create chart
        createIncidentChart(
            open, inProgress, resolved
        );
    } catch(error) {
        console.error("Error loading admin dashboard", error);
    }
}

function displayRecentIncidents(incident){
    const incidentTableBody = document.getElementById("incidentTableBody");

    if (!incidentTableBody) {
        return;
    }
    incidentTableBody.innerHTML = "";

    //Show latest 5 incidents
    const recentIncidents = incident.slice(0, 5);
    recentIncidents.forEach(incident => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${incident.id}</td>
        <td>${incident.title}</td>
        <td>${incident.user_name}</td>
        <td>${incident.status}</td>
        <td>${new Date(incident.created_at).toLocaleString()}</td>
        `;
        incidentTableBody.appendChild(row);
    });
}

function createIncidentChart(open,inProgress,resolved) {
    const canvas = document.getElementById("incidentChart");
    if (!canvas) {
        return;
    }

    new Chart(canvas, {
        type: "pie",
        data: {
            labels: ["Open","In Progress", "Resolved"],
            datasets: [
                {
                    data: [open, inProgress, resolved]
                }
            ]
        },
        option: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}
initializeDashboard();
