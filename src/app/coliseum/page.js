"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, memo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Users, ShieldCheck, Zap, Award, Trophy, Star, CheckCircle, Ticket, AlertCircle, Loader2, Package, Target, Shield, Trophy as TrophyIcon, UserPlus, Vote, Share2, Swords, Crown } from 'lucide-react';

const parseTimeLeft = (timeLeft) => {
  if (!timeLeft) return 0;
  const [days = 0, hours = 0] = timeLeft.split(' ').map(part => parseInt(part) || 0);
  return (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
};

const userProfile = {
  address: '0x123...456',
  fanTokens: 6000,
  points: 7500,
  chzBalance: 850.34,
  usdcBalance: 1250.67,
  achievements: ['Volatility Survivor', 'Champions League Oracle', 'Insurance Master'],
  seasonalRank: 'Diamond',
  totalWinnings: 23450.89,
  protectionTriggered: 2,
  winStreak: 7
};

// GROSSES ARÈNES LONG TERME avec gros enjeux
const seasonalArenasData = [
  { 
    id: 1, 
    type: 'Prediction', 
    title: "Champions League Final", 
    subtitle: "Madrid vs Manchester City", 
    seasonalType: "ChampionsLeague", 
    outcomes: ["Real Madrid Victory", "Manchester City Victory", "Draw (Extra Time)"], 
    chzPot: 2847392, 
    usdcPot: 892456, 
    entryFeeCHZ: 250, 
    insuranceFee: 20, 
    minFanTokens: 2000, 
    freeInsuranceThreshold: 5000, 
    timeLeft: "72h 15m", 
    participants: 15847, 
    protectionTriggered: true, 
    isResolved: false, 
    rewardMultiplier: 2.4 
  },
  { 
    id: 2, 
    type: 'Prediction', 
    title: "Ballon d'Or 2024", 
    subtitle: "Messi vs Haaland vs Mbappe", 
    seasonalType: "BallonDor", 
    outcomes: ["Messi Wins", "Haaland Wins", "Mbappe Wins"], 
    chzPot: 945123, 
    usdcPot: 423789, 
    entryFeeCHZ: 300, 
    insuranceFee: 20, 
    minFanTokens: 2000, 
    freeInsuranceThreshold: 5000, 
    timeLeft: "89d 12h", 
    participants: 12456, 
    protectionTriggered: false, 
    isResolved: true, 
    rewardMultiplier: 4.1 
  },
  { 
    id: 3, 
    type: 'Faction', 
    title: "Ultimate Faction Battle", 
    subtitle: "Real Madrid vs Barcelona Fans", 
    seasonalType: "FactionWar", 
    outcomes: ["Real Madrid Dominance", "Barcelona Supremacy", "Neutral Alliance"], 
    chzPot: 1567892, 
    usdcPot: 678543, 
    entryFeeCHZ: 200, 
    insuranceFee: 15, 
    minFanTokens: 1500, 
    freeInsuranceThreshold: 4000, 
    timeLeft: "156h 30m", 
    participants: 23456, 
    protectionTriggered: false, 
    isResolved: false, 
    rewardMultiplier: 3.2, 
    factionType: "ClubRivalry" 
  },
  { 
    id: 4, 
    type: 'Prediction', 
    title: "Transfer Window Mega Deal", 
    subtitle: "Mbappé Next Destination", 
    seasonalType: "TransferWindow", 
    outcomes: ["Real Madrid", "PSG Extension", "Premier League Move"], 
    chzPot: 1234567, 
    usdcPot: 567890, 
    entryFeeCHZ: 180, 
    insuranceFee: 18, 
    minFanTokens: 1800, 
    freeInsuranceThreshold: 4500, 
    timeLeft: "240h 45m", 
    participants: 18743, 
    protectionTriggered: false, 
    isResolved: false, 
    rewardMultiplier: 2.8 
  },
  { 
    id: 5, 
    type: 'Prediction', 
    title: "Europa League Final", 
    subtitle: "Atalanta vs Bayer Leverkusen", 
    seasonalType: "EuropaLeague", 
    outcomes: ["Atalanta Victory", "Bayer Leverkusen Victory", "Draw (Extra Time)"], 
    chzPot: 987654, 
    usdcPot: 345678, 
    entryFeeCHZ: 150, 
    insuranceFee: 15, 
    minFanTokens: 1200, 
    freeInsuranceThreshold: 3500, 
    timeLeft: "96h 20m", 
    participants: 14532, 
    protectionTriggered: false, 
    isResolved: false, 
    rewardMultiplier: 3.1 
  },
];

// NFT RAFFLES EXCLUSIFS
const nftRafflesData = [
  { 
    id: 101, 
    type: 'Raffle', 
    title: "Signed Jersey Raffle", 
    subtitle: "Exclusive Partner", 
    requiredFanTokens: 1000, 
    requiredPoints: 5000, 
    tier: 'Premium', 
    deadline: Date.now() + 3 * 24 * 60 * 60 * 1000, 
    isResolved: false 
  },
  { 
    id: 102, 
    type: 'Raffle', 
    title: "VIP Access Raffle", 
    subtitle: "Special Partnership", 
    requiredFanTokens: 0, 
    requiredPoints: 10000, 
    tier: 'Partnership', 
    deadline: Date.now() + 10 * 24 * 60 * 60 * 1000, 
    isResolved: false 
  },
];

const platformMetrics = {
  totalCHZLocked: 8947392,
  totalUSDCLocked: 3456789,
  totalAccumulated: 1234567,
  activeArenas: 24,
  resolvedArenas: 156,
  avgVolatility: 18.7,
  protectionsTriggered: 34,
  emergencyConversions: 2,
  totalUsers: 45632,
  fanTokenHolders: 23891
};

const sponsorsData = [
  { id: 1, name: "Partner A", logo: "/sponsor1.png" },
  { id: 2, name: "Partner B", logo: "/sponsor2.png" },
  { id: 3, name: "Partner C", logo: "/sponsor3.png" },
  { id: 4, name: "Partner D", logo: "/sponsor4.png" },
];

const allEvents = [...seasonalArenasData, ...nftRafflesData];

const useSimulatedContract = (user) => {
  const [transactionState, setTransactionState] = useState('idle');

  const enterSeasonal = async (arena, outcome, withInsurance) => {
    setTransactionState('pending');
    const insuranceCost = (withInsurance && user.fanTokens < arena.freeInsuranceThreshold) ? arena.insuranceFee : 0;
    const totalCost = arena.entryFeeCHZ + insuranceCost;
    if (user.chzBalance < totalCost) {
      setTransactionState('error');
      return;
    }
    await new Promise(res => setTimeout(res, 2000));
    setTransactionState('success');
  };

  const enterRaffle = async (raffle) => {
    setTransactionState('pending');
    await new Promise(res => setTimeout(res, 2000));
    setTransactionState('success');
  };

  return { transactionState, setTransactionState, enterSeasonal, enterRaffle };
};

const Navbar = () => (
  <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4 bg-[#0a0b1e]/90 backdrop-blur-md border-b border-[#5C80AD]/30">
    <div className="flex items-center justify-between max-w-7xl mx-auto">
      <div className="text-2xl font-bold text-white">
        COLISEUM
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Home</Link>
        <Link href="/coliseum" className="text-[#5C80AD] font-medium">Coliseum</Link>
        <Link href="/duel" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Duels</Link>
        <Link href="#" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Rankings</Link>
        <Link href="#" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Profile</Link>
      </div>
      <button className="px-6 py-2 bg-[#5C80AD] text-white rounded-md hover:bg-[#4A8FE7] transition-colors duration-200 font-semibold">
        Connect Wallet
      </button>
    </div>
  </nav>
);

const UserProfileDashboard = ({ user }) => (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold text-[#5C80AD] mb-6">Your Dashboard</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard icon={<Award size={18} className="text-[#5C80AD]" />} label="Points" value={user.points.toLocaleString()} colorClass="text-[#5C80AD]" />
      <StatCard icon={<Star size={18} className="text-white" />} label="Fan Tokens" value={user.fanTokens.toLocaleString()} colorClass="text-white" />
      <StatCard icon={<Zap size={18} className="text-[#5C80AD]" />} label="CHZ Balance" value={user.chzBalance.toFixed(2)} colorClass="text-[#5C80AD]" />
      <StatCard icon={<ShieldCheck size={18} className="text-white" />} label="USDC Balance" value={user.usdcBalance.toFixed(2)} colorClass="text-white" />
    </div>
  </div>
);

const StatCard = ({ icon, label, value, colorClass = "text-[#21A179]" }) => (
  <motion.div 
    className="bg-white/5 p-4 rounded-lg flex items-center gap-3 hover:bg-white/10 hover:shadow-[#5C80AD]/30 transition-all duration-200"
    whileHover={{ scale: 1.03, rotate: 1 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="p-2 bg-[#5C80AD]/20 rounded-full">{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`text-lg font-semibold ${colorClass}`}>{value}</div>
    </div>
  </motion.div>
);

const CountdownTimer = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const timeDiff = deadline - now;
      if (timeDiff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span className="text-xs text-gray-400">{timeLeft}</span>;
};

const EventCard = memo(function EventCard({ event, onSelect }) {
  const theme = event.type === 'Prediction' 
    ? { color: 'text-[#5C80AD]', bgColor: 'bg-white/5', borderColor: 'border-white/10' }
    : event.type === 'Faction'
    ? { color: 'text-[#ff6b35]', bgColor: 'bg-gradient-to-br from-red-500/10 to-orange-500/10', borderColor: 'border-red-400/20' }
    : { color: 'text-white', bgColor: 'bg-white/5', borderColor: 'border-white/10' };

  const getFactionAnimation = () => {
    if (event.type === 'Faction') {
      return {
        initial: { scale: 0.8, opacity: 0, rotateY: -180 },
        animate: { 
          scale: 1, 
          opacity: 1, 
          rotateY: 0,
          transition: { 
            duration: 1.2, 
            delay: 0.8,
            type: "spring",
            stiffness: 100,
            damping: 10
          }
        },
        whileHover: { 
          scale: 1.05, 
          rotate: [0, -2, 2, 0],
          boxShadow: "0px 10px 30px rgba(255, 107, 53, 0.4)",
          transition: { 
            duration: 0.6,
            rotate: {
              repeat: Infinity,
              repeatType: "mirror",
              duration: 0.8
            }
          }
        }
      };
    }
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      whileHover: { scale: 1.03, rotate: 1, transition: { duration: 0.2 } }
    };
  };

  const animationProps = getFactionAnimation();

  return (
    <motion.div
      onClick={() => onSelect(event)}
      className={`cursor-pointer rounded-xl p-5 relative overflow-hidden ${theme.bgColor} border ${theme.borderColor} hover:shadow-lg ${event.type === 'Faction' ? 'hover:shadow-red-500/40' : 'hover:shadow-[#5C80AD]/30'} transition-all duration-300`}
      initial={animationProps.initial}
      animate={animationProps.animate}
      whileHover={animationProps.whileHover}
      whileTap={{ scale: 0.98 }}
    >
      {event.type === 'Faction' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      )}
      {event.isResolved && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-lg font-semibold text-white z-10">ENDED</div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className={`inline-flex items-center gap-2 mb-2 text-xs font-medium ${theme.color}`}>
            {event.type === 'Prediction' ? (
              <Trophy size={14} />
            ) : event.type === 'Faction' ? (
              <motion.div
                animate={{
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                  delay: 1.2
                }}
              >
                <Swords size={14} />
              </motion.div>
            ) : (
              <Ticket size={14} />
            )}
            {event.type === 'Prediction' ? 'Prediction Arena' : event.type === 'Faction' ? (
              <motion.span
                animate={{
                  color: ['#ff6b35', '#ff8c00', '#ff4500', '#ff6b35']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              >
                Faction Battle
              </motion.span>
            ) : 'NFT Raffle'}
          </div>
          <h3 className={`text-base font-semibold ${event.type === 'Faction' ? 'text-[#ff6b35]' : 'text-[#5C80AD]'}`}>{event.title}</h3>
          <p className="text-xs text-gray-400">{event.subtitle}</p>
          {(event.timeLeft || event.deadline) && (
            <div className="mt-2">
              <CountdownTimer deadline={event.deadline || Date.now() + parseTimeLeft(event.timeLeft)} />
            </div>
          )}
        </div>
        {event.protectionTriggered && (
          <ShieldCheck className="text-[#5C80AD] flex-shrink-0" title="Volatility Protection Active" size={18} />
        )}
      </div>
      
      {(event.type === 'Prediction' || event.type === 'Faction') && (
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Zap size={12} className={event.type === 'Faction' ? "text-[#ff6b35]" : "text-[#5C80AD]"} />
            <span>{event.chzPot.toLocaleString()} CHZ</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-white" />
            <span>{event.usdcPot.toLocaleString()} USDC</span>
          </div>
        </div>
      )}
      
      {event.type === 'Raffle' && (
        <div className="absolute top-4 right-4">
          <motion.div
            className="relative"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <Image
              src="/nft.png"
              alt="NFT Prize"
              width={60}
              height={60}
              className="rounded-lg shadow-lg shadow-[#5C80AD]/30"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#5C80AD]/20 to-transparent rounded-lg"
              animate={{
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
      )}
      
      {(event.type === 'Prediction' || event.type === 'Faction') && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-1">{event.type === 'Faction' ? 'Faction War Prize Pool' : 'CHZ Prize Pool'}</div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className={`${event.type === 'Faction' ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-[#5C80AD]'} h-1.5 rounded-full transition-all duration-300 animate-pulse`}
              style={{ width: `${Math.min((event.chzPot / 5000000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <button
        className={`w-full py-3 mt-4 rounded-md text-sm font-medium text-white ${event.type === 'Faction' ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 hover:shadow-red-500/30' : 'bg-[#5C80AD] hover:bg-[#4A8FE7] hover:shadow-[#5C80AD]/30'} transition-all duration-200 ${event.isResolved ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={event.isResolved}
      >
        {event.isResolved ? 'View Results' : event.type === 'Prediction' ? 'Enter Arena' : event.type === 'Faction' ? 'Join Battle' : 'Participate'}
      </button>
    </motion.div>
  );
});

const EventFilters = ({ onFilterChange, onSortChange, filter, sort }) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-3 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-[#5C80AD] text-white' : 'bg-white/5 text-white hover:bg-white/10'} transition-all duration-200`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('Prediction')}
        className={`px-4 py-3 rounded-md text-sm font-medium ${filter === 'Prediction' ? 'bg-[#5C80AD] text-white' : 'bg-white/5 text-white hover:bg-white/10'} transition-all duration-200`}
      >
        Predictions
      </button>
      <button
        onClick={() => onFilterChange('Faction')}
        className={`px-4 py-3 rounded-md text-sm font-medium ${filter === 'Faction' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-white/5 text-white hover:bg-white/10'} transition-all duration-200`}
      >
        Faction Battles
      </button>
      <button
        onClick={() => onFilterChange('Raffle')}
        className={`px-4 py-3 rounded-md text-sm font-medium ${filter === 'Raffle' ? 'bg-[#5C80AD] text-white' : 'bg-white/5 text-white hover:bg-white/10'} transition-all duration-200`}
      >
        NFT Raffles
      </button>
    </div>
    <select
      onChange={(e) => onSortChange(e.target.value)}
      className="px-4 py-3 bg-white/5 rounded-md text-sm text-white border border-white/10"
    >
      <option value="default">Sort by Default</option>
      <option value="chzPot">CHZ Prize Pool</option>
      <option value="timeLeft">Time Left</option>
    </select>
  </div>
);

const PlatformStats = () => (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold text-[#5C80AD] mb-6 text-center">Platform Statistics</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      <PlatformStatItem icon={<Package size={20} className="text-[#5C80AD]" />} label="Total CHZ Locked" value={platformMetrics.totalCHZLocked.toLocaleString()} />
      <PlatformStatItem icon={<ShieldCheck size={20} className="text-[#5C80AD]" />} label="Total USDC Secured" value={platformMetrics.totalUSDCLocked.toLocaleString()} />
      <PlatformStatItem icon={<BarChart size={20} className="text-white" />} label="Active Arenas" value={platformMetrics.activeArenas} />
      <PlatformStatItem icon={<Users size={20} className="text-[#5C80AD]" />} label="Total Users" value={platformMetrics.totalUsers.toLocaleString()} />
    </div>
  </div>
);

const PlatformStatItem = ({ icon, label, value }) => (
  <motion.div 
    className="bg-white/5 p-4 rounded-lg text-center border border-white/10" 
    whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.1)', boxShadow: '0px 4px 12px rgba(92, 128, 173, 0.3)' }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex justify-center mb-2">{icon}</div>
    <div className="text-lg font-semibold text-white mb-1">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </motion.div>
);

const Sponsors = () => (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold text-[#5C80AD] mb-6 text-center">Our Partners</h2>
    <p className="text-sm text-gray-400 text-center mb-6 max-w-2xl mx-auto">
      Powered by leading sports and blockchain brands, bringing fans closer to the action.
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {sponsorsData.map(sponsor => (
        <motion.div
          key={sponsor.id}
          className="bg-white/5 p-4 rounded-lg flex items-center justify-center border border-white/10 animate-pulse"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0px 4px 12px rgba(92, 128, 173, 0.3)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src={sponsor.logo}
            alt={`${sponsor.name} logo`}
            width={100}
            height={50}
            className="object-contain filter brightness-75 hover:brightness-100 transition-all duration-200"
          />
        </motion.div>
      ))}
    </div>
  </div>
);

const FanEngagementHub = () => (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold text-[#5C80AD] mb-4 text-center">Fan Engagement Hub</h2>
    <p className="text-sm text-gray-400 text-center mb-6 max-w-2xl mx-auto">
      Join the ultimate fan arena—compete, vote, and share your passion for sports.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <EngagementCard 
        icon={<UserPlus size={24} className="text-[#5C80AD]" />}
        title="Join the Leaderboard"
        description="Climb the ranks and showcase your prediction skills."
        action="View Rankings"
        href="#"
      />
      <EngagementCard 
        icon={<Vote size={24} className="text-[#5C80AD]" />}
        title="Vote on Outcomes"
        description="Have your say in exclusive fan-driven polls."
        action="Vote Now"
        href="#"
      />
      <EngagementCard 
        icon={<Share2 size={24} className="text-[#5C80AD]" />}
        title="Share Your Prediction"
        description="Spread the word and rally your community."
        action="Share"
        href="#"
      />
    </div>
  </div>
);

const HowItWorks = () => (
  <div className="text-center">
    <h2 className="text-xl font-semibold text-[#5C80AD] mb-4">How It Works</h2>
    <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-8">Enter the ultimate arena of sports prediction, secured by blockchain technology.</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <HowToCard icon={<Target size={28} className="text-[#5C80AD]" />} title="1. Choose" description="Select an arena and predict an outcome." />
      <HowToCard icon={<Shield size={28} className="text-[#5C80AD]" />} title="2. Secure" description="Your stake is locked on-chain and protected against volatility." />
      <HowToCard icon={<TrophyIcon size={28} className="text-[#5C80AD]" />} title="3. Win" description="Receive instant rewards and exclusive NFT trophies." />
    </div>
  </div>
);

const EngagementCard = ({ icon, title, description, action, href }) => (
  <motion.div 
    className="bg-white/5 p-4 rounded-lg border border-white/10 text-center"
    whileHover={{ y: -4, boxShadow: "0px 8px 24px rgba(92, 128, 173, 0.3)" }}
    whileTap={{ scale: 0.98 }}
  >
    <motion.div 
      className="flex justify-center mb-3"
      whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.2, type: 'spring', stiffness: 100 } }}
    >
      {icon}
    </motion.div>
    <h3 className="text-base font-semibold text-[#5C80AD] mb-2">{title}</h3>
    <p className="text-xs text-gray-400 mb-3">{description}</p>
    <Link
      href={href}
      className="inline-block px-4 py-3 bg-[#5C80AD] text-white rounded-md text-sm font-medium hover:bg-[#4A8FE7] hover:shadow-[#5C80AD]/30 focus:ring-2 focus:ring-[#5C80AD] focus:outline-none transition-all duration-200 min-h-[44px]"
    >
      {action}
    </Link>
  </motion.div>
);

const HowToCard = ({ icon, title, description }) => (
  <motion.div 
    className="bg-white/5 p-6 rounded-lg border border-white/10" 
    whileHover={{ y: -4, boxShadow: "0px 8px 24px rgba(92, 128, 173, 0.3)" }}
    whileTap={{ scale: 0.98 }}
  >
    <motion.div 
      className="mb-3"
      whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.2, type: 'spring', stiffness: 100 } }}
    >
      {icon}
    </motion.div>
    <h3 className="text-base font-semibold text-[#5C80AD] mb-2">{title}</h3>
    <p className="text-xs text-gray-400">{description}</p>
  </motion.div>
);

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <motion.div
      className="fixed inset-0 bg-[#0a0b1e]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-md bg-[#0a0b1e]/90 border border-white/10 rounded-lg shadow-2xl shadow-[#5C80AD]/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, type: 'spring', stiffness: 100 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#5C80AD]">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-[#5C80AD] text-2xl focus:outline-none focus:ring-2 focus:ring-[#5C80AD] rounded-md w-8 h-8 flex items-center justify-center" aria-label="Close modal">×</button>
          </div>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

const PredictionArenaModal = ({ arena, onClose, currentUser }) => {
  const { transactionState, setTransactionState, enterSeasonal } = useSimulatedContract(currentUser);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const hasEnoughFanTokensForFreeInsurance = currentUser.fanTokens >= arena.freeInsuranceThreshold;
  const [withInsurance, setWithInsurance] = useState(hasEnoughFanTokensForFreeInsurance);
  const insuranceCost = (withInsurance && !hasEnoughFanTokensForFreeInsurance) ? arena.insuranceFee : 0;
  const totalCost = arena.entryFeeCHZ + insuranceCost;
  const handlePlaceBet = async () => await enterSeasonal(arena, selectedOutcome, withInsurance);

  useEffect(() => {
    if (transactionState === 'success' || transactionState === 'error') {
      const timer = setTimeout(() => {
        setTransactionState('idle');
        if (transactionState === 'success') onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transactionState, setTransactionState, onClose]);

  return (
    <Modal isOpen={true} onClose={onClose} title={arena.title}>
      <p className="text-sm text-gray-400 mb-4">{arena.subtitle}</p>
      {arena.protectionTriggered && (
        <div className="inline-flex items-center gap-2 text-xs text-[#5C80AD] bg-[#5C80AD]/10 px-3 py-1 rounded-full mb-4">
          <ShieldCheck size={14} /> Volatility Protection Active
        </div>
      )}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white">1. Choose an Outcome</h4>
        <div className="grid grid-cols-2 gap-2">
          {arena.outcomes.map((o, i) => (
            <button
              key={i}
              onClick={() => setSelectedOutcome(o)}
              className={`p-3 text-sm rounded-md border border-white/10 transition-all ${
                selectedOutcome === o ? 'bg-[#5C80AD] text-white' : 'bg-white/5 text-white hover:bg-white/10'
              } focus:ring-2 focus:ring-[#5C80AD] focus:outline-none`}
            >
              {o}
            </button>
          ))}
        </div>
        <h4 className="text-sm font-medium text-white">2. Configure Entry</h4>
        <div className="bg-white/5 p-4 rounded-lg space-y-3 border border-white/10">
          <div className="flex justify-between items-center">
            <label htmlFor="insurance-toggle" className="flex items-center gap-2 cursor-pointer">
              <ShieldCheck size={16} className={withInsurance ? "text-[#5C80AD]" : "text-gray-400"} />
              <span className="text-sm text-white">Volatility Insurance</span>
              {hasEnoughFanTokensForFreeInsurance && (
                <span className="text-xs text-[#5C80AD] bg-[#5C80AD]/20 px-2 rounded-full">FREE</span>
              )}
            </label>
            <button
              onClick={() => setWithInsurance(!withInsurance)}
              disabled={hasEnoughFanTokensForFreeInsurance}
              className={`relative w-10 h-5 rounded-full transition-colors ${withInsurance ? 'bg-[#5C80AD]' : 'bg-white/20'} focus:ring-2 focus:ring-[#5C80AD] focus:outline-none`}
              aria-label="Toggle volatility insurance"
              aria-checked={withInsurance}
              role="switch"
            >
              <span
                className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                  withInsurance ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>
          <div className="border-t border-white/10 my-2"></div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Entry Fee:</span>
            <span className="font-medium text-white">{arena.entryFeeCHZ} CHZ</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Insurance:</span>
            <span className="font-medium text-white">{insuranceCost} CHZ</span>
          </div>
          <div className="flex justify-between text-base font-medium text-white" id="bet-total-cost">
            <span>Total:</span>
            <span>{totalCost.toFixed(2)} CHZ</span>
          </div>
        </div>
        <button
          onClick={handlePlaceBet}
          disabled={!selectedOutcome || transactionState === 'pending'}
          className="w-full py-3 rounded-md font-medium bg-[#5C80AD] text-white flex items-center justify-center gap-2 hover:bg-[#4A8FE7] disabled:bg-white/10 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#5C80AD] focus:outline-none transition-all duration-200 min-h-[44px]"
          aria-describedby="bet-total-cost"
        >
          {transactionState === 'pending' && <Loader2 className="animate-spin" size={18} />}
          {transactionState === 'success' && <CheckCircle size={18} />}
          {transactionState === 'error' && <AlertCircle size={18} />}
          {transactionState === 'idle' && 'Place Bet'}
          {transactionState === 'pending' && 'Processing...'}
          {transactionState === 'success' && 'Success!'}
          {transactionState === 'error' && 'Failed - Retry'}
        </button>
      </div>
    </Modal>
  );
};

const FactionBattleModal = ({ faction, onClose, currentUser }) => {
  const { transactionState, setTransactionState, enterSeasonal } = useSimulatedContract(currentUser);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const hasEnoughFanTokensForFreeInsurance = currentUser.fanTokens >= faction.freeInsuranceThreshold;
  const [withInsurance, setWithInsurance] = useState(hasEnoughFanTokensForFreeInsurance);
  const insuranceCost = (withInsurance && !hasEnoughFanTokensForFreeInsurance) ? faction.insuranceFee : 0;
  const totalCost = faction.entryFeeCHZ + insuranceCost;
  const handleJoinBattle = async () => await enterSeasonal(faction, selectedOutcome, withInsurance);

  useEffect(() => {
    if (transactionState === 'success' || transactionState === 'error') {
      const timer = setTimeout(() => {
        setTransactionState('idle');
        if (transactionState === 'success') onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transactionState, setTransactionState, onClose]);

  return (
    <Modal isOpen={true} onClose={onClose} title={faction.title}>
      <div className="flex items-center justify-center mb-4">
        <motion.div
          className="flex items-center gap-3"
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            <Swords size={32} className="text-[#ff6b35]" />
          </motion.div>
          <motion.span
            className="text-lg font-bold"
            animate={{
              color: ['#ff6b35', '#ff8c00', '#ff4500', '#ff6b35']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            FACTION BATTLE
          </motion.span>
        </motion.div>
      </div>
      <p className="text-sm text-gray-400 mb-4 text-center">{faction.subtitle}</p>
      {faction.protectionTriggered && (
        <div className="inline-flex items-center gap-2 text-xs text-[#5C80AD] bg-[#5C80AD]/10 px-3 py-1 rounded-full mb-4">
          <ShieldCheck size={14} /> Volatility Protection Active
        </div>
      )}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-white">1. Choose Your Side</h4>
        <div className="grid grid-cols-1 gap-2">
          {faction.outcomes.map((o, i) => (
            <button
              key={i}
              onClick={() => setSelectedOutcome(o)}
              className={`p-3 text-sm rounded-md border transition-all ${
                selectedOutcome === o 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white border-red-400' 
                  : 'bg-white/5 text-white hover:bg-white/10 border-white/10'
              } focus:ring-2 focus:ring-red-400 focus:outline-none`}
            >
              {o}
            </button>
          ))}
        </div>
        <button
          onClick={handleJoinBattle}
          disabled={!selectedOutcome || transactionState === 'pending'}
          className="w-full py-3 rounded-md font-medium bg-gradient-to-r from-red-500 to-orange-500 text-white flex items-center justify-center gap-2 hover:from-red-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-red-400 focus:outline-none transition-all duration-200 min-h-[44px]"
        >
          {transactionState === 'pending' && <Loader2 className="animate-spin" size={18} />}
          {transactionState === 'success' && <CheckCircle size={18} />}
          {transactionState === 'error' && <AlertCircle size={18} />}
          {transactionState === 'idle' && 'Join Battle'}
          {transactionState === 'pending' && 'Processing...'}
          {transactionState === 'success' && 'Battle Joined!'}
          {transactionState === 'error' && 'Failed - Retry'}
        </button>
      </div>
    </Modal>
  );
};

const NftRaffleModal = ({ raffle, onClose, currentUser }) => {
  const { transactionState, setTransactionState, enterRaffle } = useSimulatedContract(currentUser);
  const canEnter = currentUser.points >= raffle.requiredPoints && currentUser.fanTokens >= raffle.requiredFanTokens;
  const handleParticipate = async () => await enterRaffle(raffle);

  useEffect(() => {
    if (transactionState === 'success' || transactionState === 'error') {
      const timer = setTimeout(() => {
        setTransactionState('idle');
        if (transactionState === 'success') onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transactionState, setTransactionState, onClose]);

  return (
    <Modal isOpen={true} onClose={onClose} title={raffle.title}>
      <div className="flex items-center justify-center mb-6">
        <motion.div
          className="relative"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <Image
            src="/nft.png"
            alt="NFT Prize"
            width={120}
            height={120}
            className="rounded-lg shadow-2xl shadow-[#5C80AD]/50"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-[#5C80AD]/30 via-transparent to-[#4A8FE7]/20 rounded-lg"
            animate={{
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
      <p className="text-sm text-gray-400 mb-4 text-center">{raffle.subtitle}</p>
      <div className="bg-white/5 p-4 rounded-lg space-y-2 mb-4 border border-white/10" id="raffle-requirements">
        <h4 className="text-sm font-medium text-white mb-2">Requirements to Participate:</h4>
        <div className={`flex justify-between text-sm ${currentUser.points >= raffle.requiredPoints ? 'text-[#5C80AD]' : 'text-red-500'}`}>
          <span>{raffle.requiredPoints.toLocaleString()} Points Required</span>
          {currentUser.points >= raffle.requiredPoints && <CheckCircle size={14} />}
        </div>
        <div className={`flex justify-between text-sm ${currentUser.fanTokens >= raffle.requiredFanTokens ? 'text-[#5C80AD]' : 'text-red-500'}`}>
          <span>{raffle.requiredFanTokens.toLocaleString()} Fan Tokens Required</span>
          {currentUser.fanTokens >= raffle.requiredFanTokens && <CheckCircle size={14} />}
        </div>
      </div>
      <p className="text-xs text-center text-gray-400 mb-4">Participation requires a signature to verify your holdings.</p>
      <button
        onClick={handleParticipate}
        disabled={!canEnter || transactionState === 'pending'}
        className="w-full py-3 rounded-md font-medium bg-[#5C80AD] text-white flex items-center justify-center gap-2 hover:bg-[#4A8FE7] disabled:bg-white/10 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#5C80AD] focus:outline-none transition-all duration-200 min-h-[44px]"
        aria-describedby="raffle-requirements"
      >
        {transactionState === 'pending' && <Loader2 className="animate-spin" size={18} />}
        {transactionState === 'success' && <CheckCircle size={18} />}
        {transactionState === 'error' && <AlertCircle size={18} />}
        {transactionState === 'idle' && 'Enter Raffle'}
        {transactionState === 'pending' && 'Processing...'}
        {transactionState === 'success' && 'Entered!'}
        {transactionState === 'error' && 'Failed'}
      </button>
    </Modal>
  );
};

export default function Coliseum() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [eventSort, setEventSort] = useState('default');

  const filteredEvents = eventFilter === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.type === eventFilter);

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (eventSort === 'chzPot') {
      return (b.chzPot || 0) - (a.chzPot || 0);
    } else if (eventSort === 'timeLeft') {
      const timeA = a.timeLeft ? parseTimeLeft(a.timeLeft) : a.deadline || Infinity;
      const timeB = b.timeLeft ? parseTimeLeft(b.timeLeft) : b.deadline || Infinity;
      return timeA - timeB;
    }
    return 0;
  });

  const handleSelectEvent = (event) => {
    if (event.isResolved) return;
    setSelectedEvent(event);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <header className="text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Welcome to the <span className="text-[#5C80AD]">Coliseum</span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-300 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Where champions predict, stake, and win. Experience the future of sports engagement with blockchain-powered arenas.
          </motion.p>
        </header>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <UserProfileDashboard user={userProfile} />
        </motion.section>

        <section>
          <h2 className="text-xl font-semibold text-[#5C80AD] mb-4">Ongoing Coliseum Events</h2>
          <EventFilters
            onFilterChange={setEventFilter}
            onSortChange={setEventSort}
            filter={eventFilter}
            sort={eventSort}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedEvents.map(event => (
              <EventCard key={event.id} event={event} onSelect={handleSelectEvent} />
            ))}
          </div>
        </section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.8 }} 
          className="pb-12"
        >
          <HowItWorks />
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Sponsors />
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <FanEngagementHub />
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <PlatformStats />
        </motion.section>
      </main>

      <AnimatePresence>
        {selectedEvent?.type === 'Prediction' && (
          <PredictionArenaModal arena={selectedEvent} onClose={() => setSelectedEvent(null)} currentUser={userProfile} />
        )}
        {selectedEvent?.type === 'Faction' && (
          <FactionBattleModal faction={selectedEvent} onClose={() => setSelectedEvent(null)} currentUser={userProfile} />
        )}
        {selectedEvent?.type === 'Raffle' && (
          <NftRaffleModal raffle={selectedEvent} onClose={() => setSelectedEvent(null)} currentUser={userProfile} />
        )}
      </AnimatePresence>
    </div>
  );
}