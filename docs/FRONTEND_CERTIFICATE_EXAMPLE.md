# Exemplos Frontend: Certificado A1

## 🎨 Componentes React para Gerenciamento de Certificado

Este documento mostra exemplos práticos de como usar o campo `hasCertificadoA1` no frontend.

## 📊 Indicador de Status do Certificado

### Componente Simples

```tsx
import { CheckCircle, XCircle } from 'lucide-react';

interface CertificateStatusProps {
  hasCertificadoA1: boolean;
}

export function CertificateStatus({ hasCertificadoA1 }: CertificateStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {hasCertificadoA1 ? (
        <>
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-700">
            Certificado A1 cadastrado
          </span>
        </>
      ) : (
        <>
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-700">
            Sem certificado A1
          </span>
        </>
      )}
    </div>
  );
}
```

### Uso no Card da Empresa

```tsx
interface CompanyCardProps {
  company: {
    id: string;
    razaoSocial: string;
    cnpj: string;
    hasCertificadoA1: boolean;
    logoUrl?: string;
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{company.razaoSocial}</h3>
          <p className="text-sm text-gray-600">{company.cnpj}</p>
        </div>
        {company.logoUrl && (
          <img 
            src={company.logoUrl} 
            alt="Logo" 
            className="w-12 h-12 object-contain"
          />
        )}
      </div>
      
      <div className="mt-3">
        <CertificateStatus hasCertificadoA1={company.hasCertificadoA1} />
      </div>
    </div>
  );
}
```

## 🔔 Alertas Condicionais

### Alerta quando não há certificado

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function CertificateAlert({ hasCertificadoA1 }: { hasCertificadoA1: boolean }) {
  if (hasCertificadoA1) return null;

  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Esta empresa não possui certificado A1 cadastrado. 
        Será necessário fazer o upload para emitir notas fiscais.
      </AlertDescription>
    </Alert>
  );
}
```

## 🚀 Habilitando/Desabilitando Funcionalidades

### Botão de Emitir NF-e

```tsx
interface EmitirNfeButtonProps {
  company: {
    id: string;
    hasCertificadoA1: boolean;
  };
  onEmit: () => void;
}

