//included for the gameLeader only

(function(){
    var interval = setInterval(function(){if(document.readyState == "complete") onReady()},11);
    function onReady(){
        clearInterval(interval);    		

		function refresh(){
			var data = canvas.toDataURL();  //png by default. changeable like : "image/jpeg"
			room.emit("sendImage", data);
		}

		window.setInterval(refresh, 40);
    };
})()