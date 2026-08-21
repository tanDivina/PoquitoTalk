#!/usr/bin/env python3
"""
ElevenLabs Hyper-Realistic Studio Batch Generator for PoquitoTalk
Generates studio-grade Panamanian Spanish .mp3 voice clips for all preset phrases.
Supports Diego, Mateo, Sofia, and Valeria personas with eleven_multilingual_v2.
"""

import os
import sys
import json
import time
import argparse
import requests
from pathlib import Path

# ElevenLabs Persona Voice IDs
ELEVENLABS_PERSONAS = {
    'diego': {
        'name': 'Diego',
        'voice_id': 'JBFqnCBsd6RMkjVDRZzb', # George - Warm Conversational Male
        'gender': 'MALE',
        'stability': 0.45,
        'similarity_boost': 0.85,
        'style': 0.20
    },
    'mateo': {
        'name': 'Mateo',
        'voice_id': 'ErXwobaYiN019PkySvjV', # Antoni - Authoritative Deep Male
        'gender': 'MALE',
        'stability': 0.50,
        'similarity_boost': 0.85,
        'style': 0.15
    },
    'sofia': {
        'name': 'Sofia',
        'voice_id': 'cgSgspJ2msm6clMCkdW9', # Jessica - Clear Friendly Female
        'gender': 'FEMALE',
        'stability': 0.45,
        'similarity_boost': 0.85,
        'style': 0.20
    },
    'valeria': {
        'name': 'Valeria',
        'voice_id': 'EXAVITQu4vr4xnSDxMaL', # Bella - Young Expressive Female
        'gender': 'FEMALE',
        'stability': 0.40,
        'similarity_boost': 0.85,
        'style': 0.25
    }
}

