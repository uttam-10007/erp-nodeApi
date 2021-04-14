var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}



router.put('/updateCBstatus', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let status = obj["status"]

    let cb_id = obj["cb_id"]

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update svayam_" + b_acct_id + "_ebill.gen_cb set status=" + SqlString.escape(status)
        + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp
        + " where cb_id=" + SqlString.escape(cb_id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->cb-->updateCBstatus", error)
            objectToSend["error"] = true
            objectToSend["arr_effective_dt"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully"
            res.send(objectToSend);
        }
    })
});


router.post('/addgenericcb',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_ebill.gen_cb (party_id,work_id,remark,cb_date,invoice_no,invoice_date,status,net_amt,data,create_user_id,create_timestamp) values "


        + "("+SqlString.escape(obj.party_id)+","+SqlString.escape(obj.work_id)+","+SqlString.escape(obj.remark)+","+SqlString.escape(obj.cb_date)+","+SqlString.escape(obj.invoice_no)+","+SqlString.escape(obj.invoice_date)+","+SqlString.escape(obj.status)+","+SqlString.escape(obj.net_amt)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->info-->addgenericcb", error)
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

router.put('/updategenericcb',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let party_id=obj["party_id"]
    let work_id=obj["work_id"]
    let cb_id=obj["cb_id"]
    let remark=SqlString.escape(obj["remark"])
    let cb_date=SqlString.escape(obj["cb_date"])
    let invoice_no=SqlString.escape(obj["invoice_no"])
    let status=SqlString.escape(obj["status"])
    let net_amt=SqlString.escape(obj["net_amt"])
    let data=SqlString.escape(obj["data"])
    let invoice_date=SqlString.escape(obj["invoice_date"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))



    let sql="update svayam_"+b_acct_id+"_ebill.gen_cb set party_id="+SqlString.escape(party_id)+","
            +"work_id="+SqlString.escape(work_id)+",remark="+remark+",invoice_no="+invoice_no+",cb_date="+cb_date+","
            +"status="+status+",net_amt="+net_amt+",data="+data+",invoice_date="+invoice_date+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+" "
            +" where cb_id="+SqlString.escape(cb_id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->info-->updategenericcb", error)
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

router.delete('/deletegenericcb:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let cb_id=obj["cb_id"]

    let sql="delete from svayam_"+b_acct_id+"_ebill.gen_cb where cb_id="+SqlString.escape(cb_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->info-->deletegenericcb", error)
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


router.get('/getgenericcb:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT cb_id,party_id,work_id,remark,DATE_FORMAT(cb_date,'%Y-%m-%d') as cb_date,invoice_no,DATE_FORMAT(invoice_date,'%Y-%m-%d') as invoice_date,status,net_amt,data,create_user_id,update_user_id,"
    +"DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    +"update_timestamp from svayam_"+b_acct_id+"_ebill.gen_cb";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->getgenericcb--", error)
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













module.exports = router;
