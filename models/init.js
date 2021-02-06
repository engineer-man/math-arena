const path = require('path');
const basename = path.basename(module.filename);
const db = {};

const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    config.database
);

require('fs')
    .readdir_sync(__dirname)
    .filter(file => {
        return file.indexOf('.') !== 0 && file !== basename && file.match(/\.js$/);
    })
    .for_each(file => {
        let model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

for (const model_name in db) {
    db[model_name].bulk_create = db[model_name].bulkCreate;
    db[model_name].find_one = db[model_name].findOne;
    db[model_name].find_all = db[model_name].findAll;
    db[model_name].find_or_create = db[model_name].findOrCreate;
    db[model_name].find_and_count_all = db[model_name].findAndCountAll;
    db[model_name].belongs_to = db[model_name].belongsTo;
    db[model_name].has_one = db[model_name].hasOne;
    db[model_name].has_many = db[model_name].hasMany;
    db[model_name].belongs_to_many = db[model_name].belongsToMany;
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

$or = Sequelize.Op.or;
$and = Sequelize.Op.and;
$ne = Sequelize.Op.ne;
$not = Sequelize.Op.not;

module.exports = db;
