var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')




router.get('/getTbl:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"];
var db = "svayam_"+b_acct_id+"_account"
let fin_year = obj['fin_year'];
    let sql = "Select lvl1_value,lvl2_value,MONTH(accounting_dt) as month,debit_credit_ind,sum(amount) as amount from "+db+".jrnl join "+db+".chart_of_account on acct_num=lvl5_code where fin_year='"+fin_year+"' group by lvl1_value,lvl2_value,month,debit_credit_ind";
	


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->budget-->getBudgetInfo--", error)
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

router.get('/getamountwithcoa:dtls', (req, res) => {

    let objectToSend = {}
    let b_acct_id = req.params.dtls
    
var db = "svayam_"+b_acct_id+"_account"

    let sql = "Select jr.chart_of_account,ct.leaf_value,jr.db_cd_ind,sum(jr.txn_amt) as txn_amt from "+db+".jrnl as jr join "+db+".chart_of_account ct on jr.chart_of_account=ct.leaf_code  group by leaf_value,db_cd_ind";
	


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->dashboard-->getamountwithcoa--", error)
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

router.get('/getamountwithevent:dtls', (req, res) => {

    let objectToSend = {}
    let b_acct_id = req.params.dtls
    
var db = "svayam_"+b_acct_id+"_account"

    let sql = "Select jr.event_code,ct.event_desc,db_cd_ind,sum(txn_amt) as txn_amt from "+db+".jrnl as jr join "+db+".events ct on jr.event_code=ct.event_code  group by event_desc,db_cd_ind";
	


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->dashboard-->getamountwithevent--", error)
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



router.get('/getamountwithprocessingdate:dtls', (req, res) => {

    let objectToSend = {}
    let b_acct_id = req.params.dtls

    var db = "svayam_" + b_acct_id + "_account"

    let dt = moment().format('YYYY-MM-DD')
    var date1 = []
    for (let i = 0; i < 7; i++) {
        var date = moment()
        var datet = date.subtract(i, 'days');
        
        date1.push(datet.format('YYYY-MM-DD'))

    }
    var date = moment()
    var dt1 = date.subtract('7', 'days');




    var proc_dt = SqlString.escape(dt1.format('YYYY-MM-DD'))
    data = {}
    data['current_date'] = dt
    data['date'] = date1
    data['pervious_date'] =dt1.format('YYYY-MM-DD')
    let sql = "Select jr.chart_of_account,ct.leaf_value,DATE_FORMAT(jr.proc_dt,'%Y-%m-%d') as proc_dt,jr.db_cd_ind,sum(jr.txn_amt) as txn_amt from " + db + ".jrnl as jr join " + db + ".chart_of_account ct on jr.chart_of_account=ct.leaf_code where jr.proc_dt<=" + SqlString.escape(dt) + " and  jr.proc_dt>= " + proc_dt+" group by jr.chart_of_account,ct.leaf_value,jr.proc_dt,jr.db_cd_ind"



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->dashboard-->getamountwithevent--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            data['data'] = results
            objectToSend["error"] = false
            objectToSend["data"] = data
            res.send(objectToSend);
        }
    })

})

module.exports = router;
