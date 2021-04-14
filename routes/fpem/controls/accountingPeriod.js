var express = require('express');
var router = express.Router();




var propObj = require('../../../config_con')
try {
    var mysqlPool = require('../../../connections/mysqlConnection');
} catch (ex) {
    console.log("Error-->routes-->controls->accountingPeriod--", ex)
}
var SqlString = require('sqlstring');




router.post("/rollbacktest", (req, res) => {
    let objectToSend = {}
    var obj = req.body;
    let args = ""
    args = SqlString.escape(JSON.stringify(obj))
    args = args.substring(1, args.length - 1);
    console.log(args);
    console.log(obj);
    const exec = require('child_process').exec;
    let command = 'spark-submit --master yarn --deploy-mode client --class com.svayam.StartRollback.RollbackMain --num-executors 6 --executor-cores 1 --executor-memory 1536M --conf spark.yarn.am.nodeLabelExpression=L --conf spark.yarn.executor.nodeLabelExpression=SPARK --jars ./jar/RollBack.jar,./jar/RollBack_lib/* ./jar/RollBack.jar "' + args + '"'
    exec(command)
    objectToSend["error"] = false;
    objectToSend["data"] = "Submiiting Request for RollBack!";
    res.send(objectToSend);
});




router.get('/getCurrentPpd:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;

    var objectToSend = {};
    let db = "svayam_" + b_acct_id + "_data";
    var sqlQuery = "select DATE_FORMAT(ppd,'%Y-%m-%d') as ppd  from " + db + ".ppd_info where status='ACTIVE' "
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->accountingPeriod-->getCurrentPpd", error);
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


router.post('/advancePPD_old', function (req, res) {
    var objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->controls-->accontingPeriod-->advancePPD--", err)
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
                        console.log("Error-->routes-->controls-->accontingPeriod-->advancePPD--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->controls-->accontingPeriod-->advancePPD--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                var query1 = "update " + db + ".ppd_info set status='INACTIVE' where status='ACTIVE' ;"
                                mysqlCon.query(query1, function (error1, results1, fields) {
                                    if (error) {
                                        console.log("Error-->routes-->controls-->accontingPeriod-->advancePPD--", error1);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    }
                                    else {

                                        var d1 = results[0].ppd
                                        var dateParts = d1.split("-");
                                        var dt = new Date(+dateParts[0], dateParts[1] - 1, +dateParts[2], 0, 0, 0, 0)
                                        var newDate = addDays1(dt, 1);
                                        var x = newDate;
                                        var y = x.toLocaleDateString()
                                        console.log(y)
                                        /*var d=y.split("-")
                                        var advppd=d[2]+"-";
                                        if(d[0].length==1){
                                            advppd+="0"+d[0]+"-";
                                        }else{
                                            advppd+=d[0]+"-";
                                        }
                                        if(d[1].length==1){
                                            advppd+="0"+d[1];
                                        }else{
                                            advppd+=d[1];
                                        }*/

                                        let advppd = y;


                                        var query2 = "insert into " + db + ".ppd_info (`ppd`,`status`) values ('" + advppd + "','ACTIVE')";

                                        mysqlCon.query(query2, function (error2, results2, fields) {
                                            if (error) {
                                                console.log("Error-->routes-->controls-->accontingPeriod-->advancePPD--", error2);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                                res.send(JSON.stringify(objectToSend));
                                                mysqlCon.rollback();
                                                mysqlCon.release();
                                            }
                                            else {
                                                mysqlCon.commit(function (err8) {
                                                    if (err8) {
                                                        console.log("Error-->routes-->controls-->accontingPeriod-->advancePPD--", err8);
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                        res.end(JSON.stringify(objectToSend))
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

router.post("/advanceppd", (req, res) => {
    let objectToSend = {}
    var obj = req.body;
    const exec = require('child_process').exec;
    let command = "spark-submit --master yarn --deploy-mode client --class com.svayam.BalanceProcessing.StartProcessing --num-executors 6 --executor-cores 1 --executor-memory 1536M --conf spark.yarn.am.nodeLabelExpression=L --conf spark.yarn.executor.nodeLabelExpression=SPARK --jars ./jar/AdvancePPD.jar,./jar/AdvancePPD_lib/* ./jar/AdvancePPD.jar " + obj.acct_id
    exec(command)
    objectToSend["error"] = false;
    objectToSend["data"] = "Submiiting Request!";
    res.send(objectToSend);
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




router.get('/getStartEndMonth:dtls', function (req, res) {

    var b_acct_id = req.params.dtls;

    var objectToSend = {};
    let db = "svayam_" + b_acct_id + "_data";
    var sqlQuery = "select  organisation_name,fiscal_year_start,fiscal_year_end  from " + db + ".ref_organisation ";
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->accountingPeriod-->getStartEndMonth", error);
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


router.post('/rollbackprev', async function (req, res) {
    try {

        var obj = req.body;

        var b_acct_id = obj.b_acct_id;
        var run_id = obj.run_id
        var db = "svayam_" + b_acct_id + "_md"
        var ppd = obj.ppd;
        console.log(obj)
        var arrHive = []
        var arrmysql = []

        var query = "select technical_field_name from " + db + ".field_info where field_logical_id=" + propObj.ppd_logical_id;
        console.log(query)
        var ppd_name = await MysqlQuery(query);
        if (ppd_name.error == true) {
            res.send(ppd_name)
            return;
        }
        console.log("query1");
        var qs = "select record_technical_name from " + db + ".record_info where record_type IN ('jrnl' ,'sal' ,'ip' ,'audit') ";
        //console.log(qs)
        var storedata = await MysqlQuery(qs);
        if (storedata.error == true) {
            res.send(storedata)
            return;
        }
        console.log("query2");

        for (let i = 0; i < storedata.data.length; i++) {
            var qr = "delete from " + db + "." + storedata.data[i].file_name_technical + " where " + SqlString.escape(ppd_name.data[0].technical_field_name) + "='" + ppd + "' and run_id=" + run_id;

            console.log(qr)
            if (storedata.data[i].store == 'Hive') {

                var qr1 = "TRUNCATE TABLE  " + db + "." + storedata.data[i].file_name_technical;
                arrHive.push(qr1)

                //arrHive.push(qr)
            } else {
                arrmysql.push(qr)
            }

        }

        if (arrHive.length > 0) {

            for (let i = 0; i < arrHive.length; i++) {
                //  console.log("Executing query hive "+i)

                var ob = await executeQueryInHive(arrHive[i]);
                if (ob.error == true) {

                    res.send(ob)
                    return;
                }

            }
        }

        if (arrmysql.length > 0) {

            for (let i = 0; i < arrmysql.length; i++) {
                // console.log("Executing query mysql "+i)

                var ob1 = await queryDb(arrmysql[i]);
                if (ob1.error == true) {

                    res.send(ob1)
                    return;
                }

            }
        }

        var ss = "delete from " + propObj.svayamUserDbName + ".batch_status where acct_id=" + acct_id + " and ppd='" + ppd + "' and run_id=" + run_id;
        var streamdel = await queryDb(ss);
        if (streamdel.error == true) {

            res.send(streamdel)

            return;
        }

        var obje = new Object;

        obje["error"] = false;
        obje["data"] = "Delete Successfully!"

        res.send(obje)



    }
    catch (ex) {
        console.log(ex)
    }



})

function MysqlQuery(query) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(query, (err, result) => {
            if (err) {
                var obj = new Object;
                obj["error"] = true;
                obj["data"] = err
                return resolve(obj);
            }
            var obj = new Object;
            obj["error"] = false;
            obj["data"] = result
            return resolve(obj);
        });
    })
}
function queryDb(query) {
    return new Promise((resolve, reject) => {
        mysqlPool.query(query, (err, result) => {
            if (err) {
                var obj = new Object;
                obj["error"] = true;
                obj["data"] = err
                return resolve(obj);
            }
            var obj = new Object;
            obj["error"] = false;
            return resolve(obj)

        });
    })
}

function executeQueryInHive(hql) {
    return new Promise((resolve, reject) => {
        hiveDbCon.reserve(function (err4, connObj) {
            if (err4) {
                hiveDbCon.release(connObj, function (err8) {
                    if (err8) {
                        console.log("Error routes-->financials-->trialBalance-->--Error while releasing con", err8)
                    } else {
                        console.log("Hive conn released")
                    }
                })
                var obj = new Object;
                obj["error"] = true;
                obj["data"] = err4
                console.log(obj)
                return resolve(obj);
            } else {
                var conn = connObj.conn;


                conn.createStatement(function (err1, statement) {
                    if (err1) {
                        hiveDbCon.release(connObj, function (err8) {
                            if (err8) {
                                console.log("Error routes-->financials-->trialBalance-->--Error while releasing con", err8)
                            } else {
                                console.log("Hive conn released")
                            }
                        })
                        var obj = new Object;
                        obj["error"] = true;
                        obj["data"] = err1
                        console.log(obj)
                        return resolve(obj);
                    } else {
                        statement.executeUpdate(hql, function (err2, rows) {
                            if (err2) {
                                hiveDbCon.release(connObj, function (err8) {
                                    if (err8) {
                                        console.log("Error routes-->financials-->trialBalance-->--Error while releasing con", err8)
                                    } else {
                                        console.log("Hive conn released")
                                    }
                                })
                                var obj = new Object;
                                obj["error"] = true;
                                obj["data"] = err2

                                return resolve(obj);
                            } else {

                                hiveDbCon.release(connObj, function (err8) {
                                    if (err8) {
                                        console.log("Error routes-->administration-->financials-->processingGroup-->Reference data-->getReprtingUnits--Error while releasing con", err8)
                                    } else {
                                        console.log("Hive conn released")
                                    }
                                })
                                var obj = new Object;
                                obj["error"] = false;

                                return resolve(obj)
                            }
                        })
                    }

                })

            }
        });
    })
}


router.post('/rollback', async function (req, res) {
    try {

        var obj = req.body;


        var acct_id = obj.acct_id;
        var run_id = obj.run_id
        var db = "svayam_" + acct_id + "_data"
        var ppd = obj.ppd;
        var store;



        var arrHive = []
        var arrmysql = []

        var query = "select id from " + propObj.svayamUserDbName + ".field_info where field_logical_id=" + propObj.ppd_logical_id + " and acct_id=" + acct_id;

        var ppd_name = await MysqlQuery(query);
        if (ppd_name.error == true) {
            res.send(ppd_name)
            return;
        }


        var query = "select id from " + propObj.svayamUserDbName + ".field_info where  field_logical_id=" + propObj.run_logical_id + " and acct_id=" + acct_id;


        var run_id_name = await MysqlQuery(query);
        if (run_id_name.error == true) {
            res.send(run_id_name)
            return;
        }

        var ext_id = '';
        var query_ext = "select file_name_technical from " + propObj.svayamUserDbName + ".file_info where is_extension=1 and acct_id=" + acct_id;

        var ext_files = await MysqlQuery(query_ext);
        if (ext_files.error == true) {
            res.send(ext_files)
            return;
        }

        for (let i = 0; i < ext_files.data.length; i++) {
            ext_id = ext_id + "'" + ext_files.data[i].file_name_technical + "',"
        }




        var balance_id = '';
        var query_balance_file = "select file_name_technical from " + propObj.svayamUserDbName + ".file_info where (is_balance_file='jsf' or is_balance_file='rsf') and acct_id=" + acct_id;

        var balance_files = await MysqlQuery(query_balance_file);
        if (balance_files.error == true) {
            res.send(balance_files)
            return;
        }



        for (let i = 0; i < balance_files.data.length; i++) {
            balance_id = balance_id + "'" + balance_files.data[i].file_name_technical + "',"
        }

        var qs = "select file_name_technical,store from " + propObj.svayamUserDbName + ".file_info where file_name_technical IN ('jrnl'," + ext_id + balance_id + "'audit') and acct_id=" + acct_id;

        var storedata = await MysqlQuery(qs);
        if (storedata.error == true) {
            res.send(storedata)
            return;
        }


        for (let i = 0; i < storedata.data.length; i++) {
            store = storedata.data[i].store;

            var qr = "delete from " + db + "." + storedata.data[i].file_name_technical + " where " + ("c_" + ppd_name.data[0].id) + "='" + ppd + "' and " + ("c_" + run_id_name.data[0].id) + "='" + run_id + "'";


            if (storedata.data[i].store == 'Hive') {
                arrHive.push(qr)
            } else {
                arrmysql.push(qr)
            }

        }

        var qr1 = "delete from " + db + ".ref_balance_reconciliation where ppd='" + ppd + "' and run_id=" + run_id;
        arrmysql.push(qr1);

        if (arrHive.length > 0) {

            for (let i = 0; i < arrHive.length; i++) {
                console.log("Executing query hive " + i)

                var ob = await executeQueryInHive(arrHive[i]);
                if (ob.error == true) {

                    res.send(ob)
                    return;
                }

            }
        }

        if (arrmysql.length > 0) {
            for (let i = 0; i < arrmysql.length; i++) {
                console.log("Executing query mysql " + i)

                var ob1 = await queryDb(arrmysql[i]);
                if (ob1.error == true) {

                    res.send(ob1)
                    return;
                }

            }
        }

        var ss = "delete from " + propObj.svayamUserDbName + ".batch_status where acct_id=" + acct_id + " and ppd='" + ppd + "' and run_id=" + run_id;

        var streamdel = await queryDb(ss);
        if (streamdel.error == true) {

            res.send(streamdel)

            return;
        }

        var obje = new Object;

        obje["error"] = false;
        obje["data"] = "Delete Successfully!"

        res.send(obje)



    }
    catch (ex) {
        console.log(ex)
    }



});







module.exports = router;
