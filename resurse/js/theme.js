//Trebuie studiat!!
let theme = localStorage.getItem("theme");

if(theme)
    document.body.classList.add("dark");
window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("theme").onclick = function() {
        if(document.body.classList.contains("dark")) {
            document.body.classList.remove("dark");
            localStorage.removeItem("theme");
        }
        else {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
        }
    }
});