
import { Order, OrderStatus, User, Product } from '../types';
import { MOCK_ORDERS, MOCK_USERS, MOCK_PRODUCTS } from './mockData';

// ------------------------------------------------------------------
// CONFIGURATION
// ------------------------------------------------------------------
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
// Example: "https://script.google.com/macros/s/AKfycbx.../exec"
const GOOGLE_SCRIPT_URL: string = "https://script.google.com/macros/s/AKfycbx-OGoVYBrqpfAsvy5TXA0qFpmuDS5zWJw7K8RbIYq_Le3S3_c7pqvVbRcQLAZ8mefk/exec"; 
// ------------------------------------------------------------------

class SheetService {
  private orders: Order[] = [...MOCK_ORDERS];
  private users: User[] = [...MOCK_USERS];
  private products: Product[] = [...MOCK_PRODUCTS];
  private listeners: (() => void)[] = [];
  private useLiveMode: boolean = false;

  constructor() {
    // Determine if we should use the live backend or local demo mode
    // We check length > 0. This avoids TypeScript narrowing 'const = ""' to 'never' in a truthiness check.
    this.useLiveMode = GOOGLE_SCRIPT_URL.length > 0;

    if (!this.useLiveMode) {
        console.log("⚠️ RUNNING IN DEMO MODE (Local Storage). Add GOOGLE_SCRIPT_URL in services/sheetService.ts to go live.");
        const savedOrders = localStorage.getItem('crowngate_orders');
        if (savedOrders) this.orders = JSON.parse(savedOrders);
        const savedUsers = localStorage.getItem('crowngate_users');
        if (savedUsers) this.users = JSON.parse(savedUsers);
        const savedProducts = localStorage.getItem('crowngate_products');
        if (savedProducts) this.products = JSON.parse(savedProducts);
    }
  }

  private notify() {
    if (!this.useLiveMode) {
      localStorage.setItem('crowngate_orders', JSON.stringify(this.orders));
      localStorage.setItem('crowngate_users', JSON.stringify(this.users));
      localStorage.setItem('crowngate_products', JSON.stringify(this.products));
    }
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // --- API HELPER ---
  private async apiCall(action: string, sheetName: string, data?: any, id?: string) {
      if (!this.useLiveMode) return null;

      try {
          // Google Apps Script requires sending data as a POST text payload to avoid CORS preflight issues in some cases,
          // or standard POST. We will use no-cors if simple GET, but for data we use POST.
          const payload = { action, sheet: sheetName, data, id };
          
          const response = await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: JSON.stringify(payload),
          });
          
          return await response.json();
      } catch (error) {
          console.error("API Error:", error);
          throw error;
      }
  }

  // --- ORDER METHODS ---
  async getOrders(): Promise<Order[]> {
    if (this.useLiveMode) {
        const result = await this.apiCall('read', 'Orders');
        if (Array.isArray(result)) {
            // Normalize dates to YYYY-MM-DD by stripping time component
            // This prevents "2023-03-21T18:30:00.000Z" from breaking date inputs
            const normalizedOrders = result.map((o: any) => ({
              ...o,
              // Check if date exists and has 'T', split it. Otherwise keep as is.
              dueDate: o.dueDate && typeof o.dueDate === 'string' ? o.dueDate.split('T')[0] : o.dueDate,
              submissionDate: o.submissionDate && typeof o.submissionDate === 'string' ? o.submissionDate.split('T')[0] : o.submissionDate,
            })) as Order[];

            this.orders = normalizedOrders;
            this.notify(); // Update subscribers with new data
            return this.orders;
        }
        return this.orders; // Return cached if fail
    }
    return new Promise((resolve) => setTimeout(() => resolve([...this.orders]), 300));
  }

  async addOrder(order: Omit<Order, 'id' | 'status' | 'submissionDate'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.floor(Math.random() * 10000)}`, // Temp ID, or let backend generate
      status: OrderStatus.SUBMITTED,
      submissionDate: new Date().toISOString().split('T')[0],
    };

    // OPTIMISTIC UPDATE: Update local state immediately
    this.orders = [newOrder, ...this.orders];
    this.notify();

    if (this.useLiveMode) {
        // Send to Google Sheet in background
        this.apiCall('create', 'Orders', newOrder).catch(err => {
            console.error("Failed to sync order to cloud:", err);
            // Ideally we would rollback state here if failed, but for simple app we log error
        });
    }

    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
     // OPTIMISTIC UPDATE
    this.orders = this.orders.map(o => o.id === id ? { ...o, ...updates } : o);
    this.notify();

    if (this.useLiveMode) {
        await this.apiCall('update', 'Orders', updates, id).catch(err => console.error("Update failed", err));
    }
  }

  async deleteOrder(id: string): Promise<void> {
    // OPTIMISTIC UPDATE
    this.orders = this.orders.filter(o => o.id !== id);
    this.notify();

    if (this.useLiveMode) {
        await this.apiCall('delete', 'Orders', null, id).catch(err => console.error("Delete failed", err));
    }
  }

  // --- USER METHODS ---
  async getUsers(): Promise<User[]> {
    if (this.useLiveMode) {
        const result = await this.apiCall('read', 'Users');
        if (Array.isArray(result)) {
            this.users = result as User[];
            return this.users;
        }
        return [];
    }
    return new Promise((resolve) => setTimeout(() => resolve([...this.users]), 300));
  }

  // Removed addUser/updateUser/deleteUser to enforce "Admin only edits users via Sheet" rule
  // but keeping basic local update for demo if needed, or strictly read-only
  async addUser(user: Omit<User, 'id'>): Promise<void> {
      // Stub for future use or local dev
      console.warn("User management is restricted to Google Sheets.");
  }

  // --- PRODUCT (RESTORATION TYPE) METHODS ---
  async getProducts(): Promise<Product[]> {
    if (this.useLiveMode) {
        const result = await this.apiCall('read', 'Products');
        if (Array.isArray(result) && result.length > 0) {
            this.products = result as Product[];
            return this.products;
        }
        return this.products; // Fallback to mock/cache
    }
    return new Promise((resolve) => setTimeout(() => resolve([...this.products]), 300));
  }

  async addProduct(name: string): Promise<Product> {
    const newProduct: Product = {
      id: `PROD-${Math.floor(Math.random() * 10000)}`,
      name
    };

    // Optimistic
    this.products = [...this.products, newProduct];
    this.notify();

    if (this.useLiveMode) {
       await this.apiCall('create', 'Products', newProduct);
    }
    return newProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    // Optimistic
    this.products = this.products.filter(p => p.id !== id);
    this.notify();

    if (this.useLiveMode) {
      await this.apiCall('delete', 'Products', null, id);
    }
  }
}

export const sheetService = new SheetService();
