var express = require('express');
var router = express.Router();
var propObj = require('../config_con.js')
var mysqlPool = require('../connections/mysqlConnection.js');

var SqlString = require('sqlstring');
var moment = require('moment')


router.get('/getfeildInfo:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);
    let db = "svayam_"+obj.b_acct_id+"_admin"

    let sql_fetchCurr = "SELECT * FROM "+ db +".field_info "

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->system_acc_data-->getfeildInfo", error)
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


router.get('/getCodeValue:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);
    let db = "svayam_"+obj.b_acct_id+"_admin"

    let sql_fetchCurr = "SELECT * FROM "+ db +".svayam_code_value "

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->system_acc_data-->getCodeValue", error)
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

module.exports = router;