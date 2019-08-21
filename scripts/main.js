var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext('2d');
var start =true;
var startPoint;
var endPoint;
var routes = new Array();
var canvasWidth = canvas.width;
var canvasHeight = canvas.height;
var topLeft = {"lat": 34.075915, "long":-118.453686};
var bottomRight = {"lat": 34.069157, "long":-118.440537}
var JSONData;
var currentCanvasX;
var currentCanvasY;
var startIcon = document.getElementById("start");
var endIcon = document.getElementById("end");
var searchStart = document.getElementById("searchStart");
var searchEnd = document.getElementById("searchEnd");
var selectionWindow = document.getElementById("selectionWindow");
var currentLocation = document.getElementById("current");
var timeText = document.getElementById("timeText");
var selectedLocation;
//Top left corner of canvas: 34.075915N, -118.453686W
//Bottom left corner of canvas: 34.069157, -118.440537
/*Ajax to get Json*/
$.ajax({
    url: 'json/document.json',
   dataType: 'json',
    type: 'get',
    cache: false,
    success: function(data) {
        JSONData = data;
    }
});

searchStart.addEventListener("click", function(evt) {
    if (searchBar.value == "Current Location") {
        startPoint = closestPoint(JSONData, currentCanvasX, currentCanvasY);
        startIcon.style.visibility = "visible";
        startIcon.style.left = currentCanvasX + 8 - startIcon.clientWidth/2 + "px";
        startIcon.style.top = currentCanvasY + 60 - startIcon.clientHeight + "px";
    } else {
        var found = false; //input validation
        $(pointsOfInterest).each(function(index, value) {
            if (value.name == searchBar.value) {
                selectedLocation = value;
                console.log(selectedLocation);
                found = true;
            }
        });
        if (found) {
            startIcon.style.visibility = "visible";
            startIcon.style.left = selectedLocation.x +8 - startIcon.clientWidth/2 + "px";
            startIcon.style.top = selectedLocation.y + 60 - startIcon.clientHeight + "px";
            startPoint = closestPoint(JSONData, selectedLocation.x, selectedLocation.y);
        }
    }
    if (endPoint != null) {
        fastestRoute(JSONData);
    }
    start = false;
});

searchEnd.addEventListener("click", function(evt) {
    if (searchBar.value == "Current Location") {
        endPoint = closestPoint(JSONData, currentCanvasX, currentCanvasY);
        endIcon.style.visibility = "visible";
        endIcon.style.left = currentCanvasX +8 - endIcon.clientWidth/2 + "px";
        endIcon.style.top = currentCanvasY + 60 - endIcon.clientHeight + "px";
    } else {
        var found = false;
        $(pointsOfInterest).each(function(index, value) {
            if (value.name == searchBar.value) {
                selectedLocation = value;
                console.log(selectedLocation);
                found = true;
            }
        });
        if (found) {
            endIcon.style.visibility = "visible";
            endIcon.style.left = selectedLocation.x +8 - endIcon.clientWidth/2 + "px";
            endIcon.style.top = selectedLocation.y + 60- endIcon.clientHeight + "px";
            endPoint = closestPoint(JSONData, selectedLocation.x, selectedLocation.y);
        }
    }
    if (startPoint != null) {
        fastestRoute(JSONData);
    }
    start = true;
    
});


getLocation();
var x = document.getElementById("demo");
function getLocation() {
  console.log("runs");
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(showPosition);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
    var currentCoords = {"lat": position.coords.latitude, "long": position.coords.longitude};
    if (position.coords.latitude < topLeft.lat && position.coords.latitude > bottomRight.lat && position.coords.longitude > topLeft.long && position.coords.longitude < bottomRight.long) {
        var pointY = (canvasHeight / Math.abs(topLeft.lat-bottomRight.lat))*(topLeft.lat-currentCoords.lat);
        var pointX = (canvasWidth / Math.abs(topLeft.long-bottomRight.long))*(currentCoords.long-topLeft.long);
        currentLocation.style.left = pointX + 8 - currentLocation.clientWidth/2 + "px";
        currentLocation.style.top = pointY + 60 - currentLocation.clientHeight/2 + "px"; 
        currentCanvasX = pointX;
        currentCanvasY = pointY;
    }
    //x.innerHTML = "Latitude: " + position.coords.latitude + 
    "<br>Longitude: " + position.coords.longitude;
}



