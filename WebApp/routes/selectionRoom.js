//implicitely find the files to render in /client/views because of the jade related configuration in the server.js
var supdraw = require("../supdraw");
var rooms = supdraw.rooms;

var infoMsg = "";
var errorMsg = "";

module.exports = {
	get : function(req,res){
			if (req.session.user != null){
				renderPage(req,res);
			} else {
				res.render("index", {
					"loggued" : req.session.user,
					"infoMsg" : "You need to log in or register to select a gameRoom."
				});
			}
		},

	post : function(req,res){
			if (req.session.user != null){
				//creating a room
				if (req.body.newRoomName != null
				&& req.body.newRoomLanguage != null
				&& req.body.newRoomName != ""
				&& req.body.newRoomLanguage != ""){

					var room = findExistingRoom(req.body.name, req.body.language);
					if (room == null){			//if this room doesn't exist yet let's create it
						var players = new Array();
						var player = {
							"name" : req.session.user.username,
							"score" : "0"
						}
						players.push(player);

						var room = {
							"name" : req.body.newRoomName,
							"language" : req.body.newRoomLanguage,
							"players" : players,
							"status" : "waiting",
							"thingToDraw" : "plop",
							"gameLeader" : req.session.user.username
						}
						rooms.push(room);
						console.log("[LOG] new room : " + room.name +
									" with user " + room.players[0].name);
						res.redirect("gameRoom"); //browser redirect
					} else {
						console.log("[LOG] user : " + req.session.user.username
							+ " tryed to create a room : "+ req.body.name 
							+ " of language : "+ req.body.language + " but was already existing.");
						errorMsg = "The room you tried to create already exists.";
						renderPage(req,res);
					}
				} else {
					//joining a room
					if (req.body.name != null
					&& req.body.language != null
					&& req.body.name != ""
					&& req.body.language != ""){
						console.log("[LOG] user : " + req.session.user.username
							+ " joined room : "+ req.body.name 
							+ " of language : "+ req.body.language);

						var room = findExistingRoom(req.body.name,req.body.language);
						if (room != null){
							if (room.status == "waiting"){
								var player = {
									"name" : req.session.user.username,
									"score" : "0"
								}
								room.players.push(player);
								console.log("[LOG] added user : " + req.session.user.username + " to the room : " + room.name);
								res.redirect("gameRoom"); //browser redirect
								//check if we close the room = we are the last person allowed to enter
								room.status = "playing";
							}
						} else {
							errorMsg = "The room you tried to join no longer exists or is already full";
							renderPage(req,res);
						}
					}
				}
				renderPage(req,res);
			}
		}
}

function renderPage(req,res){
	res.render("selectionRoom", {
		"loggued" : req.session.user,
		"languages" : supdraw.languages,
		"rooms" : rooms,
		"errorMsg" : errorMsg,
		"infoMsg" : infoMsg
	});
	errorMsg = "";
	infoMsg = "";
}


function findExistingRoom(roomName,language) {
	for (var i = rooms.length - 1; i >= 0; i--){
		if (rooms[i].name == roomName
		&& rooms[i].language == language){
			return rooms[i];
		}
	};
	return null;
}