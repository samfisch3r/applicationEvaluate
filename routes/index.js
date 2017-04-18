var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongojs = require('mongojs');
var csv = require('csvtojson');
 
var databaseURI = 'localhost:27017/valuation';
var collections = ['applications', 'criteria', 'judge'];
var db = mongojs(databaseURI, collections);
 
router.route('/')
    .get(function(req, res, next) {
        res.render('index', {
            title: 'Application Evaluate'
        });
        db.applications.ensureIndex( { userid: 1 }, {unique:true} )
        db.criteria.ensureIndex( { crit: 1 }, {unique:true} )
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
                addUserData(jsonObj);
            });
            res.redirect('back');
        });
    });
 
router.route('/judgeoverview')
    .get(function(req, res, next) {
        var crit = req.query.crit;
        if (crit) {
            deleteCrit(crit);
            return res.redirect('/judgeoverview');
            next();
        };
        getCritData(function(data) {
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
        getCriteria(crit, function(data) {
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
        setCriteria(req);
        res.redirect('/judgeoverview');
    });
 
router.route('/applicationdata')
    .get(function(req, res, next) {
        var del = req.query.del;
        if (del) {
            deleteAppData();
            return res.redirect('/applicationdata');
            next();
        };
        getAppData(function(data) {
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
 
function addUserData(data) {
    db.applications.insert(data);
}
 
function getAppData(cb) {
    db.applications.find({}, {userid: 0, _id: 0}, function (err, results) {
        cb(results);
    });
}
 
function deleteAppData() {
    db.applications.remove();
}
 
function setCriteria(req) {
    req.checkBody('crit').notEmpty();
    req.checkBody('imp').isNumeric();
 
    var errors = req.validationErrors();
    if (!errors) {
        db.criteria.update({crit: req.body.crit}, req.body, {upsert: true});
    }
}
 
function getCritData(cb) {
    db.criteria.find({}, {_id: 0}, function (err, results) {
        cb(results);
    });
}
 
function getCriteria(criteria, cb) {
    db.criteria.find({crit: criteria}, {_id: 0}).limit(1, function (err, result) {
        cb(result);
    });
}
 
function deleteCrit(criteria) {
    db.criteria.remove({crit: criteria});
}
 
module.exports = router;