<p align="center">
  <img src="assets/logo-vassouras.png" alt="Universidade de Vassouras" width="400"/>
</p>

<h3 align="center">
  Universidade de Vassouras  
</h3>

---

### 📚 Curso: **Engenharia de Software** 
### 🖥️ Disciplina: **Laboratório de Desenvolvimento de Aplicativos Nativos** 
### 👨‍🎓 Autor: **Matheus Beiruth**

---


# 🌦️ Glass Weather App (Mobile)

Um aplicativo de clima moderno, minimalista e elegante, construído com **React Native** e **Expo**.
O projeto apresenta um design *Glassmorphism* dinâmico que muda conforme o clima e o horário do dia, oferecendo uma experiência de usuário fluida e tátil.

---

## 📱 Demonstração

Veja o aplicativo em funcionamento:

<div align="center">
  <br />
  <em>Navegação fluida, temas dinâmicos e busca inteligente.</em>
</div>

---

## ✨ Funcionalidades

- **📍 Geolocalização Automática:** Detecta a posição do usuário para fornecer dados precisos imediatamente.
- **🔍 Busca Inteligente:** Pesquisa por cidades com sugestões e tratamento de ambiguidades (ex: múltiplas cidades com o mesmo nome).
- **🎨 Temas Dinâmicos:** O gradiente de fundo e os ícones se adaptam automaticamente:
  - *Dia/Noite* (Cores vibrantes vs. tons noturnos).
  - *Condição* (Chuva, Sol, Nublado, Tempestade).
- **📅 Previsões Detalhadas:**
  - Clima atual com sensação térmica, umidade, vento e índice UV.
  - Previsão horária (24h) com carrossel deslizante.
  - Previsão estendida para os próximos 5 dias.
- **⚙️ Preferências Persistentes:** Salva a última cidade visitada e a unidade de medida (°C/°F) mesmo após fechar o app.


---

## 🛠️ Tecnologias Utilizadas

Este projeto foi desenvolvido com foco em **Engenharia de Software** e **Clean Code**, utilizando:

- **Core:** [React Native](https://reactnative.dev/) + [Expo SDK 50+](https://expo.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Tipagem estática estrita).
- **Gerenciamento de Estado:** Context API + Custom Hooks (`useWeather`).
- **Persistência:** `@react-native-async-storage/async-storage`.
- **UI/UX:**
  - `expo-linear-gradient` para os fundos dinâmicos.
  - `lucide-react-native` para ícones vetoriais modernos.
  - `expo-haptics` para feedback físico.
- **API:** Integração com a [Open-Meteo API](https://open-meteo.com/) (Gratuita, sem chave, dados científicos).

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
Certifique-se de ter o **Node.js** instalado na sua máquina.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/BeiruthDEV/weather-app-mobile.git](https://github.com/BeiruthDEV/weather-app-mobile.git)
   cd weather-app-mobile
   ```

2. **Instale as dependências:**

```bash

npm install

 ```

Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

Abra no seu dispositivo:

  Celular Físico: Baixe o app Expo Go (iOS/Android) e escaneie o QR Code que aparece no terminal.

  Emulador: Pressione a para Android ou i para iOS (Requer Android Studio ou Xcode).


## 📂 Estrutura do Projeto
A arquitetura segue o padrão de separação de responsabilidades (SoC):

```bash
src/
├── components/      # Componentes visuais isolados (burros/stateless)
│   ├── CurrentWeather.tsx
│   ├── Forecast.tsx
│   ├── HourlyForecast.tsx
│   └── WeatherDetails.tsx
├── context/         # Gerenciamento de estado global
│   └── WeatherContext.tsx
├── hooks/           # Lógica de negócios (API, GPS, Storage)
│   └── useWeather.ts
├── types/           # Definições de tipos TypeScript
│   └── weather.ts
└── utils/           # Funções auxiliares puras (Conversões, Cores)
    └── weather.tsx

```

## 📄 Licença
Este projeto é de código aberto e está disponível sob a licença MIT.