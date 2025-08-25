describe('Cadastro de Produtos Personalizados', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/config/produtos');
    cy.wait(300); // pequeno tempo para a interface carregar
  });

  it('Adiciona e salva um novo produto com preço e valor de venda', () => {
    // Clica no botão para adicionar novo produto
    cy.contains('Adicionar Produto').click();

    // Digita os dados nos campos da última linha adicionada
    cy.get('input').eq(1).clear().type('Teste Cypress'); // Nome
    cy.get('input').eq(2).clear().type('50'); // Quantidade
    cy.get('input').eq(3).clear().type('6,50'); // Preço Und
    cy.get('input').eq(4).clear().type('12,00'); // Valor Venda

    // Salva o produto
    cy.contains('Salvar').click();

    // Verifica se a mensagem de sucesso aparece
    cy.contains('salvos com sucesso').should('exist');
  });
});
