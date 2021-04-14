var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');

router.get('/getcodevalue:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);

    
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql_fetchCurr = "Select * from " + db + ". svayam_code_value where field_code in (select field_code from "+ db +".record_xref_field where record_code = " + SqlString.escape(obj.record_code)+")"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->projectMetadata-->metadata-->getcodevalue--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})







module.exports = router