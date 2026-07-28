import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "loading" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => null),
}));

// Mock @/lib/auth
vi.mock("@/lib/auth", () => ({
  authOptions: {},
  hashPassword: vi.fn(async (p: string) => `hashed-${p}`),
  verifyPassword: vi.fn(async (p: string, h: string) => h === `hashed-${p}`),
}));

// Mock @/lib/db - 用 in-memory Map 替代 Prisma
vi.mock("@/lib/db", () => {
  const tables: Record<string, Map<string, any>> = {
    user: new Map(),
    formula: new Map(),
    formulaCategory: new Map(),
    userMastery: new Map(),
    answerLog: new Map(),
    dailyPlan: new Map(),
    studySession: new Map(),
    aiConversation: new Map(),
    userStreak: new Map(),
  };
  return {
    db: new Proxy(
      {},
      {
        get(_t, name: string) {
          const table = tables[name] ?? tables[lowerFirst(name)] ?? new Map();
          return makeProxy(table, name);
        },
      }
    ),
    __tables: tables,
  };
});

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function makeProxy(table: Map<string, any>, _name: string) {
  return {
    findUnique: async ({ where }: any) => {
      const entries = [...table.values()];
      return entries.find((e) => matchWhere(e, where)) ?? null;
    },
    findFirst: async ({ where }: any) => {
      const entries = [...table.values()];
      return entries.find((e) => matchWhere(e, where)) ?? null;
    },
    findMany: async ({ where, take, orderBy, include }: any) => {
      let entries = [...table.values()];
      if (where) entries = entries.filter((e) => matchWhere(e, where));
      if (orderBy) {
        for (const o of (Array.isArray(orderBy) ? orderBy : [orderBy]).reverse()) {
          const key = Object.keys(o)[0];
          const dir = o[key];
          entries.sort((a, b) => {
            const av = (a as any)[key];
            const bv = (b as any)[key];
            if (av === bv) return 0;
            return (av > bv ? 1 : -1) * (dir === "desc" ? -1 : 1);
          });
        }
      }
      if (take) entries = entries.slice(0, take);
      if (include) {
        // 简化：把 _count 字段返回为 0
        entries = entries.map((e) => ({ ...e, _count: { formulas: 0 } }));
      }
      return entries;
    },
    count: async ({ where }: any = {}) => {
      const entries = [...table.values()];
      if (!where) return entries.length;
      return entries.filter((e) => matchWhere(e, where)).length;
    },
    create: async ({ data }: any) => {
      const id = data.id ?? String(Date.now() + Math.random());
      const record = { id, ...data };
      table.set(id, record);
      return record;
    },
    update: async ({ where, data }: any) => {
      const key = where.id ?? [...table.keys()].find((k) =>
        matchWhere(table.get(k), where)
      );
      if (!key || !table.has(key)) throw new Error("not found");
      const updated = { ...table.get(key), ...data };
      table.set(key, updated);
      return updated;
    },
    upsert: async ({ where, update, create }: any) => {
      const key = where.id ?? [...table.keys()].find((k) =>
        matchWhere(table.get(k), where)
      );
      if (key && table.has(key)) {
        const updated = { ...table.get(key), ...update };
        table.set(key, updated);
        return updated;
      }
      const id = create.id ?? where.id ?? String(Date.now() + Math.random());
      const record = { id, ...create };
      table.set(id, record);
      return record;
    },
    delete: async ({ where }: any) => {
      const key = where.id ?? [...table.keys()].find((k) =>
        matchWhere(table.get(k), where)
      );
      if (key) table.delete(key);
      return {};
    },
    groupBy: async () => [],
    aggregate: async () => ({}),
  };
}

function matchWhere(entry: any, where: any): boolean {
  if (!where) return true;
  for (const [key, val] of Object.entries(where)) {
    if (key === "AND") {
      if (!(val as any[]).every((v) => matchWhere(entry, v))) return false;
    } else if (key === "OR") {
      if (!(val as any[]).some((v) => matchWhere(entry, v))) return false;
    } else if (key === "NOT") {
      if (matchWhere(entry, val)) return false;
    } else if (val && typeof val === "object") {
      // 操作符对象：{ contains, gte, lte, ... }
      const ev = entry?.[key];
      for (const [op, ov] of Object.entries(val as object)) {
        switch (op) {
          case "contains":
            if (!String(ev ?? "").includes(String(ov))) return false;
            break;
          case "gte":
            if (!(ev >= ov)) return false;
            break;
          case "lte":
            if (!(ev <= ov)) return false;
            break;
          case "gt":
            if (!(ev > ov)) return false;
            break;
          case "lt":
            if (!(ev < ov)) return false;
            break;
          case "in":
            if (!(ov as any[]).includes(ev)) return false;
            break;
        }
      }
    } else {
      if (entry?.[key] !== val) return false;
    }
  }
  return true;
}
