# 💼 NF-e - Exemplos Práticos e Casos de Uso

## 📋 Índice

1. [Caso 1: Sistema de Vendas - Emissão Automática](#caso-1-sistema-de-vendas---emissão-automática)
2. [Caso 2: Dashboard de Faturamento](#caso-2-dashboard-de-faturamento)
3. [Caso 3: Portal do Cliente](#caso-3-portal-do-cliente)
4. [Caso 4: Sistema de Cancelamento](#caso-4-sistema-de-cancelamento)
5. [Caso 5: Relatório de NF-e](#caso-5-relatório-de-nf-e)
6. [Caso 6: Integração com E-commerce](#caso-6-integração-com-e-commerce)
7. [Caso 7: Sistema de Monitoramento](#caso-7-sistema-de-monitoramento)
8. [Caso 8: App Mobile](#caso-8-app-mobile)

---

## Caso 1: Sistema de Vendas - Emissão Automática

### **Cenário:**
Ao finalizar uma venda, o sistema deve emitir automaticamente a NF-e e disponibilizar o DANFE para impressão.

### **Implementação Completa:**

```javascript
// services/nfe-service.js

class NFeService {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
  }
  
  async emitirNFeAutomatica(saleId) {
    try {
      // 1. Verificar se SEFAZ está online
      console.log('🔍 Verificando status SEFAZ...');
      const statusSefaz = await this.verificarStatusSefaz();
      
      if (!statusSefaz.online) {
        throw new Error(`SEFAZ indisponível: ${statusSefaz.motivo}`);
      }
      
      console.log('✅ SEFAZ online');
      
      // 2. Emitir NF-e
      console.log('📤 Emitindo NF-e...');
      const nfe = await this.emitirNFe(saleId);
      
      if (nfe.status !== 'AUTORIZADA') {
        throw new Error(`NF-e rejeitada: ${nfe.motivoRejeicao}`);
      }
      
      console.log(`✅ NF-e ${nfe.chaveAcesso} autorizada!`);
      
      // 3. Buscar detalhes completos
      const nfeDetalhes = await this.buscarNFeDetalhes(saleId);
      
      // 4. Gerar URLs de download
      const urls = {
        danfe: `${this.apiUrl}/fiscal/nfe/${nfeDetalhes.id}/danfe`,
        xml: `${this.apiUrl}/fiscal/nfe/${nfeDetalhes.id}/xml`
      };
      
      return {
        sucesso: true,
        nfe: nfeDetalhes,
        urls,
        mensagem: `NF-e ${nfeDetalhes.numero} emitida com sucesso!`
      };
      
    } catch (error) {
      console.error('❌ Erro na emissão:', error);
      
      return {
        sucesso: false,
        erro: error.message,
        mensagem: `Erro ao emitir NF-e: ${error.message}`
      };
    }
  }
  
  async verificarStatusSefaz() {
    const response = await fetch(`${this.apiUrl}/fiscal/nfe/sefaz/status`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    const status = await response.json();
    
    return {
      online: status.cStat === '107',
      motivo: status.xMotivo
    };
  }
  
  async emitirNFe(saleId) {
    const response = await fetch(`${this.apiUrl}/fiscal/nfe/emitir`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        saleId,
        enviarSefaz: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  }
  
  async buscarNFeDetalhes(saleId) {
    const response = await fetch(
      `${this.apiUrl}/fiscal/nfe?saleId=${saleId}`,
      { headers: { 'Authorization': `Bearer ${this.token}` }}
    );
    
    const nfes = await response.json();
    
    if (nfes.length === 0) {
      throw new Error('NF-e não encontrada');
    }
    
    return nfes[0];
  }
  
  async baixarDanfe(nfeId) {
    const response = await fetch(
      `${this.apiUrl}/fiscal/nfe/${nfeId}/danfe`,
      { headers: { 'Authorization': `Bearer ${this.token}` }}
    );
    
    if (!response.ok) {
      throw new Error('Erro ao baixar DANFE');
    }
    
    return await response.blob();
  }
}

// Uso no sistema de vendas
async function finalizarVenda(saleId) {
  const nfeService = new NFeService(API_URL, getToken());
  
  // Mostrar loading
  showLoading('Emitindo NF-e...');
  
  const resultado = await nfeService.emitirNFeAutomatica(saleId);
  
  hideLoading();
  
  if (resultado.sucesso) {
    // Mostrar sucesso
    showSuccess(resultado.mensagem);
    
    // Baixar DANFE automaticamente
    const danfeBlob = await nfeService.baixarDanfe(resultado.nfe.id);
    
    // Abrir para impressão
    const url = window.URL.createObjectURL(danfeBlob);
    window.open(url, '_blank');
    
    // Atualizar interface
    atualizarStatusVenda(saleId, 'FATURADA');
    
  } else {
    // Mostrar erro
    showError(resultado.mensagem);
  }
}
```

### **Interface React:**

```jsx
// components/FinalizarVenda.jsx

import React, { useState } from 'react';
import { NFeService } from '../services/nfe-service';

function FinalizarVenda({ sale, token }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  
  const handleEmitirNFe = async () => {
    setLoading(true);
    
    try {
      const nfeService = new NFeService(API_URL, token);
      const resultado = await nfeService.emitirNFeAutomatica(sale.id);
      
      setResultado(resultado);
      
      if (resultado.sucesso) {
        // Baixar DANFE
        const danfeBlob = await nfeService.baixarDanfe(resultado.nfe.id);
        const url = window.URL.createObjectURL(danfeBlob);
        window.open(url, '_blank');
      }
      
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="finalizar-venda">
      <h3>Venda #{sale.numero}</h3>
      <p>Cliente: {sale.customer.name}</p>
      <p>Valor: R$ {sale.totalAmount.toFixed(2)}</p>
      
      <button 
        onClick={handleEmitirNFe}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? '⏳ Emitindo NF-e...' : '📤 Emitir NF-e e Finalizar'}
      </button>
      
      {resultado && (
        <div className={resultado.sucesso ? 'alert-success' : 'alert-error'}>
          {resultado.sucesso ? '✅' : '❌'} {resultado.mensagem}
          
          {resultado.sucesso && (
            <div className="mt-2">
              <p><strong>Chave:</strong> {resultado.nfe.chaveAcesso}</p>
              <p><strong>Protocolo:</strong> {resultado.nfe.protocoloAutorizacao}</p>
              
              <div className="btn-group">
                <a 
                  href={resultado.urls.danfe}
                  target="_blank"
                  className="btn-secondary"
                >
                  📄 Visualizar DANFE
                </a>
                <a 
                  href={resultado.urls.xml}
                  download
                  className="btn-secondary"
                >
                  📥 Baixar XML
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FinalizarVenda;
```

---

## Caso 2: Dashboard de Faturamento

### **Cenário:**
Dashboard com estatísticas de NF-e emitidas, valores faturados e status.

### **Implementação:**

```jsx
// components/DashboardNFe.jsx

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function DashboardNFe({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    carregarDados();
  }, []);
  
  const carregarDados = async () => {
    try {
      // Buscar NF-e do mês atual
      const hoje = new Date();
      const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      
      const dataInicio = primeiroDia.toISOString().split('T')[0];
      const dataFim = ultimoDia.toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_URL}/fiscal/nfe?dataInicio=${dataInicio}&dataFim=${dataFim}`,
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      const nfes = await response.json();
      
      // Calcular estatísticas
      const stats = calcularEstatisticas(nfes);
      setStats(stats);
      
    } finally {
      setLoading(false);
    }
  };
  
  const calcularEstatisticas = (nfes) => {
    const total = nfes.length;
    const autorizadas = nfes.filter(n => n.status === 'AUTHORIZED').length;
    const rejeitadas = nfes.filter(n => n.status === 'REJECTED').length;
    const canceladas = nfes.filter(n => n.status === 'CANCELED').length;
    
    const valorTotal = nfes
      .filter(n => n.status === 'AUTHORIZED')
      .reduce((sum, n) => sum + n.valorTotal, 0);
    
    // Agrupar por dia
    const porDia = {};
    nfes.forEach(nfe => {
      const dia = new Date(nfe.dataEmissao).toLocaleDateString('pt-BR');
      if (!porDia[dia]) {
        porDia[dia] = { dia, quantidade: 0, valor: 0 };
      }
      porDia[dia].quantidade++;
      if (nfe.status === 'AUTHORIZED') {
        porDia[dia].valor += nfe.valorTotal;
      }
    });
    
    const chartData = Object.values(porDia);
    
    return {
      total,
      autorizadas,
      rejeitadas,
      canceladas,
      valorTotal,
      chartData,
      taxaAutorizacao: total > 0 ? ((autorizadas / total) * 100).toFixed(1) : 0
    };
  };
  
  if (loading) {
    return <div>⏳ Carregando...</div>;
  }
  
  return (
    <div className="dashboard-nfe">
      <h2>📊 Dashboard NF-e - Mês Atual</h2>
      
      {/* Cards de Estatísticas */}
      <div className="stats-cards">
        <div className="card">
          <h3>Total de NF-e</h3>
          <p className="big-number">{stats.total}</p>
        </div>
        
        <div className="card card-success">
          <h3>Autorizadas</h3>
          <p className="big-number">{stats.autorizadas}</p>
          <small>{stats.taxaAutorizacao}% do total</small>
        </div>
        
        <div className="card card-danger">
          <h3>Rejeitadas</h3>
          <p className="big-number">{stats.rejeitadas}</p>
        </div>
        
        <div className="card card-warning">
          <h3>Canceladas</h3>
          <p className="big-number">{stats.canceladas}</p>
        </div>
        
        <div className="card card-primary">
          <h3>Valor Faturado</h3>
          <p className="big-number">R$ {stats.valorTotal.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}</p>
        </div>
      </div>
      
      {/* Gráfico */}
      <div className="chart-container">
        <h3>Emissões por Dia</h3>
        <BarChart width={800} height={300} data={stats.chartData}>
          <XAxis dataKey="dia" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantidade" fill="#4CAF50" name="Quantidade" />
          <Bar dataKey="valor" fill="#2196F3" name="Valor (R$)" />
        </BarChart>
      </div>
    </div>
  );
}

export default DashboardNFe;
```

### **CSS:**

```css
.dashboard-nfe {
  padding: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.card h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
}

.big-number {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.card-success { border-left: 4px solid #4CAF50; }
.card-danger { border-left: 4px solid #f44336; }
.card-warning { border-left: 4px solid #ff9800; }
.card-primary { border-left: 4px solid #2196F3; }

.chart-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 20px;
}
```

---

## Caso 3: Portal do Cliente

### **Cenário:**
Cliente acessa portal para visualizar e baixar suas NF-e.

### **Implementação:**

```jsx
// components/PortalClienteNFe.jsx

import React, { useState, useEffect } from 'react';

function PortalClienteNFe({ customerId, token }) {
  const [nfes, setNfes] = useState([]);
  const [filtros, setFiltros] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    carregarNFes();
  }, [filtros]);
  
  const carregarNFes = async () => {
    setLoading(true);
    
    try {
      // Calcular período
      const dataInicio = new Date(filtros.ano, filtros.mes - 1, 1);
      const dataFim = new Date(filtros.ano, filtros.mes, 0);
      
      const params = new URLSearchParams({
        status: 'AUTHORIZED',
        dataInicio: dataInicio.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0]
      });
      
      const response = await fetch(
        `${API_URL}/fiscal/nfe?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      
      let nfes = await response.json();
      
      // Filtrar por cliente
      nfes = nfes.filter(nfe => nfe.destinatarioId === customerId);
      
      setNfes(nfes);
      
    } finally {
      setLoading(false);
    }
  };
  
  const handleDownloadDanfe = async (nfeId) => {
    const response = await fetch(
      `${API_URL}/fiscal/nfe/${nfeId}/danfe`,
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danfe-${nfeId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const handleDownloadXml = async (nfeId) => {
    const response = await fetch(
      `${API_URL}/fiscal/nfe/${nfeId}/xml`,
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfe-${nfeId}.xml`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const handleVisualizarDanfe = (nfeId) => {
    const url = `${API_URL}/fiscal/nfe/${nfeId}/danfe`;
    window.open(url, '_blank');
  };
  
  const valorTotal = nfes.reduce((sum, nfe) => sum + nfe.valorTotal, 0);
  
  return (
    <div className="portal-cliente-nfe">
      <h2>📄 Minhas Notas Fiscais</h2>
      
      {/* Filtros */}
      <div className="filtros">
        <select 
          value={filtros.mes}
          onChange={e => setFiltros({...filtros, mes: parseInt(e.target.value)})}
        >
          <option value={1}>Janeiro</option>
          <option value={2}>Fevereiro</option>
          <option value={3}>Março</option>
          <option value={4}>Abril</option>
          <option value={5}>Maio</option>
          <option value={6}>Junho</option>
          <option value={7}>Julho</option>
          <option value={8}>Agosto</option>
          <option value={9}>Setembro</option>
          <option value={10}>Outubro</option>
          <option value={11}>Novembro</option>
          <option value={12}>Dezembro</option>
        </select>
        
        <select 
          value={filtros.ano}
          onChange={e => setFiltros({...filtros, ano: parseInt(e.target.value)})}
        >
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select>
      </div>
      
      {/* Resumo */}
      <div className="resumo">
        <p><strong>Total de NF-e:</strong> {nfes.length}</p>
        <p><strong>Valor Total:</strong> R$ {valorTotal.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</p>
      </div>
      
      {/* Lista de NF-e */}
      {loading ? (
        <div>⏳ Carregando...</div>
      ) : nfes.length === 0 ? (
        <div className="empty-state">
          📭 Nenhuma NF-e encontrada neste período
        </div>
      ) : (
        <div className="nfe-list">
          {nfes.map(nfe => (
            <div key={nfe.id} className="nfe-card">
              <div className="nfe-header">
                <h3>NF-e #{nfe.numero} - Série {nfe.serie}</h3>
                <span className="badge badge-success">✅ Autorizada</span>
              </div>
              
              <div className="nfe-body">
                <div className="nfe-info">
                  <p><strong>Data:</strong> {new Date(nfe.dataEmissao).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Valor:</strong> R$ {nfe.valorTotal.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</p>
                  <p><strong>Chave:</strong> {nfe.chaveAcesso}</p>
                </div>
              </div>
              
              <div className="nfe-actions">
                <button 
                  onClick={() => handleVisualizarDanfe(nfe.id)}
                  className="btn btn-primary"
                >
                  👁️ Visualizar
                </button>
                <button 
                  onClick={() => handleDownloadDanfe(nfe.id)}
                  className="btn btn-secondary"
                >
                  📄 Baixar PDF
                </button>
                <button 
                  onClick={() => handleDownloadXml(nfe.id)}
                  className="btn btn-secondary"
                >
                  📥 Baixar XML
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PortalClienteNFe;
```

---

## Caso 4: Sistema de Cancelamento

### **Cenário:**
Interface para cancelamento de NF-e com validações e confirmações.

### **Implementação:**

```jsx
// components/CancelarNFe.jsx

import React, { useState } from 'react';

function CancelarNFe({ nfe, token, onCancelado }) {
  const [showModal, setShowModal] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  
  const podeSerCancelada = () => {
    // Verificar se está autorizada
    if (nfe.status !== 'AUTHORIZED') {
      return { pode: false, motivo: 'Apenas NF-e autorizadas podem ser canceladas' };
    }
    
    // Verificar prazo de 24 horas
    const dataEmissao = new Date(nfe.dataEmissao);
    const agora = new Date();
    const diferencaHoras = (agora - dataEmissao) / (1000 * 60 * 60);
    
    if (diferencaHoras > 24) {
      return { pode: false, motivo: 'Prazo de 24 horas excedido para cancelamento' };
    }
    
    return { pode: true };
  };
  
  const handleCancelar = async () => {
    // Validar justificativa
    if (justificativa.length < 15) {
      setErro('Justificativa deve ter no mínimo 15 caracteres');
      return;
    }
    
    setLoading(true);
    setErro(null);
    
    try {
      const response = await fetch(
        `${API_URL}/fiscal/nfe/${nfe.id}/cancelar`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ justificativa })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cancelar NF-e');
      }
      
      const resultado = await response.json();
      
      if (resultado.cStat === '135') {
        alert('✅ NF-e cancelada com sucesso!');
        setShowModal(false);
        if (onCancelado) onCancelado();
      } else {
        throw new Error(resultado.xMotivo);
      }
      
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const validacao = podeSerCancelada();
  
  if (!validacao.pode) {
    return (
      <button className="btn btn-danger" disabled title={validacao.motivo}>
        ❌ Não pode ser cancelada
      </button>
    );
  }
  
  return (
    <>
      <button 
        className="btn btn-danger"
        onClick={() => setShowModal(true)}
      >
        ❌ Cancelar NF-e
      </button>
      
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>⚠️ Cancelar NF-e #{nfe.numero}</h3>
              <button onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="alert alert-warning">
                <strong>Atenção!</strong> Esta ação não pode ser desfeita.
              </div>
              
              <div className="nfe-info">
                <p><strong>Número:</strong> {nfe.numero}</p>
                <p><strong>Cliente:</strong> {nfe.destinatarioNome}</p>
                <p><strong>Valor:</strong> R$ {nfe.valorTotal.toFixed(2)}</p>
                <p><strong>Chave:</strong> {nfe.chaveAcesso}</p>
              </div>
              
              <div className="form-group">
                <label>Justificativa (mínimo 15 caracteres):</label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Digite o motivo do cancelamento..."
                  rows={4}
                  className="form-control"
                />
                <small>{justificativa.length}/15 caracteres</small>
              </div>
              
              {erro && (
                <div className="alert alert-danger">
                  ❌ {erro}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Voltar
              </button>
              <button 
                onClick={handleCancelar}
                className="btn btn-danger"
                disabled={loading || justificativa.length < 15}
              >
                {loading ? '⏳ Cancelando...' : '❌ Confirmar Cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CancelarNFe;
```

---

## Caso 5: Relatório de NF-e

### **Cenário:**
Gerar relatório em Excel de NF-e emitidas no período.

### **Implementação:**

```javascript
// services/relatorio-nfe-service.js

import * as XLSX from 'xlsx';

class RelatorioNFeService {
  constructor(apiUrl, token) {
    this.apiUrl = apiUrl;
    this.token = token;
  }
  
  async gerarRelatorioExcel(dataInicio, dataFim) {
    try {
      // 1. Buscar NF-e do período
      const params = new URLSearchParams({
        dataInicio: dataInicio.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0]
      });
      
      const response = await fetch(
        `${this.apiUrl}/fiscal/nfe?${params}`,
        { headers: { 'Authorization': `Bearer ${this.token}` }}
      );
      
      const nfes = await response.json();
      
      // 2. Preparar dados para Excel
      const dados = nfes.map(nfe => ({
        'Número': nfe.numero,
        'Série': nfe.serie,
        'Data Emissão': new Date(nfe.dataEmissao).toLocaleDateString('pt-BR'),
        'Chave de Acesso': nfe.chaveAcesso,
        'Cliente': nfe.destinatarioNome,
        'CPF/CNPJ': nfe.destinatarioCnpjCpf,
        'Valor Produtos': nfe.valorProdutos,
        'Valor ICMS': nfe.valorICMS,
        'Valor PIS': nfe.valorPIS,
        'Valor COFINS': nfe.valorCOFINS,
        'Valor Total': nfe.valorTotal,
        'Status': nfe.status,
        'Protocolo': nfe.protocoloAutorizacao || '',
        'Data Autorização': nfe.dataAutorizacao ? 
          new Date(nfe.dataAutorizacao).toLocaleDateString('pt-BR') : ''
      }));
      
      // 3. Criar worksheet
      const ws = XLSX.utils.json_to_sheet(dados);
      
      // 4. Ajustar largura das colunas
      ws['!cols'] = [
        { wch: 8 },  // Número
        { wch: 6 },  // Série
        { wch: 12 }, // Data Emissão
        { wch: 46 }, // Chave
        { wch: 30 }, // Cliente
        { wch: 18 }, // CPF/CNPJ
        { wch: 12 }, // Valor Produtos
        { wch: 12 }, // Valor ICMS
        { wch: 12 }, // Valor PIS
        { wch: 12 }, // Valor COFINS
        { wch: 12 }, // Valor Total
        { wch: 12 }, // Status
        { wch: 18 }, // Protocolo
        { wch: 16 }  // Data Autorização
      ];
      
      // 5. Criar workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'NF-e');
      
      // 6. Adicionar sheet de resumo
      const resumo = this.gerarResumo(nfes);
      const wsResumo = XLSX.utils.json_to_sheet([resumo]);
      XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
      
      // 7. Gerar arquivo
      const nomeArquivo = `relatorio-nfe-${dataInicio.toISOString().split('T')[0]}-a-${dataFim.toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nomeArquivo);
      
      return {
        sucesso: true,
        totalRegistros: nfes.length,
        nomeArquivo
      };
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }
  
  gerarResumo(nfes) {
    const total = nfes.length;
    const autorizadas = nfes.filter(n => n.status === 'AUTHORIZED').length;
    const rejeitadas = nfes.filter(n => n.status === 'REJECTED').length;
    const canceladas = nfes.filter(n => n.status === 'CANCELED').length;
    
    const valorTotal = nfes
      .filter(n => n.status === 'AUTHORIZED')
      .reduce((sum, n) => sum + n.valorTotal, 0);
    
    const valorICMS = nfes
      .filter(n => n.status === 'AUTHORIZED')
      .reduce((sum, n) => sum + n.valorICMS, 0);
    
    const valorPIS = nfes
      .filter(n => n.status === 'AUTHORIZED')
      .reduce((sum, n) => sum + n.valorPIS, 0);
    
    const valorCOFINS = nfes
      .filter(n => n.status === 'AUTHORIZED')
      .reduce((sum, n) => sum + n.valorCOFINS, 0);
    
    return {
      'Total de NF-e': total,
      'Autorizadas': autorizadas,
      'Rejeitadas': rejeitadas,
      'Canceladas': canceladas,
      'Taxa de Autorização (%)': total > 0 ? ((autorizadas / total) * 100).toFixed(2) : 0,
      'Valor Total Faturado': valorTotal.toFixed(2),
      'Total ICMS': valorICMS.toFixed(2),
      'Total PIS': valorPIS.toFixed(2),
      'Total COFINS': valorCOFINS.toFixed(2)
    };
  }
}

export default RelatorioNFeService;
```

### **Uso:**

```jsx
// components/RelatorioNFe.jsx

import React, { useState } from 'react';
import RelatorioNFeService from '../services/relatorio-nfe-service';

function RelatorioNFe({ token }) {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleGerar = async () => {
    if (!dataInicio || !dataFim) {
      alert('Preencha as datas');
      return;
    }
    
    setLoading(true);
    
    try {
      const service = new RelatorioNFeService(API_URL, token);
      const resultado = await service.gerarRelatorioExcel(
        new Date(dataInicio),
        new Date(dataFim)
      );
      
      if (resultado.sucesso) {
        alert(`✅ Relatório gerado com ${resultado.totalRegistros} registros`);
      } else {
        alert(`❌ Erro: ${resultado.erro}`);
      }
      
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="relatorio-nfe">
      <h3>📊 Gerar Relatório de NF-e</h3>
      
      <div className="form-group">
        <label>Data Início:</label>
        <input 
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="form-control"
        />
      </div>
      
      <div className="form-group">
        <label>Data Fim:</label>
        <input 
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="form-control"
        />
      </div>
      
      <button 
        onClick={handleGerar}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? '⏳ Gerando...' : '📊 Gerar Relatório Excel'}
      </button>
    </div>
  );
}

export default RelatorioNFe;
```

---

## 📚 Conclusão

Estes exemplos cobrem os principais casos de uso para integração com a API de NF-e:

✅ **Emissão automática** em sistemas de vendas  
✅ **Dashboard** com estatísticas e gráficos  
✅ **Portal do cliente** para consulta e download  
✅ **Cancelamento** com validações  
✅ **Relatórios** em Excel  

**Documentos relacionados:**
- [API_NFE_COMPLETE.md](./API_NFE_COMPLETE.md) - Documentação completa da API
- [API_NFE_QUICK_REFERENCE.md](./API_NFE_QUICK_REFERENCE.md) - Referência rápida

---

**Versão:** 1.0.0  
**Data:** 16 de novembro de 2025
