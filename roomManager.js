var rooms = new Array();

function isRoomMember(username) {
	for (var i = rooms.length - 1; i >= 0; i--){
		for (var j = rooms[i].players.length - 1; j >= 0; j--){
			if (rooms[i].players[j].name == username){
				return rooms[i];
			}
		};
	};	
	return null;
}

function setRandomGameLeader(roomName, roomLanguage){
	for (var i = rooms.length - 1; i >= 0; i--){
		if (rooms[i].name == roomName
		&& rooms[i].language == roomLanguage){
			currentRoom = rooms[i]
			var randomIndex = Math.floor(Math.random()*currentRoom.players.length);
			currentRoom.gameLeader = currentRoom.players[randomIndex].name;  //random user is declared as drawer
			console.log("[LOG] new gameLeader : "+ currentRoom.players[randomIndex].name+" for room "+currentRoom.name);
		}
	};
}

function getRoom(roomName, roomLanguage){
	for (var i = rooms.length - 1; i >= 0; i--){
		if (rooms[i].name == roomName
		&& rooms[i].language == roomLanguage){
			return rooms[i];
		}
	};
	return null;
}

function closeRoom(roomName, roomLanguage){
	for (var i = rooms.length - 1; i >= 0; i--){
		if (rooms[i].name == roomName
		&& rooms[i].language == roomLanguage){
			var room = rooms[i];
			rooms.splice(i, 1);
			return room;
		}
	};
	return null;
}

function openRoom(roomName, roomLanguage, gameLeader){
	var players = new Array();
	var player = {
		"name" : gameLeader,
		"score" : 0
	}
	players.push(player);
	var room = {
		"name" : roomName,
		"language" : roomLanguage,
		"players" : players,
		"status" : "waiting",
		"thingToDraw" : "",
		"gameLeader" : gameLeader
	}
	rooms.push(room);
	return room;
}

function getRooms(){
	return rooms;
}

module.exports = {
	isRoomMember,
	closeRoom,
	getRoom,
	openRoom,
	getRooms
}