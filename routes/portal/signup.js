var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var hbs = require('nodemailer-express-handlebars')
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);
var SqlString = require('sqlstring');


const fs = require('fs');

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


router.post('/signup', function (req, res) {

    let input = req.body;

    let email = input["email"]
    let password = input["password"].trim();

    let objectToSend = {}

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->portal-->signup-->signUp--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->portal-->signup-->signUp--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    let sql_insertAdmin = "insert into " + propObj.svayamSystemDbName + ".billing_account_info (email) values (" + SqlString.escape(email) + ")"

                    mysqlCon.query(sql_insertAdmin, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->portal-->signup-->signUp--", error2)
                            objectToSend["error"] = true
                            if (error2.message.includes("Duplicate")) {
                                objectToSend["data"] = "Email is already registered"
                            } else {
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            }

                            res.send(objectToSend);
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let b_acct_id = results2.insertId;
                            let passwd = JSON.stringify(encryptPassword(password));
                            let sql_insertUser = "insert into " + propObj.svayamSystemDbName + ".user_info (email,password,b_acct_id,is_admin) values "
                                + " (" + SqlString.escape(email) + "," + SqlString.escape(passwd) + "," + SqlString.escape(b_acct_id) + "," + "1" + ")"

                            mysqlCon.query(sql_insertUser, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->portal-->signup-->signUp--", error3)
                                    objectToSend["error"] = true
                                    if (error3.message.includes("Duplicate")) {
                                        objectToSend["data"] = "Email is already registered as a member of someone else's billing account"
                                    } else {
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    }

                                    res.send(objectToSend);
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    let user_id = results3.insertId
                                    let acct_id = b_acct_id
                                    let profileImgDir = "./images/user_images/" + user_id
                                    let acctImgDir = "./images/account_images/" + acct_id;

                                    if (!fs.existsSync(profileImgDir)) {
                                        fs.mkdirSync(profileImgDir);
                                    }
                                    if (!fs.existsSync(acctImgDir)) {
                                        fs.mkdirSync(acctImgDir);
                                    }

                                    let userImgSrc = "./images/default.jpg";
                                    let userImgDest = "./images/user_images/" + user_id + "/" + "img.jpg";


                                    let acctImgSource = "./images/default_account.jpg";
                                    let acctImgeDest = "./images/account_images/" + acct_id + "/" + "img.jpg";

                                    fs.copyFile(userImgSrc, userImgDest, { recursive: true }, (error6) => {
                                        if (error6) {
                                            console.log("Error routes-->signup-->signup--", error6);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support"
                                            res.end(JSON.stringify(objectToSend))
                                            mysqlCon.rollback();
                                            mysqlCon.release();

                                        } else {
                                            fs.copyFile(acctImgSource, acctImgeDest, { recursive: true }, (error7) => {
                                                if (error7) {
                                                    console.log("Error routes-->signup-->signup--", error7);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.end(JSON.stringify(objectToSend))
                                                    mysqlCon.rollback();
                                                    mysqlCon.release();

                                                } else {
                                                    let sql_createDb = "create database svayam_" + acct_id + "_md"


                                                    mysqlCon.query(sql_createDb, function (error8, results8) {
                                                        if (error8) {
                                                            console.log("Error-->routes-->portal-->signup-->signUp--", error8)
                                                            objectToSend["error"] = true
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                            res.send(objectToSend);
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            let sql_insertDefProds="insert into "+propObj.svayamSystemDbName+".user_xref_products (prod_cd,user_id) values "
                                                                            +"('MDR','"+user_id+"')"
                                                            let md_db = "svayam_" + b_acct_id + "_md"
                                                            let tablesToCopy=propObj.productTables[propObj.svayamMetadataSample]
                                                            let sql_createTableAndCopyData="";

                                                            for(let i=0;i<tablesToCopy.length;i++){
                                                                sql_createTableAndCopyData+="create table "+md_db+"."+tablesToCopy[i]+" like "+propObj.svayamMetadataSample+"."+tablesToCopy[i]+";"
                                                                
                                                            }
                                                            
                                                            sql_createTableAndCopyData+="insert into "+md_db+".datatype_info Select * from "+propObj.svayamMetadataSample+".datatype_info;"
                                                            sql_createTableAndCopyData+="insert into "+md_db+".domain_info Select * from "+propObj.svayamMetadataSample+".domain_info where domain_code ='MDR';"
                                                            sql_createTableAndCopyData+="insert into "+md_db+".record_info Select * from "+propObj.svayamMetadataSample+".record_info where reference_data_type='code_value';"
                                                            sql_createTableAndCopyData+="insert into "+md_db+".record_xref_field Select * from "+propObj.svayamMetadataSample+".record_xref_field where record_code in (Select record_code from "+propObj.svayamMetadataSample+".record_info where reference_data_type='code_value');"
                                                            sql_createTableAndCopyData+="insert into "+md_db+".field_info Select * from "+propObj.svayamMetadataSample+".field_info;"
                                                            sql_createTableAndCopyData+="insert into " + md_db + ".functional_resources Select * from "+propObj.svayamMetadataSample+".functional_resources;"
                                                            sql_createTableAndCopyData+="insert into "+md_db+".process_info Select * from "+propObj.svayamMetadataSample+".process_info;"
                                                            sql_createTableAndCopyData+="insert into "+md_db+".svayam_code_value Select * from "+propObj.svayamMetadataSample+".svayam_code_value"
 
                                                            mysqlCon.query(sql_createTableAndCopyData, function (error9, results9) {
                                                                if (error9) {
                                                                    console.log("Error-->routes-->portal-->signup-->signUp--creating tables", error9)

                                                                    let sql_manualRollBack = "delete from " + propObj.svayamSystemDbName + ".billing_account_info where b_acct_id=" + b_acct_id + ";delete from " + propObj.svayamSystemDbName + ".user_info where user_id=" + user_id + ";drop database if exists " + md_db

                                                                    sql_manualRollBack="delete from "+propObj.svayamSystemDbName+".user_xref_products where user_id="+user_id+";"+sql_manualRollBack
                                                                    mysqlCon.query(sql_manualRollBack, function (error11, results11) {
                                                                        if (error11) {
                                                                            console.log("Error-->routes-->portal-->signup-->signUp--creating tables", error11)
                                                                            objectToSend["error"] = true
                                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                            res.send(objectToSend);
                                                                        } else {
                                                                            objectToSend["error"] = true
                                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                            res.send(objectToSend);
                                                                        }
                                                                    })
                                                                } else {
                                                                    objectToSend["error"] = false;
                                                                    objectToSend["data"] = "Signed up successfully"
                                                                    res.send(objectToSend);
                                                                    mysqlCon.release();
                                                                    let smail = {
                                                                        from: senderEmail,
                                                                        to: email,
                                                                        subject: "Thank you for regsitering wth us",
                                                                        attachments: [{
                                                                            filename: 'img.jpg',
                                                                            path: 'View/img.jpg',
                                                                            cid: 'unique@cid'
                                                                        }],
                                                                        text: "Congratulations!! You have successfully created your FPEM account.\n For further queries you can drop us a mail at support@svayamtech.com.\n Happy Financing.",
                                                                        template: 'index'
                                                                    }



                                                                    smtpTransport.sendMail(smail, function (error22, response) {
                                                                        if (error22) {
                                                                            console.log("Error routes-->signup-->signup--", error22);

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
                }
            })
        }
    })

})


function executeInHive(query, callback) {

    hiveDbCon.reserve(async function (err4, connObj) {
        if (err4) {

            return callback(err4)

        } else {

            var conn = connObj.conn;

            conn.createStatement(function (err, statement) {
                if (err) {
                    hiveDbCon.release(connObj, function (err) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("Hive conn released")
                        }
                    })
                    callback(err)

                } else {
                    statement.executeUpdate(query, function (err1, count) {
                        if (err1) {
                            hiveDbCon.release(connObj, function (err4) {
                                if (err4) {
                                    console.log(err.message);
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            callback(err)

                        } else {
                            hiveDbCon.release(connObj, function (err) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            callback(null)
                        }
                    })




                }
            })

        }
    })

}




module.exports = router;
