const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const getPath = () => {
    return path.join(path.dirname(process.mainModule.filename),
        'data',
        'products.json'
    )   
}

const asyncReadProducts = promisify(fs.readFile);
const asyncWriteProducts = promisify(fs.writeFile);

const readProducts = async () => {
    try {
        const data = await asyncReadProducts(getPath());
        return JSON.parse(data);
    } catch (err){
        return [];
    }
};

const  writeProducts = async (productsObj) => {
    try {
        await asyncWriteProducts(getPath(), JSON.stringify(productsObj));
    } catch(err) {
        throw err;
    }
}

module.exports = class Product {
    constructor(title, imageUrl, price, description) {
        this.id = Math.random().toString();
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    async save() {
        const products = await readProducts();
        if(products) {
            products.push(this)
            await writeProducts(products);
        }
    }

    static async fetchAll() {
        const productList = await readProducts();
        if (productList)
            return productList;
        else 
            return [];
    }

    static async getProduct(id) {
        const products = await readProducts();
        const prod = products.find(product => product.id === id);
        return prod;
    }

    static async deleteProduct(id) {
        const products = await readProducts();
        if(products.length > 0) {
            const product = products.find(product => product.id === id);
            const updatedProductList = products.filter(product => product.id != id);
            await writeProducts(updatedProductList);
        }
    }

    static async updateProduct (updateProduct) {
        const products = await Product.fetchAll();
        if(products.length > 0) {
            const productIndex = products.findIndex(product => product.id === updateProduct.id);
            products[productIndex] = updateProduct;
            await writeProducts(products);
        }
    }
}