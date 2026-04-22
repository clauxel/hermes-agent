# دليل المطورين لـ Hermes Agent

**اللغات:** [English](README.md) | [简体中文](README.zh-CN.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | **العربية** | [Français](README.fr.md) | [বাংলা](README.bn.md) | [Português](README.pt.md) | [Русский](README.ru.md) | [Bahasa Indonesia](README.id.md)

[![Stars](https://img.shields.io/github/stars/NousResearch/hermes-agent?style=flat&logo=github&label=Stars&color=gold)](https://github.com/NousResearch/hermes-agent/stargazers)
[![Forks](https://img.shields.io/github/forks/NousResearch/hermes-agent?style=flat&label=Forks&color=silver)](https://github.com/NousResearch/hermes-agent/network/members)
[![Contributors](https://img.shields.io/github/contributors/NousResearch/hermes-agent?label=Contributors&color=green)](https://github.com/NousResearch/hermes-agent/graphs/contributors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE)

> مرجع سريع موجّه للمطورين لتثبيت Hermes Agent وإعداده واستخدامه بشكل صحيح.

هذا المجلد هو دليل محلي منسق لـ **Hermes Agent**. المصادر الرسمية الأساسية هي مستودع GitHub الرسمي والوثائق الرسمية:

- GitHub: <https://github.com/NousResearch/hermes-agent>
- Docs: <https://hermes-agent.nousresearch.com/docs/>

إذا تعارض أي شيء هنا مع الوثائق الرسمية أو مع `hermes --help`، فاعتمد الوثائق الرسمية وواجهة CLI المثبّتة لديك.

## ما هو Hermes Agent

Hermes Agent هو وكيل ذكاء اصطناعي مستضاف ذاتيًا من Nous Research. بالنسبة لمعظم المطورين، أهم قدراته هي:

- واجهة CLI تفاعلية مع أدوات وجلسات ونقاط حفظ ومخرجات متدفقة
- بوابة متعددة المنصات لـ Telegram وDiscord وSlack وWhatsApp وSignal وغيرها
- مجموعات أدوات مدمجة للويب والملفات والـ shell وأتمتة المتصفح والذاكرة وتنفيذ الكود وcron والتفويض وTTS
- Skills قابلة للتثبيت و Skills Hub
- ذاكرة دائمة وملفات سياق مثل `SOUL.md` و `AGENTS.md`
- دعم MCP لربط خوادم الأدوات الخارجية

## البدء خلال 5 دقائق

```bash
# 1. ثبّت Hermes Agent
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash

# 2. أعد تحميل الـ shell
source ~/.bashrc
# أو: source ~/.zshrc

# 3. تحقق من التثبيت
hermes doctor

# 4. شغّل الإعداد الأولي
hermes setup

# 5. ابدأ المحادثة
hermes
```

ملاحظة Windows:  
Windows الأصلي غير مدعوم. استخدم WSL2.

## الأوامر التي يستخدمها المطورون فعليًا

| الأمر | الوظيفة |
| --- | --- |
| `hermes` | بدء واجهة CLI التفاعلية |
| `hermes chat -q "Hello"` | تشغيل سؤال واحد ثم الخروج |
| `hermes model` | اختيار المزوّد والنموذج بشكل تفاعلي |
| `hermes tools` | استعراض أو ضبط الأدوات ومجموعات الأدوات المفعلة |
| `hermes config show` | فحص الإعداد الحالي |
| `hermes doctor` | تشغيل تشخيصات التثبيت |
| `hermes sessions list` | عرض الجلسات المحفوظة |
| `hermes skills browse` | استعراض المهارات القابلة للتثبيت |
| `hermes skills search react` | البحث في Skills Hub |
| `hermes skills install openai/skills/k8s` | تثبيت skill من الـ hub |
| `hermes gateway setup` | إعداد منصات المراسلة |
| `hermes gateway run` | تشغيل البوابة في الواجهة الأمامية |
| `hermes claw migrate` | استيراد البيانات من OpenClaw |

ملاحظة WSL:  
توصي الوثائق الرسمية باستخدام `hermes gateway run` بدلًا من `hermes gateway start` داخل WSL لأن دعم systemd قد يكون غير مستقر.

## بنية المجلدات للمطورين

يخزن Hermes بيانات المستخدم داخل `~/.hermes/`:

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

قاعدة سريعة:

- ضع الأسرار مثل مفاتيح API ورموز البوت في `~/.hermes/.env`
- ضع إعدادات التشغيل غير الحساسة في `~/.hermes/config.yaml`
- ضع الذاكرة طويلة الأمد في `~/.hermes/memories/`
- ضع المهارات القابلة لإعادة الاستخدام في `~/.hermes/skills/`

## قائمة تحقق عملية للإعداد

كحد أدنى، تأكد من العناصر التالية:

1. وجود provider key صالح في `~/.hermes/.env`
2. اختيار نموذج افتراضي عبر `hermes model`
3. ضبط terminal backend في `~/.hermes/config.yaml`
4. مراجعة مجموعات الأدوات عبر `hermes tools`
5. وجود ملفات سياق للمشروع مثل `AGENTS.md` أو `.hermes.md`

أمثلة لمفاتيح البيئة:

```bash
NOUS_API_KEY=nsk-...
OPENROUTER_API_KEY=sk-or-v1-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...
```

مثال لإعداد الطرفية:

```yaml
terminal:
  backend: local
  cwd: "."
  timeout: 180
```

## المهارات والأدوات

يدعم Hermes Agent القدرات المدمجة والمهارات القابلة للتثبيت معًا.

أوامر skills الشائعة في الوثائق الرسمية الحالية:

```bash
hermes skills browse
hermes skills search kubernetes
hermes skills inspect openai/skills/k8s
hermes skills install openai/skills/k8s
hermes skills list --source hub
hermes skills check
hermes skills update
```

سير عمل شائع للأدوات:

```bash
hermes tools
hermes chat --toolsets "web,terminal,file"
```

## الخيارات المستضافة وخيارات النقر الواحد

اعتبر هذا الجدول مرجعًا إضافيًا فقط. بالنسبة للتثبيت والإعداد والضبط المعتمد، ابدأ من المستودع والوثائق الرسميين أعلاه. قد تتأخر قوالب المجتمع وخيارات السوق عن المستودع الرئيسي.

| المنصة | الرابط | الملاحظات |
| --- | --- | --- |
| **Hermes Agent** | [Official Docs](https://hermes-agent.nousresearch.com/docs/) | المسار الرسمي للتثبيت والإعداد؛ ابدأ من هنا قبل أي نشر مستضاف |
| **Railway** | [Template](https://railway.com/deploy/hermes-agent) | قالب منصة طرف ثالث؛ تحقق من الإعدادات الحالية قبل الإطلاق |
| **DigitalOcean** | [Marketplace](https://marketplace.digitalocean.com/apps/hermes-agent) | تدفق نشر عبر Marketplace؛ تحقق من حداثة الصورة والإعداد |
| **Zeabur** | [Template](https://zeabur.com/templates/hermes-agent) | نشر مجتمعي بنقرة واحدة |
| **Coolify** | [Template Repo](https://github.com/clauxel/hermes-agent-coolify) | قالب Coolify تتم صيانته من المجتمع |
| **Elestio** | [Open Source](https://elest.io/open-source/hermes-agent) | خيار نشر مُدار من طرف ثالث |

## منتجات AI Agent القابلة للمقارنة

هذا الجدول للمقارنة السريعة فقط، وليس بديلًا عن الوثائق الحالية أو صفحة الأسعار لكل منتج.

| # | المنتج | الموقع | النوع | استضافة ذاتية | منصات المراسلة |
| --- | --- | --- | --- | --- | --- |
| 1 | **Hermes Agent** | [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs/) | وكيل ذكاء اصطناعي مستضاف ذاتيًا | نعم | Telegram وDiscord وSlack وWhatsApp وSignal والمزيد |
| 2 | **Multica** | [multica.uk](https://multica.uk/) | أتمتة ذكاء اصطناعي متعددة القنوات | نعم | متعدد المنصات |
| 3 | **GenericAgent** | [genericagent.org](https://www.genericagent.org/) | مساحة عمل لوكيل مع متصفح وطرفية ونظام ملفات وتحكم في الذاكرة | غير محدد | مساحة عمل ويب |
| 4 | **OpenClaw** | [aigeamy.com](https://www.aigeamy.com/) | وكيل مستقل + مركز مراسلة | نعم | WhatsApp وTelegram وSlack وDiscord وiMessage والمزيد |
| 5 | **AutoGPT** | [agpt.co](https://agpt.co/) | وكيل مهام مستقل | نعم | API / Web UI |
| 6 | **LangChain** | [langchain.com](https://www.langchain.com/) | إطار تنسيق LLM | نعم | عبر تكاملات مخصصة |
| 7 | **n8n** | [n8n.io](https://n8n.io/) | أتمتة سير العمل + عقد AI | نعم | Slack وTelegram وDiscord والعديد من التطبيقات |
| 8 | **CrewAI** | [crewai.com](https://www.crewai.com/) | تعاون متعدد الوكلاء | نعم | API / تكاملات مخصصة |
| 9 | **SuperAGI** | [superagi.com](https://superagi.com/) | بنية تحتية للوكلاء المستقلين | نعم | Slack وEmail وAPI |

## اقرأ هذه الصفحات أولًا

- [Installation](guide/installation.md): تثبيت نظيف وإعداد المساهمين
- [Quickstart](guide/quickstart.md): أول محادثة وأول نموذج وأول skill
- [Configuration](guide/configuration.md): بنية الإعداد ومفاتيح البيئة وملفات السياق
- [CLI Reference](reference/cli.md): أوامر عالية القيمة للمطورين العاديين
- [Tools](features/tools.md): مجموعات الأدوات وواجهات الطرفية
- [Skills](features/skills.md): Skills Hub والمهارات المحلية
- [Memory](features/memory.md): الذاكرة الدائمة و `SOUL.md`
- [Messaging](messaging/overview.md): إعداد البوابة ونقاط الدخول حسب المنصة
- [Security](guide/security.md): approvals وpairing وsandboxing وأمان الاعتمادات
- [Architecture](developer/architecture.md): البنية الداخلية لـ Hermes Agent

## المصادر الرسمية

- المستودع الرسمي: <https://github.com/NousResearch/hermes-agent>
- الوثائق الرسمية: <https://hermes-agent.nousresearch.com/docs/>
- دليل المساهمة: <https://hermes-agent.nousresearch.com/docs/developer-guide/contributing/>
- دليل البنية: <https://hermes-agent.nousresearch.com/docs/developer-guide/architecture/>
- مرجع CLI: <https://hermes-agent.nousresearch.com/docs/reference/cli-commands/>
