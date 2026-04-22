import { startOfDay, endOfDay } from 'date-fns';

export function buildDateFilter(history: boolean, field = 'createdAt') {
    if (history) return {};
    const now = new Date();
    return {
        [field]: {
            gte: startOfDay(now),
            lte: endOfDay(now),
        },
    };
}
