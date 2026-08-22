# 🏰 WDW Guide

Guia pessoal para visitas ao **Walt Disney World** — dados de filas, shows e roteiro em tempo real, direto no browser, sem instalação.

Desenvolvido para uso durante as férias em Orlando. Roda como arquivos estáticos hospedados no GitHub Pages.

---

## Funcionalidades

### Home
- Status de abertura (aberto/fechado) e horário de funcionamento dos 3 parques em tempo real
- Contagem de atrações abertas e shows do dia
- Badge de Early Entry quando disponível
- Clima atual em Orlando via Open-Meteo, incluindo mm de chuva previstos para o dia
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
- GPS contínuo via `watchPosition` — o roteiro recalcula automaticamente a cada novo fix de posição enquanto você caminha, sem intervenção manual
- Estado persistido por parque no localStorage — progresso não se perde ao fechar o app
- Eventos-âncora (parades e fogos) inseridos automaticamente no roteiro com dica de posicionamento contextual por parque
- Dica contextual de chuva por tipo de área: áreas cobertas recebem sugestão de "boa opção durante a chuva"; áreas ao ar livre com fila baixa recebem alerta de "aproveite antes da chuva"
- Botão 📍 em cada card para abrir rota de caminhada no Google Maps

**Mapa 🗺️**
- Mapa interativo do parque via OpenStreetMap/Leaflet, centralizado nas coordenadas reais de cada parque
- Toggle de camada satélite (Esri, gratuito sem chave) no canto inferior direito — alterna entre mapa e imagem aérea
- Heatmap por área: atrações abertas são agrupadas por área geográfica, com centroide calculado e círculo colorido proporcional à fila média
- Raio do círculo proporcional ao número de atrações da área (mín 120 m, máx 280 m)
- Escala de cores dos círculos por tempo médio de espera:

  | Cor | Fila média | Rótulo |
  |---|---|---|
  | 🔵 Cinza | Sem fila registrada | Sem fila |
  | 🟢 Verde | ≤ 15 min | Tranquilo |
  | 🟡 Verde-lima | ≤ 30 min | Moderado |
  | 🟠 Âmbar | ≤ 50 min | Movimentado |
  | 🔴 Vermelho | ≤ 70 min | Cheio |
  | ⬛ Vinho | > 70 min | Muito cheio |

- Rótulo flutuante centralizado dinamicamente sobre cada círculo
- Popup por área ao tocar no círculo: lista todas as atrações abertas da área com fila individual, ordenadas da menor para a maior espera
- Marcador azul pulsante de localização do visitante via GPS em tempo real (watchPosition com alta precisão)
- GPS do mapa é independente do GPS do Roteiro — ativado automaticamente ao abrir a aba e desativado ao sair
- Heatmap atualizado automaticamente junto com o ciclo de refresh de 5 minutos
- Mapa se reinicializa ao trocar de parque, ajustando zoom e centro automaticamente

### Configuração do mapa por parque

| Parque | Centro | Zoom |
|---|---|---|
| 🏰 Magic Kingdom | 28.4199, -81.5808 | 17 |
| 🌍 EPCOT | 28.3747, -81.5498 | 16 |
| 🎬 Hollywood Studios | 28.3582, -81.5601 | 17 |

### Notificações automáticas
Sem configuração manual — o app pede permissão uma vez e passa a notificar automaticamente a cada 5 minutos via Service Worker, mesmo com o browser minimizado.

| Gatilho | Condição |
|---|---|
| ⚡ Fila baixa | Qualquer atração mapeada com ≤ 20 min de espera |
| ✅ Atração abriu | Status mudou de CLOSED/DOWN para OPERATING |
| 🚫 Atração fechou | Status mudou de OPERATING para CLOSED ou DOWN |
| 🎆 Show-âncora em breve | Parade, fogos ou Fantasmic nos próximos 35 min |
| 🎠 Show em breve | Qualquer outro show nos próximos 20 min |
| 🌧️ Chuva se aproximando | ≥ 70% de precipitação nas próximas 2h |
| ⛈️ Tempestade | ≥ 50% de chance de raios nas próximas 2h |
| 🌡️ Calor extremo | Sensação térmica ≥ 40°C nas próximas 2h |
| 🎯 Resumo matinal | Notificação às 7h30 com clima, shows e Early Entry do dia |

