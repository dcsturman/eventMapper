// The map we're displaying
let map = null;

// List of all events received from server
// Currently that list is loaded from the events.json file.
let eventList = null;

// All the markers on the map (visible or not)
let markers = [];

// This is a boolean flag used to open/close bubbles
// automatically with mouse attention.  If false,
// then we use click behavior to toggle visibility.
// True is the default behavior.  
// closeControl is the toggle button in the control
// panel associated with managing this flag.
let autoBubble = true;
let closeControl = null;

// Utility function useful for printing loc structures
// on the console.
function locToString(loc) {
    return "( " + loc.lat() + ", " + loc.lng() + ")";
}

// Build the content for an InfoBubble.
// name: Name of the event (string)
// date: A Date object representing the time of the event (Date).
// address: An array of strings representing the line by line text
//          of the address of the event (string[])
// description: Body of the content. (string)
function buildContentString(name, date, address, description) {
    const dateOptions = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", dateOptions);

    let addrString = '<p class="bubbleAddr">';
    for (let a of address) {
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
    return cs;
}

function mapEvents() {
    // Now map each event.
    for (let e of eventList.events) {
        const loc = new google.maps.LatLng(e.location.lat, e.location.lng);
        const date = new Date(e.time);
        const contentString = buildContentString(e.name, date, e.address_lines, e.description);
        const infoBubble = new InfoBubble({
            content: contentString,
            maxWidth: 200,
            minHeight: 10,
            // This gap is necessary to avoid the bubble changing the target
            // and causing a mouseout event (flicker of the bubble)
            pixelOffset: new google.maps.Size(0, -15),
            disableAnimation: true,
            visible: false,
            backgroundClassName: "bubble"
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

        marker.addListener("click", function() {
            if (!autoBubble) {
                if (infoBubble.visible) {
                    infoBubble.visible = false;
                    infoBubble.close(map, marker);
                } else {
                    infoBubble.visible = true;
                    infoBubble.open(map,marker);
                }
            }
        })
        marker.addListener("mouseover", function () {
            if (autoBubble) {
                infoBubble.open(map, marker);
            }
        });

        marker.addListener("mouseout", function () {
            if (autoBubble) {
                infoBubble.close(map, marker);
            }
        });

        markers.push(marker);
    }
}

// toggleAutoBubble() turns on/off auto-open/close of InfoBubbles
// on mouseover/mouseout events requiring clicks instead. Also
// changes the color of the control accordingly.
// This function is a callback for that control listener.
function toggleAutoBubble() {
    if (autoBubble) {
        autoBubble = false;
        closeControl.style.backgroundColor = "#ccc";
    } else {
        autoBubble = true;
        closeControl.style.backgroundColor = "#fff";
    }
}

// showAllMarkers() makes all markers visible on the map.
// Used as the callback for that control listener.
function showAllMarkers() {
    for (let m of markers) {
        m.setVisible(true);
    }
}

// showFutureEvents() makes all markers in the past invisible.
// Used as the call back for that control listener.
function showFutureEvents() {
    const now = Date.now();
    for (let m of markers) {
        if (m.date > now) {
            m.setVisible(true);
        } else {
            m.setVisible(false);
        }
    }
}

// ShowControl adds a control to the control panel on the map.
// controlDiv: The control to add to.
// f: The listener callback (function).
// title: User-visible title to display for the control (string)
// returns The controlUI in case you need to use it later.
function ShowControl(controlDiv, f, title) {
    // Set CSS for the control border.
    let controlUI = document.createElement("div");
    controlUI.style.backgroundColor = "#fff";
    controlUI.style.display = "block";
    controlUI.style.border = "1px solid #000";
    controlUI.style.cursor = "pointer";
    controlUI.style.textAlign = "center";
    controlUI.title = title;
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    let controlText = document.createElement("div");
    controlText.style.color = "rgb(25,25,25)";
    controlText.style.fontFamily = "Roboto,Arial,sans-serif";
    controlText.style.fontSize = "16px";
    controlText.style.lineHeight = "38px";
    controlText.style.paddingLeft = "5px";
    controlText.style.paddingRight = "5px";
    controlText.innerHTML = title;
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener("click", f);

    return controlUI;
}

// setupControl() sets up the control panel on the map.
function setupControl() {
    // Create the DIV to hold the control and call the CenterControl()
    // constructor passing in this DIV.
    let centerControlDiv = document.createElement("div");
    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(centerControlDiv);

    // Create global controls
    ShowControl(centerControlDiv, showAllMarkers, "Show All");
    ShowControl(centerControlDiv, showFutureEvents, "Upcoming Only");
    closeControl = ShowControl(centerControlDiv, toggleAutoBubble, "DBG: AutoBubble");
}

// drawMap() is called after events are parsed from JSON, then draws
// the markers, and draws the control panel.
function drawMap() {
    // Very simple function for now, but we may want many different types of things on this
    // map beyond events.
    mapEvents();
    setupControl();
}

// getEventJSON() asynchronously gets the event data in JSON format.  It then calls
// a callback with the JSON after its received.
// Currently the JSON is read from the eventmapper.js file.  In the future
// we'll obtain this from a backend in production and use the file for testing purposes only.
// callback: Function to call once the JSON is read. (function)
function getEventJSON(callback) {
    // For now we read this from a file.  Later we"ll make reading from the file test mode
    // and will call the server instead.
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", "events.json", true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

// initMap() creates the map using the style elements specified in map-options.json.
// Its the entry point to this javascript as specified in the maps api script.
// After the map is set up, it initiates retrieval of the JSON, with callback
// to continue with a parsed set of events by calling drawMap().
function initMap() {
    $.getJSON("map-options.json", function (mapstyle) {
        map = new google.maps.Map(document.getElementById("map"), {
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
    }).then(getEventJSON(function(response) {
        eventList = JSON.parse(response);
        drawMap();
    }));
}