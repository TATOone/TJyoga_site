export type CountdownPhase = 'counting' | 'live' | 'hidden';

export interface CountdownPhaseConfig {
  eventStart: Date;
  liveMessageDays?: number;
}

export const getCountdownPhase = (
  now: Date,
  { eventStart, liveMessageDays = 3 }: CountdownPhaseConfig,
): CountdownPhase => {
  const liveEnd = new Date(eventStart);
  liveEnd.setDate(liveEnd.getDate() + liveMessageDays);

  if (now < eventStart) return 'counting';
  if (now < liveEnd) return 'live';
  return 'hidden';
};

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const getTimeLeft = (targetDate: Date, now = new Date()): TimeLeft => {
  const distance = targetDate.getTime() - now.getTime();

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
};
