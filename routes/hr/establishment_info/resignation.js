var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')


router.get('/getAllResignations:dtls', (req, res) => {
    let objectToSend = {}

    let b_acct_id = req.params.dtls

    let sql = "Select id,resignation_type_code,DATE_FORMAT(resignation_date,'%Y-%m-%d') as resignation_date,DATE_FORMAT(effective_dt,'%Y-%m-%d') as effective_dt,"
        + "DATE_FORMAT(resignation_approval_date,'%Y-%m-%d') as resignation_approval_date,emp_id,resignation_approval_user_id,rejected_by,resignation_reason,notice_period,resignation_status from svayam_" + b_acct_id + "_hr.resignation_info"


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->resignation-->getAllResignations", error)
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

router.post('/resign', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let resignation_type_code = SqlString.escape(obj["resignation_type_code"])
    let resignation_date = SqlString.escape(moment().format('YYYY-MM-DD'))
    let emp_id = SqlString.escape(obj["emp_id"])

    let resignation_reason = SqlString.escape(obj["resignation_reason"])
    let resignation_status = SqlString.escape(obj["resignation_status"])

    let sql = "insert into svayam_" + b_acct_id + "_hr.resignation_info (resignation_type_code,resignation_date,emp_id,resignation_reason,resignation_status) values "
        + "(" + resignation_type_code + "," + resignation_date + "," + emp_id + "," + resignation_reason + "," + resignation_status + ")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->resignation-->resign", error)
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

router.put('/approveResignation', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])
    let effective_dt = SqlString.escape(obj["effective_dt"])
    
    let leave_time = SqlString.escape(obj["leave_time"])
    let resignation_approval_date = SqlString.escape(moment().format('YYYY-MM-DD '))
    let notice_period = SqlString.escape(obj["notice_period"])
    let id = SqlString.escape(obj["id"])
    let resignation_status = SqlString.escape(obj["resignation_status"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let resignation_approval_user_id = SqlString.escape(obj["resignation_approval_user_id"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let db = "svayam_" + b_acct_id + "_hr"

    let sql_updRes = "update svayam_" + b_acct_id + "_hr.resignation_info set resignation_status=" + resignation_status + ",effective_dt=" + effective_dt + ","
        + "resignation_approval_date=" + resignation_approval_date + ",notice_period=" + notice_period + ",resignation_approval_user_id=" + resignation_approval_user_id + " where id=" + id


    let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,calculation_code,order_id,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,joining_time,leave_time) "
        + " Select emp_id,emp_name,calculation_code,order_id,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
        + "," + emp_status_code + ""
        + ",retirement_age,designation_code," + effective_timestamp + "," + create_user_id + "," + create_timestamp + ",joining_time,"+leave_time+" from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->resignation-->approveResignation", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->establishment_info-->resignation-->approveResignation", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql_updRes + ";" + sql_createArr, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->establishment_info-->resignation-->approveResignation", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->establishment_info-->resignation-->approveResignation", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Resignation Approved"
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.put('/resignationComplete', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])
    let id = SqlString.escape(obj["id"])
    let resignation_status = SqlString.escape(obj["resignation_status"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let calculation_code = SqlString.escape(obj["calculation_code"])
    // let effective_dt=SqlString.escape(moment().format('YYYY-MM-DD'))
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let db = "svayam_" + b_acct_id + "_hr"
    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let leave_time = SqlString.escape(obj["leave_time"])

    let sql_updRes = "update svayam_" + b_acct_id + "_hr.resignation_info set resignation_status=" + resignation_status + ""
        + " where id=" + id

    let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,calculation_code,order_id,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,joining_time,leave_time) "
        + " Select emp_id,emp_name," + calculation_code + ",order_id+,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
        + "," + emp_status_code + ""
        + ",retirement_age,designation_code," + effective_timestamp + "," + create_user_id + "," + create_timestamp + ",joining_time,"+leave_time+" from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1"

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->resignation-->resignationComplete", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->establishment_info-->resignation-->resignationComplete", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql_updRes + ";" + sql_createArr, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->establishment_info-->resignation-->resignationComplete", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->establishment_info-->resignation-->resignationComplete", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Resignation Complete"
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.put('/rejectResignation', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])
    let resignation_status = SqlString.escape(obj["resignation_status"])
    let effective_dt = SqlString.escape(moment().format('YYYY-MM-DD'))
    let rejected_by = SqlString.escape(obj["rejected_by"])

    let sql = "update svayam_" + b_acct_id + "_hr.resignation_info set resignation_status=" + resignation_status + ",effective_dt=" + effective_dt + ",rejected_by=" + rejected_by + " where id=" + id
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->resignation-->rejectResignation", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Resignation Rejected"
            res.send(objectToSend);
        }
    })
})

module.exports = router;
