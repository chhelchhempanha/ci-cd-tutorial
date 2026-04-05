const Product = require("../models/Product");
const pool = require("../utils/database");

/**
 * Product Service
 * Handles all product-related business logic with PostgreSQL
 */
class ProductService {
  /**
   * Create a new product
   */
  async createProduct(productData) {
    const validation = Product.validate(productData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    const query = `
      INSERT INTO products (name, description, price, quantity)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [
      productData.name,
      productData.description || "",
      productData.price,
      productData.quantity || 0,
    ];

    try {
      const result = await pool.query(query, values);
      return this._formatProduct(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  /**
   * Get all products
   */
  async getAllProducts() {
    const query = `
      SELECT * FROM products 
      ORDER BY id DESC;
    `;

    try {
      const result = await pool.query(query);
      return result.rows.map((row) => this._formatProduct(row));
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id) {
    const query = `
      SELECT * FROM products 
      WHERE id = $1;
    `;

    try {
      const result = await pool.query(query, [parseInt(id)]);
      if (result.rows.length === 0) {
        throw new Error(`Product with ID ${id} not found`);
      }
      return this._formatProduct(result.rows[0]);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Update product by ID
   */
  async updateProduct(id, updateData) {
    await this.getProductById(id); // Verify product exists

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      if (updateData.name.trim() === "") {
        throw new Error("Product name cannot be empty");
      }
      updates.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }

    if (updateData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(updateData.description);
    }

    if (updateData.price !== undefined) {
      if (updateData.price <= 0) {
        throw new Error("Price must be a positive number");
      }
      updates.push(`price = $${paramCount++}`);
      values.push(updateData.price);
    }

    if (updateData.quantity !== undefined) {
      if (updateData.quantity < 0) {
        throw new Error("Quantity cannot be negative");
      }
      updates.push(`quantity = $${paramCount++}`);
      values.push(updateData.quantity);
    }

    if (updates.length === 0) {
      return this.getProductById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(parseInt(id));

    const query = `
      UPDATE products 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, values);
      return this._formatProduct(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(id) {
    const product = await this.getProductById(id);

    const query = `
      DELETE FROM products 
      WHERE id = $1 
      RETURNING *;
    `;

    try {
      const result = await pool.query(query, [parseInt(id)]);
      return this._formatProduct(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  /**
   * Search products by name
   */
  async searchByName(name) {
    const query = `
      SELECT * FROM products 
      WHERE name ILIKE $1
      ORDER BY id DESC;
    `;

    try {
      const result = await pool.query(query, [`%${name}%`]);
      return result.rows.map((row) => this._formatProduct(row));
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  /**
   * Get products by price range
   */
  async getByPriceRange(minPrice, maxPrice) {
    const query = `
      SELECT * FROM products 
      WHERE price >= $1 AND price <= $2
      ORDER BY price ASC;
    `;

    try {
      const result = await pool.query(query, [minPrice, maxPrice]);
      return result.rows.map((row) => this._formatProduct(row));
    } catch (error) {
      throw new Error(`Failed to fetch products by price range: ${error.message}`);
    }
  }

  /**
   * Format database row to product object
   */
  _formatProduct(row) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      quantity: row.quantity,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// Singleton instance
const productService = new ProductService();

module.exports = productService;
