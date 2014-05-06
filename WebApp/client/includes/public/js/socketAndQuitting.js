var playerName = "";
var roomName = "";
var roomLanguage = "";
var quittingReason = "";
var chanSocket = null;

function init(pname,rname,rlanguage){
	playerName = pname;
	roomName = rname;
	roomLanguage = rlanguage;
	var tmpString = "/"+roomName+"_"+roomLanguage;
	chanSocket = io.connect(tmpString);
				// , {
				// 	"force new connection": true  //avoid problems
				// });
			 //act the same as io.connect("http://localhost"); parameter is the string of the Channel
}

function initRoom(){
	var socket = io.connect(); //act the same as io.connect("http://localhost");
	socket.emit("initialisation", {
		"playerName" : playerName,
		"roomLanguage" : roomLanguage,
		"roomName" : roomName
	});
}
	
(function(){
    var interval = setInterval(function(){if(document.readyState == "complete") onReady()},11);
    function onReady(){
        clearInterval(interval); 

		window.onbeforeunload = function(e){
			if (quittingReason != "nextRound"
			&& quittingReason != "serverOrder"){
				// var bool = true;					//commented because of the google chrome behaviour
				// bool = confirm("Do you really want to quit the page ?");
				// if (bool){
					chanSocket.emit("quitting", {
						"playerName" : playerName,
						"roomName" : roomName,
						"roomLanguage" : roomLanguage
					});
					chanSocket = null;
				// } else {
				// 	return false;
				// }
			}
			quittingReason = "";
			chanSocket.disconnect();
			socket.disconnect();
		}

		chanSocket.on("quitting", function(data){
			alert(data.information);
			quittingReason = "serverOrder";
			window.location = "/selectionRoom";
		});

		chanSocket.on("nextRound", function(data){
			alert(data.information);
			quittingReason = "nextRound";
			window.location = "/gameRoom";
		});
    };
})()