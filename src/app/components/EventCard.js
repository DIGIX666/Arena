// components/EventCard.js
import { memo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Ticket, Target, ShieldCheck, Zap } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

const EventCard = memo(({ event, onSelect }) => {
  const theme = event.type === 'Prediction' 
    ? { color: 'text-[#21A179]', bgColor: 'bg-[#F5F5F5]/10', borderColor: 'border-[#21A179]/50' }
    : event.type === 'Raffle'
    ? { color: 'text-[#F5F5F5]', bgColor: 'bg-[#F5F5F5]/10', borderColor: 'border-[#21A179]/50' }
    : { color: 'text-[#FFD700]', bgColor: 'bg-[#F5F5F5]/10', borderColor: 'border-[#FFD700]/50' };

  return (
    <motion.div
      onClick={() => onSelect(event)}
      className={`cursor-pointer rounded-xl p-5 relative overflow-hidden ${theme.bgColor} border ${theme.borderColor} hover:shadow-lg hover:shadow-[#21A179]/30 transition-all duration-300`}
      whileHover={{ scale: 1.03, rotate: 1 }}
      whileTap={{ scale: 0.98 }}
    >
      {(event.isResolved || event.isCanceled) && (
        <div className="absolute inset-0 bg-[#282828]/70 flex items-center justify-center text-lg font-semibold text-[#F5F5F5] z-10">
          {event.isResolved ? 'TERMINÉ' : 'ANNULÉ'}
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className={`inline-flex items-center gap-2 mb-2 text-xs font-medium ${theme.color}`}>
            {event.type === 'Prediction' ? <Trophy size={14} /> : event.type === 'Raffle' ? <Ticket size={14} /> : <Target size={14} />}
            {event.type === 'Prediction' ? 'Arène de prédiction' : event.type === 'Raffle' ? 'Tirage NFT' : 'Duel'}
          </div>
          <h3 className="text-base font-semibold text-[#FFD700]">{event.title}</h3>
          <p className="text-xs text-[#282828]">{event.subtitle}</p>
          <div className="mt-2">
            <CountdownTimer deadline={event.deadline} />
          </div>
        </div>
        {event.protectionTriggered && (
          <ShieldCheck className="text-[#FFD700]" title="Protection contre la volatilité activée" size={18} />
        )}
      </div>
      {event.type !== 'Raffle' && (
        <div className="flex justify-between text-xs text-[#282828] mb-4">
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-[#21A179]" />
            <span>{(event.chzPot || event.potTotal).toLocaleString()} CHZ</span>
          </div>
          {event.usdcPot && (
            <div className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-[#F5F5F5]" />
              <span>{event.usdcPot.toLocaleString()} USDC</span>
            </div>
          )}
        </div>
      )}
      <button
        className={`w-full py-2 mt-4 rounded-md text-sm font-medium text-[#1A2238] bg-[#21A179] hover:bg-[#FFD700] hover:shadow-[#FFD700]/30 focus:ring-2 focus:ring-[#21A179] focus:outline-none transition-all duration-200 ${(event.isResolved || event.isCanceled) ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={event.isResolved || event.isCanceled}
      >
        {event.isResolved || event.isCanceled ? 'Voir les résultats' : event.type === 'Prediction' ? 'Entrer dans l’arène' : event.type === 'Raffle' ? 'Participer' : 'Placer un pari'}
      </button>
    </motion.div>
  );
});

export default EventCard;
