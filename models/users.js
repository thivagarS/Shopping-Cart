const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    verificationToken: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true
    },
    resetToken: {
        type: String
    },
    resetExpirationDate: {
        type: Date
    },
    cart: {
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
})

// Use normal fn instead of arrow fn so this keyword points to the User
userSchema.methods.addToCart = function (product) {
    let productIndex = -1;
    if (this.cart) {
        productIndex = this.cart.items.findIndex(currentProduct => {
            return currentProduct.productId.toString() === product._id.toString();
        })
    }
    const updatedCart = this.cart !== undefined ? [...this.cart.items] : [];
    let newQuantity = 1;
    if (productIndex >= 0) {
        updatedCart[productIndex].quantity = updatedCart[productIndex].quantity + newQuantity;
    } else {
        updatedCart.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    this.cart.items = updatedCart;
    //console.log(this.cart.items)
    return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
    const updatedCart = this.cart.items.filter(item => {
        return item.productId.toString() !== productId.toString();
    })
    this.cart.items = updatedCart;
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart.items = [];
    return this.save();
}

const User = mongoose.model('User', userSchema);

module.exports = User;