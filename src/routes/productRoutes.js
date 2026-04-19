const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

/**
 * Product Routes
 */

// GET all products and POST new product
router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);

// Search products
router.get("/search", productController.searchProducts);

// GET, PUT, DELETE specific product
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
