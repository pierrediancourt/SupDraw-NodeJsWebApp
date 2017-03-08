//implicitely find the files to render in /client/views because of the jade related configuration in the server.js

var players = [ "mario", "germaine", "george" ];

module.exports = {
	get : function(req, res) {
			res.render("ladder", {
				"loggued" : req.session.user,
				"players" : players
			});
		}
}