import React, { useState } from 'react';
import { MessageSquare, Plus, Edit, Trash2, Send, Calendar, Users, Eye, Mic, Image, Video, FileText, Menu } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Campaign } from '../../types';
import CampaignModal from '../modals/CampaignModal';

const CampaignsTab: React.FC = () => {
  const { campaigns, deleteCampaign, updateCampaign, clients } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleDelete = (campaignId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta campanha?')) {
      deleteCampaign(campaignId);
    }
  };

  const handleSendCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const targetClients = clients.filter(c => c.category === campaign.targetCategory);
    
    if (window.confirm(`Enviar campanha para ${targetClients.length} cliente(s)?`)) {
      updateCampaign(campaignId, {
        status: 'sent',
        sentCount: targetClients.length
      });
    }
  };

  const getTargetCount = (category: Campaign['targetCategory']) => {
    return clients.filter(c => c.category === category).length;
  };

  const getCategoryName = (category: Campaign['targetCategory']) => {
    const names = {
      not_bought: 'Não Comprou',
      bought_correios: 'Comprou via Correios',
      bought_logz: 'Comprou via Logz',
      completed_purchases: 'Compras Completas'
    };
    return names[category];
  };

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800'
    };
    return colors[status];
  };

  const getStatusText = (status: Campaign['status']) => {
    const texts = {
      draft: 'Rascunho',
      scheduled: 'Agendada',
      sent: 'Enviada'
    };
    return texts[status];
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'audio':
        return <Mic className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'buttons':
        return <Menu className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStepTypeName = (type: string) => {
    const names = {
      message: 'Mensagem',
      audio: 'Áudio',
      image: 'Imagem',
      video: 'Vídeo',
      pdf: 'PDF',
      buttons: 'Botões'
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
            <MessageSquare className="w-6 h-6 mr-2" />
            Campanhas de Marketing
          </h2>
          <p className="text-gray-600">Crie e gerencie campanhas de remarketing com etapas personalizadas</p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-6">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha criada</h3>
            <p className="text-gray-600">Crie sua primeira campanha de remarketing com etapas personalizadas</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Campaign Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {getStatusText(campaign.status)}
                      </span>
                      {campaign.hasRemarketingFlow && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Remarketing Ativo
                        </span>
                      )}
                    </div>
                    
                    {campaign.description && (
                      <p className="text-gray-600 mb-2">{campaign.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {getCategoryName(campaign.targetCategory)} ({getTargetCount(campaign.targetCategory)} clientes)
                      </div>
                      {campaign.scheduledDate && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(campaign.scheduledDate).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {campaign.status === 'sent' && (
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-blue-600">📤 Enviadas: {campaign.sentCount}</span>
                        <span className="text-green-600">👁️ Visualizações: {campaign.openCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {campaign.status === 'draft' && (
                      <button
                        onClick={() => handleSendCampaign(campaign.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Agora
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Editar campanha"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(campaign.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Excluir campanha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Campaign Steps */}
              {campaign.steps && campaign.steps.length > 0 && (
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Etapas da Campanha ({campaign.steps.length})</h4>
                  <div className="space-y-3">
                    {campaign.steps.map((step, index) => (
                      <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStepIcon(step.type)}
                            <span className="font-medium text-gray-900">{getStepTypeName(step.type)}</span>
                            {step.delay && step.delay > 0 && (
                              <span className="text-xs text-gray-500">({step.delay}s delay)</span>
                            )}
                          </div>
                          {step.description && (
                            <p className="text-sm text-gray-500 mb-1">{step.description}</p>
                          )}
                          <p className="text-sm text-gray-600">{step.content}</p>
                          {step.fileName && (
                            <p className="text-sm text-blue-600">📎 {step.fileName}</p>
                          )}
                          {step.buttons && step.buttons.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Botões:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {step.buttons.map((button) => (
                                  <span key={button.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {button.text}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Campaign Modal */}
      {isModalOpen && (
        <CampaignModal
          campaign={editingCampaign}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CampaignsTab;