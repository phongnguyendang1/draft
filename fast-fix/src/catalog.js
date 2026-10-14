/* A leading ~ marks a generic phrase: it only wins when nothing more specific matches.
   The 100 popular Fast Fix jobs, in 10 groups (illustrative: the real list is curated with Ops).
   Each job: [id, title, keywords, internal minutes]. Keywords are phrase alternatives separated by "|"; a phrase matches when
   all its words appear in a clause of the member's description. Used by the matching stand-in and by search.
   The internal minutes only decide whether a request is more than a Fast Fix covers. They are never shown. */
var CATALOG = [
  { id: "plumbing", title: "Plumbing", icon: "ri-drop-line", kw: "plumber pipe pipes water sink toilet faucet drain leak", jobs: [
    ["toilet-run", "Running toilet", "toilet run|toilet constant|flapper|fill valve|toilet", 60],
    ["toilet-clog", "Clogged toilet", "toilet clog|toilet block|toilet plunge|toilet flush|toilet overflow", 60],
    ["toilet-seat", "Replace a toilet seat", "toilet seat|seat toilet", 30],
    ["faucet-leak", "Leaky faucet", "faucet leak|faucet drip|tap leak|tap drip|sink leak|faucet|tap", 60],
    ["faucet-swap", "Replace a faucet", "faucet replace|faucet swap|faucet install|faucet new|tap replace|new faucet", 60],
    ["showerhead", "Replace a showerhead", "shower head|showerhead|shower replace|shower", 30],
    ["drain-clog", "Clogged sink or drain", "sink clog|drain clog|clog drain|clog sink|sink slow|drain slow|sink drain|drain block|sink block|drain", 60],
    ["disposal", "Garbage disposal issue", "disposal|disposer|garbage disposal", 60],
    ["supply-line", "Replace a supply line or shutoff valve", "supply line|shutoff valve|shut off valve|braided line|angle stop", 60],
    ["sink-stopper", "Replace a sink stopper or strainer", "sink stopper|pop up stopper|drain stopper|strainer|stopper", 30]
  ] },
  { id: "doors", title: "Doors & Locks", icon: "ri-door-lock-line", kw: "door lock key knob hinge latch deadbolt entry", jobs: [
    ["lock", "Door lock issue", "door lock|lock stick|lock jam|lock stuck|lock|deadbolt|key stuck|key jam", 60],
    ["lock-swap", "Replace a door lock or deadbolt", "lock replace|lock install|lock new|deadbolt replace|deadbolt install|rekey|new lock|new deadbolt", 60],
    ["door-stick", "Sticking or loose door", "door stick|door rub|door latch|door drag|door close|door swollen|door squeak|door loose|door sag|door jam|door misalign|door", 30],
    ["knob", "Replace a door knob or handle", "door knob loose|knob loose|knob broken|door knob|door handle|handle replace|replace handle|doorknob|knob", 30],
    ["hinge", "Adjust or replace door hinges", "door hinge|hinge squeak|hinge loose|hinge replace|hinge", 30],
    ["door-stop", "Install a door stop or bumper", "door stop|doorstop|door bumper|wall protector|door stopper", 30],
    ["weather", "Add weatherstripping or a door sweep", "weatherstrip|weather strip|door sweep|door draft|draft door|draft|seal door|door seal|threshold", 60],
    ["peephole", "Install a peephole or door chain", "peephole|door chain|door viewer|door guard|security chain", 30],
    ["screen-door", "Fix a screen door", "screen door|storm door|screen door closer", 60],
    ["sliding", "Fix a sliding door or closet door", "sliding door|patio door|slider door|sliding track|sliding glass|closet door|bifold|bi fold", 60]
  ] },
  { id: "walls", title: "Walls, Paint & Tile", icon: "ri-brush-line", kw: "wall paint drywall tile grout caulk patch hole crack", jobs: [
    ["drywall", "Patch a small drywall hole", "drywall|wall hole|hole wall|hole in wall|patch wall|patch hole|wall patch|ceiling hole|hole ceiling", 60],
    ["nail-holes", "Fill nail or screw holes", "nail hole|screw hole|fill hole|picture hole|spackle|nail pop", 30],
    ["caulk", "Caulk a tub, sink or shower", "caulk|recaulk|reseal|seal tub|seal sink|tub seal|seal shower", 60],
    ["grout", "Re-grout a small tile area", "grout|regrout|tile grout", 60],
    ["tile", "Replace a cracked tile", "cracked tile|broken tile|replace tile|loose tile|tile crack|tile loose|tile broken|tile", 60],
    ["touch-up", "Touch-up paint", "touch up|touchup|paint touch|scuff|paint scratch|paint chip|paint", 60],
    ["paint-wall", "Paint an accent wall or small room", "accent wall|paint room|paint wall|paint bedroom|paint bathroom|paint closet|paint ceiling|paint trim", 60],
    ["baseboard", "Fix loose baseboard or trim", "baseboard|trim|molding|moulding|crown molding|quarter round|casing", 60],
    ["peel-tile", "Install peel-and-stick tile or backsplash", "peel stick|peel and stick|backsplash|tile backsplash|adhesive tile|vinyl tile", 60],
    ["wallpaper", "Hang or repair wallpaper", "wallpaper|wall paper", 60]
  ] },
  { id: "mounting", title: "Mounting & Hanging", icon: "ri-ruler-line", kw: "mount hang install wall hook shelf mirror tv", jobs: [
    ["tv", "Mount a TV", "tv mount|mount tv|mount television|tv|television|soundbar", 60],
    ["shelves", "Hang shelves", "shelf|shelves|floating shelf|shelving|hang shelf", 60],
    ["pictures", "Hang pictures or art", "picture|art|artwork|frame|framed|painting|wall art|photo|gallery wall|poster", 30],
    ["mirror", "Hang a mirror", "mirror|hang mirror|bathroom mirror|full length mirror", 30],
    ["hooks", "Install wall hooks or a coat rack", "hook|coat rack|wall hook|coat hook|key hook|entryway hook|hat rack", 30],
    ["towel", "Install a towel bar or bath accessory", "towel bar|towel ring|towel rack|toilet paper holder|robe hook|bath accessory|toothbrush holder|soap dish|towel hook", 30],
    ["closet-rod", "Install a closet rod or shelf", "closet rod|closet shelf|closet organizer|closet system|garment rod|wire shelf|closet", 60],
    ["wall-storage", "Mount a bike rack, pegboard or wall storage", "bike rack|wall storage|pegboard|garage hook|ladder hook|wall organizer|tool rack|garage storage", 60],
    ["curtain-rod", "Install curtain rods", "curtain rod|drapery rod|curtain bracket|rod curtain|curtain", 30],
    ["floating-desk", "Mount a floating desk or fold-down table", "floating desk|fold down table|wall desk|wall mounted desk|murphy desk|wall table", 60]
  ] },
  { id: "electrical", title: "Lighting & Electrical Swaps", icon: "ri-lightbulb-line", kw: "light fixture outlet switch fan bulb doorbell electric plug lamp", jobs: [
    ["light-fixture", "Replace a light fixture", "light fixture|ceiling light|chandelier|pendant|vanity light|fixture replace|replace light|swap light|install light|wall sconce|sconce|flush mount", 60],
    ["bulbs", "Replace hard-to-reach light bulbs", "bulb|light bulb|bulbs|lightbulb|replace bulb|high bulb|recessed bulb|led bulb", 30],
    ["outlet", "Replace an outlet or switch", "outlet|receptacle|switch|light switch|outlet cover|outlet replace|usb outlet", 60],
    ["dimmer", "Install a dimmer switch", "dimmer|dimmer switch|smart switch|smart dimmer", 60],
    ["fan", "Replace a ceiling or bath fan", "ceiling fan|fan install|fan replace|bath fan|exhaust fan|fan", 60],
    ["doorbell", "Install a doorbell", "doorbell|video doorbell|ring doorbell|door bell|chime", 60],
    ["thermostat", "Install a smart thermostat", "thermostat|nest|smart thermostat|ecobee", 60],
    ["smoke", "Replace smoke detector batteries", "smoke detector|smoke alarm|battery|batteries|chirp|chirping|detector battery|alarm battery", 30],
    ["smart-plug", "Set up smart plugs or smart bulbs", "smart plug|smart bulb|smart home|smart outlet|wifi plug|hue|smart light", 30],
    ["camera", "Install a plug-in security camera", "security camera|camera|ring camera|wyze|baby monitor|nanny cam", 30]
  ] },
  { id: "kitchen", title: "Kitchen & Appliances", icon: "ri-fridge-line", kw: "kitchen appliance cabinet drawer dishwasher oven fridge washer dryer", jobs: [
    ["appliance", "Appliance diagnostic", "appliance|appliance diagnostic|appliance broken|appliance not working", 60],
    ["dishwasher", "Dishwasher issue", "dishwasher|dish washer|dishwasher drain|dishwasher leak", 60],
    ["washer-dryer", "Washer or dryer issue", "washing machine|washer|dryer|laundry machine|dryer vent|clothes dryer", 60],
    ["fridge", "Refrigerator issue", "fridge|refrigerator|freezer|ice maker|fridge leak", 60],
    ["oven", "Oven or stove issue", "oven|stove|range|cooktop|burner|stovetop", 60],
    ["microwave", "Microwave or range hood issue", "microwave|range hood|vent hood|hood fan|over the range", 60],
    ["filter-swap", "Replace a fridge or range hood filter", "hood filter|fridge filter|water filter|refrigerator filter|replace filter", 30],
    ["cab-door", "Fix a cabinet door or hinge", "cabinet door|cabinet hinge|cabinet loose|cabinet crooked|kitchen cabinet|cabinet", 30],
    ["cab-hw", "Install cabinet handles or knobs", "cabinet handle|cabinet knob|drawer pull|cabinet hardware|cabinet pull|handle cabinet|knob cabinet|install handles", 60],
    ["drawer", "Fix a stuck or broken drawer", "drawer slide|drawer stick|drawer stuck|drawer broken|drawer off track|drawer|drawer front", 30]
  ] },
  { id: "furniture", title: "Furniture & Assembly", icon: "ri-sofa-line", kw: "furniture assemble assembly build put together ikea", jobs: [
    ["assemble", "Assemble furniture", "~assemble|~assembly|~put together|~ikea|~flat pack|~flatpack|build furniture|furniture assembly", 60],
    ["bed", "Assemble a bed frame", "bed frame|bed assemble|assemble bed|bunk bed|headboard|platform bed|bed", 60],
    ["desk", "Assemble a desk", "desk|standing desk|computer desk|desk assemble|office desk", 60],
    ["dresser", "Assemble a dresser or bookcase", "dresser|bookcase|bookshelf|nightstand|shelving unit|wardrobe|chest of drawers|armoire|tv stand", 60],
    ["table-chairs", "Assemble a table or chairs", "dining table|table assemble|chairs|chair assemble|assemble chair|assemble table|coffee table|kitchen table|bar stool|stool", 60],
    ["patio-furniture", "Assemble outdoor furniture", "patio furniture|outdoor furniture|patio set|adirondack|patio chair|patio table|outdoor chair|outdoor table", 60],
    ["crib", "Assemble a crib or child's furniture", "crib|changing table|toddler bed|high chair|bassinet|nursery|playpen|kid furniture", 60],
    ["exercise", "Assemble exercise equipment", "treadmill|exercise bike|peloton|gym equipment|weight bench|elliptical|home gym|exercise equipment|rowing machine", 60],
    ["anchor", "Anchor furniture to the wall", "anchor furniture|tip over|furniture anchor|secure furniture|anti tip|tipping", 30],
    ["wobbly", "Fix a wobbly table or chair", "wobbly|wobble|wobbly chair|wobbly table|chair repair|repair chair|broken chair|loose chair|chair leg|table leg|rickety", 30]
  ] },
  { id: "windows", title: "Windows & Blinds", icon: "ri-window-line", kw: "window blinds shades screen glass", jobs: [
    ["blinds", "Install blinds or shades", "blinds|blind|shades|shade|window shade|roller shade|cellular shade|roman shade", 60],
    ["blind-repair", "Repair or re-string blinds", "blind repair|repair blind|blind cord|broken blind|string blind|restring|blind broken|blind wand", 30],
    ["window-screen", "Replace a window screen", "window screen|screen window|torn screen|replace screen|screen repair|screen", 30],
    ["window-stick", "Fix a sticking window", "window stick|window stuck|window jam|window open|window close|window hard", 60],
    ["window-latch", "Fix a window latch or crank", "window latch|window crank|window lock|window handle|window hardware|window opener|window broken", 30],
    ["window-film", "Install window or privacy film", "window film|privacy film|frosted film|window tint|glass film", 60],
    ["window-seal", "Seal a drafty window", "window draft|drafty window|window seal|window weatherstrip|window caulk|window leak|window gap|window insulation", 60],
    ["blind-bracket", "Replace blind brackets or hardware", "blind bracket|blind hardware|bracket blind|valance|cornice|blind mount", 30],
    ["blind-cut", "Cut blinds to size", "cut blind|blind size|blind cut|trim blind|blind fit|blinds too long", 30],
    ["window-stop", "Install a window stop or lock", "window lock install|window stop|window security|window guard|window limiter|window alarm", 30]
  ] },
  { id: "safety", title: "Home Care & Safety", icon: "ri-shield-check-line", kw: "safety care protect maintenance filter railing", jobs: [
    ["latches", "Install safety latches or gates", "child proof|childproof|baby gate|safety latch|cabinet lock|baby proof|babyproof|outlet cover|child lock|safety gate|stair gate", 60],
    ["grab-bar", "Install a grab bar", "grab bar|safety bar|shower bar|shower grab|bathroom grab|assist bar", 30],
    ["co-detector", "Install a carbon monoxide detector", "carbon monoxide|co detector|co alarm|monoxide detector", 30],
    ["extinguisher", "Mount a fire extinguisher", "fire extinguisher|extinguisher|extinguisher bracket|extinguisher mount", 30],
    ["hvac-filter", "Replace HVAC or furnace filters", "hvac filter|furnace filter|air filter|ac filter|return filter|filter replace|air conditioner filter|filter", 30],
    ["handrail", "Tighten a loose handrail or railing", "handrail|railing|banister|stair rail|loose rail|rail loose|stair railing|bannister", 60],
    ["stair-squeak", "Fix a squeaky stair or floor", "squeaky stair|squeaky floor|stair squeak|floor squeak|creaky floor|creaky stair|creak stair|creak floor|floor creak|squeaky", 60],
    ["night-lights", "Install night lights or motion lights", "night light|motion light|motion sensor light|stair light|closet light|led strip|under cabinet light|nightlight", 30],
    ["mailbox", "Install or repair a mailbox", "mailbox|mail box|house number|address number|mail slot|package box|mail post", 30],
    ["lockbox", "Install a key lockbox", "lockbox|key box|key safe|keypad lock|key lock box|combination lock box", 30]
  ] },
  { id: "outdoors", title: "Outdoors & Other", icon: "ri-home-gear-line", kw: "outdoor outside yard garage gate fence deck patio other", jobs: [
    ["gate", "Fix a gate latch or hinge", "gate|gate latch|gate hinge|gate sag|gate close|fence gate|garden gate", 60],
    ["fence", "Fix a loose fence panel", "fence|fence panel|fence post|fence board|loose fence|fence repair|picket|leaning fence", 60],
    ["outdoor-light", "Replace an outdoor light or sensor", "outdoor light|porch light|motion sensor|security light|flood light|floodlight|exterior light|patio light|garage light", 60],
    ["spigot", "Replace a hose or outdoor spigot cover", "hose|spigot|hose bib|outdoor faucet|faucet cover|hose reel|garden hose|sprinkler head", 30],
    ["garage-door", "Fix a garage door keypad or remote", "garage door|garage keypad|garage opener|opener remote|garage remote|keypad garage|garage sensor", 60],
    ["grill", "Assemble a grill", "grill|bbq|barbecue|barbeque|smoker|grill assemble", 60],
    ["string-lights", "Hang string or holiday lights", "string light|holiday light|christmas light|fairy light|patio string|outdoor string|light string|twinkle", 60],
    ["deck", "Fix a loose deck board or step", "deck board|deck|porch step|loose step|step loose|wood step|stair step|porch board|deck screw", 60],
    ["pet-door", "Install a pet door", "pet door|dog door|cat flap|pet flap|doggie door|cat door", 60],
    ["other", "Something else", "", 60]
  ] }
];
