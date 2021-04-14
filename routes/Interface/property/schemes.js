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




router.get('/getAllSchemesInfo:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)
    let db="svayam_"+obj.b_acct_id+"_property"
    let sql="select *  "
             +" FROM "+db+".scheme_info sc JOIN "+db+".sub_scheme_info sub ON sc.scheme_code=sub.scheme_code"
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->interface-->property-->schemes-->getAllSchemesInfo", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results 
            res.send(objectToSend);
        }
    })
})

router.post('/getUploadedFile', function (req, res) {

    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let scheme_code = obj.scheme_code;
    let sub_scheme_code = obj.sub_scheme_code;
    let file_name = obj.file_name;
    let objectToSend = {};
    try {
        console.log("./routes/property/upload/broucher/" + file_name + "_"+scheme_code+"_"+sub_scheme_code);
        fs.readFile("./routes/property/upload/broucher/" + file_name + "_"+scheme_code+"_"+sub_scheme_code, function (err, content) {
            if (err) {
                console.log("Error routes-->interface-->proerty-->schemes-->getUploadedFile--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes-->interface-->proerty-->schemes-->getUploadedFile---", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});



module.exports=router;
