var MapManager = function MapManager(options) {

    this.options = options;
    this.map = null;
    this.ftLayers = [];
    this.polygonLayers = [];
    this.markerLayers = [];
    this.polygons = [];
    this.types = {
        denuncias : {
            minLog : 0, maxLog : 0,
            ftClient : null,
            ftId : "1OoePLj4nJ-QNJRi_s3NhkpX7pz0plYT-w7gENOY",
            columnArray : ["GEO", "Poligono"],
            whereClause : "GEO NOT EQUAL TO ''",
            orderClause : null,
            getCoordinates : function(row) {
                return row[0].split(", ");
            },
            getPolygonName : function(row) {
                return row[1];
            }
        },
        salud : {
            minLog : 0, maxLog : 0, minCount : 0, maxCount : 0,
            ftClient : null,
            ftId : "1ngNauuZa6pB23RfA2HC5O5EUpOIeqbElspdBV-g",
            columnArray : ["Latitude", "Longitude", "Poligono"],
            whereClause : "Latitude NOT EQUAL TO '' AND Longitude NOT EQUAL TO ''",
            orderClause : null,
            getCoordinates : function(row) {
                return [row[0], row[1]];
            },
            getPolygonName : function(row) {
                return row[2];
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

        self.ftLayers.push({key:key, layer:layer, filterable:filterable});
    }

    this.filterMap = function(from, to) {
        var self = this;

        var layers = self.ftLayers.filter(function(layer) {
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

    this.toggleLayerVisibility = function(name, show) {
        var self = this;

        var layer = $.merge($.merge([], this.polygonLayers), this.markerLayers)
            .filter(function(layer) {
                return layer.name == name;
            })[0];

        if (!layer) {
            return;
        }

        if (layer.polygons) {
            layer.polygons.map(function(polygon) {
                polygon.setMap(show ? self.map : null);
            })
        }

        if (layer.markers) {
            layer.markers.map(function(marker) {
                marker.setMap(show ? self.map : null);
            })
        }

        if (layer.circles) {
            layer.circles.map(function(circle) {
                circle.setMap(show ? self.map : null);
            })
        }
    }

    this.showLayer = function(key) {
        var layer = this.ftLayers.filter(function(layer) {
            return layer.key == key;
        });
        layer[0].layer.setMap(this.map);
    }

    this.hideLayer = function(key) {
        var layer = this.ftLayers.filter(function(layer) {
            return layer.key == key;
        });
        layer[0].layer.setMap(null);
    }

    this.addToPolygonLayer = function(layerName, coordinates, customOptions) {
        var self = this;

        var layer = self.polygonLayers.filter(function(layer) {
            return layer.name == layerName;
        });

        var currentLayer;

        if (layer.length == 0) {
            currentLayer = {
                name: layerName,
                polygons: []
            };
            self.polygonLayers.push(currentLayer);
        } else {
            currentLayer = layer[0];
        }

        var polygonOptions = {
            paths: self._coordinatesToLatLng(coordinates),
            strokeColor: "#333333",
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: "#FF0000",
            fillOpacity: 0.5
        };
        $.extend(polygonOptions, customOptions);

        var polygon = new google.maps.Polygon(polygonOptions);
        polygon.setMap(self.map);
        currentLayer.polygons.push(polygon);
    }

    this.addToMarkerLayer = function(layerName, coordinates, customOptions, circleCustomOptions) {
        var self = this;

        var layer = self.markerLayers.filter(function(layer) {
            return layer.name == layerName;
        });

        var currentLayer;

        if (layer.length == 0) {
            currentLayer = {
                name: layerName,
                markers: [],
                circles: []
            };
            self.markerLayers.push(currentLayer);
        } else {
            currentLayer = layer[0];
        }

        var markerOptions = {
            position: new google.maps.LatLng(coordinates.split(",")[0], coordinates.split(",")[1])
        };
        $.extend(markerOptions, customOptions);

        var marker = new google.maps.Marker(markerOptions);
        marker.setMap(self.map);
        currentLayer.markers.push(marker);

        if (circleCustomOptions) {
            var circleOptions = {
                center: new google.maps.LatLng(coordinates.split(",")[0], coordinates.split(",")[1]),
                radius: 1000,
                strokeColor: "#333333",
                strokeOpacity: 0.5,
                strokeWeight: 1,
                fillColor: "#FF0000",
                fillOpacity: 0.5
            };
            $.extend(circleOptions, circleCustomOptions);
            var circle = new google.maps.Circle(circleOptions);
            circle.setMap(self.map)
            currentLayer.circles.push(circle);
        }
    }

    this.addPolygon = function(name, coordinates, area) {
        var self = this;

        var polygon = new google.maps.Polygon({
            paths: self._coordinatesToLatLng(coordinates),
            strokeColor: "#333333",
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillColor: "#FF0000",
            fillOpacity: 0.5,
            zIndex: 1
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
        var typeObj = self.types[type];

        $('#' + type + ' .map_filters [type=checkbox]').each(function(index, checkbox) {
            var show = $(checkbox).is(':checked');
            var layer = $(checkbox).attr('data-layer');
            self.toggleLayerVisibility(layer, show);
        })

        if (!typeObj.ftClient) {
            self.clearPolygons();
            var ftClient = new FTClient(typeObj.ftId);
            typeObj.ftClient = ftClient;
            typeObj.ftClient.query(typeObj.columnArray, typeObj.whereClause, typeObj.orderClause, function(data) {
                var rows = data.rows;
                for (var i=0; i<rows.length; i++) {
                    self.addToPolygon(type, typeObj.getPolygonName(rows[i]));
                }
                self.renderPolygons(type);
            });
        } else {
            self.renderPolygons(type);
        }
    };

    this.addToCorrespondingPolygon = function(type, coordinate) {
        var self = this;

        var point = new google.maps.LatLng(coordinate[0], coordinate[1]);

        for (var i=0; i<self.polygons.length; i++) {
            var polygon = self.polygons[i];
            if (google.maps.geometry.poly.containsLocation(point, polygon.polygon)) {
                this._updatePolygonCount(polygon, type);
                break;
            }
        }
    };

    this._updatePolygonCount = function(polygon, type) {
        var self = this;

        polygon[type].count++;
        polygon[type].log = Math.log(polygon[type].count + 1);
        if (polygon[type].log > self.types[type].maxLog) {
            self.types[type].maxLog = polygon[type].log;
            self.types[type].maxCount = polygon[type].count;
        }
    };

    this.addToPolygon = function(type, polygonName) {
        var self = this;

        var polygons = self.polygons.filter(function(polygon) {
            return polygon.name == polygonName;
        });

        self._updatePolygonCount(polygons[0], type);
    };

    this.renderPolygons = function(type) {
        var self = this;

        for (var i=0; i<self.polygons.length; i++) {
            var polygon = self.polygons[i];
            var opacity = polygon[type].log / self.types[type].maxLog;
            polygon.polygon.setOptions({
                fillColor : self._computeRGBColorModel(opacity*100),
                fillOpacity: 0.5
            });
            if (!polygon.polygon.map)
                polygon.polygon.setMap(self.map);
        }
    };

    this.clearPolygons = function() {
        var self = this;

        for (var i=0; i<self.polygons.length; i++) {
            var polygon = self.polygons[i];
            polygon.polygon.setOptions({
                fillOpacity: 0
            });
        }
    };

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