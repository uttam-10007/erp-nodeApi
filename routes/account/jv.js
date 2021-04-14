var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')




router.get('/getJvData:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);
    let status = SqlString.escape(obj.status);
    let fin_year = SqlString.escape(obj.fin_year);

    let sql = "SELECT t.jrnl_id,t.jrnl_type,t.jrnl_desc,SUM(t.db_amt) AS db_amt,SUM(t.cr_amt)  as cr_amt FROM("
        + " SELECT jrnl_id,jrnl_type,jrnl_desc,sum(txn_amt) as db_amt,0 AS cr_amt from svayam_"
        + b_acct_id + "_account.jv where db_cd_ind='DB' and fin_year= " + fin_year + " and status=" + status
        + " group BY jrnl_id,jrnl_type,jrnl_desc union all"
        + " select jrnl_id,jrnl_type,jrnl_desc,0 as db_amt,sum(txn_amt) as cr_amt from svayam_"
        + b_acct_id + "_account.jv where db_cd_ind='CR' and fin_year= " + fin_year + " and status=" + status
        + " group BY jrnl_id,jrnl_type,jrnl_desc) as t group by jrnl_id,jrnl_type,jrnl_desc";


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->approve-->getJvData", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(objectToSend)
        }
    })
});

router.put('/changeStatus', (req, res) => {
    let objectToSend = {};
    let obj = req.body;

    let b_acct_id = SqlString.escape(obj.b_acct_id);
    let db = "svayam_" + b_acct_id + "_account";
    let status = SqlString.escape(obj.status);
    let jrnl_id = SqlString.escape(obj.jrnl_id);

    let sql = "update  svayam_" + b_acct_id + "_account.jv SET  `status`= " + status + " WHERE jrnl_id=" + jrnl_id;

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->account-->changeStatus", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(objectToSend)
        }
    })
});


router.get('/getJvbyjrnlid:dtls', (req, res) => {
    let objectToSend = {};

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = SqlString.escape(obj.b_acct_id);

    let db = "svayam_" + b_acct_id + "_account";
    
    let sql = "SELECT * from  "+db+".jv where jrnl_id = "+SqlString.escape(obj.jrnl_id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->account -->approve-->getJvbyjrnlid", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(objectToSend)
        }
    })
});


router.post('/approvejv', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]
    let status = SqlString.escape(obj["status"])
    let jrnl = obj['jrnl']
    let jrnl_keys = Object.keys(jrnl[0])
    let sql = "update svayam_" + b_acct_id + "_account.jv set status=" + status + " where id in (" + id.join(",") + ")"

    let sql1 = "insert into svayam_" + b_acct_id + "_account.jrnl (" + jrnl_keys.join(",") + ") values "

    for (let i = 0; i < jrnl.length; i++) {
        let jrnlObj = Object.assign({}, jrnl[i])
        let str = "("

        for (let j = 0; j < jrnl_keys.length; j++) {
            str += SqlString.escape(jrnlObj[jrnl_keys[j]]) + ","
        }
        str = str.substring(0, str.length - 1) + "),"
        sql1 = sql1 + str
    }

    sql1 = sql1.substring(0, sql1.length - 1)
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->account-->jv-->approvejv", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->account-->jv-->approvejv", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql + ";" + sql1, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->account-->jv-->approvejv", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->account-->jv-->approvejv", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "JV Approve Successfully."
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                }
                            })
                        }
                    })
                }
            })
        }
    })
})

router.delete('/deletejv:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let jrnl_id=obj["jrnl_id"]

    let sql="delete from svayam_"+b_acct_id+"_account.jv where jrnl_id="+SqlString.escape(jrnl_id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->Account-->jv-->deletejv", error)
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






module.exports = router;
