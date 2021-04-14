var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);
const fs = require('fs');
var hbs = require('nodemailer-express-handlebars')
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




router.get('/getMaxEmployeeId:dtls', (req, res) => {
    let objectToSend = {}

    let b_acct_id = req.params.dtls

    

    let sql = "Select max(emp_id) as emp_id from svayam_" + b_acct_id + "_hr.emp_personal_info "

    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->establishment_info-->joining-->getMaxEmployeeId", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later.If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
})




router.post('/addJoining', (req, res) => {
    let objectToSend = {}
    let obj = req.body;

    let b_acct_id = obj["b_acct_id"]

    let emp_name = SqlString.escape(obj["emp_name"])
    let emp_email = SqlString.escape(obj["emp_email"])
    let emp_phone_no = SqlString.escape(obj["emp_phone_no"])
    let emp_father_name = SqlString.escape(obj["emp_father_name"])
    let emp_dob = SqlString.escape(obj["emp_dob"])
    let joining_order_id = SqlString.escape(obj["joining_order_id"])
    let joining_date = SqlString.escape(obj["joining_date"])
    let joining_type_code = SqlString.escape(obj["joining_type_code"])
    let joining_service_date = SqlString.escape(obj["joining_service_date"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let emp_status_code = SqlString.escape(obj["emp_status_code"])
    let emp_sex = SqlString.escape(obj["emp_sex"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
 let emp_id =SqlString.escape(obj["emp_id"])
 let joining_time =SqlString.escape(obj["joining_time"])
 
    //let password = SqlString.escape(JSON.stringify(encryptPassword("123456")))

    let db = "svayam_"+b_acct_id+"_hr"

    let sql_insertemp = "insert into " + db + ".emp_personal_info (emp_id,emp_name,emp_email,emp_phone_no,emp_dob,emp_father_name,create_user_id,create_timestamp,emp_sex) values"
        + "(" +emp_id+","+ emp_name + "," + emp_email + "," + emp_phone_no + "," + emp_dob + "," + emp_father_name + "," + create_user_id + "," + create_timestamp + "," + emp_sex + ") "

    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->hr-->joining-->joining-->addJoining--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->hr-->joining-->joining-->addJoining-", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insertemp, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->hr-->joining-->joining-->addJoining-", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        } else {

                         
                            let estb_sql = "insert into " + db + ".establishment_info (emp_id,emp_name,emp_status_code,order_id,joining_date,joining_type_code,joining_service_date,create_user_id,create_timestamp,joining_time) values"
                                + "(" + emp_id + "," + emp_name + "," + emp_status_code + "," + joining_order_id + "," + joining_date + "," + joining_type_code + "," + joining_service_date + "," + create_user_id + "," + create_timestamp + ","+joining_time+")"


                            mysqlCon.query(estb_sql, function (error31, results31) {
                                if (error31) {
                                    console.log("Error-->routes-->hr-->joining-->joining-->addJoining-", error31)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                } else {



                                    mysqlCon.commit(function (error5) {
                                        if (error5) {
                                            console.log("Error-->routes-->hr-->joining-->joining-->addJoining-", error5)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release();
                                        } else {
                                            objectToSend["error"] = false
                                            objectToSend["data"] = emp_id
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
        }
    })

})



module.exports = router;
