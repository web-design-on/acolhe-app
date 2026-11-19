# Acolhe — App mobile

**Acolhe** aproxima a pessoa idosa ou dependente da sua rede de apoio: um toque para pedir ajuda e uma rotina de
cuidados compartilhada entre família, cuidadores e profissionais de saúde.

Este repositório é o **app mobile** (pessoa cuidada e familiares/cuidadores).
O portal web e a API ficam em [acolhe-web](https://github.com/web-design-on/acolhe-web).

| | |
| --- | --- |
| **Portal web (deploy)** | https://acolhe-web-tau.vercel.app |
| **App mobile** | [github.com/web-design-on/acolhe-app](https://github.com/web-design-on/acolhe-app) — veja [Como executar](#como-executar-o-app) |
| **Portal web + API** | [github.com/web-design-on/acolhe-web](https://github.com/web-design-on/acolhe-web) |

## Integrantes

| Nome | GitHub |
| --- | --- |
| Natali Schers | [@natali-schers](https://github.com/natali-schers) |
| Rebeca Luiza Soares Cerqueira | [@Rebeca-Soares](https://github.com/Rebeca-Soares) |
| Sarah Raquel Soares Maranhão | [@smaranha](https://github.com/smaranha) |

## O problema

Quando uma pessoa idosa ou dependente precisa de ajuda, acionar a rede de apoio pode depender de ações que se tornam
difíceis justamente no momento em que ela está fragilizada, confusa ou machucada. Para familiares e cuidadores, o
desafio é saber quem está disponível, evitar deslocamentos desnecessários, acompanhar a rotina de cuidados e manter
todos informados.

A ideia surgiu de duas experiências pessoais do grupo: uma senhora que mora sozinha passou mal de madrugada e, ainda
confusa no hospital, acreditava ter pedido ajuda a vários familiares, mas só tinha conseguido fazer uma ligação, que
não foi atendida; e a dificuldade de encontrar medicamentos que nem sempre estão disponíveis, obrigando a ligar ou
visitar vários estabelecimentos.

**Públicos:**

- **Pessoa cuidada:** pede ajuda em emergências e acompanha lembretes, consultas e orientações.
- **Familiar ou cuidador:** recebe e responde aos alertas e acompanha a rotina de cuidados.
- **Profissional de saúde:** acompanha pacientes, registra prescrições e consulta o histórico de cuidados.

## A solução

O Acolhe combina um **app mobile** para a pessoa assistida e sua rede de apoio com um **portal web** para
acompanhamento e gestão do cuidado. No celular ficam as ações rápidas e acessíveis (emergência e dia a dia); na web,
as informações e tarefas que pedem uma tela maior e uma visão geral do histórico.

**App mobile** (este repositório)

- **Pedido de ajuda:** ao tocar em "Preciso de ajuda", no app ou pelo **widget** na tela inicial do celular, começa
  uma contagem de 5 segundos que pode ser cancelada. Depois o pedido é enviado e o andamento pode ser acompanhado.
  Há também um atalho para ligar para o **SAMU (192)**; o app não substitui o serviço de emergência.
- **Resposta ao alerta:** o familiar/cuidador vê o alerta, assume ou recusa o atendimento, liga para a pessoa,
  abre o endereço no mapa e registra a chegada.
- **Canais:** cada familiar/cuidador escolhe receber alertas pelo app, pelo WhatsApp ou pelos dois. Contatos
  secundários opcionais (vizinhos, pessoas de confiança) recebem só o alerta, por SMS ou WhatsApp, sem acesso a
  dados de saúde. Sem internet, o alerta sai por SMS.
- **Dia a dia:** doses do dia (confirmar ou adiar, ouvir as orientações em voz alta), receitas, consultas, rotina e
  rede de apoio.

**Portal web** ([acolhe-web](https://github.com/web-design-on/acolhe-web))

- **Família/cuidadores:** alertas, rotina, medicamentos, consultas e rede de apoio, sem depender do celular.
- **Profissional de saúde:** pacientes, prescrições e histórico de cuidados.
- **Disponibilidade nas UBSs:** onde encontrar o medicamento na rede pública (estoque, endereço, telefone e mapa),
  com dados da BNAFAR, do Ministério da Saúde.

## Como a integração funciona

```
 App mobile (Expo)                Portal web (React)
 pessoa cuidada / cuidador        família / médico
          │                               │
          └──── HTTPS + token JWT ────────┘
                         │
              API /api  (Hono, na Vercel)   ──▶  Dados Abertos do Ministério da Saúde
                         │                       (estoque de medicamentos nas UBSs)
              PostgreSQL (Prisma Postgres)
```

- **Uma API para os dois.** A API fica no repositório `acolhe-web` (pasta `server/`) e é publicada junto com o
  portal, em `https://acolhe-web-tau.vercel.app/api`. App e portal só falam com essa API; nenhum acessa o banco
  diretamente.
- **Mesmas contas.** O login devolve um token JWT, enviado em cada chamada (`Authorization: Bearer <token>`).
  Perfis: `pessoa` e `cuidador` usam o app; `cuidador` (como "familiar") e `medico` usam o portal. Cada pessoa só vê
  as pessoas cuidadas a que está ligada.
- **Mesmos modelos de dados.** Os tipos em `src/types` são iguais nos dois repositórios, assim como as cores do tema.
- **Alerta de SOS, ponta a ponta:**
  1. a pessoa cuidada toca em "Preciso de ajuda" (app ou widget) → `POST /api/patients/:id/alerts`;
  2. a API cria o alerta com um destinatário por cuidador e o canal de cada um (app, WhatsApp ou SMS; sem internet, SMS);
  3. o app do cuidador e o portal consultam o alerta ativo periodicamente e mostram o pedido;
  4. quem assume, recusa ou chega atualiza o alerta, e todos (inclusive a pessoa cuidada) veem o andamento.
     O link enviado por WhatsApp/SMS abre uma página pública do alerta no portal, sem login.
- **Receita vira rotina:** o médico assina a receita no portal, cada item vira um medicamento com horários, e as
  doses aparecem no app da pessoa cuidada. As confirmações e adiamentos feitos no app aparecem no portal.

## Como executar o app

> Não há link do Expo Snack: o app usa módulos nativos (widgets de SOS) e várias rotas/arquivos, que o Snack não
> suporta. Rode localmente com o Expo Go ou instale o APK (veja abaixo).

**Pré-requisitos:** Node.js 20+ e o app **Expo Go** no celular.

```bash
git clone https://github.com/web-design-on/acolhe-app.git
cd acolhe-app
npm install
cp .env.example .env
npx expo start
```

- **Celular:** abra o **Expo Go** e leia o QR code. Tudo funciona, **menos o widget** (veja [Widget de SOS](#widget-de-sos-tela-inicial)).
- **Navegador:** aperte `w` no terminal (ou `npm run web`).

Por padrão (`EXPO_PUBLIC_USE_MOCKS=true`) o app usa dados simulados e não precisa de API. Na tela de login há os
botões **"Entrar como Dona Maria"** / **"Entrar como Ana"** (modo demonstração).

### Usar os dados reais (mesma API do portal)

No `.env`:

```bash
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_API_URL=https://acolhe-web-tau.vercel.app/api
EXPO_PUBLIC_WEB_URL=https://acolhe-web-tau.vercel.app
```

Para usar a API local, rode `npm run dev` no `acolhe-web` (API em `http://localhost:3334/api`). No celular, troque
`localhost` pelo IP do computador na rede.

Entre com as contas do seed (senha `12345678`): `maria@exemplo.com` (pessoa cuidada) ou `ana@exemplo.com` (cuidadora).

### Roteiro de demonstração

1. Entre como **Dona Maria** → toque em **PRECISO DE AJUDA** → contagem de 5 s → a rede "vê" e a Ana "assume" sozinha (simulação).
2. Entre como **Ana** → na tela inicial, toque em **Simular alerta** → **Assumir e ir ajudar** → **Cheguei, está tudo bem**.
3. Abra o link `acolhe://sos` (ou `/sos` na web): é o que o widget faz.

## Tecnologias

- Expo SDK 58 + React Native + TypeScript
- Expo Router (navegação por arquivos em `src/app`)
- TanStack React Query (dados)
- Fonte Atkinson Hyperlegible (feita para baixa visão), `expo-speech` (ler em voz alta), `expo-haptics` (vibração na contagem)
- Widgets: `expo-widgets` (iPhone) e `react-native-android-widget` (Android)

## Widget de SOS (tela inicial)

Tocar no widget abre `acolhe://sos`, que leva direto para a **contagem de 5 segundos**, onde dá para cancelar.
Assim um toque sem querer no widget não dispara o alerta.

| Plataforma | Arquivo | Biblioteca |
| --- | --- | --- |
| Android | `src/widgets/android/SosWidget.tsx` | `react-native-android-widget` (abre o link com `OPEN_URI`; pode ficar na tela de bloqueio) |
| iPhone | `src/widgets/ios/SosWidget.tsx` | `expo-widgets` (abre o link com `widgetURL`; tamanhos pequeno, médio e tela de bloqueio) |

Configuração dos dois em `app.json` (seção `plugins`).

**Widgets não funcionam no Expo Go.** Para testar, gere uma versão de desenvolvimento:

```bash
# Android (precisa do Android Studio instalado)
npx expo run:android

# ou na nuvem, sem instalar nada (Android ou iOS)
npx eas-cli@latest build --profile development --platform android
```

O iPhone exige um Mac com Xcode (`npx expo run:ios`) ou o EAS Build com conta de desenvolvedor Apple.
Depois de instalar, segure o dedo na tela inicial → Widgets → **Acolhe SOS**.

### Gerar um APK para o grupo testar (Android)

O perfil `preview` do `eas.json` gera um **APK** (`"buildType": "apk"`) que roda sozinho no celular, sem computador
nem `expo start`. O build é feito na nuvem do Expo (uns 10 a 20 minutos, mais o tempo de fila no plano gratuito),
sem precisar do Android Studio. O widget de SOS já foi testado assim num celular Android e funcionou.

> **Só uma pessoa gera o APK.** Quem gera roda o comando abaixo e manda o link para o grupo.
> Quem só vai testar **não precisa de nada disso**: nem terminal, nem conta no Expo, nem `.env`, nem o código.
> Basta abrir o link no celular e instalar (veja [Para instalar no celular](#para-instalar-no-celular)).

```bash
npx eas-cli@latest login          # só na primeira vez
npx eas-cli@latest build -p android --profile preview
```

Na primeira vez, o CLI pergunta se pode gerar uma keystore (a chave que assina o app): responda **sim**. Ela fica
guardada no EAS e é reaproveitada nos próximos builds.

No final aparecem um **link e um QR code** (também ficam em expo.dev → projeto `acolhe-app` → **Builds**).
Mande o link para o grupo.

#### Variáveis de ambiente do build

O `.env` **não vai para o build**. As variáveis do APK ficam cadastradas no EAS, no ambiente `preview`, e já estão
configuradas. Não é preciso mexer no expo.dev:

| Variável | Valor no EAS (`preview`) |
| --- | --- |
| `EXPO_PUBLIC_USE_MOCKS` | `false` (usa os dados oficiais) |
| `EXPO_PUBLIC_API_URL` | `https://acolhe-web-tau.vercel.app/api` |
| `EXPO_PUBLIC_WEB_URL` | `https://acolhe-web-tau.vercel.app` |

- Para conferir: `npx eas-cli@latest env:list --environment preview` (ou expo.dev → projeto → **Environment variables**).
- Para mudar um valor, edite no expo.dev e **gere um build novo**: as variáveis entram no APK na hora do build.
- **Nunca cadastre `DATABASE_URL` nem `JWT_SECRET` no EAS.** O app não usa essas variáveis (ele só fala com a API)
  e qualquer coisa que entra no APK pode ser extraída por quem o tiver. Elas ficam no `acolhe-web` e na Vercel.

#### Para instalar no celular

Para quem vai testar. É só isso, sem instalar nada no computador:

1. Abra o link no celular Android e baixe o APK.
2. Se o Android pedir, permita instalar de **fontes desconhecidas**.
3. Abra o app e entre com sua conta, ou com uma conta de teste do seed: `maria@exemplo.com` (pessoa cuidada) ou
   `ana@exemplo.com` (cuidadora), senha `12345678`. Os botões "Entrar como Dona Maria/Ana" só aparecem no modo
   demonstração, então não aparecem no APK.
4. Segure o dedo na tela inicial → **Widgets** → **Acolhe SOS** e arraste para a tela.

**Instale uma vez só.** O app instalado não se atualiza sozinho. Quem testa só repete a instalação quando receber
o **link de um build novo**: baixe o novo APK e instale por cima, sem desinstalar. Pode ser preciso entrar
de novo e, se o widget sumir, adicioná-lo outra vez.

#### Observações

- **Mudou o código? Gere um build novo** e mande o novo link.
- **Não use o perfil `development` para o grupo.** Ele só funciona com o `expo start` rodando no seu computador.
- **iPhone não instala APK.** Para testar o widget no iOS é preciso conta Apple Developer (paga) e cadastrar
  cada aparelho (`npx eas-cli@latest device:create`) ou distribuir pelo TestFlight.

## Estrutura de pastas

```
index.ts                 # Entrada: Expo Router + registro do widget Android
src/
├── app/                 # Telas (cada arquivo é uma rota)
│   ├── index.tsx        # Boas-vindas (escolha de perfil)
│   ├── login.tsx
│   ├── sos.tsx          # Destino do widget (acolhe://sos)
│   ├── pessoa/          # Abas da pessoa cuidada: Início, Remédios, Rotina, Rede
│   ├── cuidador/        # Abas do cuidador: Início, Alertas, Rotina, Rede
│   ├── emergencia/      # Contagem, Alerta enviado, Alerta recebido
│   └── nova-anotacao.tsx
├── screens/             # Telas compartilhadas pelos dois perfis (Rotina, Rede)
├── components/
│   ├── ui/              # Componentes genéricos (AppText, Button, Card, Screen...)
│   └── domain/          # Componentes do Acolhe (HelpButton, Timeline, RecipientList...)
├── contexts/            # AuthContext (sessão) e EmergencyContext (estado do alerta)
├── hooks/               # Hooks do React Query
├── services/            # Camada de dados (API ou dados simulados)
├── mocks/               # Dados simulados
├── theme/               # colors.ts (cores) e tokens.ts (espaços, fontes)
├── types/               # Modelos de dados (os mesmos do acolhe-web)
├── utils/
└── widgets/             # Widgets de SOS (android/ e ios/)
```

## Cores

Todas as cores ficam em **`src/theme/colors.ts`**, com os mesmos valores do portal web. As telas usam `colors.primary`,
`colors.danger` etc.; nunca um `#hex` solto. (Exceção: o widget do iPhone roda isolado e repete as cores dentro do arquivo.)

## Detalhes da integração no app

- **Sessão salva:** o token fica no `expo-secure-store` (`localStorage` no navegador) e é conferido em `/auth/me` ao abrir o app.
- **Alertas:** sem push ainda, o app consulta o alerta ativo a cada 4 s (15 s sem alerta), pausando em segundo plano.
- **Contas:** o app aceita a pessoa cuidada e cuidadores; contas de médico usam o portal.
- Cada função de `src/services` chama uma rota da API ou, com `EXPO_PUBLIC_USE_MOCKS=true`, usa `src/mocks`.
