# Acolhe App

Aplicativo mobile do **Acolhe**, plataforma de socorro para pessoas idosas ou com deficiência.

- **Pessoa cuidada:** botão grande "Preciso de ajuda", remédios do dia, rotina e rede de cuidado.
- **Cuidador(a)** (familiar, vizinho, amigo...): recebe o alerta, assume o atendimento e acompanha a rotina.
- **Widget de SOS** na tela inicial (Android e iPhone): pede ajuda sem precisar abrir o app.

> O portal web (família e médicos) fica no repositório `acolhe-web`.

## Tecnologias

- Expo SDK 58 + React Native + TypeScript
- Expo Router (navegação por arquivos em `src/app`)
- TanStack React Query (dados)
- Fonte Atkinson Hyperlegible (feita para baixa visão), `expo-speech` (ler em voz alta), `expo-haptics` (vibração na contagem)
- Widgets: `expo-widgets` (iPhone) e `react-native-android-widget` (Android)

## Como rodar

```bash
npm install
cp .env.example .env
npx expo start
```

- **Celular:** abra o app **Expo Go** e leia o QR code. Tudo funciona, **menos o widget** (veja abaixo).
- **Navegador:** aperte `w` no terminal (ou `npm run web`).

Na tela de login há o botão **"Entrar como Dona Maria"** / **"Entrar como Ana"** (modo demonstração, sem backend).

### Roteiro de demonstração

1. Entre como **Dona Maria** → toque em **PRECISO DE AJUDA** → contagem de 5 s → a rede "vê" e a Ana "assume" sozinha (simulação).
2. Entre como **Ana** → na tela inicial, toque em **Simular alerta** → **Assumir e ir ajudar** → **Cheguei, está tudo bem**.
3. Abra o link `acolhe://sos` (ou `/sos` na web): é o que o widget faz.

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

O perfil `preview` do `eas.json` gera um **APK** que roda sozinho no celular, sem computador nem `expo start`.
O build é feito na nuvem do Expo (uns 10 a 20 minutos), sem precisar do Android Studio.

```bash
npx eas-cli@latest login          # só na primeira vez
npx eas-cli@latest build -p android --profile preview
```

No final aparecem um **link e um QR code** (também ficam em expo.dev → projeto `acolhe-app` → Builds).
Mande o link para o grupo.

**Para instalar no celular:**

1. Abra o link no celular Android e baixe o APK.
2. Se o Android pedir, permita instalar de **fontes desconhecidas**.
3. Abra o app uma vez e entre (ex.: **"Entrar como Dona Maria"**).
4. Segure o dedo na tela inicial → **Widgets** → **Acolhe SOS** e arraste para a tela.

**Observações:**

- O APK sai no **modo demonstração** (dados simulados): o `.env` não vai para o build. Para usar a API real,
  cadastre `EXPO_PUBLIC_USE_MOCKS=false` e `EXPO_PUBLIC_API_URL` (URL pública, não `localhost`) em
  expo.dev → projeto → **Environment variables**, no ambiente `preview`.
- **Não use o perfil `development` para o grupo.** Ele só funciona com o `expo start` rodando no seu computador.
- **Mudou o código? Gere um build novo** e mande o novo link.
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

## Integração com o backend

O app usa a **mesma API e o mesmo banco do portal web**. A API fica no repositório `acolhe-web` (pasta `server/`,
Hono + Prisma + Postgres) e é publicada junto com o portal no Vercel. O app nunca acessa o banco diretamente.

1. Suba a API: no `acolhe-web`, `npm run dev` (API em `http://localhost:3334/api`) ou use a URL do Vercel.
2. No `.env` do app: `EXPO_PUBLIC_USE_MOCKS=false` e `EXPO_PUBLIC_API_URL` apontando para a API
   (no celular, use o IP do computador na rede, não `localhost`; veja `.env.example`).
3. Entre com as contas do seed do portal (senha `12345678`): `maria@exemplo.com` (pessoa cuidada) ou `ana@exemplo.com` (cuidadora).

Como funciona:

- **Sessão salva:** o token fica no `expo-secure-store` (`localStorage` no navegador) e é conferido em `/auth/me` ao abrir o app.
- **Alertas:** sem push ainda, o app consulta o alerta ativo a cada 4 s (15 s sem alerta), pausando em segundo plano.
- **Contas:** o app aceita a pessoa cuidada e cuidadores; contas de médico usam o portal.

Próximos passos: **notificações push** (`expo-notifications`) para avisar o cuidador com o app fechado,
**localização** junto com o alerta (`expo-location`) e sessão compartilhada com o widget de SOS.
