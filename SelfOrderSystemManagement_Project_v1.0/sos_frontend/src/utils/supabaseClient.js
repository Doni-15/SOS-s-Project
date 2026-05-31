import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database table references for type safety and easier access
export const tables = {
  users: 'users',
  menus: 'menus',
  orders: 'orders',
  order_items: 'order_items',
  payments: 'payments',
};

// Helper functions for common database operations
export const db = {
  // Users
  async getUser(userId) {
    const { data, error } = await supabase
      .from(tables.users)
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from(tables.users)
      .select('*')
      .eq('email', email)
      .single();
    if (error) throw error;
    return data;
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from(tables.users)
      .insert(userData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from(tables.users)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Menus
  async getMenus(filters = {}) {
    let query = supabase.from(tables.menus).select('*');
    
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.is_available !== undefined) {
      query = query.eq('is_available', filters.is_available);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getMenu(menuId) {
    const { data, error } = await supabase
      .from(tables.menus)
      .select('*')
      .eq('id', menuId)
      .single();
    if (error) throw error;
    return data;
  },

  async createMenu(menuData) {
    const { data, error } = await supabase
      .from(tables.menus)
      .insert(menuData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateMenu(menuId, updates) {
    const { data, error } = await supabase
      .from(tables.menus)
      .update(updates)
      .eq('id', menuId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteMenu(menuId) {
    const { error } = await supabase
      .from(tables.menus)
      .delete()
      .eq('id', menuId);
    if (error) throw error;
    return true;
  },

  // Orders
  async getOrders(filters = {}) {
    let query = supabase
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menus (*)
        ),
        payments (*)
      `);
    
    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.order_number) {
      query = query.eq('order_number', filters.order_number);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getOrder(orderId) {
    const { data, error } = await supabase
      .from(tables.orders)
      .select(`
        *,
        order_items (
          *,
          menus (*)
        ),
        payments (*)
      `)
      .eq('id', orderId)
      .single();
    if (error) throw error;
    return data;
  },

  async createOrder(orderData) {
    const { data, error } = await supabase
      .from(tables.orders)
      .insert(orderData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateOrder(orderId, updates) {
    const { data, error } = await supabase
      .from(tables.orders)
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Order Items
  async createOrderItem(orderItemData) {
    const { data, error } = await supabase
      .from(tables.order_items)
      .insert(orderItemData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getOrderItems(orderId) {
    const { data, error } = await supabase
      .from(tables.order_items)
      .select(`
        *,
        menus (*)
      `)
      .eq('order_id', orderId);
    if (error) throw error;
    return data;
  },

  // Payments
  async getPayments(filters = {}) {
    let query = supabase.from(tables.payments).select('*');
    
    if (filters.order_id) {
      query = query.eq('order_id', filters.order_id);
    }
    if (filters.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createPayment(paymentData) {
    const { data, error } = await supabase
      .from(tables.payments)
      .insert(paymentData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePayment(paymentId, updates) {
    const { data, error } = await supabase
      .from(tables.payments)
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// Authentication helpers
export const auth = {
  async signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

export default supabase;
