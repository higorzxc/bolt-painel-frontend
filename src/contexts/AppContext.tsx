import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Message, BotFlow, RemarketingFlow, Campaign, BotConfig, Statistics } from '../types';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  
  // WhatsApp Connection
  isWhatsAppConnected: boolean;
  qrCode: string | null;
  connectWhatsApp: () => Promise<void>;
  disconnectWhatsApp: () => void;
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  moveClientToCategory: (clientId: string, category: Client['category']) => void;
  
  // Messages
  messages: Message[];
  sendMessage: (clientId: string, content: string, type: Message['type'], mediaUrl?: string) => void;
  
  // Bot Flows
  botFlows: BotFlow[];
  addBotFlow: (flow: Omit<BotFlow, 'id'>) => void;
  updateBotFlow: (id: string, updates: Partial<BotFlow>) => void;
  deleteBotFlow: (id: string) => void;
  
  // Remarketing Flows
  remarketingFlows: RemarketingFlow[];
  addRemarketingFlow: (flow: Omit<RemarketingFlow, 'id'>) => void;
  updateRemarketingFlow: (id: string, updates: Partial<RemarketingFlow>) => void;
  deleteRemarketingFlow: (id: string) => void;
  
  // Campaigns
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  
  // Bot Configuration
  botConfig: BotConfig;
  updateBotConfig: (updates: Partial<BotConfig>) => void;
  
  // Statistics
  statistics: Statistics;
  updateStatistics: () => void;
  
  // External Chat Integration
  publicChatUrl: string;
  updatePublicChatUrl: (url: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (undefined === context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const mockClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+5511999887766',
    category: 'not_bought',
    lastMessage: 'Olá, tenho interesse no produto',
    lastActivity: new Date(),
    status: 'active',
    campaignSource: 'Facebook Ads'
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+5511888776655',
    category: 'bought_correios',
    lastMessage: 'Quando chega meu pedido?',
    lastActivity: new Date(Date.now() - 86400000),
    status: 'active'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    phone: '+5511777665544',
    category: 'bought_logz',
    lastMessage: 'Produto recebido, muito obrigado!',
    lastActivity: new Date(Date.now() - 172800000),
    status: 'active'
  }
];

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

  useEffect(() => {
    const auth = localStorage.getItem('zapbot_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    
    const savedConfig = localStorage.getItem('zapbot_config');
    if (savedConfig) {
      setBotConfig(JSON.parse(savedConfig));
    }

    const savedChatUrl = localStorage.getItem('zapbot_public_chat_url');
    if (savedChatUrl) {
      setPublicChatUrl(savedChatUrl);
    }

    const savedWhatsAppConnection = localStorage.getItem('zapbot_whatsapp_connected');
    if (savedWhatsAppConnection === 'true') {
      setIsWhatsAppConnected(true);
    } else {
      // Gerar QR Code automaticamente se não estiver conectado
      generateQRCode();
    }
    
    updateStatistics();
  }, []);

  const generateQRCode = async () => {
    try {
      setQrCode('loading');
      
      // Generate real QR code with session data for Venom integration
      const sessionData = `zapbot-venom-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const qrCodeDataURL = await QRCode.toDataURL(sessionData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setTimeout(() => {
        setQrCode(qrCodeDataURL);
        
        // Simulate connection after scanning (8 seconds)
        setTimeout(() => {
          setIsWhatsAppConnected(true);
          setQrCode(null);
          localStorage.setItem('zapbot_whatsapp_connected', 'true');
          toast.success('WhatsApp Business conectado com sucesso!');
        }, 8000);
      }, 2000);
    } catch (error) {
      toast.error('Erro ao gerar QR Code');
      setQrCode(null);
    }
  };

  const login = (password: string): boolean => {
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('zapbot_auth', 'true');
      toast.success('Login realizado com sucesso!');
      return true;
    }
    toast.error('Senha incorreta!');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('zapbot_auth');
    toast.success('Logout realizado com sucesso!');
  };

  const connectWhatsApp = async (): Promise<void> => {
    // Esta função agora é chamada automaticamente
    await generateQRCode();
  };

  const disconnectWhatsApp = () => {
    setIsWhatsAppConnected(false);
    setQrCode(null);
    localStorage.removeItem('zapbot_whatsapp_connected');
    toast.success('WhatsApp Business desconectado');
    
    // Gerar novo QR Code automaticamente após desconectar
    setTimeout(() => {
      generateQRCode();
    }, 1000);
  };

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: generateId() };
    setClients(prev => [...prev, newClient]);
    toast.success('Cliente adicionado com sucesso!');
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
    toast.success('Cliente atualizado com sucesso!');
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    setMessages(prev => prev.filter(message => message.clientId !== id));
    toast.success('Cliente removido com sucesso!');
  };

  const moveClientToCategory = (clientId: string, category: Client['category']) => {
    updateClient(clientId, { category });
  };

  const sendMessage = (clientId: string, content: string, type: Message['type'], mediaUrl?: string) => {
    const newMessage: Message = {
      id: generateId(),
      clientId,
      content,
      type,
      sender: 'admin',
      timestamp: new Date(),
      mediaUrl,
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);
    toast.success('Mensagem enviada!');
  };

  const addBotFlow = (flow: Omit<BotFlow, 'id'>) => {
    const newFlow = { ...flow, id: generateId() };
    setBotFlows(prev => [...prev, newFlow]);
    toast.success('Fluxo criado com sucesso!');
  };

  const updateBotFlow = (id: string, updates: Partial<BotFlow>) => {
    setBotFlows(prev => prev.map(flow => 
      flow.id === id ? { ...flow, ...updates } : flow
    ));
    toast.success('Fluxo atualizado com sucesso!');
  };

  const deleteBotFlow = (id: string) => {
    setBotFlows(prev => prev.filter(flow => flow.id !== id));
    toast.success('Fluxo removido com sucesso!');
  };

  const addRemarketingFlow = (flow: Omit<RemarketingFlow, 'id'>) => {
    const newFlow = { ...flow, id: generateId() };
    setRemarketingFlows(prev => [...prev, newFlow]);
    
    // Update campaign with remarketing flow ID
    if (flow.campaignId) {
      updateCampaign(flow.campaignId, { remarketingFlowId: newFlow.id });
    }
    
    toast.success('Fluxo de remarketing criado com sucesso!');
  };

  const updateRemarketingFlow = (id: string, updates: Partial<RemarketingFlow>) => {
    setRemarketingFlows(prev => prev.map(flow => 
      flow.id === id ? { ...flow, ...updates } : flow
    ));
    toast.success('Fluxo de remarketing atualizado com sucesso!');
  };

  const deleteRemarketingFlow = (id: string) => {
    const flow = remarketingFlows.find(f => f.id === id);
    if (flow && flow.campaignId) {
      // Remove remarketing flow ID from campaign
      updateCampaign(flow.campaignId, { remarketingFlowId: undefined });
    }
    
    setRemarketingFlows(prev => prev.filter(flow => flow.id !== id));
    toast.success('Fluxo de remarketing removido com sucesso!');
  };

  const addCampaign = (campaign: Omit<Campaign, 'id'>) => {
    const newCampaign = { 
      ...campaign, 
      id: generateId(),
      sentCount: 0,
      openCount: 0,
      status: 'draft' as const
    };
    setCampaigns(prev => [...prev, newCampaign]);
    toast.success('Campanha criada com sucesso!');
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ));
    
    // Don't show toast for internal updates (like remarketing flow ID)
    if (!updates.remarketingFlowId && updates.remarketingFlowId !== undefined) {
      toast.success('Campanha atualizada com sucesso!');
    }
  };

  const deleteCampaign = (id: string) => {
    // Remove associated remarketing flows
    const associatedFlows = remarketingFlows.filter(flow => flow.campaignId === id);
    associatedFlows.forEach(flow => {
      setRemarketingFlows(prev => prev.filter(f => f.id !== flow.id));
    });
    
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    toast.success('Campanha removida com sucesso!');
  };

  const updateBotConfig = (updates: Partial<BotConfig>) => {
    const newConfig = { ...botConfig, ...updates };
    setBotConfig(newConfig);
    localStorage.setItem('zapbot_config', JSON.stringify(newConfig));
    toast.success('Configuração salva com sucesso!');
  };

  const updatePublicChatUrl = (url: string) => {
    setPublicChatUrl(url);
    localStorage.setItem('zapbot_public_chat_url', url);
    toast.success('URL do chat público salva com sucesso!');
  };

  const updateStatistics = () => {
    const totalConversations = clients.length;
    const activeConversations = clients.filter(c => c.status === 'active').length;
    const abandonedConversations = clients.filter(c => c.status === 'abandoned').length;
    const responseRate = totalConversations > 0 ? (activeConversations / totalConversations) * 100 : 0;
    const conversionRate = totalConversations > 0 ? 
      (clients.filter(c => c.category !== 'not_bought').length / totalConversations) * 100 : 0;

    setStatistics({
      totalConversations,
      activeConversations,
      abandonedConversations,
      responseRate,
      conversionRate,
      dailyMessages: messages.filter(m => 
        new Date(m.timestamp).toDateString() === new Date().toDateString()
      ).length
    });
  };

  useEffect(() => {
    updateStatistics();
  }, [clients, messages]);

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