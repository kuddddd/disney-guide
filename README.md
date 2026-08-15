🏰 WDW Guide

Guia pessoal para visitas ao Walt Disney World — dados de filas, shows e roteiro em tempo real, direto no browser, sem instalação.

Desenvolvido para uso durante as férias em Orlando. Roda como um único arquivo HTML hospedado no GitHub Pages.

Funcionalidades
Home
Status de abertura (aberto/fechado) e horário de funcionamento dos 3 parques em tempo real
Contagem de atrações abertas e shows do dia
Badge de Early Entry quando disponível
Clima atual em Orlando via Open-Meteo
Modo claro/escuro com paleta "Dusk Magic" otimizada para uso em parques
Dentro do parque — abas

Resumo

Banners de eventos especiais do dia (Early Entry, Special Ticketed Event, Extended Evening)
Tracker de Parade & Fireworks com contagem regressiva em tempo real
Roteiro sugerido dinâmico com as melhores atrações para o momento atual
Detector de janela de oportunidade pós-chuva
Gráfico de ocupação com forecast de lotação

Atrações

Lista completa com tempo de fila ao vivo, status, Lightning Lane e preço
Filtro por nome e ordenação por fila crescente/decrescente
Indicador de atração coberta (útil em dias de chuva)
Botão de pin para abrir localização no Google Maps
Marcação de atração como visitada

Shows

Lista de shows do dia com horários e contagem regressiva
Status de cada sessão (próxima, em andamento, encerrada)

Roteiro 📍

Algoritmo greedy com score ponderado: distância a pé (55%) + tempo de fila (35%) + forecast de ocupação (10%)
Cálculo de distância por Haversine com coordenadas reais de cada atração
Geolocalização via GPS para origem dinâmica
Estado persistido por parque no localStorage — progresso não se perde ao fechar o app
Eventos-âncora (parades e fogos) inseridos automaticamente no roteiro com dica de posicionamento
Botão 📍 em cada card para abrir rota de caminhada no Google Maps
Parques cobertos
Parque	Atrações mapeadas
🏰 Magic Kingdom	42
🌍 EPCOT	33
🎬 Hollywood Studios	13
APIs utilizadas
API	Uso	Docs
themeparks.wiki	Filas ao vivo, shows, schedule e coordenadas	Pública, sem autenticação
Open-Meteo	Clima atual em Orlando	Pública, sem autenticação

Ambas as APIs são gratuitas e não requerem chave de acesso.

Arquitetura

Aplicação single-file — todo o HTML, CSS e JavaScript em um único index.html. Sem dependências externas, sem build, sem servidor.

index.html
├── CSS com variáveis de tema (light/dark)
├── HTML estático (shell da UI)
└── JavaScript vanilla
    ├── Estado global (S)
    ├── Camada de dados (fetch + cache localStorage)
    ├── Renderização por aba
    └── Algoritmo de roteiro (Haversine + score greedy)

Cache e persistência (localStorage)

Chave	Conteúdo	TTL
wdw_v	Atrações visitadas	Permanente
wdw_a	Alertas configurados	Permanente
wdw_t	Tema (dark/light)	Permanente
wdw_coords	Coordenadas das atrações	24h
wdw_routes	Estado do roteiro por parque	Permanente
Como usar

Acesse via GitHub Pages — nenhuma instalação necessária.

Para rodar localmente, basta abrir o index.html direto no browser. Não há servidor, build ou dependências para instalar.

Decisões de design

Por que single-file? Simplicidade máxima para uso pessoal. Um arquivo, um commit, zero configuração de deploy além do GitHub Pages.

Por que sem framework? JavaScript vanilla é suficiente para a complexidade do projeto e elimina qualquer fricção de build. O arquivo inteiro tem ~3100 linhas.

Por que o roteiro usa score greedy e não otimização global? O problema do Caixeiro Viajante com N atrações e restrições de tempo de fila dinâmico é NP-difícil. O greedy com score ponderado é O(N²) e produz resultados práticos e recalculáveis em tempo real conforme as filas mudam.

Timezone Toda comparação de horários usa Date.now() vs Date.parse(isoWithOffset) — ambos em UTC — o que garante comportamento correto independente do timezone do browser (testado com device em São Paulo acessando dados de Orlando).
