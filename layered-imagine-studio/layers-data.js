// Semantic layered presets for Imagine Studio
// Each preset contains decomposed layers with individual prompts, masks, alpha graphics, and prompt mutation variants

window.IMAGINE_PRESETS = [
  {
    id: "cyberpunk-runner",
    name: "Cyberpunk Courier",
    description: "Futuristic street scene decomposed into 4 discrete layers with transparent alpha separation",
    aspectRatio: "1:1",
    basePrompt: "A high-tech cyberpunk courier holding a holographic delivery cube in a neon-lit rain-slicked Tokyo alley, depth of field, 8k render",
    layers: [
      {
        id: "layer-bg",
        name: "Background • Rainy Alley & Megastructure",
        type: "background",
        depth: 0,
        zOffset: 0,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Futuristic rainy neon Tokyo alleyway, blurred skyscraper megastructures, wet asphalt reflection, cyan and magenta ambient lighting",
        hasBackground: true,
        renderType: "procedural-bg-cyberpunk",
        mutationVariants: {
          "sunny tokyo": "Bright sunny futuristic Neo-Tokyo day with cherry blossoms and clean steel towers",
          "cyberpunk neon": "Futuristic rainy neon Tokyo alleyway, blurred skyscraper megastructures, cyan and magenta lights",
          "mars colony": "Dune-like Mars colony biosphere dome with red atmospheric haze and industrial pipelines",
          "synthwave grid": "Retro 1980s synthwave neon grid horizon with purple glowing mountains and wireframe sun"
        }
      },
      {
        id: "layer-mid",
        name: "Midground • Hover Vehicle & Cyber Vending",
        type: "prop",
        depth: 1,
        zOffset: 70,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Parked aerodynamic hovercraft vehicle with glowing thrusters, holographic vending machine kiosk dispensing cyber drinks",
        hasBackground: false,
        renderType: "procedural-mid-cyberpunk",
        mutationVariants: {
          "hover car": "Sleek matte-black hover-car with blue exhaust trails and chrome rims",
          "drone patrol": "Pair of hovering security drones scanning with red laser searchlights",
          "cyber food stall": "Steaming Japanese ramen noodle stall with glowing lantern signs and neon menu displays",
          "none / remove": "Empty midground with atmospheric steam vents"
        }
      },
      {
        id: "layer-subject",
        name: "Subject • Cyber Courier Character",
        type: "subject",
        depth: 2,
        zOffset: 140,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Young female cyber courier wearing an illuminated waterproof tactical trench coat, glowing amber cybernetic visor, holding a levitating encrypted data box",
        hasBackground: false,
        renderType: "procedural-subject-cyberpunk",
        mutationVariants: {
          "cyber visor": "Female cyber courier in luminous tactical trench coat and amber visor holding data cube",
          "mech warrior": "Armored cyborg soldier in heavy titanium exoskeleton suit with glowing blue reactor core",
          "samurai assassin": "Cyberpunk ronin with glowing plasma katana and high-tech carbon-fiber kabuto helmet",
          "steampunk explorer": "Victorian steampunk adventurer with brass goggles, leather harness, and vacuum-tube compass"
        }
      },
      {
        id: "layer-fg",
        name: "Foreground • Holograms, Rain & Neon Glow",
        type: "overlay",
        depth: 3,
        zOffset: 210,
        visible: true,
        opacity: 0.95,
        blendMode: "screen",
        prompt: "Falling rain streaks, floating AR interface HUD glyphs, lens flare reflections, and glowing atmospheric particle haze",
        hasBackground: false,
        renderType: "procedural-fg-cyberpunk",
        mutationVariants: {
          "rain & hud": "Falling rain streaks with glowing cyan holographic AR interface widgets and lens flare",
          "sakura petals": "Floating glowing cyber sakura blossoms drifting in wind with pink light trails",
          "laser scan grid": "Geometric green laser scanning grid projected across the entire scene",
          "clean minimal": "Subtle ambient mist with soft volumetric cinematic godrays"
        }
      }
    ]
  },
  {
    id: "mecha-sentinel",
    name: "Autonomous Mecha Sentinel",
    description: "Complex sci-fi robotics unit decomposed into reactor background, chassis armor, hydraulic weapons, and particle shields",
    aspectRatio: "1:1",
    basePrompt: "Heavy industrial bipedal mecha guardian inside a subterranean quantum reactor facility, cinematic studio lighting",
    layers: [
      {
        id: "layer-bg",
        name: "Background • Subterranean Reactor Core",
        type: "background",
        depth: 0,
        zOffset: 0,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Massive underground fusion reactor silo with glowing plasma chamber, steel walkways, and cooling vapor",
        hasBackground: true,
        renderType: "procedural-bg-mecha",
        mutationVariants: {
          "reactor core": "Subterranean quantum fusion reactor silo with blue Cherenkov radiation glow",
          "space hangar": "Orbital space station dry-dock with panoramic view of planet Earth below",
          "apocalyptic desert": "Dusty post-apocalyptic rusted wasteland with crimson storm clouds",
          "clean white lab": "Spotless futuristic research hangar with high-key architectural white lighting"
        }
      },
      {
        id: "layer-mid",
        name: "Midground • Heavy Hydraulic Weapons & Gantry",
        type: "prop",
        depth: 1,
        zOffset: 70,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Articulated railgun arms, industrial maintenance cranes, robotic refueling conduits with safety hazard stripes",
        hasBackground: false,
        renderType: "procedural-mid-mecha",
        mutationVariants: {
          "railguns": "Dual shoulder-mounted kinetic railguns with warning stencils and heat sink vents",
          "missile pods": "Twin micro-missile launcher pods loaded with glowing payload indicators",
          "plasma cannons": "High-frequency plasma pulse cannons with cooling conduit coils",
          "unarmed / repair": "Exposed repair rig with pneumatic robotic servicing arms"
        }
      },
      {
        id: "layer-subject",
        name: "Subject • Mecha Core Chassis",
        type: "subject",
        depth: 2,
        zOffset: 140,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Heavy titan bipedal mecha torso and legs, matte-olive military armor plating, glowing optical sensor array, hydraulic pistons",
        hasBackground: false,
        renderType: "procedural-subject-mecha",
        mutationVariants: {
          "military olive": "Heavy combat mecha in matte olive drab armor with yellow industrial hazard accents",
          "prototype white": "Sleek prototype mecha in pearl-white ceramic armor with gold accents",
          "stealth carbon": "Low-observability stealth mecha in faceted matte-black carbon composite",
          "crimson commander": "Flagship commander mecha in deep crimson lacquer with ceremonial crest"
        }
      },
      {
        id: "layer-fg",
        name: "Foreground • Hexagonal Energy Shield & Sparks",
        type: "overlay",
        depth: 3,
        zOffset: 210,
        visible: true,
        opacity: 0.9,
        blendMode: "screen",
        prompt: "Translucent glowing hexagonal energy barrier absorbing projectile impacts with golden sparks and heat distortion",
        hasBackground: false,
        renderType: "procedural-fg-mecha",
        mutationVariants: {
          "hex energy shield": "Glowing cyan hexagonal forcefield barrier deflecting plasma with sparks",
          "electrical discharge": "Crackling purple arcs of high-voltage static electricity surrounding the unit",
          "smoke & embers": "Drifting heavy battle smoke with glowing red fiery embers and heat shimmer",
          "clean glass hud": "Tactical HUD targeting reticle with lock-on vectors and ammunition counters"
        }
      }
    ]
  },
  {
    id: "botanical-sanctuary",
    name: "Bioluminescent Glasshouse",
    description: "Artistic botanical composition with organic glass structure, exotic glowing flora, and floating pollinator spirits",
    aspectRatio: "1:1",
    basePrompt: "An ethereal botanical sanctuary dome with glowing alien flora, mystical glass architecture, and luminous spore clouds",
    layers: [
      {
        id: "layer-bg",
        name: "Background • Geodesic Crystal Dome & Twilight",
        type: "background",
        depth: 0,
        zOffset: 0,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Starry twilight sky viewed through an intricate Victorian crystal glasshouse dome, distant misty mountains",
        hasBackground: true,
        renderType: "procedural-bg-botanical",
        mutationVariants: {
          "crystal dome": "Victorian crystal greenhouse dome framing a starry midnight sky with aurora borealis",
          "enchanted forest": "Deep mystical emerald ancient forest under moonlit fog",
          "desert oasis": "Warm starry desert oasis with palm silhouettes under Milky Way galaxy",
          "minimal studio": "Neutral warm beige architectural studio backdrop with soft morning sunlight"
        }
      },
      {
        id: "layer-mid",
        name: "Midground • Giant Glowing Mushrooms & Ferns",
        type: "prop",
        depth: 1,
        zOffset: 70,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Luminous turquoise bioluminescent mushrooms, oversized silver fiddlehead ferns, and tangled flowering vines",
        hasBackground: false,
        renderType: "procedural-mid-botanical",
        mutationVariants: {
          "bioluminescent fungi": "Clusters of glowing cyan and magenta bioluminescent mushrooms on mossy roots",
          "crystallized plants": "Translucent quartz crystal flowers and prism-refracting succulent plants",
          "golden orchids": "Cascading golden metallic orchids with dripping nectar droplets",
          "tropical foliage": "Rich monsteras and lush broadleaf palms with dew drops"
        }
      },
      {
        id: "layer-subject",
        name: "Subject • Ancient Spirit Tree with Glowing Heart",
        type: "subject",
        depth: 2,
        zOffset: 140,
        visible: true,
        opacity: 1.0,
        blendMode: "source-over",
        prompt: "Twisted ancient bonsai-style spirit tree with cherry blossom canopy and a pulsing golden luminescent heart crystal in trunk",
        hasBackground: false,
        renderType: "procedural-subject-botanical",
        mutationVariants: {
          "spirit tree": "Ancient bonsai spirit tree with illuminated pink blossoms and amber core",
          "crystal terrarium": "Floating faceted geometric glass terrarium containing a miniature living ecosystem",
          "mystic guardian deer": "Ethereal spirit deer with flowering antlers and luminescent starry coat",
          "stone deity statue": "Overgrown mossy stone statue holding a glowing golden lotus flower"
        }
      },
      {
        id: "layer-fg",
        name: "Foreground • Drifting Spores, Fireflies & Bokeh",
        type: "overlay",
        depth: 3,
        zOffset: 210,
        visible: true,
        opacity: 0.85,
        blendMode: "screen",
        prompt: "Drifting glowing golden botanical spore particles, shimmering fireflies, soft prismatic bokeh orbs",
        hasBackground: false,
        renderType: "procedural-fg-botanical",
        mutationVariants: {
          "spores & fireflies": "Drifting golden glowing spore particles and dancing fireflies with soft bokeh",
          "magical runes": "Subtle shimmering golden Celtic floral runes floating in air",
          "rain of light": "Delicate vertical beams of light filtering down like liquid gold strands",
          "clean soft mist": "Low lying ethereal ground fog with delicate dew shimmer"
        }
      }
    ]
  }
];
