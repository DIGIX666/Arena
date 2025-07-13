"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, memo, Suspense, useRef } from 'react';
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
  achievements: ['First Duel Winner', 'Football Oracle', 'Streak Master'],
  seasonalRank: 'Diamond',
  totalWinnings: 23450.89,
  protectionTriggered: 2,
  winStreak: 7
};

const adminDuelsData = [
  {
    id: 1,
    type: 'Duel',
    title: "PSG vs Chelsea",
    subtitle: "Premier League Showdown",
    teams: [
      { id: 'psg', name: 'PSG', logo: '/psg.png', color: '#004C98' },
      { id: 'chelsea', name: 'Chelsea', logo: '/chelsea.png', color: '#034694' }
    ],
    outcomes: ["PSG Victory", "Chelsea Victory", "Draw"],
    chzPot: 500000,
    usdcPot: 200000,
    entryFeeCHZ: 100,
    insuranceFee: 10,
    minFanTokens: 1000,
    freeInsuranceThreshold: 3000,
    timeLeft: "48h 30m",
    participants: 5432,
    protectionTriggered: false,
    isResolved: false,
    rewardMultiplier: 2.5
  },
  {
    id: 2,
    type: 'Duel',
    title: "Real Madrid vs Barcelona",
    subtitle: "El Clásico Battle",
    teams: [
      { id: 'real-madrid', name: 'Real Madrid', logo: '/real-madrid.png', color: '#FFFFFF' },
      { id: 'barcelona', name: 'Barcelona', logo: '/barcelona.png', color: '#A50044' }
    ],
    outcomes: ["Real Madrid Victory", "Barcelona Victory", "Draw"],
    chzPot: 750000,
    usdcPot: 300000,
    entryFeeCHZ: 150,
    insuranceFee: 15,
    minFanTokens: 1500,
    freeInsuranceThreshold: 4000,
    timeLeft: "72h 15m",
    participants: 8765,
    protectionTriggered: true,
    isResolved: false,
    rewardMultiplier: 3.0
  },
];

const platformMetrics = {
  totalCHZLocked: 1847392,
  totalDuels: 45,
  activeDuels: 23,
  resolvedDuels: 22,
  totalParticipants: 18234,
  avgMultiplier: 2.8,
  successfulPayouts: 156,
  totalUsers: 12847,
  fanTokenHolders: 8934
};

const useSimulatedContract = (user) => {
  const [transactionState, setTransactionState] = useState('idle');

  const createDuel = async (team1, team2, stakeAmount) => {
    setTransactionState('pending');
    const duelCreationFee = user.fanTokens >= 100 ? 0 : 10;
    const totalCost = stakeAmount + duelCreationFee + 0.1;
    if (user.chzBalance < totalCost) {
      setTransactionState('error');
      return;
    }
    await new Promise(res => setTimeout(res, 2000));
    setTransactionState('success');
  };

  const joinDuel = async (duel, outcome, withInsurance) => {
    setTransactionState('pending');
    const insuranceCost = (withInsurance && user.fanTokens < duel.freeInsuranceThreshold) ? duel.insuranceFee : 0;
    const totalCost = duel.entryFeeCHZ + insuranceCost;
    if (user.chzBalance < totalCost) {
      setTransactionState('error');
      return;
    }
    await new Promise(res => setTimeout(res, 2000));
    setTransactionState('success');
  };

  return { transactionState, setTransactionState, createDuel, joinDuel };
};

