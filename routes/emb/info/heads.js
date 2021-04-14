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


router.get('/getheadDetails:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)


    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = ""
    if (obj['access'] == 'ZONEWISE' && obj['role_cd'] != 'ZA') {

        sql_fetchCurr += "SELECT distinct ph.zone_cd, ph.proj_cd,ph.proj_head,ph.proj_desc,ph.`status` AS proj_status,wh.work_id,wh.user_id,"
            + " wh.work_order_name,wh.work_order_no,wh.`status` AS work_status,ph.role_cd as project_role_cd,wh.role_cd as work_role_cd"
            + " FROM " + db + ".project_head ph "
            + " LEFT JOIN " + db + ".work_head wh ON ph.proj_cd=wh.proj_cd "
        if (obj['user_id'] != undefined) {
            sql_fetchCurr += "WHERE  (ph.proj_head=" + SqlString.escape(obj['user_id']) + "  OR wh.user_id=" + SqlString.escape(obj['user_id']) + " )"

            if (obj['zone_cd'] != undefined) {
                sql_fetchCurr += " and ph.zone_cd=" + SqlString.escape(obj['zone_cd'])

            }

            if (obj['role_cd'] != undefined) {
                sql_fetchCurr += " and (ph.role_cd=" + SqlString.escape(obj['role_cd']) + " or wh.role_cd=" + SqlString.escape(obj['role_cd']) + ") "
            }

        }

        if (obj['user_id'] == undefined) {

            if (obj['zone_cd'] != undefined) {
                sql_fetchCurr += " where ph.zone_cd=" + SqlString.escape(obj['zone_cd'])
            }
        }

        let zone_check = "SELECT * FROM " + db + ".zone_head WHERE `zone_head`=" + SqlString.escape(obj['user_id']) + " AND role_cd=" + SqlString.escape(obj['role_cd']) + " AND zone_cd=" + SqlString.escape(obj['zone_cd'])
       
        mysqlPool.query(zone_check, function (error, results) {
            if (error) {
                console.log("Error-->routes-->info-->heads-->getheadDetails--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                if (results.length > 0) {
                    sql_fetchCurr = "SELECT pr.project_cd as proj_cd,pr.zone_cd,wi.id AS work_id FROM " + db + ".project_info pr left JOIN " + db + ".work_info wi ON pr.project_cd=wi.project_cd"

                    sql_fetchCurr += " where pr.zone_cd=" + SqlString.escape(obj['zone_cd'])
                    mysqlPool.query(sql_fetchCurr, function (error1, results1) {
                        if (error1) {
                            console.log("Error-->routes-->info-->heads-->getheadDetails--", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                        } else {
                            objectToSend["error"] = false
                            objectToSend["data"] = results1
                            res.send(objectToSend);
                        }
                    })

                } else {
                    let proj_check = "SELECT * FROM " + db + ".project_head WHERE `proj_head`=" + SqlString.escape(obj['user_id']) + " AND role_cd=" + SqlString.escape(obj['role_cd']) + " AND zone_cd=" + SqlString.escape(obj['zone_cd'])
                    mysqlPool.query(proj_check, function (error11, results11) {
                        if (error11) {
                            console.log("Error-->routes-->info-->heads-->getheadDetails--", error11)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                        } else {
                           
                            if (results11.length > 0) {
                                console.log("inside")
                              //  sql_fetchCurr = "SELECT distinct ph.zone_cd, ph.proj_cd,ph.proj_head,ph.proj_desc,ph.`status` AS proj_status,wh.id as work_id, "
                                //    + "wh.work_order_name,wh.work_order_no ,ph.role_cd as project_role_cd "
                                sql_fetchCurr +=" union       SELECT distinct ph.zone_cd, ph.proj_cd,ph.proj_head,ph.proj_desc,ph.`status` AS proj_status,wh.id as work_id,NULL AS user_id, "
                             +"   wh.work_order_name,wh.work_order_no ,null AS work_status,ph.role_cd as project_role_cd,ph.role_cd as work_role_cd"
                                  
                                + " FROM " + db + ".project_head ph  LEFT JOIN " + db + ".work_info wh ON ph.proj_cd=wh.project_cd WHERE "
                                    + " (ph.proj_head=" + SqlString.escape(obj['user_id']) + " ) and ph.zone_cd=" + SqlString.escape(obj['zone_cd']) + " and (ph.role_cd=" + SqlString.escape(obj['role_cd']) + ") "
                            }
                            mysqlPool.query(sql_fetchCurr, function (error1, results1) {
                                if (error1) {
                                    console.log("Error-->routes-->info-->heads-->getheadDetails--", error1)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = results1
                                    res.send(objectToSend);
                                }
                            })
                        }
                    });


                }
               
            }
        })

    } else {

        if (obj['access'] == 'ACCESSALL') {
            sql_fetchCurr += "SELECT pr.project_cd as proj_cd,pr.zone_cd,wi.id AS work_id FROM " + db + ".project_info pr left JOIN " + db + ".work_info wi ON pr.project_cd=wi.project_cd"
            // if( obj['role_cd']=='ZA'){
            //     sql_fetchCurr += " where pr.zone_cd=" +SqlString.escape(obj['zone_cd']) 

            // }
        }

        if (obj['access'] == 'ZONEWISE' && obj['role_cd'] == 'ZA') {
            sql_fetchCurr += "SELECT pr.project_cd as proj_cd,pr.zone_cd,wi.id AS work_id FROM " + db + ".project_info pr left JOIN " + db + ".work_info wi ON pr.project_cd=wi.project_cd"
            if (obj['role_cd'] == 'ZA') {
                sql_fetchCurr += " where pr.zone_cd=" + SqlString.escape(obj['zone_cd'])

            }
        }
        mysqlPool.query(sql_fetchCurr, function (error1, results1) {
            if (error1) {
                console.log("Error-->routes-->info-->heads-->getheadDetails--", error1)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                objectToSend["error"] = false
                objectToSend["data"] = results1
                res.send(objectToSend);
            }
        })
        
    }



})

