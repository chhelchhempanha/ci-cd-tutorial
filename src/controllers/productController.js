const productService = require("../services/productService");

/**
 * Product Controller
 * Handles product HTTP requests
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid product data
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;

    if (!name || price === undefined) {
      return res
        .status(400)
        .json({ error: "Name and price are required fields" });
    }

    const product = await productService.createProduct({
      name,
      description,
      price,
      quantity,
    });

    res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of all products
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.json({
      message: "Products retrieved successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);
    res.json({
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products by name
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q || "";
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await productService.searchByName(query);
    res.json({
      message: "Search completed",
      count: results.length,
      data: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
