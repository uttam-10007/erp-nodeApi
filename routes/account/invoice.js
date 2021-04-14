var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')

router.get('/getAllInvoices:dtls', (req, res) => {

    let objectToSend = {}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"];
    let source_code=obj["source_code"]
    let inv_status=obj["inv_status"]

    let sql="Select id,inv_id,inv_description,inv_amount,DATE_FORMAT(inv_date,'%Y-%m-%d')  as inv_date,inv_status,event_code,source_code,data, create_user_id,update_user_id,"
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp "
    + " from  svayam_"+b_acct_id+"_account.invoice_records "

    let flag=true;
    if(source_code!=undefined){
        sql+=" where source_code="+SqlString.escape(source_code)
        flag=false;

    }
    if(inv_status!=undefined){
        if(flag){
            sql+=" where inv_status="+SqlString.escape(inv_status)
        }else{
            sql+=" and inv_status="+SqlString.escape(inv_status)
        }
    }

    sql="Select inv_id,inv_description,inv_status,source_code,inv_date from ("+sql+")x group by inv_id,inv_description,inv_status,source_code,inv_date"
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->invoice-->getInvoices--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})

router.get('/getInvoice:dtls', (req, res) => {

    let objectToSend = {}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]

    let inv_id=SqlString.escape(obj["inv_id"])

    let sql="Select id,inv_id,inv_description,inv_amount,DATE_FORMAT(inv_date,'%Y-%m-%d')  as inv_date,inv_status,event_code,source_code,data, create_user_id,update_user_id,"
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp "
    + " from  svayam_"+b_acct_id+"_account.invoice_records where inv_id="+SqlString.escape(inv_id)

    
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->invoice-->getInvoice--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})

router.post('/createInvoice', (req, res) => {
    let obj = req.body;
    let objectToSend = {}
    
    let b_acct_id=obj["b_acct_id"]

    let inv_id=SqlString.escape(obj["inv_id"])
    let inv_desc=SqlString.escape(obj["inv_description"])
    let inv_amount=SqlString.escape(obj["inv_amount"])
    let inv_date=SqlString.escape(obj["inv_date"])
    let inv_status=SqlString.escape(obj["inv_status"])
    let event_code=SqlString.escape(obj["event_code"])
    let source_code=SqlString.escape(obj["source_code"])
    let data=SqlString.escape(JSON.stringify(obj["data"]))
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let sql="insert into svayam_"+b_acct_id+"_account.invoice_records (inv_id,inv_description,inv_amount,inv_date,inv_status,event_code,source_code,"
            +"data,create_user_id,create_timestamp) values"
            +"("+inv_id+","+inv_desc+","+inv_amount+","+inv_date+","+inv_status+","+event_code+","+source_code+","+data+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes--account-->invoice-->createInvoice--", error)
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


router.put('/changeInvoiceStatus',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let inv_status=SqlString.escape(obj["inv_status"])
    let inv_id=SqlString.escape(obj["inv_id"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let sql="update svayam_"+b_acct_id+"_account.invoice_records set inv_status="+inv_status+", update_user_id="+update_user_id+", "
            +" update_timestamp="+update_timestamp+" where inv_id="+inv_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes--account-->invoice-->changeInvoiceStatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Invoice "+cb_status
            res.send(objectToSend);
        }
    })
})



router.delete('/deleteInvoice:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)
    let b_acct_id=obj["b_acct_id"]
    let inv_id=SqlString.escape(obj["inv_id"])
    
    
    let sql="delete from svayam_"+b_acct_id+"_account.invoice_records where inv_id="+inv_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes--account-->invoice-->deleteInvoice--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Invoice Deleted"
            res.send(objectToSend);
        }
    })
})








module.exports = router