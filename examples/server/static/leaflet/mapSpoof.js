/*eslint-env es6*/

// On initialise la latitude et la longitude de Toulon (centre de la carte)
var lat = 43.29539798528049;
var lon = 5.374672132925111;
var alt = 10;
var time = 0;
var macarte = null;
const speed_tab = [2.8, 2.3, 1.8, 1.3, 1.1, 0.5, 0.2];
const emoji_tab = ['🐌', '🚶', '🏃‍♂️', '🚲', '🚗', '🛩', '🚀'];
var speed_indice = 2;
var slow_down = 0;
var speed_up = 0;

// Fonction qui adapte la taille de la map sute à un changement de taille de fenêtre ou de sidebar
function windowSizeChanged() {
	var largeurFenetre = window.innerWidth;
	var hauteurFenetre = window.innerHeight;
	var hauteur=document.getElementById("navbar").offsetHeight; 
	var gauche=document.getElementById("sidebar").offsetWidth;
	var marginGauche=document.getElementById("sidebar").offsetLeft;
	var widthMap=largeurFenetre - gauche;
	var heightMap=hauteurFenetre - hauteur;
	navbar.style.cssText = "position:fixed;width: 100%;";
	if(marginGauche >= 0)
	map.style.cssText = "position:fixed;margin-left:"+gauche+"px;margin-top:"+hauteur+"px;margin-right:0px;margin-bottom:0px;width: "+widthMap+"px;height: "+heightMap+"px";
	else
	map.style.cssText = "position:fixed;margin-left:0px;margin-top:"+hauteur+"px;margin-right:0px;margin-bottom:0px;width: "+largeurFenetre+"px;height: "+heightMap+"px";
	//setTimeout(windowSizeChanged,1);
}
// Détecte le changement de taille de fenêtre
window.addEventListener('resize', windowSizeChanged);

// Décecte le click sur le bouton "burger" et demande un re-calcul de la taille de la map après que la sidebar ait changé d'état
var reply_click = function()
{
	map.style.cssText = "position:fixed;margin-left:0px;margin-top:0px;margin-right:0px;margin-bottom:0px;width: "+window.innerWidth+"px;height: "+window.innerHeight+"px";
	setTimeout(windowSizeChanged, 300);
}
document.getElementById('nav-item').onclick = reply_click;


// Fonction qui surveille les click sur les liens
[...document.getElementsByTagName("a")].forEach(function(item) {
	// adding eventListener to the elements
	item.addEventListener('click', function() {
	  // calling the methods
	  // this.id will be the id of the clicked button
	  // there is a method in the object by same name, which will be trigger
	  if(obj[this.id])
	  obj[this.id]();
  
	})
  })

  function httpGet(theUrl)
  {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.status;
  }
  
  function resetClasses() {
	document.getElementById('real-time').removeAttribute("class");
	document.getElementById('trajectory').removeAttribute("class");
	document.getElementById('heading').removeAttribute("class");
	document.getElementById('time-shift').removeAttribute("class");
	document.getElementById('road-match').removeAttribute("class");
	document.getElementById('real-time').classList.add("nav-link");
	document.getElementById('trajectory').classList.add("nav-link");
	document.getElementById('heading').classList.add("nav-link");
	document.getElementById('time-shift').classList.add("nav-link");
	document.getElementById('road-match').classList.add("nav-link");
  }

  function setActive(id) {
	document.getElementById(id).classList.remove("waiting");
	document.getElementById(id).classList.add("active");
  }

  function setInactive(id) {
	document.getElementById(id).classList.remove("waiting");
	document.getElementById(id).classList.add("inactive");
  }

  var obj = {
	'real-time': function() {
		resetClasses();
	  document.getElementById('real-time').classList.add("waiting");
	  setTimeout("setActive('real-time')", 1000);
	  console.log(httpGet('http://test/real-time/'));
	  console.log('Real Time');
	},
	'trajectory': function() {
		resetClasses();
	  document.getElementById('trajectory').classList.add("waiting");
	  setTimeout("setActive('trajectory')", 1000);
	  console.log(httpGet('http://test/trajectory/'));
	  console.log('Trajectory Smoothing');
	},
	'heading': function() {
		resetClasses();
	  document.getElementById('heading').classList.add("waiting");
	  setTimeout("setActive('trajectory')", 1000);
	  console.log(httpGet('http://test/heading/'));
	  console.log('Heading Shift');
	},
	'time-shift': function() {
		resetClasses();
	  document.getElementById('time-shift').classList.add("waiting");
	  setTimeout("setActive('trajectory')", 1000);
	  console.log(httpGet('http://test/time-shift/'));
	  console.log('Time Shift');
	},
	'road-match': function() {
		resetClasses();
	  document.getElementById('road-match').classList.add("waiting");
	  setTimeout("setActive('trajectory')", 1000);
	  console.log(httpGet('http://test/road-match/'));
	  console.log('Road Matching');
	}
  }

// Gestion du click sur le bouton SHUTDOWN
/*var shutdown = document.getElementById('shutdown');

shutdown.style.cursor = 'pointer';
shutdown.onclick = function() {
	clickable = 0;
    console.log('Click on shutdown');
	setTimeout('clickable = 1;', 100);
	sendStop();
};*/

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
	logoNavbar.style.cssText = "margin-right: 70px;margin-left: 70px;";
	initMap();
	windowSizeChanged();
	};

function sendData(){
    var XHR = new XMLHttpRequest();

    // Configuration de la requête
    // XHR.open('POST', 'http://192.168.4.2:12913/?lat='+lat.toString()+',long='+lon.toString()+',alt='+alt.toString()+',time='+time.toString(), true);
    XHR.open('POST', 'http://localhost:12913/?lat='+lat.toString()+',long='+lon.toString()+',alt='+alt.toString()+',time='+time.toString(), true);

    // Ajout de l'en-tête HTTP requise pour requêtes POST de données de formulaire
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Envoie des données
    XHR.send();
}

function sendStop(){
    var XHR = new XMLHttpRequest();

    // Configuration de la requête
    XHR.open('POST', 'http://localhost:12913/?stop', true);

    // Ajout de l'en-tête HTTP requise pour requêtes POST de données de formulaire
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // Envoie des données
    XHR.send();
}
