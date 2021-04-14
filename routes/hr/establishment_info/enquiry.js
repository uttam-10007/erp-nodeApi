var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getEnquiryForComplaint:dtls',(req,res)=>{ 
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"];
    let complaint_id=obj["complaint_id"]

    let sql="Select id,DATE_FORMAT(en_dt,'%Y-%m-%d') as en_dt,en_type_code,en_desc,complaint_id,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.enquiry where complaint_id="+SqlString.escape(complaint_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->enquiry-->getEnquiryForComplaint", error)
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

router.post('/setupEnquiry',(req,res)=>{
    let objectToSend={}

    let obj=req.body;

    let b_acct_id=obj["b_acct_id"]
    let en_dt=SqlString.escape(obj["en_dt"])
    let en_type_code=SqlString.escape(obj["en_type_code"])
    let en_desc=SqlString.escape(obj["en_desc"])
    let complaint_id=SqlString.escape(obj["complaint_id"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.enquiry (en_dt,en_type_code,en_desc,complaint_id,create_user_id,create_timestamp) values "
            +" ("+en_dt+","+en_type_code+","+en_desc+","+complaint_id+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->enquiry-->setupEnquiry", error)
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