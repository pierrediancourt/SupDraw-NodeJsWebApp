//implicitely find the files to render in /client/views because of the jade related configuration in the server.js

module.exports = {
	get : function(req,res) {
			if (req.session.user == null){
				res.render("index", {
					"loggued" : req.session.user,
					"infoMsg" : "You need to log in to view your profile."
				});
			} else {				
				res.render("profile", {
					"loggued" : req.session.user
				});
			}
		}
}