var express = require('express');
var router = express.Router();
var propObj = require('../../config_con.js')
var mysqlPool = require('../../connections/mysqlConnection.js');


var SqlString = require('sqlstring');
var moment = require('moment')


router.get('/getResources',(req,res)=>{
    let objectToSend={}


    let sql="SELECT * from "+propObj.svayamSystemDbName+".resource_info"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->administration-->resource-->getResources", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
})
router.get('/getxrefResources:dtls',(req,res)=>{
    let objectToSend={}
    let b_acct_id = req.params.dtls

    let sql="SELECT role_cd,group_concat(res_cd) from svayam_"+b_acct_id+"_ebill.role_xref_resource GROUP BY role_cd"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->administration-->resource-->getxrefResources", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }
    })
})

router.post('/createresources', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
   let data = obj['data']
let b_acct_id=obj["b_acct_id"]    
    let sql="insert into svayam_"+b_acct_id+"_ebill.role_xref_resource (role_cd,res_cd) values "

 for (let i = 0; i < data.length; i++) {
            sql+= "("+SqlString.escape(data[i].role_cd)+","+SqlString.escape(data[i].res_cd)+")"


 if (i < data.length - 1) {
            sql += " , "
        }

        }
    
   mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->Administration-->resource-->createresources--", error)
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

router.put('/updateresource', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let b_acct_id=obj["b_acct_id"]
    let data=obj["data"]

let sql2 = "delete from  " + db + ".role_xref_resource  where role_cd="+SqlString.escape(obj.role_cd)
   
      mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->Administration-->Resouce-->updateresource--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->Administration-->Resouce-->updateresource--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql2, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->Administration-->Resouce-->updateresource--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let sql="insert into svayam_"+b_acct_id+"_ebill.role_xref_resource (role_cd,res_cd) values "

 for (let i = 0; i < data.length; i++) {
            sql+= "("+SqlString.escape(data[i].role_cd)+","+SqlString.escape(data[i].res_cd)+")"


 if (i < data.length - 1) {
            sql += " , "
        }

        }
                    
                            mysqlCon.query(sql, function (error1, results1) {
                                if (error1) {
                                    console.log("Error-->routes-->Administration-->Resouce-->updateresource--", error1)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else { 
                                   
                        
                               

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->interface-->property-->booklet-->updateapprovaldata--", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = results.insertId
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
        }


    })
})


module.exports=router;
