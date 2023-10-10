let mysql = require('mysql');

//membuat varaiable connection
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_kendaraan'
});

//membuat kondisi untuk melihat apakah koneksi apakah sudah berjalan
connection.connect(function (error){
    if(!!error){
        console.log(error)
    }else{
        console.log('koneksi berhasil');
    }
})

//export modul connection
module.exports = connection;