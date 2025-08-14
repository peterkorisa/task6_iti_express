let products = require("./productsData.json");
const fs = require("fs");
const express = require("express");
const server = express();

server.use(express.json());

function saveProducts() {
  fs.writeFileSync("./productsData.json", JSON.stringify(products, null, 2));
}

server.get("/", (req, res) => {
  res.send(products);
});

server.get("/products", (req, res) => {
  let result = products;
  let category = req.query.category;
  let minPrice = +req.query.minPrice;
  
  if (category) {
    result = result.filter((product) => product.category == category);
  }
  if (minPrice) {
    result = result.filter((product) => product.price >= minPrice);
  }

  res.send(result);
});

server.get("/products/:id", (req, res) => {
  let id = +req.params.id;
  let product = products.find((prod) => prod.id === id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send(`No Product Found with ID: ${id}`);
  }
});

server.post("/addproduct", (req, res) => {
  let newProduct = req.body;
  newProduct.id = products.length ? products[products.length - 1].id + 1 : 1;
  products.push(newProduct);
  saveProducts();
  res.send("Product added successfully");
});

server.delete("/delete/:id", (req, res) => {
  let id = +req.params.id;
  let index = products.findIndex((prod) => prod.id === id);
  if (index === -1) {
    return res.status(404).send(`No Product Found with ID: ${id}`);
  }
  products.splice(index, 1);
  saveProducts();
  res.send({ message: "Product deleted successfully", productList: products });
});

server.put("/update/:id", (req, res) => {
  let id = +req.params.id;
  let index = products.findIndex((prod) => prod.id === id);
  if (index === -1) {
    return res.status(404).send(`No Product Found with ID: ${id}`);
  }
  products[index] = { ...products[index], ...req.body };
  saveProducts();
  res.send({ message: "Product updated successfully", updatedProduct: products[index] });
});

server.put("/update-category", (req, res) => {
  let updatedCount = 0;
  products = products.map((product) => {
    if (product.category === "Mobiles") {
      updatedCount++;
      return { ...product, category: "Electronics" };
    }
    return product;
  });
  saveProducts();
  res.send({ message: `${updatedCount} products updated from Mobiles to Electronics`, products });
});

server.delete("/delete-all", (req, res) => {
  products = [];
  saveProducts();
  res.send({ message: "All products deleted successfully", products });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
