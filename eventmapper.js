var map = null;
var eventList = null;

function locToString(loc) {
    return "( " + loc.lat() + ", " + loc.lng() + ")";
}

function buildContentString(name, description) {
    let cs = '<div class="bubbleText">'+
        `<h1 class="bubbleHeader">${name}</h1>`+
        '<div class="bubbleContent">'+
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
        const loc = new google.maps.LatLng(e.location.lat, e.location.lng);
        const name = e.name;
        const contentString = buildContentString(name, e.description);
        const infowindow = new InfoBubble({
            content: contentString,
            maxWidth: 200,
            minHeight: 10,
            backgroundClassName: 'bubble'
        });

        const scaled_icon = {
            url: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
            // size: new google.maps.Size(16, 16),
            // scaledSize: new google.maps.Size(16, 16),
        };

        const marker = new google.maps.Marker({
            position: loc,
            title: name,
            map: map,
            icon: scaled_icon,
            opacity: 0.5
        });
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
    $.getJSON("map-options.json", function (mapstyle) {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 5,
            center: {lat: 37.435851, lng: -122.133246},
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            scaleControl: true,
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: false,
            rotateControl: false,
            styles: mapstyle,
        });
    });

    getEventJSON(function(response) {
        eventList = JSON.parse(response);
        drawMap();
    });
}