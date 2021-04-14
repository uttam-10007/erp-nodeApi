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



router.get('/getHierarchy:dtls', (req, res) => {

    let objectToSend = {}
    let obj = JSON.parse(req.params.dtls)
    let b_acct_id = obj["b_acct_id"]
    let tb = obj['table_name']


    let sql = "Select id,leaf_cd,leaf_value,lvl1_cd,lvl1_value,lvl2_cd,lvl2_value,lvl3_cd,lvl3_value,lvl4_cd,lvl4_value,lvl5_cd,lvl5_value,lvl6_cd,lvl6_value,lvl7_cd,lvl7_value,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp"
        + " from svayam_" + b_acct_id + "_account." + tb + "";



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->Hierarchy-->getHierarchy--", error)
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

router.post('/createHierarchy', (req, res) => {
    let objectToSend = {}

    let obj = req.body


    let b_acct_id = obj["b_acct_id"]
    let lvl1_cd = SqlString.escape(obj["lvl1_cd"])
    let lvl1_value = SqlString.escape(obj["lvl1_value"])
    let lvl2_cd = SqlString.escape(obj["lvl2_cd"])
    let lvl2_value = SqlString.escape(obj["lvl2_value"])
    let lvl3_cd = SqlString.escape(obj["lvl3_cd"])
    let lvl3_value = SqlString.escape(obj["lvl3_value"])
    let lvl4_cd = SqlString.escape(obj["lvl4_cd"])
    let lvl4_value = SqlString.escape(obj["lvl4_value"])
    let lvl5_cd = SqlString.escape(obj["lvl5_cd"])
    let lvl5_value = SqlString.escape(obj["lvl5_value"])
    let lvl6_cd = SqlString.escape(obj["lvl6_cd"])
    let lvl6_value = SqlString.escape(obj["lvl6_value"])
    let lvl7_cd = SqlString.escape(obj["lvl7_cd"])
    let lvl7_value = SqlString.escape(obj["lvl7_value"])
    let leaf_cd = SqlString.escape(obj["leaf_cd"])
    let leaf_value = SqlString.escape(obj["leaf_value"])

    let tb = obj['table_name']

    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let event_arr = obj["event_arr"]


    let sql = "insert into svayam_" + b_acct_id + "_account." + tb + " (leaf_cd,leaf_value,lvl1_cd,lvl1_value,lvl2_cd,lvl2_value,lvl3_cd,lvl3_value,lvl4_cd,lvl4_value,lvl5_cd,lvl5_value,lvl6_cd,lvl6_value,lvl7_cd,lvl7_value,create_user_id,create_timestamp) values "
        + "(" + leaf_cd + "," + leaf_value + "," + lvl1_cd + "," + lvl1_value + "," + lvl2_cd + "," + lvl2_value + "," + lvl3_cd + "," + lvl3_value + "," + lvl4_cd + "," + lvl4_value + "," + lvl5_cd + "," + lvl5_value + ","
        + lvl6_cd + "," + lvl6_value + "," + lvl7_cd + "," + lvl7_value + ","
        + create_user_id + "," + create_timestamp + ")"






    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->account-->Hierarchy-->createHierarchy--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->account-->Hierarchy-->createHierarchy--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                else {
                    mysqlCon.query(sql, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->account-->Hierarchy-->createHierarchy--", error3)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            if (event_arr.length > 0) {
                                let maxIdQuery = " select max(id) as id from svayam_" + b_acct_id + "_account.events "
                                mysqlPool.query(maxIdQuery, function (error5, results5) {
                                    if (error5) {
                                        console.log("Error-->routes-->account-->Hierarchy-->createHierarchy--", error5)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        let maxId = results5[0].id + 1
                                        let createEvent = "insert into svayam_" + b_acct_id + "_account.events (event_code,event_desc,event_record_code,create_user_id,create_timestamp,bud_cd,prod_cd,proj_cd,act_cd) values"

                                        for (let i = 0; i < event_arr.length; i++) {
                                            let temp = maxId + i
                                            let event_code = "EV" + temp

                                            let eve_code = event_arr[i]["event_code"].split("-");
                                            let event_desc = SqlString.escape(event_arr[i]["event_desc"])
                                            let event_record_code = SqlString.escape(event_arr[i]["event_record_code"])
                                            createEvent += "(" + SqlString.escape(event_code) + "," + event_desc + "," + event_record_code + "," + create_user_id + "," + create_timestamp + "," + SqlString.escape(eve_code[0].trim()) + "," + SqlString.escape(eve_code[1].trim()) + "," + SqlString.escape(eve_code[2].trim()) + "," + SqlString.escape(eve_code[3].trim()) + ")"
                                            if (i < event_arr.length - 1) {
                                                createEvent += ","
                                            }

                                        }


                                        mysqlPool.query(createEvent, function (error4, results4) {
                                            if (error4) {
                                                console.log("Error-->routes-->account-->Hierarchy-->createHierarchy--", error4)
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                res.send(objectToSend)
                                                mysqlCon.rollback();
                                                mysqlCon.release()
                                            } else {


                                                mysqlCon.commit(function (error6) {
                                                    if (error6) {
                                                        console.log("Error-->routes-->account-->Hierarchy-->createHierarchy--", error6)
                                                        objectToSend["error"] = true
                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                        res.send(objectToSend);
                                                        mysqlCon.rollback();
                                                        mysqlCon.release()
                                                    } else {
                                                        objectToSend["error"] = false;
                                                        objectToSend["data"] = 'Created Sucessfully'
                                                        res.send(objectToSend)
                                                        mysqlCon.release()


                                                    }
                                                })
                                            }
                                        })

                                    }
                                })
                            } else {
                                mysqlCon.commit(function (error6) {
                                    if (error6) {
                                        console.log("Error-->routes-->account-->Hierarchy-->createHierarchy--", error6)
                                        objectToSend["error"] = true
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend);
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = 'Created Sucessfully'
                                        res.send(objectToSend)
                                        mysqlCon.release()


                                    }
                                })
                            }


                        }
                    })
                }
            })

        }
    })


})

