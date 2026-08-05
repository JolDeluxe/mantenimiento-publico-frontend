const MX_TIME_ZONE = 'America/Mexico_City';
const FUTURE_PARO_MESSAGE = 'La fecha y hora del paro no pueden ser futuras.';

const parseDateTimeLocal = (value) => {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);

  if (hourNumber < 0 || hourNumber > 23 || minuteNumber < 0 || minuteNumber > 59) {
    return null;
  }

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
    value: `${year}-${month}-${day}T${hour}:${minute}`,
  };
};

export const getMexicoNowDateTimeLocal = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: MX_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});

  const hour = parts.hour === '24' ? '00' : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
};

export const getMexicoTodayDate = () => getMexicoNowDateTimeLocal().slice(0, 10);

export const isParoDateTimeInFuture = (value, nowValue = getMexicoNowDateTimeLocal()) => {
  const parsed = parseDateTimeLocal(value);
  if (!parsed) return false;
  return parsed.value > nowValue;
};

export const getParoDateTimeError = (value) => (
  isParoDateTimeInFuture(value) ? FUTURE_PARO_MESSAGE : ''
);

export const normalizeParoDateTimeInput = (value) => (
  isParoDateTimeInFuture(value) ? '' : value
);

export { FUTURE_PARO_MESSAGE };
