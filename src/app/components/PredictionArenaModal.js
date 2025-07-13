// components/PredictionArenaModal.js
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import Modal from './Modal';

const PredictionArenaModal = ({ arena, onClose, currentUser }) => {
  const { transactionState, setTransactionState, enterSeasonal } = useContract(currentUser);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [withInsurance, setWithInsurance] = useState(false);

  const handleEnter = async () => {
    if (!selectedOutcome) {
      alert('Veuillez sélectionner un résultat.');
      return;
    }
    const outcomeIndex = arena.outcomes.indexOf(selectedOutcome);
    await enterSeasonal(arena, outcomeIndex, withInsurance);
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
    <Modal isOpen={true} onClose={onClose} title={arena.title}>
      <p className="text-sm text-[#282828] mb-4">{arena.subtitle}</p>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[#F5F5F5]">1. Choisir un résultat</h4>
        <div className="grid grid-cols-2 gap-2">
          {arena.outcomes.map((o, i) => (
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
        <h4 className="text-sm font-medium text-[#F5F5F5]">2. Assurance contre la volatilité</h4>
        <label className="flex items-center gap-2 text-sm text-[#F5F5F5]">
          <input
            type="checkbox"
            checked={withInsurance}
            onChange={() => setWithInsurance(!withInsurance)}
            className="h-4 w-4 text-[#21A179] focus:ring-[#21A179] border-[#282828]"
          />
          Ajouter l’assurance ({arena.insuranceFee} CHZ)
        </label>
        <button
          onClick={handleEnter}
          disabled={!selectedOutcome || transactionState === 'pending'}
          className="w-full py-3 rounded-md font-medium bg-[#21A179] text-[#1A2238] flex items-center justify-center gap-2 hover:bg-[#FFD700] disabled:bg-[#282828] disabled:text-[#F5F5F5] disabled:cursor-not-allowed focus:ring-2 focus:ring-[#21A179] focus:outline-none transition-all duration-200"
        >
          {transactionState === 'pending' && <Loader2 className="animate-spin" size={18} />}
          {transactionState === 'success' && <CheckCircle size={18} />}
          {transactionState === 'error' && <AlertCircle size={18} />}
          {transactionState === 'idle' && 'Entrer dans l’arène'}
          {transactionState === 'pending' && 'En cours...'}
          {transactionState === 'success' && 'Succès !'}
          {transactionState === 'error' && 'Échec - Réessayer'}
        </button>
      </div>
    </Modal>
  );
};

export default PredictionArenaModal;
