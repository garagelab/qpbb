var Qpbb = function Qpbb(mapManager) {

    this.mapManager = mapManager;

    this.init = function() {
        this.initControls();
    };

    this.initControls = function() {
        var self = this;
        $('.menuItems a').click(function(event) {
            if (!$(this).find("li").hasClass("current")) {
                $('.menuItems').find("li.current").removeClass('current');
                $(this).find("li").addClass("current");

                var section = $(this).attr("data-section");
                if (section == "salud") {
                    self.mapManager.setMapType("salud");
                } else if (section == "denuncias") {
                    self.mapManager.setMapType("denuncias");
                }
            }



            event.preventDefault();
        })
    };
}