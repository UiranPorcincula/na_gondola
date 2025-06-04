var promotor = document.getElementById("promotor")
var greeting = document.getElementById("greeting");
var username = document.getElementById("username");

var date = new Date();
var hour = date.getHours();

if (hour < 12) {
    greeting.textContent = "Bom dia";
} else if (hour < 18) {
    greeting.textContent = "Boa tarde";
} else {
    greeting.textContent = "Boa noite";
}
var usernameText = document.currentScript.getAttribute("data-username");
username.textContent = usernameText[0].toUpperCase() + usernameText.slice(1);
promotor.value=usernameText
console.log("TESTE", document.currentScript)

document.addEventListener("DOMContentLoaded", function() {
    const itemsToHide = ["Home", "Lojas", "Promotores", "Roteiros", "Contatos", "PDV Estoque", "Ver PDV"];
    
    document.querySelectorAll('.navbar-nav .nav-item').forEach(item => {
        if (itemsToHide.includes(item.textContent.trim())) {
            item.style.display = 'none';
        }
    });
});