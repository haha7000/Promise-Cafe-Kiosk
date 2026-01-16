export type PaymentMode = 'PERSONAL' | 'CELL';
export type ViewState = 'HOME' | 'CELL_AUTH' | 'MENU' | 'PAYMENT_QR' | 'ORDER_COMPLETE' | 'BARISTA';
export type Category = 'ALL' | 'COFFEE' | 'NON_COFFEE' | 'DESSERT' | 'SEASONAL';
export type OrderStatus = 'PENDING' | 'MAKING' | 'COMPLETED';

export interface OptionItem {
  id: number;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface OptionGroup {
  id: number;
  name: string;
  icon?: string; // Emoji
  type: 'SINGLE' | 'MULTIPLE';
  isRequired: boolean;
  items: OptionItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  engName: string;
  price: number;
  category: Category;
  description: string;
  imageUrl: string;
  isSoldOut?: boolean;
  optionGroups: OptionGroup[]; // In a real app, this might be a relation ID
}

export interface SelectedOption {
  groupId: number;
  groupName: string;
  items: OptionItem[];
}

export interface CartItem {
  cartId: string;
  menu: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  totalPrice: number;
}

export interface CellInfo {
  id: number;
  name: string;
  leader: string;
  balance: number;
}

export interface Order {
  orderId: string;
  dailyNum: number;
  payType: PaymentMode;
  cellInfo?: CellInfo;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  completedAt?: Date;
}

// Admin Types
export type AdminRole = 'SUPER' | 'NORMAL';

export interface Admin {
  id: number;
  username: string;
  name: string;
  role: AdminRole;
  lastLogin?: Date;
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  personalOrders: number;
  personalRevenue: number;
  cellOrders: number;
  cellRevenue: number;
}

export interface MenuSales {
  menuId: number;
  menuName: string;
  quantity: number;
  revenue: number;
}

export interface DailySettlement {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  personalRevenue: number;
  cellRevenue: number;
  isConfirmed: boolean;
}

export interface PointTransaction {
  id: number;
  cellId: number;
  cellName: string;
  type: 'CHARGE' | 'USE';
  amount: number;
  balanceAfter: number;
  memo?: string;
  createdAt: Date;
}

// Global type declarations
declare global {
  interface Window {
    __pendingOrder?: Order;
  }
}