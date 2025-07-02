import React, { useState } from 'react';
import { Settings, Mic, MessageSquare, Save } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const ConfigurationsTab: React.FC = () => {
  const { botConfig, updateBotConfig } = useApp();
  const [config, setConfig] = useState(botConfig);

  const handleSave = () => {
    updateBotConfig(config);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
            <Settings className="w-6 h-6 mr-2" />
            Configurações do Bot
          </h2>
          <p className="text-gray-600">Personalize o comportamento do seu bot</p>
        </div>

        <div className="space-y-8">
          {/* Bot Behavior */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Comportamento do Bot
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.welcomeAudio}
                  onChange={(e) => setConfig(prev => ({ ...prev, welcomeAudio: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Áudio de boas-vindas automático</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.autoResponse}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoResponse: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Respostas automáticas ativadas</span>
              </label>
            </div>
          </div>

          {/* Media Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Permissões de Mídia do Cliente
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.allowClientAudio}
                  onChange={(e) => setConfig(prev => ({ ...prev, allowClientAudio: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Permitir envio de áudios</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.allowClientImages}
                  onChange={(e) => setConfig(prev => ({ ...prev, allowClientImages: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Permitir envio de imagens</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.allowClientVideo}
                  onChange={(e) => setConfig(prev => ({ ...prev, allowClientVideo: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Permitir envio de vídeos</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationsTab;