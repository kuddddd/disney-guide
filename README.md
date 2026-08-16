# 🏰 WDW Guide

Guia pessoal para visitas ao **Walt Disney World** — dados de filas, shows e roteiro em tempo real, direto no browser, sem instalação.

Desenvolvido para uso durante as férias em Orlando. Roda como arquivos estáticos hospedados no GitHub Pages.

---

## Funcionalidades

### Home
- Status de abertura (aberto/fechado) e horário de funcionamento dos 3 parques em tempo real
- Contagem de atrações abertas e shows do dia
- Badge de Early Entry quando disponível
- Clima atual em Orlando via Open-Meteo
- Modo claro/escuro com paleta "Dusk Magic" otimizada para uso em parques

### Dentro do parque — abas

**Resumo**
- Banners de eventos especiais do dia (Early Entry, Special Ticketed Event, Extended Evening)
- Tracker de Parade & Fireworks com contagem regressiva em tempo real
- Roteiro sugerido dinâmico com as melhores atrações para o momento atual
- Detector de janela de oportunidade pós-chuva
- Gráfico de ocupação com forecast de lotação

**Atrações**
- Lista completa com tempo de fila ao vivo, status, Lightning Lane e preço
- Filtro por nome e ordenação por fila crescente/decrescente
- Indicador de atração coberta (útil em dias de chuva)
- Botão 📍 em cada card para abrir rota de caminhada no Google Maps
- Marcação de atração como visitada

**Shows**
- Lista de shows do dia com horários e contagem regressiva
- Status de cada sessão (próxima, em andamento, encerrada)

**Roteiro 📍**
- Algoritmo greedy com score ponderado: distância a pé (55%) + tempo de fila (35%) + forecast de ocupação (10%)
- Cálculo de distância por Haversine com coordenadas reais de cada atração
- Geolocalização via GPS para origem dinâmica
- Estado persistido por parque no localStorage — progresso não se perde ao fechar o app
- Eventos-âncora (parades e fogos) inseridos automaticamente no roteiro com dica de posicionamento contextual por parque
- Botão 📍 em cada card para abrir rota de caminhada no Google Maps

### Notificações automáticas
Sem configuração manual — o app pede permissão uma vez e passa a notificar automaticamente a cada 5 minutos via Service Worker, mesmo com o browser minimizado.

| Gatilho | Condição |
|---|---|
| ⚡ Fila baixa | Qualquer atração mapeada com ≤ 20 min de espera |
| ✅ Atração abriu | Status mudou de CLOSED/DOWN para OPERATING |
| 🚫 Atração fechou | Status mudou de OPERATING para CLOSED ou DOWN |
| 🎠 Show em breve | Qualquer show ou parade nos próximos 20 min |
| 🌧️ Chuva se aproximando | ≥ 70% de precipitação nas próximas 2h |
| ⛈️ Tempestade | ≥ 50% de chance de raios nas próximas 2h |
| 🌡️ Calor extremo | Sensação térmica ≥ 40°C nas próximas 2h |

Cada tipo de notificação tem cooldown de 10 minutos para evitar repetição excessiva.

---

## Parques cobertos

| Parque | Atrações mapeadas |
|---|---|
| 🏰 Magic Kingdom | 42 |
| 🌍 EPCOT | 33 |
| 🎬 Hollywood Studios | 13 |

Todas as atrações têm coordenadas `lat`/`lng` reais para cálculo de distância no roteiro. Galerias e espaços sem fila aparecem na aba Atrações mas ficam fora do algoritmo de roteiro.

---

## APIs utilizadas

| API | Uso | Docs |
|---|---|---|
| [themeparks.wiki](https://api.themeparks.wiki) | Filas ao vivo, shows, schedule e coordenadas | Pública, sem autenticação |
| [Open-Meteo](https://open-meteo.com) | Clima atual e forecast horário em Orlando | Pública, sem autenticação |

Ambas as APIs são gratuitas e não requerem chave de acesso.

---

## Arquitetura

```
index.html   ← HTML, CSS e JavaScript (single-file)
sw.js        ← Service Worker para notificações em background
README.md
```

Sem dependências externas, sem build, sem servidor. ES5 vanilla para máxima compatibilidade mobile.

**Cache e persistência (localStorage)**

| Chave | Conteúdo | TTL |
|---|---|---|
| `wdw_v` | Atrações visitadas | Permanente |
| `wdw_a` | Alertas legados | Permanente |
| `wdw_t` | Tema (dark/light) | Permanente |
| `wdw_coords` | Coordenadas das atrações | 24h |
| `wdw_routes` | Estado do roteiro por parque | Permanente |

**Notificações (Service Worker)**

O `sw.js` registra dois listeners:
- `message` — recebe `postMessage` da página com payload `{type:'WDW_NOTIFY', title, body, tag}` e exibe notificação nativa. Funciona com o app em background.
- `push` — compatível com push via servidor (futuro) e com o botão "Enviar por push" do DevTools para testes.

---

## Como usar

Acesse via GitHub Pages — nenhuma instalação necessária.

1. Abra o app no browser
2. Aceite a permissão de notificação quando solicitado
3. Selecione o parque do dia
4. Deixe o browser aberto em background — as notificações chegam automaticamente

**iOS:** para receber notificações, adicione o app à tela inicial via Safari → "Adicionar à Tela de Início" antes de conceder a permissão.

Para rodar localmente, é necessário um servidor local (Service Worker não funciona via `file://`):

```bash
npx serve .
```

---

## Decisões de design

**Por que single-file?**
Simplicidade máxima para uso pessoal. Um arquivo, um commit, zero configuração de deploy além do GitHub Pages.

**Por que sem framework?**
JavaScript vanilla elimina qualquer fricção de build e mantém o projeto sem dependências que possam quebrar. O arquivo principal tem ~3200 linhas.

**Por que o roteiro usa score greedy e não otimização global?**
O problema do Caixeiro Viajante com N atrações e restrições de tempo de fila dinâmico é NP-difícil. O greedy com score ponderado é O(N²) e produz resultados práticos e recalculáveis em tempo real conforme as filas mudam a cada 5 minutos.

**Timezone**
Toda comparação de horários usa `Date.now()` vs `Date.parse(isoWithOffset)` — ambos em UTC — o que garante comportamento correto independente do timezone do browser (testado com device em São Paulo acessando dados de Orlando em Eastern Time).

**Notificações sem backend**
Push notifications reais requerem servidor + VAPID keys. A solução adotada usa `postMessage` da página para o Service Worker, que chama `showNotification` diretamente — funciona com o app em background sem nenhuma infraestrutura de servidor.
