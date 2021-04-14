var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')
var multer = require('multer');
const fs = require('fs');
var moment = require('moment')


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {

        callback(null, file.originalname);
    }
});
let upload = multer({ storage: storage }).single('file');



router.post('/uploadDocument:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let document_type_code=SqlString.escape(obj["document_type_code"])
    let document_name=SqlString.escape(obj["document_name"])
    let application_id=SqlString.escape(obj["application_id"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let db="svayam_"+b_acct_id+"_eng"


    let sql_insert="insert into "+db+".upload_document (document_type_code,document_name,application_id,create_user_id, create_timestamp) values "
            +"("+document_type_code+","+document_name+","+application_id+","+create_user_id+","+ create_timestamp+")"

    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->uploadDocument--uploadDocument---", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        }else{
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->uploadDocument--uploadDocument---", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_insert, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->uploadDocument--uploadDocument---", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else{
                            let upload_id=results2.insertId

                            upload(req, res, function (err) {
                                if (err) {
                                    console.log("Error-->routes-->eng-->uploadDocument--uploadDocument---", err);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }else{
                                    var localFile = './uploads/' + obj["document_name"];

                                    if (!fs.existsSync("./routes/eng/upload")) {
                                        fs.mkdirSync("./routes/eng/upload");
                                    }

                                    var copyLoc = "./routes/eng/upload/" + obj["document_name"] + "_" + obj["application_id"] + "_" + upload_id;

                                    fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                        if (err1) {
                                            console.log("Error-->routes-->eng-->uploadDocument--uploadDocument---", err1);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()

                                        }else{
                                            mysqlCon.commit(function (error3) {
                                                if (error3) {
                                                    console.log("Error-->routes-->eng-->uploadDocument--uploadDocument---", error3);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()
                                                } else {
                                                    objectToSend["error"] = false;
                                                    objectToSend["data"] = upload_id
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
        }

    })

    
})

router.post('/updateDocument:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])
    let document_type_code=SqlString.escape(obj["document_type_code"])
    let document_name=SqlString.escape(obj["document_name"])
    let application_id=SqlString.escape(obj["application_id"])
    let update_user_id=SqlString.escape(obj["create_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db="svayam_"+b_acct_id+"_eng"


   
    let sql_upd="update "+db+".upload_document set document_type_code="+document_type_code+",document_name="+document_name+",application_id="+application_id+","
            +"update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where id="+id
    
    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->uploadDocument--updateDocument---", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        }else{
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->uploadDocument--updateDocument---", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_upd, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->uploadDocument--updateDocument---", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else{
                            let upload_id=obj["id"]
                            upload(req, res, function (err) {
                                if (err) {
                                    console.log("Error-->routes-->eng-->uploadDocument--updateDocument---", err);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                }else{
                                    var localFile = './uploads/' + document_name;

                                    if (!fs.existsSync("./routes/eng/upload")) {
                                        fs.mkdirSync("./routes/eng/upload");
                                    }

                                    var copyLoc = "./routes/eng/upload/" + document_name + "_" + obj["application_id"] + "_" + upload_id;

                                    fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                        if (err1) {
                                            console.log("Error-->routes-->eng-->uploadDocument--updateDocument---", err1);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()

                                        }else{
                                            mysqlCon.commit(function (error3) {
                                                if (error3) {
                                                    console.log("Error-->routes-->eng-->uploadDocument--updateDocument---", error3);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()
                                                } else {
                                                    objectToSend["error"] = false;
                                                    objectToSend["data"] = "Document updated successfully! "
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
        }

    })

    
})

router.post('/downloadDocument', function (req, res) {
    
    
    let obj=req.body;
    let application_id=obj["application_id"];
    let id=obj["id"]
    let document_name=obj["document_name"]

    let fName=document_name+"_"+application_id+"_"+id
    

    let objectToSend={};
    
    let file="./routes/eng/upload/"+fName

    try {
        fs.readFile(file, function (err, content) {
            if (err) {
                console.log("Error-->routes-->eng-->uploadDocument--downloadDocument---", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error-->routes-->eng-->uploadDocument--downloadDocument---", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});
    


router.get('/getUploadedDocuments:dtls',(req,res)=>{

    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]

    let db="svayam_"+b_acct_id+"_eng"

    let sql_fetch="Select id,document_type_code,document_name,application_id,create_user_id, create_timestamp,update_user_id, update_timestamp"
            +" from "+db+".upload_document"

    let filterPresent=false;
    if(obj["id"]!=undefined){
        sql_fetch+=" where id="+SqlString.escape(obj["id"])
        filterPresent=true
    }

    if(obj["application_id"]!=undefined){
        if(filterPresent){
            sql_fetch+=" and application_id="+SqlString.escape(obj["application_id"])
        }else{
            sql_fetch+=" where application_id="+SqlString.escape(obj["application_id"])
        }
    }

    mysqlPool.query(sql_fetch, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->uploadDocument-->getUploadedDocuments", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }

    })
})


router.delete('/deleteDocument:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=SqlString.escape(obj["id"])

    let db="svayam_"+b_acct_id+"_eng"

    let sql_delete="delete from "+db+".upload_document where id="+id

    mysqlPool.query(sql_delete, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->uploadDocument-->deleteDocument", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }

    })
})






module.exports = router;
