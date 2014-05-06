chanSocket.on('receiveMessage', function (data) {
	addMessage(data.message,data.username);
});

chanSocket.on('receiveMessages', function (data) {
	for (var i = 0; i < data.messages.length; i++) {
		addMessage(data.messages[i], null);
	}
});

function validateForm(username) {
	var enteredMessage = document.getElementById("message");
	var message = enteredMessage.value;
	if (typeof message == "string" && message != "") {
		chanSocket.emit("sendMessage", {
			"message": message,
			"username" : username
		});
		enteredMessage.value = "";
		addMessage(message, username);
	}
	return false;
}

function addMessage(message, username) {
	var displayMessages = document.getElementById("messages")
	if (typeof message == "string" && message != "") {
		if (username != null){
			displayMessages.innerHTML += "<div class=\"message\" style=\"max-width:170px;word-wrap:break-word;\" >"+ username + " : "+ message +"</div>";
			displayMessages.scrollTop = displayMessages.scrollHeight;
		} else {
			displayMessages.innerHTML += "<div class=\"message\" style=\"max-width:170px;word-wrap:break-word;\" >"+ "old : " + message +"</div>";
			displayMessages.scrollTop = displayMessages.scrollHeight;
		}
	}
}