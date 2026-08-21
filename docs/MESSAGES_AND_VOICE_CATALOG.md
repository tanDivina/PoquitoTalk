# 🎙️ PoquitoTalk — Master Voice & Message Catalog Reference

> **Complete Archive of All Preset Categories, Curated Phrases, English Prompts, Authentic Panamanian Spanish Translations, and ElevenLabs Studio Voice Personas.**

---

## 1. Studio Voice Personas (ElevenLabs Multilingual v2)

PoquitoTalk is equipped with **4 hyper-realistic Panamanian studio voice personas**, engineered for specific island contexts and contractor interactions:

| Persona | Gender | ElevenLabs Voice ID | Tone & Profile | Best Used For |
| :--- | :--- | :--- | :--- | :--- |
| 👨 **Diego** | Male | `JBFqnCBsd6RMkjVDRZzb` (*George*) | Warm, respectful, friendly tradesman | Boat captains, taxis, dining, island logistics |
| 🧔 **Mateo** | Male | `ErXwobaYiN019PkySvjV` (*Antoni*) | Deep, grounded, authoritative | A/C mechanics, marine outboards, generators |
| 👩 **Sofia** | Female | `cgSgspJ2msm6clMCkdW9` (*Jessica*) | Clear, articulate, professional | Medical clinics, pharmacies, banking, utility bills |
| 👧 **Valeria** | Female | `EXAVITQu4vr4xnSDxMaL` (*Bella*) | Bright, energetic, youthful | Laundry, grocery deliveries, casual dining |

### Studio Voice Generation Parameters:
- **Model Engine**: `eleven_multilingual_v2`
- **Stability**: `0.40 - 0.50` (natural conversational inflection)
- **Similarity Boost**: `0.85` (maximum fidelity to persona profile)
- **Style Exaggeration**: `0.15 - 0.25` (authentic Latin American cadence)
- **Audio Output Standard**: 44.1kHz MP3 @ 128kbps (`assets/audio/presets/{persona}_{preset_id}.mp3`)

---

## 2. Master Voice & Message Library by Category (23 Categories, Curated Phrases)

### 1. Restaurants & Dining (`Dining`)

- **Category ID**: `restaurant_dining`
- **Vector Icon**: `silverware-fork-knife`
- **Overview**: Reserve a table, ask for menu, dietary options (vegan/gluten-free), or opening hours.
- **Default Quick Prompt**: *"Hi, I would like to reserve a dinner table for 4 people tonight at 7:30 PM."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `dining_table_reservation` | **Reserve Dinner Table** | Hi! I would like to reserve a table for 4 people tonight at 7:30 PM, please. | ¡Buenas! Quisiera reservar una mesa para 4 personas hoy a las 7:30 de la noche, por favor. | `diego_dining_table_reservation`<br>`mateo_dining_table_reservation`<br>`sofia_dining_table_reservation`<br>`valeria_dining_table_reservation` |
| `dining_dietary_options` | **Vegan / Dietary Options** | Hello, do you offer vegetarian or gluten-free meal options on your menu? | ¡Hola! ¿Tienen opciones vegetarianas o platos sin gluten en el menú? | `diego_dining_dietary_options`<br>`mateo_dining_dietary_options`<br>`sofia_dining_dietary_options`<br>`valeria_dining_dietary_options` |
| `dining_menu_specials` | **Menu & Today's Specials** | Hi! Could you send me your current food menu and today's specials via WhatsApp? | ¡Buenas! ¿Me podrían enviar su menú actualizado y la pesca del día por WhatsApp? | `diego_dining_menu_specials`<br>`mateo_dining_menu_specials`<br>`sofia_dining_menu_specials`<br>`valeria_dining_menu_specials` |

---

### 2. Groceries & Special Diet (`Groceries`)

- **Category ID**: `groceries_diet`
- **Vector Icon**: `cart-outline`
- **Overview**: Super Gourmet specialty items, gluten-free/vegan foods, fresh seafood catch, and island store hours.
- **Default Quick Prompt**: *"Hi! Do you have gluten-free bread, almond milk, and organic produce in stock today?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `groceries_specialty_diet` | **Gluten-Free / Vegan / Organic** | Hi! Do you carry gluten-free bread, almond/oat milk, and vegan cheese in your store? | ¡Buenas! ¿Tienen en existencia pan sin gluten, leche de almendras o avena, y queso vegano? | `diego_groceries_specialty_diet`<br>`mateo_groceries_specialty_diet`<br>`sofia_groceries_specialty_diet`<br>`valeria_groceries_specialty_diet` |
| `groceries_fresh_seafood_order` | **Fresh Fish / Lobster Catch** | Hello! Do you have fresh snapper (pargo), corvina, or lobster available today and what is the price per pound? | ¡Buenas! ¿Tienen pargo fresco, corvina o langosta hoy y a cómo tienen la libra? | `diego_groceries_fresh_seafood_order`<br>`mateo_groceries_fresh_seafood_order`<br>`sofia_groceries_fresh_seafood_order`<br>`valeria_groceries_fresh_seafood_order` |
| `groceries_whatsapp_delivery_list` | **WhatsApp Grocery Order Delivery** | Hi! Can I send you my grocery list over WhatsApp for delivery to our dock or home address? | ¡Hola! ¿Les puedo mandar mi lista de compras por WhatsApp para que me la preparen y envíen a domicilio? | `diego_groceries_whatsapp_delivery_list`<br>`mateo_groceries_whatsapp_delivery_list`<br>`sofia_groceries_whatsapp_delivery_list`<br>`valeria_groceries_whatsapp_delivery_list` |

---

### 3. Land Taxi & Drivers (`Taxi`)

