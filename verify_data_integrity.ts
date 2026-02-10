
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env manually
const envPath = path.resolve('.env.local');
let supabaseUrl = '';
let supabaseServiceKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            const trimmedKey = key.trim();
            const trimmedValue = value.trim();
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = trimmedValue;
            if (trimmedKey === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseServiceKey = trimmedValue;
        }
    });
} catch (error) {
    console.error("Error reading .env.local:", error);
    process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLatestBooking() {
    console.log("Fetching latest booking...");
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, customer_name, service_type, order_id, created_at, order:orders(id, order_items(product_name, quantity))')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error fetching bookings:", error);
        return;
    }

    if (!bookings || bookings.length === 0) {
        console.log("No bookings found.");
        return;
    }

    const booking = bookings[0];
    console.log("Latest Booking:", JSON.stringify(booking, null, 2));

    if (!booking.order_id) {
        console.warn("WARNING: order_id is NULL for this booking.");
    } else {
        console.log("order_id is present:", booking.order_id);
        if (!booking.order) {
            console.error("ERROR: order_id is set but 'order' relation is NULL. Check foreign key relationship.");
        } else {
            const order = Array.isArray(booking.order) ? booking.order[0] : booking.order;
            console.log("Order found. Items:", (order as any).order_items);
        }
    }
}

checkLatestBooking();
