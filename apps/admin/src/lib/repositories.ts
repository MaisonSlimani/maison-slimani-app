import { 
  createClient, 
  CategoryRepository, 
  OrderRepository, 
  ProductRepository, 
  SettingsRepository, 
  StorageRepository 
} from '@maison/db'

// The createClient from @maison/db is already a singleton internally
const supabase = createClient()

export const categoryRepo = new CategoryRepository(supabase)
export const orderRepo = new OrderRepository(supabase)
export const productRepo = new ProductRepository(supabase)
export const settingsRepo = new SettingsRepository(supabase)
export const storageRepo = new StorageRepository(supabase)

export { supabase }
