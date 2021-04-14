var express = require('express');
var router = express.Router();

var propObj = require('../../config_con')
var multer = require('multer');
const fs = require('fs');
var SqlString = require('sqlstring');
const moment=require('moment')

try {
    var mysqlPool = require('../../connections/mysqlConnection.js');
} catch (ex) {
    console.log("Error-->routes-->user_info-->", ex)
}

router.get('/getembforprint:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

     let sql_fetchCurr =  "SELECT tt.already_measured,tt.eff_quantity,tt.item_desc,tt.unit,tt.tender_item_sno AS sno,tt.wor,tt.woq,tt.cal_quan,tt.al_quan from"
+ " (SELECT * FROM (SELECT  already_measured,eff_quantity,item_desc,unit,sno AS tender_item_sno,rate AS wor,quantity AS woq FROM " + db + ".tender_item WHERE tender_id ="+SqlString.escape(obj.tender_id)+") ti"
+" left JOIN (SELECT   sno,sum(quantity) AS cal_quan FROM " + db + ".emb_item WHERE emb_no = "+SqlString.escape(obj.emb_no)+" GROUP BY sno ) ei"
+" ON ei.sno=ti.tender_item_sno"
+" left JOIN (SELECT   sno as sno1,sum(quantity) AS al_quan FROM " + db + ".emb_item WHERE emb_no < "+SqlString.escape(obj.emb_no)+" GROUP BY sno ) el"
+" ON el.sno1=ti.tender_item_sno ) tt "
    
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->getEmbforupdate--", error)
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
router.get('/getEmbforbill:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT * FROM " + db + ".emb_item  WHERE tender_id="+SqlString.escape(obj.tender_id)+" and emb_no >"+SqlString.escape(obj.emb_no)
    
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->getEmbforupdate--", error)
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
router.get('/getdataforprint:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT * FROM " + db + ".emb_item  WHERE tender_id="+SqlString.escape(obj.tender_id)+" and emb_no <="+SqlString.escape(obj.emb_no)
    
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->getEmbforupdate--", error)
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

router.get('/getEmbforupdate:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT * FROM " + db + ".emb_item  WHERE tender_id="+SqlString.escape(obj.tender_id)+" and emb_no="+SqlString.escape(obj.emb_no)
    
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->getEmbforupdate--", error)
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

router.get('/getEmb:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select * from " + db + ".emb_info"
    if (obj["tender_id"] != undefined) {

        sql_fetchCurr += " where tender_id =" + SqlString.escape(obj.tender_id)

    }
 if (obj["id"] != undefined) {

        sql_fetchCurr += " where id =" + SqlString.escape(obj.id)

    }

   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->getEmb--", error)
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



router.get('/getLastEmb:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "SELECT sno,sum(quantity) as q  FROM " + db + ".emb_item  WHERE tender_id="+SqlString.escape(obj.tender_id)+" group by sno"
    
   

    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->getLastEmb--", error)
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

/* router.post('/createEMB', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let work_order_id = SqlString.escape(obj.work_order_id)
    let lines = SqlString.escape(obj.lines)
    let emb_no = SqlString.escape(obj.emb_no)
    let project_cd = SqlString.escape(obj.project_cd)
    let emb_description = SqlString.escape(obj.emb_description)
    let create_user_id = SqlString.escape(obj.create_user_id)
    let emb_dt = SqlString.escape(obj.emb_dt)
    let sql = "insert into " + db + ".emb (emb_dt,work_order_id,project_cd,emb_no,emb_description,create_user_id,create_timestamp) values "
        +"("+ emb_dt +","+work_order_id+","+project_cd+","+emb_no+","+emb_description+","+create_user_id+","+create_timestamp+")"

    
   mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->createEMB--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = results.insertId
            res.send(objectToSend);
        }
    })
    

}) */
router.post('/createEMB', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let work_order_id = SqlString.escape(obj.work_order_id)
    let tender_id = SqlString.escape(obj.tender_id)
    let emb_no = SqlString.escape(obj.emb_no)
    let project_cd = SqlString.escape(obj.project_cd)
    let emb_desc = SqlString.escape(obj.emb_desc)
    let create_user_id = SqlString.escape(obj.create_user_id)
    let emb_dt = SqlString.escape(obj.emb_dt)
    let data = obj['data']
let status = SqlString.escape(obj.status)
    let sql = "insert into " + db + ".emb_info (status,tender_id,emb_dt,work_order_id,project_cd,emb_no,emb_desc,create_user_id,create_timestamp) values "
        +"("+status+","+tender_id+","+ emb_dt +","+work_order_id+","+project_cd+","+emb_no+","+emb_desc+","+create_user_id+","+create_timestamp+")"

      mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let sql1 = "insert into " + db + ".emb_item (compute,sno,emb_no,measure_dt,measure_desc,rate,shape,calc,quantity,tender_id,create_user_id,create_timestamp) values "
                            for (let i = 0; i < data.length; i++) {
                                sql1+= "("+SqlString.escape(data[i].compute)+","+SqlString.escape(data[i].sno)+","+emb_no+","+emb_dt+","+SqlString.escape(data[i].measure_desc)+","+SqlString.escape(data[i].rate)+","+SqlString.escape(data[i].shape)+","+SqlString.escape(data[i].calc)+","+SqlString.escape(data[i].quantity)+","+tender_id+","+create_user_id+","+create_timestamp+")"
                    
                     if (i < data.length - 1) {
                                sql1 += " , "
                            }
                    
                            }
                    
                            mysqlCon.query(sql1, function (error1, results) {
                                if (error1) {
                                    console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error1)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->interface-->property-->booklet-->createparty--", error2)
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

 /* router.put('/updateEMB', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let work_order_id = SqlString.escape(obj.work_order_id)
    let lines = SqlString.escape(obj.lines)
    let id = SqlString.escape(obj.id)

    let emb_no = SqlString.escape(obj.emb_no)
    let project_cd = SqlString.escape(obj.project_cd)
    let emb_description = SqlString.escape(obj.emb_description)
    let update_user_id = SqlString.escape(obj.create_user_id)
    let emb_date = SqlString.escape(obj.emb_date)
    
    let sql = "update " + db + ".emb set work_order_id="+work_order_id+",project_cd="+project_cd+",emb_no="+emb_no+",emb_date ="+emb_date
    +",emb_description="+emb_description+",`lines`="+lines+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp
        +" where id="+id

    
   mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->updateEMB--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Updated Successfully!"
            res.send(objectToSend);
        }
    })
    

}) */


/* router.delete('/deleteEMB:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)


    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
  
    let id = SqlString.escape(obj.id)


    let sql = "delete from  " + db + ".emb  where id="+id

    
   mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->updateEMB--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Deleted Successfully!"
            res.send(objectToSend);
        }
    })
    

}) */


router.delete('/deleteemb:dtls', (req, res) => {
    let obj = JSON.parse(req.params.dtls)


    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
  
    let id = SqlString.escape(obj.id)
    let emb_no = SqlString.escape(obj.emb_no)
    let tender_id = SqlString.escape(obj.tender_id)
    let sql = "delete from  " + db + ".emb_info  where id="+id
    
    let sql_delete = "delete from  " + db + ".emb_item  where emb_no="+emb_no +" And tender_id ="+tender_id
    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->ebill-->deleteemb--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->info-->ebill-->deleteemb--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql+";"+sql_delete, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->info-->ebill-->deleteemb--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->ebill-->deleteemb--", error2)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "Deleted Sucessfully"
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







router.put('/changestatus', (req, res) => {
    let obj = req.body
    let objectToSend = {}
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let sql = "update " + db + ".emb_info set status = "+SqlString.escape(obj.status)
        + ",update_user_id=" + SqlString.escape(obj.update_user_id) + ",update_timestamp="
        + update_timestamp + " where id=" + SqlString.escape(obj.id) + ";"




    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->emb-->updateBoq--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->emb-->changestatus--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->emb-->changestatus-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->emb-->changestatus-->", error2)
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


router.put('/updateEMB', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let work_order_id = SqlString.escape(obj.work_order_id)
    let tender_id = SqlString.escape(obj.tender_id)
    let emb_no = SqlString.escape(obj.emb_no)
    let project_cd = SqlString.escape(obj.project_cd)
    let emb_desc = SqlString.escape(obj.emb_desc)
    let update_user_id = SqlString.escape(obj.update_user_id)
    let create_user_id = SqlString.escape(obj.create_user_id)
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let emb_dt = SqlString.escape(obj.emb_dt)
    let data = obj['data']
    
        let sql = "update " + db + ".emb_info set tender_id="+tender_id+",emb_dt="+emb_dt+",work_order_id="+work_order_id+",project_cd ="+project_cd
        +",emb_no="+emb_no+",emb_desc="+emb_desc+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp
            +" where id="+obj.id
      mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->interface-->Emb-->updateEMB--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error4) {
                if (error4) {
                    console.log("Error-->routes-->interface-->Emb-->updateEMB--", error4)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql, function (error1, results) {
                        if (error1) {
                            console.log("Error-->routes-->interface-->Emb-->updateEMB--", error1)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {
                            let sql_delete = "delete from  " + db + ".emb_item  where emb_no="+emb_no +" and tender_id="+tender_id 
                            let sql1 = "insert into " + db + ".emb_item (compute,sno,emb_no,measure_dt,measure_desc,rate,shape,calc,quantity,tender_id,create_user_id,create_timestamp) values "
                            for (let i = 0; i < data.length; i++) {
                                sql1+= "("+SqlString.escape(data[i].compute)+","+SqlString.escape(data[i].sno)+","+emb_no+","+emb_dt+","+SqlString.escape(data[i].measure_desc)+","+SqlString.escape(data[i].rate)+","+SqlString.escape(data[i].shape)+","+SqlString.escape(data[i].calc)+","+SqlString.escape(data[i].quantity)+","+tender_id+","+create_user_id+","+create_timestamp+")"
                    
                     if (i < data.length - 1) {
                                sql1 += " , "
                            }
                    
                            }
                   console.log(sql_delete) 
                            mysqlCon.query(sql_delete+";"+sql1, function (error3, results) {
                                if (error1) {
                                    console.log("Error-->routes-->Info-->Emb-->updateEMB--", error3)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->interface-->Emb-->updateEMB--", error2)
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
