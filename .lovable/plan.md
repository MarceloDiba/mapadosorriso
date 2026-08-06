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
- Rota pública `/c/$slug` carrega a clínica no servidor e aplica tema, fonte e textos via variáveis CSS; a lógica do fluxo de 5 telas e o Mapa do Sorriso permanecem exatamente como estão.
- CTA final monta o link do WhatsApp com o número da clínica, mantendo a mensagem dinâmica por momento de decisão.
- Rotas do painel protegidas por login + verificação de papel no servidor.
- Uma clínica de exemplo já cadastrada para você ver funcionando de imediato.

## Fora de escopo agora

Login para as próprias clínicas, métricas/relatórios de leads por clínica e cobrança automática. Dá para adicionar depois sobre essa mesma base.
