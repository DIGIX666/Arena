'use client';
import { Suspense, useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Center } from '@react-three/drei';

// Précharger les modèles au niveau du module
useGLTF.preload('/avatar/avatar1.glb');
useGLTF.preload('/avatar/avatar2.glb');

// Composant pour l'avatar Ready Player Me avec gestion d'erreur
function Avatar({ avatarType = "avatar1" }) {
  const groupRef = useRef();
  const [modelLoaded, setModelLoaded] = useState(false);
  const avatarUrl = `/avatar/${avatarType}.glb`;
  
  console.log('Avatar component - Trying to load:', avatarUrl);
  
  // Charger le modèle avec gestion d'erreur robuste
  let gltf, scene;
  try {
    gltf = useGLTF(avatarUrl);
    scene = gltf.scene;
    console.log('Successfully loaded:', avatarUrl, scene ? 'with scene' : 'no scene');
  } catch (error) {
    console.error('Failed to load', avatarUrl, 'falling back to avatar1');
    // Fallback vers avatar1 si avatar2 échoue
    try {
      gltf = useGLTF('/avatar/avatar1.glb');
      scene = gltf.scene;
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError);
      return null;
    }
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
      <div className="w-48 h-48 bg-gradient-to-br from-[#5C80AD] to-[#4A8FE7] rounded-full flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e] text-white relative overflow-hidden">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between p-6 lg:px-12">
        <div className="text-xl font-bold">
          ARENA NETWORK
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="/" className="hover:text-[#5C80AD] transition-colors">Home</a>
          <a href="#" className="hover:text-[#5C80AD] transition-colors">Discover</a>
          <a href="#" className="hover:text-[#5C80AD] transition-colors">Business</a>
          <a href="#" className="hover:text-[#5C80AD] transition-colors">Builders</a>
          <a href="#" className="text-[#5C80AD]">Profile</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 border border-[#5C80AD] text-[#5C80AD] rounded-md hover:bg-[#5C80AD]/10 transition-colors">
            Deposit +
          </button>
          <button className="px-4 py-2 border border-white/20 rounded-md hover:bg-white/10 transition-colors">
            Withdraw
          </button>
        </div>
      </nav>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-20 left-20 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse delay-700"></div>
      <div className="absolute bottom-40 right-10 w-2 h-2 bg-[#5C80AD] rounded-full animate-pulse delay-1000"></div>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row items-start justify-center px-6 py-24 lg:px-12 gap-32 mt-12">
        
        {/* Left Side - Avatar and User Info */}
        <div className="flex-1 max-w-md">
          {/* User Header */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-[#5C80AD] rounded-full flex items-center justify-center mr-3">
              <span className="text-sm font-bold">🛡️</span>
            </div>
            <h1 className="text-2xl font-bold">Thox</h1>
          </div>

          {/* 3D Avatar - Taille augmentée */}
          <div className="w-full h-96 mb-8 bg-gradient-to-br from-[#1a1b3e]/30 to-[#0a0b1e]/30 rounded-xl border border-white/10 overflow-hidden">
            <AvatarCanvas avatarType={currentAvatar} />
          </div>

          {/* XP Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32">
              {/* Cercle de fond */}
              <div className="w-32 h-32 rounded-full border-4 border-gray-600/30 flex items-center justify-center bg-gradient-to-br from-[#1a1b3e] to-[#0a0b1e]">
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
                  stroke="#5C80AD"
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
            <p className="text-[#5C80AD] text-sm mb-2">NEXT LEVEL IN</p>
            <p className="text-xl font-bold">7.477 XP</p>
          </div>
        </div>

        {/* Right Side - Stats and Actions */}
        <div className="flex-1 max-w-2xl">
          
          {/* Balance Section */}
          <div className="mb-8">
            <div className="text-right mb-4">
              <div className="text-4xl lg:text-5xl font-bold mb-2">$4.433,43</div>
              <div className="text-[#5C80AD] text-lg">98 074,51 CHZ</div>
              {/* Simple chart line */}
              <div className="mt-4 h-16 bg-gradient-to-r from-transparent via-[#5C80AD]/20 to-[#5C80AD]/40 rounded-lg relative">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#5C80AD] rounded-full"></div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="px-6 py-2 border border-[#5C80AD]/50 rounded-md hover:bg-[#5C80AD]/10 transition-colors text-[#5C80AD]">
                View all stats &gt;
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            
            {/* Arenas in Progress */}
            <div className="bg-gradient-to-br from-[#1a1b3e]/50 to-[#0a0b1e]/50 p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Arenas in progress</h3>
              <div className="text-center">
                <div className="text-6xl font-bold text-[#5C80AD] mb-4">5</div>
                <button className="text-[#5C80AD] hover:underline">View All &gt;</button>
              </div>
            </div>

            {/* Duels in Progress */}
            <div className="bg-gradient-to-br from-[#1a1b3e]/50 to-[#0a0b1e]/50 p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Duels in progress</h3>
              <div className="text-center">
                <div className="text-6xl font-bold text-[#5C80AD] mb-4">3</div>
                <button className="text-[#5C80AD] hover:underline">View All &gt;</button>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-gradient-to-br from-[#1a1b3e]/50 to-[#0a0b1e]/50 p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Won NFT skin #1234</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#5C80AD] font-semibold">+150 XP</span>
                  <button 
                    onClick={() => setShowRewardPopup(true)}
                    className="px-3 py-1 bg-[#5C80AD] text-white text-sm rounded-md hover:bg-[#5C80AD]/80 transition-colors font-semibold"
                  >
                    Claim
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Completed Duel vs Player456</span>
                <span className="text-[#5C80AD] font-semibold">+75 XP</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg">
                <span className="text-gray-300">Joined Coliseum #1235</span>
                <span className="text-yellow-400 font-semibold">-50 CHZ</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Popup de récompense */}
      {showRewardPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-gradient-to-br from-[#1a1b3e] to-[#0a0b1e] border border-[#5C80AD]/30 rounded-t-2xl p-8 max-w-md w-full mx-4 mb-[400px] animate-in slide-in-from-bottom duration-300">
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
                className="flex-1 px-4 py-3 bg-[#5C80AD] text-white rounded-md hover:bg-[#5C80AD]/80 transition-colors font-semibold"
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