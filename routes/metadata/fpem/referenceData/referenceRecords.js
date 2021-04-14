var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');

var propObj = require('../../../../config_con.js')
let mysqlPool = require('../../../../connections/mysqlConnection.js');



router.post('/createReferenceRecord', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";
    let sql_insert = "insert into " + db + ".record_info (record_code,record_business_name,record_technical_name,domain_code,record_type,referred_field_code,"
        +"reference_data_type,status) values"
        + " (" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.record_business_name) + "," + SqlString.escape(obj.record_technical_name) 
        + "," + SqlString.escape(obj.domain_code) + "," + SqlString.escape(obj.record_type) + "," + SqlString.escape(obj.referred_field_code) + "," 
        + SqlString.escape(obj.reference_data_type) + ",'1')"

    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                mysqlPool.query(sql_insert, function (error, results) {
                    if (error) {
                        console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord-->", error)
                        objectToSend["error"] = true;
                        if (error.message != undefined || error.message != null) {
                            if (error.message.includes("Duplicate")) {
                                objectToSend["data"] = "Possible duplicates"
                            } else {
                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            }
                        } else {
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                        }

                        res.send(objectToSend)
                        mysqlCon.rollback();
                        mysqlCon.release()
                    } else {

                        let sql_insert = "insert into " + db + ".record_xref_field (record_code,field_code,col_seq_no) values"

                        for (let i = 0; i < obj.data.length; i++) {
                            sql_insert += " (" + SqlString.escape(obj.record_code) + "," + SqlString.escape(obj.data[i].field_code) + "," + i + ") "
                            if (i != obj.data.length - 1) {
                                sql_insert += " ,"
                            }
                        }
                        mysqlPool.query(sql_insert, function (error, results) {
                            if (error) {
                                console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord-->", error)
                                objectToSend["error"] = true;
                                if (error.message != undefined || error.message != null) {
                                    if (error.message.includes("Duplicate")) {
                                        objectToSend["data"] = "Possible duplicates"
                                    } else {
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    }
                                } else {
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                }

                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
                                let sql_getFlds = "Select ri.record_code,ri.field_code,ri.col_seq_no,res.field_technical_name"
                                    + " ,res.datatype_code,dt.datatype_name,dt.datatype_length"
                                    + " from (Select * from " + db + ".record_xref_field where record_code=" + SqlString.escape(obj.record_code) + ") ri "
                                    + " join (Select * from " + db + ".field_info) res on ri.field_code=res.field_code"
                                    + " join (Select datatype_code,datatype_name,datatype_length  from " + db + ".datatype_info ) dt"
                                    + " on res.datatype_code=dt.datatype_code"
                                    + " order by col_seq_no"

                                mysqlCon.query(sql_getFlds, function (error2, results2) {
                                    if (error2) {
                                        console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord", error2)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        let fdata = results2

                                        let sql_dropDb = "drop table if exists " + obj.database_name + "." + obj.record_technical_name + ";";


                                        let sql_create = "create table " + obj.database_name + "." + obj.record_technical_name + " (id int NOT NULL AUTO_INCREMENT,"

                                        for (let i = 0; i < fdata.length; i++) {
                                            let fld_name = fdata[i]["field_technical_name"]
                                            let fld_type = fdata[i]["datatype_name"]
                                            if (fdata[i]["datatype_length"] != 0) {
                                                fld_type += "(" + fdata[i]["datatype_length"] + ")"
                                            }

                                            sql_create += fld_name + " " + fld_type + " "
                                            if (i < fdata.length - 1) {
                                                sql_create += ","
                                            }
                                            else {

                                                sql_create += ",INDEX (id))"
                                            }
                                        }
                                        mysqlCon.query(sql_dropDb + sql_create, function (error3, results3) {
                                            if (error3) {
                                                let querydel = "delete from " + db + ".record_xref_field where record_code=" + SqlString.escape(record_code) + ";"
                                                        querydel += "delete from " + db + ".record_info where record_code=" + SqlString.escape(record_code) + ";"
                                                        mysqlPool.query(querydel, function (error1, results1) {
                                                            if (error1) {
                                                                console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord", error)
                                                               
                                                            }})
                                                console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord", error3)
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                                res.send(objectToSend)
                                                
                                                mysqlCon.release()
                                            } else {

                                                mysqlCon.commit(function (error4) {
                                                    if (error4) {
                                                        console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->--createReferenceRecord", error4)
                                                        objectToSend["error"] = true
                                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                        res.send(objectToSend);
                                                        mysqlCon.rollback();
                                                        mysqlCon.release()
                                                    } else {
                                                        console.log(results)
                                                        objectToSend["error"] = false;
                                                        objectToSend["data"] = results.insertId
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
                    }
                })
            })
        }
    })
})


router.delete('/deleteReferenceRecord:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let record_code = obj.record_code

    //let schema_name = obj.database
    let db = "svayam_" + obj.b_acct_id + "_md";
    let query = "delete from " + db + ".record_xref_field where record_code=" + SqlString.escape(record_code) + ";"
    query += "delete from " + db + ".record_info where record_code=" + SqlString.escape(record_code) + ";"
    /*  if (obj.res_tech_name != null) {
         query += "drop table if exists " + schema_name + "." + obj.res_tech_name + ";"
     } */


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->records-->--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error12) {
                if (error12) {
                    console.log("Error-->routes-->metadata-->records-->--", error12)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                mysqlCon.query(query, function (error1, results1) {
                    if (error1) {
                        console.log("Error-->routes-->metadata-->fpem-->referenceData-->referenceRecords-->deleteRecord-->", error1)
                        objectToSend["error"] = true;
                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                        res.send(objectToSend)
                        mysqlCon.rollback()
                        mysqlCon.release()
                    } else {
                        var query = "drop table if exists " + obj.database_name + "." + obj.table_name + ";"
                        mysqlCon.query(query, function (error11, results1) {
                            if (error11) {
                                console.log("Error-->routes-->metadata-->records-->deleteRecord-->", error11)
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                res.send(objectToSend)
                                mysqlCon.release();
                            } else {
                                objectToSend["error"] = false;
                                objectToSend["data"] = "Record deleted successfully"
                                res.send(objectToSend)
                                mysqlCon.release()
                            }
                        })


                    }
                })
            })
        }
    })
})