router.get('/getZoneHead:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj.b_acct_id

    let sql = "SELECT za.*,ui.name,'ACTIVE' as `status` FROM ( SELECT * FROM  svayam_" + b_acct_id + "_ebill.data_auth WHERE role_cd='ZA' AND zone_cd=" + SqlString.escape(obj.zone_cd) + ") AS za JOIN "
        + propObj.svayamSystemDbName + ".user_info ui ON za.user_id=ui.user_id"


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->info-->heads-->getZoneHead", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
})

router.get('/ZoneheadForZA:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj.b_acct_id

    let db = "svayam_" + b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".zone_head where zone_cd=" + SqlString.escape(obj.zone_cd)


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->ZoneheadForZA--", error)
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


router.post('/createzonehead', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".zone_head (role_cd,zone_cd,zone_head,zone_desc,status,create_user_id,create_timestamp) values"
        + " (" + SqlString.escape(obj.role_cd) + "," + SqlString.escape(obj.zone_cd) + "," + SqlString.escape(obj.zone_head) + "," + SqlString.escape(obj.zone_desc)
        + "," + SqlString.escape(obj.status) + "," + SqlString.escape(obj.create_user_id) + ","
        + "" + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->createzonehead-->", error)
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

router.post('/updatezonehead', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update " + db + ".zone_head set role_cd=" + SqlString.escape(obj.role_cd) + ",zone_cd=" + SqlString.escape(obj.zone_cd) + ",zone_head=" + SqlString.escape(obj.zone_head)
        + ",zone_desc=" + SqlString.escape(obj.zone_desc) + ",status=" + SqlString.escape(obj.status)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp=" + update_timestamp + " where id=" + SqlString.escape(obj.id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->updatezonehead-->", error)
            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = "Updated successfully"
            res.send(objectToSend)
        }
    })


})

