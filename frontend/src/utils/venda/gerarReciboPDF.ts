export function gerarReciboPDF() {
  const element = document.getElementById('recibo-pdf');
  if (element) {
    import('html2pdf.js').then((html2pdf) => {
      html2pdf.default()
        .set({
          filename: 'recibo-venda.pdf',
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    });
  }
}
