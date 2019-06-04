var map = null;
var eventList = null;
var markers = [];

function locToString(loc) {
    return "( " + loc.lat() + ", " + loc.lng() + ")";
}

function buildContentString(name, dateStr, address, description) {
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date  = new Date(dateStr);
    const formattedDate = date.toLocaleDateString("en-US", dateOptions);

    var addrString = '<p class="bubbleAddr">';
    for (a of address) {
        addrString += `${a}<br>`;
    }
    addrString += '<\p>';

    const cs = '<div class="bubbleText">'+
        `<h1 class="bubbleHeader">${name}</h1>`+
        `<p class="bubbleDate"><i>${formattedDate}</i></p>`+
        addrString+
        '<div class="bubbleContent">'+
        `<p>${description}</p>`+
        '</div>'+
        '</div>';
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
        const date = new Date(e.time);
        const contentString = buildContentString(name, date, e.address_lines, e.description);
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
            opacity: 0.5,
            date: date
        });

        marker.addListener('mouseover', function () {
            infowindow.open(map, marker);
        });

        marker.addListener('mouseout', function () {
            infowindow.close(map, marker);
        });

        markers.push(marker);
    }
}

function showAllMarkers() {
    for (m of markers) {
        m.setVisible(true);
    }
}

function showFutureEvents() {
    const now = Date.now();
    for (m of markers) {
        if (m.date > now) {
            m.setVisible(true);
        } else {
            m.setVisible(false);
        }
    }
}
function ShowControl(controlDiv, f, title, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.display = 'block';
    controlUI.style.border = '1px solid #000';
    controlUI.style.cursor = 'pointer';
    controlUI.style.textAlign = 'center';
    controlUI.title = title;
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = title;
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', f);

}

function drawControl() {
    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    var centerControlDiv = document.createElement('div');
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);

    // Create global controls
    new ShowControl(centerControlDiv, showAllMarkers, 'Show All', map);
    new ShowControl(centerControlDiv, showFutureEvents, 'Upcoming Only', map);
}

function drawMap() {
    // Very simple function for now, but we may want many different types of things on this
    // map beyond events.
    mapEvents();
    drawControl();
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