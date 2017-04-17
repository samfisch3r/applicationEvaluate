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
				delimiter: ';'
			})
			.fromFile('./public/upload.csv')
			.on('json',(jsonObj)=>{
				addUserData(jsonObj);
			})
			.on('done',()=>{
				console.log('end');
			});
			res.redirect('back');
		});
	});

router.route('/judgeoverview')
	.get(function(req, res, next) {
		res.render('judgeoverview', {
			title: 'Evaluation Criteria Overview'
		});
	});

router.route('/judge')
	.get(function(req, res, next) {
		res.render('judge', {
			title: 'Evaluation Criteria'
		});
	});

router.route('/applicationdata')
	.get(function(req, res, next) {
		res.render('applicationdata', {
			title: 'Application Data'
		});
	});

router.route('/applicationjudge')
	.get(function(req, res, next) {
		res.render('applicationjudge', {
			title: 'Application Data Evaluation'
		});
	});

function addUserData(data) {
	db.applications.insert(data, function(err, doc) {
		if(err) throw err;
	});
}

module.exports = router;
