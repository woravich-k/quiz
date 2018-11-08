

//							****** load simple map and define some icons ******
//load the map
var mymap = L.map('mapid').setView([51.505,-0.09],13);

//adapted from the practicle codes in the module
//load the tiles
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',{
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,'+'<a href="http://creativecommons.org/licenses/by-sa/2.0/"> CC-BY-SA</a>,'+'imagery &copy; <a href="http://mapbox.com">Mapbox</a>', 
	id: 'mapbox.streets'
	}).addTo(mymap);

// //create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions  can use the sam variable
// var client;
		
// //and a variable that will hold the layer itself - we need to do this outside the function so that we can use it to remove the layer later on


//adapted from the practicle codes in the module
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



//								*************************** Functions for login page *****************************

// new Account
//if user want to create new account change the login DIV
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

//if user login to the system by the existing account, change login DIV
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

//create account by reading from the form
function createAcc(){
	document.getElementById("userAccount").style.border ="";
	document.getElementById("userPassword").style.border ="";
	document.getElementById("userPassword2").style.border ="";
	document.getElementById("invalidLogin").style.visibility = "hidden";
	var user = document.getElementById("userAccount").value;
	var pass = document.getElementById("userPassword").value;
	var pass2 = document.getElementById("userPassword2").value;
	if (user.trim() == '' || pass == '' || pass2 == ''){ //if user miss usernames or passwords, then highlight the missing information and alert the error
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
	
	if (pass != pass2){ //if the passwords are not the same, then highlight and alert the error
		document.getElementById("invalidLogin").innerHTML = "These passwords didn't match.";
		document.getElementById("invalidLogin").style.visibility = "visible";
		document.getElementById("userPassword2").style.border = "2px solid red";
		return;
	}
	
	var postString = "username="+user +"&password="+pass;
	processCreateAcc(postString) //post to the server
	
}

//adapted from the practicle codes in the module
//posting the account
function processCreateAcc(postString){
	client = new XMLHttpRequest();
	client.open('POST','https://www.woravich-k.com:49154/createAcc/',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = accUploaded;
	client.send(postString);
}

//adapted from the practicle codes in the module
//after respond
function accUploaded(){
	//this function listens out for the server to say that the data is ready - i.e. state 4
	if(client.readyState == 4){
		if (client.status == 400){
			//if username is not unique highlight username box and report error
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



//login function,
//reading from the list then post to the server --> server query then return an id
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
	processLogin(postString) //post to server
	
}

//adapted from the practicle codes in the module
//server validate the account by doing query and response the id back
function processLogin(postString){
	client = new XMLHttpRequest();
	client.open('POST','https://www.woravich-k.com:49154/validateLogin/',true);
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
		if (client.responseText == "invalid login"){ //if there is no username and password
			document.getElementById("invalidLogin").innerHTML = "Invalid username or password!";
			document.getElementById("invalidLogin").style.visibility = "visible";
			document.getElementById("userAccount").style.border = "2px solid red";
			document.getElementById("userPassword").style.border = "2px solid red";
			return;
		}
		alert("login successful");
		resText = client.responseText.split("||", 2)
		loginSuccess(resText[0],resText[1]); // login success then record the account id(primary key)
	}
}

//keep account id(primarykey) and display username
function loginSuccess(id,username){
	document.getElementById("login").innerHTML ="";
	document.getElementById("login").style.width = "0px";
	document.getElementById("login").style.height = "0px";
	document.getElementById("username").innerHTML = username;
	document.getElementById("username").name = id;
	
}










//																		***************************tracking functions and quiz functions*********************************************

	
	
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
		mymap.fitBounds(currentLocationLyr.getLatLng().toBounds(200));
		autoPan = true;
		
		
	} else {
		if (navigator.geolocation) {
			alert("Getting current location");
			trackLOC = navigator.geolocation.watchPosition(showPosition); //keep by the global variable in order to turn off later
			
			
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}
}

function showPosition(position) {
	

	if(!firstTime){ //if not first time remove previous location before add new
		mymap.removeLayer(currentLocationLyr);
	}
	currentLocationLyr = L.marker([position.coords.latitude,position.coords.longitude]).addTo(mymap);
	
	if(firstTime){
		firstTime = false;
		//zoom to the location
		mymap.fitBounds(currentLocationLyr.getLatLng().toBounds(200));
		autoPan = true;
	}else if (autoPan) { //check the autoPan first
		//pan to the location every time that get new position
		mymap.panTo(currentLocationLyr.getLatLng());
		
	}	
}

//turn off autoPan when user drag the map.
// so user can move arount the map by themselve
mymap.on('dragstart', function() {
	autoPan = false;
})


//testing function
function alertAuto(){
	alert(autoPan);
	
}



// 														******** get quiz function ***********
//														****** Distance alert functions ******

//These parameters are used to decide when the application alerts user/ pop up the question.
var watch_dist;
var firstTimeDist = true;
var prev_closestPt = "";
var inbound;
// the cut of distance is set here!!!
var cutoffDist = 0.1; // kilometers
var geoJSON; //set it as global variable, so not be loaded often

var pts = []; //the array that used to find the closest question within the cutoff distance.

var closest_i;
// var pts = [ [1,51.524616,-0.13818,"Warren Street","https://www.woravich-k.com:49154/WarrenStreet.html"], //id, lat, lon, name,shown URL
			// [2,51.5567,-0.1380,"Tufnell Park","https://www.woravich-k.com:49154/TufnellPark.html"],
			// [3,51.5592,-0.1342,"Tufnell House","https://www.woravich-k.com:49154/TufnellHouse.html"] ];

//load the question first
//adapted from the practicle codes in the module
function loadQuestion_trackDistance(){
	var url = 'https://www.woravich-k.com:49154/getQuestionANS/'+document.getElementById("username").name;
	client = new XMLHttpRequest();
	
	client.open('GET', url);
	client.onreadystatechange = dataResponse_trackDistance; 
	client.send();
}

//adapted from the practicle codes in the module
//create the code to wait for the response from the data server, and process the response once it is received
function dataResponse_trackDistance(){
//this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4){
		//once the data is ready, process the data
		var geoJSONData = client.responseText;
		listQuestion(geoJSONData);
	}
}

//this function is used for create a list of unanswered questions
function listQuestion(geoJSONData){
	pts = [];
	geoJSON = JSON.parse(geoJSONData);
	//if question layer is displayed reload the question layer
	
	if (questionsBOX.checked){
		removeData('question');
		getData('question');
	}
	
	//create pts array
	for(var i = 0; i < geoJSON[0].features.length; i++) {
		var feature = geoJSON[0].features[i];
		
		//list only unanswered questions.
		if (feature["properties"]["accountid"] == null){ //accountid == null --> cannot join to the history answer --> the user hasen't answered that question 
			pts.push([i, feature["geometry"]["coordinates"][1], feature["geometry"]["coordinates"][0], feature["properties"]["id"]]);
		}
	}
	console.log(pts);
	trackDistance();
}

			
			
//track the distances to unanswered questions
function trackDistance() {
	if (navigator.geolocation) {
		watch_dist = navigator.geolocation.watchPosition(getAlertFromPoints);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
}

//getalret == get question
function getAlertFromPoints(position){
	var closestDist = cutoffDist;
	var closestPt_id = "outside";
	var curLat = position.coords.latitude;
	var curLon = position.coords.longitude;
	
	//for looping to find the closest point within the cut-off distance
	for (var i = 0; i < pts.length; i++) {
		d=calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K');
		//console.log(calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K'));
		console.log("mindist:"+ closestDist);
		console.log("d"+d);
		console.log(pts[i][3]);
		if( closestDist > calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K')){
			closestDist = calculateDistance(curLat, curLon, pts[i][1], pts[i][2],'K');
			closestPt_id = pts[i][3]; //keep the closest id(primary key)
			closest_i = pts[i][0]; //keep the closest index of GeoJSON, in order to access other attributes without looping again
		}
	}
	console.log("current"+closestPt_id);
	console.log("prev"+prev_closestPt);
	// impossible that the current closest pt will be = to previous closest point, because the prevous question is removed out from the pts list since it is answered
	if (closestPt_id != prev_closestPt && closestPt_id != "outside"){ //if still outside dont change div
		//alert("Your closest point is: " + closestPt_id);
		callQuestionChange(); //change question div to pop the question up
		navigator.geolocation.clearWatch(watch_dist); //stop watch position, this will be reactivated after the user answer the question
		prev_closestPt = closestPt_id;
	}
	
}

//Using AJAX to change floating DIV (quiz)
//using AJAX to open up opotunity to have other types of question apart from four choices - i.e. type in question, true-false question, multiple correct answers question
//adapted from the practicle codes in the module
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

//adapted from the practicle codes in the module
//Changing quiz DIV
function processDivQuestionChange(){
	//while waiting response from server
	if(xhr.readyState <4)  document.getElementById('quiz').innerHTML="Loading...";
	///4 = response from server has been completely loaded.
	else if (xhr.readyState === 4){
		//200-300 --> all successful
		if (xhr.status==200&&xhr.status<300){
			//load to quiz DIV
			document.getElementById('quiz').innerHTML=xhr.responseText;
			
			//pop question and choices regard to attributes of the closest object of the geoJSON
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
		
		if (choices[i] != ans) document.getElementById(choices[i]).style.backgroundColor = "#b3b3b3"; //change the button that user does not select to gray clour
		//disable a button for answering
		document.getElementById(choices[i]).onclick ="";
	}
	
	if (geoJSON[0].features[closest_i]["properties"]["answer"] == ans){ //if correct
		document.getElementById(ans).style.backgroundColor = "#8dfc8d"; //change the selected button to green
		correct = true;
	} else { //if wrong
		document.getElementById(ans).style.backgroundColor = "#ff7777"; //change the selected button to red
		document.getElementById(geoJSON[0].features[closest_i]["properties"]["answer"]).style.backgroundColor = "#8dfc8d"; //change the correct button to green
		correct = false;
	}
	
	//store answer to DB
	var postString = "userans="+ geoJSON[0].features[closest_i]["properties"][ans] +"&accountid="+ document.getElementById("username").name + "&questionid="+ geoJSON[0].features[closest_i]["properties"]["id"] + "&truefalse="+correct; 
	postAns(postString) //post the answer to the database
	
}

//adapted from the practicle codes in the module
//upload answer
function postAns(postString){
	client = new XMLHttpRequest();
	client.open('POST','https://www.woravich-k.com:49154/postAns',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = ansUploaded;
	client.send(postString);
}


//adapted from the practicle codes in the module
// after uploading answer 
function ansUploaded(){
	//this function listens out for the server to say that the data is ready - i.e. state 4
	if(client.readyState == 4){
		if (client.status == 400){
			alert("Cannot upload answer to the server");
			alert(client.responseText);
		}
		
		//report the total current score to the user
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



//remove the quiz from the floating DIV, if user click to the Next button
function removeQuiz(){
	document.getElementById('quiz').innerHTML=''
	distAlert();
	
}
	



//function to calculate distance
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


















//						********* Add/Remove Questions functions **********
 					
//create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions  can use the same variable
var client;

//and a variable that will hold the layer itself - we need to do this outside the function so that we can use it to remove the layer later on
var questionlayer;

//use as global variable as they will be used to remove layers and avoid duplicate layers.
var loadingQuestion;

var lyr;

//adapted from the practicle codes in the module		
//create the code to get the questions data using an XMLHttpRequest
function getData(layername){
	//autoPan = false;
	lyr = layername;
	var url;
	if (distBox.checked){
		//because the JSON is already loaded; in order to not load from the DB often
		loadLayer(geoJSON);
		return
	}
	if (lyr == "question" && !loadingQuestion){
		// the server will return join table of all question with the answer of the user
		url = 'https://www.woravich-k.com:49154/getQuestionANS/'+document.getElementById("username").name; //read user id from the html; userid is specify after user login
	}else{
		alert("The layer is not loaded to the map, since it has already been existed.")
		return
	}
	//alert("Loading")
	client = new XMLHttpRequest();
	
	client.open('GET', url);
	client.onreadystatechange = dataResponse; 
	client.send();
}

//adapted from the practicle codes in the module
//create the code to wait for the response from the data server, and process the response once it is received
function dataResponse(){
//this function listens out for the server to say that the data is ready - i.e. has state 4
	if (client.readyState == 4){
		//once the data is ready, process the data
		var geoJSONData = client.responseText;
		//convert the received data - which is text - to JSON format and add it to the map
		geoJSON = JSON.parse(geoJSONData); //keep GeoJSON
		loadLayer(geoJSON);
	}
}

//adapted from the practicle codes in the module
function loadLayer(json){
	//decide which layer do we load?
	if (lyr == "question"){
		loadingQuestion = true;
		questionlayer = L.geoJson(json,
		{
			//use point to layer to create the points
			pointToLayer: function(feature, latlng){
				//look at the GeoJSON file - specifically at the properties 
				// - to see the question is alredy answered by the user or not
				if (feature.properties.truefalse == true){ //pop-up to see details of the question only show on the answered question
				//correct answer
					return L.marker(latlng,{icon:markerGreen}).bindPopup("<b> Question</b>: "+feature.properties.question+"<br /> <b>Answer</b>: "+feature.properties.fullanswer);
				}else if(feature.properties.truefalse == false) {
				//wrong answer
					return L.marker(latlng,{icon:markerRed}).bindPopup("<b> Question</b>: "+feature.properties.question+"<br /> <b>Answer</b>: "+feature.properties.fullanswer);
				}else{// truefalse == null --> cound't join with the previous answer of this user --> User hasn't answered yet.
					//pop up show link to navigate by Google Map
					return L.marker(latlng,{icon:markerGray}).bindPopup("<b> location</b>: <a href='https://www.google.com/maps/dir/?api=1&destination=" +feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] +"' target='_blank'>Open in Google Map</a> ");
				}
			}
		}).addTo(mymap);
		if (!distBox.checked) mymap.fitBounds(questionlayer.getBounds()); //if the user is using quiz app, dont' zoom to this layer since this migth interupt the user.
	}

}

//remove question
//adapted from the practicle codes in the module
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
	





//					****** Switches functions located in the side menu to activate other functions******


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


// panToCurrentLocation
function panToCurrentLoc(){
	if (!firstTime) {
		trackLocation();
	}
}

//zoom to all questions
function zoomToQuestion(){
	if (loadingQuestion) {
		autoPan = false;
		mymap.fitBounds(questionlayer.getBounds());
	}
}

//reporting score
function checkScore(){

	if (questionsBOX.checked || distBox.checked){
		//doesn't have to reload geoJSON
		summariseScore(geoJSON);
		return
	}
	//if GeoJSON hasn't been loaded yet, then load JSON
	var url = 'https://www.woravich-k.com:49154/getQuestionANS/'+document.getElementById("username").name;
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

//report current score
function summariseScore(json){
	score = 0;
	notDone = 0;
	for (var i = 0 ; i < geoJSON[0].features.length; i++){
		if (geoJSON[0].features[i]["properties"]["truefalse"]) score = score + 1;
		if (geoJSON[0].features[i]["properties"]["truefalse"] == null) notDone = notDone+1;
	}
	alert('Score:'+ score +'/'+ geoJSON[0].features.length +'\n You have ' + notDone + ' question(s) left.');
	
}






