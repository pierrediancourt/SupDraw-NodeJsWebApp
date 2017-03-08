var rooms;
var socketio = require("socket.io");
var io;
var channel;
var messages = [];

module.exports = function(server, allRooms){
	io = socketio.listen(server);
	rooms = allRooms;
	//connection();
	//defineBehavior();
}

function connection(){
	io.on("connection", function(socket){
		//once a client has connected, we expect to get a ping from them saying what room they want to join
		initialisation(socket);
	});
}

function initialisation(socket){
	socket.on("initialisation", function(data){
		console.log("[LOG] initialisation of the room : "+data.roomName+" of language "+data.roomLanguage);
		//data contains playerName, roomLanguage, roomName
		channel = "/"+data.roomName+"_"+data.roomLanguage;
		socket.join(channel);
		/*for (var i = rooms.length -1; i >= 0; i--){
		if (rooms[i].gameLeader == data.playerName){
			manageClock(data, chanSock);
			}
		}*/
	});
}

function defineBehavior(){

var namespace = io
  .of(channel)
  .on('connection', function(socket) {
  	console.log("someone connected to the channel "+channel)
    socket.on('message', function(data) {
    	console.log("sending message to everybody");
    	socket.broadcast.send(data);
    });
    socket.on('disconnect', function() {
    	console.log("disconnected");
    	socket.broadcast.send('disconnected');
    });
  });




io.of(channel).emit("receiveMessages", {
	"messages": messages
});

io.of(channel).on("quitting", function(data){
	console.log("someone is quitting")
	for (var i = rooms.length - 1; i >= 0; i--){
		if (rooms[i].name == data.roomName
		&& rooms[i].language == data.roomLanguage){
			//feed the stats here before deleting the room by getting the scores and usernames of the player object
			rooms.splice(i,1); //we delete the room
			console.log("[LOG] room : " + data.roomName + " of language "+ data.roomLanguage+" has been destroyed");
		
			//do leaver statistic reporting here using data.playerName
			socket.broadcast.emit("quitting", {
				"information" : "player "+data.playerName+" has quit the game, you will be redirected."
			});
			console.log("[LOG] player : " + data.playerName + " has quit the room "+ data.roomName+" of language : "+ data.roomLanguage);
			//clearInterval(countdownInterval); //stopping the room clock
			chanSocket.disconnect();
			//socket.disconnect; //????????????????????????????????????????????????????????????????????
		}
	}	
});

io.of(channel).on("sendImage", function(data){
	console.log("[LOG] server received an image");		
	chanSocket.broadcast.emit("receiveImage", {	
		"image" : data.image
	});
	console.log("[LOG] server broadcasted an image");
});

io.of(channel).on("sendMessage", function(data){
	console.log("[LOG] server received the message " + data.message);
	if (typeof(data.message) === "string" && data.message != ""){
		var player;
		var thingToDraw;
		//getting the thingToDraw of the room in which the user sending the message is and the player object
		for (var i = rooms.length -1; i >= 0; i--){
			for (var j = rooms[i].players.length - 1; j >= 0; j--){
				if (rooms[i].players[j].name == data.username){
					thingToDraw = rooms[i].thingToDraw;
					player = rooms[i].players[j];
				}
			}
		}
		//checking if user won
		if (data.message == thingToDraw){ 
			player.score++;
			messages.push(data.message);
			chanSocket.broadcast.emit("receiveMessage", {
				"message" : data.message,
				"username" : data.username
			});
			chanSocket.broadcast.emit("nextRound", {
				"information" : "Round ended, player "+player.name+" won ! The page will refresh and a new round will begin."
			});
			chanSocket.emit("nextRound", {
				"information" : "Round ended, you won ! The page will refresh and a new round will begin."
			});
			//clearInterval(countdownInterval); //stopping the room clock
			chanSocket.disconnect();
			//socket.disconnect; //????????????????????????????????????????????????????????????????????????????
		}
		//user didnt win 
		else { 
			messages.push(data.message);
			chanSocket.broadcast.emit("receiveMessage", {
				"message" : data.message,
				"username" : data.username
			});
			console.log("[LOG] server sent the message " +data.message+" said by " +data.username+ " to everybody"); 
		}
	}
});
}

/*
function manageSendMessage(chanSocket){
	chanSocket.on("sendMessage", function(data){
		console.log("[LOG] server received the message " + data.message);
		if (typeof(data.message) === "string" && data.message != ""){
			var player;
			var thingToDraw;
			//getting the thingToDraw of the room in which the user sending the message is and the player object
			for (var i = rooms.length -1; i >= 0; i--){
				for (var j = rooms[i].players.length - 1; j >= 0; j--){
					if (rooms[i].players[j].name == data.username){
						thingToDraw = rooms[i].thingToDraw;
						player = rooms[i].players[j];
					}
				}
			}
			//checking if user won
			if (data.message == thingToDraw){ 
				player.score++;
				messages.push(data.message);
				chanSocket.broadcast.emit("receiveMessage", {
					"message" : data.message,
					"username" : data.username
				});
				chanSocket.broadcast.emit("nextRound", {
					"information" : "Round ended, player "+player.name+" won ! The page will refresh and a new round will begin."
				});
				chanSocket.emit("nextRound", {
					"information" : "Round ended, you won ! The page will refresh and a new round will begin."
				});
				//clearInterval(countdownInterval); //stopping the room clock
				chanSocket.disconnect();
				//socket.disconnect; //????????????????????????????????????????????????????????????????????????????
			}
			//user didnt win 
			else { 
				messages.push(data.message);
				chanSocket.broadcast.emit("receiveMessage", {
					"message" : data.message,
					"username" : data.username
				});
				console.log("[LOG] server sent the message " +data.message+" said by " +data.username+ " to everybody"); 
			}
		}
	});
}*/

/*function manageClock(data, chanSocket){
	var min = 1;
	var sec = 30;
	var countdown = true;

	function clock(){
		if(countdown == true){
			sec--;
			if(sec <= 0){
				if(min <= 0){
					countdown = false;
				} else {
					sec = 60;
					min--;
				}
			}
		} else {
			io.of("/"+data.roomName+"_"+data.roomLanguage).emit("nextRound", {
				"information" : "Round ended, the page will refresh and a new round will begin."
			});
			clearInterval(countdownInterval); //stopping the room clock
			//chanSock.disconnect();
			chanSocket.disconnect;
		}
	}
	var countdownInterval = setInterval(clock, 1000);
}*/