
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://moofomzmoevxlfyvncqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vb2ZvbXptb2V2eGxmeXZuY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Mzk5NDMsImV4cCI6MjA4NjAxNTk0M30.FF4RBYC4RxtaiWH59Cb0U52wK_CXcDjFSzLwgJvnOmo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalCleanup() {
    const productId = '72be2619-b17c-4485-b54f-1e9543571f78';

    console.log(`Targeting ID: ${productId}`);

    // 1. Try to rename it first
    console.log('Renaming product...');
    const { error: updateError } = await supabase
        .from('products')
        .update({
            name: '[REMOVED] Aux New Serie Y',
            status: 'Disabled',
            price: 0,
            stock: 0,
            brand: 'REMOVED'
        })
        .eq('id', productId);

    if (updateError) {
        console.error('Update Failed:', updateError);
    } else {
        console.log('Product renamed and disabled.');
    }

    // 2. Try to nullify order items if possible (fallback if delete fails)
    console.log('Attempting to nullify or delete order items...');
    const { error: itemError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', productId);

    if (itemError) {
        console.error('Delete order items error:', itemError);
    } else {
        console.log('Order items delete command sent.');
    }

    // 3. Final delete attempt
    console.log('Attempting final delete...');
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (deleteError) {
        console.error('Final Delete Failed (Foreign Key likely remains):', deleteError.message);
    } else {
        console.log('PRODUCT DELETED FROM DATABASE.');
    }
}

finalCleanup();
