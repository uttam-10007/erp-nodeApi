var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment');


router.get('/getAllComplaints:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls;

    let sql="Select id,complaint_type_code,complaint_desc,DATE_FORMAT(complaint_dt,'%Y-%m-%d') as complaint_dt,emp_id,"
            +"complaint_status,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp from svayam_"+b_acct_id+"_hr.complaint"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->complaint-->getAllComplaints", error)
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

router.post('/createComplaint',(req,res)=>{
    let objectToSend={}

    let obj=req.body;

    let b_acct_id=SqlString.escape(obj["b_acct_id"])
    let complaint_type_code=SqlString.escape(obj["complaint_type_code"])
    let complaint_desc=SqlString.escape(obj["complaint_desc"])
    let complaint_dt=SqlString.escape(obj["complaint_dt"])
    let emp_id=SqlString.escape(obj["emp_id"])
    let complaint_status=SqlString.escape(obj["complaint_status"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_hr.complaint (complaint_type_code,complaint_desc,complaint_dt,emp_id,complaint_status,create_user_id,create_timestamp) values "
            +" ("+complaint_type_code+","+complaint_desc+","+complaint_dt+","+emp_id+","+complaint_status+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->complaint-->createComplaint", error)
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

router.put('/updateComplaintDetail',(req,res)=>{
    let objectToSend={}
    let obj=req.body

    let b_acct_id=SqlString.escape(obj["b_acct_id"])
    let complaint_type_code=SqlString.escape(obj["complaint_type_code"])
    let complaint_desc=SqlString.escape(obj["complaint_desc"])
    let complaint_dt=SqlString.escape(obj["complaint_dt"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let id=SqlString.escape(obj["id"])
    

    let sql="update svayam_"+b_acct_id+"_hr.complaint set complaint_type_code="+complaint_type_code+",complaint_desc="+complaint_desc+","
            +"complaint_dt="+complaint_dt+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->complaint-->updateComplaintDetail", error)
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

router.put('/changeComplaintStatus',(req,res)=>{
    let objectToSend={}

    let obj=req.body;

    let b_acct_id=SqlString.escape(obj["b_acct_id"])
    let id=SqlString.escape(obj["id"])
    let complaint_status=SqlString.escape(obj["complaint_status"])

    let sql="update svayam_"+b_acct_id+"_hr.complaint set complaint_status="+complaint_status+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->complaint-->changeComplaintStatus", error)
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


module.exports=router;