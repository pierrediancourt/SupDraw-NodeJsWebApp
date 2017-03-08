var cookieParser = require('cookie-parser');
var cookie = require('cookie');
var supdraw = require("./index");

var roomManager = supdraw.roomManager;
var getUsernameWithCookie = supdraw.getUsernameWithCookie;

var io;
var joinedRoom = null;

var gameLeader;
var roomName;
var roomLanguage;

var channel = "/"
var socketId;

function configuration(server){
	var socketio = require("socket.io");
	io = socketio.listen(server);	

	io.set("authorization", function (handshake, callback) { 
		var sid;   
	    if(handshake.headers.cookie){
	    	var parsedCookie = cookie.parse(handshake.headers.cookie);
			sid = cookieParser.signedCookie(parsedCookie['supdraw.sid'], "D0N0TH4CKTH1S");

			if(typeof(sid) === "undefined" || sid == ""){
				return callback("Cookie is invalid", false)
			}

		    if (parsedCookie['supdraw.sid'] == sid) { 
		    	//because if cookieParser.signedCookie failed unsigning the cookie, it returns the unmodified value
		    	return callback("Cookie is invalid", false);
		    }
	    }
	    else{
	    	console.log("No cookie transmitted");
	    	return callback("No cookie transmitted", false);
	    }
	    callback(null, true);
    });
}

function createRoom(room, callback){
	channel = '/'+room.name+"_"+room.language;
	gameLeader = room.gameLeader;
	roomName = room.name;
	roomLanguage = room.language;

	var Room = io
	.of(channel)
	.on('connect', function(socket) {
		var username = getUsernameWithCookie(socket.handshake.headers.cookie);
		console.log("[LOG] new websocket room : "+room.name+" with gameLeader "+room.gameLeader);
		console.log("connected to socket id : "+socket.id); //plop_french#Ftn9Rwq0teFCisXCAAAB
		socketId = socket.id;

		onJoinRoom(socket, username);
		onFromClient(socket, username);
		onQuitting(socket, username);
		onSendImage(socket, username);
		
	});
	//console.log("created new websocket room of namespace "+Room.name);
	callback(null, Room.name);
}

function onSendImage(socket, username){
	socket.on("sendImage", function(data){
		//verifying that the sender is really the gameLeader of the room
		if(username == gameLeader){
			//console.log("[LOG] server received an image");		
			socket.broadcast.to(joinedRoom).emit("receiveImage", data);
			//console.log("[LOG] server broadcasted an image");
		}
	});
}

function onJoinRoom(socket, username){
	socket.on('joinRoom', function(roomName) {
		console.log("received join room : "+roomName+" from user "+username);
		/*if (!!joinedRoom) { //this converts a value to a boolean and ensures a boolean type.
			socket.leave(joinedRoom);
			socket.emit('joined', "You've left the room : "+joinedRoom);
			socket.broadcast.to(joinedRoom).send(username+' left this room');
			joinedRoom = null;
		}*/

		socket.join(roomName);
		joinedRoom = roomName;
		console.log("sending joined message : "+roomName);
		socket.emit('welcome', "You joined the room : "+roomName);
		socket.broadcast.to(joinedRoom).send({username: "server", message: username+' joined the game'});
		socket.broadcast.to(joinedRoom).emit("joined", username);
	});
}

function onFromClient(socket, username){
	socket.on('fromClient', function(data) {
		console.log("received fromclient message : "+data+" from user "+username);
		if (joinedRoom) {
			console.log("forwarding message to other members of the room");
			socket.broadcast.to(joinedRoom).send({username: username, message: data});
		} else {
			socket.send({username: "server", message: "You haven't joined a room yet. Push join room to join a room"});
		}
	});
}

function onQuitting(socket, username){
	socket.on("quitting", function(){
		//feed the stats here before deleting the room by getting the scores and usernames of the player object
		//do leaver statistic reporting here
		console.log("[LOG] user : " +username+ " has quit the room "+joinedRoom);
		socket.leave(joinedRoom);

		var remainingUsersCount;
		if(typeof(io.nsps[channel].adapter.rooms[channel]) !== "undefined"){
			remainingUsersCount = io.nsps[channel].adapter.rooms[channel].length;
			console.log("[LOG] remaining users in room : " +remainingUsersCount); //number of person connected to namespace and in room
			//console.log(io.sockets.adapter.rooms) //idk what it represents
			//var nspSockets = io.of(channel).sockets;
			//console.log(Object.keys(nspSockets).length) //number of person connected to namespace
			//console.log(Object.keys(io.sockets.connected).length) //total number of person connected?
		}
		if(remainingUsersCount < 2 || username == gameLeader){
			socket.broadcast.to(joinedRoom).emit("quit", "endGame");
			//game ends, room is closed
			console.log("[LOG] closing room "+roomName+" of language "+roomLanguage);
			roomManager.closeRoom(roomName, roomLanguage);
			socket.disconnect();
		}
		else{
			//room isnt closed, enough people remaining in it
			console.log("notifying other members of the room");
			socket.broadcast.to(joinedRoom).send({username: username, message: " has quit the game"});
		}
	});
}

function newRound(){
	socket.broadcast.to(joinedRoom).emit("quit", "newRound");
}

function startGame(room){

}

module.exports = {
	configuration,
	createRoom,
	newRound,
	startGame
}