# 📝 Atualização de Cadastros para NFe

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Clientes](#clientes)
- [Produtos](#produtos)
- [Vendas](#vendas)
- [Empresas](#empresas)
- [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Visão Geral

Para que a emissão de NFe funcione corretamente, é necessário garantir que os cadastros de **Clientes**, **Produtos**, **Vendas** e **Empresas** contenham todos os campos fiscais obrigatórios. Este documento detalha os campos necessários e como implementá-los no frontend.

---

## 👥 CLIENTES

### Campos Já Existentes ✅

O modelo `Customer` já possui todos os campos necessários:

```typescript
interface Customer {
  // Tipo de pessoa
  personType: 'FISICA' | 'JURIDICA';
  
  // Pessoa Física
  name?: string;
  cpf?: string;
  rg?: string;
  birthDate?: Date;
  
  // Pessoa Jurídica
  companyName?: string;           // Razão Social
  tradeName?: string;             // Nome Fantasia
  cnpj?: string;
  stateRegistration?: string;     // Inscrição Estadual
  stateRegistrationExempt: boolean; // Isento de IE
  municipalRegistration?: string; // Inscrição Municipal
  
  // Contatos
  email?: string;
  phone?: string;
  mobile?: string;
  
  // Endereços
  addresses: CustomerAddress[];
}

interface CustomerAddress {
  type: string;           // COMERCIAL, RESIDENCIAL, ENTREGA
  label?: string;
  isDefault: boolean;
  
  zipCode: string;        // CEP
  street: string;         // Logradouro
  number: string;         // Número
  complement?: string;    // Complemento
  neighborhood: string;   // Bairro
  city: string;           // Cidade
  state: string;          // UF
  country: string;        // País
  reference?: string;     // Ponto de referência
}
```

### ⚠️ Campos Faltantes

**Precisa adicionar ao modelo `CustomerAddress`:**
```typescript
interface CustomerAddress {
  // ... campos existentes
  ibgeCode?: string;      // Código IBGE do município (7 dígitos)
}
```

### 🔧 Atualizações no Frontend

#### 1. Formulário de Cliente - Pessoa Jurídica

**Adicionar validação para Inscrição Estadual:**

```tsx
// src/components/customers/CustomerForm.tsx

export function CustomerForm({ customer }: CustomerFormProps) {
  const [personType, setPersonType] = useState<'FISICA' | 'JURIDICA'>('FISICA');
  const [stateRegistrationExempt, setStateRegistrationExempt] = useState(false);

  return (
    <Form>
      {/* ... campos existentes */}
      
      {personType === 'JURIDICA' && (
        <>
          <FormField name="stateRegistration">
            <FormLabel>Inscrição Estadual</FormLabel>
            <FormControl>
              <Input
                placeholder="123456789"
                disabled={stateRegistrationExempt}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Obrigatório para emissão de NFe se não for isento
            </FormDescription>
          </FormField>

          <FormField name="stateRegistrationExempt">
            <FormControl>
              <Checkbox
                checked={stateRegistrationExempt}
                onCheckedChange={setStateRegistrationExempt}
              />
            </FormControl>
            <FormLabel>Isento de Inscrição Estadual</FormLabel>
          </FormField>

          <FormField name="municipalRegistration">
            <FormLabel>Inscrição Municipal</FormLabel>
            <FormControl>
              <Input placeholder="1234567" {...field} />
            </FormControl>
            <FormDescription>
              Necessário para emissão de NFS-e
            </FormDescription>
          </FormField>
        </>
      )}
    </Form>
  );
}
```

#### 2. Formulário de Endereço

**Adicionar busca de código IBGE:**

```tsx
// src/components/customers/AddressForm.tsx

export function AddressForm() {
  const [loadingIbge, setLoadingIbge] = useState(false);

  const fetchIbgeCode = async (city: string, state: string) => {
    setLoadingIbge(true);
    try {
      // Buscar código IBGE via API do IBGE
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`
      );
      const municipalities = await response.json();
      const found = municipalities.find(
        (m: any) => m.nome.toLowerCase() === city.toLowerCase()
      );
      return found?.id;
    } catch (error) {
      console.error('Erro ao buscar código IBGE:', error);
    } finally {
      setLoadingIbge(false);
    }
  };

  const onCepBlur = async (cep: string) => {
    // Buscar CEP via ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    
    if (!data.erro) {
      setValue('street', data.logradouro);
      setValue('neighborhood', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.uf);
      
      // Buscar código IBGE
      const ibgeCode = await fetchIbgeCode(data.localidade, data.uf);
      if (ibgeCode) {
        setValue('ibgeCode', ibgeCode.toString());
      }
    }
  };

  return (
    <Form>
      <FormField name="zipCode">
        <FormLabel>CEP</FormLabel>
        <FormControl>
          <Input
            placeholder="00000-000"
            onBlur={(e) => onCepBlur(e.target.value)}
            {...field}
          />
        </FormControl>
      </FormField>

      {/* ... outros campos ... */}

      <FormField name="ibgeCode">
        <FormLabel>Código IBGE</FormLabel>
        <FormControl>
          <Input
            placeholder="3550308"
            disabled={loadingIbge}
            {...field}
          />
        </FormControl>
        <FormDescription>
          Preenchido automaticamente ao buscar CEP
        </FormDescription>
      </FormField>
    </Form>
  );
}
```

#### 3. Validação de Cliente para NFe

**Criar função de validação:**

```typescript
// src/utils/nfe-validations.ts

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCustomerForNFe(
  customer: Customer
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar documento
  if (customer.personType === 'FISICA') {
    if (!customer.cpf) {
      errors.push('CPF é obrigatório para emissão de NFe');
    }
  } else {
    if (!customer.cnpj) {
      errors.push('CNPJ é obrigatório para emissão de NFe');
    }
    if (!customer.companyName) {
      errors.push('Razão Social é obrigatória para emissão de NFe');
    }
    if (!customer.stateRegistration && !customer.stateRegistrationExempt) {
      warnings.push(
        'Inscrição Estadual não informada. Marque como isento se aplicável.'
      );
    }
  }

  // Validar endereço
  const defaultAddress = customer.addresses.find((a) => a.isDefault);
  if (!defaultAddress) {
    errors.push('Cliente deve ter um endereço padrão cadastrado');
  } else {
    if (!defaultAddress.zipCode) errors.push('CEP é obrigatório');
    if (!defaultAddress.street) errors.push('Logradouro é obrigatório');
    if (!defaultAddress.number) errors.push('Número é obrigatório');
    if (!defaultAddress.neighborhood) errors.push('Bairro é obrigatório');
    if (!defaultAddress.city) errors.push('Cidade é obrigatória');
    if (!defaultAddress.state) errors.push('UF é obrigatório');
    if (!defaultAddress.ibgeCode) {
      warnings.push('Código IBGE do município não informado');
    }
  }

  // Validar contato
  if (!customer.email && !customer.phone && !customer.mobile) {
    warnings.push('Nenhum contato informado (email ou telefone)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

#### 4. Indicador Visual no Cadastro

**Adicionar badge indicando se cliente está apto para NFe:**

```tsx
// src/components/customers/CustomerCard.tsx

export function CustomerCard({ customer }: { customer: Customer }) {
  const validation = validateCustomerForNFe(customer);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{customer.name || customer.companyName}</CardTitle>
          {validation.valid ? (
            <Badge variant="success">
              ✅ Apto para NFe
            </Badge>
          ) : (
            <Badge variant="warning">
              ⚠️ Dados incompletos
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!validation.valid && (
          <Alert variant="warning">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## 📦 PRODUTOS

### Campos Já Existentes ✅

O modelo `Product` já possui os campos fiscais:

```typescript
interface Product {
  // Informações básicas
  name: string;
  sku?: string;
  barcode?: string;        // EAN/GTIN
  
  // Unidade
  unit?: string;           // UN, KG, PC, etc
  
  // Preços
  salePrice: number;
  
  // Informações fiscais
  ncm?: string;            // NCM (8 dígitos)
  cest?: string;           // CEST (7 dígitos)
  origin?: string;         // Origem (0-8)
  
  // ICMS
  icmsCst?: string;        // CST do ICMS
  icmsRate?: number;       // Alíquota ICMS
  
  // IPI
  ipiCst?: string;         // CST do IPI
  ipiRate?: number;        // Alíquota IPI
  
  // PIS
  pisCst?: string;         // CST do PIS
  pisRate?: number;        // Alíquota PIS
  
  // COFINS
  cofinsCst?: string;      // CST do COFINS
  cofinsRate?: number;     // Alíquota COFINS
  
  // CFOP
  cfopEstadual?: string;             // CFOP para vendas dentro do estado
  cfopInterestadual?: string;        // CFOP para vendas fora do estado
  cfopEntradaEstadual?: string;      // CFOP para compras dentro do estado
  cfopEntradaInterestadual?: string; // CFOP para compras fora do estado
  
  // Tipo de produto
  tipoProduto?: string;    // PRODUTO ou SERVICO
}
```

### 🔧 Atualizações no Frontend

#### 1. Formulário de Produto - Aba Fiscal

**Expandir seção fiscal com todos os campos necessários:**

```tsx
// src/components/products/ProductForm.tsx

export function ProductFiscalTab() {
  const [tipoProduto, setTipoProduto] = useState<'PRODUTO' | 'SERVICO'>('PRODUTO');
  const [regimeTributario, setRegimeTributario] = useState<string>('SIMPLES_NACIONAL');

  return (
    <TabsContent value="fiscal">
      <div className="space-y-6">
        {/* Tipo de Produto */}
        <FormField name="tipoProduto">
          <FormLabel>Tipo</FormLabel>
          <Select value={tipoProduto} onValueChange={setTipoProduto}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRODUTO">Produto Físico</SelectItem>
              <SelectItem value="SERVICO">Serviço</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* NCM */}
        <FormField name="ncm">
          <FormLabel>
            NCM (Nomenclatura Comum do Mercosul)
            <RequiredBadge />
          </FormLabel>
          <FormControl>
            <Input
              placeholder="12345678"
              maxLength={8}
              {...field}
            />
          </FormControl>
          <FormDescription>
            8 dígitos obrigatórios para emissão de NFe
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={() => window.open('https://portalunico.siscomex.gov.br/classif/#/nomenclatura')}
            >
              Consultar NCM
            </Button>
          </FormDescription>
        </FormField>

        {/* CEST */}
        <FormField name="cest">
          <FormLabel>
            CEST (Código Especificador da Substituição Tributária)
          </FormLabel>
          <FormControl>
            <Input placeholder="0100100" maxLength={7} {...field} />
          </FormControl>
          <FormDescription>
            7 dígitos. Obrigatório para produtos com ST
          </FormDescription>
        </FormField>

        {/* Origem */}
        <FormField name="origin">
          <FormLabel>Origem da Mercadoria</FormLabel>
          <Select {...field}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8</SelectItem>
              <SelectItem value="1">1 - Estrangeira - Importação direta</SelectItem>
              <SelectItem value="2">2 - Estrangeira - Adquirida no mercado interno</SelectItem>
              <SelectItem value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40%</SelectItem>
              <SelectItem value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos</SelectItem>
              <SelectItem value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</SelectItem>
              <SelectItem value="6">6 - Estrangeira - Importação direta, sem similar nacional, constante em lista de Resolução CAMEX</SelectItem>
              <SelectItem value="7">7 - Estrangeira - Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX</SelectItem>
              <SelectItem value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* CFOP */}
        <div className="grid grid-cols-2 gap-4">
          <FormField name="cfopEstadual">
            <FormLabel>
              CFOP Venda Estadual
              <RequiredBadge />
            </FormLabel>
            <FormControl>
              <Input placeholder="5102" maxLength={4} {...field} />
            </FormControl>
            <FormDescription>
              Ex: 5102 - Venda dentro do estado
            </FormDescription>
          </FormField>

          <FormField name="cfopInterestadual">
            <FormLabel>CFOP Venda Interestadual</FormLabel>
            <FormControl>
              <Input placeholder="6102" maxLength={4} {...field} />
            </FormControl>
            <FormDescription>
              Ex: 6102 - Venda fora do estado
            </FormDescription>
          </FormField>
        </div>

        <Separator />

        {/* ICMS */}
        <h3 className="font-semibold text-lg">ICMS</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="icmsCst">
            <FormLabel>CST/CSOSN</FormLabel>
            {regimeTributario === 'SIMPLES_NACIONAL' ? (
              <Select {...field}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione CSOSN" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="101">101 - Tributada pelo Simples Nacional com permissão de crédito</SelectItem>
                  <SelectItem value="102">102 - Tributada pelo Simples Nacional sem permissão de crédito</SelectItem>
                  <SelectItem value="103">103 - Isenção do ICMS no Simples Nacional</SelectItem>
                  <SelectItem value="201">201 - Tributada pelo Simples Nacional com permissão de crédito e com cobrança do ICMS por ST</SelectItem>
                  <SelectItem value="202">202 - Tributada pelo Simples Nacional sem permissão de crédito e com cobrança do ICMS por ST</SelectItem>
                  <SelectItem value="400">400 - Não tributada pelo Simples Nacional</SelectItem>
                  <SelectItem value="500">500 - ICMS cobrado anteriormente por ST ou por antecipação</SelectItem>
                  <SelectItem value="900">900 - Outros</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select {...field}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione CST" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="00">00 - Tributada integralmente</SelectItem>
                  <SelectItem value="10">10 - Tributada e com cobrança do ICMS por ST</SelectItem>
                  <SelectItem value="20">20 - Com redução de base de cálculo</SelectItem>
                  <SelectItem value="30">30 - Isenta ou não tributada e com cobrança do ICMS por ST</SelectItem>
                  <SelectItem value="40">40 - Isenta</SelectItem>
                  <SelectItem value="41">41 - Não tributada</SelectItem>
                  <SelectItem value="50">50 - Suspensão</SelectItem>
                  <SelectItem value="51">51 - Diferimento</SelectItem>
                  <SelectItem value="60">60 - ICMS cobrado anteriormente por ST</SelectItem>
                  <SelectItem value="70">70 - Com redução de base de cálculo e cobrança do ICMS por ST</SelectItem>
                  <SelectItem value="90">90 - Outros</SelectItem>
                </SelectContent>
              </Select>
            )}
          </FormField>

          <FormField name="icmsRate">
            <FormLabel>Alíquota ICMS (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="18.00"
                step="0.01"
                {...field}
              />
            </FormControl>
          </FormField>
        </div>

        <Separator />

        {/* IPI */}
        <h3 className="font-semibold text-lg">IPI</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="ipiCst">
            <FormLabel>CST IPI</FormLabel>
            <Select {...field}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione CST" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00">00 - Entrada com recuperação de crédito</SelectItem>
                <SelectItem value="01">01 - Entrada tributada com alíquota zero</SelectItem>
                <SelectItem value="02">02 - Entrada isenta</SelectItem>
                <SelectItem value="03">03 - Entrada não-tributada</SelectItem>
                <SelectItem value="04">04 - Entrada imune</SelectItem>
                <SelectItem value="05">05 - Entrada com suspensão</SelectItem>
                <SelectItem value="49">49 - Outras entradas</SelectItem>
                <SelectItem value="50">50 - Saída tributada</SelectItem>
                <SelectItem value="51">51 - Saída tributável com alíquota zero</SelectItem>
                <SelectItem value="52">52 - Saída isenta</SelectItem>
                <SelectItem value="53">53 - Saída não-tributada</SelectItem>
                <SelectItem value="54">54 - Saída imune</SelectItem>
                <SelectItem value="55">55 - Saída com suspensão</SelectItem>
                <SelectItem value="99">99 - Outras saídas</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="ipiRate">
            <FormLabel>Alíquota IPI (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                {...field}
              />
            </FormControl>
          </FormField>
        </div>

        <Separator />

        {/* PIS */}
        <h3 className="font-semibold text-lg">PIS</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="pisCst">
            <FormLabel>CST PIS</FormLabel>
            <Select {...field}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione CST" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">01 - Operação Tributável com Alíquota Básica</SelectItem>
                <SelectItem value="02">02 - Operação Tributável com Alíquota Diferenciada</SelectItem>
                <SelectItem value="03">03 - Operação Tributável com Alíquota por Unidade de Medida</SelectItem>
                <SelectItem value="04">04 - Operação Tributável Monofásica</SelectItem>
                <SelectItem value="06">06 - Operação Tributável a Alíquota Zero</SelectItem>
                <SelectItem value="07">07 - Operação Isenta da Contribuição</SelectItem>
                <SelectItem value="08">08 - Operação sem Incidência da Contribuição</SelectItem>
                <SelectItem value="09">09 - Operação com Suspensão da Contribuição</SelectItem>
                <SelectItem value="49">49 - Outras Operações de Saída</SelectItem>
                <SelectItem value="99">99 - Outras Operações</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="pisRate">
            <FormLabel>Alíquota PIS (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="1.65"
                step="0.01"
                {...field}
              />
            </FormControl>
          </FormField>
        </div>

        <Separator />

        {/* COFINS */}
        <h3 className="font-semibold text-lg">COFINS</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="cofinsCst">
            <FormLabel>CST COFINS</FormLabel>
            <Select {...field}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione CST" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">01 - Operação Tributável com Alíquota Básica</SelectItem>
                <SelectItem value="02">02 - Operação Tributável com Alíquota Diferenciada</SelectItem>
                <SelectItem value="03">03 - Operação Tributável com Alíquota por Unidade de Medida</SelectItem>
                <SelectItem value="04">04 - Operação Tributável Monofásica</SelectItem>
                <SelectItem value="06">06 - Operação Tributável a Alíquota Zero</SelectItem>
                <SelectItem value="07">07 - Operação Isenta da Contribuição</SelectItem>
                <SelectItem value="08">08 - Operação sem Incidência da Contribuição</SelectItem>
                <SelectItem value="09">09 - Operação com Suspensão da Contribuição</SelectItem>
                <SelectItem value="49">49 - Outras Operações de Saída</SelectItem>
                <SelectItem value="99">99 - Outras Operações</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField name="cofinsRate">
            <FormLabel>Alíquota COFINS (%)</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="7.60"
                step="0.01"
                {...field}
              />
            </FormControl>
          </FormField>
        </div>

        {/* Alertas */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Os campos NCM e CFOP são obrigatórios para emissão de NFe.
            Consulte seu contador para preencher corretamente.
          </AlertDescription>
        </Alert>
      </div>
    </TabsContent>
  );
}
```

#### 2. Validação de Produto para NFe

```typescript
// src/utils/nfe-validations.ts

export function validateProductForNFe(product: Product): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Campos obrigatórios
  if (!product.ncm || product.ncm.length !== 8) {
    errors.push('NCM deve ter 8 dígitos');
  }

  if (!product.cfopEstadual || product.cfopEstadual.length !== 4) {
    errors.push('CFOP Estadual deve ter 4 dígitos');
  }

  if (!product.barcode) {
    warnings.push('Código de barras (EAN) não informado');
  }

  // Validar origem
  if (!product.origin || !['0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(product.origin)) {
    errors.push('Origem da mercadoria não informada ou inválida');
  }

  // Validar ICMS
  if (!product.icmsCst) {
    errors.push('CST/CSOSN do ICMS não informado');
  }

  // Validar PIS/COFINS
  if (!product.pisCst) {
    warnings.push('CST do PIS não informado');
  }
  if (!product.cofinsCst) {
    warnings.push('CST do COFINS não informado');
  }

  // Se tiver ST, validar CEST
  if (
    product.icmsCst &&
    ['10', '30', '60', '70', '201', '202', '500'].includes(product.icmsCst) &&
    !product.cest
  ) {
    warnings.push('CEST é recomendado para produtos com Substituição Tributária');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

#### 3. Badge de Status Fiscal

```tsx
// src/components/products/ProductFiscalBadge.tsx

export function ProductFiscalBadge({ product }: { product: Product }) {
  const validation = validateProductForNFe(product);

  if (validation.valid && validation.warnings.length === 0) {
    return <Badge variant="success">✅ Fiscal OK</Badge>;
  }

  if (validation.valid) {
    return (
      <Popover>
        <PopoverTrigger>
          <Badge variant="warning">⚠️ Avisos</Badge>
        </PopoverTrigger>
        <PopoverContent>
          <ul className="text-sm">
            {validation.warnings.map((w, i) => (
              <li key={i}>• {w}</li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger>
        <Badge variant="destructive">❌ Incompleto</Badge>
      </PopoverTrigger>
      <PopoverContent>
        <ul className="text-sm">
          {validation.errors.map((e, i) => (
            <li key={i} className="text-red-600">
              • {e}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
```

---

## 🛒 VENDAS

### Campos Já Existentes ✅

O modelo `Sale` já possui os campos necessários:

```typescript
interface Sale {
  // Identificação
  code: string;
  status: SaleStatus;
  
  // Cliente
  customerId: string;
  customer: Customer;
  
  // Valores
  subtotal: number;        // Soma dos produtos
  discountAmount: number;
  discountPercent: number;
  shippingCost: number;    // Frete
  otherCharges: number;    // Outras despesas
  totalAmount: number;     // Total final
  
  // Pagamento
  paymentMethodId?: string;
  installments: number;
  
  // Endereço de entrega
  useCustomerAddress: boolean;
  deliveryAddress?: Json;
  
  // Observações
  notes?: string;
  internalNotes?: string;
  
  // Itens
  items: SaleItem[];
}

interface SaleItem {
  productId: string;
  product: Product;
  
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}
```

### 🔧 Atualizações no Frontend

#### 1. Botão "Gerar NFe" na Lista de Vendas

```tsx
// src/components/sales/SaleActions.tsx

export function SaleActions({ sale }: { sale: Sale }) {
  const router = useRouter();
  const [validating, setValidating] = useState(false);

  const handleGenerateNFe = async () => {
    setValidating(true);
    
    // Validar cliente
    const customerValidation = validateCustomerForNFe(sale.customer);
    if (!customerValidation.valid) {
      toast.error('Cliente com dados incompletos para NFe', {
        description: customerValidation.errors.join(', '),
      });
      setValidating(false);
      return;
    }

    // Validar produtos
    const invalidProducts = sale.items.filter((item) => {
      const validation = validateProductForNFe(item.product);
      return !validation.valid;
    });

    if (invalidProducts.length > 0) {
      toast.error('Alguns produtos têm dados fiscais incompletos', {
        description: `${invalidProducts.length} produto(s) precisam ser atualizados`,
      });
      setValidating(false);
      return;
    }

    // Redirecionar para página de criação de NFe
    router.push(`/nfe/from-sale/${sale.id}`);
    setValidating(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/sales/${sale.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </DropdownMenuItem>
        
        {sale.status === 'CONFIRMED' && (
          <DropdownMenuItem onClick={handleGenerateNFe} disabled={validating}>
            <FileText className="mr-2 h-4 w-4" />
            {validating ? 'Validando...' : 'Gerar NFe'}
          </DropdownMenuItem>
        )}
        
        {/* ... outras ações */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### 2. Página de Detalhes da Venda

**Adicionar seção de NFes vinculadas:**

```tsx
// src/pages/sales/[id].tsx

export default function SaleDetailsPage({ sale }: { sale: Sale }) {
  const { data: nfes } = useQuery(
    ['nfes', 'by-sale', sale.id],
    () => nfeService.findAll({ saleId: sale.id })
  );

  return (
    <div className="space-y-6">
      {/* ... outras seções ... */}

      {/* NFes Vinculadas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          {nfes && nfes.data.length > 0 ? (
            <div className="space-y-2">
              {nfes.data.map((nfe) => (
                <div
                  key={nfe.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div>
                    <p className="font-semibold">
                      NFe {nfe.numero} - Série {nfe.serie}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(nfe.dataEmissao)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <NFeStatusBadge status={nfe.status} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/nfe/${nfe.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhuma NFe emitida para esta venda
              </p>
              {sale.status === 'CONFIRMED' && (
                <Button onClick={() => router.push(`/nfe/from-sale/${sale.id}`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Gerar NFe
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 3. Validação Pré-Venda

**Alertar sobre dados fiscais ao criar/editar venda:**

```tsx
// src/components/sales/SaleForm.tsx

export function SaleForm() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    if (customer) {
      const validation = validateCustomerForNFe(customer);
      if (!validation.valid) {
        toast.warning('Cliente com dados incompletos', {
          description: 'Será necessário completar os dados antes de emitir NFe',
        });
      }
    }
  }, [customer]);

  useEffect(() => {
    const invalidProducts = items.filter((item) => {
      const validation = validateProductForNFe(item.product);
      return !validation.valid;
    });

    if (invalidProducts.length > 0) {
      toast.warning('Produtos com dados fiscais incompletos', {
        description: `${invalidProducts.length} produto(s) precisarão ser atualizados`,
      });
    }
  }, [items]);

  return <Form>{/* ... campos do formulário ... */}</Form>;
}
```

---

## 🏢 EMPRESAS

### Campos Já Existentes ✅

```typescript
interface Company {
  // Identificação
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  
  // Endereço
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  
  // Contatos
  telefone?: string;
  email?: string;
  
  // Fiscal
  regimeTributario?: string;
  codigoMunicipioIBGE?: string;
  cfopPadrao?: string;
  
  // Certificado Digital
  certificadoDigitalPath?: string;
  certificadoDigitalSenha?: string;
  ambienteFiscal: string; // 'Homologacao' ou 'Producao'
  
  // Numeração
  serieNFe?: string;
  ultimoNumeroNFe: number;
  
  // Responsável Técnico
  respTecCNPJ?: string;
  respTecContato?: string;
  respTecEmail?: string;
  respTecFone?: string;
}
```

### 🔧 Atualizar Cadastro de Empresa

**Adicionar aba de configuração NFe:**

```tsx
// src/components/companies/CompanyNFeConfig.tsx

export function CompanyNFeConfig() {
  return (
    <TabsContent value="nfe">
      <Card>
        <CardHeader>
          <CardTitle>Configurações de NFe</CardTitle>
          <CardDescription>
            Configure os dados necessários para emissão de Notas Fiscais Eletrônicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ambiente */}
          <FormField name="ambienteFiscal">
            <FormLabel>Ambiente de Emissão</FormLabel>
            <Select {...field}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Homologacao">
                  🧪 Homologação (Testes)
                </SelectItem>
                <SelectItem value="Producao">
                  🏭 Produção (Real)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Use Homologação para testes e Produção para emissões reais
            </FormDescription>
          </FormField>

          {/* Série */}
          <FormField name="serieNFe">
            <FormLabel>Série da NFe</FormLabel>
            <FormControl>
              <Input placeholder="1" {...field} />
            </FormControl>
            <FormDescription>
              Série padrão para emissão de NFe
            </FormDescription>
          </FormField>

          {/* CFOP Padrão */}
          <FormField name="cfopPadrao">
            <FormLabel>CFOP Padrão</FormLabel>
            <FormControl>
              <Input placeholder="5102" {...field} />
            </FormControl>
          </FormField>

          <Separator />

          {/* Certificado Digital */}
          <h3 className="font-semibold">Certificado Digital A1</h3>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              O certificado digital é obrigatório para emissão de NFe.
              Faça upload do arquivo .pfx/.p12 fornecido pela Autoridade Certificadora.
            </AlertDescription>
          </Alert>

          <FormField name="certificadoDigital">
            <FormLabel>Arquivo do Certificado (.pfx)</FormLabel>
            <FormControl>
              <Input type="file" accept=".pfx,.p12" {...field} />
            </FormControl>
          </FormField>

          <FormField name="certificadoDigitalSenha">
            <FormLabel>Senha do Certificado</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormDescription>
              Armazenada de forma criptografada
            </FormDescription>
          </FormField>

          <Separator />

          {/* Responsável Técnico */}
          <h3 className="font-semibold">Responsável Técnico</h3>
          <FormDescription>
            Informações do desenvolvedor do sistema emissor (obrigatório na NFe)
          </FormDescription>

          <div className="grid grid-cols-2 gap-4">
            <FormField name="respTecCNPJ">
              <FormLabel>CNPJ</FormLabel>
              <FormControl>
                <Input placeholder="00.000.000/0000-00" {...field} />
              </FormControl>
            </FormField>

            <FormField name="respTecContato">
              <FormLabel>Nome do Contato</FormLabel>
              <FormControl>
                <Input placeholder="João Silva" {...field} />
              </FormControl>
            </FormField>

            <FormField name="respTecEmail">
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="contato@empresa.com" {...field} />
              </FormControl>
            </FormField>

            <FormField name="respTecFone">
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input placeholder="(11) 9999-9999" {...field} />
              </FormControl>
            </FormField>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
```

---

## ✅ Checklist de Implementação

### Clientes
- [ ] Adicionar campo `ibgeCode` ao modelo `CustomerAddress`
- [ ] Atualizar formulário de endereço com busca de código IBGE
- [ ] Implementar validação de cliente para NFe
- [ ] Adicionar badge indicando status fiscal do cliente
- [ ] Exibir alertas ao criar venda com cliente incompleto

### Produtos
- [ ] Expandir aba fiscal com todos os campos de tributos
- [ ] Adicionar selects para CST/CSOSN (ICMS, IPI, PIS, COFINS)
- [ ] Implementar validação de produto para NFe
- [ ] Adicionar badge de status fiscal do produto
- [ ] Criar links para consulta de NCM e CFOP
- [ ] Exibir alertas sobre campos obrigatórios

### Vendas
- [ ] Adicionar botão "Gerar NFe" nas ações da venda
- [ ] Implementar validação pré-NFe ao clicar no botão
- [ ] Adicionar seção "NFes Vinculadas" na página de detalhes
- [ ] Exibir alertas durante criação/edição de venda
- [ ] Criar página `/nfe/from-sale/[saleId]`

### Empresas
- [ ] Criar aba "Configurações NFe" no cadastro
- [ ] Implementar upload de certificado digital
- [ ] Adicionar campos do responsável técnico
- [ ] Configurar ambiente (Homologação/Produção)
- [ ] Validar dados obrigatórios para emissão

### Validações Gerais
- [ ] Criar funções de validação reutilizáveis
- [ ] Implementar feedback visual (badges, alertas)
- [ ] Adicionar tooltips explicativos
- [ ] Criar links para documentação oficial
- [ ] Implementar testes unitários das validações

---

## 📚 Recursos Úteis

### APIs e Consultas
- **NCM**: https://portalunico.siscomex.gov.br/classif/#/nomenclatura
- **CFOP**: http://www.econeteditora.com.br/boletim_icms/index_cfop.php
- **Código IBGE**: https://servicodados.ibge.gov.br/api/docs/localidades
- **CEP**: https://viacep.com.br/

### Documentação Oficial
- **Manual NFe 4.0**: http://www.nfe.fazenda.gov.br/portal/principal.aspx
- **Tabela ICMS**: Consultar SEFAZ estadual
- **Tabelas PIS/COFINS**: Receita Federal

---

## 🎯 Resumo de Campos Obrigatórios

### Cliente (Para NFe)
✅ **Obrigatórios:**
- Nome/Razão Social
- CPF ou CNPJ
- Endereço completo com CEP
- Código IBGE do município
- UF

⚠️ **Recomendados:**
- Inscrição Estadual (se contribuinte)
- E-mail
- Telefone

### Produto (Para NFe)
✅ **Obrigatórios:**
- NCM (8 dígitos)
- CFOP (4 dígitos)
- Origem da mercadoria (0-8)
- CST/CSOSN do ICMS
- Unidade de medida

⚠️ **Recomendados:**
- Código de barras (EAN)
- CEST (se tiver ST)
- CST PIS/COFINS
- Alíquotas dos tributos

### Empresa (Para NFe)
✅ **Obrigatórios:**
- Razão Social
- CNPJ
- Inscrição Estadual
- Endereço completo
- Código IBGE do município
- Certificado Digital A1
- Responsável Técnico

⚠️ **Recomendados:**
- CFOP padrão
- Série da NFe
- Regime tributário

---

**Última atualização:** 16/11/2025  
**Versão:** 1.0  
**Prioridade:** Alta - Implementar antes da emissão real de NFe
