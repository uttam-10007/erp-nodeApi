var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.post('/createleaveencashment', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_hr.leave_encashment(emp_id,emp_name,total_el,basic,da,amount,retirement_date,create_user_id,create_timestamp,paid)VALUES ("
    +SqlString.escape(obj.emp_id)+","+SqlString.escape(obj.emp_name)+","+SqlString.escape(obj.total_el)+","+SqlString.escape(obj.basic)+","+SqlString.escape(obj.da)+","+SqlString.escape(obj.amount)+","+SqlString.escape(obj.retirement_date)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+","+SqlString.escape(obj.paid)+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->leave_encashment-->createleaveencashment--", error)
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

router.get('/getleaveencashment:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);
    let b_acct_id=obj["b_acct_id"]
    let emp_id=obj["emp_id"]



    let sql_fetchCurr = "SELECT paid,id, emp_id,emp_name,total_el,basic,da,amount,DATE_FORMAT(retirement_date,'%Y-%m-%d' ) as retirement_date from svayam_" + b_acct_id + "_hr.leave_encashment";
	if(obj.emp_id != undefined){
    " where emp_id="+SqlString.escape(emp_id)
}

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->leave_encashment-->getleaveencashment--", error)
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

router.get('/getel:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);
let b_acct_id=obj['b_acct_id'];
    let retirement_date = obj['retirement_date']
    let arr = retirement_date.split('-')
    let year = arr[0]
    let month = arr[1]



    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_hr.leave_info where leave_code = 'EL' and emp_id ="+SqlString.escape(obj.emp_id)+" and year ="+ SqlString.escape(year)+" and month ="+SqlString.escape(month);
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->leave_encashment-->getel--", error)
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

router.put('/updateleaveencashment', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_hr.leave_encashment set "
    +"emp_id="+SqlString.escape(obj.emp_id)+",emp_name="+SqlString.escape(obj.emp_name)+","
    +"total_el="+SqlString.escape(obj.total_el)+",basic="+SqlString.escape(obj.basic)+","
    +"da="+SqlString.escape(obj.da)+",amount="+SqlString.escape(obj.amount)+","
    +"retirement_date="+SqlString.escape(obj.retirement_date)+",update_user_id="+SqlString.escape(obj.update_user_id)+","
    +"paid ="+SqlString.escape(obj.paid)+","
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->leave_encashment-->updateleaveencashment--", error)
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





router.delete('/deleteleaveencashment:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]

    let sql = "delete from svayam_" + b_acct_id + "_hr.leave_encashment where id =" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->leave_encashment-->deleteleaveencashment", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " Deleted Successfully"
            res.send(objectToSend);
        }
    })

})




module.exports = router;
