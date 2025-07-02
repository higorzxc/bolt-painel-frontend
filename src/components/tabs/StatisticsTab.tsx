import React from 'react';
import { BarChart3, Users, MessageSquare, TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const StatisticsTab: React.FC = () => {
  const { statistics, clients, campaigns } = useApp();

  const stats = [
    {
      title: 'Total de Conversas',
      value: statistics.totalConversations,
      icon: MessageSquare,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Conversas Ativas',
      value: statistics.activeConversations,
      icon: Activity,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Taxa de Resposta',
      value: `${statistics.responseRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'Taxa de Conversão',
      value: `${statistics.conversionRate.toFixed(1)}%`,
      icon: Users,
      color: 'bg-purple-500',
      trend: '-2%',
      trendUp: false
    }
  ];

  const categoryStats = [
    {
      name: 'Não Comprou',
      count: clients.filter(c => c.category === 'not_bought').length,
      color: 'bg-red-500',
      percentage: (clients.filter(c => c.category === 'not_bought').length / clients.length) * 100
    },
    {
      name: 'Comprou via Correios',
      count: clients.filter(c => c.category === 'bought_correios').length,
      color: 'bg-blue-500',
      percentage: (clients.filter(c => c.category === 'bought_correios').length / clients.length) * 100
    },
    {
      name: 'Comprou via Logz',
      count: clients.filter(c => c.category === 'bought_logz').length,
      color: 'bg-green-500',
      percentage: (clients.filter(c => c.category === 'bought_logz').length / clients.length) * 100
    },
    {
      name: 'Compras Completas',
      count: clients.filter(c => c.category === 'completed_purchases').length,
      color: 'bg-purple-500',
      percentage: (clients.filter(c => c.category === 'completed_purchases').length / clients.length) * 100
    }
  ];

  const recentActivities = [
    { type: 'new_client', message: 'Novo cliente: João Silva', time: '2 min atrás' },
    { type: 'campaign_sent', message: 'Campanha "Remarketing Março" enviada', time: '15 min atrás' },
    { type: 'conversion', message: 'Cliente convertido: Maria Santos', time: '1 hora atrás' },
    { type: 'message_received', message: 'Nova mensagem de Pedro Costa', time: '2 horas atrás' }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
          <BarChart3 className="w-6 h-6 mr-2" />
          Estatísticas e Relatórios
        </h2>
        <p className="text-gray-600">Acompanhe o desempenho do seu bot e campanhas</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Categoria</h3>
          <div className="space-y-4">
            {categoryStats.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm text-gray-600">{category.count} ({category.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${category.color}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Desempenho das Campanhas</h3>
          <div className="space-y-4">
            {campaigns.slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status === 'sent' ? 'Enviada' :
                     campaign.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
                  </span>
                </div>
                {campaign.status === 'sent' && (
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>📤 {campaign.sentCount} enviadas</span>
                    <span>👁️ {campaign.openCount} visualizações</span>
                    <span>📊 {campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : 0}% taxa de abertura</span>
                  </div>
                )}
              </div>
            ))}
            {campaigns.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma campanha criada ainda</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Atividade Recente
        </h3>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'new_client' ? 'bg-blue-500' :
                activity.type === 'campaign_sent' ? 'bg-green-500' :
                activity.type === 'conversion' ? 'bg-purple-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights de Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🚀 Oportunidades</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• {clients.filter(c => c.category === 'not_bought').length} clientes podem ser impactados com remarketing</li>
              <li>• Taxa de conversão pode melhorar com fluxos otimizados</li>
              <li>• Horários de maior atividade: 14h às 18h</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">⚠️ Atenção</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• {clients.filter(c => c.status === 'abandoned').length} conversas abandonadas precisam de reengajamento</li>
              <li>• Considere criar mais campanhas segmentadas</li>
              <li>• Monitor resposta automática do bot</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsTab;