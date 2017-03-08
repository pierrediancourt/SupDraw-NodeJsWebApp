/** 
	Imports & Exports
 */
	// npm installed modules dependencies
var express = require("express"),
	http = require("http"),
	path = require("path"),
	mongoose = require("mongoose"),
	crypto = require('crypto'),
	favicon = require("serve-favicon"),
	cookieParser = require("cookie-parser"),
	cookie = require('cookie');
	bodyParser = require("body-parser"),
	session = require("express-session"),
	requireDir = require("require-dir"); //permit to require() implicitly all the files in a directory (normaly only index.js is loaded or if none, it crashes)

	// custom modules dependencies
var configuration = require("./globals/configuration"),
	languages = require("./globals/languages"),
	drawingTopics = require("./globals/drawingTopics");

module.exports.mongoose = mongoose; //for the files in ./models
module.exports.models = requireDir("./models"); //for the files in ./routes
module.exports.languages = languages; //for the file register.js in ./routes and maybe other ones

module.exports.roomManager = require("./roomManager");

var sessionIdArray = new Array();
module.exports.getUsernameWithCookie = function (cookies){
	var parsedCookie = cookie.parse(cookies);
	for(var i=0; i < sessionIdArray.length; i++){
		if(sessionIdArray[i].cookie == parsedCookie['supdraw.sid']){
			return sessionIdArray[i].username;
		}	
	}
	return null;
}
module.exports.setUsernameWithCookie = function (cookies, username){
	//make sure we're authentified before calling this function so we can store the username and cookie in the array
	var parsedCookie = cookie.parse(cookies);
	var sessionIdObject = {
		"username" : username,
		"cookie" : parsedCookie['supdraw.sid']
	}
	for(var i=0; i < sessionIdArray.length; i++){
		if(sessionIdArray[i].username == username){
			sessionIdArray.splice(i, 1); //remove entry
			console.log("[LOG] removed entry in sessionIdArray");
		}
	}
	console.log("[LOG] adding entry in sessionIdArray : "+JSON.stringify(sessionIdObject));
	sessionIdArray.push(sessionIdObject);
}

module.exports.getDrawingSubject = function (language){ //for the file gameRoom.js
	if (language == "french"){
		var randomIndex = Math.floor(Math.random()*drawingTopics.french.length);
		return drawingTopics.french[randomIndex];
	} else if (language == "english"){
		var randomIndex = Math.floor(Math.random()*drawingTopics.english.length);
		return drawingTopics.english[randomIndex];
	} else {
		console.log("[LOG] not all the languages are currently supported");
		throw "This language is not supported."
	}
}; 
module.exports.hasher = function (clearString){ //for the files login.js and register.js
	var hashType = crypto.createHash("sha256");
	var dataToHash = hashType.update("MySUP3Rs4lt" + clearString);
	var hashedString = dataToHash.digest("hex");
	return hashedString;
};

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
server.listen(configuration.port);
console.log("[LOG] using port : " + configuration.port);
app.use(favicon(configuration.favicon));

app.set('view engine', 'jade'); // make interpret template names without extension as ones ending with jade
app.set("views", path.join(root,"/client/views")); // by default /views, so it needed to be explicitly defined
app.engine(".jade", require("jade").__express); // render templates ending with .jade using jade (module imported in live when needed and pages cached)

app.use(cookieParser()); //required for using sessions
app.use(session({secret : "D0N0TH4CKTH1S", key: "supdraw.sid"})); //enable using sessions
app.use(bodyParser()); //permit Post parameters parsing/retrieving
app.use('/public', express.static(path.join(root,"/client/includes/public"))); //allow clients to get the files they need to render the pages (css, client js)

// routes definition
require("./routes")(app);

//websockets definition
require("./websockets").configuration(server);