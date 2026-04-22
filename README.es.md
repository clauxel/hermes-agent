# Guía Para Desarrolladores De Hermes Agent

**Idiomas:** [English](README.md) | [简体中文](README.zh-CN.md) | [हिन्दी](README.hi.md) | **Español** | [العربية](README.ar.md) | [Français](README.fr.md) | [বাংলা](README.bn.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Referencia rápida orientada a desarrolladores para instalar, configurar y usar Hermes Agent correctamente.

Esta carpeta es una guía local curada de **Hermes Agent**. Las fuentes canónicas son el repositorio oficial de GitHub y la documentación oficial:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

Si algo en esta carpeta entra en conflicto con la documentación oficial o con `hermes --help`, confía en la documentación oficial y en tu CLI instalado.

## Qué Es Hermes Agent

Hermes Agent es un agente de IA self-hosted creado por Nous Research. Para la mayoría de desarrolladores, las capacidades más importantes son:

- CLI interactivo con herramientas, sesiones, checkpoints y salida en streaming
- Gateway multi-plataforma para Telegram, Discord, Slack, WhatsApp, Signal y más
- Toolsets integrados para web, archivos, shell, automatización del navegador, memoria, ejecución de código, cron, delegación y TTS
- Skills instalables y un Skills Hub
- Memoria persistente y archivos de contexto como `SOUL.md` y `AGENTS.md`
- Soporte MCP para conectar servidores de herramientas externos

## Inicio En 5 Minutos

```bash
# 1. Instala Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. Recarga tu shell
source ~/.bashrc
# o: source ~/.zshrc

# 3. Verifica la instalación
hermes doctor

# 4. Ejecuta la configuración inicial
hermes setup

# 5. Empieza a conversar
hermes
```

Nota para Windows:  
Windows nativo no está soportado. Usa WSL2.

## Comandos Que Los Desarrolladores Usan De Verdad

| Comando | Qué hace |
| --- | --- |
| `hermes` | Inicia el CLI interactivo |
| `hermes chat -q "Hello"` | Ejecuta una pregunta y sale |
| `hermes model` | Elige proveedor y modelo de forma interactiva |
| `hermes tools` | Explora o configura herramientas y toolsets habilitados |
| `hermes config show` | Inspecciona la configuración actual |
| `hermes doctor` | Ejecuta diagnósticos de instalación |
| `hermes sessions list` | Muestra las sesiones guardadas |
| `hermes skills browse` | Navega skills instalables |
| `hermes skills search react` | Busca en el Skills Hub |
| `hermes skills install openai/skills/k8s` | Instala una skill del hub |
| `hermes gateway setup` | Configura plataformas de mensajería |
| `hermes gateway run` | Ejecuta el gateway en primer plano |
| `hermes claw migrate` | Importa datos desde OpenClaw |

Nota sobre WSL:  
La documentación oficial recomienda `hermes gateway run` en lugar de `hermes gateway start` en WSL porque el soporte de systemd puede ser poco fiable.

## Estructura De Directorios Para Desarrolladores

Hermes guarda los datos del usuario en `~/.hermes/`:

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

Reglas rápidas:

- Guarda secretos como API keys y bot tokens en `~/.hermes/.env`
- Guarda configuración no sensible en `~/.hermes/config.yaml`
- Guarda memoria persistente en `~/.hermes/memories/`
- Guarda skills reutilizables en `~/.hermes/skills/`

## Checklist De Configuración Práctica

Como mínimo, conviene verificar:

1. Una provider key válida en `~/.hermes/.env`
2. Un modelo por defecto elegido con `hermes model`
3. Un terminal backend configurado en `~/.hermes/config.yaml`
4. Toolsets revisados con `hermes tools`
5. Archivos de contexto del proyecto como `AGENTS.md` o `.hermes.md`

Ejemplo de variables de entorno:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

Ejemplo de configuración del terminal:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills Y Herramientas

Hermes Agent soporta tanto capacidades integradas como skills instalables.

Comandos comunes de skills según la documentación oficial actual:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

Flujo común con herramientas:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Opciones Hosted Y De Un Clic

Toma esta tabla solo como referencia práctica. Para la instalación, configuración y setup canónicos, empieza por la documentación y el repositorio oficiales. Las opciones comunitarias y de marketplace pueden quedar desactualizadas respecto al repositorio principal.

| Plataforma | Enlace | Notas |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | Ruta canónica de instalación y setup; empieza aquí antes de usar un deploy hosted |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | Plantilla de plataforma third-party; verifica la configuración actual antes de lanzar |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | Flujo de despliegue vía marketplace; verifica frescura de imagen y configuración |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | Despliegue comunitario de un clic |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | Plantilla de Coolify mantenida por la comunidad |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | Opción third-party gestionada |

## Productos Comparables De AI Agent

Esta comparación sirve para orientarse rápidamente y no sustituye la documentación actual ni la página de precios de cada producto.

| # | Producto | Sitio web | Tipo | Self-Host | Plataformas de mensajería |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | Agente de IA self-hosted | Sí | Telegram, Discord, Slack, WhatsApp, Signal y más |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | Automatización de IA multicanal | Sí | Multi-plataforma |
| 3 | **GenericAgent** | [genericagent.org](https://www.genericagent.org/) | Espacio de trabajo de agente con navegador, terminal, sistema de archivos y control de memoria | No especificado | Espacio de trabajo web |
| 4 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | Agente autónomo + centro de mensajería | Sí | WhatsApp, Telegram, Slack, Discord, iMessage y más |
| 5 | **AutoGPT** | [agpt.co](https://agpt.co/) | Agente autónomo de tareas | Sí | API / web UI |
| 6 | **LangChain** | [langchain.com](https://www.langchain.com/) | Framework de orquestación LLM | Sí | Mediante integraciones personalizadas |
| 7 | **n8n** | [n8n.io](https://n8n.io/) | Automatización de flujos + nodos de IA | Sí | Slack, Telegram, Discord y muchas apps |
| 8 | **CrewAI** | [crewai.com](https://www.crewai.com/) | Colaboración multi-agente | Sí | API / integraciones personalizadas |
| 9 | **SuperAGI** | [superagi.com](https://superagi.com/) | Infraestructura para agentes autónomos | Sí | Slack, Email, API |

## Lee Estas Páginas Primero

- [Installation](guide/installation.md): instalación limpia y setup para contribuidores
- [Quickstart](guide/quickstart.md): primer chat, primer modelo y primeras skills
- [Configuration](guide/configuration.md): estructura de config, env keys y archivos de contexto
- [CLI Reference](reference/cli.md): comandos de alto valor para desarrolladores normales
- [Tools](features/tools.md): toolsets y terminal backends
- [Skills](features/skills.md): Skills Hub y skills locales
- [Memory](features/memory.md): memoria persistente y `SOUL.md`
- [Messaging](messaging/overview.md): setup del gateway y puntos de entrada por plataforma
- [Security](guide/security.md): approvals, pairing, sandboxing y seguridad de credenciales
- [Architecture](developer/architecture.md): estructura interna de Hermes Agent

## Fuentes Oficiales

- Repositorio oficial: <https://github.com/NousResearch/hermes-agent>
- Documentación oficial: <https://hermes-agent.nousresearch.com/docs/>
- Guía de contribución: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Guía de arquitectura: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- Referencia CLI: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
