var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getPartyNoticePeriod:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])

    let sql="Select id,emp_id,notice_period,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+b_acct_id+"_hr.notice_period where emp_id="+emp_id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->joining-->noticePeriod-->getPartyNoticePeriod", error)
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

router.get('/getAllNoticePeriods:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls
    
    let sql="Select id,emp_id,notice_period,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+b_acct_id+"_hr.notice_period"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->joining-->noticePeriod-->getAllNoticePeriods", error)
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

router.post('/defineNoticePeriod',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])
    let notice_period=SqlString.escape(obj["notice_period"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.notice_period (emp_id,notice_period,create_user_id,create_timestamp) values"
            +"("+emp_id+","+notice_period+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->joining-->noticePeriod-->defineNoticePeriod", error)
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

router.post('/updateNoticePeriod',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])
    let notice_period=SqlString.escape(obj["notice_period"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.notice_period set notice_period="+notice_period+", update_user_id="+update_user_id+", update_timestamp="+update_timestamp+" "
            +" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->joining-->noticePeriod-->getAllNoticePeriods", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            
            objectToSend["error"] = false
            objectToSend["data"] = "Notice Period Updated" 
            res.send(objectToSend);
        }
    })

})

module.exports=router;