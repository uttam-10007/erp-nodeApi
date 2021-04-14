var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js')
var moment = require('moment')

router.get('/getAllPromotions:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]

    let db = "svayam_" + b_acct_id + "_hr"
    if (obj["promotion_status"] != undefined) {
        let promotion_status = obj["promotion_status"]

        let status = ""

        for (let i = 0; i < promotion_status.length; i++) {
            status += SqlString.escape(promotion_status[i])

            if (i < promotion_status.length - 1) {
                status += ","
            }
        }

    }

    let sql = "Select basic_pay,DATE_FORMAT(promotion_effective_dt,'%Y-%m-%d') as promotion_effective_dt,promotion_id,promotion_type_code,order_id,grade_pay_code,emp_id,promotion_status,promotion_interval,DATE_FORMAT(promotion_date,'%Y-%m-%d') as promotion_date,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from svayam_" + b_acct_id + "_hr.promotion "

    if (obj["promotion_status"] != undefined) {
        if (promotion_status.length > 0) {
            sql += " where promotion_status in (" + status + ")"
        }
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->getAllPromotions", error)
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

router.get('/getEmpPromotions:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])


    let sql_effective = "Select DATE_FORMAT(promotion_effective_dt,'%Y-%m-%d') as promotion_effective_dt,promotion_id,promotion_type_code,order_id,grade_pay_code,emp_id,promotion_status,promotion_interval,DATE_FORMAT(promotion_date,'%Y-%m-%d') as promotion_date,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from svayam_" + b_acct_id + "_hr.promotion where emp_id=" + emp_id

    mysqlPool.query(sql_effective, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->getEmpPromotions", error)
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


router.put('/promoteEmployee', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = SqlString.escape(obj["b_acct_id"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let calculation_code = SqlString.escape(obj["calculation_code"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let promotion_status = SqlString.escape(obj["promotion_status"])
    let promotion_id = SqlString.escape(obj["promotion_id"])
    let grade_pay_code = SqlString.escape(obj["grade_pay_code"])
    let level_code = SqlString.escape(obj["level_code"])
    let basic_pay = SqlString.escape(obj["basic_pay"])
    let order_id = SqlString.escape(obj["order_id"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + b_acct_id + "_hr"

    let sql = "update " + db + ".promotion set promotion_status=" + promotion_status + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where promotion_id=" + promotion_id

    let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,calculation_code,order_id,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,joining_time,leave_time) "
        + " Select emp_id,emp_name," + calculation_code + "," + order_id + ",establishment_type_code," + level_code + "," + basic_pay + ",cadre_code,class_code,pay_commission_code," + grade_pay_code + ",pay_scale_code"
        + "," + emp_status_code + ""
        + ",retirement_age,designation_code," + create_timestamp + "," + update_user_id + "," + create_timestamp + ",joining_time,leave_time from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->promoteEmployee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->establishment_info-->prmotion-->promoteEmployee", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql + ";" + sql_createArr, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->promoteEmployee", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release();
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->establishment_info-->prmotion-->promoteEmployee", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Employee promoted successfully"
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                }
                            })
                        }
                    })
                }
            })
        }
    })



})


router.put('/rejectPromotion', (req, res) => {
    let objectToSend = {}
    let obj = req.body


    let b_acct_id = SqlString.escape(obj["b_acct_id"])
    let db = "svayam_" + b_acct_id + "_hr"

    let promotion_status = SqlString.escape(obj["promotion_status"])
    let promotion_id = SqlString.escape(obj["promotion_id"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let sql = "update " + db + ".promotion set promotion_status=" + promotion_status + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where promotion_id=" + promotion_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->rejectPromotion", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Rejected Successfully"
            res.send(objectToSend);
        }
    })
})


