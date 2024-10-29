const AccountController = require("../../controllers/accounts.controller.js");
const prisma = require("../../config/prisma.js");

// Mock Prisma Client
jest.mock("../../config/prisma.js", () => ({
    bankAccount: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

describe("AccountController", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe("getAllAccounts", () => {
        it("should return all accounts with status 200", async () => {
            const mockAccounts = [
                { id: 1, bankName: "Bank A", accountNumber: "123456", balance: 1000 },
                { id: 2, bankName: "Bank B", accountNumber: "654321", balance: 2000 },
            ];

            prisma.bankAccount.findMany.mockResolvedValue(mockAccounts);

            await AccountController.getAllAccounts(req, res);

            expect(res.json).toHaveBeenCalledWith(mockAccounts);
        });

        it("should return 500 if there is an error", async () => {
            prisma.bankAccount.findMany.mockRejectedValue(new Error("Database error"));

            await AccountController.getAllAccounts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("getAccountById", () => {
        it("should return account by ID with status 200", async () => {
            req.params = { id: "1" };
            const mockAccount = { id: 1, bankName: "Bank A", accountNumber: "123456", balance: 1000 };

            prisma.bankAccount.findUnique.mockResolvedValue(mockAccount);

            await AccountController.getAccountById(req, res);

            expect(res.json).toHaveBeenCalledWith(mockAccount);
        });

        it("should return 404 if account not found", async () => {
            req.params = { id: "1" };
            prisma.bankAccount.findUnique.mockResolvedValue(null);

            await AccountController.getAccountById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Account not found" });
        });

        it("should return 500 if there is an error", async () => {
            req.params = { id: "1" };
            prisma.bankAccount.findUnique.mockRejectedValue(new Error("Database error"));

            await AccountController.getAccountById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("createAccount", () => {
        it("should create a new account with status 200", async () => {
            req.body = { bankName: "Bank A", accountNumber: "123456", balance: 1000, userId: 1 };
            const mockAccount = { id: 1, bankName: "Bank A", accountNumber: "123456", balance: 1000, userId: 1 };

            prisma.bankAccount.create.mockResolvedValue(mockAccount);

            await AccountController.createAccount(req, res);

            expect(res.json).toHaveBeenCalledWith(mockAccount);
        });

        it("should return 400 if required fields are missing", async () => {
            req.body = { bankName: "Bank A" }; // Missing required fields

            await AccountController.createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                error: "Bank Name, Account Number, Balance, and UserId are required",
            });
        });

        it("should return 500 if there is an error", async () => {
            req.body = { bankName: "Bank A", accountNumber: "123456", balance: 1000, userId: 1 };
            prisma.bankAccount.create.mockRejectedValue(new Error("Database error"));

            await AccountController.createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("updateAccount", () => {
        it("should update an existing account with status 200", async () => {
            req.params = { id: "1" };
            req.body = { bankName: "Bank B" };
            const existingAccount = { id: 1, bankName: "Bank A", accountNumber: "123456", balance: 1000 };

            prisma.bankAccount.findUnique.mockResolvedValue(existingAccount);
            prisma.bankAccount.update.mockResolvedValue({ ...existingAccount, bankName: "Bank B" });

            await AccountController.updateAccount(req, res);

            expect(res.json).toHaveBeenCalledWith({ ...existingAccount, bankName: "Bank B" });
        });

        it("should return 404 if account not found", async () => {
            req.params = { id: "1" };
            req.body = { bankName: "Bank B" };

            prisma.bankAccount.findUnique.mockResolvedValue(null);

            await AccountController.updateAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Account not found" });
        });

        it("should return 500 if there is an error", async () => {
            req.params = { id: "1" };
            req.body = { bankName: "Bank B" };
            prisma.bankAccount.findUnique.mockResolvedValue({ id: 1 });
            prisma.bankAccount.update.mockRejectedValue(new Error("Database error"));

            await AccountController.updateAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("deleteAccount", () => {
        it("should delete an existing account with status 200", async () => {
            req.params = { id: "1" };
            const mockDeletedAccount = { id: 1, bankName: "Bank A", accountNumber: "123456", balance: 1000 };

            prisma.bankAccount.delete.mockResolvedValue(mockDeletedAccount);

            await AccountController.deleteAccount(req, res);

            expect(res.json).toHaveBeenCalledWith({
                ...mockDeletedAccount,
                message: "Account successfully deleted",
            });
        });

        it("should return 500 if there is an error", async () => {
            req.params = { id: "1" };
            prisma.bankAccount.delete.mockRejectedValue(new Error("Database error"));

            await AccountController.deleteAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("deposit", () => {
        it("should deposit amount and update balance", async () => {
            req.params = { id: "1" };
            req.body = { amount: 500 };
            const existingAccount = { id: 1, balance: 1000 };

            prisma.bankAccount.findUnique.mockResolvedValue(existingAccount);
            prisma.bankAccount.update.mockResolvedValue({ ...existingAccount, balance: 1500 });

            await AccountController.deposit(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: "Deposit berhasil. Saldo baru: Rp.1500",
                account: { ...existingAccount, balance: 1500 },
            });
        });

        it("should return 400 if amount is invalid", async () => {
            req.params = { id: "1" };
            req.body = { amount: -500 }; // Invalid amount

            await AccountController.deposit(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Amount must be a positive number" });
        });

        it("should return 404 if account not found", async () => {
            req.params = { id: "1" };
            req.body = { amount: 500 };

            prisma.bankAccount.findUnique.mockResolvedValue(null);

            await AccountController.deposit(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Account not found" });
        });

        it("should return 500 if there is an error", async () => {
            req.params = { id: "1" };
            req.body = { amount: 500 };
            prisma.bankAccount.findUnique.mockResolvedValue({ id: 1 });
            prisma.bankAccount.update.mockRejectedValue(new Error("Database error"));

            await AccountController.deposit(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("withdraw", () => {
        it("should withdraw amount and update balance", async () => {
            req.params = { id: "1" };
            req.body = { amount: 500 };
            const existingAccount = { id: 1, balance: 1000 };

            prisma.bankAccount.findUnique.mockResolvedValue(existingAccount);
            prisma.bankAccount.update.mockResolvedValue({ ...existingAccount, balance: 500 });

            await AccountController.withdraw(req, res);

            expect(res.json).toHaveBeenCalledWith({
                message: "Withdraw berhasil. Saldo baru: Rp.500",
                account: { ...existingAccount, balance: 500 },
            });
        });

        it("should return 400 if insufficient balance", async () => {
            req.params = { id: "1" };
            req.body = { amount: 1500 };
            const existingAccount = { id: 1, balance: 1000 };

            prisma.bankAccount.findUnique.mockResolvedValue(existingAccount);

            await AccountController.withdraw(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Insufficient balance" });
        });

        it("should return 404 if account not found", async () => {
            req.params = { id: "1" };
            req.body = { amount: 500 };

            prisma.bankAccount.findUnique.mockResolvedValue(null);

            await AccountController.withdraw(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Account not found" });
        });

        it("should return 500 if there is an error", async () => {
            req.params = { id: "1" };
            req.body = { amount: 500 };
            prisma.bankAccount.findUnique.mockResolvedValue({ id: 1 });
            prisma.bankAccount.update.mockRejectedValue(new Error("Database error"));

            await AccountController.withdraw(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });
});
