var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con.js')
let mysqlPool = require('../../../connections/mysqlConnection.js');
var moment = require('moment');
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



router.post('/appapplyForLeave', (req, res) => {
    let objectToSend = {}

let obj=req.body

    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])
    let leave_code = SqlString.escape(obj["leave_code"])
    let num_of_leaves = SqlString.escape(obj["num_of_leaves"])
    let leave_status_code = SqlString.escape(obj["leave_status_code"])
    let leave_reason = SqlString.escape(obj["leave_reason"])
    let from_date = SqlString.escape(obj["from_date"])
 let create_user_id = SqlString.escape(obj["create_user_id"])
        let create_timestamp = (moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let year = SqlString.escape(obj["year"])
    let month = SqlString.escape(obj["month"])
    let application_date = SqlString.escape(obj["application_date"])

    let document_type_code = obj.document_type_code;

    let document_name = obj.document_name;

    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    if (document_name != undefined) {
                        let insertSql = "insert into svayam_" + b_acct_id + "_hr.upload_document (emp_id,document_name,document_type_code,create_user_id,create_timestamp) values "
                            + "(" + SqlString.escape(emp_id) + "," + SqlString.escape(document_name) + "," + SqlString.escape(document_type_code) + ","
                            + create_user_id + "," + SqlString.escape(create_timestamp) + ")"

                        mysqlCon.query(insertSql, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                let upload_id = results2.insertId
                                
                                   


                                      
                                           
                                            
                                                

                                                    let sql = "insert into svayam_" + b_acct_id + "_hr.leave_ledger (document_name,document_id,emp_id,leave_code,num_of_leaves,leave_status_code,year,application_date,from_date,leave_reason,month) values"
                                                        + "(" +SqlString.escape( document_name) + "," + upload_id + "," + emp_id + "," + leave_code + "," + num_of_leaves + "," + leave_status_code + "," + year + "," + application_date + "," + from_date + "," + leave_reason + "," + month + ")"

                                                    mysqlCon.query(sql, function (error21, results21) {
                                                        if (error21) {
                                                            console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error21);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            mysqlCon.commit(function (error3) {
                                                                if (error3) {
                                                                    console.log("124 Error-->hr-->emtalisment_info-->uploadFile-", error3);
                                                                    objectToSend["error"] = true;
                                                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                                    res.send(objectToSend)
                                                                    mysqlCon.rollback();
                                                                    mysqlCon.release()
                                                                } else {
                                                                    objectToSend["error"] = false;
                                                                    objectToSend["data"] = {leave_id:results21.insertId,doc_id:results2.insertId}
                                                                    res.send(objectToSend)
                                                                    mysqlCon.release()
                                                                }
                                                            })

                                                        }
                                                    })



                                                
                                           



                                      

                                    

                              
                            }
                        })
                    }
                    else {
                        let sql = "insert into svayam_" + b_acct_id + "_hr.leave_ledger (emp_id,leave_code,num_of_leaves,leave_status_code,year,application_date,from_date,leave_reason,month) values"
                            + "(" + emp_id + "," + leave_code + "," + num_of_leaves + "," + leave_status_code + "," + year + "," + application_date + "," + from_date + "," + leave_reason + "," + month + ")"

                        mysqlCon.query(sql, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                mysqlCon.commit(function (error3) {
                                    if (error3) {
                                        console.log("124 Error-->hr-->emtalisment_info-->uploadFile-", error3);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = results2.insertId
                                        res.send(objectToSend)
                                        mysqlCon.release()
                                    }
                                })

                            }
                        })
                    }


                }
            })
        }
    })
})



