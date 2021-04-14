var express = require('express');
var router = express.Router();
var propObj = require('../../config_con')
var SqlString = require('sqlstring');
var moment = require('moment')

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->signup-->require--", ex)
}


router.put('/updateAlreadyMeasured', (req, res) => {
    let obj = req.body
    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let eff_quantity=obj['eff_quantity']+obj['old_already_measured']-obj['new_already_measured']
    let sql = "update " + db + ".tender_item set eff_quantity = "+SqlString.escape(eff_quantity)
        +",already_measured="+SqlString.escape(obj.new_already_measured) +" where id=" + SqlString.escape(obj.id) 

   


        mysqlPool.query(sql, function (error1, results1) {
            if (error1) {
                console.log("Error-->routes-->info-->boq-->updateAlreadyMeasured-->", error1)
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                res.send(objectToSend)
            } else {
                objectToSend["error"] = false;
                objectToSend["data"] = "Updated successfully"
                res.send(objectToSend)
    
            }
        })


})





router.put('/updaterate', (req, res) => {
    let obj = req.body
    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".tender set over_under = "+SqlString.escape(obj.over_under)
        +",over_under_per="+SqlString.escape(obj.over_under_rate) +",already_emb="+SqlString.escape(obj.already_emb)
        +" where tender_id=" + SqlString.escape(obj.tender_id) 

   


        mysqlPool.query(sql, function (error1, results1) {
            if (error1) {
                console.log("Error-->routes-->info-->boq-->updaterate-->", error1)
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                res.send(objectToSend)
            } else {
                objectToSend["error"] = false;
                objectToSend["data"] = "Rate updated successfully"
                res.send(objectToSend)
    
            }
        })


})



router.put('/updateItem', (req, res) => {
    let obj = req.body
    let objectToSend = {}

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".tender_item set unit = "+SqlString.escape(obj.new_unit)
        +" where tender_id=" + SqlString.escape(obj.tender_id) 

    if (obj.unit==null){
        sql += " and unit is "+SqlString.escape(obj.unit) +";"
    }else{
        sql +=   " and unit="+SqlString.escape(obj.unit) +";"
    }





        mysqlPool.query(sql, function (error1, results1) {
            if (error1) {
                console.log("Error-->routes-->info-->boq-->updateItem-->", error1)
                objectToSend["error"] = true;
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                res.send(objectToSend)
            } else {
                objectToSend["error"] = false;
                objectToSend["data"] = "Iten updated successfully"
                res.send(objectToSend)
    
            }
        })


})




router.get('/getItem:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".tender_item where tender_id="+SqlString.escape(obj.tender_id);

    console.log(sql_fetchCurr);

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->boq-->getboq--", error)
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

router.get('/getTender:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".work_info w left join "+db+".tender t on t.work_id = w.id where t.work_id="+SqlString.escape(obj.work_id);

    console.log(sql_fetchCurr);

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->boq-->getboq--", error)
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


router.post('/createTender', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".tender (already_emb,work_id,over_under,over_under_per,amount,type,status,create_user_id,create_timestamp) values"
        + " ("+SqlString.escape(obj.already_emb)+","+ SqlString.escape(obj.work_id)  +","+SqlString.escape(obj.over_under) + "," + SqlString.escape(obj.over_under_rate) + "," + SqlString.escape(obj.total_amount) +","+ SqlString.escape(obj.emb_type)+"," + "'GENERATED'" +"," + SqlString.escape(obj.create_user_id) + ","
        + "" + create_timestamp + ") "

    mysqlPool.query(sql_insert, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->boq-->createField-->", error)
            objectToSend["error"] = true;
            if (error.message != undefined || error.message != null) {

                objectToSend["data"] = "Some error occured at server Side. Please try again later"

            } else {
                objectToSend["data"] = "Some error occured at server Side. Please try again later"
            }

            res.send(objectToSend)
        } else {
            var insertId=results.insertId;
            //console.log(results);
            var data = obj.data;
            var query1 = "insert into "+db+".tender_item (sno,tender_id,unit,rate,quantity,item_cd,item_desc,item_grp_desc,line_amt,line_amt_words,eff_rate,eff_quantity,eff_amt,curr,already_measured) values";
            for(var i=0;i<data.length;i++){
                var ob = data[i];
                query1+="("+SqlString.escape(ob.s_no)+","+SqlString.escape(insertId)+","+SqlString.escape(ob.unit)+","+SqlString.escape(ob.rate)+","+SqlString.escape(ob.quantity)+","+"''"+","+SqlString.escape(ob.line_desc)+","+SqlString.escape(ob.line_group_desc)+","+SqlString.escape(ob.lime_amt_without_tax)+","+SqlString.escape(ob.line_amt_in_word)+","+SqlString.escape(ob.rate)+","+SqlString.escape(ob.eff_quantity)+","+SqlString.escape(ob.lime_amt_without_tax)+","+SqlString.escape(ob.curr)+","+SqlString.escape(ob.already_measured)+")"
                if(i!=data.length-1){
                    query1+=",";
                }
            }
            //console.log(query);
            mysqlPool.query(query1, function (error1, results1) {
                console.log(results1);
                if (error) {
                    console.log("Error-->routes-->info-->boq-->createField-->", error)
                    objectToSend["error"] = true;
                    if (error1.message != undefined || error1.message != null) {
        
                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
        
                    } else {
                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                    }
        
                    res.send(objectToSend)
                }else{
                    objectToSend["error"] = false;
                    objectToSend["data"] = results.insertId
                    res.send(objectToSend)
                }
            })
            
        }
    })

})


router.delete('/deleteTender:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)
    let objectToSend = {}
    let tender_id = obj.tender_id

    let db = "svayam_" + obj.b_acct_id + "_ebill";


    let sql_deleteFld = "delete from " + db + ".tender where tender_id='" + tender_id + "'"
    let sql_delete = "delete from " + db + ".tender_item where tender_id='" + tender_id + "'"
    mysqlPool.query(sql_deleteFld+";"+sql_delete, function (error1, results1) {
        if (error1) {
            console.log("Error-->routes-->info-->boq-->deleteBoq-->", error1)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "BOQ deleted successfully"
            res.send(objectToSend)

        }
    })
})



router.put('/changestatus', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".tender set status = "+SqlString.escape(obj.status)
         + " where tender_id=" + SqlString.escape(obj.tender_id) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->boq-->updateBoq--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->boq-->changestatus--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->boq-->changestatus-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->boq-->changestatus-->", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Status Update Successfully"
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
