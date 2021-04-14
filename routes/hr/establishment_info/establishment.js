var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')





router.get('/getEstablishementInfo:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])

    let sql = "Select joining_time,leave_time,promotion_type_code,inc_month,id,emp_id,emp_name,employee_current_type_code,establishment_type_code,order_id,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,DATE_FORMAT(effective_timestamp,'%Y-%m-%d %H:%i:%S') as effective_timestamp,create_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(joining_date,'%Y-%m-%d') as joining_date,joining_type_code,DATE_FORMAT(joining_service_date,'%Y-%m-%d') as joining_service_date,"
        + "DATE_FORMAT(retirement_date,'%Y-%m-%d') as retirement_date,ordering_authority,DATE_FORMAT(probation_end_dt,'%Y-%m-%d') as probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning"

        + " from svayam_" + b_acct_id + "_hr.establishment_info where emp_id=" + emp_id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->joining-->establishment-->getEstablishementInfo", error)
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
router.get('/getCurrentEstablishementInfo:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])

    let sql = "Select joining_time,leave_time,promotion_type_code,inc_month,id,emp_id,emp_name,employee_current_type_code,establishment_type_code,order_id,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,DATE_FORMAT(effective_timestamp,'%Y-%m-%d %H:%i:%S') as effective_timestamp,create_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(joining_date,'%Y-%m-%d') as joining_date,joining_type_code,DATE_FORMAT(joining_service_date,'%Y-%m-%d') as joining_service_date,"
        + "DATE_FORMAT(retirement_date,'%Y-%m-%d') as retirement_date,ordering_authority,DATE_FORMAT(probation_end_dt,'%Y-%m-%d') as probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning"
        + " from svayam_" + b_acct_id + "_hr.establishment_info where emp_id=" + emp_id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->joining-->establishment-->getEstablishementInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            var id = -1;
            var ob = {};
            for (var i = 0; i < results.length; i++) {
                if (id < results[i].id) {
                    id = results[i].id;
                    ob = results[i];
                }
            }
            objectToSend["error"] = false
            objectToSend["data"] = [ob];
            res.send(objectToSend);
        }
    })

})
router.get('/getAllCurrentEstablishementInfo:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let db = "svayam_" + b_acct_id + "_hr";
    let sql = "Select joining_time,leave_time,promotion_type_code,inc_month,id,emp_id,emp_name,employee_current_type_code,establishment_type_code,order_id,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,DATE_FORMAT(effective_timestamp,'%Y-%m-%d %H:%i:%S') as effective_timestamp,create_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(joining_date,'%Y-%m-%d') as joining_date,joining_type_code,DATE_FORMAT(joining_service_date,'%Y-%m-%d') as joining_service_date,"
        + "DATE_FORMAT(retirement_date,'%Y-%m-%d') as retirement_date,ordering_authority,DATE_FORMAT(probation_end_dt,'%Y-%m-%d') as probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning"
        // +" from svayam_"+b_acct_id+"_hr.establishment_info";
        + " from (Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info )temp where svm_rank=1"

    if (obj["emp_status_code"] != undefined) {
        sql += " and emp_status_code=" + emp_status_code;
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->joining-->establishment-->getEstablishementInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {

            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })
})
router.get('/getArrayAllCurrentEstablishementInfo:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let emp_status_code = obj["emp_status_code"]
    let db = "svayam_" + b_acct_id + "_hr";
    let sql = "Select joining_time,leave_time,promotion_type_code,inc_month,id,emp_id,emp_name,employee_current_type_code,establishment_type_code,order_id,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,DATE_FORMAT(effective_timestamp,'%Y-%m-%d %H:%i:%S') as effective_timestamp,create_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(joining_date,'%Y-%m-%d') as joining_date,joining_type_code,DATE_FORMAT(joining_service_date,'%Y-%m-%d') as joining_service_date,"
        + "DATE_FORMAT(retirement_date,'%Y-%m-%d') as retirement_date,ordering_authority,DATE_FORMAT(probation_end_dt,'%Y-%m-%d') as probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning"
        // +" from svayam_"+b_acct_id+"_hr.establishment_info";
        + " from (Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info )temp where svm_rank=1"

    if (obj["emp_status_code"] != undefined) {
        if (obj["emp_status_code"].length > 0) {
            sql += " and emp_status_code in ('" + emp_status_code.join("','") + "')";
        }
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->joining-->establishment-->getEstablishementInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {

            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })

})