router.post('/applyForLeave:dtl', (req, res) => {
    let objectToSend = {}

let obj=JSON.parse(req.params.dtl)

    let b_acct_id = obj["b_acct_id"]
    let emp_id = SqlString.escape(obj["emp_id"])
    let leave_code = SqlString.escape(obj["leave_code"])
    let num_of_leaves = SqlString.escape(obj["num_of_leaves"])
    let leave_status_code = SqlString.escape(obj["leave_status_code"])
    let leave_reason = SqlString.escape(obj["leave_reason"])
    let from_date = SqlString.escape(obj["from_date"])
 let create_user_id = SqlString.escape(obj["create_user_id"])
        let create_timestamp = (moment().format('YYYY-MM-DD HH:mm:ss'))
    
    let year = SqlString.escape(obj["year"])
    let month = SqlString.escape(obj["month"])
    let application_date = SqlString.escape(obj["application_date"])

    let document_type_code = obj.document_type_code;

    let document_name = obj.document_name;

    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
            res.send(objectToSend)
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                    mysqlCon.release()
                } else {
                    if (document_name != undefined) {
                        let insertSql = "insert into svayam_" + b_acct_id + "_hr.upload_document (emp_id,document_name,document_type_code,create_user_id,create_timestamp) values "
                            + "(" + SqlString.escape(emp_id) + "," + SqlString.escape(document_name) + "," + SqlString.escape(document_type_code) + ","
                            + create_user_id + "," + SqlString.escape(create_timestamp) + ")"

                        mysqlCon.query(insertSql, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                let upload_id = results2.insertId
                                upload(req, res, function (err) {
                                    if (err) {
                                        console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", err);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {


                                        try {

                                            var localFile = './uploads/' + document_name;
                                            if (!fs.existsSync("./uploads/upload_hr_file")) {
                                                fs.mkdirSync("./uploads/upload_hr_file");
                                            }
                                            var copyLoc = "./uploads/upload_hr_file/" + document_name + "_" + b_acct_id + "_" + upload_id;
                                            fs.copyFile(localFile, copyLoc, { recursive: true }, (err1) => {
                                                if (err1) {
                                                    console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", err1);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()

                                                } else {

                                                    let sql = "insert into svayam_" + b_acct_id + "_hr.leave_ledger (document_name,document_id,emp_id,leave_code,num_of_leaves,leave_status_code,year,application_date,from_date,leave_reason,month) values"
                                                        + "(" +SqlString.escape( document_name) + "," + upload_id + "," + emp_id + "," + leave_code + "," + num_of_leaves + "," + leave_status_code + "," + year + "," + application_date + "," + from_date + "," + leave_reason + "," + month + ")"

                                                    mysqlCon.query(sql, function (error21, results21) {
                                                        if (error21) {
                                                            console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error21);
                                                            objectToSend["error"] = true;
                                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                            res.send(objectToSend)
                                                            mysqlCon.rollback();
                                                            mysqlCon.release()
                                                        } else {
                                                            mysqlCon.commit(function (error3) {
                                                                if (error3) {
                                                                    console.log("124 Error-->hr-->emtalisment_info-->uploadFile-", error3);
                                                                    objectToSend["error"] = true;
                                                                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                                                    res.send(objectToSend)
                                                                    mysqlCon.rollback();
                                                                    mysqlCon.release()
                                                                } else {
                                                                    objectToSend["error"] = false;
                                                                    objectToSend["data"] = results21.insertId
                                                                    res.send(objectToSend)
                                                                    mysqlCon.release()
                                                                }
                                                            })

                                                        }
                                                    })



                                                }
                                            });



                                        } catch (ex) {
                                            console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", ex);
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                            res.send(objectToSend)
                                        }

                                    }

                                });
                            }
                        })
                    }
                    else {
                        let sql = "insert into svayam_" + b_acct_id + "_hr.leave_ledger (emp_id,leave_code,num_of_leaves,leave_status_code,year,application_date,from_date,leave_reason,month) values"
                            + "(" + emp_id + "," + leave_code + "," + num_of_leaves + "," + leave_status_code + "," + year + "," + application_date + "," + from_date + "," + leave_reason + "," + month + ")"

                        mysqlCon.query(sql, function (error2, results2) {
                            if (error2) {
                                console.log("Error-->routes-->hr-->leave-->leaveledger-->applyForLeave-", error2);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                mysqlCon.commit(function (error3) {
                                    if (error3) {
                                        console.log("124 Error-->hr-->emtalisment_info-->uploadFile-", error3);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = results2.insertId
                                        res.send(objectToSend)
                                        mysqlCon.release()
                                    }
                                })

                            }
                        })
                    }


                }
            })
        }
    })
})

router.put('/rejectLeave', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let leave_ledger_id = SqlString.escape(obj["id"])
    let approval_user_id = SqlString.escape(obj["approval_user_id"])
    let leave_status_code = SqlString.escape(obj["leave_status_code"]);
    let approval_date = SqlString.escape(moment().format('YYYY-MM-DD'))

    let sql = "update svayam_" + b_acct_id + "_hr.leave_ledger set approval_date=" + approval_date + ",leave_status_code=" + leave_status_code + ",approval_user_id=" + approval_user_id + " where id=" + leave_ledger_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveLedger-->RejectLeave", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Leave Rejected"
            res.send(objectToSend);
        }
    })

})

