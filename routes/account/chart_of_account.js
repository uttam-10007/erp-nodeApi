var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')
var path = require('path');
var multer = require('multer');
const fs = require('fs');
//const ExcelJS = require('exceljs/dist/es5');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {

        callback(null, file.originalname);
    }
});

var Excel = require('exceljs');

var wb = new Excel.Workbook();
const fastCsv = require('fast-csv')

let upload = multer({ storage: storage }).single('file');



router.get('/getchartofaccount:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]

    let sql = "Select leaf_code,leaf_value,id,lvl1_code,lvl1_value,lvl2_code,lvl2_value,lvl3_code,lvl3_value,lvl4_code,lvl4_value,lvl5_code,lvl5_value,lvl6_code,lvl6_value,lvl7_code,lvl7_value,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp"
        + " from svayam_" + b_acct_id + "_account.chart_of_account";



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->chartofAccount-->getChartOfAccount--", error)
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

router.post('/createchartofaccount', (req, res) => {
    let objectToSend = {}

    let obj = req.body


    let b_acct_id = obj["b_acct_id"]
    let lvl1_code = SqlString.escape(obj["lvl1_code"])
    let lvl1_value = SqlString.escape(obj["lvl1_value"])
    let lvl2_code = SqlString.escape(obj["lvl2_code"])
    let lvl2_value = SqlString.escape(obj["lvl2_value"])
    let lvl3_code = SqlString.escape(obj["lvl3_code"])
    let lvl3_value = SqlString.escape(obj["lvl3_value"])
    let lvl4_code = SqlString.escape(obj["lvl4_code"])
    let lvl4_value = SqlString.escape(obj["lvl4_value"])
    let lvl5_code = SqlString.escape(obj["lvl5_code"])
    let lvl5_value = SqlString.escape(obj["lvl5_value"])
    let lvl6_code = SqlString.escape(obj["lvl6_code"])
    let lvl6_value = SqlString.escape(obj["lvl6_value"])
    let lvl7_code = SqlString.escape(obj["lvl7_code"])
    let lvl7_value = SqlString.escape(obj["lvl7_value"])

    let leaf_code = SqlString.escape(obj["leaf_code"])
    let leaf_value = SqlString.escape(obj["leaf_value"])


    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "insert into svayam_" + b_acct_id + "_account.chart_of_account (leaf_code,leaf_value,lvl1_code,lvl1_value,lvl2_code,lvl2_value,lvl3_code,lvl3_value,lvl4_code,lvl4_value,lvl5_code,lvl5_value,lvl6_code,lvl6_value,lvl7_code,lvl7_value,create_user_id,create_timestamp) values "
        + "(" + leaf_code + "," + leaf_value + "," + lvl1_code + "," + lvl1_value + "," + lvl2_code + "," + lvl2_value + "," + lvl3_code + "," + lvl3_value + "," + lvl4_code + "," + lvl4_value + "," + lvl5_code + "," + lvl5_value + ","
        + lvl6_code + "," + lvl6_value + "," + lvl7_code + "," + lvl7_value + ","
        + create_user_id + "," + create_timestamp + ")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->chartOfAccount-->createChartOfAccount--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })


})

router.put('/updatechartofaccount', (req, res) => {
    let objectToSend = {}

    let obj = req.body;

    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])
    let lvl1_code = SqlString.escape(obj["lvl1_code"])
    let lvl1_value = SqlString.escape(obj["lvl1_value"])
    let lvl2_code = SqlString.escape(obj["lvl2_code"])
    let lvl2_value = SqlString.escape(obj["lvl2_value"])
    let lvl3_code = SqlString.escape(obj["lvl3_code"])
    let lvl3_value = SqlString.escape(obj["lvl3_value"])
    let lvl4_code = SqlString.escape(obj["lvl4_code"])
    let lvl4_value = SqlString.escape(obj["lvl4_value"])
    let lvl5_code = SqlString.escape(obj["lvl5_code"])
    let lvl5_value = SqlString.escape(obj["lvl5_value"])
    let lvl6_code = SqlString.escape(obj["lvl6_code"])
    let lvl6_value = SqlString.escape(obj["lvl6_value"])
    let lvl7_code = SqlString.escape(obj["lvl7_code"])
    let lvl7_value = SqlString.escape(obj["lvl7_value"])
    let leaf_code = SqlString.escape(obj["leaf_code"])
    let leaf_value = SqlString.escape(obj["leaf_value"])

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account.chart_of_account set leaf_code=" + leaf_code + ",leaf_value=" + leaf_value + ",lvl1_code=" + lvl1_code + ",lvl1_value=" + lvl1_value + ",lvl2_code=" + lvl2_code + ",lvl2_value=" + lvl2_value
        + ",lvl3_code=" + lvl3_code + ",lvl3_value=" + lvl3_value + ",lvl4_code=" + lvl4_code + ",lvl4_value=" + lvl4_value + ",lvl5_code=" + lvl5_code + ",lvl5_value=" + lvl5_value + ","
        + "lvl6_code=" + lvl6_code + ",lvl6_value=" + lvl6_value + ","

        + "lvl7_code=" + lvl7_code + ",lvl7_value=" + lvl7_value + ","
        + "update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->Chart Of Account-->updateCHartOfAccount--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Chart Of Account Updated Successfully"
            res.send(objectToSend);
        }
    })

})


