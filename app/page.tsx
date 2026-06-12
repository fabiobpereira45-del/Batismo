import FormularioBatismo from "@/components/formulario-batismo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 relative">
      <div className="absolute top-4 right-4">
        <Link 
          href="/admin/login" 
          className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          Acesso Master
        </Link>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cadastro de Membros e Obreiros
          </h1>
          <p className="text-gray-600">
            Igreja Assembléa de Deus Ministério Tancredo Neves
          </p>
        </div>
        <FormularioBatismo />
      </div>
    </main>
  );
}