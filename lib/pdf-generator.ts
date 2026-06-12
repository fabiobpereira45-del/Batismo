import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Inscricao {
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  igreja: string;
  pastor: string;

  cargo: string;
  funcao: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  estado_civil: string;
}

export function generatePDF(inscricoes: Inscricao[], filtros?: {
  nome?: string;
  igreja?: string;
  pastor?: string;
}) {
  const doc = new jsPDF('landscape');
  
  // Cabeçalho
  doc.setFontSize(20);
  doc.text('Igreja Assembléia de Deus', 148, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Ministério Tancredo Neves', 148, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Relatório - Cadastro de Membros e Obreiros', 148, 45, { align: 'center' });
  
  // Informações dos filtros aplicados
  if (filtros) {
    let filtrosTexto = 'Filtros: ';
    if (filtros.nome) filtrosTexto += `Nome: ${filtros.nome} | `;
    if (filtros.igreja) filtrosTexto += `Igreja: ${filtros.igreja} | `;
    if (filtros.pastor) filtrosTexto += `Pastor: ${filtros.pastor} | `;
    
    if (filtrosTexto !== 'Filtros: ') {
      doc.setFontSize(10);
      doc.text(filtrosTexto.slice(0, -3), 148, 55, { align: 'center' });
    }
  }
  
  // Data de geração
  const dataGeracao = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFontSize(10);
  doc.text(`Gerado em: ${dataGeracao}`, 148, 65, { align: 'center' });
  
  // Tabela
  const headers = [['Nome', 'CPF', 'Idade', 'Tel.', 'Cargo/Função', 'Est. Civil', 'Endereço', 'Igreja/Pastor']];
  
  const data = inscricoes.map((inscricao) => {
    const hoje = new Date();
    const nascimento = new Date(inscricao.data_nascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    const endereco = inscricao.cidade ? `${inscricao.cidade}/${inscricao.estado}` : '';
    const cargoFuncao = [inscricao.cargo, inscricao.funcao].filter(Boolean).join(' / ');
    const igrejaPastor = [inscricao.igreja, inscricao.pastor].filter(Boolean).join('\n');
    
    return [
      inscricao.nome,
      inscricao.cpf,
      `${idade} anos`,
      inscricao.telefone,
      cargoFuncao,
      inscricao.estado_civil,
      endereco,
      igrejaPastor,

    ];
  });
  
  (doc as any).autoTable({
    head: headers,
    body: data,
    startY: 75,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [66, 139, 202] },
    margin: { top: 75 },
  });
  
  // Rodapé
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      148,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Salvar o PDF
  doc.save(`cadastro-membros-${new Date().toISOString().slice(0, 10)}.pdf`);
}
