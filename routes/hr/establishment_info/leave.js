var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getAllEmpLeaves:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let sql="Select id,emp_id,leave_code,num_of_leaves,year,month,remaining_leaves,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+obj.b_acct_id+"_hr.leave "
    if(obj['emp_id']!=undefined){
        sql += " where emp_id="+obj.emp_id
    }
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->leave-->leave-->getAllEmpLeaves", error)
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

router.delete('/deleteEmpLeave:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)

    let sql="delete from svayam_"+obj.b_acct_id+"_hr.leave where id="+obj.id
   
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->leave-->leave-->deleteEmpLeave", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully." 
            res.send(objectToSend);
        }
    })
})


router.post('/defineLeaveForemp',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let leave_code=SqlString.escape(obj["leave_code"])
    let num_of_leaves=SqlString.escape(obj["num_of_leaves"])
    let month=SqlString.escape(obj["month"])
    let remaining_leaves=SqlString.escape(obj["remaining_leaves"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let year=SqlString.escape(obj["year"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.leave (leave_code,num_of_leaves,month,remaining_leaves,emp_id,year,create_user_id,create_timestamp) values "
            +"("+leave_code+","+num_of_leaves+","+month+","+remaining_leaves+","+emp_id+","+year+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->leave-->leave-->defineLeaveForemp", error)
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


router.put('/updateLeaveForEmp',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let num_of_leaves=SqlString.escape(obj["num_of_leaves"])
    let month=SqlString.escape(obj["month"])
    let year=SqlString.escape(obj["year"])

    let remaining_leaves=SqlString.escape(obj["remaining_leaves"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let leave_code=SqlString.escape(obj["leave_code"])
    let id=SqlString.escape(obj["id"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="update svayam_"+b_acct_id+"_hr.leave set num_of_leaves="+num_of_leaves+", month="+month+", remaining_leaves="+remaining_leaves+"  "
            +",year="+year+",emp_id="+emp_id+",leave_code="+leave_code+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->leave-->leave-->updateLeaveForEmp", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Leave updated successfully" 
            res.send(objectToSend);
        }
    })

})

module.exports=router;
