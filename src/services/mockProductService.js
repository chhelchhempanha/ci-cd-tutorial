/**
 * Mock Product Service for Testing
 * Uses in-memory storage instead of connecting to database
 */

class MockProductService {
  constructor() {
    this.products = [];
    this.nextId = 1;
  }

  /**
   * Create a new product
   */
  async createProduct(productData) {
    const Product = require("../models/Product");
    const validation = Product.validate(productData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const product = {
      id: this.nextId++,
      name: productData.name,
      description: productData.description || "",
      price: parseFloat(productData.price),
      quantity: productData.quantity || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.push(product);
    return product;
  }

  /**
   * Get all products
   */
  async getAllProducts() {
    return this.products;
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const product = this.products.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }
    return product;
  }

  /**
   * Update product by ID
   */
  async updateProduct(id, updateData) {
    const product = await this.getProductById(id);

    if (updateData.name !== undefined) {
      if (updateData.name.trim() === "") {
        throw new Error("Product name cannot be empty");
      }
      product.name = updateData.name;
    }

    if (updateData.description !== undefined) {
      product.description = updateData.description;
    }

    if (updateData.price !== undefined) {
      if (updateData.price <= 0) {
        throw new Error("Price must be a positive number");
      }
      product.price = updateData.price;
    }

    if (updateData.quantity !== undefined) {
      if (updateData.quantity < 0) {
        throw new Error("Quantity cannot be negative");
      }
      product.quantity = updateData.quantity;
    }

    product.updatedAt = new Date();
    return product;
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }

    const deletedProduct = this.products.splice(index, 1)[0];
    return deletedProduct;
  }

  /**
   * Search products by name
   */
  async searchByName(name) {
    return this.products.filter((p) =>
      p.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Get products by price range
   */
  async getByPriceRange(minPrice, maxPrice) {
    return this.products.filter(
      (p) => p.price >= minPrice && p.price <= maxPrice
    );
  }

  /**
   * Clear all products (for testing)
   */
  clear() {
    this.products = [];
    this.nextId = 1;
  }
}

module.exports = new MockProductService();
