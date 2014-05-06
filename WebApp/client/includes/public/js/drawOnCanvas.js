var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var color = "black",
    size = 2;

window.onload = function(){
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    w = canvas.width;
    h = canvas.height;

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
}

function erase(){
    if (confirm("Confirm to clear all the drawing surface.")){
        ctx.clearRect(0, 0, w, h);
    }
}

function resize(obj){
    switch (obj.id) {
        case "small":
            size = 2;
            break;
        case "medium":
            size = 4;
            break;
        case "tall":
            size = 8;
            break;
       }
}

function colorize(obj){
    switch (obj.id) {
        case "green":
            color = "green"; //works with rgb(0,255,0) too or hexadecimal value like : #00ff00
            break;
        case "lightgreen":
            color = "lightgreen";
            break;
        case "blue":
            color = "blue";
            break;
        case "lightblue":
            color = "lightblue";
            break;
        case "red":
            color = "red";
            break;
        case "hotpink":
            color = "hotpink";
            break;
        case "lightpink":
            color = "lightpink";
            break;        
        case "yellow":
            color = "yellow";
            break;
        case "orange":
            color = "orange";
            break;
        case "black":
            color = "black";
            break;
        case "grey":
            color = "grey";
            break;
        case "lightgrey":
            color = "lightgrey";
            break;
        case "white":
            color = "white";
            break;
    }
}

function draw(){
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.stroke();
    ctx.closePath();
}

function findxy(res, e){
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.offsetLeft;
        currY = e.clientY - canvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;
            draw();
        }
    }
}