# Master Preset Phrase Catalog (18 Categories, 58 Curated Phrases)
PRESET_PHRASES = [
    # 1. Water Supply & Cisterns
    {'id': 'water_cistern_truck', 'category': 'Water', 'spanish': '¡Buenas! Disculpe, ¿tendrá disponibilidad de camión cisterna para llenar un tanque de reserva de agua en mi propiedad hoy?'},
    {'id': 'water_jugs_delivery', 'category': 'Water', 'spanish': '¡Buenas tardes! ¿Hacen entrega a domicilio de 3 botellones de agua purificada de 5 galones hoy?'},
    {'id': 'water_pump_lost_prime', 'category': 'Water', 'spanish': '¡Hola! La bomba de agua del tanque se quedó sin agua y perdió la presión. ¿Podría venir un técnico a purgarla y revisarla?'},
    {'id': 'water_filter_maintenance', 'category': 'Water', 'spanish': '¡Buenas! Necesito hacerle cambio de filtros y mantenimiento al sistema de captación de agua de lluvia, por favor.'},

    # 2. Guabito & Sixaola Border
    {'id': 'border_exit_entry_stamp', 'category': 'Border', 'spanish': '¡Buenas! Vengo a hacer el sello de salida y entrada para la renovación de mi estadía de turista. ¿Cuánto es el costo de los timbres?'},
    {'id': 'border_taxi_to_almirante', 'category': 'Border', 'spanish': '¡Hola! ¿Cuánto me cobra por el viaje en taxi desde la frontera de Guabito hasta el muelle de lanchas en Almirante?'},
    {'id': 'border_customs_clearance', 'category': 'Border', 'spanish': '¡Buenas! Traigo equipaje personal y algunas compras menores. ¿Dónde paso para la revisión de Aduanas?'},
    {'id': 'border_shuttle_puerto_viejo', 'category': 'Border', 'spanish': '¡Buenas! ¿A qué hora sale el próximo bus o colectivo hacia Puerto Viejo o San José desde Sixaola?'},

    # 3. Hardware & Ferretería
    {'id': 'hardware_screws_nails', 'category': 'Hardware', 'spanish': '¡Buenas! ¿Tienen tornillos de acero inoxidable de dos pulgadas para madera y fijaciones marinas?'},
    {'id': 'hardware_zinc_roofing', 'category': 'Hardware', 'spanish': '¡Buenas! ¿Tienen láminas de zinc ondulado para techo y madera contrachapada marina con entrega a domicilio?'},
    {'id': 'hardware_pvc_plumbing_pipes', 'category': 'Hardware', 'spanish': '¡Hola! Necesito tubos de PVC para agua de media pulgada, codos, adaptadores y pegamento de PVC.'},
    {'id': 'hardware_cement_sand_bags', 'category': 'Hardware', 'spanish': '¡Buenas! ¿Cuánto saldrían 5 sacos de cemento gris con arena puestos en el muelle de la isla?'},

    # 4. Power Outages & Generators
    {'id': 'power_blackout_status', 'category': 'Power', 'spanish': '¡Buenas! ¿Se fue la luz en todo el sector o se sabe a qué hora regresará el servicio eléctrico?'},
    {'id': 'power_generator_fuel_delivery', 'category': 'Power', 'spanish': '¡Hola! ¿Podrían traerme 5 galones de gasolina o diesel en paila para el generador de respaldo?'},
    {'id': 'power_low_voltage_fluctuation', 'category': 'Power', 'spanish': '¡Buenas! Hay un bajón de voltaje muy fuerte y las luces parpadean. ¿Podría venir un electricista a revisar la caja de breakers?'},

    # 5. Pet Care & Island Vet
    {'id': 'pet_emergency_vet_visit', 'category': 'Pet Vet', 'spanish': '¡Buenas! Mi mascota está vomitando y decaída. ¿Habrá un veterinario disponible para una consulta de urgencia ahora mismo?'},
    {'id': 'pet_toad_snake_toxicity', 'category': 'Pet Vet', 'spanish': '¡Urgente! Mi perro mordió un sapo y tiene espuma en la boca. ¿Qué primeros auxilios le hago y están abiertos ya?'},
    {'id': 'pet_flea_tick_meds', 'category': 'Pet Vet', 'spanish': '¡Hola! ¿Tienen pastillas masticables para garrapatas y pulgas como Nexgard o Bravecto disponibles?'},

    # 6. Groceries & Specialty Diet
    {'id': 'groceries_specialty_diet', 'category': 'Groceries', 'spanish': '¡Buenas! ¿Tienen en existencia pan sin gluten, leche de almendras o avena, y queso vegano?'},
    {'id': 'groceries_fresh_seafood_order', 'category': 'Groceries', 'spanish': '¡Buenas! ¿Tienen pargo fresco, corvina o langosta hoy y a cómo tienen la libra?'},
    {'id': 'groceries_whatsapp_delivery_list', 'category': 'Groceries', 'spanish': '¡Hola! ¿Les puedo mandar mi lista de compras por WhatsApp para que me la preparen y envíen a domicilio?'},

    # 7. Banking & Money
    {'id': 'banking_atm_banconal', 'category': 'Banking', 'spanish': '¡Buenas! ¿Alguien sabe si el cajero del Banco Nacional tiene plata disponible ahora mismo?'},
    {'id': 'banking_atm_police_station', 'category': 'Banking', 'spanish': '¡Buenas! ¿Alguien sabe si el cajero del súper que está cerca de la estación de policía tiene efectivo hoy?'},
    {'id': 'banking_atm_supermarket', 'category': 'Banking', 'spanish': '¡Buenas! ¿Saben si el cajero de la calle principal frente a Super Gourmet tiene plata hoy?'},
    {'id': 'banking_western_union', 'category': 'Banking', 'spanish': '¡Buenas! ¿La agencia de Western Union está abierta hoy para retirar un giro internacional?'},
    {'id': 'banking_punto_pago', 'category': 'Banking', 'spanish': '¡Hola! ¿Dónde queda el kiosco de Punto Pago más cercano para pagar la luz o recargar minutos?'},
    {'id': 'banking_small_bill_change', 'category': 'Banking', 'spanish': '¡Buenas! ¿Disculpe, tendrá cambio de un billete de 100 o 50 en billetes chicos de 5, 10 y 20 dólares?'},

    # 8. Medical & Pharmacy
    {'id': 'med_doctor_visit', 'category': 'Medical', 'spanish': '¡Buenas! Tengo fiebre alta y dolor fuerte. ¿Habrá algún médico disponible para una consulta hoy?'},
    {'id': 'med_pharmacy_meds', 'category': 'Medical', 'spanish': '¡Buenas! ¿Tienen medicamentos para la fiebre o infección en la farmacia y hasta qué hora están abiertos hoy?'},
    {'id': 'med_emergency_ambulance', 'category': 'Medical', 'spanish': '¡Urgente! Necesito asistencia médica de emergencia o una ambulancia de inmediato, por favor.'},

    # 9. Doctor & Dentist
    {'id': 'dent_urgent_toothache', 'category': 'Dentist', 'spanish': '¡Buenas! Tengo un dolor de muela muy fuerte. ¿Tendrá cupo disponible con el odontólogo hoy?'},
    {'id': 'dent_cleaning_schedule', 'category': 'Dentist', 'spanish': '¡Hola! Quisiera agendar una cita para una limpieza dental para la próxima semana, por favor.'},
    {'id': 'dent_lab_results', 'category': 'Dentist', 'spanish': '¡Buenas! Quisiera consultar si ya tienen listos los resultados de mis exámenes de laboratorio.'},

    # 10. A/C & Refrigeration
    {'id': 'ac_leaking_water', 'category': 'A/C', 'spanish': '¡Buenas! El aire acondicionado está botando agua dentro de la habitación. ¿Podría venir a revisarlo hoy?'},
    {'id': 'ac_gas_refill', 'category': 'A/C', 'spanish': '¡Hola! El aire acondicionado prende pero no tira aire frío. Me parece que le hace falta una recarga de gas.'},
    {'id': 'ac_remote_not_working', 'category': 'A/C', 'spanish': '¡Buenas! El control remoto del aire acondicionado no responde. ¿Podrían revisarlo?'},

    # 11. Fridge & Appliances
    {'id': 'fridge_not_cooling', 'category': 'Appliances', 'spanish': '¡Buenas! La refrigeradora dejó de enfriar hoy. ¿Podría venir un técnico a revisarla?'},
    {'id': 'fridge_washing_machine', 'category': 'Appliances', 'spanish': '¡Hola! La lavadora no está botando el agua al terminar el ciclo de lavado.'},
    {'id': 'fridge_stove_ignition', 'category': 'Appliances', 'spanish': '¡Buenas! Los quemadores de la estufa de gas no están encendiendo bien.'},

    # 12. Boat & Marine Mechanics
    {'id': 'boat_motor_wont_start', 'category': 'Marine', 'spanish': '¡Buenas capitán! El motor fuera de borda no quiere arrancar. ¿Usted hace mecánica marina aquí?'},
    {'id': 'boat_bilge_battery', 'category': 'Marine', 'spanish': '¡Hola! Necesito que alguien me revise la bomba de achique automática y los cables de la batería marina, por favor.'},
    {'id': 'boat_hull_propeller', 'category': 'Marine', 'spanish': '¡Buenas! ¿Usted hace limpieza de fondo de casco y revisión de la propela en el muelle?'},

    # 13. Car & Mechanics
    {'id': 'car_battery_jump', 'category': 'Mechanics', 'spanish': '¡Buenas! La batería del carro se quedó sin carga. ¿Alguien podría traerme cables para pasar corriente o una batería nueva?'},
    {'id': 'car_tire_puncture', 'category': 'Mechanics', 'spanish': '¡Hola! La llanta tiene un clavo y se desinfló. ¿Dónde queda la llantería más cercana para parcharla?'},
    {'id': 'car_oil_change_check', 'category': 'Mechanics', 'spanish': '¡Buenas! Quisiera agendar un cambio de aceite y filtro y una revisión de los frenos, por favor.'},

    # 14. Starlink & Internet
    {'id': 'starlink_dish_offline', 'category': 'Starlink', 'spanish': '¡Buenas! La antena de Starlink perdió la señal. ¿Hay alguna caída general del servicio en la zona?'},
    {'id': 'starlink_fiber_damaged', 'category': 'Starlink', 'spanish': '¡Hola! El cable de fibra óptica afuera de la casa parece estar dañado o cortado.'},
    {'id': 'starlink_slow_line_check', 'category': 'Starlink', 'spanish': '¡Buenas! El internet está demasiado lento hoy. ¿Podría verificar el estado de la línea desde la central?'},

    # 15. Landlord & Housing
    {'id': 'landlord_water_pressure', 'category': 'Housing', 'spanish': '¡Buenas! La presión del agua en el baño principal se cayó por completo.'},
    {'id': 'landlord_spare_key', 'category': 'Housing', 'spanish': '¡Hola! Se me quedaron las llaves adentro por accidente. ¿Tendrá una llave de repuesto cerca?'},
    {'id': 'landlord_rent_transfer_proof', 'category': 'Housing', 'spanish': '¡Buenas! Ya le envié el pago del alquiler por transferencia bancaria y le adjunto el comprobante.'},

    # 16. Land Taxi & Drivers
    {'id': 'taxi_beach_trip', 'category': 'Taxi', 'spanish': '¡Buenas! ¿Estará disponible para una carrera en taxi hacia Playa Bluff o Paunch hoy?'},
    {'id': 'taxi_airport_pickup', 'category': 'Taxi', 'spanish': '¡Hola! ¿Cuánto me cobra por recogerme en el aeropuerto de Bocas Town?'},
    {'id': 'taxi_day_rate_hire', 'category': 'Taxi', 'spanish': '¡Buenas! ¿Cuánto me cobraría por el servicio de chofer por medio día para recorrer Isla Colón?'},

    # 17. Water Taxi & Boats
    {'id': 'water_taxi_red_frog', 'category': 'Boats', 'spanish': '¡Buenas capitán! ¿Tendrá lancha disponible para llevar a 2 personas a Red Frog Beach ahora mismo?'},
    {'id': 'water_taxi_carenero_bastimentos', 'category': 'Boats', 'spanish': '¡Hola! ¿A cuánto está el pasaje por persona en lancha desde Bocas Town hasta Carenero u Old Bank?'},
    {'id': 'water_taxi_late_night', 'category': 'Boats', 'spanish': '¡Buenas capitán! ¿Habrá lanchas trabajando hasta tarde esta noche para el viaje de regreso?'},

    # 18. Restaurants & Dining
    {'id': 'dining_table_reservation', 'category': 'Dining', 'spanish': '¡Buenas! Quisiera reservar una mesa para 4 personas hoy a las 7:30 de la noche, por favor.'},
    {'id': 'dining_dietary_options', 'category': 'Dining', 'spanish': '¡Hola! ¿Tienen opciones vegetarianas o platos sin gluten en el menú?'},
    {'id': 'dining_menu_specials', 'category': 'Dining', 'spanish': '¡Buenas! ¿Me podrían enviar su menú actualizado y la pesca del día por WhatsApp?'},
]

