var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con.js')
var mysqlPool = require('../../../connections/mysqlConnection.js');


var SqlString = require('sqlstring');
var moment = require('moment')


router.get('/getAllRolesWIthResource:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql = "SELECT ri.role_cd,ri.role_name,ri.role_desc,ri.is_system_role,ri.access,GROUP_CONCAT(xr.res_cd) AS res_cd  "
        + "FROM " + db + ".role_info ri left JOIN " + db + ".role_xref_resource xr ON ri.role_cd=xr.role_cd "

    if (obj.role_cd != undefined) {
        sql += " where ri.role_cd=" + SqlString.escape(obj.role_cd)
    }



    sql += " GROUP BY ri.role_cd,ri.role_name,ri.role_desc,ri.is_system_role,ri.access"
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->administration-->account_role_resource-->getAllRolesWIthResource", error);
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
router.get('/getAllRoles', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql = "SELECT * from  " + db + ".role_info "

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->administration-->account_role_resource-->getAllRoles", error);
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


router.get('/getAllWorkRelatedUser:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql = "SELECT distinct ui.name,t.user_id,t.role_cd FROM "
        + " (SELECT name,user_id FROM " + propObj.svayamSystemDbName + ".user_info WHERE b_acct_id=" + SqlString.escape(obj.b_acct_id) + ") ui JOIN  "
        + " (SELECT user_id,role_cd FROM " + db + ".work_head WHERE work_id=" + SqlString.escape(obj.work_id) + " UNION "+" SELECT `zone_head` AS user_id ,role_cd FROM " + db + ".zone_head WHERE zone_cd="+SqlString.escape(obj.zone_cd)+" UNION "
        + " SELECT proj_head AS user_id,role_cd FROM " + db + ".project_head WHERE proj_cd=" + SqlString.escape(obj.proj_cd) + " "
        + " UNION SELECT user_id,role_cd FROM " + db + ".data_auth WHERE (role_cd='ZA' AND zone_cd=" + SqlString.escape(obj.zone_cd) + ") OR zone_cd IS NULL) t ON ui.user_id=t.user_id"
   
 mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->administration-->account_role_resource-->getAllWorkRelatedUser", error);
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



router.post('/addAccountUserRole', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let role_cd = SqlString.escape(obj["role_cd"])
    let role_name = SqlString.escape(obj["role_name"])
    let role_desc = SqlString.escape(obj["role_desc"])
    let create_user_id = SqlString.escape(obj["create_user_id"])

    let is_system_role = 0
    let access = SqlString.escape(obj["access"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let res_cd = obj["res_cd"]


    let sql = "insert into " + db + ".role_info (role_cd,role_name,role_desc,is_system_role,access,create_user_id,create_timestamp) values "
        + "(" + role_cd + "," + role_name + "," + role_desc + "," + is_system_role + "," + access + "," + create_user_id + "," + create_timestamp + ")"

    let sql1 = "insert into " + db + ".role_xref_resource (role_cd,res_cd) values "
    for (let i = 0; i < res_cd.length; i++) {
        sql1 += "(" + role_cd + "," + SqlString.escape(res_cd[i]) + ")"
        if (i < res_cd.length - 1) {
            sql1 += ","
        }
    }



    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error routes-->administration-->account_role_resource-->addAccountUserRole", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error routes-->administration-->account_role_resource-->addAccountUserRole", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql + ";" + sql1, function (error3, results3) {
                        if (error3) {
                            console.log("Error routes-->administration-->account_role_resource-->addAccountUserRole", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error4) {
                                if (error4) {
                                    console.log("Error routes-->administration-->account_role_resource-->addAccountUserRole", error4);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                    res.send(objectToSend)
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "User role added successfully"
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


router.put('/updateAccountUserRole', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let role_cd = SqlString.escape(obj["role_cd"])
    let role_name = SqlString.escape(obj["role_name"])
    let role_desc = SqlString.escape(obj["role_desc"])
    let update_user_id = SqlString.escape(obj["update_user_id"])

    let is_system_role = 0
    let access = SqlString.escape(obj["access"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let res_cd = obj["res_cd"]


    let sql = "update   " + db + ".role_info set role_name=" + role_name + ",role_desc=" + role_desc + ",update_user_id=" + update_user_id + ",update_timestamp= "
        + update_timestamp + " where role_cd=" + role_cd

    let sql_del = "delete from " + db + ".role_xref_resource where role_cd=" + role_cd

    let sql1 = "insert into " + db + ".role_xref_resource (role_cd,res_cd) values "
    for (let i = 0; i < res_cd.length; i++) {
        sql1 += "(" + role_cd + "," + SqlString.escape(res_cd[i]) + ")"
        if (i < res_cd.length - 1) {
            sql1 += ","
        }
    }




    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error routes-->administration-->account_role_resource-->updateAccountUserRole", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error routes-->administration-->account_role_resource-->updateAccountUserRole", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql + ";" + sql_del + ";" + sql1, function (error3, results3) {
                        if (error3) {
                            console.log("Error routes-->administration-->account_role_resource-->updateAccountUserRole", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error4) {
                                if (error4) {
                                    console.log("Error routes-->administration-->account_role_resource-->updateAccountUserRole", error4);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                    res.send(objectToSend)
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "User role updated successfully"
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






router.post('/deleteRole', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql = "delete from " + db + ".role_info  WHERE role_cd=" + SqlString.escape(obj.role_cd)
    let sql1 = "delete from " + db + ".role_xref_resource  WHERE role_cd=" + SqlString.escape(obj.role_cd)
    let userCheck = "select * from " + db + ".data_auth where  role_cd=" + SqlString.escape(obj.role_cd)


    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error routes-->administration-->account_role_resource-->deleteRole", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error routes-->administration-->account_role_resource-->deleteRole", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(userCheck, function (error3, results3) {
                        if (error3) {
                            console.log("Error routes-->administration-->account_role_resource-->deleteRole", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            if (results3.length > 0) {
                                mysqlCon.commit(function (error4) {
                                    if (error4) {
                                        console.log("Error routes-->administration-->account_role_resource-->deleteRole", error4);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                        res.send(objectToSend)
                                        mysqlCon.rollback()
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Not Deleted! Some user exists with this Role."
                                        res.send(objectToSend)
                                        mysqlCon.release()

                                    }
                                })
                            } else {
                                mysqlCon.query(sql + ";" + sql1, function (error31, results31) {
                                    if (error31) {
                                        console.log("Error routes-->administration-->account_role_resource-->deleteRole", error31);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                        res.send(objectToSend)
                                        mysqlCon.rollback()
                                        mysqlCon.release()
                                    } else {
                                        mysqlCon.commit(function (error4) {
                                            if (error4) {
                                                console.log("Error routes-->administration-->account_role_resource-->deleteRole", error4);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                                res.send(objectToSend)
                                                mysqlCon.rollback()
                                                mysqlCon.release()
                                            } else {
                                                objectToSend["error"] = false;
                                                objectToSend["data"] = "Role deleted successfully"
                                                res.send(objectToSend)
                                                mysqlCon.release()
                                            }
                                        })
                                    }
                                })
                            }

                        }
                    })
                }
            })
        }
    })
})
module.exports = router;