router.put('/updateReferenceRecordStructure', (req, res) => {
    let obj = req.body;

    
    let objectToSend = {}

    let record_code = obj["record_code"]

    let b_acct_id = obj["b_acct_id"]

    let domain_db_name = obj["domain_db_name"]

    let record_technical_name = obj["record_technical_name"]

    let field_xref_info = obj["field_xref_info"]

    let md_db = "svayam_" + b_acct_id + "_md"

    let sql_deleteXref = "delete from " + md_db + ".record_xref_field where record_code=" + SqlString.escape(record_code)

    let flag = true

    let sql_insertNewXref = "insert into " + md_db + ".record_xref_field "

    let colNames = null;

    for (let i = 0.; i < field_xref_info.length; i++) {
        let tempObj = field_xref_info[i]
        if (flag) {
            flag = false;
            colNames = Object.keys(tempObj);
            sql_insertNewXref += "("
            for (let j = 0; j < colNames.length; j++) {
                sql_insertNewXref += colNames[j]
                if (j < colNames.length - 1) {
                    sql_insertNewXref += ","
                }
            }
            sql_insertNewXref += ") values"
        }

        sql_insertNewXref += "("
        for (let j = 0; j < colNames.length; j++) {
            sql_insertNewXref += SqlString.escape(tempObj[colNames[j]])
            if (j < colNames.length - 1) {
                sql_insertNewXref += ","
            }

        }
        sql_insertNewXref += ")"

        if (i < field_xref_info.length - 1) {
            sql_insertNewXref += ","
        }
    }

    let old_field_codes = obj["old_field_codes"]
    let new_field_codes = obj["new_field_codes"]

    let deletedCodes = []
    let delCodeMap = {}
    let addedCodes = []

    let involvedFieldCodes = ""

    let oldCodeMap = {}
    for (let i = 0; i < old_field_codes.length; i++) {
        oldCodeMap[old_field_codes[i]] = true
    }

    for (let i = 0; i < new_field_codes.length; i++) {
        if (oldCodeMap[new_field_codes[i]] == undefined) {
            addedCodes.push(new_field_codes[i])
            involvedFieldCodes += "'" + new_field_codes[i] + "',"
        } else {
            delete oldCodeMap[new_field_codes[i]]
        }
    }

    let remainingColumns = Object.keys(oldCodeMap)

    for (let i = 0; i < remainingColumns.length; i++) {
        deletedCodes.push(remainingColumns[i])
        delCodeMap[remainingColumns[i]] = true
        involvedFieldCodes += "'" + remainingColumns[i] + "',"
    }

    involvedFieldCodes += "'null'"



    let sql_fetchFieldInfo = "Select md.field_code,md.field_technical_name,di.datatype_name,di.datatype_length from (Select * from " + md_db + ".field_info where field_code in ("
        + involvedFieldCodes + ")) md join " + md_db + ".datatype_info di on "
        + " md.datatype_code=di.datatype_code"

    let isColDeleted = null;
    let isColAdded = null;

    mysqlPool.query(sql_fetchFieldInfo, function (error, results) {
        if (error) {
            console.log("Error-->routes-->fpem-->-->referenceData-->referenceRecords-->updateRecordStructure--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {

            let deletedColumns = []

            let addedColumns = []

            for(let i=0;i<results.length;i++){
                let tempObj=results[i]
                if(delCodeMap[tempObj["field_code"]]==undefined){
                    addedColumns.push({field_technical_name:tempObj["field_technical_name"],datatype_name:tempObj["datatype_name"],datatype_length:tempObj["datatype_length"]})
                }else{
                    deletedColumns.push(tempObj["field_technical_name"])
                }
            }


            let mainQuery = sql_deleteXref + ";" + sql_insertNewXref

            if (deletedColumns.length > 0) {
                isColDeleted = true;

                mainQuery += ";alter table " + domain_db_name + "." + record_technical_name

                for (let i = 0; i < deletedColumns.length; i++) {
                    mainQuery += " drop COLUMN " + deletedColumns[i]

                    if (i < deletedColumns.length - 1) {
                        mainQuery += ","
                    }
                }


            }
            if (addedColumns.length > 0) {
                isColAdded = true;

                mainQuery += ";alter table " + domain_db_name + "." + record_technical_name

                for (let i = 0; i < addedColumns.length; i++) {

                    tempObj = addedColumns[i]

                    let dtypeLength = tempObj["datatype_length"]

                    mainQuery += " add " + tempObj["field_technical_name"] + " " + tempObj["datatype_name"]
                    if (dtypeLength != 0) {
                        mainQuery += "(" + dtypeLength + ")"
                    }

                    if (i < addedColumns.length - 1) {
                        mainQuery += ","
                    }
                }


            }

            mysqlPool.getConnection(function (error1, mysqlCon) {
                if (error1) {
                    console.log("Error-->routes-->fpem-->-->referenceData-->referenceRecords-->updateRecordStructure--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);

                } else {
                    mysqlCon.beginTransaction(function (error2) {
                        if (error2) {
                            console.log("Error-->routes-->fpem-->-->referenceData-->referenceRecords-->updateRecordStructure--", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        } else {
                            
                            mysqlCon.query(mainQuery, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->fpem-->-->referenceData-->referenceRecords-->updateRecordStructure--", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                } else {
                                    if (isColAdded ||isColDeleted) {
                                        objectToSend["error"] = false
                                        objectToSend["data"] = "Record Structure Updated Successfully"
                                        res.send(objectToSend);
                                        mysqlCon.release()
                                    } else {
                                        mysqlCon.commit(function (error4) {
                                            if (error4) {
                                                console.log("Error-->routes-->fpem-->-->referenceData-->referenceRecords-->updateRecordStructure--", error4)
                                                objectToSend["error"] = true
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                res.send(objectToSend);
                                                mysqlCon.release()
                                            } else {
                                                objectToSend["error"] = false
                                                objectToSend["data"] = "Record Structure Updated Successfully "
                                                res.send(objectToSend);
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
        }
    })
})

router.get('/getReferenceData:dtls', (req, res) => {

    let objectToSend = {}


    let b_acct_id = req.params.dtls;


    let db = "svayam_" + b_acct_id + "_md";

    let sql_fetchCurr = "SELECT r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.status,r.parent_record_code,r.reference_data_type,r.referred_field_code,"
        + "  GROUP_CONCAT(d.field_business_name ORDER BY x.col_seq_no) AS field_business_name,"
        + " GROUP_CONCAT(d.field_technical_name ORDER BY x.col_seq_no) AS field_technical_name, "
        +" GROUP_CONCAT(d.field_code ORDER BY x.col_seq_no) AS field_code"
        + "  FROM (SELECT * FROM " + db + ".record_info WHERE record_type='reference' and domain_code='FPEM') r JOIN " + db + ".record_xref_field x ON"
        +" r.record_code=x.record_code "
        + "  JOIN " + db + ".field_info d ON x.field_code=d.field_code GROUP BY r.record_code,r.record_business_name,"
        +" r.record_technical_name,r.domain_code,r.status"


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceData-->referenceRecords-->getreferencedata--", error)
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



router.post('/insertReferenceData', (req, res) => {

    let objectToSend = {}

    let obj = req.body;
    let data = obj.data;
    let database_name = obj.database_name

    let table_name = obj.table_name
    let arr = Object.keys(data);

    let query = "insert into " + database_name + "." + table_name + " (" + arr.join(",") + ") values ("
    for (let i = 0; i < arr.length; i++) {

        query += SqlString.escape(data[arr[i]])
        if (i < arr.length - 1) {
            query += ","
        }
    }
    query += ")"


    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->insertReferenceData--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Inserted Successfully"

            res.send(objectToSend);
        }
    })
})


router.delete('/deleteReferenceData:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);

    let database_name = obj.database_name

    let table_name = obj.table_name
    let id = obj.id

    let query = "delete from " + database_name + "." + table_name + " where id in (" + id + ")"


    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->deleteReferenceData--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Inserted Successfully"

            res.send(objectToSend);
        }
    })
})


router.post('/truncateReferenceData', (req, res) => {

    let objectToSend = {}

    let obj = req.body;
    let database_technical_name = obj.database_tech_name

    let table_technical_name = obj.table_tech_name


    let query = "truncate table " + database_technical_name + "." + table_technical_name


    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->truncateReferenceData--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Inserted Successfully"

            res.send(objectToSend);
        }
    })
})


router.put('/updateReferenceData', (req, res) => {

    let objectToSend = {}

    let obj = req.body;
    let data = obj.data;
    let database_name = obj.database_name

    let table_name = obj.table_name

    let arr = Object.keys(data);



    let query = "update " + database_name + "." + table_name + " set "
    for (let i = 1; i < arr.length; i++) {

        query += arr[i] + "=" + SqlString.escape(data[arr[i]])
        if (i < arr.length - 1) {
            query += " , "
        }
    }
    query += " where id= " + data.id


    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->updateReferenceData--", error)
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


router.get('/getReferencevalues:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);


    let database = obj.database_name
    let table_name = obj.table_name



    let query = "select * from  " + database + "." + table_name
    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->fpem-->referenceRecords-->getReferenceData--", error)
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




module.exports = router;