var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getLicInfo:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls

    let db="svayam_"+b_acct_id+"_hr"

    let sql="Select id,company_name,lic_no,ifsc_code,acct_no,tensure_of_deduction,emp_id,create_user_id,update_user_id,amount,"
    +"DATE_FORMAT(deduction_from,'%Y-%m-%d') as deduction_from,DATE_FORMAT(deduction_to,'%Y-%m-%d') as deduction_to , "
           
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp   "
            +" from "+db+".lic"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->lic-->getLicInfo", error)
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


router.post('/addLicInfo',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let tensure_of_deduction=SqlString.escape(obj["tensure_of_deduction"])
    let company_name=SqlString.escape(obj["company_name"])
    let ifsc_code=SqlString.escape(obj["ifsc_code"])
    let acct_no=SqlString.escape(obj["acct_no"])
    let deduction_from=SqlString.escape(obj["deduction_from"])
    let deduction_to=SqlString.escape(obj["deduction_to"])
let lic_no=SqlString.escape(obj['lic_no']);
let amount=SqlString.escape(obj['amount']);

    let emp_id=SqlString.escape(obj["emp_id"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.lic (lic_no,amount,tensure_of_deduction,company_name,ifsc_code,acct_no,deduction_from,deduction_to,emp_id,create_user_id,create_timestamp) values "
            +"("+lic_no+","+amount+","+tensure_of_deduction+","+company_name+","+ifsc_code+","+acct_no+","+deduction_from+","+deduction_to+","+emp_id+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->lic-->addLicInfo", error)
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

router.put('/updatelicInfo',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let company_name=SqlString.escape(obj["company_name"])
    let id=SqlString.escape(obj["id"])
    let tensure_of_deduction=SqlString.escape(obj["tensure_of_deduction"])
    let ifsc_code=SqlString.escape(obj["ifsc_code"])
    let acct_no=SqlString.escape(obj["acct_no"])
    let deduction_from=SqlString.escape(obj["deduction_from"])
    let deduction_to=SqlString.escape(obj["deduction_to"])
let lic_no=SqlString.escape(obj['lic_no']);
let amount=SqlString.escape(obj['amount']);
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.lic set company_name="+company_name+",tensure_of_deduction="+tensure_of_deduction+",lic_no="+lic_no+",amount="+amount
            +",ifsc_code="+ifsc_code+",acct_no="+acct_no+",deduction_to="+deduction_to+",deduction_from="+deduction_from+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->lic-->updatelicInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Updated successfully" 
            res.send(objectToSend);
        }
    })
})


router.delete('/deletelicInfo:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.lic where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->lic-->deletelicInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted successfully" 
            res.send(objectToSend);
        }
    })

})


module.exports=router;
