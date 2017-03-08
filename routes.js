var requireDir = require("require-dir"); //permit to require() implicitly all the files in a directory (normaly only index.js is loaded or if none, it crashes)
var	routes = requireDir("./routes");

function configuration(app){
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
}

module.exports = configuration