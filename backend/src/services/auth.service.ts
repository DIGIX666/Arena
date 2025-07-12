import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export class AuthService {
  static async isUsernameAvailable(username: string) {
    const existing = await prisma.user.findUnique({
      where: { username },
    });
    return !existing;
  }

  static async signup(data: any) {
    const hash = await argon2.hash(data.password);

    let chzAddress: string;
    let keyEnc: string;

    if (data.address && data.keyEnc) {
      chzAddress = data.address;
      keyEnc = data.keyEnc;
    } else {
      const wallet = ethers.Wallet.createRandom();

      // Dériver une clé symétrique avec PBKDF2
      const derivedKey = crypto.pbkdf2Sync(
        data.password,
        'some_salt',
        100000,
        32,
        'sha256'
      );

      // Chiffrer la clé privée avec AES-256-GCM
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv);

      const encrypted = Buffer.concat([
        cipher.update(wallet.privateKey, 'utf8'),
        cipher.final(),
      ]);

      const tag = cipher.getAuthTag();

      // Concaténer IV + tag + ciphertext en base64
      keyEnc = Buffer.concat([iv, tag, encrypted]).toString('base64');

      chzAddress = wallet.address;
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hash,
        chzAddress,
        keyEnc,
      },
    });

    return this.signToken(user.id, user.email);
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new Error('Utilisateur introuvable');

    const pwMatches = await argon2.verify(user.password, data.password);
    if (!pwMatches) throw new Error('Mot de passe incorrect');

    return this.signToken(user.id, user.email);
  }

  static signToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    return jwt.sign(payload, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
  }

  static async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, chzAddress: true },
    });
    return user;
  }

  static async downloadKey(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { keyEnc: true },
    });
    return user?.keyEnc;
  }
}

