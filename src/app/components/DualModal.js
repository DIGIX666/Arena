// components/DuelModal.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import Modal from './Modal';

const DuelModal = ({ duel, onClose, currentUser }) => {
  const { transactionState, setTransactionState, placeDuelBet } = useContract(currentUser);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [betAmount, setBetAmount] = useState('');

  const handlePlaceBet = async () => {
    if (!selectedOutcome || !betAmount) {
      alert('Veuillez sélectionner un résultat et entrer un montant.');
      return;
    }
    const outcomeIndex = duel.outcomes.indexOf(selectedOutcome);
    await placeDuelBet(duel.id, outcomeIndex, betAmount);
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
    <Modal isOpen={true} onClose={onClose} title={duel.title}>
      <p className="text-sm text-[#282828] mb-4">{duel.subtitle}</p>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[#F5F5F5]">1. Choisir un résultat</h4>
        <div className="grid grid-cols-2 gap-2">
          {duel.outcomes.map((o, i) => (
            <button
              key={i}
              onClick={() => setSelectedOutcome(o)}
              className={`p-3 text-sm rounded-md border border-[#21A179]/50 transition-all ${
                selectedOutcome === o ? 'bg-[#21A179] text-[#1A2238]' : 'bg-[#282828] text-[#F5F5F5] hover:bg-[#282828]/70'
              } focus:ring-2 focus:ring-[#21A179] focus:outline-none`}
            >
              {o}
            </button>
          ))}
        </div>
        <h4 className="text-sm font-medium text-[#F5F5F5]">2. Entrer le montant du pari</h4>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Montant en CHZ (1-10000)"
          className="w-full p-3 rounded-md bg-[#282828] text-[#F5F5F5] border border-[#21A179]/50 focus:ring-2 focus:ring-[#21A179] focus:outline-none"
        />
        <button
          onClick={handlePlaceBet}
          disabled={!selectedOutcome || !betAmount || transactionState === 'pending'}
          className="w-full py-3 rounded-md font-medium bg-[#21A179] text-[#1A2238] flex items-center justify-center gap-2 hover:bg-[#FFD700] disabled:bg-[#282828] disabled:text-[#F5F5F5] disabled:cursor-not-allowed focus:ring-2 focus:ring-[#21A179] focus:outline-none transition-all duration-200"
        >
          {transactionState === 'pending' && <Loader2 className="animate-spin" size={18} />}
          {transactionState === 'success' && <CheckCircle size={18} />}
          {transactionState === 'error' && <AlertCircle size={18} />}
          {transactionState === 'idle' && 'Placer le pari'}
          {transactionState === 'pending' && 'En cours...'}
          {transactionState === 'success' && 'Succès !'}
          {transactionState === 'error' && 'Échec - Réessayer'}
        </button>
      </div>
    </Modal>
  );
};

export default DuelModal;
