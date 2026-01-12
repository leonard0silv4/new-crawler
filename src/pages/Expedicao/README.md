# Sistema de Expedição

## Visão Geral

Sistema completo de expedição com monitoramento em tempo real, leitura de código de barras e controle de produtividade por mesa.

## Páginas

### 1. Expedição (`/expedicao`)

Tela focada na leitura de códigos de barras dos pacotes.

**Características:**
- ✅ **Auto-focus permanente** no input de código de barras
- ✅ **Validação de duplicidade** em tempo real
- ✅ **Modal de seleção de mesa** (M1, M2, M3, M4)
- ✅ **Alerta visual crítico** para códigos duplicados (vermelho)
- ✅ **Feedback visual** de sucesso ao registrar
- ✅ **Estatísticas rápidas** (total processados, último pacote)

**Fluxo de Uso:**
1. Funcionário bipa ou digita código de barras
2. Sistema verifica duplicidade no banco
3. Se **duplicado**: Exibe alerta vermelho com data/hora do registro anterior
4. Se **novo**: Abre modal para selecionar mesa
5. Funcionário bipa código da mesa (M1, M2, M3, M4)
6. Sistema registra e exibe feedback de sucesso
7. Input é limpo e fica pronto para o próximo código

**Componentes:**
- Card principal com input de código de barras
- Modal de seleção de mesa com auto-focus
- Alert Dialog de duplicado (vermelho, crítico)
- Animação de sucesso ao registrar
- Estatísticas em cards (total processados, último pacote)

---

### 2. Dashboard Expedição (`/dashboard-expedicao`)

Dashboard de monitoramento em tempo real da produtividade de expedição.

**Características:**
- 📊 **Monitoramento em tempo real** via WebSocket
- 📈 **Métricas de produtividade** por mesa e total
- ⏱️ **Ritmo atual** baseado nos últimos 60 minutos
- 📅 **Produção detalhada por hora** do dia
- 🎯 **Meta do dia** configurável
- 🚚 **Horários de coleta** dos transportadores
- ⚙️ **Modal de configuração** de metas

**Seções do Dashboard:**

#### Status Geral
- Meta do dia (total de pacotes)
- Total de pacotes feitos
- Total restante
- Barra de progresso visual
- Horários de coleta por transportadora

#### Produção Detalhada
Tabela com:
- Total do dia por mesa
- Ritmo atual (pacotes/hora) por mesa
- Produção hora a hora (07:00 às 17:00)
- Totais gerais por hora

**Atualização em Tempo Real:**
- Conecta via Socket.IO ao backend
- Escuta evento `expedicao:update`
- Atualiza contadores automaticamente
- Sem necessidade de refresh manual

---

## Componentes UI Utilizados

### Shadcn UI Components
- `Card`: Container principal das seções
- `Button`: Ações e navegação
- `Input`: Campos de entrada (código de barras, mesa)
- `Dialog`: Modal de seleção de mesa
- `AlertDialog`: Alerta de código duplicado
- `Badge`: Tags e status visuais
- `Label`: Labels dos inputs
- `Separator`: Divisores de seção

### Lucide React Icons
- `Package`: Ícone de pacote
- `Scan`: Ícone de scanner
- `CheckCircle2`: Sucesso/confirmação
- `AlertTriangle`: Alerta de erro
- `Activity`: Atividade/logs
- `BarChart3`: Gráficos/estatísticas
- `Loader2`: Loading/processamento
- `Target`: Meta/objetivo
- `Timer`: Tempo/cronômetro
- `Truck`: Transporte/coleta
- `Clock`: Relógio/horário
- `TrendingUp`: Crescimento/produtividade
- `Edit`: Editar/configurar

---

## Integração com Backend

### Endpoints Necessários

```typescript
// 1. Verificar código de barras
GET /expedicao/verificar/:orderId
// Retorna se existe e dados do registro anterior

// 2. Registrar novo pacote
POST /expedicao/registrar
// Body: { orderId: string, mesaId: string }

// 3. Obter meta do dia
GET /expedicao/meta
// Retorna meta configurada para hoje

// 4. Configurar meta do dia
POST /expedicao/meta
// Body: { total: number, porSeller: object }

// 5. Obter produtividade (dashboard)
GET /expedicao/produtividade
// Retorna estatísticas completas do dia
```

### WebSocket Events

```typescript
// Evento emitido pelo backend ao registrar novo pacote
socket.on("expedicao:update", (data) => {
  // data.tipo: "novo_pacote"
  // data.mesa: "M1" | "M2" | "M3" | "M4"
  // data.orderId: string
  // data.timestamp: Date
});
```

---

## Estados e Hooks

### Expedição (`index.tsx`)

