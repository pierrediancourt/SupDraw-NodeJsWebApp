//implicitely find the files to render in /client/views because of the jade related configuration in the server.js

module.exports = {
	get : function(req,res) {
			if (req.session.user != null){
				req.session.user = null;
				res.render("index", {
					"loggued" : req.session.user,
					"successMsg" : "You were successfully disconnected."
				});
			} else {
				res.render("index", {
					"loggued" : req.session.user,
					"infoMsg" : "You weren't connected, no need to disconnect."
				});
			}		
		}
}