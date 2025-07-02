import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Users, Phone, Video, MoreVertical, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { WhatsAppContact, WhatsAppMessage } from '../../types';

const ChatBotTab: React.FC = () => {
  const { isWhatsAppConnected } = useApp();
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);

  // Mock data for demonstration - in real implementation this would come from WhatsApp Business API
  useEffect(() => {
    if (isWhatsAppConnected) {
      const mockContacts: WhatsAppContact[] = [
        {
          id: '1',
          name: 'João Silva',
          phone: '+5511999887766',
          profilePic: '',
          lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
          isOnline: false
        },
        {
          id: '2',
          name: 'Maria Santos',
          phone: '+5511888776655',
          profilePic: '',
          lastSeen: new Date(),
          isOnline: true
        },
        {
          id: '3',
          name: 'Pedro Costa',
          phone: '+5511777665544',
          profilePic: '',
          lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
          isOnline: false
        }
      ];

      const mockMessages: WhatsAppMessage[] = [
        {
          id: '1',
          contactId: '1',
          content: 'Olá, tenho interesse no produto',
          type: 'text',
          sender: 'contact',
          timestamp: new Date(Date.now() - 3600000),
          isRead: true,
          messageStatus: 'read'
        },
        {
          id: '2',
          contactId: '1',
          content: 'Olá! Obrigado pelo interesse. Como posso ajudá-lo?',
          type: 'text',
          sender: 'me',
          timestamp: new Date(Date.now() - 3500000),
          isRead: true,
          messageStatus: 'read'
        },
        {
          id: '3',
          contactId: '2',
          content: 'Quando chega meu pedido?',
          type: 'text',
          sender: 'contact',
          timestamp: new Date(Date.now() - 1800000),
          isRead: false,
          messageStatus: 'delivered'
        }
      ];

      setContacts(mockContacts);
      setMessages(mockMessages);
    }
  }, [isWhatsAppConnected]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  );

  const contactMessages = selectedContact
    ? messages.filter(m => m.contactId === selectedContact.id)
    : [];

  const getLastMessage = (contactId: string) => {
    const contactMsgs = messages.filter(m => m.contactId === contactId);
    return contactMsgs[contactMsgs.length - 1];
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  if (!isWhatsAppConnected) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Business Desconectado</h2>
          <p className="text-gray-600 mb-6">
            Para usar esta funcionalidade, você precisa conectar seu WhatsApp Business primeiro.
          </p>
          <p className="text-sm text-gray-500">
            Vá para a aba "WhatsApp" para fazer a conexão.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-200px)] flex gap-6">
      {/* Contacts List */}
      <div className="w-1/3 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-green-600 text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp Business
            </h3>
            <div className="flex items-center text-green-100">
              <Wifi className="w-4 h-4 mr-1" />
              <span className="text-xs">Conectado</span>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-200" />
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-green-500 text-white placeholder-green-200 rounded-lg focus:outline-none focus:bg-green-400"
            />
          </div>
        </div>
        
        <div className="h-[calc(100%-120px)] overflow-y-auto">
          {filteredContacts.map((contact) => {
            const lastMessage = getLastMessage(contact.id);
            return (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  selectedContact?.id === contact.id ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {contact.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                      {lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {lastMessage ? lastMessage.content : 'Nenhuma mensagem'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {contact.isOnline ? 'online' : `visto ${formatLastSeen(contact.lastSeen!)}`}
                    </p>
                  </div>
                  {lastMessage && !lastMessage.isRead && lastMessage.sender === 'contact' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredContacts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum contato encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="font-medium">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {selectedContact.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedContact.isOnline ? 'online' : `visto ${formatLastSeen(selectedContact.lastSeen!)}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {contactMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'me'
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs opacity-70">
                        {formatTime(message.timestamp)}
                      </p>
                      {message.sender === 'me' && (
                        <span className="text-xs opacity-70">
                          {message.messageStatus === 'sent' ? '✓' : 
                           message.messageStatus === 'delivered' ? '✓✓' : '✓✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="bg-gray-100 rounded-lg p-3 text-center text-gray-600">
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  Esta é uma visualização das conversas do WhatsApp Business conectado.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  As respostas são enviadas diretamente pelo WhatsApp Business.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
              <p className="text-gray-600">Escolha um contato da lista para visualizar a conversa</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBotTab;