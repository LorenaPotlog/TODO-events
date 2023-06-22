/**
 * Sets a cookie with the given name, value, and expiration time.
 *
 * @param {string} nume - The name of the cookie.
 * @param {string} val - The value to be stored in the cookie.
 * @param {number} timpExpirare - The expiration time of the cookie in milliseconds.
 */
function setCookie(nume, val, timpExpirare) {
    d = new Date();
    d.setTime(d.getTime() + timpExpirare); //getTime returneaza milisecunde de la 1 ian 1970 + timp de expirare => un nou d
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}; path=/ `; //expires asteapta un format strict
}


/**
 * Retrieves the value of the cookie with the given name.
 *
 * @param {string} nume - The name of the cookie.
 * @returns {string|null} The value of the cookie, or null if the cookie doesn't exist.
 */
function getCookie(nume) {
    vectorParametri = document.cookie.split(";"); // separatorul dintre cookies este ; 
    for (let param of vectorParametri) {
        if (param.trim().startsWith(nume + "=")) // trim scata de eventualele spatii, = nu are voie se apara in numele cookie-urile
            return param.split("=")[1]; // 1 dupa egal, 0 inaine de egal
    }
    return null;
}

/**
 * Deletes the cookie with the given name.
 *
 * @param {string} nume - The name of the cookie to be deleted.
 */
function deleteCookie(nume) {
    console.log(`${nume}; expires=${new Date().toUTCString()}`);
    document.cookie = `${nume}=0; expires=${new Date().toUTCString()}`; //ii spunem sa expire acum
}

/**
 * Deletes all cookies.
 */
function deleteAllCookies() {
    vectorParametri = document.cookie.split(";");
    for (let param of vectorParametri) {
        deleteCookie(param.split("=")[0]);
    }
}

/**
 * Sets the "last_filters" cookie with the provided filters object.
 *
 * @param {object} filters - The filters object to be stored in the cookie.
 */
// function setLastFiltersCookie(filters) {
//     const jsonString = JSON.stringify(filters);
//     setCookie("last_filters", jsonString, 604800000); // Expires after 1 week
// }

/**
 * Resets the "last_filters" cookie.
 */
// function resetLastFiltersCookie() {
//     deleteCookie("last_filters");
// }

function addLastSeenProductCookie(){
    let currentLocation = window.location.href;

    let productURL = "http://localhost:8080/event/";
    if(currentLocation.startsWith(productURL)){
        let event = document.getElementsByClassName("denumire")[0];

        let currentLocationSplit = currentLocation.split("/");
        let pID = currentLocationSplit[currentLocationSplit.length - 1];
        setCookie("seenEventID", pID, 2629800000);
        setCookie("seenEventName", event.innerHTML, 2629800000);
    }
}

function displayLastSeenProductInUserStats(){
    let divLastSeenProd = document.getElementById("last-seen-product");
   
    if(divLastSeenProd){
        let showingProductData = document.createElement("p");
        showingProductData.innerHTML = "Last seen event: \"" + getCookie("seenEventName") + "\"";
        showingProductData.onclick = () => {
            window.location.href = "http://localhost:8080/event/" + getCookie("seenEventID");
        }
        showingProductData.style.cursor = "pointer";
        divLastSeenProd.appendChild(showingProductData);

    }
}

// Event listener for DOMContentLoaded event
window.addEventListener("DOMContentLoaded", function() {
    // if (getCookie("acceptat_banner")) {
    //     document.getElementById("banner").style.display = "none";
    // }

    if(getCookie("ok-cookies")){
        this.document.getElementById("banner").style.display = "none"; //daca cookie-ul deja exista atunci ascundem bannerul
        addLastSeenProductCookie();
        displayLastSeenProductInUserStats();
    }

    this.document.getElementById("ok_cookies").onclick = function() {
        setCookie("ok-cookies", true, 60000); // setam un cookie cu numele ok-cookie
        document.getElementById("banner").style.display = "none";
    }

    this.document.getElementById("delete-cookies").onclick = function() {
        deleteAllCookies();
    }

    if (getCookie("ok-cookies")) {
        if (getCookie("accordion")) {
            document.getElementById("collapse").classList.add('show');
        }

        this.document.getElementById("accordionSection").onclick = function() {
            if (getCookie("accordion")) {
                deleteCookie("accordion");
            } else {
                setCookie("accordion", true, 100000);
            }

        }

    }
    
});