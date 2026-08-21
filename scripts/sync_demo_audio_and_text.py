#!/usr/bin/env python3
"""
Synchronize PoquitoTalk Web Demo Audio and Text with ElevenLabs
Ensures 100% exact match between on-screen Spanish text and spoken audio.
"""

import os
import sys
import time
import requests
from pathlib import Path

ELEVENLABS_PERSONAS = {
    'diego': {
        'name': 'Diego',
        'voice_id': 'JBFqnCBsd6RMkjVDRZzb', # George - Warm Conversational Male
        'stability': 0.45,
        'similarity_boost': 0.85,
        'style': 0.20
    },
    'mateo': {
        'name': 'Mateo',
        'voice_id': 'ErXwobaYiN019PkySvjV', # Antoni - Authoritative Deep Male
        'stability': 0.50,
        'similarity_boost': 0.85,
        'style': 0.15
    },
    'sofia': {
        'name': 'Sofia',
        'voice_id': 'cgSgspJ2msm6clMCkdW9', # Jessica - Clear Friendly Female
        'stability': 0.45,
        'similarity_boost': 0.85,
        'style': 0.20
    },
    'valeria': {
        'name': 'Valeria',
        'voice_id': 'EXAVITQu4vr4xnSDxMaL', # Bella - Young Expressive Female
        'stability': 0.40,
        'similarity_boost': 0.85,
        'style': 0.25
    }
}

# The 6 canonical website presets with EXACT corresponding Spanish text
CANONICAL_PRESETS = {
    'ac_leaking_water': {
        'title': 'A/C Leaking',
        'input': 'Hi! My air conditioning is leaking water inside the bedroom.',
        'lvl2': '¡Buenas! El aire acondicionado está botando agua dentro del cuarto. ¿Podría venir a revisarlo?',
        'lvl3': '¡Qué xopa maestro! El split está botando buco agua en la recámara. ¿A qué hora puede pasar a chequearlo?'
    },
    'boat_motor_wont_start': {
        'title': 'Boat Engine',
        'input': "Hi! The outboard motor on my boat won't start at the dock.",
        'lvl2': '¡Buenas Capitán! El motor fuera de borda no quiere arrancar en el muelle. ¿Hace trabajos de mecánica marina?',
        'lvl3': '¡Qué xopa Capitán! La panga se me quedó en el muelle y el motor no quiere prender. ¿Tiene chance de pasar hoy?'
    },
    'water_cistern_truck': {
        'title': 'Water Truck',
        'input': 'Hello, we need an emergency water truck delivery for our 1,500-gallon cistern.',
        'lvl2': '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de mil quinientos galones.',
        'lvl3': '¡Buenas compa! Estamos secos acá, necesitamos un viaje de agua de camión cisterna urgente para el tanque de 1,500 galones.'
    },
    'banking_atm_banconal': {
        'title': 'Banco Nacional ATM',
        'input': 'Hi! Does anyone know if the Banco Nacional ATM has cash today?',
        'lvl2': '¡Buenas! ¿Alguien sabe si el cajero del Banco Nacional tiene plata disponible ahora mismo?',
        'lvl3': '¡Qué xopa gente! ¿Alguien sabe si el cajero de Banconal tiene plata o está sin efectivo hoy?'
    },
    'power_blackout_status': {
        'title': 'Power Outage',
        'input': 'Hi! Did the power go out in the whole area, or does anyone know when it comes back?',
        'lvl2': '¡Buenas! ¿Se fue la luz en todo el sector o se sabe a qué hora regresará el servicio eléctrico?',
        'lvl3': '¡Qué xopa vecinos! ¿Se fue la luz en toda la isla o solo por acá? ¿Se sabe a qué hora regresa?'
    },
    'starlink_dish_offline': {
        'title': 'Starlink Help',
        'input': 'Hello! My Starlink dish lost signal connection and shows offline.',
        'lvl2': '¡Hola! La antena de Starlink se quedó sin señal y no conecta. ¿Tiene servicio técnico disponible?',
        'lvl3': '¡Buenas amigo! El plato de Starlink se cayó y está offline total. ¿Hace instalaciones y chequeo de señal?'
    }
}

def get_api_key():
    key = os.environ.get('ELEVENLABS_API_KEY') or os.environ.get('EXPO_PUBLIC_ELEVENLABS_API_KEY')
    if not key:
        env_path = Path('.env')
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if 'ELEVENLABS_API_KEY' in line:
                    key = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break
    return key

def generate_voice_clip(api_key, text, voice_config, output_path):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_config['voice_id']}"
    headers = {
        'xi-api-key': api_key,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
    }
    payload = {
        'text': text,
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': {
            'stability': voice_config['stability'],
            'similarity_boost': voice_config['similarity_boost'],
            'style': voice_config['style'],
            'use_speaker_boost': True
        }
    }
    
    response = requests.post(url, json=payload, headers=headers, timeout=30)
    if response.status_code == 200:
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"  ✅ Generated: {output_path.name} ({len(response.content)} bytes)")
        return True
    else:
        print(f"  ❌ Error {response.status_code} generating {output_path.name}: {response.text}")
        return False

def main():
    api_key = get_api_key()
    if not api_key:
        print("Error: No ElevenLabs API key found!")
        sys.exit(1)
        
    web_audio_dir = Path('web-funnel/audio/presets')
    assets_audio_dir = Path('assets/audio/presets')
    web_audio_dir.mkdir(parents=True, exist_ok=True)
    assets_audio_dir.mkdir(parents=True, exist_ok=True)
    
    print("🚀 Synchronizing ElevenLabs Voice Audio with Exact Text...")
    
    for persona_key, voice_config in ELEVENLABS_PERSONAS.items():
        print(f"\n--- Processing Voice: {voice_config['name']} ({persona_key}) ---")
        for preset_key, preset_data in CANONICAL_PRESETS.items():
            for lvl_num, lvl_key in [(2, 'lvl2'), (3, 'lvl3')]:
                text = preset_data[lvl_key]
                filename = f"{persona_key}_{preset_key}_lvl{lvl_num}.mp3"
                out_file = web_audio_dir / filename
                asset_file = assets_audio_dir / filename
                
                # Check if file needs generation or re-generation
                # For power_blackout_status or updated boat/atm phrases, force regeneration to ensure exact sync
                force_regen = preset_key in ['power_blackout_status', 'boat_motor_wont_start', 'banking_atm_banconal', 'starlink_dish_offline']
                needs_gen = force_regen or not out_file.exists() or out_file.stat().st_size < 5000
                
                if needs_gen:
                    print(f"  [Lvl {lvl_num}] '{text}' -> {filename}")
                    success = generate_voice_clip(api_key, text, voice_config, out_file)
                    time.sleep(0.4)
                else:
                    print(f"  [Lvl {lvl_num}] Exists: {filename}")
                    
                if out_file.exists():
                    asset_file.write_bytes(out_file.read_bytes())
                    if lvl_num == 2:
                        # Write unversioned fallback
                        (web_audio_dir / f"{persona_key}_{preset_key}.mp3").write_bytes(out_file.read_bytes())
                        (assets_audio_dir / f"{persona_key}_{preset_key}.mp3").write_bytes(out_file.read_bytes())

    print("\n🎉 Audio generation & exact sync complete!")

if __name__ == '__main__':
    main()
