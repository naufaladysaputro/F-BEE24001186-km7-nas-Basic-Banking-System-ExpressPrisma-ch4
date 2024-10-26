const prisma = require("../config/prisma"); // Pastikan path ini benar
const { Prisma } = require('@prisma/client'); // Tambahkan baris ini

class AccountController {
  
  async getAllAccounts (req, res) {
    try {
      const accounts = await prisma.bankAccounts.findMany(); // Ubah di sini
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async getAccountById (req, res) {
    try {
      const { id } = req.params;
      const account = await prisma.bankAccounts.findUnique({ // Ubah di sini
        where: {
          id: parseInt(id), // pastikan id dikonversi menjadi angka
        },
      });
      if (!account) {
        return res.status(400).json({ error: "Account id not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async createAccount (req, res) {
    try {
      const { bank_name, account_number, balance, userId } = req.body; // Perbaiki nama parameter untuk konsistensi
      console.log("Request Body:", req.body);
  
      // Validasi input
      if (!bank_name || !account_number || !balance || !userId) {
        return res.status(400).json({
          error: "Bank Name, Account Number, Balance, and userId are required",
        });
      }
  
      const account = await prisma.bankAccounts.create({ // Ubah di sini
        data: {
          bank_name,
          account_number,
          balance,
          userId,
        },
      });
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async updateAccount (req, res) {
    try {
      const { id } = req.params;
      const { bank_name, account_number, balance } = req.body; // Perbaiki nama parameter untuk konsistensi
      console.log(req.body);
  
      const existingAccount = await prisma.bankAccounts.findUnique({ // Ubah di sini
        where: { id: parseInt(id) }, // pastikan id dikonversi menjadi angka
      });
      if (!existingAccount) {
        return res.status(400).json({ error: "Account not found" });
      }
  
      const updatedData = {
        bank_name: bank_name || existingAccount.bank_name,
        account_number: account_number || existingAccount.account_number,
        balance: parseInt(balance) || existingAccount.balance,
      };
  
      const updatedAccount = await prisma.bankAccounts.update({ // Ubah di sini
        where: { id: parseInt(id) }, // pastikan id dikonversi menjadi angka
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
  };

  async deleteAccount (req, res) {
    try {
      const { id } = req.params;
      const deletedAccount = await prisma.bankAccounts.delete({ // Ubah di sini
        where: { id: parseInt(id) }, // pastikan id dikonversi menjadi angka
      });
      res.json({
        ...deletedAccount,
        message: "Account successfully deleted",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async deposit(req, res) {
    try {
      const { id } = req.params; // Mendapatkan ID akun dari parameter
      const { amount } = req.body; // Mendapatkan jumlah deposit dari body request
      
      // Validasi input
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      // Cari akun berdasarkan ID
      const account = await prisma.bankAccounts.findUnique({
        where: { id: parseInt(id) },
      });
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Update saldo dengan menambah jumlah deposit
      const updatedAccount = await prisma.bankAccounts.update({
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
      const { id } = req.params; // Mendapatkan ID akun dari parameter
      const { amount } = req.body; // Mendapatkan jumlah withdraw dari body request
      
      // Validasi input
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive number" });
      }

      // Cari akun berdasarkan ID
      const account = await prisma.bankAccounts.findUnique({
        where: { id: parseInt(id) },
      });
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }

      // Periksa apakah saldo cukup untuk penarikan
      if (account.balance < parseFloat(amount)) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      // Update saldo dengan mengurangi jumlah withdraw
      const updatedAccount = await prisma.bankAccounts.update({
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
