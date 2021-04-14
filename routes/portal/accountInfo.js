var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var multer = require('multer');
const fs = require('fs');
var SqlString=require('sqlstring')
var moment=require('moment')

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->profile-->", ex)
}
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {

        callback(null, file.originalname);
    }
});




let upload = multer({ storage: storage }).single('aimage');

router.post('/uploadAccountImage:dtl', function (req, res) {


    
    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error routes-->portal-->accountInfo-->uploadAccountImage--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.end(JSON.stringify(objectToSend))

    } else {

        upload(req, res, function (err) {
            if (err) {
                console.log("Error routes-->portal-->accountInfo-->uploadAccountImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                res.end(JSON.stringify(objectToSend))

            } else {

                try {


                    let filename = obj.file_name;
                    let b_acct_id = obj.b_acct_id;




                    let localFile = './uploads/' + filename;
                    /* let remoteFileStream = hdfs.createWriteStream('/user/svayam/rules/' + filename);
                    localFileStream.pipe(remoteFileStream);
                    remoteFileStream.on('finish', function onFinish() {
                    }); */

                    let dir = "./images/account_images/" + b_acct_id;

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }


                    let copyLoc = "./images/account_images/" + b_acct_id + "/" + "img.jpg";


                    fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                        if (err1) {
                            console.log("Error routes-->portal-->accountInfo-->uploadAccountImage--", err1);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                            res.end(JSON.stringify(objectToSend))

                        } else {


                            objectToSend["error"] = false;
                            objectToSend["data"] = "Image uploaded successfully"
                            res.send(JSON.stringify(objectToSend))



                        }
                    });


                } catch (ex) {
                    console.log("Error routes-->portal-->accountInfo-->uploadAccountImage--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.end(JSON.stringify(objectToSend))
                }

            }

        });


    }
})


router.post('/getAccountImage', function (req, res) {



    let obj = req.body;
    let b_acct_id = obj.b_acct_id;



    let objectToSend = {};


    try {

        fs.readFile("./images/account_images/" + b_acct_id + "/img.jpg", function (err, content) {
            if (err) {
                console.log("Error routes-->accountInfo-->getAccountImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {

                res.writeHead(200, { 'Content-type': 'image/jpg' });
                res.end(content);


            }
        });




    } catch (ex) {
        console.log("Error routes-->accountInfo-->getAccountImage--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }


});

router.get('/getAccountInfo:dtls', function (req, res) {
    let objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->portal-->accountInfo-->getAccountInfo--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                let b_acct_id = SqlString.escape(req.params.dtls);

                let query = "select *  from " + propObj.svayamSystemDbName + ".billing_account_info";
			
	if(req.params.dtls!='-1'){
			query=query+"  where b_acct_id=" + b_acct_id ;
		}
                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->portal-->accountInfo-->getAccountInfo--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->portal-->accountInfo-->getAccountInfo--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->portal-->accountInfo-->getAccountInfo--", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = results;
                                        res.send(objectToSend);
                                        mysqlCon.release();
                                    }
                                });
                            }

                        });


                    }





                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->routes-->portal-->accountInfo-->getAccountInfo--", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});


router.put('/updateAccountInfo', function (req, res) {
    let objectToSend = {};
    let obj = req.body;

    let b_acct_id=SqlString.escape(obj["b_acct_id"])
    let account_short_name=SqlString.escape(obj["account_short_name"])
    let account_name=SqlString.escape(obj["account_name"])
    let address=SqlString.escape(obj["address"])


    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->accountInfo-->updateAccountInfo--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                
                let query = "update "+propObj.svayamSystemDbName+".billing_account_info set address="+address+", account_short_name="+account_short_name
                +" , account_name="+account_name+" where b_acct_id="+b_acct_id

                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->accountInfo-->updateAccountInfo--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->accountInfo-->updateAccountInfo--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->accountInfo-->updateAccountInfo--", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Update Successfully!";
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.release();
                                    }
                                });
                            }

                        });


                    }





                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->accountInfo-->updateAccountInfo", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});



router.get('/getServerDate',(req,res)=>{
    let objectToSend={}

    objectToSend["error"]=false
    objectToSend["data"]=moment().format('YYYY-MM-DD HH:mm:ss')
    res.send(objectToSend);
})


module.exports = router;
