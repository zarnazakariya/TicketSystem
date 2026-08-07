async function loadComponent(elementId, componentPath) {
    const element = document.getElementById(elementId);
    if (!element) {
        return;
    }

    try {
        const response = await fetch(componentPath);

        if (!response.ok) {
            throw new Error(`Failed to load components: ${componentPath}`);
        }

        const html = await response.text();
        element.innerHTML = html;
    } catch (error) {
        console.error("Component loading error:", error);
    }
}

function initializeSidebar() {

    const currentPage =
        window.location.pathname;

    const sidebarLinks =
        document.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach(link => {

        const linkPath =
            new URL(link.href).pathname;

        if (linkPath === currentPage) {
            link.classList.add("active");
        }

    });
}

function initializeNavbar() {
    const user = JSON.parse(localStorage.getItem("user"));
    if(!user){
        return;
    }

    //Display username
    const userName = document.getElementById("userName");
    if (userName) {
        userName.textContent = user.name;
    }

    //Handle logout
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }
}