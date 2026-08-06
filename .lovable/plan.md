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

Se o link estiver desativado ou o contrato vencido, a página da clínica mostra um aviso neutro em vez do fluxo.

## Painel administrativo

Lista de clínicas com: nome, link, status (ativo/inativo/vencido), início e fim de contrato, e botão de ativar/desativar. Ações: criar, editar, copiar o link pronto para o anúncio.

Ficha de cada clínica:
- **Identificação**: nome, slug do link, cidade
- **Contato**: número de WhatsApp e, opcionalmente, o texto base da mensagem
- **Contrato**: data inicial, data final, ativo sim/não
- **Visual**: 5 imagens (capa + 4 estilos), paleta de cores escolhida de uma lista pronta, e uma das 3 fontes
- **Textos**: títulos, subtítulos e rótulos das 5 telas, com valores padrão preenchidos automaticamente para não precisar escrever tudo

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
