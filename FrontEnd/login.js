function authentification() {
    // Récupérer les valeurs de l'email et du mot de passe à partir du formulaire
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Appel de l'API avec POST et les données rentrées par l'utilisateur
    fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Accept": "application/json", 
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password,
        })
    })
    .then((response) => {
        if (!response.ok) {
            alert ("Les identifiants sont incorrects. Veuillez vérifier l'adresse e-mail ou le mot de passe");
            throw new Error(`Erreur d'authentification: ${response.statusText}`); // Si le code de statut n'est pas OK (200-299);
        }
        return response.json();
    })
    .then((data) => {
        console.log(data)
        if (data && data.token) {
            localStorage.setItem("token", data.token); // Stockage du token de connexion
            window.location.href = "index.html";   
        } else {
            // Vous pouvez ajouter un message d'erreur ici pour informer l'utilisateur.
            localStorage.removeItem("token");
            window.location.href = "login.html";
        }
    })
    .catch((error) => {
        console.log(error);
        localStorage.removeItem("token");
        window.location.href = "login.html"; 
    })
}

const loginForm = document.getElementById("loginForm"); // Sélection du formulaire
loginForm.addEventListener("submit", (e) => {  
    e.preventDefault();                                 // la fonction d'authentification
    authentification();
});


    