- **Category ID**: `taxi_land`
- **Vector Icon**: `taxi`
- **Overview**: Island taxis to Paunch/Bluff beach, airport pickup, driver fare quotes.
- **Default Quick Prompt**: *"Hi, I need a land taxi driver to pick me up for a trip to Playa Bluff."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `taxi_beach_trip` | **Taxi to Beach / Resort** | Hi! Are you available for a taxi ride to Playa Bluff / Paunch today? | ¡Buenas! ¿Estará disponible para una carrera en taxi hacia Playa Bluff o Paunch hoy? | `diego_taxi_beach_trip`<br>`mateo_taxi_beach_trip`<br>`sofia_taxi_beach_trip`<br>`valeria_taxi_beach_trip` |
| `taxi_airport_pickup` | **Airport Transfer Pickup** | Hello, what is your rate for an airport pickup transfer in Bocas Town? | ¡Hola! ¿Cuánto me cobra por recogerme en el aeropuerto de Bocas Town? | `diego_taxi_airport_pickup`<br>`mateo_taxi_airport_pickup`<br>`sofia_taxi_airport_pickup`<br>`valeria_taxi_airport_pickup` |
| `taxi_day_rate_hire` | **Daily Driver Hire Quote** | Hi, how much do you charge for half-day driver service around Isla Colón? | ¡Buenas! ¿Cuánto me cobraría por el servicio de chofer por medio día para recorrer Isla Colón? | `diego_taxi_day_rate_hire`<br>`mateo_taxi_day_rate_hire`<br>`sofia_taxi_day_rate_hire`<br>`valeria_taxi_day_rate_hire` |

---

### 4. Water Taxi & Boats (`Boats`)

- **Category ID**: `water_taxi`
- **Vector Icon**: `ferry`
- **Overview**: Boat shuttles to Carenero, Bastimentos, Red Frog, or late night boat rates.
- **Default Quick Prompt**: *"Hi, is a water taxi boat available to take us to Red Frog Beach right now?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `water_taxi_red_frog` | **Water Taxi to Red Frog** | Hi! Is a water taxi available to take 2 people to Red Frog Beach right now? | ¡Buenas capitán! ¿Tendrá lancha disponible para llevar a 2 personas a Red Frog Beach ahora mismo? | `diego_water_taxi_red_frog`<br>`mateo_water_taxi_red_frog`<br>`sofia_water_taxi_red_frog`<br>`valeria_water_taxi_red_frog` |
| `water_taxi_carenero_bastimentos` | **Carenero / Bastimentos Shuttle** | Hello, how much is the boat ride per person from Bocas Town to Carenero / Old Bank? | ¡Hola! ¿A cuánto está el pasaje por persona en lancha desde Bocas Town hasta Carenero u Old Bank? | `diego_water_taxi_carenero_bastimentos`<br>`mateo_water_taxi_carenero_bastimentos`<br>`sofia_water_taxi_carenero_bastimentos`<br>`valeria_water_taxi_carenero_bastimentos` |
| `water_taxi_late_night` | **Late Night Boat Inquiry** | Hi! Are water taxi boats running until late tonight for return trips? | ¡Buenas capitán! ¿Habrá lanchas trabajando hasta tarde esta noche para el viaje de regreso? | `diego_water_taxi_late_night`<br>`mateo_water_taxi_late_night`<br>`sofia_water_taxi_late_night`<br>`valeria_water_taxi_late_night` |

---

### 5. ATMs, Western Union & Cash (`Banking`)

- **Category ID**: `banking_money`
- **Vector Icon**: `cash-multiple`
- **Overview**: Banco Nacional ATM, supermarket ATMs, Western Union transfers, Punto Pago kiosks, and small bill change.
- **Default Quick Prompt**: *"Hi! Does the Banco Nacional ATM or supermarket ATM currently have cash available?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `banking_atm_banconal` | **Banco Nacional ATM Cash Status** | Hi! Does anyone know if the Banco Nacional ATM currently has cash dispensed? | ¡Buenas! ¿Alguien sabe si el cajero del Banco Nacional tiene plata disponible ahora mismo? | `diego_banking_atm_banconal`<br>`mateo_banking_atm_banconal`<br>`sofia_banking_atm_banconal`<br>`valeria_banking_atm_banconal` |
| `banking_atm_police_station` | **ATM in front of Duo2 Market (Near Police)** | Hi! Does anyone know if the ATM in front of Duo2 Market near the police station has cash today? | ¡Buenas! ¿Alguien sabe si el cajero frente a Duo2 Market cerca de la policía tiene efectivo hoy? | `diego_banking_atm_police_station`<br>`mateo_banking_atm_police_station`<br>`sofia_banking_atm_police_station`<br>`valeria_banking_atm_police_station` |
| `banking_atm_supermarket` | **ATM in front of Supermarket Alba (Calle 3ra)** | Hi! Is the ATM in front of Supermarket Alba on main street working and dispensing cash today? | ¡Buenas! ¿Saben si el cajero frente a Supermercado Alba en la calle principal tiene plata hoy? | `diego_banking_atm_supermarket`<br>`mateo_banking_atm_supermarket`<br>`sofia_banking_atm_supermarket`<br>`valeria_banking_atm_supermarket` |
| `banking_western_union` | **Western Union Wire Pickup & Hours** | Hi, is the Western Union agency open today to receive an international money transfer? | ¡Buenas! ¿La agencia de Western Union está abierta hoy para retirar un giro internacional? | `diego_banking_western_union`<br>`mateo_banking_western_union`<br>`sofia_banking_western_union`<br>`valeria_banking_western_union` |
| `banking_punto_pago` | **Punto Pago Kiosk / Utility Bills** | Hello, where is the nearest Punto Pago machine to pay electricity or recharge phone minutes? | ¡Hola! ¿Dónde queda el kiosco de Punto Pago más cercano para pagar la luz o recargar minutos? | `diego_banking_punto_pago`<br>`mateo_banking_punto_pago`<br>`sofia_banking_punto_pago`<br>`valeria_banking_punto_pago` |
| `banking_small_bill_change` | **Change $50 / $100 for Small Bills** | Hello, could you break a $100 / $50 bill into smaller $5, $10, and $20 notes, please? | ¡Buenas! ¿Disculpe, tendrá cambio de un billete de 100 o 50 en billetes chicos de 5, 10 y 20 dólares? | `diego_banking_small_bill_change`<br>`mateo_banking_small_bill_change`<br>`sofia_banking_small_bill_change`<br>`valeria_banking_small_bill_change` |

