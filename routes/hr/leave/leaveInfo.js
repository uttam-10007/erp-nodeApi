var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')

router.get('/getLeaveInfo:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let year = obj["year"]
    let emp_id = obj["emp_id"]
 let leave_code = obj["leave_code"]
    let month = obj["month"]

    let sql = "Select id,emp_id,leave_code,year,month,num_of_leaves,leaves_remaining,"
        + "create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from svayam_" + b_acct_id + "_hr.leave_info "

    let flag = true;

    if (year != undefined) {
        if (flag) {
            sql += " where year=" + SqlString.escape(year)
            flag = false;
        } else {
            sql += " and year=" + SqlString.escape(year)
        }
    }
    if (emp_id != undefined) {
        if (flag) {
            sql += " where emp_id=" + SqlString.escape(emp_id)
            flag = false;
        } else {
            sql += " and emp_id=" + SqlString.escape(emp_id)
        }
    }
 if (leave_code != undefined) {
        if (flag) {
            sql += " where leave_code=" + SqlString.escape(leave_code)
            flag = false;
        } else {
            sql += " and leave_code=" + SqlString.escape(leave_code)
        }
    }
    if (month != undefined) {
        if (flag) {
            sql += " where month=" + SqlString.escape(month)
            flag = false;
        } else {
            sql += " and month=" + SqlString.escape(month)
        }
    }
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveInfo-->getLeaveInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteLeaveInfo:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])

    let sql = "delete from svayam_" + b_acct_id + "_hr.leave_info where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveInfo-->deleteLeaveInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Leave Info Deleted"
            res.send(objectToSend);
        }
    })
})

router.put('/updateLeaveInfo', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let num_of_leaves = SqlString.escape(obj["num_of_leaves"])
    let leaves_remaining = SqlString.escape(obj["leaves_remaining"])
     let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let id = SqlString.escape(obj["id"])

 let year = SqlString.escape(obj["year"])
    let month = SqlString.escape(obj["month"])
  
    let sql = "update svayam_" + b_acct_id + "_hr.leave_info set year="+year+",month="+month+",num_of_leaves=" + num_of_leaves + ",leaves_remaining=" + leaves_remaining 
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveInfo-->updateLeaveInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Leave Info Updated"
            res.send(objectToSend);
        }
    })
})

router.post('/addLeaveInfo', (req, res) => {
    let objectToSend = {}

    let obj = req.body;

    let b_acct_id = obj["b_acct_id"]
    let leave_data = obj["leave_data"]

    let sql = "insert into svayam_" + b_acct_id + "_hr.leave_info (emp_id,leave_code,year,month,num_of_leaves,leaves_remaining"
        + ",create_user_id,create_timestamp) values"

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    for (let i = 0; i < leave_data.length; i++) {
        let temp = leave_data[i]

        let emp_id = SqlString.escape(temp["emp_id"])
        let leave_code = SqlString.escape(temp["leave_code"])
        let year = SqlString.escape(temp["year"])
        let month = SqlString.escape(temp["month"])
        let num_of_leaves = SqlString.escape(temp["num_of_leaves"])
        let leaves_remaining = SqlString.escape(temp["leaves_remaining"])
          let create_user_id = SqlString.escape(temp["create_user_id"])

        sql += "(" + emp_id + "," + leave_code + ","  + year + ","
            + month + "," + num_of_leaves + "," + leaves_remaining +  "," + create_user_id + "," + create_timestamp + ")"

        if (i < leave_data.length - 1) {
            sql += ","
        }

    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveInfo-->addLeaveInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Leaves Added"
            res.send(objectToSend);
        }
    })

})

module.exports = router;
