/*
 * Question bank for the Daily Trivia Challenge.
 *
 * Each day, the game deterministically picks one question per "slot" (1-10)
 * from the pools below, based on the EST calendar date. That means every
 * player gets the exact same 10 questions on a given day.
 *
 * Slot layout (see daily.js):
 *   Slots 1-3  : multiple choice   (5 / 10 / 15 pts, easy -> hard)
 *   Slots 4-6  : written answer     (5 / 10 / 15 pts, easy -> hard)
 *   Slots 7-9  : visual (map/flag)  (5 / 10 / 15 pts, easy -> hard)
 *   Slot 10    : number estimate    (25 pts, partial credit by % error)
 *
 * Category mix targets the 25-75 audience (bias 35-45): a blend of classic
 * and modern sports, geography, flags, politics, pop culture and history.
 *
 * Question shapes:
 *   multiple-choice : { type:'mc', q, options:[...], answer:<index> }
 *   written         : { type:'written', q, accept:[...], display:<canonical> }
 *   flag (image)    : { type:'flag', q, code:'<iso2>', options:['XX','YY',...] }
 *   map             : { type:'map', q, lat, lng, country, place }
 *   number          : { type:'number', q, answer:<num>, unit, tolerance }
 */
(function (T) {
  "use strict";

  T.BANK = {
    // ---------------------------------------------------------------- MC easy
    mc1: [
      { category: "Pop Culture", q: "Which band released the 1991 album 'Nevermind'?", options: ["Pearl Jam", "Nirvana", "Soundgarden", "Alice in Chains"], answer: 1 },
      { category: "Movies", q: "Who played the title role in the 1994 film 'Forrest Gump'?", options: ["Kevin Costner", "Tom Hanks", "Bill Murray", "Robin Williams"], answer: 1 },
      { category: "Movies", q: "Who directed 'Jurassic Park' (1993) and 'E.T. the Extra-Terrestrial'?", options: ["George Lucas", "Steven Spielberg", "James Cameron", "Ridley Scott"], answer: 1 },
      { category: "Movies", q: "Which 1994 film follows inmate Andy Dufresne at Shawshank prison?", options: ["The Green Mile", "The Shawshank Redemption", "Cool Hand Luke", "Goodfellas"], answer: 1 },
      { category: "Sports", q: "Which country won the 2022 FIFA World Cup?", options: ["France", "Argentina", "Brazil", "Croatia"], answer: 1 },
      { category: "Sports", q: "Which player became the NBA's all-time leading scorer in 2023?", options: ["Michael Jordan", "Kareem Abdul-Jabbar", "LeBron James", "Kobe Bryant"], answer: 2 },
      { category: "Pop Culture", q: "Which Netflix series features a deadly Korean game and 'Red Light, Green Light'?", options: ["Alice in Borderland", "Squid Game", "Money Heist", "Hellbound"], answer: 1 },
      { category: "Pop Culture", q: "Which artist released the best-selling 1982 album 'Thriller'?", options: ["Prince", "Michael Jackson", "Lionel Richie", "Stevie Wonder"], answer: 1 },
      { category: "Music", q: "Which band recorded the 1975 rock epic 'Bohemian Rhapsody'?", options: ["Led Zeppelin", "The Rolling Stones", "Queen", "The Who"], answer: 2 },
      { category: "Sports", q: "Which Grand Slam tennis tournament is played at the All England Club?", options: ["US Open", "Wimbledon", "French Open", "Australian Open"], answer: 1 },
      { category: "Geography", q: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], answer: 2 },
      { category: "History", q: "In what year did World War II end?", options: ["1943", "1945", "1947", "1950"], answer: 1 },
      { category: "Science", q: "What is the largest planet in our solar system?", options: ["Saturn", "Jupiter", "Neptune", "Earth"], answer: 1 },
      { category: "Pop Culture", q: "At the 2022 Academy Awards, which actor walked on stage and slapped Chris Rock?", options: ["Denzel Washington", "Will Smith", "Chris Tucker", "Jamie Foxx"], answer: 1 },
      { category: "Movies", q: "Which two blockbusters defined the 'Barbenheimer' box-office weekend of July 2023?", options: ["Barbie & Oppenheimer", "Barbie & Avatar", "Wonka & Oppenheimer", "Barbie & Dune"], answer: 0 },
      { category: "Sports", q: "Which team won the 2024 Super Bowl (LVIII)?", options: ["San Francisco 49ers", "Kansas City Chiefs", "Philadelphia Eagles", "Cincinnati Bengals"], answer: 1 }
    ],
    // -------------------------------------------------------------- MC medium
    mc2: [
      { category: "History", q: "Who was the first person to walk on the Moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"], answer: 2 },
      { category: "Movies", q: "Which film became the first non-English-language movie to win the Oscar for Best Picture (2020)?", options: ["1917", "Roma", "Parasite", "Joker"], answer: 2 },
      { category: "Movies", q: "Who plays Tony Stark / Iron Man across the Marvel Cinematic Universe?", options: ["Chris Evans", "Robert Downey Jr.", "Mark Ruffalo", "Chris Hemsworth"], answer: 1 },
      { category: "Movies", q: "In which 1972 film does a character make 'an offer he can't refuse'?", options: ["Scarface", "Goodfellas", "The Godfather", "Casino"], answer: 2 },
      { category: "Pop Culture", q: "Which TV show features the fictional town of Hawkins, Indiana?", options: ["Riverdale", "Stranger Things", "Twin Peaks", "The O.C."], answer: 1 },
      { category: "Pop Culture", q: "Which singer launched a record-breaking solo career after leading Destiny's Child?", options: ["Rihanna", "Beyoncé", "Mariah Carey", "Alicia Keys"], answer: 1 },
      { category: "Pop Culture", q: "On which fictional continent is most of HBO's 'Game of Thrones' set?", options: ["Essos", "Westeros", "Tamriel", "Middle-earth"], answer: 1 },
      { category: "Sports", q: "Which country has won the most FIFA World Cup titles (as of 2022)?", options: ["Germany", "Italy", "Argentina", "Brazil"], answer: 3 },
      { category: "Sports", q: "Which Grand Slam tennis tournament is played on clay courts?", options: ["Wimbledon", "US Open", "French Open", "Australian Open"], answer: 2 },
      { category: "Sports", q: "In golf, what is the term for one stroke under par on a hole?", options: ["Eagle", "Bogey", "Birdie", "Albatross"], answer: 2 },
      { category: "Pop Culture", q: "Who painted 'The Starry Night'?", options: ["Claude Monet", "Pablo Picasso", "Vincent van Gogh", "Salvador Dalí"], answer: 2 },
      { category: "History", q: "The Berlin Wall fell in which year?", options: ["1987", "1989", "1991", "1993"], answer: 1 },
      { category: "Geography", q: "The Danube flows through more countries than any other river. Which capital does NOT sit on it?", options: ["Vienna", "Budapest", "Belgrade", "Warsaw"], answer: 3 },
      { category: "Literature", q: "Who wrote the tragedy 'Romeo and Juliet'?", options: ["Christopher Marlowe", "William Shakespeare", "Charles Dickens", "Oscar Wilde"], answer: 1 },
      { category: "Music", q: "Which artist headlined the 2023 Super Bowl LVII halftime show?", options: ["Rihanna", "Beyoncé", "Lady Gaga", "The Weeknd"], answer: 0 },
      { category: "Music", q: "Which artist headlined the 2024 Super Bowl LVIII halftime show?", options: ["Usher", "Justin Timberlake", "Bruno Mars", "Dr. Dre"], answer: 0 },
      { category: "Movies", q: "Which film won the Academy Award for Best Picture at the 2024 Oscars?", options: ["Oppenheimer", "Barbie", "Poor Things", "Killers of the Flower Moon"], answer: 0 },
      { category: "Sports", q: "Which country won the 2023 FIFA Women's World Cup?", options: ["England", "Spain", "Sweden", "Australia"], answer: 1 },
      { category: "Pop Culture", q: "Whose 2023–24 'Eras Tour' became the first concert tour to gross over $1 billion?", options: ["Beyoncé", "Taylor Swift", "Adele", "Coldplay"], answer: 1 }
    ],
    // ---------------------------------------------------------------- MC hard
    mc3: [
      { category: "History", q: "Which treaty ended World War I in 1919?", options: ["Treaty of Versailles", "Treaty of Tordesillas", "Treaty of Ghent", "Treaty of Paris"], answer: 0 },
      { category: "General", q: "What is the most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], answer: 2 },
      { category: "Politics", q: "Who was the longest continuously serving British Prime Minister of the 20th century?", options: ["Winston Churchill", "Margaret Thatcher", "Tony Blair", "Clement Attlee"], answer: 1 },
      { category: "Pop Culture", q: "Which film won the first Academy Award for Best Picture (1929)?", options: ["Wings", "All Quiet on the Western Front", "The Broadway Melody", "Sunrise"], answer: 0 },
      { category: "Sports", q: "Who holds the record for most career Grand Slam singles titles in men's tennis (as of 2024)?", options: ["Roger Federer", "Rafael Nadal", "Novak Djokovic", "Pete Sampras"], answer: 2 },
      { category: "Geography", q: "Which is the only country that borders both the Atlantic and Indian Oceans AND lies entirely in the Southern Hemisphere's African mainland tip?", options: ["Namibia", "Mozambique", "South Africa", "Angola"], answer: 2 },
      { category: "History", q: "The Rosetta Stone was key to deciphering which ancient writing system?", options: ["Cuneiform", "Egyptian hieroglyphs", "Linear B", "Sanskrit"], answer: 1 },
      { category: "General", q: "What is the hardest naturally occurring substance on Earth?", options: ["Quartz", "Titanium", "Diamond", "Tungsten"], answer: 2 },
      { category: "Politics", q: "How many permanent members does the UN Security Council have?", options: ["4", "5", "7", "10"], answer: 1 },
      { category: "Pop Culture", q: "Which author wrote the dystopian novel '1984'?", options: ["Aldous Huxley", "Ray Bradbury", "George Orwell", "H.G. Wells"], answer: 2 },
      { category: "Science", q: "Which subatomic particle did James Chadwick discover in 1932?", options: ["Proton", "Positron", "Neutron", "Neutrino"], answer: 2 },
      { category: "Science", q: "Which chemical element is the most electronegative?", options: ["Oxygen", "Fluorine", "Chlorine", "Nitrogen"], answer: 1 },
      { category: "Literature", q: "Which Russian author wrote 'Crime and Punishment'?", options: ["Leo Tolstoy", "Anton Chekhov", "Fyodor Dostoevsky", "Ivan Turgenev"], answer: 2 },
      { category: "Geography", q: "Which present-day African nation was historically known as Abyssinia?", options: ["Sudan", "Ethiopia", "Eritrea", "Somalia"], answer: 1 },
      { category: "Music", q: "Which composer wrote the 1913 ballet 'The Rite of Spring'?", options: ["Claude Debussy", "Igor Stravinsky", "Sergei Rachmaninoff", "Maurice Ravel"], answer: 1 },
      { category: "History", q: "The 1494 Treaty of Tordesillas divided the New World between which two powers?", options: ["England and France", "Spain and Portugal", "Spain and France", "Portugal and the Netherlands"], answer: 1 },
      { category: "Sports", q: "Who became the first gymnast awarded a perfect 10 at the Olympic Games (1976)?", options: ["Olga Korbut", "Nadia Comăneci", "Mary Lou Retton", "Larisa Latynina"], answer: 1 },
      { category: "Movies", q: "Which director has won the most Academy Awards for Best Director (four wins)?", options: ["Steven Spielberg", "John Ford", "Martin Scorsese", "William Wyler"], answer: 1 },
      { category: "Movies", q: "Who composed the scores for 'Star Wars', 'Jaws', and 'Indiana Jones'?", options: ["Hans Zimmer", "John Williams", "Ennio Morricone", "Danny Elfman"], answer: 1 },
      { category: "Sports", q: "Which boxer defeated George Foreman in the 1974 'Rumble in the Jungle'?", options: ["Joe Frazier", "Muhammad Ali", "Sonny Liston", "Ken Norton"], answer: 1 },
      { category: "Sports", q: "Which country has won the most Summer Olympic gold medals all-time?", options: ["Soviet Union", "United States", "China", "Great Britain"], answer: 1 },
      { category: "Pop Culture", q: "Which band's 1973 album 'The Dark Side of the Moon' spent over 900 weeks on the Billboard charts?", options: ["Led Zeppelin", "Pink Floyd", "The Eagles", "Fleetwood Mac"], answer: 1 },
      { category: "Movies", q: "Which film won Best Picture at the 2023 Oscars (for the 2022 film year)?", options: ["Everything Everywhere All at Once", "The Banshees of Inisherin", "Top Gun: Maverick", "All Quiet on the Western Front"], answer: 0 },
      { category: "Sports", q: "Who was named MVP of Super Bowl LVI (2022)?", options: ["Cooper Kupp", "Aaron Donald", "Matthew Stafford", "Joe Burrow"], answer: 0 },
      { category: "Sports", q: "Who was named MVP of Super Bowl LVII (2023)?", options: ["Jalen Hurts", "Patrick Mahomes", "Travis Kelce", "Nick Bolton"], answer: 1 },
      { category: "Pop Culture", q: "Which actor has hosted 'Saturday Night Live' more times than anyone else?", options: ["Steve Martin", "Alec Baldwin", "Tom Hanks", "John Goodman"], answer: 1 },
      { category: "Movies", q: "Who won the Academy Award for Best Actor in 2023 for 'The Whale'?", options: ["Brendan Fraser", "Austin Butler", "Colin Farrell", "Bill Nighy"], answer: 0 },
      { category: "Music", q: "Which 1985 Kate Bush song returned to the top of the UK chart in 2022 after appearing in 'Stranger Things'?", options: ["Running Up That Hill", "Cloudbusting", "Wuthering Heights", "Babooshka"], answer: 0 }
    ],

    // ----------------------------------------------------------- WRITTEN easy
    written1: [
      { category: "Movies", q: "Which 1997 James Cameron film featured Jack and Rose aboard a doomed ocean liner?", accept: ["titanic", "the titanic"], display: "Titanic" },
      { category: "Movies", q: "What fictional African nation is the home of Marvel's Black Panther?", accept: ["wakanda"], display: "Wakanda" },
      { category: "Pop Culture", q: "Which pop star is nicknamed the 'Material Girl'?", accept: ["madonna"], display: "Madonna" },
      { category: "Pop Culture", q: "What is the name of the coffee shop in the TV show 'Friends'?", accept: ["central perk"], display: "Central Perk" },
      { category: "Sports", q: "Which sport uses the scoring terms 'love', 'deuce', and 'ace'?", accept: ["tennis"], display: "Tennis" },
      { category: "Sports", q: "How many points is a touchdown worth in American football (the touchdown itself)?", accept: ["6", "six"], display: "6 points" },
      { category: "Geography", q: "What is the longest river in the world (by most measures)?", accept: ["nile", "the nile", "nile river"], display: "The Nile" },
      { category: "History", q: "Who was the British monarch (King) during most of World War II?", accept: ["george vi", "king george vi", "george the sixth"], display: "King George VI" },
      { category: "Science", q: "What force pulls objects toward the center of the Earth?", accept: ["gravity"], display: "Gravity" },
      { category: "Pop Culture", q: "At the 2022 Oscars, Will Smith slapped which comedian on stage?", accept: ["chris rock", "rock"], display: "Chris Rock" },
      { category: "Movies", q: "What single-word nickname described the July 2023 same-day release of 'Barbie' and 'Oppenheimer'?", accept: ["barbenheimer"], display: "Barbenheimer" }
    ],
    // --------------------------------------------------------- WRITTEN medium
    written2: [
      { category: "History", q: "Which ship famously sank on its maiden voyage in 1912?", accept: ["titanic", "the titanic", "rms titanic"], display: "The Titanic" },
      { category: "Geography", q: "What is the smallest country in the world by area?", accept: ["vatican", "vatican city", "the vatican"], display: "Vatican City" },
      { category: "Pop Culture", q: "Who directed the 1975 thriller 'Jaws'?", accept: ["spielberg", "steven spielberg"], display: "Steven Spielberg" },
      { category: "Sports", q: "Which boxer was known as 'The Greatest' and floated like a butterfly?", accept: ["ali", "muhammad ali", "cassius clay"], display: "Muhammad Ali" },
      { category: "Politics", q: "Who was the first female Prime Minister of the United Kingdom?", accept: ["thatcher", "margaret thatcher"], display: "Margaret Thatcher" },
      { category: "General", q: "What is the powerhouse of the cell, often cited in biology class?", accept: ["mitochondria", "mitochondrion", "the mitochondria"], display: "The mitochondria" },
      { category: "History", q: "In which Italian city would you find the ancient Colosseum?", accept: ["rome"], display: "Rome" },
      { category: "Pop Culture", q: "What was the name of the spaceship in the original 1979 film 'Alien'?", accept: ["nostromo", "the nostromo"], display: "Nostromo" },
      { category: "Music", q: "Which British band recorded the 1969 album 'Abbey Road'?", accept: ["the beatles", "beatles"], display: "The Beatles" },
      { category: "Literature", q: "Which wizarding school does Harry Potter attend?", accept: ["hogwarts"], display: "Hogwarts" },
      { category: "Movies", q: "Which actor played Captain Jack Sparrow in 'Pirates of the Caribbean'?", accept: ["johnny depp", "depp"], display: "Johnny Depp" },
      { category: "Movies", q: "Which 1999 sci-fi film starring Keanu Reeves features a red pill and a blue pill?", accept: ["the matrix", "matrix"], display: "The Matrix" },
      { category: "Sports", q: "Which footballer has won a record eight Ballon d'Or awards (as of 2023)?", accept: ["messi", "lionel messi"], display: "Lionel Messi" },
      { category: "Pop Culture", q: "Which long-running animated sitcom is set in Springfield with Homer and Bart?", accept: ["the simpsons", "simpsons"], display: "The Simpsons" },
      { category: "Music", q: "Which superstar's record-breaking 'Eras Tour' concert film hit theaters in 2023?", accept: ["taylor swift", "taylor", "swift"], display: "Taylor Swift" },
      { category: "Movies", q: "Which actress won the 2023 Best Actress Oscar for 'Everything Everywhere All at Once'?", accept: ["michelle yeoh", "yeoh"], display: "Michelle Yeoh" }
    ],
    // ----------------------------------------------------------- WRITTEN hard
    written3: [
      { category: "History", q: "Who was the Egyptian queen who allied with Mark Antony and Julius Caesar?", accept: ["cleopatra", "cleopatra vii"], display: "Cleopatra" },
      { category: "General", q: "What is the only metal that is liquid at room temperature?", accept: ["mercury"], display: "Mercury" },
      { category: "Geography", q: "What is the capital of Canada?", accept: ["ottawa"], display: "Ottawa" },
      { category: "Politics", q: "Which U.S. President signed the Emancipation Proclamation?", accept: ["lincoln", "abraham lincoln"], display: "Abraham Lincoln" },
      { category: "Pop Culture", q: "Which composer, deaf in later life, wrote the Ninth Symphony with 'Ode to Joy'?", accept: ["beethoven", "ludwig van beethoven"], display: "Ludwig van Beethoven" },
      { category: "Sports", q: "Which country hosted the first modern Olympic Games in 1896?", accept: ["greece"], display: "Greece" },
      { category: "History", q: "What was the name of the 1969 NASA mission that first landed humans on the Moon?", accept: ["apollo 11", "apollo eleven"], display: "Apollo 11" },
      { category: "General", q: "What 'p' is the study of the origin and evolution of the universe? (a 'c' word also accepted)", accept: ["cosmology"], display: "Cosmology" },
      { category: "Science", q: "What is the SI unit of electrical resistance?", accept: ["ohm", "ohms", "the ohm"], display: "Ohm" },
      { category: "Science", q: "Which chemist devised the periodic table and predicted then-undiscovered elements?", accept: ["mendeleev", "dmitri mendeleev"], display: "Dmitri Mendeleev" },
      { category: "Literature", q: "Who wrote the 14th-century epic poem 'The Divine Comedy'?", accept: ["dante", "dante alighieri"], display: "Dante Alighieri" },
      { category: "Geography", q: "What is the capital of Kazakhstan (its name was restored in 2022)?", accept: ["astana"], display: "Astana" },
      { category: "History", q: "Which Carthaginian general crossed the Alps with war elephants to attack Rome?", accept: ["hannibal", "hannibal barca"], display: "Hannibal" },
      { category: "Movies", q: "Which 1941 Orson Welles film, centered on the word 'Rosebud', is often called the greatest ever made?", accept: ["citizen kane"], display: "Citizen Kane" },
      { category: "Pop Culture", q: "Which artist painted the Campbell's Soup Cans and pioneered Pop Art?", accept: ["warhol", "andy warhol"], display: "Andy Warhol" },
      { category: "Movies", q: "Which Irish actor won the 2024 Best Actor Oscar for the title role in 'Oppenheimer'?", accept: ["cillian murphy", "murphy"], display: "Cillian Murphy" },
      { category: "Music", q: "Which Lil Nas X song spent a record 19 weeks at #1 on the Billboard Hot 100 in 2019?", accept: ["old town road"], display: "Old Town Road" }
    ],

    // ----------------------------------------- VISUAL easy (flags + easy maps)
    visual1: [
      { category: "Flags", type: "flag", q: "Select the flag of Japan.", code: "jp", options: ["jp", "kr", "cn", "th"] },
      { category: "Flags", type: "flag", q: "Select the flag of Canada.", code: "ca", options: ["ca", "us", "gb", "au"] },
      { category: "Flags", type: "flag", q: "Select the flag of Brazil.", code: "br", options: ["br", "ar", "pt", "co"] },
      { category: "Flags", type: "flag", q: "Select the flag of Italy.", code: "it", options: ["it", "ie", "mx", "hu"] },
      { category: "Maps", type: "map", q: "Click on the approximate location of London, United Kingdom.", lat: 51.5074, lng: -0.1278, country: "United Kingdom", place: "London" },
      { category: "Maps", type: "map", q: "Click on the approximate location of New York City, USA.", lat: 40.7128, lng: -74.006, country: "United States", place: "New York City" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Paris, France.", lat: 48.8566, lng: 2.3522, country: "France", place: "Paris" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Cairo, Egypt.", lat: 30.0444, lng: 31.2357, country: "Egypt", place: "Cairo" }
    ],
    // --------------------------------------- VISUAL medium (flags + med maps)
    visual2: [
      { category: "Flags", type: "flag", q: "Select the flag of South Korea.", code: "kr", options: ["kr", "jp", "tw", "mn"] },
      { category: "Flags", type: "flag", q: "Select the flag of Greece.", code: "gr", options: ["gr", "fi", "is", "uy"] },
      { category: "Flags", type: "flag", q: "Select the flag of Mexico.", code: "mx", options: ["mx", "it", "ie", "hu"] },
      { category: "Maps", type: "map", q: "Click on the approximate location of Cape Town, South Africa.", lat: -33.9249, lng: 18.4241, country: "South Africa", place: "Cape Town" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Rio de Janeiro, Brazil.", lat: -22.9068, lng: -43.1729, country: "Brazil", place: "Rio de Janeiro" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Istanbul, Turkey.", lat: 41.0082, lng: 28.9784, country: "Turkey", place: "Istanbul" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Sydney, Australia.", lat: -33.8688, lng: 151.2093, country: "Australia", place: "Sydney" },
      { category: "Flags", type: "flag", q: "Select the flag of Argentina.", code: "ar", options: ["ar", "uy", "br", "co"] }
    ],
    // ----------------------------------------- VISUAL hard (flags + hard maps)
    visual3: [
      { category: "Flags", type: "flag", q: "Select the flag of Portugal.", code: "pt", options: ["pt", "es", "it", "br"] },
      { category: "Flags", type: "flag", q: "Select the flag of New Zealand.", code: "nz", options: ["nz", "au", "gb", "fj"] },
      { category: "Maps", type: "map", q: "Click on the approximate location of Reykjavik, Iceland.", lat: 64.1466, lng: -21.9426, country: "Iceland", place: "Reykjavik" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Ulaanbaatar, Mongolia.", lat: 47.8864, lng: 106.9057, country: "Mongolia", place: "Ulaanbaatar" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Kathmandu, Nepal.", lat: 27.7172, lng: 85.324, country: "Nepal", place: "Kathmandu" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Marrakech, Morocco.", lat: 31.6295, lng: -7.9811, country: "Morocco", place: "Marrakech" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Wellington, New Zealand.", lat: -41.2865, lng: 174.7762, country: "New Zealand", place: "Wellington" },
      { category: "Flags", type: "flag", q: "Select the flag of Slovakia.", code: "sk", options: ["sk", "si", "hr", "ru"] },
      { category: "Flags", type: "flag", q: "Select the flag of Chad.", code: "td", options: ["td", "ro", "md", "be"] },
      { category: "Maps", type: "map", q: "Click on the approximate location of Astana, Kazakhstan.", lat: 51.1605, lng: 71.4704, country: "Kazakhstan", place: "Astana" },
      { category: "Maps", type: "map", q: "Click on the approximate location of La Paz, Bolivia.", lat: -16.4897, lng: -68.1193, country: "Bolivia", place: "La Paz" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Tbilisi, Georgia.", lat: 41.7151, lng: 44.8271, country: "Georgia", place: "Tbilisi" },
      { category: "Maps", type: "map", q: "Click on the approximate location of Windhoek, Namibia.", lat: -22.5609, lng: 17.0658, country: "Namibia", place: "Windhoek" }
    ],

    // ------------------------------------------------------- NUMBER (slot 10)
    number: [
      { category: "Geography", q: "What is the height of Mount Everest, in feet above sea level?", answer: 29032, unit: "ft" },
      { category: "History", q: "In what year was the Declaration of Independence signed?", answer: 1776, unit: "", tolAbs: 25 },
      { category: "General", q: "What is the speed of light in a vacuum, in miles per second?", answer: 186282, unit: "mi/s" },
      { category: "Geography", q: "Approximately how many miles long is the Great Wall of China (all branches)?", answer: 13171, unit: "mi" },
      { category: "Sports", q: "How many dimples are on a standard regulation golf ball (a common figure)?", answer: 336, unit: "" },
      { category: "General", q: "What is the average distance from the Earth to the Moon, in miles?", answer: 238855, unit: "mi" },
      { category: "History", q: "How many years did the Hundred Years' War actually last?", answer: 116, unit: "years" },
      { category: "Pop Culture", q: "What was the total worldwide box office of the film 'Titanic' (1997 original run + re-releases), in millions of USD (approx)?", answer: 2257, unit: "million USD" },
      { category: "Geography", q: "What is the population of Japan, in millions (approx, 2023)?", answer: 124, unit: "million" },
      { category: "General", q: "How many keys are on a standard piano?", answer: 88, unit: "" },
      { category: "Science", q: "How many elements are in the modern periodic table (as of 2024)?", answer: 118, unit: "" },
      { category: "Science", q: "At what temperature does water freeze, in degrees Fahrenheit?", answer: 32, unit: "°F" },
      { category: "Geography", q: "What is the approximate surface area of the Pacific Ocean, in millions of square miles?", answer: 64, unit: "million mi²" },
      { category: "Geography", q: "Roughly how deep is the Mariana Trench at its lowest point, in feet?", answer: 35876, unit: "ft" },
      { category: "Movies", q: "What was the worldwide box office of 'Avatar' (2009, including re-releases), in millions of USD?", answer: 2923, unit: "million USD" },
      { category: "Movies", q: "In what year was the first 'Star Wars' film released?", answer: 1977, unit: "", tolAbs: 25 },
      { category: "Sports", q: "How many minutes long is a regulation NBA basketball game (four quarters)?", answer: 48, unit: "min" },
      { category: "Sports", q: "How many players from one team are on the field during an American football play?", answer: 11, unit: "" },
      { category: "Pop Culture", q: "In what year did Will Smith slap Chris Rock at the Academy Awards?", answer: 2022, unit: "", tolAbs: 15 },
      { category: "Sports", q: "In what year was the first Super Bowl played?", answer: 1967, unit: "", tolAbs: 25 },
      { category: "Sports", q: "How many Super Bowl titles did quarterback Tom Brady win in his career?", answer: 7, unit: "" },
      { category: "Music", q: "How many weeks did Lil Nas X's 'Old Town Road' spend at #1 on the Billboard Hot 100?", answer: 19, unit: "weeks" }
    ]
  };
})(window.TRIVIA = window.TRIVIA || {});
