var map;
var geocode;
var eventList = null;

function loadClient() {
            drawMap();
}

function locToString(loc) {
    return "( " + loc.lat() + ", " + loc.lng() + ")";
}

function buildContentString(name, description) {
    let cs = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        `<h1 id="firstHeading" class="firstHeading">${name}</h1>`+
        '<div id="bodyContent">'+
        `<p>${description}</p>`+
        '</div>'+
        '</div>';
    return cs;
}

function mapEvents() {
    // eventList should be initialized and not null at this point.
    if (eventList == null) {
        console.log("ERROR: eventList data not loaded!")
        return;
    }

    // Now map each event.
    for (let e of eventList.events) {
        let loc = new google.maps.LatLng(e.location.lat, e.location.lng);
        let name = e.name;
        let contentString = buildContentString(name, e.description);
        let infowindow = new InfoBubble({
            content: `<div class="bubbletext">${contentString}</div>`,
            maxWidth: 200,
            minHeight: 100,
            backgroundClassName: 'bubble'
        });
        let marker = new google.maps.Marker({position: loc, title: name, map: map});
        marker.addListener('mouseover', function () {
            infowindow.open(map, marker);
        });

        marker.addListener('mouseout', function () {
            infowindow.close(map, marker);
        });
    }
}
function drawMap() {
    // Very simple function for now, but we may want many different types of things on this
    // map beyond events.
    mapEvents()
}

function getEventJSON(callback) {
    // For now we read this from a file.  Later we'll make reading from the file test moode
    // and will call the server instead.
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'events.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function initMap() {
    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById("map"), {
        center: {lat: 37.435851, lng: -122.133246},
        zoom: 12
    });

    getEventJSON(function(response) {
        eventList = JSON.parse(response);
        gapi.load("client", loadClient);
    });
}