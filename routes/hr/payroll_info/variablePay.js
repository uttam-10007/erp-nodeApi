var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')

router.get('/getVariablePay:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)

    let sql = "Select id,pay_component_code,pay_component_amt,fin_year,month,pay_status_code,emp_id,pay_code,"
        + "create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from svayam_" + obj.b_acct_id + "_hr.variable_pay"
    if (obj['emp_id'] != undefined) {
        sql += " where emp_id=" + SqlString.escape(obj.emp_id)
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->variablePay-->getVariablePay", error)
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



router.post('/addVariablePay', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let pay_component_code = SqlString.escape(obj["pay_component_code"])
    let pay_component_amt = SqlString.escape(obj["pay_component_amt"])
    let fin_year = SqlString.escape(obj["fin_year"])
    let month = SqlString.escape(obj["month"])
    let pay_status_code = SqlString.escape(obj["pay_status_code"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let pay_code = SqlString.escape(obj["pay_code"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "insert into svayam_" + b_acct_id + "_hr.variable_pay (pay_component_code,pay_component_amt,fin_year,month,pay_status_code,emp_id,pay_code,create_user_id,create_timestamp) values"
        + "(" + pay_component_code + "," + pay_component_amt + "," + fin_year + "," + month + "," + pay_status_code + "," + emp_id + "," + pay_code + "," + create_user_id + "," + create_timestamp + ")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->variablePay-->addVariablePay", error)
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






router.put('/updateVariablePay', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    let id = obj["id"]
    let b_acct_id = obj["b_acct_id"]
    let pay_component_code = SqlString.escape(obj["pay_component_code"])
    let pay_component_amt = SqlString.escape(obj["pay_component_amt"])
    let fin_year = SqlString.escape(obj["fin_year"])
    let month = SqlString.escape(obj["month"])
    let pay_status_code = SqlString.escape(obj["pay_status_code"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let pay_code = SqlString.escape(obj["pay_code"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let upate_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update svayam_" + b_acct_id + "_hr.variable_pay set pay_component_code=" + pay_component_code + ",pay_component_amt=" + pay_component_amt
        + ",fin_year=" + fin_year + ",month=" + month + ",pay_status_code=" + pay_status_code + ",emp_id=" + emp_id + ",pay_code=" + pay_code
        + ",update_user_id=" + update_user_id + ",upate_timestamp=" + upate_timestamp + " where id=" + id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->variablePay-->updateVariablePay", error)
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



router.put('/changeStatusOfVariablePay', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    let id = obj["id"]
    let b_acct_id = obj["b_acct_id"]

    let pay_status_code = SqlString.escape(obj["pay_status_code"])

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let upate_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update svayam_" + b_acct_id + "_hr.variable_pay set pay_status_code=" + pay_status_code + ",update_user_id=" + update_user_id + ",upate_timestamp=" + upate_timestamp + " where id=" + id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->variablePay-->changeStatusOfVariablePay", error)
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

router.get('/getEffectiveVariablePay:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let month = obj["month"]
    let year = obj["year"]
    let sql = "SELECT id,pay_component_code,pay_component_amt,fin_year,month,pay_status_code,emp_id,pay_code, "
        + " create_user_id,update_user_id,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,"
        + " DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') AS update_timestamp  FROM svayam_" + obj.b_acct_id + "_hr.variable_pay WHERE fin_year=" + year
        + " AND MONTH =" + month + " AND pay_status_code='ACTIVE'  "
        


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->variablePay-->getEffectiveVariablePay", error)
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


router.post('/addarrayVariablePay', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
   let data = obj["data"]
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "insert into svayam_" + b_acct_id + "_hr.variable_pay (pay_component_code,pay_component_amt,fin_year,month,pay_status_code,emp_id,pay_code,create_user_id,create_timestamp) values"
        
        for (let i = 0; i < data.length; i++) {

        
            sql += "(" +  SqlString.escape(data[i]["pay_component_code"]) + "," + SqlString.escape(data[i]["pay_component_amt"]) + "," + SqlString.escape(data[i]["fin_year"]) + "," +  SqlString.escape(data[i]["month"]) + "," + SqlString.escape(data[i]["pay_status_code"]) + "," + SqlString.escape(data[i]["emp_id"]) + "," + SqlString.escape(data[i]["pay_code"]) + "," + create_user_id + "," + create_timestamp + ")"
        
            if(i < data.length -1 ){
                sql+=","
            }
            }



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->variablePay-->addarrayVariablePay", error)
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
