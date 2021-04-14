var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')




router.post('/addapproval',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let data=obj["data"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_hr.approval (doc_type,level_of_approval,section_code,designation_code,create_user_id,create_timestamp) values "

 for (let i = 0; i < data.length; i++) {
            sql+= "("+SqlString.escape(data[i].doc_type)+","+SqlString.escape(data[i].level_of_approval)+","+SqlString.escape(data[i].section_code)+","+SqlString.escape(data[i].designation_code)+","+SqlString.escape(data[i].create_user_id)+","+create_timestamp+")"

 if (i < data.length - 1) {
            sql += " , "
        }
   
        }
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->approval-->addapproval", error)
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

router.put('/updateapproval',(req,res)=>{
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
            console.log("Error-->routes-->hr-->settings-->approval-->updateapproval", error)
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

router.delete('/deleteapproval:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.approval where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->approval-->deleteapproval", error)
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
router.post('/addapprovalstatus',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let data=obj["data"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_hr.approval_status (remark,level_of_approval,doc_type,status,doc_local_no,create_user_id,create_timestamp) values "

for (let i = 0; i < data.length; i++) {
            sql+= "("+SqlString.escape(data[i].remark)+","+SqlString.escape(data[i].level_of_approval)+","+SqlString.escape(data[i].doc_type)+","+SqlString.escape(data[i].status)+","+SqlString.escape(data[i].doc_local_no)+","+SqlString.escape(data[i].create_user_id)+","+create_timestamp+")"

 if (i < data.length - 1) {
            sql += " , "
        }
   
        }

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->approval-->addapprovalstatus", error)
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

router.put('/updateapprovalstatus',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let level_of_approval=obj["level_of_approval"]
    let status=obj["status"]
    let id=obj["id"]
    let doc_local_no=SqlString.escape(obj["doc_local_no"])
    let doc_type=SqlString.escape(obj["doc_type"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="update svayam_"+b_acct_id+"_hr.approval_status set level_of_approval="+SqlString.escape(level_of_approval)+","
            +"status="+SqlString.escape(status)+",doc_local_no="+doc_local_no+",doc_type="+doc_type+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+",remark = "+SqlString.escape(obj["remark"])
            +" where id="+SqlString.escape(id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->approval-->updateapprovalstatus", error)
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

router.delete('/deleteapprovalstatus:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.approval_status where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->approval-->deleteapprovalstatus", error)
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

router.get('/getdataofapprovalstatus:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;


    
    let sql_fetchCurr = "SELECT remark,id,level_of_approval,doc_type,status,doc_local_no,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_"+b_acct_id+"_hr.approval_status";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->settings-->approval-->getdataofapprovalstatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});


router.get('/getapproval:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;


    
    let sql_fetchCurr = "SELECT id,doc_type,level_of_approval,section_code,designation_code,create_user_id,create_timestamp,update_user_id,update_timestamp from svayam_"+b_acct_id+"_hr.approval";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->settings-->approval-->getapproval--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});



module.exports=router;
