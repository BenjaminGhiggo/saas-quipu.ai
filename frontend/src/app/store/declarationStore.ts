import { create } from 'zustand';
import { Declaration } from '@/shared/types';

interface DeclarationStore {
  declarations: Declaration[];
  currentDeclaration: Declaration | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchDeclarations: () => Promise<void>;
  createDeclaration: (data: any) => Promise<void>;
  updateDeclaration: (id: string, data: any) => Promise<void>;
  calculateDeclaration: (id: string) => Promise<void>;
  submitDeclaration: (id: string) => Promise<void>;
  payDeclaration: (id: string, paymentData: any) => Promise<void>;
  
  setCurrentDeclaration: (declaration: Declaration | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDeclarationStore = create<DeclarationStore>((set) => ({
  declarations: [],
  currentDeclaration: null,
  loading: false,
  error: null,

  fetchDeclarations: async () => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDeclarations: Declaration[] = [
        {
          id: '1',
          userId: 'user1',
          period: {
            month: 4,
            year: 2024,
            type: 'monthly',
            dueDate: '2024-05-19',
          },
          regime: {
            type: 'RER',
          },
          sales: {
            taxable: 5000,
            exempt: 0,
            export: 0,
            total: 5000,
            igvCollected: 900,
          },
          purchases: {
            taxable: 2000,
            exempt: 0,
            total: 2000,
            igvPaid: 360,
          },
          taxes: {
            igv: {
              collected: 900,
              paid: 360,
              balance: 540,
            },
            rent: {
              base: 5000,
              rate: 1.5,
              amount: 75,
              withheld: 0,
              balance: 75,
            },
          },
          payment: {
            totalToPay: 615,
            method: 'online',
          },
          sunat: {
            status: 'draft',
            formType: 'PDT621',
          },
          status: 'calculated' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      set({ declarations: mockDeclarations, loading: false });
    } catch (error) {
      set({ error: 'Error fetching declarations', loading: false });
    }
  },

  createDeclaration: async (data: any) => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newDeclaration: Declaration = {
        id: Date.now().toString(),
        userId: 'user1',
        period: data.period,
        regime: data.regime,
        sales: data.sales || { taxable: 0, exempt: 0, export: 0, total: 0, igvCollected: 0 },
        purchases: data.purchases || { taxable: 0, exempt: 0, total: 0, igvPaid: 0 },
        taxes: data.taxes || {
          igv: { collected: 0, paid: 0, balance: 0 },
          rent: { base: 0, rate: 0, amount: 0, withheld: 0, balance: 0 },
        },
        payment: data.payment || { totalToPay: 0, method: 'online' },
        sunat: {
          status: 'draft',
          formType: 'PDT621',
        },
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set(state => ({
        declarations: [...state.declarations, newDeclaration],
        currentDeclaration: newDeclaration,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error creating declaration', loading: false });
    }
  },

  updateDeclaration: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        declarations: state.declarations.map(declaration =>
          declaration.id === id 
            ? { ...declaration, ...data, updatedAt: new Date().toISOString() }
            : declaration
        ),
        currentDeclaration: state.currentDeclaration?.id === id
          ? { ...state.currentDeclaration, ...data, updatedAt: new Date().toISOString() }
          : state.currentDeclaration,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error updating declaration', loading: false });
    }
  },

  calculateDeclaration: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Mock calculation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock calculated values
      const calculatedData = {
        taxes: {
          igv: { collected: 900, paid: 360, balance: 540 },
          rent: { base: 5000, rate: 1.5, amount: 75, withheld: 0, balance: 75 },
        },
        payment: { totalToPay: 615, method: 'online' as const },
        status: 'calculated' as const,
      };
      
      set(state => ({
        declarations: state.declarations.map(declaration =>
          declaration.id === id 
            ? { ...declaration, ...calculatedData, updatedAt: new Date().toISOString() }
            : declaration
        ),
        currentDeclaration: state.currentDeclaration?.id === id
          ? { ...state.currentDeclaration, ...calculatedData, updatedAt: new Date().toISOString() }
          : state.currentDeclaration,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error calculating declaration', loading: false });
    }
  },

  submitDeclaration: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Mock SUNAT submission
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const submitData = {
        sunat: {
          status: 'submitted' as const,
          formType: 'PDT621',
          submittedAt: new Date().toISOString(),
          presentationNumber: `PDT${Date.now()}`,
        },
        status: 'submitted' as const,
      };
      
      set(state => ({
        declarations: state.declarations.map(declaration =>
          declaration.id === id 
            ? { ...declaration, ...submitData, updatedAt: new Date().toISOString() }
            : declaration
        ),
        currentDeclaration: state.currentDeclaration?.id === id
          ? { ...state.currentDeclaration, ...submitData, updatedAt: new Date().toISOString() }
          : state.currentDeclaration,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error submitting declaration', loading: false });
    }
  },

  payDeclaration: async (id: string, paymentData: any) => {
    set({ loading: true, error: null });
    try {
      // Mock payment processing
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const payData = {
        payment: {
          ...paymentData,
          paidAt: new Date().toISOString(),
          reference: `PAY${Date.now()}`,
        },
        status: 'paid' as const,
      };
      
      set(state => ({
        declarations: state.declarations.map(declaration =>
          declaration.id === id 
            ? { ...declaration, ...payData, updatedAt: new Date().toISOString() }
            : declaration
        ),
        currentDeclaration: state.currentDeclaration?.id === id
          ? { ...state.currentDeclaration, ...payData, updatedAt: new Date().toISOString() }
          : state.currentDeclaration,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error processing payment', loading: false });
    }
  },

  setCurrentDeclaration: (declaration: Declaration | null) => 
    set({ currentDeclaration: declaration }),
  
  setLoading: (loading: boolean) => set({ loading }),
  
  setError: (error: string | null) => set({ error }),
}));