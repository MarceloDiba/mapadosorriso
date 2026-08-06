# Laboratório do Sorriso Ideal — versão multi-clínica com painel administrativo

O app deixa de ser uma página única e passa a atender várias clínicas, cada uma com seu link para anúncios, seu WhatsApp e sua identidade visual. Você administra tudo por um painel com login.

> Observação: a ativação do Lovable Cloud (banco de dados, login e armazenamento de imagens) falhou na última tentativa por um problema temporário de infraestrutura. Ao aprovar, a primeira ação será tentar ativar novamente. Sem isso, nada de painel/multi-clínica pode ser gravado.

## Rotas

```text
/                        -> landing institucional do produto (B2B)
/c/:slug                 -> quiz da clínica (link de tráfego pago)
/admin/login             -> login do administrador
/admin                   -> lista de clínicas
/admin/clinicas/nova     -> cadastro de clínica
/admin/clinicas/:id      -> edição + analytics da clínica
```

Se o contrato estiver inativo ou vencido, `/c/:slug` mostra apenas: "Esta página está temporariamente indisponível".

## Fluxo de 5 telas (`/c/:slug`)

Progressão psicológica: desejo → problema → objeção → decisão → resultado. Cards verticais, shell mobile de 430px, botão fixo no rodapé, sem rolagem horizontal.

1. **Desejo** — "Qual sorriso mais te inspira hoje?" · grid 2x2 com imagens (Natural, Rejuvenescido, Amplo, Hollywood) + link discreto no rodapé "Não tenho certeza — quero orientação".
2. **Problema** — "O que mais te incomoda no seu sorriso hoje?" · até 2 seleções (cor, formato, espaços, tamanho, alinhamento).
3. **Segurança** — "O que mais te faz hesitar em dar esse passo?" · escolha única (artificialidade, desgaste, dor, investimento, tempo).
4. **Momento** — "Qual é seu momento hoje?" · cards verticais (agendar agora, agendar avaliação, entender valores, comparando possibilidades, apenas pesquisando).
5. **Mapa do Sorriso** — resultado gerado pela matriz abaixo.

## Matriz de lógica do Mapa do Sorriso

**Título do perfil (Tela 1)**

| Estilo | Perfil exibido |
| --- | --- |
| Natural | Harmonização Discreta & Anatomicamente Preservada |
| Rejuvenescido | Luminosidade Jovem & Realce de Cor |
| Amplo | Simetria Facial & Preenchimento de Corredor Bucal |
| Hollywood | Design Ultra-Radiante & Alta Expressão Estética |
| Não tenho certeza | Mapeamento Personalizado em Consulta |

**Pilares recomendados (Tela 2)** — sempre 3: um por queixa marcada (até 2) e, completando, o pilar base "Protocolo Digital com Mock-up Prévio".

| Queixa | Pilar |
| --- | --- |
| Cor / manchas | Tecnologia de Cor Estável — laminados de alta opalescência que bloqueiam o fundo escuro e não amarelam |
| Formato / desgaste | Planejamento Aditivo — recupera volume e proporção sem desgaste desnecessário de estrutura sadia |
| Espaços / alinhamento | Fechamento Proporcional — redesenho da largura dos dentes mantendo a proporção do sorriso |
| Tamanho / gengiva | Arquitetura Gengival Integrada — alinhamento do contorno gengival para valorizar o tamanho das facetas |

**Nota de segurança (Tela 3)**

| Objeção | Nota exibida |
| --- | --- |
| Desgaste | Seu perfil é elegível para lentes ultrafinas de mínimo desgaste biológico |
| Artificialidade | Seu planejamento prevê Mock-up (teste do sorriso no rosto) antes de qualquer procedimento definitivo |
| Dor | Protocolo de execução rápida e minimamente invasiva, sem desconforto durante as sessões |
| Investimento | Simulação de condições facilitadas e parcelamento apresentadas na avaliação |
| Tempo | Cronograma reduzido, com etapas concentradas em poucas sessões |

**CTA WhatsApp** — número da clínica; texto do botão e mensagem pré-preenchida variam pela Tela 4 e carregam perfil + queixas + objeção, para o atendente receber o lead já qualificado.

Todo o conteúdo respeita as regras clínicas: sem diagnóstico, sem promessa de resultado, autoridade final do dentista.

## Painel administrativo

**Lista (`/admin`)**: nome, link, status (ativo / inativo / vencido), início e fim de contrato, ativar/desativar, copiar link do anúncio, criar e editar.

**Ficha da clínica (`/admin/clinicas/:id`)**, em abas:

*Aba Dados*
- Identificação: nome, slug, cidade, logo
- Contato: WhatsApp e texto base opcional da mensagem
- Contrato: data inicial, data final, ativo sim/não
- Visual: 5 imagens (capa + 4 estilos), paleta escolhida de uma lista pronta, e uma das 3 combinações de fonte
- Textos: títulos e rótulos das 5 telas, já preenchidos com os valores padrão

*Aba Analytics*
- Cartões: Total de visualizações, Taxa de conclusão (%), Cliques no WhatsApp
- Distribuição percentual das respostas da Tela 4, em barras
- Tabela de histórico dos leads concluídos: data, estilo, queixas, objeção, momento e clique no WhatsApp
- Filtro por período (7 / 30 / 90 dias)

Paletas prontas: Marfim & Dourado (atual), Noir & Gold, Esmeralda Prestígio, Rosé & Areia.
Fontes: Cormorant + Karla, Playfair + Inter, Outfit + DM Sans.
Imagens: colar um link ou fazer upload pelo painel.

## Login

`/admin/login` com e-mail e senha. Só entra quem tem papel de administrador. Eu te oriento no passo a passo da criação da sua conta no primeiro acesso.

## Detalhes técnicos

- Ativar o Lovable Cloud (banco, autenticação, storage). Se falhar de novo, aviso e paro antes de mexer no código.
- Tabelas: `clinics` (slug único, nome, cidade, whatsapp, datas de contrato, `is_active`, `theme`, `fonts`, `images`, `copy` em JSON) e `user_roles` (papel `admin`, com função `has_role` usada nas políticas). GRANTs explícitos em toda tabela nova.
- Acesso: leitura pública somente das colunas necessárias e apenas de clínicas ativas e dentro do contrato; escrita restrita a administradores.
- Bucket de imagens para uploads do painel.
- `/c/$slug` carrega a clínica por server function pública e aplica tema, fonte e textos via variáveis CSS; o fluxo das 5 telas e o Mapa do Sorriso são componentes reaproveitados.
- Rotas do painel sob layout autenticado, com verificação de papel no servidor.
- Analytics: tabela `clinic_sessions` (clínica, início, conclusão, respostas em JSON, clique no WhatsApp, data). Registro anônimo, sem dados pessoais; escrita pública limitada à própria sessão, leitura só para administradores. Métricas por consulta agregada.
- Uma clínica de exemplo criada por migration para você ver funcionando de imediato.

## Fora de escopo agora

Login para as próprias clínicas, exportação de relatórios e cobrança automática.
