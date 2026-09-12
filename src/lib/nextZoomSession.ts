import { ZOOM_SCHEDULE, type ZoomScheduleItem } from '../config/clubContent';

const MOSCOW_TZ = 'Europe/Moscow';

const DAY_NAME_TO_INDEX: Record<ZoomScheduleItem['dayLabel'], number> = {
  Понедельник: 1,
  Среда: 3,
  Суббота: 6,
};

const WEEKDAY_SHORT_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

interface MoscowClock {
  weekday: number;
  minutes: number;
}

export const getMoscowClock = (now: Date = new Date()): MoscowClock => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MOSCOW_TZ,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const weekdayText = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  const hourRaw = Number(parts.find((part) => part.type === 'hour')?.value ?? '0');
  const minuteRaw = Number(parts.find((part) => part.type === 'minute')?.value ?? '0');
  const hour = hourRaw === 24 ? 0 : hourRaw;

  return {
    weekday: WEEKDAY_SHORT_TO_INDEX[weekdayText] ?? 1,
    minutes: hour * 60 + minuteRaw,
  };
};

const sessionMinutesFromMidnight = (item: ZoomScheduleItem): number => {
  const [hours, minutes] = item.timeLabel.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getNextZoomSession = (
  now: Date = new Date(),
  schedule: readonly ZoomScheduleItem[] = ZOOM_SCHEDULE,
): ZoomScheduleItem | null => {
  if (schedule.length === 0) {
    return null;
  }

  const clock = getMoscowClock(now);
  let best = schedule[0];
  let bestWait = Number.POSITIVE_INFINITY;

  for (const item of schedule) {
    const targetDay = DAY_NAME_TO_INDEX[item.dayLabel];
    const targetMinutes = sessionMinutesFromMidnight(item);
    let dayDelta = (targetDay - clock.weekday + 7) % 7;
    if (dayDelta === 0 && targetMinutes <= clock.minutes) {
      dayDelta = 7;
    }
    const wait = dayDelta * 24 * 60 + (targetMinutes - clock.minutes);
    if (wait < bestWait) {
      bestWait = wait;
      best = item;
    }
  }

  return best;
};
