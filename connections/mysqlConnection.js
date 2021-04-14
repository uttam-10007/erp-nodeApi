var mysql = require('mysql');
var propObj=require('../config_con.js');


try{
     var pool = mysql.createPool(propObj.mysqlConProp);

    

    pool.getConnection((err, connection) => {
        if (err) {
          if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
          }
          else if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
          }
          else if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
          }else{
            console.error('UNKNOWN ERROR--',err)
          }
        }else{
          console.log("Mysql Connection Successful")
          connection.release()
        }
      
         
      
        
      })

    module.exports=pool; 



}catch(ex){
    console.log("Error while connecting with mysql :--",ex)
}