router.delete('/deletechartofaccount:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)


    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])


    let sql = "delete from svayam_" + b_acct_id + "_account.chart_of_account where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->chartOfAccount-->deletechartofaccount-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Chart Of Account Deleted Successfully"
            res.send(objectToSend);
        }
    })

})

router.post('/processCOAFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->account-->chart_of_account-->processCOAFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let b_acct_id = obj["b_acct_id"]
        let filename = obj["file_name"];
        let create_user_id = obj["create_user_id"]
        let create_timestamp = moment().format('YYYY-MM-DD HH:mm:ss')




        upload(req, res, function (err) {
            if (err) {
                console.log("Error-->routes-->account-->chart_of_account-->processCOAFile--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
                mysqlCon.rollback();
                mysqlCon.release()
            } else {


                try {


                    var attendanceFilePath = './uploads/';
                    let csvData = [];
                    var filePath = path.resolve(attendanceFilePath, filename);
                    wb.xlsx.readFile(filePath).then(function () {

                        var sh = wb.getWorksheet("Sheet2");


                        if (sh == undefined) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "File does not match our template."
                            res.send(objectToSend)
                        }else  if (sh.rowCount < 2) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "No Records found"
                            res.send(objectToSend)
                        }else if( sh.columnCount !=16){
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Incorrect number of columns."
                            res.send(objectToSend)
                        } 
                        else {
                            let sql = "insert into svayam_" + b_acct_id + "_account.chart_of_account (lvl1_code,lvl1_value,lvl2_code,lvl2_value,lvl3_code,lvl3_value,lvl4_code,lvl4_value,lvl5_code,lvl5_value,lvl6_code,lvl6_value,lvl7_code,lvl7_value,leaf_code,leaf_value,create_user_id,create_timestamp) values "

                            //Get all the rows data [1st and 2nd column]
                            for (i = 2; i < sh.rowCount + 1; i++) {
                                let str = "("
                                for (let j = 1; j < 17; j++) {
                                    str += SqlString.escape(sh.getRow(i).getCell(j).value) + ","

                                }
                                str += SqlString.escape(create_user_id) + "," + SqlString.escape(create_timestamp) + "),"


                                sql += str;
                            }

                            sql = sql.substring(0, sql.length - 1)

                            mysqlPool.query(sql, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->account-->chart_of_account-->processCOAFile--", error3);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = error3.sqlMessage
                                    res.send(objectToSend)

                                } else {
                                    console.log("Attendance Uploaded Successfully")
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Successfully Processed!"
                                    res.send(objectToSend)

                                }


                            })
                        }
                    })

                } catch (ex) {
                    console.log("Error-->routes-->account-->chart_of_account-->processCOAFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });





    }
})

module.exports = router;
