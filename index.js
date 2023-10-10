const express = require('express') // membuat variable baru dengan nama express
const app = express() // membuat variable baru dengan nama app yang isinya express
const port = 3200 // membuat variable dengan nama port yang isinya 3000

// app.get('/', (req,res)=>{
//     res.send('Halo Saya Fitria Evi Susana, ini modul 14 transmisi')
// })

const bodyPs = require('body-parser'); // import body-parser
app.use(bodyPs.urlencoded({ extended: false }));
app.use(bodyPs.json());


//import route mahasiswa
const transmisiRouter = require('./routes/transmisi');
app.use('/api/transmisi', transmisiRouter);

//import route posts
const kendaraanRouter = require('./routes/kendaraan');
app.use('/api/kendaraan', kendaraanRouter);

//listen express.js kedalam port 
app.listen(port, () => {
    console.log(`aplikasi akan berjalan di http://localhost:${port}`)
})