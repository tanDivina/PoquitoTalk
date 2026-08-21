#!/usr/bin/env python3
import os
import sys
import json
import time
import requests
from pathlib import Path

# ElevenLabs Persona Voice IDs
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

# The 6 live presets and their Level 1, Level 2, and Level 3 texts
DIALECT_LEVEL_PHRASES = {
    'ac_leaking_water': {
        1: 'Buenas, el aire acondicionado está botando agua en el cuarto. ¿Puede revisarlo?',
        2: '¡Buenas! El aire acondicionado está botando agua dentro del cuarto. ¿Podría venir a revisarlo?',
        3: '¡Qué xopa maestro! El split está botando buco agua en la recámara. ¿A qué hora puede pasar a chequearlo?'
    },
    'boat_motor_wont_start': {
        1: 'Buenas, el motor de la lancha no arranca en el muelle. ¿Hace mecánica marina?',
        2: '¡Buenas Capitán! El motor fuera de borda no quiere arrancar en el muelle. ¿Hace trabajos de mecánica marina?',
        3: '¡Qué xopa Capitán! La panga se me quedó en el muelle y el motor no quiere prender. ¿Tiene chance de pasar hoy?'
    },
    'water_cistern_truck': {
        1: 'Buenas, necesitamos agua en camión para tanque de mil quinientos galones.',
        2: '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de mil quinientos galones.',
        3: '¡Buenas compa! Estamos secos acá, necesitamos un viaje de agua de camión cisterna urgente para el tanque de 1,500 galones.'
    },
    'banking_atm_banconal': {
        1: 'Buenas, ¿el cajero del Banco Nacional tiene dinero hoy?',
        2: '¡Buenas! ¿Alguien sabe si el cajero del Banco Nacional tiene plata disponible ahora mismo?',
        3: '¡Qué xopa gente! ¿Alguien sabe si el cajero de Banconal tiene plata o está sin efectivo hoy?'
    },
    'banking_atm_police_station': {
        1: 'Buenas, ¿el cajero del supermercado cerca de la policía tiene dinero?',
        2: '¡Buenas! ¿Alguien sabe si el cajero del súper que está cerca de la estación de policía tiene efectivo hoy?',
        3: '¡Buenas vecinos! ¿Saben si el cajero del súper frente al parque de la policía tiene plata dispensando ahorita?'
    },
    'starlink_dish_offline': {
        1: 'Hola, la antena de Starlink no tiene señal. ¿Tiene servicio técnico?',
        2: '¡Hola! La antena de Starlink se quedó sin señal y no conecta. ¿Tiene servicio técnico disponible?',
        3: '¡Buenas amigo! El plato de Starlink se cayó y está offline total. ¿Hace instalaciones y chequeo de señal?'
    }
}

def get_api_key():
    key = os.environ.get('ELEVENLABS_API_KEY') or os.environ.get('EXPO_PUBLIC_ELEVENLABS_API_KEY')
    if not key:
        # Check .env
        env_path = Path('.env')
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if 'ELEVENLABS_API_KEY=' in line:
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
        print(f"Generated: {output_path.name} ({len(response.content)} bytes)")
        return True
    else:
        print(f"Error {response.status_code} generating {output_path.name}: {response.text}")
        return False

def main():
    api_key = get_api_key()
    if not api_key:
        print("Error: No ElevenLabs API key found in env or .env!")
        sys.exit(1)
        
    web_audio_dir = Path('web-funnel/audio/presets')
    assets_audio_dir = Path('assets/audio/presets')
    web_audio_dir.mkdir(parents=True, exist_ok=True)
    assets_audio_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Generating ElevenLabs audio for dialect levels 1, 2, and 3 across 4 personas...")
    
    for persona_key, voice_config in ELEVENLABS_PERSONAS.items():
        print(f"\n--- Processing Persona: {voice_config['name']} ---")
        for preset_key, levels in DIALECT_LEVEL_PHRASES.items():
            for lvl, text in levels.items():
                out_file = web_audio_dir / f"{persona_key}_{preset_key}_lvl{lvl}.mp3"
                asset_file = assets_audio_dir / f"{persona_key}_{preset_key}_lvl{lvl}.mp3"
                
                needs_gen = not out_file.exists() or out_file.stat().st_size < 5000
                if needs_gen:
                    print(f"Generating {voice_config['name']} [Level {lvl}]: '{text}'")
                    success = generate_voice_clip(api_key, text, voice_config, out_file)
                    time.sleep(0.35)
                else:
                    print(f"Skipping existing: {out_file.name}")
                
                # If Level 2, also update the default fallback audio files
                if lvl == 2 and out_file.exists():
                    fallback_web = web_audio_dir / f"{persona_key}_{preset_key}.mp3"
                    fallback_asset = assets_audio_dir / f"{persona_key}_{preset_key}.mp3"
                    fallback_web.write_bytes(out_file.read_bytes())
                    fallback_asset.write_bytes(out_file.read_bytes())
                
                if out_file.exists():
                    asset_file.write_bytes(out_file.read_bytes())

if __name__ == '__main__':
    main()
