var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getQualifications:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls);

    let b_acct_id=obj["b_acct_id"];
    let emp_id=obj["emp_id"]

    let sql="Select id,education_name,education_type_code,pass_year_code,emp_id,create_user_id,update_user_id,"
        +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        +"update_timestamp from svayam_"+b_acct_id+"_hr.education where emp_id="+SqlString.escape(emp_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->education-->getQualifications", error)
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

router.post('/addQualification',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let education_name=obj["education_name"]
    let pass_year_code=obj["pass_year_code"]
    let emp_id=obj["emp_id"]
    let education_type_code=SqlString.escape(obj["education_type_code"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_hr.education (education_name,education_type_code,pass_year_code,emp_id,create_user_id,create_timestamp) values "
            +"("+SqlString.escape(education_name)+","+education_type_code+","+SqlString.escape(pass_year_code)+","+SqlString.escape(emp_id)+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->education-->addQualification", error)
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

router.put('/updateQualification',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let education_name=obj["education_name"]
    let pass_year_code=obj["pass_year_code"]
    let id=obj["id"]
    let education_type_code=SqlString.escape(obj["education_type_code"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="update svayam_"+b_acct_id+"_hr.education set education_name="+SqlString.escape(education_name)+","
            +"pass_year_code="+SqlString.escape(pass_year_code)+",education_type_code="+education_type_code+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+" where id="+SqlString.escape(id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->education-->updateQualification", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Qualification updated successfully" 
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteQualification:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.education where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->party-->education-->deleteQualification", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Qualification deleted successfully" 
            res.send(objectToSend);
        }
    })

})


module.exports=router;