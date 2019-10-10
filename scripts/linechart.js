var linegraph = document.getElementById('myChart').getContext('2d');
var scatterChart = null;
this.drawGraph = function drawGraph() {
    if (scatterChart!= null) {
        scatterChart.destroy();
    }
    scatterChart = new Chart(linegraph, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Elevation Map',
                data: graphData,
                borderColor: 'black',
                borderWidth: 1,
                showLine: true
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
}

var linecanvas = document.getElementById('myChart');


var checkBox = document.getElementById("elevationBox");
checkBox.addEventListener("click", function(evt){
    if (checkBox.checked == true){
        linecanvas.style.visibility = "visible";
        drawGraph();
    } else {
        linecanvas.style.visibility ="hidden";
    }
})