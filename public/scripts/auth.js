//Check login
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

//Check login creadentials
function checkLogin() {
    if (!user || !token) {
    window.location.href = "./login.html";
    return false;
    }   
    return true;
}

//Logout
function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login.html";
}

//Check role
function checkRole(role) {
    if (!user || user.role !== role) {
        return false;
    }

    return true;
}