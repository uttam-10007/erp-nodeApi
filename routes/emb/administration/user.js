var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con.js')
var mysqlPool = require('../../../connections/mysqlConnection.js');

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
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let email = SqlString.escape(obj["email"])
    let password = SqlString.escape(obj["password"])
    let phone_no = SqlString.escape(obj["phone_no"])
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
                            let create_user_id=SqlString.escape(obj["create_user_id"])

                            let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
                        
                            let sql_insertRoles = "insert into " + db + ".data_auth (user_id,role_cd,zone_cd,create_user_id,create_timestamp) values "

                            sql_insertRoles += "(" + user_id + "," + SqlString.escape(obj.role_cd) + "," + SqlString.escape(obj['zone_cd'])+","+create_user_id+","+create_timestamp + ")"
                                                  
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

router.post('/addExistingUserRole', (req, res) => {

    let objectToSend = {}

    let obj = req.body

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let user_id =  SqlString.escape(obj.user_id)
    let create_user_id=SqlString.escape(obj["create_user_id"])

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))



    let sql_insertRoles = "insert into " + db + ".data_auth (user_id,role_cd,zone_cd,create_user_id,create_timestamp) values "

        sql_insertRoles += "(" + user_id + "," + SqlString.escape(obj.role_cd) + "," + SqlString.escape(obj['zone_cd'])+","+create_user_id+","+create_timestamp + ")"

        mysqlPool.query(sql_insertRoles, function (error, results) {
            if (error) {
                console.log("Error routes-->administration-->user-->addExistingUserRole", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                res.send(objectToSend)
            } else {
                objectToSend["error"] = false;
                objectToSend["data"] = "Added Successfully"
                res.send(objectToSend)
            }
        })

})


router.delete('/deleteUser:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let  sql= "delete from " + db + ".data_auth where id=" + obj.id 


    mysqlPool.query(sql, function (error1, results1) {
        if (error1) {
            console.log("Error routes-->administration-->user-->deleteUser", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Deleted Successfully."
            res.send(objectToSend)
        } 
    })
})




router.get('/getUserAuthInfo:dtls', (req, res) => {
    let objectToSend = {}
    let obj=JSON.parse(req.params.dtls)
    let b_acct_id = obj.b_acct_id



     let sql ="SELECT da.*,ri.access,ri.role_name from svayam_"+b_acct_id+"_ebill.data_auth da join svayam_"+b_acct_id+"_ebill.role_info ri on ri.role_cd=da.role_cd where da.user_id="+SqlString.escape(obj.user_id)


     if(obj['zone_cd']!=undefined){
         sql+=" and da.zone_cd="+SqlString.escape(obj.zone_cd)
     }
    
     if(obj['role_cd']!=undefined){
        sql+=" and da.role_cd="+SqlString.escape(obj.role_cd)
    }
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->administration-->user-->getUserAuthInfo", error);
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

router.get('/getUserAllDetails:dtls', (req, res) => {
    let objectToSend = {}
    let obj=JSON.parse(req.params.dtls)
    let b_acct_id = obj.b_acct_id



     let sql ="SELECT distinct da.id,ui.user_id,ui.email,ui.name,ui.phone_no,da.role_cd,da.zone_cd FROM (SELECT * FROM  svayam_system_ebill.user_info WHERE b_acct_id="+b_acct_id+") ui "
            +" JOIN svayam_"+b_acct_id+"_ebill.data_auth da ON ui.user_id=da.user_id"
     if(obj['zone_cd']!=undefined){
         sql+=" and da.zone_cd="+SqlString.escape(obj.zone_cd)
     }
    
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->administration-->user-->getUserAllDetails", error);
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


router.get('/getUserAuthForLevel:dtls', (req, res) => {
    let objectToSend = {}
    let obj=JSON.parse(req.params.dtls)
    let b_acct_id = obj.b_acct_id



     let sql    ="SELECT * FROM svayam_"+b_acct_id+"_ebill.data_auth WHERE zone_cd ="+SqlString.escape(obj.zone_cd)+" OR zone_cd IS null"


     
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->administration-->user-->getUserAuthForLevel", error);
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





module.exports = router;
