# Guide Développeur Hermes Agent

**Langues :** [English](README.md) | [简体中文](README.zh-CN.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [العربية](README.ar.md) | **Français** | [বাংলা](README.bn.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Référence rapide orientée développeur pour installer, configurer et utiliser Hermes Agent correctement.

Ce dossier est un guide local organisé pour **Hermes Agent**. Les sources canoniques sont le dépôt GitHub officiel et la documentation officielle :

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

Si quelque chose ici contredit la documentation officielle ou `hermes --help`, faites confiance à la documentation officielle et à votre CLI installé.

## Qu'est-ce Que Hermes Agent

Hermes Agent est un agent IA auto-hébergé créé par Nous Research. Pour un développeur classique, les capacités les plus importantes sont :

- un CLI interactif avec outils, sessions, checkpoints et sortie en streaming
- une gateway multi-plateforme pour Telegram, Discord, Slack, WhatsApp, Signal et plus
- des toolsets intégrés pour le web, les fichiers, le shell, l'automatisation du navigateur, la mémoire, l'exécution de code, cron, la délégation et le TTS
- des skills installables et un Skills Hub
- une mémoire persistante et des fichiers de contexte comme `SOUL.md` et `AGENTS.md`
- le support MCP pour connecter des serveurs d'outils externes

## Démarrage En 5 Minutes

```bash
# 1. Installer Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. Recharger votre shell
source ~/.bashrc
# ou : source ~/.zshrc

# 3. Vérifier l'installation
hermes doctor

# 4. Lancer la configuration initiale
hermes setup

# 5. Commencer à dialoguer
hermes
```

Note Windows :  
Windows natif n'est pas pris en charge. Utilisez WSL2.

## Commandes Réellement Utiles Aux Développeurs

| Commande | Usage |
| --- | --- |
| `hermes` | Démarrer le CLI interactif |
| `hermes chat -q "Hello"` | Poser une question unique puis quitter |
| `hermes model` | Choisir fournisseur et modèle de façon interactive |
| `hermes tools` | Parcourir ou configurer les outils et toolsets activés |
| `hermes config show` | Inspecter la configuration courante |
| `hermes doctor` | Lancer les diagnostics d'installation |
| `hermes sessions list` | Voir les sessions sauvegardées |
| `hermes skills browse` | Parcourir les skills installables |
| `hermes skills search react` | Rechercher dans le Skills Hub |
| `hermes skills install openai/skills/k8s` | Installer une skill du hub |
| `hermes gateway setup` | Configurer les plateformes de messagerie |
| `hermes gateway run` | Lancer la gateway au premier plan |
| `hermes claw migrate` | Importer les données depuis OpenClaw |

Note WSL :  
La documentation officielle recommande `hermes gateway run` au lieu de `hermes gateway start` sous WSL, car le support systemd peut être peu fiable.

## Arborescence Orientée Développeur

Hermes stocke les données utilisateur dans `~/.hermes/` :

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

Règle pratique :

- placez les secrets comme les API keys et les bot tokens dans `~/.hermes/.env`
- placez les réglages non sensibles dans `~/.hermes/config.yaml`
- placez la mémoire durable dans `~/.hermes/memories/`
- placez les skills réutilisables dans `~/.hermes/skills/`

## Checklist De Configuration Pratique

Au minimum, vérifiez les points suivants :

1. une provider key valide dans `~/.hermes/.env`
2. un modèle par défaut choisi avec `hermes model`
3. un terminal backend défini dans `~/.hermes/config.yaml`
4. des toolsets passés en revue avec `hermes tools`
5. des fichiers de contexte projet comme `AGENTS.md` ou `.hermes.md`

Exemples de clés d'environnement :

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

Exemple de configuration terminal :

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills Et Outils

Hermes Agent prend en charge les capacités intégrées et les skills installables.

Commandes de skills courantes selon la documentation officielle actuelle :

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

Flux d'outils courant :

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Options Hébergées Et Déploiements En Un Clic

Considérez ce tableau comme une simple référence pratique. Pour l'installation, la configuration et le setup canoniques, commencez par la documentation et le dépôt officiels ci-dessus. Les options communautaires et marketplace peuvent être en retard sur le dépôt principal.

| Plateforme | Lien | Notes |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | chemin canonique d'installation et de setup ; commencez ici avant tout déploiement hébergé |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | template tiers ; vérifiez les réglages actuels avant le lancement |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | déploiement via marketplace ; vérifiez la fraîcheur de l'image et de la config |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | déploiement communautaire en un clic |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | template Coolify maintenu par la communauté |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | option tierce gérée |

## Produits AI Agent Comparables

Ce tableau sert d'aide d'orientation rapide et ne remplace pas la documentation actuelle ni la page tarifaire de chaque produit.

| # | Produit | Site | Type | Self-Host | Plateformes de messagerie |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | agent IA auto-hébergé | Oui | Telegram, Discord, Slack, WhatsApp, Signal et plus |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | automatisation IA multicanale | Oui | Multi-plateforme |
| 3 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | agent autonome + hub de messagerie | Oui | WhatsApp, Telegram, Slack, Discord, iMessage et plus |
| 4 | **AutoGPT** | [agpt.co](https://agpt.co/) | agent autonome de tâches | Oui | API / Web UI |
| 5 | **LangChain** | [langchain.com](https://www.langchain.com/) | framework d'orchestration LLM | Oui | Via intégrations personnalisées |
| 6 | **n8n** | [n8n.io](https://n8n.io/) | automatisation de workflows + nœuds IA | Oui | Slack, Telegram, Discord et de nombreuses apps |
| 7 | **CrewAI** | [crewai.com](https://www.crewai.com/) | collaboration multi-agent | Oui | API / intégrations personnalisées |
| 8 | **SuperAGI** | [superagi.com](https://superagi.com/) | infrastructure d'agents autonomes | Oui | Slack, Email, API |

## Lisez D'abord Ces Pages

- [Installation](guide/installation.md): installation propre et setup contributeur
- [Quickstart](guide/quickstart.md): premier chat, premier modèle, première skill
- [Configuration](guide/configuration.md): structure de config, env keys, fichiers de contexte
- [CLI Reference](reference/cli.md): commandes à forte valeur pour les développeurs ordinaires
- [Tools](features/tools.md): toolsets et backends de terminal
- [Skills](features/skills.md): Skills Hub et skills locales
- [Memory](features/memory.md): mémoire persistante et `SOUL.md`
- [Messaging](messaging/overview.md): setup de la gateway et points d'entrée par plateforme
- [Security](guide/security.md): approvals, pairing, sandboxing et sécurité des identifiants
- [Architecture](developer/architecture.md): structure interne de Hermes Agent

## Sources Officielles

- Dépôt officiel : <https://github.com/NousResearch/hermes-agent>
- Documentation officielle : <https://hermes-agent.nousresearch.com/docs/>
- Guide de contribution : <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Guide d'architecture : <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- Référence CLI : <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
