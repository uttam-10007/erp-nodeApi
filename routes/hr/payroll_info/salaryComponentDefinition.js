var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../../config_con')
let mysqlPool = require('../../../connections/mysqlConnection');
var moment=require('moment')


router.get('/getComponentDefinition:dtls',(req,res)=>{

    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]
    let effective_dt=SqlString.escape(obj["effective_dt"])
    let status=obj["status"]
    let status_filter=""
    for(let i=0;i<status.length;i++){
        status_filter+=SqlString.escape(status[i])
        if(i<status.length-1){
            status_filter+=","
        }
    }
    
    let sql="Select id,effective_dt,component_code,dependent_component,rate_type,lower_limit,upper_limit,amount,status,pay_code,create_user_id,update_user_id,"
    + "DATE_FORMAT(create_timestamp,'%Y-%m-%d %H:%i:%S') as create_timestamp,DATE_FORMAT(update_timestamp,'%Y-%m-%d %H:%i:%S') as "
    + "update_timestamp from svayam_"+b_acct_id+"_hr.salary_component_definition where effective_dt<="+effective_dt+" and status in ("+status_filter+") order by component_code,effective_dt"

    mysqlPool.query(sql, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->getComponentDefinition--", error)
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

router.put('/deactivateComponent',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let status="'INACTIVE'"
    let id=SqlString.escape(obj["id"])
    let component_code=SqlString.escape(obj["component_code"])
    let update_user_id = SqlString.escape(obj["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let effective_end_dt=SqlString.escape(obj["effective_end_dt"])
    
    let sql="update svayam_"+b_acct_id+"_hr.salary_component_definition set status="+status+",update_user_id="+update_user_id+","
        +"update_timestamp="+update_timestamp+" where id="+id

    let sql_fixedPay="update svayam_"+b_acct_id+"_hr.fixed_pay set effective_end_dt="+effective_end_dt+",update_user_id="+update_user_id+","
            +"update_timestamp="+update_timestamp+" where pay_component_code="+component_code+" and effective_end_dt="+SqlString.escape(propObj.outlierDate);

    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->changeComponentStatus--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->changeComponentStatus--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                else{
                    mysqlCon.query(sql+";"+sql_fixedPay,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->changeComponentStatus--", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release();
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->changeComponentStatus--", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Component Deactivated"
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                }
                            })
                        }
                    })
                }
            })
        }
    })

    
})

