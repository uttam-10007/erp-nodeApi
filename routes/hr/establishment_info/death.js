var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')





router.post('/deathOfEmployee', (req, res) => {

    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])
    let order_id = SqlString.escape(obj["order_id"])
    let leave_time = SqlString.escape(obj["leave_time"])
    
    let effective_timestamp = SqlString.escape(obj["date_of_death"])

let employee_current_type_code = SqlString.escape(obj["employee_current_type_code"])

    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let date_of_death =obj["date_of_death"]
    let create_user_id = SqlString.escape(obj["update_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
let data = obj["data"]    
let year =""
let dmonth =""
    var dArr = date_of_death.split('-');
    
    if(dArr[1] <=3 ){
        year = dArr[0] - 1;
       dmonth = dArr[1]
    }
    else{
        year = dArr[0] 
       dmonth = dArr[1]
    }

    let db = "svayam_" + b_acct_id + "_hr"

    let sql_createArr ="insert into " + db + ".establishment_info (order_id,emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
        + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
        + " Select "+ order_id +",emp_id,emp_name,"+employee_current_type_code+",establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
        + "," + emp_status_code + ""
        +",retirement_age,designation_code," +effective_timestamp+ ", "+create_user_id+ "," + create_timestamp +",promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,"+leave_time
        
        + " from "
        + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
        + ")estab where svm_rank=1";

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->death-->deathOfEmployee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->establishment_info-->death-->deathOfEmployee", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql_createArr, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->establishment_info-->death-->deathOfEmployee", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            
                            if(data.length !=0){
                            let sql_createArr1 ="insert into svayam_"+b_acct_id+"_hr.other_payment (other_pay_component_code,other_pay_component_amount,fin_year,month,party_name,"
                            +"party_bank_account_no,party_bank_name,party_bank_ifsc_code,party_bank_branch_name,pay_status_code,create_user_id,create_timestamp) values "
                for(let i=0;i<data.length;i++){
                    let obj=data[i]
            
                    let other_pay_component_code=SqlString.escape(obj["other_pay_component_code"])
                    let other_pay_component_amount=SqlString.escape(obj["other_pay_component_amount"])
                    let fin_year=SqlString.escape(year)
                    let month=SqlString.escape(dmonth)
                    
                    let party_name=SqlString.escape(obj["nom_name"])
                    let party_bank_account_no=SqlString.escape(obj["nom_bank_acct_no"])
                    let party_bank_name=SqlString.escape(obj["nom_bank_name"])
                    let party_bank_ifsc_code=SqlString.escape(obj["nom_ifsc_code"])
                    let party_bank_branch_name=SqlString.escape(obj["nom_branch_name"])
                    let pay_status_code=SqlString.escape(obj["pay_status_code"])
                    let create_user_id=SqlString.escape(obj["create_user_id"])
                    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
            
                    sql_createArr1+="("+other_pay_component_code+","+other_pay_component_amount+","+fin_year+","+month+","+party_name+","
                        +""+party_bank_account_no+","+party_bank_name+","+party_bank_ifsc_code+","+party_bank_branch_name+","+pay_status_code+","+create_user_id+","+create_timestamp+")"
                
                    if(i<data.length-1){
                        sql_createArr1+=","
                    }
                }
            
                            mysqlCon.query(sql_createArr1, function (error2, results2) {
                                if (error2) {
                                    console.log("Error-->routes-->hr-->establishment_info-->death-->deathOfEmployee", error2)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }
                            else{
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->establishment_info-->death-->deathOfEmployee", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Employee's after death proceedings is initiated"
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                }
                            })
                        }
                    })
                        }
                        else{
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->establishment_info-->death-->deathOfEmployee", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Employee's after death proceedings is initiated"
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                }
                            })
                        }
                    }
                    
                    })
                }
            })
        }
    })

})





router.get('/getBillDetailForDeath:dtls', (req, res) => {
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
            console.log("Error-->routes-->hr-->establishment_info-->death-->getBillDetailForDeath", error)
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



module.exports = router;
