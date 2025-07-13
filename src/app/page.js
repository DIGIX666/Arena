'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from './WalletContext';

export default function Home() {
  const [username, setUsername] = useState('');
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const { 
    address, 
    isConnected, 
    isLoading, 
    connectWallet, 
    disconnectWallet, 
    checkProfile, 
    getUsername 
  } = useWallet();
  const router = useRouter();

  const handleWalletConnection = async () => {
    if (isConnected) {
      disconnectWallet();
      setUsername('');
      return;
    }

    try {
      await connectWallet();
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isConnected || !address) return;

      setIsCheckingProfile(true);
      try {
        const hasProfile = await checkProfile(address);
        
        if (hasProfile) {
          const userUsername = await getUsername(address);
          if (userUsername) {
            setUsername(userUsername);
            router.push('/profile');
          } else {
            router.push('/create-profile');
          }
        } else {
          router.push('/create-profile');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du profil:', error);
        router.push('/create-profile');
      } finally {
        setIsCheckingProfile(false);
      }
    };

    if (isConnected && address) {
      checkUserProfile();
    }
  }, [isConnected, address, checkProfile, getUsername, router]);

  const getButtonText = () => {
    if (isLoading) return 'Connexion...';
    if (isCheckingProfile) return 'Vérification...';
    if (isConnected && username) return `@${username}`;
    if (isConnected) return 'Connecté';
    return 'Connecter Wallet';
  };

  const getButtonAction = () => {
    if (isConnected && username) {
      return () => router.push('/dashboard');
    }
    return handleWalletConnection;
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
       {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-3 h-3 bg-red-500 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-red-400 rounded-full animate-pulse delay-300 opacity-40"></div>
        <div className="absolute bottom-20 left-20 w-4 h-4 bg-red-500 rounded-full animate-pulse delay-700 opacity-50"></div>
        <div className="absolute bottom-40 right-10 w-9 h-8 bg-red-400 rounded-full animate-pulse delay-1000 opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-pulse delay-500 opacity-40"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-red-400 rounded-full animate-pulse delay-200 opacity-30"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-red-500 rounded-full animate-pulse delay-800 opacity-50"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-red-400 rounded-full animate-pulse delay-400 opacity-40"></div>
        
        {/* Geometric Lines */}
        <div className="absolute top-1/4 right-5 w-62 h-62 border border-red-500/20 transform rotate-45"></div>
        <div className="absolute bottom-1/4 left-20 w-24 h-24 border border-red-400/15 transform rotate-12"></div>
        <div className="absolute top-1/3 left-1/2 w-20 h-20 border border-red-500/10 transform -rotate-30"></div>
      </div>
      <div className="absolute inset-0 overflow-hidden">
      </div>

      {/* Navigation Header */}
      <nav className="flex items-center justify-between p-6 lg:px-12 relative z-10">
        <div className="text-xl font-bold tracking-wider">
          KOLISE
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Home</a>
          <a href="/coliseum" className="text-gray-300 hover:text-white transition-colors duration-300">Coliseum</a>
          <a href="/duel" className="text-gray-300 hover:text-white transition-colors duration-300">Duels</a>
          <a href="/profile" className="text-gray-300 hover:text-white transition-colors duration-300">Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={getButtonAction()}
            disabled={isLoading || isCheckingProfile}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getButtonText()}
          </button>
          {isConnected && (
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors duration-300"
            >
              Déconnecter
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32 relative z-10">
        {/* Central Orb with Glow Effect */}
        <div className="relative mb-16">
          <div className="absolute inset-0 bg-red-600 rounded-full blur-xl opacity-30 animate-pulse scale-150"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-300 rounded-full"></div>
            </div>
          </div>
          <div className="absolute top-2 left-2 w-3 h-3 bg-red-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-red-200 rounded-full animate-pulse delay-300"></div>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="mb-8 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
            <p className="text-red-400 text-sm">
              {username ? `Connecté en tant que @${username}` : 'Wallet connecté'}
            </p>
          </div>
        )}

        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 max-w-5xl leading-tight">
          Welcome
          <br />
          in the <span className="text-red-400">KOLISE</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-3xl leading-relaxed">
          Betting reinvented. Turn every bet into an adventure.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-24">
          <button 
            onClick={() => {
              if (isConnected && username) {
                router.push('/profile');
              } else {
                handleWalletConnection();
              }
            }}
            className="px-10 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-red-500/25"
          >
            {isConnected && username ? 'Accéder au Dashboard' : 'Explore Platform'}
          </button>
        </div>

        {/* Trust Section */}
        <div className="w-full max-w-6xl">
          <p className="text-sm text-gray-400 mb-12 uppercase tracking-wider">
            Trusted By Beloved Partners And Customers
          </p>
          
          {/* Partner Logos */}
          <div className="relative overflow-hidden opacity-60 py-4">
            <div className="flex w-max animate-marquee space-x-6">
              {[
                'Dropbox','Booking.com','Medtronic',
                'Telia Company','Medium','jump_',
                'brave','Google','slack'
              ].concat([
                'Dropbox','Booking.com','Medtronic',
                'Telia Company','Medium','jump_',
                'brave','Google','slack'
              ]).map((name, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 flex items-center justify-center p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors duration-300"
                >
                  <span className="text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Products Section */}
      <section className="px-6 lg:px-12 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Discover <span className="text-red-400">KOLISE</span> Products
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The first blockchain platform built with Shariah values in mind. Designed with ease of use
            and financial well-being in mind.
          </p>
        </div>

        {/* Card Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8 max-w-6xl mx-auto h-[29.5rem]">
          {/* Grande Card */}
          <div className="flex-1 h-full backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-8 relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-4">Grande Carte</h3>
            <p className="text-gray-300 mb-6 flex-grow">
              Description détaillée de votre grand produit, mettant en avant ses caractéristiques clés et avantages.
            </p>
            <button className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-purple-700 transition">
              En savoir plus
            </button>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 animate-pulse mix-blend-overlay"></div>
          </div>

          {/* Petites Cards Empilées */}
          <div className="flex flex-col w-full lg:w-1/3 gap-6 h-full">
            <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
              <h4 className="text-xl font-semibold">Petite Carte 1</h4>
              <p className="text-gray-300 flex-grow">
                Brève description du premier petit produit.
              </p>
              <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Découvrir
              </button>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/0 mix-blend-overlay"></div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
              <h4 className="text-xl font-semibold">Petite Carte 2</h4>
              <p className="text-gray-300 flex-grow">
                Brève description du deuxième petit produit.
              </p>
              <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                Découvrir
              </button>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/0 mix-blend-overlay"></div>
            </div>
          </div>
        </div>
      </section>
      {/* New Feature Section */}
      <section className="px-6 lg:px-12 py-20 relative z-10 bg-black-900">
        <div className="flex flex-col md:flex-row items-center max-w-6xl mx-auto gap-12">
          {/* Image on the left */}
          <div className="md:w-1/2">
            <img
              src="images/ballon.avif"
              alt="Nouvelle fonctionnalité"
              className="w-full h-auto rounded-2xl shadow-lg object-cover animate-[spin_10s_linear_infinite]"
            />
          </div>
          {/* Text on the right */}
          <div className="md:w-1/2 text-right">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Découvrez Notre Nouvelle Section
            </h2>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Cette section met en avant une fonctionnalité clé de votre plateforme. 
              Vous pouvez y détailler les avantages, expliquer le processus ou 
              tout simplement ajouter un petit message engageant pour vos utilisateurs.
              Cette section met en avant une fonctionnalité clé de votre plateforme. 
              Vous pouvez y détailler les avantages, expliquer le processus ou 
              tout simplement ajouter un petit message engageant pour vos utilisateurs.
              Cette section met en avant une fonctionnalité clé de votre plateforme. 
              Vous pouvez y détailler les avantages, expliquer le processus ou 
              tout simplement ajouter un petit message engageant pour vos utilisateurs.
            </p>
            <button
              onClick={() => router.push('/feature')}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 font-medium"
            >
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-20 relative z-10">
        <div className="text-center mb-12">
        </div>
        <div className="flex flex-col lg:flex-row items-start gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-8 relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-4">Fonctionnalité 1</h3>
            <p className="text-gray-300 mb-6">
              Brève description de la première fonctionnalité clé de la plateforme.
            </p>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 animate-pulse mix-blend-overlay"></div>
          </div>
          {/* Card 2 */}
          <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-8 relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-4">Fonctionnalité 2</h3>
            <p className="text-gray-300 mb-6">
              Brève description de la deuxième fonctionnalité clé de la plateforme.
            </p>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 animate-pulse mix-blend-overlay"></div>
          </div>
          {/* Card 3 */}
          <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl p-8 relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-4">Fonctionnalité 3</h3>
            <p className="text-gray-300 mb-6">
              Brève description de la troisième fonctionnalité clé de la plateforme.
            </p>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 animate-pulse mix-blend-overlay"></div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-6 lg:px-12 py-20 relative z-10 bg-black-900 backdrop-blur-lg bg-opacity-30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Inscrivez-vous à notre Newsletter</h2>
          <p className="text-gray-300 mb-8">Recevez les dernières actualités et mises à jour directement dans votre boîte mail.</p>
          <form className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <input
              type="email"
              placeholder="Votre email"
              className="w-full sm:w-auto px-6 py-3 bg-white/3 backdrop-blur-xl border border-white/5 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} KOLISE. Tous droits réservés.
      </footer>

    </div>
  );
}
