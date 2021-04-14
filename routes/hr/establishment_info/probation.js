var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getAllProbationInfo:dtls',(req,res)=>{

    let objectToSend={}
    let b_acct_id=req.params.dtls

    let sql="Select id,emp_id,probation_days,assessment_feedback,probation_status_code,"
            +"DATE_FORMAT(effective_dt,'%Y-%m-%d %H:%i:%S') as effective_dt,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.probation"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->probation-->probation-->geAllProbationInfo", error)
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

router.get('/getPartyProbationInfo:dtls',(req,res)=>{

    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])


    let sql="Select id,emp_id,probation_days,assessment_feedback,probation_status_code,"
            +"DATE_FORMAT(effective_dt,'%Y-%m-%d %H:%i:%S') as effective_dt,create_user_id,update_user_id,"
            +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
            +"update_timestamp from svayam_"+b_acct_id+"_hr.probation where emp_id="+emp_id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->probation-->probation-->getPartyProbationInfo", error)
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

router.post('/addPartyProbation',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let emp_id=SqlString.escape(obj["emp_id"])
    let probation_days=SqlString.escape(obj["probation_days"])
    let assessment_feedback=SqlString.escape(obj["assessment_feedback"])
    let probation_status_code=SqlString.escape(obj["probation_status_code"])
    let effective_dt=SqlString.escape(obj["effective_dt"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql="insert into svayam_"+b_acct_id+"_hr.probation (emp_id,probation_days,assessment_feedback,probation_status_code,effective_dt,create_user_id,create_timestamp) values "
            +"("+emp_id+","+probation_days+","+assessment_feedback+","+probation_status_code+","+effective_dt+","+create_user_id+","+create_timestamp+")"



    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->probation-->probation-->addPartyProbation", error)
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

router.put('/updateProbation',(req,res)=>{
    let objectToSend={}

    let obj=req.body
    let b_acct_id=obj["b_acct_id"]
    let probation_days=SqlString.escape(obj["probation_days"])
    let assessment_feedback=SqlString.escape(obj["assessment_feedback"])
    let probation_status_code=SqlString.escape(obj["probation_status_code"])
    let effective_dt=SqlString.escape(obj["effective_dt"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let id=SqlString.escape(obj["id"])

    let sql="update svayam_"+b_acct_id+"_hr.probation set probation_days="+probation_days+",assessment_feedback="+assessment_feedback+", "
            +" probation_status_code="+probation_status_code+",effective_dt="+effective_dt+",update_user_id="+update_user_id+","
            +" update_timestamp="+update_timestamp+" where id="+id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->probation-->probation-->updateProbation", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Probation Updated"
            res.send(objectToSend);
        }
    })


})





module.exports=router;