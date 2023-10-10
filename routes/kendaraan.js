const express = require('express');
const router = express.Router();

const fs = require('fs')

const multer = require('multer')
const path = require('path')

//import express-validator
const { body, validationResult } = require('express-validator');

//import database
const connection = require('../config/db');


const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})


const fileFilter = (req, file, cb) => {
    //mengecheck jenis file yang diizinkan (misalnya, hanya gambar_kendaraan PNG)
    if (file.mimetype === 'image/png'){
        cb(null, true); //izinkan file
    } else {
        cb(new Error('Jenis file tidak diizinkan'), false); //Tolak file
    }
};

const upload = multer({storage: storage, fileFilter: fileFilter })


router.get('/', function (req,res){
    connection.query('SELECT a.no_pol, a.nama_kendaraan, b.nama_transmisi as transmisi, a.gambar_kendaraan from kendaraan a join transmisi b on b.id_transmisi=a.id_transmisi ORDER BY a.no_pol ASC ', function(err, rows){
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
            })
        }else{
            return res.status(200).json({
                status: true,
                message: 'Data Kendaraan',
                data: rows
            })
        }
    })
});

router.post('/store', upload.single("gambar_kendaraan"), [
    //validation
    body('no_pol').notEmpty(),
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    let Data = {
        no_pol: req.body.no_pol,
        nama_kendaraan: req.body.nama_kendaraan,
        id_transmisi: req.body.id_transmisi,
        gambar_kendaraan: req.file.filename
    }
    connection.query('INSERT INTO kendaraan SET ?', Data, function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Data Kendaraan berhasil ditambahkan'
            });
        }
    });
});

router.get('/:id', function (req, res) {
    let id = req.params.id;
    connection.query(`SELECT a.no_pol, a.nama_kendaraan, b.nama_transmisi as transmisi, a.gambar_kendaraan FROM kendaraan a JOIN transmisi b ON b.id_transmisi=a.id_transmisi WHERE no_pol = ${id}`, function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
                error: err
            });
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Kendaraan',
                data: rows[0]
            });
        }
    });
});



router.patch('/update/:id', upload.single("gambar_kendaraan"), [
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    let id = req.params.id;

    // Check if the file exists before attempting to unlink it
    connection.query(`SELECT * FROM kendaraan WHERE no_pol = ${id}`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }
        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            });
        }

        const nama_kendaraanFileLama = rows[0].gambar_kendaraan;

        if (nama_kendaraanFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images', nama_kendaraanFileLama);

            // Check if the file exists before attempting to unlink it
            if (fs.existsSync(pathFileLama)) {
                fs.unlinkSync(pathFileLama);
            }
        }

        let Data = {
            nama_kendaraan: req.body.nama_kendaraan,
            id_transmisi: req.body.id_transmisi
        };

        connection.query(`UPDATE kendaraan SET ? WHERE no_pol = ${id}`, Data, function (err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error',
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Update success..!'
                });
            }
        });
    });
});


router.delete('/delete/:id', function(req, res){
    let id = req.params.id;
    
    connection.query(`SELECT * FROM  kendaraan WHERE no_pol = ${id}`, function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }if (rows.length ===0) {
            return res.status(404).json({
                status: false,
                message: 'Data Kendaraan tidak ditemukan',
            });
        }
        const nama_kendaraanFileLama = rows[0].gambar_kendaraan;

        //hapus file lama jika ada
        if (nama_kendaraanFileLama) {
            const pathFileLama = path.join(__dirname, '../public/images', nama_kendaraanFileLama);
            fs.unlinkSync(pathFileLama);
        }

        connection.query(`DELETE FROM kendaraan WHERE no_pol = ${id}`,  function(err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error',
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Delete Success..!',
                })
            }
        })
    })
})



module.exports = router;