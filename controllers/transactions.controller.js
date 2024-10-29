const prisma = require("../config/prisma");

class TransactionController {
  async createTransaction(req, res) {
    try {
      const { amount, sourceAccountId, destinationAccountId } = req.body; // Ganti penamaan di sini
      console.log(req.body);
  
      // Validasi input
      if (!amount || !sourceAccountId || !destinationAccountId) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          sourceAccountId, // Memastikan penggunaan nama yang sesuai
          destinationAccountId, // Memastikan penggunaan nama yang sesuai
        },
      });
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTransactionById(req, res) {
    try {
      const { id } = req.params;
      const detail = await prisma.transaction.findUnique({
        where: {
          id: Number(id), // Konversi id ke angka
        },
      });
  
      if (!detail) {
        return res.status(404).json({ error: "Transaction not found" }); // Menggunakan status 404
      }
      res.json(detail);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllTransactions(req, res) {
    try {
      const list = await prisma.transaction.findMany();
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // async deposit(req, res) {
  //   try {
  //     const { amount, accountId } = req.body; // Ganti penamaan di sini
  
  //     // Validasi input
  //     if (!amount || !accountId) {
  //       return res.status(400).json({ error: "Missing required fields" });
  //     }
  
  //     // Ambil rekening dari database untuk mendapatkan saldo terkini
  //     const account = await prisma.bankAccount.findUnique({
  //       where: {
  //         id: accountId,
  //       },
  //     });
  
  //     if (!account) {
  //       return res.status(404).json({ error: "Account not found" });
  //     }
  
  //     // Hitung saldo baru
  //     const newBalance = account.balance + parseFloat(amount);
  
  //     // Update saldo di database
  //     await prisma.bankAccount.update({
  //       where: {
  //         id: accountId,
  //       },
  //       data: {
  //         balance: newBalance,
  //       },
  //     });
  
  //     // Simpan transaksi ke database
  //     const transaction = await prisma.transaction.create({
  //       data: {
  //         amount: parseFloat(amount),
  //         sourceAccountId: accountId, // Akun sumber untuk deposit
  //         destinationAccountId: accountId, // Akun tujuan untuk deposit
  //       },
  //     });
  
  //     res.json({ message: "Deposit successful", transaction, newBalance });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }

  // async withdraw(req, res) {
  //   try {
  //     const { amount, accountId } = req.body; // Ganti penamaan di sini
  
  //     // Validasi input
  //     if (!amount || !accountId) {
  //       return res.status(400).json({ error: "Missing required fields" });
  //     }
  
  //     // Ambil rekening dari database untuk mendapatkan saldo terkini
  //     const account = await prisma.bankAccount.findUnique({
  //       where: {
  //         id: accountId,
  //       },
  //     });
  
  //     if (!account) {
  //       return res.status(404).json({ error: "Account not found" });
  //     }
  
  //     // Validasi apakah saldo mencukupi
  //     if (account.balance < amount) {
  //       return res.status(400).json({ error: "Insufficient balance" });
  //     }
  
  //     // Hitung saldo baru
  //     const newBalance = account.balance - parseFloat(amount);
  
  //     // Update saldo di database
  //     await prisma.bankAccount.update({
  //       where: {
  //         id: accountId,
  //       },
  //       data: {
  //         balance: newBalance,
  //       },
  //     });
  
  //     // Simpan transaksi ke database
  //     const transaction = await prisma.transaction.create({
  //       data: {
  //         amount: parseFloat(amount),
  //         sourceAccountId: accountId, // Akun sumber untuk penarikan
  //         destinationAccountId: accountId, // Akun tujuan untuk penarikan
  //       },
  //     });
  
  //     res.json({ message: "Withdrawal successful", transaction, newBalance });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }
}

module.exports = new TransactionController();
