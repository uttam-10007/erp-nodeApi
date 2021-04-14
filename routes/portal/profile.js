var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);
var SqlString = require('sqlstring')

var propObj = require('../../config_con')
var multer = require('multer');
const fs = require('fs');


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

function encryptPassword(text) {
    let key = Buffer.from(propObj.encryptionKey, 'hex')
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decryptPassword(text) {
    let key = Buffer.from(propObj.encryptionKey, 'hex')
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString().trim();
}


let upload = multer({ storage: storage }).single('pimage');

router.post('/uploadImage:dtl', function (req, res) {


    //upload.single('rulefile')

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error routes-->portal-->profile-->uploadImage--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.end(JSON.stringify(objectToSend))

    } else {

        upload(req, res, function (err) {
            if (err) {
                console.log("Error routes-->portal-->profile-->uploadImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                res.end(JSON.stringify(objectToSend))

            } else {

                try {


                    let filename = obj.file_name;
                    let user_id = obj.user_id;




                    let localFile = './uploads/' + filename;
                    /* let remoteFileStream = hdfs.createWriteStream('/user/svayam/rules/' + filename);
                    localFileStream.pipe(remoteFileStream);
                    remoteFileStream.on('finish', function onFinish() {
                    }); */

                    let dir = "./images/user_images/" + user_id;

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }


                    let copyLoc = "./images/user_images/" + user_id + "/" + "img.jpg";


                    fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                        if (err1) {
                            console.log("Error routes-->portal-->profile-->uploadImage--", err1);
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
                    console.log("Error routes-->portal-->profile-->uploadImage--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.end(JSON.stringify(objectToSend))
                }

            }

        });


    }
})
/////////////////////////////
///Request to get profile image
router.post('/getProfileImage', function (req, res) {



    let obj = req.body;
    let user_id = obj.user_id;


console.log(obj)
    let objectToSend = {};


    try {

        fs.readFile("./images/user_images/" + user_id + "/img.jpg", function (err, content) {
            if (err) {
                console.log("Error routes-->profile-->getProfileImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {

                res.writeHead(200, { 'Content-type': 'image/jpg' });
                res.end(content);


            }
        });




    } catch (ex) {
        console.log("Error routes-->profile-->getProfileImage--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }


});

router.get('/getuserinfo:dtls', function (req, res) {
    let objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->portal-->profile-->getuserinfo--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                let user_id = SqlString.escape(req.params.dtls);

                let query = "select *  from " + propObj.svayamSystemDbName + ".user_info i where i.user_id=" + user_id;
                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->portal-->profile-->getuserinfo--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->portal-->profile-->getuserinfo--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->portal-->profile-->getuserinfo--", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = results;
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
        console.log("Error-->routes-->portal-->profile-->getuserinfo--", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});


router.put('/updateprofile', function (req, res) {
    let objectToSend = {};
    let row = req.body;

    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->profile-->updateprofile--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                // let email=req.params.dtls;
                // console.log(row);
                let query = "update " + propObj.svayamSystemDbName + ".user_info set email=" + SqlString.escape(row.email) + ",first_name=" + SqlString.escape(row.first_name) + ","
                    + "last_name=" + SqlString.escape(row.last_name) + ",work_phone_no_country_cd=" + SqlString.escape(row.work_phone_no_country_cd) + ",work_phone_no=" + SqlString.escape(row.work_phone_no) + ","
                    + "work_email=" + SqlString.escape(row.work_email) + ",country=" + SqlString.escape(row.country) + ",designation=" + SqlString.escape(row.designation) + ",state=" + SqlString.escape(row.state) + ",city=" + SqlString.escape(row.city) + ","
                    + "postal_code=" + SqlString.escape(row.postal_code) + ",address1=" + SqlString.escape(row.address1) + ",address2=" + SqlString.escape(row.address2) + " where user_id=" + SqlString.escape(row.user_id);

                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->profile-->updateprofile--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->profile-->updateprofile--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {
                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->profile-->updateprofile--", err8);
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
        console.log("Error-->profile-->getalluserinfo--", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});



router.put('/changepassword', function (req, res) {
    let objectToSend = {};
    let row = req.body;
    let password = row["password"]
    let new_password = row["new_password"].trim()
    let user_id = SqlString.escape(row["user_id"])
    let query = "select password  from  " + propObj.svayamSystemDbName + ".user_info where user_id= " + user_id
    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->portal-->profile-->changepassword--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);

        } else {

            let origPassword = decryptPassword(JSON.parse(results[0].password))

            if (origPassword != password) {
                objectToSend["error"] = true;
                objectToSend["data"] = "Wrong Password."
                res.send(objectToSend)
            }
            else {
                let new_passwrd = SqlString.escape(JSON.stringify(encryptPassword(new_password)));
                let insertquery = "update " + propObj.svayamSystemDbName + ".user_info set password=" + new_passwrd + " where user_id =" +user_id
                mysqlPool.query(insertquery, function (error, results1) {
                    if (error) {
                        console.log("Error-->routes-->portal-->profile-->changepassword--", error)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);

                    } else {


                        objectToSend["error"] = false
                        objectToSend["data"] = 'Upadated Sucessfully';

                        res.send(objectToSend);
                    }
                })
            }
        }
    })
})


module.exports = router;
