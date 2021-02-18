// On initialise la latitude et la longitude de Toulon (centre de la carte), l'altitude et un temps par défaut
var lat = 43.1257311;
var lon = 5.9304919;
var alt = 100;
var time = 0;
var macarte = null;
// Fonction d'initialisation de la carte
function initMap() {
    // Créer l'objet "macarte" et l'insèrer dans l'élément HTML qui a l'ID "map"
    macarte = L.map('map').setView([lat, lon], 8);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer.
    L.tileLayer('http://192.168.4.1:8080/tile/{z}/{x}/{y}.png', {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        minZoom: 1
    }).addTo(macarte);
    // Nous ajoutons un marqueur
    var marker = L.marker([lat, lon]).addTo(macarte);
    var initLatLng = new L.LatLng(lat, lon);
		marker.setLatLng(initLatLng).bindPopup('Lat : '+lat+'<br />'+'Long : '+lon,  {
            closeButton: false,
            closeOnClick: false
        }).openPopup();
    //Ajouter un pin au click
	macarte.on('click', addMarker);
 
	function addMarker(e){
	  // Add marker to map at click location; add popup window
	  //var newMarker = new L.marker(e.latlng).addTo(macarte);
		var newLatLng = new L.LatLng(e.latlng.lat, e.latlng.lng);
		marker.setLatLng(newLatLng).bindPopup('Lat : '+e.latlng.lat+'<br />'+'Long : '+e.latlng.lng,  {
            closeButton: false,
            closeOnClick: false

        }).openPopup();
        //On écrit la longitude et la latitude dans nos variables globales
        lat = e.latlng.lat;
        lon = e.latlng.lng;
        //On appelle la fonction pour envoyer la requête POST
        sendData();
	}
}
window.onload = function () {
	  // Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
	  initMap();
	};

function sendData(){
    var XHR = new XMLHttpRequest();

    // Configuration de la requête
    XHR.open('POST', 'http://192.168.4.1:12913/?lat='+lat.toString()+',long='+lon.toString()+',alt='+alt.toString()+',time='+time.toString());

    // Ajout de l'en-tête HTTP requise pour requêtes POST de données de formulaire
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Envoie des données
    XHR.send();
}



