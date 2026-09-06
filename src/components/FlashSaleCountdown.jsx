import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

const FlashSaleCountdown = ({ endTime, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (onComplete) onComplete();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const result = calculateTimeLeft();
      setTimeLeft(result);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  if (isExpired) {
    return null; // Don't render anything when expired
  }

  const TimeUnit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="relative">
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-lg"
        >
          <span className="text-white font-bold text-sm sm:text-base">
            {String(value).padStart(2, '0')}
          </span>
        </motion.div>
      </div>
      <span className="text-[10px] sm:text-xs text-gray-400 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="flex items-center gap-1 text-orange-500">
        <FiZap className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <TimeUnit value={timeLeft.days} label="DD" />
        <span className="text-orange-500 font-bold text-sm sm:text-base">:</span>
        <TimeUnit value={timeLeft.hours} label="HH" />
        <span className="text-orange-500 font-bold text-sm sm:text-base">:</span>
        <TimeUnit value={timeLeft.minutes} label="MM" />
        <span className="text-orange-500 font-bold text-sm sm:text-base">:</span>
        <TimeUnit value={timeLeft.seconds} label="SS" />
      </div>
    </div>
  );
};

export default FlashSaleCountdown;