```typescript
const [codigoBarras, setCodigoBarras] = useState("");
const [mesaSelecionada, setMesaSelecionada] = useState("");
const [isModalMesaOpen, setIsModalMesaOpen] = useState(false);
const [isDuplicadoAlertOpen, setIsDuplicadoAlertOpen] = useState(false);
const [registroAnterior, setRegistroAnterior] = useState<RegistroAnterior | null>(null);
const [isProcessing, setIsProcessing] = useState(false);
const [totalProcessados, setTotalProcessados] = useState(0);
const [ultimoPacote, setUltimoPacote] = useState<UltimoPacote | null>(null);
const [showSuccess, setShowSuccess] = useState(false);

const inputCodigoRef = useRef<HTMLInputElement>(null);
const inputMesaRef = useRef<HTMLInputElement>(null);
```

### Dashboard (`DashboardExpedicao.tsx`)

```typescript
const [metaDoDia, setMetaDoDia] = useState<MetaDoDia>({ total: 0, porSeller: {} });
const [totalFeitos, setTotalFeitos] = useState(0);
const [produtividade, setProdutividade] = useState<{ [mesa: string]: ProdutividadeMesa }>({
  M1: { totalDia: 0, ritmoAtual: 0, porHora: {} },
  M2: { totalDia: 0, ritmoAtual: 0, porHora: {} },
  M3: { totalDia: 0, ritmoAtual: 0, porHora: {} },
  M4: { totalDia: 0, ritmoAtual: 0, porHora: {} },
});
const [horariosColeta, setHorariosColeta] = useState<HorarioColeta[]>([...]);
const [horaAtual, setHoraAtual] = useState(format(new Date(), "HH:mm:ss"));
const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
```

---

## Funcionalidades Especiais

### 1. Auto-focus Inteligente

**Problema:** Leitor de código de barras precisa do campo sempre focado.

**Solução:**
```typescript
// Focus inicial ao carregar
useEffect(() => {
  inputCodigoRef.current?.focus();
}, []);

// Re-focus após fechar modais
useEffect(() => {
  if (!isModalMesaOpen && !isDuplicadoAlertOpen) {
    setTimeout(() => {
      inputCodigoRef.current?.focus();
    }, 100);
  }
}, [isModalMesaOpen, isDuplicadoAlertOpen]);
```

### 2. Validação de Duplicidade

**Problema:** Evitar registrar o mesmo pacote duas vezes.

**Solução:**
```typescript
const verificarCodigoBarras = async (e: React.FormEvent) => {
  const response = await instance.get(`/expedicao/verificar/${codigoBarras}`);
  
  if (response.existe) {
    // Exibir alerta vermelho com dados do registro anterior
    setRegistroAnterior(response.registro);
    setIsDuplicadoAlertOpen(true);
  } else {
    // Abrir modal para selecionar mesa
    setIsModalMesaOpen(true);
  }
};
```

### 3. Modal de Seleção de Mesa

**Características:**
- Auto-focus no input ao abrir
- Validação: apenas M1, M2, M3, M4
- Botões visuais para seleção rápida
- Suporte a leitura de código de barras das mesas

```typescript
const selecionarMesa = async (e: React.FormEvent) => {
  const mesaValida = ["M1", "M2", "M3", "M4"].includes(
    mesaSelecionada.toUpperCase()
  );

  if (!mesaValida) {
    toast.error("Mesa inválida! Use M1, M2, M3 ou M4");
    return;
  }

  await instance.post("/expedicao/registrar", {
    orderId: codigoBarras,
    mesaId: mesaSelecionada.toUpperCase(),
  });

  // Feedback de sucesso e reset
  setShowSuccess(true);
  setTimeout(() => setShowSuccess(false), 2000);
  setTotalProcessados((prev) => prev + 1);
  setCodigoBarras("");
  setMesaSelecionada("");
  setIsModalMesaOpen(false);
};
```

### 4. Atualização em Tempo Real (Dashboard)

**Problema:** Dashboard precisa refletir mudanças instantaneamente.

**Solução:**
```typescript
useEffect(() => {
  // Setup WebSocket
  const socket = io(import.meta.env.VITE_APP_BASE_URL, {
    auth: { token: localStorage.getItem("userToken") }
  });

  socket.on("expedicao:update", (data: any) => {
    if (data.tipo === "novo_pacote") {
      atualizarProdutividade(data.mesa);
    }
  });

  return () => {
    socket.disconnect();
  };
}, []);
```

### 5. Animação de Sucesso

**Efeito visual:** Ícone verde grande ao registrar pacote.

