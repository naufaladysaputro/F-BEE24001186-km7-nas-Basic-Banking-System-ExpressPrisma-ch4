const prisma = require("../config/prisma");


class TransactionController {
  async createTransaction (req, res) {
    try {
      const { amount, source_account_id, destination_account_id } = req.body;
      console.log(req.body);
  
      // Validasi input
      if (!amount || !source_account_id || !destination_account_id) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const transaction = await prisma.transactions.create({
        data: {
          amount,
          source_account_id, // Memastikan penggunaan nama yang sesuai
          destination_account_id, // Memastikan penggunaan nama yang sesuai
        },
      });
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  async getTransactionById (req, res) {
    try {
      const { id } = req.params;
      const detail = await prisma.transactions.findUnique({
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
  };

  async getAllTransactions (req, res) {
    try {
      const list = await prisma.transactions.findMany();
      res.json(list);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // async deposit  (req, res) {
  //   try {
  //     const { amount, account_id } = req.body;
  
  //     // Validasi input
  //     if (!amount || !account_id) {
  //       return res.status(400).json({ error: "Missing required fields" });
  //     }
  
  //     // Ambil rekening dari database untuk mendapatkan saldo terkini
  //     const account = await prisma.bankAccounts.findUnique({
  //       where: {
  //         id: account_id,
  //       },
  //     });
  
  //     if (!account) {
  //       return res.status(404).json({ error: "Account not found" });
  //     }
  
  //     // Hitung saldo baru
  //     const newBalance = account.balance + parseFloat(amount);
  
  //     // Update saldo di database
  //     await prisma.bankAccounts.update({
  //       where: {
  //         id: account_id,
  //       },
  //       data: {
  //         balance: newBalance,
  //       },
  //     });
  
  //     // Simpan transaksi ke database
  //     const transaction = await prisma.transactions.create({
  //       data: {
  //         amount: parseFloat(amount),
  //         source_account_id: account_id, // Akun sumber untuk deposit
  //         destination_account_id: account_id, // Akun tujuan untuk deposit
  //       },
  //     });
  
  //     res.json({ message: "Deposit successful", transaction, newBalance });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // };

  // async withdraw  (req, res) {
  //   try {
  //     const { amount, account_id } = req.body;
  
  //     // Validasi input
  //     if (!amount || !account_id) {
  //       return res.status(400).json({ error: "Missing required fields" });
  //     }
  
  //     // Ambil rekening dari database untuk mendapatkan saldo terkini
  //     const account = await prisma.bankAccounts.findUnique({
  //       where: {
  //         id: account_id,
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
  //     await prisma.bankAccounts.update({
  //       where: {
  //         id: account_id,
  //       },
  //       data: {
  //         balance: newBalance,
  //       },
  //     });
  
  //     // Simpan transaksi ke database
  //     const transaction = await prisma.transactions.create({
  //       data: {
  //         amount: parseFloat(amount),
  //         source_account_id: account_id, // Akun sumber untuk penarikan
  //         destination_account_id: account_id, // Akun tujuan untuk penarikan
  //       },
  //     });
  
  //     res.json({ message: "Withdrawal successful", transaction, newBalance });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // };
  
}

module.exports = new TransactionController();
