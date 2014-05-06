//implicitely find the files to render in /client/views because of the jade related configuration in the server.js
var supdraw = require("../supdraw");
var rooms = supdraw.rooms;
var currentRoom;

module.exports = {
	get : function(req,res) {
			if (req.session.user != null){ 
				currentRoom = isRoomMember(req.session.user.username);
				if (currentRoom != null){ //the player is in a room
					if (currentRoom.gameLeader == null){ //if there's no gameLeader in this room
						newGameLeader(req);
					} else {
						if (currentRoom.gameLeader == req.session.user.username){ //it's me, mario!
							req.session.gameLeader = true;
						} else {
							req.session.gameLeader = false;
						}
					}
					if (req.session.gameLeader){
						var thingToDraw = supdraw.drawSomething(currentRoom.language);
						currentRoom.thingToDraw = thingToDraw;
						res.render("gameRoom", {
							"loggued" : req.session.user,
							"players" : currentRoom.players,
							"room" : currentRoom,
							"gameLeader" : req.session.gameLeader,
							"headerTitle" : "You're the drawer",
							"headerSubtitle" : "You have to draw "+ thingToDraw
						});
					} else {
						res.render("gameRoom", {
							"loggued" : req.session.user,
							"players" : currentRoom.players,
							"room" : currentRoom,
							"gameLeader" : req.session.gameLeader,
							"headerTitle" : "You're a guesser",
							"headerSubtitle" : "Just enter your guessings in the chat."
						});
					}
				} else {
					res.render("selectionRoom", {
						"loggued" : req.session.user,
						"languages" : supdraw.languages,
						"rooms" : supdraw.rooms,
						"infoMsg" : "You need to choose a room to play."
					});
				}
			} else {
				res.render("index", {
					"loggued" : req.session.user,
					"infoMsg" : "You need to log in or register to play."
				});
			}
		}
}

function isRoomMember(username) {
	if (rooms != null){ //server was reloaded and the page gameRoom was loaded while rooms was empty
		for (var i = rooms.length - 1; i >= 0; i--){
			for (var j = rooms[i].players.length - 1; j >= 0; j--){
				if (rooms[i].players[j].name == username){
					return rooms[i];
				}
			};
		};	
	}
	return null;
}

function newGameLeader(req){
	if (currentRoom != null){
		var randomIndex = Math.floor(Math.random()*currentRoom.players.length);
		currentRoom.gameLeader = currentRoom.players[randomIndex].name;  //random user is declared as drawer
		console.log("[LOG] gameLeader : "+ currentRoom.players[randomIndex].name);
		req.session.gameLeader = true;
	}
}