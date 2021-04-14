var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getCurrentlyAssignedPosts:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    
    let sql="Select  is_head,is_enforcement,zone,id,designation_code,section_code,emp_id,DATE_FORMAT(posting_end_date,'%Y-%m-%d') as posting_end_date,order_no,"
    +" DATE_FORMAT(posting_date,'%Y-%m-%d') as posting_date,create_user_id,update_user_id,posting_code,posting_type_code,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+b_acct_id+"_hr.post where "
    +"posting_type_code='PRI'"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->post-->post-->getACurrentPost", error)
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

router.get('/getAllAssignedPosts:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]

    let sql="Select is_head,is_enforcement,zone,id,designation_code,section_code,emp_id,DATE_FORMAT(posting_end_date,'%Y-%m-%d') as posting_end_date,order_no,"
    +" DATE_FORMAT(posting_date,'%Y-%m-%d') as posting_date,create_user_id,update_user_id,posting_code,posting_type_code,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+b_acct_id+"_hr.post where emp_id="+SqlString.escape(emp_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->post-->post-->getAllPosts", error)
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


router.post('/assignPost',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    
    let b_acct_id=obj["b_acct_id"]
    let designation_code=SqlString.escape(obj["designation_code"])
    let order_no=SqlString.escape(obj["order_no"])
    let posting_end_date=SqlString.escape(obj["posting_end_date"])
  
    let emp_id=SqlString.escape(obj["emp_id"])
    let section_code=SqlString.escape(obj["section_code"])
    let posting_type_code=SqlString.escape(obj["posting_type_code"])
    let posting_date=SqlString.escape(obj["posting_date"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let posting_code=SqlString.escape(obj["posting_code"])
    let is_enforcement=SqlString.escape(obj["is_enforcement"])
    let zone=SqlString.escape(obj["zone"])

let is_head=SqlString.escape(obj["is_head"])
    let sql="insert into svayam_"+b_acct_id+"_hr.post ( is_head,is_enforcement,zone,order_no,posting_end_date,designation_code,emp_id,create_user_id,create_timestamp,"
            +" posting_date,posting_code,section_code,posting_type_code) values "
            +"("+is_head+","+is_enforcement+","+zone+","+order_no+","+posting_end_date+","+designation_code+","+emp_id+","+create_user_id+","+create_timestamp+","+posting_date+","+posting_code+","+section_code+","+posting_type_code+")"

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->post-->post-->assignPost", error)
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

router.put('/deactivatePost',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])

    let sql="update svayam_"+b_acct_id+"_hr.post set posting_status_code='INACTIVE' where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->post-->post-->deactivatePost", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Post Deactivated"
            res.send(objectToSend);
        }
    })
})


router.put('/updatePost',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    
    let b_acct_id=obj["b_acct_id"]
    let designation_code=SqlString.escape(obj["designation_code"])
    let order_no=SqlString.escape(obj["order_no"])
    let posting_end_date=SqlString.escape(obj["posting_end_date"])
    let id=SqlString.escape(obj["id"])
  
    let emp_id=SqlString.escape(obj["emp_id"])
    let section_code=SqlString.escape(obj["section_code"])
    let posting_type_code=SqlString.escape(obj["posting_type_code"])
    let posting_date=SqlString.escape(obj["posting_date"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let posting_code=SqlString.escape(obj["posting_code"])
    let is_enforcement=SqlString.escape(obj["is_enforcement"])
    let zone=SqlString.escape(obj["zone"])
let is_head=SqlString.escape(obj["is_head"]) 
    let sql="update svayam_"+b_acct_id+"_hr.post set is_head="+is_head+",order_no="+order_no+",posting_end_date="+posting_end_date+",designation_code="+designation_code+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+","
            +" posting_date="+posting_date+",posting_code="+posting_code+",section_code="+section_code+",posting_type_code="+posting_type_code+",is_enforcement="+is_enforcement+",zone ="+zone+" where id="+id
           

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->post-->post-->updatePost", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = 'Updated Successfully!'
            res.send(objectToSend);
        }
    })
})
module.exports=router;
