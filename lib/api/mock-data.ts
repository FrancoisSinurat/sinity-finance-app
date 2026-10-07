import type {
  Account,
  Category,
  CategoryBudget,
  Invoice,
  Profile,
  Settings,
  Type,
} from "./types";

export type MockGoalTarget = {
  id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
  timeline_type: "date" | "term";
  deadline?: string;
  term_value?: number;
  term_unit?: "week" | "month" | "year";
  note?: string;
  created_at: string;
};

export type MockWishlistItem = {
  id: number;
  name: string;
  price: number;
  priority: "low" | "medium" | "high";
  status: "planning" | "saving" | "ready" | "bought";
  target_id?: number;
  note?: string;
  created_at: string;
};

export type MockStore = {
  invoices: Invoice[];
  accounts: Account[];
  budgets: Array<CategoryBudget & { scope: "monthly" | "weekly" }>;
  categories: Category[];
  types: Type[];
  targets: MockGoalTarget[];
  wishlist: MockWishlistItem[];
  profile: Profile;
  settings: Settings;
  nextId: number;
};

const now = "2026-03-01T00:00:00+07:00";

export function createDefaultMockStore(): MockStore {
  return {
    nextId: 100,
    types: [
      { id: 1, name: "pemasukkan", created_at: now },
      { id: 2, name: "pengeluaran", created_at: now },
    ],
    categories: [
      { id: 1, name: "Gaji", type_id: 1, created_at: now },
      { id: 2, name: "Freelance", type_id: 1, created_at: now },
      { id: 3, name: "Investasi", type_id: 1, created_at: now },
      { id: 4, name: "Makanan", type_id: 2, created_at: now },
      { id: 5, name: "Utilitas", type_id: 2, created_at: now },
      { id: 6, name: "Transport", type_id: 2, created_at: now },
      { id: 7, name: "Hiburan", type_id: 2, created_at: now },
      { id: 8, name: "Kesehatan", type_id: 2, created_at: now },
    ],
    invoices: [
      {
        id: 1,
        date: "2026-03-01",
        amount: 8_500_000,
        note: "Gaji bulanan",
        category: "Gaji",
        type: "pemasukkan",
        account_id: 1,
        created_at: now,
      },
      {
        id: 2,
        date: "2026-03-03",
        amount: 1_500_000,
        note: "Project freelance",
        category: "Freelance",
        type: "pemasukkan",
        account_id: 1,
        created_at: now,
      },
      {
        id: 3,
        date: "2026-03-05",
        amount: 450_000,
        note: "Belanja mingguan",
        category: "Makanan",
        type: "pengeluaran",
        account_id: 1,
        created_at: now,
      },
      {
        id: 4,
        date: "2026-03-06",
        amount: 350_000,
        note: "Listrik & air",
        category: "Utilitas",
        type: "pengeluaran",
        account_id: 1,
        created_at: now,
      },
      {
        id: 5,
        date: "2026-03-07",
        amount: 180_000,
        note: "Grab & BBM",
        category: "Transport",
        type: "pengeluaran",
        account_id: 3,
        created_at: now,
      },
    ],
    accounts: [
      {
        id: 1,
        name: "BCA Utama",
        account_number: "1234567890",
        type: "bank",
        initial_balance: 10_000_000,
        balance: 19_020_000,
        income: 10_000_000,
        expense: 980_000,
        color: "sky",
        created_at: now,
      },
      {
        id: 2,
        name: "Tabungan Mandiri",
        account_number: "9876543210",
        type: "bank",
        initial_balance: 5_000_000,
        balance: 5_000_000,
        income: 0,
        expense: 0,
        color: "indigo",
        created_at: now,
      },
      {
        id: 3,
        name: "Dompet Tunai",
        account_number: "",
        type: "cash",
        initial_balance: 500_000,
        balance: 320_000,
        income: 0,
        expense: 180_000,
        color: "green",
        created_at: now,
      },
    ],
    budgets: [
      { id: 1, category: "Makanan", limit: 2_000_000, scope: "monthly" },
      { id: 2, category: "Utilitas", limit: 800_000, scope: "monthly" },
      { id: 3, category: "Transport", limit: 600_000, scope: "monthly" },
      { id: 4, category: "Hiburan", limit: 500_000, scope: "monthly" },
      { id: 5, category: "Makanan", limit: 500_000, scope: "weekly" },
    ],
    targets: [
      {
        id: 1,
        name: "Dana Darurat",
        target_amount: 30_000_000,
        saved_amount: 12_000_000,
        timeline_type: "term",
        term_value: 12,
        term_unit: "month",
        note: "6 bulan biaya hidup",
        created_at: now,
      },
      {
        id: 2,
        name: "Liburan",
        target_amount: 8_000_000,
        saved_amount: 2_500_000,
        timeline_type: "date",
        deadline: "2026-12-31",
        created_at: now,
      },
    ],
    wishlist: [
      {
        id: 1,
        name: "Laptop kerja",
        price: 15_000_000,
        priority: "high",
        status: "saving",
        target_id: 1,
        created_at: now,
      },
      {
        id: 2,
        name: "Headphone",
        price: 2_500_000,
        priority: "medium",
        status: "planning",
        created_at: now,
      },
    ],
    profile: {
      id: 1,
      name: "Demo User",
      email: "demo@sinity.app",
      phone: "+6281234567890",
      address: "Jakarta",
      birth_date: "1995-01-15",
      bio: "Mode offline / mock aktif",
    },
    settings: {
      theme: "light",
      color_theme: "pink",
      notify_email: true,
      notify_push: true,
      notify_sms: false,
      profile_visibility: "private",
      data_sharing: false,
    },
  };
}
