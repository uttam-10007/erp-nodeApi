var express = require('express');
var router = express.Router();
var propObj = require('../../config_con.js')
var mysqlPool = require('../../connections/mysqlConnection.js');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
var SqlString = require('sqlstring');

function decryptPassword(text) {
    let key = Buffer.from(propObj.encryptionKey, 'hex')
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString().trim();
}


router.post('/login', (req, res) => {
    let objectToSend = {}
    let input = req.body
    let email = input["email"]
    let passwd = input["password"]

    let sql_getUserInfo = "Select ui.*,ux.prod_cd from (Select * from " + propObj.svayamSystemDbName + ".user_info where email=" + SqlString.escape(email) + " or work_phone_no =" + SqlString.escape(email) +" ) ui"
        + " left join " + propObj.svayamSystemDbName + ".user_xref_products ux on ui.user_id=ux.user_id"


    mysqlPool.query(sql_getUserInfo, function (error, results) {
        if (error) {
            console.log("Error-->routes-->portal-->login-->login--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else if (results.length == 0) {
            objectToSend["error"] = true;
            objectToSend["data"] = "This email is not registered."
            res.send(objectToSend)

        } else {
            let origPassword = decryptPassword(JSON.parse(results[0]["password"]))
            if (origPassword != passwd) {
                objectToSend["error"] = true;
                objectToSend["data"] = "Wrong Password."
                res.send(objectToSend)
            } else {
                let tempObj = {}
                tempObj["b_acct_id"] = results[0]["b_acct_id"]
                tempObj["user_id"] = results[0]["user_id"]
                tempObj["is_admin"]=results[0]["is_admin"]
                tempObj["assigned_product_cd"] = []
                for (let i = 0; i < results.length; i++) {
                    if (results[i]["prod_cd"] != null) {
                        tempObj["assigned_product_cd"].push(results[i]["prod_cd"])
                    }
                }
                let sql_getProducts="Select * from "+propObj.svayamSystemDbName+".svayam_products"

                mysqlPool.query(sql_getProducts,function(error3,results3){
                    if(error3){
                        console.log("Error-->routes-->portal-->login-->login--", error3)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                    }else{
                        tempObj["active_product_cd"]=results3

                        objectToSend["error"] = false;
                        objectToSend["data"] = tempObj
                        res.send(objectToSend)
                    }
                })

                
            }
        }
    })
})


router.post('/forgotPassword', function (req, res) {
    let userInfo = req.body;
    let objectToSend = {};

    mysqlPool.query("select email_id,password from " + propObj.svayamSystemDbName + ".user_info where email='" + userInfo.email + "'", function (error, results) {
        let password;
        let recieverEmail;


        if (error) {
            console.log("Error routes-->portal-->login-->sendUserPassword", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Can't process yor request right now.Please try again later"
            res.end(JSON.stringify(objectToSend))
        } else if (results.length == 0) {
            objectToSend["error"] = true;
            objectToSend["data"] = "No account with this email is present"
            res.end(JSON.stringify(objectToSend))


        } else {



            password = decryptPassword(JSON.parse(results[0]["password"]))
            recieverEmail = results[0]["email"]

            let Transport = mailer.createTransport({
                service: "Gmail",
                auth: {
                    user: senderEmail,
                    pass: propObj.senderPass
                }
            });
            let options1 = {
                viewEngine: {
                    extname: '.hbs', // handlebars extension
                    layoutsDir: 'View/', // location of handlebars templates
                    defaultLayout: 'forgetpass', // name of main template
                    partialsDir: 'View/', // location of your subtemplates aka. header, footer etc
                },
                viewPath: 'View/',
                extName: '.hbs'
            };
            Transport.use('compile', hbs(options1));


            let smail = {
                from: senderEmail,
                to: recieverEmail,
                subject: "Sensitive Information",
                attachments: [{
                    filename: 'img.jpg',
                    path: 'View/img.jpg',
                    cid: 'unique@cid'
                }],
                template: "forgetpass",
                context: {
                    passw: password

                }
            }

            Transport.sendMail(smail, function (error2, info) {
                if (error2) {

                    console.log("Error routes-->portal-->login-->sendUserPassword", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Can't process yor request right now.Please try again later"
                    res.end(JSON.stringify(objectToSend))
                } else {

                    objectToSend["error"] = false;
                    objectToSend["data"] = "Password sent to your registered email"
                    res.end(JSON.stringify(objectToSend))


                }
                smtpTransport.close();


            });

        }

    });


});
router.get('/getDataFromMobileNumberOrEmail:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);
    let b_acct_id = obj.b_acct_id;
    let key = obj.key;


    let sql = "Select ep.*,es.* from svayam_" + b_acct_id
        + "_hr.emp_personal_info ep join  (Select *,rank() over(partition by emp_id order by effective_timestamp desc) as svm_rank from svayam_"
        + b_acct_id + "_hr.establishment_info ) es on es.emp_id = ep.emp_id where ( ep.emp_phone_no='" + key + "' or ep.emp_email='"+key+"') AND svm_rank=1 "

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error routes-->portal-->login-->getDataFromMobileNumber--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side Error. Can't fetch account info at the moment "
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })


});
router.post('/loginWithPhoneNumber', (req, res) => {
    let objectToSend = {}
    let input = req.body
    let work_phone_no = input["work_phone_no"]

    let sql_getUserInfo = "Select ui.*,ux.prod_cd from (Select * from " + propObj.svayamSystemDbName + ".user_info where  work_phone_no =" + SqlString.escape(work_phone_no) + " ) ui" +
        " left join " + propObj.svayamSystemDbName + ".user_xref_products ux on ui.user_id=ux.user_id"
console.log(sql_getUserInfo);

    mysqlPool.query(sql_getUserInfo, function(error, results) {
        if (error) {
            console.log("Error-->routes-->portal-->login-->loginWithPhoneNumber--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else if (results.length == 0) {
            objectToSend["error"] = true;
            objectToSend["data"] = "This work_phone_no is not registered."
            res.send(objectToSend)

        } else {
            let origPassword = decryptPassword(JSON.parse(results[0]["password"]))

            let tempObj = {}
            tempObj["b_acct_id"] = results[0]["b_acct_id"]
            tempObj["user_id"] = results[0]["user_id"]
            tempObj["is_admin"] = results[0]["is_admin"]
            tempObj["assigned_product_cd"] = []


            for (let i = 0; i < results.length; i++) {
                if (results[i]["prod_cd"] != null) {
                    tempObj["assigned_product_cd"].push(results[i]["prod_cd"])
                }
}

                let sql_getProducts = "Select * from " + propObj.svayamSystemDbName + ".svayam_products"

                mysqlPool.query(sql_getProducts, function(error3, results3) {

                    if (error3) {
                        console.log("Error-->routes-->portal-->login-->login--", error3)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                    } else {
                        tempObj["active_product_cd"] = results3

                        objectToSend["error"] = false;
                        objectToSend["data"] = tempObj
                        res.send(objectToSend)
                    }
                })

            }

    })
})

module.exports = router;
