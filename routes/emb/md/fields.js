var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/getFields:dtls',(req,res)=>{
    let objectToSend={}

    
    let obj=JSON.parse(req.params.dtls)
 
    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".field_info"



    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->md-->fields-->getFields--", error)
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


router.post('/createField', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql_insert = "insert into " + db + ".field_info (field_code,field_business_name,field_technical_name,field_logical_id,datatype_code,is_code_value_present,is_code_values_present,is_hierarchy_present) values"
        + " (" + SqlString.escape(obj.field_code) + "," + SqlString.escape(obj.field_business_name) + "," + SqlString.escape(obj.field_technical_name) + "," + SqlString.escape(obj.field_logical_id) + ","
        + "" + SqlString.escape(obj.datatype_code) + "," + SqlString.escape(obj.is_code_value_present) + "," + SqlString.escape(obj.is_code_values_present) + "," + SqlString.escape(obj.is_hierarchy_present) +") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->md-->fields-->createField-->", error)
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
        } else {

            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }
    })

})

router.delete('/deleteField:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let field_code = obj.field_code

    let db = "svayam_" + obj.b_acct_id + "_ebill";

  
            let sql_deleteFld = "delete from " + db + ".field_info where field_code='" + field_code + "'"
            mysqlPool.query(sql_deleteFld, function (error1, results1) {
                if (error1) {
                    console.log("Error-->routes-->md-->fields-->deleteField-->", error1)
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    res.send(objectToSend)
                } else {
                    objectToSend["error"] = false;
                    objectToSend["data"] = "Field deleted successfully"
                    res.send(objectToSend)
              
        }
    })
})

router.put('/updateField', (req, res) => {
    let obj = req.body
    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".field_info set field_business_name=" + SqlString.escape(obj.field_business_name) + 
                    ",is_code_value_present=" +
                     SqlString.escape(obj.is_code_value_present) + ",is_code_value_present=" +
                      SqlString.escape(obj.is_code_values_present) + ",is_hierarchy_present=" +
                       SqlString.escape(obj.is_hierarchy_present) + " where field_code=" + SqlString.escape(obj.field_code) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->md-->fields-->updatefield--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->md-->fields-->updateField--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->md-->fields-->updateField-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->md-->fields-->updateField-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Field Update Successfully"
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


})



module.exports=router;