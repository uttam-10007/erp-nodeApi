var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')

router.post('/createsoritem', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
    let b_acct_id = obj.b_acct_id;
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let query = "INSERT INTO svayam_" + b_acct_id + "_eng.sor_item_list(sor_item_category,region_cd,circle_cd,data,create_user_id,create_timestamp)VALUES ("
    +SqlString.escape(obj.sor_item_category)+","+SqlString.escape(obj.region_cd)+","+SqlString.escape(obj.circle_cd)+","+SqlString.escape(obj.data)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->sor_item_list-->createsoritem--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Inserted Successfully"
            res.send(objectToSend);
        }
    })
})

router.get('/getsoritem:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_" + b_acct_id + "_eng.sor_item_list";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->sor_item_list-->getsoritem--", error)
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

router.put('/updatesoritem', (req, res) => {
    let objectToSend = {}
    let obj = req.body;
   
    let b_acct_id = obj.b_acct_id;
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let query = "update svayam_" + b_acct_id + "_eng.sor_item_list set "
    +"sor_item_category="+SqlString.escape(obj.sor_item_category)+",region_cd="+SqlString.escape(obj.region_cd)+","
    +"circle_cd="+SqlString.escape(obj.circle_cd)+",data="+SqlString.escape(obj.data)+",update_user_id="+SqlString.escape(obj.update_user_id)+","
    
    +"update_timestamp="+update_timestamp+" where id ="+SqlString.escape(obj.id)

    mysqlPool.query(query, function (error, results) {
        if (error) {
            console.log("Error-->routes-->eng-->unit_conversion-->updateunit--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "update successfully"
            res.send(objectToSend);
        }
    })
})





router.delete('/deletesoritem:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_eng.sor_item_list where id in (" + id.join(",")+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->eng-->sor_item-->deletesoritem", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " Deleted Successfully" 
            res.send(objectToSend);
        }
    })

})



module.exports = router;