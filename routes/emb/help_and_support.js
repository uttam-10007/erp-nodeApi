var express = require('express');
var router = express.Router();
var propObj = require('../../config_con.js')
var mysqlPool = require('../../connections/mysqlConnection.js');

var SqlString = require('sqlstring');
var moment = require('moment')
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
router.get('/getHelpData:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let type = SqlString.escape(obj['type'])
    let sql_fetchCurr = "Select * from "+propObj.svayamSystemDbName+".help"

if(obj['type']!=undefined){
    sql_fetchCurr +=" where type="+type
}

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->help_and_support-->getHelpData--", error)
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




router.post('/addHelpData', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let sql = "insert into "+propObj.svayamSystemDbName+".help (type,question,answer,tag,name,url) values"
                        +"("+SqlString.escape(obj['type'])+","+SqlString.escape(obj['question'])+","+SqlString.escape(obj['answer'])+","
                        +SqlString.escape(obj['tag'])+","+SqlString.escape(obj['name'])+","+SqlString.escape(obj['url'])+")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->help_and_support-->addHelpData--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Added Successfully"
            res.send(objectToSend);
        }
    })
})

router.post('/updateHelpData', (req, res) => {

    let objectToSend = {}

    let obj = req.body
    let sql = "update "+propObj.svayamSystemDbName+".help set type="+SqlString.escape(obj['type'])+",question="+SqlString.escape(obj['question'])
                            +",answer="+SqlString.escape(obj['answer'])+",tag="+SqlString.escape(obj['tag'])+",name="+SqlString.escape(obj['name'])
                            +",url="+SqlString.escape(obj['url'])+" where id="+SqlString.escape(obj['id'])
                       

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->help_and_support-->updateHelpData--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully"
            res.send(objectToSend);
        }
    })
})

router.delete('/deleteHelpData:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let sql = "delete from "+propObj.svayamSystemDbName+".help  where id="+SqlString.escape(obj['id'])
                       

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->help_and_support-->updateHelpData--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully"
            res.send(objectToSend);
        }
    })
})





router.post('/addHelpDocument:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};

    if (req.file != undefined) {
        console.log("Error-->routes-->help_and_support-->addHelpDocument--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let filename = obj.doc_name;
        

        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->help_and_support-->addHelpDocument--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->help_and_support-->addHelpDocument--", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {

                        let insertSql = "insert into "+propObj.svayamSystemDbName+".help (type,question,answer,tag,name,doc_name) values"
                        +"("+SqlString.escape(obj['type'])+","+SqlString.escape(obj['question'])+","+SqlString.escape(obj['answer'])+","
                        +SqlString.escape(obj['tag'])+","+SqlString.escape(obj['name'])+","+SqlString.escape(obj['doc_name'])+")"

                        mysqlCon.query(insertSql, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->help_and_support-->addHelpDocument--", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                let upload_id = results2.insertId
                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->help_and_support-->addHelpDocument--", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        try {
                                            var localFile = './uploads/' + filename;
                                            if (!fs.existsSync("./help")) {
                                                fs.mkdirSync("./help");
                                            }
                                            var copyLoc = "./help/" + filename+ "_" + upload_id;
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->help_and_support-->addHelpDocument---", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("Error-->routes-->help_and_support-->addHelpDocument", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = "Doc Added successfully! "
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });
                                        } catch (ex) {
                                            console.log("Error-->routes-->help_and_support-->addHelpDocument--", ex);
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


router.post('/gethelpDocument', function (req, res) {

    let obj = req.body;
   
    let objectToSend = {};
    try {
        fs.readFile("./help/" + obj.doc_name + "_" + obj.id, function (err, content) {
            if (err) {
                console.log("Error routes-->help_and_support-->gethelpDocument--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes--->help_and_support-->gethelpDocument--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});




router.post('/updateHelpDocument:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->help_and_support-->updateHelpDocument--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let filename = obj.doc_name;
        

        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->help_and_support-->updateHelpDocument--", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->help_and_support-->updateHelpDocument--", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {
                        let sql = "update "+propObj.svayamSystemDbName+".help set doc_name="+SqlString.escape(filename)+" where id="+SqlString.escape(obj['id'])
             
                        mysqlCon.query(sql, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->help_and_support-->updateHelpDocument--", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                               
                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->help_and_support-->updateHelpDocument--", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        try {
                                            var localFile = './uploads/' + filename;
                                            if (!fs.existsSync("./help")) {
                                                fs.mkdirSync("./help");
                                            }
                                            var copyLoc = "./help/" + filename+ "_" + obj['id'];
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->help_and_support-->updateHelpDocument---", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("Error-->routes-->help_and_support-->updateHelpDocument", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = "Doc Updated successfully! "
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });
                                        } catch (ex) {
                                            console.log("Error-->routes-->help_and_support-->updateHelpDocument--", ex);
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

module.exports = router;
