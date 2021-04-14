var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/getquantityOfPrevBill:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT  SUM(quantity) AS quantity,sno  FROM "+db+".ebill_items  WHERE tender_id="+SqlString.escape(obj.tender_id)+" GROUP BY sno"

       


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getquantityOfPrevBill--", error)
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

router.get('/getlastbillrate:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let bill_no = SqlString.escape(obj.bill_no)
    let sql_fetchCurr = "SELECT sno,rate  FROM " + db + ".ebill_items  WHERE tender_id=" + SqlString.escape(obj.tender_id) + " and  bill_no =" + bill_no



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->getlastbillrate--", error)
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
