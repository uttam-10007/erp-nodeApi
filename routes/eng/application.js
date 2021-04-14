var express = require('express');
var router = express.Router();
var SqlString = require('sqlstring');
var propObj = require('../../config_con')
let mysqlPool = require('../../connections/mysqlConnection');
var moment = require('moment')


router.post('/createApplication',(req,res)=>{
    let obj=req.body
    let objectToSend={};

    let b_acct_id=obj["b_acct_id"]
    let name=SqlString.escape(obj["name"])
    let reg_addr=SqlString.escape(obj["reg_addr"])
    let pri_email_id=SqlString.escape(obj["pri_email_id"])
    let sec_email_id=SqlString.escape(obj["sec_email_id"])
    let mob_no=SqlString.escape(obj["mob_no"])
    let estab_year=SqlString.escape(obj["estab_year"])
    let pan_no=SqlString.escape(obj["pan_no"])
    let esic_no=SqlString.escape(obj["esic_no"])
    let epf_no=SqlString.escape(obj["epf_no"])
    let const_type=SqlString.escape(obj["const_type"])
    let director_data=SqlString.escape(obj["director_data"])
    let application_category_code=SqlString.escape(obj["application_category_code"])
    let net_worth=SqlString.escape(obj["net_worth"])
    let average_annual_turnover=SqlString.escape(obj["average_annual_turnover"])
    let turnover_data=SqlString.escape(obj["turnover_data"])
    let project_data=SqlString.escape(obj["project_data"])
    let manpower_data=SqlString.escape(obj["manpower_data"])
    let machine_data=SqlString.escape(obj["machine_data"])
    let amount=SqlString.escape(obj["amount"])
    let challan_id=SqlString.escape(obj["challan_id"])
    let status=SqlString.escape(obj["status"])
    let expiry_dt=SqlString.escape(obj["expiry_dt"])
    let application_dt=SqlString.escape(obj["application_dt"])
    let modication_dt=SqlString.escape(obj["modication_dt"])
    let reminder_dt=SqlString.escape(obj["reminder_dt"])
    let create_user_id=SqlString.escape(obj["create_user_id"])
    let create_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let labour_reg_no=SqlString.escape(obj['labour_reg_no'])
    let challan_status=SqlString.escape(obj['challan_status'])
    let db="svayam_"+b_acct_id+"_eng"

    let firm_document_id=SqlString.escape(obj['firm_document_id'])
    let board_document_id=SqlString.escape(obj['board_document_id'])
    let pan_document_id=SqlString.escape(obj['pan_document_id'])
    let incorp_cert_document_id=SqlString.escape(obj['incorp_cert_document_id'])
    let net_worth_document_id=SqlString.escape(obj['net_worth_document_id'])
    let itr_document_id=SqlString.escape(obj['itr_document_id'])
    let balance_sheet_document_id=SqlString.escape(obj['balance_sheet_document_id'])
    let work_completion_cd=SqlString.escape(obj['work_completion_cd'])

    let sql_insert="INSERT INTO "+db+".application (challan_status, labour_reg_no,name, reg_addr, pri_email_id, sec_email_id, mob_no, estab_year, pan_no, esic_no, epf_no, const_type, director_data,"
            +" application_category_code, net_worth, average_annual_turnover, turnover_data, project_data, manpower_data, machine_data, amount, challan_id, status, "
            +"expiry_dt, application_dt, modication_dt, reminder_dt, create_user_id, create_timestamp,firm_document_id,board_document_id,pan_document_id,incorp_cert_document_id,net_worth_document_id,itr_document_id,balance_sheet_document_id,work_completion_cd) values "
            +" ("+challan_status+","+labour_reg_no+","+name+", "+reg_addr+", "+pri_email_id+", "+sec_email_id+", "+mob_no+", "+estab_year+", "+pan_no+", "+esic_no+", "+epf_no+", "+const_type+", "+director_data+","
            +" "+application_category_code+", "+net_worth+", "+average_annual_turnover+", "+turnover_data+", "+project_data+", "+manpower_data+", "+machine_data+", "+amount+", "+challan_id+", "+status+", "
            +" "+expiry_dt+", "+application_dt+", "+modication_dt+", "+reminder_dt+", "+create_user_id+", "+create_timestamp+","
            +firm_document_id+", "+board_document_id+", "+pan_document_id+", "+incorp_cert_document_id+", "+net_worth_document_id+", "+itr_document_id+", "+balance_sheet_document_id+","+work_completion_cd+")"

    mysqlPool.query(sql_insert, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->application-->createApplication", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results.insertId
            res.send(objectToSend)
        }

    })
   


})

