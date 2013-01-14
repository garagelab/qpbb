var complaintList = {

    options : null,                 // General options
    currentPage : 0,
    resultsTotal : 1878,
    ftClient :  null,

    init : function(options) {
        var self = this;
        self.options = options;
        self.ftClient = new FTClient(options.ftId);
    },

    // Loads a result page
    loadPage : function(page) {
        var self = this;
        self.currentPage = page;
        self._clearResults();
        self._loadComplaints(page);
    },

    // Clears all results
    _clearResults : function() {
        $('#complaint-list tr.clearable').remove();
    },

    // Loads complaints to table
    _loadComplaints : function(page) {
        var self = this;

        var offset = page * self.options.rpp;
        var limit = self.options.rpp;

        var url = self.ftClient.getQueryUrl({
            select : ["Fecha", "Origen", "Descripcion", "Informe", "Tags"],
            offset : offset,
            limit : limit,
            orderBy: self.options.orderBy
        })

        // Make request
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                // Build results
                var complaints = data.rows;
                complaints.map(self._addComplaintRow, self);
                self._updateResultsCount(page, complaints.length);
                self._buildPagination(page, complaints.length);
            }
        })
    },

    _updateResultsCount : function(page, count) {
        var self = this;

        var start = page * self.options.rpp + 1;
        var end = (page+1) * self.options.rpp;

        $('#resultsStart').text(start);
        $('#resultsEnd').text(end > self.resultsTotal ? self.resultsTotal : end);
        $('#resultsTotal').text(self.resultsTotal);
        if ($('.resultsCount').css('display') == 'none') {
            $('.resultsCount').show();
        }
    },

    _buildPagination : function(page, count) {
        var self = this;
        var pageCount = Math.floor(self.resultsTotal/self.options.rpp);
        var list = $('#pagination ul').empty();
        if (pageCount>0) {
            list.append($('<li><a href="#">«</a></li>')
                .addClass(page == 0 ? 'disabled' : '')
                .click(function(event) {
                    if (!$(this).hasClass('disabled'))
                        self.loadPage(page - 1);
                    event.preventDefault();
                })
            );
            for (var i=0; i<=pageCount; i++) {
                var listElem = $('<li><a href="#" data-page="' + i + '">' + (i+1) + '</a></li>')
                    .addClass(page == i ? 'active' : '')
                    .click(function() {
                    var newPage = parseInt($(this).find('a').attr('data-page'));
                    self.loadPage(newPage);
                });
                list.append(listElem)
            }
            list.append($('<li><a href="#complaint-list">»</a></li>')
                .addClass(page == pageCount ? 'disabled' : '')
                .click(function(event) {
                    if (!$(this).hasClass('disabled'))
                        self.loadPage(page + 1);
                    event.preventDefault();
                })
            );
        }
    },

    _addComplaintRow : function(complaint) {
        // Complaint row
        $('#complaintRow').clone()
            .css('display', '')
            .addClass('clearable')
            .find('.complaintDate').text(complaint[0]).end()
            .find('.complaintOrigin').text(complaint[1]).end()
            .find('.complaintDescription').attr('title', complaint[2]).text(complaint[2].trunc(30, true)).end()
            .find('.complaintReport').attr('title', complaint[3]).text(complaint[3].trunc(30, true)).end()
            .find('.complaintTags').text(complaint[4]).end()
            .appendTo('#complaint-list tbody');
    }
}

String.prototype.trunc = function(n,useWordBoundary){
    var toLong = this.length>n,
        s_ = toLong ? this.substr(0,n-1) : this;
    s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
    return  toLong ? s_ + '...' : s_;
};