/*eslint-env es6*/

// On initialise la latitude et la longitude de Toulon (centre de la carte)
var lat = 43.1257311;
var lon = 5.9304919;
var alt = 100;
var time = 0;
var macarte = null;
const speed_tab = [2.8, 2.3, 1.8, 1.3, 1.1, 0.5, 0.2];
const emoji_tab = ['🐌', '🚶', '🏃‍♂️', '🚲', '🚗', '🛩', '🚀'];
var speed_indice = 2;
var slow_down = 0;
var speed_up = 0;

// Gestion du click sur le bouton SHUTDOWN
var shutdown = document.getElementById('shutdown');

shutdown.style.cursor = 'pointer';
shutdown.onclick = function() {
	clickable = 0;
    console.log('Click on shutdown');
	setTimeout('clickable = 1;', 100);
	sendStop();
};

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
	
	setInterval(getGamepadMove, 100);
	setInterval(getGamepadButtons, 50);
	
	function updateMarkerPosition(latitude, longitude){
		var newLatLng = new L.LatLng(latitude, longitude);
		marker.setLatLng(newLatLng).bindPopup('Lat : '+latitude+'<br />'+'Long : '+longitude,  {
            closeButton: false,
            closeOnClick: false
        }).openPopup();
	sendData();
	}
	
	function updateMapPosition(latitude, longitude){
		var newLatLng = new L.LatLng(latitude, longitude);
		macarte.panTo(newLatLng);
		macarte.setView(newLatLng, macarte.getZoom());
	}
 
	function addMarker(e){
		// Move the marker at click location; add popup window
		updateMarkerPosition(e.latlng.lat, e.latlng.lng);
		//On appelle la fonction pour envoyer la requête POST
		lat = e.latlng.lat;
		lon = e.latlng.lng;
        sendData();

	}
	
	function roundDecimal(nombre, precision){
		if(precision == null)
			precision = 2;
		var tmp = Math.pow(10, precision);
		return Math.round( nombre*tmp )/tmp;
	}
	
	function isPressed({button: {pressed}}) {
        return !!pressed;
    }
	
	function getGamepadMove() {
		// Coef of speed. (Ex : 2)
        //const speed = 1.8;
		
        // Returns up to 4 gamepads.
        const gamepads = navigator.getGamepads();

        // We take the first one, for simplicity
        const gamepad = gamepads[0];
		
		var updateMarker = 0;
		var updateMap = 0;

        // Escape if no gamepad was found
        if (!gamepad) {
            //console.log('No gamepad found.');
            return;
        }
		
		/* GESTION DU DEPLACEMENT MARKER */
		
		//Axe X pour la longitude
		if(gamepad.axes[0] < -0.1 || gamepad.axes[0] > 0.1){
			var newMarkerLongitude = marker.getLatLng().lng + gamepad.axes[0] / Math.pow(speed_tab[speed_indice], macarte.getZoom());
			newMarkerLongitude = roundDecimal(newMarkerLongitude, 15);
			lon = newMarkerLongitude;
			if(newMarkerLongitude > 180)
				newMarkerLongitude = -180;
			if(newMarkerLongitude < -180)
				newMarkerLongitude = 180;
			updateMarker = 1;
		} else {
			var newMarkerLongitude = marker.getLatLng().lng;
			lon = newMarkerLongitude;
		}
		
		//Axe Y pour la latitude
		if(gamepad.axes[1] < -0.1 || gamepad.axes[1] > 0.1){
			var newMarkerLatitude = marker.getLatLng().lat + (gamepad.axes[1]*-1) / Math.pow(speed_tab[speed_indice], macarte.getZoom());
			newMarkerLatitude = roundDecimal(newMarkerLatitude, 15);
			lat = newMarkerLatitude;
			if(newMarkerLatitude > 85)
				newMarkerLatitude = -85;
			if(newMarkerLatitude < -85)
				newMarkerLatitude = 85;
			updateMarker = 1;
		} else {
			var newMarkerLatitude = marker.getLatLng().lat;
			lat = newMarkerLatitude;
		}
		
		if(updateMarker == 1)
			updateMarkerPosition(newMarkerLatitude, newMarkerLongitude);
		
		/* GESTION DU DEPLACEMENT MAP */
		
		//Axe X pour la longitude
		if(gamepad.axes[2] < -0.1 || gamepad.axes[2] > 0.1){
			var newMapLongitude = macarte.getCenter().lng + gamepad.axes[2] / Math.pow(1.3, macarte.getZoom());
			newMapLongitude = roundDecimal(newMapLongitude, 3);
			if(newMapLongitude > 180)
				newMapLongitude = -180;
			if(newMapLongitude < -180)
				newMapLongitude = 180;
			updateMap = 1;
		} else {
			var newMapLongitude = macarte.getCenter().lng;
		}
		
		//Axe Y pour la latitude
		if(gamepad.axes[3] < -0.1 || gamepad.axes[3] > 0.1){
			var newMapLatitude = macarte.getCenter().lat + (gamepad.axes[3]*-1) / Math.pow(1.3, macarte.getZoom());
			newMapLatitude = roundDecimal(newMapLatitude, 3);
			if(newMapLatitude > 85)
				newMapLatitude = -85;
			if(newMapLatitude < -85)
				newMapLatitude = 85;
			updateMap = 1;
		} else {
			var newMapLatitude = macarte.getCenter().lat;
		}
		
		if(updateMap == 1)
			macarte.panTo(new L.LatLng(newMapLatitude, newMapLongitude));
			//updateMapPosition(newMapLatitude, newMapLongitude);
    }
	
	function getGamepadButtons() {
        // Returns up to 4 gamepads.
        const gamepads = navigator.getGamepads();

        // We take the first one, for simplicity
        const gamepad = gamepads[0];

        // Escape if no gamepad was found
        if (!gamepad) {
            //console.log('No gamepad found.');
            return;
        }
		
		/* GESTION DU ZOOM */
		
		// Filter out only the buttons which are pressed
        const pressedButtons = gamepad.buttons.map((button, id) => ({id, button})).filter(isPressed);
		
		for (const button of gamepad.buttons.map((button, id) => ({id, button}))) {
			if(button.id == 4 && button.button.pressed == false && slow_down == 1){
				speed_indice--;
				slow_down = 0;
				document.getElementById('speed').style.visibility='visible';
				document.getElementById("speed").innerHTML = emoji_tab[speed_indice];
				setTimeout("document.getElementById('speed').style.visibility='hidden';",1000);
			}
			if(button.id == 5 && button.button.pressed == false && speed_up == 1){
				speed_indice++;
				speed_up = 0;
				document.getElementById('speed').style.visibility='visible';
				document.getElementById("speed").innerHTML = emoji_tab[speed_indice];
				setTimeout("document.getElementById('speed').style.visibility='hidden';",1000);
			}
		}

        // Print the pressed buttons to our HTML
        for (const button of pressedButtons) {
			switch (button.id) {
				case 0 :
					updateMarkerPosition(macarte.getCenter().lat, macarte.getCenter().lng);
					break;
				case 1 :
					macarte.flyTo(marker.getLatLng(), 12, {duration : 0.04});
					break;
				case 2 :
					macarte.fitWorld();
					break;
				case 3 :
					macarte.remove();
					initMap();
					break;
				case 4 :
					if(speed_indice > 0 && slow_down == 0){
						slow_down = 1;
					}
					break;
				case 5 :
					if(speed_indice < speed_tab.length-1 && speed_up == 0) {
						speed_up = 1;
					}
					break;
				case 6 :
					macarte.zoomOut();
					break;
				case 7:
					macarte.zoomIn();
					break;
			}
        }
    }
}
window.onload = function () {
	// Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
	initMap();
	};
	
function sendData(){
    var XHR = new XMLHttpRequest();

    // Configuration de la requête
    // XHR.open('POST', 'http://192.168.4.2:12913/?lat='+lat.toString()+',long='+lon.toString()+',alt='+alt.toString()+',time='+time.toString(), true);
    XHR.open('POST', 'http://192.168.4.1:12913/?lat='+lat.toString()+',long='+lon.toString()+',alt='+alt.toString()+',time='+time.toString(), true);

    // Ajout de l'en-tête HTTP requise pour requêtes POST de données de formulaire
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Envoie des données
    XHR.send();
}

function sendStop(){
    var XHR = new XMLHttpRequest();

    // Configuration de la requête
    XHR.open('POST', 'http://192.168.4.1:12913/?stop', true);

    // Ajout de l'en-tête HTTP requise pour requêtes POST de données de formulaire
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Envoie des données
    XHR.send();
}
