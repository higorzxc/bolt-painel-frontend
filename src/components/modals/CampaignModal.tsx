import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Users, Calendar, Save, Upload, Plus, Trash2, Image, Mic, Video, FileText, Menu } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Campaign, CampaignStep } from '../../types';

interface CampaignModalProps {
  campaign: Campaign | null;
  onClose: () => void;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ campaign, onClose }) => {
  const { addCampaign, updateCampaign, clients } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetCategory: 'not_bought' as Campaign['targetCategory'],
    steps: [] as CampaignStep[],
    scheduledDate: '',
    hasRemarketingFlow: false
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description,
        targetCategory: campaign.targetCategory,
        steps: campaign.steps || [],
        scheduledDate: campaign.scheduledDate ? 
          new Date(campaign.scheduledDate).toISOString().slice(0, 16) : '',
        hasRemarketingFlow: campaign.hasRemarketingFlow || false
      });
    }
  }, [campaign]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const campaignData = {
      ...formData,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined
    };

    if (campaign) {
      updateCampaign(campaign.id, campaignData);
    } else {
      addCampaign(campaignData);
    }
    
    onClose();
  };

  const addStep = () => {
    const newStep: CampaignStep = {
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

  const updateStep = (index: number, updates: Partial<CampaignStep>) => {
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

  const handleFileSelect = (stepIndex: number, type: 'audio' | 'image' | 'video' | 'pdf') => {
    const input = fileInputRefs.current[`${stepIndex}-${type}`];
    if (input) {
      input.click();
    }
  };

  const handleFileChange = (stepIndex: number, type: 'audio' | 'image' | 'video' | 'pdf', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateStep(stepIndex, { 
        mediaUrl: url,
        fileName: file.name
      });
    }
  };

  const getAcceptType = (type: 'audio' | 'image' | 'video' | 'pdf') => {
    switch (type) {
      case 'audio':
        return 'audio/*';
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'pdf':
        return '.pdf';
      default:
        return '';
    }
  };

  const stepTypeOptions = [
    { value: 'message', label: 'Mensagem', icon: MessageSquare },
    { value: 'audio', label: 'Áudio', icon: Mic },
    { value: 'image', label: 'Imagem', icon: Image },
    { value: 'video', label: 'Vídeo', icon: Video },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'buttons', label: 'Botões', icon: Menu }
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

  const getTargetCount = (category: Campaign['targetCategory']) => {
    return clients.filter(c => c.category === category).length;
  };

  const addButton = (stepIndex: number) => {
    const step = formData.steps[stepIndex];
    const newButton = { id: Math.random().toString(36).substr(2, 9), text: '' };
    updateStep(stepIndex, {
      buttons: [...(step.buttons || []), newButton]
    });
  };

  const updateButton = (stepIndex: number, buttonIndex: number, text: string) => {
    const step = formData.steps[stepIndex];
    const updatedButtons = step.buttons?.map((btn, i) => 
      i === buttonIndex ? { ...btn, text } : btn
    ) || [];
    updateStep(stepIndex, { buttons: updatedButtons });
  };

  const removeButton = (stepIndex: number, buttonIndex: number) => {
    const step = formData.steps[stepIndex];
    const updatedButtons = step.buttons?.filter((_, i) => i !== buttonIndex) || [];
    updateStep(stepIndex, { buttons: updatedButtons });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            {campaign ? 'Editar Campanha' : 'Nova Campanha'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Campanha
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                placeholder="Ex: Remarketing Março"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Público Alvo
              </label>
              <select
                value={formData.targetCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, targetCategory: e.target.value as Campaign['targetCategory'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({getTargetCount(option.value as Campaign['targetCategory'])} clientes)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Descreva o objetivo desta campanha..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Agendar Envio (Opcional)
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hasRemarketingFlow}
                onChange={(e) => setFormData(prev => ({ ...prev, hasRemarketingFlow: e.target.checked }))}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Ativar fluxo de resposta automática para quem responder esta campanha
              </span>
            </label>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Etapas da Campanha ({formData.steps.length})
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
                          onChange={(e) => updateStep(index, { type: e.target.value as CampaignStep['type'] })}
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

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (Opcional)
                      </label>
                      <input
                        type="text"
                        value={step.description || ''}
                        onChange={(e) => updateStep(index, { description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Descrição desta etapa..."
                      />
                    </div>

                    {(step.type === 'audio' || step.type === 'image' || step.type === 'video' || step.type === 'pdf') && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arquivo de {step.type === 'audio' ? 'Áudio' : 
                                     step.type === 'image' ? 'Imagem' : 
                                     step.type === 'video' ? 'Vídeo' : 'PDF'}
                        </label>
                        <div className="flex items-center gap-4">
                          {step.fileName && (
                            <span className="text-sm text-gray-600">
                              📎 {step.fileName}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleFileSelect(index, step.type as 'audio' | 'image' | 'video' | 'pdf')}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Escolher Arquivo
                          </button>
                        </div>
                        <input
                          ref={(el) => fileInputRefs.current[`${index}-${step.type}`] = el}
                          type="file"
                          accept={getAcceptType(step.type as 'audio' | 'image' | 'video' | 'pdf')}
                          onChange={(e) => handleFileChange(index, step.type as 'audio' | 'image' | 'video' | 'pdf', e)}
                          className="hidden"
                        />
                      </div>
                    )}

                    {step.type === 'buttons' && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Botões
                          </label>
                          <button
                            type="button"
                            onClick={() => addButton(index)}
                            className="text-green-600 hover:text-green-700 text-sm flex items-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar Botão
                          </button>
                        </div>
                        <div className="space-y-2">
                          {step.buttons?.map((button, buttonIndex) => (
                            <div key={button.id} className="flex gap-2">
                              <input
                                type="text"
                                value={button.text}
                                onChange={(e) => updateButton(index, buttonIndex, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Texto do botão"
                              />
                              <button
                                type="button"
                                onClick={() => removeButton(index, buttonIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conteúdo
                      </label>
                      <textarea
                        value={step.content}
                        onChange={(e) => updateStep(index, { content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder={
                          step.type === 'buttons' 
                            ? "Texto que acompanha os botões..."
                            : step.type === 'audio' || step.type === 'image' || step.type === 'video' || step.type === 'pdf'
                            ? "Texto opcional para acompanhar a mídia..."
                            : "Digite o conteúdo da mensagem..."
                        }
                        required={step.type === 'message'}
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

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-700">
                Esta campanha será enviada para {getTargetCount(formData.targetCategory)} cliente(s) 
                na categoria "{categoryOptions.find(c => c.value === formData.targetCategory)?.label}"
              </p>
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
              {campaign ? 'Salvar Alterações' : 'Criar Campanha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignModal;