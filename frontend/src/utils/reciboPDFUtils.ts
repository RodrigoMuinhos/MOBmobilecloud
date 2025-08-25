// src/utils/reciboPDFUtils.ts
import html2pdf from 'html2pdf.js';
import { Produto, Venda } from '../types/venda';
import { textos } from '../i18n/textos';

type IdiomaSuportado = 'pt' | 'en';

/**
 * Gera um recibo PDF a partir dos dados da venda.
 * @param venda Objeto contendo dados completos da venda.
 * @param idioma Idioma a ser usado no recibo ('pt' ou 'en').
 */
export const gerarReciboPDF = (venda: Venda, idioma: IdiomaSuportado = 'pt') => {
  const {
    cliente,
    data,
    forma_pagamento,
    itens,
    subtotal,
    desconto_aplicado = 0,
    total_final,
  } = venda;

  const texto = textos[idioma]?.vendas || textos.pt.vendas;

  const agrupado: Record<string, Produto> = {};
  itens.forEach((item) => {
    if (!agrupado[item.nome]) {
      agrupado[item.nome] = { ...item, quantidade: 0 };
    }
    agrupado[item.nome].quantidade += item.quantidade;
  });

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto;">
      <h2 style="text-align: center; color: #336021; margin-bottom: 24px;">
        ${texto.recibo || 'Recibo de Venda'}
      </h2>

      <p><strong>${texto.cliente || 'Cliente'}:</strong> ${cliente.nome}</p>
      <p><strong>CPF:</strong> ${cliente.cpf || '-'}</p>
      <p><strong>${texto.data || 'Data'}:</strong> ${data}</p>
      <p><strong>${texto.formaPagamento || 'Forma de Pagamento'}:</strong> ${forma_pagamento || '-'}</p>

      <table style="
        width: 100%;
        font-size: 13px;
        border-collapse: separate;
        border-spacing: 0;
        margin-top: 20px;
        border-radius: 8px;
        overflow: hidden;
      ">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 8px; border: 1px solid #ccc; text-align: left;">
              ${texto.produto || 'Produto'}
            </th>
            <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">
              ${texto.qtd || 'Qtd'}
            </th>
            <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">
              ${texto.unitario || 'Unitário'}
            </th>
            <th style="padding: 8px; border: 1px solid #ccc; text-align: center;">
              ${texto.total || 'Total'}
            </th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(agrupado)
            .map(
              (item) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ccc;">${item.nome}</td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                ${item.quantidade}
              </td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                R$ ${item.precoUnitario.toFixed(2)}
              </td>
              <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">
                R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}
              </td>
            </tr>`
            )
            .join('')}

          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">
              ${texto.subtotal || 'Subtotal'}
            </td>
            <td style="padding: 8px; text-align: center;">
              R$ ${Number(subtotal).toFixed(2)}
            </td>
          </tr>

          ${
            Number(desconto_aplicado) > 0
              ? `
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; color: red;">
                ${texto.desconto || 'Desconto'}
              </td>
              <td style="padding: 8px; text-align: center; color: red;">
                - R$ ${Number(desconto_aplicado).toFixed(2)}
              </td>
            </tr>
          `
              : ''
          }

          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">
              ${texto.totalFinal || 'Total Final'}
            </td>
            <td style="padding: 10px; text-align: center; font-weight: bold; color: green;">
              R$ ${Number(total_final).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  html2pdf()
    .set({
      margin: 10,
      filename: `recibo_${cliente.nome.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(html)
    .save();
};