router.get('/getApplications:dtls',(req,res)=>{
    let objectToSend={}

    let obj=JSON.parse(req.params.dtls)

    let b_acct_id=obj["b_acct_id"]

    let db="svayam_"+b_acct_id+"_eng"

    let sql_fetch="Select work_completion_cd,firm_document_id,board_document_id,pan_document_id,incorp_cert_document_id,challan_status, labour_reg_no,id,name, reg_addr, pri_email_id, sec_email_id, mob_no, estab_year, pan_no, esic_no, epf_no, const_type, director_data,"
            +" application_category_code, net_worth, average_annual_turnover, turnover_data, project_data, manpower_data, machine_data, amount, challan_id, status, "
            +"DATE_FORMAT( expiry_dt,'%Y-%m-%d') as expiry_dt,DATE_FORMAT( application_dt,'%Y-%m-%d') as  application_dt, "
            +"DATE_FORMAT( modication_dt,'%Y-%m-%d') as modication_dt,DATE_FORMAT( reminder_dt,'%Y-%m-%d') as reminder_dt, create_user_id, create_timestamp,update_user_id, update_timestamp,net_worth_document_id,itr_document_id,balance_sheet_document_id"
            +" from "+db+".application"
let flag=false
    if(obj["id"]!=undefined){
        sql_fetch+=" where id="+SqlString.escape(obj["id"])
        flag=true
    }
    if(obj["mob_no"]!=undefined){
        if(flag==true){
            sql_fetch+=" and mob_no="+SqlString.escape(obj["mob_no"])

        }else{
            sql_fetch+=" where mob_no="+SqlString.escape(obj["mob_no"])

        }
      
    }

    mysqlPool.query(sql_fetch, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->application-->getApplications", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = results
            res.send(objectToSend)
        }

    })
})

