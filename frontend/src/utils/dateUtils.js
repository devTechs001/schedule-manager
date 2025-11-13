import {
    addDays,
    addWeeks,
    addMonths,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    isSameDay,
    isWithinInterval,
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
  } from 'date-fns';
  
  export const getToday = () => new Date();
  
  export const getTomorrow = () => addDays(new Date(), 1);
  
  export const getYesterday = () => addDays(new Date(), -1);
  
  export const getNextWeek = () => addWeeks(new Date(), 1);
  
  export const getNextMonth = () => addMonths(new Date(), 1);
  
  export const getWeekRange = (date = new Date()) => {
    return {
      start: startOfWeek(date),
      end: endOfWeek(date),
    };
  };
  
  export const getMonthRange = (date = new Date()) => {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  };
  
  export const isEventToday = (date) => {
    return isSameDay(new Date(date), new Date());
  };
  
  export const isEventInRange = (eventDate, startDate, endDate) => {
    return isWithinInterval(new Date(eventDate), {
      start: new Date(startDate),
      end: new Date(endDate),
    });
  };
  
  export const getDaysUntil = (date) => {
    return differenceInDays(new Date(date), new Date());
  };
  
  export const getHoursUntil = (date) => {
    return differenceInHours(new Date(date), new Date());
  };
  
  export const getMinutesUntil = (date) => {
    return differenceInMinutes(new Date(date), new Date());
  };
  
  export const isOverdue = (date) => {
    return new Date(date) < new Date();
  };
  
  export const isDueSoon = (date, hours = 24) => {
    const now = new Date();
    const dueDate = new Date(date);
    const hoursUntil = differenceInHours(dueDate, now);
    return hoursUntil > 0 && hoursUntil <= hours;
  };
  
  export const getWorkingDays = (startDate, endDate) => {
    let count = 0;
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
  
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDate = addDays(currentDate, 1);
    }
  
    return count;
  };