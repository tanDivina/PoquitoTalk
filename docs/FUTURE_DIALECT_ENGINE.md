# 🇵🇦 Future Roadmap: Context-Aware Panamanian Dialect Engine (v2.0)

## 1. Executive Summary & Problem Context
In early prototypes of **PoquitoTalk**, a 1-tap tone switcher (**Poquito Friendly** vs. **Full Panameño**) was tested to give users access to authentic Panamanian street dialect (*jerga*) alongside polite, clear Spanish.

While the concept was popular in theory, the initial implementation used heuristic pattern matching and static string transformations. This created several critical failure modes:
- **Repetitive Suffix Hallucinations**: Sentences frequently ended with rigid template phrases (e.g., `"...pa ver si me tira una mano con eso, gracias jefe"`) regardless of whether the context was an emergency, an inquiry, or an assertion.
- **Contextual Incongruity**: Slang terms like `compa`, `xopa`, and `buco` were injected into formal transactions (e.g., banking or medical clinics) where standard respectful Spanish is expected.
- **Tone Rigidity**: Naive regex replaces could not discern subtle grammatical gender, mood, or island nuances (e.g., Bocas del Toro Afro-Antillean / Guari-Guari hybrid vs. Panama City colloquialisms).

To deliver a **rock-solid, 100% reliable MVP**, all static tone switchers were stripped from the active user interface. PoquitoTalk v1.0 focuses exclusively on **clean, natural, and polite Panamanian Spanish** that is universally respected by local contractors and service providers.

---

## 2. Technical Architecture for v2.0 Dialect Engine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            User Input (English)                            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Context Classifier Agent   │
                        │ (Domain, Urgency, Audience) │
                        └──────────────┬──────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         │                                                           │
┌────────▼──────────────┐                                 ┌──────────▼──────────┐
│   Standard Domain     │                                 │   Informal / Island  │
│ (Clinic, Bank, Govt)  │                                 │ (Boat, A/C, Hangout)│
├───────────────────────┤                                 ├─────────────────────┤
│ Prompt: Respectful &  │                                 │ Few-Shot Dialect LLM│
│ Clear Regional Spanish│                                 │  (Gemma-2B / Claude)│
└────────┬──────────────┘                                 └──────────┬──────────┘
         │                                                           │
         └─────────────────────────────┬─────────────────────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │  Linguistic Validator Rule  │
                        │   (No Repetitive Suffixes)  │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │  High-Quality Natural Voice │
                        │  (ElevenLabs / Google TTS)  │
                        └─────────────────────────────┘
```

---

## 3. Core Linguistic Principles for Panamanian *Jerga*

When reviving the Panamanian dialect engine in v2.0, the system must adhere to these contextual rules:

### A. Dynamic Greetings (Based on Time & Relationship)
- **Stranger / First Contact**: `¡Buenas!` or `¡Buenas tardes!`
- **Familiar / Contractor**: `¡Qué xopa compa!`, `¡Buenas maestro!`
- **Marine / Maritime**: `¡Buenas Capitán!`, `¡Dímelo jefe!`

### B. Natural Vocabulary Substitution (Not Appended Suffixes)
| Standard Spanish | Panamanian Colloquial (*Jerga*) | Contextual Usage |
| :--- | :--- | :--- |
| *Mucho / Bastante* | **Buco** (`"Ta botando buco agua"`) | High volume / quantities |
| *Dinero / Efectivo* | **Plata** (`"¿El cajero tiene plata?"`) | Everyday cash |
| *Amigo / Señor* | **Compa** / **Maestro** | Friendly trade address |
| *Está roto / No funciona* | **Ta dañado** / **Ta fundido** | Hardware failures |
| *Rápido / De una vez* | **De una** / **En bomba** | Urgent turnaround |

### C. Ban on Static Template Suffixes
The engine must **never** append hardcoded phrases like `"pa ver si me tira una mano"` to generic outputs. Every linguistic modification must happen inside the core clause through semantic rewriting, not suffix concatenation.

---

## 4. Implementation Strategy & Milestones

1. **Phase 1 (Completed for MVP)**: Remove all UI toggles to eliminate noise, ensuring pristine default translations.
2. **Phase 2 (Corpus Collection)**: Transcribe and annotate 500+ authentic Bocas del Toro WhatsApp audio notes from real expats and local service providers across 10 categories.
3. **Phase 3 (Prompt Fine-Tuning)**: Deploy Gemma 2B / Claude 3.5 structured prompt templates conditioned on `conversation_role`, `category`, and `urgency`.
4. **Phase 4 (Beta Testing)**: Roll out dialect customization as an opt-in "Lab Feature" under Settings before placing it on the primary translation card.
