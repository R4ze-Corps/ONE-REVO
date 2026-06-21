import client from "@/lib/mongodb";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useMemo, useState } from "react";

type ConnectionStatus = {
  isConnected: boolean;
};

type Theme = "light" | "dark";

const navigation = ["Hub inicial", "Central", "Painel", "Configurar"];

const quickActions = [
  "Acoes",
  "Farm",
  "Hierarquia",
  "Punicoes",
  "Ausencia",
  "Promocoes",
];

const centralTabs = [
  "Registrar",
  "Hierarquia",
  "Acoes",
  "Punicoes",
  "Farm",
  "Ausencia",
  "Promocoes",
];

const pendingRegistrations = [
  { name: "Lucas Martins", id: "102", phone: "555-0142", recruiter: "Nina", indicatedBy: "Rafa" },
  { name: "Bruno Alves", id: "117", phone: "555-0188", recruiter: "Caio", indicatedBy: "Sem indicacao" },
  { name: "Ana Costa", id: "133", phone: "555-0111", recruiter: "Maya", indicatedBy: "Theo" },
];

const approvedRegistrations = [
  { name: "Rafael Nunes", id: "088", role: "Membro", nickname: "088 | Rafael" },
  { name: "Marina Lopes", id: "094", role: "Operacional", nickname: "094 | Marina" },
  { name: "Diego Rocha", id: "101", role: "Membro", nickname: "101 | Diego" },
];

const hierarchyGroups = [
  {
    group: "Comando superior",
    members: ["Diretor Geral", "Subdiretor", "Comandante", "Subcomandante"],
  },
  {
    group: "Equipe operacional",
    members: ["Gerente de Farm", "Instrutor", "Recrutador", "Membro"],
  },
];

const actions = [
  {
    name: "Operacao Norte",
    category: "Acao principal",
    status: "Aberta",
    min: 8,
    max: 14,
    date: "Hoje",
    time: "21:30",
    weapon: "Fuzil",
    participants: 9,
    reserve: 2,
  },
  {
    name: "Patrulha Comercial",
    category: "Rotina",
    status: "Em preparo",
    min: 4,
    max: 8,
    date: "Amanha",
    time: "19:00",
    weapon: "Pistola",
    participants: 3,
    reserve: 1,
  },
];

const botInstances = [
  { name: "Discord Bot", cpu: "18%", ram: "412 MB", uptime: "12h 44m", active: true },
  { name: "Farm Worker", cpu: "09%", ram: "260 MB", uptime: "8h 12m", active: true },
  { name: "ONE Bridge", cpu: "00%", ram: "0 MB", uptime: "offline", active: false },
];

const farmProducts = [
  { product: "Metal", delivered: 1240, target: 1800 },
  { product: "Municao", delivered: 840, target: 1000 },
  { product: "Fibra", delivered: 430, target: 900 },
];

const configurationItems = [
  "Token ONE",
  "Token do Discord",
  "ID do servidor Discord",
  "Cargo de entrada",
  "Cargo de membro",
  "Cargo mencionar todos",
  "Canal de punicoes",
  "Cargos de farm",
];

