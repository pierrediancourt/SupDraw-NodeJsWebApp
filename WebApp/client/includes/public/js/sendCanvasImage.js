(function(){
    var interval = setInterval(function(){if(document.readyState == "complete") onReady()},11);
    function onReady(){
        clearInterval(interval);    		

		function refresh(){
			var data = canvas.toDataURL();  //png by default. changeable like : "image/jpeg"
			chanSocket.emit("sendImage", { 
				"image" : data
			});
		}

		window.setInterval(refresh, 500);
    };
})()