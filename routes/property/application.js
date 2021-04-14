var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')
const fs = require('fs');




router.get('/getAllapplication:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);
    let db = "svayam_" + obj.b_acct_id + "_property";
    let scheme_code=SqlString.escape(obj.scheme_code);
    let sub_scheme_code=SqlString.escape(obj.sub_scheme_code);

    let sql = "SELECT p.scheme_code,p.sub_scheme_code, q.party_photo_file_name,p.arr_type_code,p.id,p.party_id,q.party_name,q.party_signature_file_name,q.party_affidavit_file_name,q.party_income_proof_file_name,q.party_quota_file_name,q.party_sub_quota_file_name,q.party_pan_file_name,q.party_adhar_file_name,q.party_booklet_file_name,p.application_amount,p.application_challan_no,DATE_FORMAT(p.arr_effective_date,'%Y-%m-%d') AS applied_date ,p.arr_status_code FROM "+db+".arrangement_info AS p JOIN "+db+".party_info AS q ON p.party_id=q.party_id WHERE arr_type_code='APPLIED' and"
    +" scheme_code="+scheme_code+" and sub_scheme_code="+sub_scheme_code;

    console.log(sql)
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->application-->getAllapplication--", error)
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

router.put('/changeApplicationStatus', (req, res) => {

    let objectToSend = {}
    let obj =req.body;
    let db = "svayam_" + obj.b_acct_id + "_property";
    let arr_status_code=SqlString.escape(obj.arr_status_code);
    let update_user_id=SqlString.escape(obj.update_user_id);
    let id=SqlString.escape(obj.id);
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "update  "+db+".arrangement_info set arr_status_code="+arr_status_code+",update_user_id="+
    update_user_id+",update_timestamp="+update_timestamp+" where id="+id;

    console.log(sql)

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->application-->changeApplicationStatus--", error)
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


router.post('/getUploadedFileofparty', function (req, res) {

    let obj = req.body;
   
    let objectToSend = {};
    try {
        console.log("./routes/property/upload/" + obj.sub_scheme_code + "/applicant_upload/" + obj.filename + "_" + obj.party_id);
        fs.readFile("./routes/property/upload/" + obj.sub_scheme_code + "/applicant_upload/" + obj.filename + "_" + obj.party_id, function (err, content) {
            if (err) {
                console.log("Error routes--->property-->applicantion-->getUploadedFileofparty--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes-->property-->applicantion-->getUploadedFileofparty---", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});


router.get('/getCoApplicantDetail:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls);


    let db = "svayam_" + obj.b_acct_id + "_property";
    let party_id=SqlString.escape(obj.party_id);
    let sql = "SELECT * from "+db+".co_applicant_detail WHERE party_id="+party_id;

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->application-->getCoApplicantDetail--", error)
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



router.post('/getUploadedFileofcoapplicant', function (req, res) {

    let obj = req.body;
   
    let objectToSend = {};
    try {
        console.log("./routes/property/upload/" + obj.sub_scheme_code + "/co_applicant/" + obj.filename + "_" + obj.id);
        fs.readFile("./routes/property/upload/" + obj.sub_scheme_code + "/co_applicant/" + obj.filename + "_" + obj.id, function (err, content) {
            if (err) {
                console.log("Error routes-->property-->Applicant-->getUploadedFileofcoapplicant--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                 res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });

    } catch (ex) {
        console.log("Error routes--->property-->applicant-->getUploadedFileofcoapplicant---", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});





module.exports = router;
