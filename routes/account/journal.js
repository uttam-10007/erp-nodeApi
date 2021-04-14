var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')



router.get('/getJournalList:dtls',(req,res)=>{
    let objectToSend={}

    
    let obj=JSON.parse(req.params.dtls)
    let db = "svayam_" + obj.b_acct_id + "_account";

    let sql = "Select * from " + db + ".jrnl LIMIT "+obj['limit'];

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->Journal-->getJournalList--", error)
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


router.get('/getAllJournal:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let sql = " SELECT distinct(jrnl_line_id) AS jrnl_line_id,jrnl_desc,party_id,fin_year,DATE_FORMAT(accounting_dt,'%Y-%m-%d') as accounting_dt,processing_dt,"
        + "create_user_id,update_user_id,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,"
        + "DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,arr_num "
        + " from  svayam_" + b_acct_id + "_account.saved_journals "

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->getAllJournal--", error)
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

router.get('/getMaxJournalId:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]



    let sql = "Select max(jrnl_id) AS jrnl_id from  svayam_" + b_acct_id + "_account.jrnl";
 let sql1 = "Select max(jrnl_id) AS jrnl_id from  svayam_" + b_acct_id + "_account.unposted_jrnl";



    mysqlPool.query(sql+";"+sql1, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->journal-->getMaxJournal--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results;
            res.send(objectToSend);
        }
    })
})


router.post('/postingjrnl', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_account";
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let data = obj.data;
    let arr = Object.keys(data[0]);
    let sql_insert = "insert into " + db + ".jrnl (" + arr.join(",") + ") values"

        for (let j = 0; j < data.length; j++) {
            sql_insert += "("
            for (let i = 0; i < arr.length; i++) {
                sql_insert += SqlString.escape(data[j][arr[i]])
                if (i < arr.length - 1) {
                    sql_insert += ","
                }
            }
            if(j < data.length-1 ){
                sql_insert += "),"
        }
        else{
            sql_insert += ")" 
        }
        }

let sql_delete="delete from "+db+".unposted_jrnl where id="+obj.id;
console.log(sql_delete);
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->journal-->postingjrnl-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->account-->journal-->postingjrnl-->", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                mysqlPool.query(sql_insert+";"+sql_delete, function (error, results) {
                    if (error) {
                        console.log("Error-->routes-->account-->journal-->postingjrnl-->", error)
                        objectToSend["error"] = true;
                        if (error.message != undefined || error.message != null) {
                            if (error.message.includes("Duplicate")) {
                                objectToSend["data"] = "Possible duplicates"
                            } else {
                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            }
                        } else {
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                        }

                        res.send(objectToSend)
                        mysqlCon.rollback();
                        mysqlCon.release()
                    } else {

                       
                        mysqlCon.commit(function (error4) {
                            if (error4) {
                                console.log("Error-->routes-->account-->journal-->postingjrnl-->-", error4)
                                objectToSend["error"] = true
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend);
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                objectToSend["error"] = false;
                                objectToSend["data"] = results.insertId
                                res.send(objectToSend)
                                mysqlCon.release()
                            }
                        })
                    }
                })
            })
        }
    })
});




