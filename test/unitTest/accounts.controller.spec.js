const AccountController = require("../../controllers/accounts.controller.js");


// Mock Prisma Client
jest.mock("../../config/prisma.js", () => ({
  bankAccounts: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  users: {
    create: jest.fn(),
    update: jest.fn(),
  },
}));


  

const prisma = require("../../config/prisma.js");

beforeEach(() => {
    jest.clearAllMocks();
  });


describe("AccountController", () => {

  // Test getAllAccounts
  describe("getAllAccounts", () => {
    it("should return all accounts with status 200", async () => {
      const mockAccounts = [
        { id: 1, bank_name: "Bank A", account_number: "1234567890", balance: 1000 },
        { id: 2, bank_name: "Bank B", account_number: "9876543210", balance: 2000 },
      ];
      prisma.bankAccounts.findMany.mockResolvedValue(mockAccounts);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.getAllAccounts(req, res);

      expect(res.json).toHaveBeenCalledWith(mockAccounts);
      expect(prisma.bankAccounts.findMany).toHaveBeenCalledTimes(1);
    });

    it("should return 500 if there is an error", async () => {
      prisma.bankAccounts.findMany.mockRejectedValue(new Error("Database error"));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),

      };

      await AccountController.getAllAccounts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test getAccountById
  describe("getAccountById", () => {
    it("should return the account with the specified id and status 200", async () => {
      const mockAccount = { id: 1, bank_name: "Bank A", account_number: "1234567890", balance: 1000 };
      prisma.bankAccounts.findUnique.mockResolvedValue(mockAccount);

      const req = { params: { id: "1" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.getAccountById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockAccount);
      expect(prisma.bankAccounts.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should return 400 if account with specified id is not found", async () => {
      prisma.bankAccounts.findUnique.mockResolvedValue(null);

      const req = { params: { id: "99" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.getAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Account id not found" });
    });

    it("should return 500 if there is a server error", async () => {
      prisma.bankAccounts.findUnique.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: "1" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.getAccountById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test createAccount
  describe("createAccount", () => {
    it("should create an account and return it with status 200", async () => {
      const mockAccount = { id: 1, bank_name: "Bank A", account_number: "1234567890", balance: 1000, userId: 1 };
      prisma.bankAccounts.create.mockResolvedValue(mockAccount);

      const req = {
        body: {
          bank_name: "Bank A",
          account_number: "1234567890",
          balance: 1000,
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.createAccount(req, res);

      expect(res.json).toHaveBeenCalledWith(mockAccount);
      expect(prisma.bankAccounts.create).toHaveBeenCalledWith({
        data: {
          bank_name: "Bank A",
          account_number: "1234567890",
          balance: 1000,
          userId: 1,
        },
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Bank Name, Account Number, Balance, and userId are required",
      });
    });

    it("should return 500 if there is a server error", async () => {
      prisma.bankAccounts.create.mockRejectedValue(new Error("Database error"));

      const req = {
        body: {
          bank_name: "Bank A",
          account_number: "1234567890",
          balance: 1000,
          userId: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.createAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  // Test updateAccount
  describe("updateAccount", () => {
    it("should update the account and return it with status 200", async () => {
      const mockUpdatedAccount = { id: 1, bank_name: "Bank A", account_number: "1234567890", balance: 2000 };
      prisma.bankAccounts.findUnique.mockResolvedValue(mockUpdatedAccount);
      prisma.bankAccounts.update.mockResolvedValue(mockUpdatedAccount);

      const req = { params: { id: "1" }, body: { balance: 2000 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.updateAccount(req, res);

      expect(res.json).toHaveBeenCalledWith(mockUpdatedAccount);
      expect(prisma.bankAccounts.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { 
            account_number: "1234567890",
            balance: 2000,
            bank_name: "Bank A",
        
        },
      });
    });

    it("should return 400 if account to update is not found", async () => {
      prisma.bankAccounts.findUnique.mockResolvedValue(null);

      const req = { params: { id: "99" }, body: { balance: 2000 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Account not found" });
    });

    it("should return 500 if there is a server error", async () => {
      prisma.bankAccounts.update.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: "1" }, body: { balance: 2000 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.updateAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Account not found" });
    });
  });

  // Test deleteAccount
  describe("deleteAccount", () => {
    it("should delete the account and return success message with status 200", async () => {
      const mockAccount = { id: 1, bank_name: "Bank A", account_number: "1234567890", balance: 1000 };
      prisma.bankAccounts.delete.mockResolvedValue(mockAccount);

      const req = { params: { id: "1" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.deleteAccount(req, res);

      expect(res.json).toHaveBeenCalledWith({
        ...mockAccount,
        message: "Account successfully deleted",
      });
      expect(prisma.bankAccounts.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should return 500 if there is a server error", async () => {
      prisma.bankAccounts.delete.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: "1" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

 // Test deposit
 describe("deposit", () => {
    it("should deposit an amount and return updated balance", async () => {
      const mockAccount = { id: 1, balance: 1000 };
      prisma.bankAccounts.findUnique.mockResolvedValue(mockAccount);
      prisma.bankAccounts.update.mockResolvedValue({ ...mockAccount, balance: 1500 });

      const req = { params: { id: "1" }, body: { amount: 500 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.deposit(req, res);

      expect(res.json).toHaveBeenCalledWith({
        account: { ...mockAccount, balance: 1500 },
        message: "Deposit berhasil. Saldo baru: Rp.1500"
      });

      expect(prisma.bankAccounts.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.bankAccounts.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { balance: 1500 } 
    });
    });

    it("should return 400 if amount is not provided", async () => {
      const req = { params: { id: "1" }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Amount must be a positive number" });
    });

    it("should return 500 if there is a server error", async () => {
      prisma.bankAccounts.findUnique.mockResolvedValue({ id: 1, balance: 1000 });
      prisma.bankAccounts.update.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: "1" }, body: { amount: 500 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });  
  
 // Test withdraw
 describe("withdraw", () => {
    it("should withdraw an amount and return updated balance", async () => {
      const mockAccount = { id: 1, balance: 1000 };
      prisma.bankAccounts.findUnique.mockResolvedValue(mockAccount);
      prisma.bankAccounts.update.mockResolvedValue({ ...mockAccount, balance: 500 });

      const req = { params: { id: "1" }, body: { amount: 500 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.withdraw(req, res);

      expect(res.json).toHaveBeenCalledWith({
        account: { ...mockAccount, balance: 500 },
        message: "Withdraw berhasil. Saldo baru: Rp.500"
      });

      expect(prisma.bankAccounts.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.bankAccounts.update).toHaveBeenCalledTimes(1);
    });

    it("should return 400 if amount is not provided", async () => {
      const req = { params: { id: "1" }, body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Amount must be a positive number" });
    });

    it("should return 400 if withdrawal amount exceeds balance", async () => {
      const req = { params: { id: "1" }, body: { amount: 2000 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Insufficient balance" });
    });

    it("should return 500 if there is a server error", async () => {
      prisma.bankAccounts.findUnique.mockResolvedValue({ id: 1, balance: 1000 });
      prisma.bankAccounts.update.mockRejectedValue(new Error("Database error"));

      const req = { params: { id: "1" }, body: { amount: 500 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await AccountController.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });
  
  
});
