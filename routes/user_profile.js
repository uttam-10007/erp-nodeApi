var express = require('express');
var router = express.Router();

var propObj = require('../config_con')
var multer = require('multer');
const fs = require('fs');
var SqlString = require('sqlstring');
const moment=require('moment')


try {
    var mysqlPool = require('../connections/mysqlConnection.js');
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

let upload = multer({ storage: storage }).single('pimage');

router.post('/uploadProfileImage:dtl', function (req, res) {


    
    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error routes-->user_profile-->uploadProfileImage--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        upload(req, res, function (err) {
            if (err) {
                console.log("Error routes-->user_profile-->uploadProfileImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                res.send(objectToSend)

            } else {

                try {


                    let filename = obj["file_name"];
                    let user_id = obj["user_id"];




                    let localFile = './uploads/' + filename;
                    

                    let dir = "./images/user_images/" + user_id;

                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }


                    let copyLoc = "./images/user_images/" + user_id + "/" + "img.jpg";


                    fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                        if (err1) {
                            console.log("Error routes-->user_profile-->uploadProfileImage--", err1);
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
                    console.log("Error routes-->user_profile-->uploadProfileImage--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload image at the moment "
                    res.send(objectToSend)
                }

            }

        });


    }
})


router.post('/getProfileImage', function (req, res) {



    let obj = req.body;
    let user_id = obj.user_id;

    let objectToSend = {};


    try {

        fs.readFile("./images/user_images/" + user_id + "/img.jpg", function (err, content) {
            if (err) {
                console.log("Error routes-->user_profile-->getProfileImage--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.send(objectToSend)
            } else {

                res.writeHead(200, { 'Content-type': 'image/jpg' });
                res.end(content);


            }
        });




    } catch (ex) {
        console.log("Error routes-->user_profile-->getProfileImage--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.send(objectToSend)
    }


});


router.get('/getUserProfile:dtls',(req,res)=>{
    let objectToSend={}

    let user_id=req.params.dtls

    let sql="Select * from "+propObj.svayamSystemDbName+".user_info where user_id="+user_id
    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->user_profile-->getUserProfile--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side Error. Can't fetch profile at the moment "
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })


})


router.put('/updateProfile',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let email=SqlString.escape(obj["email"])
    let name=SqlString.escape(obj["name"])
    let phone_no=SqlString.escape(obj["phone_no"])
   
    let user_id=SqlString.escape(obj["user_id"])
  

    

    let sql="update "+propObj.svayamSystemDbName+".user_info set email="+email+", name="+name+",phone_no="+phone_no
            +" where user_id="+user_id

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->user_profile-->updateProfile--", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side Error. Can't update profile at the moment "
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })

})




module.exports=router;
