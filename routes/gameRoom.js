//implicitely find the files to render in /client/views because of the jade related configuration in the server.js
var supdraw = require("../index");
var rooms = supdraw.rooms;
var roomManager = supdraw.roomManager;

module.exports = {
	get : function(req, res) {
			if (req.session.user == null || typeof(req.session.user) === "undefined"){ 
				res.render("login", {
					"loggued" : req.session.user,
					"infoMsg" : "You need to log in or register to play."
				});
				return;
			}

			currentRoom = roomManager.isRoomMember(req.session.user.username);
			if(currentRoom == null){
				res.render("selectionRoom", {
					"loggued" : req.session.user,
					"languages" : supdraw.languages,
					"rooms" : roomManage.getRooms(),
					"infoMsg" : "You need to choose a room to play."
				});
			}
			
			//the player is in a room
			if (currentRoom.gameLeader == null //if there's no gameLeader in this room
			|| currentRoom.status == "newRound"){ //or we have to pick a new one
				roomManager.setRandomGameLeader(currentRoom.name, currentRoom.language);
			}

			var imGameLeader;
			if (currentRoom.gameLeader == req.session.user.username){ //it's me, mario!
				imGameLeader = true;
			} else {
				imGameLeader = false;
			}
			
			if (imGameLeader){
				var thingToDraw = supdraw.getDrawingSubject(currentRoom.language);
				currentRoom.thingToDraw = thingToDraw;
				res.render("gameRoom", {
					"loggued" : req.session.user,
					"players" : currentRoom.players,
					"room" : currentRoom,
					"gameLeader" : imGameLeader,
					"headerTitle" : "You're the drawer",
					"headerSubtitle" : "You have to draw "+ thingToDraw
				});
			} else {
				res.render("gameRoom", {
					"loggued" : req.session.user,
					"players" : currentRoom.players,
					"room" : currentRoom,
					"gameLeader" : imGameLeader,
					"headerTitle" : "You're a guesser",
					"headerSubtitle" : "Just enter your guessings in the chat."
				});
			}			
		}
}