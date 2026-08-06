# Multi-clínica: link próprio, WhatsApp próprio e painel administrativo

O app deixa de ser uma página única e passa a atender várias clínicas, cada uma com seu link para usar em anúncios, seu WhatsApp e sua personalização visual. Você administra tudo por um painel com login.

Isso substitui o plano anterior de arquivos de configuração: as imagens, textos, cores e fontes passam a ser editados no painel, por clínica.

## Como fica na prática

```text
/                      -> página institucional simples do produto
/c/clinica-sorriso     -> experiência da clínica (link dos anúncios)
/admin/login           -> seu login
/admin                 -> lista de clínicas
/admin/clinicas/nova   -> cadastro
/admin/clinicas/:id    -> edição (dados, contrato, visual, WhatsApp)
```

## Hierarquia das 5 telas

O fluxo segue uma progressão psicológica clara: **desejo → problema → objeção → decisão → resultado**. Cada tela tem uma única pergunta, poucas opções, cards verticais e nenhuma rolagem horizontal.

1. **Tela 1 — Estilo do sorriso (Desejo)**  
   Pergunta: "Qual sorriso mais te inspira hoje?"  
   Layout: grid 2x2 com cards visuais (imagem + rótulo).  
   Estilos: Natural, Rejuvenescido, Amplo, Hollywood.  
   Adicionar opção "Não tenho certeza — quero orientação" para reduzir abandono.  
   Baixa fricção: escolha visual e aspiracional.

2. **Tela 2 — O que te incomoda (Problema)**  
   Pergunta: "O que mais te incomoda no seu sorriso hoje?"  
   Até 2 seleções.  
   Opções: cor, formato, espaços, tamanho, alinhamento.  
   Média fricção: leve toque pessoal, sem diagnóstico.

3. **Tela 3 — Segurança (Objeção)**  
   Pergunta: "O que mais te faz hesitar em dar esse passo?"  
   5 opções em radio button (única escolha).  
   Opções: resultado parece artificial, medo de desgaste, medo de dor, investimento, tempo de tratamento.  
   Função educativa: pausa de tranquilidade antes da decisão.

4. **Tela 4 — Momento (Decisão)**  
   Pergunta: "Qual é seu momento hoje?"  
   Opções: "Quero ser atendido(a) agora", "Quero agendar uma avaliação", "Quero entender valores antes", "Estou comparando possibilidades", "Tenho vontade, mas ainda tenho receios", "Quero apenas aprender por enquanto".  
   Cada opção mapeia para uma mensagem de WhatsApp diferente no CTA final.

5. **Tela 5 — Mapa do Sorriso (Resultado)**  
   Exibe o perfil gerado com base nas escolhas.  
   Bloco educativo sobre qualidade do tratamento.  
   CTA WhatsApp com texto e mensagem preenchida conforme a Tela 4.

## Matriz de lógica do Mapa do Sorriso

O resultado deixa de ser texto genérico e passa a ser montado por cruzamento das respostas.

**1. Título do perfil (vem da Tela 1)**

| Estilo | Perfil exibido |
| --- | --- |
| Natural | Harmonização Discreta & Anatomicamente Preservada |
| Rejuvenescido | Luminosidade Jovem & Realce de Cor |
| Amplo | Simetria Facial & Preenchimento de Corredor Bucal |
| Hollywood | Design Ultra-Radiante & Alta Expressão Estética |
| Não tenho certeza | Mapeamento Personalizado em Consulta |

**2. Pilares recomendados (vêm da Tela 2)**

Cada queixa marcada injeta um pilar técnico. Sempre exibimos 3 pilares: os das queixas escolhidas (até 2) e, completando, o pilar base "Protocolo Digital com Mock-up Prévio".

| Queixa | Pilar |
| --- | --- |
| Cor amarelada / manchas | Tecnologia de Cor Estável — laminados de alta opalescência que bloqueiam o fundo escuro e não amarelam |
| Formato / desgaste | Planejamento Aditivo — recupera volume e proporção sem desgaste desnecessário de estrutura sadia |
| Espaços / alinhamento | Fechamento Proporcional — redesenho da largura dos dentes mantendo a proporção do sorriso |
| Excesso de gengiva | Arquitetura Gengival Integrada — alinhamento do contorno gengival para valorizar o tamanho das facetas |

**3. Nota de segurança (vem da Tela 3)**

