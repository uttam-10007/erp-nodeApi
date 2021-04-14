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



router.get('/getAllExpenseOnBud:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT bu.bud_cd,bu.bud_amt,bu.expense_amount,SUM(ei.bill_amt+ei.cgst+ei.sgst+ei.add_with_held+ei.add_security) AS bill_expense_amount"
                        +" FROM " + db + ".bud bu "
                       +" left JOIN " + db + ".work_info wi ON bu.bud_cd=wi.budget_cd "
                       +" left JOIN " + db + ".tender tn ON tn.work_id=wi.id "
                       +" left JOIN " + db + ".ebill_info ei ON ei.tender_id=tn.tender_id"

      if(obj['bud_cd']!=undefined){
          sql_fetchCurr +=" WHERE bu.bud_cd="+SqlString.escape(obj['bud_cd'])
      }                 
      sql_fetchCurr +=" GROUP BY bu.bud_cd,bu.bud_amt,bu.expense_amount"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->getAllExpenseOnBud--", error)
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




router.get('/getbud:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".bud"



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->getbud--", error)
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


router.get('/getlogOfbud:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select *,DATE_FORMAT(create_timestamp,'%Y-%m-%d') AS create_date,DATE_FORMAT(update_timestamp,'%Y-%m-%d') AS update_timestamp,DATE_FORMAT(update_timestamp,'%H:%i:%S') AS `time`,DATE_FORMAT(create_timestamp,'%H:%i:%S') AS `create_time` from " + db + ".bud_log where bud_cd="+SqlString.escape(obj.bud_cd)



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->getlogOfbud--", error)
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



router.post('/createbud', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".bud (create_bud_amt,bud_cd,bud_desc,bud_amt,create_user_id,create_timestamp,expense_amount) values"
        + " ("+SqlString.escape(obj.bud_amt)+","+ SqlString.escape(obj.bud_cd) +","+ SqlString.escape(obj.bud_desc) +","+SqlString.escape(obj.bud_amt)+","
        + SqlString.escape(obj.create_user_id) + "," + create_timestamp +","+SqlString.escape(obj.expense_amount)+ ") "

        let sql_log = "insert into " + db + ".bud_log (create_bud_amt,bud_cd,bud_amt,create_user_id,create_timestamp) values"
        + " ("+SqlString.escape(obj.bud_amt)+","+ SqlString.escape(obj.bud_cd)  +","+SqlString.escape(obj.bud_amt)+","
        + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "

        mysqlPool.getConnection(function (error, mysqlCon) {
            if (error) {
                console.log("Error-->routes-->info-->bud-->createbud-->-", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                mysqlCon.beginTransaction(function (error4) {
                    if (error4) {
                        console.log("Error-->routes-->info-->bud-->createbud-->-", error4)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    } else {
                        mysqlCon.query(sql_insert + ";" + sql_log, function (error1, results) {
                            if (error1) {
                                console.log("Error-->routes-->info-->bud-->createbud-->-", error1)
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
    
    
    
                               
                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->info-->bud-->createbud-->", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Added Successfully"
                                            res.send(objectToSend)
    
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

router.delete('/deletebud:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id
    let bud_cd=obj.bud_cd

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql1 = "delete from " + db + ".bud where id='" + id + "'"
    let sql2 = "delete from " + db + ".bud_log where bud_cd='" + bud_cd + "'"
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->deletebud--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->bud-->deletebud--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql1+";"+sql2, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->bud-->deletebud-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->bud-->deletebud-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                   objectToSend["data"] = "Budget deleted successfully"

                                    res.send(objectToSend)
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

router.put('/updatebud', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".bud set bud_desc=" + SqlString.escape(obj.bud_desc) + ",bud_amt=" + SqlString.escape(obj.bud_amt)
        + ",bud_cd=" + SqlString.escape(obj.bud_cd)+",expense_amount="+SqlString.escape(obj.expense_amount)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ""

        let sql_log = "insert into " + db + ".bud_log (bud_cd,bud_amt,update_user_id,update_timestamp) values"
        + " ("+ SqlString.escape(obj.bud_cd)  +","+SqlString.escape(obj.bud_amt)+","
        + SqlString.escape(obj.update_user_id) + "," + update_timestamp + ") "

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->bud-->updatebud--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->bud-->updatebud--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql+";"+sql_log, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->bud-->updatebud-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->bud-->updatebud-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Update Successfully"
                                    res.send(objectToSend)
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



module.exports = router;
