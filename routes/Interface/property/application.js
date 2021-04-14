
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



router.post('/addApplication', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

      let sql_insert = "insert into " + db + ".arrangement_info(property_id,arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,property_type_id,arr_status_code,"
                    +"create_user_id,create_timestamp,application_amount,application_challan_no) values "

     + " (  " + SqlString.escape(obj.property_id) + ",'APPLIED' ," + SqlString.escape(obj.arr_effective_date) + "," + SqlString.escape(obj.party_id) + ","
    + SqlString.escape(obj.scheme_code) + "," + SqlString.escape(obj.sub_scheme_code) + ","
    + SqlString.escape(obj.property_type_id) + ", 'APPLICATION_APPROVAL_PENDING'," + SqlString.escape(obj.create_user_id) + ","
    + create_timestamp + ", "+ SqlString.escape(obj.application_amount) + "," + SqlString.escape(obj.application_challan_no) + ")"
 
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->applicaion-->addApplication--", error)
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

router.get('/getAllpropertytypeInfo:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";


    let sql_fetchCurr = "SELECT * FROM (SELECT * from  " + db + ".property_type_info WHERE scheme_code=" 
    + SqlString.escape(obj.scheme_code) + " AND sub_scheme_code=" + SqlString.escape(obj.sub_scheme_code)+" AND quota_code="
    + SqlString.escape(obj.quota_code) + " AND sub_quota_code=" + SqlString.escape(obj.sub_quota_code)+") prt join " + db + ".property_info pr on prt.property_type_id = pr.property_type_id WHERE pr.property_status = 'UNALLOTTED'"


console.log(sql_fetchCurr)
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->applicaion-->getAllpropertytypeInfo--", error)
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

router.get('/getpartyDetails:dtls', (req, res) => {

    let objectToSend = {}

 

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT  ar.*,pr.party_id,pr.party_name,pr.party_email,pr.party_phone_no,DATE_FORMAT(pr.party_dob,'%Y-%m-%d') AS party_dob,pr.party_father_or_husband_name,pr."
    +"party_permanent_addr_line,pr.party_permanent_city,pr.party_permanent_addr_dist,pr.party_permanent_addr_state,pr.party_permanent_addr_pin_code,pr."
    +"party_current_addr_line,pr.party_current_city,pr.party_current_addr_dist,pr.party_current_addr_state,pr.party_current_addr_pin_code,pr.party_pan_no,pr."
    +"party_adhar_no,pr.party_quota,pr.party_sub_quota,pr.party_religion,pr.party_annual_income,pr.party_occupation,pr.party_signature_file_name,pr."
    +"party_affidavit_file_name,pr.party_income_Proof_file_name,pr.party_quota_file_name,pr.party_sub_quota_file_name,pr.party_pan_file_name,pr."
    +"party_adhar_file_name,pr.party_booklet_file_name,pr.create_user_id,pr.party_photo_file_name,pr.update_user_id,DATE_FORMAT(pr.create_timestamp,'%Y-%m-%d') AS create_timestamp,"
    +"DATE_FORMAT(pr.update_timestamp,'%Y-%m-%d') AS update_timestamp,pr.party_bank_name,pr.party_branch_name,pr.party_acct_no,pr.party_ifsc_code FROM ( select * from  " + db + ".party_info WHERE party_id = "+ SqlString.escape(obj.party_id) +" ) pr"
    +" join (select * from " + db + ".arrangement_info where arr_type_code = 'BOOKLETPURCHASE' and scheme_code = "+SqlString.escape(obj.scheme_code)+" AND sub_scheme_code = "+SqlString.escape(obj.sub_scheme_code)+" ) ar on ar.party_id = pr.party_id ORDER BY ar.id DESC;"
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->application-->getpartyDetails--", error)
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

router.put('/updatepartyinfo', (req, res) => {

    let objectToSend = {}

    let obj = req.body;
    
    
    
    
    

    let query = "update svayam_"+obj.b_acct_id+"_property.party_info set party_id = "+SqlString.escape(obj.party_id)+",party_name = "+SqlString.escape(obj.party_name)+",party_email = "+SqlString.escape(obj.party_email)+",party_phone_no = "+SqlString.escape(obj.party_phone_no)+",party_dob = "+SqlString.escape(obj.party_dob)+",party_father_or_husband_name = "+SqlString.escape(obj.party_father_or_husband_name)+","
    +"party_permanent_addr_line = "+SqlString.escape(obj.party_permanent_addr_line)+",party_permanent_city = "+SqlString.escape(obj.party_permanent_city)+",party_permanent_addr_dist = "+SqlString.escape(obj.party_permanent_addr_dist)+",party_permanent_addr_state = "+SqlString.escape(obj.party_permanent_addr_state)+",party_permanent_addr_pin_code = "+SqlString.escape(obj.party_permanent_addr_pin_code)+","
    +"party_current_addr_line = "+SqlString.escape(obj.party_current_addr_line)+",party_current_city = "+SqlString.escape(obj.party_current_city)+",party_current_addr_dist = "+SqlString.escape(obj.party_current_addr_dist)+",party_current_addr_state = "+SqlString.escape(obj.party_current_addr_state)+",party_current_addr_pin_code = "+SqlString.escape(obj.party_current_addr_pin_code)+",party_pan_no = "+SqlString.escape(obj.party_pan_no)+","
    +"party_adhar_no = "+SqlString.escape(obj.party_adhar_no)+",party_quota = "+SqlString.escape(obj.party_quota)+",party_sub_quota = "+SqlString.escape(obj.party_sub_quota)+",party_religion = "+SqlString.escape(obj.party_religion)+",party_annual_income = "+SqlString.escape(obj.party_annual_income)+",party_occupation = "+SqlString.escape(obj.party_occupation)+",party_signature_file_name = "+SqlString.escape(obj.party_signature_file_name)+","
    +"party_affidavit_file_name = "+SqlString.escape(obj.party_affidavit_file_name)+",party_income_Proof_file_name = "+SqlString.escape(obj.party_income_Proof_file_name)+",party_quota_file_name = "+SqlString.escape(obj.party_quota_file_name)+",party_sub_quota_file_name = "+SqlString.escape(obj.party_sub_quota_file_name)+",party_pan_file_name = "+SqlString.escape(obj.party_pan_file_name)+","
    +"party_adhar_file_name = "+SqlString.escape(obj.party_adhar_file_name)+",party_booklet_file_name = "+SqlString.escape(obj.party_booklet_file_name)+",create_user_id = "+SqlString.escape(obj.create_user_id)+",party_photo_file_name = "+SqlString.escape(obj.party_photo_file_name)+",update_user_id = "+SqlString.escape(obj.update_user_id)+",create_timestamp = "+SqlString.escape(obj.create_timestamp)+","
    +"update_timestamp = "+SqlString.escape(obj.update_timestamp)+",party_bank_name = "+SqlString.escape(obj.party_bank_name)+",party_branch_name = "+SqlString.escape(obj.party_branch_name)+",party_acct_no = "+SqlString.escape(obj.party_acct_no)+",party_ifsc_code = "+SqlString.escape(obj.party_acct_no)
     +" where party_id= "+obj.party_id

    
        
    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->updatepartyinfo--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "update successfully"

            res.send(objectToSend);
        }
    })
})


router.post('/createcoapplicant', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let data = obj.data
    let db = "svayam_" + obj.b_acct_id + "_property";
    
if(data.length != 0){
    let sql_insert = "insert into " + db + ".co_applicant_detail (party_id,co_applicant_name,co_applicant_phone_no,co_applicant_email,co_applicant_adhar_no,co_applicant_occupation,co_applicant_religion,co_applicant_father_or_husband_name,co_applicant_annual_income,co_applicant_photo_file_name) values"
    for (let i = 0; i < data.length; i++) {

        sql_insert+= " (" + SqlString.escape(data[i].party_id) + "," + SqlString.escape(data[i].co_applicant_name) + "," + SqlString.escape(data[i].co_applicant_phone_no) + "," + SqlString.escape(data[i].co_applicant_email) + "," + SqlString.escape(data[i].co_applicant_adhar_no) + "," + SqlString.escape(data[i].co_applicant_occupation) + ","
         + SqlString.escape(data[i].co_applicant_religion) + ","  + SqlString.escape(data[i].co_applicant_father_or_husband_name) + ","  + SqlString.escape(data[i].co_applicant_annual_income) + ","  + SqlString.escape(data[i].co_applicant_photo_file_name) + ") "
        
         if (i < data.length - 1) {
            sql_insert += " , "
        }
   
        }
    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->apply-->createnomineeinfo-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {
                if (error.message.includes("already exists")) {
                    objectToSend["data"] = "Possible duplicates"
                } else {
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                }
            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

 }
    else {

        objectToSend["error"] = false;
        objectToSend["data"] = "Already Added "
        res.send(objectToSend)
    }
})

router.delete('/deleteCoApplicantDetail:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);
    let db = "svayam_" + obj.b_acct_id + "_property";
    let party_id=obj.party_id;
    let id=obj.id;
    let sql = "delete  from "+db+".co_applicant_detail WHERE party_id="+party_id+" and id="+id;

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->application-->deleteCoApplicantDetail--", error)
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
router.put('/addBankDetail', (req, res) => {

    let objectToSend = {}
    let obj = req.body;
    let db = "svayam_" + obj.b_acct_id + "_property";
    let party_id= SqlString.escape(obj.party_id);
    let party_bank_name= SqlString.escape(obj.party_bank_name);
    let party_branch_name= SqlString.escape(obj.party_branch_name);
    let party_acct_no= SqlString.escape(obj.party_acct_no);
    let party_ifsc_code= SqlString.escape(obj.party_ifsc_code);

    let sql = "update "+db+".party_info set party_bank_name="+party_bank_name+", party_branch_name="+party_branch_name+",party_acct_no="+party_acct_no
    +",party_ifsc_code="+party_ifsc_code+" WHERE party_id="+party_id;

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->application-->deleteCoApplicantDetail--", error)
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


router.post('/uploadpartyFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->property-->uploadpartyFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        
        
        let b_acct_id = obj.b_acct_id;
        let db = "svayam_" + obj.b_acct_id + "_property"; 
        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->property-->applicant>uploadpartyFile", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error--routes-->property-->applicant-->uploadpartyFile-", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {

                        



                        let query = "update " + db + ".party_info set " + obj.update_key + "=" + SqlString.escape(obj.filename) + " where party_id= " + obj.party_id


                        mysqlCon.query(query, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->interface-->property-->applicant-->uploadpartyFile-", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {

                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->interface-->property-->applicant-->uploadpartyFile-", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {


                                        try {
                                            //cp xyz routes/property/upload/broucher
                                            var localFile = './uploads/' + obj.filename;
                                            if (!fs.existsSync("./routes/property/upload/" + obj.sub_scheme_code +"/applicant_upload")) {
                                                if (!fs.existsSync("./routes/property/upload/" + obj.sub_scheme_code )) {
                                                fs.mkdirSync("./routes/property/upload/" + obj.sub_scheme_code );
                                                }
                                                fs.mkdirSync("./routes/property/upload/" + obj.sub_scheme_code +"/applicant_upload");
                                            }
                                            var copyLoc = "./routes/property/upload/" + obj.sub_scheme_code + "/applicant_upload/" + obj.filename + "_" + obj.party_id;
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->interface-->property-->application-->uploadpartyFile-", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("124 Error-->routes-->interface-->property-->applicant-->uploadpartyFile-", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = "File upload successfully! ";
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->property-->uploadFile-", ex);
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


router.get('/getCoApplicantDetail:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";
    let party_id=obj.party_id;
    let sql = "SELECT * from "+db+".co_applicant_detail WHERE party_id="+party_id;

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->application-->getCoApplicantDetail--", error)
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


router.post('/coapplicantuploadFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->interface-->property-->coapplicantuploadFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        
        
        let b_acct_id = obj.b_acct_id;
        let db = "svayam_" + obj.b_acct_id + "_property"; 
        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->interface-->property-->application>coapplicantuploadFile", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error--routes-->property-->uploadFile-", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {

                        



                        let query = "update " + db + ".co_applicant_detail set "+ obj.update_key+" =" + SqlString.escape(obj.filename) + " where id= " + obj.id


                        mysqlCon.query(query, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->interface-->property-->application-->coapplicantuploadFile",error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {

                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->interface-->property-->appplication-->coapplicantuploadFile-", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {


                                        try {
                                            //cp xyz routes/property/upload/broucher
                                            var localFile = './uploads/' + obj.filename;
                                            if (!fs.existsSync("./routes/property/upload/" + obj.sub_scheme_code +"/co_applicant")) {
                                                if (!fs.existsSync("./routes/property/upload/" + obj.sub_scheme_code )) {
                                                fs.mkdirSync("./routes/property/upload/" + obj.sub_scheme_code );
                                                }
                                                fs.mkdirSync("./routes/property/upload/" + obj.sub_scheme_code +"/co_applicant");
                                            }
                                            var copyLoc = "./routes/property/upload/" + obj.sub_scheme_code + "/co_applicant/" + obj.filename + "_" + obj.id;
                                            
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->property-->coapplicantuploadFile-", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("124 Error-->routes-->property-->coapplicantuploadFile", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = "File upload successfully! ";
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->property-->uploadFile-", ex);
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


router.post('/getUploadedFileofparty', function (req, res) {

    let obj = req.body;
   
    let objectToSend = {};
    try {
        console.log("./routes/property/upload/" + obj.sub_scheme_code + "/applicant_upload/" + obj.filename + "_" + obj.party_id);
        fs.readFile("./routes/property/upload/" + obj.sub_scheme_code + "/applicant_upload/" + obj.filename + "_" + obj.party_id, function (err, content) {
            if (err) {
                console.log("Error routes-->interface-->proerty-->Applicant-->getUploadedFileofparty--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes-->interface-->proerty-->applicant-->getUploadedFileofparty---", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});
router.post('/getUploadedFileofcoapplicant', function (req, res) {

    let obj = req.body;
   
    let objectToSend = {};
    try {
        console.log("./routes/property/upload/" + obj.sub_scheme_code + "/co_applicant/" + obj.filename + "_" + obj.id);
        fs.readFile("./routes/property/upload/" + objsub_.scheme_code + "/co_applicant/" + obj.filename + "_" + obj.id, function (err, content) {
            if (err) {
                console.log("Error routes-->interface-->proerty-->Applicant-->getUploadedFileofcoapplicant--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes-->interface-->proerty-->applicant-->getUploadedFileofcoapplicant---", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});

router.get('/getarrangementDetails:dtls', (req, res) => {

    let objectToSend = {}

 

    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";

    let sql_fetchCurr = "SELECT arr_type_code,arr_effective_date,party_id,scheme_code,sub_scheme_code,property_type_id,arr_status_code,create_user_id,"
    +"create_timestamp,application_amount,application_challan_no from "+ db +".arrangement_info where party_id = "+SqlString.escape(obj.party_id)+" and arr_type_code = 'APPLIED'"
    +"and scheme_code="+SqlString.escape(obj.scheme_code)+" and sub_scheme_code="+SqlString.escape(obj.sub_scheme_code)+"ORDER BY id DESC"
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->application-->getarrangementDetails--", error)
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

router.put('/updatearrangement',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]

    let id=obj["id"]
    


    let sql="update svayam_"+b_acct_id+"_property.arrangement_info set arr_status_code= 'APPLICATION_APPROVAL_PENDING'"
            +" where id="+SqlString.escape(id)

    
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->interface-->property-->application-->updatearrangement", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully" 
            res.send(objectToSend);
        }
    })
})

module.exports=router;
