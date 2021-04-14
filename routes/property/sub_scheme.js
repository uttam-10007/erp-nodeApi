var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con.js')
let mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')

var multer = require('multer');
const fs = require('fs');
var moment = require('moment')


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './routes/property/upload');
    },
    filename: function (req, file, callback) {

        callback(null, file.originalname);
    }
});


let upload = multer({ storage: storage }).single('file');




router.get('/getSubScheme:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);
    let db = "svayam_" + obj.b_acct_id + "_property";
    let scheme_code = SqlString.escape(obj.scheme_code)



    let sql_fetchCurr = "Select  id,scheme_code,sub_scheme_name,sub_scheme_code,"
        + "DATE_FORMAT(booklet_purchase_start_date,'%Y-%m-%d') as booklet_purchase_start_date,"
        + "DATE_FORMAT(booklet_purchase_end_date,'%Y-%m-%d') as booklet_purchase_end_date,"
        + "DATE_FORMAT(application_start_date,'%Y-%m-%d') as application_start_date,"
        + "DATE_FORMAT(application_end_date,'%Y-%m-%d') as application_end_date,"
        + "DATE_FORMAT(allotment_start_date,'%Y-%m-%d') as allotment_start_date,"
        + "application_bank_code,application_branch_code,application_acct_no,application_ifsc_code,"
        + "booklet_purchase_bank_code,booklet_purchase_branch_code,booklet_purchase_acct_no,booklet_purchase_ifsc_code,sub_scheme_status,"
        + "sector,city,locality,district,state,landmark,mode_of_allotement,booklet_amount,brochure_file_name,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
        + "update_timestamp from " + db + ".sub_scheme_info";


    if (obj.scheme_code != undefined) {
        sql_fetchCurr += " where scheme_code=" + scheme_code
    }


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->property-->sub_scheme-->getSubScheme--", error)
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

router.post('/createSubSubcheme:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls);

    let objectToSend = {}
    if (req.file != undefined) {
        console.log("Error-->routes-->property-->sub_scheme-->createSubSubcheme---Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let db = "svayam_" + obj.b_acct_id + "_property";
        let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
        let scheme_code = SqlString.escape(obj.scheme_code)
        let sub_scheme_code = SqlString.escape(obj.sub_scheme_code)
        let sub_scheme_name = SqlString.escape(obj.sub_scheme_name)
        let booklet_purchase_start_date = SqlString.escape(obj.booklet_purchase_start_date)
        let booklet_purchase_end_date = SqlString.escape(obj.booklet_purchase_end_date)
        let application_start_date = SqlString.escape(obj.application_start_date)
        let application_end_date = SqlString.escape(obj.application_end_date)
        let allotment_start_date = SqlString.escape(obj.allotment_start_date)
        let booklet_purchase_bank_code = SqlString.escape(obj.booklet_purchase_bank_code)
        let booklet_purchase_branch_code = SqlString.escape(obj.booklet_purchase_branch_code)
        let booklet_purchase_acct_no = SqlString.escape(obj.booklet_purchase_acct_no)
        let booklet_purchase_ifsc_code = SqlString.escape(obj.booklet_purchase_ifsc_code)
        let application_bank_code = SqlString.escape(obj.application_bank_code)
        let application_branch_code = SqlString.escape(obj.application_branch_code)
        let application_acct_no = SqlString.escape(obj.application_acct_no)
        let application_ifsc_code = SqlString.escape(obj.application_ifsc_code)
        let sub_scheme_status = SqlString.escape(obj.sub_scheme_status)
        let brochure_file_name = SqlString.escape(obj.brochure_file_name)
        let sector = SqlString.escape(obj.sector)
        let city = SqlString.escape(obj.ciy)
        let district = SqlString.escape(obj.district)
        let locality = SqlString.escape(obj.locality)
        let state = SqlString.escape(obj.state)
        let landmark = SqlString.escape(obj.landmark)
        let mode_of_allotement = SqlString.escape(obj.mode_of_allotement)
        let create_user_id = SqlString.escape(obj.create_user_id)
        let booklet_amount = SqlString.escape(obj.booklet_amount)





        let sql_insert = "insert into " + db + ".sub_scheme_info (scheme_code,sub_scheme_code,sub_scheme_name,booklet_purchase_start_date,"
            + "booklet_purchase_end_date,application_start_date,application_end_date,allotment_start_date,application_bank_code,application_acct_no,application_ifsc_code,application_branch_code,booklet_purchase_bank_code,"
            + "booklet_purchase_acct_no,booklet_purchase_ifsc_code,booklet_purchase_branch_code,brochure_file_name,sector,city,"
            + "locality,district,state,landmark,mode_of_allotement,create_user_id,create_timestamp,booklet_amount,"
            + "sub_scheme_status ) values"
            + " (" + scheme_code + "," + sub_scheme_code + "," + sub_scheme_name + "," + booklet_purchase_start_date + "," + booklet_purchase_end_date + ","
            + application_start_date + "," + application_end_date + "," + allotment_start_date + ","
            + application_bank_code + "," + application_acct_no + "," + application_ifsc_code + "," + application_branch_code + ","
            + booklet_purchase_bank_code + "," + booklet_purchase_acct_no + "," + booklet_purchase_ifsc_code + "," + booklet_purchase_branch_code + ","
            + brochure_file_name + "," + sector + "," + city + ","
            + locality + "," + district + "," + state + "," + landmark + ","
            + mode_of_allotement + "," + create_user_id + "," + create_timestamp + "," + booklet_amount + "," + sub_scheme_status + ") "

        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->property-->sub_scheme--createSubSubcheme---", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->property-->sub_scheme---createSubSubcheme---", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {



                        mysqlCon.query(sql_insert, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->property-->sub_scheme---createSubSubcheme---", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                let upload_id = results2.insertId
                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->property-->sub_scheme---createSubSubcheme---", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {


                                        try {

                                            var localFile = './routes/property/upload/' + obj.brochure_file_name;
                                            if (!fs.existsSync("./routes/property/upload/broucher")) {
                                                fs.mkdirSync("./routes/property/upload/broucher");
                                            }
                                            var copyLoc = "./routes/property/upload/broucher/" + obj.brochure_file_name + "_" + obj.scheme_code + "_" + obj.sub_scheme_code;
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->property-->sub_scheme---createSubSubcheme---", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("Error-->routes-->property-->sub_scheme--createSubSubcheme---", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = "Subscheme Added successfully! "
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->property-->sub_scheme---", ex);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
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

router.put('/updateSubScheme', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_property";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_user_id = SqlString.escape(obj.update_user_id)
    let scheme_code = SqlString.escape(obj.scheme_code)
    let sub_scheme_code = SqlString.escape(obj.sub_scheme_code)
    let sub_scheme_name = SqlString.escape(obj.sub_scheme_name)
    let booklet_purchase_start_date = SqlString.escape(obj.booklet_purchase_start_date)
    let booklet_purchase_end_date = SqlString.escape(obj.booklet_purchase_end_date)
    let application_start_date = SqlString.escape(obj.application_start_date)
    let application_end_date = SqlString.escape(obj.application_end_date)
    let allotment_start_date = SqlString.escape(obj.allotment_start_date)
    let booklet_purchase_bank_code = SqlString.escape(obj.booklet_purchase_bank_code)
    let booklet_purchase_branch_code = SqlString.escape(obj.booklet_purchase_branch_code)
    let booklet_purchase_acct_no = SqlString.escape(obj.booklet_purchase_acct_no)
    let booklet_purchase_ifsc_code = SqlString.escape(obj.booklet_purchase_ifsc_code)
    let application_bank_code = SqlString.escape(obj.application_bank_code)
    let application_branch_code = SqlString.escape(obj.application_branch_code)
    let application_acct_no = SqlString.escape(obj.application_acct_no)
    let application_ifsc_code = SqlString.escape(obj.application_ifsc_code)
    let sub_scheme_status = SqlString.escape(obj.sub_scheme_status)
    let sector = SqlString.escape(obj.sector)
    let city = SqlString.escape(obj.ciy)
    let district = SqlString.escape(obj.district)
    let locality = SqlString.escape(obj.locality)
    let state = SqlString.escape(obj.state)
    let landmark = SqlString.escape(obj.landmark)
    let mode_of_allotement = SqlString.escape(obj.mode_of_allotement)
    let booklet_amount = SqlString.escape(obj.booklet_amount)

    let sql = "update " + db + ".sub_scheme_info set mode_of_allotement=" + mode_of_allotement
        + ",sub_scheme_name=" + sub_scheme_name + ",update_user_id=" + update_user_id
        + ",application_branch_code=" + application_branch_code + ",booklet_purchase_branch_code=" + booklet_purchase_branch_code
        + ",booklet_purchase_bank_code=" + booklet_purchase_bank_code + ",booklet_purchase_acct_no=" + booklet_purchase_acct_no
        + ",booklet_purchase_ifsc_code=" + booklet_purchase_ifsc_code + ",application_bank_code=" + application_bank_code
        + ",application_acct_no=" + application_acct_no + ",application_ifsc_code=" + application_ifsc_code
        + ",booklet_purchase_start_date=" + booklet_purchase_start_date + ",booklet_purchase_end_date=" + booklet_purchase_end_date
        + ",application_start_date=" + application_start_date + ",application_end_date=" + application_end_date
        + ",allotment_start_date=" + allotment_start_date + ",sub_scheme_status=" + sub_scheme_status
        + ",sector=" + sector + ",city=" + city + ",locality=" + locality
        + ",district=" + district + ",state=" + state + ",landmark=" + landmark
        + ",update_timestamp=" + update_timestamp + ",booklet_amount=" + booklet_amount + "  where sub_scheme_code=" + sub_scheme_code + " And scheme_code=" + scheme_code + ""




    mysqlPool.query(sql, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->property-->sub_scheme-->updateSubScheme", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Scheme deleted successfully"
            res.send(objectToSend)
        }
    })
})


router.post('/updatefileofSubScheme:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls);

    let objectToSend = {}
    if (req.file != undefined) {
        console.log("Error-->routes-->property-->sub_scheme-->updatefileofSubScheme---Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let db = "svayam_" + obj.b_acct_id + "_property";
        let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
        let scheme_code = SqlString.escape(obj.scheme_code)
        let sub_scheme_code = SqlString.escape(obj.sub_scheme_code)
        let update_user_id = SqlString.escape(obj.update_user_id)
        let brochure_file_name = SqlString.escape(obj.brochure_file_name)


        let sql = "update " + db + ".sub_scheme_info set brochure_file_name=" + brochure_file_name + ",update_user_id=" + update_user_id
            + ",update_timestamp=" + update_timestamp + " where sub_scheme_code=" + sub_scheme_code + " and scheme_code=" + scheme_code + ";"

        mysqlPool.getConnection(function (error, mysqlCon) {

            if (error) {
                console.log("Error-->routes-->property-->sub_scheme--updatefileofSubScheme---", error);
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend)
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->property-->sub_scheme---updatefileofSubScheme---", error1);
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend)
                        mysqlCon.release()
                    } else {



                        mysqlCon.query(sql, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->property-->sub_scheme---updatefileofSubScheme---", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->property-->sub_scheme---updatefileofSubScheme---", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {


                                        try {

                                            var localFile = './routes/property/upload/' + obj.brochure_file_name;
                                            if (!fs.existsSync("./routes/property/upload/broucher")) {
                                                fs.mkdirSync("./routes/property/upload/broucher");
                                            }
                                            var copyLoc = "./routes/property/upload/broucher/" + obj.brochure_file_name + "_" + obj.scheme_code + "_" + obj.sub_scheme_code;
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->property-->sub_scheme---updatefileofSubScheme---", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    mysqlCon.commit(function (error3) {
                                                        if (error3) {
                                                            console.log("124 Error-->hr-->emtalisment_info-->uploadFile--updatefileofSubScheme---", error3);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            objectToSend["error"] = false;
                                                            objectToSend["data"] = "Updated successfully! "
                                                            res.send(objectToSend)
                                                            mysqlCon.release()
                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->property-->sub_scheme---", ex);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
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
