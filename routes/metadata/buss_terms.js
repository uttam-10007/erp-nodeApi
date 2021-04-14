var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');
var mysqlPool = require('../../connections/mysqlConnection.js');
var moment = require('moment')

var path = require('path');
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

var Excel = require('exceljs');

var wb = new Excel.Workbook();

let upload = multer({ storage: storage }).single('file');

const readXlsxFile = require('read-excel-file/node');



router.get('/getAllBusinessTerms:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls
    let db = "svayam_" + b_acct_id + "_md";

    let sql_fetchCurr = "Select id,business_code,business_term,definition,domain,business_datatype,master_data,default_value,hierarchy,create_user_id,update_user_id,"
        + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as update_timestamp from " + db + ".buss_terms"

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->buss_terms-->getAllBusinessTerms--", error)
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


router.post('/createBusinessTerm', (req, res) => {

    let objectToSend = {}

    let obj = req.body;
    let domain = SqlString.escape(obj.domain)

    let business_code = SqlString.escape(obj.business_code)
    let business_term = SqlString.escape(obj.business_term)
    let definition = SqlString.escape(obj.definition)
    let business_datatype = SqlString.escape(obj.business_datatype)
    let master_data = SqlString.escape(obj.master_data)
    let default_value = SqlString.escape(obj.default_value)
    let hierarchy = SqlString.escape(obj.hierarchy)
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql = "insert into " + db + ".buss_terms (business_code,business_term,definition,business_datatype,domain,master_data,default_value,hierarchy,create_user_id,"
        + "create_timestamp) values(" + business_code + "," + business_term + "," + definition + "," + business_datatype + "," + domain + "," + master_data + "," + default_value + "," + hierarchy + "," + create_user_id + ","
        + create_timestamp + ")"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->buss_terms-->createBusinessTerm--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server Side. Please try again later"

            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId

            res.send(objectToSend);
        }
    })
})

router.delete('/deleteBusinessTerm:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql = "delete from " + db + ".buss_terms where id in ('" + id.join("','") + "')"


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->buss_terms-->deleteBusinessTerm--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server Side. Please try again later"

            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully."

            res.send(objectToSend);
        }
    })

})

router.put('/updateBusinessTerm', (req, res) => {
    let objectToSend = {}

    let obj = req.body;
    let id = SqlString.escape(obj.id)
    let domain = SqlString.escape(obj.domain)

    let business_code = SqlString.escape(obj.business_code)
    let business_term = SqlString.escape(obj.business_term)
    let definition = SqlString.escape(obj.definition)
    let business_datatype = SqlString.escape(obj.business_datatype)
    let master_data = SqlString.escape(obj.master_data)
    let default_value = SqlString.escape(obj.default_value)
    let hierarchy = SqlString.escape(obj.hierarchy)
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql = "update " + db + ".buss_terms set business_code=" + business_code + ",business_term=" + business_term + ",domain=" + domain
        + ",definition=" + definition + ",business_datatype=" + business_datatype + ",master_data=" + master_data + ",default_value=" + default_value
        + ",hierarchy=" + hierarchy + ",update_user_id=" + update_user_id + ",update_timestamp=" + update_timestamp + " where id=" + id


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->buss_terms-->updateBusinessTerm--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server Side. Please try again later"

            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully."

            res.send(objectToSend);
        }
    })

})











router.post('/processBussinessTermFile:dtl', function (req, res) {

    let obj = JSON.parse(req.params.dtl);
    let objectToSend = {};


    if (req.file != undefined) {
        console.log("Error-->routes-->metadata-->buss_terms-->processBussinessTermFile--Investigate this error in upload--req is->", req);
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
                console.log("Error-->routes-->metadata-->buss_terms-->processBussinessTermFile--", err);
                objectToSend["error"] = true;
                objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                res.send(objectToSend)
                mysqlCon.rollback();
                mysqlCon.release()
            } else {


                try {


                    var FilePath = './uploads/';
                
                    let sql = "insert into svayam_" + b_acct_id + "_md.buss_terms (business_code,business_term,definition,domain,business_datatype,master_data,default_value,hierarchy,create_user_id,"
                        + "create_timestamp) values"

                    readXlsxFile(FilePath + filename, { sheet: 2 }).then((rows) => {

                        if (rows.length < 2) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "No Records Found."
                            res.send(objectToSend)
                        } else if (rows[1].length != 8) {
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Incorrect number of columns."
                            res.send(objectToSend)
                        } else {
                            for (i = 1; i < rows.length; i++) {
                                let str = "("

                                for (let j = 0; j < 8; j++) {

                                    str += SqlString.escape(rows[i][j]) + ","

                                }
                                str += SqlString.escape(create_user_id) + "," + SqlString.escape(create_timestamp) + "),"


                                sql += str;
                            }

                            sql = sql.substring(0, sql.length - 1)
                            mysqlPool.query(sql, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->metadata-->buss_terms-->processBussinessTermFile--", error3);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = error3.sqlMessage
                                    res.send(objectToSend)

                                } else {
                                    console.log("Business Terms Uploaded Successfully")
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Business Terms Uploaded Successfully"
                                    res.send(objectToSend)

                                }


                            })
                        }
                    })

                    // wb.xlsx.readFile(filePath).then(function () {

                    //     var sh = wb.getWorksheet("Sheet2");

                    //     if (sh == undefined) {
                    //         objectToSend["error"] = true;
                    //         objectToSend["data"] = "File does not match our template."
                    //         res.send(objectToSend)
                    //     }else if( sh.columnCount !=8){
                    //         objectToSend["error"] = true;
                    //         objectToSend["data"] = "Incorrect number of columns."
                    //         res.send(objectToSend)
                    //     }
                    //     else if (sh.rowCount < 2) {
                    //         objectToSend["error"] = true;
                    //         objectToSend["data"] = "No Records Found."
                    //         res.send(objectToSend)
                    //     } else {
                    //         let sql = "insert into svayam_" + b_acct_id + "_md.buss_terms (business_code,business_term,definition,domain,business_datatype,master_data,default_value,hierarchy,create_user_id,"
                    //             + "create_timestamp) values"
                    //             let count=sh.columnCount

                    //         for (i = 2; i < sh.rowCount + 1; i++) {
                    //             let str = "("

                    //             for (let j = 1; j < 9; j++) {

                    //                 str += SqlString.escape(sh.getRow(i).getCell(j).value.toString()) + ","

                    //             }
                    //             str += SqlString.escape(create_user_id) + "," + SqlString.escape(create_timestamp) + "),"


                    //             sql += str;
                    //         }

                    //         sql = sql.substring(0, sql.length - 1)

                    //         mysqlPool.query(sql, function (error3, results3) {
                    //             if (error3) {
                    //                 console.log("Error-->routes-->metadata-->buss_terms-->processBussinessTermFile--", error3);
                    //                 objectToSend["error"] = true;
                    //                 objectToSend["data"] = error3.sqlMessage
                    //                 res.send(objectToSend)

                    //             } else {
                    //                 console.log("Business Terms Uploaded Successfully")
                    //                 objectToSend["error"] = false;
                    //                 objectToSend["data"] = "Business Terms Uploaded Successfully"
                    //                 res.send(objectToSend)

                    //             }


                    //         })
                    //     }
                    // })
                } catch (ex) {
                    console.log("Error-->routes-->metadata-->buss_terms-->processBussinessTermFile--", ex);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side Error. Can't upload file at the moment "
                    res.send(objectToSend)
                }

            }

        });





    }
})


module.exports = router;
