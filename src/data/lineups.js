import { teams } from "./teams.js";

// Projected roster lines. These are not confirmed game-day lines.
// Change the order here whenever you want to update a line combination.
// Names are matched to qmjhl_player_stats.csv to attach player statistics.

function p(name, number) {
  return { name, number };
}

const lineupDetails = {
  halifax: {
    status: "Projected",
    goalie: "Owen Bresson",

    forwards: [
      [
        p("Oleg Kulebiakin", 10),
        p("Liam Kilfoil", 9),
        p("Evan Nee", 16),
      ],
      [
        p("Shawn Carrier", 55),
        p("Mateo Nobert", 16),
        p("Brent William", 12),
      ],
      [
        p("Caylen Blake", 19),
        p("Daniel Walters", 20),
        p("Cnnor MacPherson", 14),
      ],
      [
        p("Jasu Mensonen", 70),
        p("Quinn Kennady", 88),
        p("Santi Amelio", 37),
      ],
    ],

    defense: [
      [
        p("Carlos Handel", 7),
        p("Minella Minella", 23),
      ],
      [
        p("Owen Phillips", 26),
        p("Brenden Espenell", 44),
      ],
      [
        p("Eddy Doyle", 51),
        p("Malik L'Italien", 77),
      ],
    ],
  },

  moncton: {
    status: "Projected",
    goalie: "Jacob Weiner",

    forwards: [
      [
        p("Anthony Preskar", 23),
        p("Gabe Smith", 9),
        p("Rian Chudzinski", 22),
      ],
      [
        p("Sam Binkley", 12),
        p("Teddy Mutryn", 14),
        p("Niko Tournas", 86),
      ],
      [
        p("Kuzma Voronin", 27),
        p("Victor Morrissette-Richer", 17),
        p("Gavin Cornforth", 92),
      ],
      [
        p("Place Holder", 99),
        p("Caleb Desnoyers", 18),
        p("Place Holder", 99),
      ],
    ],

    defense: [
      [
        p("Tommy Bleyl", 11),
        p("Max Vilen", 2),
      ],
      [
        p("Jackson Batchilder", 99),
        p("Matthew Virgilio", 15),
      ],
      [
        p("Adam Fortier-Gendron", 24),
        p("Evan Depatie", 44),
      ],
    ],
  },

  "cape-breton": {
    status: "Projected",
    goalie: "Lucas Beckman",

    forwards: [
      [
        p("Maxim Schafer", 99),
        p("Cole Chandler", 99),
        p("Eliot Litalien", 19),
      ],
      [
        p("Jack Broderick", 65),
        p("Elias Schneider", 81),
        p("Jacob Hartlin", 22),
      ],
      [
        p("Reece Peitzche", 21),
        p("Liam Lefebvre", 39),
        p("Adam Klaus", 28),
      ],
      [
        p("Derek Andrews", 11),
        p("Raoul Boilard", 11),
        p("Samuel Rocca", 81),
      ],
    ],

    defense: [
      [
        p("Xavier Daigle", 44),
        p("Alonso Gosselin", 13),
      ],
      [
        p("Will Murphy", 6),
        p("Logan Quinn", 8),
      ],
      [
        p("Noah Jettelson", 4),
        p("Jacob De Ladurantaye", 77),
      ],
    ],
  },

  newfoundland: {
    status: "Projected",
    goalie: "Louis-Antoine Denault",

    forwards: [
      [
        p("Dawson Sharkey", 81),
        p("Tyson Gogan", 29),
        p("Liam Arsenault", 13),
      ],
      [
        p("Benjamin Veitch", 88),
        p("Louis-François Bélanger", 18),
        p("Marek Danicek", 41),
      ],
      [
        p("Liam Arsenault", 13),
        p("Maddox Marmulak", 98),
        p("Alexis Michaud", 95),
      ],
      [
        p("Luke Sinclair", 16),
        p("Ryan Dwyer", 40),
        p("Maddex Marmulak", 98),
      ],
    ],

    defense: [
      [
        p("Jayden Lazare", 6),
        p("Noah Laberge", 8),
      ],
      [
        p("Alexis Mathieu", 77),
        p("Quinn Norman", 91),
      ],
      [
        p("Benjamin Girard", 55),
        p("Will Reynolds", 71),
      ],
    ],
  },

  gatineau: {
    status: "Projected",
    goalie: "Finn Moffett",

    forwards: [
      [
        p("Artom Glukhikh", 99),
        p("Dylan Allie", 7),
        p("Finn Barton", 17),
      ],
      [
        p("Ilya Pautov", 88),
        p("Simon-Xavier Cyr", 91),
        p("Louis-Étienne Halley", 99),
      ],
      [
        p("Charles Pigeon", 99),
        p("Maxime Dube", 86),
        p("Place Holder", 99),
      ],
      [
        p("Noah Florent", 22),
        p("Peter Legostaev", 99),
        p("Alex Dagenais", 71),
      ],
    ],

    defense: [
      [
        p("Michel Myloserdnyy", 5),
        p("Justin Blais", 12),
      ],
      [
        p("Justin Blais", 12),
        p("Clement Landry", 44),
      ],
      [
        p("Alexandre Carbonneau", 6),
        p("Wassim Rabbath", 99),
      ],
    ],
  },

  "saint-john": {
    status: "Projected",
    goalie: "Rafaël Courchesne",

    forwards: [
      [
        p("Olivier Lemieux", 28),
        p("Alexis Joseph", 19),
        p("Alexander Donovan", 9),
      ],
      [
        p("Dylan Rozzi", 8),
        p("Olivier Groulx", 86),
        p("Jabez Seymour", 23),
      ],
      [
        p("Zachary Morin", 10),
        p("Olivers Murnieks", 14),
        p("Place Holder", 99),
      ],
      [
        p("Matthew Krayer", 21),
        p("William Yared", 22),
        p("Place Holder", 99),
      ],
    ],

    defense: [
      [
        p("Olivier Duhamel", 71),
        p("Everett Baldwin", 2),
      ],
      [
        p("Oskar Drabczynski", 13),
        p("Bo Damphousse", 26),
      ],
      [
        p("Carl-Otto Magnusson", 44),
        p("Cameron Chartrand", 5),
      ],
    ],
  },

  "baie-comeau": {
    status: "Projected",
    goalie: "Mathias Hernandez",

    forwards: [
      [
        p("Aiden Kirkwood", 11),
        p("Jacopo De Luca", 25),
        p("Liam Armit", 19),
      ],
      [
        p("Joseph Cadorin", 20),
        p("Gleb Semenov", 41),
        p("Place Holder", 99),
      ],
      [
        p("Declan Wotton", 23),
        p("Robin Benoit", 43),
        p("Place Holder", 99),
      ],
      [
        p("Vik Filip", 57),
        p("Kieran Litterick", 49),
        p("Samuel Brunet", 99),
      ],
    ],

    defense: [
      [
        p("Place Holder", 99),
        p("Mattias Gilbert", 13),
      ],
      [
        p("Aaron Murphy", 21),
        p("Biago Daniele Jr", 27),
      ],
      [
        p("James Roberts", 2),
        p("Zachary Hachey", 6),
      ],
    ],
  },

  chicoutimi: {
    status: "Projected",
    goalie: "Raphael Precourt",

    forwards: [
      [
        p("Emmanuel Vermette", 28),
        p("Nathan Lecompte", 42),
        p("Maxim Masse", 7),
      ],
      [
        p("Emile Guite", 86),
        p("Alexis Toussaint", 71),
        p("Christophe Berthelot", 8),
      ],
      [
        p("Anton Linde", 88),
        p("Mavrick Lachance", 93),
        p("Emile Ricard", 11),
      ],
      [
        p("Jacob Gomez", 61),
        p("Francis Koby", 53),
        p("Gryphon Watson-Bucci", 19),
      ],
    ],

    defense: [
      [
        p("Thomas Lavoie", 3),
        p("Alex Huang", 12),
      ],
      [
        p("Alexis Bernier", 44),
        p("Gabriel Anctil", 89),
      ],
      [
        p("Alexandre Desmarais", 92),
        p("Place Holder", 99),
      ],
    ],
  },

  quebec: {
    status: "Projected",
    goalie: "Patrick Deniger",

    forwards: [
      [
        p("Charles-Antoine Dube", 24),
        p("Maddox Degenais", 26),
        p("Egan Beveridge", 6),
      ],
      [
        p("Lou Levesque", 99),
        p("Alex Desruisseaux", 91),
        p("Jayden Rousseau", 17),
      ],
      [
        p("Nikita Ovcharov", 25),
        p("Nathan Quinn", 29),
        p("James Scantlebury", 99),
      ],
      [
        p("Mavrick Rousseau-Hamel", 63),
        p("Carter Meyer", 43),
        p("Place Holder", 99),
      ],
    ],

    defense: [
      [
        p("Alexandre Taillefer", 77),
        p("Bastien Michaud", 86),
      ],
      [
        p("Freddy Meyer", 14),
        p("Joey Lackman", 99),
      ],
      [
        p("Etinne Desjardins", 55),
        p("Logan Brennan", 5),
      ],
    ],
  },

  rimouski: {
    status: "Projected",
    goalie: "Noah Preston, Moore",

    forwards: [
      [
        p("Rafael Cloutier", 10),
        p("Caiden Pellegrino", 99),
        p("Maxmilian Mares", 99),
      ],
      [
        p("Alex Masse", 18),
        p("Mathys Dube", 24),
        p("Thomas Belzil", 17),
      ],
      [
        p("Aaron Chipp", 22),
        p("Dovydas Jukna", 77),
        p("Samuel Thibault", 34),
      ],
      [
        p("Logan Roop", 25),
        p("Lev Gaponov", 78),
        p("Zack Arsenault", 57),
      ],
    ],

    defense: [
      [
        p("Louis-Felix Gagnon", 99),
        p("Conner Strungeon", 3),
      ],
      [
        p("Luca Nappiot", 71),
        p("Benjamin Rioux", 6),
      ],
      [
        p("Charles Genereux", 26),
        p("Justin Beaulieu", 27),
      ],
    ],
  },

  "blainville-boisbriand": {
    status: "Projected",
    goalie: "Jakub Milota",

    forwards: [
      [
        p("Torkel Jennersjo", 2),
        p("Bill Zannon", 9),
        p("Justi  Carbonneau", 8),
      ],
      [
        p("Place Holder", 99),
        p("Matt Gosslin", 11),
        p("Place Holder", 99),
      ],
      [
        p("Ludovik Grenier", 84),
        p("Vincent Desjardins", 42),
        p("Stefano Pietrantonio", 51),
      ],
      [
        p("Elliot Dube", 44),
        p("Olivier Metcalfe", 37),
        p("Jacob Beaulieu", 24),
      ],
    ],

    defense: [
      [
        p("Olivier Filaj", 6),
        p("Spencer Gill", 15),
      ],
      [
        p("Jan Golicic", 21),
        p("Mathieu Taillefer", 22),
      ],
      [
        p("Zackary Plamondon", 55),
        p("Xavier Villeneuve", 72),
      ],
    ],
  },

  drummondville: {
    status: "Projected",
    goalie: "Mathys Fortin",

    forwards: [
      [
        p("Antoine Boudreau", 86),
        p("Maxime-Olivier Drolet", 9),
        p("Dylan Dumont", 94),
      ],
      [
        p("William Dumont", 24),
        p("Louis-Felix Bourque", 91),
        p("David Bosson", 17),
      ],
      [
        p("Hugo Dufour", 28),
        p("Renaud Poulin", 99),
        p("Trent Gates", 77),
      ],
      [
        p("Thomas Duhamel", 29),
        p("Yoan Tasse", 16),
        p("Carter Fogarty", 51),
      ],
    ],

    defense: [
      [
        p("Owen Keefe", 44),
        p("Xavier Cormier", 43),
      ],
      [
        p("Filip Kovalcik", 13),
        p("Owen Ronson", 15),
      ],
      [
        p("Cooper Campbell", 2),
        p("Place Holder", 99),
      ],
    ],
  },

  charlottetown: {
    status: "Projected",
    goalie: "Donald Hickey",

    forwards: [
      [
        p("Jude Herron", 92),
        p("Matthew Butler", 13),
        p("Ross Campbell", 15),
      ],
      [
        p("Alexis Beaulieu", 11),
        p("Anthony Flanagan", 14),
        p("Nolan Duskocy", 88),
      ],
      [
        p("CJ Watroba", 12),
        p("Ivan Ryabkin", 18),
        p("William Shields", 72),
      ],
      [
        p("Rowan Walsh", 34),
        p("Antoine Provencher", 17),
        p("Ryan Staples", 19),
      ],
    ],

    defense: [
      [
        p("Marcus Kearsey", 7),
        p("Emile-Alexandro Lemieux-Goupil", 76),
      ],
      [
        p("Brady Peddle", 2),
        p("Owen Conrad", 10),
      ],
      [
        p("Aiden MacIsaac", 3),
        p("Nikita Voyaga", 16),
      ],
    ],
  },

  "rouyn-noranda": {
    status: "Projected",
    goalie: "Alexandre Raymond",

    forwards: [
      [
        p("Eliot Ogonowski", 12),
        p("Samuel Beauchemin", 11),
        p("Lars Steiner", 15),
      ],
      [
        p("Nathan Langlois", 17),
        p("William Vezina", 19),
        p("Jayden Poinville", 29),
      ],
      [
        p("Niko El Khouri", 10),
        p("Charles Laforest", 20),
        p("Murzov Vladislav", 37),
      ],
      [
        p("Samuel Rheault", 21),
        p("Jeremy Jerret", 26),
        p("Charlie Benigno", 14),
      ],
    ],

    defense: [
      [
        p("Antoine St-Lourent", 5),
        p("Alexis Lemire", 72),
      ],
      [
        p("Brayden Kaldenbach", 2),
        p("Guus Van der Kaaij", 16),
      ],
      [
        p("Jacob Hamel", 7),
        p("Tristan Langlois", 38),
      ],
    ],
  },

  shawinigan: {
    status: "Projected",
    goalie: "Ethan Mercer",

    forwards: [
      [
        p("Chad Lygitsakos", 72),
        p("Place Holder", 99),
        p("Jiri Klima", 97),
      ],
      [
        p("Place Holder", 99),
        p("Gleb Semenov", 71),
        p("Felix Lacerte", 55),
      ],
      [
        p("Jacob Lachance", 10),
        p("Olivier Charron", 44),
        p("Bergeron Frederic", 37),
      ],
      [
        p("Samuel Boyer", 13),
        p("Kody Dupuis", 96),
        p("Dylan Laframboise", 93),
      ],
    ],

    defense: [
      [
        p("Julien Lanthier", 3),
        p("Mathieu Plante", 5),
      ],
      [
        p("Felix Plamondon", 6),
        p("Alexis Fortin", 99),
      ],
      [
        p("Jonathan Prud'homme", 24),
        p("Pyotr Novozhilov", 99),
      ],
    ],
  },

  sherbrooke: {
    status: "Projected",
    goalie: "Justin Brisebois",

    forwards: [
      [
        p("Ilya Kolmakov", 19),
        p("Thomas Rousseau", 91),
        p("Florent Houle", 16),
      ],
      [
        p("Jayden Plouffe", 37),
        p("Cameron Haye", 71),
        p("Chad Bellmare", 18),
      ],
      [
        p("Samuel Rochon", 51),
        p("Eloi Benard", 26),
        p("Brogan McNeil", 27),
      ],
      [
        p("Martins Klaucans", 55),
        p("Etinne Giroux", 47),
        p("Loic Poirier", 88),
      ],
    ],

    defense: [
      [
        p("Brandon Delarosbil", 7),
        p("Louis-Alex Tremblay", 77),
      ],
      [
        p("PJ Fagan", 73),
        p("Sydney Gagnon", 14),
      ],
      [
        p("Zakary Gagnon", 23),
        p("Sydney Gagnon", 14),
      ],
    ],
  },

  "val-dor": {
    status: "Projected",
    goalie: "Emile Beaunoyer",

    forwards: [
      [
        p("Philippe Veilleux", 44),
        p("Nathan Brisson", 72),
        p("Alix Durocher", 47),
      ],
      [
        p("Jeremy Leroux", 11),
        p("Benjamin Olivier", 10),
        p("Place Holder", 99),
      ],
      [
        p("Jordan Labelle", 23),
        p("Mathias Bourque", 12),
        p("Sheldon Rioux", 92),
      ],
      [
        p("Josh Demers", 51),
        p("Evan Sercerchi", 17),
        p("Etinne Maheu", 16),
      ],
    ],

    defense: [
      [
        p("Anthony Pare", 5),
        p("Benjamin Cossette Ayotte", 7),
      ],
      [
        p("Hemrick Carbonneau", 15),
        p("Alexis Fortin", 77),
      ],
      [
        p("Esteban Cinq-Mars", 3),
        p("Eduard Bondar", 91),
      ],
    ],
  },

  victoriaville: {
    status: "Projected",
    goalie: "Gabriel D'Aigle",

    forwards: [
      [
        p("Alexey Vlasov", 17),
        p("Egor Shilov", 9),
        p("Enzo Lottin", 34),
      ],
      [
        p("Place Holder", 99),
        p("Loik Gariepy", 39),
        p("Korney Korneyev", 90),
      ],
      [
        p("Xavier Sabourin", 95),
        p("Jordan Forget", 61),
        p("Zakary Savoie", 83),
      ],
      [
        p("Derek Lemaire", 22),
        p("Place Holder", 99),
        p("Arno Delisle", 37),
      ],
    ],

    defense: [
      [
        p("Maddox Labre", 25),
        p("Maxime Dodier", 93),
      ],
      [
        p("Matheo Lepage", 44),
        p("Dominik Necak", 78),
      ],
      [
        p("Alain Bourdeau", 5),
        p("Nathan Nadeau", 8),
      ],
    ],
  },
};

export const lineupTeams = teams.map((team) => ({
  ...team,

  ...(lineupDetails[team.slug] || {
    status: "Unavailable",
    goalie: "TBD",
    forwards: [],
    defense: [],
  }),

  team: team.fullName,
}));