-- Script de Migração de Dados: Adicionar Códigos SEFAZ às Formas de Pagamento Existentes
-- Execute este script APÓS aplicar a migration 20251116201209_add_sefaz_payment_codes

-- IMPORTANTE: Este script faz um mapeamento automático baseado no campo "type"
-- Revise os dados após a execução para garantir que os códigos estão corretos!

BEGIN;

-- 1. Mapear tipos básicos de pagamento para códigos SEFAZ
UPDATE "payment_methods"
SET "sefazCode" = 'DINHEIRO'
WHERE type = 'CASH' AND "sefazCode" IS NULL;

UPDATE "payment_methods"
SET "sefazCode" = 'CARTAO_CREDITO'
WHERE type = 'CREDIT_CARD' AND "sefazCode" IS NULL;

UPDATE "payment_methods"
SET "sefazCode" = 'CARTAO_DEBITO'
WHERE type = 'DEBIT_CARD' AND "sefazCode" IS NULL;

-- PIX: usar PIX_DINAMICO como padrão (mais comum)
UPDATE "payment_methods"
SET "sefazCode" = 'PIX_DINAMICO'
WHERE type = 'PIX' AND "sefazCode" IS NULL;

UPDATE "payment_methods"
SET "sefazCode" = 'BOLETO_BANCARIO'
WHERE type = 'BANK_SLIP' AND "sefazCode" IS NULL;

UPDATE "payment_methods"
SET "sefazCode" = 'TRANSFERENCIA'
WHERE type = 'BANK_TRANSFER' AND "sefazCode" IS NULL;

UPDATE "payment_methods"
SET "sefazCode" = 'CHEQUE'
WHERE type = 'CHECK' AND "sefazCode" IS NULL;

-- 2. Mapear formas de pagamento específicas baseadas no NOME (case-insensitive)

-- Vale Alimentação
UPDATE "payment_methods"
SET "sefazCode" = 'VALE_ALIMENTACAO'
WHERE (
  LOWER(name) LIKE '%vale alimenta%' OR
  LOWER(name) LIKE '%alelo alimenta%' OR
  LOWER(name) LIKE '%sodexo alimenta%' OR
  LOWER(code) LIKE '%ALIMENTACAO%'
) AND "sefazCode" IS NULL;

-- Vale Refeição
UPDATE "payment_methods"
SET "sefazCode" = 'VALE_REFEICAO'
WHERE (
  LOWER(name) LIKE '%vale refei%' OR
  LOWER(name) LIKE '%ticket%' OR
  LOWER(name) LIKE '%vr%' OR
  LOWER(code) LIKE '%REFEICAO%'
) AND "sefazCode" IS NULL;

-- Vale Presente
UPDATE "payment_methods"
SET "sefazCode" = 'VALE_PRESENTE'
WHERE (
  LOWER(name) LIKE '%vale presente%' OR
  LOWER(name) LIKE '%gift card%' OR
  LOWER(code) LIKE '%PRESENTE%'
) AND "sefazCode" IS NULL;

-- Vale Combustível
UPDATE "payment_methods"
SET "sefazCode" = 'VALE_COMBUSTIVEL'
WHERE (
  LOWER(name) LIKE '%vale combust%' OR
  LOWER(name) LIKE '%ticket car%' OR
  LOWER(code) LIKE '%COMBUSTIVEL%'
) AND "sefazCode" IS NULL;

-- PIX Estático (chave PIX)
UPDATE "payment_methods"
SET "sefazCode" = 'PIX_ESTATICO'
WHERE (
  LOWER(name) LIKE '%pix est%' OR
  LOWER(name) LIKE '%pix chave%' OR
  LOWER(code) LIKE '%PIX_STATIC%'
) AND "sefazCode" IS NULL;

-- Crédito Loja / Crediário
UPDATE "payment_methods"
SET "sefazCode" = 'CREDITO_LOJA'
WHERE (
  LOWER(name) LIKE '%credito loja%' OR
  LOWER(name) LIKE '%crediario%' OR
  LOWER(name) LIKE '%carnê%' OR
  LOWER(code) LIKE '%CREDIARIO%'
) AND "sefazCode" IS NULL;

-- Carteira Digital (PicPay, Mercado Pago, etc.)
UPDATE "payment_methods"
SET "sefazCode" = 'TRANSFERENCIA'
WHERE (
  LOWER(name) LIKE '%picpay%' OR
  LOWER(name) LIKE '%mercado pago%' OR
  LOWER(name) LIKE '%carteira digital%' OR
  LOWER(code) LIKE '%DIGITAL_WALLET%'
) AND "sefazCode" IS NULL;

-- Depósito Bancário
UPDATE "payment_methods"
SET "sefazCode" = 'DEPOSITO_BANCARIO'
WHERE (
  LOWER(name) LIKE '%deposito%' OR
  LOWER(code) LIKE '%DEPOSIT%'
) AND "sefazCode" IS NULL;

-- 3. Qualquer outra forma de pagamento não mapeada = OUTROS
UPDATE "payment_methods"
SET "sefazCode" = 'OUTROS'
WHERE "sefazCode" IS NULL;

-- 4. Exibir resumo das alterações
DO $$
DECLARE
  total_records INTEGER;
  records_by_code RECORD;
BEGIN
  SELECT COUNT(*) INTO total_records FROM "payment_methods";
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Resumo da Migração de Códigos SEFAZ';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de formas de pagamento: %', total_records;
  RAISE NOTICE '';
  RAISE NOTICE 'Distribuição por código SEFAZ:';
  RAISE NOTICE '----------------------------------------';
  
  FOR records_by_code IN 
    SELECT "sefazCode", COUNT(*) as count
    FROM "payment_methods"
    GROUP BY "sefazCode"
    ORDER BY count DESC
  LOOP
    RAISE NOTICE '  % = % registros', records_by_code."sefazCode", records_by_code.count;
  END LOOP;
  
  RAISE NOTICE '========================================';
END $$;

-- 5. Listar formas de pagamento mapeadas para revisão
SELECT 
  id,
  name,
  code,
  type,
  "sefazCode",
  active
FROM "payment_methods"
ORDER BY "sefazCode", name;

-- Se tudo estiver OK, faça COMMIT
-- Se houver problemas, faça ROLLBACK
-- COMMIT;
ROLLBACK; -- ⚠️ Remova esta linha e use COMMIT após revisar os dados!

