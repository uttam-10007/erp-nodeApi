
var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.get('/getEvents:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls);



    let sql_fetchCurr = "SELECT * from svayam_" + obj.b_acct_id + "_account.events"
    if (obj['event_record_code'] != undefined) {

        sql_fetchCurr += " where event_record_code = " + SqlString.escape(obj.event_record_code)

    }
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->event-->getevents--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results
            res.send(objectToSend);
        }
    })
});



router.post('/addevent', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]

    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql = "insert into svayam_" + b_acct_id + "_account.events (event_code,event_desc,event_record_code,create_user_id,create_timestamp,bud_cd,proj_cd,prod_cd,act_cd) values "


        + "(" + SqlString.escape(obj.event_code) + "," + SqlString.escape(obj.event_desc) + "," + SqlString.escape(obj.event_record_code) + "," + SqlString.escape(obj.create_user_id) + "," + create_timestamp + "," + SqlString.escape(obj.bud_cd) + "," + SqlString.escape(obj.proj_cd) + "," + SqlString.escape(obj.prod_cd) + "," + SqlString.escape(obj.act_cd) + ")"



    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->event-->addevent", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
})

router.put('/updateevent', (req, res) => {
    let objectToSend = {}

    let obj = req.body

    let b_acct_id = obj["b_acct_id"]
    let event_code = obj["event_code"]
    let event_desc = obj["event_desc"]
    let id = obj["id"]
    let event_record_code = SqlString.escape(obj["event_record_code"])
    let proj_cd = SqlString.escape(obj["proj_cd"])
    let act_cd = SqlString.escape(obj["act_cd"])
    let bud_cd = obj["bud_cd"]
    let prod_cd = obj["prod_cd"]


    let sql = "update svayam_" + b_acct_id + "_account.events set event_code=" + SqlString.escape(event_code) + ","
        + "event_desc=" + SqlString.escape(event_desc) + ",event_record_code=" + event_record_code
        + ",bud_cd=" + SqlString.escape(bud_cd) + ",proj_cd=" + proj_cd
        + ",prod_cd=" + SqlString.escape(prod_cd) + ",act_cd=" + act_cd
        + " where id=" + SqlString.escape(id)


    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->event-->updateaddevent", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully"
            res.send(objectToSend);
        }
    })
})


router.delete('/deleteevent:dtls', (req, res) => {
    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)

    let b_acct_id = obj["b_acct_id"]
    let id = obj["id"]

    let sql = "delete from svayam_" + b_acct_id + "_account.events where id=" + SqlString.escape(id)

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->event-->deleteaddevent", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully"
            res.send(objectToSend);
        }
    })

})



router.post('/getFilteredEvents', (req, res) => {

    let objectToSend = {}
    let obj = req.body
    let db = "svayam_" + obj.b_acct_id + "_account";

    let sql = "SELECT event_record_code,id,event_code,event_desc,bud_cd,prod_cd,proj_cd,act_cd FROM " + db + ".events "

    let flag = false
    if (obj['bud_cd'] != undefined) {
        if (obj['bud_cd'] != '' && obj['bud_cd'] != null) {
            if (obj['bud_lvl'] == 'L') {
                sql += "where bud_cd in (" + SqlString.escape(obj['bud_cd']) + ")"
                flag = true
            } else {
                sql += "where bud_cd in (select leaf_cd from " + db + ".bud_hier where lvl" + obj['bud_lvl'] + "_cd=" + SqlString.escape(obj['bud_cd']) + ")"
                flag = true

            }

        }
    }else{

          sql += "where bud_cd is null "
          flag = true;
    }

    
    if (obj['act_cd'] != undefined) {
        if (obj['act_cd'] != '' && obj['act_cd'] != null) {
            if (flag == false) {
                sql += "where "
                flag = true
            } else {
                sql += "AND "
            }
            if (obj['act_lvl'] == 'L') {
                sql += " act_cd in (" + SqlString.escape(obj['act_cd']) + ")"
            } else {
                sql += " act_cd in (select leaf_cd from " + db + ".activity_hier where lvl" + obj['act_lvl'] + "_cd=" + SqlString.escape(obj['act_cd']) + ")"

            }

        }
    }else{

          
		sql += "and act_cd is null ";
          flag = true;
    } 

    if (obj['prod_cd'] != undefined) {
        if (obj['prod_cd'] != '' && obj['prod_cd'] != null) {
            if (flag == false) {
                sql += "where "
                flag = true
            } else {
                sql += "AND "
            }
            if (obj['prod_lvl'] == 'L') {
                sql += " prod_cd in (" + SqlString.escape(obj['prod_cd']) + ")"
            } else {
                sql += " prod_cd in (select leaf_cd from " + db + ".prod_hier where lvl" + obj['prod_lvl'] + "_cd=" + SqlString.escape(obj['prod_cd']) + ")"

            }

        }
    }else{

          sql += "and prod_cd is null "
          flag = true;
    } 



    if (obj['proj_cd'] != undefined) {
        if (obj['proj_cd'] != '' && obj['proj_cd'] != null) {
            if (flag == false) {
                sql += "where "
                flag = true
            } else {
                sql += "AND "
            }
            if (obj['proj_lvl'] == 'L') {
                sql += " proj_cd in (" + SqlString.escape(obj['proj_cd']) + ")"
            } else {
                sql += " proj_cd in (select leaf_cd from " + db + ".proj_hier where lvl" + obj['proj_lvl'] + "_cd=" + SqlString.escape(obj['proj_cd']) + ")"

            }

        }
    }else{

          sql += "and proj_cd is null "
          flag = true;
    } 
    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->event-->getFilteredEvents", error)
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
