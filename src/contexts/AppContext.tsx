import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client, Message, BotFlow, RemarketingFlow, Campaign, BotConfig, Statistics } from '../types';
import toast from 'react-hot-toast';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';

// ==============================================
// DEFINIÇÃO DA URL DO SEU BACKEND
// Esta URL virá do seu arquivo .env
// Certifique-se de que no seu .env você tem: VITE_API_URL=https://api.meuzap.shop:3000
// ==============================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;

  // WhatsApp Connection
  isWhatsAppConnected: boolean;
  qrCode: string | null;
  connectWhatsApp: () => Promise<void>;
  disconnectWhatsApp: () => Promise<void>;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  moveClientToCategory: (clientId: string, category: Client['category']) => Promise<void>;

  // Messages
  messages: Message[];
  sendMessage: (clientId: string, content: string, type: Message['type'], mediaUrl?: string) => Promise<void>;

  // Bot Flows
  botFlows: BotFlow[];
  addBotFlow: (flow: Omit<BotFlow, 'id'>) => Promise<void>;
  updateBotFlow: (id: string, updates: Partial<BotFlow>) => Promise<void>;
  deleteBotFlow: (id: string) => Promise<void>;

  // Remarketing Flows
  remarketingFlows: RemarketingFlow[];
  addRemarketingFlow: (flow: Omit<RemarketingFlow, 'id'>) => Promise<void>;
  updateRemarketingFlow: (id: string, updates: Partial<RemarketingFlow>) => Promise<void>;
  deleteRemarketingFlow: (id: string) => Promise<void>;

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  // Bot Configuration
  botConfig: BotConfig;
  updateBotConfig: (updates: Partial<BotConfig>) => Promise<void>;

  // Statistics
  statistics: Statistics;
  updateStatistics: () => Promise<void>;

  // External Chat Integration
  publicChatUrl: string;
  updatePublicChatUrl: (url: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (undefined === context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9); // Manter para IDs locais se necessário, mas o backend deve gerar IDs

// Mock data (será substituída por dados do backend)
// Removidos ou alterados para serem carregados do backend
const mockClients: Client[] = [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [messages, setMessages] = useState<Message[]>([]);
  const [botFlows, setBotFlows] = useState<BotFlow[]>([]);
  const [remarketingFlows, setRemarketingFlows] = useState<RemarketingFlow[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [publicChatUrl, setPublicChatUrl] = useState<string>('');
  const [botConfig, setBotConfig] = useState<BotConfig>({
    attendantName: 'Assistente Virtual',
    welcomeAudio: true,
    autoResponse: true,
    allowClientAudio: true,
    allowClientVideo: true,
    allowClientImages: true
  });
  const [statistics, setStatistics] = useState<Statistics>({
    totalConversations: 0,
    activeConversations: 0,
    abandonedConversations: 0,
    responseRate: 0,
    conversionRate: 0,
    dailyMessages: 0
  });

  // Ref para a instância do Socket.IO
  const socketRef = useRef<Socket | null>(null);

  // ==============================================
  // FUNÇÕES DE COMUNICAÇÃO COM O BACKEND
  // ==============================================

  // Função para carregar dados iniciais do backend
  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('zapbot_token');
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Carregar clientes
      const clientsRes = await axios.get(`${API_URL}/api/clients`); // <--- CORRIGIDO AQUI
      setClients(clientsRes.data);

      // Carregar fluxos do bot
      const botFlowsRes = await axios.get(`${API_URL}/api/bot-flows`);
      setBotFlows(botFlowsRes.data);

      // Carregar fluxos de remarketing
      const remarketingFlowsRes = await axios.get(`${API_URL}/api/remarketing-flows`);
      setRemarketingFlows(remarketingFlowsRes.data);

      // Carregar campanhas
      const campaignsRes = await axios.get(`${API_URL}/api/campaigns`);
      setCampaigns(campaignsRes.data);

      // Carregar config do bot
      const botConfigRes = await axios.get(`${API_URL}/api/bot-config`);
      setBotConfig(botConfigRes.data);

      // Carregar URL do chat público (se houver no backend)
      const publicChatUrlRes = await axios.get(`${API_URL}/api/public-chat-url`); // Exemplo
      if (publicChatUrlRes.data && publicChatUrlRes.data.url) {
        setPublicChatUrl(publicChatUrlRes.data.url);
      }
      
      // Carregar status da conexão WhatsApp e QR code
      const whatsappStatusRes = await axios.get(`${API_URL}/api/whatsapp/status`);
      setIsWhatsAppConnected(whatsappStatusRes.data.isConnected);
      if (!whatsappStatusRes.data.isConnected) {
        // Se não estiver conectado, solicitar um novo QR code
        await connectWhatsApp(); // Usar connectWhatsApp para gerar QR
      } else {
        setQrCode(null); // Limpar QR code se já conectado
      }

      toast.success('Dados iniciais carregados!');

    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais do servidor.');
    }
  };

  // Autenticação
  const login = async (password: string): Promise<boolean> => {
    try {
      // Ajuste para a rota de login real no backend
      const response = await axios.post(`${API_URL}/api/login`, { password });
      
      if (response.data && response.data.token) {
        localStorage.setItem('zapbot_token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsAuthenticated(true);
        toast.success('Login realizado com sucesso!');
        loadInitialData();
        return true;
      }
      toast.error('Senha ou usuário incorretos!');
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro ao tentar fazer login. Verifique as credenciais ou o servidor.');
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('zapbot_token');
    delete axios.defaults.headers.common['Authorization'];
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    toast.success('Logout realizado com sucesso!');
    window.location.reload();
  };

  // Conexão WhatsApp
  const connectWhatsApp = async (): Promise<void> => {
    try {
      setQrCode('loading');
      const response = await axios.get(`${API_URL}/api/qr`); // <--- CORRIGIDO AQUI
      if (response.data && response.data.qrCode) {
        setQrCode(response.data.qrCode);
        toast('Aguardando escaneamento do QR Code...');
      } else {
        toast.error('Nenhum QR Code recebido do backend.');
        setQrCode(null);
      }
    } catch (error) {
      console.error('Erro ao conectar WhatsApp (solicitar QR):', error);
      toast.error('Erro ao solicitar QR Code do servidor.');
      setQrCode(null);
    }
  };

  const disconnectWhatsApp = async (): Promise<void> => {
    try {
      await axios.post(`${API_URL}/api/whatsapp/disconnect`); // <--- CORRIGIDO AQUI
      setIsWhatsAppConnected(false);
      setQrCode(null);
      toast.success('WhatsApp Business desconectado!');
      await connectWhatsApp();
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      toast.error('Erro ao desconectar WhatsApp no servidor.');
    }
  };

  // ==============================================
  // GERENCIAMENTO DE DADOS (Clientes, Fluxos, etc.)
  // Todas as funções agora fazem chamadas de API
  // ==============================================

  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/api/clients`, client); // <--- CORRIGIDO AQUI
      setClients(prev => [...prev, response.data]);
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Erro ao adicionar cliente.');
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const response = await axios.put(`${API_URL}/api/clients/${id}`, updates); // <--- CORRIGIDO AQUI
      setClients(prev => prev.map(client =>
        client.id === id ? response.data : client
      ));
      toast.success('Cliente atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast.error('Erro ao atualizar cliente.');
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/clients/${id}`); // <--- CORRIGIDO AQUI
      setClients(prev => prev.filter(client => client.id !== id));
      toast.success('Cliente removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast.error('Erro ao remover cliente.');
    }
  };

  const moveClientToCategory = async (clientId: string, category: Client['category']) => {
    await updateClient(clientId, { category });
  };

  const sendMessage = async (clientId: string, content: string, type: Message['type'], mediaUrl?: string) => {
    try {
      const newMessage = { clientId, content, type, mediaUrl };
      const response = await axios.post(`${API_URL}/api/messages/send`, newMessage);
      setMessages(prev => [...prev, response.data]);
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem.');
    }
  };

  const addBotFlow = async (flow: Omit<BotFlow, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/api/bot-flows`, flow);
      setBotFlows(prev => [...prev, response.data]);
      toast.success('Fluxo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar fluxo:', error);
      toast.error('Erro ao criar fluxo.');
    }
  };

  const updateBotFlow = async (id: string, updates: Partial<BotFlow>) => {
    try {
      const response = await axios.put(`${API_URL}/api/bot-flows/${id}`, updates);
      setBotFlows(prev => prev.map(flow =>
        flow.id === id ? response.data : flow
      ));
      toast.success('Fluxo atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar fluxo:', error);
      toast.error('Erro ao atualizar fluxo.');
    }
  };

  const deleteBotFlow = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/bot-flows/${id}`);
      setBotFlows(prev => prev.filter(flow => flow.id !== id));
      toast.success('Fluxo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover fluxo:', error);
      toast.error('Erro ao remover fluxo.');
    }
  };

  const addRemarketingFlow = async (flow: Omit<RemarketingFlow, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/api/remarketing-flows`, flow);
      setRemarketingFlows(prev => [...prev, response.data]);

      if (flow.campaignId) {
        await updateCampaign(flow.campaignId, { remarketingFlowId: response.data.id });
      }

      toast.success('Fluxo de remarketing criado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar fluxo de remarketing:', error);
      toast.error('Erro ao criar fluxo de remarketing.');
    }
  };

  const updateRemarketingFlow = async (id: string, updates: Partial<RemarketingFlow>) => {
    try {
      const response = await axios.put(`${API_URL}/api/remarketing-flows/${id}`, updates);
      setRemarketingFlows(prev => prev.map(flow =>
        flow.id === id ? response.data : flow
      ));
      toast.success('Fluxo de remarketing atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar fluxo de remarketing:', error);
      toast.error('Erro ao atualizar fluxo de remarketing.');
    }
  };

  const deleteRemarketingFlow = async (id: string) => {
    try {
      const flow = remarketingFlows.find(f => f.id === id);
      if (flow && flow.campaignId) {
        await updateCampaign(flow.campaignId, { remarketingFlowId: undefined });
      }
      await axios.delete(`${API_URL}/api/remarketing-flows/${id}`);
      setRemarketingFlows(prev => prev.filter(flow => flow.id !== id));
      toast.success('Fluxo de remarketing removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover fluxo de remarketing:', error);
      toast.error('Erro ao remover fluxo de remarketing.');
    }
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/api/campaigns`, campaign);
      setCampaigns(prev => [...prev, response.data]);
      toast.success('Campanha criada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar campanha:', error);
      toast.error('Erro ao criar campanha.');
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const response = await axios.put(`${API_URL}/api/campaigns/${id}`, updates);
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === id ? response.data : campaign
      ));
      if (!updates.remarketingFlowId && updates.remarketingFlowId !== undefined) {
        toast.success('Campanha atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      toast.error('Erro ao atualizar campanha.');
    }
  };

  const deleteCampaign = async (id: string) => {
    try {
      const associatedFlows = remarketingFlows.filter(flow => flow.campaignId === id);
      for (const flow of associatedFlows) {
        await axios.delete(`${API_URL}/api/remarketing-flows/${flow.id}`);
      }
      
      await axios.delete(`${API_URL}/api/campaigns/${id}`);
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
      toast.success('Campanha removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover campanha:', error);
      toast.error('Erro ao remover campanha.');
    }
  };

  const updateBotConfig = async (updates: Partial<BotConfig>) => {
    try {
      const response = await axios.put(`${API_URL}/api/bot-config`, updates);
      setBotConfig(response.data);
      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar config do bot:', error);
      toast.error('Erro ao salvar configuração.');
    }
  };

  const updatePublicChatUrl = async (url: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/public-chat-url`, { url });
      setPublicChatUrl(response.data.url);
      toast.success('URL do chat público salva com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar URL do chat público:', error);
      toast.error('Erro ao salvar URL do chat público.');
    }
  };

  const updateStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/statistics`); // <--- CORRIGIDO AQUI
      setStatistics(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas.');
    }
  };

  // ==============================================
  // EFEITOS E CONEXÃO INICIAL
  // ==============================================
  useEffect(() => {
    const token = localStorage.getItem('zapbot_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      loadInitialData();
    } else {
      setIsAuthenticated(false);
    }

    if (!socketRef.current && isAuthenticated) {
      const socket = io(API_URL);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Conectado ao servidor Socket.IO');
      });

      socket.on('disconnect', () => {
        console.log('Desconectado do servidor Socket.IO');
        setIsWhatsAppConnected(false);
        setQrCode(null);
      });

      socket.on('qr', (data: { qr: string }) => {
        setQrCode(data.qr);
        setIsWhatsAppConnected(false);
        toast('Novo QR Code disponível. Escaneie para conectar.');
      });

      socket.on('whatsapp-connected', () => {
        setIsWhatsAppConnected(true);
        setQrCode(null);
        toast.success('WhatsApp Business conectado com sucesso!');
      });

      socket.on('whatsapp-disconnected', () => {
        setIsWhatsAppConnected(false);
        setQrCode(null);
        toast.error('WhatsApp Business desconectado!');
      });

      socket.on('message', (data: Message) => {
        setMessages(prev => [...prev, data]);
        toast(`Nova mensagem de ${data.clientId}`);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        updateStatistics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: AppContextType = {
    isAuthenticated,
    login,
    logout,
    isWhatsAppConnected,
    qrCode,
    connectWhatsApp,
    disconnectWhatsApp,
    clients,
    addClient,
    updateClient,
    deleteClient,
    moveClientToCategory,
    messages,
    sendMessage,
    botFlows,
    addBotFlow,
    updateBotFlow,
    deleteBotFlow,
    remarketingFlows,
    addRemarketingFlow,
    updateRemarketingFlow,
    deleteRemarketingFlow,
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    botConfig,
    updateBotConfig,
    statistics,
    updateStatistics,
    publicChatUrl,
    updatePublicChatUrl
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};