/** 
	Imports & Exports
 */
	// npm installed modules dependencies
var express = require("express"),
	http = require("http"),
	path = require("path"),
	mongoose = require("mongoose"),
	crypto = require('crypto'),
	io = require("socket.io"),
	requireDir = require("require-dir"); //permit to require() implicitly all the files in a directory (normaly only index.js is loaded or if none, it crashes)

	// custom modules dependencies
var configuration = require("./globals/configuration"),
	languages = require("./globals/languages"),
	drawingTopics = require("./globals/drawingTopics");

module.exports.mongoose = mongoose; //for the files in ./models
var models = requireDir("./models");
module.exports.models = models; //for the files in ./routes
module.exports.languages = languages; //for the file register.js in ./routes and maybe other ones
var rooms = new Array();
module.exports.rooms = rooms; //for the file selectionRoom.js in ./routes and maybe other ones
module.exports.drawSomething = function (language){ //for the file gameRoom.js
	if (language == "french"){
		var randomIndex = Math.floor(Math.random()*drawingTopics.french.length);
		return drawingTopics.french[randomIndex];
	} else if (language == "english"){
		var randomIndex = Math.floor(Math.random()*drawingTopics.english.length);
		return drawingTopics.english[randomIndex];
	} else {
		console.log("[LOG] not all the languages are currently supported");
		return null;
	}
}; 
module.exports.hasher = function (clearString){ //for the files login.js and register.js
	var hashType = crypto.createHash("md5");
	var dataToHash = hashType.update("MySUP3Rs4lt" + clearString);
	var hashedString = dataToHash.digest("hex");
	return hashedString;
};
var	routes = requireDir("./routes");

/** 
	Database connection
*/
mongoose.connect("mongodb://" + configuration.DBaddress +"/"+ configuration.DBname);

/** 
	Static variables declaration
*/
var	app = express(),
	server = http.createServer(app),
	root = __dirname;
	
// allowing any js knowing the path to this "main" to get access to the globals etc without knowing the path to any of them




// server configuration
io = io.listen(server);
server.listen(configuration.port);
console.log("[LOG] using port : " + configuration.port);
app.use(express.favicon(configuration.favicon));

app.set('view engine', 'jade'); // make interpret template names without extension as ones ending with jade
app.set("views", path.join(root,"/client/views")); // by default /views, so it needed to be explicitly defined
app.engine(".jade", require("jade").__express); // render templates ending with .jade using jade (module imported in live when needed and pages cached)

app.use(express.cookieParser()); //required for using sessions
app.use(express.session({secret : "D0N0TH4CKTH1S"})); //enable using sessions
app.use(express.bodyParser()); //permit Post parameters parsing/retrieving
app.use(app.router);
app.use('/public', express.static(path.join(root,"/client/includes/public"))); //allow clients to get the files they need to render the pages (css, client js)



// routes definition
app.get("/", function(req,res) {
	routes.index.get(req,res);
});
app.get("/index", function(req,res) {
	routes.index.get(req,res);
});
app.get("/ladder", function(req,res) {
	routes.ladder.get(req,res);
});
app.get("/disconnect", function(req,res) {
	routes.disconnect.get(req,res);
});
app.get("/profile", function(req,res) {
	routes.profile.get(req,res);
});

app.get("/register", function(req,res) {
	routes.register.get(req,res);
});
app.post("/register", function(req,res) {
	routes.register.post(req,res);
});

app.get("/login", function(req,res) {
	routes.login.get(req,res);
});
app.post("/login", function(req,res) {
	routes.login.post(req,res);
});

app.get("/gameRoom", function(req,res) {
	routes.gameRoom.get(req,res);
});
app.post("/gameRoom", function(req,res) {
	routes.gameRoom.post(req,res);
});

app.get("/selectionRoom", function(req,res) {
	routes.selectionRoom.get(req,res);
});
app.post("/selectionRoom", function(req,res) {
	routes.selectionRoom.post(req,res);
});


//io.of("/privateChannel").on("connection", function(socket){		//for creating private socket channels, one for each gameRoom

//})

io.sockets.on("connection", function(socket){
	var messages = [];
	socket.on("initialisation", function(data){

		var chanSock = null;

		for (var i = rooms.length -1; i >= 0; i--){
			if (rooms[i].gameLeader == data.playerName){
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
						socket.disconnect;
					}
				}
				var countdownInterval = setInterval(clock, 1000);
			}
		}
		
		console.log("[LOG] initialisation of the room : "+data.roomName+" of language "+data.roomLanguage);
		io.of("/"+data.roomName+"_"+data.roomLanguage).on("connection", function(chanSocket){
			chanSock = chanSocket;

			chanSocket.emit("receiveMessages", {
				"messages": messages
				});
			console.log("[LOG] send all messages");

			chanSocket.on("sendImage", function(data){
				console.log("[LOG] receiving image ");
				chanSocket.broadcast.emit("receiveImage", {	
					"image" : data.image
				});
				console.log("[LOG] sent image by broadcast ");
			});

			chanSocket.on("sendMessage", function(data){
				console.log("[LOG] receiving message ");
				if (typeof data.message == "string" && data.message != ""){
					var player;
					var thingToDraw;
					for (var i = rooms.length -1; i >= 0; i--){  //getting the thingToDraw of the room in which the user sending the message is
						for (var j = rooms[i].players.length - 1; j >= 0; j--){
							if (rooms[i].players[j].name == data.username){
								thingToDraw = rooms[i].thingToDraw;
								player = rooms[i].players[j];
							}
						}
					}
					if (data.message == thingToDraw){	//checking if someone won
						player.score++;
						messages.push(data.message);
						chanSocket.broadcast.emit("nextRound", {
							"information" : "Round ended, player "+player.name+" won ! The page will refresh and a new round will begin."
						});
						chanSocket.emit("nextRound", {
							"information" : "Round ended, you won ! The page will refresh and a new round will begin."
						});
						clearInterval(countdownInterval); //stopping the room clock
						chanSocket.disconnect();
						socket.disconnect;
					} else {
						messages.push(data.message);
						chanSocket.broadcast.emit("receiveMessage", {
							"message" : data.message,
							"username" : data.username
						});
						console.log("[LOG] sent message to everybody "); 
					}
				}
			});

			chanSocket.on("quitting", function(data){
				for (var i = rooms.length - 1; i >= 0; i--){
					if (rooms[i].name == data.roomName
					&& rooms[i].language == data.roomLanguage){
						//feed the stats here before deleting the room by getting the scores and usernames of the player object
						rooms.splice(i,1); //we delete the room
						console.log("[LOG] room : " + data.roomName + " of language "+ data.roomLanguage+" has been destroyed");
					

						//do leaver statistic reporting here using data.playerName
						chanSocket.broadcast.emit("quitting", {
							"information" : "player "+data.playerName+" has quitted the game, you will be redirected."
						});
						console.log("[LOG] player : " + data.playerName + " quit the room "+ data.roomName+" of language : "+ data.roomLanguage);
						clearInterval(countdownInterval); //stopping the room clock
						chanSocket.disconnect();
						socket.disconnect;
					}
				}	
			});
		}); //endOf io.of()
	});
});