```typescript
<AnimatePresence>
  {showSuccess && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
    >
      <div className="bg-green-500 text-white rounded-full p-8 shadow-2xl">
        <CheckCircle2 className="h-24 w-24" />
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## Navegação

### Rotas Registradas

```typescript
// src/App.tsx
<Route element={<Expedicao />} path="/expedicao" />
<Route element={<DashboardExpedicao />} path="/dashboard-expedicao" />
```

### Links no Header

```typescript
// src/components/Header/index.tsx
{
  title: "Expedição",
  href: "/expedicao",
  condition: !production && (isOwner || can("view_production")),
},
{
  title: "Dashboard Expedição",
  href: "/dashboard-expedicao",
  condition: !production && (isOwner || can("view_production")),
}
```

### Atalhos na Página Inicial

```typescript
// src/pages/Welcome/index.tsx
{
  title: "Expedição",
  icon: <Scan />,
  path: "/expedicao",
  show: !production && (isOwner || canAny("view_production")),
},
{
  title: "Dashboard Expedição",
  icon: <Truck />,
  path: "/dashboard-expedicao",
  show: !production && (isOwner || canAny("view_production")),
}
```

---

## Permissões

### Frontend

```typescript
// Acesso às páginas de expedição
condition: !production && (isOwner || can("view_production"))
```

### Backend (Sugerido)

Criar as seguintes permissões:
- `view_expedicao`: Acesso à tela de leitura
- `view_dashboard_expedicao`: Acesso ao dashboard
- `manage_expedicao_meta`: Configurar metas

---

## Testes Recomendados

### Testes Manuais

1. **Leitura de código novo:**
   - Bipar código de barras
   - Verificar abertura do modal de mesa
   - Selecionar mesa
   - Verificar feedback de sucesso
   - Verificar auto-focus retornando ao input principal

2. **Leitura de código duplicado:**
   - Bipar código já registrado
   - Verificar alerta vermelho
   - Verificar dados do registro anterior (data/hora)
   - Fechar alerta
   - Verificar auto-focus retornando

3. **Dashboard em tempo real:**
   - Abrir dashboard em uma aba
   - Registrar pacote na tela de expedição em outra aba
   - Verificar atualização automática no dashboard
   - Verificar incremento nos contadores

4. **Configuração de meta:**
   - Clicar em "Configurar" no dashboard
   - Alterar meta do dia
   - Salvar
   - Verificar atualização na tela

5. **Validação de mesa:**
   - Tentar digitar "M5" no modal de mesa
   - Verificar erro "Mesa inválida"
   - Digitar "M1"
   - Verificar sucesso

### Testes de Performance

1. Registrar 100 pacotes consecutivos
2. Verificar tempo de resposta
3. Verificar se auto-focus funciona sempre
4. Verificar se dashboard atualiza corretamente

---

## Estilo Visual

### Paleta de Cores

```css
/* Status */
--success: green (códigos novos)
--error: red (códigos duplicados)
--warning: orange/yellow (pendências)
--info: blue (informações)

/* Background */
--bg-gradient: from-slate-50 to-slate-100
--header-dark: from-zinc-800 to-zinc-900

/* Cards */
--card-blue: border-blue-200 bg-blue-50/50
--card-purple: border-purple-200 bg-purple-50/50
--card-green: border-green-200 bg-green-50/50
--card-red: border-red-500 (alerta duplicado)
```

### Tipografia

```css
/* Títulos */
text-2xl font-bold (títulos principais)
text-xl font-semibold (subtítulos)

/* Inputs */
text-xl font-mono text-center (código de barras)
h-16 (altura dos inputs principais)

/* Tabelas */
font-semibold (cabeçalhos)
text-center (valores numéricos)
```

---

## Melhorias Futuras

### Funcionalidades
- [ ] Histórico de registros do dia
- [ ] Exportar relatório em PDF/Excel
- [ ] Gráficos de produtividade (Chart.js)
- [ ] Ranking de mesas (gamificação)
- [ ] Notificações sonoras ao registrar
- [ ] Modo offline (PWA + IndexedDB)
- [ ] Filtros avançados no dashboard
- [ ] Metas por seller individual
- [ ] Comparação com dias anteriores
- [ ] Previsão de término da meta

### UX/UI
- [ ] Tema escuro/claro
- [ ] Atalhos de teclado
- [ ] Tutorial interativo (tour guiado)
- [ ] Feedback háptico (mobile)
- [ ] Animações mais suaves
- [ ] Responsividade para tablets
- [ ] Impressão de etiquetas

### Técnico
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] Otimização de re-renders
- [ ] Cache de dados (React Query)
- [ ] Retry automático em falhas de rede
- [ ] Logs de auditoria
- [ ] Monitoramento de erros (Sentry)

---

## Suporte

Para dúvidas ou problemas:
1. Consulte este README
2. Verifique o arquivo `EXPEDICAO_BACKEND_ROTAS.md`
3. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ usando React + TypeScript + Shadcn UI**