| Objeção | Nota exibida |
| --- | --- |
| Medo de desgaste | Seu perfil é elegível para lentes ultrafinas de mínimo desgaste biológico |
| Resultado artificial | Seu planejamento prevê Mock-up (teste do sorriso no rosto) antes de qualquer procedimento definitivo |
| Dor / sensibilidade | Protocolo de execução rápida e minimamente invasiva, sem desconforto durante as sessões |
| Investimento | Simulação de condições facilitadas e parcelamento apresentadas na avaliação |
| Tempo de tratamento | Cronograma reduzido, com etapas concentradas em poucas sessões |

**4. Mensagem do WhatsApp**

Montada com perfil + queixa principal + objeção + intenção da Tela 4, para o atendente receber o lead já qualificado. Exemplo:
"Olá! Concluí meu Mapa do Sorriso no site. Meu perfil deu 'Harmonização Discreta' e minha principal dúvida é sobre investimento. Gostaria de agendar uma avaliação."

O texto do botão também varia pela Tela 4 (agendar / valores / comparar / pesquisar).

Todas as frases seguem as regras clínicas já definidas: sem diagnóstico, sem promessa de resultado, autoridade final é o dentista. Os textos da matriz ficam editáveis no painel por clínica.



## Painel administrativo

Lista de clínicas com: nome, link, status (ativo/inativo/vencido), início e fim de contrato, e botão de ativar/desativar. Ações: criar, editar, copiar o link pronto para o anúncio.

Ficha de cada clínica (`/admin/clinicas/:id`), em abas:

**Aba Dados**
- **Identificação**: nome, slug do link, cidade, logo
- **Contato**: número de WhatsApp e, opcionalmente, o texto base da mensagem
- **Contrato**: data inicial, data final, ativo sim/não
- **Visual**: 5 imagens (capa + 4 estilos), paleta de cores escolhida de uma lista pronta, e uma das 3 fontes
- **Textos**: títulos, subtítulos e rótulos das 5 telas (Desejo, Problema, Segurança, Momento, Resultado), com valores padrão preenchidos automaticamente para não precisar escrever tudo

**Aba Analytics**
- Cartões de métricas: Total de visualizações, Taxa de conclusão (%), Cliques no WhatsApp
- Distribuição percentual das respostas da Tela 4 (Quero agendar / Planejando custos / Comparando clínicas / Apenas pesquisando), em barras horizontais
- Tabela de histórico das respostas concluídas: data, estilo escolhido, queixas, objeção, momento e se clicou no WhatsApp
- Filtro simples por período (7 / 30 / 90 dias)

Paletas prontas: Marfim & Dourado (atual), Noir & Gold, Esmeralda Prestígio, Rosé & Areia.
Fontes: Cormorant + Karla, Playfair + Inter, Outfit + DM Sans.

Imagens: pode colar um link (mais rápido e barato) ou fazer upload pelo painel.


## Login

Página `/admin/login` com e-mail e senha. Somente contas marcadas como administrador entram no painel. A criação da sua conta acontece no primeiro acesso e eu te oriento no passo a passo.

## Detalhes técnicos

- Ativar o Lovable Cloud (banco, autenticação e armazenamento de imagens).
- Tabelas: `clinics` (slug único, nome, cidade, whatsapp, datas de contrato, `is_active`, `theme`, `fonts`, `images` e `copy` em JSON) e `user_roles` (papel `admin`, separado do perfil, com função `has_role` para as políticas de acesso).
- Políticas de acesso: leitura pública apenas das colunas necessárias e somente de clínicas ativas e dentro do contrato; escrita restrita a administradores.
- Bucket de imagens para uploads do painel.
- Rota pública `/c/$slug` carrega a clínica no servidor e aplica tema, fonte e textos via variáveis CSS; a lógica do fluxo de 5 telas e o Mapa do Sorriso permanecem exatamente como estão. Clínica inativa ou com contrato vencido mostra "Esta página está temporariamente indisponível".
- CTA final monta o link do WhatsApp com o número da clínica, mantendo a mensagem dinâmica por momento de decisão.
- Rotas do painel protegidas por login + verificação de papel no servidor.
- Analytics: tabela `clinic_sessions` (clínica, início, conclusão, respostas das 4 telas em JSON, clique no WhatsApp, data). Registro anônimo, sem dados pessoais. Escrita pública restrita a inserir/atualizar a própria sessão; leitura somente para administradores. As métricas do painel são calculadas por consulta agregada.
- Uma clínica de exemplo já cadastrada para você ver funcionando de imediato.

## Fora de escopo agora

Login para as próprias clínicas, exportação de relatórios e cobrança automática. Dá para adicionar depois sobre essa mesma base.
