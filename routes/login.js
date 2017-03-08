//implicitely find the files to render in /client/views because of the jade related configuration in the server.js
var supdraw = require("../index"); // get access to the globals etc by requiring what the "main" wanna share
var user = supdraw.models.user;

var errorMsg = "";
var infoMsg = "";

module.exports = {
	get : function(req,res) {
			if (req.session.user == null){
				renderPage(req, res);
			} else {
				res.render("index", {
					"loggued" : req.session.user,
					"infoMsg" : "You are already connected. No need to log in."
				});
			}
		},

	post : function(req,res) {
			if (req.body.username == ""
			|| req.body.password == "") {
				errorMsg = "Please feed all the fields.";
				renderPage(req,res);
			}

			user.findOne({ 
					"username" : req.body.username,
					"password" : supdraw.hasher(req.body.password) 
				}, function(error, obj){
				if (error){
					throw error;
				} else {
					if (obj != null) {
						req.session.user = obj;
						res.redirect("selectionRoom"); //browser redirect
						console.log("[LOG] logged user : "+ obj.username +" with language : "+ obj.language);
					} else {
						errorMsg = "Wrong credentials.";
						renderPage(req, res);
					}
				}
			});
		}
}

function renderPage(req, res){
	res.render("login", {
		"loggued" : req.session.user,
		"errorMsg" : errorMsg,
		"infoMsg" : infoMsg
	});
	errorMsg = "";
	infoMsg = "";
}