def load_api_key():
    # Check environment variable or .env file
    api_key = os.environ.get('EXPO_PUBLIC_ELEVENLABS_API_KEY') or os.environ.get('ELEVENLABS_API_KEY')
    if not api_key:
        env_path = Path(__file__).resolve().parent.parent / '.env'
        if env_path.exists():
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('EXPO_PUBLIC_ELEVENLABS_API_KEY='):
                        api_key = line.split('=', 1)[1].strip().strip('"\'')
                        break
    return api_key

def generate_audio(api_key, text, persona_config, output_path, max_retries=3):
    voice_id = persona_config['voice_id']
    endpoint = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128"

    headers = {
        'Content-Type': 'application/json',
        'xi-api-key': api_key
    }

    payload = {
        'text': text.strip(),
        'model_id': 'eleven_multilingual_v2',
        'voice_settings': {
            'stability': persona_config['stability'],
            'similarity_boost': persona_config['similarity_boost'],
            'style': persona_config['style'],
            'use_speaker_boost': True
        }
    }

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(endpoint, headers=headers, json=payload, timeout=45)
            if response.status_code == 200:
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                return True, len(response.content)
            elif response.status_code == 429:
                time.sleep(2 * attempt)
            else:
                if attempt == max_retries:
                    return False, f"Status {response.status_code}: {response.text}"
                time.sleep(1.5 * attempt)
        except Exception as e:
            if attempt == max_retries:
                return False, f"Connection error: {str(e)}"
            time.sleep(1.5 * attempt)

    return False, "Max retries exceeded"

