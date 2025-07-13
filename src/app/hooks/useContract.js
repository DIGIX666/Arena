// hooks/useContract.js
import { useState } from 'react';

export const useContract = (user) => {
  const [transactionState, setTransactionState] = useState('idle');

  const simulateTransaction = async (action) => {
    setTransactionState('pending');
    try {
      if (!user) throw new Error('Aucun wallet connecté');
      // Simuler un délai de transaction blockchain
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondes
      // Simuler une vérification d'éligibilité
      if (user.fanTokens < 1000 || user.points < 500) {
        throw new Error('Fonds ou points insuffisants');
      }
      setTransactionState('success');
      console.log(`Simulation de ${action} réussie`);
    } catch (error) {
      setTransactionState('error');
      console.error(`Simulation de ${action} échouée :`, error.message);
    }
  };

  const enterSeasonal = async (arena, outcomeIndex, withInsurance) => {
    await simulateTransaction('enterSeasonal');
  };

  const enterRaffle = async (raffle) => {
    await simulateTransaction('enterRaffle');
  };

  const placeDuelBet = async (duelId, outcomeId, amount) => {
    if (amount <= 0) throw new Error('Montant invalide');
    await simulateTransaction('placeDuelBet');
  };

  return { transactionState, setTransactionState, enterSeasonal, enterRaffle, placeDuelBet };
};
