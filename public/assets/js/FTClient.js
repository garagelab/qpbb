var FTClient = function FTClient(tableId) {

    this.tableId = tableId;

    this._queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
    this._queryUrlTail = '&key=AIzaSyBiJ0t5J-ha55dTwZxGDomI5xeakEq7ur8';

    this.query = function(columnArray, whereClause, orderClause, success, error) {
        var self = this;
        var query = "SELECT '" + columnArray.join("', '") + "' FROM " + self.tableId;
        if (whereClause) {
            query += " WHERE " + whereClause;
        }
        if(orderClause){
            query += " ORDER BY " + orderClause;
        }

        var queryurl = encodeURI(self._queryUrlHead + query + self._queryUrlTail);

        $.ajax({
            type: "GET",
            url:  queryurl,
            dataType: "jsonp",
            success: success,
            error: function () {
                console.log("AJAX ERROR for " + queryurl );
            }
        });
    }

    this.getQueryUrl = function(options) {
        var self = this;
        var query = "";

        if (options.select) {
            query += "SELECT '" + options.select.join("','") + "' FROM " + self.tableId;
        }

        if (options.where) {
            query += " WHERE " + options.where;
        }

        if (options.order) {
            query += " ORDER BY " + options.order;
        }

        if (options.orderBy) {
            query += " ORDER BY " + options.orderBy;
        }

        if (options.offset != null && options.offset != undefined) {
            query += " OFFSET " + options.offset;
        }

        if (options.limit) {
            query += " LIMIT " + options.limit;
        }

        return encodeURI(self._queryUrlHead + query + self._queryUrlTail);
    }
}