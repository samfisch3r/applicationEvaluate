var mongojs = require('mongojs');
 
var databaseURI = 'localhost:27017/valuation';
var collections = ['applications', 'criteria', 'judge'];
var db = mongojs(databaseURI, collections);
 
var ensureIndex = function()
{
    db.applications.ensureIndex( { userid: 1 }, {unique:true} )
    db.criteria.ensureIndex( { crit: 1 }, {unique:true} )
}
 
var getAppData = function(cb) {
    db.applications.find({}, {userid: 0, _id: 0}, function (err, results) {
        cb(results);
    });
}
 
var addAppData = function(data) {
    db.applications.insert(data);
}
 
var deleteAppData = function() {
    db.applications.remove();
}
 
var deleteSingleData = function(uid) {
    db.applications.remove({userid: uid});
}
 
var setCriteria = function(data) {
    db.criteria.update({crit: data.crit}, data, {upsert: true});
}
 
var getCritData = function(cb) {
    db.criteria.find({}, {_id: 0}, function (err, results) {
        cb(results);
    });
}
 
var getCriteria = function(criteria, cb) {
    db.criteria.find({crit: criteria}, {_id: 0}).limit(1, function (err, result) {
        cb(result);
    });
}
 
var deleteCrit = function(criteria) {
    db.criteria.remove({crit: criteria});
}
 
module.exports.getAppData = getAppData;
module.exports.ensureIndex = ensureIndex;
module.exports.addAppData = addAppData;
module.exports.deleteAppData = deleteAppData;
module.exports.setCriteria = setCriteria;
module.exports.getCritData = getCritData;
module.exports.getCriteria = getCriteria;
module.exports.deleteCrit = deleteCrit;
module.exports.deleteSingleData = deleteSingleData;