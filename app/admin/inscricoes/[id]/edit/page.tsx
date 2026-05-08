"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Inscricao {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  igreja: string;
  pastor: string;
  data_batismo: string;
}

export default function EditarInscricaoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Inscricao>({
    id: '',
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    igreja: '',
    pastor: '',
    data_batismo: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchInscricao(params.id);
    }
  }, [params.id]);

  const fetchInscricao = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inscricoes_batismo')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setFormData({
          id: data.id,
          nome: data.nome,
          cpf: data.cpf,
          data_nascimento: data.data_nascimento,
          telefone: data.telefone,
          igreja: data.igreja,
          pastor: data.pastor,
          data_batismo: data.data_batismo,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('inscricoes_batismo')
        .update({
          nome: formData.nome,
          cpf: formData.cpf,
          data_nascimento: formData.data_nascimento,
          telefone: formData.telefone,
          igreja: formData.igreja,
          pastor: formData.pastor,
          data_batismo: formData.data_batismo,
        })
        .eq('id', formData.id);

      if (error) throw error;

      alert('Inscrição atualizada com sucesso!');
      router.push('/admin/inscricoes');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Inscrição</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <Input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <Input
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Nascimento
            </label>
            <Input
              name="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <Input
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Igreja
            </label>
            <Input
              name="igreja"
              value={formData.igreja}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pastor
            </label>
            <Input
              name="pastor"
              value={formData.pastor}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do Batismo
            </label>
            <Input
              name="data_batismo"
              type="date"
              value={formData.data_batismo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/inscricoes')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
