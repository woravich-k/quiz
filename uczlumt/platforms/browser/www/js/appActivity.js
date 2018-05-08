
//							****** load simple map and define some icons ******
//load the map
var mymap = L.map('mapid').setView([51.505,-0.09],13);
	
//load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',{
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,'+'<a href="http://creativecommons.org/licenses/by-sa/2.0/"> CC-BY-SA</a>,'+'imagery &copy; <a href="http://mapbox.com">Mapbox</a>', 
	id: 'mapbox.streets'
	}).addTo(mymap);

// //create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions  can use the sam variable
// var client;
		
// //and a variable that will hold the layer itself - we need to do this outside the function so that we can use it to remove the layer later on
// var earthquakelayer;

// create icon template
var markerRed = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'red'
});
var markerGreen = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'green'
});
var markerGray = L.AwesomeMarkers.icon({
	icon: 'play',
	markerColor: 'gray'
});



//						****** Add/Remove Earthquakes and Bus Stops function *******
 					
//create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions  can use the sam variable
var client;

//and a variable that will hold the layer itself - we need to do this outside the function so that we can use it to remove the layer later on
var earthquakelayer;
var busstoplayer;
var questionlayer;

//use as global variable as they will be used to remove layers and avoid duplicate layers.
var loadingEarthquakes;
var loadingBusstops;
var loadingQuestion;

var lyr;
		
//create the code to get the questions data using an XMLHttpRequest
function getData(layername){
	//autoPan = false;
	lyr = layername;
	var url;
	if (distBox.checked){
		//because the JSON is already loaded
		loadLayer(geoJSON);
		return
	}
	if (lyr == "question" && !loadingQuestion){
		url = 'https://developer.cege.ucl.ac.uk:31083/getQuestionANS/'+document.getElementById("username").name;
	}else{
		alert("The layer is not loaded to the map, since it has already been existed.")
		return
	}
	//alert("Loading")
	client = new XMLHttpRequest();
	
	client.open('GET', url);
	client.onreadystatechange = dataResponse; //note don't use earthquakeResponse() with brackets as that doesn't work
	client.send();
}

//create the code to wait for the response from the data server, and process the response once it is received
function dataResponse(){
//this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4){
		//once the data is ready, process the data
		var geoJSONData = client.responseText;
		geoJSON = JSON.parse(geoJSONData);
		loadLayer(geoJSON);
	}
}

//convert the received data - which is text - to JSON format and add it to the map
function loadLayer(json){
	
	//decide which layer do we load?
	//avoid duplicate layers
	if (lyr == "question"){
		loadingQuestion = true;
		questionlayer = L.geoJson(json,
		{
			//use point to layer to create the points
			pointToLayer: function(feature, latlng){
				//look at the GeoJSON filr - specifically at the properties - to see the earthquake magnitude and use a different marker depending on this value
				//also include a pop-up that shows the place value of the earthquakes 
				if (feature.properties.truefalse == true){
				//correct answer
					return L.marker(latlng,{icon:markerGreen}).bindPopup("<b> Question</b>: "+feature.properties.question+"<br /> <b>Answer</b>: "+feature.properties.fullanswer);
				}else if(feature.properties.truefalse == false) {
				//wrong answer
					return L.marker(latlng,{icon:markerRed}).bindPopup("<b> Question</b>: "+feature.properties.question+"<br /> <b>Answer</b>: "+feature.properties.fullanswer);
				}else{// truefalse == null --> User hasn't asnwered yet.
					return L.marker(latlng,{icon:markerGray}).bindPopup("<b> location</b>: <a href='https://www.google.com/maps/dir/?api=1&destination=" +feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] +"' target='_blank'>Open in Google Map</a> ");
				}
			}
		}).addTo(mymap);
		if (!distBox.checked) mymap.fitBounds(questionlayer.getBounds());
	}

}

function removeData(layername){
//check whether the layer is existed on the map or not if not inform the user.
	
	if (layername == "question") {
		if (loadingQuestion){
			//alert("removing the busstops data here");
			mymap.removeLayer(questionlayer);
			loadingQuestion = false;
		} else {
			alert("There is no question layer on the map");
		}
	}
	
}
	


	
	
//						****** Showing current location functions ******
//Tracking location
var currentLocationLyr;
var trackLOC;
var firstTime = true;
var previousBound;
var autoPan = false;

