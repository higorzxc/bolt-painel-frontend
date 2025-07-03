import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Client, Message, BotFlow, RemarketingFlow, Campaign, BotConfig, Statistics } from '../types';
import toast from 'react-hot-toast';
import axios from 'axios'; // Importação do Axios
import io, { Socket } from 'socket.io-client'; // Importação do Socket.IO Client

// ==============================================
// DEFINIÇÃO DA URL DO SEU BACKEND
// Esta URL virá do seu arquivo .env
// Certifique-se de que no seu .env você tem: VITE_API_URL=https://api.meuzap.shop:3000
// ==============================================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Adiciona um fallback para desenvolvimento local

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>; // Assíncrono agora
  logout: () => void;

  // WhatsApp Connection
  isWhatsAppConnected: boolean;
  qrCode: string | null;
  connectWhatsApp: () => Promise<void>;
  disconnectWhatsApp: () => Promise<void>; // Assíncrono agora

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => Promise<void>; // Assíncrono agora
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>; // Assíncrono agora
  deleteClient: (id: string) => Promise<void>; // Assíncrono agora
  moveClientToCategory: (clientId: string, category: Client['category']) => Promise<void>; // Assíncrono agora

  // Messages
  messages: Message[];
  sendMessage: (clientId: string, content: string, type: Message['type'], mediaUrl?: string) => Promise<void>; // Assíncrono agora

  // Bot Flows
  botFlows: BotFlow[];
  addBotFlow: (flow: Omit<BotFlow, 'id'>) => Promise<void>; // Assíncrono agora
  updateBotFlow: (id: string, updates: Partial<BotFlow>) => Promise<void>; // Assíncrono agora
  deleteBotFlow: (id: string) => Promise<void>; // Assíncrono agora

  // Remarketing Flows
  remarketingFlows: RemarketingFlow[];
  addRemarketingFlow: (flow: Omit<RemarketingFlow, 'id'>) => Promise<void>; // Assíncrono agora
  updateRemarketingFlow: (id: string, updates: Partial<RemarketingFlow>) => Promise<void>; // Assíncrono agora
  deleteRemarketingFlow: (id: string) => Promise<void>; // Assíncrono agora

  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => Promise<void>; // Assíncrono agora
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>; // Assíncrono agora
  deleteCampaign: (id: string) => Promise<void>; // Assíncrono agora

  // Bot Configuration
  botConfig: BotConfig;
  updateBotConfig: (updates: Partial<BotConfig>) => Promise<void>; // Assíncrono agora

  // Statistics
  statistics: Statistics;
  updateStatistics: () => Promise<void>; // Assíncrono agora

  // External Chat Integration
  publicChatUrl: string;
  updatePublicChatUrl: (url: string) => Promise<void>; // Assíncrono agora
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
      const token = localStorage.getItem('zapbot_token'); // Assumindo que você terá um token após o login
      if (!token) return;

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Carregar clientes
      const clientsRes = await axios.get(`${API_URL}/clients`);
      setClients(clientsRes.data);

      // Carregar fluxos do bot
      const botFlowsRes = await axios.get(`${API_URL}/bot-flows`);
      setBotFlows(botFlowsRes.data);

      // Carregar fluxos de remarketing
      const remarketingFlowsRes = await axios.get(`${API_URL}/remarketing-flows`);
      setRemarketingFlows(remarketingFlowsRes.data);

      // Carregar campanhas
      const campaignsRes = await axios.get(`${API_URL}/campaigns`);
      setCampaigns(campaignsRes.data);

      // Carregar config do bot
      const botConfigRes = await axios.get(`${API_URL}/bot-config`);
      setBotConfig(botConfigRes.data);

      // Carregar URL do chat público (se houver no backend)
      const publicChatUrlRes = await axios.get(`${API_URL}/public-chat-url`); // Exemplo
      if (publicChatUrlRes.data && publicChatUrlRes.data.url) {
        setPublicChatUrl(publicChatUrlRes.data.url);
      }
      
      // Carregar status da conexão WhatsApp e QR code
      const whatsappStatusRes = await axios.get(`${API_URL}/whatsapp/status`);
      setIsWhatsAppConnected(whatsappStatusRes.data.isConnected);
      if (!whatsappStatusRes.data.isConnected) {
        // Se não estiver conectado, solicitar um novo QR code
        await generateQRCode(); 
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
      // ALTERAÇÃO FEITA AQUI: /auth/login foi mudado para /api/login
      const response = await axios.post(`${API_URL}/api/login`, { password }); 
      
      if (response.data && response.data.token) {
        localStorage.setItem('zapbot_token', response.data.token); // Salva o token
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setIsAuthenticated(true);
        toast.success('Login realizado com sucesso!');
        loadInitialData(); // Carrega os dados após o login
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
    // Recarregar a página para limpar o estado e forçar um novo login
    window.location.reload(); 
  };


  // Conexão WhatsApp
  const connectWhatsApp = async (): Promise<void> => {
    // Esta função agora solicita um QR code real do backend
    try {
      setQrCode('loading'); // Indica que está carregando o QR Code
      const response = await axios.get(`${API_URL}/whatsapp/qr`);
      if (response.data && response.data.qrCode) {
        setQrCode(response.data.qrCode); // Recebe o QR Code do backend
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
      await axios.post(`${API_URL}/whatsapp/disconnect`);
      setIsWhatsAppConnected(false);
      setQrCode(null);
      toast.success('WhatsApp Business desconectado!');
      // Após desconectar, solicitar um novo QR Code automaticamente
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
      const response = await axios.post(`${API_URL}/clients`, client);
      setClients(prev => [...prev, response.data]);
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast.error('Erro ao adicionar cliente.');
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      const response = await axios.put(`${API_URL}/clients/${id}`, updates);
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
      await axios.delete(`${API_URL}/clients/${id}`);
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
      const response = await axios.post(`${API_URL}/messages/send`, newMessage);
      // Supondo que o backend retorna a mensagem com ID e timestamp
      setMessages(prev => [...prev, response.data]); 
      toast.success('Mensagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem.');
    }
  };

  const addBotFlow = async (flow: Omit<BotFlow, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/bot-flows`, flow);
      setBotFlows(prev => [...prev, response.data]);
      toast.success('Fluxo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar fluxo:', error);
      toast.error('Erro ao criar fluxo.');
    }
  };

  const updateBotFlow = async (id: string, updates: Partial<BotFlow>) => {
    try {
      const response = await axios.put(`${API_URL}/bot-flows/${id}`, updates);
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
      await axios.delete(`${API_URL}/bot-flows/${id}`);
      setBotFlows(prev => prev.filter(flow => flow.id !== id));
      toast.success('Fluxo removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover fluxo:', error);
      toast.error('Erro ao remover fluxo.');
    }
  };

  const addRemarketingFlow = async (flow: Omit<RemarketingFlow, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/remarketing-flows`, flow);
      setRemarketingFlows(prev => [...prev, response.data]);

      // Update campaign with remarketing flow ID (se o backend lidar com isso, senão, remover)
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
      const response = await axios.put(`${API_URL}/remarketing-flows/${id}`, updates);
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
        // Remove remarketing flow ID from campaign (se o backend lidar com isso, senão, remover)
        await updateCampaign(flow.campaignId, { remarketingFlowId: undefined });
      }
      await axios.delete(`${API_URL}/remarketing-flows/${id}`);
      setRemarketingFlows(prev => prev.filter(flow => flow.id !== id));
      toast.success('Fluxo de remarketing removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover fluxo de remarketing:', error);
      toast.error('Erro ao remover fluxo de remarketing.');
    }
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id'>) => {
    try {
      const response = await axios.post(`${API_URL}/campaigns`, campaign);
      setCampaigns(prev => [...prev, response.data]);
      toast.success('Campanha criada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar campanha:', error);
      toast.error('Erro ao criar campanha.');
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const response = await axios.put(`${API_URL}/campaigns/${id}`, updates);
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
      // Remover fluxos de remarketing associados (se o backend lidar com isso, senão, remover)
      const associatedFlows = remarketingFlows.filter(flow => flow.campaignId === id);
      for (const flow of associatedFlows) {
        await axios.delete(`${API_URL}/remarketing-flows/${flow.id}`);
      }
      
      await axios.delete(`${API_URL}/campaigns/${id}`);
      setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
      toast.success('Campanha removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover campanha:', error);
      toast.error('Erro ao remover campanha.');
    }
  };

  const updateBotConfig = async (updates: Partial<BotConfig>) => {
    try {
      const response = await axios.put(`${API_URL}/bot-config`, updates);
      setBotConfig(response.data);
      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar config do bot:', error);
      toast.error('Erro ao salvar configuração.');
    }
  };

  const updatePublicChatUrl = async (url: string) => {
    try {
      const response = await axios.post(`${API_URL}/public-chat-url`, { url }); // Exemplo
      setPublicChatUrl(response.data.url);
      toast.success('URL do chat público salva com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar URL do chat público:', error);
      toast.error('Erro ao salvar URL do chat público.');
    }
  };

  const updateStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics`);
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
      loadInitialData(); // Carregar dados se já autenticado
    } else {
      setIsAuthenticated(false);
    }

    // Inicialização do Socket.IO
    if (!socketRef.current && isAuthenticated) { // Conecta apenas se autenticado
      const socket = io(API_URL); // Conecta ao seu backend
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Conectado ao servidor Socket.IO');
      });

      socket.on('disconnect', () => {
        console.log('Desconectado do servidor Socket.IO');
        setIsWhatsAppConnected(false); // Assume desconectado ao perder a conexão do Socket
        setQrCode(null);
      });

      // Ouvir eventos do WhatsApp
      socket.on('qr', (data: { qr: string }) => {
        setQrCode(data.qr);
        setIsWhatsAppConnected(false);
        toast('Novo QR Code disponível. Escaneie para conectar.');
      });

      socket.on('whatsapp-connected', () => {
        setIsWhatsAppConnected(true);
        setQrCode(null); // Limpa o QR code ao conectar
        toast.success('WhatsApp Business conectado com sucesso!');
      });

      socket.on('whatsapp-disconnected', () => {
        setIsWhatsAppConnected(false);
        setQrCode(null);
        toast.error('WhatsApp Business desconectado!');
        // Se desconectado pelo backend, o backend deve emitir um novo 'qr'
      });

      socket.on('message', (data: Message) => {
        // Receber mensagens do backend (ex: mensagens de clientes)
        setMessages(prev => [...prev, data]);
        toast(`Nova mensagem de ${data.clientId}`); // Ou do nome do cliente
      });

      // Limpar a conexão do Socket.IO ao desmontar o componente ou desautenticar
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isAuthenticated]); // Depende da autenticação

  // Para garantir que as estatísticas são atualizadas regularmente (pode ser via Socket também)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated) {
        updateStatistics();
      }
    }, 30000); // Atualiza a cada 30 segundos

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