export const gerarMensagemWhatsApp = (numero: string, nome: string) => {
  const texto = `
 - Oi, tudo bem?

Sou o Rodrigo da equipe MOB Supply!

Queria te convidar pra conhecer a gente — trabalhamos com cartuchos de qualidade, atendimento de confiança e um toque especial no cuidado com cada cliente.

E pra começar com o pé direito, quem chega agora pode garantir 10% de desconto ou frete grátis na primeira compra de Skin Ink ou VX Craft.

Me chama aqui pra saber mais e aproveitar esse benefício!
Ah, e se puder, dá uma passada no nosso Instagram: www.instagram.com/@mob.supplybr
  `.trim();

  const numLimpo = numero.replace(/\D/g, '');
  if (numLimpo.length < 10) return '';
  return `https://wa.me/55${numLimpo}?text=${encodeURIComponent(texto)}`;
};