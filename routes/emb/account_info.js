var express = require('express');
var router = express.Router();

var propObj = require('../../config_con')
var multer = require('multer');
const fs = require('fs');
var SqlString = require('sqlstring');
const moment=require('moment')


try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->user_info-->", ex)
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
        console.log("Error routes-->account_info-->uploadAccountImage--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        upload(req, res, function (err) {
            if (err) {
                console.log("Error routes-->account_info-->uploadAccountImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                res.send(objectToSend)

            } else {

                try {


                    let filename = obj["file_name"];
                    let b_acct_id = obj["b_acct_id"];




                    let localFile = './uploads/' + filename;
                    

                    let dir = "./images/account_images/" + b_acct_id;

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }


                    let copyLoc = "./images/account_images/" + b_acct_id + "/" + "img.jpg";


                    fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                        if (err1) {
                            console.log("Error routes-->account_info-->uploadAccountImage--", err1);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                            res.send(objectToSend)

                        } else {


                            objectToSend["error"] = false;
                            objectToSend["data"] = "Image uploaded successfully"
                            res.send(objectToSend)



                        }
                    });


                } catch (ex) {
                    console.log("Error routes-->account_info-->uploadAccountImage--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                    res.send(objectToSend)
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
                console.log("Error routes-->account_info-->getAccountImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch account image at the moment. Please try again later"
                res.send(objectToSend)
            } else {

                res.writeHead(200, { 'Content-type': 'image/jpg' });
                res.end(content);


            }
        });




    } catch (ex) {
        console.log("Error routes-->account_info-->getAccountImage--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch account image at the moment. Please try again later"
        res.send(objectToSend)
    }


});


router.get('/getAccountInfo:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=req.params.dtls

    let sql="Select * from "+propObj.svayamSystemDbName+".billing_account where b_acct_id in ("+b_acct_id+")"
    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->account_info-->getAccountInfo--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side Error. Can't fetch account info at the moment "
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })


})


router.put('/updateAccountInfo',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let account_name=SqlString.escape(obj["account_name"])
    let account_short_name=SqlString.escape(obj["account_short_name"])
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let b_acct_id=obj["b_acct_id"]
        

    let sql="update "+propObj.svayamSystemDbName+".billing_account set account_name="+account_name+",account_short_name="+account_short_name
            +",create_timestamp="+create_timestamp+" where b_acct_id="+b_acct_id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->account_info-->updateAccountInfo--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side Error. Can't update account info at the moment "
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })

})




module.exports=router;
