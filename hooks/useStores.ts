-- SHELF SCOUT DATABASE PURGE & RESTRUCTURING (JAN 2026)
BEGIN;

-- 1. DELETE GHOST DATA
-- Removes any stores or prices associated with the old "version0.5.0" test cycle
DELETE FROM public.prices 
WHERE store_id IN (SELECT id FROM public.stores WHERE name ILIKE '%version0.5.0%' OR location ILIKE '%test%');

DELETE FROM public.stores 
WHERE name ILIKE '%version0.5.0%' OR location ILIKE '%test%';

-- 2. RESET CITY/PARISH ALIGNMENT
-- This ensures that 'Portmore' isn't accidentally showing up in 'Kingston'
-- by forcing a strict ID-based relationship.
UPDATE public.stores
SET city = 'Portmore'
WHERE location ILIKE '%Portmore%' OR name ILIKE '%Portmore%';

UPDATE public.stores
SET parish = 'st-catherine'
WHERE city = 'Portmore';

-- 3. REMOVE ORPHANED PRICES
-- If a price exists for a store that was a "ghost" and just got deleted, remove it.
DELETE FROM public.prices
WHERE store_id NOT IN (SELECT id FROM public.stores);

-- 4. CLEANUP EMPTY ENTRIES
-- Prevents the 'Unknown' or blank city dropdowns in your UI
DELETE FROM public.stores WHERE name IS NULL OR parish IS NULL;

COMMIT;
