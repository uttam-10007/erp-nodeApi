var express = require('express');
var router = express.Router();
var propObj = require('../../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.get('/getgeometry:dtls', (req, res) => {
    let objectToSend = {}


    let b_acct_id = req.params.dtls

    let db = "svayam_" + b_acct_id + "_ebill";

    let sql_fetchCurr = "Select unit,id,geometry,measurement,formual,create_user_id,create_timestamp,update_timestamp,update_user_id from " + db + ".geometry"
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->geometry-->getgeometry--", error)
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


router.post('/creategeometry', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    
            let sql_insert = "insert into " + db + ".geometry (unit,measurement,geometry,formual,create_user_id,create_timestamp) values"
                + " ("+ SqlString.escape(obj.unit) +","+ SqlString.escape(obj.measurement) +","+ SqlString.escape(obj.geometry) +"," + SqlString.escape(obj.formual) +  ","  + SqlString.escape(obj.create_user_id) + ","
                + "" + create_timestamp + ") "

            mysqlPool.query(sql_insert, function (error, results) {
                if (error) {
                    console.log("Error-->routes-->info-->geometry-->creategeometry-->", error)
                    objectToSend["error"] = true;
                    if (error.message != undefined || error.message != null) {

                        objectToSend["data"] = "Some error occured at server Side. Please try again later"

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

router.delete('/deletegeometry:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let id = obj.id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".geometry where id='" + id + "'"
    mysqlPool.query(sql_deleteFld, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->geometry-->deletegeometry-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "geometry deleted successfully"
            res.send(objectToSend)

        }
    })
})

router.put('/updategeometry', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".geometry set formual=" + SqlString.escape(obj.formual)
        +  ",geometry=" + SqlString.escape(obj.geometry)+",unit ="+SqlString.escape(obj.unit)
        +",measurement ="+ SqlString.escape(obj.measurement) 
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->geometry-->updategeometry--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->geometry-->updategeometry--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->geometry-->updategeometry-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->geometry-->updategeometry-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "geometry Update Successfully"
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



module.exports = router;
