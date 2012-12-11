var MapManager = function MapManager(options) {

    this.options = options;
    this.map = null;
    this.layers = [];
    this.polygons = [];
    this.types = {
        denuncias : { minLog: 0, maxLog: 0 }
    };

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
                e.infoWindowHtml = $('#'+templateID).tmpl(e.row).get(0).outerHTML;
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
            layer.query.where = undefined;
            var queryOptions = { where: "Fecha >= '" + $.datepicker.formatDate('M d, yy', from) + "' AND Fecha <= '" + $.datepicker.formatDate('M d, yy', to) + "'"};
            $.extend(queryOptions, layer.query);
            layer.setOptions({query:queryOptions});
        }
    }

    this.showLayer = function(key) {
        var layer = this.layers.filter(function(layer) {
            return layer.key == key;
        });
        layer[0].layer.setMap(this.map);
    }

    this.hideLayer = function(key) {
        var layer = this.layers.filter(function(layer) {
            return layer.key == key;
        });
        layer[0].layer.setMap(null);
    }

    this.addPolygon = function(name, coordinates, area) {
        var self = this;

        var polygon = new google.maps.Polygon({
            paths: self._coordinatesToLatLng(coordinates),
            strokeColor: "#333333",
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: "#FF0000",
            fillOpacity: 0
        });

        self.polygons.push({
            name: name,
            polygon: polygon,
            area: area,
            denuncias: { count: 0, log: 0 }
        });
    }

    this.addToCorrespondingPolygon = function(type, coordinate) {
        var self = this;

        var point = new google.maps.LatLng(coordinate[0], coordinate[1]);

        for (var i=0; i<self.polygons.length; i++) {
            var polygon = self.polygons[i];
            if (google.maps.geometry.poly.containsLocation(point, polygon.polygon)) {
                polygon[type].count++;
                polygon[type].log = Math.log(polygon[type].count + 1);
                if (polygon[type].log > self.types[type].maxLog) {
                    self.types[type].maxLog = polygon[type].log;
                }
                break;
            }
        }
    }

    this.renderPolygons = function(type) {
        var self = this;

        for (var i=0; i<self.polygons.length; i++) {
            var polygon = self.polygons[i];
            var opacity = polygon[type].log / self.types[type].maxLog;
            polygon.polygon.fillOpacity = opacity;
            polygon.polygon.setMap(self.map);
        }
    }

    this._coordinatesToLatLng = function(coordinates) {
        var array = [];
        for (var i=0; i<coordinates.length; i++) {
            array.push(new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
        }

        return array;
    }

    this.init();
}