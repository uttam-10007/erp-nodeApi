var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')




router.get('/getReport:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let from_accounting_dt = SqlString.escape(obj['from_accounting_dt']);
    let fin_year = SqlString.escape(obj['fin_year']);

    let to_accounting_dt = SqlString.escape(obj['to_accounting_dt']);
    let chart_of_account = obj['chart_of_account'];

    let sql = "SELECT * FROM svayam_" + b_acct_id + "_account.jrnl WHERE jrnl_id IN (SELECT DISTINCT jrnl_id FROM svayam_" + b_acct_id + "_account.jrnl WHERE chart_of_account IN ('" + chart_of_account.join("','") + "')"
        + " AND acct_dt >=" + from_accounting_dt + "  AND acct_dt <=" + to_accounting_dt + " AND fin_year=" + fin_year + ")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getReport--", error)
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

router.get('/getGstInputReport:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let from_dt = SqlString.escape(obj['from_dt']);

    let to_dt = SqlString.escape(obj['to_dt']);

    let sql =  "SELECT cb.*,pa.party_name,pa.gstin_no,pa.local_no,pa.bank_acct_num,pa.bank_code,pa.branch_code,pa.ifsc_code"
       + " FROM svayam_" + b_acct_id + "_account.challan_info cb JOIN svayam_" + b_acct_id + "_account.ip pa ON cb.party_id=pa.party_id"
       +" WHERE cb.challan_generate_date>="+from_dt+" AND cb.challan_generate_date<="+to_dt+" AND cb.`status`='PROCESSED'"

       if(obj['party_id']!=undefined){
           sql +=" AND cb.party_id="+ SqlString.escape(obj['party_id']);
       }
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getGstInputReport--", error)
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



router.get('/getGstOutputReport:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let from_dt = SqlString.escape(obj['from_dt']);

    let to_dt = SqlString.escape(obj['to_dt']);

    let sql =  "SELECT cb.*,pa.party_name,pa.gstin_no,pa.local_no,pa.bank_acct_num,pa.bank_code,pa.branch_code,pa.ifsc_code"
       + " FROM svayam_" + b_acct_id + "_account.gen_cb cb JOIN svayam_" + b_acct_id + "_account.ip pa ON cb.party_id=pa.party_id"
       +" WHERE cb.cb_date>="+from_dt+" AND cb.cb_date<="+to_dt+" AND cb.`status`='PROCESSED'"

       if(obj['party_id']!=undefined){
           sql +=" AND cb.party_id="+ SqlString.escape(obj['party_id']);
       }
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getGstOutputReport--", error)
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

router.get('/getdemandGstInputReport:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let from_dt = SqlString.escape(obj['from_dt']);

    let to_dt = SqlString.escape(obj['to_dt']);

    let sql =  "SELECT cb.*,pa.party_name,pa.gstin_no,pa.local_no,pa.bank_acct_num,pa.bank_code,pa.branch_code,pa.ifsc_code"
       + " FROM svayam_" + b_acct_id + "_account.demand cb JOIN svayam_" + b_acct_id + "_account.ip pa ON cb.party_id=pa.party_id"
       +" WHERE cb.demand_date>="+from_dt+" AND cb.demand_date<="+to_dt+" AND cb.`status`='PROCESSED'"

       if(obj['party_id']!=undefined){
           sql +=" AND cb.party_id="+ SqlString.escape(obj['party_id']);
       }
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getdemandGstInputReport--", error)
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





//saved report


router.get('/getarrList:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
let acct_dt = SqlString.escape(obj['acct_dt']);
let proc_dt = SqlString.escape(obj['proc_dt']);
let fin_year = SqlString.escape(obj['fin_year']);
let ledger_type = SqlString.escape(obj['ledger_type']);
let chart_of_account = SqlString.escape(obj['chart_of_account']);

    let sql = " SELECT p.party_id,p.party_name,c.arr_id,c.arr_desc,q.db_cd_ind,sum(q.txn_amt) as txn_amt from  svayam_" + b_acct_id + "_account.jrnl as q join svayam_"+b_acct_id+"_account.sal as c on q.arr_id=c.arr_id join svayam_"+b_acct_id+"_account.ip as p on c.party_id=p.party_id where q.proc_dt<="+proc_dt+" and q.acct_dt<="+acct_dt+" and q.ledger_type="+ledger_type+" and q.fin_year="+fin_year+" and q.chart_of_account="+chart_of_account+" group by p.party_id,p.party_name,c.arr_id,c.arr_desc,q.db_cd_ind"
console.log(sql)
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getarrList--", error)
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
router.get('/getjournalList:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
let acct_dt = SqlString.escape(obj['acct_dt']);
let proc_dt = SqlString.escape(obj['proc_dt']);
let fin_year = SqlString.escape(obj['fin_year']);
let ledger_type = SqlString.escape(obj['ledger_type']);
let chart_of_account = SqlString.escape(obj['chart_of_account']);
let arr_id = SqlString.escape(obj['arr_id']);

    let sql = " SELECT jrnl_desc,event_code,event_id,event_ln_id,jrnl_dtl_ln_id,jrnl_ln_id,DATE_FORMAT(acct_dt,'%Y-%m-%d') as acct_dt,jrnl_id,db_cd_ind,txn_amt from  svayam_" + b_acct_id + "_account.jrnl where proc_dt<="+proc_dt+" and acct_dt<="+acct_dt+" and ledger_type="+ledger_type+" and fin_year="+fin_year+" and chart_of_account="+chart_of_account+" and arr_id="+arr_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->123getjournalList--", error)
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
router.get('/getPartyListing:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
let from_accounting_dt = SqlString.escape(obj['from_accounting_dt']);
let to_accounting_dt = SqlString.escape(obj['to_accounting_dt']);
let acct_num = SqlString.escape(obj['acct_num']);
    let sql = " SELECT p.party_id,p.party_legal_name,c.lvl5_value,c.lvl5_code,q.jrnl_line_id,debit_credit_ind,acct_num,accounting_dt,sum(amount) as amount from  svayam_" + b_acct_id + "_account.jrnl as q join svayam_"+b_acct_id+"_account.chart_of_account as c on q.acct_num=c.lvl5_code join svayam_"+b_acct_id+"_account.party_info as p on q.party_id=p.party_id where q.accounting_dt<="+to_accounting_dt+" and q.accounting_dt>="+from_accounting_dt+" and q.acct_num="+acct_num+" group by p.party_id,p.party_legal_name,c.lvl5_value,c.lvl5_code,q.jrnl_line_id,debit_credit_ind,acct_num,accounting_dt"
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getDrillDown1--", error)
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


router.get('/getledgerreport:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let from_acct_dt = SqlString.escape(obj['from_accounting_dt']);
    let acct_dt = SqlString.escape(obj['to_accounting_dt']);
    let fin_year = SqlString.escape(obj['fin_year']);
    let chart_of_account = SqlString.escape(obj['chart_of_account']);
    let arr_id = SqlString.escape(obj['arr_id']);

    let sql = " SELECT jrnl_id,DATE_FORMAT(acct_dt,'%Y-%m-%d') as acct_dt,jrnl_type,jrnl_desc,db_cd_ind,txn_amt from  svayam_" + b_acct_id + "_account.jrnl where acct_dt>=" + from_acct_dt + " and acct_dt<=" + acct_dt + "  and fin_year=" + fin_year + " and chart_of_account=" + chart_of_account
    if (obj['arr_id'] != undefined) {

        sql += " and arr_id=" + arr_id
    }

    let sql1 = "SELECT SUM(txn_amt) AS txn_amt,db_cd_ind FROM svayam_" + b_acct_id + "_account.jrnl WHERE acct_dt < " + from_acct_dt+" and chart_of_account="+chart_of_account
    if (obj['arr_id'] != undefined) {
        sql1 += " and arr_id=" + arr_id
    }
    sql1 += " GROUP BY db_cd_ind"
    mysqlPool.query(sql + ";" + sql1, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getledgerreport--", error)
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


router.get('/getTrailBalance:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let sql = " SELECT p.leaf_code,p.leaf_value,p.lvl1_code,p.lvl1_value,p.lvl2_code,p.lvl2_value,p.lvl3_code,p.lvl3_value,p.lvl4_code,p.lvl4_value,p.lvl5_code,p.lvl5_value,p.lvl6_code,p.lvl6_value,p.lvl7_code,p.lvl7_value,q.db_cd_ind,SUM(q.txn_amt) AS txn_amt  "
        +"FROM ( SELECT * FROM svayam_"+b_acct_id+"_account.jrnl WHERE  acct_dt <="+SqlString.escape(obj["acct_dt"])+" AND ledger_type ="+SqlString.escape(obj["ledger_type"])+" AND fin_year ="+SqlString.escape(obj["fin_year"])+" ) q" 
    +" JOIN svayam_"+b_acct_id+"_account.chart_of_account p ON p.leaf_code = q.chart_of_account"
       + " group BY p.lvl1_code,p.lvl1_value,p.lvl2_code,p.lvl2_value,p.lvl3_code,p.lvl3_value,p.lvl4_code,p.lvl4_value,p.lvl5_code,p.lvl5_value,q.db_cd_ind,p.lvl6_code,p.lvl6_value,p.lvl7_code,p.lvl7_value,p.leaf_code"

console.log(sql)
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getTrailBalance--", error)
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

router.get('/getDrillDownTrailBalance:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

     let sql = " SELECT p.party_id,p.party_legal_name,p.party_type_code,p.party_origination_source_code,p.party_email,acct_num,sum (q.amount) as amount from  svayam_" + b_acct_id + "_account.jrnl as q join svayam_"
        + b_acct_id + "_account.party_info as p ON p.party_id=q.party_id" +
        " where  q.acct_num=" + SqlString.escape(obj.acct_num) + " and q.debit_credit_ind=" + SqlString.escape(obj.debit_credit_ind)
        +" and accounting_dt <="+SqlString.escape(obj.accounting_dt)
        +" group BY p.party_id,p.party_legal_name,p.party_type_code,p.party_origination_source_code,p.party_email,acct_num";

console.log(sql);
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getDrillDownTrailBalance--", error)
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

router.get('/getBankPayment:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let sql = " SELECT p.party_id,p.party_legal_name,p.party_bank_acct_no,p.party_bank_code,"
        + "p.party_branch_code,p.party_ifsc_code,SUM(q.amount) as amount  from  svayam_"
        + b_acct_id + "_account.jrnl as q join svayam_"
        + b_acct_id + "_account.party_info as p ON p.party_id=q.party_id" +
        " where  q.acct_num=" + SqlString.escape(obj.acct_num) + " and q.accounting_dt BETWEEN "
        + SqlString.escape(obj.start_date) + " AND " + SqlString.escape(obj.end_date)
        + " group BY p.party_id,p.party_legal_name,p.party_bank_acct_no,p.party_bank_code,p.party_branch_code,p.party_ifsc_code";


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getBankPayment--", error)
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

router.get('/getAllBankPaymentList:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let sql = " SELECT  distinct(bp_id),bp_desc, DATE_FORMAT(bp_date,'%Y-%m-%d ') as bp_date,bp_status from  svayam_" + b_acct_id + "_account.bp_info"


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getAllBankPaymentList--", error)
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

router.get('/getAnyBankPayment:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let sql = " SELECT   id,bp_id,bp_desc,DATE_FORMAT(bp_date,'%Y-%m-%d ') as bp_date,bp_status,party_id,party_legal_name,"
        + "party_bank_acct_no,party_bank_code,party_branch_code,party_ifsc_code,amount from  svayam_" + b_acct_id + "_account.bp_info where bp_id=" + obj['bp_id'];

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->getAnyBankPayment--", error)
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

router.put('/changeBPstatus', (req, res) => {
    let objectToSend = {};

    let obj = req.body;

    let b_acct_id = obj["b_acct_id"];

    let sql = " update svayam_" + b_acct_id + "_account.bp_info set bp_status="+ SqlString.escape(obj.bp_status)+" where bp_id="+ SqlString.escape(obj.bp_id);

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->changeBPstatus--", error)
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

router.post('/addBankPayment', (req, res) => {
    let objectToSend = {};

    let obj = req.body;

    let b_acct_id = obj["b_acct_id"];
    let db = "svayam_" + b_acct_id + "_account"
    let bp_date = obj['bp_date'];
    let bp_desc = obj['bp_desc'];
    let bp_status = obj['bp_status'];
    let bp_id = 1;
    let data = obj['data'];

    let sql0 = "SELECT  max(bp_id) as bp_id from  svayam_" + b_acct_id + "_account.bp_info"
    mysqlPool.query(sql0, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->report-->addBankPayment--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            if (results[0].bp_id == null) {
                bp_id = 1;
            }
            else {
                bp_id = (results[0].bp_id) + 1
            }

            let query = "insert into " + db + ".bp_info(bp_id,bp_desc,bp_date,bp_status,party_id,party_legal_name,"
                + "party_bank_acct_no,party_bank_code,party_branch_code,party_ifsc_code,amount) values";


            for (let i = 0; i < data.length; i++) {
                if (i < data.length - 1) {
                    query += "(" + bp_id + ","
                        + SqlString.escape(bp_desc) + ","
                        + SqlString.escape(bp_date) + ","
                        + SqlString.escape(bp_status) + ","
                        + SqlString.escape(data[i]['party_id']) + ","
                        + SqlString.escape(data[i]['party_legal_name']) + ","
                        + SqlString.escape(data[i]['party_bank_acct_no']) + ","
                        + SqlString.escape(data[i]['party_bank_code']) + ","
                        + SqlString.escape(data[i]['party_branch_code']) + ","
                        + SqlString.escape(data[i]['party_ifsc_code']) + ","
                        + SqlString.escape(data[i]['amount'])
                        + "),"
                } else {
                    query += "(" + bp_id + ","
                        + SqlString.escape(bp_desc) + ","
                        + SqlString.escape(bp_date) + ","
                        + SqlString.escape(bp_status) + ","
                        + SqlString.escape(data[i]['party_id']) + ","
                        + SqlString.escape(data[i]['party_legal_name']) + ","
                        + SqlString.escape(data[i]['party_bank_acct_no']) + ","
                        + SqlString.escape(data[i]['party_bank_code']) + ","
                        + SqlString.escape(data[i]['party_branch_code']) + ","
                        + SqlString.escape(data[i]['party_ifsc_code']) + ","
                        + SqlString.escape(data[i]['amount'])
                        + ")"
                }
            }


            mysqlPool.query(query, function (error1, results1) {
                if (error1) {
                    console.log("Error-->routes-->account-->report-->addBankPayment--", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else {
                    objectToSend["error"] = false
                    objectToSend["data"] = "Added SuecessFully!";
                    res.send(objectToSend);
                }
            })
        }
    })
});


router.get('/getAdhocReport:dtls', (req, res) => {

    let obj = JSON.parse(req.params.dtls)
    let db = "svayam_" + obj.b_acct_id + "_account";
    let fieldArr = obj['project_field']
    let filter = obj['filter']
    let filterArr = Object.keys(filter)
    let objectToSend = {}
    let groupByFields=" "
    let sql = " select sum(" + db + ".jrnl.amount) as amount,"
    for (let i = 0; i < fieldArr.length; i++) {
        sql +=  db + "."+fieldArr[i]['table'] + "." + fieldArr[i]['field']
        groupByFields +=db + "."+fieldArr[i]['table'] + "." + fieldArr[i]['field']
        if (i != fieldArr.length - 1) {
            sql += ","
            groupByFields += ","
        }
    }

    sql += " FROM " + db + ".jrnl JOIN " + db + ".chart_of_account ON " + db + ".jrnl.acct_num=" + db + ".chart_of_account.lvl5_code JOIN "
        + db + ".party_info ON " + db + ".jrnl.party_id=" + db + ".party_info.party_id "

    sql += " where "

    for (let i = 0; i < filterArr.length; i++) {
        if (filterArr[i] == 'lvl1_code' || filterArr[i] == 'lvl2_code' || filterArr[i] == 'lvl3_code' || filterArr[i] == 'lvl4_code' || filterArr[i] == 'lvl5_code') {
            sql += " " + db + ".chart_of_account." + filterArr[i] + "=" + SqlString.escape(filter[filterArr[i]]) + " and "

        }
        if ( filterArr[i] == 'fin_year') {
            sql += " " + db + ".jrnl." + filterArr[i] + "=" + SqlString.escape(filter[filterArr[i]]) + " and "

        }

 if (filterArr[i] == 'accounting_dt') {
            sql += " " + db + ".jrnl." + filterArr[i] + "<=" + SqlString.escape(filter[filterArr[i]]) + " and "

        }


    }
    sql = sql.substring(0, sql.length - 4)
    sql += " group by "+groupByFields
   
    mysqlPool.query(sql, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->account-->journal-->getAdhocReport", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results1
            res.send(objectToSend)
        }
    })
})





module.exports = router
