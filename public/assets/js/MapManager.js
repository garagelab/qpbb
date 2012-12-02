var MapManager = function MapManager(options) {

    this.options = options;
    this.map = null;
    this.layers = [];

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

    this.addFTLayer = function(key, ftId, locationColumn, templateID, filterable, layerOptions) {
        var self = this;

        $.extend(layerOptions, {
            query: {
                select : locationColumn,
                from: ftId
            },
            map: self.map
        });

        var layer = new google.maps.FusionTablesLayer(layerOptions);
        if (templateID) {
            google.maps.event.addListener(layer, 'click', function(e) {
                e.infoWindowHtml = $('#infoWindowTemplateEmpresa').tmpl(e.row).get(0).outerHTML;
            });
        }

        self.layers.push({key:key, layer:layer, filterable:filterable});
    }

    this.filterMap = function(from, to) {
        var self = this;

        var layers = self.layers.filter(function(layer) {
            return layer.filterable;
        });

        for (var i=0; i<layers.length; i++) {
            var layer = layers[i].layer;
            var queryOptions = { where: "Fecha >= " + $.datepicker.formatDate('mm/dd/y', from) + " AND Fecha <= " + $.datepicker.formatDate('mm/dd/y', to)};
            $.extend(queryOptions, layer.query);
            console.log(queryOptions);        //TODO(gb): Remove trace!!!
            layer.setOptions({query:queryOptions});
        }
    }

    this.init();
}