const TransactionController = require("../../controllers/transactions.controller");
const prisma = require("../../config/prisma");

// Mock Prisma Client
jest.mock("../../config/prisma", () => ({
    transactions: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    bankAccounts: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

describe("TransactionController", () => {
    let req, res;

    beforeEach(() => {
        // Mock objek req dan res sebelum setiap pengujian
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe("createTransaction", () => {
        it("should create a transaction and return it with status 200", async () => {
            req.body = {
                amount: 100,
                source_account_id: 1,
                destination_account_id: 2,
            };

            const mockTransaction = {
                id: 1,
                amount: 100,
                source_account_id: 1,
                destination_account_id: 2,
            };

            prisma.transactions.create.mockResolvedValue(mockTransaction);

            await TransactionController.createTransaction(req, res);

            expect(res.json).toHaveBeenCalledWith(mockTransaction);
        });

        it("should return 400 if required fields are missing", async () => {
            req.body = { amount: 100 };

            await TransactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Missing required fields" });
        });

        it("should return 500 if there is an error", async () => {
            req.body = {
                amount: 100,
                source_account_id: 1,
                destination_account_id: 2,
            };

            prisma.transactions.create.mockRejectedValue(new Error("Database error"));

            await TransactionController.createTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("getTransactionById", () => {
        it("should return a transaction by id with status 200", async () => {
            req.params = { id: 1 };
            const mockTransaction = {
                id: 1,
                amount: 100,
                source_account_id: 1,
                destination_account_id: 2,
            };

            prisma.transactions.findUnique.mockResolvedValue(mockTransaction);

            await TransactionController.getTransactionById(req, res);

            expect(res.json).toHaveBeenCalledWith(mockTransaction);
        });

        it("should return 404 if transaction is not found", async () => {
            req.params = { id: 1 };
            prisma.transactions.findUnique.mockResolvedValue(null);

            await TransactionController.getTransactionById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: "Transaction not found" });
        });

        it("should return 500 if there is an error", async () => {
            req.params = { id: 1 };
            prisma.transactions.findUnique.mockRejectedValue(new Error("Database error"));

            await TransactionController.getTransactionById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });

    describe("getAllTransactions", () => {
        it("should return all transactions with status 200", async () => {
            const mockTransactions = [
                { id: 1, amount: 100, source_account_id: 1, destination_account_id: 2 },
                { id: 2, amount: 200, source_account_id: 2, destination_account_id: 3 },
            ];

            prisma.transactions.findMany.mockResolvedValue(mockTransactions);

            await TransactionController.getAllTransactions(req, res);

            expect(res.json).toHaveBeenCalledWith(mockTransactions);
        });

        it("should return 500 if there is an error", async () => {
            prisma.transactions.findMany.mockRejectedValue(new Error("Database error"));

            await TransactionController.getAllTransactions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        });
    });
});