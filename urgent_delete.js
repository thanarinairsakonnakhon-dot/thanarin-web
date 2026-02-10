
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://moofomzmoevxlfyvncqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vb2ZvbXptb2V2eGxmeXZuY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Mzk5NDMsImV4cCI6MjA4NjAxNTk0M30.FF4RBYC4RxtaiWH59Cb0U52wK_CXcDjFSzLwgJvnOmo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function urgentDelete() {
    const productName = 'Aux New Serie Y';
    console.log(`Searching for product: ${productName}`);

    // 1. Find Product ID
    const { data: product, error: findError } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', productName)
        .single();

    if (findError) {
        console.error('Error finding product:', findError);
        return;
    }

    const productId = product.id;
    console.log(`Found ID: ${productId}`);

    // 2. Delete Order Items first (bypass via representations if needed, but here we just try)
    console.log('Deleting order items...');
    const { error: itemError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', productId);

    if (itemError) {
        console.error('Error deleting order items:', itemError);
    } else {
        console.log('Order items deleted.');
    }

    // 3. Delete Stock Logs
    console.log('Deleting stock logs...');
    const { error: logError } = await supabase
        .from('stock_logs')
        .delete()
        .eq('product_id', productId);

    if (logError) {
        console.error('Error deleting stock logs:', logError);
    } else {
        console.log('Stock logs deleted.');
    }

    // 4. Finally Delete Product
    console.log('Deleting product...');
    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

    if (deleteError) {
        console.error('Final Product Delete Failed:', deleteError);
    } else {
        console.log('PRODUCT DELETED SUCCESSFULLY.');
    }
}

urgentDelete();
