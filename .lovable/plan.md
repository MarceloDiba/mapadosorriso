# Painel NOA Lead Smile — correções e evolução

## 1. O link da clínica nova não abre (causa confirmada)

A clínica "Innove Dental Concept" (`/c/innove-dental`) está com **início de contrato em 10/08/2026** — data futura. A página só libera o link dentro da vigência, então mostra "temporariamente indisponível". O WhatsApp também ficou com números inválidos (`799912949430954835`).

Correções:
- No formulário, mostrar aviso claro quando a data de início for futura: "Este link só abrirá a partir de dd/mm" — com opção de começar hoje.
- Na lista de clínicas, status "Agendado" (em vez de parecer ativo) para contratos que ainda não começaram.
- A tela pública ganha mensagens distintas para: link inexistente, contrato ainda não iniciado, contrato encerrado e clínica desativada.
- Validação de WhatsApp mais rígida (10–13 dígitos com DDI/DDD).

## 2. Campo de WhatsApp mais claro + máscara

- Ícone do WhatsApp no campo, rótulo "WhatsApp da clínica" e exemplo visível.
- Máscara automática enquanto digita: `+55 (11) 99999-9999`. Salva só números.
- Botão "Testar número" que abre a conversa para conferência.

## 3. Pré-visualização visual das configurações

Na aba Configurações, painel de preview ao lado (ou abaixo, no celular) mostrando a tela do paciente em um mock de celular, atualizando em tempo real paleta, fontes, imagens e textos. Botão "Ver em tela cheia" abre o link real.

## 4. Imagens com miniatura + botão alterar

Cada slot de imagem passa a exibir a imagem atual (a padrão quando vazio) com botão "Alterar". Ao clicar, abre o campo para colar a URL, com "Salvar" / "Voltar ao padrão". Sem URL exposta o tempo todo.

## 5. Imagem + texto juntos por etapa, com padrão preenchido

As seções separadas "Imagens" e "Textos" viram **blocos por etapa**: Capa, Tela 1 (Estilos), Tela 2, Tela 3, Tela 4, Resultado. Cada bloco reúne a imagem e os textos daquela etapa. Os campos vêm preenchidos com o texto padrão (hoje aparece só como placeholder), continuando editáveis.

## 6. Exportar relatório em PDF

Botão "Exportar PDF" na aba Analytics: cabeçalho com nome da clínica e período, cartões de métricas, distribuição de momento de decisão, gargalo do funil e tabela de leads.

## 7. Depois de criar a clínica, ir para Analytics

Ao salvar uma clínica nova, o painel abre a ficha já na aba **Analytics**, com um aviso amigável quando ainda não há dados e o link pronto para copiar.

## 8. Painel central (visão geral)

Nova área no topo de `/admin`:
- **Clínicas ativas** (e quantas agendadas / vencidas)
- **Cliques no WhatsApp** no período
- **Mapas finalizados** e taxa de conclusão
- **Etapa de maior gargalo** — em qual das 5 telas as pessoas mais param
- **Vendas no período** e **valor total** — controle das nossas vendas da aplicação, a partir do valor de contrato cadastrado em cada clínica
- Filtro de período (7 / 30 / 90 dias) para todos os números

## 9. Busca e WhatsApp na lista de clínicas

- Campo de busca por nome, cidade ou link, com filtro por status.
- Botão de WhatsApp em cada clínica para falar direto com o contato dela.

## 10. Fonte do login e do painel

Login e área administrativa passam a usar **Instrument Sans** (interface neutra e legível). A experiência do paciente (`/c/:slug`) mantém a identidade premium atual, sem alteração.

---

## Detalhes técnicos

- **Banco**: novas colunas em `clinics` — `contract_value` (numeric, valor da nossa venda) e `sale_date` (data da venda/assinatura); `funnel_step` (smallint) em `clinic_sessions` para registrar a última tela alcançada; GRANTs mantidos.
- **Gargalo**: `SmileQuiz` passa a gravar `funnel_step` a cada avanço via `updateSession`; o painel agrega a maior queda entre telas.
- **Novas server functions**: `getDashboardOverview` (agregados globais por período) e extensão de `getClinicAnalytics` com dados do funil.
- **UI**: `ClinicForm` reorganizado em blocos por etapa + `ClinicPreview` (reaproveita `SmileQuiz` em modo somente leitura dentro de um mock 430px). Máscara de telefone em util própria em `src/lib/phone.ts`.
- **PDF**: gerado no cliente com `jspdf` + `jspdf-autotable`.
- **Fonte**: Instrument Sans carregada via `<link>` no `__root.tsx` e aplicada por uma classe de layout do admin, sem tocar nos tokens do quiz.
