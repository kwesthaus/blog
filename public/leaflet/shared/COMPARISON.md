Features sotl.as has that are not supported by this project (ignoring some that I don't care about, e.g. webcams):
* Map library: mapbox-gl-js
* JS framework: vue.js
* Filtering:
    * Activator, complete candidate
* Summits
    * Show name, code, elevation without having to click
    * Popup has link
* Map Overlays
    * Tracks from sotamaps
    * Activation zones
    * Spots
    * Alerts
    * Region bounding boxes (not actual outlines)
* Live edit feature layer
    * Open gpx, kml file
    * Save to gpx file
    * Create new markers, lines
    * Delete features
* Path profiles
* Probably more performant/can handle more than just 1 association

Features supported by both:
* Filtering
    * Activations, points, elevation
    * Show inactive summits
* Summits
    * Style by points
    * Show activation #
    * Popup showing all details
* Standard map functionality
    * Basic basemaps
    * Right click map to get location
    * Zoom, scale

Features this project has that are not supported by sotl.as:
* Map library: leaflet-js
* JS framework: none. Pure js - more verbose but easier to understand in my opinion
* Filtering:
    * Completely custom. Enter your own javascript function
    * Summits by region, access
    * Show only inactive summits
* Summits:
    * Additional info - owner/region, access, FADate+FACalls
* W7W-specific basemaps (imagery, USGS topo, USFS topo)
* Map Overlays
    * FS roads
    * DNR roads
    * Wilderness areas (no roads)
    * Snopark-related
    * Watershed-related
* Completely static
    * Super easy to selfhost - no need for mongodb or npm, literally just run `python -m http.server` (or any other simple http server) in the parent directory
    * Summit data extensibility - no need to rearchitect the mongodb schema or sotlas-api backend. If you can get the data into summitslist.csv, you can display/filter it




Other filter controls:
* [guygriffiths/leaflet-geojson-filter](https://github.com/guygriffiths/leaflet-geojson-filter): Specify fields to filter on during control object creation. Only supports checkboxes (enumerates all possible values during creation)
* [stefanocudini/leaflet-search](https://github.com/stefanocudini/leaflet-search): Only supports text matching


