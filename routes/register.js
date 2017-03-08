//implicitely find the files to render in /client/views because of the jade related configuration in the server.js
var supdraw = require("../index"); // get access to the globals etc by requiring what the "main" wanna share
var userModel = supdraw.models.user;

var User = null;
var errorMsg = "";
var infoMsg = "";

module.exports = {
	get : function(req, res) {
			if (req.session.user != null){
				res.render("selectionRoom", {
					"loggued" : req.session.user,
					"infoMsg" : "You are already connected. No need to register."
				});
			} else {			
				renderPage(req, res);
			}
		},

	post : function(req, res) {
			if(req.body.username == ""
			|| req.body.password1 == ""
			|| req.body.password2 == ""){
				infoMsg = "Please fill in all the fields.";
				renderPage(req, res);
				return;
			}

			if(arePasswordsValid(req.body.password1, req.body.password2)){
				userModel.findOne({ "username" : req.body.username }, function(error, obj){
					if (error){
						throw error;		
					} else {
						if (obj == null){
							createUser(req.body.username,
								supdraw.hasher(req.body.password1),
								req.body.language,
								req, res);
							return;
						} else {
							errorMsg = "The username you entered already exists.";
							renderPage(req, res);
						}
					}
				});
			} else {
				errorMsg = "The passwords you entered aren't the same.";
				renderPage(req, res);
			}
		}
}


function renderPage(req,res){
	res.render("register", {
		"loggued" : req.session.user,
		"languages" : supdraw.languages,
		"errorMsg" : errorMsg,
		"infoMsg" : infoMsg
	});
	errorMsg = "";
	infoMsg = "";
}

function arePasswordsValid(password1, password2){
	if (password1 === password2) {
		return true;
	}
	return false;
}

function createUser(username, password, language,req,res){
	var User = new userModel({ "username" : username, "password" : password, "language" : language });
	User.save(function(error, obj){
		if (error){
			throw error;
		} 
		else {
			req.session.user = User;
			res.redirect("selectionRoom"); //browser redirect
			console.log("[LOG] registered user : "+ obj.username +" with password : "+ obj.password +" with langage : "+ obj.language);
		}
	});
}


