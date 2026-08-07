checkLogin();

async function initializeProfile(){
    //Load shared components
    const sidebar = user.role === "admin"
    ? "../components/admin-sidebar.html"
    : "../components/user-sidebar.html";
    await loadComponent("sidebar", sidebar);
    await loadComponent("navbar","../components/navbar.html");
    initializeSidebar()
    initializeNavbar();

    //Display profile information
    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;
    document.getElementById("profileRole").textContent = user.role;
}
initializeProfile();