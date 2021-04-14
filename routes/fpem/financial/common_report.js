var express = require('express');
var router = express.Router();

//var propObj = require('../../config_con')

const fs = require('fs');
var asyncjs = require('async');
var propObj = require('../../../config_con')

var SqlString = require('sqlstring');

try {
    var mysqlPool = require('../../../connections/mysqlConnection');
} catch (ex) {
    console.log("Error-->routes-->userManagement-->usermanegement--", ex)
}
////////////////////***************************  OrgAndAccount  ************************************/////// */

router.get('/getOrganisationBookCodes:dtls', function (req, res) {
    var objectToSend = {};
    var db = 'svayam_' + req.params.dtls + '_data'
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->financials--trailBalance--->getOrganisationBookCodes", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
               


                var query0 = "select * from " + db + ".ref_organisation";
                var query = "select acct_num,acct_num_desc,acct_type_cd from " + db + ".ref_account";


                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->financials-->trailBalance--->getOrganisationBookCodes", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query0 + ";" + query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->financials-->trailBalance--->getOrganisationBookCodes", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else 
                                     {
                                        mysqlCon.commit(function (err8) {
                                            if (err8) {
                                                console.log("Error-->routes-->financials-->orgBookCodeDtls--->getOrganisationBookCodes", err8);
                                                objectToSend["error"] = true;
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                res.end(JSON.stringify(objectToSend))
                                                mysqlCon.rollback();
                                                mysqlCon.release();
                                            } else {

                                                var data = {};
                                                data['org_data'] = results[0];
                                                data['chart_of_account_data'] = results[1];

                                                objectToSend["error"] = false;
                                                objectToSend["data"] = data;
                                               


                                                res.send(JSON.stringify(objectToSend));
                                                mysqlCon.release();
                                            }
                                        });
                                    
                                
                            }

                        });


                    }





                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->routes-->financials-->trailBalance--->getOrganisationBookCodes", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});

////////////////////***************************GetGeneralData ************************************/////// */
router.get('/listing:dtls',(req,res)=>{

    var objectToSend={}
    var obj=JSON.parse(req.params.dtls);
    var db="svayam_"+obj.acct_id+"_data";

    var query="select * from "+db+"."+obj.table_name+" limit "+obj.lines;
  
   
    if(obj.store=='MySQL'){
        mysqlPool.query(query,function(error,results){
            if(error){
                console.log("Error-->routes-->financials-->common_report-->listing--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = results
                res.send(objectToSend);
            }
        })
    }else{
        executeQueryInHive(query,function(err,results){
            if(err){
                console.log("Error-->routes-->financials-->common_report-->listing--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = results
                res.send(objectToSend);
            }
        })

    }

})
router.post('/getGeneralData',(req,res)=>{
    var objectToSend={}

  

    var obj=req.body;
   
    if(obj.store=='MySQL'){
        mysqlPool.query(obj.query,function(error,results){
            if(error){
                console.log("Error-->routes-->financials-->generalReport-->getGeneralData--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = results
                res.send(objectToSend);
            }
        })
    }else{
        executeQueryInHive(obj.query,function(err,results){
            if(err){
                console.log("Error-->routes-->financials-->generalReport-->getGeneralData--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = results
                res.send(objectToSend);
            }
        })

    }

})
////////////////////***************************Saved Report************************************/////// */


router.post('/saveReport', function (req, res) {
    var objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->financial-->journalListing---->saveReport--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                
                let db='svayam_'+req.body.b_acct_id+'_data';


                var query = "insert into  " + db + ".saved_reports(report_name,report_specs) values "
                    + "('" + req.body.report_name + "'," + SqlString.escape(req.body.report_specs) + ")";

                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->financial-->journalListing---->saveReport--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->financial-->journalListing---->saveReport--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {

                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->financial-->journalListing---->saveReport--", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = results.insertId;
                                        res.send(JSON.stringify(objectToSend));
                                        mysqlCon.release();
                                    }
                                });
                            }

                        });


                    }

                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->routes-->financial-->journalListing---->saveReport--", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});


