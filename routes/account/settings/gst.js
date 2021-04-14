var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')

router.post('/addgst',(req,res)=>{
    let objectToSend={}

    let obj=req.body;
    let b_acct_id=obj["b_acct_id"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'));


    let sql="insert into svayam_"+b_acct_id+"_account.gst (hsn_desc,hsn_code,cgst,sgst,igst,create_user_id,create_timestamp) values "

 
        + "("+SqlString.escape(obj.hsn_desc)+","+SqlString.escape(obj.hsn_code)+","+SqlString.escape(obj.cgst)+","+SqlString.escape(obj.sgst)+","+SqlString.escape(obj.igst)+","+SqlString.escape(obj.create_user_id)+","+create_timestamp+")"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->settings-->gst-->addgst", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
})

router.put('/updategst',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let hsn_desc=obj["hsn_desc"]
    let hsn_code=obj["hsn_code"]
    let id=obj["id"]
    let cgst=SqlString.escape(obj["cgst"])
    let sgst=SqlString.escape(obj["sgst"])
    let igst=SqlString.escape(obj["igst"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="update svayam_"+b_acct_id+"_account.gst set hsn_desc="+SqlString.escape(hsn_desc)+","
            +"hsn_code="+SqlString.escape(hsn_code)+",cgst="+cgst+",sgst="+sgst+",igst="+igst+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+" "
            +" where id="+SqlString.escape(id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->settings-->gst-->updategst", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " updated successfully"
            res.send(objectToSend);
        }
    })
})

router.delete('/deletegst:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_account.gst where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->account-->settings-->gst-->deletegst", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            objectToSend["error"] = false
            objectToSend["data"] = " deleted successfully" 
            res.send(objectToSend);
        }
    })

})
router.get('/getgst:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT * from svayam_"+b_acct_id+"_account.gst";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->gst-->getgst--", error)
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

router.get('/getmaxjrnlid:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT MAX(jrnl_line_id) from svayam_"+b_acct_id+"_account.jrnl";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->account-->settings-->gst-->getmaxjrnlid--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["obj"] = results
            res.send(objectToSend);
        }
    })
});


module.exports=router;
