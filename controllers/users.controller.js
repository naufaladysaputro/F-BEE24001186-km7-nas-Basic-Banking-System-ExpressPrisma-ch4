const prisma = require("../config/prisma");

class UserController {

  async getAllUser(req, res) {
    try {
      const users = await prisma.users.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await prisma.users.findUnique({
        where: { id: parseInt(id) },
        include: { profile: true },
      });

      if (!user) {
        return res.status(400).json({ error: "id not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUserWithProfile(req, res) {
    try {
      const { email, name, password, identity_type, identity_number, address } = req.body;

      console.log("Request Body:", req.body);

      // Validasi input
      if (!email || !name || !password) {
        return res.status(400).json({
          error: "Email, name, password, are required",
        });
      }

      const user = await prisma.users.create({
        data: {
          email,
          name,
          password,
          profile: {
            create: {
              identity_type,
              identity_number,
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
      const { email, name, password, identity_type, identity_number, address } = req.body;
      console.log("request body", req.body);

      const existingUser = await prisma.users.findUnique({
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
            identity_type: identity_type || existingUser.profile?.identity_type,
            identity_number: identity_number || existingUser.profile?.identity_number,
            address: address || existingUser.profile?.address,
          },
        },
      };

      console.log(updatedData);

      const updatedUser = await prisma.users.update({
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

      const existingUser = await prisma.users.findUnique({
        where: { id: parseInt(id) },
        include: { profile: true },
      });

      if (!existingUser) {
        return res.status(400).json({ error: "User not found" });
      }

      await prisma.profiles.delete({
        where: { userId: existingUser.id },
      });

      await prisma.users.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: "Data has been deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
