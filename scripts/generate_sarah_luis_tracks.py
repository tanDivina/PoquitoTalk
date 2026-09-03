#!/usr/bin/env python3
import os
import requests
from pathlib import Path

def get_api_key():
    env_path = Path('.env')
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if 'ELEVENLABS_API_KEY' in line:
                return line.split('=', 1)[1].strip().strip('"').strip("'")
    return os.environ.get('ELEVENLABS_API_KEY')

def generate_voice(api_key, text, voice_id, output_path, stability=0.5, similarity_boost=0.85, style=0.15):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        'xi-api-key': api_key,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
    }
    payload = {
        'text': text,
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': {
            'stability': stability,
            'similarity_boost': similarity_boost,
            'style': style,
            'use_speaker_boost': True
        }
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=30)
    if resp.status_code == 200:
        Path(output_path).write_bytes(resp.content)
        print(f"✅ Generated {output_path} ({len(resp.content)} bytes)")
        return True
    else:
        print(f"❌ Error {resp.status_code}: {resp.text}")
        return False

def main():
    api_key = get_api_key()
    if not api_key:
        print("No API key found!")
        return

    # 1. Sarah Original English (Spoken in App)
    t0_text = "Hi Capitán Luis! Are you available to pick us up at Taxi 25 dock in Bocas Town around four PM and take us back to Isla Solarte?"

    # 2. Turn 1 Spanish Translation (Sarah's voice in Spanish played on Captain's phone)
    t1_text = "¡Hola Capitán Luis! ¿Está disponible para recogernos en el muelle de Taxi 25 en Bocas Town como a las cuatro de la tarde y llevarnos de vuelta a Isla Solarte?"
    
    # 3. Turn 2 Captain Spanish Reply (Capitán Luis spoken on Web)
    t2_c_text = "¡Buenas tardes doña Sarah! Sí, claro que sí, a las cuatro en punto estoy amarrado en Taxi 25 esperándolos en la lancha. ¡Nos vemos allá!"

    # 4. Turn 2 English Translation (Incoming translated English for Sarah)
    t2_e_text = "Good afternoon Mrs. Sarah! Yes, of course, at four sharp I will be tied up at Taxi 25 waiting for you in the boat. See you there!"

    tracks = [
        ("assets/audio/simulation/sarah_original_en.mp3", t0_text, "21m00Tcm4TlvDq8ikWAM", 0.5, 0.85, 0.1),
        ("assets/audio/simulation/sarah_trans_es.mp3", t1_text, "21m00Tcm4TlvDq8ikWAM", 0.5, 0.85, 0.1),
        ("assets/audio/simulation/luis_reply_es.mp3", t2_c_text, "ErXwobaYiN019PkySvjV", 0.45, 0.85, 0.2),
        ("assets/audio/simulation/luis_trans_en.mp3", t2_e_text, "JBFqnCBsd6RMkjVDRZzb", 0.5, 0.85, 0.1)
    ]

    sim_dirs = [
        Path("assets/audio/simulation"),
        Path("web-funnel/assets/audio/simulation")
    ]
    for d in sim_dirs:
        d.mkdir(parents=True, exist_ok=True)

    for rel_path, text, voice_id, stab, sim, sty in tracks:
        p1 = Path(rel_path)
        p2 = Path("web-funnel") / rel_path
        print(f"\nGenerating {rel_path}...")
        print(f"Text: '{text}'")
        if generate_voice(api_key, text, voice_id, str(p1), stab, sim, sty):
            p2.parent.mkdir(parents=True, exist_ok=True)
            p2.write_bytes(p1.read_bytes())

if __name__ == "__main__":
    main()