const Navbar = () => (
  <nav className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4 bg-[#0a0b1e]/90 backdrop-blur-md border-b border-[#5C80AD]/30">
    <div className="flex items-center justify-between max-w-7xl mx-auto">
      <div className="text-2xl font-bold text-white">
        ARENA DUELS
      </div>
      <div className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Home</Link>
        <Link href="/coliseum" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Coliseum</Link>
        <Link href="/duel" className="text-[#5C80AD] font-medium">Duels</Link>
        <Link href="#" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Rankings</Link>
        <Link href="#" className="text-gray-300 hover:text-[#5C80AD] transition-colors duration-200 font-medium">Profile</Link>
      </div>
      <button className="px-6 py-2 bg-[#5C80AD] text-white rounded-md hover:bg-[#4A8FE7] transition-colors duration-200 font-semibold">
        Connect Wallet
      </button>
    </div>
  </nav>
);

const UserDashboard = ({ user }) => (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold text-[#5C80AD] mb-6">Your Arena Stats</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard icon={<Award size={18} className="text-[#5C80AD]" />} label="Points" value={user.points.toLocaleString()} />
      <StatCard icon={<Star size={18} className="text-white" />} label="Fan Tokens" value={user.fanTokens.toLocaleString()} />
      <StatCard icon={<Zap size={18} className="text-[#5C80AD]" />} label="CHZ Balance" value={user.chzBalance.toFixed(2)} />
      <StatCard icon={<Trophy size={18} className="text-yellow-400" />} label="Win Streak" value={user.winStreak} />
    </div>
  </div>
);

const StatCard = ({ icon, label, value }) => (
  <motion.div 
    className="bg-white/5 p-4 rounded-lg flex items-center gap-3 hover:bg-white/10 transition-all duration-200"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="p-2 bg-[#5C80AD]/20 rounded-full">{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
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

const DuelCard = memo(function DuelCard({ duel, onSelect }) {
  const theme = {
    color: 'text-[#5C80AD]',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10'
  };

  return (
    <motion.div
      onClick={() => onSelect(duel)}
      className={`cursor-pointer rounded-xl p-5 relative overflow-hidden ${theme.bgColor} border ${theme.borderColor} hover:shadow-lg hover:shadow-[#5C80AD]/30 transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
      whileHover={{ scale: 1.03, rotate: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      {duel.isResolved && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-lg font-semibold text-white z-10">ENDED</div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-medium text-[#5C80AD]">
            <Swords size={14} />
            Duel Arena
          </div>
          <h3 className="text-base font-semibold text-[#5C80AD]">{duel.title}</h3>
          <p className="text-xs text-gray-400">{duel.subtitle}</p>
          <div className="mt-2">
            <CountdownTimer deadline={Date.now() + parseTimeLeft(duel.timeLeft)} />
          </div>
        </div>
        {duel.protectionTriggered && (
          <ShieldCheck className="text-[#5C80AD] flex-shrink-0" title="Volatility Protection Active" size={18} />
        )}
      </div>
      
      <div className="flex justify-between items-center mb-4">
        {duel.teams.map((team, index) => (
          <div key={team.id} className="text-center">
            <Image
              src={team.logo}
              alt={team.name}
              width={50}
              height={50}
              className="mx-auto mb-2"
            />
            <p className="text-xs font-semibold" style={{ color: team.color }}>{team.name}</p>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <Zap size={12} className="text-[#5C80AD]" />
          <span>{duel.chzPot.toLocaleString()} CHZ</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-white" />
          <span>{duel.usdcPot.toLocaleString()} USDC</span>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="text-xs text-gray-400 mb-1">CHZ Prize Pool</div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div
            className="bg-[#5C80AD] h-1.5 rounded-full transition-all duration-300 animate-pulse"
            style={{ width: `${Math.min((duel.chzPot / 1000000) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <button
        className={`w-full py-3 mt-4 rounded-md text-sm font-medium text-white bg-[#5C80AD] hover:bg-[#4A8FE7] hover:shadow-[#5C80AD]/30 transition-all duration-200 ${duel.isResolved ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={duel.isResolved}
      >
        {duel.isResolved ? 'View Results' : 'Join Duel'}
      </button>
    </motion.div>
  );
});

const DuelJoinModal = ({ duel, onClose, currentUser }) => {
  const { transactionState, setTransactionState, joinDuel } = useSimulatedContract(currentUser);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const hasEnoughFanTokensForFreeInsurance = currentUser.fanTokens >= duel.freeInsuranceThreshold;
  const [withInsurance, setWithInsurance] = useState(hasEnoughFanTokensForFreeInsurance);
  const insuranceCost = (withInsurance && !hasEnoughFanTokensForFreeInsurance) ? duel.insuranceFee : 0;
  const totalCost = duel.entryFeeCHZ + insuranceCost;
  const handleJoinDuel = async () => await joinDuel(duel, selectedOutcome, withInsurance);

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
            <h2 className="text-lg font-semibold text-[#5C80AD]">{duel.title}</h2>
            <button onClick={onClose} className="text-white hover:text-[#5C80AD] text-2xl focus:outline-none focus:ring-2 focus:ring-[#5C80AD] rounded-md w-8 h-8 flex items-center justify-center" aria-label="Close modal">×</button>
          </div>
          <p className="text-sm text-gray-400 mb-4">{duel.subtitle}</p>
          {duel.protectionTriggered && (
            <div className="inline-flex items-center gap-2 text-xs text-[#5C80AD] bg-[#5C80AD]/10 px-3 py-1 rounded-full mb-4">
              <ShieldCheck size={14} /> Volatility Protection Active
            </div>
          )}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-white">1. Choose an Outcome</h4>
            <div className="grid grid-cols-2 gap-2">
              {duel.outcomes.map((o, i) => (
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
                <span className="font-medium text-white">{duel.entryFeeCHZ} CHZ</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Insurance:</span>
                <span className="font-medium text-white">{insuranceCost} CHZ</span>
              </div>
              <div className="flex justify-between text-base font-medium text-white" id="duel-total-cost">
                <span>Total:</span>
                <span>{totalCost.toFixed(2)} CHZ</span>
              </div>
            </div>
            <button
              onClick={handleJoinDuel}
              disabled={!selectedOutcome || transactionState === 'pending'}
              className="w-full py-3 rounded-md font-medium bg-[#5C80AD] text-white flex items-center justify-center gap-2 hover:bg-[#4A8FE7] disabled:bg-white/10 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-2 focus:ring-[#5C80AD] focus:outline-none transition-all duration-200 min-h-[44px]"
              aria-describedby="duel-total-cost"
            >
              {transactionState === 'pending' && <Loader2 className="animate-spin" size={18} />}
              {transactionState === 'success' && <CheckCircle size={18} />}
              {transactionState === 'error' && <AlertCircle size={18} />}
              {transactionState === 'idle' && 'Join Duel'}
              {transactionState === 'pending' && 'Processing...'}
              {transactionState === 'success' && 'Joined!'}
              {transactionState === 'error' && 'Failed - Retry'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const DragDropArena = ({ onCreateDuel }) => {
  const [draggedTeam, setDraggedTeam] = useState(null);
  const [isInCenter, setIsInCenter] = useState(false);
  const [showDuelPopup, setShowDuelPopup] = useState(false);
  const [duelTeams, setDuelTeams] = useState({ team1: null, team2: null });
  const dropZoneRef = useRef(null);

  const teams = [
    { id: 'psg', name: 'PSG', logo: '/psg.png', color: '#004C98' },
    { id: 'chelsea', name: 'Chelsea', logo: '/chelsea.png', color: '#034694' }
  ];

  const handleDragStart = (team) => {
    setDraggedTeam(team);
  };

  const handleDragEnd = () => {
    setDraggedTeam(null);
    setIsInCenter(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const rect = dropZoneRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      );
      setIsInCenter(distance < 100);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (isInCenter && draggedTeam) {
      const otherTeam = teams.find(team => team.id !== draggedTeam.id);
      setDuelTeams({ team1: draggedTeam, team2: otherTeam });
      setShowDuelPopup(true);
    }
    handleDragEnd();
  };

  return (
    <>
      <div className="bg-white/5 rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-semibold text-[#5C80AD] mb-6 text-center">Create Epic Duel</h2>
        <p className="text-center text-gray-400 mb-8">Drag the team logos to the center arena to create an epic duel!</p>
        
        <div className="flex justify-between items-center relative h-64">
          <motion.div
            className="cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={() => handleDragStart(teams[0])}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2, rotate: 15 }}
          >
            <div className="bg-white/10 p-4 rounded-full border-2 border-[#004C98]/50 hover:border-[#004C98] transition-all">
              <Image
                src="/psg.png"
                alt="PSG"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <p className="text-center mt-2 text-[#004C98] font-semibold">PSG</p>
          </motion.div>

          <div
            ref={dropZoneRef}
            className={`flex-1 mx-8 h-48 border-4 border-dashed rounded-full flex items-center justify-center transition-all duration-300 ${
              isInCenter 
                ? 'border-[#5C80AD] bg-[#5C80AD]/20 scale-110' 
                : 'border-white/30 bg-white/5'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <motion.div
              className="text-center"
              animate={isInCenter ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isInCenter ? Infinity : 0 }}
            >
              <Swords 
                size={48} 
                className={`mx-auto mb-2 ${isInCenter ? 'text-[#5C80AD]' : 'text-white/40'}`} 
              />
              <p className={`font-semibold ${isInCenter ? 'text-[#5C80AD]' : 'text-white/40'}`}>
                {isInCenter ? 'Release to Create Duel!' : 'Duel Arena'}
              </p>
            </motion.div>
          </div>

          <motion.div
            className="cursor-grab active:cursor-grabbing"
            draggable
            onDragStart={() => handleDragStart(teams[1])}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.1 }}
            whileDrag={{ scale: 1.2, rotate: -15 }}
          >
            <div className="bg-white/10 p-4 rounded-full border-2 border-[#034694]/50 hover:border-[#034694] transition-all">
              <Image
                src="/chelsea.png"
                alt="Chelsea"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <p className="text-center mt-2 text-[#034694] font-semibold">Chelsea</p>
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Drag and drop team logos to the center arena to initiate an epic duel
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showDuelPopup && (
          <DuelCreationModal
            team1={duelTeams.team1}
            team2={duelTeams.team2}
            onClose={() => setShowDuelPopup(false)}
            onCreateDuel={onCreateDuel}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const DuelCreationModal = ({ team1, team2, onClose, onCreateDuel }) => {
  const { transactionState, setTransactionState, createDuel } = useSimulatedContract(userProfile);
  const [stakeAmount, setStakeAmount] = useState(100);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [withInsurance, setWithInsurance] = useState(false);

  const handleCreateDuel = async () => {
    if (!selectedTeam) return;
    await createDuel(selectedTeam, stakeAmount);
    if (onCreateDuel) onCreateDuel();
  };

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
    <motion.div
      className="fixed inset-0 bg-[#0a0b1e]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-md bg-[#0a0b1e]/90 border border-white/10 rounded-lg shadow-2xl shadow-[#5C80AD]/20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#5C80AD]">Create Duel</h2>
            <button onClick={onClose} className="text-white hover:text-[#5C80AD] text-2xl">×</button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-6">
              <motion.div
                className="text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Image
                  src={team1?.logo}
                  alt={team1?.name}
                  width={60}
                  height={60}
                  className="mx-auto mb-2"
                />
                <p className="font-semibold" style={{ color: team1?.color }}>{team1?.name}</p>
              </motion.div>
              
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Swords size={32} className="text-[#5C80AD]" />
              </motion.div>
              
              <motion.div
                className="text-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                <Image
                  src={team2?.logo}
                  alt={team2?.name}
                  width={60}
                  height={60}
                  className="mx-auto mb-2"
                />
                <p className="font-semibold" style={{ color: team2?.color }}>{team2?.name}</p>
              </motion.div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-3">Choose Your Champion</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedTeam(team1)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedTeam?.id === team1?.id
                      ? 'border-[#5C80AD] bg-[#5C80AD]/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Image
                    src={team1?.logo}
                    alt={team1?.name}
                    width={40}
                    height={40}
                    className="mx-auto mb-2"
                  />
                  <p className="text-sm font-semibold">{team1?.name}</p>
                </button>
                <button
                  onClick={() => setSelectedTeam(team2)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedTeam?.id === team2?.id
                      ? 'border-[#5C80AD] bg-[#5C80AD]/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Image
                    src={team2?.logo}
                    alt={team2?.name}
                    width={40}
                    height={40}
                    className="mx-auto mb-2"
                  />
                  <p className="text-sm font-semibold">{team2?.name}</p>
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-3">Stake Amount</h4>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(parseInt(e.target.value))}
                  className="w-full mb-3 accent-[#5C80AD]"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>50 CHZ</span>
                  <span className="text-[#5C80AD] font-semibold">{stakeAmount} CHZ</span>
                  <span>1000 CHZ</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <ShieldCheck size={16} className={withInsurance ? "text-[#5C80AD]" : "text-gray-400"} />
                  <span className="text-sm text-white">Volatility Insurance</span>
                </label>
                <button
                  onClick={() => setWithInsurance(!withInsurance)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    withInsurance ? 'bg-[#5C80AD]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      withInsurance ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={handleCreateDuel}
              disabled={!selectedTeam || transactionState === 'pending'}
              className="w-full py-3 rounded-md font-medium bg-gradient-to-r from-[#5C80AD] to-[#4A8FE7] text-white flex items-center justify-center gap-2 hover:from-[#4A8FE7] hover:to-[#5C80AD] disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200"
            >
              {transactionState === 'pending' && <Loader2 className="animate-spin" size={18} />}
              {transactionState === 'success' && <CheckCircle size={18} />}
              {transactionState === 'error' && <AlertCircle size={18} />}
              {transactionState === 'idle' && <Crown size={18} />}
              {transactionState === 'idle' && 'Create Epic Duel'}
              {transactionState === 'pending' && 'Creating Duel...'}
              {transactionState === 'success' && 'Duel Created!'}
              {transactionState === 'error' && 'Failed - Retry'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PlatformStats = () => (
  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
    <h2 className="text-xl font-semibold text-[#5C80AD] mb-6 text-center">Platform Statistics</h2>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
        <div className="text-2xl font-bold text-[#5C80AD]">{platformMetrics.totalCHZLocked.toLocaleString()}</div>
        <div className="text-sm text-gray-400">CHZ Locked</div>
      </motion.div>
      <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
        <div className="text-2xl font-bold text-white">{platformMetrics.activeDuels}</div>
        <div className="text-sm text-gray-400">Active Duels</div>
      </motion.div>
      <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
        <div className="text-2xl font-bold text-[#5C80AD]">{platformMetrics.totalParticipants.toLocaleString()}</div>
        <div className="text-sm text-gray-400">Participants</div>
      </motion.div>
      <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
        <div className="text-2xl font-bold text-white">{platformMetrics.avgMultiplier}x</div>
        <div className="text-sm text-gray-400">Avg Multiplier</div>
      </motion.div>
    </div>
  </div>
);

export default function Duels() {
  const [selectedDuel, setSelectedDuel] = useState(null);
  const [showDragDrop, setShowDragDrop] = useState(false);

  const handleSelectDuel = (duel) => {
    if (duel.isResolved) return;
    setSelectedDuel(duel);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b1e] via-[#1a1b3e] to-[#0a0b1e] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <header className="text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Epic <span className="text-[#5C80AD]">Duels</span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Drag, drop, and duel! Create instant battles between your favorite teams or join epic duels created by admins.
          </motion.p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UserDashboard user={userProfile} />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-[#5C80AD] mb-4">Ongoing Duels</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminDuelsData.map(duel => (
              <DuelCard key={duel.id} duel={duel} onSelect={handleSelectDuel} />
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <button
              onClick={() => setShowDragDrop(!showDragDrop)}
              className="px-6 py-3 bg-[#5C80AD] text-white rounded-md text-sm font-medium hover:bg-[#4A8FE7] transition-all duration-200 focus:ring-2 focus:ring-[#5C80AD] focus:outline-none"
            >
              {showDragDrop ? 'Hide Duel Creator' : 'Create a Duel'}
            </button>
          </div>
          {showDragDrop && (
            <DragDropArena onCreateDuel={() => console.log('Duel created!')} />
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PlatformStats />
        </motion.section>
      </main>

      <AnimatePresence>
        {selectedDuel && (
          <DuelJoinModal duel={selectedDuel} onClose={() => setSelectedDuel(null)} currentUser={userProfile} />
        )}
      </AnimatePresence>
    </div>
  );
}
