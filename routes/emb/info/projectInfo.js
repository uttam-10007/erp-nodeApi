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


router.get('/getProjectInfo:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".project_info"



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ProjectInfo-->getProjectInfo--", error)
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


router.post('/createProjectInfo', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".project_info (location,remark,project_cd,dep_cd,zone_cd,scheme_cd,sub_scheme_cd,sector_cd,project_type_cd,create_user_id,create_timestamp) values"
        + " ("+SqlString.escape(obj.location)+"," +SqlString.escape(obj.remark)+","+ SqlString.escape(obj.project_cd) + "," + SqlString.escape(obj.dep_cd) + "," + SqlString.escape(obj.zone_cd) + "," + SqlString.escape(obj.scheme_cd) + ","
        + SqlString.escape(obj.sub_scheme_cd) + "," + SqlString.escape(obj.sector_cd) + "," + SqlString.escape(obj.project_type_cd) + ","
        + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->ProjectInfo-->createProjectInfo-->", error)
            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server Side. Please try again later"


            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})

router.delete('/deleteProjectInfo:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".project_info where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->ProjectInfo-->deleteProjectInfo-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Project Info deleted successfully"
            res.send(objectToSend)

        }
    })
})

router.put('/updateProjectInfo', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".project_info set project_cd=" + SqlString.escape(obj.project_cd)
        +",remark ="+SqlString.escape(obj.remark)+",location ="+SqlString.escape(obj.location)
        + ",dep_cd=" + SqlString.escape(obj.dep_cd) + ",zone_cd=" + SqlString.escape(obj.zone_cd)
        + ",scheme_cd=" + SqlString.escape(obj.scheme_cd) + ",sub_scheme_cd=" + SqlString.escape(obj.sub_scheme_cd)
        + ",sector_cd=" + SqlString.escape(obj.sector_cd) + ",project_type_cd=" + SqlString.escape(obj.project_type_cd)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ProjectInfo-->updateProjectInfo--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->ProjectInfo-->updateProjectInfo--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->ProjectInfo-->updateProjectInfo-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->ProjectInfo-->updateProjectInfo-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "ProjectInfo Update Successfully"
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
