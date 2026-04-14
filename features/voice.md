---
title: "Voice Mode"
source: https://hermes-agent.nousresearch.com/docs/user-guide/features/voice-mode
mirrored_at: 2026-04-12T01:11:32Z
---
# Voice Mode

Hermes Agent supports full voice interaction, including speech-to-text (STT) and text-to-speech (TTS), so you can talk to the agent naturally.

## Speech-to-Text Providers

Hermes supports three common STT options.

### Local: `faster-whisper`

Run Whisper locally for the strongest privacy and zero network dependency.

- **Engine**: [faster-whisper](https://github.com/guillaumekienle/faster-whisper)
- **Cost**: free
- **Privacy**: highest, because audio stays local
- **Latency**: depends on your hardware
- **Models**: `tiny`, `base`, `small`, `medium`, `large-v2`, `large-v3`

```yaml
# ~/.hermes/config.yaml
stt:
  provider: local
  model: base
  device: cpu      # or cuda
  compute_type: int8
  language: zh
```

Install it with:

```bash
pip install faster-whisper
# Optional CUDA support
pip install faster-whisper[cuda]
```

### Groq: `whisper-large-v3-turbo`

Groq offers very low-latency remote transcription:

- **Model**: `whisper-large-v3-turbo`
- **Cost**: free tier plus usage-based billing after that
- **Latency**: very low
- **Accuracy**: high

```yaml
stt:
  provider: groq
  api_key: "gsk_your_groq_api_key"
  model: whisper-large-v3-turbo
  language: zh
```

Get a key from [console.groq.com](https://console.groq.com).

### OpenAI: `whisper-1`

Use OpenAI's hosted Whisper API:

- **Model**: `whisper-1`
- **Cost**: billed by audio duration
- **Formats**: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`
- **File size limit**: 25 MB

```yaml
stt:
  provider: openai
  api_key: "sk-your-openai-api-key"
  model: whisper-1
  language: zh
  response_format: text
```

## Text-to-Speech Providers

Hermes supports four common TTS options.

### Edge TTS

Microsoft Edge's online TTS service is free and supports many voices:

- **Cost**: free
- **Voices**: 400+ voices
- **Quality**: high

Common Chinese voices:

| Voice ID | Description |
| --- | --- |
| `zh-CN-XiaoxiaoNeural` | Friendly female voice |
| `zh-CN-YunxiNeural` | Clear male voice |
| `zh-CN-XiaoyiNeural` | Lighter female voice |
| `zh-TW-HsiaoChenNeural` | Taiwanese Mandarin |
| `zh-HK-HiuMaanNeural` | Cantonese |

```yaml
tts:
  provider: edge_tts
  voice: zh-CN-XiaoxiaoNeural
  rate: "+0%"
  volume: "+0%"
  pitch: "+0Hz"
```

### ElevenLabs

Premium speech synthesis with voice cloning:

- **Cost**: character-based pricing
- **Strengths**: cloning, expressive speech, multilingual output
- **Quality**: extremely high

```yaml
tts:
  provider: elevenlabs
  api_key: "your-elevenlabs-api-key"
  voice_id: "21m00Tcm4TlvDq8ikWAM"
  model: eleven_multilingual_v2
  stability: 0.5
  similarity_boost: 0.75
```

### OpenAI TTS

OpenAI provides built-in synthetic voices:

- **Voices**: `alloy`, `echo`, `fable`, `onyx`, `nova`, `shimmer`
- **Formats**: `mp3`, `opus`, `aac`, `flac`

```yaml
tts:
  provider: openai
  api_key: "sk-your-openai-api-key"
  model: tts-1
  voice: nova
  speed: 1.0
  output_format: mp3
```

### NeuTTS

A lightweight self-hosted option:

```yaml
tts:
  provider: neutts
  endpoint: "http://localhost:8080"
  voice: "zh-cn-standard"
```

## Recording Controls

### Keyboard Shortcuts

In CLI mode:

| Shortcut | Action |
| --- | --- |
| `Ctrl+B` | Start recording |
| `Ctrl+B` again | Stop recording and send |

### Silence Detection

Hermes includes silence detection so recording can stop automatically after a quiet period:

```yaml
voice:
  silence_threshold: 3.0
  silence_db: -40
  min_recording_length: 0.5
```

## Start Voice Mode

```bash
hermes chat --voice
hermes chat --voice --stt-provider groq --tts-provider edge_tts
```

## Discord Voice Channels

Hermes can also join Discord voice channels for live interaction.

### Join

```text
/voice join
```

### Leave

```text
/voice leave
```

### Status

```text
/voice status
```

Typical status information includes:

- Connected server and voice channel
- Active user list
- Active STT/TTS providers
- Latency statistics

### Discord Voice Configuration

```yaml
# ~/.hermes/config.yaml
discord:
  token: "your-discord-bot-token"
  voice:
    stt_provider: groq
    tts_provider: edge_tts
    auto_join: false
    wake_word: "hey hermes"
    response_timeout: 30
```

## Full Example Configuration

```yaml
# ~/.hermes/config.yaml

stt:
  provider: groq
  api_key: "${GROQ_API_KEY}"
  model: whisper-large-v3-turbo
  language: zh
  auto_detect: true

tts:
  provider: edge_tts
  voice: zh-CN-XiaoxiaoNeural
  rate: "+10%"
  auto_play: true
  save_audio: false

voice:
  silence_threshold: 3.0
  silence_db: -40
  input_device: default
  output_device: default
  sample_rate: 16000

voice_mode:
  enabled: false
  push_to_talk: true
```

## Recommended Setups

- **Everyday use**: Edge TTS + Groq STT
- **Premium demos**: ElevenLabs TTS + OpenAI STT
- **Privacy-sensitive work**: local `faster-whisper` + Edge TTS
- **Discord bots**: Groq STT + Edge TTS for a low-latency combination
