import { ServicePreset } from '../types';

export interface PastelTheme {
  bg: string;
  border: string;
  accent: string;
  badgeBg: string;
  chipBg: string;
}

export interface CategoryMeta {
  id: string;
  category: string;
  color: string;
  bg: string;
  border: string;
  badgeBg: string;
  chipBg: string;
  icon: string;         // MaterialCommunityIcons name
  ioniconsName: string; // Ionicons name
}

export const SERVICE_PRESETS: ServicePreset[] = [
  // ----------------------------------------------------
  // 1. BOAT CAPTAINS & MARINE (#0284C7)
  // ----------------------------------------------------
  {
    id: 'boat',
    category: 'Boats',
    title: 'Boat Captains & Marine',
    icon: 'ferry',
    description: 'Water taxis to Carenero, Bastimentos, Red Frog, outboard motor maintenance & hull repairs.',
    defaultInputPrompt: 'Hi Captain, is a water taxi available to take us to Red Frog Beach right now?',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'water_taxi', label: 'Water Taxis', icon: 'ferry' },
      { id: 'outboard_hull', label: 'Outboard & Hull Repair', icon: 'wrench' },
    ],
    phrases: [
      {
        id: 'water_taxi_red_frog',
        subCategory: 'water_taxi',
        subCategoryLabel: 'Water Taxis',
        title: 'Water Taxi to Red Frog',
        input: 'Hi! Is a water taxi available to take 2 people to Red Frog Beach right now?',
        output: '¡Buenas capitán! ¿Tendrá lancha disponible para llevar a 2 personas a Red Frog Beach ahora mismo?',
        fullPanamenoOutput: '¡Qué xopá capitán! ¿Tiene lancha lista pa llevar a dos personas a Red Frog de una vez?',
      },
      {
        id: 'water_taxi_carenero_bastimentos',
        subCategory: 'water_taxi',
        subCategoryLabel: 'Water Taxis',
        title: 'Carenero / Bastimentos Shuttle',
        input: 'Hello, how much is the boat ride per person from Bocas Town to Carenero / Old Bank?',
        output: '¡Hola! ¿Me puede decir a cuánto está el pasaje por persona en lancha desde Bocas Town hasta Carenero u Old Bank?',
        fullPanamenoOutput: '¡Buenas! ¿Cuánto cobra por cabeza pa cruzar a Carenero o a Old Bank en Bastimentos?',
      },
      {
        id: 'water_taxi_late_night',
        subCategory: 'water_taxi',
        subCategoryLabel: 'Water Taxis',
        title: 'Late Night Boat Inquiry',
        input: 'Hi! Are water taxi boats running until late tonight for return trips?',
        output: '¡Buenas capitán! ¿Habrá lanchas trabajando hasta tarde esta noche para el viaje de regreso?',
        fullPanamenoOutput: '¡Xopá capitán! ¿Hasta qué hora van a estar tirando viajes las lanchas esta noche pa volver?',
      },
      {
        id: 'boat_engine_not_starting',
        subCategory: 'outboard_hull',
        subCategoryLabel: 'Outboard & Hull Repair',
        title: 'Engine Will Not Start',
        input: 'Hello! The Yamaha outboard motor will not crank or start. Could a marine mechanic inspect it today?',
        output: '¡Buenas! El motor fuera de borda Yamaha no quiere dar marcha ni arrancar. ¿Podría revisarlo un mecánico de marina hoy?',
        fullPanamenoOutput: '¡Buenas maestro! Ese motor fuera de borda no me quiere prender ni a palos. ¿Se puede dar una vuelta hoy?',
      },
      {
        id: 'boat_propeller_impeller_change',
        subCategory: 'outboard_hull',
        subCategoryLabel: 'Outboard & Hull Repair',
        title: 'Impeller & Propeller Replacement',
        input: 'Hi! The boat motor is overheating with weak water tell-tale. I need an impeller replacement and prop check.',
        output: '¡Buenas! El motor de la lancha se está calentando y tira poca agua por el testigo. Necesito cambio de impeller y revisar la propela.',
        fullPanamenoOutput: '¡Buenas! El chorrito del motor está saliendo bien débil y se me calienta. Toca cambiarle el impeller de una vez.',
      },
      {
        id: 'boat_fiberglass_patch',
        subCategory: 'outboard_hull',
        subCategoryLabel: 'Outboard & Hull Repair',
        title: 'Fiberglass Hull Leak Repair',
        input: 'Hello, we noticed a minor crack and slow leak on the fiberglass hull. Do you do marine fiberglass repairs?',
        output: '¡Hola! Notamos una pequeña fisura y filtración de agua en el casco de fibra de vidrio. ¿Hacen trabajos de fibra marina?',
        fullPanamenoOutput: '¡Buenas! Se me rajó un poquito el casco de fibra y me está metiendo agua. ¿Me le puede meter un parche fino?',
      },
    ],
  },

  // ----------------------------------------------------
  // 2. LAND TAXIS & TRANSPORT (#0891B2)
  // ----------------------------------------------------
  {
    id: 'taxi',
    category: 'Taxi',
    title: 'Land Taxis & Transport',
    icon: 'taxi',
    description: 'Island taxis to Paunch/Bluff beach, airport transfers, golf cart repairs, and border runs to Sixaola.',
    defaultInputPrompt: 'Hi, I need a land taxi driver to pick me up for a trip to Playa Bluff.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'island_taxis', label: 'Island Taxis', icon: 'taxi' },
      { id: 'cart_repair', label: 'Auto & Cart Repair', icon: 'car-wrench' },
      { id: 'border_runs', label: 'Border Runs', icon: 'passport' },
    ],
    phrases: [
      {
        id: 'taxi_beach_trip',
        subCategory: 'island_taxis',
        subCategoryLabel: 'Island Taxis',
        title: 'Taxi to Beach / Bluff',
        input: 'Hi! Are you available for a taxi ride to Playa Bluff / Paunch today?',
        output: '¡Buenas! ¿Estará disponible para una carrera en taxi hacia Playa Bluff o Paunch hoy?',
        fullPanamenoOutput: '¡Xopá chofer! ¿Tiene tiempo pa tirarme una carrera hasta Bluff o Paunch ahorita?',
      },
      {
        id: 'taxi_airport_pickup',
        subCategory: 'island_taxis',
        subCategoryLabel: 'Island Taxis',
        title: 'Airport Transfer Pickup',
        input: 'Hello, what is your rate for an airport pickup transfer in Bocas Town?',
        output: '¡Hola! ¿Me puede decir cuánto me cobra por recogerme en el aeropuerto de Bocas Town?',
        fullPanamenoOutput: '¡Buenas! ¿Cuánto me sale que me busque en el aeropuerto de Bocas?',
      },
      {
        id: 'taxi_day_rate_hire',
        subCategory: 'island_taxis',
        subCategoryLabel: 'Island Taxis',
        title: 'Daily Driver Hire Quote',
        input: 'Hi, how much do you charge for half-day driver service around Isla Colón?',
        output: '¡Buenas! ¿Me podría decir cuánto me cobraría por el servicio de chofer por medio día para recorrer Isla Colón?',
        fullPanamenoOutput: '¡Buenas compa! ¿En cuánto me deja el taxi por medio día pa dar vueltas por la isla?',
      },
      {
        id: 'taxi_drago_starfish',
        subCategory: 'island_taxis',
        subCategoryLabel: 'Island Taxis',
        title: 'Trip to Boca del Drago',
        input: 'Hello, are you available to take us to Boca del Drago and pick us back up at 4 PM?',
        output: '¡Buenas! ¿Estará disponible para llevarnos a Boca del Drago y pasar por nosotros de regreso a las 4 de la tarde?',
        fullPanamenoOutput: '¡Qué xopá! ¿Me hace el viaje a Drago y me pasa buscando a las 4 en punto?',
      },
      {
        id: 'car_battery_jump_start',
        subCategory: 'cart_repair',
        subCategoryLabel: 'Auto & Cart Repair',
        title: 'Battery Dead / Jump Start',
        input: 'Hi! My car / cart battery is dead and won\'t start. Do you have booster cables or a portable battery jumper?',
        output: '¡Buenas! La batería del auto o carrito se descargó y no prende. ¿Tiene cables o arrancador para pasarme corriente?',
        fullPanamenoOutput: '¡Xopá compa! Se me murió la batería del carro. ¿Tendrá cables pa pasarme corriente de una vez?',
      },
      {
        id: 'car_flat_tire_patch',
        subCategory: 'cart_repair',
        subCategoryLabel: 'Auto & Cart Repair',
        title: 'Flat Tire Repair / Patch',
        input: 'Hello! I got a flat tire on the road to Bluff. Do you do mobile tire repairs or have a tire vulcanizer shop?',
        output: '¡Hola! Se me pinchó una llanta en el camino a Bluff. ¿Hacen reparación a domicilio o dónde queda la llantería?',
        fullPanamenoOutput: '¡Buenas! Se me desinfló la llanta por el camino a Bluff. ¿Dónde me la pueden parchar rápido?',
      },
      {
        id: 'car_golf_cart_electric_issue',
        subCategory: 'cart_repair',
        subCategoryLabel: 'Auto & Cart Repair',
        title: 'Electric Golf Cart Issue',
        input: 'Hi, our electric golf cart is losing acceleration and the solenoid clicks. Do you service UTVs or golf carts?',
        output: '¡Buenas! El carrito de golf eléctrico pierde fuerza y el solenoide hace clic. ¿Dan mantenimiento a carritos de golf o UTV?',
        fullPanamenoOutput: '¡Buenas! El carrito eléctrico no me quiere avanzar y suena un clic. ¿Usted le mete la mano a esos carritos?',
      },
      {
        id: 'border_exit_entry_stamp',
        subCategory: 'border_runs',
        subCategoryLabel: 'Border Runs',
        title: 'Border Stamp / Costa Rica Run',
        input: 'Hi! I need reliable round-trip transport to the Sixaola border for my 90-day passport renewal stamp.',
        output: '¡Buenas! Necesito transporte ida y vuelta confiable hasta la frontera de Sixaola para sellar mi pasaporte de 90 días.',
        fullPanamenoOutput: '¡Xopá! Necesito un viaje seguro ida y vuelta a la frontera de Sixaola pa sellar pasaporte y renovar estadía.',
      },
      {
        id: 'border_taxi_to_almirante',
        subCategory: 'border_runs',
        subCategoryLabel: 'Border Runs',
        title: 'Taxi to Almirante / Sixaola',
        input: 'Hello, what is the private taxi fare from Almirante boat docks directly to the Sixaola border crossing?',
        output: '¡Hola! ¿Me puede decir cuánto cuesta el taxi privado desde los muelles de Almirante directo hasta el cruce fronterizo de Sixaola?',
        fullPanamenoOutput: '¡Buenas compa! ¿Cuánto me sale un taxi directo desde el muelle de Almirante hasta la frontera en Sixaola?',
      },
      {
        id: 'border_customs_clearance',
        subCategory: 'border_runs',
        subCategoryLabel: 'Border Runs',
        title: 'Border Crossing Transport',
        input: 'Hi! Are your drivers familiar with the border crossing hours and bridge schedule between Panama and Costa Rica?',
        output: '¡Buenas! ¿Sus choferes conocen bien el horario de atención y cruce del puente entre Panamá y Costa Rica?',
        fullPanamenoOutput: '¡Buenas! ¿Ustedes se conocen bien los horarios de migración y la pasada del puente en Sixaola?',
      },
    ],
  },

  // ----------------------------------------------------
  // 3. PLUMBING & WATER SYSTEMS (#0D9488)
  // ----------------------------------------------------
  {
    id: 'plumbing',
    category: 'Plumbing',
    title: 'Plumbing & Water Systems',
    icon: 'water-pump',
    description: 'Pressure pumps, water tanker trucks, rainwater catchment cisterns, and emergency pipe repairs.',
    defaultInputPrompt: 'Hi, our water pump lost pressure and our rainwater cistern is running low.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'cisterns', label: 'Water Trucks & Cisterns', icon: 'water' },
      { id: 'pumps', label: 'Leak & Pump Repair', icon: 'pipe-wrench' },
    ],
    phrases: [
      {
        id: 'water_cistern_truck',
        subCategory: 'cisterns',
        subCategoryLabel: 'Water Trucks & Cisterns',
        title: 'Water Tanker Truck Delivery',
        input: 'Hi! Do you have water delivery trucks available to fill our rainwater storage tank in Bocas?',
        output: '¡Buenas! ¿Tienen camiones cisterna disponibles para rellenar nuestro tanque de agua en Bocas?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen viaje de agua disponible pa rellenar el tanque de la reserva hoy mismo?',
      },
      {
        id: 'water_jugs_delivery',
        subCategory: 'cisterns',
        subCategoryLabel: 'Water Trucks & Cisterns',
        title: 'Purified Water Jugs Delivery',
        input: 'Hello! Can we order 5-gallon purified drinking water jugs delivered to our location?',
        output: '¡Hola! ¿Podemos pedir botellones de 5 galones de agua purificada con entrega a domicilio?',
        fullPanamenoOutput: '¡Buenas! ¿Nos pueden traer botellones de agua purificada de 5 galones acá a la casa?',
      },
      {
        id: 'water_cistern_low',
        subCategory: 'cisterns',
        subCategoryLabel: 'Water Trucks & Cisterns',
        title: 'Cistern Low / Water Refill',
        input: 'Hello, our cistern is almost empty due to dry weather. How much for 1,000 gallons delivered?',
        output: '¡Buenas! Nuestra reserva de agua está casi vacía por la sequía. ¿Me puede decir cuánto cobran por mil galones puestos?',
        fullPanamenoOutput: '¡Buenas! Se nos está secando el tanque de agua con este sol. ¿A cuánto sale el viaje de mil galones?',
      },
      {
        id: 'water_pump_lost_prime',
        subCategory: 'pumps',
        subCategoryLabel: 'Leak & Pump Repair',
        title: 'Water Pump Lost Prime / No Pressure',
        input: 'Hi! Our pressure water pump is running constantly but lost prime and is not pushing water into the house.',
        output: '¡Buenas! La bomba hidroneumática se queda encendida pero se descebó y no sube presión de agua a la casa.',
        fullPanamenoOutput: '¡Buenas maestro! La bomba de agua no para de sonar y no sube ni una gota. ¿Puede cebarla o revisarla?',
      },
      {
        id: 'water_filter_maintenance',
        subCategory: 'pumps',
        subCategoryLabel: 'Leak & Pump Repair',
        title: 'Sediment Filter & UV Lamp Change',
        input: 'Hello, I need replacement sediment filters and UV sterilizer bulb service for our rainwater filtration system.',
        output: '¡Hola! Necesito cambio de filtros de sedimentos y revisión del bombillo UV del sistema de filtrado de agua.',
        fullPanamenoOutput: '¡Buenas! Toca cambiarle los filtros de sedimento y el bombillo ultravioleta al filtro de agua de lluvia.',
      },
      {
        id: 'water_leak_pipe_emergency',
        subCategory: 'pumps',
        subCategoryLabel: 'Leak & Pump Repair',
        title: 'Pipe Burst / High Pressure Leak',
        input: 'Emergency: A main PVC water pipe burst under the house and water is spraying everywhere. Can a plumber come now?',
        output: '¡Emergencia! Se reventó un tubo principal de PVC debajo de la casa y está botando agua. ¿Puede venir un plomero ya?',
        fullPanamenoOutput: '¡Urgente maestro! Se reventó un tubo de PVC y tengo una fuga bárbara de agua. ¿Puede venir volando?',
      },
    ],
  },

  // ----------------------------------------------------
  // 4. ELECTRICIANS, A/C & SOLAR (#059669)
  // ----------------------------------------------------
  {
    id: 'ac',
    category: 'Electric',
    title: 'Electricians, A/C & Solar',
    icon: 'snowflake',
    description: 'Air conditioning repairs, refrigerant gas refills, electrical troubleshooting, and off-grid solar systems.',
    defaultInputPrompt: 'My air conditioning unit is leaking water and not blowing cold air.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'ac_service', label: 'A/C Service', icon: 'air-conditioner' },
      { id: 'electrician', label: 'Electrician', icon: 'flash' },
      { id: 'solar_power', label: 'Solar Power', icon: 'solar-power' },
    ],
    phrases: [
      {
        id: 'ac_leaking_water',
        subCategory: 'ac_service',
        subCategoryLabel: 'A/C Service',
        title: 'A/C Leaking Water Indoors',
        input: 'Hi! The air conditioner is leaking water inside the room. Could you come check the drain line?',
        output: '¡Buenas! El aire acondicionado está botando agua hacia adentro de la habitación. ¿Podría venir a revisar el desagüe?',
        fullPanamenoOutput: '¡Buenas! El aire me está goteando agua pa dentro del cuarto. ¿Será que me puede destapar el desagüe?',
      },
      {
        id: 'ac_gas_refill',
        subCategory: 'ac_service',
        subCategoryLabel: 'A/C Service',
        title: 'A/C Needs Refrigerant / Freon',
        input: 'Hello, the air conditioner turns on but is only blowing warm air. I think it needs a gas refill.',
        output: '¡Hola! El aire acondicionado enciende pero solo tira aire tibio. Creo que necesita recarga de gas refrigerante.',
        fullPanamenoOutput: '¡Buenas! El aire prende el abanico pero no enfría nada de nada. Seguro le falta gas refrigerante.',
      },
      {
        id: 'ac_remote_not_working',
        subCategory: 'ac_service',
        subCategoryLabel: 'A/C Service',
        title: 'A/C Remote / Display Error',
        input: 'Hello, the air conditioner display shows an error code and won\'t respond to the remote control.',
        output: '¡Hola! La pantalla del aire acondicionado muestra un código de error y no responde al control remoto.',
        fullPanamenoOutput: '¡Buenas maestro! El aire me tiró un código de error en la pantalla y el control no le hace nada.',
      },
      {
        id: 'power_blackout_status',
        subCategory: 'electrician',
        subCategoryLabel: 'Electrician',
        title: 'Power Outage / Naturgy Inquiries',
        input: 'Hi! Has the power gone out in your area as well, or is it just our circuit breaker that tripped?',
        output: '¡Buenas! ¿Se fue la luz por su sector también, o habrá sido solo un breaker que se disparó en mi casa?',
        fullPanamenoOutput: '¡Xopá vecino! ¿Se fue la luz por allá también o fue solo a mí que se me cayó el breaker?',
      },
      {
        id: 'power_low_voltage_fluctuation',
        subCategory: 'electrician',
        subCategoryLabel: 'Electrician',
        title: 'Low Voltage / Fluctuations',
        input: 'Hello! The voltage keeps dropping and lights are flickering. Can you check our surge protector and voltage regulator?',
        output: '¡Buenas! El voltaje está bajando mucho y las luces parpadean. ¿Puede revisar el protector de voltaje y regulador?',
        fullPanamenoOutput: '¡Buenas! La corriente está fluctuando horrible y me da miedo que se quemen los aparatos.',
      },
      {
        id: 'electrician_breaker_panel',
        subCategory: 'electrician',
        subCategoryLabel: 'Electrician',
        title: 'Breaker Tripping / Short Circuit',
        input: 'Hi, our main circuit breaker keeps tripping whenever we turn on the stove or water heater. Can an electrician inspect it?',
        output: '¡Buenas! El breaker principal se sigue disparando cada vez que prendemos la estufa o el calentador. ¿Puede venir un electricista?',
        fullPanamenoOutput: '¡Buenas maestro! Se me está disparando el breaker principal a cada rato. Creo que hay un corto por ahí.',
      },
      {
        id: 'solar_inverter_battery_bank',
        subCategory: 'solar_power',
        subCategoryLabel: 'Solar Power',
        title: 'Solar Inverter Error / Batteries',
        input: 'Hi! Our off-grid solar system inverter has a red fault light and the lithium battery bank is not charging properly.',
        output: '¡Buenas! El inversor del sistema solar tiene luz roja de falla y el banco de baterías no está cargando bien.',
        fullPanamenoOutput: '¡Buenas técnico! El inversor del sistema solar me tiró luz roja de alarma y las baterías no agarran carga.',
      },
      {
        id: 'solar_panel_cleaning_check',
        subCategory: 'solar_power',
        subCategoryLabel: 'Solar Power',
        title: 'Solar Panel Inspection & Check',
        input: 'Hello, I need maintenance and output testing for our rooftop solar panels and charge controller in Bocas.',
        output: '¡Hola! Necesito mantenimiento y prueba de generación para nuestros paneles solares y controlador de carga en Bocas.',
        fullPanamenoOutput: '¡Buenas! Necesito hacerle una limpieza y chequeo a los paneles solares pa ver cuánto amperaje están tirando.',
      },
    ],
  },

  // ----------------------------------------------------
  // 5. GARDENING & LANDSCAPING (#65A30D)
  // ----------------------------------------------------
  {
    id: 'gardening',
    category: 'Gardening',
    title: 'Gardening & Landscaping',
    icon: 'sprout',
    description: 'Lawn mowing, machete chapeo, coconut palm trimming, organic black soil delivery, and tropical nursery plants.',
    defaultInputPrompt: 'Hi, I need someone for weed whacking and lawn care on our property.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'chapeo', label: 'Machete & Chapeo', icon: 'grass' },
      { id: 'nurseries', label: 'Soil & Nurseries', icon: 'sprout' },
    ],
    phrases: [
      {
        id: 'garden_mowing_chapeo',
        subCategory: 'chapeo',
        subCategoryLabel: 'Machete & Chapeo',
        title: 'Lawn Mowing & Machete Chapeo',
        input: 'Hi! Are you available this week for mowing, weed whacking (chapeo), and clearing overgrown brush on our property?',
        output: '¡Buenas! ¿Tendrá disponibilidad esta semana para cortar la hierba, chapear con machete y limpiar el terreno?',
        fullPanamenoOutput: '¡Qué xopá amigo! ¿Estará libre esta semana pa echar un buen chapeo y dejar el monte bajito?',
      },
      {
        id: 'garden_tree_palm_trimming',
        subCategory: 'chapeo',
        subCategoryLabel: 'Machete & Chapeo',
        title: 'Coconut Palm & Tree Trimming',
        input: 'Hello! We have tall coconut palms with heavy coconuts and dead fronds hanging over the roof. Do you climb and trim palms?',
        output: '¡Hola! Tenemos palmas de coco altas con cocos y pencas secas sobre el techo. ¿Usted trepa y poda palmas?',
        fullPanamenoOutput: '¡Buenas! Tengo unas palmeras de coco altas con pencas secas sobre el zinc. ¿Usted sube a bajarlas?',
      },
      {
        id: 'garden_brush_haulaway',
        subCategory: 'chapeo',
        subCategoryLabel: 'Machete & Chapeo',
        title: 'Yard Debris & Brush Removal',
        input: 'Hi! Do you have a truck or boat to haul away green yard waste and branches cut from our garden?',
        output: '¡Buenas! ¿Tiene vehículo o lancha para recoger y botar los restos de poda y ramas de nuestro patio?',
        fullPanamenoOutput: '¡Buenas! ¿Usted tiene cómo llevarse las ramas y el monte cortado que tenemos arrumado en el patio?',
      },
      {
        id: 'garden_soil_compost_delivery',
        subCategory: 'nurseries',
        subCategoryLabel: 'Soil & Nurseries',
        title: 'Black Soil & Compost Delivery',
        input: 'Hello! How much is a yard or sack of rich black garden soil and organic compost delivered to our dock or home?',
        output: '¡Hola! ¿Me puede decir a cuánto tiene la yarda o saco de tierra negra abonada y compost orgánico con entrega a nuestro muelle o casa?',
        fullPanamenoOutput: '¡Buenas! ¿A cómo me sale el saco de tierra negra abonada puesta acá en el muelle?',
      },
      {
        id: 'garden_plants_fruit_trees',
        subCategory: 'nurseries',
        subCategoryLabel: 'Soil & Nurseries',
        title: 'Fruit Trees & Native Plants',
        input: 'Hi! Do you have grafted fruit trees (mango, avocado, citrus) and tropical ornamental plants available at your nursery?',
        output: '¡Buenas! ¿Tienen árboles frutales injertados (mango, aguacate, cítricos) y plantas ornamentales en su vivero?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen plantones injertados de mango, aguacate o cítricos listos pa sembrar en el vivero?',
      },
      {
        id: 'garden_nursery_availability',
        subCategory: 'nurseries',
        subCategoryLabel: 'Soil & Nurseries',
        title: 'Grass Plugs & Tropical Flowers',
        input: 'Hello! Do you have San Agustín grass plugs, bougainvillea, and hibiscus plants ready for planting?',
        output: '¡Hola! ¿Tienen esquejes de pasto San Agustín, veraneras e hibiscos listos para sembrar?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen pasto San Agustín y matas de veranera pa rellenar el jardín?',
      },
    ],
  },

  // ----------------------------------------------------
  // 6. CONTRACTORS & HANDYMEN (#CA8A04)
  // ----------------------------------------------------
  {
    id: 'contractor',
    category: 'Contractor',
    title: 'Contractors & Handymen',
    icon: 'hammer-wrench',
    description: 'Over-water dock repairs, marine carpentry, zinc roofing leaks, masonry, and handyman island projects.',
    defaultInputPrompt: 'Hi, I need a carpenter or contractor to inspect dock pilings and repair deck boards.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'carpentry', label: 'Carpentry & Docks', icon: 'hammer-wrench' },
      { id: 'roof_general', label: 'Roof & General Repair', icon: 'home' },
    ],
    phrases: [
      {
        id: 'contractor_dock_repair',
        subCategory: 'carpentry',
        subCategoryLabel: 'Carpentry & Docks',
        title: 'Dock Pilings & Deck Planks',
        input: 'Hi! We need an experienced contractor to replace rotten dock planks and inspect over-water pilings.',
        output: '¡Buenas! Necesitamos un contratista con experiencia para cambiar tablas podridas del muelle y revisar los pilotes sobre el agua.',
        fullPanamenoOutput: '¡Xopá maestro! Tengo un par de tablas podridas en el muelle y quiero chequear los pilotes. ¿Puede pasar a ver?',
      },
      {
        id: 'contractor_wood_treatment',
        subCategory: 'carpentry',
        subCategoryLabel: 'Carpentry & Docks',
        title: 'Marine Hardwood & Termite Treatment',
        input: 'Hello! Do you build with local hardwoods (nispero, almendro) and do anti-termite / marine wood sealer treatments?',
        output: '¡Hola! ¿Trabajan con maderas duras locales (níspero, almendro) y aplican tratamiento contra termitas y sellador marino?',
        fullPanamenoOutput: '¡Buenas! ¿Ustedes trabajan con madera buena como níspero o almendro y le meten veneno contra termita?',
      },
      {
        id: 'contractor_carpentry_custom',
        subCategory: 'carpentry',
        subCategoryLabel: 'Carpentry & Docks',
        title: 'Custom Shelving & Door Fitting',
        input: 'Hi, I need a carpenter to build custom hardwood shelves and fix a wooden exterior door swollen from humidity.',
        output: '¡Buenas! Necesito un carpintero para fabricar repisas de madera y ajustar una puerta exterior que se hinchó con la humedad.',
        fullPanamenoOutput: '¡Buenas maestro! Se me hinchó la puerta de madera con la lluvia y no cierra. ¿Me la puede cepillar?',
      },
      {
        id: 'hardware_zinc_roofing',
        subCategory: 'roof_general',
        subCategoryLabel: 'Roof & General Repair',
        title: 'Zinc Roof Sheets & Gutters',
        input: 'Hi! Do you have corrugated zinc roofing sheets, roof screws with rubber washers, and PVC gutters in stock?',
        output: '¡Buenas! ¿Tienen láminas de zinc onduladas, tornillos para techo con arandela de caucho y canales de PVC?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen hojas de zinc, tornillos de techo con goma y canales de lluvia listos pa retirar?',
      },
      {
        id: 'landlord_roof_leak_rain',
        subCategory: 'roof_general',
        subCategoryLabel: 'Roof & General Repair',
        title: 'Urgent Roof Leak in Heavy Rain',
        input: 'Hi! During the rain, water started leaking through the roof ceiling. Could someone inspect and seal the leak?',
        output: '¡Buenas! Con el aguacero empezó a gotear agua por el cielo raso. ¿Podría venir alguien a revisar y sellar la gotera?',
        fullPanamenoOutput: '¡Buenas! Con este aguacero se me metió tremenda gotera por el techo. ¿Quién me puede poner un parche de silicón o tapagoteras?',
      },
      {
        id: 'contractor_concrete_masonry',
        subCategory: 'roof_general',
        subCategoryLabel: 'Roof & General Repair',
        title: 'Masonry, Tile & Concrete Fixes',
        input: 'Hello, we need a mason to patch cracked concrete walkway steps and replace loose outdoor tiles.',
        output: '¡Hola! Necesitamos un albañil para reparar escalones de concreto cuarteados y cambiar baldosas sueltas de exterior.',
        fullPanamenoOutput: '¡Buenas maestro! Necesito emparejar un piso de concreto y pegar un par de baldosas sueltas. ¿Tiene tiempo?',
      },
    ],
  },

  // ----------------------------------------------------
  // 7. STARLINK & INTERNET TECHS (#D97706)
  // ----------------------------------------------------
  {
    id: 'starlink',
    category: 'Internet',
    title: 'Starlink & Internet Techs',
    icon: 'satellite-variant',
    description: 'Starlink roof mast mounting, router mesh setups, fiber optic repairs, and high-speed Wi-Fi optimizations.',
    defaultInputPrompt: 'Hi, our Starlink satellite dish lost connection and we need a technician.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'starlink_mounts', label: 'Starlink Mounts', icon: 'satellite-variant' },
      { id: 'wifi_routers', label: 'Wi-Fi & Mesh Routers', icon: 'wifi' },
    ],
    phrases: [
      {
        id: 'starlink_rooftop_mount_cable',
        subCategory: 'starlink_mounts',
        subCategoryLabel: 'Starlink Mounts',
        title: 'Rooftop Mast Mount & Cable Routing',
        input: 'Hi! We need help mounting our Starlink dish on a sturdy roof pole and neatly routing the cable indoors.',
        output: '¡Buenas! Necesitamos ayuda para montar la antena de Starlink en un poste firme en el techo y pasar el cable hacia adentro.',
        fullPanamenoOutput: '¡Xopá técnico! Necesito anclar la antena Starlink bien arriba en el techo pa que los árboles no le den obstrucción.',
      },
      {
        id: 'starlink_dish_offline',
        subCategory: 'starlink_mounts',
        subCategoryLabel: 'Starlink Mounts',
        title: 'Starlink Offline / Searching Signal',
        input: 'Hi! Our Starlink app says "Offline - Searching" or "Disconnected". Can a tech troubleshoot the dish and power cable?',
        output: '¡Buenas! La aplicación de Starlink dice "Desconectado" o "Buscando". ¿Podría un técnico revisar la antena y el cable de poder?',
        fullPanamenoOutput: '¡Buenas compa! El Starlink se me quedó en "Searching" y no me da señal. ¿Usted me puede revisar esa conexión?',
      },
      {
        id: 'starlink_fiber_damaged',
        subCategory: 'starlink_mounts',
        subCategoryLabel: 'Starlink Mounts',
        title: 'Damaged Starlink Cable Replacement',
        input: 'Hello, the proprietary Starlink dish cable got damaged by rodents or pinched. Do you have replacement cables or RJ45 couplers?',
        output: '¡Hola! El cable original de la antena Starlink se dañó. ¿Tienen cables de repuesto o acoples de reparación?',
        fullPanamenoOutput: '¡Buenas! Se me trozó el cable del Starlink. ¿Tienen cable de repuesto o cómo empalmarlo con conector blindado?',
      },
      {
        id: 'starlink_mesh_extender',
        subCategory: 'wifi_routers',
        subCategoryLabel: 'Wi-Fi & Mesh Routers',
        title: 'Mesh Wi-Fi Extenders Setup',
        input: 'Hi! The Wi-Fi signal does not reach our guest bedrooms or dock. Can you install and configure mesh Wi-Fi access points?',
        output: '¡Buenas! La señal de Wi-Fi no llega a los cuartos de visita ni al muelle. ¿Puede instalar y configurar repetidores de red mesh?',
        fullPanamenoOutput: '¡Buenas! El Wi-Fi no me llega al muelle ni a la terraza. ¿Me puede configurar unos repetidores mesh pa tener buena señal?',
      },
      {
        id: 'starlink_slow_line_check',
        subCategory: 'wifi_routers',
        subCategoryLabel: 'Wi-Fi & Mesh Routers',
        title: 'High Latency / Slow Speeds Diagnosis',
        input: 'Hello, our internet speeds are fluctuating heavily and video calls keep buffering. Could you test our local network setup?',
        output: '¡Hola! La velocidad del internet está muy inestable y las videollamadas se cortan. ¿Podría diagnosticar nuestra red local?',
        fullPanamenoOutput: '¡Buenas! El internet se me está cayendo a cada rato en las llamadas. ¿Me puede chequear el router a ver qué pasa?',
      },
    ],
  },

  // ----------------------------------------------------
  // 8. BANKING, ATMS & YAPPY (#EA580C)
  // ----------------------------------------------------
  {
    id: 'banking',
    category: 'Money',
    title: 'Banking, ATMs & Yappy',
    icon: 'cash-multiple',
    description: 'Banco Nacional ATM cash status, Yappy mobile transfers, Punto Pago kiosks, and Western Union in Changuinola.',
    defaultInputPrompt: 'Hi, does the Banco Nacional ATM have cash today, or do you accept Yappy?',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'atm_cash', label: 'ATMs & Cash', icon: 'cash-multiple' },
      { id: 'yappy_punto', label: 'Yappy & Punto Pago', icon: 'cellphone-check' },
      { id: 'western_union', label: 'Western Union (Changuinola)', icon: 'bank-transfer' },
    ],
    phrases: [
      {
        id: 'banking_atm_banconal',
        subCategory: 'atm_cash',
        subCategoryLabel: 'ATMs & Cash',
        title: 'Banco Nacional ATM Cash Status',
        input: 'Hi! Does anyone know if the Banco Nacional ATM in Bocas Town currently has USD cash dispensing?',
        output: '¡Buenas! ¿Alguien sabe si el cajero de Banco Nacional en Bocas Town tiene plata ahorita?',
        fullPanamenoOutput: '¡Buenas gente! ¿El cajero de Banco Nacional en Bocas tiene plata ahorita o tá seco?',
      },
      {
        id: 'banking_atm_supermarket',
        subCategory: 'atm_cash',
        subCategoryLabel: 'ATMs & Cash',
        title: 'Independent Telered ATM Machine',
        input: 'Hi! Is the independent ATM at Duo2 Market or Supermarket Alba in Bocas Town working and dispensing cash?',
        output: '¡Hola! ¿El cajero de Duo2 o de Supermercado Alba en Bocas Town está funcionando y sacando plata hoy?',
        fullPanamenoOutput: '¡Buenas! ¿El cajero de Duo2 o de Alba tá sacando plata hoy o está fuera de servicio?',
      },
      {
        id: 'banking_yappy_acceptance',
        subCategory: 'yappy_punto',
        subCategoryLabel: 'Yappy & Punto Pago',
        title: 'Accepting Yappy Mobile Pay',
        input: 'Hello! Do you accept Yappy for payment here, or is it cash only?',
        output: '¡Buenas! ¿Aceptan pago por Yappy aquí o solo es en efectivo?',
        fullPanamenoOutput: '¡Buenas compa! ¿Aceptas Yappy o pura plata en mano?',
      },
      {
        id: 'banking_yappy_qr',
        subCategory: 'yappy_punto',
        subCategoryLabel: 'Yappy & Punto Pago',
        title: 'Phone Number / Name for Yappy',
        input: 'Hello! What is your registered phone number or business name in Yappy so I can transfer the payment?',
        output: '¡Hola! ¿Me puede pasar su número de teléfono o nombre comercial de Yappy para transferirle el pago?',
        fullPanamenoOutput: '¡Buenas! ¿A qué número de celular te paso el Yappy?',
      },
      {
        id: 'yappy_receipt_sent',
        subCategory: 'yappy_punto',
        subCategoryLabel: 'Yappy & Punto Pago',
        title: 'Yappy Payment Proof Sent',
        input: 'Hi! I just sent the payment via Yappy. I am sharing the digital transfer receipt screenshot right here.',
        output: '¡Buenas! Ya le envié el pago por Yappy. Le comparto la captura del comprobante de transferencia aquí mismo.',
        fullPanamenoOutput: '¡Listo compa! Ya te solté el Yappy. Ahí te mandé la captura del comprobante.',
      },
      {
        id: 'banking_western_union',
        subCategory: 'western_union',
        subCategoryLabel: 'Western Union (Changuinola)',
        title: 'Western Union (Only in Changuinola)',
        input: 'Hello! Is the Western Union office in Changuinola open today for wire pickups? (Since there is no branch in Bocas Town).',
        output: '¡Hola! ¿La sucursal de Western Union en Changuinola está abierta hoy para retiros de giros internacionales? Sé que no hay sucursal en Bocas Town.',
        fullPanamenoOutput: '¡Buenas! ¿Western Union en Changuinola está abierto hoy pa cobrar giros? Ya que acá en Bocas no hay.',
      },
      {
        id: 'banking_punto_pago',
        subCategory: 'yappy_punto',
        subCategoryLabel: 'Yappy & Punto Pago',
        title: 'Punto Pago Kiosk Machine',
        input: 'Hi! Where is the nearest working Punto Pago machine to recharge cell phone data or pay Naturgy electric bills?',
        output: '¡Buenas! ¿Sabe dónde queda la máquina de Punto Pago más cercana que esté funcionando para recargas o pagar la luz?',
        fullPanamenoOutput: '¡Buenas! ¿Dónde hay un quiosco de Punto Pago que sirva pa meterle saldo al cel y pagar Naturgy?',
      },
    ],
  },

  // ----------------------------------------------------
  // 9. SUPERMARKETS & DINING (#F43F5E)
  // ----------------------------------------------------
  {
    id: 'dining',
    category: 'Dining',
    title: 'Supermarkets & Dining',
    icon: 'silverware-fork-knife',
    description: 'Fresh seafood catch, specialty grocery provisions, island table bookings, and restaurant bills.',
    defaultInputPrompt: 'Hi, I would like to reserve a dinner table or ask about fresh grocery provisions.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'groceries', label: 'Groceries & Delivery', icon: 'cart' },
      { id: 'dining_table', label: 'Table Booking & Bill', icon: 'silverware-fork-knife' },
    ],
    phrases: [
      {
        id: 'groceries_specialty_diet',
        subCategory: 'groceries',
        subCategoryLabel: 'Groceries & Delivery',
        title: 'Gluten-Free / Organic Items',
        input: 'Hi! Do you carry gluten-free bread, almond/oat milk, and vegan or organic cheese in your store?',
        output: '¡Buenas! ¿Tienen en existencia pan sin gluten, leche de almendras o avena, y queso vegano u orgánico?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen pan sin gluten, leche de almendra o avena y productos veganos en el súper?',
      },
      {
        id: 'groceries_fresh_seafood_order',
        subCategory: 'groceries',
        subCategoryLabel: 'Groceries & Delivery',
        title: 'Fresh Fish & Lobster Catch',
        input: 'Hello! Do you have fresh red snapper (pargo), corvina, or lobster available today and what is the price per pound?',
        output: '¡Buenas! ¿Tienen pargo fresco, corvina o langosta hoy y a cómo tienen la libra?',
        fullPanamenoOutput: '¡Xopá! ¿Tienen pargo rojo fresco o langosta recién sacada hoy y a cuánto la libra?',
      },
      {
        id: 'groceries_whatsapp_delivery_list',
        subCategory: 'groceries',
        subCategoryLabel: 'Groceries & Delivery',
        title: 'WhatsApp Grocery Order Delivery',
        input: 'Hi! Can I send you my grocery list over WhatsApp for delivery to our dock or home address?',
        output: '¡Hola! ¿Les puedo mandar mi lista de compras por WhatsApp para que me la preparen y envíen a domicilio?',
        fullPanamenoOutput: '¡Buenas! ¿Les puedo tirar la lista de compras por WhatsApp pa que me la manden en taxi al muelle?',
      },
      {
        id: 'dining_table_reservation',
        subCategory: 'dining_table',
        subCategoryLabel: 'Table Booking & Bill',
        title: 'Dinner Table Reservation',
        input: 'Hi! I would like to reserve a dinner table for 4 people tonight at 7:30 PM, please.',
        output: '¡Buenas! Quisiera reservar una mesa para 4 personas hoy a las 7:30 de la noche, por favor.',
        fullPanamenoOutput: '¡Buenas noches! Quisiera apartar una mesa pa 4 personas hoy a las 7:30 PM, porfa.',
      },
      {
        id: 'dining_menu_specials',
        subCategory: 'dining_table',
        subCategoryLabel: 'Table Booking & Bill',
        title: 'Today\'s Specials / Catch of the Day',
        input: 'Hi! Could you send me your current food menu and today\'s catch of the day via WhatsApp?',
        output: '¡Buenas! ¿Me podrían enviar su menú actualizado y la pesca del día por WhatsApp?',
        fullPanamenoOutput: '¡Xopá! ¿Me pueden mandar el menú y los especiales de hoy por WhatsApp?',
      },
      {
        id: 'dining_split_bill_tip',
        subCategory: 'dining_table',
        subCategoryLabel: 'Table Booking & Bill',
        title: 'Separate Checks & Tip Included',
        input: 'Hello, could you please split the bill between 2 cards, and does the total include the tip (propina)?',
        output: '¡Buenas! ¿Nos podría dividir la cuenta entre 2 tarjetas, y el total ya incluye la propina?',
        fullPanamenoOutput: '¡Buenas jefe! ¿Nos puede cobrar la cuenta dividida entre dos y la propina viene incluida o aparte?',
      },
    ],
  },

  // ----------------------------------------------------
  // 10. DOCTOR & PHARMACY (#E11D48)
  // ----------------------------------------------------
  {
    id: 'medical',
    category: 'Medical',
    title: 'Doctor & Pharmacy',
    icon: 'hospital-building',
    description: 'Medical consultations, emergency ambulance clinics, prescription antibiotics, and island dental visits.',
    defaultInputPrompt: 'Hi, I need an urgent doctor consultation or nearest open pharmacy in Bocas.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'doctor_clinic', label: 'Doctor & Clinic', icon: 'stethoscope' },
      { id: 'pharmacy_meds', label: 'Pharmacy & Meds', icon: 'pill' },
    ],
    phrases: [
      {
        id: 'med_doctor_visit',
        subCategory: 'doctor_clinic',
        subCategoryLabel: 'Doctor & Clinic',
        title: 'Urgent Doctor Consultation',
        input: 'Hi! I have a high fever, dehydration, and severe stomach pain. Is a general doctor available for a consultation today?',
        output: '¡Buenas! Tengo fiebre alta, un dolor de barriga bien fuerte y creo que me estoy deshidratando. ¿Habrá un doctor que me pueda atender hoy?',
        fullPanamenoOutput: '¡Buenas doctor! Tengo fiebre y un dolor de estómago bien fuerte. ¿Me podrá atender una consulta hoy?',
      },
      {
        id: 'med_emergency_ambulance',
        subCategory: 'doctor_clinic',
        subCategoryLabel: 'Doctor & Clinic',
        title: 'Medical Emergency / Hospital',
        input: 'Emergency: We need urgent medical assistance or an ambulance to take an injured patient to Bocas hospital immediately.',
        output: '¡Emergencia! Necesitamos asistencia médica urgente o una ambulancia para llevar a un paciente herido al hospital de Bocas ya.',
        fullPanamenoOutput: '¡Urgente por favor! Necesitamos auxilio médico o una ambulancia pa mover a una persona herida al hospital.',
      },
      {
        id: 'dent_urgent_toothache',
        subCategory: 'doctor_clinic',
        subCategoryLabel: 'Doctor & Clinic',
        title: 'Urgent Dentist / Toothache Visit',
        input: 'Hi! I have a severe throbbing toothache and broken molar. Do you have emergency dental appointments open today?',
        output: '¡Buenas! Tengo un dolor de muela muy fuerte y una muela partida. ¿Tienen citas odontológicas de urgencia hoy?',
        fullPanamenoOutput: '¡Buenas doc! Se me partió una muela y tengo un dolor insoportable. ¿Tendrá un espacio pa revisarme hoy?',
      },
      {
        id: 'med_pharmacy_meds',
        subCategory: 'pharmacy_meds',
        subCategoryLabel: 'Pharmacy & Meds',
        title: 'Antibiotics & Fever Medication',
        input: 'Hello, do you have amoxicillin, ibuprofen, or fever medication in stock at the pharmacy, and what are your hours today?',
        output: '¡Hola! ¿Tienen amoxicilina, ibuprofeno o medicamentos para la fiebre en la farmacia, y hasta qué hora abren hoy?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen amoxicilina o algo bueno pal dolor y la fiebre en la farmacia, y hasta qué hora atienden?',
      },
      {
        id: 'pharmacy_rehydration_electrolytes',
        subCategory: 'pharmacy_meds',
        subCategoryLabel: 'Pharmacy & Meds',
        title: 'Electrolytes & Stomach Infection',
        input: 'Hi! Do you have oral rehydration electrolyte salts (suero oral) and probiotics for food poisoning or traveler diarrhea?',
        output: '¡Buenas! Tengo la barriga mala y diarrea. ¿Tienen suero oral con electrolitos y probióticos?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen sobres de suero oral y algo pa cortar la soltura de estómago?',
      },
      {
        id: 'pharmacy_mosquito_dengue_repellent',
        subCategory: 'pharmacy_meds',
        subCategoryLabel: 'Pharmacy & Meds',
        title: 'Mosquito Repellent & Dengue Prevention',
        input: 'Hello! Do you have strong mosquito repellent with DEET / Picaridin and antihistamine cream for sandfly bites?',
        output: '¡Hola! ¿Tienen repelente fuerte con DEET y crema antihistamínica para picaduras de chitras o mosquitos?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen repelente potente pal monte y crema pa calmar las picadas de chitras?',
      },
    ],
  },

  // ----------------------------------------------------
  // 11. ISLAND VETS & ANIMAL CARE (#C026D3)
  // ----------------------------------------------------
  {
    id: 'vet',
    category: 'Vet',
    title: 'Island Vets & Animal Care',
    icon: 'paw',
    description: 'Emergency veterinary visits, cane toad toxicity, wound care, flea/tick prevention, and pet health certificates.',
    defaultInputPrompt: 'Hi, I need an emergency veterinarian to examine our sick dog or cat.',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'emergency_vet', label: 'Emergency Vet', icon: 'paw' },
      { id: 'vaccines_parasite', label: 'Vaccines & Parasite Meds', icon: 'needle' },
    ],
    phrases: [
      {
        id: 'pet_emergency_vet_visit',
        subCategory: 'emergency_vet',
        subCategoryLabel: 'Emergency Vet',
        title: 'Urgent Veterinarian Visit',
        input: 'Hi! My dog is vomiting continuously and lethargic. Is an emergency veterinarian available to examine him today?',
        output: '¡Buenas! Mi perro está vomitando seguido y muy decaído. ¿Habrá un veterinario de urgencia disponible para revisarlo hoy?',
        fullPanamenoOutput: '¡Buenas doctor! Mi perro no para de vomitar y está tirado sin fuerzas. ¿Me lo puede chequear de urgencia?',
      },
      {
        id: 'pet_toad_snake_toxicity',
        subCategory: 'emergency_vet',
        subCategoryLabel: 'Emergency Vet',
        title: 'Cane Toad / Poisoning Emergency',
        input: 'Urgent: My dog just bit a poisonous cane toad (sapo gigante) and is foaming at the mouth. What immediate steps should I take?',
        output: '¡Urgente! Mi perro mordió un sapo venenoso y está botando espuma por el hocico. ¿Me puede decir qué primeros auxilios le aplico ya?',
        fullPanamenoOutput: '¡Auxilio doc! El perro mordió un sapo y tiene espuma en la boca. ¿Cómo le lavo la boca y qué le inyecto?',
      },
      {
        id: 'pet_dog_injury_cut',
        subCategory: 'emergency_vet',
        subCategoryLabel: 'Emergency Vet',
        title: 'Dog Wound / Cut Emergency',
        input: 'Hello, our dog stepped on broken glass or coral and has a deep bleeding cut on his paw pad. Can a vet stitch it?',
        output: '¡Hola! Nuestro perro pisó vidrio o coral y tiene una cortada profunda sangrando en la almohadilla. ¿Pueden suturarlo?',
        fullPanamenoOutput: '¡Buenas! El perro se rajó la pata con un vidrio y le sangra bastante. ¿Usted le puede coser la herida?',
      },
      {
        id: 'pet_flea_tick_meds',
        subCategory: 'vaccines_parasite',
        subCategoryLabel: 'Vaccines & Parasite Meds',
        title: 'Bravecto / Flea & Tick Prevention',
        input: 'Hello! Do you have Bravecto, NexGard, or heartworm prevention chewable tablets in stock for a 20kg dog?',
        output: '¡Hola! ¿Tienen tabletas masticables de Bravecto, NexGard o preventivo de gusano del corazón para un perro de 20 kilos?',
        fullPanamenoOutput: '¡Buenas! ¿Tienen pastillas de Bravecto o NexGard pal control de garrapatas y pulgas en perros medianos?',
      },
      {
        id: 'pet_spay_neuter_vaccines',
        subCategory: 'vaccines_parasite',
        subCategoryLabel: 'Vaccines & Parasite Meds',
        title: 'Rabies Vaccines & Deworming',
        input: 'Hi, I would like to schedule an annual rabies vaccination booster and internal deworming for our rescue pet.',
        output: '¡Buenas! Quisiera agendar el refuerzo anual de la vacuna contra la rabia y desparasitación interna para nuestra mascota.',
        fullPanamenoOutput: '¡Buenas! Quiero ponerle la vacuna de la rabia y darle purga de parásitos a la mascota.',
      },
    ],
  },

  // ----------------------------------------------------
  // 12. COMMUNITY & ISLAND CULTURE (#7C3AED)
  // ----------------------------------------------------
  {
    id: 'community',
    category: 'Community',
    title: 'Community & Island Culture',
    icon: 'book-open-variant',
    description: 'Authentic Bocas slang, respectful local greetings, ocean surf swells, island weather, and recycling schedules.',
    defaultInputPrompt: 'Hi, how can I politely ask for local information in Bocas del Toro?',
    subCategories: [
      { id: 'all', label: 'All', icon: 'view-grid' },
      { id: 'slang', label: 'Panama Slang', icon: 'chat-processing' },
      { id: 'surf_weather', label: 'Surf & Weather', icon: 'wave' },
      { id: 'island_info', label: 'Island Info', icon: 'information' },
    ],
    phrases: [
      {
        id: 'community_bocas_slang_friendly',
        subCategory: 'slang',
        subCategoryLabel: 'Panama Slang',
        title: 'Island Slang: ¿Qué xopá mi compa?',
        input: 'Friendly local greeting: "What\'s up bro, how is everything going with you today?"',
        output: '¡Qué xopá mi compa! ¿Cómo va todo por acá hoy? Todo bien, todo pritty.',
        fullPanamenoOutput: '¡Qué xopá mi compa! ¿Cómo tá la vaina por acá hoy? ¿Todo pritty?',
      },
      {
        id: 'community_greeting_respect',
        subCategory: 'slang',
        subCategoryLabel: 'Panama Slang',
        title: 'Respectful Morning Greeting: ¡Buenas!',
        input: 'Polite daytime greeting: "Good morning! How are you doing today? I hope you have a great day."',
        output: '¡Buenas días! ¿Cómo está usted hoy? Que tenga una excelente y bendecida jornada.',
        fullPanamenoOutput: '¡Buenas! ¿Cómo amaneció hoy? Espero que tenga un buen día y todo le salga bien.',
      },
      {
        id: 'community_surf_swell_tides',
        subCategory: 'surf_weather',
        subCategoryLabel: 'Surf & Weather',
        title: 'Surf Swell, Wave Report & Tides',
        input: 'Hi! How is the surf swell breaking at Paunch, Bluff, or Carenero point today, and when is high tide?',
        output: '¡Buenas! ¿Me puede decir cómo están reventando las olas en Paunch, Bluff o la punta de Carenero hoy, y a qué hora es marea alta?',
        fullPanamenoOutput: '¡Xopá tablistas! ¿Cómo está la ola en Paunch y Carenero hoy? ¿A qué hora sube la marea?',
      },
      {
        id: 'community_weather_rain_forecast',
        subCategory: 'surf_weather',
        subCategoryLabel: 'Surf & Weather',
        title: 'Rain Forecast & Sea Conditions',
        input: 'Hello, is the open ocean rough outside the bay today, or is the water calm for boat crossings?',
        output: '¡Hola! ¿Estará picado el mar abierto fuera de la bahía hoy, o está calma el agua para cruzar en lancha?',
        fullPanamenoOutput: '¡Buenas capitán! ¿Cómo está el mar afuera? ¿Está picado o se puede navegar tranquilo?',
      },
      {
        id: 'community_garbage_boat_schedule',
        subCategory: 'island_info',
        subCategoryLabel: 'Island Info',
        title: 'Garbage Collection Boat Schedule',
        input: 'Hi! What days and times does the municipal garbage boat or truck pass by our neighborhood dock for collection?',
        output: '¡Buenas! ¿Sabe qué días y a qué horas pasa la lancha o el camión recolector de basura por nuestro muelle?',
        fullPanamenoOutput: '¡Buenas vecinos! ¿Qué días pasa la lancha de la basura por este sector pa sacar las bolsas?',
      },
      {
        id: 'community_artisan_farmers_market',
        subCategory: 'island_info',
        subCategoryLabel: 'Island Info',
        title: 'Local Farmers Market & Produce',
        input: 'Hello! When and where does the local organic farmers market take place in Bocas Town or Old Bank?',
        output: '¡Hola! ¿Sabe cuándo y en qué lugar se realiza el mercado orgánico de productores agrícolas locales en Bocas Town u Old Bank?',
        fullPanamenoOutput: '¡Buenas! ¿Cuándo ponen la feria del mercado artesanal y de frutas frescas por acá?',
      },
    ],
  },
];