router.post('/createJournal', (req, res) => {
    let obj = req.body;
    let objectToSend = {}

    let b_acct_id = obj["b_acct_id"]
    let data = obj["data"];
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = ''


    for (let i = 0; i < data.length; i++) {

        if (i < data.length - 1) {

            sql += "insert into svayam_" + b_acct_id + "_account.saved_journals (jrnl_line_id,jrnl_desc,fin_year,debit_credit_ind,amount,acct_num,"
                + "party_id,accounting_dt,event_code,create_user_id,create_timestamp,event_id,arr_num) values"
                + "(" + SqlString.escape(data[i]['jrnl_line_id']) + "," + SqlString.escape(data[i]['jrnl_desc']) + "," + SqlString.escape(data[i]['fin_year']) + "," + SqlString.escape(data[i]['debit_credit_ind']) + "," + SqlString.escape(data[i]['amount'])
                + "," + SqlString.escape(data[i]['acct_num']) + "," + SqlString.escape(data[i]['party_id']) + "," + SqlString.escape(data[i]['accounting_dt']) + "," + SqlString.escape(data[i]['event_code'])
                + "," + SqlString.escape(data[i]['create_user_id']) + "," + create_timestamp + "," + SqlString.escape(data[i]['event_id']) + "," + SqlString.escape(data[i]['arr_num']) + ");"

        } else {

            sql += "insert into svayam_" + b_acct_id + "_account.saved_journals (jrnl_line_id,jrnl_desc,fin_year,debit_credit_ind,amount,acct_num,"
                + "party_id,accounting_dt,event_code,create_user_id,create_timestamp,event_id,arr_num) values"
                + "(" + SqlString.escape(data[i]['jrnl_line_id']) + "," + SqlString.escape(data[i]['jrnl_desc']) + "," + SqlString.escape(data[i]['fin_year']) + "," + SqlString.escape(data[i]['debit_credit_ind']) + "," + SqlString.escape(data[i]['amount'])
                + "," + SqlString.escape(data[i]['acct_num']) + "," + SqlString.escape(data[i]['party_id']) + "," + SqlString.escape(data[i]['accounting_dt']) + "," + SqlString.escape(data[i]['event_code'])
                + "," + SqlString.escape(data[i]['create_user_id']) + "," + create_timestamp + "," + SqlString.escape(data[i]['event_id']) + "," + SqlString.escape(data[i]['arr_num']) + ")"
        }
    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->createJournal--", error)
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

router.put('/postJournal', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let jrnl_line_id = SqlString.escape(obj["jrnl_line_id"])
    let update_user_id = SqlString.escape(obj["update_user_id"]);
    let processing_dt = SqlString.escape(moment().format('YYYY-MM-DD'))
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))



    let sql = "insert into svayam_" + b_acct_id + "_account.jrnl (jrnl_line_id,jrnl_desc,fin_year,debit_credit_ind,amount,acct_num,"
        + "party_id,accounting_dt,processing_dt,event_code,create_user_id,create_timestamp,update_user_id,update_timestamp,event_id,arr_num) "
        + "Select " + jrnl_line_id + ",jrnl_desc,fin_year,debit_credit_ind,amount,acct_num,party_id,accounting_dt," + processing_dt + "," + "event_code,"
        + "create_user_id,create_timestamp," + update_user_id + "," + update_timestamp + ",event_id,arr_num from svayam_" + b_acct_id + "_account.saved_journals where "
        + " jrnl_line_id in (" + jrnl_line_id + ")"

    let sql_del = "delete from svayam_" + b_acct_id + "_account.saved_journals where jrnl_line_id =" + jrnl_line_id;


    mysqlPool.query(sql + ";" + sql_del, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->changeCbStatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Posted";
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteJournal:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let jrnl_line_id = SqlString.escape(obj["jrnl_line_id"])
    let b_acct_id = obj["b_acct_id"]

    let sql = "delete from svayam_" + b_acct_id + "_account.saved_journals where jrnl_line_id=" + jrnl_line_id
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->contingentBill-->deleteJournal--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Journal Deleted"
            res.send(objectToSend);
        }
    })
})


//Fin Year Api
router.get('/getActiveFinYear:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let sql = " SELECT  * from  svayam_" + b_acct_id + "_account.fin_year where status='ACTIVE'"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->journal-->getActiveFinYear--", error)
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

router.get('/getAllFinYear:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let sql = " SELECT  * from  svayam_" + b_acct_id + "_account.fin_year";

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->journal-->getAllFinYear--", error)
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

router.post('/createfinyear', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_account";

    let sql_insert = "insert into " + db + ".fin_year (fin_year,status) values" + " (" + SqlString.escape(obj.fin_year) + "," + SqlString.escape(obj.status) + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->setting-->createfinyear-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("already exists")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Duplicate Code Entry"
                }
            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})

router.put('/updatefinyear', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_account";

    let objectToSend = {}
    let sql = "update " + db + ".fin_year set status=" + SqlString.escape(obj.status)
        + " where id=" + SqlString.escape(obj.id) + ";"



    mysqlPool.query(sql, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->account-->setting-->updatefinyear", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = " Updated successfully"
            res.send(objectToSend)
        }
    })
})


//saved report

router.get('/getJournalDetail:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]

    let fields=obj['fields'];

    let select=''

    for(let i=0;i<fields.length;i++){
        if(i<fields.length-1){
            select+=fields[i]+","

        }else{
            select+=fields[i]

        }
    }

     let sql = " SELECT "+select+",SUM(amount) AS amount  "
        + " from  svayam_" + b_acct_id + "_account.jrnl where acct_num=" + SqlString.escape(obj.acct_num) + " and accounting_dt>="
        + SqlString.escape(obj.accounting_dt_start) + "and  accounting_dt<=" + SqlString.escape(obj.accounting_dt_end) + "and fin_year=" + SqlString.escape(obj.fin_year)
        +" group BY "+select;


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->journal-->getJournalDetail--", error)
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







module.exports = router