router.put('/approveLeave', (req, res) => {
    let objectToSend = {}
    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let leave_ledger_id = SqlString.escape(obj["id"])
    let approval_user_id = SqlString.escape(obj["approval_user_id"])
    let leave_status_code = SqlString.escape(obj["leave_status_code"]);
    let approval_date = SqlString.escape(moment().format('YYYY-MM-DD'))
    let emp_id = SqlString.escape(obj["emp_id"])
    let year = SqlString.escape(obj["year"])
    let month = SqlString.escape(obj["month"])
    let leave_code = SqlString.escape(obj["leave_code"])
    let num_of_leaves = SqlString.escape(obj["num_of_leaves"])
console.log(obj)
    let sql = "update svayam_" + b_acct_id + "_hr.leave_ledger set approval_date=" + approval_date + ",leave_status_code=" + leave_status_code + ",approval_user_id=" + approval_user_id + " where id=" + leave_ledger_id

    let sql_updRem = "update svayam_" + b_acct_id + "_hr.leave_info set leaves_remaining=leaves_remaining-" + num_of_leaves + " where year=" + year + " and emp_id=" + emp_id
        + " and leave_code=" + leave_code
console.log(sql_updRem)
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveLedger-->approveLeave", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql + ";" + sql_updRem, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            mysqlCon.commit(function (error3) {
                                if (error3) {
                                    console.log("Error-->routes-->hr-->setting-->leaveLedger-->approveLeave", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Leave Approved"
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                }
                            })
                        }
                    })
                }
            })
        }
    })

})

router.get('/getLeaveRecords:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let emp_id = obj["emp_id"]
    let leave_status_code = obj["leave_status_code"]
    let year = obj["year"]
    let month = obj["month"]

    let sql = "Select id,emp_id,leave_code,num_of_leaves,leave_status_code,year,DATE_FORMAT(application_date,'%Y-%m-%d') as application_date,"
        + " DATE_FORMAT(approval_date,'%Y-%m-%d') as approval_date,DATE_FORMAT(from_date,'%Y-%m-%d') as from_date,leave_reason,approval_user_id,month,document_id,document_name from "
        + " svayam_" + b_acct_id + "_hr.leave_ledger "

    let flag = true
    if (emp_id != undefined) {
        sql += " where emp_id=" + SqlString.escape(emp_id)
        flag = false
    }
    if (year != undefined) {
        if (flag) {
            sql += " where year=" + SqlString.escape(year)
            flag = false;
        } else {
            sql += " and year=" + SqlString.escape(year)
        }
    }
    if (month != undefined) {
        if (flag) {
            sql += " where month=" + SqlString.escape(month)
            flag = false;
        } else {
            sql += " and month=" + SqlString.escape(month)
        }
    }
    if (leave_status_code != undefined) {
        if (flag) {
            sql += " where leave_status_code=" + SqlString.escape(leave_status_code)
            flag = false;
        } else {
            sql += " and leave_status_code=" + SqlString.escape(leave_status_code)
        }
    }
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveledger-->getLeaveRecords", error)
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



router.post('/getLedgerDocument', function (req, res) {

    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let document_id = obj.document_id;
    let filename = obj.document_name;

    let objectToSend = {};


    try {



        console.log("./uploads/upload_hr_file/" + filename + "_" + b_acct_id + "_" + document_id);
        fs.readFile("./uploads/upload_hr_file/" + filename + "_" + b_acct_id + "_" + document_id, function (err, content) {
            if (err) {
                console.log("Error-->routes-->hr-->leave-->leaveledger-->getLedgerDocument", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
                res.end(JSON.stringify(objectToSend))
            } else {
                res.writeHead(200, { 'Content-type': 'application/pdf/image' });
                res.end(content);
            }
        });


    } catch (ex) {
        console.log("Error routes-->hr-->emtalisment_info-->uploadfile-->getUploadedFileData--", ex);
        objectToSend["error"] = true;
        objectToSend["data"] = "Can't fetch profile image at the moment. Please try again later"
        res.end(JSON.stringify(objectToSend))
    }
});

router.delete('/deleteLeaveRecord:dtls', (req, res) => {
    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]
  
    let sql = "delete from svayam_" + b_acct_id + "_hr.leave_ledger where id=" + id

  
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->leave-->leaveledger-->deleteLeaveRecord", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = 'Deleted Successfully!'
            res.send(objectToSend);
        }
    })
})

////////
////////




module.exports = router;
