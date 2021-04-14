var express = require('express');
var router = express.Router();
var propObj = require('../../config_con.js')
var mysqlPool = require('../../connections/mysqlConnection.js');
var hiveconnection = require('../../connections/hiveconnection.js');
var hiveDbCon = hiveconnection.hivecon;
var SqlString = require('sqlstring');


router.delete("/deleteRow:dtls", (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let acct_id = obj.acct_id
    let uuid = obj.uuid
    let ref_file_id = obj.ref_file_id

    let sql_delRow = "delete from svayam_" + acct_id + "_data.ref_file_" + ref_file_id + " where uuid IN("+uuid+")";

    if (obj.store == "MySQL") {
        
        mysqlPool.query(sql_delRow, function (error, results) {
            if (error) {
                console.log("Error-->routes-->referenceData-->referenceIngestion-->deleteRow--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                objectToSend["error"] = false
                objectToSend["data"] = "Row Deleted Successfully"
                res.send(objectToSend);
            }
        });
    } else {
        executeQueryInHive(sql_delRow, function (error) {
            if (error) {
                console.log("Error-->routes-->referenceData-->referenceIngestion-->deleteRow--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                objectToSend["error"] = false
                objectToSend["data"] = "Row Deleted Successfully"
                res.send(objectToSend);
            }
        })
    }
})

router.put("/updateRow", (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let data = obj.data
    let ref_file_id = obj.ref_file_id
    let acct_id = obj.acct_id

    let sql_update = "update svayam_" + acct_id + "_data.ref_file_" + ref_file_id + " set "
    let uuid = obj.uuid;

    let flds=Object.keys(data)

    for (let i = 0; i < flds.length; i++) {
        sql_update += " " + flds[i] + "=" + SqlString.escape(data[flds[i]])

        

        if (i < flds.length - 1) {
            sql_update += ","
        }
    }

    sql_update += " where uuid=" + SqlString.escape(uuid);

    if (obj.store == "MySQL") {
        mysqlPool.query(sql_update, function (error, results) {
            if (error) {
                console.log("Error-->routes-->referenceData-->referenceIngestion-->updateRow--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                objectToSend["error"] = false
                objectToSend["data"] = "Row updated Successfully"
                res.send(objectToSend);
            }
        })
    } else {
        executeQueryInHive(sql_update, function (error) {
            if (error) {
                console.log("Error-->routes-->referenceData-->referenceIngestion-->updateRow--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                objectToSend["error"] = false
                objectToSend["data"] = "Row updated Successfully"
                res.send(objectToSend);
            }
        })
    }

})

router.post('/addRow', (req, res) => {
    let objectToSend = {}

    let obj = req.body;

    let data = obj.data;
    if (obj.store == "MySQL") {
        let sql_addRow = "insert into svayam_" + obj.acct_id + "_data.ref_file_" + obj.ref_file_id + " (is_active"

        let colNames = Object.keys(data)

        for (let i = 0; i < colNames.length; i++) {
            sql_addRow += "," + colNames[i]
        }

        sql_addRow += ") values (0"

        for (let i = 0; i < colNames.length; i++) {
            sql_addRow += "," + SqlString.escape(data[colNames[i]])
        }

        sql_addRow += ")"

        mysqlPool.query(sql_addRow, function (error, results) {
            
                if (error) {
                    console.log("Error-->routes-->referenceData-->referenceIngestion-->addRow--", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else {
                    objectToSend["error"] = false
                    objectToSend["data"] = results.insertId
                    res.send(objectToSend);
                }
            
        })
    } else {
        let sql_getMaxId = "Select max(" + propObj.ref_uuid + ") as uuid from svayam_" + obj.acct_id + "_data.ref_file_" + obj.ref_file_id

        fetchDataFromHive(sql_getMaxId, function (error, results) {
            if (error) {
                console.log("Error-->routes-->referenceData-->referenceIngestion-->addRow--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {

                let uuid = 1;

                if (results.length > 0 && results[0]["uuid"] != null) {
                    uuid = results[0]["uuid"] + 1
                }

                let sql_addRow = "insert into svayam_" + obj.acct_id + "_data.ref_file_" + obj.ref_file_id + " (" + propObj.ref_uuid + ",is_active"

                let colNames = Object.keys(data)

                for (let i = 0; i < colNames.length; i++) {
                    sql_addRow += "," + colNames[i]
                }

                sql_addRow += ") values (" + uuid + ",0"

                for (let i = 0; i < colNames.length; i++) {
                    sql_addRow += "," + SqlString.escape(data[colNames[i]])
                }

                sql_addRow += ")"

                executeQueryInHive(sql_addRow,function(error1){
                    if(error1){
                        console.log("Error-->routes-->referenceData-->referenceIngestion-->addRow--", error)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                    }else{
                        objectToSend["error"] = false
                        objectToSend["data"] = uuid
                        res.send(objectToSend);
                    }
                })
            }
        })
    }


})

router.delete("/deleteAllRows:dtls",(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let sql_truncate="truncate table svayam_"+obj.acct_id+"_data.ref_file_"+obj.ref_file_id

    if(obj.store=="MySQL"){
        mysqlPool.query(sql_truncate,function(error,results){
            if(error){
                console.log("Error-->routes-->referenceData-->referenceIngestion-->deleteAllRows--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend); 
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = "All rows deleted successfully"
                res.send(objectToSend); 
            }
        })
    }else{
        executeQueryInHive(sql_truncate,function(error){
            if(error){
                console.log("Error-->routes-->referenceData-->referenceIngestion-->deleteAllRows--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend); 
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = "All rows deleted successfully"
                res.send(objectToSend); 
            }
        })
    }
})

router.put("/changeStateOfAllRows",(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let sql_changeState="update svayam_"+obj.acct_id+"_data.ref_file_"+obj.ref_file_id+" set is_active="+SqlString.escape(obj.state)

    if(obj.store=="MySQL"){
        mysqlPool.query(sql_changeState,function(error,results){
            if(error){
                console.log("Error-->routes-->referenceData-->referenceIngestion-->changeStateOfAllRows--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend); 
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = (obj.state==1)?'Activated':'Deactivated'+" all rows successfully"
                res.send(objectToSend); 
            }
        })
    }else{
        executeQueryInHive(sql_changeState,function(error){
            if(error){
                console.log("Error-->routes-->referenceData-->referenceIngestion-->changeStateOfAllRows--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend); 
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = (obj.state==1)?'Activated':'Deactivated'+" all rows successfully"
                res.send(objectToSend); 
            }
        })
    }
})

function fetchDataFromHive(hql, callback) {
    hiveDbCon.reserve(function (err4, connObj) {
        if (err4) {
            hiveDbCon.release(connObj, function (err8) {
                if (err8) {
                    console.log("Error-->routes-->referenceData-->referenceIngestion-->--Error while releasing con", err8)
                } else {
                    console.log("Hive conn released")
                }
            })
            return callback(err4, null)
        } else {
            var conn = connObj.conn;


            conn.createStatement(function (err1, statement) {
                if (err1) {
                    hiveDbCon.release(connObj, function (err8) {
                        if (err8) {
                            console.log("Error-->routes-->referenceData-->referenceIngestion-->--Error while releasing con", err8)
                        } else {
                            console.log("Hive conn released")
                        }
                    })
                    return callback(err1, null)
                } else {
                    statement.executeQuery(hql, function (err2, rows) {
                        if (err2) {
                            hiveDbCon.release(connObj, function (err8) {
                                if (err8) {
                                    console.log("Error-->routes-->referenceData-->referenceIngestion-->--Error while releasing con", err8)
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            return callback(err2, null)
                        } else {
                            rows.toObjArray(function (error, rs) {
                                if (error) {

                                    hiveDbCon.release(connObj, function (err8) {
                                        if (err8) {
                                            console.log("Error-->routes-->referenceData-->referenceIngestion-->--Error while releasing con", err8)
                                        } else {
                                            console.log("Hive conn released")
                                        }
                                    })
                                    return callback(error, null)


                                } else {
                                    hiveDbCon.release(connObj, function (err8) {
                                        if (err8) {
                                            console.log("Error-->routes-->referenceData-->referenceIngestion-->--Error while releasing con", err8)
                                        } else {
                                            console.log("Hive conn released")
                                        }
                                    })

                                    return callback(null, rs)


                                }

                            })
                        }
                    })
                }

            })


        }
    })
}

function executeQueryInHive(query, callback) {

    hiveDbCon.reserve(async function (err4, connObj) {
        if (err4) {

            return callback(err4)

        } else {

            var conn = connObj.conn;

            conn.createStatement(function (err, statement) {
                if (err) {
                    hiveDbCon.release(connObj, function (err) {
                        if (err) {
                            console.log(err.message);
                        } else {
                            console.log("Hive conn released")
                        }
                    })
                    callback(err)

                } else {
                    statement.executeUpdate(query, function (err1, count) {
                        if (err1) {
                            hiveDbCon.release(connObj, function (err4) {
                                if (err4) {
                                    console.log(err.message);
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            callback(err)

                        } else {
                            hiveDbCon.release(connObj, function (err) {
                                if (err) {
                                    console.log(err.message);
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            callback(null)
                        }
                    })




                }
            })

        }
    })

}


module.exports = router;