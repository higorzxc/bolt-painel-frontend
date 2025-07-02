import React, { useState } from 'react';
import { RefreshCw, Plus, Edit, Trash2, Play, Pause, MessageSquare, Mic, Image, Video, Bot, Users } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { RemarketingFlow } from '../../types';
import RemarketingFlowModal from '../modals/RemarketingFlowModal';

const RemarketingFlowsTab: React.FC = () => {
  const { remarketingFlows, deleteRemarketingFlow, updateRemarketingFlow, campaigns } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<RemarketingFlow | null>(null);

  const handleEdit = (flow: RemarketingFlow) => {
    setEditingFlow(flow);
    setIsModalOpen(true);
  };

  const handleDelete = (flowId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fluxo de remarketing?')) {
      deleteRemarketingFlow(flowId);
    }
  };

  const toggleFlowStatus = (flowId: string, isActive: boolean) => {
    updateRemarketingFlow(flowId, { isActive: !isActive });
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
      case 'ai_response':
        return <Bot className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStepTypeName = (type: string) => {
    const names = {
      message: 'Mensagem',
      audio: 'Áudio',
      image: 'Foto',
      video: 'Vídeo',
      ai_response: 'Resposta com IA',
      menu: 'Menu de Opções'
    };
    return names[type as keyof typeof names] || type;
  };

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign ? campaign.name : 'Campanha não encontrada';
  };

  const getCategoryName = (category: string) => {
    const names = {
      not_bought: 'Não Comprou',
      bought_correios: 'Comprou via Correios',
      bought_logz: 'Comprou via Logz',
      completed_purchases: 'Compras Completas'
    };
    return names[category as keyof typeof names] || category;
  };

  const availableCampaigns = campaigns.filter(c => c.hasRemarketingFlow);

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
            <RefreshCw className="w-6 h-6 mr-2" />
            Fluxos de Remarketing
          </h2>
          <p className="text-gray-600">Configure fluxos automáticos para quem responder suas campanhas</p>
        </div>
        <button
          onClick={() => {
            setEditingFlow(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          disabled={availableCampaigns.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Fluxo
        </button>
      </div>

      {availableCampaigns.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
          <div className="flex">
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">Nenhuma campanha com remarketing ativo</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Para criar fluxos de remarketing, primeiro crie uma campanha e ative a opção 
                "Ativar fluxo de resposta automática para quem responder esta campanha".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Flows List */}
      <div className="space-y-6">
        {remarketingFlows.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fluxo de remarketing criado</h3>
            <p className="text-gray-600">
              {availableCampaigns.length > 0 
                ? 'Crie seu primeiro fluxo de remarketing para campanhas ativas'
                : 'Primeiro ative o remarketing em uma campanha para criar fluxos'
              }
            </p>
          </div>
        ) : (
          remarketingFlows.map((flow) => (
            <div key={flow.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Flow Header */}
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{flow.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        flow.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {flow.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{flow.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Campanha: {getCampaignName(flow.campaignId)}
                      </div>
                      <div className="flex items-center">
                        Público: {getCategoryName(flow.targetCategory)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {flow.triggers.map((trigger, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => toggleFlowStatus(flow.id, flow.isActive)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                        flow.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {flow.isActive ? (
                        <>
                          <Pause className="w-4 h-4 mr-2" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(flow)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Editar fluxo"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(flow.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Excluir fluxo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Flow Steps */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Etapas do Fluxo ({flow.steps.length})</h4>
                <div className="space-y-3">
                  {flow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStepIcon(step.type)}
                          <span className="font-medium text-gray-900">{getStepTypeName(step.type)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{step.content}</p>
                        {step.aiProductName && (
                          <p className="text-sm text-blue-600">Produto: {step.aiProductName}</p>
                        )}
                        {step.options && step.options.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Opções:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {step.options.map((option) => (
                                <span key={option.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {option.text}
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
            </div>
          ))
        )}
      </div>

      {/* Remarketing Flow Modal */}
      {isModalOpen && (
        <RemarketingFlowModal
          flow={editingFlow}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RemarketingFlowsTab;