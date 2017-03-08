//implicitely find the files to render in /client/views because of the jade related configuration in the server.js

module.exports = {
	get : function(req,res) {
			res.render("index", {
				"loggued" : req.session.user
			});
		}
}