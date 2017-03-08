//included for all users not gameLeader

(function(){
    var interval = setInterval(function(){if(document.readyState == "complete") onReady()},11);
    function onReady(){
        clearInterval(interval);    
      	
		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");

		room.on("receiveImage", function(data){
			var image = new Image();
			image.src = data;
			context.drawImage(image,0,0);
		});
    };
})()

