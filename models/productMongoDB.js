const { getDB } = require('../util/database');
const mongodb = require('mongodb');

class Product {
    constructor(title, price, description, imageUrl, id) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this._id = id ? new mongodb.ObjectId(id) : null;
    }

    save() {
        const db = getDB();
        let dbOp;
        if(!this._id) {
            dbOp = db.collection('products').insertOne(this)
        } else {
            dbOp = db.collection('products').updateOne({
                _id : this._id
            }, { $set : this})
        }
        return dbOp
        .then(product => {
            console.log(product);
        })
        .catch(err => {
            console.log(err);
        })
    }

    static fetchAll() {
        const db = getDB();
        // find will return cursor bcoz of large data use next() to read one by one for large data n for small data (0 - 100) use toArray
        return db.collection('products').find().toArray()
        .then (products => {
            return products;
        })
        .catch(err => {
            console.log(err);
        })
    }

    static findById(productId) {
        return getDB().collection('products').find({
            _id : mongodb.ObjectId(productId)
        }).next()
        .then(product => {
            return product
        })
        .catch(err => {
            console.log(err);
        })
    }

    static deleteById(productId) {
        return getDB().collection('products').deleteOne({
            _id : mongodb.ObjectId(productId)
        })
        .then(() => {
            console.log('deleted');
        })
        .catch(err => {
            console.log(err);
        })
    }
}

module.exports = Product;