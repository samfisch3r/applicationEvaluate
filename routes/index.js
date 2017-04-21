var express = require('express');
var router = express.Router();
var fs = require('fs');
var csv = require('csvtojson');
var db = require('./dbInteraction');

router.route('/')
    .get(function(req, res, next) {
        res.render('index', {
            title: 'Application Evaluate'
        });
        db.ensureIndex();
    })
    .post(function(req, res, next) {
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            if (mimetype == 'text/csv') {
                var fstream = fs.createWriteStream('./public/upload.csv');
                file.pipe(fstream);
            }
            file.on('error', function(err) {
                console.log(err);
            });
        });
        req.busboy.on('error', function(err){
            console.log(err);
        });
        req.busboy.on('finish', function() {
            csv({
                delimiter: [';',',']
            })
            .fromFile('./public/upload.csv')
            .on('json',(jsonObj)=>{
                db.addAppData(jsonObj, function(data) {
                });
            });
            res.redirect('back');
        });
    });

router.route('/judgeoverview')
    .get(function(req, res, next) {
        var crit = req.query.crit;
        if (crit) {
            db.deleteCrit(crit, function(data) {
            });
            return res.redirect('/judgeoverview');
        };
        db.getCritData(function(data) {
            if (data)
            {
                if (data.length)
                    res.locals.data = data;
                else
                    res.locals.data = false;
            }
            else
                res.locals.data = false;
            res.render('judgeoverview', {
                title: 'Evaluation Criteria Overview'
            });
        });
    });

router.route('/judge')
    .get(function(req, res, next) {
        var crit = req.query.crit;
        db.getCriteria(crit, function(data) {
            if (data.length)
                res.locals.data = data[0];
            else
                res.locals.data = {};
            res.render('judge', {
                title: 'Evaluation Criteria'
            });
        });
    })
    .post(function(req,res, next) {
        req.checkBody('crit').notEmpty();
        req.checkBody('imp').isNumeric();
        var errors = req.validationErrors();
        if (!errors) {
            db.setCriteria(req.body, function(data) {
            });
            return res.redirect('/judgeoverview');
        }
    });

router.route('/applicationdata')
    .get(function(req, res, next) {
        var del = req.query.del;
        if (del) {
            db.deleteAppData(function(data) {
            });
            return res.redirect('/applicationdata');
        };
        db.getAppData(function(data) {
            if (data)
            {
                if (data.length)
                    res.locals.data = data;
                else
                    res.locals.data = false;
            }
            else
                res.locals.data = false;
            res.render('applicationdata', {
                title: 'Application Data'
            });
        });
    });

router.route('/applicationjudge')
    .get(function(req, res, next) {
        res.render('applicationjudge', {
            title: 'Application Data Evaluation'
        });
    });

module.exports = router;