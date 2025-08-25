// src/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

const definition = {
  openapi: '3.0.0',
  info: {
    title: 'MOBsupply API',
    version: '1.0.0',
    description: 'Documentação das rotas da API do MOBsupply',
  },
  servers: [
    {
      url: 'http://localhost:3333/api',
      description: 'Servidor local de desenvolvimento',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Cliente: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nome: { type: 'string' },
          cpf: { type: 'string' },
          whatsapp: { type: 'string' },
          email: { type: 'string' },
          endereco: { type: 'string' },
          numero: { type: 'string' },
          complemento: { type: 'string' },
          bairro: { type: 'string' },
          cep: { type: 'string' },
          cidade: { type: 'string' },
          estado: { type: 'string' },
          uf: { type: 'string' },
          nascimento: { type: 'string', format: 'date' },
          genero: { type: 'string' },
          profissao: { type: 'string' },
          empresa: { type: 'string' },
          vendedorId: { type: 'string' },
          criadoEm: { type: 'string', format: 'date-time' },
          atualizadoEm: { type: 'string', format: 'date-time' },
          sincronizado: { type: 'boolean' },
          incompleto: { type: 'boolean' },
        },
        required: ['nome', 'cpf', 'whatsapp', 'endereco', 'cep', 'uf'],
      },

      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nome: { type: 'string' },
          cpf: { type: 'string' },
          senha: { type: 'string' },
          tipo: { type: 'string', enum: ['adm', 'filiado', 'vendedor'] },
          avatar: { type: 'string' },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },

      ProdutoEstoque: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nome: { type: 'string' },
          marca: { type: 'string' },
          tipo: { type: 'string' },
          preco_compra: { type: 'number' },
          preco_venda_caixa: { type: 'number' },
          preco_venda_unidade: { type: 'number' },
          quantidade_em_estoque: { type: 'number' },
          unidades_por_caixa: { type: 'number' },
        },
      },

      CategoriaEstoque: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          marca: { type: 'string' },
          tipo: { type: 'string' },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },

      Membro: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'b1f22c70-3a2d-4f45-9d3b-9b87ac57e9e3',
          },
          nome: {
            type: 'string',
            example: 'Rodrigo',
          },
          avatar: {
            type: 'string',
            nullable: true,
            example: 'https://i.pravatar.cc/150?img=3',
          },
          usos: {
            type: 'integer',
            example: 5,
          },
          comissao: {
            type: 'number',
            format: 'float',
            example: 12.5,
          },
          salvo: {
            type: 'boolean',
            example: true,
          },
        },
      },

      Venda: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clienteId: { type: 'string' },
          clienteNome: { type: 'string' },
          carrinho: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                produtoId: { type: 'string' },
                nome: { type: 'string' },
                tipo: { type: 'string' }, // ex: 'unitário', 'caixa', etc.
                quantidade: { type: 'number' },
                preco: { type: 'number' },
              },
            },
          },
          subtotal: { type: 'number' },
          descontoPercentual: { type: 'number' },
          descontoValor: { type: 'number' },
          destinoDesconto: { type: 'string' },
          frete: { type: 'number' },
          acrescimo: { type: 'number' },
          totalFinal: { type: 'number' },
          forma_pagamento: { type: 'string' },
          status_pagamento: {
            type: 'string',
            enum: ['pago', 'pendente', 'cancelado'],
          },
          parcelas: { type: 'integer' },
          observacoes: { type: 'string' },
          criadoEm: { type: 'string', format: 'date-time' },
        },
      },

      schemas: {
  Cliente: {
    // ... já existente ...
  },

  Usuario: {
    // ... já existente ...
  },

  ProdutoEstoque: {
    // ... já existente ...
  },

  CategoriaEstoque: {
    // ... já existente ...
  },

  Membro: {
    // ... já existente ...
  },

  Venda: {
    // ... já existente ...
  },

  // ✅ ADICIONADO: Schema de Filial
  Filial: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      nome: { type: 'string' },
      cidade: { type: 'string' },
      estado: { type: 'string' },
      uf: { type: 'string' },
      criadoEm: { type: 'string', format: 'date-time' },
      atualizadoEm: { type: 'string', format: 'date-time' },
    },
    required: ['nome', 'uf'],
  },
},

    },
  },
};

const options = {
  definition,
  apis: ['./src/routes/**/*.ts'], // inclui todas as rotas, inclusive subpastas
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
