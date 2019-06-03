EventMapper project used to build a map showing a set of defined
events on a Google Map. `eventmapper.html` is the top level 
file which initializes the Google Maps API.  **Important**: you 
must replace `INSERT_API_KEY_HERE` with your Google Maps API key.

The relevant javascript is in `eventmapper.js`.

For now we assume the JSON format shown in `events.json`.  
Specifically we use the following schema:
```$xslt
"events": [
    {
      "name": "Some Event Name",
      "time": "2019-07-15T20:00:00Z",
      "address_lines": [
        "107 S Mary Avenue",
        "San Jose, CA 95003"
      ],
      "description": "This will be a great event where we watch Pete arm-wrestle Trump on live TV.  Come join us for a great party including yummy snacks.",
      "location": {
        "lat": 37.245786218032435,
        "lng": -121.78339102296239
      }
    },
    ...
]
```