function trackLocation() {
	if (!firstTime){
	// zoom to center
		mymap.fitBounds(currentLocationLyr.getLatLng().toBounds(250));
		autoPan = true;
		
		
	} else {
		if (navigator.geolocation) {
			alert("Getting current location");
			trackLOC = navigator.geolocation.watchPosition(showPosition);
			
			
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}
}

function showPosition(position) {
	

	if(!firstTime){
		mymap.removeLayer(currentLocationLyr);
	}
	currentLocationLyr = L.marker([position.coords.latitude,position.coords.longitude]).addTo(mymap);
	
	if(firstTime){
		firstTime = false;
		mymap.fitBounds(currentLocationLyr.getLatLng().toBounds(250));
		autoPan = true;
	}else if (autoPan) {
		mymap.panTo(currentLocationLyr.getLatLng());
		
	}	
}

//turn off autoPan when user drag the map.
mymap.on('dragstart', function() {
	autoPan = false;
})


function alertAuto(){
	alert(autoPan);
	
}


//	****** Distance alert functions ******

//These parameters are used to decide when the application alerts user.
//These parameters are used to decide when the application alerts user.
var watch_dist;
var firstTimeDist = true;
var prev_closestPt = "";
var inbound;
var cutoffDist = 0.1; // kilometers
var geoJSON; 
var pts = [];
var closest_i;
// var pts = [ [1,51.524616,-0.13818,"Warren Street","https://developer.cege.ucl.ac.uk:31083/WarrenStreet.html"], //id, lat, lon, name,shown URL
			// [2,51.5567,-0.1380,"Tufnell Park","https://developer.cege.ucl.ac.uk:31083/TufnellPark.html"],
			// [3,51.5592,-0.1342,"Tufnell House","https://developer.cege.ucl.ac.uk:31083/TufnellHouse.html"] ];

function loadQuestion_trackDistance(){
	var url = 'https://developer.cege.ucl.ac.uk:31083/getQuestionANS/'+document.getElementById("username").name;
	client = new XMLHttpRequest();
	
	client.open('GET', url);
	client.onreadystatechange = dataResponse_trackDistance; 
	client.send();
}

//create the code to wait for the response from the data server, and process the response once it is received
function dataResponse_trackDistance(){
//this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4){
		//once the data is ready, process the data
		var geoJSONData = client.responseText;
		listQuestion(geoJSONData);
	}
}

function listQuestion(geoJSONData){
	pts = [];
	geoJSON = JSON.parse(geoJSONData);
	//reload the question layer
	if (questionsBOX.checked){
		
		removeData('question');
		getData('question');
		
	}

	for(var i = 0; i < geoJSON[0].features.length; i++) {
		var feature = geoJSON[0].features[i];
		//list only unanswered questions.
		if (feature["properties"]["accountid"] == null){ //accountid == null --> cannot join to the history answer --> the user hasen't answered that question 
			pts.push([i, feature["geometry"]["coordinates"][1], feature["geometry"]["coordinates"][0], feature["properties"]["id"]]);
		}
	}
	console.log(pts)
	trackDistance();
}

			
			

