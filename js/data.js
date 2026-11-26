// Question pool for Spindle. Each category has its own tuple format (see comments).
// Sample data only, not yet based on real player answers.
var SPINDLE_DATA = {
  // [songA, yearA, songB, yearB]
  duel: [
    ["Losing My Religion – R.E.M.", 1991, "Creep – Radiohead", 1992],
    ["Sweet Dreams – Eurythmics", 1983, "Take On Me – a-ha", 1985],
    ["Happy – Pharrell Williams", 2013, "Uptown Funk – Mark Ronson ft. Bruno Mars", 2014],
    ["Shape of You – Ed Sheeran", 2017, "Blinding Lights – The Weeknd", 2019],
    ["Gangnam Style – PSY", 2012, "Despacito – Luis Fonsi", 2017],
    ["Umbrella – Rihanna", 2007, "Single Ladies – Beyoncé", 2008],
    ["Wannabe – Spice Girls", 1996, "...Baby One More Time – Britney Spears", 1998],
    ["Rock Me Amadeus – Falco", 1985, "99 Luftballons – Nena", 1983]
  ],
  // [emoji, answer, wrongOptions]
  emoji: [
    ["🌧️💜", "Purple Rain", ["November Rain", "Rain on Me", "Blue Monday"]],
    ["👁️🐯", "Eye of the Tiger", ["Tiger Feet", "Hungry Like the Wolf", "Lionheart"]],
    ["🧊🧊👶", "Ice Ice Baby", ["Baby One More Time", "Cold as Ice", "Frozen"]],
    ["🍉🍬", "Watermelon Sugar", ["Sugar", "Cherry Bomb", "Lemonade"]],
    ["🚀👨", "Rocket Man", ["Space Oddity", "Man on the Moon", "Starman"]],
    ["🌞➡️", "Here Comes the Sun", ["Walking on Sunshine", "Sunny", "Sun Is Shining"]],
    ["☂️☔", "Umbrella", ["November Rain", "Singin' in the Rain", "Have You Ever Seen the Rain"]],
    ["👧🌌💎", "Lucy in the Sky with Diamonds", ["Diamonds", "A Sky Full of Stars", "Starman"]]
  ],
  // [titleWithGap, answer, wrongOptions, artist]
  gap: [
    ["Bohemian ___", "Rhapsody", ["Dream", "Lullaby", "Nights"], "Queen"],
    ["Stairway to ___", "Heaven", ["Paradise", "Nowhere", "the Stars"], "Led Zeppelin"],
    ["Livin' on a ___", "Prayer", ["Dream", "Highway", "Wire"], "Bon Jovi"],
    ["Seven Nation ___", "Army", ["Anthem", "March", "Kingdom"], "The White Stripes"],
    ["Sweet Child o' ___", "Mine", ["Light", "Time", "Gold"], "Guns N' Roses"],
    ["Smells Like Teen ___", "Spirit", ["Angst", "Dreams", "Heart"], "Nirvana"],
    ["Hotel ___", "California", ["Paradise", "Babylon", "Royale"], "Eagles"],
    ["Total Eclipse of the ___", "Heart", ["Sun", "Moon", "Mind"], "Bonnie Tyler"]
  ],
  // [swatches, answer, wrongOptions]
  color: [
    [["#0b0b0b", "#0b0b0b", "#e8312a", "#f39a1f", "#f7e23a", "#3fae49", "#2e7fc2", "#7b4ea3"], "The Dark Side of the Moon – Pink Floyd", ["Abbey Road – The Beatles", "Nevermind – Nirvana", "Rumours – Fleetwood Mac"]],
    [["#8ace00", "#8ace00", "#8ace00", "#8ace00", "#111111"], "brat – Charli XCX", ["SOUR – Olivia Rodrigo", "Short n' Sweet – Sabrina Carpenter", "Future Nostalgia – Dua Lipa"]],
    [["#0b4f8a", "#1f78b4", "#6ec1e4", "#f1c9a5", "#3d8c40"], "Nevermind – Nirvana", ["OK Computer – Radiohead", "Parachutes – Coldplay", "Blue – Joni Mitchell"]],
    [["#5ec4d6", "#7fd3e0", "#ffffff", "#2f8fa6"], "÷ (Divide) – Ed Sheeran", ["x (Multiply) – Ed Sheeran", "1989 – Taylor Swift", "25 – Adele"]],
    [["#2a1245", "#6a2c91", "#b47fd1", "#e8c6f0", "#1a1a1a"], "Purple Rain – Prince", ["SOUR – Olivia Rodrigo", "Lemonade – Beyoncé", "Thriller – Michael Jackson"]],
    [["#ffffff", "#f5f1e6", "#f2d21b", "#e3bf12", "#3a2a12"], "The Velvet Underground & Nico – The Velvet Underground", ["Sticky Fingers – The Rolling Stones", "Transformer – Lou Reed", "Horses – Patti Smith"]],
    [["#c8102e", "#f2f2f2", "#c8102e", "#f2f2f2", "#4a6fa5", "#2d3e66"], "Born in the U.S.A. – Bruce Springsteen", ["Born to Run – Bruce Springsteen", "Back in Black – AC/DC", "Hotel California – Eagles"]]
  ],
  // list of [song, year] – four per set
  time: [
    [["Hey Jude – The Beatles", 1968], ["Billie Jean – Michael Jackson", 1983], ["Wonderwall – Oasis", 1995], ["Rolling in the Deep – Adele", 2010]],
    [["Bohemian Rhapsody – Queen", 1975], ["Like a Prayer – Madonna", 1989], ["Hips Don't Lie – Shakira", 2006], ["bad guy – Billie Eilish", 2019]],
    [["Respect – Aretha Franklin", 1967], ["Dancing Queen – ABBA", 1976], ["Smells Like Teen Spirit – Nirvana", 1991], ["Crazy in Love – Beyoncé", 2003]],
    [["Johnny B. Goode – Chuck Berry", 1958], ["Imagine – John Lennon", 1971], ["Vogue – Madonna", 1990], ["Umbrella – Rihanna", 2007]],
    [["Satisfaction – The Rolling Stones", 1965], ["Like a Virgin – Madonna", 1984], ["Hey Ya! – OutKast", 2003], ["Levitating – Dua Lipa", 2020]],
    [["Good Vibrations – The Beach Boys", 1966], ["Stayin' Alive – Bee Gees", 1977], ["Livin' on a Prayer – Bon Jovi", 1986], ["Hello – Adele", 2015]],
    [["My Generation – The Who", 1965], ["Ein bisschen Frieden – Nicole", 1982], ["Mambo No. 5 – Lou Bega", 1999], ["Atemlos durch die Nacht – Helene Fischer", 2013]]
  ],
  // [artist, fourClues, wrongOptions]
  bio: [
    ["Rammstein", ["Formed in 1994 in Berlin", "Genre: Neue Deutsche Härte", "Singer: Till Lindemann", "Hit: “Du hast”"], ["Scooter", "Die Toten Hosen", "Kraftwerk"]],
    ["ABBA", ["Formed in 1972 in Stockholm", "Four members, two couples", "Won Eurovision in 1974", "Hit: “Waterloo”"], ["Roxette", "Ace of Base", "Boney M."]],
    ["Billie Eilish", ["Born in 2001 in Los Angeles", "Her brother produces her music", "Sang the Bond theme “No Time to Die”", "Hit: “bad guy”"], ["Olivia Rodrigo", "Lorde", "Halsey"]],
    ["Daft Punk", ["A duo from Paris", "Only performed wearing helmets", "Split up in 2021", "Hit: “Get Lucky”"], ["Justice", "Air", "The Chemical Brothers"]],
    ["Bad Bunny", ["From Puerto Rico", "Most-streamed artist on Spotify 2020–2022", "Album “Un Verano Sin Ti” (2022)", "Hit: “Tití Me Preguntó”"], ["J Balvin", "Ozuna", "Daddy Yankee"]],
    ["Queen", ["Formed in 1970 in London", "Legendary Live Aid set in 1985", "Singer: Freddie Mercury", "Hit: “We Will Rock You”"], ["The Who", "Led Zeppelin", "Deep Purple"]],
    ["Kraftwerk", ["Formed in 1970 in Düsseldorf", "Pioneers of electronic pop", "Founders: Ralf Hütter and Florian Schneider", "Hit: “The Model”"], ["Tangerine Dream", "Depeche Mode", "Can"]],
    ["Bob Marley", ["Born in 1945 in Jamaica", "Band: The Wailers", "Album “Exodus” (1977)", "Hit: “No Woman, No Cry”"], ["Jimmy Cliff", "Shaggy", "Toots Hibbert"]]
  ],
  // [song, knownArtist, answer, wrongOptions]
  duet: [
    ["Under Pressure", "Queen", "David Bowie", ["Elton John", "Mick Jagger", "Freddie King"]],
    ["Empire State of Mind", "Jay-Z", "Alicia Keys", ["Rihanna", "Beyoncé", "Mary J. Blige"]],
    ["Shallow", "Lady Gaga", "Bradley Cooper", ["Tony Bennett", "Bruno Mars", "Ryan Gosling"]],
    ["Señorita", "Shawn Mendes", "Camila Cabello", ["Selena Gomez", "Dua Lipa", "Becky G"]],
    ["Uptown Funk", "Mark Ronson", "Bruno Mars", ["Pharrell Williams", "Justin Timberlake", "Anderson .Paak"]],
    ["Islands in the Stream", "Dolly Parton", "Kenny Rogers", ["Johnny Cash", "Willie Nelson", "Elvis Presley"]],
    ["Don't Go Breaking My Heart", "Elton John", "Kiki Dee", ["Olivia Newton-John", "Dusty Springfield", "Cher"]],
    ["Somebody That I Used to Know", "Gotye", "Kimbra", ["Lorde", "Sia", "Ladyhawke"]]
  ],
  // [prompt, {c: common, m: medium, r: rare}] – free-text finale
  rare: [
    ["Name a song with an animal in the title", {
      c: ["eye of the tiger", "hound dog", "baby shark", "dark horse"],
      m: ["blackbird", "crocodile rock", "hungry like the wolf", "karma chameleon", "the lion sleeps tonight", "white rabbit", "rock lobster", "stray cat strut", "black horse and the cherry tree"],
      r: ["free bird", "buffalo soldier", "bat out of hell", "cat scratch fever", "love cats", "eagle", "snake eyes", "fox on the run"]
    }],
    ["Name a band or artist from Sweden", {
      c: ["abba", "avicii", "roxette", "swedish house mafia"],
      m: ["ace of base", "europe", "robyn", "zara larsson", "tove lo", "cardigans", "loreen", "ghost", "sabaton", "basshunter", "icona pop"],
      r: ["first aid kit", "hives", "mando diao", "kent", "rednex", "opeth", "lykke li", "knife", "dr alban", "peter bjorn and john", "in flames", "jose gonzalez"]
    }],
    ["Name a song with a colour in the title", {
      c: ["purple rain", "yellow", "paint it black", "back to black", "yellow submarine"],
      m: ["blue da ba dee", "red red wine", "lady in red", "black hole sun", "back in black", "mr blue sky", "white christmas", "nights in white satin", "brown eyed girl", "blue suede shoes", "black or white", "purple haze"],
      r: ["green onions", "orange crush", "schwarz zu blau", "white wedding", "blue monday", "golden brown", "pink", "red light spells danger"]
    }],
    ["Name a German rapper", {
      c: ["capital bra", "apache 207", "sido", "bushido", "cro"],
      m: ["kool savas", "haftbefehl", "shirin david", "ufo361", "kollegah", "casper", "marteria", "bonez mc", "gzuz", "luciano", "samra", "kontra k"],
      r: ["juju", "badmomzjay", "pashanim", "ski aggu", "samy deluxe", "fler", "megaloh", "trettmann", "nura", "ebow", "haiyti", "farid bang"]
    }],
    ["Name a song with a number in the title", {
      c: ["99 luftballons", "7 rings", "22", "1999", "summer of 69", "mambo no 5"],
      m: ["9 to 5", "two princes", "seven nation army", "500 miles", "99 problems", "three little birds", "2 become 1", "one love", "seven seas of rhye"],
      r: ["eight days a week", "five years", "4 minutes", "7 seconds", "two of us", "1979", "one week", "21 guns", "50 ways to leave your lover", "1 2 3 4"]
    }]
  ]
};

var SPINDLE_LABELS = {
  duel: "Which is older?",
  emoji: "Emoji Song",
  gap: "Fill the Gap",
  color: "Cover Colours",
  time: "Timeline",
  bio: "Artist Profile",
  duet: "Duet Partner",
  rare: "Finale: Rarest Answer"
};

if (typeof module !== "undefined") module.exports = { SPINDLE_DATA: SPINDLE_DATA, SPINDLE_LABELS: SPINDLE_LABELS };
