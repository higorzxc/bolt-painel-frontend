import React, { useState } from 'react';
import { Bot, LogOut, Users, MessageSquare, Settings, BarChart3, Zap, MessageCircle, Phone, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import ClientsTab from './tabs/ClientsTab';
import CampaignsTab from './tabs/CampaignsTab';
import BotFlowsTab from './tabs/BotFlowsTab';
import RemarketingFlowsTab from './tabs/RemarketingFlowsTab';
import ConfigurationsTab from './tabs/ConfigurationsTab';
import StatisticsTab from './tabs/StatisticsTab';
import WhatsAppConnection from './WhatsAppConnection';
import ChatBotTab from './tabs/ChatBotTab';

type TabType = 'clients' | 'campaigns' | 'flows' | 'remarketing' | 'chatbot' | 'config' | 'stats' | 'whatsapp';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const { logout, isWhatsAppConnected, statistics } = useApp();

  const tabs = [
    { id: 'clients' as TabType, name: 'Clientes', icon: Users },
    { id: 'campaigns' as TabType, name: 'Campanhas', icon: MessageSquare },
    { id: 'flows' as TabType, name: 'Fluxos do Bot', icon: Zap },
    { id: 'remarketing' as TabType, name: 'Fluxo Remarketing', icon: RefreshCw },
    { id: 'chatbot' as TabType, name: 'Chat Bot', icon: MessageCircle },
    { id: 'config' as TabType, name: 'Configurações', icon: Settings },
    { id: 'stats' as TabType, name: 'Estatísticas', icon: BarChart3 },
    { id: 'whatsapp' as TabType, name: 'WhatsApp', icon: Phone }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'clients':
        return <ClientsTab />;
      case 'campaigns':
        return <CampaignsTab />;
      case 'flows':
        return <BotFlowsTab />;
      case 'remarketing':
        return <RemarketingFlowsTab />;
      case 'chatbot':
        return <ChatBotTab />;
      case 'config':
        return <ConfigurationsTab />;
      case 'stats':
        return <StatisticsTab />;
      case 'whatsapp':
        return <WhatsAppConnection />;
      default:
        return <ClientsTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Bot className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">ZapBot Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <div className={`w-2 h-2 rounded-full mr-2 ${isWhatsAppConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                WhatsApp {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
              </div>
              <div className="text-sm text-gray-600">
                {statistics.activeConversations} conversas ativas
              </div>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;