def main():
    parser = argparse.ArgumentParser(description="ElevenLabs Studio Batch Audio Generator for PoquitoTalk")
    parser.add_argument('--persona', type=str, default='diego', choices=['diego', 'mateo', 'sofia', 'valeria', 'all'],
                        help="Persona to generate (default: diego)")
    parser.add_argument('--force', action='store_true', help="Force re-generation of existing files")
    parser.add_argument('--limit', type=int, default=None, help="Limit number of phrases generated (for quick testing)")
    args = parser.parse_args()

    api_key = load_api_key()
    if not api_key:
        print("❌ Error: ElevenLabs API Key not found in environment or .env file.")
        sys.exit(1)

    # Prepare output directory
    output_dir = Path(__file__).resolve().parent.parent / 'assets' / 'audio' / 'presets'
    output_dir.mkdir(parents=True, exist_ok=True)

    personas_to_run = list(ELEVENLABS_PERSONAS.keys()) if args.persona == 'all' else [args.persona.lower()]
    phrases_to_run = PRESET_PHRASES[:args.limit] if args.limit else PRESET_PHRASES

    total_tasks = len(personas_to_run) * len(phrases_to_run)
    print(f"🎙️  PoquitoTalk Studio Generator")
    print(f"==================================================")
    print(f"Target Personas : {', '.join([p.capitalize() for p in personas_to_run])}")
    print(f"Total Phrases   : {len(phrases_to_run)} phrases ({total_tasks} audio files)")
    print(f"Destination     : {output_dir}")
    print(f"==================================================\n")

    completed = 0
    skipped = 0
    total_bytes = 0

    for persona_key in personas_to_run:
        p_cfg = ELEVENLABS_PERSONAS[persona_key]
        p_name = p_cfg['name']
        print(f"🔊 Processing Persona: {p_name} ({p_cfg['gender']})...")

        for idx, phrase in enumerate(phrases_to_run, start=1):
            file_name = f"{persona_key}_{phrase['id']}.mp3"
            file_path = output_dir / file_name

            if file_path.exists() and not args.force and file_path.stat().st_size > 1000:
                print(f"  [{idx}/{len(phrases_to_run)}] ⏩ Skipped (already exists): {file_name}")
                skipped += 1
                total_bytes += file_path.stat().st_size
                continue

            print(f"  [{idx}/{len(phrases_to_run)}] 🎙️ Generating: {phrase['id']} ({phrase['category']})...", end='', flush=True)
            success, result = generate_audio(api_key, phrase['spanish'], p_cfg, file_path)

            if success:
                completed += 1
                total_bytes += result
                size_kb = result / 1024
                print(f" ✅ Done ({size_kb:.1f} KB)")
            else:
                print(f" ❌ Failed: {result}")

            # Small polite pause between requests to prevent API throttling
            time.sleep(0.35)

    print(f"\n==================================================")
    print(f"✨ Batch generation complete!")
    print(f"Generated: {completed} new files")
    print(f"Skipped  : {skipped} existing files")
    print(f"Total Size: {total_bytes / (1024 * 1024):.2f} MB")
    print(f"Saved to : {output_dir}")
    print(f"==================================================")

if __name__ == '__main__':
    main()
