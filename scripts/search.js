var firstOption = document.getElementById("firstSelection");
var secondOption = document.getElementById("secondSelection");
var thirdOption = document.getElementById("thirdSelection");
var currentOption = document.getElementById("selectCurrentLocation");
var searchBar = document.getElementById("search");


firstOption.addEventListener("click", function() {
    searchBar.value = firstOption.innerHTML;
    searchFunction;
});

secondOption.addEventListener("click", function() {
    searchBar.value = secondOption.innerHTML;
    searchFunction;
});

thirdOption.addEventListener("click", function() {
    searchBar.value = thirdOption.innerHTML;
    searchFunction;
});

currentOption.addEventListener("click", function() {
    searchBar.value = "Current Location";
    searchFunction;
})



function dropFunction() {
    document.getElementById("myDropdown").classList.add("show");

}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.searchbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i]; 
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

var pointsOfInterest;

$.ajax({
    url: 'json/document.json',
   dataType: 'json',
    type: 'get',
    cache: false,
    success: function(data) {
        pointsOfInterest = data.pointsOfInterest;
        console.log("searched");
    }
});

searchBar.addEventListener("keyup", searchFunction);

function searchFunction() {
    firstOption.innerHTML = "";
    secondOption.innerHTML = "";
    thirdOption.innerHTML = "";
    var bestSearches = new Array();
    var inputString = searchBar.value;
    var inputArr = inputString.split(" ");
    $(pointsOfInterest).each(function(index, value) {    
        
        var buildingName = value.name.split(" ");
        var matches = 0;
        var i, j;
        for (i = 0; i < inputArr.length; i++) {
            for (j = 0; j < buildingName.length; j++) {
                if (inputArr[i] != "" && startsWith(inputArr[i], buildingName[j])) {
                    matches++;
                }
            }
        }

        if (matches != 0) {
            bestSearches.push({"index": index, "matches": matches, "name": value.name});
        }
    });
    var top3 = new Array(3);
    var i, j;
    for (i = 0; i < 3; i++) {
        if (i >= bestSearches.length) {
            break;
        }
        var largest = bestSearches[i];
        for (j = 0; j < bestSearches.length; j++) {
            if (bestSearches[j].matches > largest.matches && !top3.includes(bestSearches[j])) {
                largest = bestSearches[j];
            }
        }
        top3[i] = largest;
        
    }
    if (top3[0] != undefined) {
        firstOption.innerHTML = top3[0].name;
        if (top3[1] != undefined) {
            secondOption.innerHTML = top3[1].name;
            if (top3[2] != undefined) {
                thirdOption.innerHTML = top3[2].name;
            }
        }
    }
}



function startsWith(query, searchText) {
    var upperSearch = searchText.toUpperCase();
    var upperQuery = query.toUpperCase();
    var result = upperSearch.search(upperQuery);
    if (result != 0) {
        return false;
    } else {
        return true;
    }
}

