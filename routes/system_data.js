var express = require('express');
var router = express.Router();
var propObj = require('../config_con.js')
var mysqlPool = require('../connections/mysqlConnection.js');

var SqlString = require('sqlstring');
var moment = require('moment')

router.get('/getsystemdate', (req, res) => {
    let objectToSend = {}
    let date = moment().format('YYYY-MM-DD')
            objectToSend["error"] = false
            objectToSend["data"] = date
            res.send(objectToSend);
})



router.get('/getSystemCodeValue', (req, res) => {

    let objectToSend = {}

    
    let sql_fetchCurr = "Select * from "+propObj.svayamSystemDbName+".system_code_value"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->system_data-->getSystemCodeValue--", error)
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




router.get('/getLogicalFields', (req, res) => {

    let objectToSend = {}

    
    let sql_fetchCurr = "Select * from "+propObj.svayamSystemDbName+".logical_field_description"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->system_data-->getLogicalFields--", error)
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


router.get('/getAllRoles',(req,res)=>{
    let objectToSend={}

    let sql="Select * from "+propObj.svayamSystemDbName+".fpem_roles"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->system_data-->getAllRoles--", error)
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


router.get('/getBillPayments:dtls',(req,res)=>{
    let objectToSend={}

    let acct_id=req.params.dtls

    let sql="Select * from "+propObj.svayamSystemDbName+".billing_info where acct_id="+acct_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->system_data-->getBillPayments--", error)
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

router.post('/billPayment',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let acct_id=SqlString.escape(obj["acct_id"])
    let bill_amt=SqlString.escape(obj["bill_amt"])
    let paid_on=SqlString.escape(obj["paid_on"])
    let paid_by=SqlString.escape(obj["paid_by"])
    let bill_ref_num=SqlString.escape(obj["bill_ref_num"])

    let sql="insert into "+propObj.svayamSystemDbName+".billing_info (acct_id,bill_amt,paid_on,paid_by,bill_ref_num) values "
            +"("+acct_id+","+bill_amt+","+paid_on+","+paid_by+","+bill_ref_num+")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->system_data-->billPayment--", error)
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

module.exports = router;