export function getCategoryUnifiedMeta(categoryOrId?: string): CategoryMeta {
  const key = (categoryOrId || "").toLowerCase().trim();

  // 1. Ocean Blue (#0284C7) - Boat Captains & Marine
  if (
    key === "boat" ||
    key.includes("boat") ||
    key.includes("water_taxi") ||
    key.includes("lancha") ||
    key.includes("outboard") ||
    key.includes("marine")
  ) {
    return {
      id: "boat",
      category: "Boat Captains & Marine",
      color: "#0284C7",
      bg: "#F0F9FF",
      border: "#BAE6FD",
      badgeBg: "#E0F2FE",
      chipBg: "#FFFFFF",
      icon: "ferry",
      ioniconsName: "boat",
    };
  }

  // 2. Caribbean Cyan (#0891B2) - Land Taxis & Transport
  if (
    key === "taxi" ||
    key.includes("taxi") ||
    key.includes("car_mechanic") ||
    key.includes("mechanic") ||
    key.includes("border") ||
    key.includes("transport") ||
    key.includes("chofer") ||
    key.includes("golf cart")
  ) {
    return {
      id: "taxi",
      category: "Land Taxis & Transport",
      color: "#0891B2",
      bg: "#ECFEFF",
      border: "#A5F3FC",
      badgeBg: "#CFFAFE",
      chipBg: "#FFFFFF",
      icon: "taxi",
      ioniconsName: "car",
    };
  }

  // 3. Sea Teal (#0D9488) - Plumbing & Water Systems
  if (
    key === "plumbing" ||
    key.includes("plumb") ||
    key.includes("water_supply") ||
    key.includes("cistern") ||
    key.includes("fontanero") ||
    key.includes("plomero") ||
    key.includes("bomba") ||
    key.includes("agua")
  ) {
    return {
      id: "plumbing",
      category: "Plumbing & Water Systems",
      color: "#0D9488",
      bg: "#F0FDFA",
      border: "#99F6E4",
      badgeBg: "#CCFBF1",
      chipBg: "#FFFFFF",
      icon: "water-pump",
      ioniconsName: "water",
    };
  }

  // 4. Emerald Green (#059669) - Electricians, A/C & Solar
  if (
    key === "ac" ||
    key.includes("ac_repair") ||
    key.includes("a/c") ||
    key.includes("air conditioning") ||
    key.includes("electric") ||
    key.includes("power") ||
    key.includes("fridge") ||
    key.includes("appliance") ||
    key.includes("solar") ||
    key.includes("blackout") ||
    key.includes("naturgy") ||
    key.includes("generator")
  ) {
    return {
      id: "ac",
      category: "Electricians, A/C & Solar",
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      badgeBg: "#D1FAE5",
      chipBg: "#FFFFFF",
      icon: "snowflake",
      ioniconsName: "flash",
    };
  }

  // 5. Fresh Lime (#65A30D) - Gardening & Landscaping
  if (
    key === "gardening" ||
    key.includes("garden") ||
    key.includes("plant") ||
    key.includes("nursery") ||
    key.includes("tree") ||
    key.includes("chapeo") ||
    key.includes("mowing") ||
    key.includes("soil")
  ) {
    return {
      id: "gardening",
      category: "Gardening & Landscaping",
      color: "#65A30D",
      bg: "#F7FEE7",
      border: "#D9F99D",
      badgeBg: "#ECFCCB",
      chipBg: "#FFFFFF",
      icon: "sprout",
      ioniconsName: "leaf",
    };
  }

  // 6. Construction Gold (#CA8A04) - Contractors & Handymen
  if (
    key === "contractor" ||
    key.includes("contractor") ||
    key.includes("hardware") ||
    key.includes("ferreteria") ||
    key.includes("construction") ||
    key.includes("handyman") ||
    key.includes("carpenter") ||
    key.includes("dock")
  ) {
    return {
      id: "contractor",
      category: "Contractors & Handymen",
      color: "#CA8A04",
      bg: "#FEFCE8",
      border: "#FEF08A",
      badgeBg: "#FEF9C3",
      chipBg: "#FFFFFF",
      icon: "hammer-wrench",
      ioniconsName: "construct",
    };
  }

  // 7. Tech Amber (#D97706) - Starlink & Internet Techs
  if (
    key === "starlink" ||
    key.includes("starlink") ||
    key.includes("internet") ||
    key.includes("wifi") ||
    key.includes("router") ||
    key.includes("dish")
  ) {
    return {
      id: "starlink",
      category: "Starlink & Internet Techs",
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      badgeBg: "#FEF3C7",
      chipBg: "#FFFFFF",
      icon: "satellite-variant",
      ioniconsName: "radio",
    };
  }

  // 8. Tangerine Orange (#EA580C) - Banking, ATMs & Yappy
  if (
    key === "banking" ||
    key.includes("bank") ||
    key.includes("atm") ||
    key.includes("western_union") ||
    key.includes("punto_pago") ||
    key.includes("cash") ||
    key.includes("cajero") ||
    key.includes("yappy") ||
    key.includes("price")
  ) {
    return {
      id: "banking",
      category: "Banking, ATMs & Yappy",
      color: "#EA580C",
      bg: "#FFF7ED",
      border: "#FED7AA",
      badgeBg: "#FFEDD5",
      chipBg: "#FFFFFF",
      icon: "cash-multiple",
      ioniconsName: "cash",
    };
  }

  // 9. Coral Red (#F43F5E) - Supermarkets & Dining
  if (
    key === "dining" ||
    key.includes("dining") ||
    key.includes("restaurant") ||
    key.includes("grocer") ||
    key.includes("supermarket") ||
    key.includes("food") ||
    key.includes("menu") ||
    key.includes("comida")
  ) {
    return {
      id: "dining",
      category: "Supermarkets & Dining",
      color: "#F43F5E",
      bg: "#FFF1F2",
      border: "#FECDD3",
      badgeBg: "#FFE4E6",
      chipBg: "#FFFFFF",
      icon: "silverware-fork-knife",
      ioniconsName: "restaurant",
    };
  }

  // 10. Ruby Rose (#E11D48) - Doctor & Pharmacy
  if (
    key === "medical" ||
    key.includes("doctor") ||
    key.includes("medic") ||
    key.includes("pharmacy") ||
    key.includes("dentist") ||
    key.includes("clinic") ||
    key.includes("hospital") ||
    key.includes("farmacia")
  ) {
    return {
      id: "medical",
      category: "Doctor & Pharmacy",
      color: "#E11D48",
      bg: "#FFF1F2",
      border: "#FECDD3",
      badgeBg: "#FFE4E6",
      chipBg: "#FFFFFF",
      icon: "hospital-building",
      ioniconsName: "medkit",
    };
  }

  // 11. Fuchsia Magenta (#C026D3) - Island Vets & Animal Care
  if (
    key === "vet" ||
    key.includes("vet") ||
    key.includes("pet") ||
    key.includes("animal") ||
    key.includes("dog") ||
    key.includes("cat") ||
    key.includes("mascota")
  ) {
    return {
      id: "vet",
      category: "Island Vets & Animal Care",
      color: "#C026D3",
      bg: "#FDF4FF",
      border: "#F5D0FE",
      badgeBg: "#FAE8FF",
      chipBg: "#FFFFFF",
      icon: "paw",
      ioniconsName: "paw",
    };
  }

  // 12. Island Violet (#7C3AED) - Community & Island Culture (Default)
  return {
    id: "community",
    category: "Community & Island Culture",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    badgeBg: "#EDE9FE",
    chipBg: "#FFFFFF",
    icon: "book-open-variant",
    ioniconsName: "book",
  };
}

export function getCategoryPastelTheme(presetId: string): PastelTheme {
  const meta = getCategoryUnifiedMeta(presetId);
  return {
    bg: meta.bg,
    border: meta.border,
    accent: meta.color,
    badgeBg: meta.badgeBg,
    chipBg: meta.chipBg,
  };
}