function trackDistance() {
	if (navigator.geolocation) {
		watch_dist = navigator.geolocation.watchPosition(getAlertFromPoints);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}


function getAlertFromPoints(position){
	var closestDist = cutoffDist;
	var closestPt_id = "outside";
	var curLat = position.coords.latitude;
	var curLon = position.coords.longitude;
	//find the closest point within the cut-off distance
	
	for (var i = 0; i < pts.length; i++) {
		d=calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K');
		//console.log(calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K'));
		console.log("mindist:"+ closestDist);
		console.log("d"+d);
		console.log(pts[i][3]);
		if( closestDist > calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K')){
			closestDist = calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K');
			closestPt_id = pts[i][3];
			closest_i = pts[i][0];
		}
	}
	console.log("current"+closestPt_id);
	console.log("prev"+prev_closestPt);
	if (closestPt_id != prev_closestPt && closestPt_id != "outside"){
		//alert("Your closest point is: " + closestPt_id);
		callQuestionChange();
		navigator.geolocation.clearWatch(watch_dist);
		prev_closestPt = closestPt_id;
	}
	
}

//Testing AJAX
var xhr; //define the globle to process the AJAX request
function callQuestionChange(){
	var url = "./quizform.html";
	xhr = new XMLHttpRequest();
	//var url = document.getElementById("url").value;
	if (url == ""){
		return
	}
	xhr.open("GET",url,true);
	//xhr.open("GET",".test.html",true);
	xhr.onreadystatechange = processDivQuestionChange;
	try{
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	}
	catch(e){
		//this only works in internet explorer
	}
	xhr.send();
	
}

function processDivQuestionChange(){
	//while waiting response from server
	if(xhr.readyState <4)  document.getElementById('quiz').innerHTML="Loading...";
	///4 = response from server has been completely loaded.
	else if (xhr.readyState === 4){
		//200-300 --> all successful
		if (xhr.status==200&&xhr.status<300){
			document.getElementById('quiz').innerHTML=xhr.responseText;
			document.getElementById('qtext').innerHTML = geoJSON[0].features[closest_i]["properties"]["question"];
			document.getElementById('qimg').src = geoJSON[0].features[closest_i]["properties"]["qurl"];
			document.getElementById('choice1text').innerHTML = geoJSON[0].features[closest_i]["properties"]["choice1"];
			document.getElementById('choice1img').src = geoJSON[0].features[closest_i]["properties"]["choice1url"];
			document.getElementById('choice2text').innerHTML = geoJSON[0].features[closest_i]["properties"]["choice2"];
			document.getElementById('choice2img').src = geoJSON[0].features[closest_i]["properties"]["choice2url"];
			document.getElementById('choice3text').innerHTML = geoJSON[0].features[closest_i]["properties"]["choice3"];
			document.getElementById('choice3img').src = geoJSON[0].features[closest_i]["properties"]["choice3url"];
			document.getElementById('choice4text').innerHTML = geoJSON[0].features[closest_i]["properties"]["choice4"];
			document.getElementById('choice4img').src = geoJSON[0].features[closest_i]["properties"]["choice4url"];
			
		}
	}
}

var correct;
// check answer function 
function checkAns(ans){
	
	if (confirm("Click OK to confirm your answer.") == false) return;
	var choices = ["choice1","choice2","choice3","choice4"]
	for (var i = 0; i < choices.length; i++){
		if (choices[i] != ans) document.getElementById(choices[i]).style.backgroundColor = "#b3b3b3";
		document.getElementById(choices[i]).onclick ="";
	}
	
	if (geoJSON[0].features[closest_i]["properties"]["answer"] == ans){
		document.getElementById(ans).style.backgroundColor = "#8dfc8d";
		correct = true;
	} else {
		document.getElementById(ans).style.backgroundColor = "#ff7777";
		document.getElementById(geoJSON[0].features[closest_i]["properties"]["answer"]).style.backgroundColor = "#8dfc8d";
		correct = false;
	}
	
	//store answer to DB
	var postString = "userans="+ geoJSON[0].features[closest_i]["properties"][ans] +"&accountid="+ document.getElementById("username").name + "&questionid="+ geoJSON[0].features[closest_i]["properties"]["id"] + "&truefalse="+correct;
	postAns(postString)
	
}

function postAns(postString){
	client = new XMLHttpRequest();
	client.open('POST','https://developer.cege.ucl.ac.uk:31083/postAns',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = ansUploaded;
	client.send(postString);
}
function ansUploaded(){
	//this function listens out for the server to say that the data is ready - i.e. state 4
	if(client.readyState == 4){
		if (client.status == 400){
			alert("Cannot upload answer to the server");
			alert(client.responseText);
		}
		document.getElementById("removeQuiz").innerHTML = "<h1 id = 'score' style = 'font-family: \"Roboto\",\"Helvetica\",\"Arial\",sans-serif; font-size: 20px; display: inline'></h1><button class = 'btn' onclick = 'removeQuiz()'>Next</button>"
		var score = 0;
		for (var i = 0 ; i < geoJSON[0].features.length; i++){
			if (geoJSON[0].features[i]["properties"]["truefalse"]) score = score + 1;
		}
		//have to check correct since the geoJSON hasn't been reloaded yet.
		if (correct) {
			score = score + 1
			document.getElementById("score").style.color = "#88ef88"
		} else {
			document.getElementById("score").style.color = "#ff7777"
		}
		document.getElementById("score").innerHTML = score + "/" + geoJSON[0].features.length;
	}
}

function removeQuiz(){
	document.getElementById('quiz').innerHTML=''
	distAlert();
	
}
	



//code adapted from https//www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-in-your-web-apps.html
function calculateDistance(lat1,lon1,lat2,lon2,unit){
	var radlat1=Math.PI*lat1/180;
	var radlat2=Math.PI*lat2/180;
	var radlon1=Math.PI*lon1/180;
	var radlon2=Math.PI*lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var subAngle = Math.sin(radlat1)*Math.sin(radlat2)+Math.cos(radlat1)*Math.cos(radlat2)*Math.cos(radtheta);
	subAngle = Math.acos(subAngle);
	subAngle = subAngle*180/Math.PI; //convert the degree value returned by acos back to degrees from radians
	dist = (subAngle/360)*2*Math.PI*3956;// ((subtended angle in degrees)/360)*2*pi*radius)
										//where radius of the earth is 3956 miles
	if(unit=='K'){dist=dist*1.609344;}//convert miles to km
	if(unit=='N'){dist=dist*0.8684;}//convert to nautical miles
	return dist;
}






// new Account
function newAcc(){
	document.getElementById("userPassword2_text").style.visibility = "visible";
	document.getElementById("userPassword2").style.visibility = "visible";
	document.getElementById("invalidLogin").style.visibility = "hidden";
	document.getElementById("loginTitle").innerHTML = "Create New Account";
	document.getElementById("changeLoginPage").innerHTML = "Login instead. <a onclick= 'oldAcc(); return false;'> Click Here </button>";
	document.getElementById("userPassword").value = "";
	document.getElementById("userPassword2").value = "";
	document.getElementById("userAccount").value = "";
	document.getElementById("userAccount").style.border ="";
	document.getElementById("userPassword").style.border ="";
	document.getElementById("userPassword2").style.border ="";
	document.getElementById("loginButton").innerHTML = "Create";
	document.getElementById("loginButton").onclick = function() {createAcc();}
	
}

function oldAcc(){
	document.getElementById("userPassword2_text").style.visibility = "hidden";
	document.getElementById("userPassword2").style.visibility = "hidden";
	document.getElementById("loginTitle").innerHTML = "Login";
	document.getElementById("invalidLogin").style.visibility = "hidden";
	document.getElementById("changeLoginPage").innerHTML = "Don't have an account? <a onclick= 'newAcc(); return false;' > Click Here </a>";
	document.getElementById("userPassword").value = "";
	document.getElementById("userPassword2").value = "";
	document.getElementById("userAccount").value = "";
	document.getElementById("userAccount").style.border ="";
	document.getElementById("userPassword").style.border ="";
	document.getElementById("userPassword2").style.border ="";
	
	document.getElementById("loginButton").innerHTML = "Login";
	document.getElementById("loginButton").onclick = function() {login();}
}


function createAcc(){
	document.getElementById("userAccount").style.border ="";
	document.getElementById("userPassword").style.border ="";
	document.getElementById("userPassword2").style.border ="";
	document.getElementById("invalidLogin").style.visibility = "hidden";
	var user = document.getElementById("userAccount").value;
	var pass = document.getElementById("userPassword").value;
	var pass2 = document.getElementById("userPassword2").value;
	if (user.trim() == '' || pass == '' || pass2 == ''){
		document.getElementById("invalidLogin").innerHTML = "Username and passwords are needed";
		document.getElementById("invalidLogin").style.visibility = "visible";
		if (user.trim() == ''){
			document.getElementById("userAccount").style.border = "2px solid red";
		}
		if (pass == ''){
			document.getElementById("userPassword").style.border = "2px solid red";
		}
		if (pass2 == ''){
			document.getElementById("userPassword2").style.border = "2px solid red";
		}
		return;
	}
	if (pass != pass2){
		document.getElementById("invalidLogin").innerHTML = "These passwords didn't match.";
		document.getElementById("invalidLogin").style.visibility = "visible";
		document.getElementById("userPassword2").style.border = "2px solid red";
		return;
	}
	
	var postString = "username="+user +"&password="+pass;
	processCreateAcc(postString)
	
}
function processCreateAcc(postString){
	client = new XMLHttpRequest();
	client.open('POST','https://developer.cege.ucl.ac.uk:31083/createAcc/',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = accUploaded;
	client.send(postString);
}
function accUploaded(){
	//this function listens out for the server to say that the data is ready - i.e. state 4
	if(client.readyState == 4){
		if (client.status == 400){
			if (client.responseText == "account_web_username_unique"){
				document.getElementById("userAccount").style.border = "2px solid red";
				document.getElementById("invalidLogin").innerHTML = "The username is already taken.";
				document.getElementById("invalidLogin").style.visibility = "visible";
			}else{
				alert(client.responseText);
			}
			return
		}
		alert(client.responseText);
		//automatically login
		login();
	}
}




function login(){
	document.getElementById("userAccount").style.border ="";
	document.getElementById("userPassword").style.border ="";
	document.getElementById("invalidLogin").style.visibility = "hidden";
	var user = document.getElementById("userAccount").value;
	var pass = document.getElementById("userPassword").value;
	if (user.trim() == '' || pass == ''){
		document.getElementById("invalidLogin").innerHTML = "Plese specify username and password";
		document.getElementById("invalidLogin").style.visibility = "visible";
		if (user.trim() == ''){
			document.getElementById("userAccount").style.border = "2px solid red";
		}
		if (pass == ''){
			document.getElementById("userPassword").style.border = "2px solid red";
		}
		return;
	}
	var postString = "username="+user +"&password="+pass;
	processLogin(postString)
	
}

function processLogin(postString){
	client = new XMLHttpRequest();
	client.open('POST','https://developer.cege.ucl.ac.uk:31083/validateLogin/',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = validateLogin;
	client.send(postString);
}

function validateLogin(){
	//this function listens out for the server to say that the data is ready - i.e. state 4
	if(client.readyState == 4){
		if (client.status == 400){
				alert(client.responseText);
				return
		}
		if (client.responseText == "invalid login"){
			document.getElementById("invalidLogin").innerHTML = "Invalid username or password!";
			document.getElementById("invalidLogin").style.visibility = "visible";
			document.getElementById("userAccount").style.border = "2px solid red";
			document.getElementById("userPassword").style.border = "2px solid red";
			return;
		}
		alert("login successful");
		resText = client.responseText.split("||", 2)
		loginSuccess(resText[0],resText[1]);
	}
}


function loginSuccess(id,username){
	document.getElementById("login").innerHTML ="";
	document.getElementById("login").style.width = "0px";
	document.getElementById("login").style.height = "0px";
	document.getElementById("username").innerHTML = username;
	document.getElementById("username").name = id;
	
}



//					****** Switches functions ******


//Turn on Question layer switch
var questionsBOX = document.getElementById("questionsBOX");	
function showquestion()	{
//add a point
	if (questionsBOX.checked){
		getData('question');
	} else {
		removeData('question');
	}
}

//Current location switch
var locationBox = document.getElementById("locationBox");	
function currentLocation()	{
//add a point
	if (locationBox.checked){
		trackLocation();
	} else {
		distBox.checked =false;
		navigator.geolocation.clearWatch(trackLOC);
		mymap.removeLayer(currentLocationLyr);
		firstTime = true;
		autoPan = false;
		
	}
}

//alert dist switch
var distBox = document.getElementById("distBox");
function distAlert(){
	if (distBox.checked){
		if (!locationBox.checked){
			locationBox.checked = true;
			currentLocation();
		}
		loadQuestion_trackDistance();
	} else {
		navigator.geolocation.clearWatch(watch_dist);
		prev_closestPt = "";
		
	}
}



function panToCurrentLoc(){
	if (!firstTime) {
		trackLocation();
	}
}

function zoomToQuestion(){
	if (loadingQuestion) {
		autoPan = false;
		mymap.fitBounds(questionlayer.getBounds());
	}
}

function checkScore(){

	if (questionsBOX.checked || distBox.checked){
		//doesn't have to reload geoJSON
		summariseScore(geoJSON);
		return
	}
	var url = 'https://developer.cege.ucl.ac.uk:31083/getQuestionANS/'+document.getElementById("username").name;
	client = new XMLHttpRequest();
	
	client.open('GET', url);
	client.onreadystatechange = dataResponse_checkScore; 
	client.send();
}

//create the code to wait for the response from the data server, and process the response once it is received
function dataResponse_checkScore(){
//this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4){
		//once the data is ready, process the data
		var geoJSONData = client.responseText;
		geoJSON = JSON.parse(geoJSONData);
		summariseScore(geoJSON);
	}
}


function summariseScore(json){
	score = 0;
	notDone = 0;
	for (var i = 0 ; i < geoJSON[0].features.length; i++){
		if (geoJSON[0].features[i]["properties"]["truefalse"]) score = score + 1;
		if (geoJSON[0].features[i]["properties"]["truefalse"] == null) notDone = notDone+1;
	}
	alert('Score:'+ score +'/'+ geoJSON[0].features.length +'\n You have ' + notDone + ' question(s) left.');
	
}