---

### 6. Power Outage & Generators (`Power`)

- **Category ID**: `power_blackout`
- **Vector Icon**: `lightning-bolt`
- **Overview**: Naturgy power blackout status, generator diesel/gasoline delivery, voltage fluctuations, and inverter check.
- **Default Quick Prompt**: *"Hi! Did the power go out in the whole sector or is it just our transformer?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `power_blackout_status` | **Naturgy Sector Blackout Check** | Hi! Did the power go out across the whole sector/island or is there an estimated restore time? | ¡Buenas! ¿Se fue la luz en todo el sector o se sabe a qué hora regresará el servicio eléctrico? | `diego_power_blackout_status`<br>`mateo_power_blackout_status`<br>`sofia_power_blackout_status`<br>`valeria_power_blackout_status` |
| `power_generator_fuel_delivery` | **Generator Fuel / Diesel Delivery** | Hello! Can someone deliver 5 gallons of gasoline/diesel in a safety can for our backup generator? | ¡Hola! ¿Podrían traerme 5 galones de gasolina o diesel en paila para el generador de respaldo? | `diego_power_generator_fuel_delivery`<br>`mateo_power_generator_fuel_delivery`<br>`sofia_power_generator_fuel_delivery`<br>`valeria_power_generator_fuel_delivery` |
| `power_low_voltage_fluctuation` | **Low Voltage / Breaker Tripping** | Hi, we are experiencing severe voltage drops and flickering lights. Could an electrician inspect the main panel? | ¡Buenas! Hay un bajón de voltaje muy fuerte y las luces parpadean. ¿Podría venir un electricista a revisar la caja de breakers? | `diego_power_low_voltage_fluctuation`<br>`mateo_power_low_voltage_fluctuation`<br>`sofia_power_low_voltage_fluctuation`<br>`valeria_power_low_voltage_fluctuation` |

---

### 7. Starlink & Internet Outage (`Internet`)

- **Category ID**: `starlink_internet`
- **Vector Icon**: `satellite-variant`
- **Overview**: Starlink dish connection drops, local fiber cuts, router reboot, and speed checks.
- **Default Quick Prompt**: *"My Starlink dish lost signal connection and the router light is red."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `starlink_dish_offline` | **Starlink Dish Disconnected** | Hi, the Starlink dish lost connection. Is there a signal outage in the area? | ¡Buenas! La antena de Starlink perdió la señal. ¿Hay alguna caída general del servicio en la zona? | `diego_starlink_dish_offline`<br>`mateo_starlink_dish_offline`<br>`sofia_starlink_dish_offline`<br>`valeria_starlink_dish_offline` |
| `starlink_fiber_damaged` | **Fiber Cable Damaged** | Hello, the internet fiber cable outside the house appears damaged or cut. | ¡Hola! El cable de fibra óptica afuera de la casa parece estar dañado o cortado. | `diego_starlink_fiber_damaged`<br>`mateo_starlink_fiber_damaged`<br>`sofia_starlink_fiber_damaged`<br>`valeria_starlink_fiber_damaged` |
| `starlink_slow_line_check` | **Router Reboot / Low Speed** | Hi, the internet is very slow today. Could you check the line status? | ¡Buenas! El internet está demasiado lento hoy. ¿Podría verificar el estado de la línea desde la central? | `diego_starlink_slow_line_check`<br>`mateo_starlink_slow_line_check`<br>`sofia_starlink_slow_line_check`<br>`valeria_starlink_slow_line_check` |

---

### 8. Landlord & Housing (`Housing`)

- **Category ID**: `landlord_housing`
- **Vector Icon**: `home-city-outline`
- **Overview**: Rent inquiries, spare keys, water pressure, garbage collection, gate access.
- **Default Quick Prompt**: *"Hi, the water pressure in the shower dropped significantly today."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `landlord_water_pressure` | **Low Water Pressure** | Hi! The water pressure in the main bathroom dropped completely. | ¡Buenas! La presión del agua en el baño principal se cayó por completo. | `diego_landlord_water_pressure`<br>`mateo_landlord_water_pressure`<br>`sofia_landlord_water_pressure`<br>`valeria_landlord_water_pressure` |
| `landlord_spare_key` | **Spare Key Request** | Hello, I accidentally locked myself out. Do you have a spare key nearby? | ¡Hola! Se me quedaron las llaves adentro por accidente. ¿Tendrá una llave de repuesto cerca? | `diego_landlord_spare_key`<br>`mateo_landlord_spare_key`<br>`sofia_landlord_spare_key`<br>`valeria_landlord_spare_key` |
| `landlord_rent_transfer_proof` | **Rent & Utility Payment** | Hi, I sent the rent payment via transfer and attached the proof. | ¡Buenas! Ya le envié el pago del alquiler por transferencia bancaria y le adjunto el comprobante. | `diego_landlord_rent_transfer_proof`<br>`mateo_landlord_rent_transfer_proof`<br>`sofia_landlord_rent_transfer_proof`<br>`valeria_landlord_rent_transfer_proof` |

---

### 9. Air Conditioning (A/C) (`A/C`)

