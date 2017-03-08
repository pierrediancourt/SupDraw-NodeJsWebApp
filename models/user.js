var supdraw = require("../index"); // get access to the globals etc by requiring what the "main" wanna share

var mongoose = supdraw.mongoose;
var Schema = supdraw.mongoose.Schema;


var UserSchema = new Schema({
	username : String,
	password : String,
	language : String,
	registrationDate : {type : Date, default : Date.now}
});

var UserModel = mongoose.model('User',UserSchema);

module.exports = UserModel;