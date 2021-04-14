var express = require('express');
var router = express.Router();
var propObj = require('../config_con.js')
var mysqlPool = require('../connections/mysqlConnection.js');


var SqlString = require('sqlstring');
var moment = require('moment')




router.get('/getWorkComp:dtls', (req, res) => {
    let objectToSend = {}


    let obj = req.params.dtls

    let db = "svayam_" + obj+ "_ebill";

    let sql_fetchCurr = "SELECT ten.tender_id,ten.work_id,cast(favg.average as DECIMAL(18,2)) AS per "
   +" FROM (SELECT tender_id,work_id FROM " + db + ".tender) ten LEFT JOIN "
   +" (SELECT gg.tender_id,AVG(gg.avg_item_quan) AS average FROM "
   +" (SELECT ag.tender_id,ag.sno,( ag.emb_item_quan/ag.eff_quantity) * 100 AS avg_item_quan from"
   +" (SELECT item.tender_id,item.eff_quantity,item.sno, (case when (emb.emb_item_quan IS NOT NULL) then emb.emb_item_quan ELSE 0 END) AS emb_item_quan"
   +"  FROM (SELECT tender_id,sno,eff_quantity FROM " + db + ".tender_item) item LEFT JOIN "
   +" (SELECT  sno,sum(quantity) AS emb_item_quan,tender_id FROM " + db + ".emb_item GROUP BY sno,tender_id) emb "
   +" ON item.sno=emb.sno AND item.tender_id=emb.tender_id ) ag) gg GROUP BY gg.tender_id) favg ON ten.tender_id=favg.tender_id"
   


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->dashboard-->getWorkComp--", error)
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






module.exports=router
