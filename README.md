
# Sistema PDV

Sistema de Ponto de Venda (PDV) desenvolvido com React, TypeScript, Vite e Tailwind CSS, com interface totalmente em português do Brasil.

O projeto foi criado para fins de estudo e demonstração de habilidades em desenvolvimento de sistemas web, integrando gerenciamento de produtos, controle de estoque, registro de vendas e relatórios.

## Funcionalidades

### Ponto de Venda
- Pesquisa de produtos por nome ou código de barras
- Filtro de produtos por categoria
- Carrinho de compras interativo
- Controle de quantidades conforme estoque disponível
- Aplicação de descontos
- Cálculo automático do total
- Simulação de pagamentos em dinheiro, crédito, débito e PIX
- Cálculo automático do troco para pagamentos em dinheiro
- Registro das vendas realizadas
- Atualização automática do estoque

### Gerenciamento de Produtos
- Cadastro de produtos
- Edição de informações
- Exclusão de produtos com confirmação
- Controle de estoque
- Identificação de produtos com estoque baixo
- Identificação de produtos sem estoque
- Pesquisa por nome, categoria, código de barras ou ID
- Identificadores numéricos para produtos

### Histórico de Vendas
- Consulta das vendas realizadas
- Visualização dos detalhes de cada venda
- Identificação da forma de pagamento
- Quantidade de itens vendidos
- Descontos aplicados
- Total de cada venda
- Indicadores de faturamento e ticket médio

### Relatórios
- Faturamento total
- Quantidade de vendas
- Ticket médio
- Total de itens vendidos
- Distribuição das formas de pagamento
- Ranking dos produtos mais vendidos
- Total de descontos concedidos
- Histórico das vendas recentes

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- HTML5
- CSS3
- JavaScript
- Font Awesome
- LocalStorage

## Como Executar o Projeto

### Pré-requisitos

- Node.js compatível com a versão do Vite utilizada
- npm
- Git

### Instalação

Clone o repositório:

```bash
git clone https://github.com/elizianeandreia/Sistema_pdv.git
```

Entre na pasta:

```bash
cd Sistema_pdv
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra no navegador o endereço local informado pelo Vite.

### Compilação para Produção

```bash
npm run build
```

### Visualização da Versão de Produção

```bash
npm run preview
```

## Estrutura do Projeto

```text
Sistema_pdv/
├── src/
│   ├── components/
│   │   ├── PDV.tsx
│   │   ├── Products.tsx
│   │   ├── Reports.tsx
│   │   ├── Sales.tsx
│   │   └── Sidebar.tsx
│   ├── data/
│   │   └── products.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Armazenamento de Dados

O sistema utiliza LocalStorage para armazenar informações diretamente no navegador.

Os produtos, alterações de estoque e registros de vendas permanecem disponíveis após a atualização da página, desde que os dados locais do navegador sejam mantidos.

Não é necessária a configuração de banco de dados ou servidor backend para executar esta demonstração.

## Informações Importantes

Este projeto é uma demonstração para portfólio.

- Os produtos e valores iniciais são fictícios.
- Os pagamentos são simulados, sem processamento financeiro real.
- Não há emissão de documentos fiscais.
- Os dados são armazenados localmente no navegador.
- Não há sincronização entre dispositivos ou usuários.
- O sistema não foi desenvolvido para utilização comercial em produção.

## Desenvolvido por

**LTHS Tecnologia**

Desenvolvimento de sistemas web, soluções tecnológicas e projetos de software.

Site: https://www.lthstecnologia.com.br/

GitHub: https://github.com/elizianeandreia

---

Projeto desenvolvido para fins educacionais e de portfólio profissional.
