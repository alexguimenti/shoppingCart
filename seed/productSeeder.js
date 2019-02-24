var mongoose = require("mongoose");
var Product = require("../models/products");



mongoose.connect("mongodb://localhost/shopping");


var products = [
    {
        imagePath:
            "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Gothiccover.png/220px-Gothiccover.png",
        title: "Gothic Video Game",
        description: "Awesome Game!!!!",
        price: 10
    },
    {
        imagePath:
            "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Warcraftiii-frozen-throne-boxcover.jpg/220px-Warcraftiii-frozen-throne-boxcover.jpg",
        title: "Wacraft Frozen Throne Video Game",
        description: "Expansion Pack",
        price: 12
    },
    {
        imagePath:
            "https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/Half-Life_Cover_Art.jpg/220px-Half-Life_Cover_Art.jpg",
        title: "Half Life",
        description: "A Legend!",
        price: 8
    }
];

var done = 0;

products.forEach((seed) => {
    Product.create(seed, (err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            result.save();
        done++;
        if (done === products.length) {
            exit();
        }};
    });
});

function exit() {
    console.log("disconnect!");
    mongoose.disconnect();
};