- **Category ID**: `ac_repair`
- **Vector Icon**: `snowflake`
- **Overview**: A/C leaking, remote control issues, refrigerant refill, or no cold air.
- **Default Quick Prompt**: *"My air conditioning unit is leaking water and not blowing cold air."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `ac_leaking_water` | **A/C Leaking Water** | Hi! The air conditioner is leaking water inside the room. Could you come check it? | ¡Buenas! El aire acondicionado está botando agua dentro de la habitación. ¿Podría venir a revisarlo hoy? | `diego_ac_leaking_water`<br>`mateo_ac_leaking_water`<br>`sofia_ac_leaking_water`<br>`valeria_ac_leaking_water` |
| `ac_gas_refill` | **Needs Gas/Refrigerant** | Hello, the air conditioner turns on but is not blowing cold air. I think it needs gas refill. | ¡Hola! El aire acondicionado prende pero no tira aire frío. Me parece que le hace falta una recarga de gas. | `diego_ac_gas_refill`<br>`mateo_ac_gas_refill`<br>`sofia_ac_gas_refill`<br>`valeria_ac_gas_refill` |
| `ac_remote_not_working` | **Remote Not Working** | Hello, the air conditioner remote control is not responding. Could you check it? | ¡Buenas! El control remoto del aire acondicionado no responde. ¿Podrían revisarlo? | `diego_ac_remote_not_working`<br>`mateo_ac_remote_not_working`<br>`sofia_ac_remote_not_working`<br>`valeria_ac_remote_not_working` |

---

### 10. Fridge & Appliances (`Appliances`)

- **Category ID**: `broken_fridge`
- **Vector Icon**: `fridge-outline`
- **Overview**: Fridge not cooling, freezer defrosting, stove or washing machine broken.
- **Default Quick Prompt**: *"Our refrigerator stopped cooling and the food inside is defrosting."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `fridge_not_cooling` | **Fridge Not Cooling** | Hi! The refrigerator stopped cooling and the food inside is defrosting. Can you inspect it today? | ¡Buenas! La refrigeradora dejó de enfriar y la comida se está descongelando. ¿Podría venir a revisarla hoy? | `diego_fridge_not_cooling`<br>`mateo_fridge_not_cooling`<br>`sofia_fridge_not_cooling`<br>`valeria_fridge_not_cooling` |
| `fridge_gas_leak` | **Gas Leak / Compressor Noise** | Hello, the fridge compressor is making a loud buzzing noise and not keeping cold. | ¡Hola! El compresor de la refrigeradora hace un zumbido fuerte y no mantiene el frío. | `diego_fridge_gas_leak`<br>`mateo_fridge_gas_leak`<br>`sofia_fridge_gas_leak`<br>`valeria_fridge_gas_leak` |
| `washing_machine_broken` | **Washing Machine Not Draining** | Hi! The washing machine is not draining water during the spin cycle. | ¡Buenas! La lavadora no está botando el agua durante el ciclo de centrifugado. | `diego_washing_machine_broken`<br>`mateo_washing_machine_broken`<br>`sofia_washing_machine_broken`<br>`valeria_washing_machine_broken` |

---

### 11. Hardware & Ferretería (`Hardware`)

- **Category ID**: `hardware_construction`
- **Vector Icon**: `hammer-wrench`
- **Overview**: Wood screws, zinc roofing sheets, PVC pipes, cement bags, tools, and island construction supplies.
- **Default Quick Prompt**: *"Hi! Do you have stainless steel wood screws, PVC pipe fittings, and cement bags in stock?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `hardware_screws_nails` | **Stainless Screws & Marine Fasteners** | Hi! Do you have 2-inch stainless steel wood screws and marine-grade fasteners in stock? | ¡Buenas! ¿Tienen tornillos de acero inoxidable de dos pulgadas para madera y fijaciones marinas? | `diego_hardware_screws_nails`<br>`mateo_hardware_screws_nails`<br>`sofia_hardware_screws_nails`<br>`valeria_hardware_screws_nails` |
| `hardware_zinc_roofing` | **Zinc Roof Sheets & Plywood** | Hello! Do you have corrugated zinc roofing sheets and marine plywood boards with delivery available? | ¡Buenas! ¿Tienen láminas de zinc ondulado para techo y madera contrachapada marina con entrega a domicilio? | `diego_hardware_zinc_roofing`<br>`mateo_hardware_zinc_roofing`<br>`sofia_hardware_zinc_roofing`<br>`valeria_hardware_zinc_roofing` |
| `hardware_pvc_plumbing_pipes` | **PVC Pipes, Elbows & Glue** | Hi, I need half-inch PVC water pipes, elbows, adapters, and heavy-duty PVC cement glue. | ¡Hola! Necesito tubos de PVC para agua de media pulgada, codos, adaptadores y pegamento de PVC. | `diego_hardware_pvc_plumbing_pipes`<br>`mateo_hardware_pvc_plumbing_pipes`<br>`sofia_hardware_pvc_plumbing_pipes`<br>`valeria_hardware_pvc_plumbing_pipes` |
| `hardware_cement_sand_bags` | **Cement Bags & Sand Delivery** | Hello, how much for 5 bags of grey cement and sand delivered to the island dock? | ¡Buenas! ¿Cuánto saldrían 5 sacos de cemento gris con arena puestos en el muelle de la isla? | `diego_hardware_cement_sand_bags`<br>`mateo_hardware_cement_sand_bags`<br>`sofia_hardware_cement_sand_bags`<br>`valeria_hardware_cement_sand_bags` |

---

### 12. Doctor & Medical Clinic (`Doctor`)

