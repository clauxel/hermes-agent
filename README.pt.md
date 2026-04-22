# Guia Para Desenvolvedores Do Hermes Agent

**Idiomas:** [English](README.md) | [简体中文](README.zh-CN.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [বাংলা](README.bn.md) | **Português** | [Русский](README.ru.md) | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Referência rápida voltada para desenvolvedores para instalar, configurar e usar o Hermes Agent corretamente.

Esta pasta é um guia local curado para **Hermes Agent**. As fontes canônicas são o repositório oficial no GitHub e a documentação oficial:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

Se algo nesta pasta entrar em conflito com a documentação oficial ou com `hermes --help`, confie na documentação oficial e no CLI instalado na sua máquina.

## O Que É O Hermes Agent

Hermes Agent é um agente de IA self-hosted criado pela Nous Research. Para desenvolvedores comuns, as capacidades mais importantes são:

- CLI interativo com tools, sessions, checkpoints e streaming output
- gateway multi-plataforma para Telegram, Discord, Slack, WhatsApp, Signal e mais
- toolsets embutidos para web, arquivos, shell, automação de navegador, memória, execução de código, cron, delegação e TTS
- skills instaláveis e um Skills Hub
- memória persistente e arquivos de contexto como `SOUL.md` e `AGENTS.md`
- suporte a MCP para conectar servidores de ferramentas externos

## Comece Em 5 Minutos

```bash
# 1. Instale o Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. Recarregue seu shell
source ~/.bashrc
# ou: source ~/.zshrc

# 3. Verifique a instalação
hermes doctor

# 4. Execute a configuração inicial
hermes setup

# 5. Comece a conversar
hermes
```

Nota para Windows:  
Windows nativo não é suportado. Use WSL2.

## Comandos Que Os Desenvolvedores Realmente Usam

| Comando | O que faz |
| --- | --- |
| `hermes` | Inicia o CLI interativo |
| `hermes chat -q "Hello"` | Executa uma pergunta e sai |
| `hermes model` | Escolhe provedor e modelo de forma interativa |
| `hermes tools` | Navega ou configura tools/toolsets habilitados |
| `hermes config show` | Inspeciona a configuração atual |
| `hermes doctor` | Executa diagnósticos de instalação |
| `hermes sessions list` | Mostra sessões salvas |
| `hermes skills browse` | Navega por skills instaláveis |
| `hermes skills search react` | Pesquisa no Skills Hub |
| `hermes skills install openai/skills/k8s` | Instala uma skill do hub |
| `hermes gateway setup` | Configura plataformas de mensageria |
| `hermes gateway run` | Executa o gateway em primeiro plano |
| `hermes claw migrate` | Importa dados do OpenClaw |

Nota sobre WSL:  
A documentação oficial recomenda `hermes gateway run` em vez de `hermes gateway start` no WSL, porque o suporte a systemd pode ser instável.

## Estrutura De Diretórios Para Desenvolvedores

O Hermes armazena dados do usuário em `~/.hermes/`:

```text
~/.hermes/
  config.yaml
  .env
  SOUL.md
  cron/
  sessions/
  logs/
  memories/
  skills/
```

Regra prática:

- coloque segredos como API keys e bot tokens em `~/.hermes/.env`
- coloque configurações não sensíveis em `~/.hermes/config.yaml`
- coloque memória persistente em `~/.hermes/memories/`
- coloque skills reutilizáveis em `~/.hermes/skills/`

## Checklist Prático De Configuração

No mínimo, verifique estes itens:

1. Uma provider key funcional em `~/.hermes/.env`
2. Um modelo padrão escolhido com `hermes model`
3. Um terminal backend configurado em `~/.hermes/config.yaml`
4. Toolsets revisados com `hermes tools`
5. Arquivos de contexto do projeto como `AGENTS.md` ou `.hermes.md`

Exemplo de chaves de ambiente:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

Exemplo de configuração do terminal:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills E Ferramentas

Hermes Agent suporta tanto capacidades embutidas quanto skills instaláveis.

Comandos comuns de skills na documentação oficial atual:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

Fluxo comum de ferramentas:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Opções Hosted E De Um Clique

Use esta tabela apenas como referência conveniente. Para instalação, setup e configuração canônicos, comece pelos links oficiais acima. Templates de comunidade e opções de marketplace podem estar atrás do repositório principal.

| Plataforma | Link | Notas |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | caminho canônico de instalação e setup; comece aqui antes de qualquer deploy hospedado |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | template de plataforma third-party; verifique as configurações atuais antes de lançar |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | fluxo de deploy via marketplace; verifique imagem e configuração |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | deploy comunitário de um clique |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | template Coolify mantido pela comunidade |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | opção third-party gerenciada |

## Produtos De AI Agent Comparáveis

Esta comparação serve apenas como orientação rápida e não substitui a documentação atual ou a página de preços de cada produto.

| # | Produto | Site | Tipo | Self-Host | Plataformas de Mensagem |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | agente de IA self-hosted | Sim | Telegram, Discord, Slack, WhatsApp, Signal e mais |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | automação de IA multicanal | Sim | Multi-plataforma |
| 3 | **GenericAgent** | [genericagent.org](https://www.genericagent.org/) | workspace de agente com navegador, terminal, sistema de arquivos e controle de memória | Não especificado | Workspace web |
| 4 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | agente autônomo + hub de mensageria | Sim | WhatsApp, Telegram, Slack, Discord, iMessage e mais |
| 5 | **AutoGPT** | [agpt.co](https://agpt.co/) | agente autônomo de tarefas | Sim | API / web UI |
| 6 | **LangChain** | [langchain.com](https://www.langchain.com/) | framework de orquestração LLM | Sim | Via integrações personalizadas |
| 7 | **n8n** | [n8n.io](https://n8n.io/) | automação de workflows + nós de IA | Sim | Slack, Telegram, Discord e muitos apps |
| 8 | **CrewAI** | [crewai.com](https://www.crewai.com/) | colaboração multiagente | Sim | API / integrações personalizadas |
| 9 | **SuperAGI** | [superagi.com](https://superagi.com/) | infraestrutura para agentes autônomos | Sim | Slack, Email, API |

## Leia Estas Páginas Primeiro

- [Installation](guide/installation.md): instalação limpa e setup de contribuidores
- [Quickstart](guide/quickstart.md): primeiro chat, primeiro modelo e primeira skill
- [Configuration](guide/configuration.md): layout de config, env keys e arquivos de contexto
- [CLI Reference](reference/cli.md): comandos de alto valor para desenvolvedores comuns
- [Tools](features/tools.md): toolsets e terminal backends
- [Skills](features/skills.md): Skills Hub e skills locais
- [Memory](features/memory.md): memória persistente e `SOUL.md`
- [Messaging](messaging/overview.md): setup do gateway e pontos de entrada por plataforma
- [Security](guide/security.md): approvals, pairing, sandboxing e segurança de credenciais
- [Architecture](developer/architecture.md): estrutura interna do Hermes Agent

## Fontes Oficiais

- Repositório oficial: <https://github.com/NousResearch/hermes-agent>
- Documentação oficial: <https://hermes-agent.nousresearch.com/docs/>
- Guia de contribuição: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Guia de arquitetura: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- Referência CLI: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