export const getServerSideProps: GetServerSideProps<ConnectionStatus> = async () => {
  try {
    await client.connect();

    return {
      props: { isConnected: true },
    };
  } catch (error) {
    console.error(error);

    return {
      props: { isConnected: false },
    };
  }
};

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [theme, setTheme] = useState<Theme>("light");
  const [activeSection, setActiveSection] = useState("Hub inicial");
  const [activeTab, setActiveTab] = useState("Registrar");
  const [developerMode, setDeveloperMode] = useState(false);
  const [discordSession, setDiscordSession] = useState(false);

  const isDark = theme === "dark";

  const shellClass = isDark
    ? "min-h-screen bg-slate-950 text-slate-100"
    : "min-h-screen bg-[#eef2f6] text-slate-950";

  const panelClass = isDark
    ? "border-slate-800 bg-slate-900 text-slate-100"
    : "border-slate-200 bg-white text-slate-950";

  const mutedText = isDark ? "text-slate-400" : "text-slate-500";
  const softPanel = isDark ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50";

  const accessStatus = useMemo(
    () => [
      {
        label: "Sessao Discord",
        value: discordSession ? "Autenticada" : "Aguardando login",
        ok: discordSession,
      },
      {
        label: "Registro",
        value: discordSession ? "Perfil liberado" : "Tela bloqueada",
        ok: discordSession,
      },
      {
        label: "Modo dev",
        value: developerMode ? "Ativo" : "Protegido por senha",
        ok: developerMode,
      },
      {
        label: "MongoDB",
        value: isConnected ? "Online" : "Desconectado",
        ok: isConnected,
      },
    ],
    [developerMode, discordSession, isConnected]
  );

  return (
    <main className={shellClass}>
      <div className="flex min-h-screen">
        <aside className={`hidden w-72 border-r px-5 py-5 lg:block ${panelClass}`}>
          <div className="mb-7 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              ONE
            </div>
            <div>
              <p className="text-sm font-semibold">Central ONE</p>
              <p className={`text-xs ${mutedText}`}>Discord + MongoDB</p>
            </div>
          </div>

          <nav className="space-y-1 text-sm">
            {navigation.map((item) => (
              <button
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left font-medium transition ${
                  activeSection === item
                    ? "bg-indigo-600 text-white"
                    : isDark
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
                key={item}
                onClick={() => setActiveSection(item)}
              >
                <span>{item}</span>
                {activeSection === item ? <span className="text-xs text-indigo-100">Ativo</span> : null}
              </button>
            ))}
          </nav>

          <div className={`mt-8 rounded-lg border p-4 ${softPanel}`}>
            <p className={`text-xs font-semibold uppercase ${mutedText}`}>Acesso</p>
            <button
              className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              onClick={() => setDiscordSession((value) => !value)}
            >
              {discordSession ? "Logout Discord" : "Login com Discord"}
            </button>
            <button
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                isDark
                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-white"
              }`}
              onClick={() => setDeveloperMode((value) => !value)}
            >
              {developerMode ? "Desativar modo dev" : "Modo dev por senha"}
            </button>
            <button
              className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                isDark
                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-white"
              }`}
            >
              Importar perfil JSON
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <header className={`mb-5 rounded-lg border p-4 ${panelClass}`}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className={`text-sm font-medium ${mutedText}`}>{activeSection}</p>
                <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                  Hub de operacao Discord
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                    isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  Tema {isDark ? "claro" : "escuro"}
                </button>
                <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                  Abrir ficha de entrada
                </button>
              </div>
            </div>

            {!discordSession ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Tela bloqueada para membros sem registro. Faca login com Discord para liberar a Central.
              </div>
            ) : null}
          </header>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {accessStatus.map((item) => (
              <article className={`rounded-lg border p-4 ${panelClass}`} key={item.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-sm font-medium ${mutedText}`}>{item.label}</p>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.ok ? "bg-emerald-500" : "bg-amber-500"}`}
                  />
                </div>
                <p className="mt-3 text-lg font-semibold">{item.value}</p>
              </article>
            ))}
          </div>

          <section className={`mt-5 rounded-lg border p-4 ${panelClass}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Atalhos rapidos</h2>
                <p className={`mt-1 text-sm ${mutedText}`}>
                  Acesso direto aos modulos usados na rotina.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
                {quickActions.map((item) => (
                  <button
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      isDark
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                    key={item}
                    onClick={() => {
                      setActiveSection("Central");
                      setActiveTab(item);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <section className={`rounded-lg border p-5 ${panelClass}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Central</h2>
                  <p className={`mt-1 text-sm ${mutedText}`}>
                    Perfil, registro, hierarquia, acoes, farm, ausencia e promocoes.
                  </p>
                </div>
                <button className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                  Sair da conta
                </button>
              </div>

              <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {centralTabs.map((tab) => (
                  <button
                    className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "bg-indigo-600 text-white"
                        : isDark
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-700"
                    }`}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className={`mt-4 rounded-lg border p-4 ${softPanel}`}>
                {activeTab === "Registrar" ? (
                  <div>
                    <h3 className="font-semibold">Registro de membros</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {["Nome", "ID no servidor", "Telefone", "Recrutador", "Indicado"].map((field) => (
                        <label className="text-sm font-medium" key={field}>
                          {field}
                          <input
                            className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                              isDark
                                ? "border-slate-700 bg-slate-900"
                                : "border-slate-200 bg-white"
                            }`}
                            placeholder={field}
                          />
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                        Enviar registro
                      </button>
                      <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        Verificar cargo Discord
                      </button>
                    </div>
                  </div>
                ) : activeTab === "Hierarquia" ? (
                  <div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-semibold">Estrutura de contingente</h3>
                      <input
                        className={`rounded-lg border px-3 py-2 text-sm outline-none ${
                          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
                        }`}
                        placeholder="Buscar membro por nome"
                      />
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {hierarchyGroups.map((group) => (
                        <div className={`rounded-lg border p-4 ${panelClass}`} key={group.group}>
                          <p className="font-semibold">{group.group}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {group.members.map((member) => (
                              <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700" key={member}>
                                {member}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeTab === "Acoes" ? (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold">Acoes</h3>
                      <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                        Criar nova acao
                      </button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {actions.map((action) => (
                        <div className={`rounded-lg border p-4 ${panelClass}`} key={action.name}>
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="font-semibold">{action.name}</p>
                              <p className={`mt-1 text-sm ${mutedText}`}>
                                {action.category} | {action.date} as {action.time} | {action.weapon}
                              </p>
                            </div>
                            <p className="text-sm font-semibold">
                              {action.participants}/{action.max} participantes
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                              Participar
                            </button>
                            <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                              Entrar reserva
                            </button>
                            <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                              Expandir detalhes
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeTab === "Punicoes" ? (
                  <div>
                    <h3 className="font-semibold">Punicoes</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {["Selecionar membro", "Tipo de punicao", "Motivo"].map((field) => (
                        <input
                          className={`rounded-lg border px-3 py-2 text-sm outline-none ${
                            isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
                          }`}
                          key={field}
                          placeholder={field}
                        />
                      ))}
                    </div>
                    <button className="mt-4 rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">
                      Confirmar e enviar log Discord
                    </button>
                  </div>
                ) : activeTab === "Farm" ? (
                  <div>
                    <h3 className="font-semibold">Farm</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {farmProducts.map((item) => (
                        <div className={`rounded-lg border p-4 ${panelClass}`} key={item.product}>
                          <p className="font-semibold">{item.product}</p>
                          <p className={`mt-1 text-sm ${mutedText}`}>
                            {item.delivered}/{item.target} entregues
                          </p>
                          <div className="mt-3 h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${Math.min((item.delivered / item.target) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                        Registrar meu farm
                      </button>
                      <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        Registrar para membro
                      </button>
                      <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                        Configurar meta global
                      </button>
                    </div>
                  </div>
                ) : activeTab === "Promocoes" ? (
                  <div>
                    <h3 className="font-semibold">Promocoes</h3>
                    <textarea
                      className={`mt-4 min-h-28 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
                      }`}
                      defaultValue={"@membro foi promovido para @cargo por desempenho operacional."}
                    />
                    <button className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                      Confirmar movimentacao
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold">Ausencia</h3>
                    <p className={`mt-2 text-sm ${mutedText}`}>
                      Modulo visual reservado para futuras rotinas de ausencia.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className={`rounded-lg border p-5 ${panelClass}`}>
              <h2 className="text-lg font-semibold">Registros</h2>
              <p className={`mt-1 text-sm ${mutedText}`}>
                Aprovar aplica cargos, remove cargo de registro e tenta alterar apelido.
              </p>

              <div className="mt-4 space-y-3">
                {pendingRegistrations.map((member) => (
                  <div className={`rounded-lg border p-4 ${softPanel}`} key={member.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{member.id} | {member.name}</p>
                        <p className={`mt-1 text-sm ${mutedText}`}>
                          Tel: {member.phone} | Recrutador: {member.recruiter}
                        </p>
                      </div>
                      <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        Pendente
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                        Aprovar
                      </button>
                      <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">
                        Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="mt-6 font-semibold">Aprovados</h3>
              <div className="mt-3 space-y-2">
                {approvedRegistrations.map((member) => (
                  <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${softPanel}`} key={member.id}>
                    <div>
                      <p className="text-sm font-semibold">{member.nickname}</p>
                      <p className={`text-xs ${mutedText}`}>{member.role}</p>
                    </div>
                    {developerMode ? (
                      <button className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
                        Excluir
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <section className={`rounded-lg border p-5 ${panelClass}`}>
              <h2 className="text-lg font-semibold">Painel / Dashboard</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className={`rounded-lg border p-4 ${softPanel}`}>
                  <p className={`text-sm ${mutedText}`}>Acao atual</p>
                  <p className="mt-2 text-xl font-semibold">Operacao Norte</p>
                  <p className={`mt-1 text-sm ${mutedText}`}>9 participantes, 2 reservas</p>
                </div>
                <div className={`rounded-lg border p-4 ${softPanel}`}>
                  <p className={`text-sm ${mutedText}`}>Registro atual</p>
                  <p className="mt-2 text-xl font-semibold">{pendingRegistrations.length} pendentes</p>
                  <p className={`mt-1 text-sm ${mutedText}`}>{approvedRegistrations.length} aprovados</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {botInstances.map((bot) => (
                  <div className={`rounded-lg border p-4 ${softPanel}`} key={bot.name}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{bot.name}</p>
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${bot.active ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                        {bot.active ? "Ligado" : "Desligado"}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${mutedText}`}>
                      CPU {bot.cpu} | RAM {bot.ram} | Uptime {bot.uptime}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className={`rounded-lg border p-5 ${panelClass}`}>
              <h2 className="text-lg font-semibold">Configuracoes e integracoes</h2>
              <p className={`mt-1 text-sm ${mutedText}`}>
                Tokens mascarados, servidor Discord, cargos, canais, membros e testes de conexao.
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {configurationItems.map((item) => (
                  <label className="text-sm font-medium" key={item}>
                    {item}
                    <input
                      className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                        isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
                      }`}
                      placeholder={item.includes("Token") ? "************" : item}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
                  Testar configuracao
                </button>
                <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  Buscar cargos
                </button>
                <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  Buscar canais
                </button>
                <button className={`rounded-lg border px-3 py-2 text-sm font-semibold ${isDark ? "border-slate-700" : "border-slate-200"}`}>
                  Buscar membros
                </button>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
