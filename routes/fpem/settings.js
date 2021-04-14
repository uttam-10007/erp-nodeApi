var express = require('express');
var router = express.Router();
var moment=require('moment')




var propObj = require('../../config_con')
try {
    var mysqlPool = require('../../connections/mysqlConnection');
} catch (ex) {
    console.log("Error-->routes-->controls->accountingPeriod--", ex)
}
var SqlString = require('sqlstring');


router.post('/setppd', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_data";

    let sql_getFlds = "TRUNCATE TABLE " + db + ".ppd_info;"
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->FPEM-->settings-->setppd", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->FPEM-->settings-->setppd-->", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                else {
                    mysqlCon.query(sql_getFlds, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->FPEM-->settings-->setppd-->", error2)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {


                            let sql_insert = "insert into " + db + ".ppd_info (ppd,status) values (" + SqlString.escape(obj.ppd) + ", 'ACTIVE')"


                            mysqlCon.query(sql_insert, function (error, results) {
                                if (error) {
                                    console.log("Error-->routes-->FPEM-->setting-->setppd-->", error)
                                    objectToSend["error"] = true;
                                    if (error.detail != undefined || error.detail != null) {
                                        if (error.detail.includes("already exists")) {
                                            objectToSend["data"] = "Possible duplicates"
                                        } else {
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        }
                                    } else {
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    }

                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release();
                                }
                                else {
                                    mysqlCon.commit(function (err8) {
                                        if (err8) {
                                            console.log("Error-->routes-->FPEM-->settings---->setppd--", err8);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.end(JSON.stringify(objectToSend))
                                            mysqlCon.rollback();
                                            mysqlCon.release();
                                        }
                                        else {

                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Set Successfully"
                                            res.send(objectToSend)
                                            mysqlCon.release();
                                        }
                                    })
                                }
                            })
                        }
                    })

                }
            })
        }
    })
})






router.put('/setAccountingPeriod', (req, res) => {
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_data";

    let objectToSend = {}

    let sql = "update " + db + ".ref_organisation set fiscal_year_start=" + SqlString.escape(obj.fiscal_year_start) + ",fiscal_year_end=" + SqlString.escape(obj.fiscal_year_end)




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->FPEM-->settings-->setAccountingPeriod", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->FPEM-->settings-->setAccountingPeriod", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->FPEM-->settings-->setAccountingPeriod-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->FPEM-->settings-->setAccountingPeriod-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Field Update Successfully"
                                    res.send(objectToSend)
                                }

                            })

                        }
                    })
                }
            })
        }


    })






})


router.get('/getCurrentPpd:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;

    var objectToSend = {};
    let db = "svayam_" + b_acct_id + "_data";
    var sqlQuery = "select DATE_FORMAT(ppd,'%Y-%m-%d') as ppd  from " + db + ".ppd_info where status='ACTIVE' "
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->FPEM-->settings-->getCurrentPpd", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});


router.get('/getallPpd:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;
    var db = "svayam_" + b_acct_id + "_data";
    var objectToSend = {};

    var sqlQuery = "select DATE_FORMAT(ppd,'%Y-%m-%d') as ppd ,status from " + db + ".ppd_info";
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->FPEM-->settings-->getPpds", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});

router.post('/advancePPD', function (req, res) {
    var objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->FPEM-->settings-->advancePPD--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                var b_acct_id = req.body.b_acct_id;
                let db = "svayam_" + b_acct_id + "_data";

                var query = "select DATE_FORMAT(ppd,'%Y-%m-%d') as ppd  from " + db + ".ppd_info where status='ACTIVE' ;"

                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->FPEM-->settings-->advancePPD--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->FPEM-->settings-->advancePPD--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                if (results.length == 0) {


                                    mysqlCon.commit(function (err8) {
                                        if (err8) {
                                            console.log("Error-->routes-->FPEM-->settings-->advancePPD--", err8);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.end(JSON.stringify(objectToSend))
                                            mysqlCon.rollback();
                                            mysqlCon.release();
                                        } else {

                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "No Active ppd"
                                            res.send(JSON.stringify(objectToSend));
                                            mysqlCon.release();
                                        }
                                    });

                                }
                                else {
                                    var query1 = "update " + db + ".ppd_info set status='INACTIVE' where status='ACTIVE' ;"
                                    mysqlCon.query(query1, function (error1, results1, fields) {
                                        if (error1) {
                                            console.log("Error-->routes-->FPEM-->settings-->advancePPD--", error1);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                            res.send(JSON.stringify(objectToSend));
                                            mysqlCon.rollback();
                                            mysqlCon.release();
                                        }
                                        else {

                                            let d1 = results[0].ppd

                                            let cPpd=moment(d1,"YYYY-MM-DD",true);

                                            let advppd=cPpd.add(1,'days').format("YYYY-MM-DD")

                                          
                                            var query2 = "insert into " + db + ".ppd_info (`ppd`,`status`) values ('" + advppd + "','ACTIVE')";
                                            mysqlCon.query(query2, function (error2, results2, fields) {
                                                if (error2) {
                                                    console.log("Error-->routes-->FPEM-->settings-->advancePPD--", error2);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                                    res.send(JSON.stringify(objectToSend));
                                                    mysqlCon.rollback();
                                                    mysqlCon.release();
                                                }
                                                else {
                                                    mysqlCon.commit(function (err8) {
                                                        if (err8) {
                                                            console.log("Error-->routes-->FPEM-->settings-->advancePPD--", err8);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(JSON.stringify(objectToSend))
                                                            mysqlCon.rollback();
                                                            mysqlCon.release();
                                                        } else {

                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = advppd
                                                            res.send(JSON.stringify(objectToSend));
                                                            mysqlCon.release();
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            }

                        });


                    }





                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->routes-->controls-->accontingPeriod-->advancePPD--", err)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});
function addDays1(date, amount) {
    var tzOff = date.getTimezoneOffset() * 60 * 1000,
        t = date.getTime(),
        d = new Date(),
        tzOff2;

    t += (1000 * 60 * 60 * 24) * amount;
    d.setTime(t);

    tzOff2 = d.getTimezoneOffset() * 60 * 1000;
    if (tzOff != tzOff2) {
        var diff = tzOff2 - tzOff;
        t += diff;
        d.setTime(t);
    }

    return d;
}
router.get('/getAccountingPeriod:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;

    var objectToSend = {};
    let db = "svayam_" + b_acct_id + "_data";
    var sqlQuery = "select  fiscal_year_start,fiscal_year_end  from " + db + ".ref_organisation limit 1";
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->FPEM-->settings-->getAccountingPeriod--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});
module.exports = router;