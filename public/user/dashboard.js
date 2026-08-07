checkLogin();

async function initializeDashboard() {

    //Load shared components
    await loadComponent("sidebar","../components/user-sidebar.html");
    await loadComponent("navbar","../components/navbar.html");
    initializeSidebar()
    initializeNavbar();

    //Display user information
    const welcomeName = document.getElementById("welcomeName");
    if (welcomeName) {
        welcomeName.textContent = user.name;
    }

//Load incident summary
await loadIncidentSummary();
}

async function loadIncidentSummary() {
    try {
        const response = await fetch("/incidents", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.log(data.message);
            return;
        }

        const incidents = data.incidents || [];
        const total = incidents.length;
        const open = incidents.filter(incident => incident.status.toLowerCase() === "open").length;
        const inProgress = incidents.filter(incident => incident.status.toLowerCase() === "in progress").length;
        const resolved = incidents.filter(incident => incident.status.toLowerCase() === "resolved").length;

        document.getElementById("totalIncidents").textContent = total;
        document.getElementById("openIncidents").textContent = open;
        document.getElementById("inProgressIncidents").textContent = inProgress;
        document.getElementById("resolvedIncidents").textContent = resolved;
    } catch (error) {
        console.error("Failed to load incident summary", error);
    }
}
initializeDashboard();