router.put('/updateReport', function (req, res) {
    var obj = req.body;
    var objectToSend = {};
    try {
        mysqlPool.getConnection(function (err, mysqlCon) {
            if (err) {
                console.log("Error-->routes-->financial-->journalListing---->updateReport--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }
            else {
                let db='svayam_'+obj.b_acct_id+'_data';
                var query = "update " + db + ".saved_reports set "
                    + "report_name=" + SqlString.escape(obj.report_name) + ",report_specs=" + SqlString.escape(obj.report_specs)
                    + " where report_id=" + SqlString.escape(obj.report_id) + " and acct_id=" + obj.acct_id;

                mysqlCon.beginTransaction(function (err1) {
                    if (err1) {
                        console.log("Error-->routes-->financial-->journalListing---->updateReport--", err1)
                        objectToSend["error"] = true
                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                        res.send(objectToSend);
                        mysqlCon.release();
                    }
                    else {
                        mysqlCon.query(query, function (error, results, fields) {
                            if (error) {
                                console.log("Error-->routes-->financial-->journalListing---->updateReport--", error);
                                objectToSend["error"] = true;
                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support.";
                                res.send(JSON.stringify(objectToSend));
                                mysqlCon.rollback();
                                mysqlCon.release();
                            }
                            else {

                                mysqlCon.commit(function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->financial-->journalListing---->updateReport--", err8);
                                        objectToSend["error"] = true;
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.end(JSON.stringify(objectToSend))
                                        mysqlCon.rollback();
                                        mysqlCon.release();
                                    } else {

                                        objectToSend["error"] = false;
                                        objectToSend["data"] = "Update Successfully! ";
                                        res.send(objectToSend);
                                        mysqlCon.release();
                                    }
                                });
                            }

                        });


                    }

                });

            }

        });

    }
    catch (ex) {
        console.log("Error-->routes-->financial-->journalListing---->updateReport--", ex)
        objectToSend["error"] = true
        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
        res.send(objectToSend);
    }

});
router.delete("/deleteReport:dtls", (req, res) => {
    var objectToSend = {}

    var obj = JSON.parse(req.params.dtls);
    let db='svayam_'+obj.b_acct_id+'_data';
    var sql = "delete from " + db + ".saved_reports where report_id=" + obj.report_id

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->financials-->joutnalListing-->deleteReport--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        } else {
            objectToSend["error"] = false
            objectToSend["data"] = "Delete Successfully!"
            res.send(objectToSend);
        }
    })
})
router.get("/getReports:dtls", (req, res) => {
    var objectToSend = {}

    var b_acct_id = req.params.dtls;
    let db='svayam_'+b_acct_id+'_data';
    var sql = "Select * from " + db + ".saved_reports"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->financial-->journalListing-->getReports--", error)
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



function executeQueryInHive(hql, callback) {
    hiveDbCon.reserve(function (err4, connObj) {
        if (err4) {
            hiveDbCon.release(connObj, function (err8) {
                if (err8) {
                    console.log("Error routes-->financials-->trialBalance-->--Error while releasing con", err8)
                } else {
                    console.log("Hive conn released")
                }
            })
            return callback(err4, null)
        } else {
            var conn = connObj.conn;


            conn.createStatement(function (err1, statement) {
                if (err1) {
                    hiveDbCon.release(connObj, function (err8) {
                        if (err8) {
                            console.log("Error routes-->financials-->trialBalance-->--Error while releasing con", err8)
                        } else {
                            console.log("Hive conn released")
                        }
                    })
                    return callback(err1, null)
                } else {
                    statement.executeQuery(hql, function (err2, rows) {
                        if (err2) {
                            hiveDbCon.release(connObj, function (err8) {
                                if (err8) {
                                    console.log("Error routes-->financials-->trialBalance-->--Error while releasing con", err8)
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            return callback(err2, null)
                        } else {
console.log(Date.now())
                            rows.toObjArray(function (error, rs) {
                                if (error) {

                                    hiveDbCon.release(connObj, function (err8) {
                                        if (err8) {
                                            console.log("Error routes-->financials-->trialBalance-->--Error while releasing con", err8)
                                        } else {
                                            console.log("Hive conn released")
                                        }
                                    })

                                    return callback(error, null)


                                } else {
                                    hiveDbCon.release(connObj, function (err8) {
                                        if (err8) {
                                            console.log("Error routes-->administration-->financials-->processingGroup-->Reference data-->getReprtingUnits--Error while releasing con", err8)
                                        } else {
                                            console.log("Hive conn released")
                                        }
                                    })
console.log(Date.now())
                                    return callback(null, rs)


                                }

                            })
                        }
                    })
                }

            })


        }
    })
}


router.post('/getCustomGeneralData',(req,res)=>{
    var objectToSend={}



    var obj=req.body;

    if(obj.store=='MySQL'){
        mysqlPool.query(obj.query,function(error,results){
            if(error){
                console.log("Error-->routes-->financials-->generalReport-->getGeneralData--", error)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = results
                res.send(objectToSend);                                                                                                                                             }
        })
    }else{
        executeQueryInHiveCustom(obj.query,function(err,results){
            if(err){
                console.log("Error-->routes-->financials-->generalReport-->getGeneralData--", err)
                objectToSend["error"] = true
                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                res.send(objectToSend);
            }else{
                objectToSend["error"] = false
                objectToSend["data"] = results
                res.send(objectToSend);
            }
        })

    }

})

function executeQueryInHiveCustom(hql, callback) {
    hiveDbCon.reserve(function (err4, connObj) {
        if (err4) {
            hiveDbCon.release(connObj, function (err8) {
                if (err8) {
                    console.log("Error-->routes-->financials-->generalReport-->>--Error while releasing con", err8)
                } else {
                    console.log("Hive conn released")
                }
            })
            return callback(err4, null)
        } else {
            var conn = connObj.conn;


            conn.createStatement(function (err1, statement) {
                if (err1) {
                    hiveDbCon.release(connObj, function (err8) {
                        if (err8) {
                            console.log("Error-->routes-->financials-->generalReport-->--Error while releasing con", err8)
                        } else {
                            console.log("Hive conn released")
                        }
                    })
                    return callback(err1, null)
                } else {
                    statement.executeQuery(hql, function (err2, rows) {
                        if (err2) {
                            hiveDbCon.release(connObj, function (err8) {
                                if (err8) {
                                    console.log("Error-->routes-->financials-->generalReport-->--Error while releasing con", err8)
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
                            return callback(err2, null)
                        } else {

                            let retRes=[]
				console.log(Date.now())
                            try{
                                let rsmd=rows._rs.getMetaDataSync();
                                let numCols=rsmd.getColumnCountSync();
    
                                while(rows._rs.nextSync()){
                                    let tempObj={}
    
                                    for(let itr=1;itr<=numCols;itr++){
                                        tempObj[rsmd.getColumnNameSync(itr)]=rows._rs.getStringSync(itr);
                                    }
    
                                    retRes.push(tempObj);
                                }
                            }catch(ex){
                                hiveDbCon.release(connObj, function (err8) {
                                    if (err8) {
                                        console.log("Error-->routes-->financials-->generalReport-->--Error while releasing con", err8)
                                    } else {
                                        console.log("Hive conn released")
                                    }
                                })
console.log(Date.now())
                                return callback(ex, null)
                            }
                            
                            
                            try{
                                rows._rs.close();
                            }catch(ex){
                                console.log("Unable To CLose result Set")
                            }

                            hiveDbCon.release(connObj, function (err8) {
                                if (err8) {
                                    console.log("Error-->routes-->financials-->generalReport-->--Error while releasing con", err8)
                                } else {
                                    console.log("Hive conn released")
                                }
                            })
console.log(Date.now())
                            return callback(null,retRes);
                            
                        }
                    })
                }

            })


        }
    })
}

router.get('/getallPpd:dtls', function (req, res) {
    
    var b_acct_id = req.params.dtls;
    var db="svayam_"+b_acct_id+"_data";
    var objectToSend = {};
    
    var sqlQuery = "select DATE_FORMAT(ppd,'%Y-%m-%d') as ppd ,status from " + db + ".ppd_info";
    mysqlPool.query(sqlQuery, function (error, results, fields) {
        if (error) {
            console.log("Error-->routes-->controls-->activityDashboard-->getPpds", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.end(JSON.stringify(objectToSend))
        }
        else {
            objectToSend["error"] = false;
            objectToSend["data"] = results;
            res.send(JSON.stringify(objectToSend))
        }
    });

});
module.exports = router;