- **Category ID**: `doctor_clinic`
- **Vector Icon**: `hospital-building`
- **Overview**: Schedule doctor consultations, lab blood work, fever or illness checkups, and urgent clinic visits.
- **Default Quick Prompt**: *"Hi, I have a fever and severe pain. Is a doctor available for a consultation today?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `med_doctor_visit` | **Urgent Doctor Visit** | Hi! I have a fever and severe pain. Is a doctor available for a consultation today? | ¡Buenas! Tengo fiebre alta y dolor fuerte. ¿Habrá algún médico disponible para una consulta hoy? | `diego_med_doctor_visit`<br>`mateo_med_doctor_visit`<br>`sofia_med_doctor_visit`<br>`valeria_med_doctor_visit` |
| `med_doctor_lab_results` | **Doctor Follow-Up / Lab Results** | Hi, I would like to inquire if the results of my blood tests or lab exams are ready. | ¡Buenas! Quisiera consultar si ya tienen listos los resultados de mis exámenes de laboratorio. | `diego_med_doctor_lab_results`<br>`mateo_med_doctor_lab_results`<br>`sofia_med_doctor_lab_results`<br>`valeria_med_doctor_lab_results` |
| `med_emergency_ambulance` | **Medical Emergency Help** | Hi! I need urgent medical assistance or an ambulance immediately, please. | ¡Urgente! Necesito asistencia médica de emergencia o una ambulancia de inmediato, por favor. | `diego_med_emergency_ambulance`<br>`mateo_med_emergency_ambulance`<br>`sofia_med_emergency_ambulance`<br>`valeria_med_emergency_ambulance` |

---

### 13. Pharmacy & Prescriptions (`Pharmacy`)

- **Category ID**: `pharmacy_prescriptions`
- **Vector Icon**: `pill`
- **Overview**: Inquire about prescription medications, antibiotics, pain relief, rehydration salts, and opening hours.
- **Default Quick Prompt**: *"Hi, do you have medication for fever and infection in the pharmacy today?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `med_pharmacy_meds` | **Pharmacy Medication & Hours** | Hello, do you have medication for fever/infection in the pharmacy and what time are you open until? | ¡Buenas! ¿Tienen medicamentos para la fiebre o infección en la farmacia y hasta qué hora están abiertos hoy? | `diego_med_pharmacy_meds`<br>`mateo_med_pharmacy_meds`<br>`sofia_med_pharmacy_meds`<br>`valeria_med_pharmacy_meds` |
| `pharmacy_prescription_whatsapp` | **Send Prescription Photo** | Hi! Can I send you a photo of my doctor prescription over WhatsApp so you can prepare it for pickup? | ¡Hola! ¿Le puedo enviar una foto de la receta médica por WhatsApp para que me tengan el medicamento listo para retirar? | `diego_pharmacy_prescription_whatsapp`<br>`mateo_pharmacy_prescription_whatsapp`<br>`sofia_pharmacy_prescription_whatsapp`<br>`valeria_pharmacy_prescription_whatsapp` |
| `pharmacy_rehydration_electrolytes` | **Electrolytes & Stomach Relief** | Hi! Do you have oral rehydration electrolyte packets (suero oral) and stomach relief pills available? | ¡Buenas! ¿Tienen sobres de suero oral de rehidratación y pastillas para el estómago disponibles? | `diego_pharmacy_rehydration_electrolytes`<br>`mateo_pharmacy_rehydration_electrolytes`<br>`sofia_pharmacy_rehydration_electrolytes`<br>`valeria_pharmacy_rehydration_electrolytes` |

---

### 14. Dentist & Dental Care (`Dentist`)

- **Category ID**: `dentist_appointments`
- **Vector Icon**: `tooth`
- **Overview**: Schedule urgent dentist visits for toothaches, teeth cleaning checkups, or broken filling repairs.
- **Default Quick Prompt**: *"Hi, I have a severe toothache and need an urgent dentist appointment today."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `dent_urgent_toothache` | **Urgent Toothache Appointment** | Hi! I have a severe toothache. Is a dentist appointment available today? | ¡Buenas! Tengo un dolor de muela muy fuerte. ¿Tendrá cupo disponible con el odontólogo hoy? | `diego_dent_urgent_toothache`<br>`mateo_dent_urgent_toothache`<br>`sofia_dent_urgent_toothache`<br>`valeria_dent_urgent_toothache` |
| `dent_cleaning_schedule` | **Schedule Dental Cleaning** | Hello, I would like to schedule a dental cleaning and checkup appointment for next week. | ¡Hola! Quisiera agendar una cita para una limpieza dental y revisión para la próxima semana, por favor. | `diego_dent_cleaning_schedule`<br>`mateo_dent_cleaning_schedule`<br>`sofia_dent_cleaning_schedule`<br>`valeria_dent_cleaning_schedule` |
| `dent_broken_filling_repair` | **Broken Tooth / Filling Repair** | Hi! A tooth filling fell out and I need to have a broken tooth repaired as soon as possible. | ¡Buenas! Se me cayó una calza de una muela y necesito arreglarme el diente lo más pronto posible. | `diego_dent_broken_filling_repair`<br>`mateo_dent_broken_filling_repair`<br>`sofia_dent_broken_filling_repair`<br>`valeria_dent_broken_filling_repair` |

---

### 15. Pet Care & Island Vet (`Pet Vet`)

- **Category ID**: `pet_vet_emergency`
- **Vector Icon**: `paw`
- **Overview**: Urgent vet appointments, cane toad/snake toxicity, rabies/flea medication, and spay/neuter clinic.
- **Default Quick Prompt**: *"Hi! I have an emergency with my dog, is the vet clinic open today?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `pet_emergency_vet_visit` | **Urgent Pet Exam / Sickness** | Hi! My pet is vomiting and lethargic. Is a veterinarian available for an emergency consultation right now? | ¡Buenas! Mi mascota está vomitando y decaída. ¿Habrá un veterinario disponible para una consulta de urgencia ahora mismo? | `diego_pet_emergency_vet_visit`<br>`mateo_pet_emergency_vet_visit`<br>`sofia_pet_emergency_vet_visit`<br>`valeria_pet_emergency_vet_visit` |
| `pet_toad_snake_toxicity` | **Cane Toad / Poison Emergency** | Urgent! My dog bit a cane toad and has foaming at the mouth. What immediate steps should I take and are you open? | ¡Urgente! Mi perro mordió un sapo y tiene espuma en la boca. ¿Qué primeros auxilios le hago y están abiertos ya? | `diego_pet_toad_snake_toxicity`<br>`mateo_pet_toad_snake_toxicity`<br>`sofia_pet_toad_snake_toxicity`<br>`valeria_pet_toad_snake_toxicity` |
| `pet_flea_tick_meds` | **Flea, Tick & Heartworm Meds** | Hello, do you have Nexgard/Bravecto chewables and tick prevention medication in stock? | ¡Hola! ¿Tienen pastillas masticables para garrapatas y pulgas como Nexgard o Bravecto disponibles? | `diego_pet_flea_tick_meds`<br>`mateo_pet_flea_tick_meds`<br>`sofia_pet_flea_tick_meds`<br>`valeria_pet_flea_tick_meds` |

