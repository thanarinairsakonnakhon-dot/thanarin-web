export type BookingSlot = {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    available: boolean;
};

// Generate some mock slots for the next 7 days
const generateMockSlots = (): BookingSlot[] => {
    const slots: BookingSlot[] = [];
    const today = new Date();
    const times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];

    for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        times.forEach((time, index) => {
            slots.push({
                id: `${dateStr}-${time}`,
                date: dateStr,
                time: time,
                available: Math.random() > 0.3 // 70% chance of being available
            });
        });
    }
    return slots;
};

export const bookingSlots = generateMockSlots();
