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

## 11. Tela 5 — Mapa de Transformação (nova linguagem)

A Tela 5 deixa de ser técnica e passa a ser inspiradora, positiva e focada em transformação pessoal — sem diagnóstico e sem promessa de resultado.

**Nova estrutura da tela**
1. **Cabeçalho aspiracional** — "Seu Mapa de Transformação do Sorriso está pronto!" + nome elegante do perfil.
2. **A sua jornada de mudança** — resumo motivador que costura estilo escolhido, queixas e receio, em linguagem emocional.
3. **Por que dar este passo transforma sua vida** — bloco fixo de impacto na autoestima, confiança, presença pessoal e profissional.
4. **O protocolo exclusivo da clínica** — três pilares: visão artística e proporção áurea; tecnologia guiada de mínima intervenção; previsibilidade total (teste do sorriso antes de iniciar).
5. **Tranquilização positiva** — o receio marcado na Tela 3 vira mensagem de segurança sobre métodos modernos e confortáveis conduzidos pelo cirurgião-dentista.
6. **Nota de autoridade** — a avaliação presencial com o especialista é onde arte e odontologia definem o plano definitivo.
7. **CTA WhatsApp** — "Agendar Minha Avaliação no WhatsApp", com mensagem dinâmica pelo momento da Tela 4.

**Títulos de perfil aspiracionais**

| Estilo | Novo título |
| --- | --- |
| Natural | Harmonia Invisível & Elegância Discreta |
| Rejuvenescido | Luminosidade Jovem & Vitalidade Facial |
| Amplo | Presença Marcante & Equilíbrio Facial |
| Hollywood | Presença Marcante & Alta Expressão Estética |
| Não tenho certeza | Descoberta Personalizada do Seu Estilo |

**Objeções reescritas em tom positivo** — nada de "desgaste biológico" ou jargão clínico; cada receio vira uma frase de tranquilidade sobre técnicas modernas, mínimas e confortáveis conduzidas pelo especialista.

O nome da clínica é interpolado nos blocos ("O protocolo exclusivo da [clínica]"), e todos os textos continuam editáveis no painel.

## 12. Métricas confiáveis e origem do tráfego

- A sessão só é criada na **primeira interação real** do visitante (não no carregamento), eliminando bots e visitas próprias da contagem.
- Captura de `utm_source`, `utm_medium` e `utm_campaign` do link do anúncio, com quebra por origem no analytics da clínica.

## 13. Alertas de contrato e link amigável

- Destaque no painel para contratos **vencendo em até 15 dias**, **vencidos** e **ainda não iniciados**.
- Verificação de disponibilidade do link enquanto digita, com sugestão automática quando o slug já existir (sem erro técnico do banco).

## 14. QR code e duplicar clínica

- Botão "QR code" gera o código do link da clínica para uso em material impresso e stories, com download em PNG.
- Botão "Duplicar" cria uma nova clínica copiando paleta, fontes, imagens e textos — só nome, link e WhatsApp precisam ser preenchidos.

## 15. Captura opcional de contato antes do CTA

Na Tela 5, antes do botão de WhatsApp, um bloco discreto e opcional pede nome e telefone ("para a clínica guardar seu mapa"). Se preenchido, o lead fica registrado mesmo que a pessoa não envie a mensagem, e aparece no histórico e no PDF. Nunca bloqueia o acesso ao resultado.

---



## Detalhes técnicos

- **Banco**: novas colunas em `clinics` — `contract_value` (numeric, valor da nossa venda) e `sale_date` (data da venda/assinatura); em `clinic_sessions` — `funnel_step` (smallint), `utm_source`/`utm_medium`/`utm_campaign` (text) e `lead_name`/`lead_phone` (text, opcionais); GRANTs mantidos.
- **Gargalo**: `SmileQuiz` passa a gravar `funnel_step` a cada avanço via `updateSession`; o painel agrega a maior queda entre telas.
- **Novas server functions**: `getDashboardOverview` (agregados globais por período) e extensão de `getClinicAnalytics` com dados do funil.
- **UI**: `ClinicForm` reorganizado em blocos por etapa + `ClinicPreview` (reaproveita `SmileQuiz` em modo somente leitura dentro de um mock 430px). Máscara de telefone em util própria em `src/lib/phone.ts`.
- **PDF**: gerado no cliente com `jspdf` + `jspdf-autotable`.
- **Fonte**: Instrument Sans carregada via `<link>` no `__root.tsx` e aplicada por uma classe de layout do admin, sem tocar nos tokens do quiz.
