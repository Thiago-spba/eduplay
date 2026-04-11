<div align="center">

<img src="public/icons/icon-192.png" alt="EduPlay Logo" width="120" />

# EduPlay — Instituto do Saber

**Plataforma educacional gamificada para o Ensino Fundamental**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Blaze-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps)
[![ECA](https://img.shields.io/badge/ECA_Digital-Lei_14.155%2F2021-green?style=flat-square)](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14155.htm)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

🌐 **[eduplay.olloapp.com.br](https://eduplay.olloapp.com.br)**

</div>

---

## 📖 Sobre o Projeto

O **EduPlay** nasceu de uma necessidade real: tornar o aprendizado do Ensino Fundamental mais engajante e eficiente para crianças de 11 a 13 anos, respeitando o currículo da Secretaria Municipal de Educação de São Paulo.

A plataforma transforma o estudo em uma experiência de investigação — a criança é um **Agente Pesquisador** do **Instituto do Saber**, que resolve mistérios e desbloqueia conhecimento através de missões, podcasts e jogos interativos.

---

## ✨ Funcionalidades

- 🏛️ **5 Departamentos** — História, Geografia, Matemática, Ciências e Português
- 🎯 **Sistema de Missões** — baseado no currículo paulista do 6º ao 9º ano
- 🤖 **IA Gerando Conteúdo** — Claude API via Firebase Cloud Functions
- 🎙️ **Podcast com Legenda Sincronizada** — narração palavra por palavra
- ❓ **Quiz Interativo** — perguntas com feedback pedagógico imediato
- 🔐 **Forca** — decodificar mensagens secretas
- 🧩 **Sistema de Fragmentos** — moeda de conhecimento exclusiva
- 🏆 **Recompensa Surpresa** — pais configuram meta e recompensa secreta
- ⏱️ **Timer de Estudo** — controle de tempo com bloqueio parental
- 🔒 **Painel dos Responsáveis** — senha master, timer e metas
- 🌙 **Dark Mode / Light Mode** — tema claro e escuro em todas as telas
- 📱 **PWA** — instalável no celular como app nativo
- ♿ **Responsivo** — celular, tablet e desktop

---

## 🧠 Psicologia Educacional Aplicada

O EduPlay foi desenvolvido com base em princípios da psicologia do desenvolvimento para a faixa etária de 11-13 anos:

- **Teoria de Erikson** — identidade em construção: a criança é o protagonista
- **Efeito Zeigarnik** — tarefas incompletas geram motivação para continuar
- **Zona de Desenvolvimento Proximal (Vygotsky)** — desafiador mas alcançável
- **Reforço Positivo Contingente** — recompensas reais configuradas pelos pais
- **Curiosidade Epistêmica** — cada missão termina com um gancho narrativo
- **Autonomia Controlada** — a criança escolhe qual missão investigar
- **Feedback Imediato** — cada acerto avança a narrativa

---

## 🛡️ Conformidade ECA Digital (Lei 14.155/2021)

O EduPlay foi desenvolvido em conformidade com o **Estatuto da Criança e do Adolescente Digital** e a **LGPD** para plataformas que atendem menores de idade.

### Medidas Implementadas

| Requisito Legal | Implementação |
|---|---|
| Consentimento parental | Responsável aceita termos antes de criar perfil da criança |
| Coleta mínima de dados | Apenas nome (primeiro nome), avatar e série escolar |
| Sem dados sensíveis | Nenhum dado biométrico, localização ou financeiro coletado |
| Log de consentimento | Registro imutável com hash do email e IP (SHA-256) |
| Direito ao esquecimento | Pai pode excluir todos os dados da criança |
| Transparência | Política de privacidade clara e acessível |
| Senha hasheada | Senha master dos pais nunca armazenada em texto puro |
| Isolamento de dados | Coleções `eduplay_*` separadas do marketplace OLLO |

### Fluxo de Consentimento

```
1. Responsável cria conta com email + senha
2. Aceita Termos de Uso + Política de Privacidade
3. Aceita especificamente os termos ECA Digital
4. Log de consentimento registrado com timestamp, emailHash e ipHash
5. Responsável configura perfil do filho (dados mínimos)
6. Filho utiliza a plataforma sob supervisão parental
```

### Dados Coletados da Criança

| Dado | Finalidade | Base Legal |
|---|---|---|
| Primeiro nome | Personalização da experiência | Consentimento parental |
| Avatar (emoji) | Identidade visual | Consentimento parental |
| Série escolar | Adequar conteúdo pedagógico | Consentimento parental |
| Progresso e acertos | Relatório para os pais | Consentimento parental |

> **Não coletamos:** sobrenome, data de nascimento, escola, localização, foto, dados de contato da criança.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | Interface e componentes |
| Vite | 5 | Build tool e dev server |
| React Router | 6 | Navegação SPA |
| Firebase Hosting | — | Deploy e CDN |
| Firestore | — | Banco de dados |
| Firebase Auth | — | Autenticação dos responsáveis |
| Firebase Functions | 2nd Gen | IA gerando conteúdo (servidor) |
| Firebase Secret Manager | — | API keys seguras |
| Claude API (Haiku) | — | Geração de conteúdo pedagógico |
| vite-plugin-pwa | 1.2 | Service Worker e manifest |
| Web Speech API | — | Narração com legenda |
| Workbox | — | Cache offline |

---

## 🚀 Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/Thiago-spba/eduplay.git
cd eduplay

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Preencha o .env com suas chaves Firebase

# Rode em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build (com PWA)
npm run preview
```

### Variáveis de Ambiente

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_PARENT_PASSWORD=
```

> A `ANTHROPIC_API_KEY` é configurada no Firebase Secret Manager — nunca no `.env` do frontend.

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── AudioLesson.jsx    # Podcast com legenda sincronizada
│   ├── BottomNav.jsx      # Navegação inferior responsiva
│   ├── Header.jsx         # Header reutilizável
│   └── LockScreen.jsx     # Tela de bloqueio parental
├── context/
│   └── ThemeContext.jsx   # Dark/Light mode global
├── hooks/
│   ├── useParentLock.js   # Senha e bloqueio parental
│   ├── usePlayer.js       # Nome e avatar do jogador
│   ├── useProgress.js     # Fragmentos e progresso
│   └── useTimer.js        # Timer de estudo
├── pages/
│   ├── HomePage.jsx       # Tela principal — Instituto
│   ├── RegisterPage.jsx   # Registro nome e avatar
│   └── SubjectPage.jsx    # Página de disciplina + jogos
├── services/
│   └── firebase.js        # Configuração Firebase
└── utils/
    └── content.js         # Conteúdo pedagógico estático

functions/
└── index.js               # Cloud Function — geração de conteúdo com IA
```

---

## 📚 Conteúdo Pedagógico

Baseado no **Currículo Municipal de São Paulo** e **Currículo Paulista / BNCC** para o Ensino Fundamental II (6º ao 9º ano), organizado por bimestre:

| Disciplina | 6º ano | 7º ano | 8º ano | 9º ano |
|---|---|---|---|---|
| **História** | Pré-História → Roma Antiga | Idade Média → Colonização | Iluminismo → República Velha | 1ª Guerra → Brasil atual |
| **Geografia** | Localização → População BR | América → África | Ásia → Geopolítica | Urbanização → Brasil global |
| **Matemática** | Números → Geometria | Álgebra → Volume | Equações → Pitágoras | Funções → Probabilidade |
| **Ciências** | Universo → Ecossistemas | Evolução → Animais | Reprodução → Eletricidade | Química → Radioatividade |
| **Português** | Interpretação → Verbos | Argumentação → Ortografia | Variedades → Literatura | Redação → Revisão geral |

---

## 🗺️ Roadmap

- [x] MVP — missões, quiz, forca, podcast
- [x] PWA instalável
- [x] Deploy em produção
- [x] Dark/Light mode completo
- [x] Cloud Function com IA (Claude API)
- [x] Conformidade ECA Digital
- [x] Firestore rules seguras
- [ ] Autenticação dos responsáveis
- [ ] Painel dos Responsáveis completo
- [ ] Perfil do Agente — Dossiê
- [ ] Sistema de assinatura (freemium)
- [ ] App nativo (React Native) — bloqueio real do celular

---

## 👨‍💻 Autor

**Thiago Fernando**
Engenharia de Computação — Centro Universitário Celso Lisboa

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Thiago_Fernando-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-Thiago--spba-181717?style=flat-square&logo=github)](https://github.com/Thiago-spba)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
Feito com ❤️ para transformar o aprendizado em aventura
<br/>
<sub>Em conformidade com ECA Digital (Lei 14.155/2021) e LGPD</sub>
</div>