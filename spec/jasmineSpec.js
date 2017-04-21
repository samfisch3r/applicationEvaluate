var request = require('request');
var csv = require('csvtojson');
var db = require('../routes/dbInteraction.js');
var base_url = 'http://localhost:3000/';

var jsonObject = {userid: '100000', name: 'TestTest'};

describe('Get Main Page', function() {
    it('returns status code 200', function(done) {
        request.get(base_url, function(error, response, body) {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});

describe('Get Application Data Page', function() {
    it('returns status code 200', function(done) {
        request.get(base_url + 'applicationdata', function(error, response, body) {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});

describe('Get Evaluation Criteria Overview Page', function() {
    it('returns status code 200', function(done) {
        request.get(base_url + 'judgeoverview', function(error, response, body) {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});

describe('Get Evaluation Criteria Page', function() {
    it('returns status code 200', function(done) {
        request.get(base_url + 'judge', function(error, response, body) {
            expect(response.statusCode).toBe(200);
            done();
        });
    });
});

describe('Test csv to json conversion', function() {
    it('converts correctly', function(done) {
        csv({ 
            delimiter: ";"
        })
        .fromString('userid;name\n100000;TestTest')
        .on('json',(json)=>{
            expect(json).toEqual(jsonObject);
            done();
        });
    });
});

describe('Insert Application Data into MongoDB', function() {
    it('inserts correctly', function(done) {
        db.addAppData(jsonObject, function(res) {
            db.getAppData(function(data) {
                expect(data).toContain({name: 'TestTest'});
                done();
            });
        });
    });
});

describe('Delete Application Data from MongoDB', function() {
    it('deletes correctly', function(done) {
        db.deleteSingleData('100000', function(res) {
            db.getAppData(function(data) {
                expect(data).not.toContain({name: 'TestTest'});
                done();
            });
        });
    });
});

describe('Insert Criteria into MongoDB', function() {
    it('inserts correctly', function(done) {
        db.setCriteria({crit: 'TestTest', imp: 3}, function(res) {
            db.getCriteria('TestTest', function(data) {
                expect(data).toContain({crit: 'TestTest', imp: 3});
                done();
            });
        });
    });
});

describe('Delete Criteria from MongoDB', function() {
    it('inserts correctly', function(done) {
        db.deleteCrit('TestTest', function(res) {
            db.getCritData(function(data) {
                expect(data).not.toContain({crit: 'TestTest', imp: 3});
                done();
            });
        }); 
    });
});