const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seeder untuk User dan Profile
  const user1 = await prisma.user.create({
    data: {
      email: "user1@example.com",
      name: "User One",
      password: "hashedpassword1", // Pastikan menggunakan hashed password
      profile: {
        create: {
          identityType: "KTP",
          identityNumber: 12345678,
          address: "Jl. Contoh No. 1",
        },
      },
      bankAccount: {
        create: [
          {
            bankName: "Bank A",
            accountNumber: 111111,
            balance: 1000.0,
          },
          {
            bankName: "Bank B",
            accountNumber: 222222,
            balance: 2000.0,
          },
        ],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "user2@example.com",
      name: "User Two",
      password: "hashedpassword2",
      profile: {
        create: {
          identityType: "SIM",
          identityNumber: 87654321,
          address: "Jl. Contoh No. 2",
        },
      },
      bankAccount: {
        create: [
          {
            bankName: "Bank C",
            accountNumber: 333333,
            balance: 3000.0,
          },
        ],
      },
    },
  });

  // Seeder untuk Transaction
  await prisma.transaction.create({
    data: {
      amount: 500.0,
      sourceAccount: { connect: { id: user1.bankAccount[0].id } },
      destinationAccount: { connect: { id: user2.bankAccount[0].id } },
    },
  });

  await prisma.transaction.create({
    data: {
      amount: 100.0,
      sourceAccount: { connect: { id: user1.bankAccount[1].id } },
      destinationAccount: { connect: { id: user2.bankAccount[0].id } },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });