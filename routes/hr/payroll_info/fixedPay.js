var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getFixedPayComponents:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]
    let status=obj["status"]

    let sql="Select id,emp_id,pay_component_code,status"
            +",create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.fixed_pay"

    let flag=true;
    if(emp_id!=undefined){
        sql +=" where emp_id="+SqlString.escape(emp_id)
    }
    if(status!=undefined){
        if(flag){
            sql+=" where status="+SqlString.escape(status)
        }else{
            sql+=" and status="+SqlString.escape(status)
        }
    }

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPay-->getAllFixedPay", error)
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

router.post('/addFixedPayComponent',(req,res)=>{
    let objectToSend={}

    let detail=req.body

    let b_acct_id=detail["b_acct_id"]

    let fixedPayInfo=detail["fixed_pay_info"]

    let sql="insert into svayam_"+b_acct_id+"_hr.fixed_pay (emp_id,pay_component_code,status,create_user_id,create_timestamp) values"
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    

    for(let i=0;i<fixedPayInfo.length;i++){
        let obj=fixedPayInfo[i]
        let pay_component_code=SqlString.escape(obj["pay_component_code"])
        let emp_id=SqlString.escape(obj["emp_id"])
        let status=SqlString.escape(obj["status"])
        let create_user_id=SqlString.escape(obj["create_user_id"])
        
        sql=sql+"("+emp_id+","+pay_component_code+","+status+","+create_user_id+","+create_timestamp+")"

        if(i<fixedPayInfo.length-1){
            sql+=","
        }

    }
    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPay-->addFixPayComponent", error)
            objectToSend["error"] = true
            if(error.message!=undefined&&error.message.includes("Duplicate")){
                objectToSend["data"]="Duplicate entry"
            }else{
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            }
            
            res.send(objectToSend);
        }else{
            
            objectToSend["error"] = false
            objectToSend["data"] = "Components added" 
            res.send(objectToSend);
        }
    })
    
   
    
})

router.put('/changeStatusOfComponent',(req,res)=>{

    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])
    let status=SqlString.escape(obj["status"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    


    let sql="update svayam_"+b_acct_id+"_hr.fixed_pay set status="+status+",update_user_id="+update_user_id+" "
        +", update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->fixedPay-->changeStatusOfFixPay", error)
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






module.exports=router;