Shows-âncora (parades, fogos, Fantasmic) têm janela maior — 35 min — para garantir tempo de posicionamento. Cada tipo de notificação tem cooldown de 10 minutos para evitar repetição excessiva. O resumo matinal é agendado automaticamente ao conceder permissão e reagendado a cada abertura do app.

### Ticker de atualização inline
O rodapé do parque exibe após cada refresh: número de atrações abertas, fila média atual e delta em relação ao ciclo anterior (ex: `▲2 abertas` ou `▼1 fecharam`). Nenhuma interação necessária.

---

## Parques cobertos

| Parque | Atrações mapeadas |
|---|---|
| 🏰 Magic Kingdom | 42 |
| 🌍 EPCOT | 33 |
| 🎬 Hollywood Studios | 13 |

Todas as atrações têm coordenadas `lat`/`lng` reais para cálculo de distância no roteiro e posicionamento no heatmap. Galerias e espaços sem fila aparecem na aba Atrações mas ficam fora do algoritmo de roteiro e do heatmap.

---

## APIs utilizadas

| API | Uso | Docs |
|---|---|---|
| [themeparks.wiki](https://api.themeparks.wiki) | Filas ao vivo, shows, schedule e coordenadas | Pública, sem autenticação |
| [Open-Meteo](https://open-meteo.com) | Clima atual, forecast horário e mm de precipitação | Pública, sem autenticação |
| [OpenStreetMap](https://www.openstreetmap.org) | Tiles base do mapa interativo (via Leaflet) | Pública, sem autenticação |
| [Esri World Imagery](https://www.esri.com) | Tiles de satélite para o toggle de camada | Pública, sem autenticação |

Todas as APIs são gratuitas e não requerem chave de acesso.

---

## Arquitetura

```
index.html   ← HTML, CSS e JavaScript (single-file)
sw.js        ← Service Worker para notificações em background
README.md
```

Sem dependências externas, sem build, sem servidor. ES5 vanilla para máxima compatibilidade mobile.

**Dependências externas (CDN)**

| Biblioteca | Versão | Uso |
|---|---|---|
| Leaflet | 1.9.4 | Mapa interativo e heatmap por área |

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
JavaScript vanilla elimina qualquer fricção de build e mantém o projeto sem dependências que possam quebrar. O arquivo principal tem ~3600 linhas.

**Por que o roteiro usa score greedy e não otimização global?**
O problema do Caixeiro Viajante com N atrações e restrições de tempo de fila dinâmico é NP-difícil. O greedy com score ponderado é O(N²) e produz resultados práticos e recalculáveis em tempo real conforme as filas mudam a cada 5 minutos.

**Por que o GPS do roteiro usa watchPosition e não getCurrentPosition?**
`getCurrentPosition` retorna uma única leitura no momento em que o usuário ativa o GPS. `watchPosition` mantém a escuta ativa e recalcula o roteiro a cada novo fix — útil porque a posição dentro do parque muda constantemente durante o dia. O watch é encerrado com `clearWatch` ao desativar o GPS, sem consumo contínuo de bateria desnecessário.

**Por que o heatmap agrupa por área e não por atração individual?**
Um marcador por atração poluiria o mapa com 40+ pins sobrepostos. Agrupando por área geográfica, o círculo comunica o estado macro da região com um olhar — útil para decidir para onde ir a seguir sem precisar ler uma lista. O raio proporcional ao número de atrações reforça a densidade de cada área visualmente.

**Por que shows-âncora têm janela de notificação maior?**
Parades, fogos e Fantasmic exigem posicionamento físico com antecedência — um aviso de 20 minutos não dá tempo de se deslocar e escolher um bom lugar. Shows regulares em teatro fechado têm entrada até o início, então 20 minutos é suficiente.

**Timezone**
Toda comparação de horários usa `Date.now()` vs `Date.parse(isoWithOffset)` — ambos em UTC — o que garante comportamento correto independente do timezone do browser (testado com device em São Paulo acessando dados de Orlando em Eastern Time).

**Notificações sem backend**
Push notifications reais requerem servidor + VAPID keys. A solução adotada usa `postMessage` da página para o Service Worker, que chama `showNotification` diretamente — funciona com o app em background sem nenhuma infraestrutura de servidor. O resumo matinal usa `setTimeout` calculado em runtime para disparar às 7h30 do horário local do device.