---

### 16. Boat & Outboard Repair (`Outboard`)

- **Category ID**: `boat_repair`
- **Vector Icon**: `engine`
- **Overview**: Yamaha 2-stroke outboard mechanics, fuel filter replacement, impeller issues, and fiberglass repair.
- **Default Quick Prompt**: *"Hi, my Yamaha outboard motor won't start and seems to have water in the fuel tank."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `boat_engine_not_starting` | **Outboard Motor Won't Start** | Hi! My Yamaha 40hp outboard won't start. Could a mechanic come inspect the spark plugs and carburetor? | ¡Buenas capitán! Mi motor Yamaha 40 no quiere arrancar. ¿Podría venir un mecánico a revisar las bujías y el carburador? | `diego_boat_engine_not_starting`<br>`mateo_boat_engine_not_starting`<br>`sofia_boat_engine_not_starting`<br>`valeria_boat_engine_not_starting` |
| `boat_propeller_impeller_change` | **Impeller / Water Pump Overheating** | Hello, the engine is not peeing cooling water. I need an urgent impeller replacement before it overheats. | ¡Hola! El motor no está botando el chorro de agua de refrigeración. Necesito cambiarle el impeller urgente. | `diego_boat_propeller_impeller_change`<br>`mateo_boat_propeller_impeller_change`<br>`sofia_boat_propeller_impeller_change`<br>`valeria_boat_propeller_impeller_change` |
| `boat_fiberglass_patch` | **Fiberglass / Hull Repair** | Hi, I have a small crack in the fiberglass hull that is taking in water. Do you do boat repairs? | ¡Buenas! Tengo una fisura en el casco de fibra de vidrio que está filtrando agua. ¿Usted hace trabajos de fibra? | `diego_boat_fiberglass_patch`<br>`mateo_boat_fiberglass_patch`<br>`sofia_boat_fiberglass_patch`<br>`valeria_boat_fiberglass_patch` |

---

### 17. Car & Golf Cart Repair (`Mechanic`)

- **Category ID**: `car_mechanic`
- **Vector Icon**: `car-wrench`
- **Overview**: Flat tire repair, battery jump start, brake pads, and golf cart electric troubleshooting.
- **Default Quick Prompt**: *"Hi, my car battery died and I need a jump start in Bocas Town."*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `car_battery_jump_start` | **Dead Battery Jump Start** | Hi! My car battery is completely dead. Is someone available to bring jumper cables for a jump start? | ¡Buenas! Me quedé sin batería en el auto. ¿Habrá alguien disponible que me pueda pasar corriente con cables? | `diego_car_battery_jump_start`<br>`mateo_car_battery_jump_start`<br>`sofia_car_battery_jump_start`<br>`valeria_car_battery_jump_start` |
| `car_flat_tire_patch` | **Flat Tire Repair / Llantas** | Hello, I have a flat tire. Where is the nearest vulcanizadora or tire repair shop in Isla Colón? | ¡Hola! Se me ponchó una llanta. ¿Dónde queda la vulcanizadora o taller de llantas más cercano? | `diego_car_flat_tire_patch`<br>`mateo_car_flat_tire_patch`<br>`sofia_car_flat_tire_patch`<br>`valeria_car_flat_tire_patch` |
| `car_golf_cart_electric_issue` | **Golf Cart Battery & Wiring** | Hi, our electric golf cart is losing power quickly and not charging. Could a technician take a look? | ¡Buenas! El carrito de golf eléctrico se descarga muy rápido y no agarra carga. ¿Podría revisarlo un técnico? | `diego_car_golf_cart_electric_issue`<br>`mateo_car_golf_cart_electric_issue`<br>`sofia_car_golf_cart_electric_issue`<br>`valeria_car_golf_cart_electric_issue` |

---

### 18. Water Delivery & Cisterns (`Water`)

- **Category ID**: `water_supply`
- **Vector Icon**: `water-pump`
- **Overview**: Emergency water truck delivery, 5-gallon drinking jugs, cistern refills, and pump priming.
- **Default Quick Prompt**: *"Hi! Do you have a water truck available to fill a reserve cistern tank at my house today?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `water_cistern_truck` | **Water Truck / Cistern Refill** | Hi! Do you have a water tanker truck available to fill a 1,500 gallon reserve tank at my property today? | ¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de mil quinientos galones. | `diego_water_cistern_truck`<br>`mateo_water_cistern_truck`<br>`sofia_water_cistern_truck`<br>`valeria_water_cistern_truck` |
| `water_jugs_delivery` | **5-Gallon Drinking Water Jugs** | Hello, do you do home delivery for three 5-gallon purified drinking water jugs today? | ¡Buenas tardes! ¿Hacen entrega a domicilio de 3 botellones de agua purificada de 5 galones hoy? | `diego_water_jugs_delivery`<br>`mateo_water_jugs_delivery`<br>`sofia_water_jugs_delivery`<br>`valeria_water_jugs_delivery` |
| `water_pump_lost_prime` | **Water Pump Lost Prime / Pressure** | Hi, the water pump ran dry and lost pressure. Could a technician come check and prime the pump? | ¡Hola! La bomba de agua del tanque se quedó sin agua y perdió la presión. ¿Podría venir un técnico a purgarla y revisarla? | `diego_water_pump_lost_prime`<br>`mateo_water_pump_lost_prime`<br>`sofia_water_pump_lost_prime`<br>`valeria_water_pump_lost_prime` |
| `water_filter_maintenance` | **Rain Catchment & Filter Service** | Hello, I need to schedule a filter change and maintenance for my rainwater catchment system, please. | ¡Buenas! Necesito hacerle cambio de filtros y mantenimiento al sistema de captación de agua de lluvia, por favor. | `diego_water_filter_maintenance`<br>`mateo_water_filter_maintenance`<br>`sofia_water_filter_maintenance`<br>`valeria_water_filter_maintenance` |

