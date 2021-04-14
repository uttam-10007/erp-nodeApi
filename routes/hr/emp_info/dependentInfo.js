var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getDependents:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"];
    let emp_id=obj["emp_id"]

    let sql="Select id,dependent_name,relation_code,emp_id,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.dependent_info where emp_id="+SqlString.escape(emp_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->dependentInfo-->getDependents", error)
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

router.post('/addDependent',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let dependent_name=SqlString.escape(obj["dependent_name"])
    let relation_code=SqlString.escape(obj["relation_code"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_hr.dependent_info (dependent_name,relation_code,emp_id,create_user_id,create_timestamp) values "
            +"("+dependent_name+","+relation_code+","+emp_id+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->dependentInfo-->addDependent", error)
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

router.put('/updateDependent',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let dependent_name=obj["dependent_name"]
    let relation_code=obj["relation_code"]
    let id=obj["id"]
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="update svayam_"+b_acct_id+"_hr.dependent_info set dependent_name="+SqlString.escape(dependent_name)+",relation_code="+SqlString.escape(relation_code)
            +",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+SqlString.escape(id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->dependentInfo-->updateDependent", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Dependent updated successfully" 
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteDependent:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.dependent_info where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->dependentInfo-->deleteDependent", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Dependent deleted successfully" 
            res.send(objectToSend);
        }
    })

})


module.exports=router;