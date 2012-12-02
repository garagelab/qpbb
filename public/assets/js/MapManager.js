var MapManager = function MapManager(options) {

    this.options = options;
    this.map = null;
    this.layers = {};

    this.init = function() {
        var self = this;

        // Initialize Google Map
        var googleMapOptions = {
            zoom: self.options.googleMapsOptions.zoom,
            center: new google.maps.LatLng(self.options.mapCenter.lat, self.options.mapCenter.lng),
            mapTypeId: self.options.googleMapsOptions.mapTypeId
        };
        this.map = new google.maps.Map(document.getElementById(self.options.mapDivId), googleMapOptions);
    }

    this.addFTLayer = function(key, ftId, locationColumn, options) {
        var self = this;

        console.log(options);        //TODO(gb): Remove trace!!!
        $.extend(options, {
            query: {
                select : locationColumn,
                from: ftId
            },
            map: self.map
        });

        var layer = new google.maps.FusionTablesLayer(options);
        self.layers[key] = layer;
    }

    this.getLayer = function(key) {
        return this.layers[key];
    }

    this.init();
}