import { Order, OrderStatus } from '../types';
import { MOCK_ORDERS } from './mockData';

// In a real app, this would fetch from the Google Apps Script Web App URL
// const GOOGLE_SCRIPT_URL = 'YOUR_DEPLOYED_SCRIPT_URL';

class SheetService {
  private orders: Order[] = [...MOCK_ORDERS];
  private listeners: (() => void)[] = [];

  constructor() {
    // Load from local storage if available for persistence in demo
    const saved = localStorage.getItem('crowngate_orders');
    if (saved) {
      this.orders = JSON.parse(saved);
    }
  }

  private notify() {
    localStorage.setItem('crowngate_orders', JSON.stringify(this.orders));
    this.listeners.forEach(l => l());
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async getOrders(): Promise<Order[]> {
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.orders]), 500);
    });
  }

  async addOrder(order: Omit<Order, 'id' | 'status' | 'submissionDate'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.floor(Math.random() * 10000)}`,
      status: OrderStatus.SUBMITTED,
      submissionDate: new Date().toISOString().split('T')[0],
    };
    this.orders = [newOrder, ...this.orders];
    this.notify();
    return newOrder;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
    this.orders = this.orders.map(o => o.id === id ? { ...o, ...updates } : o);
    this.notify();
  }

  async deleteOrder(id: string): Promise<void> {
    this.orders = this.orders.filter(o => o.id !== id);
    this.notify();
  }
}

export const sheetService = new SheetService();