---

### 19. Border Runs (Costa Rica) (`Border Runs`)

- **Category ID**: `border_immigration`
- **Vector Icon**: `passport`
- **Overview**: Costa Rica border runs via Sixaola/Guabito, Migración exit & entry stamps, shared taxi to Almirante docks, and customs.
- **Default Quick Prompt**: *"Hi! I am doing a visa run at the border for renewal stamps. Where is the Migración office?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `border_exit_entry_stamp` | **Tourist Visa Run / Border Stamp** | Hi! I came for my exit and entry stamp to renew my tourist stay. How much is the tax/stamp fee? | ¡Buenas! Vengo a hacer el sello de salida y entrada para la renovación de mi estadía de turista. ¿Cuánto es el costo de los timbres? | `diego_border_exit_entry_stamp`<br>`mateo_border_exit_entry_stamp`<br>`sofia_border_exit_entry_stamp`<br>`valeria_border_exit_entry_stamp` |
| `border_taxi_to_almirante` | **Taxi: Guabito to Almirante Docks** | Hello! How much is a taxi from the Guabito border to the water taxi boat docks in Almirante? | ¡Hola! ¿Cuánto me cobra por el viaje en taxi desde la frontera de Guabito hasta el muelle de lanchas en Almirante? | `diego_border_taxi_to_almirante`<br>`mateo_border_taxi_to_almirante`<br>`sofia_border_taxi_to_almirante`<br>`valeria_border_taxi_to_almirante` |
| `border_customs_clearance` | **Customs & Luggage Clearance** | Hi! I have personal luggage and small retail purchases. Where do I go for customs inspection? | ¡Buenas! Traigo equipaje personal y algunas compras menores. ¿Dónde paso para la revisión de Aduanas? | `diego_border_customs_clearance`<br>`mateo_border_customs_clearance`<br>`sofia_border_customs_clearance`<br>`valeria_border_customs_clearance` |
| `border_shuttle_puerto_viejo` | **Bus / Shuttle to Puerto Viejo (CR)** | Hello, what time does the next shared bus or shuttle depart from Sixaola towards Puerto Viejo / San José? | ¡Buenas! ¿A qué hora sale el próximo bus o colectivo hacia Puerto Viejo / San José desde Sixaola? | `diego_border_shuttle_puerto_viejo`<br>`mateo_border_shuttle_puerto_viejo`<br>`sofia_border_shuttle_puerto_viejo`<br>`valeria_border_shuttle_puerto_viejo` |

---

### 20. Pricing & Yappy Payments (`Yappy & Pay`)

- **Category ID**: `price_yappy_pay`
- **Vector Icon**: `cash-multiple`
- **Overview**: Ask final price, confirm total, request account number, and send Yappy receipt.
- **Default Quick Prompt**: *"What is your best final price and do you accept payment via Yappy?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `yappy_final_price` | **Ask Final / Best Price** | What is your best / final price for the service? | ¿Cuánto sería lo último por el servicio? | `diego_yappy_final_price`<br>`mateo_yappy_final_price`<br>`sofia_yappy_final_price`<br>`valeria_yappy_final_price` |
| `yappy_payment_method` | **Accept Yappy or Cash Only?** | Do you accept payment via Yappy or only cash? | ¿Aceptan pago por Yappy o solo efectivo? | `diego_yappy_payment_method`<br>`mateo_yappy_payment_method`<br>`sofia_yappy_payment_method`<br>`valeria_yappy_payment_method` |
| `yappy_receipt_sent` | **Receipt Sent via Yappy** | I already sent the payment via Yappy and attached the receipt here. | Ya le hice el envío por Yappy y le adjunto el comprobante. | `diego_yappy_receipt_sent`<br>`mateo_yappy_receipt_sent`<br>`sofia_yappy_receipt_sent`<br>`valeria_yappy_receipt_sent` |

---

### 21. Location & Dock ETA (`Dock & ETA`)

- **Category ID**: `dock_location_eta`
- **Vector Icon**: `map-marker-radius`
- **Overview**: Boat arrival, meeting at dock, estimated arrival time, and live GPS location.
- **Default Quick Prompt**: *"Hi, I am already waiting at the main dock. What is your estimated arrival time?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `dock_waiting_here` | **Waiting at Main Dock** | Hi! I am already waiting for you at the main dock. | ¡Buenas! Ya estoy esperándolo en el muelle principal. | `diego_dock_waiting_here`<br>`mateo_dock_waiting_here`<br>`sofia_dock_waiting_here`<br>`valeria_dock_waiting_here` |
| `dock_estimated_arrival` | **Estimated Arrival Time** | What time do you estimate you will arrive at the house / dock? | ¿A qué hora calcula que estaría llegando a la casa? | `diego_dock_estimated_arrival`<br>`mateo_dock_estimated_arrival`<br>`sofia_dock_estimated_arrival`<br>`valeria_dock_estimated_arrival` |
| `dock_share_location` | **Sharing Exact Live GPS** | I am sharing my exact live location here so you do not get lost. | Le comparto mi ubicación exacta por aquí para que no se pierda. | `diego_dock_share_location`<br>`mateo_dock_share_location`<br>`sofia_dock_share_location`<br>`valeria_dock_share_location` |

---

### 22. Follow-Up & Confirmation (`Follow-Up`)

