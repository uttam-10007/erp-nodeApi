var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getAllLoans:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls

    let sql="Select id,emp_id,loan_type_code,loan_amount,loan_status_code,DATE_FORMAT(application_timestamp,'%Y-%m-%d %H:%i:%S') as application_date,"
            +"DATE_FORMAT(approval_timestamp,'%Y-%m-%d %H:%i:%S') as approval_date,approval_user_id from svayam_"+b_acct_id+"_hr.loan"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->loan-->loan-->getAllLoans", error)
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

router.post('/applyForLoan',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])
    let loan_type_code=SqlString.escape(obj["loan_type_code"])
    let loan_amount=SqlString.escape(obj["loan_amount"])
    let loan_status_code=SqlString.escape(obj["loan_status_code"])
    let application_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.loan (emp_id,loan_type_code,loan_amount,loan_status_code,application_timestamp) values "
            +"("+emp_id+","+loan_type_code+","+loan_amount+","+loan_status_code+","+application_timestamp+") "

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->loan-->loan-->applyForLoan", error)
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

router.post('/disburseLoan',(req,res)=>{
    let objectToSend={}
    let loan_dtl=req.body

    let b_acct_id=loan_dtl["b_acct_id"]
    let id=loan_dtl["id"]
    let approval_user_id=loan_dtl["approval_user_id"]
    let loan_status_code=SqlString.escape(loan_dtl["loan_status_code"])
    let create_user_id=approval_user_id
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let data=loan_dtl["data"]

    let sql_insertVp="insert into svayam_"+b_acct_id+"_hr.variable_pay (pay_component_code,pay_component_amt,fin_year,month,pay_status_code,emp_id,pay_code,create_user_id,create_timestamp) values"

    for(let i=0;i<data.length;i++){
        let obj=data[i]
        let pay_component_code=SqlString.escape(obj["pay_component_code"])
        let pay_component_amount=SqlString.escape(obj["pay_component_amt"])
        let fin_year=SqlString.escape(obj["fin_year"])
        let month=SqlString.escape(obj["month"])
        let emp_id=SqlString.escape(obj["emp_id"])
        let pay_status_code=SqlString.escape(obj["pay_status_code"])
        let pay_code=SqlString.escape(obj["pay_code"])
        sql_insertVp+="("+pay_component_code+","+pay_component_amount+","+fin_year+","+month+","+pay_status_code+","+emp_id+","+pay_code+","+create_user_id+","+create_timestamp+")"

        if(i<data.length-1){
            sql_insertVp+=","
        }
    }

    let approval_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.loan set loan_status_code="+loan_status_code+",approval_timestamp="+approval_timestamp+",approval_user_id="+approval_user_id+" where id="+id

    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->loan-->loan-->applyForLoan", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);  
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->loan-->loan-->applyForLoan", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql+";"+sql_insertVp,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->loan-->loan-->applyForLoan", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->loan-->loan-->applyForLoan", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Loan Approved" 
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

router.get('/getLoanInstallmentInfo:dtls',(req,res)=>{

    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let pay_component_code=SqlString.escape(obj["pay_component_code"])

    let sql="Select id,pay_component_code,pay_component_amount,fin_year,month,pay_status_code,emp_id,pay_code,"
            +"create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.variable_pay where pay_component_code="+pay_component_code
    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->loan-->loan-->getLoanInstallmentInfo", error)
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


router.put('/changeStatus',(req,res)=>{
    let objectToSend={}
    let obj=req.body
    let b_acct_id=SqlString.escape(obj["b_acct_id"])
    let id=SqlString.escape(obj["id"])
    let loan_status_code=SqlString.escape(obj["loan_status_code"])
    let approval_user_id=SqlString.escape(obj["approval_user_id"])
    let approval_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.loan set loan_status_code="+loan_status_code+",approval_timestamp="+approval_timestamp+",approval_user_id="+approval_user_id+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->loan-->loan-->rejectLoan", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            
            objectToSend["error"] = false
            objectToSend["data"] = "Loan Rejected" 
            res.send(objectToSend);
        }
    })
})

module.exports=router;