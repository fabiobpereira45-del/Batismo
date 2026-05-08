"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// PDF generation will be done via dynamic import in the browser
const generatePDF = async (inscricoes: any[], filtros?: any) => {
  if (typeof window === 'undefined') return;
  
  const jsPDF = (await import('jspdf')).default;
  await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(20);
  doc.text('Igreja Assembléia de Deus', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Ministério Tancredo Neves', 105, 30, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Relatório de Inscrições - Batismo', 105, 45, { align: 'center' });
  
  // Informações dos filtros aplicados
  if (filtros) {
    let filtrosTexto = 'Filtros: ';
    if (filtros.nome) filtrosTexto += `Nome: ${filtros.nome} | `;
    if (filtros.igreja) filtrosTexto += `Igreja: ${filtros.igreja} | `;
    if (filtros.pastor) filtrosTexto += `Pastor: ${filtros.pastor} | `;
    
    if (filtrosTexto !== 'Filtros: ') {
      doc.setFontSize(10);
      doc.text(filtrosTexto.slice(0, -3), 105, 55, { align: 'center' });
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
  doc.text(`Gerado em: ${dataGeracao}`, 105, 65, { align: 'center' });
  
  // Tabela
  const headers = [['Nome', 'CPF', 'Idade', 'Telefone', 'Igreja', 'Pastor', 'Data Batismo']];
  
  const data = inscricoes.map((inscricao: any) => {
    const hoje = new Date();
    const nascimento = new Date(inscricao.data_nascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return [
      inscricao.nome,
      inscricao.cpf,
      `${idade} anos`,
      inscricao.telefone,
      inscricao.igreja,
      inscricao.pastor,
      new Date(inscricao.data_batismo).toLocaleDateString('pt-BR'),
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
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  // Salvar o PDF
  doc.save(`inscricoes-batismo-${new Date().toISOString().slice(0, 10)}.pdf`);
};

interface Inscricao {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  igreja: string;
  pastor: string;
  data_batismo: string;
  created_at: string;
}

export default function InscricoesPage() {
  const router = useRouter();
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroIgreja, setFiltroIgreja] = useState('');
  const [filtroPastor, setFiltroPastor] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  
  // Opções únicas para dropdowns
  const [igrejas, setIgrejas] = useState<string[]>([]);
  const [pastores, setPastores] = useState<string[]>([]);

  useEffect(() => {
    fetchInscricoes();
    fetchOpcoes();
  }, []);

  const fetchOpcoes = async () => {
    try {
      const { data: igrejasData } = await supabase
        .from('inscricoes_batismo')
        .select('igreja')
        .order('igreja');
      
      const { data: pastoresData } = await supabase
        .from('inscricoes_batismo')
        .select('pastor')
        .order('pastor');

      const igrejasUnicas = Array.from(new Set(igrejasData?.map(i => i.igreja) || []));
      const pastoresUnicos = Array.from(new Set(pastoresData?.map(p => p.pastor) || []));
      setIgrejas(igrejasUnicas);
      setPastores(pastoresUnicos);
    } catch (err) {
      console.error('Erro ao buscar opções:', err);
    }
  };

  const fetchInscricoes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('inscricoes_batismo')
        .select('*')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtroNome) {
        query = query.ilike('nome', `%${filtroNome}%`);
      }
      if (filtroIgreja) {
        query = query.eq('igreja', filtroIgreja);
      }
      if (filtroPastor) {
        query = query.eq('pastor', filtroPastor);
      }
      if (filtroDataInicio) {
        query = query.gte('data_batismo', filtroDataInicio);
      }
      if (filtroDataFim) {
        query = query.lte('data_batismo', filtroDataFim);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInscricoes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a inscrição de ${nome}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inscricoes_batismo')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      alert('Inscrição excluída com sucesso!');
      fetchInscricoes();
    } catch (err: any) {
      alert(`Erro ao excluir: ${err.message}`);
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesDiff = hoje.getMonth() - nascimento.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroIgreja('');
    setFiltroPastor('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    fetchInscricoes();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando inscrições...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inscrições</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                generatePDF(inscricoes, {
                  nome: filtroNome || undefined,
                  igreja: filtroIgreja || undefined,
                  pastor: filtroPastor || undefined,
                });
              }}
              variant="outline"
            >
              Exportar PDF
            </Button>
            <Link href="/admin/dashboard">
              <Button variant="outline">Voltar ao Dashboard</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-medium mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
                placeholder="Buscar por nome..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Igreja
              </label>
              <select
                value={filtroIgreja}
                onChange={(e) => setFiltroIgreja(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Todas</option>
                {igrejas.map((igreja) => (
                  <option key={igreja} value={igreja}>{igreja}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pastor
              </label>
              <select
                value={filtroPastor}
                onChange={(e) => setFiltroPastor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Todos</option>
                {pastores.map((pastor) => (
                  <option key={pastor} value={pastor}>{pastor}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchInscricoes}>Aplicar Filtros</Button>
            <Button variant="outline" onClick={limparFiltros}>Limpar Filtros</Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Igreja
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pastor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Batismo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inscricoes.map((inscricao) => (
                  <tr key={inscricao.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inscricao.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscricao.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calcularIdade(inscricao.data_nascimento)} anos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscricao.igreja}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscricao.pastor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inscricao.data_batismo).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link href={`/admin/inscricoes/${inscricao.id}/edit`}>
                        <Button size="sm" variant="outline">Editar</Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(inscricao.id, inscricao.nome)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {inscricoes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma inscrição encontrada.
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Total: {inscricoes.length} inscrição(ões)
        </div>
      </div>
    </div>
  );
}
