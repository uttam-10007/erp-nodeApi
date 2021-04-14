var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var multer = require('multer');
const fs = require('fs');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {

        callback(null, file.originalname);
    }
});

let upload = multer({ storage: storage }).single('file');

router.get("/getUploadedreferenceFiles:dtls", (req, res) => {
    let objectToSend = {}

    let  b_acct_id= req.params.dtls
    let db="svayam_"+b_acct_id+"_md";


    let sql_getUploadedInfo = "Select * from " + db + ".uploaded_file_info" //where file_type='"+file_type+"'"

    mysqlPool.query(sql_getUploadedInfo, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->upload-->getUploadedFiles--", error)
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

router.delete("/deleteUploadedFile:dtls", (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);
    let db="svayam_"+obj.b_acct_id+"_md";
    let sql_delUpld = "delete from " + db + ".uploaded_file_info where upload_id=" + SqlString.escape(obj.upload_id)

    mysqlPool.query(sql_delUpld, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->upload-->deleteUploadedFile--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "File Deleted Successfully"
            res.send(objectToSend);
        }
    })
})


router.post('/uploadFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->metadata-->upload-->uploadFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let db="svayam_"+obj.b_acct_id+"_md";
        let filename = obj.file_name;
        let user_id = obj.user_id
        let table_technical_name = obj.table_technical_name;
        let file_type = obj.file_type
        let table_schema_name = obj.table_schema_name;
        let record_code = obj.record_code;
        let way_of_processing = obj.way_of_processing
        /* let msg = obj.msg;
        let detail_msg = obj.detail_msg; */
        let include_header = obj.include_header
        //let proj_id = obj.project_id
        
        mysqlPool.getConnection(function (error, mysqlCon) {
            if (error) {
                console.log("Error-->routes-->signup-->signUp--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->signup-->signUp--", error1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    } else {

                        let insertSql = "insert into " + db + ".uploaded_file_info (file_name,user_id,table_technical_name,type,table_schema_name,msg,process_status,include_header,record_code) values "
                            + "(" + SqlString.escape(filename) + "," + SqlString.escape(user_id) + "," + SqlString.escape(table_technical_name) + "," + SqlString.escape(file_type) + "," + SqlString.escape(table_schema_name) + ",'file uploaded','0'," + SqlString.escape(include_header) +"," + SqlString.escape(record_code) +");"


                        mysqlCon.query(insertSql, function (error2, results2) {
                            if ((error2)) {
                                console.log("Error-->routes-->metadata-->upload-->uploadFile--", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()

                            } else {
                                let upload_id = results2.insertId
                                
                                upload(req, res, function (err) {
                                    if ((err)) {
                                        console.log("Error-->routes-->metadata-->upload-->uploadFile--", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()

                                    } else {


                                        try {

                                            var localFile = './uploads/' + filename;

                                            {

                                                
                                                if (!fs.existsSync("./ReferenceFile")) {
                                                    fs.mkdirSync("./ReferenceFile");
                                                    
                                                }


                                                var copyLoc = "./ReferenceFile/" + filename + "_" + obj.b_acct_id + "_" + upload_id;
                                               



                                                fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                    if ((err1)) {
                                                        console.log("Error-->routes-->metadata-->upload-->uploadFile--", err1);
                                                        objectToSend["error"] = true;
                                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                        res.send(objectToSend)


                                                    } else {

                                                        mysqlCon.commit(function (error4) {
                                                            if (error4) {
                                                                console.log("Error-->routes-->signup-->signUp--", error4)
                                                                objectToSend["error"] = true
                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                                res.send(objectToSend);
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
                                                });
                                            }






                                        } catch (ex) {
                                            console.log("Error-->routes-->metadata-->upload-->uploadFile--", ex);
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

router.post('/ReferencedataprocessFile', function (req, res) {
    var body = req.body;
    var objectToSend = {};
    let args = "";
   

     
        args = SqlString.escape(JSON.stringify(body))
        args = args.substring(1, args.length - 1)
    

    console.log(body)
    const exec = require('child_process').exec;
    
    const childPorcess = exec('java -cp jars/SvayamPortal.jar com.svayam.referenceData.ReferenceData "' + args + '"', function (err, stdout, stderr) {
        if (err) {

            console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->manualEvent--", err);

            objectToSend["error"] = true;

            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."



            res.end(JSON.stringify(objectToSend))

        }
        else if(stderr){
    console.log(stderr)
}else{
    res.send(stdout)
}

            
        
    });
});
router.post('/fieldprocessFile', function (req, res) {
    var body=req.body;
   var objectToSend = {};
  

   
   args = SqlString.escape(JSON.stringify(body))
        args = args.substring(1, args.length - 1)

   const exec = require('child_process').exec;
   

   const childPorcess = exec('java -cp jars/SvayamPortal.jar com.svayam.fieldsProcessing.FieldsProcessing "'+ args+'"', function (err, stdout, stderr) {
    if (err) {

        console.log("Error-->routes-->manualAdjustments-->manualAdjustments-->manualEvent--", err);

        objectToSend["error"] = true;

        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."



        res.end(JSON.stringify(objectToSend))

    }
    else if(stderr){
console.log(stderr)
}else{
res.send(stdout)
}
  
    
   

})
});

module.exports = router;
