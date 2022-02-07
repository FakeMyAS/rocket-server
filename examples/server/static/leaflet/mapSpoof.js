/*eslint-env es6*/

// On initialise la latitude et la longitude de Marseille (centre de la carte)
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
var startRouting = 0;
var eventGamePad = {
	latlng: {lat: 0, lng:0}
}
var trajectoryComplete = 0;
let trajectory_tab = [];
let trajectory_mark = [];


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
	if(marginGauche >= 0) {
		//Gestion bouton send
		if(document.getElementById("sidebar").offsetWidth > 79){
			document.getElementById("sendTrajectory").innerHTML = '<i class="nav-icon fas fa-upload"></i> Send';
			document.getElementById("sendTrajectory").style.cssText = "width:280px;bottom:0;left:10px;position:fixed;margin-bottom:10px";
		} else {
			document.getElementById("sendTrajectory").innerHTML = '<i class="nav-icon fas fa-upload"></i>';
			document.getElementById("sendTrajectory").style.cssText = "width:54px;bottom:0;left:10px;position:fixed;margin-bottom:10px";
		}
		//Gestion map
		map.style.cssText = "position:fixed;margin-left:"+gauche+"px;margin-top:"+hauteur+"px;margin-right:0px;margin-bottom:0px;width: "+widthMap+"px;height: "+heightMap+"px";
	} else {
		document.getElementById("sendTrajectory").innerHTML = '<i class="nav-icon fas fa-upload"></i>';
		document.getElementById("sendTrajectory").style.cssText = "width:54px;bottom:0;left:10px;position:fixed;margin-bottom:10px";
		map.style.cssText = "position:fixed;margin-left:0px;margin-top:"+hauteur+"px;margin-right:0px;margin-bottom:0px;width: "+largeurFenetre+"px;height: "+heightMap+"px";
	}
	//Affichage du bouton send
	document.getElementById("sendTrajectory").style.removeProperty('display');
}
// Détecte le changement de taille de fenêtre
window.addEventListener('resize', windowSizeChanged);

