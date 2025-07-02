export interface Client {
  id: string;
  name: string;
  phone: string;
  category: 'not_bought' | 'bought_correios' | 'bought_logz' | 'completed_purchases';
  lastMessage: string;
  lastActivity: Date;
  status: 'active' | 'abandoned';
  campaignSource?: string;
  notes?: string;
}

export interface Message {
  id: string;
  clientId: string;
  content: string;
  type: 'text' | 'audio' | 'image' | 'video' | 'file';
  sender: 'client' | 'bot' | 'admin';
  timestamp: Date;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  audioDuration?: number;
}

export interface FlowStep {
  id: string;
  type: 'message' | 'audio' | 'image' | 'video' | 'ai_response' | 'menu';
  content: string;
  mediaUrl?: string;
  fileName?: string;
  options?: { id: string; text: string; nextStep?: string }[];
  nextStep?: string;
  aiProductName?: string;
  delay?: number; // delay in seconds before sending next step
}

export interface BotFlow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: FlowStep[];
  triggers: string[];
  abandonmentTime?: number; // time in minutes to consider abandoned
}

export interface RemarketingFlow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  steps: FlowStep[];
  triggers: string[];
  abandonmentTime?: number;
  campaignId: string; // ID da campanha que gerou este fluxo
  targetCategory: Client['category']; // Categoria alvo da campanha
}

export interface CampaignStep {
  id: string;
  type: 'message' | 'audio' | 'image' | 'video' | 'pdf' | 'buttons';
  content: string;
  mediaUrl?: string;
  fileName?: string;
  buttons?: { id: string; text: string }[];
  delay?: number;
  description?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetCategory: Client['category'];
  steps: CampaignStep[];
  scheduledDate?: Date;
  status: 'draft' | 'scheduled' | 'sent';
  sentCount: number;
  openCount: number;
  hasRemarketingFlow?: boolean;
  remarketingFlowId?: string;
}

export interface BotConfig {
  attendantName: string;
  attendantPhoto?: string;
  chatBackground?: string;
  welcomeAudio: boolean;
  autoResponse: boolean;
  allowClientAudio: boolean;
  allowClientVideo: boolean;
  allowClientImages: boolean;
}

export interface Statistics {
  totalConversations: number;
  activeConversations: number;
  abandonedConversations: number;
  responseRate: number;
  conversionRate: number;
  dailyMessages: number;
}

export interface ExternalChatMessage {
  name: string;
  phone: string;
  campaign: string;
  message: string;
  timestamp: Date;
  funnelStep: string;
}

export interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  profilePic?: string;
  lastSeen?: Date;
  isOnline: boolean;
}

export interface WhatsAppMessage {
  id: string;
  contactId: string;
  content: string;
  type: 'text' | 'audio' | 'image' | 'video' | 'document';
  sender: 'contact' | 'me';
  timestamp: Date;
  mediaUrl?: string;
  fileName?: string;
  isRead: boolean;
  messageStatus: 'sent' | 'delivered' | 'read';
}