var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')
router.get('/getcontribution:dtls', (req, res) => {
    let objectToSend = {};
    let b_acct_id = req.params.dtls

    let db = "svayam_" + b_acct_id + "_hr"


    let sql = "Select * from " + db + ".pension_contribution"



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->setting-->pension_contribution-->getcontribution", error)
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


router.post('/addcontribution', (req, res) => {
    let objectToSend = {};
    let obj = req.body

    let db = "svayam_" + obj.b_acct_id + "_hr"

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "insert into " + db + ".pension_contribution (emp_id,emp_name,designation,status,create_user_id,create_timestamp) values"
    for (let i = 0; i < obj.emp_id.length; i++) {
        sql += " (" + SqlString.escape(obj.emp_id[i]) + "," + SqlString.escape(obj.emp_name[i]) + "," + SqlString.escape(obj.designation[i]) + "," + SqlString.escape(obj.status) + "," + SqlString.escape(obj.create_user_id) + "," + create_timestamp
        if (obj.emp_id.length-1 > i) {
            sql += "),"
        }
        else {
            sql += ")"
        }

    }


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->setting-->pension_contribution-->addcontribution", error)
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
router.put('/updatecontribution', (req, res) => {
    let objectToSend = {};
    let obj = req.body

    let db = "svayam_" + obj.b_acct_id + "_hr"
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update " + db + ".pension_contribution set emp_id=" + SqlString.escape(obj.emp_id) + ",designation=" + SqlString.escape(obj.designation) + ",status=" + SqlString.escape(obj.status) + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp=" + SqlString.escape(obj.update_timestamp)
        + " where id=" + SqlString.escape(obj.id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->setting-->pension_contribution-->updateCodeValue", error)
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


router.delete('/deletecontribution:dtls', (req, res) => {
    let objectToSend = {};
    let obj = JSON.parse(req.params.dtls)


    let db = "svayam_" + obj.b_acct_id + "_hr"


    let sql = "delete from " + db + ".pension_contribution  where id=" + SqlString.escape(obj.id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->setting-->pension_contribution-->deletecontribution", error)
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