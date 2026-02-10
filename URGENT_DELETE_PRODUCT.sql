
-- URGENT DELETE SCRIPT FOR PRODUCT: Aux New Serie Y
-- Run this in the Supabase SQL Editor to permanently remove all references and the product.

BEGIN;

-- 1. Identify Product ID
-- Current ID is: 72be2619-b17c-4485-b54f-1e9543571f78

-- 2. Delete Order Items (referencing product)
DELETE FROM order_items WHERE product_id = '72be2619-b17c-4485-b54f-1e9543571f78';

-- 3. Delete Stock Logs
DELETE FROM stock_logs WHERE product_id = '72be2619-b17c-4485-b54f-1e9543571f78';

-- 4. Delete Product
DELETE FROM products WHERE id = '72be2619-b17c-4485-b54f-1e9543571f78';

COMMIT;
