const express = require('express');
const router = express.Router();

//import express-validator
const { body, validationResult } = require('express-validator');

//import database
const connection = require('../config/db');

//1: Menampilkan Semua Transmisi 
router.get('/', (req, res) => {
    connection.query('SELECT * FROM transmisi', (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Transmisi',
                data: rows,
            });
        }
    });
});

//2: Menambahkan Transmisi Baru
router.post('/store', [
    // Validation
    body('nama_transmisi').notEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }
    let data = {
        nama_transmisi: req.body.nama_transmisi
    };
    connection.query('INSERT INTO transmisi SET ?', data, function (err, result) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Data Transmisi berhasil ditambahkan',
                insertedId: result.insertId
            });
        }
    });
});

//3: Menampilkan transmisi Berdasarkan ID
router.get('/:id', (req, res) => {
    let id = req.params.id;
    connection.query('SELECT * FROM transmisi WHERE id_transmisi = ?', [id], (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'transmisi tidak ditemukan',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Transmisi',
                data: rows[0],
            });
        }
    });
});

//4: Memperbarui transmisi Berdasarkan ID
router.patch('/update/:id', [
    body('nama_transmisi').notEmpty(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array(),
        });
    }
    let id = req.params.id;
    let data = {
        nama_transmisi: req.body.nama_transmisi,
    };
    connection.query('UPDATE transmisi SET ? WHERE id_transmisi = ?', [data, id], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'transmisi tidak ditemukan',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'transmisi berhasil diperbarui',
            });
        }
    });
});

//5: Menghapus transmisi Berdasarkan ID
router.delete('/delete/:id', (req, res) => {
    let id = req.params.id;
    connection.query('DELETE FROM transmisi WHERE id_transmisi = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            });
        } else if (result.affectedRows === 0) {
            return res.status(404).json({
                status: false,
                message: 'transmisi tidak ditemukan',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'transmisi berhasil dihapus',
            });
        }
    });
});

module.exports = router;