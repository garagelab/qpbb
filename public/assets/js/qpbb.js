  var Qpbb = function Qpbb(mapManager, aqi) {

  this.mapManager = mapManager;
  this.aqi = aqi;

  this.init = function() {
      this.initControls();
  };

  this.initControls = function() {

      var self = this;

      $('#navigation li a').click(function(e) {
        var section = $(this).attr("data-section");
        if ((section == "aire" ) && (!self.aqi.loaded)) {
          self.aqi.init();
        } else {
          self.mapManager.setMapType(section);
        }   
        e.preventDefault();
      });


      

  };
}