const prisma = require("../config/prisma");

class UserController {

  async getAllUser(req, res) {
    try {
      // Jika token valid, maka dapat mengakses endpoint
      const users = await prisma.user.findMany({
        include: { profile: true }, // Include profil dalam respons
      });
      res.status(200).json(users); 
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { profile: true },
      });

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUserWithProfile(req, res) {
    try {
      const { email, name, password, identityType, identityNumber, address } = req.body; // Ganti penamaan di sini

      console.log("Request Body:", req.body);

      // Validasi input
      if (!email || !name || !password) {
        return res.status(400).json({
          error: "Email, name, and password are required",
        });
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password,
          profile: {
            create: {
              identityType, // Ganti dengan identityType
              identityNumber, // Ganti dengan identityNumber
              address,
            },
          },
        },
        include: { profile: true },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUsersWithProfile(req, res) {
    try {
      const { id } = req.params;
      const { email, name, password, identityType, identityNumber, address } = req.body; // Ganti penamaan di sini
      console.log("Request Body:", req.body);

      const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { profile: true },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "User not found" });
      }

      const updatedData = {
        email: email || existingUser.email,
        name: name || existingUser.name,
        password: password || existingUser.password,
        profile: {
          update: {
            identityType: identityType || existingUser.profile?.identityType, // Ganti dengan identityType
            identityNumber: identityNumber || existingUser.profile?.identityNumber, // Ganti dengan identityNumber
            address: address || existingUser.profile?.address,
          },
        },
      };

      console.log(updatedData);

      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updatedData,
        include: { profile: true },
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUsersById(req, res) {
    try {
      const { id } = req.params;

      const existingUser = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: { profile: true },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "User not found" });
      }

      await prisma.profile.delete({
        where: { userId: existingUser.id },
      });

      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Data has been deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
