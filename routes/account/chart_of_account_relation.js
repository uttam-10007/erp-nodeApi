var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')
var path = require('path');
var multer = require('multer');
const fs = require('fs');




router.get('/getRelationList:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    
    let sql = "Select id,chart_of_account,type,relation,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp"
        + " from svayam_" + b_acct_id + "_account.chart_of_account_report_relation";



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->chartofAccountRelation-->getRelationList--", error)
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

router.post('/createrelation', (req, res) => {
    let objectToSend = {}

    let obj = req.body


    let b_acct_id = obj["b_acct_id"]
    let chart_of_account = SqlString.escape(obj["chart_of_account"])
    let type = SqlString.escape(obj["type"])
    let relation = SqlString.escape(obj["relation"])
    


    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "insert into svayam_" + b_acct_id + "_account.chart_of_account_report_relation (chart_of_account,type,relation,create_user_id,create_timestamp) values "
        + "(" +chart_of_account+","+type+","+ relation + "," + create_user_id + "," + create_timestamp + ")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->chartofAccountRelation-->createrelation--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })


})
router.put('/updaterelation', (req, res) => {
    let objectToSend = {}

    let obj = req.body;

    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])
  
    let chart_of_account = SqlString.escape(obj["chart_of_account"])
    let type = SqlString.escape(obj["type"])
    let relation = SqlString.escape(obj["relation"])
    

                                                     

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account.chart_of_account_report_relation set chart_of_account="+chart_of_account+",type="+type
        + ",relation=" + relation  + "," 
        + "update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->chartofAccountRelation-->updaterelation--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully"
            res.send(objectToSend);
        }
    })

})



router.delete('/deleteRelation:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)


    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])
    

    let sql = "delete from svayam_" + b_acct_id + "_account.chart_of_account_report_relation where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->chartofAccountRelation-->deleteRelation-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully"
            res.send(objectToSend);
        }
    })

})


module.exports = router;
