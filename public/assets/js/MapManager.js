var MapManager = function MapManager(options) {

    this.options = options;
    this.map = null;
    this.layers = [];
    this.polygons = [];
    this.types = {
        denuncias : {
            minLog: 0, maxLog: 0,
            ftClient: null,
            ftId: "1UUkMV28J2E4Z-EwXMdhd9tCKQMicjWNpekYpJBY",
            columnArray: ["GEO"],
            whereClause: "GEO NOT EQUAL TO ''",
            orderClause: null,
            getCoordinates: function(row) {
                return row[0].split(", ");
            }
        },
        salud : {
            minLog: 0, maxLog: 0,
            ftClient: null,
            ftId: "1BNXWW11eP7gH-SSo_YNhg1qth1PoKX8HwhfxFJ0",
            columnArray: ["Latitude", "Longitude"],
            whereClause: "Latitude NOT EQUAL TO '' AND Longitude NOT EQUAL TO ''",
            orderClause: null,
            getCoordinates: function(row) {
                return [row[0], row[1]];
            }
        }
    };

    this.init = function() {
        var self = this;

        // Initialize Google Map
        var googleMapOptions = {
            zoom: self.options.googleMapsOptions.zoom,
            center: new google.maps.LatLng(self.options.mapCenter.lat, self.options.mapCenter.lng),
            mapTypeId: self.options.googleMapsOptions.mapTypeId,
            styles: self.options.googleMapsOptions.styles
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
            denuncias: { count: 0, log: 0 },
            salud: { count: 0, log: 0 }
        });
    }

    this.setMapType = function(type) {
        var self = this;
        console.log("Setting map '" + type + "'");        //TODO(gb): Remove trace!!!

        var typeObj = self.types[type];

        if (!typeObj.ftClient) {
            var ftClient = new FTClient(typeObj.ftId);
            typeObj.ftClient = ftClient;
            typeObj.ftClient.query(typeObj.columnArray, typeObj.whereClause, typeObj.orderClause, function(data) {
                var rows = data.table.rows;
                console.log("Se encontraron " + rows.length + " puntos...");        //TODO(gb): Remove trace!!!

                console.log("Agregando puntos a los polígonos...");        //TODO(gb): Remove trace!!!
                for (var i=0; i<rows.length; i++) {
                    var row = rows[i];
                    self.addToCorrespondingPolygon(type, typeObj.getCoordinates(row));
                }
                console.log("Renderizando los polígonos");        //TODO(gb): Remove trace!!!
                self.renderPolygons(type);
                console.log("Mapa listo.\n");        //TODO(gb): Remove trace!!!

            });
        } else {
            console.log("Renderizando los polígonos");        //TODO(gb): Remove trace!!!
            self.renderPolygons(type);
            console.log("Mapa listo.\n");        //TODO(gb): Remove trace!!!
        }

    };

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
            polygon.polygon.setOptions({
                fillOpacity: opacity
            });
//            polygon.polygon.fillOpacity = opacity;
            if (!polygon.polygon.map)
                polygon.polygon.setMap(self.map);
        }
    }

    this._computeRGBColorModel = function(n) {
        var r = Math.floor((255*n)/100);
        var g = Math.floor((255*(100-n))/100);
        var b = 0;

        return "rgb(" + r + "," + g + "," + b + ")";
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