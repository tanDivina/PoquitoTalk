#!/usr/bin/env python3
"""
Generate clean, highly synchronized audio tracks for the 2-way Walkie-Talkie demonstration.
Phonetically formatted to guarantee natural speech ("nine AM" and "nueve de la mañana" with NO zeroes).
"""
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

    # 1. Captain Jim Original English
    t0_text = "Hey buenas tardes! Tomorrow morning around nine AM works great at slip number four, Bocas Marina."

    # 2. Turn 1 Spanish Translation (Capt Jim translation in Spanish)
    t1_text = "¡Buenas tardes! Mañana a las nueve de la mañana está perfecto en el muelle número cuatro de Bocas Marina."
    
    # 3. Turn 2 Contractor Spanish (Carlos)
    t2_c_text = "¡Buenas tardes Capitán Jim! Con mucho gusto, mañana a las nueve de la mañana en el muelle número cuatro. Voy a llevar el alternador nuevo y las herramientas."

    # 4. Turn 2 Expat Translation (English translation of Carlos for Capt Jim - NO WEPA, NO ZEROES)
    t2_e_text = "Good afternoon Captain Jim! With pleasure, tomorrow at nine AM at dock number four. I will bring the new alternator and tools."

    tracks = [
        ("assets/audio/captain_jim_elevenlabs.mp3", t0_text, "JBFqnCBsd6RMkjVDRZzb", 0.5, 0.85, 0.1),
        ("assets/audio/simulation/turn1_spanish_trans.mp3", t1_text, "JBFqnCBsd6RMkjVDRZzb", 0.5, 0.85, 0.1),
        ("assets/audio/simulation/turn2_contractor_spanish.mp3", t2_c_text, "ErXwobaYiN019PkySvjV", 0.45, 0.85, 0.2),
        ("assets/audio/simulation/turn2_expat_trans.mp3", t2_e_text, "JBFqnCBsd6RMkjVDRZzb", 0.5, 0.85, 0.1)
    ]

    sim_dirs = [
        Path("assets/audio"),
        Path("assets/audio/simulation"),
        Path("web-funnel/assets/audio"),
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