- **Category ID**: `followup_schedule`
- **Vector Icon**: `clock-check-outline`
- **Overview**: Confirm appointment, check same-day availability, notify delays, and confirm tomorrow morning.
- **Default Quick Prompt**: *"Sorry to bother you, are you still available to come today?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `followup_still_available` | **Still Available Today?** | Sorry to bother you, are you still available to come today? | Disculpe la molestia, ¿sigue disponible para venir hoy? | `diego_followup_still_available`<br>`mateo_followup_still_available`<br>`sofia_followup_still_available`<br>`valeria_followup_still_available` |
| `followup_heading_there` | **On My Way Now** | Sorry for the delay, I am heading there right now. | Disculpe la demora, voy saliendo para allá ahora mismo. | `diego_followup_heading_there`<br>`mateo_followup_heading_there`<br>`sofia_followup_heading_there`<br>`valeria_followup_heading_there` |
| `followup_confirmed_tomorrow` | **Confirmed for Tomorrow Morning** | Great, confirmed for tomorrow morning. Thank you very much! | Excelente, quedamos así para mañana en la mañana. ¡Muchas gracias! | `diego_followup_confirmed_tomorrow`<br>`mateo_followup_confirmed_tomorrow`<br>`sofia_followup_confirmed_tomorrow`<br>`valeria_followup_confirmed_tomorrow` |

---

### 23. Gardening & Plant Nursery (`Gardening`)

- **Category ID**: `gardening_plants`
- **Vector Icon**: `sprout-outline`
- **Overview**: Lawn mowing, tree trimming, machete brush clearing, fruit trees, garden soil, and tropical ornamental plants.
- **Default Quick Prompt**: *"Hi! Do you do garden clearing, grass cutting, and do you sell tropical plants or fruit trees?"*

| Phrase ID | Scenario / Title | English Prompt | Authentic Panamanian Spanish | Audio Asset Keys |
| :--- | :--- | :--- | :--- | :--- |
| `garden_mowing_chapeo` | **Lawn Mowing & Bush Clearing (Chapeo)** | Hi! I need someone to cut the grass and clear overgrown brush on my property. Are you available this week? | ¡Buenas! Necesito hacer un chapeo y corte de grama en mi terreno. ¿Tendrá disponibilidad esta semana? | `diego_garden_mowing_chapeo`<br>`mateo_garden_mowing_chapeo`<br>`sofia_garden_mowing_chapeo`<br>`valeria_garden_mowing_chapeo` |
| `garden_plants_fruit_trees` | **Tropical Plants & Fruit Trees for Sale** | Hello! Do you have fruit trees (lime, mango, avocado) or tropical ornamental plants available for sale? | ¡Buenas! ¿Tienen arbolitos frutales (limón, mango, aguacate) o plantas ornamentales tropicales a la venta? | `diego_garden_plants_fruit_trees`<br>`mateo_garden_plants_fruit_trees`<br>`sofia_garden_plants_fruit_trees`<br>`valeria_garden_plants_fruit_trees` |
| `garden_tree_palm_trimming` | **Tree Trimming / Coconut Cutting** | Hi! I have tall coconut trees and branches that need safe trimming before the next storm. Could you give me a quote? | ¡Buenas! Tengo unas palmas de coco y ramas altas que necesito podar por seguridad. ¿Cuánto me cobraría por el trabajo? | `diego_garden_tree_palm_trimming`<br>`mateo_garden_tree_palm_trimming`<br>`sofia_garden_tree_palm_trimming`<br>`valeria_garden_tree_palm_trimming` |
| `garden_soil_compost_delivery` | **Black Soil & Compost Delivery** | Hello, do you deliver sacks of black garden soil (tierra negra) and organic compost to the property or dock? | ¡Hola! ¿Hacen entrega de sacos de tierra negra abonada y abono orgánico para jardín a domicilio o al muelle? | `diego_garden_soil_compost_delivery`<br>`mateo_garden_soil_compost_delivery`<br>`sofia_garden_soil_compost_delivery`<br>`valeria_garden_soil_compost_delivery` |

---

## 3. Optical Document Scanner & Utility Dispute Templates

In addition to standard service presets, PoquitoTalk provides specialized dispute and inquiry templates for Panamanian utility providers:

### A. Naturgy Electric Bill Dispute (`power_blackout`)
- **English Prompt**: *"Hello Naturgy, my electric meter NIC shows a charge of $184.20 which is 3x my normal average. Could you inspect the meter for a surge error?"*
- **Panamanian Spanish**: *"¡Buenas! Les escribo respecto al suministro NIC con número de medidor. El monto facturado de este mes está muy por encima de mi consumo habitual. ¿Podrían enviar una cuadrilla técnica a revisar si hubo un error de lectura o fuga en el medidor?"*

### B. IDAAN Water Cistern & Service Outage (`water_supply`)
- **English Prompt**: *"Good afternoon, the municipal water pressure in Isla Colón has dropped to zero for 2 days. When will the main line be pressurized?"*
- **Panamanian Spanish**: *"¡Buenas tardes! En nuestro sector de Isla Colón no hay presión de agua potable desde hace dos días. ¿Se sabe si hay daño en la tubería principal y a qué hora restablecen el servicio?"*

### C. Cable & Wireless / Tigo / Starlink Internet Outage (`internet_wifi`)
- **English Prompt**: *"Hi, our fiber internet connection dropped after the thunderstorm. Router light is blinking red. Can you check the sector node?"*
- **Panamanian Spanish**: *"¡Buenas! La conexión a internet se cayó después del aguacero y el módem tiene la luz roja titilando. ¿Tienen reporte de caída de fibra óptica en la zona?"*

---

## 4. Summary Metrics
- **Total Preset Categories**: 23
- **Total Curated Phrases**: 76
- **Pre-Rendered Studio Audio Files**: 304 voice files across 4 personas (`assets/audio/presets/`)
- **Web Funnel Mirror Audio**: 304 voice files (`web-funnel/audio/presets/`)