router.post('/addPromtion', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = SqlString.escape(obj["b_acct_id"])
    let grade_pay_code = SqlString.escape(obj["grade_pay_code"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let promotion_status = SqlString.escape(obj["promotion_status"])
    let promotion_type_code = SqlString.escape(obj["promotion_type_code"])
    let order_id = SqlString.escape(obj["order_id"])
    let promotion_interval = SqlString.escape(obj["promotion_interval"])
    let promotion_date = SqlString.escape(obj["promotion_date"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let level_code = SqlString.escape(obj["level_code"])
    let promotion_id = SqlString.escape(obj["promotion_id"])
    let promotion_effective_dt = SqlString.escape(obj["promotion_effective_dt"])
    let basic_pay = SqlString.escape(obj["basic_pay"])
    let pay_scale_code = SqlString.escape(obj["pay_scale_code"])
    let db = "svayam_" + b_acct_id + "_hr"

    let sql = "update " + db + ".promotion set promotion_status='PROMOTED',promotion_effective_dt=" + promotion_effective_dt + ",update_user_id=" + create_user_id + ",update_timestamp=" + create_timestamp + ",level_code=" + level_code + ",grade_pay_code=" + grade_pay_code + ",pay_scale_code=" + pay_scale_code + ",basic_pay=" + basic_pay + "  where promotion_id= " + promotion_id

    // let sql_createArr = "insert into " + db + ".establishment_info (promotion_type_code,inc_month,emp_id,emp_name,order_id,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
    // + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp) "
    // + " Select promotion_type_code,inc_month,emp_id,emp_name," + order_id + ",establishment_type_code,"+level_code+","+basic_pay+",cadre_code,class_code,pay_commission_code," + grade_pay_code + ","+pay_scale_code
    // + ", emp_status_code"
    // + ",retirement_age,designation_code," + create_timestamp + "," + create_user_id + "," + create_timestamp + " from "
    // + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
    // + ")estab where svm_rank=1"



    let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code,retirement_age,designation_code,effective_timestamp,order_id,promotion_type_code,inc_month,create_user_id,create_timestamp,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
        + " Select emp_id,emp_name,employee_current_type_code,establishment_type_code," + level_code
        + "," + basic_pay + ",cadre_code,class_code,pay_commission_code," + grade_pay_code + "," + pay_scale_code
        + ",emp_status_code,retirement_age,designation_code," + create_timestamp + "," + order_id
        + ",promotion_type_code,inc_month," + create_user_id + "," + create_timestamp + ",joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql + ";" + sql_createArr, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release();
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Employee promoted successfully"
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})



router.post('/addDCPPromtion', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = SqlString.escape(obj["b_acct_id"])
    let grade_pay_code = SqlString.escape(obj["grade_pay_code"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let promotion_status = SqlString.escape(obj["promotion_status"])
    let promotion_type_code = "DCP"
    let promotion_interval = 0;
    let order_id = SqlString.escape(obj["order_id"])
    let promotion_date = SqlString.escape(obj["effective_dt"]);
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let level_code = SqlString.escape(obj["level_code"])
    let promotion_effective_dt = SqlString.escape(obj["effective_dt"])
    let basic_pay = SqlString.escape(obj["basic_pay"])
    let pay_scale_code = SqlString.escape(obj["pay_scale_code"])
    let designation_code = SqlString.escape(obj["designation_code"])

    let db = "svayam_" + b_acct_id + "_hr";

    let sql = "insert into " + db + ".promotion (promotion_type_code,order_id,grade_pay_code,emp_id,promotion_status,promotion_interval,promotion_date"
        + ",create_timestamp,create_user_id,level_code,pay_scale_code,basic_pay,promotion_effective_dt) values('" + promotion_type_code + "'," + order_id
        + "," + grade_pay_code + "," + emp_id + "," + promotion_status + "," + promotion_interval + ","
        + promotion_date + "," + create_timestamp + "," + create_user_id + "," + level_code + "," + pay_scale_code + "," + basic_pay + "," + promotion_effective_dt + ")";

    let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code,retirement_age,designation_code,effective_timestamp,order_id,promotion_type_code,inc_month,create_user_id,create_timestamp,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
        + " Select emp_id,emp_name,employee_current_type_code,establishment_type_code," + level_code + "," + basic_pay + ",cadre_code,class_code,pay_commission_code," + grade_pay_code + "," + pay_scale_code + ",emp_status_code,retirement_age," + designation_code + "," + create_timestamp + "," + order_id + ",promotion_type_code,inc_month," + create_user_id + "," + create_timestamp + ",joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql + ";" + sql_createArr, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release();
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->establishment_info-->prmotion-->addPromtion", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Employee promoted successfully"
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})
router.delete('/deleteACP:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"];
    let promotion_id = SqlString.escape(obj['promotion_id']);

    let sql = "delete from svayam_" + b_acct_id + "_hr.promotion where promotion_id=" + promotion_id;

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->deletePromotion", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Delete Successfully!"
            res.send(objectToSend);
        }
    })
});

router.post('/addACP', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = SqlString.escape(obj["b_acct_id"])
    let grade_pay_code = SqlString.escape(obj["grade_pay_code"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let level_code = SqlString.escape(obj["level_code"])
    let promotion_status = SqlString.escape(obj["promotion_status"])
    let promotion_type_code = SqlString.escape(obj["promotion_type_code"])
    let order_id = SqlString.escape(obj["order_id"])
    let promotion_interval = SqlString.escape(obj["promotion_interval"])
    let promotion_date = SqlString.escape(obj["promotion_date"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));
    let pay_scale_code = SqlString.escape(obj["pay_scale_code"]);
    let basic_pay = SqlString.escape(obj["basic_pay"])
    let promotion_effective_dt = SqlString.escape(obj["promotion_effective_dt"])



    let db = "svayam_" + b_acct_id + "_hr"

    let sql_insertPro = "insert into " + db
        + ".promotion (promotion_type_code,order_id,grade_pay_code,emp_id,promotion_status,level_code,promotion_interval,promotion_date,create_user_id,create_timestamp,pay_scale_code,basic_pay,promotion_effective_dt) values "
        + " (" + promotion_type_code + "," + order_id + "," + grade_pay_code
        + "," + emp_id + "," + promotion_status + "," + level_code + "," + promotion_interval
        + "," + promotion_date + "," + create_user_id + "," + create_timestamp + "," + pay_scale_code
        + "," + basic_pay + "," + promotion_effective_dt + ")"

    mysqlPool.query(sql_insertPro, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->prmotion-->insertPromtion", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});
module.exports = router;
