# Panduan Pengembang Hermes Agent

**Bahasa:** [English](README.md) | [简体中文](README.zh-CN.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [العربية](README.ar.md) | [Français](README.fr.md) | [বাংলা](README.bn.md) | [Português](README.pt.md) | [Русский](README.ru.md) | **Bahasa Indonesia**

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> Referensi cepat yang berfokus pada developer untuk memasang, mengonfigurasi, dan menggunakan Hermes Agent dengan benar.

Folder ini adalah panduan lokal terkurasi untuk **Hermes Agent**. Sumber kanonisnya adalah repositori GitHub resmi dan dokumentasi resmi:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

Jika ada isi folder ini yang bertentangan dengan dokumentasi resmi atau `hermes --help`, ikuti dokumentasi resmi dan CLI yang terpasang di mesin Anda.

## Apa Itu Hermes Agent

Hermes Agent adalah AI agent self-hosted buatan Nous Research. Bagi developer biasa, kemampuan yang paling penting adalah:

- CLI interaktif dengan tools, sessions, checkpoints, dan streaming output
- gateway multi-platform untuk Telegram, Discord, Slack, WhatsApp, Signal, dan lainnya
- built-in toolsets untuk web, file, shell, browser automation, memory, code execution, cron, delegation, dan TTS
- skills yang bisa diinstal dan Skills Hub
- memori persisten serta file konteks seperti `SOUL.md` dan `AGENTS.md`
- dukungan MCP untuk menghubungkan server tools eksternal

## Mulai Dalam 5 Menit

```bash
# 1. Pasang Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. Muat ulang shell Anda
source ~/.bashrc
# atau: source ~/.zshrc

# 3. Verifikasi instalasi
hermes doctor

# 4. Jalankan setup pertama
hermes setup

# 5. Mulai chat
hermes
```

Catatan Windows:  
Windows native tidak didukung. Gunakan WSL2.

## Perintah Yang Benar-Benar Dipakai Developer

| Perintah | Fungsi |
| --- | --- |
| `hermes` | Memulai CLI interaktif |
| `hermes chat -q "Hello"` | Menjalankan satu pertanyaan lalu keluar |
| `hermes model` | Memilih provider dan model secara interaktif |
| `hermes tools` | Menjelajah atau mengonfigurasi tools/toolsets yang aktif |
| `hermes config show` | Memeriksa konfigurasi saat ini |
| `hermes doctor` | Menjalankan diagnostik instalasi |
| `hermes sessions list` | Melihat sesi yang tersimpan |
| `hermes skills browse` | Menjelajah skills yang bisa diinstal |
| `hermes skills search react` | Mencari di Skills Hub |
| `hermes skills install openai/skills/k8s` | Menginstal skill dari hub |
| `hermes gateway setup` | Mengonfigurasi platform pesan |
| `hermes gateway run` | Menjalankan gateway di foreground |
| `hermes claw migrate` | Mengimpor data dari OpenClaw |

Catatan WSL:  
Dokumentasi resmi menyarankan `hermes gateway run` daripada `hermes gateway start` di WSL karena dukungan systemd bisa tidak stabil.

## Struktur Direktori Untuk Developer

Hermes menyimpan data pengguna di `~/.hermes/`:

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

Aturan praktis:

- simpan secret seperti API key dan bot token di `~/.hermes/.env`
- simpan pengaturan runtime yang tidak sensitif di `~/.hermes/config.yaml`
- simpan memori jangka panjang di `~/.hermes/memories/`
- simpan skills yang bisa dipakai ulang di `~/.hermes/skills/`

## Checklist Konfigurasi Praktis

Minimal, pastikan hal-hal berikut:

1. Ada provider key yang berfungsi di `~/.hermes/.env`
2. Model default sudah dipilih dengan `hermes model`
3. Terminal backend sudah diatur di `~/.hermes/config.yaml`
4. Toolsets sudah ditinjau lewat `hermes tools`
5. Ada file konteks proyek seperti `AGENTS.md` atau `.hermes.md`

Contoh env keys:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

Contoh konfigurasi terminal:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## Skills Dan Tooling

Hermes Agent mendukung kemampuan bawaan maupun skills yang dapat diinstal.

Perintah skills umum dari dokumentasi resmi saat ini:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

Workflow tools yang umum:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## Opsi Hosted Dan One-Click

Anggap tabel ini hanya sebagai referensi tambahan. Untuk jalur instalasi, setup, dan konfigurasi yang kanonis, mulai dari repo dan docs resmi di atas. Template komunitas dan opsi marketplace bisa tertinggal dari repo utama.

| Platform | Tautan | Catatan |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | jalur instalasi dan setup yang kanonis; mulai dari sini sebelum deploy hosted apa pun |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | template platform pihak ketiga; verifikasi pengaturan terbaru sebelum launch |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | alur deployment via marketplace; cek kesegaran image dan config |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | deployment komunitas satu klik |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | template Coolify yang dikelola komunitas |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | opsi deployment pihak ketiga yang dikelola |

## Produk AI Agent Yang Sebanding

Tabel perbandingan ini hanya untuk orientasi cepat dan bukan pengganti dokumentasi terbaru atau halaman harga masing-masing produk.

| # | Produk | Situs | Tipe | Self-Host | Platform Messaging |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | self-hosted AI agent | Ya | Telegram, Discord, Slack, WhatsApp, Signal, dan lainnya |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | multi-channel AI automation | Ya | Multi-platform |
| 3 | **GenericAgent** | [genericagent.org](https://www.genericagent.org/) | workspace agent dengan browser, terminal, filesystem, dan kontrol memori | Tidak disebutkan | Workspace web |
| 4 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | autonomous agent + messaging hub | Ya | WhatsApp, Telegram, Slack, Discord, iMessage, dan lainnya |
| 5 | **AutoGPT** | [agpt.co](https://agpt.co/) | autonomous task agent | Ya | API / web UI |
| 6 | **LangChain** | [langchain.com](https://www.langchain.com/) | framework orkestrasi LLM | Ya | Melalui integrasi kustom |
| 7 | **n8n** | [n8n.io](https://n8n.io/) | workflow automation + AI nodes | Ya | Slack, Telegram, Discord, dan banyak aplikasi |
| 8 | **CrewAI** | [crewai.com](https://www.crewai.com/) | kolaborasi multi-agent | Ya | API / integrasi kustom |
| 9 | **SuperAGI** | [superagi.com](https://superagi.com/) | infrastruktur agent otonom | Ya | Slack, Email, API |

## Baca Halaman Ini Lebih Dulu

- [Installation](guide/installation.md): clean install dan contributor setup
- [Quickstart](guide/quickstart.md): chat pertama, model pertama, skill pertama
- [Configuration](guide/configuration.md): layout config, env keys, file konteks
- [CLI Reference](reference/cli.md): perintah bernilai tinggi untuk developer biasa
- [Tools](features/tools.md): toolsets dan terminal backends
- [Skills](features/skills.md): Skills Hub dan skill lokal
- [Memory](features/memory.md): memori persisten dan `SOUL.md`
- [Messaging](messaging/overview.md): setup gateway dan titik masuk platform
- [Security](guide/security.md): approvals, pairing, sandboxing, dan keamanan kredensial
- [Architecture](developer/architecture.md): struktur internal Hermes Agent

## Sumber Resmi

- Repo resmi: <https://github.com/NousResearch/hermes-agent>
- Docs resmi: <https://hermes-agent.nousresearch.com/docs/>
- Panduan kontribusi: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- Panduan arsitektur: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- Referensi CLI: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
