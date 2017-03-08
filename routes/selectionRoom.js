//implicitely find the files to render in /client/views because of the jade related configuration in the server.js
var cookie = require("cookie");
var supdraw = require("../index");

var roomManager = supdraw.roomManager;

var sessionIdArray = supdraw.sessionIdArray;
var setUsernameWithCookie = supdraw.setUsernameWithCookie;

var infoMsg = "";
var errorMsg = "";

module.exports = {
	get : function(req, res){
			if (req.session.user == null){				
				res.render("index", {
					"loggued" : req.session.user,
					"infoMsg" : "You need to log in or register to select a gameRoom."
				});
			} else {
				renderPage(req, res);
			}
		},

	post : function(req, res){
			if (req.session.user == null){
				res.render("index", {
					"loggued" : req.session.user,
					"infoMsg" : "You need to log in or register to select a gameRoom."
				});
			}

			//creating a room
			if (req.body.newRoomName != null
			&& req.body.newRoomLanguage != null
			&& req.body.newRoomName != ""
			&& req.body.newRoomLanguage != ""){
				createRoom(req, res);
			}

			if (req.body.name != null
			&& req.body.language != null
			&& req.body.name != ""
			&& req.body.language != ""){
				joinRoom(req, res);
			}
		}
}

function renderPage(req, res){
	res.render("selectionRoom", {
		"loggued" : req.session.user,
		"languages" : supdraw.languages,
		"rooms" : roomManager.getRooms(),
		"errorMsg" : errorMsg,
		"infoMsg" : infoMsg
	});
	errorMsg = "";
	infoMsg = "";
}

function createRoom(req, res){
	setUsernameWithCookie(req.headers.cookie, req.session.user.username);

	var currentUser = req.session.user.username;
	var roomName = req.body.newRoomName;
	var roomLanguage = req.body.newRoomLanguage;

	var room = roomManager.getRoom(roomName, roomLanguage);
	if (room == null){
		//if this room doesn't exist yet let's create it
		room = roomManager.openRoom(roomName, roomLanguage, currentUser);

		console.log("[LOG] new room : " + room.name +" with gameLeader " + room.gameLeader);
		require("../websockets").createRoom(room, function (error, data) {
		   if (error) return console.error(error);
		   res.redirect("gameRoom"); //browser redirect
		});		
	} else {
		//room already exists
		console.log("[LOG] user : " + currentUser
			+ " tryed to create a room : "+roomName 
			+ " of language : "+ roomLanguage + " but was already existing.");
		errorMsg = "The room you tried to create already exists.";
		renderPage(req, res);
	}
}

function joinRoom(req, res){
	setUsernameWithCookie(req.headers.cookie, req.session.user.username)

	var currentUser = req.session.user.username;
	var roomName = req.body.name;
	var roomLanguage = req.body.language;
	
	console.log("[LOG] user : " +currentUser+ " joined room : " +roomName+ " of language : "+ roomLanguage);
	var room = roomManager.getRoom(roomName, roomLanguage);
	if (room != null){
		if (room.status != "closed"){
			var player = {
				"name" : currentUser,
				"score" : "0"
			}
			room.players.push(player);
			console.log("[LOG] added user : " + currentUser + " to the room : " + room.name);
			if(room.players.length >= 2){
				room.status = "playing";
				require("../websockets").startGame(room);
			}
			if(room.players.length == 5){
				room.status = "closed";
			}
			res.redirect("gameRoom"); //browser redirect
		}else{
			console.log("[LOG] user : " +currentUser+ " tryed to enter a room : " +roomName+ " of language : "+roomLanguage+ " which has status "+room.status);
			errorMsg = "The room you tried to join is "+room.status;
			renderPage(req, res);
		}
	} else {
		//room doesn't exist, the user handcrafted the request or really bad timing
		console.log("[LOG] user : " + currentUser
			+ " tryed to enter a room : "+ roomName 
			+ " of language : "+ roomLanguage + " that doesn't exist");
		errorMsg = "The room you tried to join no longer exists";
		renderPage(req, res);
	}	
}