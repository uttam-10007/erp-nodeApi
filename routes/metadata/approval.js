var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment=require('moment')
router.get('/getPostDAta:dtls', (req, res) => {

    let objectToSend = {}

    let obj = JSON.parse(req.params.dtls)
    let sql_fetchCurr = " SELECT u.user_id,t.emp_id from svayam_system_data.user_info u JOIN  ( "


if(obj['designation_code']=='Junior Engineer' || obj['designation_code']=='Assistant Engineer' || obj['designation_code']=='Superintendent Enginner' 
|| obj['designation_code']=='Executive Engineer' || obj['designation_code']=='Chief Enginner'){
    obj['flag'] = true
}

    if (obj['is_enforcement'] == 0) {
        sql_fetchCurr += "Select emp_id,1 AS seq from svayam_" + obj.b_acct_id + "_hr.post WHERE section_code IN (" + SqlString.escape(obj['section_code']) + ") AND is_head=1 AND posting_end_date='2090-10-10' and  is_enforcement=0 "
                     + " UNION SELECT emp_id,2 AS seq FROM svayam_" + obj.b_acct_id + "_hr.post WHERE section_code IN ('Establishment') AND is_head=1 AND posting_end_date='2090-10-10' and  is_enforcement=0 "
 
    } else {


        sql_fetchCurr += " SELECT emp_id,1 AS seq FROM svayam_" + obj.b_acct_id + "_hr.post WHERE zone IN (" + SqlString.escape(obj['zone']) + ")AND is_head=1 AND posting_end_date='2090-10-10'  and  is_enforcement=1 "
            + " UNION SELECT emp_id,2 AS seq FROM svayam_" + obj.b_acct_id + "_hr.post WHERE section_code IN ('Establishment') AND is_head=1 AND posting_end_date='2090-10-10' and  is_enforcement=0 "

    }
    if (obj['flag'] == true) {
        sql_fetchCurr += " UNION SELECT emp_id,3 AS seq FROM svayam_" + obj.b_acct_id + "_hr.post WHERE designation_code IN ('Secretary') AND posting_end_date='2090-10-10'"
        sql_fetchCurr += " UNION SELECT emp_id,4 AS seq FROM svayam_" + obj.b_acct_id + "_hr.post WHERE designation_code IN ('VC') AND posting_end_date='2090-10-10'"

    }

    sql_fetchCurr +=" )t ON u.emp_id=t.emp_id WHERE u.b_acct_id=" + obj.b_acct_id + " ORDER BY t.seq"
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->post-->getPostDAta--", error)
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

router.get('/getmaxapproval:dtls', (req, res) => {
    let objectToSend = {}


    let b_acct_id = req.params.dtls

    
    let sql_fetchCurr = "SELECT MAX(level_of_approval) FROM svayam_"+ b_acct_id +"_md.approval WHERE  doc_type = 'LEAVE'"
    
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->Metadata-->Approval-->getmaxapproval--", error)
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

router.post('/addapproval',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let data=obj["data"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


    let sql="insert into svayam_"+b_acct_id+"_md.approval (doc_type,level_of_approval,pos,user_id,create_user_id,create_timestamp) values "

 for (let i = 0; i < data.length; i++) {
            sql+= "("+SqlString.escape(data[i].doc_type)+","+SqlString.escape(data[i].level_of_approval)+","+SqlString.escape(data[i].pos)+","+SqlString.escape(data[i].user_id)+","+SqlString.escape(data[i].create_user_id)+","+create_timestamp+")"

 if (i < data.length - 1) {
            sql += " , "
        }

        }
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->hr-->settings-->approval-->addapproval", error)
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
router.put('/updateapprovaldata', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_md";
    let b_acct_id=obj["b_acct_id"]
    let data=obj["data"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

let sql2 = "delete from  " + db + ".approval  where doc_type="+SqlString.escape(obj.doc_type)
   
      mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->metadata-->approval-->updateapprovaldata--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->metadata-->approval-->updateapprovaldata--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql2, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->metadata-->approval-->updateapprovaldata--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let sql="insert into svayam_"+b_acct_id+"_md.approval (doc_type,level_of_approval,pos,user_id,create_user_id,create_timestamp) values "

 for (let i = 0; i < data.length; i++) {
            sql+= "("+SqlString.escape(data[i].doc_type)+","+SqlString.escape(data[i].level_of_approval)+","+SqlString.escape(data[i].pos)+","+SqlString.escape(data[i].user_id)+","+SqlString.escape(data[i].create_user_id)+","+create_timestamp+")"


 if (i < data.length - 1) {
            sql += " , "
        }

        }
                    
                            mysqlCon.query(sql, function (error1, results1) {
                                if (error1) {
                                    console.log("Error-->routes-->metadata-->approval-->updateapprovaldata--", error1)
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
router.put('/updateapproval',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let doc_type=obj["doc_type"]
    let id=obj["id"]
    let level_of_approval=SqlString.escape(obj["level_of_approval"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let user_id=SqlString.escape(obj["user_id"])

    let sql="update svayam_"+b_acct_id+"_md.approval set doc_type="+SqlString.escape(doc_type)+","
           +"user_id="+user_id+",level_of_approval="+level_of_approval+",update_user_id="+update_user_id+" "
            +",update_timestamp="+update_timestamp+" "
            +" where id="+SqlString.escape(id)


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->metadata-->approval-->updateapproval", error)
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
router.get('/getleaveapproval:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    
    let sql_fetchCurr = "SELECT * FROM (SELECT MIN(level_of_approval) AS level_of_approval,`status`,pos,user_id,doc_type,doc_local_no FROM  svayam_"+ obj.b_acct_id +"_md.approval_status WHERE `status` = 'PENDING' AND doc_type = 'LEAVE' GROUP BY  `status`,doc_type,doc_local_no) ap join svayam_"+ obj.b_acct_id +"_hr.leave_ledger lv ON  ap.doc_local_no = lv.id"
    
console.log(sql_fetchCurr)   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->Metadata-->Approval-->getleaveapproval--", error)
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
router.delete('/deleteapproval:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let doc_type=obj["doc_type"]

    let sql="delete from svayam_"+b_acct_id+"_md.approval where doc_type="+SqlString.escape(doc_type)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->metadata-->approval-->deleteapproval", error)
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
router.post('/addapprovalstatus',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let data=obj["data"]
    let create_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))


console.log(obj.data);
    let sql="insert into svayam_"+b_acct_id+"_md.approval_status (user_id,level_of_approval,doc_type,pos,status,doc_local_no,create_user_id,create_timestamp,doc_local_desc) values "

for (let i = 0; i < data.length; i++) {
            sql+= "("+SqlString.escape(data[i].user_id)+","+SqlString.escape(data[i].level_of_approval)+","+SqlString.escape(data[i].doc_type)+","+SqlString.escape(data[i].pos)+","+SqlString.escape(data[i].status)+","+SqlString.escape(data[i].doc_local_no)+","+SqlString.escape(data[i].create_user_id)+","+create_timestamp+","+SqlString.escape(data[i].doc_local_desc)+")"

 if (i < data.length - 1) {
            sql += " , "
        }

        }

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->metadata-->approval-->addapprovalstatus", error)
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

router.put('/updateapprovalstatus',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let level_of_approval=obj["level_of_approval"]
    let status=obj["status"]
   // let id=obj["id"]
    let doc_local_no=SqlString.escape(obj["doc_local_no"])
    let doc_type=SqlString.escape(obj["doc_type"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let update_timestamp=SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let doc_local_desc=SqlString.escape(obj["doc_local_desc"])
    let user_id=SqlString.escape(obj["user_id"])

    let sql="update svayam_"+b_acct_id+"_md.approval_status set "
            +"status="+SqlString.escape(status)+",user_id="+user_id+" where doc_local_no="+doc_local_no+" and level_of_approval="+SqlString.escape(level_of_approval)
console.log(sql);


    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->metadata-->approval-->updateapprovalstatus", error)
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

router.delete('/deleteapprovalstatus:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["id"]

    let sql="delete from svayam_"+b_acct_id+"_md.approval_status where id="+SqlString.escape(id)

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error-->routes-->metadata-->approval-->deleteapprovalstatus", error)
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


router.get('/getdataofapprovalstatus:dtls', (req, res) => {

    let objectToSend = {}
    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let id=obj["bill_id"]
    //let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT user_id,doc_local_desc,id,level_of_approval,doc_type,status,doc_local_no,create_user_id,create_timestamp,update_user_id,update_timestamp,pos from svayam_"+b_acct_id+"_md.approval_status";
    if(id!=undefined){
	sql_fetchCurr+=" where doc_local_no="+id;
    }
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->approval-->getdataofapprovalstatus--", error)
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
router.get('/getapproval:dtls', (req, res) => {

    let objectToSend = {}

    let b_acct_id = req.params.dtls;



    let sql_fetchCurr = "SELECT id,doc_type,level_of_approval,user_id,create_user_id,create_timestamp,update_user_id,update_timestamp,pos from svayam_"+b_acct_id+"_md.approval";
    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->metadata-->approval-->getapproval--", error)
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

module.exports=router;
