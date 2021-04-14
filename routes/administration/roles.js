var express = require('express');
var router = express.Router();
var propObj = require('../../config_con.js')
var mysqlPool = require('../../connections/mysqlConnection.js');


var SqlString = require('sqlstring');
var moment = require('moment')


router.get('/getAllUserRoles:dtls',(req,res)=>{
    let objectToSend={}

    let b_acct_id=SqlString.escape(req.params.dtls)

    let sql="SELECT ui.email,ui.user_id,ui.name,ui.b_acct_id,ui.phone_no,GROUP_CONCAT(ux.role_cd) AS role_cd"
+   " FROM "+propObj.svayamSystemDbName+".user_info ui LEFT JOIN "+propObj.svayamSystemDbName+".user_xref_role ux ON ui.user_id=ux.user_id "
 +   " WHERE ui.b_acct_id="+b_acct_id+" GROUP BY ui.email,ui.user_id,ui.name,ui.phone_no"
    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->administration-->roles-->getAllUserRoles", error);
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
router.get('/getRoles',(req,res)=>{
    let objectToSend={}


    let sql="SELECT * from "+propObj.svayamSystemDbName+".role_info"

    mysqlPool.query(sql,function(error,results){
        if(error){
            console.log("Error routes-->administration-->roles-->getRoles", error);
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




router.put('/updateUserRole',(req,res)=>{

    let objectToSend={}

    let obj=req.body

    let user_id=SqlString.escape(obj["user_id"])
    let roles=obj["roles"]

    let sql_delRoleXref="delete from "+propObj.svayamSystemDbName+".user_xref_role where user_id="+user_id

    let sql_insertRoles="insert into "+propObj.svayamSystemDbName+".user_xref_role (user_id,role_cd,b_acct_id) values "
    for(let i=0;i<roles.length;i++){
        sql_insertRoles+="("+user_id+","+SqlString.escape(roles[i])+","+SqlString.escape(obj['b_acct_id'])+")"

        if(i<roles.length-1){
            sql_insertRoles+=","
        }
    }

    let sql_final=sql_delRoleXref

    if(roles.length>0){
        sql_final+=";"+sql_insertRoles
    }

    mysqlPool.getConnection(function(error1,mysqlCon){
        if(error1){
            console.log("Error routes-->administration-->roles-->updateUserRole", error1);
            objectToSend["error"] = true;
            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
            res.send(objectToSend)
        }else{
            mysqlCon.beginTransaction(function(error2){
                if(error2){
                    console.log("Error routes-->administration-->roles-->updateUserRole", error2);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                    res.send(objectToSend)
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_final,function(error3,results3){
                        if(error3){
                            console.log("Error routes-->administration-->roles-->updateUserRole", error3);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                            res.send(objectToSend)
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error4){
                                if(error4){
                                    console.log("Error routes-->administration-->roles-->updateUserRole", error4);
                                    objectToSend["error"] = true;
                                    objectToSend["data"] = "Server Side error! Please try again later. If problem persists, contact support"
                                    res.send(objectToSend)
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false;
                                    objectToSend["data"] = "User Roles updated successfully"
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


module.exports=router;
