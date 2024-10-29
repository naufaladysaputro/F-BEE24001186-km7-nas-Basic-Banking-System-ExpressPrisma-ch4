const prisma = require("../config/prisma"); // Pastikan path ini benar
const { Prisma } = require('@prisma/client'); // Tambahkan baris ini

class AccountController {
  
  async getAllAccounts(req, res) {
    try {
      const accounts = await prisma.bankAccount.findMany();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAccountById(req, res) {
    try {
      const { id } = req.params;
      const account = await prisma.bankAccount.findUnique({
        where: { id: parseInt(id) },
      });
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAccount(req, res) {
    try {
      const { bankName, accountNumber, balance, userId } = req.body;

      // Validasi input
      if (!bankName || !accountNumber || balance === undefined || !userId) {
        return res.status(400).json({
          error: "Bank Name, Account Number, Balance, and UserId are required",
        });
      }

      const account = await prisma.bankAccount.create({
        data: {
          bankName,
          accountNumber: parseInt(accountNumber),
          balance,
          userId,
        },
      });
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAccount(req, res) {
    try {
      const { id } = req.params;
      const { bankName, accountNumber, balance } = req.body;

      const existingAccount = await prisma.bankAccount.findUnique({
        where: { id: parseInt(id) },
      });
      if (!existingAccount) {
        return res.status(404).json({ error: "Account not found" });
      }

      const updatedData = {
        bankName: bankName || existingAccount.bankName,
        accountNumber: accountNumber ? parseInt(accountNumber) : existingAccount.accountNumber,
        balance: balance !== undefined ? parseFloat(balance) : existingAccount.balance,
      };

      const updatedAccount = await prisma.bankAccount.update({
        where: { id: parseInt(id) },
        data: updatedData,
      });
      res.json(updatedAccount);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(400).json({
          error: error.message,
          code: error.code,
          meta: error.meta,
        });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  }

  async deleteAccount(req, res) {
    try {
      const { id } = req.params;
      const deletedAccount = await prisma.bankAccount.delete({
        where: { id: parseInt(id) },
      });
      res.json({
        ...deletedAccount,
        message: "Account successfully deleted",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deposit(req, res) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      // Validasi input
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      const account = await prisma.bankAccount.findUnique({
        where: { id: parseInt(id) },
      });
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      const updatedAccount = await prisma.bankAccount.update({
        where: { id: parseInt(id) },
        data: {
          balance: account.balance + parseFloat(amount),
        },
      });

      res.json({
        message: `Deposit berhasil. Saldo baru: Rp.${updatedAccount.balance}`,
        account: updatedAccount,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async withdraw(req, res) {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      // Validasi input
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      const account = await prisma.bankAccount.findUnique({
        where: { id: parseInt(id) },
      });
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      if (account.balance < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const updatedAccount = await prisma.bankAccount.update({
        where: { id: parseInt(id) },
        data: {
          balance: account.balance - parseFloat(amount),
        },
      });

      res.json({
        message: `Withdraw berhasil. Saldo baru: Rp.${updatedAccount.balance}`,
        account: updatedAccount,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AccountController();
