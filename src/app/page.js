
import Link from 'next/link';
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e] text-white relative overflow-hidden">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between p-6 lg:px-12">
        <div className="text-xl font-bold">
          ARENA NETWORK
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="hover:text-[#5C80AD] transition-colors">Discover</a>
          <Link href="/coliseum" className="hover:text-[#5C80AD] transition-colors">Coliseum</Link>
          <Link href="/duel" className="hover:text-[#5C80AD] transition-colors">Duels</Link>
          <a href="#" className="hover:text-[#5C80AD] transition-colors">Builders</a>
          <a href="#" className="hover:text-[#5C80AD] transition-colors">Community</a>
          <a href="/profile" className="hover:text-[#5C80AD] transition-colors">Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={connectWallet}className="px-4 py-2 border border-white/20 rounded-md hover:bg-white/10 transition-colors">
            Log In
          </button>
          <button 
            onClick={getButtonAction()}
            disabled={isLoading || isCheckingProfile}
            className={`px-4 py-2 rounded-md transition-colors font-medium ${
              isConnected && username 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-[#5C80AD] hover:bg-[#4A8FE7]'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getButtonText()}
          </button>
          {isConnected && (
            <button
              onClick={disconnectWallet}
              className="px-4 py-2 border border-red-500/50 text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
            >
              Déconnecter
            </button>
          )}
        </div>
      </nav>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-20 left-20 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse delay-700"></div>
      <div className="absolute bottom-40 right-10 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse delay-1000"></div>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-20 lg:py-32">
        {/* Central Purple Orb */}
        <div className="relative mb-12">
          <div className="w-20 h-20 bg-[#5C80AD] rounded-full blur-sm animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#5C80AD] rounded-full"></div>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="mb-6 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-md">
            <p className="text-green-400 text-sm">
              {username ? `Connecté en tant que @${username}` : 'Wallet connecté'}
            </p>
          </div>
        )}

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 max-w-4xl leading-tight">
          A Web3 That Is Ethical
          <br />
          For <span className="text-[#5C80AD]">Everyone</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl">
          Blockchain that meets Shariah values. For builders and end users in mind. Designed for ease
          of use and financial well-being.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <button 
            onClick={() => {
              if (isConnected && username) {
                router.push('/dashboard');
              } else {
                handleWalletConnection();
              }
            }}
            className="px-8 py-3 bg-[#5C80AD] rounded-md hover:bg-[#4A8FE7] transition-colors font-medium"
          >
            {isConnected && username ? 'Accéder au Dashboard' : 'Explore Platform'}
          </button>
          <button className="px-8 py-3 border border-white/20 rounded-md hover:bg-white/10 transition-colors">
            View All Products
          </button>
        </div>

        {/* Trust Section */}
        <div className="w-full max-w-6xl">
          <p className="text-sm text-gray-400 mb-8 uppercase tracking-wider">
            TRUSTED BY BELOVED PARTNERS AND CUSTOMERS
          </p>
          
          {/* Partner Logos */}
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">Dropbox</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">Booking.com</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">Medtronic</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">Telia Company</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">Medium</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">jump_</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">brave</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">Google</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">slack</div>
            <div className="px-4 py-2 bg-white/5 rounded-md border border-white/10">Dropbox</div>
          </div>
        </div>
      </main>

      {/* Products Section */}
      <section className="px-6 lg:px-12 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Discover ARENA Network&apos;s <span className="text-[#5C80AD]">Products</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The first blockchain platform built with Shariah values in mind. Designed with ease of use
            and financial well-being in mind.
          </p>
        </div>
      </section>
    </div>
  );
}