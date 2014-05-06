(function(){
    var interval = setInterval(function(){if(document.readyState == "complete") onReady()},11);
    function onReady(){
        clearInterval(interval);    
      	
		var canvas = document.getElementById("canvas");
		var context = canvas.getContext("2d");

		chanSocket.on("receiveImage", function(data){//, callback){
			var image = new Image();
			image.src = data.image;
			context.drawImage(image,0,0);
			// callback({ status : "success" });
		});
    };
})()

