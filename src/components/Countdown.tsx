import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RETREAT_LIVE_MESSAGE,
  RETREAT_LIVE_MESSAGE_DAYS,
  RETREAT_START,
} from '../config/retreat';
import type { CountdownPhase, TimeLeft } from '../utils/countdownPhase';
import {
  getCountdownPhase,
  getTimeLeft,
} from '../utils/countdownPhase';

interface CountdownProps {
  targetDate?: Date;
  liveMessageDays?: number;
  liveMessage?: string;
}

interface TimeUnitProps {
  value: number;
  label: string;
}

const TimeUnit: React.FC<TimeUnitProps> = ({ value, label }) => (
  <div className="countdown-unit" aria-hidden="true">
    <span className="countdown-unit__value">{String(value).padStart(2, '0')}</span>
    <span className="countdown-unit__label">{label}</span>
  </div>
);

const Countdown: React.FC<CountdownProps> = ({
  targetDate = RETREAT_START,
  liveMessageDays = RETREAT_LIVE_MESSAGE_DAYS,
  liveMessage = RETREAT_LIVE_MESSAGE,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const phase: CountdownPhase = getCountdownPhase(now, {
    eventStart: targetDate,
    liveMessageDays,
  });

  if (phase === 'hidden') {
    return null;
  }

  if (phase === 'live') {
    return (
      <motion.div
        className="countdown-live"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        role="status"
        aria-live="polite"
      >
        <span className="countdown-live__dot" aria-hidden="true" />
        <p className="countdown-live__text">{liveMessage}</p>
      </motion.div>
    );
  }

  const timeLeft: TimeLeft = getTimeLeft(targetDate, now);

  return (
    <div className="countdown" role="timer" aria-live="polite">
      <p className="countdown__title">До ближайшего ретрита</p>
      <div className="countdown__grid" aria-label="Оставшееся время до ретрита">
        <TimeUnit value={timeLeft.days} label="дней" />
        <span className="countdown__separator" aria-hidden="true">:</span>
        <TimeUnit value={timeLeft.hours} label="часов" />
        <span className="countdown__separator" aria-hidden="true">:</span>
        <TimeUnit value={timeLeft.minutes} label="мин" />
        <span className="countdown__separator" aria-hidden="true">:</span>
        <TimeUnit value={timeLeft.seconds} label="сек" />
      </div>
      <p className="sr-only">
        {timeLeft.days} дней, {timeLeft.hours} часов, {timeLeft.minutes} минут, {timeLeft.seconds} секунд
      </p>
    </div>
  );
};

export default Countdown;
