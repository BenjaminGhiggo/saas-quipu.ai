import { SunatCredentials, SireAuthToken, SirePeriod, SireTicket } from '@/shared/types';

// Configuración de URLs SIRE
const SIRE_CONFIG = {
  AUTH_URL: 'https://api-seguridad.sunat.gob.pe/v1/clientessol',
  API_BASE_URL: 'https://apisire.sunat.gob.pe/v1/contribuyente/migeigv/libros',
  SCOPE: 'https://api-sire.sunat.gob.pe',
  BOOK_CODE: '140000' // RVIE
};

// Mock mode para desarrollo
const MOCK_MODE = import.meta.env.VITE_SIRE_MOCK_MODE === 'true';

class SireApiService {
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  // ========================================
  // AUTENTICACIÓN
  // ========================================

  async authenticate(credentials: SunatCredentials): Promise<SireAuthToken> {
    if (MOCK_MODE) {
      return this.mockAuthenticate(credentials);
    }

    try {
      const authUrl = `${SIRE_CONFIG.AUTH_URL}/${credentials.clientId}/oauth2/token/`;
      
      const formData = new URLSearchParams({
        grant_type: 'password',
        scope: SIRE_CONFIG.SCOPE,
        client_id: credentials.clientId || '',
        client_secret: credentials.clientSecret || '',
        username: `${credentials.ruc}${credentials.usuarioSOL}`,
        password: credentials.claveSOL
      });

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Error de autenticación: ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.token = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      return tokenData;
    } catch (error) {
      throw new Error(`Error al autenticar con SUNAT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async mockAuthenticate(credentials: SunatCredentials): Promise<SireAuthToken> {
    // Simulación para desarrollo
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.ruc && credentials.usuarioSOL && credentials.claveSOL) {
      const mockToken = {
        access_token: `mock_token_${Date.now()}`,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: SIRE_CONFIG.SCOPE,
        issued_at: new Date().toISOString()
      };
      
      this.token = mockToken.access_token;
      this.tokenExpiry = Date.now() + (mockToken.expires_in * 1000);
      
      return mockToken;
    } else {
      throw new Error('Credenciales inválidas');
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      throw new Error('Token expirado. Debe autenticarse nuevamente.');
    }
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // ========================================
  // CONSULTAS
  // ========================================

  async consultarPeriodos(): Promise<SirePeriod[]> {
    if (MOCK_MODE) {
      return this.mockConsultarPeriodos();
    }

    await this.ensureAuthenticated();
    
    try {
      const url = `${SIRE_CONFIG.API_BASE_URL}/rvierce/padron/web/omisos/${SIRE_CONFIG.BOOK_CODE}/periodos`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al consultar períodos: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al consultar períodos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async mockConsultarPeriodos(): Promise<SirePeriod[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    return [
      {
        numEjercicio: currentYear.toString(),
        desEstado: 'Activo',
        lisPeriodos: Array.from({ length: currentMonth }, (_, i) => ({
          perTributario: `${currentYear}${String(i + 1).padStart(2, '0')}`,
          codEstado: '1',
          desEstado: 'Disponible'
        }))
      }
    ];
  }

  async consultarEstadoTicket(numTicket: string): Promise<SireTicket> {
    if (MOCK_MODE) {
      return this.mockConsultarEstadoTicket(numTicket);
    }

    await this.ensureAuthenticated();
    
    try {
      const url = `${SIRE_CONFIG.API_BASE_URL}/rvierce/gestionticket/web/ticket/${numTicket}/estadoenvio`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al consultar ticket: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al consultar ticket: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async mockConsultarEstadoTicket(numTicket: string): Promise<SireTicket> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      numTicket,
      estado: 'Terminado',
      fechaCreacion: new Date().toISOString(),
      fechaTermino: new Date().toISOString(),
      nombreArchivo: `propuesta_${numTicket}.zip`
    };
  }

  // ========================================
  // PROPUESTAS
  // ========================================

  async descargarPropuesta(perTributario: string): Promise<{ numTicket: string }> {
    if (MOCK_MODE) {
      return this.mockDescargarPropuesta(perTributario);
    }

    await this.ensureAuthenticated();
    
    try {
      const url = `${SIRE_CONFIG.API_BASE_URL}/rvierce/gestionpropuesta/web/propuesta/${perTributario}/descargapropuesta`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al descargar propuesta: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al descargar propuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async mockDescargarPropuesta(_perTributario: string): Promise<{ numTicket: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      numTicket: `${new Date().getFullYear()}01${Math.random().toString().slice(2, 10)}`
    };
  }

  async aceptarPropuesta(perTributario: string): Promise<{ numTicket: string }> {
    if (MOCK_MODE) {
      return this.mockAceptarPropuesta(perTributario);
    }

    await this.ensureAuthenticated();
    
    try {
      const url = `${SIRE_CONFIG.API_BASE_URL}/rvie/propuesta/web/propuesta/${perTributario}/aceptapropuesta`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al aceptar propuesta: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Error al aceptar propuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async mockAceptarPropuesta(_perTributario: string): Promise<{ numTicket: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      numTicket: `${new Date().getFullYear()}02${Math.random().toString().slice(2, 10)}`
    };
  }

  // ========================================
  // PRELIMINAR
  // ========================================

  async registrarPreliminar(perTributario: string): Promise<{ success: boolean }> {
    if (MOCK_MODE) {
      return this.mockRegistrarPreliminar(perTributario);
    }

    await this.ensureAuthenticated();
    
    try {
      const url = `${SIRE_CONFIG.API_BASE_URL}/rvierce/gestionlibro/web/registroslibros/${perTributario}/registrapreliminar`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error al registrar preliminar: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error al registrar preliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async mockRegistrarPreliminar(_perTributario: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  }

  // ========================================
  // ARCHIVOS
  // ========================================

  async descargarArchivo(numTicket: string): Promise<Blob> {
    if (MOCK_MODE) {
      return this.mockDescargarArchivo(numTicket);
    }

    await this.ensureAuthenticated();
    
    try {
      const url = `${SIRE_CONFIG.API_BASE_URL}/rvierce/gestionticket/web/ticket/${numTicket}/descargararchivo`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error al descargar archivo: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      throw new Error(`Error al descargar archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private async mockDescargarArchivo(numTicket: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear un archivo ZIP simulado
    const content = `Mock file content for ticket: ${numTicket}\nGenerated at: ${new Date().toISOString()}`;
    return new Blob([content], { type: 'application/zip' });
  }

  // ========================================
  // UTILIDADES
  // ========================================

  async agregarTipoCambio(perTributario: string, tiposCambio: Array<{
    fecEmision: string;
    codMoneda: string;
    mtoTipoCambio: string;
    mtoCambioMonedaExt?: string;
  }>): Promise<{ success: boolean }> {
    if (MOCK_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    }

    await this.ensureAuthenticated();
    
    try {
      const url = `${SIRE_CONFIG.API_BASE_URL}/rvie/propuesta/web/masivo/${perTributario}/guardacomplementomasivo`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(tiposCambio)
      });

      if (!response.ok) {
        throw new Error(`Error al agregar tipo de cambio: ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Error al agregar tipo de cambio: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // ========================================
  // GESTIÓN DE ESTADO
  // ========================================

  isAuthenticated(): boolean {
    return !!(this.token && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }

  logout(): void {
    this.token = null;
    this.tokenExpiry = null;
  }

  getTokenInfo(): { token: string | null; expiresIn: number | null } {
    return {
      token: this.token,
      expiresIn: this.tokenExpiry ? Math.max(0, this.tokenExpiry - Date.now()) : null
    };
  }
}

export const sireApi = new SireApiService();