var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment = require('moment')
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
const fastCsv=require('fast-csv')

let upload = multer({ storage: storage }).single('attendanceFile');


router.get('/getAttendanceDetail:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    
    let b_acct_id = obj["b_acct_id"]
    let year = obj["year"]
    let month = obj["month"]
    let emp_id = obj["emp_id"]
    let section_code = obj["section_code"]

    let sql = "Select id,emp_id,year,month,section_code,working_days,present_days,absent_days,total_days,leave_days,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp "
        + " from svayam_" + b_acct_id + "_hr.attendance "

    let flag = true

    if (year != undefined) {
        sql += " where year=" + SqlString.escape(year)
        flag = false
    }
    if (month != undefined) {
        if (flag) {
            sql += " where month=" + SqlString.escape(month)
            flag = false
        } else {
            sql += " and month=" + SqlString.escape(month)
        }
    }
    if (section_code != undefined) {
        if (flag) {
            sql += " where section_code=" + SqlString.escape(section_code)
            flag = false
        } else {
            sql += " and section_code=" + SqlString.escape(section_code)
        }
    }
    if (emp_id != undefined) {
        if (flag) {
            sql += " where emp_id=" + SqlString.escape(emp_id)
            flag = false
        } else {
            sql += " and emp_id=" + SqlString.escape(emp_id)
        }
    }
    
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->party-->attendance-->getAttendanceDetail", error)
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

router.post('/addEmployeesAttendanceDetail', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]

    let attendance_detail = obj["attendance_detail"]

    let sql = "insert into svayam_" + b_acct_id + "_hr.attendance (emp_id,year,month,section_code,present_days,absent_days,leave_days,"
        + "total_days,working_days,create_user_id,create_timestamp) values "

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    for (let i = 0; i < attendance_detail.length; i++) {
        let data = attendance_detail[i]

        let emp_id = SqlString.escape(data["emp_id"])
        
        let year = SqlString.escape(data["year"])
        let month = SqlString.escape(data["month"])
        let section_code = SqlString.escape(data["section_code"])
        let present_days = SqlString.escape(data["present_days"])
        let absent_days = SqlString.escape(data["absent_days"])
        let leave_days = SqlString.escape(data["leave_days"])
        let total_days = SqlString.escape(data["total_days"])
        let working_days = SqlString.escape(data["working_days"])
        let create_user_id = SqlString.escape(data["create_user_id"])

        sql += "(" + emp_id  + "," + year + "," + month + "," + section_code + "," + present_days + "," + absent_days + "," + leave_days + "," + total_days +","+working_days + "," + create_user_id + "," + create_timestamp + ")"

        if (i < attendance_detail.length - 1) {
            sql += ","
        }

    }

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->party-->attendance-->addEmployeesAttendanceDetail", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            if (attendance_detail.length == 1) {
                objectToSend["data"] = results.insertId
            } else {
                objectToSend["data"] = "Attendance Added successfully"
            }

            res.send(objectToSend);
        }
    })
})



router.put('/updateAttendanceDetail', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let present_days = SqlString.escape(obj["present_days"])
    let absent_days = SqlString.escape(obj["absent_days"])
    let leave_days = SqlString.escape(obj["leave_days"])
    let total_days = SqlString.escape(obj["total_days"])
    let working_days = SqlString.escape(obj["working_days"])
    let id = SqlString.escape(obj["id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let update_user_id=SqlString.escape(obj["update_user_id"])

    let sql = "update svayam_" + b_acct_id + "_hr.attendance set absent_days=" + absent_days + ","
        +"leave_days=" + leave_days + ",present_days=" + present_days + ",total_days=" + total_days + ",working_days=" + working_days + ",update_user_id="+update_user_id+",update_timestamp="+update_timestamp+" where "
        + " id =" + id
    

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->party-->attendance-->getAttendanceDetail", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Attendance Updated Successfully"
            res.send(objectToSend);
        }
    })
})


router.post('/processAttendanceFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};
    

    if (req.file != undefined) {
        console.log("Error-->routes-->hr-->party-->attendance-->processAttendanceFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let b_acct_id = obj["b_acct_id"]
        let filename = obj["file_name"];
        let is_header_present=obj["is_header_present"]
        let create_user_id=obj["create_user_id"]
        let create_timestamp=moment().format('YYYY-MM-DD HH:mm:ss')
        const reqColumns=9
    
        
        

        upload(req, res, function (err) {
            if (err) {
                console.log("Error-->routes-->hr-->party-->attendance-->processAttendanceFile--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
                mysqlCon.rollback();
                mysqlCon.release()
            } else {


                try {
                    let parseOptions={skipRows:is_header_present,
                                        trim:true,
                                    strictColumnHandling:true}
        
                    var attendanceFilePath = './uploads/' + filename;
                    let csvData = [];
        
                    let csvStream=fastCsv.parseFile(attendanceFilePath,parseOptions)
                                
                                .on('data',function(data){
                                    data.push(create_user_id)
                                    data.push(create_timestamp)
                                    csvData.push(data)
                                    
                                })
                                .on('error',function(error1){
                                    console.log("error")
                                    console.log("Error-->routes-->hr-->party-->attendance-->processAttendanceFile--", error1);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Unparsable csv data"
                                    res.send(objectToSend)
                                })
                                .on('data-invalid',function(error2){
                                    console.log("invalid")
                                    console.log("Error-->routes-->hr-->party-->attendance-->processAttendanceFile--", error2);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Invalid CSV file "
                                    res.send(objectToSend)
                                    
                                })
                                .on('end',function(rc){
                                    
                                    if(csvData.length==0){
                                        console.log("Error-->routes-->hr-->party-->attendance-->processAttendanceFile--zero records");
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "File either contains zero records records or invalid records"
                                        res.send(objectToSend)
                                    }else{
                                        let sql="insert into svayam_"+b_acct_id+"_hr.attendance (emp_id,year,month,section_code,present_days,absent_days,leave_days,total_days,working_days,create_user_id,create_timestamp) values ?"
                                        mysqlPool.query(sql,[csvData],function(error3,results3){
                                            if(error3){
                                                console.log("Error-->routes-->hr-->party-->attendance-->processAttendanceFile--", error3);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Unable to insert data into database. Make sure data is valid and have exactly 9 columns"
                                                res.send(objectToSend)
                                               
                                            }else{
                                                console.log("Attendance Uploaded Successfully")
                                                objectToSend["error"] = false;
                                                objectToSend["data"] = "Attendence of "+csvData.length+" employees recorded"
                                                res.send(objectToSend)
                                                
                                            }
                                        })
                                    }
                                    
                                    
                                })
                    
        
        
                } catch (ex) {
                    console.log("Error-->routes-->hr-->party-->attendance-->processAttendanceFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });
 




    }
})

module.exports = router;