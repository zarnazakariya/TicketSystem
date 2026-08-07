checkLogin();

async function initializeIncidentsPage() {
    //Load shared components
    await loadComponent("sidebar","../components/user-sidebar.html");
    await loadComponent("navbar","../components/navbar.html");
    initializeSidebar()
    initializeNavbar();

    //Load existing incidents
    loadIncidents();

    //Creaate incident
    const incidentForm = document.getElementById("incidentForm");
    if(incidentForm) {
        incidentForm.addEventListener("submit", createIncident);
    }
}

async function loadIncidents() {
    try {
        const response = await fetch("/incidents", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok){
            console.log(data.message);
            return;
        }
        const incidentTableBody = document.getElementById("incidentTableBody");
        incidentTableBody.innerHTML = "";
        data.incidents.forEach((incident) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${incident.id}</td>
            <td>${incident.description}</td>
            <td>${incident.status}</td>
            <td>${new Date(incident.created_at).toLocaleString()}</td>
            `;

            incidentTableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Failed to load incidents:", error);
    }
};

async function createIncident(event) {
    event.preventDefaul();

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;

    try {
        const response = await fetch("/incidents", {
            method:"POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description
            })
        });
        const data = response.json();
        if(!response.ok){
            alert(data.message);
            return;
        }
        alert("Incident created successfully");
        document.getElementById("incidentForm").reset();

        //Refresh incident list
        loadIncidents();
    } catch(error) {
        console.error("Create incident error", error);
    }
}
initializeIncidentsPage();