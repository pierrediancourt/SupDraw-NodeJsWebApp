var min = 1;
var sec = 30;
var countdown = true;

function clock(){
	if(countdown == true){
		sec--;
		if(sec <= 0){
			if(min <= 0){
				countdown = false;
			} else {
				sec = 60;
				min--;
			}
		}
	} else if(countdown == false) {
		//alert("time's up!");
		countdown = null;
	} else {
		clearInterval(countdownInterval);
		//window.location = "/gameRoom";
	}
	document.getElementById("clock").innerHTML= min+" min "+sec+" sec";
}

var countdownInterval = window.setInterval(clock, 1000);