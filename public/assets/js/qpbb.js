var Qpbb = function Qpbb(mapManager) {

    this.mapManager = mapManager;

    this.init = function() {
        this.initControls();
    };

    this.initControls = function() {
        var self = this;

        // Tipo de mapa
        $("#mapType").change(function(event, ui) {
            var type = $(this).val();
            self.mapManager.setMapType(type);
        });
    };
}