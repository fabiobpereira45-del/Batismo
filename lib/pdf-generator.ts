// PDF Generator - Client-side only
// This file is kept for reference but actual PDF generation is done in the component
// using dynamic import to avoid server-side issues with jsPDF.

export interface Inscricao {
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  igreja: string;
  pastor: string;
  data_batismo: string;
}

// This function is now implemented in the component using dynamic import
// to avoid server-side issues with jsPDF.
