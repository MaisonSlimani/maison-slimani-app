-- Migration Realtime: Cấu hình Realtime cho Supabase project mới
-- Chạy script này trên project mới sau khi đã import database

-- ============================================
-- PART 1: Tạo publication supabase_realtime
-- ============================================

-- Vérifier et activer la publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  END IF;
END $$;

-- ============================================
-- PART 2: Thêm các tables vào publication realtime
-- ============================================

-- Thêm table commandes vào publication realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'commandes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE commandes;
  END IF;
END $$;

-- Có thể thêm các tables khác nếu cần realtime
-- Ví dụ: produits, categories, etc.
-- ALTER PUBLICATION supabase_realtime ADD TABLE produits;
-- ALTER PUBLICATION supabase_realtime ADD TABLE categories;

-- ============================================
-- PART 3: Cấu hình REPLICA IDENTITY
-- ============================================

-- Cấu hình REPLICA IDENTITY cho table commandes
-- Điều này cho phép realtime capture INSERT, UPDATE, DELETE events
ALTER TABLE commandes REPLICA IDENTITY DEFAULT;

-- Nếu có các tables khác cần realtime, thêm ở đây:
-- ALTER TABLE produits REPLICA IDENTITY DEFAULT;
-- ALTER TABLE categories REPLICA IDENTITY DEFAULT;

-- ============================================
-- PART 4: Kiểm tra cấu hình
-- ============================================

-- Kiểm tra xem publication có tồn tại không
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE EXCEPTION 'Publication supabase_realtime không tồn tại!';
  END IF;
END $$;

-- Kiểm tra xem table commandes có trong publication không
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'commandes'
  ) THEN
    RAISE EXCEPTION 'Table commandes chưa được thêm vào publication supabase_realtime!';
  END IF;
END $$;

-- ============================================
-- Kết thúc migration Realtime
-- ============================================

-- Ghi chú:
-- 1. Sau khi chạy script này, Realtime subscriptions sẽ hoạt động cho table commandes
-- 2. Để test, sử dụng Supabase Realtime client:
--    const channel = supabase
--      .channel('commandes-changes')
--      .on('postgres_changes', {
--        event: '*',
--        schema: 'public',
--        table: 'commandes'
--      }, (payload) => {
--        console.log('Change received!', payload)
--      })
--      .subscribe()
-- 3. Có thể thêm các tables khác vào realtime bằng cách:
--    - Thêm vào ALTER PUBLICATION supabase_realtime ADD TABLE [table_name];
--    - Thêm ALTER TABLE [table_name] REPLICA IDENTITY DEFAULT;

