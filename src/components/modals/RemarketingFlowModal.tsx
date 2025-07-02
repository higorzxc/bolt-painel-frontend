import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, MessageSquare, Mic, Image, Video, Bot, Menu, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { RemarketingFlow, FlowStep } from '../../types';

interface RemarketingFlowModalProps {
  flow: RemarketingFlow | null;
  onClose: () => void;
}

const RemarketingFlowModal: React.FC<RemarketingFlowModalProps> = ({ flow, onClose }) => {
  const { addRemarketingFlow, updateRemarketingFlow, campaigns } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    triggers: [''],
    steps: [] as FlowStep[],
    abandonmentTime: 30,
    campaignId: '',
    targetCategory: 'not_bought' as const
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (flow) {
      setFormData({
        name: flow.name,
        description: flow.description,
        isActive: flow.isActive,
        triggers: flow.triggers.length > 0 ? flow.triggers : [''],
        steps: flow.steps,
        abandonmentTime: flow.abandonmentTime || 30,
        campaignId: flow.campaignId,
        targetCategory: flow.targetCategory
      });
    }
  }, [flow]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const flowData = {
      ...formData,
      triggers: formData.triggers.filter(t => t.trim() !== '')
    };

    if (flow) {
      updateRemarketingFlow(flow.id, flowData);
    } else {
      addRemarketingFlow(flowData);
    }
    
    onClose();
  };

  const addTrigger = () => {
    setFormData(prev => ({
      ...prev,
      triggers: [...prev.triggers, '']
    }));
  };

  const updateTrigger = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.map((t, i) => i === index ? value : t)
    }));
  };

  const removeTrigger = (index: number) => {
    setFormData(prev => ({
      ...prev,
      triggers: prev.triggers.filter((_, i) => i !== index)
    }));
  };

  const addStep = () => {
    const newStep: FlowStep = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'message',
      content: '',
      delay: 0
    };
    
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const updateStep = (index: number, updates: Partial<FlowStep>) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? { ...step, ...updates } : step)
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (stepIndex: number, type: 'audio' | 'image' | 'video') => {
    const input = fileInputRefs.current[`${stepIndex}-${type}`];
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (stepIndex: number, type: 'audio' | 'image' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateStep(stepIndex, { 
        mediaUrl: url,
        fileName: file.name
      });
    }
  };

  const getAcceptType = (type: 'audio' | 'image' | 'video') => {
    switch (type) {
      case 'audio':
        return 'audio/*';
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      default:
        return '';
    }
  };

  const stepTypeOptions = [
    { value: 'message', label: 'Mensagem', icon: MessageSquare },
    { value: 'audio', label: 'Áudio', icon: Mic },
    { value: 'image', label: 'Foto', icon: Image },
    { value: 'video', label: 'Vídeo', icon: Video },
    { value: 'ai_response', label: 'Resposta automática com IA', icon: Bot }
  ];

  const getStepIcon = (type: string) => {
    const option = stepTypeOptions.find(opt => opt.value === type);
    return option ? option.icon : MessageSquare;
  };

  const categoryOptions = [
    { value: 'not_bought', label: 'Não Comprou' },
    { value: 'bought_correios', label: 'Comprou via Correios' },
    { value: 'bought_logz', label: 'Comprou via Logz' },
    { value: 'completed_purchases', label: 'Compras Completas' }
  ];

  const selectedCampaign = campaigns.find(c => c.id === formData.campaignId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {flow ? 'Editar Fluxo de Remarketing' : 'Novo Fluxo de Remarketing'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Fluxo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                placeholder="Ex: Remarketing Não Comprou"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campanha Vinculada
              </label>
              <select
                value={formData.campaignId}
                onChange={(e) => {
                  const campaign = campaigns.find(c => c.id === e.target.value);
                  setFormData(prev => ({ 
                    ...prev, 
                    campaignId: e.target.value,
                    targetCategory: campaign?.targetCategory || 'not_bought'
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Selecione uma campanha</option>
                {campaigns.filter(c => c.hasRemarketingFlow).map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo de Abandono (minutos)
              </label>
              <input
                type="number"
                value={formData.abandonmentTime}
                onChange={(e) => setFormData(prev => ({ ...prev, abandonmentTime: parseInt(e.target.value) || 30 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="1"
                placeholder="30"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Fluxo ativo</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Descreva o objetivo deste fluxo de remarketing..."
            />
          </div>

          {selectedCampaign && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex items-center">
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Campanha Vinculada</h4>
                  <p className="text-sm text-blue-700">
                    <strong>{selectedCampaign.name}</strong> - Público: {categoryOptions.find(c => c.value === selectedCampaign.targetCategory)?.label}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Este fluxo será ativado quando alguém responder à campanha selecionada
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Triggers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Palavras-chave que ativam o fluxo
              </label>
              <button
                type="button"
                onClick={addTrigger}
                className="text-green-600 hover:text-green-700 text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {formData.triggers.map((trigger, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={trigger}
                    onChange={(e) => updateTrigger(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: sim, quero, tenho interesse"
                  />
                  {formData.triggers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTrigger(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Etapas do Fluxo ({formData.steps.length})
              </label>
              <button
                type="button"
                onClick={addStep}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Etapa
              </button>
            </div>

            <div className="space-y-4">
              {formData.steps.map((step, index) => {
                const StepIcon = getStepIcon(step.type);
                return (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <StepIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Etapa {index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo da Etapa
                        </label>
                        <select
                          value={step.type}
                          onChange={(e) => updateStep(index, { type: e.target.value as FlowStep['type'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {stepTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Delay (segundos)
                        </label>
                        <input
                          type="number"
                          value={step.delay || 0}
                          onChange={(e) => updateStep(index, { delay: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {step.type === 'ai_response' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Produto
                        </label>
                        <input
                          type="text"
                          value={step.aiProductName || ''}
                          onChange={(e) => updateStep(index, { aiProductName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Ex: Curso de Emagrecimento"
                        />
                      </div>
                    )}

                    {(step.type === 'audio' || step.type === 'image' || step.type === 'video') && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arquivo de {step.type === 'audio' ? 'Áudio' : step.type === 'image' ? 'Imagem' : 'Vídeo'}
                        </label>
                        <div className="flex items-center gap-4">
                          {step.fileName && (
                            <span className="text-sm text-gray-600">
                              📎 {step.fileName}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleFileSelect(index, step.type as 'audio' | 'image' | 'video')}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Escolher Arquivo
                          </button>
                        </div>
                        <input
                          ref={(el) => fileInputRefs.current[`${index}-${step.type}`] = el}
                          type="file"
                          accept={getAcceptType(step.type as 'audio' | 'image' | 'video')}
                          onChange={(e) => handleFileChange(index, step.type as 'audio' | 'image' | 'video', e)}
                          className="hidden"
                        />
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {step.type === 'ai_response' ? 'Instruções para IA' : 'Conteúdo'}
                      </label>
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(index, { content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder={
                          step.type === 'ai_response' 
                            ? "A IA deve responder como um profissional de vendas, apresentando os benefícios do produto e conduzindo o cliente até a compra..."
                            : step.type === 'audio' || step.type === 'image' || step.type === 'video'
                            ? "Texto opcional para acompanhar a mídia..."
                            : "Digite o conteúdo da mensagem..."
                        }
                        required={step.type === 'message' || step.type === 'ai_response'}
                      />
                    </div>
                  </div>
                );
              })}

              {formData.steps.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhuma etapa criada ainda</p>
                  <p className="text-sm">Clique em "Nova Etapa" para começar</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {flow ? 'Salvar Alterações' : 'Criar Fluxo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RemarketingFlowModal;