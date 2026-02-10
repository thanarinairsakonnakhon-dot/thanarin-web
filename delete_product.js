
const { createClient } = require('@supabase/supabase-client');

const supabaseUrl = 'https://moofomzmoevxlfyvncqs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vb2ZvbXptb2V2eGxmeXZuY3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Mzk5NDMsImV4cCI6MjA4NjAxNTk0M30.FF4RBYC4RxtaiWH59Cb0U52wK_CXcDjFSzLwgJvnOmo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteProduct() {
    const productName = 'Aux New Serie Y';
    console.log(`Searching for product: ${productName}`);

    const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('name', productName);

    if (error) {
        console.error('Error finding product:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('Product not found.');
        return;
    }

    console.log(`Found product: ${data[0].name} (ID: ${data[0].id})`);

    const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', data[0].id);

    if (deleteError) {
        console.error('Error deleting product:', deleteError);
    } else {
        console.log('Product deleted successfully.');
    }
}

deleteProduct();
