var Qpbb = function Qpbb(mapManager) {

    this.mapManager = mapManager;

    this.init = function() {
        this.initControls();
    };

    this.initControls = function() {
        var self = this;

        // Time slider
        $("#time-slider").slider({
            range: true,
            min: 1199145600,        // 01/01/2008 UNIX time
            max: 1356912000,        // 31/12/2012 UNIX time
            step: 60 * 60 * 24,     // 1 day
            values: [1199145600, 1356912000],
            slide: function( event, ui ) {
                var date0 = new Date(ui.values[0] * 1000);
                var date1 = new Date(ui.values[1] * 1000);

                $("#date-from").text($.datepicker.formatDate('dd/mm/yy', new Date(ui.values[0] * 1000)));
                $("#date-to").text($.datepicker.formatDate('dd/mm/yy', new Date(ui.values[1] * 1000)));
            },
            change: function(event, ui) {
                console.log("slider change");        //TODO(gb): Remove trace!!!
//                mapManager.filterMap(new Date(ui.values[0] * 1000), new Date(ui.values[1] * 1000));
            }
        });
        var date0 = new Date($( "#time-slider" ).slider( "values", 0 ) * 1000);
        var date1 = new Date($( "#time-slider" ).slider( "values", 1 ) * 1000);
        $("#date-from").text($.datepicker.formatDate('dd/mm/yy', date0));
        $("#date-to").text($.datepicker.formatDate('dd/mm/yy', date1));

        // Tipo de mapa
        $("#mapType").change(function(event, ui) {
            var type = $(this).val();
            self.mapManager.setMapType(type);
        });
    };
}