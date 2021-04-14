var express = require('express');
var router = express.Router();
var propObj = require('../../config_con.js')
var mysqlPool = require('../../connections/mysqlConnection.js');

var hbs = require('nodemailer-express-handlebars');
var SqlString = require('sqlstring');
var moment = require('moment')


var mailer = require('nodemailer');

var senderEmail = propObj.senderEmail
var smtpTransport = mailer.createTransport({
    service: "Gmail",
    auth: {
        user: senderEmail,
        pass: propObj.senderPass
    }
});

var options = {
    viewEngine: {
        extname: '.hbs', // handlebars extension
        layoutsDir: 'View/', // location of handlebars templates
        defaultLayout: 'addUser', // name of main template
        partialsDir: 'View/', // location of your subtemplates aka. header, footer etc
    },
    viewPath: 'View/',
    extName: '.hbs'
};
smtpTransport.use('compile', hbs(options));

router.get('/getAllUsers:dtls', (req, res) => {
    let objectToSend = {}

    let b_acct_id = SqlString.escape(req.params.dtls)

    let sql = "Select user_id,email,name,phone_no,b_acct_id from " + propObj.svayamSystemDbName + ".user_info WHERE b_acct_id=" + b_acct_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->administration-->user-->getAllUsers", error);
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

router.put('/updateUserInfo', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let query = "update " + propObj.svayamSystemDbName + ".user_info set email=" + SqlString.escape(obj.email) + ",name=" + SqlString.escape(obj.name) +
        ",phone_no=" + SqlString.escape(obj.phone_no) + " where user_id=" + obj.user_id;

    mysqlPool.query(query, function(error, results) {
        if (error) {
            console.log("Error routes-->administration-->user-->updateUserInfo", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
});


router.post('/createUser', (req, res) => {

    let objectToSend = {}

    let obj = req.body

    let b_acct_id = SqlString.escape(obj["b_acct_id"])
    let email = SqlString.escape(obj["email"])
    let password = SqlString.escape(obj["password"])
    let phone_no = SqlString.escape(obj["phone_no"])
    let roles = obj["roles"]
    let sql = "insert into " + propObj.svayamSystemDbName + ".user_info (name,phone_no,email,password,b_acct_id) values"
        + "(" + SqlString.escape(obj["name"])+","+phone_no + "," + email + "," + password + "," + b_acct_id + ")"

    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error routes-->administration-->user-->createUser", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error routes-->administration-->user-->createUser", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql, function (error3, results3) {
                        if (error3) {
                            console.log("Error routes-->administration-->user-->createUser", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            let user_id = results3.insertId

                            let sql_insertRoles = "insert into " + propObj.svayamSystemDbName + ".user_xref_role (user_id,role_cd,b_acct_id) values "
                            for (let i = 0; i < roles.length; i++) {
                                sql_insertRoles += "(" + user_id + "," + SqlString.escape(roles[i]) + "," + SqlString.escape(obj['b_acct_id']) + ")"

                                if (i < roles.length - 1) {
                                    sql_insertRoles += ","
                                }
                            }
                            mysqlCon.query(sql_insertRoles, function (error31, results31) {
                                if (error31) {
                                    console.log("Error routes-->administration-->user-->createUser", error31);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                    res.send(objectToSend)
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {

                                    if (obj['email'] != undefined) {
                                        var smail = {
                                            from: senderEmail,
                                            to: obj["email"],
                                            subject: "User Information",
                                            attachments: [{
                                                filename: 'img.jpg',
                                                path: 'View/img.jpg',
                                                cid: 'unique@cid'
                                            }],
                                            template: "addUser",
                                            context: {
                                                admin: obj['admin'],
                                                email: obj["email"],
                                                pass: obj["password"],
                                                desc: obj['account_desc']

                                            }
                                        }


                                        smtpTransport.sendMail(smail, function (error22, response) {
                                            if (error22) {
                                                console.log("Error routes-->administration-->user-->createUser", error22);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Can't process yor request right now.Please try again later"
                                                res.send(objectToSend)
                                                mysqlCon.rollback()
                                                mysqlCon.release()
                                            } else {

                                                mysqlCon.commit(function (error5) {

                                                    if (error5) {
                                                        console.log("Error routes-->administration-->user-->createUser", error5);
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                                        res.send(objectToSend)
                                                        mysqlCon.rollback()
                                                        mysqlCon.release()
                                                    } else {


                                                        objectToSend["error"] = false;
                                                        objectToSend["data"] = user_id
                                                        res.send(objectToSend)
                                                        mysqlCon.release()

                                                    }
                                                });
                                            }
                                            smtpTransport.close();
                                        });
                                    } else {
                                        mysqlCon.commit(function (error5) {
                                            if (error5) {
                                                console.log("Error routes-->administration-->user-->createUser", error5);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                                res.send(objectToSend)
                                                mysqlCon.rollback()
                                                mysqlCon.release()
                                            } else {
                                                objectToSend["error"] = false;
                                                objectToSend["data"] = user_id
                                                res.send(objectToSend)
                                                mysqlCon.release()

                                            }

                                        })
                                    }


                                }

                            })
                        }
                    })
                }
            })
        }
    })

})




router.delete('/deleteUser:dtls', (req, res) => {
    let objectToSend = {}

    let id = req.params.dtls

    let sql_checkAdmin = "Select role_cd from " + propObj.svayamSystemDbName + ".user_xref_role where user_id=" + id + " and role_cd = 'ADMIN'"


    mysqlPool.query(sql_checkAdmin, function (error1, results1) {
        if (error1) {
            console.log("Error routes-->administration-->user-->deleteUser", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else if (results1.length > 0) {
            objectToSend["error"] = true;
            objectToSend["data"] = "Can't delete user with administrative privileges"
            res.send(objectToSend)
        } else {
            let sql_delUser = "delete from " + propObj.svayamSystemDbName + ".user_info where user_id=" + id
           // let sql_delAcctXref = "delete from " + propObj.svayamSystemDbName + ".fpem_acct_xref_user where user_id=" + id
            let sql_delRoleXref = "delete from " + propObj.svayamSystemDbName + ".user_xref_role where user_id=" + id

            mysqlPool.getConnection(function (error2, mysqlCon) {
                if (error2) {
                    console.log("Error routes-->administration-->user-->deleteUser", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                } else {
                    mysqlCon.beginTransaction(function (error3, results3) {
                        if (error3) {
                            console.log("Error routes-->administration-->user-->deleteUser", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.release()
                        } else {
                            mysqlCon.query( sql_delRoleXref + ";" + sql_delUser, function (error4, results4) {
                                if (error4) {
                                    console.log("Error routes-->administration-->user-->deleteUser", error4);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                    res.send(objectToSend)
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    mysqlCon.commit(function (error5) {
                                        if (error5) {
                                            console.log("Error routes-->administration-->user-->deleteUser", error5);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                            res.send(objectToSend)
                                            mysqlCon.rollback()
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "User Removed successfully"
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
        }
    })
})

module.exports = router;
