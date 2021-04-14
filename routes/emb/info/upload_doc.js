var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->info-->upload_doc--", ex)
}
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


router.post('/uploadDoc:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    if (req.file != undefined) {
        console.log("Error-->routes-->info-->upload_doc--uploadDoc--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        
        
        let b_acct_id = obj.b_acct_id;
        let db = "svayam_" + b_acct_id + "_ebill"; 
        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->info-->upload_doc--uploadDoc--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->info-->upload_doc--uploadDoc--", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {

                        



                        let query = "insert into  " + db + ".upload_doc (remark,doc_type,doc_name,doc_local_no,related_to,work_id,create_user_id,create_timestamp) values"
                                    +"("+SqlString.escape(obj.remark)+","+SqlString.escape(obj.doc_type)+","+SqlString.escape(obj.doc_name)+","+SqlString.escape(obj.doc_local_no)+","
                                    +SqlString.escape(obj.related_to)+","+SqlString.escape(obj.work_id)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"


                        mysqlCon.query(query, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->info-->upload_doc--uploadDoc--", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                let upload_id=results2.insertId
                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->info-->upload_doc--uploadDoc--", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {


                                        try {
                                            let doc_name=obj.doc_name
                                            //cp xyz routes/property/upload/broucher
                                            var localFile = './uploads/' +doc_name;
                                            if (!fs.existsSync("./documents/"+b_acct_id+"/"+obj.work_id)) {
                                                if (!fs.existsSync("./documents/"+b_acct_id )) {
                                                fs.mkdirSync("./documents/"+b_acct_id );
                                                }
                                                fs.mkdirSync("./documents/"+b_acct_id+"/"+obj.work_id);
                                            }
                                            var copyLoc = "./documents/"+b_acct_id+"/"+obj.work_id+"/" + doc_name+ "_" + upload_id;
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->info-->upload_doc--uploadDoc--", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("124 Error-->routes-->info-->upload_doc--uploadDoc--", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = upload_id;
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->info-->upload_doc--uploadDoc--", ex);
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


router.get('/getDocInfo:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT remark,id,doc_type,doc_name,doc_local_no,related_to,work_id,create_user_id,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,"
    + "update_user_id,create_user_id,DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp,"
    + "update_user_id from " + db + ".upload_doc where work_id="+SqlString.escape(obj.work_id)
  
    if(obj.related_to!=undefined){
        sql_fetchCurr +=" and related_to ='"+obj.related_to+"'"
    }

    if(obj.doc_type.length!=0){
        sql_fetchCurr +=" and doc_type in ('"+obj.doc_type.join("','")+"')"
    }

       

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->upload_doc-->getDocInfo--", error)
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


router.delete('/deleteDocInfo:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql = "delete from " + db + ".upload_doc where id="+SqlString.escape(obj.id)

       

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->upload_doc-->deleteDocInfo--", error)
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





router.post('/updateuploadDoc:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};

    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    if (req.file != undefined) {
        console.log("Error-->routes-->info-->upload_doc--uploadDoc--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        
        
        let b_acct_id = obj.b_acct_id;
        let db = "svayam_" + b_acct_id + "_ebill"; 
        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->info-->upload_doc--uploadDoc--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->info-->upload_doc--uploadDoc--", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {

                        

                        let upload_id=obj.id


                        let query = "update  " + db + ".upload_doc set doc_name="+SqlString.escape(obj.doc_name)+",remark="+SqlString.escape(obj.remark)
                            +",update_user_id="+SqlString.escape(obj.update_user_id)+",update_timestamp="+update_timestamp+" where id="+upload_id


                        mysqlCon.query(query, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->info-->upload_doc--uploadDoc--", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->info-->upload_doc--uploadDoc--", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {


                                        try {
                                            let doc_name=obj.doc_name
                                            //cp xyz routes/property/upload/broucher
                                            var localFile = './uploads/' +doc_name;
                                            if (!fs.existsSync("./documents/"+b_acct_id+"/"+obj.work_id)) {
                                                if (!fs.existsSync("./documents/"+b_acct_id )) {
                                                fs.mkdirSync("./documents/"+b_acct_id );
                                                }
                                                fs.mkdirSync("./documents/"+b_acct_id+"/"+obj.work_id);
                                            }
                                            var copyLoc = "./documents/"+b_acct_id+"/"+obj.work_id+"/" + doc_name+ "_" + upload_id;
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->info-->upload_doc--uploadDoc--", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("124 Error-->routes-->info-->upload_doc--uploadDoc--", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] ="Updated Successfully";
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->info-->upload_doc--uploadDoc--", ex);
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




router.post('/viewDoc', function (req, res) {

    let obj = req.body;
   
    let objectToSend = {};
    try {
        fs.readFile("./documents/"+obj.b_acct_id+"/"+obj.work_id+"/" + obj.doc_name+ "_" + obj.id, function (err, content) {
            if (err) {
                console.log("Error routes-->info-->upload_doc--->viewDoc--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch document at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes-->info-->upload_doc--->viewDoc--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch document at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});



















module.exports = router;
