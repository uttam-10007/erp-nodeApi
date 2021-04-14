var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')

router.post('/insertarrayarrear', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let datata = obj.dadata
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_hr.arrear(emp_id,emp_name,amount,status,arrear_type,data,arrear_start_dt,arrear_end_dt,create_user_id,create_timestamp)VALUES "
    for(var i=0;i<datata.length;i++){
    query+="("+SqlString.escape(datata[i].emp_id)+","+SqlString.escape(datata[i].emp_name)+","+SqlString.escape(datata[i].amount)+","+SqlString.escape(obj.status)+","+SqlString.escape(obj.arrear_type)+","+SqlString.escape(datata[i].data)+","+SqlString.escape(obj.arrear_start_dt)+","+SqlString.escape(obj.arrear_end_dt)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp
    if(i < datata.length-1){
        query+= "),"
    }
    else{
        query+= ")"
    }
    }
    
    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->arrear-->insertarrear--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Inserted Successfully"
            res.send(objectToSend);
        }
    })
})

router.post('/insertarrear', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_hr.arrear(emp_id,emp_name,amount,status,arrear_type,data,arrear_start_dt,arrear_end_dt,create_user_id,create_timestamp)VALUES ("
    +SqlString.escape(obj.emp_id)+","+SqlString.escape(obj.emp_name)+","+SqlString.escape(obj.amount)+","+SqlString.escape(obj.status)+","+SqlString.escape(obj.arrear_type)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.arrear_start_dt)+","+SqlString.escape(obj.arrear_end_dt)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->arrear-->insertarrear--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Inserted Successfully"
            res.send(objectToSend);
        }
    })
})

router.get('/getarrear:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT ar.id,ar.emp_id,ar.emp_name,ar.amount,ar.status,ar.arrear_type,ar.data,DATE_FORMAT(ar.arrear_start_dt,'%Y-%m-%d') as arrear_start_dt,DATE_FORMAT(ar.arrear_end_dt,'%Y-%m-%d') as arrear_end_dt,ar.create_user_id,ar.create_timestamp,ar.update_timestamp,ar.update_user_id,es.designation_code from svayam_" + b_acct_id + "_hr.arrear as ar join svayam_" + b_acct_id + "_hr.establishment_info as es on ar.emp_id = es.emp_id group by ar.emp_id,ar.id";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hrpayroll_info-->arrear-->getarrear--", error)
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

router.put('/updatearrear', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_hr.arrear set "
    +"emp_id="+SqlString.escape(obj.emp_id)+",emp_name="+SqlString.escape(obj.emp_name)+","
    +"amount="+SqlString.escape(obj.amount)+",status="+SqlString.escape(obj.status)+","
    +"arrear_type="+SqlString.escape(obj.arrear_type)+",data="+SqlString.escape(obj.data)+","
    +"arrear_start_dt="+SqlString.escape(obj.arrear_start_dt)+",arrear_end_dt="+SqlString.escape(obj.arrear_end_dt)+","
    +"update_user_id="+SqlString.escape(obj.update_user_id)+","
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->arrear-->updatearrear--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "update successfully"
            res.send(objectToSend);
        }
    })
})


router.delete('/deletearrear:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.arrear where id in (" + id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->payroll_info-->arrear-->deletearrear", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully" 
            res.send(objectToSend);
        }
    })

})


module.exports = router;