router.put('/updateEstablishmentInfo', (req, res) => {

    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])

    // let emp_id=SqlString.escape(obj["emp_id"])

    let db = "svayam_" + b_acct_id + "_hr"

    let sql = "update " + db + ".establishment_info set emp_status_code=" + emp_status_code + " where emp_id=" + emp_id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->joining-->establishment-->updateEstablishmentInfo", error)
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

router.post('/updateAllEstablishmentInfo', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let establishment_type_code = SqlString.escape(obj["establishment_type_code"])
    let level_code = SqlString.escape(obj["level_code"])
    let basic_pay = SqlString.escape(obj["basic_pay"])
    let cadre_code = SqlString.escape(obj["cadre_code"])
    let class_code = SqlString.escape(obj["class_code"])
    let pay_commission_code = SqlString.escape(obj["pay_commission_code"])
    let grade_pay_code = SqlString.escape(obj["grade_pay_code"])
    let pay_scale_code = SqlString.escape(obj["pay_scale_code"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let emp_id = SqlString.escape(obj["emp_id"])

    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let retirement_age = SqlString.escape(obj["retirement_age"])
    let designation_code = SqlString.escape(obj["designation_code"])
    let inc_month = SqlString.escape(obj["inc_month"])

    let promotion_type_code = SqlString.escape(obj["promotion_type_code"])
    let joining_date= SqlString.escape(obj["joining_date"])
    let joining_type_code= SqlString.escape(obj["joining_type_code"])
    let joining_service_date= SqlString.escape(obj["joining_service_date"])
    let ordering_authority= SqlString.escape(obj["ordering_authority"])
    let retirement_date= SqlString.escape(obj["retirement_date"])
    let probation_end_dt= SqlString.escape(obj["probation_end_dt"])
    let probation_feedback= SqlString.escape(obj["probation_feedback"])

    let notice_period= SqlString.escape(obj["notice_period"])
    let designation_group_code= SqlString.escape(obj["designation_group_code"])
    let uniform_ind= SqlString.escape(obj["uniform_ind"])
    let conv_code= SqlString.escape(obj["conv_code"])
    let family_planning= SqlString.escape(obj["family_planning"])
    let joining_time= SqlString.escape(obj["joining_time"])
    let leave_time= SqlString.escape(obj["leave_time"])
    


    let db = "svayam_" + b_acct_id + "_hr"
    let sql_updateArr = "update " + db + ".establishment_info set promotion_type_code=" + promotion_type_code + ",inc_month=" + inc_month + ",establishment_type_code=" + establishment_type_code 
    + ",level_code=" + level_code + ",basic_pay=" + basic_pay + ",cadre_code=" + cadre_code + ",class_code=" + class_code 
    + ",pay_commission_code=" + pay_commission_code + ",grade_pay_code=" + grade_pay_code + ",pay_scale_code=" + pay_scale_code 
    + ",retirement_age=" + retirement_age + ",designation_code=" + designation_code + ",effective_timestamp=" + effective_timestamp 
    + ",joining_date=" + joining_date + ",joining_type_code=" + joining_type_code + ",joining_service_date=" + joining_service_date 
    + ",ordering_authority=" + ordering_authority + ",retirement_date=" + retirement_date + ",probation_end_dt=" + probation_end_dt 
    + ",probation_feedback=" + probation_feedback + ",notice_period=" + notice_period + ",designation_group_code=" + designation_group_code 
    + ",uniform_ind=" + uniform_ind + ",conv_code=" + conv_code + ",family_planning=" + family_planning 
    +",joining_time ="+joining_time+",leave_time ="+leave_time
    + ",emp_status_code=" + emp_status_code + " where id=" + SqlString.escape(obj["id"]);
    /* let sql_createArr="insert into "+db+".establishment_info (emp_id,emp_name,calculation_code,order_id,service_type_code,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
            +",retirement_age,designation_code,emp_id,effective_timestamp,create_user_id,create_timestamp) values "
            +"("+emp_id+","+emp_name+","+calculation_code+","+order_id+","+service_type_code+","+cadre_code+","+class_code+","+pay_commission_code+","+grade_pay_code+","+pay_scale_code+","+emp_status_code
            +","+retirement_age+","+designation_code+","+emp_id+","+effective_timestamp+","+create_user_id+","+create_timestamp+")"
 */
    mysqlPool.query(sql_updateArr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment-->establishment-->insertEstablishmentInfo", error)
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
router.post('/insertEstablishmentInfo', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let calculation_code = SqlString.escape(obj["calculation_code"])
    let order_id = SqlString.escape(obj["order_id"])
    let establishment_type_code = SqlString.escape(obj["establishment_type_code"])
    let level_code = SqlString.escape(obj["level_code"])
    let basic_pay = SqlString.escape(obj["basic_pay"])
    let cadre_code = SqlString.escape(obj["cadre_code"])
    let class_code = SqlString.escape(obj["class_code"])
    let pay_commission_code = SqlString.escape(obj["pay_commission_code"])
    let grade_pay_code = SqlString.escape(obj["grade_pay_code"])
    let pay_scale_code = SqlString.escape(obj["pay_scale_code"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let emp_name = SqlString.escape(obj["emp_name"])

    let inc_month = SqlString.escape(obj["inc_month"])
    let promotion_type_code = SqlString.escape(obj["promotion_type_code"])

    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let retirement_age = SqlString.escape(obj["retirement_age"])
    let designation_code = SqlString.escape(obj["designation_code"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let joining_date= SqlString.escape(obj["joining_date"])
    let joining_type_code= SqlString.escape(obj["joining_type_code"])
    let joining_service_date= SqlString.escape(obj["joining_service_date"])
    let ordering_authority= SqlString.escape(obj["ordering_authority"])
    let retirement_date= SqlString.escape(obj["retirement_date"])
    let probation_end_dt= SqlString.escape(obj["probation_end_dt"])
    let probation_feedback= SqlString.escape(obj["probation_feedback"])

    let notice_period= SqlString.escape(obj["notice_period"])
    let designation_group_code= SqlString.escape(obj["designation_group_code"])
    let uniform_ind= SqlString.escape(obj["uniform_ind"])
    let conv_code= SqlString.escape(obj["conv_code"])
    let family_planning= SqlString.escape(obj["family_planning"])
    let joining_time= SqlString.escape(obj["joining_time"])
    let leave_time= SqlString.escape(obj["leave_time"])
    let db = "svayam_" + b_acct_id + "_hr"

    let sql_createArr = "insert into " + db + ".establishment_info (promotion_type_code,inc_month,emp_name,order_id,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,emp_id,effective_timestamp,create_user_id,create_timestamp,joining_date,joining_type_code,joining_service_date,ordering_authority"
        +",retirement_date,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) values "
        + "(" + promotion_type_code + "," + inc_month + "," + emp_name  + "," + order_id + "," + establishment_type_code + "," + level_code + "," + basic_pay + "," + cadre_code + "," + class_code + "," + pay_commission_code + "," + grade_pay_code + "," + pay_scale_code + "," + emp_status_code
        + "," + retirement_age + "," + designation_code + "," + emp_id + "," + effective_timestamp + "," + create_user_id + "," + create_timestamp
        + "," + joining_date + "," + joining_type_code + "," + joining_service_date + "," + ordering_authority + "," + retirement_date + "," + probation_end_dt 
        + "," + probation_feedback + "," + notice_period + "," + designation_group_code + "," + uniform_ind + "," + conv_code + "," + family_planning + ","+joining_time+","+leave_time+")"


    mysqlPool.query(sql_createArr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment-->establishment-->insertEstablishmentInfo", error)
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







router.post('/addestablishment', (req, res) => {


    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    //establishment_info query
    let establishment_info = obj["establishment_info"]
    let establishment_type_code1 = SqlString.escape(establishment_info["establishment_type_code"])
    let level_code1 = SqlString.escape(establishment_info["level_code"])
    let basic_pay1 = SqlString.escape(establishment_info["basic_pay"])
    let cadre_code1 = SqlString.escape(establishment_info["cadre_code"])
    let class_code1 = SqlString.escape(establishment_info["class_code"])
    let pay_commission_code1 = SqlString.escape(establishment_info["pay_commission_code"])
    let grade_pay_code1 = SqlString.escape(establishment_info["grade_pay_code"])
    let pay_scale_code1 = SqlString.escape(establishment_info["pay_scale_code"])
    let emp_status_code1 = SqlString.escape(establishment_info["emp_status_code"])
    let emp_id1 = SqlString.escape(establishment_info["emp_id"])
    let effective_timestamp1 = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let retirement_age1 = SqlString.escape(establishment_info["retirement_age"])
    let designation_code1 = SqlString.escape(establishment_info["designation_code"])
    let inc_month1 = SqlString.escape(establishment_info["inc_month"])
    let promotion_type_code1 = SqlString.escape(establishment_info["promotion_type_code"])
    let joining_date1 = SqlString.escape(establishment_info["joining_date"])
    let joining_type_code1 = SqlString.escape(establishment_info["joining_type_code"])
    let joining_service_date1 = SqlString.escape(establishment_info["joining_service_date"])
    let ordering_authority1 = SqlString.escape(establishment_info["ordering_authority"])
    let retirement_date1 = SqlString.escape(establishment_info["retirement_date"])
    let probation_end_dt1 = SqlString.escape(establishment_info["probation_end_dt"])
    let probation_feedback1 = SqlString.escape(establishment_info["probation_feedback"])
    let notice_period1 = SqlString.escape(establishment_info["notice_period"])
    let designation_group_code1 = SqlString.escape(establishment_info["designation_group_code"])
    let uniform_ind1 = SqlString.escape(establishment_info["uniform_ind"])
    let conv_code1 = SqlString.escape(establishment_info["conv_code"])
    let family_planning1 = SqlString.escape(establishment_info["family_planning"])
    let joining_time= SqlString.escape(obj["joining_time"])
    let leave_time= SqlString.escape(obj["leave_time"])


    let db = "svayam_" + b_acct_id + "_hr"
    let sql1 = "update " + db + ".establishment_info set promotion_type_code=" + promotion_type_code1 + ",inc_month=" + inc_month1 + ",establishment_type_code=" + establishment_type_code1
        + ",level_code=" + level_code1 + ",basic_pay=" + basic_pay1 + ",cadre_code=" + cadre_code1 + ",class_code=" + class_code1
        + ",pay_commission_code=" + pay_commission_code1 + ",grade_pay_code=" + grade_pay_code1 + ",pay_scale_code=" + pay_scale_code1
        + ",retirement_age=" + retirement_age1 + ",designation_code=" + designation_code1 + ",effective_timestamp=" + effective_timestamp1
        + ",joining_date=" + joining_date1 + ",joining_type_code=" + joining_type_code1 + ",joining_service_date=" + joining_service_date1
        + ",ordering_authority=" + ordering_authority1 + ",retirement_date=" + retirement_date1 + ",probation_end_dt=" + probation_end_dt1
        + ",probation_feedback=" + probation_feedback1 + ",notice_period=" + notice_period1 + ",designation_group_code=" + designation_group_code1
        + ",uniform_ind=" + uniform_ind1 + ",conv_code=" + conv_code1 + ",family_planning=" + family_planning1
        + ",joining_time=" + joining_time + ",leave_time=" + leave_time
        + ",emp_status_code=" + emp_status_code1 + " where emp_id=" + emp_id1;

    //leave query
    let leave_info = obj["leave_info"]

    let sql2 = "insert into svayam_" + b_acct_id + "_hr.leave_info (emp_id,leave_code,year,month,num_of_leaves,leaves_remaining"
        + ",create_user_id,create_timestamp) values"

    for (let i = 0; i < leave_info.length; i++) {
        let temp = leave_info[i]

        let emp_id2 = SqlString.escape(temp["emp_id"])
        let leave_code2 = SqlString.escape(temp["leave_code"])
        let leave_rate2 = SqlString.escape(temp["leave_rate"])
        let is_leave_carry_fwd2 = SqlString.escape(temp["is_leave_carry_fwd"])
        let renew_ind_on_year_change2 = SqlString.escape(temp["renew_ind_on_year_change"])
        let year2 = SqlString.escape(temp["year"])
        let month2 = SqlString.escape(temp["month"])
        let num_of_leaves2 = SqlString.escape(temp["num_of_leaves"])
        let leaves_remaining2 = SqlString.escape(temp["leaves_remaining"])
        let carry_forward_leaves2 = SqlString.escape(temp["carry_forward_leaves"])
        let adjust_remaining_leaves2 = SqlString.escape(temp["adjust_remaining_leaves"])
        let create_user_id2 = SqlString.escape(temp["create_user_id"])

        sql2 += "(" + emp_id2 + "," + leave_code2 + "," + year2 + ","
            + month2 + "," + num_of_leaves2 + "," + leaves_remaining2  + "," + create_user_id2 + "," + create_timestamp + ")"

        if (i < leave_info.length - 1) {
            sql2 += ","
        }

    }

    //fixed_pay_amount query

    let fixed_pay_amount = obj['fixed_pay_amount']

    let end_dt3 = SqlString.escape(fixed_pay_amount["end_dt"])

    let fixedPayInfo3 = fixed_pay_amount["fixed_pay_info"]
    let est3 = SqlString.escape(fixedPayInfo3[0]["effective_start_dt"])

    let sql3 = "insert into svayam_" + b_acct_id + "_hr.fixed_pay_amount (pay_component_code,pay_component_amt,effective_start_dt,"
        + "effective_end_dt,emp_id,pay_code,create_user_id,create_timestamp) values"

    let sql3_upd = "update svayam_" + b_acct_id + "_hr.fixed_pay_amount set effective_end_dt=" + est3 + " where effective_end_dt=" + end_dt3 + " and "
        + " pay_component_code in ("


    let payCompCodes3 = {}
    let empIds3 = {}

    for (let i = 0; i < fixedPayInfo3.length; i++) {
        let obj3 = fixedPayInfo3[i]
        let pay_component_code3 = SqlString.escape(obj3["pay_component_code"])
        let pay_component_amt3 = SqlString.escape(obj3["pay_component_amt"])
        let effective_start_dt3 = SqlString.escape(obj3["effective_start_dt"])
        let effective_end_dt3 = SqlString.escape(obj3["effective_end_dt"])
        let emp_id3 = SqlString.escape(obj3["emp_id"])
        let pay_code3 = SqlString.escape(obj3["pay_code"])
        let create_user_id3 = SqlString.escape(obj3["create_user_id"])

        payCompCodes3[pay_component_code3] = true
        empIds3[emp_id3] = true

        sql3 = sql3 + "(" + pay_component_code3 + "," + pay_component_amt3 + "," + effective_start_dt3 + "," + effective_end_dt3 + "," + emp_id3 + "," + pay_code3 + "," + create_user_id3 + "," + create_timestamp + ")"

        if (i < fixedPayInfo3.length - 1) {
            sql3 += ","
        }

    }

    sql3_upd = sql3_upd + Object.keys(payCompCodes3).join(",") + ")  and emp_id in (" + Object.keys(empIds3).join(",") + ")"




    //variable_pay

    let variable_pay = obj['variable_pay']

    let pay_component_code4 = SqlString.escape(variable_pay["pay_component_code"])
    let pay_component_amt4 = SqlString.escape(variable_pay["pay_component_amt"])
    let fin_year4 = SqlString.escape(variable_pay["fin_year"])
    let month4 = SqlString.escape(variable_pay["month"])
    let pay_status_code4 = SqlString.escape(variable_pay["pay_status_code"])
    let emp_id4 = SqlString.escape(variable_pay["emp_id"])
    let pay_code4 = SqlString.escape(variable_pay["pay_code"])
    let create_user_id4 = SqlString.escape(variable_pay["create_user_id"])


    let sql4 = "insert into svayam_" + b_acct_id + "_hr.variable_pay (pay_component_code,pay_component_amt,fin_year,month,pay_status_code,emp_id,pay_code,create_user_id,create_timestamp) values"
        + "(" + pay_component_code4 + "," + pay_component_amt4 + "," + fin_year4 + "," + month4 + "," + pay_status_code4 + "," + emp_id4 + "," + pay_code4 + "," + create_user_id4 + "," + create_timestamp + ")"




    //promotion
    let promotion = obj['promotion']


    let sql5 = "insert into " + db + ".promotion (promotion_type_code,order_id,grade_pay_code,emp_id,promotion_status,promotion_interval,promotion_date,create_user_id,create_timestamp,level_code,pay_scale_code,basic_pay,promotion_effective_dt) values "


    for (let i = 0; i < promotion.length; i++) {
        let obj5 = promotion[i]
        let grade_pay_code5 = SqlString.escape(obj5["grade_pay_code"])
        let emp_id5 = SqlString.escape(obj5["emp_id"])
        let promotion_status5 = SqlString.escape(obj5["promotion_status"])
        let promotion_type_code5 = SqlString.escape(obj5["promotion_type_code"])
        let order_id5 = SqlString.escape(obj5["order_id"])
        let promotion_interval5 = SqlString.escape(obj5["promotion_interval"])
        let promotion_date5 = SqlString.escape(obj5["promotion_date"])
        let create_user_id5 = SqlString.escape(obj5["create_user_id"])
        let promotion_effective_dt5 = SqlString.escape(obj5["promotion_effective_dt"])
        let level_code5 = SqlString.escape(obj5["level_code"])
        let basic_pay5 = SqlString.escape(obj5["basic_pay"])
        let pay_scale_code5 = SqlString.escape(obj5["pay_scale_code"])

        sql5 = sql5 + "(" + promotion_type_code5 + "," + order_id5 + "," + grade_pay_code5 + "," + emp_id5 + "," + promotion_status5 + ","
            + promotion_interval5 + "," + promotion_date5 + "," + create_user_id5 + "," + create_timestamp + "," + level_code5 + ","
            + pay_scale_code5 + "," + basic_pay5 + "," + promotion_effective_dt5 + ")"

        if (i < promotion.length - 1) {
            sql5 += ","
        }

    }



    let finalQuery = sql1 + ";"
    if (obj["leave_info"].length > 0) {
        finalQuery = finalQuery + sql2 + ";"
    }

    if (fixedPayInfo3.length > 0) {
        finalQuery = finalQuery + sql3_upd + ";" + sql3 + ";"
    }

    finalQuery = finalQuery + sql4 + ";"
    if (obj["promotion"].length > 0) {
        finalQuery = finalQuery + sql5 + ";"
    }
    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->hr-->establishment-->establishment-->addestablishment--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->hr-->establishment-->establishment-->addJoining-", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(finalQuery, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->hr-->establishment-->establishment-->addJoining-", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release();
                        } else {

                            mysqlCon.commit(function (error5) {
                                if (error5) {
                                    console.log("Error-->routes-->hr-->establishment-->establishment-->addJoining-", error5)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Success"
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












module.exports = router;
