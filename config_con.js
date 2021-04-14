//mysql connection  variables
var mysqlHost="localhost";

var mysqlUser="root";
var mysqlPwd="root";


///Password encryption key

var encryptionKey='d6387ed9704181f860122340e5a042d661afb50211cf45903c01026db4d756cd'

//databases used
var erpsystemdata = "erp_system_data"
var svayamSystemDbName="svayam_system_ebill";
var svayamMetadataSample="svayam_ebill"


////email props
var senderEmail="hadi@svayamtech.com";
var senderPass="work4fun"
var sign_up_page = 'http://192.168.0.120/#/signup';



var mysqlConProp={
    host: mysqlHost, //mysql database host name
    user: mysqlUser, //mysql database user name
    password: mysqlPwd, //mysql database password
    multipleStatements: true,
    port:3306

}


var productTables={
   
    "svayam_ebill":["appr","bud","ded","dev","ebill_info","ebill_items","emb_info","emb_item","gen_cb","project_head","role_xref_resource","tender","tender_item","work_head","zone_head","approval","approval_status","deviation","geometry","emb","deduction","ebill","boq_info","work_info","project_info","arr_info","party_info","code_value","field_info"],
"copy_svayam_ebill":["code_value","field_info","approval","role_xref_resource"]
}



////Product Codes/ Domain Codes

var metadataProductCode="MDR"

module.exports={  
    
    //mysql connection props
    mysqlConProp:mysqlConProp,

    
    //mysql db names
    erpsystemdata : erpsystemdata,
    svayamSystemDbName:svayamSystemDbName,
    svayamMetadataSample:svayamMetadataSample,
    
    //product tables
    productTables:productTables,

    ////signupLink
    sign_up_page: sign_up_page,


    //email configurations
    senderEmail:senderEmail,
    senderPass:senderPass,

    encryptionKey:encryptionKey



    

}
