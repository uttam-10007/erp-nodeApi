
var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.get('/gettdsmapping:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT id,ded_code,ded_type,gov_rule,amount,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_" + b_acct_id + "_account.tds_mapping"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->tds_mapping-->gettds_mapping--", error)
            objectToSend["error"] = true
            objectToSend["gov_rule"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});



router.post('/addtdsmapping', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

  
           
            let sql = "insert into svayam_" + b_acct_id + "_account.tds_mapping (ded_code,ded_type,gov_rule,amount,ded_date,create_user_id,create_timestamp) values "


                + "(" + SqlString.escape(obj.ded_code) +  "," + SqlString.escape(obj.ded_type) + "," + SqlString.escape(obj.gov_rule) + ","+ SqlString.escape(obj.amount) +","+ SqlString.escape(obj.ded_date) +"," + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ")"



            mysqlPool.query(sql, function (error, results) {
                if (error) {
                    console.log("Error-->routes-->account-->settings-->tds_mapping-->addtds_mapping", error)
                    objectToSend["error"] = true
                    objectToSend["gov_rule"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else {
                    objectToSend["error"] = false
                    objectToSend["data"] = results.insertId
                    res.send(objectToSend);
                }
            })
     
})

router.put('/updatetdsmapping', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let ded_code = obj["ded_code"]

    let id = obj["id"]
    let ded_type = SqlString.escape(obj["ded_type"])
    let gov_rule = SqlString.escape(obj["gov_rule"])
    let amount = SqlString.escape(obj["amount"])
    let ded_date = SqlString.escape(obj["ded_date"])
   
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account.tds_mapping set ded_code=" + SqlString.escape(ded_code) + ","
        +  "ded_type=" + ded_type +",amount ="+amount
        + ",gov_rule=" + gov_rule +",ded_date ="+ded_date
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp
        + " where id=" + SqlString.escape(id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->tds_mapping-->updatetds_mapping", error)
            objectToSend["error"] = true
            objectToSend["gov_rule"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully"
            res.send(objectToSend);
        }
    })
})


router.delete('/deletetdsmapping:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]

    let sql = "delete from svayam_" + b_acct_id + "_account.tds_mapping where id=" + SqlString.escape(id)

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->tds_mapping-->deletetds_mapping", error)
            objectToSend["error"] = true
            objectToSend["gov_rule"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully"
            res.send(objectToSend);
        }
    })

})







module.exports = router;
