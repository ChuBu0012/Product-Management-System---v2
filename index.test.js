const request = require("supertest");
const { app, server, con } = require("./index");
let productId;

describe("Test the products endpoints", () => {
  describe("POST /products", () => {
    it("It should create a new product", async () => {
      const response = await request(server).post("/products").send({
        name: "Test Product",
        category: "Test Category",
        price: 100,
        stock: 50,
      });
      expect(response.statusCode).toBe(200);
      productId = response.body.insertId;
    });
  });

  describe("GET /products", () => {
    it("It should get all products", async () => {
      const response = await request(server).get("/products");
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });

    it("It should get a product by id", async () => {
      const response = await request(server).get(`/products/${productId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(productId);
    });
  });

  describe("PUT /products/:id", () => {
    it("It should update a product", async () => {
      const response = await request(server)
        .put(`/products/${productId}`)
        .send({
          name: "Updated Test Product",
          price: 150,
          stock: 60,
        });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("DELETE /products/:id", () => {
    it("It should delete a product", async () => {
      const response = await request(server).delete(`/products/${productId}`);
      expect(response.statusCode).toBe(200);
    });
  });

  afterAll((done) => {
    con.end((err) => {
      if (err) {
        console.error("Error closing MySQL connection:", err);
      } else {
        console.log("MySQL connection closed");
      }
      server.close(done);
    });
  });
});
