/**
 * Product Model
 * Represents a product with id, name, description, price, and quantity
 */
class Product {
  constructor(id, name, description, price, quantity) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.quantity = quantity;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Validate product data
   */
  static validate(data) {
    const errors = [];

    if (!data.name || data.name.trim() === "") {
      errors.push("Product name is required");
    }

    if (!data.price || data.price <= 0) {
      errors.push("Price must be a positive number");
    }

    if (data.quantity === undefined || data.quantity < 0) {
      errors.push("Quantity cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Product;