function makeExpireyDate(date,obj){
    var d=new Date(date)
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var c = new Date(year + obj['num_of_years'], month, day);
    c.setMonth(c.getMonth() +  obj['num_of_months']);

    c.setDate(c.getDate() + obj['num_of_days']);
    return c;

}
router.put('/updateApplication',(req,res)=>{
    let objectToSend={}
    let obj=req.body


    let id=SqlString.escape(obj["id"])
    let b_acct_id=obj["b_acct_id"]
    let name=SqlString.escape(obj["name"])
    let reg_addr=SqlString.escape(obj["reg_addr"])
    let pri_email_id=SqlString.escape(obj["pri_email_id"])
    let sec_email_id=SqlString.escape(obj["sec_email_id"])
    let mob_no=SqlString.escape(obj["mob_no"])
    let estab_year=SqlString.escape(obj["estab_year"])
    let pan_no=SqlString.escape(obj["pan_no"])
    let esic_no=SqlString.escape(obj["esic_no"])
    let epf_no=SqlString.escape(obj["epf_no"])
    let const_type=SqlString.escape(obj["const_type"])
    let director_data=SqlString.escape(obj["director_data"])
    let application_category_code=SqlString.escape(obj["application_category_code"])
    let net_worth=SqlString.escape(obj["net_worth"])
    let average_annual_turnover=SqlString.escape(obj["average_annual_turnover"])
    let turnover_data=SqlString.escape(obj["turnover_data"])
    let project_data=SqlString.escape(obj["project_data"])
    let manpower_data=SqlString.escape(obj["manpower_data"])
    let machine_data=SqlString.escape(obj["machine_data"])
    let amount=SqlString.escape(obj["amount"])
    let challan_id=SqlString.escape(obj["challan_id"])
    let status=SqlString.escape(obj["status"])
    let expiry_dt=SqlString.escape(obj["expiry_dt"])
    let application_dt=SqlString.escape(obj["application_dt"])
    let modication_dt=SqlString.escape(moment().format('YYYY-MM-DD'))
    let reminder_dt=SqlString.escape(obj["reminder_dt"])
    let update_user_id=SqlString.escape(obj["update_user_id"])
    let labour_reg_no=SqlString.escape(obj['labour_reg_no'])
    let update_timestamp = SqlString.escape(moment().format('YYYY-MM-DD HH:mm:ss'))
    let challan_status=SqlString.escape(obj['challan_status'])

    let firm_document_id=SqlString.escape(obj['firm_document_id'])
    let board_document_id=SqlString.escape(obj['board_document_id'])
    let pan_document_id=SqlString.escape(obj['pan_document_id'])
    let incorp_cert_document_id=SqlString.escape(obj['incorp_cert_document_id'])
    let net_worth_document_id=SqlString.escape(obj['net_worth_document_id'])
    let itr_document_id=SqlString.escape(obj['itr_document_id'])
    let balance_sheet_document_id=SqlString.escape(obj['balance_sheet_document_id'])
    let work_completion_cd=SqlString.escape(obj['work_completion_cd'])

   
    if(obj['status']=='ACTIVE'){
        expiry_dt=SqlString.escape(makeExpireyDate(moment().format('YYYY-MM-DD'),obj['category_obj']))
    }
    let db="svayam_"+b_acct_id+"_eng"

    let sql_upd="update "+db+".application set challan_status="+challan_status+",labour_reg_no="+labour_reg_no+", name="+name+",reg_addr="+reg_addr+",pri_email_id="+pri_email_id+",sec_email_id="+sec_email_id+",mob_no="+mob_no+","
            +"estab_year="+estab_year+",pan_no="+pan_no+",esic_no="+esic_no+",epf_no="+epf_no+",const_type="+const_type+",director_data="+director_data+","
            +"application_category_code="+application_category_code+",net_worth="+net_worth+",average_annual_turnover="+average_annual_turnover+","
            +"turnover_data="+turnover_data+",project_data="+project_data+",manpower_data="+manpower_data+",machine_data="+machine_data+",amount="+amount+","
            +"challan_id="+challan_id+",status="+status+",expiry_dt="+expiry_dt+",application_dt="+application_dt+",modication_dt="+modication_dt+","
            +"firm_document_id="+firm_document_id+",board_document_id="+board_document_id+",pan_document_id="+pan_document_id+",incorp_cert_document_id="+incorp_cert_document_id+","
            +"reminder_dt="+reminder_dt+",update_user_id="+update_user_id+",update_timestamp="+update_timestamp
            +",net_worth_document_id="+net_worth_document_id+",itr_document_id="+itr_document_id+",balance_sheet_document_id="+balance_sheet_document_id+",work_completion_cd ="+work_completion_cd
            +" where id="+id

    mysqlPool.query(sql_upd, function (error2,results) {
        if (error2) {
            console.log("Error-->routes-->eng-->application-->updateApplication", error2)
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server Side. Please try again later"
            res.send(objectToSend)
            
        } else {
            objectToSend["error"] = false;
            objectToSend["data"] = "Application updated Successfully"
            res.send(objectToSend)
        }

    })

})




router.delete('/deleteApplication:dtls',(req,res)=>{
    let objectToSend={}
    let obj=JSON.parse(req.params.dtls)


    let id=SqlString.escape(obj["id"])
    let b_acct_id=obj["b_acct_id"]
  
    let db="svayam_"+b_acct_id+"_eng"

    let sql="delete from "+db+".application  where id="+id
  
    let sql_delete="delete from "+db+".upload_document where application_id="+id


    mysqlPool.getConnection(function (error, mysqlCon) {

        if (error) {
            console.log("Error-->routes-->eng-->application-->deleteApplication", error);
            objectToSend["error"] = true;
            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
            res.send(objectToSend)
        }else{
            mysqlCon.beginTransaction(function (error1) {
                if (error1) {
                    console.log("Error-->routes-->eng-->application-->deleteApplication", error1);
                    objectToSend["error"] = true;
                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                    res.send(objectToSend)
                    mysqlCon.release()
                }else{
                    mysqlCon.query(sql+";"+sql_delete, function (error2, results2) {
                        if (error2) {
                            console.log("Error-->routes-->eng-->application-->deleteApplication", error2);
                            objectToSend["error"] = true;
                            objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                            res.send(objectToSend)
                            mysqlCon.rollback();
                            mysqlCon.release()
                        } else{
                           
                                            mysqlCon.commit(function (error3) {
                                                if (error3) {
                                                    console.log("Error-->routes-->eng-->application-->deleteApplication", error3);
                                                    objectToSend["error"] = true;
                                                    objectToSend["data"] = "Some error occured at server side. Please try again later. If problem persists, contact support."
                                                    res.send(objectToSend)
                                                    mysqlCon.rollback();
                                                    mysqlCon.release()
                                                } else {
                                                    objectToSend["error"] = false;
                                                    objectToSend["data"] = "Deleted successfully! "
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