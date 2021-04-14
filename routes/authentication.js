var express = require('express');
var router = express.Router();
var propObj = require('../config_con.js')
var mysqlPool = require('../connections/mysqlConnection.js');
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
var SqlString = require('sqlstring');
var hbs = require('nodemailer-express-handlebars');
var moment = require('moment')
const fs=require('fs')


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
        defaultLayout: 'otp', // name of main template
        partialsDir: 'View/', // location of your subtemplates aka. header, footer etc
    },
    viewPath: 'View/',
    extName: '.hbs'
};
smtpTransport.use('compile', hbs(options));

router.get('/getComponentInfo:dtls',(req,res)=>{
    let objectToSend={}

    let obj = JSON.parse(req.params.dtls)
    let user_id = obj['user_id']
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql="SELECT DISTINCT p.role_cd,p.res_cd FROM "+db+".role_xref_resource AS p JOIN  (SELECT * from "+propObj.svayamSystemDbName+".user_xref_role WHERE user_id="+user_id+") AS q ON q.role_cd=p.role_cd "

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->authentication-->getComponentInfo", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
})


router.get('/getUserAccessComponentInfo:dtls',(req,res)=>{
    let objectToSend={}

    let user_id=SqlString.escape(req.params.dtls)

    let sql="SELECT DISTINCT p.role_cd,p.res_cd FROM "+propObj.svayamSystemDbName+".role_xref_resource AS p JOIN  (SELECT * from "+propObj.svayamSystemDbName+".user_xref_role WHERE user_id="+user_id+") AS q ON q.role_cd=p.role_cd "

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->authentication-->getUserAccessComponentInfo", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
})


