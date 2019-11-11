const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products : [
        {
            product: {type: Object, required: true},
            quantity: {type: String, required: true}
        }
    ],
    user: {
        userName: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    }
})

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;