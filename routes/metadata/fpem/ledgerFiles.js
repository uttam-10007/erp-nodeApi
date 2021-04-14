var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}



router.get('/getjournal:dtls', (req, res) => {

    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls);
    let filter = obj.filter;
    let arr = Object.keys(filter);
    let db = "svayam_" + obj.b_acct_id + "_md";

    let sql_fetchFldCode = "SELECT r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.reference_data_type,r.referred_field_code,r.`status`, GROUP_CONCAT(x.field_code ORDER BY x.col_seq_no) AS field_code,GROUP_CONCAT(x.section_of_record ORDER BY x.col_seq_no) AS section_of_record,GROUP_CONCAT(f.field_logical_id ORDER BY x.col_seq_no) AS field_logical_id,GROUP_CONCAT(x.is_extension_natural_key ORDER BY x.col_seq_no) AS is_extension_natural_key,GROUP_CONCAT(f.field_technical_name ORDER BY x.col_seq_no) AS field_technical_name,GROUP_CONCAT(f.field_business_name ORDER BY x.col_seq_no) AS field_business_name,GROUP_CONCAT(x.is_natural_key ORDER BY x.col_seq_no) AS is_natural_key,GROUP_CONCAT(x.col_seq_no ORDER BY x.col_seq_no) AS col_seq_no FROM (SELECT * FROM "+db+".record_info WHERE "
    for (let i = 0; i < arr.length; i++) {

        sql_fetchFldCode += arr[i] + " in (" 
        
        + SqlString.escape(filter[arr[i]])
        if (i < arr.length - 1) {
            sql_fetchFldCode += ") and "
        }
    } 
    sql_fetchFldCode +=")) r JOIN "+db+".record_xref_field x ON r.record_code=x.record_code JOIN "+db+".field_info f ON x.field_code=f.field_code GROUP BY r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.reference_data_type,r.referred_field_code,r.`status`"


    mysqlPool.query(sql_fetchFldCode, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->ledgerFiles-->getjournal--", error)
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

router.get('/getLedgerFields:dtls', (req, res) => {

    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls);
    let filter = obj.filter;
    let arr = Object.keys(filter);
    let db = "svayam_" + obj.b_acct_id + "_md";

    
    let sql_fetchFldCode = "SELECT r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.reference_data_type,r.referred_field_code,r.`status`, GROUP_CONCAT(x.field_code ORDER BY x.col_seq_no) AS field_code,GROUP_CONCAT(x.section_of_record ORDER BY x.col_seq_no) AS section_of_record,GROUP_CONCAT(f.field_logical_id ORDER BY x.col_seq_no) AS field_logical_id,GROUP_CONCAT(x.is_extension_natural_key ORDER BY x.col_seq_no) AS is_extension_natural_key,GROUP_CONCAT(f.field_technical_name ORDER BY x.col_seq_no) AS field_technical_name,GROUP_CONCAT(f.field_business_name ORDER BY x.col_seq_no) AS field_business_name,GROUP_CONCAT(x.is_natural_key ORDER BY x.col_seq_no) AS is_natural_key,GROUP_CONCAT(x.col_seq_no ORDER BY x.col_seq_no) AS col_seq_no FROM (SELECT * FROM "+db+".record_info WHERE "
    for (let i = 0; i < arr.length; i++) {

        sql_fetchFldCode += arr[i] + " in (" 
        for (let j = 0; j < filter[arr[i]].length; j++) {
            sql_fetchFldCode += SqlString.escape(filter[arr[i]][j])
            if (j < filter[arr[i]].length - 1) {
                sql_fetchFldCode += ","
            }
            
        }
        if (i < arr.length - 1) {
            sql_fetchFldCode += ") and "
        }
    } 
    sql_fetchFldCode +=")) r JOIN "+db+".record_xref_field x ON r.record_code=x.record_code JOIN "+db+".field_info f ON x.field_code=f.field_code GROUP BY r.record_code,r.record_business_name,r.record_technical_name,r.domain_code,r.record_type,r.reference_data_type,r.referred_field_code,r.`status`"

    
    mysqlPool.query(sql_fetchFldCode, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->ledgerFiles-->getjournal--", error)
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

router.put('/updateLedgerFile', (req, res) => {
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
            console.log("Error-->routes-->metadata-->ledgerFiles-->updateRecordStructure--", error)
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
                    console.log("Error-->routes-->metadata-->ledgerFiles-->updateRecordStructure--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);

                } else {
                    mysqlCon.beginTransaction(function (error2) {
                        if (error2) {
                            console.log("Error-->routes-->metadata-->ledgerFiles-->updateRecordStructure--", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        } else {
                            
                            mysqlCon.query(mainQuery, function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->metadata-->ledgerFiles-->updateRecordStructure--", error3)
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
                                                console.log("Error-->routes-->metadata-->ledgerFiles-->updateRecordStructure--", error4)
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





module.exports=router;