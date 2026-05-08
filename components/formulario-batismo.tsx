"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface FormData {
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  igreja: string;
  pastor: string;
  data_batismo: string;
}

interface FormErrors {
  nome?: string;
  cpf?: string;
  data_nascimento?: string;
  telefone?: string;
  igreja?: string;
  pastor?: string;
  data_batismo?: string;
}

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 3) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)}-${digits.slice(3)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  if (parseInt(digits[9]) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  return parseInt(digits[10]) === digit2;
}

export default function FormularioBatismo() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    cpf: "",
    data_nascimento: "",
    telefone: "",
    igreja: "",
    pastor: "",
    data_batismo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === "cpf") {
      processedValue = formatCPF(value);
    } else if (name === "telefone") {
      processedValue = formatTelefone(value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const today = new Date();
    
    if (!formData.nome || formData.nome.trim().length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres";
    }
    
    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }
    
    if (!formData.data_nascimento) {
      newErrors.data_nascimento = "Data de nascimento é obrigatória";
    } else {
      const birthDate = new Date(formData.data_nascimento);
      if (birthDate >= today) {
        newErrors.data_nascimento = "Data de nascimento deve ser anterior a hoje";
      }
    }
    
    if (!formData.telefone || formData.telefone.replace(/\D/g, "").length < 10) {
      newErrors.telefone = "Telefone inválido";
    }
    
    if (!formData.igreja || formData.igreja.trim().length < 2) {
      newErrors.igreja = "Igreja é obrigatória";
    }
    
    if (!formData.pastor || formData.pastor.trim().length < 2) {
      newErrors.pastor = "Pastor é obrigatório";
    }
    
    if (!formData.data_batismo) {
      newErrors.data_batismo = "Data do batismo é obrigatória";
    } else {
      const baptismDate = new Date(formData.data_batismo);
      if (baptismDate < today) {
        newErrors.data_batismo = "Data do batismo deve ser hoje ou futura";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { error: supabaseError } = await supabase
        .from("inscricoes_batismo")
        .insert([
          {
            nome: formData.nome.trim(),
            cpf: formData.cpf.replace(/\D/g, ""),
            data_nascimento: formData.data_nascimento,
            telefone: formData.telefone,
            igreja: formData.igreja.trim(),
            pastor: formData.pastor.trim(),
            data_batismo: formData.data_batismo,
          },
        ]);
      
      if (supabaseError) {
        if (supabaseError.message.includes("duplicate key")) {
          setError("Este CPF já está cadastrado.");
        } else {
          setError("Erro ao salvar inscrição. Tente novamente.");
        }
        return;
      }
      
      setSuccess(true);
      setFormData({
        nome: "",
        cpf: "",
        data_nascimento: "",
        telefone: "",
        igreja: "",
        pastor: "",
        data_batismo: "",
      });
    } catch {
      setError("Erro ao conectar com o banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">
              Inscrição Realizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Seus dados foram enviados com sucesso. Em breve entraremos em contato.
            </p>
            <Button onClick={() => setSuccess(false)} variant="outline">
              Fazer Nova Inscrição
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const inputClass = (field: keyof FormErrors) =>
    `space-y-2 ${errors[field] ? "has-errors" : ""}`;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className={inputClass("nome")}>
            <label htmlFor="nome" className="text-sm font-medium text-gray-700">
              Nome Completo *
            </label>
            <Input
              id="nome"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
            />
            {errors.nome && (
              <p className="text-sm text-red-600">{errors.nome}</p>
            )}
          </div>
          
          <div className={inputClass("cpf")}>
            <label htmlFor="cpf" className="text-sm font-medium text-gray-700">
              CPF *
            </label>
            <Input
              id="cpf"
              name="cpf"
              type="text"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
            {errors.cpf && (
              <p className="text-sm text-red-600">{errors.cpf}</p>
            )}
          </div>
          
          <div className={inputClass("data_nascimento")}>
            <label
              htmlFor="data_nascimento"
              className="text-sm font-medium text-gray-700"
            >
              Data de Nascimento *
            </label>
            <Input
              id="data_nascimento"
              name="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={handleChange}
              required
            />
            {errors.data_nascimento && (
              <p className="text-sm text-red-600">{errors.data_nascimento}</p>
            )}
          </div>
          
          <div className={inputClass("telefone")}>
            <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
              Telefone *
            </label>
            <Input
              id="telefone"
              name="telefone"
              type="tel"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              maxLength={15}
              required
            />
            {errors.telefone && (
              <p className="text-sm text-red-600">{errors.telefone}</p>
            )}
          </div>
          
          <div className={inputClass("igreja")}>
            <label htmlFor="igreja" className="text-sm font-medium text-gray-700">
              Igreja *
            </label>
            <Input
              id="igreja"
              name="igreja"
              value={formData.igreja}
              onChange={handleChange}
              placeholder="Nome da igreja"
              required
            />
            {errors.igreja && (
              <p className="text-sm text-red-600">{errors.igreja}</p>
            )}
          </div>
          
          <div className={inputClass("pastor")}>
            <label htmlFor="pastor" className="text-sm font-medium text-gray-700">
              Pastor *
            </label>
            <Input
              id="pastor"
              name="pastor"
              value={formData.pastor}
              onChange={handleChange}
              placeholder="Nome do pastor"
              required
            />
            {errors.pastor && (
              <p className="text-sm text-red-600">{errors.pastor}</p>
            )}
          </div>
          
          <div className={inputClass("data_batismo")}>
            <label
              htmlFor="data_batismo"
              className="text-sm font-medium text-gray-700"
            >
              Data do Batismo *
            </label>
            <Input
              id="data_batismo"
              name="data_batismo"
              type="date"
              value={formData.data_batismo}
              onChange={handleChange}
              required
            />
            {errors.data_batismo && (
              <p className="text-sm text-red-600">{errors.data_batismo}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Inscrever-se"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}