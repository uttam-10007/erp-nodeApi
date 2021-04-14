var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')


router.get('/getsalarystatus:dtls',(req,res)=>{
    let objectToSend={}
    let b_acct_id=req.params.dtls;
   

    let sql="Select * from svayam_"+b_acct_id+"_hr.salary_status"

   

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->getsalarystatus", error)
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

router.post('/holdsalary', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let emp_name = SqlString.escape(obj["emp_name"])
    let stop_fin_year = SqlString.escape(obj["stop_fin_year"])
    let stop_month = SqlString.escape(obj["stop_month"])
    let status = SqlString.escape('STOP')
    let emp_id = SqlString.escape(obj["emp_id"])
    let paid = SqlString.escape(obj["paid"])


    let sql = "insert into svayam_" + b_acct_id + "_hr.salary_status (emp_id,emp_name,stop_fin_year,stop_month,status,paid) values"
        + "(" + emp_id + "," + emp_name + "," + stop_fin_year + "," + stop_month + ","+ status +","+ paid +")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->holdsalary", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })

})




router.put('/changeStatusOfsalary', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    let id =  SqlString.escape(obj["id"])
    let b_acct_id = obj["b_acct_id"]
    let start_fin_year = SqlString.escape(obj["start_fin_year"])
    let start_month = SqlString.escape(obj["start_month"])

    //let status = SqlString.escape(obj["status"])

    


    let sql = "update svayam_" + b_acct_id + "_hr.salary_status set status= 'START' ,start_fin_year="+start_fin_year +" ,start_month ="+start_month+" where id =" + id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->changeStatusOfsalary", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully"
            res.send(objectToSend);
        }
    })

})

router.put('/updatesalary', (req, res) => {
    let objectToSend = {}

    let obj = req.body
    let id =  SqlString.escape(obj["id"])
    let b_acct_id = obj["b_acct_id"]
    let paid = SqlString.escape(obj["paid"])
    

    //let status = SqlString.escape(obj["status"])

    


    let sql = "update svayam_" + b_acct_id + "_hr.salary_status set paid ="+paid+" where id =" + id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->changeStatusOfsalary", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully"
            res.send(objectToSend);
        }
    })

})

router.delete('/deletesalarystatus:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.salary_status where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->deletesalarystatus", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " Deleted successfully" 
            res.send(objectToSend);
        }
    })

})




router.get('/getstopsalary:dtls',(req,res)=>{
    let objectToSend={}
    let b_acct_id=req.params.dtls;


    let sql="Select * from svayam_"+b_acct_id+"_hr.salary_status where status = 'STOP' "



    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->getstopsalary", error)
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

router.get('/getstartsalary:dtls',(req,res)=>{
    let objectToSend={}
    let b_acct_id=req.params.dtls;


    let sql="Select * from svayam_"+b_acct_id+"_hr.salary_status where status = 'START' "



    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->getstopsalary", error)
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
 
router.get('/getholdsalaryreport:dtls',(req,res)=>{
    let objectToSend={}
    let b_acct_id=req.params.dtls;


    let sql="Select sal.*,es.designation_code from svayam_"+b_acct_id+"_hr.salary_status sal join (Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from svayam_"+b_acct_id+"_hr.establishment_info ) es on es.emp_id = sal.emp_id  where es.svm_rank=1"



    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payComponent-->salaryhold-->getholdsalaryreport", error)
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