/*jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse(), arguments);
};*/
function clearCanvas() {
     var c = document.getElementById("gameCanvas");
     var ctx = c.getContext("2d");
     ctx.clearRect(0, 0, c.width, c.height);
}
function drawLine(startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

canvas.addEventListener("click", function (evt) {
        var mouseX = evt.clientX-canvas.getBoundingClientRect().left;
        var mouseY = evt.clientY-canvas.getBoundingClientRect().top;
        console.log(JSONData);
        console.log("x = "+ mouseX + " y = " + mouseY);
        if (start) {
            startIcon.style.visibility = "visible";
            startIcon.style.left = mouseX +8 -  startIcon.clientWidth/2 + "px";
            startIcon.style.top = mouseY + 60 - startIcon.clientHeight + "px";
            console.log('start');
            startPoint = closestPoint(JSONData, mouseX, mouseY);
            if (endPoint != null) {
                fastestRoute(JSONData);
            }
            start = false;
        } else {
            endIcon.style.visibility = "visible";
            endIcon.style.left = mouseX + 8 - endIcon.clientWidth/2 + "px";
            endIcon.style.top = mouseY + 60 - endIcon.clientHeight + "px";
            console.log("end");
            endPoint = closestPoint(JSONData, mouseX, mouseY);
            fastestRoute(JSONData);
            start = true;
        }
});

function fastestRoute(JSONData) {
    routes = new Array();
    newNode(JSONData, startPoint, endPoint);
    var lowestIndex = 0;
    for (var i = 0; i < routes.length; i++) {
        if (totalTime(JSONData, routes[i]) < totalTime(JSONData, routes[lowestIndex])) {
            lowestIndex = i;
         }
    }
    clearCanvas();
    drawRoad(JSONData, routes[lowestIndex]);
    var lowestTime = Math.round(totalTime(JSONData, routes[lowestIndex])/200);
    timeText.innerHTML = "Travel Time: " + lowestTime + " min Height difference: " + Math.round(JSONData.Roads[routes[lowestIndex][routes[lowestIndex].length-1].roadIndex].points[routes[lowestIndex][routes[lowestIndex].length-1].pointIndex].elevation - JSONData.Roads[routes[lowestIndex][0].roadIndex].points[routes[lowestIndex][0].pointIndex].elevation) + " m";
}


function closestPoint(data, currentX, currentY) {
    var closestR = 0;
    var closestP = 0;
    var closestD = distance(data.Roads[closestR].points[closestP].x, data.Roads[closestR].points[closestP].y, currentX, currentY);
    $(data.Roads).each(function(index, value) {
       $(value.points).each(function(pointIndex, pointValue) {
           var thisDistance = distance(pointValue.x, pointValue.y, currentX, currentY)
           if (thisDistance < closestD) {
               closestD = thisDistance;
               closestR = index;
               closestP = pointIndex;
           }
       }); 
    });
    return {
        "pointIndex": closestP,
        "roadIndex": closestR
    }
}

function distance(x1, y1, x2, y2) {
    var distance = Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
    return distance;
}

//finds the point given coordinates, current road is optional parameter which represent the current 
function findPoint(data, x1, y1, current) {
    var pointIndex;
    var roadIndex;
    $(data.Roads).each(function(index, value) {
        $(value.points).each(function(pointsIndex, pointsValue) { 
         if((current == undefined || index != current) && pointsValue.x == x1 && pointsValue.y == y1) {
                pointIndex = pointsIndex;
                  roadIndex = index;
              }
          });
    });
    return {
        "pointIndex": pointIndex,
        "roadIndex": roadIndex,
    }
    
}

//finds the neighboring points
function findNeighboring(data, point) {
    var nearbyNodes = new Array();
    var index = point.pointIndex;
    var road = data.Roads[point.roadIndex];
    if (index+1 != road.points.length) { //if the road isnt at its end, add the next node to neighbors
        nearbyNodes.push({"pointIndex": index+1, "roadIndex": point.roadIndex});
    }
    if (index-1 >= 0) { //if the road isnt at the beginning, add the node to its neighbors
        nearbyNodes.push({"pointIndex": index-1, "roadIndex": point.roadIndex});
    }
    if (road.points[index].property == "intersection") {// if the road is an intersection, find the neighbors on the other road
        var newPoint = findPoint(data, road.points[index].x, road.points[index].y, point.roadIndex);
        var nIndex = newPoint.pointIndex;
        var nRoad = data.Roads[newPoint.roadIndex];
        if (nIndex+1 != nRoad.points.length) {
            nearbyNodes.push({"pointIndex": nIndex+1, "roadIndex": newPoint.roadIndex});
        }
        if (nIndex-1 >= 0) {
            nearbyNodes.push({"pointIndex": nIndex-1, "roadIndex": newPoint.roadIndex});
        }
    }
    return nearbyNodes;
}

//Connects a set of points to draw the path for the array.
function drawRoad(data, array) {
    for (var i = 0; i < array.length-1; i++) {
        var x1 = data.Roads[array[i].roadIndex].points[array[i].pointIndex].x;
        var y1 = data.Roads[array[i].roadIndex].points[array[i].pointIndex].y;
        var x2 = data.Roads[array[i+1].roadIndex].points[array[i+1].pointIndex].x;
        var y2 = data.Roads[array[i+1].roadIndex].points[array[i+1].pointIndex].y;
        drawLine(x1, y1, x2, y2);
    }
}

//calculates total time from the route provided

function totalTime(data, array) {
    var time = 0;
    
    for (var i = 0; i < array.length-1; i++) {
        var currentPoint = data.Roads[array[i].roadIndex].points[array[i].pointIndex];
        var nextPoint = data.Roads[array[i+1].roadIndex].points[array[i+1].pointIndex];
        var flatDistance = Math.sqrt(Math.pow((currentPoint.x-nextPoint.x), 2) + Math.pow((currentPoint.y-nextPoint.y), 2)); 
        var elevationChange = nextPoint.elevation - currentPoint.elevation;
        var elevationMultiplier = Math.pow(1.1, elevationChange);   
        var distance = Math.sqrt(Math.pow(flatDistance,2) + Math.pow(elevationChange,2));
        time += distance * elevationMultiplier;
    }
    return time;
}




//check if the stackOfNodes array contain the current point so it won't go there. 
function arrayContains(data, array, object) {
    for (var i = 0; i < array.length; i++) {
        if (samePoints(data, array[i], object)) {
            return true;
        }
    }
    return false;
}

function samePoints(data, p1, p2) {
    var x1 = data.Roads[p1.roadIndex].points[p1.pointIndex].x;
    var y1 = data.Roads[p1.roadIndex].points[p1.pointIndex].y;
    var x2 = data.Roads[p2.roadIndex].points[p2.pointIndex].x;
    var y2 = data.Roads[p2.roadIndex].points[p2.pointIndex].y;
    if (x1 == x2 && y1 == y2) {
        return true;
    }
    return false;
}

var stackOfNodes = new Array();

//recursive function v3
function newNode(data, beginningPoint, finalPoint) {
    stackOfNodes.push(beginningPoint);
    if (samePoints(data, beginningPoint, finalPoint)) {
        routes.push(stackOfNodes.slice(0));
    }
    var neighbors = findNeighboring(data, beginningPoint);
    for (var i = 0; i < neighbors.length; i++) {
        
        if (!arrayContains(data, stackOfNodes, neighbors[i])) {
            newNode(data, neighbors[i], finalPoint);
        }
    }
    stackOfNodes.pop(beginningPoint);
}

/*
recursive function v2
function drawRoad(data, beginningPoint, finalPoint) {
    var index = beginningPoint.pointIndex;
    var road = data.Roads[beginningPoint.roadIndex];
    var finalX = data.Roads[finalPoint.roadIndex].points[finalPoint.pointIndex].x;
    var finalY = data.Roads[finalPoint.roadIndex].points[finalPoint.pointIndex].y;
    if (reverse) {
        console.log("reversing");
    }
    if (!reverse) {
        while (road.points[index].property != "intersection" && !(road.points[index].x == finalX && road.points[index].y == finalY) && index != road.points.length-1) {
            drawLine(road.points[index].x, road.points[index].y, road.points[index+1].x, road.points[index+1].y);

            index++;
        }
    } else {
        
        while (!(road.points[index].x == finalX && road.points[index].y == finalY) && index != 0) {
            drawLine(road.points[index].x, road.points[index].y, road.points[index-1].x, road.points[index-1].y);
            index--;
        }
    }
    console.log(road.points[index].x);
    console.log(road.points[index].y);
    
    if (road.points[index].x == finalX && road.points[index].y == finalY) {
        console.log("endPoint");
        return "end"
    } else if (reverse== false && road.points[index].property == "intersection") {
        console.log("intersec");
        var currentPoint = findPoint(data, road.points[index].x, road.points[index].y, beginningPoint.roadIndex);
        var newRoad = data.Roads[currentPoint.roadIndex];
        var newIndex = currentPoint.pointIndex;
        drawLine(newRoad.points[newIndex].x, newRoad.points[newIndex].y, newRoad.points[newIndex+1].x, newRoad.points[newIndex+1].y);
        currentPoint.pointIndex++;
        var ended = drawRoad(data, currentPoint, finalPoint, beginningPoint.roadIndex);
        if (ended){
            return "end";
        } 
    } else if (index == road.points.length-1 || index == 0) {
        console.log("reverse");
        var currentPoint = findPoint(data, road.points[index].x, road.points[index].y);
        reverse = !reverse;
        console.log(reverse);
        console.log(currentPoint);
        drawRoad(data, currentPoint, finalPoint);
    }
        
    
    
}

//recursive function v1
function drawRoadLine(data, RoadIndex, startPointIndex, endPointIndex) {
    var totalTime = 0;
    if (endPointIndex > startPointIndex){
        $(data.Roads[RoadIndex].points).each(function(index, value) {
            if (index == startPointIndex && index+1 != endPointIndex) {
                if (value.property == "intersection") {
                    var intersectionPoint = findPoint(data, value.x, value.y, turnPoints);
                }
                console.log(value.x + "," + value.y);
                totalTime += value.time;
                drawLine(value.x, value.y, data.Roads[RoadIndex].points[index+1].x, data.Roads[RoadIndex].points[index+1].y);
                startPointIndex++;
            }
        });
    } else {
        console.log(data.Roads[RoadIndex].points.length);
        startPointIndex = data.Roads[RoadIndex].points.length - 1 - startPointIndex;
        endPointIndex = data.Roads[RoadIndex].points.length - 1 - endPointIndex;
        $($(data.Roads[RoadIndex].points).reverse()).each(function(index, value) {
            if (value.x == endPointX && value.y == endPointY){
                console.log("hi");
                return true;
            }
           if (index == startPointIndex && index != endPointIndex) {
                if (value.property == "intersection") {
                    turnPoints.push({"x":value.x, "y":value.y});
                    console.log(value.x + "," + value.y);
                    var intersectionPoint = findPoint(data, value.x, value.y, turnPoints, RoadIndex);
                    console.log(RoadIndex);
                    if (data.Roads[intersectionPoint.roadIndex] != undefined) {
                        
                        var newRoadIndex = intersectionPoint.roadIndex;
                        var newStartIndex = intersectionPoint.pointIndex;
                        var newEndIndex = 0;
                        var newRoad = data.Roads[intersectionPoint.roadIndex];
                        console.log("intersect with" + data.Roads[intersectionPoint.roadIndex].name);
                        console.log("pointIndex" + newStartIndex);
                        drawLine(newRoad.points[newStartIndex].x, newRoad.points[newStartIndex].y, newRoad.points[newStartIndex-1].x, newRoad.points[newStartIndex-1].y)
                        console.log(156 + "line");
                        totalTime += drawRoadLine(data, newRoadIndex, newStartIndex-1, newEndIndex);
                    } 
                    
                }
                drawLine(value.x, value.y, $(data.Roads[RoadIndex].points).reverse()[index+1].x, $(data.Roads[RoadIndex].points).reverse()[index+1].y);
                console.log(value.x + "," + value.y);
                startPointIndex++;
                totalTime += value.time;
                
            }
            if (index == endPointIndex && value.property == "intersection" && value.x != endPointX) {
                console.log(value.x + "," + value.y);
                var intersectionPoint = findPoint(data, value.x, value.y, turnPoints, RoadIndex);
                console.log(RoadIndex);
                if (data.Roads[intersectionPoint.roadIndex] != undefined) {
                        var newRoadIndex = intersectionPoint.roadIndex;
                        var newStartIndex = intersectionPoint.pointIndex;
                        var newEndIndex = 0;
                        var newRoad = data.Roads[intersectionPoint.roadIndex];
                        console.log("intersect with" + data.Roads[intersectionPoint.roadIndex].name);
                        drawLine(newRoad.points[newStartIndex].x, newRoad.points[newStartIndex].y, newRoad.points[newStartIndex-1].x, newRoad.points[newStartIndex-1].y)
                        console.log(178 + "line");

                        drawRoadLine(data, newRoadIndex, newStartIndex-1, newEndIndex);
                    console.log("181 line");
                            
                } else {
                    drawLine(value.x, value.y, $(data.Roads[RoadIndex].points).reverse()[index+1].x, $(data.Roads[RoadIndex].points).reverse()[index+1].y);
                    console.log(value.x + "," + value.y);
                    startPointIndex++;
                }
            }
            
        });
        
        
    }
    
    return totalTime;
}
 start = 151, 678 end = 619, 77 through de neve drive

*/


    
    


            
            

