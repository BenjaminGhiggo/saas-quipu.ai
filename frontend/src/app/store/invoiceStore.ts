import { create } from 'zustand';
import { Invoice } from '@/shared/types';

interface InvoiceStore {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchInvoices: () => Promise<void>;
  createInvoice: (data: any) => Promise<void>;
  updateInvoice: (id: string, data: any) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  uploadInvoice: (file: File) => Promise<void>;
  sendToSunat: (id: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set) => ({
  invoices: [],
  loading: false,
  error: null,

  fetchInvoices: async () => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'boleta',
          series: 'B001',
          number: 123,
          fullNumber: 'B001-00000123',
          client: {
            documentType: 'DNI',
            documentNumber: '12345678',
            name: 'Juan Pérez',
            email: 'juan@email.com',
          },
          items: [],
          amounts: {
            subtotal: 100.00,
            igv: 18.00,
            total: 118.00,
          },
          payment: {
            method: 'cash',
            currency: 'PEN',
          },
          sunat: {
            status: 'accepted',
          },
          issueDate: new Date().toISOString(),
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      set({ invoices: mockInvoices, loading: false });
    } catch (error) {
      set({ error: 'Error fetching invoices', loading: false });
    }
  },

  createInvoice: async (data: any) => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set(state => ({
        invoices: [...state.invoices, newInvoice],
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error creating invoice', loading: false });
    }
  },

  updateInvoice: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        invoices: state.invoices.map(invoice =>
          invoice.id === id 
            ? { ...invoice, ...data, updatedAt: new Date().toISOString() }
            : invoice
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error updating invoice', loading: false });
    }
  },

  deleteInvoice: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        invoices: state.invoices.filter(invoice => invoice.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error deleting invoice', loading: false });
    }
  },

  uploadInvoice: async (file: File) => {
    set({ loading: true, error: null });
    try {
      // Mock file upload and OCR processing
      console.log('Processing file:', file.name);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock extracted data - in real app this would be added to invoices
      const extractedData = {
        type: 'boleta' as const,
        client: {
          documentType: 'DNI' as const,
          documentNumber: '12345678',
          name: 'Cliente Extraído',
        },
        amounts: {
          subtotal: 100.00,
          igv: 18.00,
          total: 118.00,
        },
        confidence: 85,
      };
      
      // In real app, would add to invoices list
      console.log('Extracted data:', extractedData);
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error uploading invoice', loading: false });
      throw error;
    }
  },

  sendToSunat: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // Mock SUNAT submission
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      set(state => ({
        invoices: state.invoices.map(invoice =>
          invoice.id === id
            ? {
                ...invoice,
                sunat: {
                  ...invoice.sunat,
                  status: 'accepted',
                  sentAt: new Date().toISOString(),
                  acceptedAt: new Date().toISOString(),
                },
                updatedAt: new Date().toISOString(),
              }
            : invoice
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Error sending to SUNAT', loading: false });
      throw error;
    }
  },

  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
}));