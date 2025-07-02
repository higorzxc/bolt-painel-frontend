import React, { useState } from 'react';
import { Users, Edit, Trash2, ExternalLink, Plus, Search, Filter } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Client } from '../../types';
import ClientModal from '../modals/ClientModal';

type ClientCategory = Client['category'] | 'all';

const ClientsTab: React.FC = () => {
  const { clients, moveClientToCategory, deleteClient } = useApp();
  const [activeCategory, setActiveCategory] = useState<ClientCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all' as ClientCategory, name: 'Todos os Clientes', color: 'bg-gray-100 text-gray-800' },
    { id: 'not_bought' as ClientCategory, name: 'Não Comprou', color: 'bg-red-100 text-red-800' },
    { id: 'bought_correios' as ClientCategory, name: 'Comprou via Correios', color: 'bg-blue-100 text-blue-800' },
    { id: 'bought_logz' as ClientCategory, name: 'Comprou via Logz', color: 'bg-green-100 text-green-800' },
    { id: 'completed_purchases' as ClientCategory, name: 'Compras Completas', color: 'bg-purple-100 text-purple-800' }
  ];

  const filteredClients = clients.filter(client => {
    const matchesCategory = activeCategory === 'all' || client.category === activeCategory;
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const getCategoryCount = (category: ClientCategory) => {
    if (category === 'all') return clients.length;
    return clients.filter(c => c.category === category).length;
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = (clientId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      deleteClient(clientId);
    }
  };

  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleCategoryChange = (clientId: string, category: Client['category']) => {
    moveClientToCategory(clientId, category);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-2">
            <Users className="w-6 h-6 mr-2" />
            Gerenciamento de Clientes
          </h2>
          <p className="text-gray-600">Organize e acompanhe todos os seus clientes</p>
        </div>
        <button
          onClick={() => {
            setEditingClient(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Filter className="w-4 h-4 mr-2" />
          {filteredClients.length} cliente(s) encontrado(s)
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeCategory === category.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {category.name} ({getCategoryCount(category.id)})
            </button>
          ))}
        </nav>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente buscar com outros termos' : 'Adicione seu primeiro cliente para começar'}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      categories.find(c => c.id === client.category)?.color
                    }`}>
                      {categories.find(c => c.id === client.category)?.name}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      client.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📱 {client.phone}</p>
                    <p>💬 {client.lastMessage}</p>
                    <p>🕐 {new Date(client.lastActivity).toLocaleString('pt-BR')}</p>
                    {client.campaignSource && <p>📊 Origem: {client.campaignSource}</p>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {activeCategory === 'all' && (
                    <select
                      value={client.category}
                      onChange={(e) => handleCategoryChange(client.id, e.target.value as Client['category'])}
                      className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="not_bought">Não Comprou</option>
                      <option value="bought_correios">Comprou via Correios</option>
                      <option value="bought_logz">Comprou via Logz</option>
                      <option value="completed_purchases">Compras Completas</option>
                    </select>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openWhatsApp(client.phone)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Abrir WhatsApp"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Editar cliente"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Client Modal */}
      {isModalOpen && (
        <ClientModal
          client={editingClient}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ClientsTab;