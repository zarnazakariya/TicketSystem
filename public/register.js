const registerForm = document.getElementById("registerForm");
const errorMessage = document.getElementById("errorMessage");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    console.log("Registration");

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    errorMessage.textContent = "";

    //Check password match or not
    if (password !== confirmPassword) {
        errorMessage.textContent = "Password do not match";
        return;
    }
    try {
        console.log("Sending request ...");
        const response = await fetch("./register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });
        console.log("Res:", response);
        const data = await response.json();

        console.log("Data:", data);
        if (!response.ok) {
            errorMessage.textContent = data.message;
            return;
        }
        alert("Registration successful!");
        window.location.href = "login.html";
    } catch (error) {
        console.log("Error:", error);
        errorMessage.textContent = "Unable to connect to server";
    }
});