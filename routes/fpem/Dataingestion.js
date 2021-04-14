var express = require('express');
var router = express.Router();

var propObj = require('../../config_con.js')


var mysqlPool = require('../../connections/mysqlConnection.js')


router.get('/getevents:dtls', function (req, res) {
    try {
        var objectToSend = {};
        var b_acct_id = req.params.dtls;
        // var acc_id = req.params.dtls;
        let db="svayam_"+b_acct_id+"_data";
        var sqlQuery = "SELECT event_code,event_layout_code,source_code FROM "+ db +".`events` WHERE `status`= 0 GROUP BY event_code,event_layout_code,source_code" 
        mysqlPool.query(sqlQuery, function (error, results, fields) {
            if (error) {
                console.log("Error-->routes-->ruleEngine-->dataingestion---->getevents--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                res.end(JSON.stringify(objectToSend))
            }
            else {

                objectToSend["error"] = false;
                objectToSend["data"] = results
                res.send(JSON.stringify(objectToSend))
            }
        });
    }
    catch (ex) {
        console.log("Error-->routes-->ruleEngine-->rules---->getLookups--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(JSON.stringify(objectToSend))
    }
});








module.exports = router;