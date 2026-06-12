import FormularioBatismo from "@/components/formulario-batismo";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-indigo-50 py-12 px-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <Link 
          href="/admin/login" 
          className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:shadow-md border border-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Acesso Master
        </Link>
      </div>
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12 mt-4">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-100 rounded-2xl mb-6 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 drop-shadow-sm">
            Cadastro de Membros <br className="hidden md:block"/>e Obreiros
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-medium">
            Igreja Assembleia de Deus <br className="md:hidden" /><span className="text-indigo-600 font-semibold">Ministério Tancredo Neves</span>
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-[2.5rem] blur-lg opacity-20"></div>
          <div className="relative">
            <FormularioBatismo />
          </div>
        </div>
      </div>
    </main>
  );
}