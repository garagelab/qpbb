var Qpbb = function Qpbb(mapManager, aqi) {

    this.mapManager = mapManager;
    this.aqi = aqi;

    this.init = function() {
        this.initControls();
    };

    this.initControls = function() {
        var self = this;
        $('.menuItems a').click(function(event) {
            if (!$(this).parent().hasClass("current")) {
                $('.menuItems').find("li.current").removeClass('current');
                $(this).parent().addClass("current");

                var section = $(this).attr("data-section");
                var currentView = $(".view.current");

                if (section == "salud") {
                    if(!$('#map-view').hasClass("current")) {
                        currentView
                            .removeClass('current')
                            .fadeOut('fast', function() {
                                $('#map-view')
                                    .fadeIn('fast')
                                    .addClass('current');
                                self.mapManager.setMapType("salud");
                            })
                    } else {
                        self.mapManager.setMapType("salud");
                    }
                } else if (section == "denuncias") {
                    if(!$('#map-view').hasClass("current")) {
                        currentView
                            .removeClass('current')
                            .fadeOut('fast', function() {
                                $('#map-view')
                                    .fadeIn('fast')
                                    .addClass('current');
                                self.mapManager.setMapType("denuncias");
                            })
                    } else {
                        self.mapManager.setMapType("denuncias");
                    }
                } else if (section == "aire") {
                    if(!$('#aqi-view').hasClass("current")) {
                        currentView
                            .removeClass('current')
                            .fadeOut('fast', function() {
                                $('#aqi-view')
                                    .fadeIn('fast')
                                    .addClass('current');
                                if (!self.aqi.loaded)
                                    self.aqi.init();
                            })
                    }
                }
            }

            event.preventDefault();
        })
    };
}