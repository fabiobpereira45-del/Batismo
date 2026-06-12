import FormularioBatismo from "@/components/formulario-batismo";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
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