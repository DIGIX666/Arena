import axios from 'axios';
import Constants from 'expo-constants';

// Détection de l'hôte en dev : on récupère le debuggerHost ou on tombe sur localhost
function getDevHost(): string {
  // Sous SDK48+, Constants.manifest est null en build → on essaye expoConfig
  const manifest = (Constants as any).manifest ?? (Constants as any).expoConfig;
  // debuggerHost est généralement "192.168.x.x:19000"
  const debuggerHost: string | undefined =
    manifest?.debuggerHost ?? manifest?.packagerOpts?.hostUri;
  if (debuggerHost) {
    return debuggerHost.split(':')[0];
  }
  return 'localhost';
}

// Choix de l'URL de base
const BASE_URL = __DEV__
  ? `http://${getDevHost()}:3000/api`
  : 'https://api.mon-domaine.com/api';  // mettre ici votre URL de prod

const API = axios.create({ baseURL: BASE_URL });

export default {
  setToken(token: string) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  async verifyUsername(username: string): Promise<boolean> {
    const res = await API.get<{ available: boolean }>(`/verify-username/${username}`);
    return res.data.available;
  },

  async signup(email: string, password: string, username: string, chzAddress: string, keyEnc: string): Promise<string> {
    console.log('📡 Envoi des données d\'inscription:', { email, username, chzAddress: chzAddress.substring(0, 10) + '...' });
    const res = await API.post<{ token: string }>('/signup', { 
      email, 
      password, 
      username, 
      chzAddress, 
      keyEnc 
    });
    this.setToken(res.data.token);
    return res.data.token;
  },

  async login(email: string, password: string): Promise<string> {
    const res = await API.post<{ token: string }>('/login', { email, password });
    this.setToken(res.data.token);
    return res.data.token;
  },

  async getProfile(): Promise<{ username: string; chzAddress: string }> {
    const res = await API.get('/me');
    return res.data;
  },

  async downloadKey(): Promise<string> {
    const res = await API.post('/download-key', {});
    return res.data.keyEnc;
  },
};