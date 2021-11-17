// On initialise la latitude et la longitude de Toulon (centre de la carte)
var lat = 43.1257311;
var lon = 5.9304919;
var macarte = null;
// Fonction d'initialisation de la carte
function initMap() {
    // Créer l'objet "macarte" et l'insèrer dans l'élément HTML qui a l'ID "map"
    macarte = L.map('map').setView([lat, lon], 8);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer.
    L.tileLayer('http://localhost:8080/tile/{z}/{x}/{y}.png', {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
        minZoom: 1
    }).addTo(macarte);
    // Nous ajoutons un marqueur
    var marker = L.marker([lat, lon]).addTo(macarte);
    // Fonction permettant l'actualisation de la position du pin

    function renewMarkers(){
        var newLatLng = new L.LatLng(latitude, longitude);
    	marker.setLatLng(newLatLng).bindPopup('Lat : '+latitude+'<br />'+'Long : '+longitude,  {
            closeButton: false,
            closeOnClick: false
        }).openPopup();
    }
    setInterval(renewMarkers, 2000);
}
var latitude = 0;
var longitude = 0;

function setValue($) {
  //
    // AJAX in the data file
    $.ajax({
      type: "GET",
      url: "location/gps.gpx",
      dataType: "xml",
    }).done(function (data) {
      $xml = $(data);
      latitude = $xml.find("trkpt").last().attr("lat");
      longitude = $xml.find("trkpt").last().attr("lon");
      console.log(latitude +" "+ longitude);
      setTimeout(setValue, 8000, $);
    }
    );
  }
  //);


jQuery(document).ready(function ($){
// Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
initMap();
setValue($);
});
