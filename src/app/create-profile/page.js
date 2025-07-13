'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../WalletContext';

export default function CreateProfile() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { createProfile, isConnected } = useWallet();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createProfile(username);
      router.push('/dashboard');
    } catch (error) {
      if (error.reason) {
        setError(error.reason);
      } else {
        setError('Erreur lors de la création du profil');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Wallet non connecté</h1>
          <p className="text-gray-300">Veuillez vous connecter pour continuer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e] text-white">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Créer votre profil</h1>
            <p className="text-gray-300">Choisissez un nom d'utilisateur pour votre profil blockchain</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5C80AD] focus:border-transparent"
                placeholder="Votre nom d'utilisateur"
                maxLength={32}
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full px-4 py-3 bg-[#5C80AD] rounded-md hover:bg-[#4A8FE7] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Création en cours...' : 'Créer le profil'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}