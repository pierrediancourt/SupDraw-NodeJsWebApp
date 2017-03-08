//included for all users

var room;
var chatContent = $('#chatContent');
var quittingReason = "";

//called by all users
function init(pname, rname, rlanguage){
	channel = "/"+rname+"_"+rlanguage;

	console.log("connection to room "+channel);
	room = io.connect(location.origin + channel);

	console.log("sending join room event to server")
	room.emit('joinRoom', channel);

	room.on('connect', function() {
		console.log("received connect event from server");
		chatContent.append($('<p>').text('server connection initialized').prepend($('<span>').text('system : ')));
	});

	room.on('welcome', function(msg) {
		chatContent.append($('<p>').text(msg).prepend($('<span>').text('system : ')));
	});

	room.on('joined', function(username){
		updateScores(username, 0);
	});

	room.on('message', function(msg) {
		console.log("received user message from server : "+JSON.stringify(msg));
		chatContent.append($('<p>').text(msg.message).prepend($('<span>').text(msg.username+': ')));
		chatContent.scrollTop(chatContent[0].scrollHeight);
	});


	room.on("leaver", function(msg){
		console.log("received leaver message from server : "+JSON.stringify(msg));
		chatContent.append($('<p>').text(msg.message).prepend($('<span>').text(msg.username+': ')));
		chatContent.scrollTop(chatContent[0].scrollHeight);
		updateScores(msg.username);
	});

	room.on("quit", function(reason){
		if(reason == "newRound"){
			quittingReason = "newRound";
			window.location = "/gameRoom";
		}
		if(reason == "endGame"){
			quittingReason = "endGame";
			window.location = "/selectionRoom";
		}		
	})

	submitMessage();
	quittingPage();
}

//initialisations
function submitMessage(){
	$('#chatForm').submit(function(e) {
		e.preventDefault();
		var textObj = $('#message');
		var msg = textObj.val();
		if ($.trim(msg) !== '') {
			textObj.val('');
			console.log("sending message to server : "+msg);
			room.emit('fromClient', msg);
			chatContent.append($('<p>').text(msg).prepend($('<span>').text('me : ')));
			chatContent.scrollTop(chatContent[0].scrollHeight);
		}
	});	
}

function quittingPage(){
	window.onbeforeunload = function(e){
		if (quittingReason != "newRound"
		&& quittingReason != "endGame"){
			console.log("we are sending message quitting to server");
			room.emit("quitting");
		}
		//quittingReason = ""; //necessary?
		room.disconnect();
	}
}

//utils
function updateScores(username, score){
	var scoreTable = $('#scoreTable');

	if(typeof(username) !== "undefined"
	&& username != ""){
		if(typeof(score) !== "undefined" 
		&& score >= 0){
			console.log("adding user to score table");
			var rowCount = scoreTable.find("tr").length;
			var position = $('<td>').text(rowCount);
			var user = $('<td>').text(username);
			var points = $('<td>').addClass("score").text(score);
			var row = $('<tr>').append(position).append(user).append(points);
			scoreTable.find("tbody").append(row);
		}else{
			console.log("updating table because user left")
			var nameTableData = scoreTable.find("td.name");
			for(var i=0; i < nameTableData.length; i++){
				if(nameTableData.eq(i).html() == username){
					nameTableData.eq(i).html(username+ " (left)");
				}
			}
		}
	}

	//works but useless because we reload page after each point
	/*console.log("sorting table");
	function sortNum(a, b) {
        return 1 * $(a).find('.score').text() < 1 * $(b).find('.score').text() ? 1 : 0;
    }

    function sortTheTable(){
        $(function() {
            var elems = $.makeArray($('tr:has(.score)').remove())
            
            elems.sort(sortNum)
            scoreTable.append($(elems));
        });
    }

    sortTheTable();*/
}