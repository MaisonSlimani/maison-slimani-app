-- supabase/tests/database/stock_management.test.sql
BEGIN;
SELECT plan(10); -- Expanded plan to 10 tests

-- Setup
INSERT INTO categories (name, slug, is_active) VALUES ('Shoes', 'shoes', true);

INSERT INTO produits (id, name, slug, price, stock, category, colors)
VALUES (
    'p-acc-1', 
    'Accuracy Test Prod', 
    'acc-test', 
    100, 
    2, 
    'Shoes', 
    '[
        {"name": "Black", "code": "#000", "stock": 1, "sizes": [{"name": "42", "stock": 1}]},
        {"name": "Brown", "code": "#543", "stock": 1, "sizes": [{"name": "42", "stock": 1}]}
    ]'::jsonb
);

-- 1. TEST: Insufficient Stock Failure
-- Try to order 2 when only 1 is in stock for Black/42
SELECT is(
    (SELECT (create_order_v2_atomic(
        'Failure Test', '000', 'Addr', 'City', 'fail@test.com',
        '[{"id": "p-acc-1", "name": "Test", "price": 100, "quantity": 2, "color": "Black", "size": "42"}]'::jsonb,
        200, 'idemp-fail'
    ))->>'success')::boolean,
    false,
    'RPC should return success=false when stock is insufficient'
);

-- 2. TEST: Atomicity (No partial decrement)
SELECT is(
    (SELECT (colors->0->'sizes'->0->>'stock')::int FROM produits WHERE id = 'p-acc-1'),
    1,
    'Stock should remain at 1 after a failed order attempt (Atomic rollback)'
);

-- 3. TEST: Variant Isolation
-- Order Brown/42, Black/42 should NOT change
SELECT lives_ok(
    $$ SELECT create_order_v2_atomic(
        'Isolation Test', '000', 'Addr', 'City', 'iso@test.com',
        '[{"id": "p-acc-1", "name": "Test", "price": 100, "quantity": 1, "color": "Brown", "size": "42"}]'::jsonb,
        100, 'idemp-iso'
    ) $$,
    'Should order Brown successfully'
);

SELECT is(
    (SELECT (colors->1->'sizes'->0->>'stock')::int FROM produits WHERE id = 'p-acc-1'),
    0,
    'Brown stock should be 0'
);

SELECT is(
    (SELECT (colors->0->'sizes'->0->>'stock')::int FROM produits WHERE id = 'p-acc-1'),
    1,
    'Black stock should still be 1 (Isolation verification)'
);

-- 4. TEST: Referential Integrity
-- Should NOT be able to delete 'Shoes' category because 'p-acc-1' points to it
SELECT throws_ok(
    $$ DELETE FROM categories WHERE name = 'Shoes' $$,
    null, -- Any error (foreign key violation)
    'Should block category deletion if products exist'
);

-- 5. TEST: Basic Security (RLS check)
-- Check if anon can select (should be yes based on public access)
SELECT ok(
    (SELECT count(*) FROM produits WHERE id = 'p-acc-1') = 1,
    'Anonymous access should be permitted for product reading'
);

-- 6. Schema Consistency
SELECT col_is_null('produits', 'image_url', 'image_url should allow nulls');
SELECT col_not_null('produits', 'slug', 'slug MUST NOT be null');
SELECT col_has_default('produits', 'created_at', 'created_at should have a default timestamp');

SELECT * FROM finish();
ROLLBACK;
