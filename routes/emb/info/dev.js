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



router.put('/updatedev', (req, res) => {
    let objectToSend = {}


    let obj = req.body

    let db = "svayam_" + obj.b_acct_id + "_ebill";

   
    let sql = "update " + db + ".dev set dev_quantity="+SqlString.escape(obj.dev_quantity)
             +" where sno="+SqlString.escape(obj.sno)+" and tender_id="+SqlString.escape(obj.tender_id)

             let sql1 = "update " + db + ".tender_item set eff_quantity="+SqlString.escape(obj.new_eff_quantity)
             +",unit="+SqlString.escape(obj.unit)+",rate="+SqlString.escape(obj.rate)
             //+",part_rate="+SqlString.escape(obj.part_rate)
             +",item_desc="+SqlString.escape(obj.item_desc)
             +" where sno="+SqlString.escape(obj.sno)+" and tender_id="+SqlString.escape(obj.tender_id)


             mysqlPool.getConnection(function (error, mysqlCon) {
                if (error) {
                    console.log("Error-->routes-->info-->dev-->updatedev--", error)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                } else {
                    mysqlCon.beginTransaction(function (error1) {
                        if (error1) {
                            console.log("Error-->routes-->info-->dev-->updatedev--", error1)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.release();
                        } else {
                            mysqlCon.query(sql+";"+sql1, function (error, results) {
                                if (error) {
                                    console.log("Error-->routes-->info-->dev-->updatedev-->", error)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
        
                                    mysqlCon.query('COMMIT', function (error2) {
                                        if (error2) {
                                            console.log("Error-->routes-->info-->dev-->updatedev-->", error2)
                                            objectToSend["error"] = true;
                                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                            res.send(objectToSend)
                                            mysqlCon.rollback();
                                            mysqlCon.release()
                                        } else {
                                            objectToSend["error"] = false;
                                            objectToSend["data"] = "Updated Successfully"
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



router.get('/getdev:dtls', (req, res) => {
    let objectToSend = {}


    let obj = JSON.parse(req.params.dtls)

    let db = "svayam_" + obj.b_acct_id + "_ebill";

    let sql_fetchCurr = "Select remark,status,dev_id,id,sno,tender_id,DATE_FORMAT(dev_dt,'%Y-%m-%d') as dev_dt,dev_type,dev_quantity,is_comp,sortype,sordesc,create_user_id,create_timestamp from " + db + ".dev where tender_id=" + SqlString.escape(obj.tender_id)
   


    mysqlPool.query(sql_fetchCurr, function (error, results) {
        if (error) {
            console.log("Error-->routes-->info-->dev-->getdev--", error)
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


router.post('/createdev', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))

    let sql_insert = "insert into " + db + ".dev (status,dev_id,sno,tender_id,dev_dt,dev_type,dev_quantity,is_comp,sortype,sordesc,create_user_id,create_timestamp) values"
        + " ("+ SqlString.escape(obj.status) +","+ SqlString.escape(obj.dev_id) +","+ SqlString.escape(obj.sno) +","+ SqlString.escape(obj.tender_id) +","+ SqlString.escape(obj.dev_dt) +","
        + SqlString.escape(obj.dev_type) +","+SqlString.escape(obj.dev_quantity)+"," +SqlString.escape(obj.is_comp)+","
        + SqlString.escape(obj.sortype) + "," + SqlString.escape(obj.sordesc) + ","
        + SqlString.escape(obj.create_user_id) + "," + create_timestamp + ") "



    let sql_update= "update  " + db + ".tender_item set eff_quantity=eff_quantity"
    if(obj["dev_type"]=="S"){
        sql_update+="-"
    }else{
        sql_update+="+"
    }
    sql_update+=obj.dev_quantity+" where tender_id=" + SqlString.escape(obj.tender_id) +" and sno=" + SqlString.escape(obj.sno)


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->dev-->createdev--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->dev-->createdev--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert+";"+sql_update, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->dev-->createdev-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->dev-->createdev-->", error2)
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
   

})





router.post('/createMultipledev', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let data=obj['data']



    let sql_insert = "insert into " + db + ".dev (remark,status,dev_id,sno,tender_id,dev_dt,dev_type,dev_quantity,is_comp,sortype,sordesc,create_user_id,create_timestamp) values"
       
        let updateArr=[];
        
    
    for( let i=0;i<data.length;i++){

        sql_insert+=  " ("+ SqlString.escape(data[i].remark) +","+ SqlString.escape(data[i].status) +","+ SqlString.escape(data[i].dev_id) +","+ SqlString.escape(data[i].sno) +","
        + SqlString.escape(data[i].tender_id) +","+ SqlString.escape(data[i].dev_dt) +","
        + SqlString.escape(data[i].dev_type) +","+SqlString.escape(data[i].dev_quantity)+"," +SqlString.escape(data[i].is_comp)+","
        + SqlString.escape(data[i].sortype) + "," + SqlString.escape(data[i].sordesc) + ","
        + SqlString.escape(data[i].create_user_id) + "," + create_timestamp + ") "



        let sql_update= "update  " + db + ".tender_item set eff_quantity=eff_quantity"
        if(data[i]["dev_type"]=="S"){
            sql_update+="-"
        }else{
            sql_update+="+"
        }
        sql_update+=data[i].dev_quantity+" where tender_id=" + SqlString.escape(data[i].tender_id) +" and sno=" + SqlString.escape(data[i].sno)
        updateArr.push(sql_update)
        if(i!=data.length -1){
            sql_insert +=","
        }
    }


    mysqlPool.getConnection(function (error, mysqlCon) {
        if (error) {
            console.log("Error-->routes-->info-->dev-->createMultipledev--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->info-->dev-->createMultipledev--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                } else {
                    mysqlCon.query(sql_insert, function (error, results) {
                        if (error) {
                            console.log("Error-->routes-->info-->dev-->createMultipledev-->", error)
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server Side. Please try again later"
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else {

                            mysqlCon.query(updateArr.join(";"), function (error11, results) {
                                if (error11) {
                                    console.log("Error-->routes-->info-->dev-->createMultipledev-->", error11)
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                    res.send(objectToSend)
                                    mysqlCon.rollback();
                                    mysqlCon.release()
                                } else {
        
                            mysqlCon.query('COMMIT', function (error2) {
                                if (error2) {
                                    console.log("Error-->routes-->info-->dev-->createMultipledev-->", error2)
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






router.post('/createSOR', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let data=obj['data']
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let dev_dt = SqlString.escape(moment().format('YYYY-MM-DD'))
    let sql_insert = "insert into " + db + ".tender_item (is_extra_item,part_rate,is_pre_gst,already_measured,sno,tender_id,unit,rate,quantity,item_cd,item_desc,item_grp_desc,"
        +"line_amt,eff_rate,eff_quantity,eff_amt,curr,over_under,over_under_per) values"
       
        let sql_insert1 = "insert into " + db + ".dev (remark,status,dev_id,sno,tender_id,dev_dt,dev_type,dev_quantity,is_comp,sortype,sordesc,create_user_id,create_timestamp) values"
       

        for(let i=0;i<data.length;i++){
             let amt=data[i]['rate']*data[i]['quantity']
             let eff_quan=data[i].quantity-data[i].already_measured

            sql_insert +=  " ("+SqlString.escape(data[i].is_extra_item)+","+SqlString.escape(data[i].part_rate)+","+ SqlString.escape(data[i].is_pre_gst)  +","+ SqlString.escape(data[i].already_measured)  +","+ SqlString.escape(data[i].sno) +","
            + SqlString.escape(data[i].tender_id) +","+ SqlString.escape(data[i].unit) +","
            + SqlString.escape(data[i].rate) +","+SqlString.escape(data[i].quantity)+"," +SqlString.escape(data[i].item_cd)+","
            + SqlString.escape(data[i].item_desc) + "," + SqlString.escape(data[i].item_desc) + "," + SqlString.escape(amt) + ","+ SqlString.escape(data[i].rate) + ","
            + SqlString.escape(eff_quan) + "," + SqlString.escape(amt)+ "," + SqlString.escape(data[i].curr)+ "," + SqlString.escape(data[i].over_under)+ "," + SqlString.escape(data[i].over_under_per) + ") "
            
            sql_insert1 +=  " ("+ SqlString.escape(data[i].remark) +","+ SqlString.escape(data[i].status) +","+ SqlString.escape(data[i].dev_id)+ ","+SqlString.escape(data[i].sno) +","+ SqlString.escape(data[i].tender_id) +","+ dev_dt +","
            + "'A'" +","+SqlString.escape(data[i].quantity)+",'N',"
            + "'S'" + "," + SqlString.escape(data[i].item_desc) + ","
            + SqlString.escape(data[i].create_user_id) + "," + create_timestamp + ") "
    
if(i!=data.length-1){
    sql_insert +=","
    sql_insert1 +=","

}
        }
        
   
        mysqlPool.getConnection(function (error, mysqlCon) {
            if (error) {
                console.log("Error-->routes-->info-->dev-->createSOR--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->info-->dev-->createSOR--", error1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    } else {
                        mysqlCon.query(sql_insert+";"+sql_insert1, function (error, results) {
                            if (error) {
                                console.log("Error-->routes-->info-->dev-->createSOR-->", error)
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
    
                                mysqlCon.query('COMMIT', function (error2) {
                                    if (error2) {
                                        console.log("Error-->routes-->info-->dev-->createSOR-->", error2)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Created Successfully"
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


router.post('/completion', (req, res) => {
    let obj = req.body;

    let objectToSend = {}
    let db = "svayam_" + obj.b_acct_id + "_ebill";
    let data=obj['data']
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let sql_update = "UPDATE " + db + ".tender_item t1"
    + " SET  t1.eff_quantity =(SELECT t2.quantity  FROM"
        + " (SELECT item.tender_id,item.sno,(case when (tt.quantity IS NOT NULL) then tt.quantity ELSE 0 END) AS quantity "
        + " FROM  (SELECT tender_id,sno FROM " + db + ".tender_item where tender_id="+ SqlString.escape(obj.tender_id) +") item LEFT JOIN"
        + "  (SELECT tender_id,sno,SUM(quantity) AS quantity from " + db + ".emb_item where tender_id="+ SqlString.escape(obj.tender_id) +" GROUP BY tender_id,sno) tt on"
        + "   item.tender_id=tt.tender_id AND item.sno=tt.sno) t2"
        + "    WHERE t1.tender_id=t2.tender_id AND t1.sno=t2.sno)"
        + "   WHERE t1.tender_id="+ SqlString.escape(obj.tender_id) 


        let sql_insert = "insert into " + db + ".dev (status,dev_id,sno,tender_id,dev_dt,dev_type,dev_quantity,is_comp,sortype,sordesc,create_user_id,create_timestamp) values"
           
        for(let i=0;i<data.length;i++){

        sql_insert += " ("+ SqlString.escape(data[i].status) +","+ SqlString.escape(data[i].dev_id) +","+ SqlString.escape(data[i].sno) +","+ SqlString.escape(data[i].tender_id) +","+ SqlString.escape(data[i].dev_dt) +","
            + SqlString.escape(data[i].dev_type) +","+SqlString.escape(data[i].dev_quantity)+"," +SqlString.escape(data[i].is_comp)+","
            + SqlString.escape(data[i].sortype) + "," + SqlString.escape(data[i].sordesc) + ","
            + SqlString.escape(data[i].create_user_id) + "," + create_timestamp + ")"
            if(i<data.length-1){
                sql_insert += ","  
            }
    
        }
   
        mysqlPool.getConnection(function (error, mysqlCon) {
            if (error) {
                console.log("Error-->routes-->info-->dev-->completion--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            } else {
                mysqlCon.beginTransaction(function (error1) {
                    if (error1) {
                        console.log("Error-->routes-->info-->dev-->completion--", error1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    } else {
                        mysqlCon.query(sql_update+";"+sql_insert, function (error, results) {
                            if (error) {
                                console.log("Error-->routes-->info-->dev-->completion-->", error)
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                res.send(objectToSend)
                                mysqlCon.rollback();
                                mysqlCon.release()
                            } else {
    
                                mysqlCon.query('COMMIT', function (error2) {
                                    if (error2) {
                                        console.log("Error-->routes-->info-->dev-->completion-->", error2)
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server Side. Please try again later"
                                        res.send(objectToSend)
                                        mysqlCon.rollback();
                                        mysqlCon.release()
                                    } else {
                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Created Successfully"
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
