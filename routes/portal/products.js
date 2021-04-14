var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.post('/addProducts', (req, res) => {
    let obj = req.body

    console.log(obj)

    let objectToSend = {}

    let orig_databases = obj["sample_db"]
    let prod_db = obj["product_databases"]

    let prod_codes = obj["prod_codes"]

    let db_codes = obj["database_codes"]

    let user_id = obj["user_id"]

    let domain_info = obj["domain_info"]

    let b_acct_id = obj["b_acct_id"]

    let md_db = "svayam_" + b_acct_id + "_md"

    let sql_insertResource = "insert into " + md_db + ".domain_info (domain_code,domain_db_suffix,domain_name) values "


    for (let i = 0; i < domain_info.length; i++) {
        let tempObj = domain_info[i]
        sql_insertResource += "(" + SqlString.escape(tempObj["domain_code"]) + "," + SqlString.escape(tempObj["domain_db_suffix"]) + "," + SqlString.escape(tempObj["domain_name"]) + ")"

        if (i < domain_info.length - 1) {
            sql_insertResource += ","
        }
    }

    let sql_insertRecords = "insert into " + md_db + ".record_info (record_code,record_business_name,record_technical_name,domain_code,record_type,parent_record_code,reference_data_type,referred_field_code,status) "
        + "Select record_code,record_business_name,record_technical_name,domain_code,record_type,parent_record_code,reference_data_type,referred_field_code,status from " + propObj.svayamMetadataSample + ".record_info where "
        + " domain_code in "




    let sql_insertUserXrefProds = "insert into " + propObj.svayamSystemDbName + ".user_xref_products (user_id,prod_cd) values "


    let temp_db_cd = "("
    for (let i = 0; i < db_codes.length; i++) {
        temp_db_cd += "'" + db_codes[i] + "'"

        sql_insertUserXrefProds += "(" + user_id + "," + SqlString.escape(prod_codes[i]) + ")"

        if (i < db_codes.length - 1) {
            temp_db_cd += ","
            sql_insertUserXrefProds += ","
        }
    }
    temp_db_cd += ")"

    sql_insertRecords += temp_db_cd

    let sql_insertRecXrefFld = "insert into " + md_db + ".record_xref_field (record_code,field_code,parent_record_code,section_of_record,is_extension_natural_key,is_natural_key,col_seq_no) "
        + "Select record_code,field_code,parent_record_code,section_of_record,is_extension_natural_key,is_natural_key,col_seq_no from " + propObj.svayamMetadataSample + ".record_xref_field where record_code in"
        + " (Select record_code from " + propObj.svayamMetadataSample + ".record_info where domain_code in " + temp_db_cd + ")"

    let createDbQueries = []

    let manualRollBack = []

    for (let i = 0; i < prod_db.length; i++) {
        let tempQuery = "create database " + prod_db[i]
        createDbQueries.push(tempQuery)
        manualRollBack.push("drop database if exists " + prod_db[i])
    }

    let createTableQueries = []

    for (let i = 0; i < prod_db.length; i++) {
        let tablesToCreate = propObj.productTables[orig_databases[i]]
        let new_db = prod_db[i]

        for (let j = 0; j < tablesToCreate.length; j++) {

            let tempQuery = "create table " + new_db + "." + tablesToCreate[j] + " like " + orig_databases[i] + "." + tablesToCreate[j]

            createTableQueries.push(tempQuery)
        }
    }


    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->portal-->product-->addProducts--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {

            mysqlCon.query(createDbQueries.join(";") + ";" + createTableQueries.join(";"), function (error2, results2) {
                if (error2) {
                    console.log("Error-->routes-->portal-->product-->addProducts--", error2)

                    mysqlCon.query(manualRollBack.join(";"), function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->portal-->product-->addProducts--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        } else {
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release()
                        }
                    })

                } else {
                    mysqlCon.beginTransaction(function (error4) {
                        if (error4) {
                            console.log("Error-->routes-->portal-->product-->addProducts--", error4)

                            mysqlCon.query(manualRollBack.join(";"), function (error3, results3) {
                                if (error3) {
                                    console.log("Error-->routes-->portal-->product-->addProducts--", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.release()
                                }
                            })
                        } else {
                            mysqlCon.query(sql_insertUserXrefProds + ";" + sql_insertResource + ";" + sql_insertRecords + ";" + sql_insertRecXrefFld, function (error5, results5) {
                                if (error5) {
                                    console.log("Error-->routes-->portal-->product-->addProducts--", error5)
                                    mysqlCon.rollback()
                                    mysqlCon.query(manualRollBack.join(";"), function (error3, results3) {
                                        if (error3) {
                                            console.log("Error-->routes-->portal-->product-->addProducts--", error3)
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = true
                                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                            res.send(objectToSend);
                                            mysqlCon.release()
                                        }
                                    })
                                } else {
                                    mysqlCon.commit(function (error6) {
                                        if (error6) {
                                            console.log("Error-->routes-->portal-->product-->addProducts--", error6)
                                            mysqlCon.rollback()
                                            mysqlCon.query(manualRollBack.join(";"), function (error3, results3) {
                                                if (error3) {
                                                    console.log("Error-->routes-->portal-->product-->addProducts--", error3)
                                                    objectToSend["error"] = true
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend);
                                                    mysqlCon.release()
                                                } else {
                                                    objectToSend["error"] = true
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend);
                                                    mysqlCon.release()
                                                }
                                            })
                                        } else {
                                            objectToSend["error"] = false
                                            objectToSend["data"] = "Product Subscription Complete"
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
        }
    })


})


router.delete('/removeProduct:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)

    let objectToSend = {}

    let b_acct_id = obj["b_acct_id"]

    let prod_db = obj["product_databases"]

    let db_code = obj["database_codes"]

    let user_id = obj["user_id"]

    let prod_cd = obj["prod_codes"]

    let md_db = "svayam_" + b_acct_id + "_md"


    let sql_deleteDomain = "delete from " + md_db + ".domain_info where domain_code=" + SqlString.escape(db_code)
    let sql_deleteRecord = "delete from " + md_db + ".record_info where domain_code=" + SqlString.escape(db_code)
    let sql_deleteRecXrefFld = "delete from " + md_db + ".record_xref_field where record_code in "
        + "(Select record_code from " + md_db + ".record_info where domain_code=" + SqlString.escape(db_code) + ")"
    let sql_deleteUserXrefProduct = "delete from " + propObj.svayamSystemDbName + ".user_xref_products where user_id in (Select user_id from " + propObj.svayamSystemDbName + ".user_info where b_acct_id=" + SqlString.escape(b_acct_id) + ") and prod_cd=" + SqlString.escape(prod_cd)

    let sql_drop_db = "drop database if exists " + prod_db

    mysqlPool.getConnection(function (error1, mysqlCon) {
        if (error1) {
            console.log("Error-->routes-->portal-->product-->deleteProduct--", error1)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error2) {
                if (error2) {
                    console.log("Error-->routes-->portal-->product-->deleteProduct--", error2)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                } else {
                    mysqlCon.query(sql_deleteUserXrefProduct + ";" + sql_deleteDomain + ";" + sql_deleteRecXrefFld + ";" + sql_deleteRecord + ";" + sql_drop_db, function (error3, results3) {
                        if (error3) {
                            console.log("Error-->routes-->portal-->product-->deleteProduct--", error3)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        } else {
                            objectToSend["error"] = false
                            objectToSend["data"] = "Product removed successfully"
                            res.send(objectToSend);
                            mysqlCon.release()
                        }
                    })
                }
            })
        }
    })
})

module.exports = router;