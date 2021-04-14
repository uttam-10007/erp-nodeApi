var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js')
var moment = require('moment')

router.get('/getAllSuspensions:dtls', (req, res) => {
    let objectToSend = {};
    var obj = JSON.parse(req.params.dtls);
    let b_acct_id = obj.b_acct_id;

   
   

    let sql = "Select id,order_id,DATE_FORMAT(suspension_start_dt,'%Y-%m-%d') as suspension_start_dt,emp_id,DATE_FORMAT(suspension_end_dt,'%Y-%m-%d') as suspension_end_dt,fraction_per,DATE_FORMAT(charge_sheet_dt,'%Y-%m-%d') as charge_sheet_dt,"
    + "en_officer_name,create_user_id,suspension_status,update_user_id,"
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    + "update_timestamp from svayam_" + b_acct_id + "_hr.suspension "


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->suspension-->suspension-->getAllSuspensions", error)
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

router.post('/suspendEmployee', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let suspension_start_dt = SqlString.escape(obj["suspension_start_dt"])
    let order_id = SqlString.escape(obj["order_id"])
    let suspension_end_dt = SqlString.escape(obj["suspension_end_dt"])
    let fraction_per = SqlString.escape(obj["fraction_per"])
    let charge_sheet_dt = SqlString.escape(obj["charge_sheet_dt"])
    let en_officer_name = SqlString.escape(obj["en_officer_name"])
    let emp_id = SqlString.escape(obj["emp_id"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));

 let employee_current_type_code = SqlString.escape(obj["employee_current_type_code"])

    let db = "svayam_" + b_acct_id + "_hr"

    let sql_insertSus = "insert into " + db + ".suspension (suspension_status,suspension_start_dt,suspension_end_dt,order_id,emp_id,fraction_per,charge_sheet_dt,"
        + "en_officer_name,create_user_id,create_timestamp) values "
        + " ('ACTIVE'," + suspension_start_dt + ","+suspension_end_dt+ "," + order_id + "," + emp_id + "," + fraction_per + "," + charge_sheet_dt + "," + en_officer_name + "," + create_user_id + "," + create_timestamp + ")"


    

    let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
        + " Select emp_id,emp_name,"+employee_current_type_code+",establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
        + ", emp_status_code"
        +",retirement_age,designation_code," +effective_timestamp+ ", "+create_user_id+ "," + create_timestamp +",promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time"
        
        + " from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";

    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->suspension-->suspension-->suspendEmployee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend); 
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->suspension-->suspension-->suspendEmployee", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }else{
                    mysqlCon.query(sql_insertSus+";"+sql_createArr,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->suspension-->suspension-->suspendEmployee", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release();
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->suspension-->suspension-->suspendEmployee", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Employee Suspended"
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

router.put('/updatesuspension',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    let b_acct_id=obj["b_acct_id"]
    let order_id=SqlString.escape(obj["order_id"])
    let suspension_start_dt=SqlString.escape(obj["suspension_start_dt"])
    let suspension_end_dt=SqlString.escape(obj["suspension_end_dt"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let charge_sheet_dt=SqlString.escape(obj["charge_sheet_dt"])
    let fraction_per=SqlString.escape(obj["fraction_per"])
    let en_officer_name=SqlString.escape(obj["en_officer_name"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let id=SqlString.escape(obj["id"])

    let sql_insertSus="update svayam_"+b_acct_id+"_hr.suspension set order_id="+order_id+",suspension_start_dt="+suspension_start_dt+", "
            +" suspension_end_dt="+suspension_end_dt+",emp_id="+emp_id+",charge_sheet_dt="+charge_sheet_dt+","
            +" fraction_per="+fraction_per+",en_officer_name="+en_officer_name+",update_user_id="+update_user_id+","
            +" update_timestamp="+update_timestamp+" where id="+id

           
            mysqlPool.getConnection(function(error,mysqlCon){
                if(error){
                    console.log("Error-->routes-->hr-->suspension-->suspension-->updatesuspension", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend); 
                }else{
                    mysqlCon.beginTransaction(function(error1){
                        if(error1){
                            console.log("Error-->routes-->hr-->suspension-->suspension-->updatesuspension", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        }else{
                            mysqlCon.query(sql_insertSus,function(error2,results2){
                                if(error2){
                                    console.log("Error-->routes-->hr-->suspension-->suspension-->updatesuspension", error2)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                }else{
                                    mysqlCon.commit(function(error3){
                                        if(error3){
                                            console.log("Error-->routes-->hr-->suspension-->suspension-->updatesuspension", error3)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release();
                                        }else{
                                            objectToSend["error"] = false
                                            objectToSend["data"] = "Employee Suspended"
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



router.put('/suspensionWithdraw',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    let b_acct_id=obj["b_acct_id"]
    
    let emp_id=SqlString.escape(obj["emp_id"])
    let suspension_status=SqlString.escape(obj["suspension_status"])
    
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));
    let id=SqlString.escape(obj["id"])
    let db = "svayam_" + b_acct_id + "_hr"
 let employee_current_type_code = SqlString.escape(obj["employee_current_type_code"])

 let sql_insertSus="update svayam_"+b_acct_id+"_hr.suspension set suspension_status="+suspension_status+" where id="+id


            let sql_createArr = "insert into " + db + ".establishment_info (emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
        + " Select emp_id,emp_name,"+employee_current_type_code+",establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
        + ", emp_status_code "
        +",retirement_age,designation_code," +effective_timestamp+ ", "+update_user_id+ "," + update_timestamp +",promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time"
        
        + " from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";
            mysqlPool.getConnection(function(error,mysqlCon){
                if(error){
                    console.log("Error-->routes-->hr-->suspension-->suspension-->suspensionWithdraw", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend); 
                }else{
                    mysqlCon.beginTransaction(function(error1){
                        if(error1){
                            console.log("Error-->routes-->hr-->suspension-->suspension-->suspensionWithdraw", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        }else{
                            mysqlCon.query(sql_insertSus+";"+sql_createArr,function(error2,results2){
                                if(error2){
                                    console.log("Error-->routes-->hr-->suspension-->suspension-->suspensionWithdraw", error2)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                }else{
                                    mysqlCon.commit(function(error3){
                                        if(error3){
                                            console.log("Error-->routes-->hr-->suspension-->suspension-->suspensionWithdraw", error3)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release();
                                        }else{
                                            objectToSend["error"] = false
                                            objectToSend["data"] = "Suspension Withdraw Successfully!"
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


router.get('/getAllSuspensioninmonth:dtls', (req, res) => {
    let objectToSend = {};
    var obj = JSON.parse(req.params.dtls);

    let b_acct_id = obj.b_acct_id;

    var year = obj["year"]
    var month=obj["month"] 

    let sql = "Select id,order_id,DATE_FORMAT(suspension_start_dt,'%Y-%m-%d') as suspension_start_dt,emp_id,DATE_FORMAT(suspension_end_dt,'%Y-%m-%d ') as suspension_end_dt,fraction_per,DATE_FORMAT(charge_sheet_dt,'%Y-%m-%d ') as charge_sheet_dt,"
        + "en_officer_name,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from svayam_" + b_acct_id + "_hr.suspension "

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->suspension-->suspension-->getAllSuspensioninmonth", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            if(results.length != 0){
                var results10 =[]
                
                for (let i = 0; i < results.length; i++) {

                    var suspension_start_dt =results[i]['suspension_start_dt']
                    var suspension_end_dt =results[i]['suspension_end_dt']
            
                    var sArr = suspension_start_dt.split('-');
                    var eArr = suspension_end_dt.split('-');
                    if(sArr[0] <=year && eArr[0] >=year ){
                        if(sArr[1] <=month && eArr[1] >= month){
                            results10.push(results[i])
                        }
                       
                    }
                    }
                    
                    
                 }
            
           
            
            objectToSend["error"] = false
            objectToSend["data"] = results10
            res.send(objectToSend);
        }
    })
})


module.exports = router;
