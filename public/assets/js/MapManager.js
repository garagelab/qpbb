var MapManager = function MapManager(options) {

    this.options = options;
    this.map = null;

    this.init = function() {
        var self = this;
        console.log("init");        //TODO(gb): Remove trace!!!
        console.log(self.options);        //TODO(gb): Remove trace!!!
        var googleMapOptions = {
            zoom: self.options.googleMapsOptions.zoom,
            center: new google.maps.LatLng(self.options.mapCenter.lat, self.options.mapCenter.lng),
            mapTypeId: self.options.googleMapsOptions.mapTypeId
        };
        this.map = new google.maps.Map(document.getElementById(self.options.mapDivId), googleMapOptions);
    }

    this.init();
}