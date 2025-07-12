import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  async getEncryptedKey(userId: number) {
    const u = await prisma.user.findUnique({
      where: { id: userId },
      select: { keyEnc: true },
    });
    if (!u) throw new Error('Utilisateur non trouvé');
    return u.keyEnc;
  },
};

