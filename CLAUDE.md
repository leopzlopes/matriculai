# MatriculAI — Due Diligence Imobiliário com IA

## Visão do produto
SaaS B2B jurídico que analisa matrículas de imóveis em 3 perspectivas simultâneas:
- Módulo 1: Análise Registral (perspectiva de oficial de RI)
- Módulo 2: Penhorabilidade CPC/CLT (perspectiva de advogado de execução)
- Módulo 3: Avaliação de mercado com web search em tempo real

## Stack
- Next.js 14 (App Router) + TypeScript strict mode
- Supabase (auth + PostgreSQL) — instância já configurada em .env.local
- Tailwind CSS + shadcn/ui
- Anthropic API (claude-sonnet-4-6) — motor dos 3 módulos
- Exportação em PDF e DOCX

## Estrutura de planos
- Freemium: 3 análises completas gratuitas
- Standard: R$497/mês, 30 análises, todos os módulos

## Comandos
- npm run dev    → servidor local
- npm run build  → build de produção
- npm run lint   → linting TypeScript

## Convenções de código
- TypeScript strict mode sempre ativo
- Componentes: PascalCase, functional, nunca default export
- API routes: /app/api/[recurso]/route.ts
- Server Actions para operações com Supabase no servidor
- SERVICE_ROLE_KEY apenas em Server Actions ou API routes, nunca no client

## Regras críticas
- Nunca commitar .env.local ou qualquer chave de API
- Nunca logar PII (dados de usuários, conteúdo de matrículas)
- Todo output de análise deve incluir aviso: "Minuta gerada por IA — revisar antes de uso oficial"
- Testes obrigatórios para funções de análise de matrícula
- Trigger do Supabase: o trigger que cria perfil na tabela profiles após cadastro em auth.users é crítico. Qualquer migration que altere a tabela profiles deve verificar compatibilidade com esse trigger.

## Variáveis de ambiente
- NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY já configuradas
- SUPABASE_SERVICE_ROLE_KEY: usar apenas server-side
- ANTHROPIC_API_KEY: adicionar antes de implementar os módulos
