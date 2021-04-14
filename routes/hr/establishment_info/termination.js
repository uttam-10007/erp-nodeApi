var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')





router.post('/terminateEmployee',(req,res)=>{
    let objectToSend={}

    let obj=req.body;

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])
    let order_id=SqlString.escape(obj["order_id"])
    let effective_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let emp_status_code=SqlString.escape(obj["emp_status_code"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
  
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let employee_current_type_code = SqlString.escape(obj["employee_current_type_code"])
    let db="svayam_"+b_acct_id+"_hr"
    let dataArr=obj['data']


    let sql_createArr ="insert into " + db + ".establishment_info (order_id,emp_id,emp_name,employee_current_type_code,establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code,emp_status_code"
    + ",retirement_age,designation_code,effective_timestamp,create_user_id,create_timestamp,promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time) "
    + " Select "+ order_id +",emp_id,emp_name,"+employee_current_type_code+",establishment_type_code,level_code,basic_pay,cadre_code,class_code,pay_commission_code,grade_pay_code,pay_scale_code"
    + "," + emp_status_code + ""
    +",retirement_age,designation_code," +effective_timestamp+ ", "+create_user_id+ "," + create_timestamp +",promotion_type_code,inc_month,joining_date,joining_type_code,joining_service_date,retirement_date,ordering_authority,probation_end_dt,probation_feedback,notice_period,designation_group_code,uniform_ind,conv_code,family_planning,joining_time,leave_time"

    + " from "
    + "(Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from " + db + ".establishment_info where emp_id=" + emp_id
    + ")estab where svm_rank=1";


        let sql = "insert into svayam_" + b_acct_id + "_hr.variable_pay (pay_component_code,pay_component_amt,fin_year,month,pay_status_code,emp_id,pay_code,create_user_id,create_timestamp) values"

        for(let i=0;i<dataArr.length;i++){
            let pay_component_code = SqlString.escape(dataArr[i]["pay_component_code"])
            let pay_component_amt = SqlString.escape(dataArr[i]["pay_component_amt"])
            let fin_year = SqlString.escape(dataArr[i]["fin_year"])
            let month = SqlString.escape(dataArr[i]["month"])
            let pay_status_code = SqlString.escape(dataArr[i]["pay_status_code"])
            let emp_id = SqlString.escape(dataArr[i]["emp_id"])
            let pay_code = SqlString.escape(dataArr[i]["pay_code"])

            sql= sql+ "(" + pay_component_code + "," + pay_component_amt + "," + fin_year + "," + month + "," + pay_status_code + "," + emp_id + "," + pay_code + "," + create_user_id + "," + create_timestamp + ")"
            if(i<dataArr.length-1){
                sql= sql+ ","
            }
        }
        if(dataArr.length>0){
            sql_createArr=sql_createArr+";"+sql
        }


    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->establishment_info-->termination-->terminateEmployee", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->establishment_info-->termination-->terminateEmployee", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_createArr,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->establishment_info-->termination-->terminateEmployee", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){console.log("Error-->routes-->hr-->establishment_info-->termination-->terminateEmployee", error3)
                                objectToSend["error"] = true
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend);
                                mysqlCon.rollback()
                                mysqlCon.release()
                            }else{
                                objectToSend["error"] = false
                                objectToSend["data"] = "Employee Terminated"
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




router.get('/getBillDetailForTermination:dtls', (req, res) => {
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
            console.log("Error-->routes-->hr-->establishment_info-->termination-->getBillDetailForterminaton", error)
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


module.exports=router;
