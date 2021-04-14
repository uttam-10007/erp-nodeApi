var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);
const fs = require('fs');
var hbs = require('nodemailer-express-handlebars')


try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}

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
        defaultLayout: 'index', // name of main template
        partialsDir: 'View/', // location of your subtemplates aka. header, footer etc
    },
    viewPath: 'View/',
    extName: '.hbs'
};
smtpTransport.use('compile', hbs(options));







function encryptPassword(text) {
    let key = Buffer.from(propObj.encryptionKey, 'hex')
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

router.post('/addUser', (req, res) => {
    let obj = req.body

    let objectToSend = {}

    let email = obj["email"]
    let password = obj["password"]
 let work_phone_no = obj["work_phone_no"]
    //let password=Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let b_acct_id = obj["b_acct_id"]

    let assignedProductCodes = obj["assigned_products"]

    let enc_passwd = JSON.stringify(encryptPassword(password));

    let sql_adUser = "insert into " + propObj.svayamSystemDbName + ".user_info (work_phone_no,email,password,b_acct_id) values "
        + " ("+work_phone_no+"," + SqlString.escape(email) + "," + SqlString.escape(enc_passwd) + "," + SqlString.escape(b_acct_id) + ")"

    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->userManagement-->user-->addUser--", error1)
            objectToSend["error"] = true

            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->userManagement-->user-->addUser--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_adUser, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->userManagement-->user-->addUser--", error3)
                            objectToSend["error"] = true
                            if (error3.message.includes("Duplicate")) {
                                objectToSend["data"] = "Email is already registered"
                            } else {
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            }
                            res.send(objectToSend);
                            mysqlCon.rollback();
                            mysqlCon.release();

                        } else {
                            let user_id = results3.insertId;

                            let sql_assignProduct = "insert into " + propObj.svayamSystemDbName + ".user_xref_products (user_id,prod_cd) values "

                            for (let i = 0; i < assignedProductCodes.length; i++) {
                                sql_assignProduct += "(" + SqlString.escape(user_id) + "," + SqlString.escape(assignedProductCodes[i]) + ")"

                                if (i < assignedProductCodes.length - 1) {
                                    sql_assignProduct += ","
                                }
                            }

                            mysqlCon.query(sql_assignProduct, function (error4, results4) {
                                if (error4) {
                                    console.log("Error-->routes-->userManagement-->user-->addUser--", error4)
                                    objectToSend["error"] = true
                                    if (error4.message.includes("Duplicate")) {
                                        objectToSend["data"] = "One of the Product is already assigned to this user"
                                    } else {
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    }
                                    res.send(objectToSend);
                                    mysqlCon.rollback();
                                    mysqlCon.release();
                                } else {

                                    let profileImgDir = "./images/user_images/" + user_id

                                    if (!fs.existsSync(profileImgDir)) {
                                        fs.mkdirSync(profileImgDir);
                                    }
                                    let userImgSrc = "./images/default.jpg";
                                    let userImgDest = "./images/user_images/" + user_id + "/" + "img.jpg";

                                    fs.copyFile(userImgSrc, userImgDest, { recursive: true }, (error6) => {
                                        if (error6) {
                                            console.log("Error-->routes-->userManagement-->user-->addUser--", error6);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support"
                                            res.end(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release();

                                        } else {
                                            mysqlCon.commit(function (error5) {
                                                if (error5) {
                                                    console.log("Error-->routes-->userManagement-->user-->addUser--", error5)
                                                    objectToSend["error"] = true
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend);
                                                    mysqlCon.rollback();
                                                    mysqlCon.release();
                                                } else {
                                                    objectToSend["error"] = false
                                                    objectToSend["data"] = "User added successfully"
                                                    res.send(objectToSend);
                                                    mysqlCon.release()
                                                    let smail = {
                                                        from: senderEmail,
                                                        to: email,
                                                        subject: "You are added to the Svayam Portal as a user (Contains sensitive information)",

                                                        text: "Congratulations!! You can now login to Svayam Portal using this email and password-->" + password + ".\n For further queries you can drop us a mail at support@svayamtech.com.\n Happy Financing.",
                                                        template: 'index'
                                                    }



                                                    smtpTransport.sendMail(smail, function (error22, response) {
                                                        if (error22) {
                                                            console.log("Error-->routes-->userManagement-->user-->addUser--", error22);

                                                        } else {
                                                            console.log("Email sent: ", response);

                                                        }
                                                        smtpTransport.close();

                                                    });
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
        }
    })
})


router.get('/getUsersInfo:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = obj["b_acct_id"]
    let admin_uid = obj["user_id"]

    let sql_getUser = "Select ui.work_phone_no,ui.user_id,email,signup_time,is_admin,first_name,last_name,designation,group_concat(ux.prod_cd) as prod_cd from  (Select work_phone_no,user_id,email,signup_time,is_admin,first_name,last_name,designation from " + propObj.svayamSystemDbName + ".user_info where"
        + " b_acct_id=" + SqlString.escape(b_acct_id) + " and user_id !=" + admin_uid + ") ui left join " + propObj.svayamSystemDbName + ".user_xref_products ux on "
        + " ui.user_id=ux.user_id group by ui.work_phone_no,ui.user_id,email,signup_time,is_admin,first_name,last_name,designation"

    mysqlPool.query(sql_getUser, function (error, results) {
        if (error) {
            console.log("Error-->routes-->userManagement-->user-->getUsersInfo--", error)
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

router.put('/updateAssignedProducts', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let user_id = obj["user_id"]

    let assignedProducts = obj["assigned_products"]


    let sql_updateProds = "delete from " + propObj.svayamSystemDbName + ".user_xref_products where user_id=" + SqlString.escape(user_id) + ";"
        + "insert into " + propObj.svayamSystemDbName + ".user_xref_products (user_id,prod_cd) values "


    for (let i = 0; i < assignedProducts.length; i++) {
        sql_updateProds += "(" + SqlString.escape(user_id) + "," + SqlString.escape(assignedProducts[i]) + ")"

        if (i < assignedProducts.length - 1) {
            sql_updateProds += ","
        }
    }

    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->userManagement-->user-->updateAssignedProducts--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(sql_updateProds, function (error2) {
                if (error2) {
                    console.log("Error-->routes-->userManagement-->user-->updateAssignedProducts--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql_updateProds, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->userManagement-->user-->updateAssignedProducts--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error5) {
                                if (error5) {
                                    console.log("Error-->routes-->userManagement-->user-->updateAssignedProducts--", error5)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Updated assigned products successfully"
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

router.delete('/deleteUser:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let user_id = obj["user_id"]
    let b_acct_id = obj["b_acct_id"]

    let sql_deleteUserInfo = "delete from " + propObj.svayamSystemDbName + ".user_info where user_id=" + SqlString.escape(user_id)
    let sql_deleteUserXrefProd = "delete from " + propObj.svayamSystemDbName + ".user_xref_products where user_id=" + SqlString.escape(user_id)
    let sql_deleteUserXrefRole = "delete from svayam_" + b_acct_id + "_md.user_xref_functional_role where user_id=" + SqlString.escape(user_id)

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->userManagement-->user-->deleteUser--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
            
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->userManagement-->user-->deleteUser--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_deleteUserInfo+";"+sql_deleteUserXrefProd+";"+sql_deleteUserXrefRole,function(error3,results3){
                        if(error3){
                            console.log("Error-->routes-->userManagement-->user-->deleteUser--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error4){
                                if(error4){
                                    console.log("Error-->routes-->userManagement-->user-->deleteUser--", error4)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "User deleted sucessfully"
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

router.get('/getAllUsersInfo:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);

    let b_acct_id = obj["b_acct_id"]


    let sql_getUser = "Select * from " + propObj.svayamSystemDbName + ".user_info where"
        + " b_acct_id=" + SqlString.escape(b_acct_id)


    mysqlPool.query(sql_getUser, function (error, results) {
        if (error) {
            console.log("Error-->routes-->userManagement-->user-->getUsersInfo--", error)
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



module.exports = router;
