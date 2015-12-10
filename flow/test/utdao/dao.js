// utdao/dao.js
// 实现与MySQL交互
function testMysql()
{
    var dbconfig = require('../utconf/dbconfig');
    var mysql = require('mysql');

    /* connect directly */
    var conn = mysql.createConnection(dbconfig.mysql);
    conn.connect();
    conn.query('SELECT * from vp_resend_code', function(err, rows, fields) {
        if (err) throw err;
        for (var i in rows)
        {
            console.log(rows[i].channel_id, rows[i].error_code, rows[i].change_channel, rows[i].enabled, rows[i].last_update);        
        }
    });
    conn.end();
}
testMysql();
//setInterval(testMysql, 1000);

/* connection pool */
function testConnectionPool()
{
    var cfg = {
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'mdos_z916',
        port: 3306
    };
    var mysql = require('mysql');
    var pool = mysql.createPool(cfg);

    var selectSQL = 'SELECT * from vp_resend_code';

    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL ==> " + err);

        conn.query(selectSQL,function(err,rows){
            if (err) console.log(err);
            console.log("SELECT ==> ");
            for (var i in rows)
            {
                console.log(rows[i].channel_id, rows[i].error_code, rows[i].change_channel, rows[i].enabled, rows[i].last_update);        
            }
            conn.release();
        });
    });
}