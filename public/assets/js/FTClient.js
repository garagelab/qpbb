var FTClient = function FTClient(tableId) {

    this.tableId = tableId;

    this._queryUrlHead = 'https://fusiontables.googleusercontent.com/fusiontables/api/query?sql=';
    this._queryUrlTail = '&jsonCallback=?';

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
}