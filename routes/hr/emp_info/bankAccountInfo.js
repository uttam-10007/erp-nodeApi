var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getAllBankAccounts:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls

    let db="svayam_"+b_acct_id+"_hr"

    let sql="Select id,bank_code,branch_code,ifsc_code,acct_no,pf_acct_no,emp_id,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp   "
            +" from "+db+".bank_acct_info"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->bankAccountInfo-->getAllBankAccounts", error)
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

router.get('/getPartyBankAccount:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"];
    let emp_id=obj["emp_id"]

    let db="svayam_"+b_acct_id+"_hr"


    let sql="Select id,bank_code,branch_code,ifsc_code,acct_no,pf_acct_no,emp_id,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp   "
            +" from "+db+".bank_acct_info where emp_id="+SqlString.escape(emp_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->bankAccountInfo-->getPartyBankAccount", error)
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

router.post('/addBankAccount',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let bank_code=SqlString.escape(obj["bank_code"])
    let branch_code=SqlString.escape(obj["branch_code"])
    let ifsc_code=SqlString.escape(obj["ifsc_code"])
    let acct_no=SqlString.escape(obj["acct_no"])
    let pf_acct_no=SqlString.escape(obj["pf_acct_no"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.bank_acct_info (bank_code,branch_code,ifsc_code,acct_no,pf_acct_no,emp_id,create_user_id,create_timestamp) values "
            +"("+bank_code+","+branch_code+","+ifsc_code+","+acct_no+","+pf_acct_no+","+emp_id+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->bankAccountInfo-->addBankAccount", error)
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

router.put('/updateBankAccount',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let bank_code=SqlString.escape(obj["bank_code"])
    let id=SqlString.escape(obj["id"])
    let branch_code=SqlString.escape(obj["branch_code"])
    let ifsc_code=SqlString.escape(obj["ifsc_code"])
    let acct_no=SqlString.escape(obj["acct_no"])
    let pf_acct_no=SqlString.escape(obj["pf_acct_no"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.bank_acct_info set bank_code="+bank_code+",branch_code="+branch_code
            +",ifsc_code="+ifsc_code+",acct_no="+acct_no+",pf_acct_no="+pf_acct_no+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->bankAccountInfo-->updateBankAccount", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Bank Account updated successfully" 
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteBankAccount:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.bank_acct_info where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->bankAccountInfo-->deleteBankAccount", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Bank Account deleted successfully" 
            res.send(objectToSend);
        }
    })

})


module.exports=router;