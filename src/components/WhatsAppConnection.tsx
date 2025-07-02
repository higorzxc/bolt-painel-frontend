import React from 'react';
import { Smartphone, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const WhatsAppConnection: React.FC = () => {
  const { isWhatsAppConnected, qrCode, disconnectWhatsApp } = useApp();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Smartphone className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Conexão WhatsApp Business</h2>
          <p className="text-gray-600">
            Conecte sua conta do WhatsApp Business para começar a automatizar suas conversas
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {isWhatsAppConnected ? (
                <Wifi className="w-6 h-6 text-green-600 mr-3" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-600 mr-3" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900">
                  Status da Conexão
                </h3>
                <p className="text-sm text-gray-600">
                  {isWhatsAppConnected ? 'WhatsApp conectado e funcionando' : 'WhatsApp desconectado'}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isWhatsAppConnected 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isWhatsAppConnected ? 'Conectado' : 'Desconectado'}
            </div>
          </div>

          {/* QR Code sempre visível quando não conectado */}
          {!isWhatsAppConnected && (
            <div className="text-center py-8">
              {qrCode === 'loading' ? (
                <>
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Gerando QR Code...</p>
                  <p className="text-sm text-gray-500 mt-2">Preparando conexão com WhatsApp Business</p>
                </>
              ) : qrCode ? (
                <>
                  <div className="bg-white p-6 rounded-lg shadow-sm mb-4 inline-block">
                    <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64 mx-auto" />
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="font-medium">Escaneie o QR Code com seu WhatsApp Business:</p>
                    <p>1. Abra o WhatsApp Business no seu celular</p>
                    <p>2. Toque em "Mais opções" (⋮) e selecione "Dispositivos conectados"</p>
                    <p>3. Toque em "Conectar um dispositivo"</p>
                    <p>4. Aponte seu celular para esta tela para escanear o código</p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📱 QR Code permanece ativo - escaneie quando estiver pronto
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Preparando QR Code...
                  </p>
                  <p className="text-sm text-gray-500">
                    Aguarde alguns segundos
                  </p>
                </>
              )}
            </div>
          )}

          {/* Área de sucesso - só aparece após escanear */}
          {isWhatsAppConnected && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                WhatsApp Business Conectado com Sucesso!
              </p>
              <p className="text-gray-600 mb-6">
                Seu bot está pronto para receber e responder mensagens automaticamente
              </p>
              <button
                onClick={disconnectWhatsApp}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Desconectar WhatsApp
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Informações Importantes</h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Use apenas o WhatsApp Business para melhores resultados</li>
                  <li>Mantenha seu celular conectado à internet</li>
                  <li>Não faça logout do WhatsApp Web no celular</li>
                  <li>O sistema funcionará 24h após a conexão</li>
                  <li>A conexão permanece ativa mesmo com o PC desligado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Venom API Integration Info */}
        <div className="mt-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <h4 className="text-sm font-medium text-green-800">Integração Venom API</h4>
              <div className="mt-2 text-sm text-green-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Sistema preparado para integração com Venom Bot</li>
                  <li>QR Code gerado automaticamente via biblioteca oficial</li>
                  <li>Conexão persistente e estável</li>
                  <li>Pronto para receber e enviar mensagens automaticamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppConnection;