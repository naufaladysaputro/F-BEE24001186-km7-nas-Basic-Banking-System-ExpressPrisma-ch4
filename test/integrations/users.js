// const request = require('supertest');
// const app = require('../../index'); // Ganti dengan path ke file app.js Anda
// const prisma = require('../../config/prisma');

// describe('UserController Integration Tests', () => {
//   let createdUserId;

//   beforeAll(async () => {
//     // Menghapus data dari tabel Transactions terlebih dahulu
//     await prisma.transactions.deleteMany({});

//     // Menghapus data dari tabel BankAccounts
//     await prisma.bankAccounts.deleteMany({});

//     // Menghapus data dari tabel profiles
//     await prisma.profiles.deleteMany({});

//     // Menghapus data dari tabel users
//     await prisma.users.deleteMany({});
//   });
  
//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   it('should create a new user with profile', async () => {
//     const response = await request(app)
//       .post('/api/v1/users') // Ganti dengan path ke endpoint Anda
//       .send({
//         email: 'test@example.com',
//         name: 'Test User',
//         password: 'password123',
//         identity_type: 'ID Card',
//         identity_number: '123456789',
//         address: '123 Test Street',
//       });

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('id');
//     expect(response.body.email).toBe('test@example.com');

//     createdUserId = response.body.id; // Simpan ID pengguna yang baru dibuat
//   });

//   it('should return all users', async () => {
//     const response = await request(app).get('/api/users/'); // Ganti dengan path ke endpoint Anda

//     expect(response.status).toBe(200);
//     expect(response.body).toBeInstanceOf(Array);
//     expect(response.body.length).toBeGreaterThan(0);
//   });

//   it('should return user by ID', async () => {
//     const response = await request(app).get(`/api/users/${createdUserId}`); // Ganti dengan path ke endpoint Anda

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('id', createdUserId);
//   });

//   it('should update user with profile', async () => {
//     const response = await request(app)
//       .put(`/api/users/${createdUserId}`) // Ganti dengan path ke endpoint Anda
//       .send({
//         email: 'updated@example.com',
//         name: 'Updated User',
//       });

//     expect(response.status).toBe(200);
//     expect(response.body.email).toBe('updated@example.com');
//   });

//   it('should delete user by ID', async () => {
//     const response = await request(app).delete(`/api/users/${createdUserId}`); // Ganti dengan path ke endpoint Anda

//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('message', 'Data has been deleted');
//   });
// });

// tidak dapet untuk get router nya

const request = require("supertest");
const app = require("../../index"); // Ganti dengan path ke file app.js Anda
const prisma = require("../../config/prisma");

const baseUrl = "http://localhost:2000"; // Ganti dengan base URL yang Anda gunakan

describe("UserController Integration Tests", () => {
  let createdUserId;

  beforeAll(async () => {
    // Menghapus data dari tabel Transactions terlebih dahulu
    await prisma.transactions.deleteMany({});

    // Menghapus data dari tabel BankAccounts
    await prisma.bankAccounts.deleteMany({});

    // Menghapus data dari tabel profiles
    await prisma.profiles.deleteMany({});

    // Menghapus data dari tabel users
    await prisma.users.deleteMany({});
  });
  
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new user with profile", async () => {
    const response = await request(baseUrl) // Menggunakan baseUrl
      .post("/api/v1/users") // Ganti dengan path ke endpoint Anda
      .send({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
        identity_type: "ID Card",
        identity_number: "123456789",
        address: "123 Test Street",
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe("test@example.com");

    createdUserId = response.body.id; // Simpan ID pengguna yang baru dibuat
  });

  it("should return all users", async () => {
    const response = await request(baseUrl).get("/api/users/"); // Menggunakan baseUrl

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should return user by ID", async () => {
    const response = await request(baseUrl).get(`/api/users/${createdUserId}`); // Menggunakan baseUrl

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", createdUserId);
  });

  it("should update user with profile", async () => {
    const response = await request(baseUrl)
      .put(`/api/users/${createdUserId}`) // Menggunakan baseUrl
      .send({
        email: "updated@example.com",
        name: "Updated User",
      });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe("updated@example.com");
  });

  it("should delete user by ID", async () => {
    const response = await request(baseUrl).delete(`/api/users/${createdUserId}`); // Menggunakan baseUrl

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Data has been deleted");
  });
});
