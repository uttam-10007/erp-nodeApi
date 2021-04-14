var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getretirementinfo:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls;

 
    

    let sql="Select id,emp_id,reason_of_retirement,status,emp_id,update_user_id,"
        +"DATE_FORMAT(application_date,'%Y-%m-%d') as application_date,DATE_FORMAT(approval_date,'%Y-%m-%d ') as "
        +"approval_date,DATE_FORMAT(date_of_retirement,'%Y-%m-%d') as date_of_retirement,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp from svayam_"+b_acct_id+"_hr.retirement_info"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->establishment_info-->retirement-->getretirementinfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results 
            res.send(objectToSend);
        }
    })
})

router.post('/addretirement',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]
    let reason_of_retirement=obj["reason_of_retirement"]
    let status=obj["status"]
    let date_of_retirement=SqlString.escape(obj["date_of_retirement"])
    
    let create_date=SqlString.escape(moment().format('YYYY-MM-DD'))


    let sql="insert into svayam_"+b_acct_id+"_hr.retirement_info (emp_id,date_of_retirement,reason_of_retirement,status,application_date) values "
            +"("+SqlString.escape(emp_id)+","+date_of_retirement+","+SqlString.escape(reason_of_retirement)+","+SqlString.escape(status)+","+create_date+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Errorroutes-->hr-->establishment_info-->retirement-->addretirement", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId 
            res.send(objectToSend);
        }
    })
})

router.get('/getBillDetailForRetirement:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let db="svayam_" + b_acct_id + "_hr"
    let emp_id=SqlString.escape(obj["emp_id"]);
    let sql =  "SELECT * FROM "+db+".bill WHERE emp_id="+emp_id+" "
        + "and fin_year=(SELECT MAX(fin_year) FROM "+db+".bill WHERE pay_component_code='BASIC') AND pay_code='PAY' AND "
        +" MONTH=(SELECT MAX(MONTH) FROM "+db+".bill WHERE emp_id="+emp_id+" AND fin_year=(SELECT MAX(fin_year) FROM "+db+".bill WHERE emp_id="+emp_id+"))"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->retirement-->getBillDetailForRetirement", error)
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



router.post('/retireEmployee',(req,res)=>{
    
  
 let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])
    let order_id=SqlString.escape(obj["order_id"])
    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let emp_status_code=SqlString.escape(obj["emp_status_code"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let status=SqlString.escape(obj["status"])
    let id=SqlString.escape(obj["id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let approval_date=SqlString.escape(moment().format('YYYY-MM-DD'))
    let employee_current_type_code = SqlString.escape(obj["employee_current_type_code"])  
    let db="svayam_"+b_acct_id+"_hr"
    let leave_time = SqlString.escape('AFTERNOON')
    let retirement_date = SqlString.escape(obj["retirement_date"])
    

    let sql_createArr ="insert into " + db + ".establishment_info (order_id,emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
    + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
    + " Select "+ order_id +",emp_id,emp_name,"+employee_current_type_code+",establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
    + "," + emp_status_code + ""
    +",retirement_age,designation_code," +effective_timestamp+ ", "+create_user_id+ "," + create_timestamp +",promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,"+retirement_date+",ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,"+leave_time

    + " from "
    + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
    + ")estab where svm_rank=1";

    let updateQuery=" update " + db + ".retirement_info set approval_date="+approval_date+",update_user_id="+create_user_id
        +",update_timestamp="+create_timestamp+",status="+status+" where id="+id
    
        let updateQueryfixepay = "update " + db + ".fixed_pay_amount set effective_end_dt=" + retirement_date + ",update_user_id="+create_user_id+",update_timestamp="+create_timestamp+" where emp_id=" + emp_id + " and effective_end_dt >="+retirement_date
  


    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->establishment_info-->retirement-->retireEmployee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);  
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->establishment_info-->retirement-->retireEmployee", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_createArr+";"+updateQuery+";"+updateQueryfixepay,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->establishment_info-->retirement-->retireEmployee", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->establishment_info-->retirement-->retireEmployee", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Employee Retired" 
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



router.post('/onTimeRetireEmployee',(req,res)=>{

    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])
    let order_id=SqlString.escape(obj["order_id"])
    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let emp_status_code=SqlString.escape(obj["emp_status_code"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let employee_current_type_code = SqlString.escape(obj["employee_current_type_code"])
    let db="svayam_"+b_acct_id+"_hr"
    let retirement_date =SqlString.escape(obj["retirement_date"])




    let sql_createArr ="insert into " + db + ".establishment_info (order_id,emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
    + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
    + " Select "+ order_id +",emp_id,emp_name,"+employee_current_type_code+",establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
    + "," + emp_status_code + ""
    +",retirement_age,designation_code," +effective_timestamp+ ", "+create_user_id+ "," + create_timestamp +",promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,"+retirement_date+",ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time"

    + " from "
    + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
    + ")estab where svm_rank=1";

   
    let updateQueryfixepay = "update " + db + ".fixed_pay_amount set effective_end_dt=" + retirement_date + ",update_user_id="+create_user_id+",update_timestamp="+create_timestamp+" where emp_id=" + emp_id + " and effective_end_dt>="+retirement_date



        mysqlPool.getConnection(function(error,mysqlCon){
            if(error){
                console.log("Error-->routes-->hr-->establishment_info-->retirement-->onTimeRetireEmployee", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);  
            }else{
                mysqlCon.beginTransaction(function(error1){
                    if(error1){
                        console.log("Error-->routes-->hr-->establishment_info-->retirement-->onTimeRetireEmployee", error1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release()
                    }else{
                        mysqlCon.query(sql_createArr+";"+updateQueryfixepay,function(error2,results2){
                            if(error2){
                                console.log("Error-->routes-->hr-->establishment_info-->retirement-->onTimeRetireEmployee", error2)
                                objectToSend["error"] = true
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend);
                                mysqlCon.rollback()
                                mysqlCon.release()
                            }else{
                                mysqlCon.commit(function(error3){
                                    if(error3){
                                        console.log("Error-->routes-->hr-->establishment_info-->retirement-->onTimeRetireEmployee", error3)
                                        objectToSend["error"] = true
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend);
                                        mysqlCon.rollback()
                                        mysqlCon.release()
                                    }else{
                                        objectToSend["error"] = false
                                        objectToSend["data"] = "Employee Retired" 
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



module.exports=router;