// Décecte le click sur le bouton "burger" et demande un re-calcul de la taille de la map après que la sidebar ait changé d'état
var reply_click = function()
{
	map.style.cssText = "position:fixed;margin-left:0px;margin-top:0px;margin-right:0px;margin-bottom:0px;width: "+window.innerWidth+"px;height: "+window.innerHeight+"px";
	//On cache le bouton send pendant la transition
	document.getElementById("sendTrajectory").style.display = "none";
	setTimeout(windowSizeChanged, 350);
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
    xmlHttp.open( "GET", theUrl, true ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.status;
  }
  
  function resetClasses() {
	document.getElementById('real-time').classList.remove("active");
	document.getElementById('trajectory').classList.remove("active");
	document.getElementById('heading').classList.remove("active");
	document.getElementById('time-shift').classList.remove("active");
	document.getElementById('road-match').classList.remove("active");
	if(trajectory_mark.length != 0) {
		resetMarkerTrajectory();
	}
	document.getElementById("trajectoryValidation").hidden = true;
	startRouting = 0;
  }

  function getStatus(){
	  return {
		'statusRT' : document.getElementById('real-time').classList.contains("active"),
		'statusT' : document.getElementById('trajectory').classList.contains("active"),
		'statusH' : document.getElementById('heading').classList.contains("active"),
		'statusTS' : document.getElementById('time-shift').classList.contains("active"),
		'statusRM' : document.getElementById('road-match').classList.contains("active")
	  }
  }

  var obj = {
	'real-time': function() {
		var status = getStatus();
	if (status.statusRT && !status.statusT && !status.statusH && !status.statusRM && !status.statusTS){
		resetClasses();
		console.log(httpGet('http://localhost:12913/?stop'))
	} else {
		if (!status.statusT && !status.statusRT && (status.statusH || status.statusRM || status.statusTS)){
			resetClasses();
			console.log(httpGet('http://localhost:12913/?stop'))
		} else if(status.statusT && !status.statusRT && !status.statusH && !status.statusRM && !status.statusTS){
			resetClasses();
			console.log(httpGet('http://localhost:10000/?stop'))
		}
	  document.getElementById('real-time').classList.add("active");
	  console.log(httpGet('http://localhost:10000/realTime'));
	  macarte.remove();
	  initMap();
	  console.log('Real Time');
	}
	},
	'trajectory': function() {
		var status = getStatus();
		if (status.statusT && !status.statusRT && !status.statusH && !status.statusRM && !status.statusTS){
			resetClasses();
			console.log(httpGet('http://localhost:12913/?stop'))
		} else {
			if (!status.statusT && (status.statusRT || status.statusH || status.statusRM || status.statusTS)){
				resetClasses();
				console.log(httpGet('http://localhost:12913/?stop'))
			}
		document.getElementById('trajectory').classList.add("active");
	  	console.log(httpGet('http://localhost:10000/trajectorySmoothing'));
		macarte.remove();
		initMap();
	  	console.log('Trajectory Smoothing');
	}
	  
	},
	'heading': function() {
		var status = getStatus();
		if (status.statusH && !status.statusT && !status.statusRT && !status.statusRM && !status.statusTS){
			resetClasses();
			console.log(httpGet('http://localhost:12913/?stop'))
		} else {
			if (!status.statusT && !status.statusH && (status.statusRT || status.statusRM || status.statusTS)){
				resetClasses();
				console.log(httpGet('http://localhost:12913/?stop'))
			} else if(status.statusT && !status.statusRT && !status.statusH && !status.statusRM && !status.statusTS){
				resetClasses();
				console.log(httpGet('http://localhost:10000/?stop'))
			}
	  document.getElementById('heading').classList.add("active");
	  console.log(httpGet('http://localhost:10000/headingShift'));
	  console.log('Heading Shift');
		}
	},
	'time-shift': function() {
		var status = getStatus();
		if (status.statusTS && !status.statusT && !status.statusRT && !status.statusRM && !status.statusH){
			resetClasses();
			console.log(httpGet('http://localhost:12913/?stop'))
		} else {
			if (!status.statusT && !status.statusTS && (status.statusH || status.statusRM || status.statusRT)){
				resetClasses();
				console.log(httpGet('http://localhost:12913/?stop'))
			} else if(status.statusT && !status.statusRT && !status.statusH && !status.statusRM && !status.statusTS){
				resetClasses();
				console.log(httpGet('http://localhost:10000/?stop'))
			}
	  document.getElementById('time-shift').classList.add("active");
	  console.log(httpGet('http://localhost:10000/timeShift'));
	  console.log('Time Shift');
		}
	},
	'road-match': function() {
		var status = getStatus();
		if (status.statusRM && !status.statusT && !status.statusRT && !status.statusH && !status.statusTS){
			resetClasses();
			console.log(httpGet('http://localhost:12913/?stop'))
		} else {
			if (!status.statusT && !status.statusRM && (status.statusH || status.statusRT || status.statusTS)){
				resetClasses();
				console.log(httpGet('http://localhost:12913/?stop'))
			} else if(status.statusT && !status.statusRT && !status.statusH && !status.statusRM && !status.statusTS){
				resetClasses();
				console.log(httpGet('http://localhost:10000/?stop'))
			}
	  document.getElementById('road-match').classList.add("active");
	  console.log(httpGet('http://localhost:10000/roadMatching'));
	  macarte.remove();
	  initMap();
	  console.log('Road Matching');
		}
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
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'your.mapbox.access.token'
	}).addTo(macarte);

    // Nous ajoutons un marqueur
    var marker = L.marker([lat, lon], {clickable:true}).addTo(macarte);
	// The marker is stored in the global tab
	markerList.push(marker);

    var initLatLng = new L.LatLng(lat, lon);
		marker.setLatLng(initLatLng).bindPopup('Lat : '+lat+'<br />'+'Long : '+lon,  {
            closeButton: false,
            closeOnClick: false
        }).openPopup();
    // Add pin on click
	macarte.on('click', addMarker);

	setInterval(getGamepadMove, 100);
	setInterval(getGamepadButtons, 50);

	L.Routing.control({
		waypoints: [
			L.LatLng(lat, lon),
			L.LatLng(lat, lon)
		],
		router: L.Routing.mapbox('pk.eyJ1IjoiZGVscGlnIiwiYSI6ImNrdzNkZ3FiNzI0b2oydnFpZjA2bzJjcm8ifQ.u76NrQAgU21c8y6wc7M4ww')
		}).addTo(macarte);

	var control = L.Routing.control({
		waypoints: [
		],
		routeWhileDragging: true,
		waypointMode: 'snap'
	}).addTo(macarte);
	//control._container.style.display = "None";

	control.on('routeselected', function(e) {
		// Retrieve new coordinates
		end = e.route.coordinates.length
		console.log(e.route.coordinates[end-1].lat, e.route.coordinates[end-1].lng);
		updateMarkerPosition(e.route.coordinates[end-1].lat, e.route.coordinates[end-1].lng);
		lat = e.route.coordinates[end-1].lat;
		lon = e.route.coordinates[end-1].lng;
		sendData();});

	function updateMarkerPosition(latitude, longitude){
		// In the roadMatching mode, we select the destination marker to update it
		if (document.getElementById('road-match').classList.contains("active")){
			marker = markerList[markerList.length-1];
		}
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
		// Verify if we are in the RoadMatchingMode
		if (document.getElementById('road-match').classList.contains("active")){
			macarte.removeLayer(marker)
			if (startRouting == 0){
				control.spliceWaypoints(0, 1, e.latlng);
				startRouting = 1;
			} else {
				control.spliceWaypoints(control.getWaypoints().length - 1, 1, e.latlng);
			}
		} else if (document.getElementById('trajectory').classList.contains("active") && trajectoryComplete == 0){
			lat = e.latlng.lat;
			lon = e.latlng.lng;
			// Add a marker at click location
			var m = L.marker([lat, lon], {clickable:true}).addTo(macarte);
			// Add popup
			var newLatLng = new L.LatLng(lat, lon);
			m.setLatLng(newLatLng).bindPopup('Lat : '+lat+'<br />'+'Long : '+lon,  {
				closeButton: false,
				closeOnClick: false
       		 }).openPopup();
			// Add in a table
			trajectory_tab.push(newLatLng);
			trajectory_mark.push(m);
			console.log(trajectory_mark.length);
			// Make visible send button
			if (trajectory_mark.length == 3) {
				document.getElementById("trajectoryValidation").hidden = false;
			}
			
		} else if (document.getElementById('trajectory').classList.contains("active") && trajectoryComplete == 1){
			sendJson();
		} else {
			// Move the marker at click location; add popup window
			updateMarkerPosition(e.latlng.lat, e.latlng.lng);
			//On appelle la fonction pour envoyer la requête POST
			lat = e.latlng.lat;
			lon = e.latlng.lng;
			sendData();
		}
	}

	function change_trajectory_state(){
		trajectoryComplete = 1;
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

		if(updateMarker == 1){
			// In the RoadMatching mode, we call addMarker() to update the marker with the right coordinates
			if (document.getElementById('road-match').classList.contains("active")){
				eventGamePad.latlng.lat = newMarkerLatitude;
				eventGamePad.latlng.lng = newMarkerLongitude;
				addMarker(eventGamePad);
			} else {
				updateMarkerPosition(newMarkerLatitude, newMarkerLongitude);
			}
		}

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
	logoNavbar.style.cssText = "margin-right: 70px;margin-left: 50px;";
	initMap();
	windowSizeChanged();
	};

function resetMarkerTrajectory() {
	// Enlever les marqueurs
	trajectory_mark.forEach(function(item, index, array) {
		macarte.removeLayer(item);
	});
	// Vider le tableau des marqueurs
	trajectory_mark.splice(0, trajectory_mark.length);
	// Vider le tableau des positions
	trajectory_tab.splice(0, trajectory_tab.length);
}

function sendData(){
	var XHR = new XMLHttpRequest();

	// Configuration de la requête
	XHR.open('GET', 'http://localhost:12913/?lat='+lat.toString()+'\\&long='+lon.toString()+'\\&alt='+alt.toString()+'\\&time='+time.toString(), true);
	//XHR.open('POST', 'http://localhost:12913/?lat='+lat.toString()+'&long='+lon.toString()+'&alt='+alt.toString()+'&time='+time.toString(), true);

	// Ajout de l'en-tête HTTP requise pour requêtes POST de données de formulaire
	XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	// Envoie des données
	XHR.send();
}

function sendJson(){
	// Vérifier si tableau vide
	if (trajectory_tab.length != 0) {
		// Transformer tableau en JSON
		var Json_Tab = JSON.stringify(trajectory_tab);
		// Envoyer JSON au localhost:10000
		var XHR = new XMLHttpRequest();
		var URL = "http://localhost:10000/trajectorySmoothing?data="+Json_Tab;
		XHR.open("POST", URL, true);
		XHR.setRequestHeader("Accept", "application/json");
		XHR.setRequestHeader("Content-Type", "application/json");

		XHR.onreadystatechange = function () {
			if (XHR.readyState == 4) {
				console.log(XHR.responseText);
			}
		};

		XHR.send();
		console.log(Json_Tab);
		// Cacher bouton
		document.getElementById("trajectoryValidation").hidden = true;
		// Reset des tableaux
		resetMarkerTrajectory();
	}
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