router.delete('/deletezonehead:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".zone_head where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->heads-->deletezonehead-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Zone head deleted successfully"
            res.send(objectToSend)

        }
    })
})



router.get('/getProjecthead:dtls', (req, res) => {
    let objectToSend = {}


    let b_acct_id = req.params.dtls

    let db = "svayam_" + b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".project_head"




    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->getProjecthead--", error)
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



router.get('/Projectheadfromzone:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".project_head where zone_cd=" + SqlString.escape(obj.zone_cd)




    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->Projectheadfromzone--", error)
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

router.post('/createProjecthead', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".project_head (role_cd,zone_cd,proj_cd,proj_head,proj_desc,status,create_user_id,create_timestamp) values"
        + " (" + SqlString.escape(obj.role_cd) + "," + SqlString.escape(obj.zone_cd) + "," + SqlString.escape(obj.proj_cd) + "," + SqlString.escape(obj.proj_head) + "," + SqlString.escape(obj.proj_desc)
        + "," + SqlString.escape(obj.status) + "," + SqlString.escape(obj.create_user_id) + ","
        + "" + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->createProjecthead-->", error)
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

router.post('/updateProjecthead', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update " + db + ".project_head set role_cd=" + SqlString.escape(obj.role_cd) + ",zone_cd=" + SqlString.escape(obj.zone_cd) + ",proj_cd=" + SqlString.escape(obj.proj_cd)
        + ",proj_desc=" + SqlString.escape(obj.proj_desc) + ",status=" + SqlString.escape(obj.status) + ",proj_head=" + SqlString.escape(obj.proj_head)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp=" + update_timestamp + " where id=" + SqlString.escape(obj.id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->updateProjecthead-->", error)
            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = "Updated successfully"
            res.send(objectToSend)
        }
    })


})

router.delete('/deleteProjecthead:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".project_head where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->heads-->deleteProjecthead-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Deleted successfully"
            res.send(objectToSend)

        }
    })
})

router.get('/workheadFromProj:dtls', (req, res) => {
    let objectToSend = {}



    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql_fetchCurr = "Select * from " + db + ".work_head where proj_cd=" + SqlString.escape(obj.proj_cd)


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->workheadFromProj--", error)
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


router.get('/getworkhead:dtls', (req, res) => {
    let objectToSend = {}


    let b_acct_id = req.params.dtls

    let db = "svayam_" + b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".work_head"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->getworkhead--", error)
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


router.post('/createworkhead', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".work_head (role_cd,work_id,proj_cd,user_id,work_order_name,work_order_no,status,create_user_id,create_timestamp) values"
        + " (" + SqlString.escape(obj.role_cd) + "," + SqlString.escape(obj.work_id) + "," + SqlString.escape(obj.proj_cd) + "," + SqlString.escape(obj.user_id) + "," + SqlString.escape(obj.work_order_name)
        + "," + SqlString.escape(obj.work_order_no) + "," + SqlString.escape(obj.status) + "," + SqlString.escape(obj.create_user_id) + ","
        + "" + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->createworkhead-->", error)
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

router.post('/updateWorkhead', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update " + db + ".work_head set role_cd=" + SqlString.escape(obj.role_cd) + ",work_id=" + SqlString.escape(obj.work_id) + ",proj_cd=" + SqlString.escape(obj.proj_cd)
        + ",user_id=" + SqlString.escape(obj.user_id) + ",status=" + SqlString.escape(obj.status) + ",work_order_name=" + SqlString.escape(obj.work_order_name)
        + ",work_order_no=" + SqlString.escape(obj.work_order_no) + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp=" + update_timestamp + " where id=" + SqlString.escape(obj.id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->heads-->updateWorkhead-->", error)
            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = "Updated successfully"
            res.send(objectToSend)
        }
    })


})

router.delete('/deleteWorkhead:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".work_head where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->heads-->deleteWorkhead-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Deleted successfully"
            res.send(objectToSend)

        }
    })
})
module.exports = router;
