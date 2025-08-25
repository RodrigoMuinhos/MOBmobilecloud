import html2pdf from 'html2pdf.js';
import { Venda, Produto } from '../types/venda';

export const gerarReciboPDF = (venda: Venda) => {
  const { cliente, data, forma_pagamento, itens, subtotal, desconto_aplicado, total_final } = venda;

  const agrupado: Record<string, typeof itens[0]> = {};
  itens.forEach((item) => {
    if (!agrupado[item.nome]) {
      agrupado[item.nome] = { ...item, quantidade: 0 };
    }
    agrupado[item.nome].quantidade += item.quantidade;
  });

  const html = `
    <div style="font-family: Arial; padding: 16px; width: 100%; max-width: 600px;">
      <h2 style="text-align: center; color: #336021;">Recibo de Venda</h2>
      <p><strong>Cliente:</strong> ${cliente.nome}</p>
      <p><strong>CPF:</strong> ${cliente.cpf}</p>
      <p><strong>Data:</strong> ${data}</p>
      <p><strong>Forma de Pagamento:</strong> ${forma_pagamento || 'N/A'}</p>

      <table style="width: 100%; font-size: 12px; border-collapse: collapse; margin-top: 10px;">
        <thead>
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ccc;">Produto</th>
            <th style="text-align: center; border-bottom: 1px solid #ccc;">Qtd</th>
            <th style="text-align: center; border-bottom: 1px solid #ccc;">Unitário</th>
            <th style="text-align: center; border-bottom: 1px solid #ccc;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(agrupado).map(item => `
            <tr>
              <td>${item.nome}</td>
              <td style="text-align: center;">${item.quantidade}</td>
              <td style="text-align: center;">R$ ${item.precoUnitario.toFixed(2)}</td>
              <td style="text-align: center;">R$ ${(item.quantidade * item.precoUnitario).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr>
            <td colspan="3" style="text-align: right; font-weight: bold; padding-top: 8px;">Subtotal</td>
            <td style="text-align: center;">R$ ${Number(subtotal).toFixed(2)}</td>
          </tr>
          ${Number(desconto_aplicado) > 0 ? `
            <tr>
              <td colspan="3" style="text-align: right; color: red;">Desconto Aplicado</td>
              <td style="text-align: center; color: red;">- R$ ${Number(desconto_aplicado).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr>
            <td colspan="3" style="text-align: right; font-weight: bold;">TOTAL FINAL</td>
            <td style="text-align: center; font-weight: bold; color: green;">R$ ${Number(total_final).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  html2pdf().from(html).save(`recibo_${cliente.nome}.pdf`);
};