var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')



router.post('/transferEmployee', (req, res) => {


    let objectToSend = {}                                                                                                                                                 
     let obj=req.body
    let b_acct_id = SqlString.escape(obj["b_acct_id"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let order_id = SqlString.escape(obj["order_id"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let effective_timestamp = SqlString.escape(obj["effective_timestamp"])
    let employee_current_type_code = SqlString.escape(obj["employee_current_type_code"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let db = "svayam_" + b_acct_id + "_hr"

    
    let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code,retirement_age,"
        + "designation_code,effective_timestamp,order_id,promotion_type_code,inc_month,create_user_id,create_timestamp,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
        + " Select emp_id,emp_name," + employee_current_type_code + ",establishment_type_code,level_code"
        + ", basic_pay ,cadre_code,class_code,pay_commission_code, grade_pay_code ,pay_scale_code"
        + "," + emp_status_code + ",retirement_age,designation_code," + effective_timestamp + "," + order_id
        + ",promotion_type_code,inc_month," + update_user_id + "," + create_timestamp + ",joining_date,joining_type_code,"
        + "joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";

    let updateQuery = "update " + db + ".fixed_pay_amount set effective_end_dt=" + effective_timestamp + ",update_user_id="+update_user_id+",update_timestamp="+create_timestamp+" where emp_id=" + emp_id + " and effective_end_dt='2090-10-10'"

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->transfer-->transferEmployee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->establishment_info-->transfer-->transferEmployee", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql_createArr, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->establishment_info-->transfer-->transferEmployee", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.query(updateQuery, function (error21, results21) {
                                if (error21) {
                                    console.log("Error-->routes-->hr-->establishment_info-->transfer-->transferEmployee", error21)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.commit(function (error3) {
                                        if (error3) {
                                            console.log("Error-->routes-->hr-->establishment_info-->transfer-->transferEmployee", error3)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false
                                            objectToSend["data"] = "Employee Transferred"
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
        }
    })
})

module.exports = router;