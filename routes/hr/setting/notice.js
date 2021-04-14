var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')
var multer = require('multer');
const fs = require('fs');


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {

        callback(null, file.originalname);
    }
});

let upload = multer({ storage: storage }).single('file');

router.post('/insertnotice:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->hr-->setting-->notice--insertnotice--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let document_name = obj.document_name;
        let emp_id = obj.emp_id;

        let document_type_code = obj.document_type_code;
        let b_acct_id = obj.b_acct_id;
        let create_user_id = SqlString.escape(obj["create_user_id"])
        let create_timestamp = (moment().format('YYYY-MM-DD HH:mm:ss'))
        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->hr-->setting-->notice--insertnotice", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->hr-->setting-->notice-insertnotice", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {

                        let insertSql = "insert into svayam_" + b_acct_id + "_hr.upload_document (emp_id,document_name,document_type_code,create_user_id,create_timestamp) values "
                            + "(" + SqlString.escape(emp_id) + ","+ SqlString.escape(document_name) + "," + SqlString.escape(document_type_code) + ","
                            + create_user_id + "," + SqlString.escape(create_timestamp) + ")"
                            mysqlCon.query(insertSql, function (error2, results2) {
                                if (error2) {
                                    console.log("Error-->routes-->hr-->setting-->notice-insertnotice", error2);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
let upload_id=results2.insertId;
                                    let insertSql = "insert into svayam_" + b_acct_id + "_hr.notice (description,subject,upload_id) values "
                                + "(" + SqlString.escape(obj.description) + "," + SqlString.escape(obj.subject) + ","
                                + SqlString.escape(upload_id) + ")"
                                mysqlCon.query(insertSql, function (error3, results3) {
                                    if (error3) {
                                        console.log("Error-->routes-->hr-->setting-->notice-insertnotice", error2);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                    
                                    
                                    upload(req, res, function (err) {
                                        if (err) {
                                            console.log("Error-->routes-->hr-->setting-->notice-insertnotice", err);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
    
    
                                            try {
    
                                                var localFile = './uploads/' + document_name;
                                                if (!fs.existsSync("./uploads/upload_hr_file")) {
                                                    fs.mkdirSync("./uploads/upload_hr_file");
                                                }
                                                var copyLoc = "./uploads/upload_hr_file/" + document_name + "_" + b_acct_id + "_" + upload_id;
                                                fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                    if (err1) {
                                                        console.log("Error-->routes-->hr-->setting-->notice-insertnotice", err1);
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                        res.send(objectToSend)
                                                        mysqlCon.rollback();
                                                        mysqlCon.release()
    
                                                    } else {
    
                                                        mysqlCon.commit(function (error3) {
                                                            if (error3) {                                                                            
                                                            console.log("124 Error-->hr-->setting-->notice-insertnotice", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = "File upload successfully! Upload Id:"+upload_id;
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->hr-->emtalisment_info-->uploadFile-", ex);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                            res.send(objectToSend)
                                        }

                                    }

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
});


router.post('/getUploadedFileData', function (req, res) {

    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let upload_id = obj.upload_id;
    let filename = obj.filename;
    let objectToSend = {};
    try {
        console.log("./uploads/upload_hr_file/" + filename + "_"+b_acct_id+"_"+upload_id);
        fs.readFile("./uploads/upload_hr_file/"+filename + "_"+b_acct_id+"_"+upload_id , function (err, content) {
            if (err) {
                console.log("Error routes-->hr--> setting-->notice  -->getUploadedFileData--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes-->hr-->setting-->notice-->getUploadedFileData--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});

router.get('/getuploadednotice:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT ni.id,ni.description,ni.subject,ni.upload_id,ud.document_name,ud.document_type_code from (select * from svayam_"+b_acct_id+"_hr.notice ) ni join (select * from svayam_"+b_acct_id+"_hr.upload_document where document_type_code = 'NOTICE') ud on ud.id = ni.upload_id ";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->settings-->approval-->getuploadednotice--", error)
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



router.put('/updatenotice',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let description=obj["description"]
    let subject=obj["subject"]
    let id=obj["id"]
    
    let upload_id=SqlString.escape(obj["upload_id"])
    


    let sql="update svayam_"+b_acct_id+"_hr.notice set description="+SqlString.escape(description)+","
            +"subject="+SqlString.escape(subject)+",upload_id="+upload_id
            +" where id="+SqlString.escape(id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->notice-->updatenotice", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " Updated successfully"
            res.send(objectToSend);
        }
    })
})


router.delete('/deletenotice:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_hr.notice where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->notice-->deletenotice", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully" 
            res.send(objectToSend);
        }
    })

})








module.exports=router;