router.put('/updateHierarchy', (req, res) => {
    let objectToSend = {}

    let obj = req.body;
    let tb = obj['table_name']

    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])
    let lvl1_cd = SqlString.escape(obj["lvl1_cd"])
    let lvl1_value = SqlString.escape(obj["lvl1_value"])
    let lvl2_cd = SqlString.escape(obj["lvl2_cd"])
    let lvl2_value = SqlString.escape(obj["lvl2_value"])
    let lvl3_cd = SqlString.escape(obj["lvl3_cd"])
    let lvl3_value = SqlString.escape(obj["lvl3_value"])
    let lvl4_cd = SqlString.escape(obj["lvl4_cd"])
    let lvl4_value = SqlString.escape(obj["lvl4_value"])
    let lvl5_cd = SqlString.escape(obj["lvl5_cd"])
    let lvl5_value = SqlString.escape(obj["lvl5_value"])
    let lvl6_cd = SqlString.escape(obj["lvl6_cd"])
    let lvl6_value = SqlString.escape(obj["lvl6_value"])
    let lvl7_cd = SqlString.escape(obj["lvl7_cd"])
    let lvl7_value = SqlString.escape(obj["lvl7_value"])
    let leaf_cd = SqlString.escape(obj["leaf_cd"])
    let leaf_value = SqlString.escape(obj["leaf_value"])

    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql = "update svayam_" + b_acct_id + "_account." + tb + " set leaf_cd=" + leaf_cd + ",leaf_value=" + leaf_value + ",lvl1_cd=" + lvl1_cd + ",lvl1_value=" + lvl1_value + ",lvl2_cd=" + lvl2_cd + ",lvl2_value=" + lvl2_value
        + ",lvl3_cd=" + lvl3_cd + ",lvl3_value=" + lvl3_value + ",lvl4_cd=" + lvl4_cd + ",lvl4_value=" + lvl4_value + ",lvl5_cd=" + lvl5_cd + ",lvl5_value=" + lvl5_value + ","
        + "lvl6_cd=" + lvl6_cd + ",lvl6_value=" + lvl6_value + ","

        + "lvl7_cd=" + lvl7_cd + ",lvl7_value=" + lvl7_value + ","
        + "update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + id





    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->Hierarchy-->updateHierarchy--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Hierarchy Updated Successfully"
            res.send(objectToSend);
        }
    })

})


router.delete('/deleteHierarchy:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let tb = obj['table_name']


    let b_acct_id = obj["b_acct_id"]
    let id = SqlString.escape(obj["id"])


    let sql = "delete from svayam_" + b_acct_id + "_account." + tb + " where id=" + id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->Hierarchy-->deleteHierarchy-->", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Hierarchy Deleted Successfully"
            res.send(objectToSend);
        }
    })

})