router.post('/addComponentDefinition',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let effective_dt=SqlString.escape(obj["effective_dt"])
    let component_code=SqlString.escape(obj["component_code"])
    let dependent_component=obj["dependent_component"]
    let rate_type=SqlString.escape(obj["rate_type"])
    let lower_limit=SqlString.escape(obj["lower_limit"])
    let upper_limit=SqlString.escape(obj["upper_limit"])
    let amount=SqlString.escape(obj["amount"])
    let status=SqlString.escape(obj["status"])
    let pay_code=SqlString.escape(obj["pay_code"])
    let create_user_id = SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let sql_insDef="insert into svayam_"+b_acct_id+"_hr.salary_component_definition (effective_dt,component_code,dependent_component,rate_type,lower_limit"
        +",upper_limit,amount,status,pay_code,create_user_id,create_timestamp) values "
        +"("+effective_dt+","+component_code+","+SqlString.escape(dependent_component.join(","))+","+rate_type+","+lower_limit+","+upper_limit+","+amount+","+status+","+pay_code+","+create_user_id+","+create_timestamp+")"

    mysqlPool.query(sql_insDef, function (error, results) {
        if (error) {
            console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->getComponentDefinition--", error)
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

router.put('/activateComponent',(req,res)=>{
    let objectToSend={}

    let detail=req.body

    let b_acct_id=detail["b_acct_id"]
    let end_dt=SqlString.escape(detail["end_dt"])
    let status=SqlString.escape(detail["status"])
    let update_user_id = SqlString.escape(detail["update_user_id"])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let id=SqlString.escape(detail["id"])

    let fixedPayInfo=detail["fixed_pay_info"]
    let sql=""
    let sql_upd=""
    if(fixedPayInfo.length!=0){
        let est=SqlString.escape(fixedPayInfo[0]["effective_start_dt"])

        sql="insert into svayam_"+b_acct_id+"_hr.fixed_pay_amount (pay_component_code,pay_component_amt,effective_start_dt,"
                +"effective_end_dt,emp_id,pay_code,create_user_id,create_timestamp) values"
    
        sql_upd="update svayam_"+b_acct_id+"_hr.fixed_pay_amount set effective_end_dt="+est+" where effective_end_dt="+end_dt+" and "
                +" pay_component_code in ("
        
        let create_timestamp=update_timestamp
        
        let payCompCodes={}
        let empIds={}
console.log("hii");    
        for(let i=0;i<fixedPayInfo.length;i++){
            let obj=fixedPayInfo[i]
            let pay_component_code=SqlString.escape(obj["pay_component_code"])
            let pay_component_amt=SqlString.escape(obj["pay_component_amt"])
            let effective_start_dt=SqlString.escape(obj["effective_start_dt"])
            let effective_end_dt=SqlString.escape(obj["effective_end_dt"])
            let emp_id=SqlString.escape(obj["emp_id"])
            let pay_code=SqlString.escape(obj["pay_code"])
            let create_user_id=SqlString.escape(obj["create_user_id"])
    
            payCompCodes[pay_component_code]=true
            empIds[emp_id]=true
            
            sql=sql+"("+pay_component_code+","+pay_component_amt+","+effective_start_dt+","+effective_end_dt+","+emp_id+","+pay_code+","+create_user_id+","+create_timestamp+")"
    
            if(i<fixedPayInfo.length-1){
                sql+=","
            }
    
        }
        sql_upd=sql_upd+Object.keys(payCompCodes).join(",")+") and emp_id in ("+Object.keys(empIds).join(",")+")"
    
    }else{
        sql_upd="Select 1"
        sql="Select 1"
    }
    
    let sql_insDef="update svayam_"+b_acct_id+"_hr.salary_component_definition set status="+status+",update_user_id="+update_user_id+","
            +"update_timestamp="+update_timestamp+" where id="+id

    
    
console.log(sql);
    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->payroll_info-->salaryCompnentDefinition-->activateComponent", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->payroll_info-->salaryCompnentDefinition-->activateComponent", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql_insDef+";"+sql_upd+";"+sql,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->payroll_info-->salaryCompnentDefinition-->activateComponent", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release()
                        }else{
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->payroll_info-->salaryCompnentDefinition-->activateComponent", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release()
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Rule Activated"
                                    res.send(objectToSend);
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

router.post('/tooactivateComponent',(req,res)=>{
    let objectToSend={}

    let obj=req.body

    let b_acct_id=obj["b_acct_id"]
    let effective_dt=SqlString.escape(obj["effective_dt"])
    let component_code=SqlString.escape(obj["component_code"])
    let dependent_component=obj["dependent_component"]
    let rate_type=SqlString.escape(obj["rate_type"])
    let lower_limit=SqlString.escape(obj["lower_limit"])
    let upper_limit=SqlString.escape(obj["upper_limit"])
    let amount=SqlString.escape(obj["amount"])
    let status=SqlString.escape(obj["status"])
    let pay_code=SqlString.escape(obj["pay_code"])
    let create_user_id = SqlString.escape(obj["update_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let id=SqlString.escape(obj["id"])
    
    let endDate=propObj.outlierDate

    let sql_insDef="update svayam_"+b_acct_id+"_hr.salary_component_definition set status="+status+",update_user_id="+create_user_id+","
            +"update_timestamp="+create_timestamp+" where id="+id
    
    
    let sql_fetchBasic=null;
    let depComp_filter=""
    for(let i=0;i<dependent_component.length;i++){
        depComp_filter+=SqlString.escape(dependent_component[i])
        if(i<dependent_component.length-1){
            depComp_filter+=","
        }
    }
    let numDeps=dependent_component.length
    if(rate_type=="'FIX'"||rate_type=="'PERCENTAGE'"){
        if(dependent_component.length==1 && dependent_component.includes("GRADEPAY")){
            sql_fetchBasic="Select emp_id,sum(convert(grade_pay_code,int)) as pay_component_amt,count(1) as num_comps from (Select *,rank() over(partition by emp_id order by effective_timestamp DESC) as svm_rank"
                +" from svayam_"+b_acct_id+"_hr.establishment_info where emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") )x where svm_rank=1 group by emp_id"
    
        }
        else if(!(dependent_component.includes("GRADEPAY"))){
            sql_fetchBasic="Select emp_id, sum(pay_component_amt) as pay_component_amt,count(1) as num_comps from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code in "
                +"("+depComp_filter+") and effective_end_dt="+endDate+" and emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") group by emp_id"

        }else{
            sql_fetchBasic="Select emp_id, sum(pay_component_amt) as pay_component_amt,count(1) as num_comps from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code in "
                +"("+depComp_filter+") and effective_end_dt="+endDate+" and emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") group by emp_id"
            
            sql_fetchBasic+=" union all "

            sql_fetchBasic+="Select emp_id,sum(convert(grade_pay_code,int)) as pay_component_amt,count(1) as num_comps from (Select *,rank() over(partition by emp_id order by effective_timestamp DESC) as svm_rank"
                +" from svayam_"+b_acct_id+"_hr.establishment_info where emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") )x where svm_rank=1 group by emp_id"

            sql_fetchBasic="Select emp_id,sum(pay_component_amt) as pay_component_amt,sum(num_comps) as num_comps from ("+sql_fetchBasic+")z group by emp_id"
        }
        
        

    }else{
        if(dependent_component.length==1 &&  dependent_component.includes("GRADEPAY")){
            sql_fetchBasic="Select emp_id,sum(pay_component_amt)  as pay_component_amt,count(1) as num_comps from (Select emp_id,convert(grade_pay_code,int) as pay_component_amt from (Select *,rank() over(partition by emp_id order by effective_timestamp DESC) as svm_rank"
                +" from svayam_"+b_acct_id+"_hr.establishment_info where emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") )x where svm_rank=1)y"
                +" where pay_component_amt<="+upper_limit+" and pay_component_amt>="+lower_limit+" group by emp_id"
       
        }
        else if(!(dependent_component.includes("GRADEPAY"))){
            sql_fetchBasic="Select emp_id,sum(pay_component_amt) as pay_component_amt,count(1) as num_comps from (Select emp_id,pay_component_code as pay_component_code,pay_component_amt as pay_component_amt"
                +" from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code in "
                +"("+depComp_filter+") and effective_end_dt="+endDate+" and emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") )x "
                +"where pay_component_amt<="+upper_limit+" group by emp_id"
        }else{
            sql_fetchBasic="Select emp_id,sum(pay_component_amt)  as pay_component_amt,count(1) as num_comps from (Select emp_id,convert(grade_pay_code,int) as pay_component_amt from (Select *,rank() over(partition by emp_id order by effective_timestamp DESC) as svm_rank"
                +" from svayam_"+b_acct_id+"_hr.establishment_info where emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") )x where svm_rank=1)y"
                +" where pay_component_amt<="+upper_limit+"  group by emp_id"

            sql_fetchBasic+=" union all "

            sql_fetchBasic+="Select emp_id,sum(pay_component_amt) as pay_component_amt,count(1) as num_comps from (Select emp_id,pay_component_code as pay_component_code,pay_component_amt as pay_component_amt"
                +" from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code in "
                +"("+depComp_filter+") and effective_end_dt="+endDate+" and emp_id in"
                +" (Select emp_id from svayam_"+b_acct_id+"_hr.fixed_pay where pay_component_code="+component_code+" and effective_end_dt="+endDate+") )x "
                +"where pay_component_amt<="+upper_limit+"  group by emp_id"

            sql_fetchBasic="Select emp_id , sum(pay_component_amt) as pay_component_amt,sum(num_comps) as num_comps from ("+sql_fetchBasic+")z group by emp_id"

        }
        
        
        
    }    

    
    mysqlPool.getConnection(function(error,mysqlCon){
        if(error){
            console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->addComponentDefinition--", error)
            objectToSend["error"] = true
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend);
        }else{
            mysqlCon.beginTransaction(function(error1){
                if(error1){
                    console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->addComponentDefinition--", error1)
                    objectToSend["error"] = true
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend);
                    mysqlCon.release();
                }
                else{
                    mysqlCon.query(sql_fetchBasic+";"+sql_insDef,function(error2,results2){
                        if(error2){
                            console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->addComponentDefinition--", error2)
                            objectToSend["error"] = true
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend);
                            mysqlCon.rollback()
                            mysqlCon.release();
                        }else if(results2[0].length==0){
                            mysqlCon.commit(function(error3){
                                if(error3){
                                    console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->addComponentDefinition--", error3)
                                    objectToSend["error"] = true
                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                    res.send(objectToSend);
                                    mysqlCon.rollback()
                                    mysqlCon.release();
                                }else{
                                    objectToSend["error"] = false
                                    objectToSend["data"] = "Component Added"
                                    res.send(objectToSend);
                                    mysqlCon.release();
                                }
                            })
                        }else{

                            let sql_insertFixed="insert into svayam_"+b_acct_id+"_hr.fixed_pay (pay_code,pay_component_code,pay_component_amt,effective_start_dt,effective_end_dt,emp_id,create_user_id,create_timestamp) values"

                            let sql_updFixed="update svayam_"+b_acct_id+"_hr.fixed_pay set effective_end_dt="+effective_dt+",update_user_id="+create_user_id+","
                                    +"update_timestamp="+create_timestamp+" where pay_component_code="+component_code+" and "
                                    +"effective_end_dt="+endDate+" and emp_id in ("
                            let data=results2[0]
                            let gotData=false;
                            for(let i=0;i<data.length;i++){
                                let obj=data[i]

                                if(obj["num_comps"]<numDeps){
                                    continue;
                                }

                                
                                sql_updFixed+=SqlString.escape(obj["emp_id"])
                                
                                sql_updFixed+=","

                                let pay_component_code=component_code

                                let pay_component_amt=0;
                                if(rate_type=="'FIX'"){
                                    pay_component_amt=amount
                                }else if(rate_type=="'PERCENTAGE'"){
                                    pay_component_amt=(obj["pay_component_amt"]*amount)/100;
                                }else{
                                    if(obj["pay_component_amt"]>=lower_limit&&obj["pay_component_amt"]<=upper_limit){
                                        pay_component_amt=amount
                                    }else{
                                        continue;
                                    }
                                    
                                }
                                
                                
                        
                                let effective_start_dt=effective_dt
                                let emp_id=SqlString.escape(obj["emp_id"])
                                
                                gotData=true;
                                
                                sql_insertFixed=sql_insertFixed+"("+pay_code+","+pay_component_code+","+pay_component_amt+","+effective_start_dt+","+endDate+","+emp_id+","+create_user_id+","+create_timestamp+")"
                        
                                sql_insertFixed+=","
                            }

                            if(!gotData){
                                mysqlCon.commit(function(error3){
                                    if(error3){
                                        console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->addComponentDefinition--", error3)
                                        objectToSend["error"] = true
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend);
                                        mysqlCon.rollback()
                                        mysqlCon.release();
                                    }else{
                                        objectToSend["error"] = false
                                        objectToSend["data"] = "Component Added"
                                        res.send(objectToSend);
                                        mysqlCon.release();
                                    }
                                })
                            }else{
                                sql_insertFixed=sql_insertFixed.substring(0,sql_insertFixed.length-1)
                                sql_updFixed=sql_updFixed.substring(0,sql_updFixed.length-1)+")"
                                mysqlCon.query(sql_updFixed+";"+sql_insertFixed,function(error4,results4){
                                    if(error4){
                                        console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->addComponentDefinition--", error4)
                                        objectToSend["error"] = true
                                        objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                        res.send(objectToSend);
                                        mysqlCon.rollback()
                                        mysqlCon.release();
                                    }else{
                                        mysqlCon.commit(function(error5){
                                            if(error5){
                                                console.log("Error-->routes-->hr-->payroll_info-->salaryComponentDefinition-->addComponentDefinition--", error5)
                                                objectToSend["error"] = true
                                                objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                res.send(objectToSend);
                                                mysqlCon.rollback()
                                                mysqlCon.release();
                                            }else{
                                                objectToSend["error"] = false
                                                objectToSend["data"] = "Component Added"
                                                res.send(objectToSend);
                                                mysqlCon.release()
                                            }
                                        })
                                    }
                                })
                            }
                            
    
                        }
                    })
                }
            })
        }
    })
})
module.exports=router;