export function EmitirNfeButton({ company, onEmit }: EmitirNfeButtonProps) {
  return (
    <div>
      <button
        onClick={onEmit}
        disabled={!company.hasCertificadoA1}
        className={`
          px-4 py-2 rounded font-medium
          ${company.hasCertificadoA1 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        Emitir NF-e
      </button>
      
      {!company.hasCertificadoA1 && (
        <p className="text-xs text-red-600 mt-1">
          É necessário cadastrar o certificado A1 antes de emitir NF-e
        </p>
      )}
    </div>
  );
}
```

### Menu com Tooltip

```tsx
import { Tooltip } from '@/components/ui/tooltip';

export function CompanyActionsMenu({ company }) {
  return (
    <div className="space-y-2">
      <Tooltip
        content={
          !company.hasCertificadoA1 
            ? 'Configure o certificado A1 para habilitar' 
            : ''
        }
      >
        <button 
          disabled={!company.hasCertificadoA1}
          className="w-full text-left px-3 py-2 disabled:opacity-50"
        >
          📄 Emitir NF-e
        </button>
      </Tooltip>
      
      <Tooltip
        content={
          !company.hasCertificadoA1 
            ? 'Configure o certificado A1 para habilitar' 
            : ''
        }
      >
        <button 
          disabled={!company.hasCertificadoA1}
          className="w-full text-left px-3 py-2 disabled:opacity-50"
        >
          📦 Emitir NFS-e
        </button>
      </Tooltip>
    </div>
  );
}
```

## ⚙️ Página de Configuração

### Seção de Certificado Digital

```tsx
import { useState } from 'react';
import { Upload, Trash2, CheckCircle } from 'lucide-react';

interface CertificateSettingsProps {
  company: {
    id: string;
    hasCertificadoA1: boolean;
  };
}

export function CertificateSettings({ company }: CertificateSettingsProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpload = async (file: File, senha: string) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('certificate', file);
    formData.append('senha', senha);

    try {
      const response = await fetch(
        `/api/companies/admin/${company.id}/certificate`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );
      
      if (response.ok) {
        // Recarregar dados da empresa
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Deseja realmente remover o certificado?')) return;
    
    setDeleting(true);
    try {
      await fetch(
        `/api/companies/admin/${company.id}/certificate`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      window.location.reload();
    } catch (error) {
      console.error('Erro ao remover:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Certificado Digital A1</h3>
      
      {company.hasCertificadoA1 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Certificado cadastrado e ativo</span>
          </div>
          
          <p className="text-sm text-gray-600">
            O certificado digital está configurado e pronto para uso 
            na emissão de documentos fiscais.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => {/* abrir modal de upload */}}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Upload className="inline w-4 h-4 mr-2" />
              Atualizar Certificado
            </button>
            
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50"
            >
              <Trash2 className="inline w-4 h-4 mr-2" />
              Remover
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Nenhum certificado A1 cadastrado. 
              Faça o upload para habilitar a emissão de documentos fiscais.
            </p>
          </div>
          
          <button
            onClick={() => {/* abrir modal de upload */}}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Upload className="inline w-4 h-4 mr-2" />
            Fazer Upload do Certificado
          </button>
        </div>
      )}
    </div>
  );
}
```

## 📋 Lista de Empresas com Filtro

### Filtrar por Status do Certificado

```tsx
import { useState } from 'react';

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filterCertificate, setFilterCertificate] = useState<'all' | 'with' | 'without'>('all');

  const filteredCompanies = companies.filter(company => {
    if (filterCertificate === 'with') return company.hasCertificadoA1;
    if (filterCertificate === 'without') return !company.hasCertificadoA1;
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterCertificate('all')}
          className={filterCertificate === 'all' ? 'font-bold' : ''}
        >
          Todas ({companies.length})
        </button>
        
        <button
          onClick={() => setFilterCertificate('with')}
          className={filterCertificate === 'with' ? 'font-bold text-green-600' : ''}
        >
          Com Certificado ({companies.filter(c => c.hasCertificadoA1).length})
        </button>
        
        <button
          onClick={() => setFilterCertificate('without')}
          className={filterCertificate === 'without' ? 'font-bold text-red-600' : ''}
        >
          Sem Certificado ({companies.filter(c => !c.hasCertificadoA1).length})
        </button>
      </div>

      <div className="space-y-2">
        {filteredCompanies.map(company => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
}
```

## 🎯 Dashboard: Estatísticas

```tsx
export function CertificateDashboard({ companies }: { companies: Company[] }) {
  const totalCompanies = companies.length;
  const withCertificate = companies.filter(c => c.hasCertificadoA1).length;
  const withoutCertificate = totalCompanies - withCertificate;
  const percentage = totalCompanies > 0 
    ? Math.round((withCertificate / totalCompanies) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="border rounded-lg p-4">
        <h4 className="text-sm text-gray-600">Total de Empresas</h4>
        <p className="text-2xl font-bold">{totalCompanies}</p>
      </div>
      
      <div className="border rounded-lg p-4 bg-green-50">
        <h4 className="text-sm text-gray-600">Com Certificado A1</h4>
        <p className="text-2xl font-bold text-green-600">{withCertificate}</p>
        <p className="text-xs text-gray-500">{percentage}% do total</p>
      </div>
      
      <div className="border rounded-lg p-4 bg-red-50">
        <h4 className="text-sm text-gray-600">Sem Certificado A1</h4>
        <p className="text-2xl font-bold text-red-600">{withoutCertificate}</p>
        <p className="text-xs text-gray-500">
          {100 - percentage}% do total
        </p>
      </div>
    </div>
  );
}
```

## 🔍 TypeScript: Interface

```typescript
export interface Company {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  email: string;
  telefone?: string;
  active: boolean;
  hasCertificadoA1: boolean; // 👈 Novo campo
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

## 📱 Badge Component

```tsx
interface CertificateBadgeProps {
  hasCertificadoA1: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CertificateBadge({ 
  hasCertificadoA1, 
  size = 'md' 
}: CertificateBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`
        ${sizeClasses[size]} 
        rounded-full font-medium
        ${hasCertificadoA1 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
        }
      `}
    >
      {hasCertificadoA1 ? '✓ Certificado A1' : '✗ Sem certificado'}
    </span>
  );
}
```

## 🎨 Uso em Tabela

```tsx
export function CompaniesTable({ companies }: { companies: Company[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left p-3">Razão Social</th>
          <th className="text-left p-3">CNPJ</th>
          <th className="text-left p-3">Certificado A1</th>
          <th className="text-left p-3">Ações</th>
        </tr>
      </thead>
      <tbody>
        {companies.map(company => (
          <tr key={company.id} className="border-b hover:bg-gray-50">
            <td className="p-3">{company.razaoSocial}</td>
            <td className="p-3">{company.cnpj}</td>
            <td className="p-3">
              <CertificateBadge 
                hasCertificadoA1={company.hasCertificadoA1} 
                size="sm" 
              />
            </td>
            <td className="p-3">
              <button className="text-blue-600 hover:underline">
                Editar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## 🔐 Validação antes de Ação

```tsx
async function emitirNfe(companyId: string) {
  // 1. Buscar dados da empresa
  const company = await fetchCompany(companyId);
  
  // 2. Verificar se tem certificado
  if (!company.hasCertificadoA1) {
    alert('Esta empresa não possui certificado A1 cadastrado!');
    // Redirecionar para página de configuração
    router.push(`/companies/${companyId}/settings?tab=certificate`);
    return;
  }
  
  // 3. Pedir senha do certificado
  const senha = prompt('Digite a senha do certificado A1:');
  if (!senha) return;
  
  // 4. Emitir nota
  try {
    await api.post(`/nfe/emitir`, {
      companyId,
      senhaCertificado: senha,
      // ... dados da nota
    });
    alert('NF-e emitida com sucesso!');
  } catch (error) {
    console.error('Erro ao emitir NF-e:', error);
  }
}
```

## 📚 Referências

- [Upload de Certificado A1](./CERTIFICATE_A1_UPLOAD.md)
- [Segurança de Dados Sensíveis](./SECURITY_SENSITIVE_DATA.md)
- [Endpoints Admin](./ADMIN_EDIT_COMPANIES.md)
