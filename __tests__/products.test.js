const request = require("supertest");
const app = require("../app");

// Mock the real productService with mock service
jest.mock("../src/services/productService", () =>
  require("../src/services/mockProductService")
);

describe("Product CRUD API Tests", () => {
  let productId;
  const mockService = require("../src/services/mockProductService");

  // Clear before all tests run
  beforeAll(() => {
    mockService.clear();
  });

  // Clear before independent test suites
  beforeEach(() => {
    // Only clear if productId is not being used (safeguard)
  });

  describe("POST /api/products - Create Product", () => {
    test("Should create a new product successfully", async () => {
      const newProduct = {
        name: "Test Product",
        description: "A test product",
        price: 29.99,
        quantity: 10,
      };

      const response = await request(app)
        .post("/api/products")
        .send(newProduct)
        .expect(201);

      expect(response.body.message).toBe("Product created successfully");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.name).toBe(newProduct.name);
      expect(response.body.data.price).toBe(newProduct.price);
      productId = response.body.data.id;
    });

    test("Should fail when name is missing", async () => {
      const invalidProduct = {
        description: "Missing name",
        price: 29.99,
      };

      await request(app)
        .post("/api/products")
        .send(invalidProduct)
        .expect(400);
    });

    test("Should fail when price is missing", async () => {
      const invalidProduct = {
        name: "Product Without Price",
        quantity: 5,
      };

      await request(app)
        .post("/api/products")
        .send(invalidProduct)
        .expect(400);
    });

    test("Should fail when price is negative", async () => {
      const invalidProduct = {
        name: "Negative Price Product",
        price: -10,
        quantity: 5,
      };

      await request(app)
        .post("/api/products")
        .send(invalidProduct)
        .expect(400);
    });
  });

  describe("GET /api/products - Get All Products", () => {
    test("Should retrieve all products", async () => {
      const response = await request(app)
        .get("/api/products")
        .expect(200);

      expect(response.body.message).toBe("Products retrieved successfully");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });
  });

  describe("GET /api/products/:id - Get Product by ID", () => {
    test("Should retrieve a product by ID", async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.data.id).toBe(productId);
      expect(response.body.message).toBe("Product retrieved successfully");
    });

    test("Should return 404 for non-existent product", async () => {
      await request(app)
        .get("/api/products/99999")
        .expect(404);
    });
  });

  describe("PUT /api/products/:id - Update Product", () => {
    test("Should update a product successfully", async () => {
      const updateData = {
        name: "Updated Product Name",
        price: 39.99,
        quantity: 20,
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe("Product updated successfully");
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.price).toBe(updateData.price);
      expect(response.body.data.quantity).toBe(updateData.quantity);
    });

    test("Should fail updating with invalid price", async () => {
      const invalidUpdate = {
        price: -50,
      };

      await request(app)
        .put(`/api/products/${productId}`)
        .send(invalidUpdate)
        .expect(400);
    });

    test("Should return 404 when updating non-existent product", async () => {
      await request(app)
        .put("/api/products/99999")
        .send({ name: "Update" })
        .expect(404);
    });
  });

  describe("GET /api/products/search - Search Products", () => {
    test("Should search products by name", async () => {
      const response = await request(app)
        .get("/api/products/search")
        .query({ q: "Updated" })
        .expect(200);

      expect(response.body.message).toBe("Search completed");
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test("Should return 400 when search query is missing", async () => {
      await request(app)
        .get("/api/products/search")
        .expect(400);
    });
  });

  describe("DELETE /api/products/:id - Delete Product", () => {
    test("Should delete a product successfully", async () => {
      // First create a product to delete
      const newProduct = {
        name: "Product to Delete",
        price: 19.99,
        quantity: 5,
      };

      const createResponse = await request(app)
        .post("/api/products")
        .send(newProduct);

      const deleteId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/products/${deleteId}`)
        .expect(200);

      expect(response.body.message).toBe("Product deleted successfully");
      expect(response.body.data.id).toBe(deleteId);
    });

    test("Should return 404 when deleting non-existent product", async () => {
      await request(app)
        .delete("/api/products/99999")
        .expect(404);
    });
  });

  describe("Integration Tests", () => {
    test("Should perform complete CRUD cycle", async () => {
      // Create
      const createRes = await request(app)
        .post("/api/products")
        .send({
          name: "Integration Test Product",
          description: "Testing CRUD cycle",
          price: 49.99,
          quantity: 15,
        })
        .expect(201);

      const id = createRes.body.data.id;

      // Read
      const readRes = await request(app)
        .get(`/api/products/${id}`)
        .expect(200);

      expect(readRes.body.data.name).toBe("Integration Test Product");

      // Update
      const updateRes = await request(app)
        .put(`/api/products/${id}`)
        .send({
          name: "Updated Integration Product",
          price: 59.99,
        })
        .expect(200);

      expect(updateRes.body.data.name).toBe("Updated Integration Product");

      // Delete
      await request(app)
        .delete(`/api/products/${id}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/products/${id}`)
        .expect(404);
    });
  });
});
