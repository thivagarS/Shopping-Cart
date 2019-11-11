const { getDB } = require('../util/database');
const mongodb = require('mongodb');

module.exports = class User {
    constructor(userName, email, cart, id) {
        this.userName = userName;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }

    save() {
        return getDB().collection('users').insertOne(this);
    }

    static findById(productId) {
        return getDB().collection('users').findOne({
            _id : new mongodb.ObjectId(productId)
        })
    } 

    /*
        userName : 'THivagr',
        email : 'thivagarshan@gmail.com,
        cart : {
            items : [ {proId, quantity}, {}]
        }
    */
   addToCart (product) {
       let productIndex = -1;
       if(this.cart) {
            productIndex = this.cart.items.findIndex(currentProduct => {
                return currentProduct.productId.toString() === product._id.toString();
            })
       }
       const updatedCart = this.cart !== undefined ? [ ...this.cart.items ] : [];
       let newQuantity = 1;
       if(productIndex >= 0) {
            updatedCart[productIndex].quantity = updatedCart[productIndex].quantity + newQuantity;
       } else {
        updatedCart.push({
            productId : new mongodb.ObjectId(product._id),
            quantity : newQuantity
        })
       }
       return getDB().collection('users').updateOne({ _id : new mongodb.ObjectId(this._id)}, {
           $set : {
               "cart.items" :  updatedCart
           }
       })
   }

   getCart () {
       const productIds = this.cart.items.map(item => {
           return item.productId;
       });
       // $in returns a array those matching the ids
       return getDB().collection('products').find({_id : { $in : productIds}})
       .toArray()
       .then(products => {
            return products.map(product => {
                return {
                    ...product,
                    quantity : this.cart.items.find(item => {
                        return item.productId.toString() === product._id.toString();
                    }).quantity
                }
            })
       })
   }

   deleteCartItemById(productId) {
       const updatedCart = this.cart.items.filter(item => {
           return item.productId.toString() !== productId.toString();
       })

       return getDB().collection('users').updateOne({ _id : new mongodb.ObjectId(this._id)}, {
           $set : {
                "cart.items" : updatedCart   
           }
       })
   }
}