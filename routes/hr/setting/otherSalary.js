var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.post('/addadhocsalary',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    
    let emp_id=obj["emp_id"]
    let amount=SqlString.escape(obj["amount"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_hr.adhoc_salary (emp_id,amount,create_user_id,create_timestamp) values "
            +"("+SqlString.escape(emp_id)+","+amount+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->othersalary-->addadhocsalary", error)
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

router.put('/updateadhocsalary',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let doc_type=obj["doc_type"]
    let section_code=obj["section_code"]
    let id=obj["id"]
    let designation_code=SqlString.escape(obj["designation_code"])
    let level_of_approval=SqlString.escape(obj["level_of_approval"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="update svayam_"+b_acct_id+"_hr.approval set doc_type="+SqlString.escape(doc_type)+","
            +"section_code="+SqlString.escape(section_code)+",designation_code="+designation_code+",level_of_approval="+level_of_approval+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+" "
            +" where id="+SqlString.escape(id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->othersalary-->updateadhocsalary", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully" 
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteadhocsalary:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.approval where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->othersalary-->deleteadhocsalary", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully" 
            res.send(objectToSend);
        }
    })

})
router.post('/adddailywagesrate',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    
    let emp_id=obj["emp_id"]
    let daily_rate=SqlString.escape(obj["daily_rate"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_hr.daily_wages_rate (emp_id,daily_rate) values "
            +"("+SqlString.escape(emp_id)+","+daily_rate+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->othersalary-->adddailywagesrate", error)
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
router.put('/updatedailywagesrate',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]
    let daily_rate=obj["daily_rate"]
    let id=obj["id"]
   
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="update svayam_"+b_acct_id+"_hr.daily_wages_rate set emp_id="+SqlString.escape(emp_id)+","
            +"daily_rate="+SqlString.escape(daily_rate)+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+" "
            +" where id="+SqlString.escape(id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->othersalary-->updatedailywagesrate", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully" 
            res.send(objectToSend);
        }
    })
})

router.delete('/deletedailywagesrate:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.daily_wages_rate where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->setting-->othersalary-->deletedailywagesrate", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully" 
            res.send(objectToSend);
        }
    })

})
module.exports=router;