router.post('/signup', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let email=SqlString.escape(obj["email"])

    let phone_no=SqlString.escape(obj["phone_no"])
    let password=SqlString.escape(obj["password"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

 

    let sql_createAccount="insert into "+propObj.svayamSystemDbName+".billing_account (create_timestamp) values "
                    +"("+create_timestamp+")"

   
    mysqlPool.getConnection(function(error1,mysqlCon){
        if(error1){
            console.log("Error-->routes-->authentication-->signup", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            mysqlCon.beginTransaction(function(error2){
                if(error2){
                    console.log("Error-->routes-->authentication-->signup", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();

                }else{
                    mysqlCon.query(sql_createAccount,function(error3,results3){
                        if(error3){
                            console.log("Error-->routes-->authentication-->signup", error3)
                            objectToSend["error"] = true
                         
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback();
                            mysqlCon.release();
                        }else{
                            let b_acct_id=results3.insertId
                            let sql_createUser="insert into "+propObj.svayamSystemDbName+".user_info (b_acct_id,email,phone_no,password) values"
                            +" ("+b_acct_id+","+email+","+phone_no+","+password+")"
                            mysqlCon.query(sql_createUser,function(error4,results4){
                                if(error4){
                                    console.log("Error-->routes-->authentication-->signup", error4)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                }else{
                                    let user_id=results4.insertId

                                    let createDbQuery = "create database svayam_"+b_acct_id+"_ebill"

                                    let manualRollBack =" drop database if exists svayam_"+b_acct_id+"_ebill"
                                
                                  
                                    let new_db="svayam_"+b_acct_id+"_ebill"
                                        let createTableQueries = []

                                        let tablesToCreate = propObj.productTables['svayam_ebill']
                                        for (let j = 0; j < tablesToCreate.length; j++) {

                                            let tempQuery = "create table " + new_db + "." + tablesToCreate[j] + " like " + propObj.svayamMetadataSample+ "." + tablesToCreate[j]
                                
                                            createTableQueries.push(tempQuery)
                                        }
                                         let copyTableQueries = []

                                        let tablesToCopy = propObj.productTables['copy_svayam_ebill']
                                        for (let j = 0; j < tablesToCopy.length; j++) {

                                            let tempQuery = "insert into " + new_db + "." + tablesToCopy[j] + " Select * From " + propObj.svayamMetadataSample+ "." + tablesToCopy[j]

                                            copyTableQueries.push(tempQuery)
                                        }


                                    let sql_inserRoleXref="insert into "+propObj.svayamSystemDbName+".user_xref_role (user_id,role_cd) values"
                                            +"("+user_id+",'ADMIN')"

                                    mysqlCon.query(sql_inserRoleXref+";"+manualRollBack+";"+createDbQuery+";"+createTableQueries.join(";")+";"+copyTableQueries.join(";"),function(error5,results5){
                                        if(error5){
                                            console.log("Error-->routes-->authentication-->signup", error5)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                          
                                            res.send(objectToSend);
                                            mysqlCon.rollback()
                                            mysqlCon.release();
                                        }else{

                                            let profileImgDir = "./images/user_images/" + user_id
                                            let acctImgDir = "./images/account_images/" + b_acct_id;

                                            if (!fs.existsSync(profileImgDir)) {
                                                fs.mkdirSync(profileImgDir);
                                            }
                                            if (!fs.existsSync(acctImgDir)) {
                                                fs.mkdirSync(acctImgDir);
                                            }

                                            let userImgSrc = "./images/default.jpg";
                                            let userImgDest = "./images/user_images/" + user_id + "/" + "img.jpg";


                                            let acctImgSource = "./images/default_account.jpg";
                                            let acctImgeDest = "./images/account_images/" + b_acct_id + "/" + "img.jpg";

                                            fs.copyFile(userImgSrc, userImgDest, { recursive: true }, (error6) => {
                                                if (error6) {
                                                    console.log("Error routes-->authentication-->signup--", error6);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support"
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release();

                                                } else {
                                                    fs.copyFile(acctImgSource, acctImgeDest, { recursive: true }, (error7) => {
                                                        if (error7) {
                                                            console.log("Error routes-->authentication-->signup--", error7);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release();

                                                        }else{
                                                            mysqlCon.commit(function(error8){
                                                                if(error8){
                                                                    console.log("Error-->routes-->authentication-->signup", error8)
                                                                    objectToSend["error"] = true
                                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                
                                                                    res.send(objectToSend); 
                                                                    mysqlCon.rollback()
                                                                    mysqlCon.release();
                                                                }else{
                                                                    objectToSend["error"] = false
                                                                    objectToSend["data"] = "Signed up successfully"
                                                                    res.send(objectToSend); 
                                                                    mysqlCon.release();

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


router.get('/manualloginwithotp:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)

    let phone_no=SqlString.escape(obj["phone_no"])
    let passwd=obj["password"]

    let sql_getUserInfo = "Select * from "+propObj.svayamSystemDbName+".user_info where phone_no="+phone_no

    mysqlPool.query(sql_getUserInfo, function (error, results) {
        if (error) {
            console.log("Error-->routes-->authentication-->manuallogin--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else if (results.length == 0) {
            objectToSend["error"] = true;
            objectToSend["data"] = "This user id is either not registered or some different option of signup is used."
            res.send(objectToSend)

        } else {
                objectToSend["error"] = false;
                objectToSend["data"] = results
                res.send(objectToSend)
            
        }
    })
})


router.get('/manuallogin:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)

    let email=SqlString.escape(obj["email"])
    let passwd=obj["password"]

    let sql_getUserInfo = "Select * from "+propObj.svayamSystemDbName+".user_info where email="+email

    mysqlPool.query(sql_getUserInfo, function (error, results) {
        if (error) {
            console.log("Error-->routes-->authentication-->manuallogin--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else if (results.length == 0) {
            objectToSend["error"] = true;
            objectToSend["data"] = "This user id is either not registered or some different option of signup is used."
            res.send(objectToSend)

        } else {
            let origPassword = results[0]["password"]
            if (origPassword != passwd) {
                objectToSend["error"] = true;
                objectToSend["data"] = "Wrong Password."
                res.send(objectToSend)
            } else {

                for(let i=0;i<results.length;i++){
                    delete results[i]["password"]
                }
                
                objectToSend["error"] = false;
                objectToSend["data"] = results
                res.send(objectToSend)
            }
        }
    })
})

router.put('/changePassword',(req,res)=>{

    let objectToSend={}

    let obj=req.body

    let user_id=SqlString.escape(obj["user_id"])
    let oldPass=obj["old_password"]
  

    let sql_fetch="select * from "+propObj.svayamSystemDbName+".user_info where user_id="+user_id

    let sql_update="update "+propObj.svayamSystemDbName+".user_info set password="+SqlString.escape(obj["new_password"])+" where user_id="+user_id
   
    mysqlPool.query(sql_fetch,function(error,results){
        if(error){
            console.log("Error-->routes-->authentication-->changePassword---", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{

            if(oldPass==results[0]['password']){
                mysqlPool.query(sql_update,function(error,results){
                    if(error){
                        console.log("Error-->routes-->authentication-->changePassword---", error);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                        res.send(objectToSend)
                    }else{
            
                      
                        objectToSend["error"] = false;
                        objectToSend["data"] = "Password Changed Successfully!"
                        res.send(objectToSend)
                    }
                })
            }else{
                console.log("Error-->routes-->authentication-->changePassword---", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "The old password you have entered is incorrect!"
                res.send(objectToSend)
            }
           
        }
    })
    
})

router.get('/sociallogin:dtls', (req, res) => {
            let objectToSend = {}
            let obj = JSON.parse(req.params.dtls)
        
            let email=SqlString.escape(obj["email"])
           
       console.log(obj) 
            let sql_getUserInfo = "Select * from "+propObj.svayamSystemDbName+".user_info where email="+email
        
            mysqlPool.query(sql_getUserInfo, function (error, results) {
                if (error) {
                    console.log("Error-->routes-->authentication-->sociallogin--", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else if (results.length == 0) {
                    objectToSend["error"] = true;
                    objectToSend["data"] = "This user id is either not registered or some different option of signup is used."
                    res.send(objectToSend)
        
                } else {
                    
        console.log(results)
                        objectToSend["error"] = false;
                        objectToSend["data"] = results
                        res.send(objectToSend)
                    
                }
            })
        })


// router.post('/sendOtp', function (req, res) {

//     var obj = req.body;

//     var recieverEmail = obj['email']
//     var objectToSend = {};

//     var smail = {
//         from: senderEmail,
//         to: recieverEmail,
//         subject: "Sensitive Information",
//         attachments: [{
//             filename: 'img.jpg',
//             path: 'View/img.jpg',
//             cid: 'unique@cid'
//         }],
//         template: "otp",
//         context: {
//             otp: obj['otp']

//         }
//     }



//     smtpTransport.sendMail(smail, function (error22, response) {
//         if (error22) {
//             console.log("Error routes-->authentication-->sendOtp--", error22);
//             objectToSend["error"] = true;
//             objectToSend["data"] = "Can't process yor request right now.Please try again later"
//             res.send(objectToSend)
//         } else {
//             console.log("Email sent: ", response);
//             objectToSend["error"] = false;
//             objectToSend["data"] = "OTP sent successfully!"
//             res.send(objectToSend)
//         }
//         smtpTransport.close();

//     });


// });

// router.post('/otpVerified',(req,res)=>{
//     let objectToSend={}

//     let obj=req.body

//     let id=obj["id"]

//     let verified=obj["verified"]

//     if(verified){

//         let sql="update "+propObj.svayamSystemDbName+".user_info set is_verified=1 where id="+id

//         mysqlPool.query(sql,function(error,results){
//             if(error){
//                 console.log("Error-->routes-->authentication-->otpVerified--", error)
//                 objectToSend["error"] = true
//                 objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
//                 res.send(objectToSend);
//             }else{
//                 objectToSend["error"] = false
//                 objectToSend["data"] = "Verification successful"
//                 res.send(objectToSend);
//             }
//         })
//     }
// })








module.exports = router;