router.post('/processHierarchyFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->account-->hierarchy-->processHierarchyFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let b_acct_id = obj["b_acct_id"]
        let filename = obj["file_name"];
        let create_user_id = SqlString.escape(obj["create_user_id"])
        let table_name = obj["table_name"]
        obj['create_timestamp'] = moment().format('YYYY-MM-DD HH:mm:ss')

        let event_record_code = SqlString.escape(obj["event_record_code"])



        upload(req, res, function (err) {
            if (err) {
                console.log("Error-->routes-->account-->hierarchy-->processHierarchyFile--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
                mysqlCon.rollback();
                mysqlCon.release()
            } else {

                var body=JSON.stringify(obj) 
                body=body.replace(/"/g,'\\"')
                const exec = require('child_process').exec;
                try {

                    const exec = require('child_process').exec;
                    const childPorcess = exec('java -cp jars/HierarchyProcessing.jar com.svayam.Processing.StartInsertion "' + body+ '"', function (err, stdout, stderr) {
                        if (err) {

                            console.log("Error-->routes-->account-->hierarchy-->processHierarchyFile--", err);

                            objectToSend["error"] = true;

                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."



                            res.end(JSON.stringify(objectToSend))

                        }
                        else {
                            console.log(stdout)
                            res.send(stdout)
                        }
                    });
                } catch (ex) {
                    console.log("Error-->routes-->account-->hierarchy-->processHierarchyFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });





    }
})



router.post('/processActivityFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->account-->hierarchy-->processActivityFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let b_acct_id = obj["b_acct_id"]
        let filename = obj["file_name"];
        let create_user_id = SqlString.escape(obj["create_user_id"])
        let table_name = obj["table_name"]
        let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

        let event_record_code = SqlString.escape(obj["event_record_code"])

        let leafArr = []
        let leafValueArr = []

        upload(req, res, function (err) {
            if (err) {
                console.log("Error-->routes-->account-->hierarchy-->processActivityFile--", err);
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
                        } else if (sh.rowCount < 2) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "No Records found"
                            res.send(objectToSend)
                        } else if (sh.columnCount != 16) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Incorrect number of columns."
                            res.send(objectToSend)
                        } else {
                            let sql = "insert into svayam_" + b_acct_id + "_account." + table_name + " (lvl1_cd,lvl1_value,lvl2_cd,lvl2_value,lvl3_cd,lvl3_value,lvl4_cd,lvl4_value,lvl5_cd,lvl5_value,lvl6_cd,lvl6_value,lvl7_cd,lvl7_value,leaf_cd,leaf_value,create_user_id,create_timestamp) values "

                            //Get all the rows data [1st and 2nd column]
                            for (i = 2; i < sh.rowCount + 1; i++) {
                                let str = "("
                                for (let j = 1; j < 17; j++) {
                                    str += SqlString.escape(sh.getRow(i).getCell(j).value) + ","

                                }
                                leafArr.push(sh.getRow(i).getCell(15).value)
                                leafValueArr.push(sh.getRow(i).getCell(16).value)
                                str += create_user_id + "," + create_timestamp + "),"


                                sql += str;
                            }

                            sql = sql.substring(0, sql.length - 1)




                            mysqlPool.getConnection(function (error1, mysqlCon) {
                                if (error1) {
                                    console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error1)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                } else {
                                    mysqlCon.beginTransaction(function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error2)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.release();
                                        }
                                        else {
                                            var budQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.bud_hier "
                                            var prodQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.prod_hier "
                                            var projQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.proj_hier "

                                            mysqlCon.query(budQuery, function (error51, results51) {

                                                if (error51) {
                                                    console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error51)
                                                    objectToSend["error"] = true
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend);
                                                    mysqlCon.release();
                                                }
                                                else {
                                                    let budArray = results51

                                                    mysqlCon.query(prodQuery, function (error52, results52) {

                                                        if (error52) {
                                                            console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error52)
                                                            objectToSend["error"] = true
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend);
                                                            mysqlCon.release();
                                                        }
                                                        else {
                                                            let prodArray = results52


                                                            mysqlCon.query(projQuery, function (error53, results53) {

                                                                if (error53) {
                                                                    console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error53)
                                                                    objectToSend["error"] = true
                                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                    res.send(objectToSend);
                                                                    mysqlCon.release();
                                                                }
                                                                else {
                                                                    let projArray = results53
                                                                    if (budArray.length > 0 && prodArray.length > 0 && projArray.length > 0) {

                                                                        let maxIdQuery = " select max(id) as id from svayam_" + b_acct_id + "_account.events "
                                                                        mysqlCon.query(maxIdQuery, function (error5, results5) {
                                                                            if (error5) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error5)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {
                                                                                let maxId = results5[0].id + 1

                                                                                let createEvent = "insert into svayam_" + b_acct_id + "_account.events (event_code,event_desc,event_record_code,create_user_id,create_timestamp,bud_cd,prod_cd,proj_cd,act_cd) values"
                                                                                for (let i = 0; i < budArray.length; i++) {

                                                                                    for (let j = 0; j < prodArray.length; j++) {

                                                                                        for (let k = 0; k < projArray.length; k++) {
                                                                                            for (let l = 0; l < leafArr.length; l++) {
                                                                                                let temp = maxId + i + j + k + l
                                                                                                let event_code = "EV" + temp
                                                                                                let event_desc = budArray[i]["leaf_value"] + " from " + leafValueArr[l] + " of " + prodArray[j]["leaf_value"] + " for " + projArray[k]["leaf_value"]
                                                                                                createEvent += "(" + SqlString.escape(event_code) + "," + SqlString.escape(event_desc) + "," + event_record_code + "," + create_user_id + "," + create_timestamp + "," + SqlString.escape(budArray[i]["leaf_cd"])
                                                                                                    + "," + SqlString.escape(prodArray[j]["leaf_cd"]) + "," + SqlString.escape(projArray[k]["leaf_cd"]) + "," + SqlString.escape(leafArr[l]) + "),"
                                                                                            }
                                                                                        }

                                                                                    }

                                                                                }

                                                                                createEvent = createEvent.substring(0, createEvent.length - 1)

                                                                                mysqlCon.query(sql, function (error4, results4) {
                                                                                    if (error4) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error4)
                                                                                        objectToSend["error"] = true;
                                                                                        objectToSend["data"] = error4.sqlMessage

                                                                                        res.send(objectToSend)
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {

                                                                                        mysqlCon.query(createEvent, function (error41, results41) {
                                                                                            if (error41) {
                                                                                                console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error41)
                                                                                                objectToSend["error"] = true;
                                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                                                                res.send(objectToSend)
                                                                                                mysqlCon.rollback();
                                                                                                mysqlCon.release()
                                                                                            } else {

                                                                                                mysqlCon.commit(function (error6) {
                                                                                                    if (error6) {
                                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error6)
                                                                                                        objectToSend["error"] = true
                                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                                        res.send(objectToSend);
                                                                                                        mysqlCon.rollback();
                                                                                                        mysqlCon.release()
                                                                                                    } else {
                                                                                                        console.log("Activity Uploaded Successfully")

                                                                                                        objectToSend["error"] = false;
                                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
                                                                                                        res.send(objectToSend)
                                                                                                        mysqlCon.release()

                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })

                                                                            }
                                                                        })
                                                                        //////
                                                                    } else {

                                                                        mysqlCon.query(sql, function (error3, results41) {
                                                                            if (error3) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error3)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = error3.sqlMessage

                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {

                                                                                mysqlCon.commit(function (error6) {
                                                                                    if (error6) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processActivityFile--", error6)
                                                                                        objectToSend["error"] = true
                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                        res.send(objectToSend);
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {
                                                                                        console.log("Activity Uploaded Successfully")

                                                                                        objectToSend["error"] = false;
                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
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
                                                }
                                            })

                                        }
                                    })
                                }
                            })







                        }
                    })

                } catch (ex) {
                    console.log("Error-->routes-->account-->hierarchy-->processFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });





    }
})

router.post('/processBudgetFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->account-->hierarchy-->processBudgetFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let b_acct_id = obj["b_acct_id"]
        let filename = obj["file_name"];
        let create_user_id = SqlString.escape(obj["create_user_id"])
        let table_name = obj["table_name"]
        let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

        let event_record_code = SqlString.escape(obj["event_record_code"])

        let leafArr = []
        let leafValueArr = []

        upload(req, res, function (err) {
            if (err) {
                console.log("Error-->routes-->account-->hierarchy-->processBudgetFile--", err);
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
                        } else if (sh.rowCount < 2) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "No Records found"
                            res.send(objectToSend)
                        } else if (sh.columnCount != 16) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Incorrect number of columns."
                            res.send(objectToSend)
                        } else {
                            let sql = "insert into svayam_" + b_acct_id + "_account." + table_name + " (lvl1_cd,lvl1_value,lvl2_cd,lvl2_value,lvl3_cd,lvl3_value,lvl4_cd,lvl4_value,lvl5_cd,lvl5_value,lvl6_cd,lvl6_value,lvl7_cd,lvl7_value,leaf_cd,leaf_value,create_user_id,create_timestamp) values "

                            //Get all the rows data [1st and 2nd column]
                            for (i = 2; i < sh.rowCount + 1; i++) {
                                let str = "("
                                for (let j = 1; j < 17; j++) {
                                    str += SqlString.escape(sh.getRow(i).getCell(j).value) + ","

                                }
                                leafArr.push(sh.getRow(i).getCell(15).value)
                                leafValueArr.push(sh.getRow(i).getCell(16).value)
                                str += create_user_id + "," + create_timestamp + "),"


                                sql += str;
                            }

                            sql = sql.substring(0, sql.length - 1)




                            mysqlPool.getConnection(function (error1, mysqlCon) {
                                if (error1) {
                                    console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error1)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                } else {
                                    mysqlCon.beginTransaction(function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error2)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.release();
                                        }
                                        else {
                                            var actQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.activity_hier "
                                            var prodQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.prod_hier "
                                            var projQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.proj_hier "

                                            mysqlCon.query(actQuery, function (error51, results51) {

                                                if (error51) {
                                                    console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error51)
                                                    objectToSend["error"] = true
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend);
                                                    mysqlCon.release();
                                                }
                                                else {
                                                    let actArray = results51

                                                    mysqlCon.query(prodQuery, function (error52, results52) {

                                                        if (error52) {
                                                            console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error52)
                                                            objectToSend["error"] = true
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend);
                                                            mysqlCon.release();
                                                        }
                                                        else {
                                                            let prodArray = results52


                                                            mysqlCon.query(projQuery, function (error53, results53) {

                                                                if (error53) {
                                                                    console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error53)
                                                                    objectToSend["error"] = true
                                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                    res.send(objectToSend);
                                                                    mysqlCon.release();
                                                                }
                                                                else {
                                                                    let projArray = results53
                                                                    if (actArray.length > 0 && prodArray.length > 0 && projArray.length > 0) {

                                                                        let maxIdQuery = " select max(id) as id from svayam_" + b_acct_id + "_account.events "
                                                                        mysqlCon.query(maxIdQuery, function (error5, results5) {
                                                                            if (error5) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error5)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {
                                                                                let maxId = results5[0].id + 1

                                                                                let createEvent = "insert into svayam_" + b_acct_id + "_account.events (event_code,event_desc,event_record_code,create_user_id,create_timestamp,bud_cd,prod_cd,proj_cd,act_cd) values"


                                                                                for (let i = 0; i < actArray.length; i++) {

                                                                                    for (let j = 0; j < prodArray.length; j++) {

                                                                                        for (let k = 0; k < projArray.length; k++) {

                                                                                            for (let l = 0; l < leafArr.length; l++) {
                                                                                                let temp = maxId + i + j + k + l
                                                                                                let event_code = "EV" + temp
                                                                                                let event_desc = leafValueArr[l] + " from " + actArray[i]["leaf_value"] + " of " + prodArray[j]["leaf_value"] + " for " + projArray[k]["leaf_value"]
                                                                                                createEvent += "(" + SqlString.escape(event_code) + "," + SqlString.escape(event_desc) + "," + event_record_code + "," + create_user_id + "," + create_timestamp + "," + SqlString.escape(leafArr[l])
                                                                                                    + "," + SqlString.escape(prodArray[j]["leaf_cd"]) + "," + SqlString.escape(projArray[k]["leaf_cd"]) + "," + SqlString.escape(actArray[i]["leaf_cd"]) + "),"
                                                                                            }
                                                                                        }

                                                                                    }

                                                                                }

                                                                                createEvent = createEvent.substring(0, createEvent.length - 1)

                                                                                mysqlCon.query(sql, function (error4, results4) {
                                                                                    if (error4) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error4)
                                                                                        objectToSend["error"] = true;
                                                                                        objectToSend["data"] = error4.sqlMessage

                                                                                        res.send(objectToSend)
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {

                                                                                        mysqlCon.query(createEvent, function (error41, results41) {
                                                                                            if (error41) {
                                                                                                console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error41)
                                                                                                objectToSend["error"] = true;
                                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                                                                res.send(objectToSend)
                                                                                                mysqlCon.rollback();
                                                                                                mysqlCon.release()
                                                                                            } else {

                                                                                                mysqlCon.commit(function (error6) {
                                                                                                    if (error6) {
                                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error6)
                                                                                                        objectToSend["error"] = true
                                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                                        res.send(objectToSend);
                                                                                                        mysqlCon.rollback();
                                                                                                        mysqlCon.release()
                                                                                                    } else {
                                                                                                        console.log("Budget Uploaded Successfully")

                                                                                                        objectToSend["error"] = false;
                                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
                                                                                                        res.send(objectToSend)
                                                                                                        mysqlCon.release()

                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })

                                                                            }
                                                                        })
                                                                        //////
                                                                    } else {

                                                                        mysqlCon.query(sql, function (error3, results41) {
                                                                            if (error3) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error3)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = error3.sqlMessage

                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {

                                                                                mysqlCon.commit(function (error6) {
                                                                                    if (error6) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processBudgetFile--", error6)
                                                                                        objectToSend["error"] = true
                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                        res.send(objectToSend);
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {
                                                                                        console.log("Budget Uploaded Successfully")

                                                                                        objectToSend["error"] = false;
                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
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
                                                }
                                            })

                                        }
                                    })
                                }
                            })







                        }
                    })

                } catch (ex) {
                    console.log("Error-->routes-->account-->hierarchy-->processBudgetFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });





    }
})






router.post('/processProductFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->account-->hierarchy-->processProductFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let b_acct_id = obj["b_acct_id"]
        let filename = obj["file_name"];
        let create_user_id = SqlString.escape(obj["create_user_id"])
        let table_name = obj["table_name"]
        let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

        let event_record_code = SqlString.escape(obj["event_record_code"])

        let leafArr = []
        let leafValueArr = []

        upload(req, res, function (err) {
            if (err) {
                console.log("Error-->routes-->account-->hierarchy-->processProductFile--", err);
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
                        } else if (sh.rowCount < 2) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "No Records found"
                            res.send(objectToSend)
                        } else if (sh.columnCount != 16) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Incorrect number of columns."
                            res.send(objectToSend)
                        } else {
                            let sql = "insert into svayam_" + b_acct_id + "_account." + table_name + " (lvl1_cd,lvl1_value,lvl2_cd,lvl2_value,lvl3_cd,lvl3_value,lvl4_cd,lvl4_value,lvl5_cd,lvl5_value,lvl6_cd,lvl6_value,lvl7_cd,lvl7_value,leaf_cd,leaf_value,create_user_id,create_timestamp) values "

                            //Get all the rows data [1st and 2nd column]
                            for (i = 2; i < sh.rowCount + 1; i++) {
                                let str = "("
                                for (let j = 1; j < 17; j++) {
                                    str += SqlString.escape(sh.getRow(i).getCell(j).value) + ","

                                }
                                leafArr.push(sh.getRow(i).getCell(15).value)
                                leafValueArr.push(sh.getRow(i).getCell(16).value)
                                str += create_user_id + "," + create_timestamp + "),"


                                sql += str;
                            }

                            sql = sql.substring(0, sql.length - 1)




                            mysqlPool.getConnection(function (error1, mysqlCon) {
                                if (error1) {
                                    console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error1)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                } else {
                                    mysqlCon.beginTransaction(function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error2)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.release();
                                        }
                                        else {
                                            var actQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.activity_hier "
                                            var budQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.bud_hier "
                                            var projQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.proj_hier "

                                            mysqlCon.query(actQuery, function (error51, results51) {

                                                if (error51) {
                                                    console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error51)
                                                    objectToSend["error"] = true
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend);
                                                    mysqlCon.release();
                                                }
                                                else {
                                                    let actArray = results51

                                                    mysqlCon.query(budQuery, function (error52, results52) {

                                                        if (error52) {
                                                            console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error52)
                                                            objectToSend["error"] = true
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend);
                                                            mysqlCon.release();
                                                        }
                                                        else {
                                                            let budArray = results52


                                                            mysqlCon.query(projQuery, function (error53, results53) {

                                                                if (error53) {
                                                                    console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error53)
                                                                    objectToSend["error"] = true
                                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                    res.send(objectToSend);
                                                                    mysqlCon.release();
                                                                }
                                                                else {
                                                                    let projArray = results53
                                                                    if (budArray.length > 0 && actArray.length > 0 && projArray.length > 0) {
                                                                        let maxIdQuery = " select max(id) as id from svayam_" + b_acct_id + "_account.events "
                                                                        mysqlCon.query(maxIdQuery, function (error5, results5) {
                                                                            if (error5) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error5)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {
                                                                                let maxId = results5[0].id + 1

                                                                                let createEvent = "insert into svayam_" + b_acct_id + "_account.events (event_code,event_desc,event_record_code,create_user_id,create_timestamp,bud_cd,prod_cd,proj_cd,act_cd) values"


                                                                                for (let i = 0; i < actArray.length; i++) {
                                                                                    for (let j = 0; j < budArray.length; j++) {
                                                                                        for (let k = 0; k < projArray.length; k++) {
                                                                                            for (let l = 0; l < leafArr.length; l++) {
                                                                                                let temp = maxId + i + j + k + l
                                                                                                let event_code = "EV" + temp
                                                                                                let event_desc = budArray[j]["leaf_value"] + " from " + actArray[i]["leaf_value"] + " of " + leafValueArr[l] + " for " + projArray[k]["leaf_value"]
                                                                                                createEvent += "(" + SqlString.escape(event_code) + "," + SqlString.escape(event_desc) + "," + event_record_code + "," + create_user_id + "," + create_timestamp + "," + SqlString.escape(budArray[j]["leaf_cd"])
                                                                                                    + "," + SqlString.escape(leafArr[l]) + "," + SqlString.escape(projArray[k]["leaf_cd"]) + "," + SqlString.escape(actArray[i]["leaf_cd"]) + "),"



                                                                                            }

                                                                                        }

                                                                                    }

                                                                                }

                                                                                createEvent = createEvent.substring(0, createEvent.length - 1)
                                                                                console.log(createEvent);
                                                                                console.log(sql);
                                                                                mysqlCon.query(sql, function (error4, results4) {
                                                                                    if (error4) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error4)
                                                                                        objectToSend["error"] = true;
                                                                                        objectToSend["data"] = error4.sqlMessage

                                                                                        res.send(objectToSend)
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {

                                                                                        mysqlCon.query(createEvent, function (error41, results41) {
                                                                                            if (error41) {
                                                                                                console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error41)
                                                                                                objectToSend["error"] = true;
                                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                                                                res.send(objectToSend)
                                                                                                mysqlCon.rollback();
                                                                                                mysqlCon.release()
                                                                                            } else {

                                                                                                mysqlCon.commit(function (error6) {
                                                                                                    if (error6) {
                                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error6)
                                                                                                        objectToSend["error"] = true
                                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                                        res.send(objectToSend);
                                                                                                        mysqlCon.rollback();
                                                                                                        mysqlCon.release()
                                                                                                    } else {
                                                                                                        console.log("Product Uploaded Successfully")

                                                                                                        objectToSend["error"] = false;
                                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
                                                                                                        res.send(objectToSend)
                                                                                                        mysqlCon.release()

                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })

                                                                            }
                                                                        })
                                                                        //////
                                                                    } else {

                                                                        mysqlCon.query(sql, function (error3, results41) {
                                                                            if (error3) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error3)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = error3.sqlMessage

                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {

                                                                                mysqlCon.commit(function (error6) {
                                                                                    if (error6) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processProductFile--", error6)
                                                                                        objectToSend["error"] = true
                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                        res.send(objectToSend);
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {
                                                                                        console.log("Product Uploaded Successfully")

                                                                                        objectToSend["error"] = false;
                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
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
                                                }
                                            })

                                        }
                                    })
                                }
                            })







                        }
                    })

                } catch (ex) {
                    console.log("Error-->routes-->account-->hierarchy-->processProductFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });





    }
})





router.post('/processProjectFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->account-->hierarchy-->processProjectFile--Investigate this error in upload--req is->", req);
        objectToSend["error"] = true;
        objectToSend["data"] = "Front end error"
        res.send(objectToSend)

    } else {

        let b_acct_id = obj["b_acct_id"]
        let filename = obj["file_name"];
        let create_user_id = SqlString.escape(obj["create_user_id"])
        let table_name = obj["table_name"]
        let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

        let event_record_code = SqlString.escape(obj["event_record_code"])

        let leafArr = []
        let leafValueArr = []

        upload(req, res, function (err) {
            if (err) {
                console.log("Error-->routes-->account-->hierarchy-->processProjectFile--", err);
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
                        } else if (sh.rowCount < 2) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "No Records found"
                            res.send(objectToSend)
                        } else if (sh.columnCount != 16) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Incorrect number of columns."
                            res.send(objectToSend)
                        } else {
                            let sql = "insert into svayam_" + b_acct_id + "_account." + table_name + " (lvl1_cd,lvl1_value,lvl2_cd,lvl2_value,lvl3_cd,lvl3_value,lvl4_cd,lvl4_value,lvl5_cd,lvl5_value,lvl6_cd,lvl6_value,lvl7_cd,lvl7_value,leaf_cd,leaf_value,create_user_id,create_timestamp) values "

                            //Get all the rows data [1st and 2nd column]
                            for (i = 2; i < sh.rowCount + 1; i++) {
                                let str = "("
                                for (let j = 1; j < 17; j++) {
                                    str += SqlString.escape(sh.getRow(i).getCell(j).value) + ","

                                }
                                leafArr.push(sh.getRow(i).getCell(15).value)
                                leafValueArr.push(sh.getRow(i).getCell(16).value)
                                str += create_user_id + "," + create_timestamp + "),"


                                sql += str;
                            }

                            sql = sql.substring(0, sql.length - 1)




                            mysqlPool.getConnection(function (error1, mysqlCon) {
                                if (error1) {
                                    console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error1)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                } else {
                                    mysqlCon.beginTransaction(function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error2)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.release();
                                        }
                                        else {
                                            var actQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.activity_hier "
                                            var budQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.bud_hier "
                                            var prodQuery = "select leaf_cd,leaf_value from svayam_" + b_acct_id + "_account.prod_hier "

                                            mysqlCon.query(actQuery, function (error51, results51) {

                                                if (error51) {
                                                    console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error51)
                                                    objectToSend["error"] = true
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend);
                                                    mysqlCon.release();
                                                }
                                                else {
                                                    let actArray = results51

                                                    mysqlCon.query(budQuery, function (error52, results52) {

                                                        if (error52) {
                                                            console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error52)
                                                            objectToSend["error"] = true
                                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                            res.send(objectToSend);
                                                            mysqlCon.release();
                                                        }
                                                        else {
                                                            let budArray = results52


                                                            mysqlCon.query(prodQuery, function (error53, results53) {

                                                                if (error53) {
                                                                    console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error53)
                                                                    objectToSend["error"] = true
                                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                    res.send(objectToSend);
                                                                    mysqlCon.release();
                                                                }
                                                                else {
                                                                    let prodArray = results53

                                                                    if (budArray.length > 0 && actArray.length > 0 && prodArray.length > 0) {

                                                                        let maxIdQuery = " select max(id) as id from svayam_" + b_acct_id + "_account.events "
                                                                        mysqlCon.query(maxIdQuery, function (error5, results5) {
                                                                            if (error5) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error5)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {
                                                                                let maxId = results5[0].id + 1

                                                                                let createEvent = "insert into svayam_" + b_acct_id + "_account.events (event_code,event_desc,event_record_code,create_user_id,create_timestamp,bud_cd,prod_cd,proj_cd,act_cd) values"


                                                                                for (let i = 0; i < actArray.length; i++) {

                                                                                    for (let j = 0; j < budArray.length; j++) {

                                                                                        for (let k = 0; k < prodArray.length; k++) {
                                                                                            for (let l = 0; l < leafArr.length; l++) {
                                                                                                let temp = maxId + i + j + k + l
                                                                                                let event_code = "EV" + temp
                                                                                                let event_desc = budArray[j]["leaf_value"] + " from " + actArray[i]["leaf_value"] + " of " + prodArray[k]["leaf_value"] + " for " + leafValueArr[l]
                                                                                                createEvent += "(" + SqlString.escape(event_code) + "," + SqlString.escape(event_desc) + "," + event_record_code + "," + create_user_id + "," + create_timestamp + "," + SqlString.escape(budArray[j]["leaf_cd"])
                                                                                                    + "," + SqlString.escape(prodArray[k]["leaf_cd"]) + "," + SqlString.escape(leafArr[l]) + "," + SqlString.escape(actArray[i]["leaf_cd"]) + "),"



                                                                                            }

                                                                                        }

                                                                                    }

                                                                                }

                                                                                createEvent = createEvent.substring(0, createEvent.length - 1)

                                                                                mysqlCon.query(sql, function (error4, results4) {
                                                                                    if (error4) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error4)
                                                                                        objectToSend["error"] = true;
                                                                                        objectToSend["data"] = error4.sqlMessage

                                                                                        res.send(objectToSend)
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {

                                                                                        mysqlCon.query(createEvent, function (error41, results41) {
                                                                                            if (error41) {
                                                                                                console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error41)
                                                                                                objectToSend["error"] = true;
                                                                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."

                                                                                                res.send(objectToSend)
                                                                                                mysqlCon.rollback();
                                                                                                mysqlCon.release()
                                                                                            } else {

                                                                                                mysqlCon.commit(function (error6) {
                                                                                                    if (error6) {
                                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error6)
                                                                                                        objectToSend["error"] = true
                                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                                        res.send(objectToSend);
                                                                                                        mysqlCon.rollback();
                                                                                                        mysqlCon.release()
                                                                                                    } else {
                                                                                                        console.log("Project Uploaded Successfully")

                                                                                                        objectToSend["error"] = false;
                                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
                                                                                                        res.send(objectToSend)
                                                                                                        mysqlCon.release()

                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })

                                                                            }
                                                                        })
                                                                        //////
                                                                    } else {

                                                                        mysqlCon.query(sql, function (error3, results41) {
                                                                            if (error3) {
                                                                                console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error3)
                                                                                objectToSend["error"] = true;
                                                                                objectToSend["data"] = error3.sqlMessage

                                                                                res.send(objectToSend)
                                                                                mysqlCon.rollback();
                                                                                mysqlCon.release()
                                                                            } else {

                                                                                mysqlCon.commit(function (error6) {
                                                                                    if (error6) {
                                                                                        console.log("Error-->routes-->account-->Hierarchy-->processProjectFile--", error6)
                                                                                        objectToSend["error"] = true
                                                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                                                        res.send(objectToSend);
                                                                                        mysqlCon.rollback();
                                                                                        mysqlCon.release()
                                                                                    } else {
                                                                                        console.log("Project Uploaded Successfully")

                                                                                        objectToSend["error"] = false;
                                                                                        objectToSend["data"] = 'File Processed Sucessfully'
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
                                                }
                                            })

                                        }
                                    })
                                }
                            })







                        }
                    })

                } catch (ex) {
                    console.log("Error-->routes-->account-->hierarchy-->processProjectFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });





    }
})
module.exports = router;
