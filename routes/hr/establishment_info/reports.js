var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')


router.get('/getAllSavedReports:dtls', (req, res) => {
    let objectToSend = {}

    let b_acct_id = req.params.dtls


    let sql="Select report_id,report_name,filter_and_project,create_user_id,update_user_id,"
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    + "update_timestamp from svayam_"+b_acct_id+"_hr.reports"
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->reports-->getAllSavedReports", error)
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

router.post('/createReport', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let report_name = SqlString.escape(obj["report_name"])
    let filter_and_project = SqlString.escape(obj["filter_and_project"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.reports (report_name,filter_and_project,create_user_id,create_timestamp) values"
        +"("+report_name+","+filter_and_project+","+create_user_id+","+create_timestamp+")"

mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->reports-->createReport", error)
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



router.put('/updateReport',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let report_id=SqlString.escape(obj["report_id"])
    let report_name = SqlString.escape(obj["report_name"])
    let filter_and_project = SqlString.escape(obj["filter_and_project"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.reports set report_name="+report_name+", filter_and_project="+filter_and_project+","
            +"update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where report_id="+report_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->reports-->updateReport--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Report Updated Successfully"
            res.send(objectToSend);
        }
    })

})




router.post('/getReport', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    mysqlPool.query(obj['query'], function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->reports-->getReport", error)
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


router.delete('/deleteReport:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let report_id=SqlString.escape(obj["report_id"])

    let sql="delete from svayam_"+b_acct_id+"_hr.reports where report_id="+report_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->reports-->deleteReport--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Report Deleted Successfully"
            res.send(objectToSend);
        }
    })
})




module.exports = router;
