'use client';
import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import { useWallet } from '../WalletContext';

// Précharger les modèles au niveau du module
useGLTF.preload('/avatar/avatar1.glb');
useGLTF.preload('/avatar/avatar2.glb');

// Composant pour l'avatar Ready Player Me avec gestion d'erreur
function Avatar({ avatarType = "avatar1" }) {
  const groupRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const avatarUrl = `/avatar/${avatarType}.glb`;
  const fallbackUrl = '/avatar/avatar1.glb';
  
  console.log('Avatar component - Trying to load:', avatarUrl);
  
  // Charger le modèle principal
  let gltf, scene;
  try {
    gltf = useGLTF(avatarUrl);
    scene = gltf.scene;
    console.log('Successfully loaded:', avatarUrl, scene ? 'with scene' : 'no scene');
  } catch (error) {
    console.error('Failed to load', avatarUrl, 'falling back to avatar1');
    setHasError(true);
  }
  
  // Charger le fallback si erreur
  let fallbackGltf;
  try {
    fallbackGltf = useGLTF(fallbackUrl);
  } catch (fallbackError) {
    console.error('Even fallback failed:', fallbackError);
  }
  
  // Utiliser le fallback si nécessaire
  if (hasError && fallbackGltf) {
    gltf = fallbackGltf;
    scene = fallbackGltf.scene;
  }
  
  const cloned = useMemo(() => {
    if (scene) {
      console.log('Cloning scene for:', avatarType);
      const clonedScene = scene.clone();
      setModelLoaded(true);
      return clonedScene;
    }
    setModelLoaded(false);
    return null;
  }, [scene, avatarType]);

  useFrame((state) => {
    if (groupRef.current && modelLoaded) {
      // Rotation automatique continue sur le groupe parent
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  if (!cloned || !modelLoaded) {
    console.log('No cloned scene available for:', avatarType);
    return null;
  }
  
  return (
    <group ref={groupRef}>
      <Center top position={[0, -1, 0]} scale={[8, 8, 8]}>
        <primitive object={cloned} />
      </Center>
    </group>
  );
}

// Fallback si le modèle 3D ne charge pas
function AvatarFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-48 bg-gradient-to-br from-red-600 to-[#4A8FE7] rounded-full flex items-center justify-center">
        <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center">
          <span className="text-4xl">⚽</span>
        </div>
      </div>
    </div>
  );
}

// Composant Canvas avec gestion d'erreur améliorée
function AvatarCanvas({ avatarType = "avatar1" }) {
  const [canvasError, setCanvasError] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  const canvasRef = useRef();
  
  // Gestionnaire pour le contexte perdu
  const handleContextLost = useCallback((event) => {
    event.preventDefault();
    setContextLost(true);
    console.warn('WebGL context lost, attempting recovery...');
    
    // Tentative de récupération après un délai
    setTimeout(() => {
      setContextLost(false);
      setCanvasError(false);
      setForceReload(prev => prev + 1);
      console.log('Attempting WebGL context recovery');
    }, 1000);
  }, []);
  
  // Gestionnaire pour le contexte restauré
  const handleContextRestored = useCallback(() => {
    setContextLost(false);
    setCanvasError(false);
    setForceReload(prev => prev + 1);
    console.log('WebGL context restored successfully');
  }, []);
  
  // Gestionnaire d'erreur Canvas
  const handleCanvasError = useCallback((error) => {
    console.error('Canvas error:', error);
    // Ne pas marquer comme erreur immédiatement, laisser une chance à la récupération
    setTimeout(() => {
      if (contextLost) {
        setCanvasError(true);
      }
    }, 2000);
  }, [contextLost]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleContextLost);
      canvas.addEventListener('webglcontextrestored', handleContextRestored);
      
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }
  }, [handleContextLost, handleContextRestored]);
  
  // Retry automatique en cas de problème persistant
  useEffect(() => {
    if (canvasError && !contextLost) {
      const retryTimer = setTimeout(() => {
        console.log('Retrying canvas creation...');
        setCanvasError(false);
        setForceReload(prev => prev + 1);
      }, 3000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [canvasError, contextLost]);
  
  // Afficher le fallback seulement si vraiment nécessaire
  if (canvasError && contextLost) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <AvatarFallback />
        <p className="text-sm text-gray-400 mt-2">Loading 3D avatar...</p>
      </div>
    );
  }
  
  return (
    <Canvas 
      key={`avatar-canvas-${avatarType}-${forceReload}`}
      ref={canvasRef}
      camera={{ position: [0, 1, 2.5], fov: 45 }}
      onError={handleCanvasError}
      gl={{ 
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Suspense fallback={null}>
        <Avatar avatarType={avatarType} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls 
        target={[0, 0.9, 0]}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 6}
        enableZoom={false}
        enablePan={false}
        autoRotate={true}
        autoRotateSpeed={10}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}

export default function Profile() {
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('avatar1');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected, getUsername, disconnectWallet } = useWallet();
  const router = useRouter();
  
  const handleClaimReward = async () => {
    console.log('Changement vers avatar2...');
    setIsTransitioning(true);
    
    // Délai pour permettre une transition fluide
    setTimeout(() => {
      setCurrentAvatar('avatar2');
      setShowRewardPopup(false);
      setIsTransitioning(false);
      console.log('Avatar changé vers avatar2');
    }, 300);
  };

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!isConnected) {
        router.push('/');
        return;
      }

      try {
        const userUsername = await getUsername(address);
        if (userUsername) {
          setUsername(userUsername);
        } else {
          router.push('/create-profile');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        router.push('/create-profile');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserProfile();
  }, [isConnected, address, getUsername, router]);

  const handleDisconnect = () => {
    disconnectWallet();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement du profil...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center">
          <img 
            src="/logo-kolize.png" 
            alt="KOLISE Logo" 
            className="h-50 w-auto ml-10"
          />
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="text-gray-300 hover:text-white transition-colors duration-300">Home</a>
          <a href="/coliseum" className="text-gray-300 hover:text-white transition-colors duration-300">Coliseum</a>
          <a href="/duel" className="text-gray-300 hover:text-white transition-colors duration-300">Duels</a>
          <a href="/profile" className="text-red-400 font-medium">Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300">
            Connecter Wallet
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row items-start justify-center px-6 py-24 lg:px-12 gap-32 mt-12 relative z-10">
        
        {/* Left Side - Avatar and User Info */}
        <div className="flex-1 max-w-md">
          {/* User Header */}
          <div className="flex items-center mb-8">
            <h1 className="text-2xl font-bold">@{username}</h1>
          </div>

          {/* 3D Avatar - Taille augmentée */}
          <div className="w-full h-96 mb-8 bg-gradient-to-br from-[#1a1b3e]/30 to-[#0a0b1e]/30 rounded-xl border border-white/10 overflow-hidden">
            <AvatarCanvas avatarType={currentAvatar} />
          </div>

          {/* XP Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              {/* Cercle de fond */}
              <div className="w-32 h-32 rounded-full border-4 border-gray-600/40 flex items-center justify-center bg-gradient-to-br from-red-800 to-black-800">
                <div className="text-center">
                  <div className="text-3xl font-bold">3452</div>
                  <div className="text-sm text-gray-400">XP</div>
                </div>
              </div>
              {/* Cercle de progression */}
              <svg className="absolute top-0 left-0 w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  stroke="#ec3535ff"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(3452 / (3452 + 7477)) * 377} 377`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
            </div>
          </div>

          {/* Next Level Info */}
          <div className="text-center mb-8">
            <p className="text-red-400 text-sm mb-2">NEXT LEVEL IN</p>
            <p className="text-xl font-bold">7.477 XP</p>
          </div>
        </div>

        {/* Right Side - Stats and Actions */}
        <div className="flex-1 max-w-2xl">
          
          {/* Balance Section */}
          <div className="mb-8">
            <div className="text-right mb-4">
              <div className="text-4xl lg:text-5xl font-bold mb-2">$4.433,43</div>
              <div className="text-red-400 text-lg">98 074,51 CHZ</div>
              {/* Simple chart line */}
              <div className="mt-4 h-16 bg-gradient-to-r from-transparent via-red-500/20 to-red-500/40 rounded-lg relative">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="px-6 py-2 border border-white/50 rounded-md hover:bg-white/10 transition-colors text-white">
                View all stats &gt;
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Arenas in Progress */}
            <div className="bg-white/3 p-6 rounded-xl border border-white/4">
              <h3 className="text-lg font-semibold mb-4">Arenas in progress</h3>
              <div className="text-center">
                <div className="text-6xl font-bold text-red-400 mb-4">5</div>
                <button className="text-white/40 hover:underline">View All &gt;</button>
              </div>
            </div>

            {/* Duels in Progress */}
            <div className="bg-white/3 p-6 rounded-xl border border-white/4">
              <h3 className="text-lg font-semibold mb-4">Duels in progress</h3>
              <div className="text-center">
                <div className="text-6xl font-bold text-red-400 mb-4">3</div>
                <button className="text-white/40 hover:underline">View All &gt;</button>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white/6 p-6 rounded-xl border border-white/4">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Won NFT skin #1234</span>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-semibold">+150 XP</span>
                  <button 
                    onClick={() => setShowRewardPopup(true)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors font-semibold">
                  
                    Claim
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Completed Duel vs Player456</span>
                <span className="text-white font-semibold">+75 XP</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Joined Coliseum #1235</span>
                <span className="text-red-400 font-semibold">-50 CHZ</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Popup de récompense */}
      {showRewardPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-gradient-to-br from-[#1a1b3e] to-[#0a0b1e] border border-red-600/30 rounded-t-2xl p-8 max-w-md w-full mx-4 mb-[400px] animate-in slide-in-from-bottom duration-300">
            {/* Image du t-shirt */}
            <div className="flex justify-center mb-6">
              <img 
                src="/avatar/teeshirt.png" 
                alt="T-shirt reward" 
                className="w-92 h-92 object-contain"
              />
            </div>
            
            {/* Texte */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">New reward available !</h3>
              <p className="text-gray-300">Add your reward to your avatar</p>
            </div>
            
            {/* Boutons */}
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRewardPopup(false)}
                className="flex-1 px-4 py-3 border border-white/20 text-white rounded-md hover:bg-white/10 transition-colors"
              >
                Later
              </button>
              <button 
                onClick={handleClaimReward}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-600/80 transition-colors font-semibold"
              >
                Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
