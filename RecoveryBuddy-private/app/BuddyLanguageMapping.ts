/** Bewerkbare conceptmapping; bedoeld voor navigatie en verduidelijking, niet voor diagnostiek. */
export type MappingAction = "learn" | "practice" | "contact" | "plan" | "signal" | "urgent" | "actions";
export type MappingOption = { id: string; label: string; topic: string; suggestion: string; actions: MappingAction[] };
export type LanguageMapping = { id: string; title: string; examples: string[]; question: string; options: MappingOption[] };
export const buddyLanguageMapping: LanguageMapping[] = [
  {
    "id": "fatigue",
    "title": "Moe en weinig energie",
    "examples": [
      "ik ben moe",
      "ik ben bekaf",
      "ik ben uitgeput",
      "geen energie",
      "mijn batterij is leeg",
      "ik ben kapot",
      "ik ben gesloopt",
      "ik ben gaar",
      "ik ben op"
    ],
    "question": "Wat bedoel je vooral met moe?",
    "options": [
      {
        "id": "1",
        "label": "Slaperig of slecht geslapen",
        "topic": "slapen nachtrust",
        "suggestion": "Je kunt je slaap en dagritme bekijken en één vraag voor je behandelaar opschrijven.",
        "actions": [
          "learn",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Lichamelijk uitgeput",
        "topic": "vermoeidheid energie",
        "suggestion": "Je kunt één kleine, haalbare stap kiezen. Bespreek aanhoudende of nieuwe onverklaarde vermoeidheid ook met je huisarts of behandelaar.",
        "actions": [
          "plan",
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Een vol of overbelast hoofd",
        "topic": "overprikkeling spanning",
        "suggestion": "Je kunt een kort rustmoment kiezen en onderzoeken welke prikkels nu te veel zijn.",
        "actions": [
          "practice",
          "learn"
        ]
      }
    ]
  },
  {
    "id": "sleep",
    "title": "Slaap en ritme",
    "examples": [
      "ik kan niet slapen",
      "ik lig wakker",
      "ik word steeds wakker",
      "dag en nacht omgedraaid",
      "ik slaap slecht",
      "ik lig te draaien",
      "ik slaap amper",
      "ik slaap de hele dag"
    ],
    "question": "Wat maakt slapen vooral lastig?",
    "options": [
      {
        "id": "1",
        "label": "Piekeren in bed",
        "topic": "piekeren slapen",
        "suggestion": "Je kunt opschrijven wat je bezighoudt en informatie over piekeren en slaap bekijken.",
        "actions": [
          "learn",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Een onregelmatig ritme",
        "topic": "slaap dagritme",
        "suggestion": "Kies één haalbaar moment om meer regelmaat in je dag te brengen.",
        "actions": [
          "learn",
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Weinig slaap maar veel energie",
        "topic": "weinig slaap veel energie",
        "suggestion": "Bespreek deze combinatie vandaag met je behandelaar of huisarts, vooral als dit anders is dan normaal. Bekijk ook je signaleringsplan.",
        "actions": [
          "contact",
          "signal"
        ]
      }
    ]
  },
  {
    "id": "rumination",
    "title": "Piekeren",
    "examples": [
      "mijn hoofd blijft malen",
      "ik blijf piekeren",
      "ik denk te veel na",
      "ik blijf alles overdenken",
      "gedachten blijven hangen",
      "mijn hoofd houdt niet op",
      "ik zit vast in mijn hoofd"
    ],
    "question": "Waar gaan de gedachten vooral over?",
    "options": [
      {
        "id": "1",
        "label": "Zorgen over wat komt",
        "topic": "piekeren zorgen",
        "suggestion": "Je kunt één zorg opschrijven en bekijken of er een kleine stap is waar je invloed op hebt.",
        "actions": [
          "learn",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Wat ik verkeerd heb gedaan",
        "topic": "zelfkritiek schuld gedachten",
        "suggestion": "Je kunt een oefening kiezen om gedachten op te merken zonder meteen mee te gaan in je oordeel.",
        "actions": [
          "practice",
          "learn"
        ]
      },
      {
        "id": "3",
        "label": "Een nare herinnering",
        "topic": "herinneringen spanning",
        "suggestion": "Je hoeft de gebeurtenis hier niet te beschrijven. Je kunt steun zoeken of een vertrouwde oefening kiezen die je helpt in het hier en nu.",
        "actions": [
          "contact",
          "practice"
        ]
      }
    ]
  },
  {
    "id": "overload",
    "title": "Overprikkeling",
    "examples": [
      "mijn hoofd zit vol",
      "alles komt binnen",
      "ik ben overprikkeld",
      "het is allemaal te veel",
      "te veel prikkels",
      "mijn koppie zit vol",
      "ik trek die drukte niet"
    ],
    "question": "Wat geeft nu vooral te veel prikkels?",
    "options": [
      {
        "id": "1",
        "label": "Geluid, licht of drukte",
        "topic": "overprikkeling prikkels",
        "suggestion": "Je kunt één prikkel verminderen, als dat op jouw plek mogelijk is.",
        "actions": [
          "plan",
          "learn"
        ]
      },
      {
        "id": "2",
        "label": "Taken en verwachtingen",
        "topic": "overbelasting plannen",
        "suggestion": "Kies één taak die kan wachten en één kleine stap die nu haalbaar is.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Mijn eigen gedachten",
        "topic": "piekeren gedachten",
        "suggestion": "Je kunt uitleg over piekeren bekijken of een vertrouwde oefening kiezen.",
        "actions": [
          "learn",
          "practice"
        ]
      }
    ]
  },
  {
    "id": "anxiety",
    "title": "Angst",
    "examples": [
      "ik ben bang",
      "ik ben angstig",
      "ik maak me zorgen",
      "ik voel me opgejaagd",
      "ik durf niet"
    ],
    "question": "Wat past het beste bij je angst?",
    "options": [
      {
        "id": "1",
        "label": "Een bepaalde situatie",
        "topic": "angst vermijding",
        "suggestion": "Je kunt met je behandelaar afspreken welke kleine stap past; kies niet zomaar een moeilijke oefening.",
        "actions": [
          "contact",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Zorgen zonder duidelijke aanleiding",
        "topic": "angst spanning",
        "suggestion": "Je kunt opmerken wanneer de spanning toeneemt en uitleg of een rustige oefening kiezen.",
        "actions": [
          "learn",
          "practice"
        ]
      },
      {
        "id": "3",
        "label": "Ik voel me nu niet veilig",
        "topic": "veiligheid steun",
        "suggestion": "Zoek nu contact met iemand die je kan helpen. Bij direct gevaar bel je 112.",
        "actions": [
          "contact",
          "urgent"
        ]
      }
    ]
  },
  {
    "id": "panic",
    "title": "Paniek en lichamelijke spanning",
    "examples": [
      "ik raak in paniek",
      "ik heb paniek",
      "ik hyperventileer",
      "mijn hart gaat tekeer"
    ],
    "question": "Herken je dit van eerdere paniek, of is het nieuw of anders?",
    "options": [
      {
        "id": "1",
        "label": "Dit herken ik",
        "topic": "paniek spanning",
        "suggestion": "Gebruik een eerder afgesproken helpende stap uit je signaleringsplan of vraag iemand bij je te blijven.",
        "actions": [
          "signal",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Het is nieuw of anders",
        "topic": "lichamelijke klachten paniek",
        "suggestion": "Laat nieuwe of andere lichamelijke klachten beoordelen door een arts. Bij direct gevaar bel je 112.",
        "actions": [
          "contact",
          "urgent"
        ]
      },
      {
        "id": "3",
        "label": "Ik weet het niet goed",
        "topic": "paniek onzekerheid",
        "suggestion": "Vraag iemand om steun en overleg met een arts als je twijfelt over lichamelijke klachten.",
        "actions": [
          "contact"
        ]
      }
    ]
  },
  {
    "id": "avoidance",
    "title": "Vermijden",
    "examples": [
      "ik durf de deur niet uit",
      "ik vermijd alles",
      "ik stel het steeds uit uit angst",
      "ik durf niet naar buiten"
    ],
    "question": "Wat houdt je vooral tegen?",
    "options": [
      {
        "id": "1",
        "label": "Bang dat er iets gebeurt",
        "topic": "angst vermijding",
        "suggestion": "Bespreek een passende kleine stap met je behandelaar of iemand die jou ondersteunt.",
        "actions": [
          "contact",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Te veel prikkels of vermoeidheid",
        "topic": "overprikkeling energie",
        "suggestion": "Je kunt een rustigere plek, korter moment of steun van iemand overwegen.",
        "actions": [
          "plan",
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Bang voor reacties van anderen",
        "topic": "sociale angst onzekerheid",
        "suggestion": "Je kunt één situatie kiezen waarover je uitleg of steun wilt.",
        "actions": [
          "learn",
          "contact"
        ]
      }
    ]
  },
  {
    "id": "low_mood",
    "title": "Somberheid",
    "examples": [
      "ik ben somber",
      "ik voel me verdrietig",
      "ik zit in de put",
      "ik moet steeds huilen",
      "ik voel me down",
      "ik voel me kut",
      "ik voel me klote",
      "ik voel me meh"
    ],
    "question": "Wat zou nu het meest helpen?",
    "options": [
      {
        "id": "1",
        "label": "Iemand die luistert",
        "topic": "somberheid steun",
        "suggestion": "Kies iemand bij wie je kunt zeggen hoe het met je gaat.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Een kleine stap in mijn dag",
        "topic": "somberheid activering",
        "suggestion": "Kies iets kleins dat voor jou belangrijk is, zonder te eisen dat het meteen goed voelt.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Beter begrijpen wat er gebeurt",
        "topic": "somberheid herstel",
        "suggestion": "Je kunt passende uitleg bekijken en vragen voor je behandelaar verzamelen.",
        "actions": [
          "learn",
          "contact"
        ]
      }
    ]
  },
  {
    "id": "numbness",
    "title": "Leeg of afgevlakt gevoel",
    "examples": [
      "ik voel niks",
      "ik voel me leeg",
      "alles voelt vlak",
      "ik kan nergens van genieten"
    ],
    "question": "Hoe merk je dat vooral?",
    "options": [
      {
        "id": "1",
        "label": "Weinig plezier of interesse",
        "topic": "plezier somberheid",
        "suggestion": "Je kunt een kleine vertrouwde activiteit kiezen en daarna opmerken hoe die was.",
        "actions": [
          "plan",
          "learn"
        ]
      },
      {
        "id": "2",
        "label": "Afstand tot mezelf of omgeving",
        "topic": "vervreemding dissociatie",
        "suggestion": "Je kunt steun vragen en een vertrouwde manier gebruiken om contact te maken met het hier en nu.",
        "actions": [
          "contact",
          "practice"
        ]
      },
      {
        "id": "3",
        "label": "Sinds een medicatieverandering",
        "topic": "medicatie bijwerkingen",
        "suggestion": "Schrijf op wat veranderde en wanneer. Bespreek dit met je voorschrijver; pas de medicatie niet zelf aan.",
        "actions": [
          "contact",
          "plan"
        ]
      }
    ]
  },
  {
    "id": "initiation",
    "title": "Moeilijk op gang komen",
    "examples": [
      "ik kom nergens toe",
      "ik krijg niks gedaan",
      "ik kan niet beginnen",
      "ik blijf op de bank",
      "ik stel alles uit",
      "ik heb nergens zin in",
      "alles kost moeite"
    ],
    "question": "Wat zit het beginnen vooral in de weg?",
    "options": [
      {
        "id": "1",
        "label": "De taak is te groot",
        "topic": "kleine stappen plannen",
        "suggestion": "Maak de eerste stap zo klein dat je weet waarmee je begint.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Ik weet niet waar ik moet beginnen",
        "topic": "overzicht plannen",
        "suggestion": "Kies één taak en schrijf alleen de eerste handeling op.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Geen energie of veel spanning",
        "topic": "energie spanning",
        "suggestion": "Je kunt eerst kiezen wat nu haalbaar is en zo nodig iemand om hulp vragen.",
        "actions": [
          "contact",
          "learn"
        ]
      }
    ]
  },
  {
    "id": "concentration",
    "title": "Aandacht en geheugen",
    "examples": [
      "ik kan me niet concentreren",
      "ik vergeet alles",
      "ik ben steeds afgeleid",
      "ik raak de draad kwijt",
      "ik ben chaotisch",
      "ik vergeet steeds afspraken"
    ],
    "question": "Waar loop je het meest tegenaan?",
    "options": [
      {
        "id": "1",
        "label": "Mijn aandacht erbij houden",
        "topic": "concentratie prikkels",
        "suggestion": "Je kunt één taak tegelijk proberen met minder afleiding.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Afspraken of taken onthouden",
        "topic": "geheugen reminders",
        "suggestion": "Je kunt één afspraak of taak op een vaste plek noteren.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Dit is nieuw of neemt toe",
        "topic": "concentratie verandering",
        "suggestion": "Bespreek de verandering met je behandelaar of huisarts.",
        "actions": [
          "contact"
        ]
      }
    ]
  },
  {
    "id": "loneliness",
    "title": "Eenzaamheid",
    "examples": [
      "ik voel me alleen",
      "ik ben eenzaam",
      "ik heb niemand",
      "ik mis contact",
      "niemand belt mij",
      "niemand begrijpt me",
      "ik voel me buitengesloten"
    ],
    "question": "Wat mis je vooral?",
    "options": [
      {
        "id": "1",
        "label": "Iemand om mee te praten",
        "topic": "eenzaamheid steun",
        "suggestion": "Je kunt één persoon kiezen om een kort bericht te sturen.",
        "actions": [
          "contact",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Samen iets doen",
        "topic": "contact activiteiten",
        "suggestion": "Kies een kleine gezamenlijke activiteit die bij je past.",
        "actions": [
          "plan",
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Me begrepen voelen",
        "topic": "erkenning herstelverhalen",
        "suggestion": "Je kunt ervaringsverhalen bekijken of contact zoeken met een ervaringsdeskundige.",
        "actions": [
          "learn",
          "contact"
        ]
      }
    ]
  },
  {
    "id": "social_anxiety",
    "title": "Onzeker in contact",
    "examples": [
      "iedereen vindt me raar",
      "ik ben bang dat ze me afwijzen",
      "ik durf niemand te appen",
      "ik ben ongemakkelijk bij mensen"
    ],
    "question": "Wat maakt contact vooral moeilijk?",
    "options": [
      {
        "id": "1",
        "label": "Bang voor afwijzing",
        "topic": "sociale angst afwijzing",
        "suggestion": "Je kunt met iemand bespreken welke kleine contactstap haalbaar voelt.",
        "actions": [
          "contact",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Niet weten wat ik kan zeggen",
        "topic": "contact vaardigheden",
        "suggestion": "Je kunt een eerste zin voor een bericht voorbereiden.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Contact kost veel energie",
        "topic": "sociale belasting grenzen",
        "suggestion": "Je kunt een korter contactmoment of een duidelijke grens kiezen.",
        "actions": [
          "plan",
          "learn"
        ]
      }
    ]
  },
  {
    "id": "boundaries",
    "title": "Grenzen en pleasen",
    "examples": [
      "ik zeg altijd ja",
      "ik durf geen nee te zeggen",
      "ik wil iedereen tevreden houden",
      "ik cijfer mezelf weg",
      "ik laat over me heen lopen",
      "ik laat mensen over mijn grenzen gaan"
    ],
    "question": "Wat maakt een grens aangeven lastig?",
    "options": [
      {
        "id": "1",
        "label": "Bang dat iemand boos wordt",
        "topic": "grenzen coping pleasen",
        "suggestion": "Je kunt een kleine grens voorbereiden voor een situatie die veilig genoeg voelt.",
        "actions": [
          "learn",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Ik weet niet wat ik zelf wil",
        "topic": "behoeften grenzen",
        "suggestion": "Je kunt eerst opschrijven wat jij nodig hebt, zonder meteen iets te hoeven veranderen.",
        "actions": [
          "learn",
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Ik voel me daarna schuldig",
        "topic": "schuld grenzen",
        "suggestion": "Je kunt onderzoeken wat schuldgevoel je vertelt en wat voor jou belangrijk is.",
        "actions": [
          "learn",
          "practice"
        ]
      }
    ]
  },
  {
    "id": "self_criticism",
    "title": "Zelfkritiek",
    "examples": [
      "ik doe alles fout",
      "ik ben niet goed genoeg",
      "ik vind mezelf waardeloos",
      "ik ben een mislukkeling",
      "ik ben een loser"
    ],
    "question": "Waar heb je nu vooral behoefte aan?",
    "options": [
      {
        "id": "1",
        "label": "Minder vastzitten in die gedachte",
        "topic": "zelfkritiek gedachten",
        "suggestion": "Je kunt een oefening kiezen om een gedachte op te merken als een gedachte.",
        "actions": [
          "practice",
          "learn"
        ]
      },
      {
        "id": "2",
        "label": "Iemand die met me meekijkt",
        "topic": "zelfbeeld steun",
        "suggestion": "Je kunt iemand vertellen hoe hard je over jezelf oordeelt.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Eén haalbare ervaring opdoen",
        "topic": "zelfvertrouwen kleine stappen",
        "suggestion": "Kies een kleine stap die past bij wat jij belangrijk vindt.",
        "actions": [
          "plan"
        ]
      }
    ]
  },
  {
    "id": "shame",
    "title": "Schaamte en schuld",
    "examples": [
      "ik schaam me",
      "ik voel me schuldig",
      "ik durf het niet te vertellen",
      "het is allemaal mijn schuld"
    ],
    "question": "Wat maakt het nu moeilijk?",
    "options": [
      {
        "id": "1",
        "label": "Ik blijf mezelf verwijten maken",
        "topic": "zelfkritiek schuld",
        "suggestion": "Je kunt uitleg over zelfkritiek bekijken en een vraag voor je behandelaar opschrijven.",
        "actions": [
          "learn",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Bang hoe iemand reageert",
        "topic": "schaamte steun",
        "suggestion": "Kies zorgvuldig met wie je iets wilt delen en hoeveel je wilt vertellen.",
        "actions": [
          "contact",
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Ik wil iets herstellen",
        "topic": "schuld contact",
        "suggestion": "Je kunt bedenken of er een kleine, passende herstelstap mogelijk is.",
        "actions": [
          "plan"
        ]
      }
    ]
  },
  {
    "id": "anger",
    "title": "Boosheid en irritatie",
    "examples": [
      "ik ben boos",
      "ik ben snel geirriteerd",
      "ik ontplof steeds",
      "ik heb een kort lontje",
      "ik ben opgefokt",
      "ik kan niks hebben"
    ],
    "question": "Wat heb je nu het meest nodig?",
    "options": [
      {
        "id": "1",
        "label": "Eerst wat afstand of rust",
        "topic": "boosheid spanning",
        "suggestion": "Als dat veilig kan, kun je even afstand nemen en een afgesproken ruststap gebruiken.",
        "actions": [
          "signal",
          "practice"
        ]
      },
      {
        "id": "2",
        "label": "Later iets bespreken",
        "topic": "conflict communicatie",
        "suggestion": "Je kunt voorbereiden wat je wilt zeggen wanneer er meer rust is.",
        "actions": [
          "plan",
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Ik ben bang iemand pijn te doen",
        "topic": "veiligheid boosheid",
        "suggestion": "Zoek direct hulp van je behandelaar, huisarts of huisartsenpost. Bij direct gevaar bel je 112.",
        "actions": [
          "contact",
          "urgent"
        ]
      }
    ]
  },
  {
    "id": "conflict",
    "title": "Ruzie en relaties",
    "examples": [
      "ik heb ruzie",
      "we begrijpen elkaar niet",
      "het botst thuis",
      "ik voel me niet gehoord"
    ],
    "question": "Wat wil je het liefst bereiken?",
    "options": [
      {
        "id": "1",
        "label": "Eerst tot rust komen",
        "topic": "conflict spanning",
        "suggestion": "Je kunt een pauze afspreken als dat veilig is.",
        "actions": [
          "practice",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Duidelijk maken wat ik nodig heb",
        "topic": "communicatie grenzen",
        "suggestion": "Schrijf één behoefte op die je rustig wilt bespreken.",
        "actions": [
          "plan",
          "learn"
        ]
      },
      {
        "id": "3",
        "label": "Hulp bij de situatie",
        "topic": "relatie steun",
        "suggestion": "Zoek iemand die met je kan meedenken. Als je thuis onveilig bent, vraag nu hulp.",
        "actions": [
          "contact"
        ]
      }
    ]
  },
  {
    "id": "trauma",
    "title": "Nare herinneringen",
    "examples": [
      "ik heb flashbacks",
      "ik heb nare herinneringen",
      "ik krijg nachtmerries",
      "het voelt alsof het weer gebeurt"
    ],
    "question": "Wat zou je op dit moment helpen?",
    "options": [
      {
        "id": "1",
        "label": "Meer contact met het hier en nu",
        "topic": "herinneringen hier en nu",
        "suggestion": "Je kunt een vertrouwde oefening kiezen uit je behandeling. Stop als die je meer ontregelt.",
        "actions": [
          "practice",
          "signal"
        ]
      },
      {
        "id": "2",
        "label": "Iemand bij me",
        "topic": "trauma steun",
        "suggestion": "Vraag een vertrouwd persoon of behandelaar om steun; je hoeft de gebeurtenis hier niet te vertellen.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Dit bespreken in mijn behandeling",
        "topic": "trauma behandeling",
        "suggestion": "Noteer wanneer het gebeurt en welke hulp je wilt bespreken.",
        "actions": [
          "plan",
          "contact"
        ]
      }
    ]
  },
  {
    "id": "dissociation",
    "title": "Vervreemding",
    "examples": [
      "alles voelt onwerkelijk",
      "ik ben er niet helemaal bij",
      "ik voel me los van mezelf",
      "ik ben tijd kwijt"
    ],
    "question": "Wat past het meest?",
    "options": [
      {
        "id": "1",
        "label": "Een vertrouwd gevoel",
        "topic": "vervreemding hier en nu",
        "suggestion": "Gebruik een eerder afgesproken helpende stap of vraag iemand bij je te blijven.",
        "actions": [
          "signal",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Nieuw of duidelijk erger",
        "topic": "vervreemding verandering",
        "suggestion": "Bespreek dit met je behandelaar of huisarts, zeker als je niet goed weet wat er gebeurt.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Ik voel me niet veilig",
        "topic": "veiligheid steun",
        "suggestion": "Zoek nu hulp. Bij direct gevaar bel je 112.",
        "actions": [
          "contact",
          "urgent"
        ]
      }
    ]
  },
  {
    "id": "voices",
    "title": "Stemmen of andere waarnemingen",
    "examples": [
      "ik hoor stemmen",
      "ik zie dingen die anderen niet zien",
      "de stemmen zijn druk",
      "de stemmen laten me niet met rust",
      "ik hoor weer die stemmen"
    ],
    "question": "Wat heb je nu nodig?",
    "options": [
      {
        "id": "1",
        "label": "Steun bij iets wat ik herken",
        "topic": "stemmen steun",
        "suggestion": "Je kunt je afgesproken stappen bekijken en contact zoeken met iemand die je vertrouwt.",
        "actions": [
          "signal",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Het is nieuw of sterker",
        "topic": "stemmen verandering",
        "suggestion": "Neem contact op met je behandelaar of huisarts om dit te bespreken.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "De stemmen dragen me op iets gevaarlijks te doen",
        "topic": "stemmen veiligheid",
        "suggestion": "Zoek nu hulp van je behandelaar, huisarts of huisartsenpost. Bij direct gevaar bel je 112.",
        "actions": [
          "contact",
          "urgent"
        ]
      }
    ]
  },
  {
    "id": "suspicion",
    "title": "Wantrouwen en onveilig voelen",
    "examples": [
      "ik vertrouw niemand",
      "mensen houden me in de gaten",
      "ze hebben het op mij gemunt",
      "ik word gevolgd"
    ],
    "question": "Dat kan beangstigend zijn. Welke steun past nu?",
    "options": [
      {
        "id": "1",
        "label": "Iemand die ik vertrouw spreken",
        "topic": "wantrouwen steun",
        "suggestion": "Vertel iemand die je vertrouwt hoe bang of gespannen je je voelt.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Mijn afspraken erbij pakken",
        "topic": "wantrouwen signaleringsplan",
        "suggestion": "Bekijk welke steun en stappen je eerder met je behandelaar hebt afgesproken.",
        "actions": [
          "signal",
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Ik ben nu in direct gevaar",
        "topic": "veiligheid hulp",
        "suggestion": "Bel 112 bij direct gevaar en zoek een veilige plek als dat mogelijk is.",
        "actions": [
          "urgent",
          "contact"
        ]
      }
    ]
  },
  {
    "id": "activation",
    "title": "Veel energie en weinig slaap",
    "examples": [
      "ik heb bijna geen slaap nodig",
      "ik sta helemaal aan",
      "ik heb heel veel energie",
      "ik kan alles aan",
      "mijn gedachten gaan razendsnel"
    ],
    "question": "Wat valt je daarnaast op?",
    "options": [
      {
        "id": "1",
        "label": "Minder slaap dan normaal",
        "topic": "weinig slaap veel energie",
        "suggestion": "Bespreek dit vandaag met je behandelaar of huisarts en bekijk je signaleringsplan.",
        "actions": [
          "contact",
          "signal"
        ]
      },
      {
        "id": "2",
        "label": "Meer impulsieve keuzes",
        "topic": "impulsiviteit signalen",
        "suggestion": "Bespreek dit met je behandelaar en iemand die je vertrouwt voordat je grote beslissingen neemt.",
        "actions": [
          "contact",
          "signal"
        ]
      },
      {
        "id": "3",
        "label": "Het voelt gewoon als een goede dag",
        "topic": "positieve stemming balans",
        "suggestion": "Je kunt stilstaan bij wat helpt en letten op je gebruikelijke ritme.",
        "actions": [
          "plan"
        ]
      }
    ]
  },
  {
    "id": "impulsivity",
    "title": "Impulsiviteit",
    "examples": [
      "ik doe dingen zonder na te denken",
      "ik geef te veel geld uit",
      "ik kan mezelf niet afremmen",
      "ik handel impulsief"
    ],
    "question": "Waar wil je hulp bij?",
    "options": [
      {
        "id": "1",
        "label": "Even pauze voor ik iets doe",
        "topic": "impulsiviteit pauze",
        "suggestion": "Je kunt een korte pauze en overleg met een vertrouwd persoon afspreken.",
        "actions": [
          "plan",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Een patroon herkennen",
        "topic": "impulsiviteit signalen",
        "suggestion": "Je kunt noteren wanneer het gebeurt en wat eraan voorafgaat.",
        "actions": [
          "plan",
          "signal"
        ]
      },
      {
        "id": "3",
        "label": "Dit is nieuw of neemt toe",
        "topic": "impulsiviteit verandering",
        "suggestion": "Bespreek de verandering met je behandelaar.",
        "actions": [
          "contact"
        ]
      }
    ]
  },
  {
    "id": "compulsions",
    "title": "Dwang en herhaald controleren",
    "examples": [
      "ik blijf controleren",
      "ik moet alles herhalen",
      "ik moet steeds mijn handen wassen",
      "ik blijf geruststelling vragen"
    ],
    "question": "Wat zoek je vooral?",
    "options": [
      {
        "id": "1",
        "label": "Begrijpen wat er gebeurt",
        "topic": "dwang onzekerheid",
        "suggestion": "Je kunt uitleg over dwang en onzekerheid bekijken.",
        "actions": [
          "learn"
        ]
      },
      {
        "id": "2",
        "label": "Een stap volgens mijn behandeling",
        "topic": "dwang oefenen",
        "suggestion": "Gebruik alleen een oefenstap die je met je behandelaar hebt afgesproken.",
        "actions": [
          "contact",
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Steun bij veel spanning",
        "topic": "dwang spanning",
        "suggestion": "Je kunt vertellen hoeveel last je hebt en welke steun je nodig hebt.",
        "actions": [
          "contact"
        ]
      }
    ]
  },
  {
    "id": "medication",
    "title": "Medicatievragen",
    "examples": [
      "ik heb last van mijn medicijnen",
      "ik wil stoppen met mijn pillen",
      "ik vergeet mijn medicatie",
      "mijn medicijnen helpen niet",
      "ik ben suf van mijn pillen",
      "ik wil mijn medicijnen niet meer"
    ],
    "question": "Waar gaat je vraag vooral over?",
    "options": [
      {
        "id": "1",
        "label": "Bijwerkingen",
        "topic": "medicatie bijwerkingen",
        "suggestion": "Schrijf op wat je merkt en bespreek het met je voorschrijver of apotheker. Verander niet zelf de dosis.",
        "actions": [
          "contact",
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Vergeten of twijfel over innemen",
        "topic": "medicatie innemen",
        "suggestion": "Vraag je apotheker of voorschrijver wat je in jouw situatie moet doen; neem niet zomaar een extra dosis.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Effect of stoppen bespreken",
        "topic": "medicatie werking stoppen",
        "suggestion": "Bereid je vragen voor je voorschrijver voor. Stop of verander niet zelfstandig.",
        "actions": [
          "contact",
          "learn"
        ]
      }
    ]
  },
  {
    "id": "substances",
    "title": "Alcohol en drugs",
    "examples": [
      "ik drink te veel",
      "ik blow te veel",
      "ik heb trek in alcohol",
      "ik wil weer gebruiken",
      "ik ben teruggevallen met gebruiken",
      "ik wil blowen",
      "ik heb zin om te gebruiken"
    ],
    "question": "Wat speelt nu vooral?",
    "options": [
      {
        "id": "1",
        "label": "Trek of een risicomoment",
        "topic": "middelen trek",
        "suggestion": "Bekijk je afgesproken plan en neem contact op met iemand die kan ondersteunen.",
        "actions": [
          "signal",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Mijn gebruik bespreken",
        "topic": "middelen psychische klachten",
        "suggestion": "Je kunt je gebruik en vragen bespreken met je behandelaar, zonder jezelf te veroordelen.",
        "actions": [
          "contact",
          "learn"
        ]
      },
      {
        "id": "3",
        "label": "Ik voel me ziek na gebruik of stoppen",
        "topic": "middelen lichamelijke klachten",
        "suggestion": "Neem contact op met een arts. Bij direct gevaar of ernstige klachten bel je 112.",
        "actions": [
          "contact",
          "urgent"
        ]
      }
    ]
  },
  {
    "id": "self_care",
    "title": "Zelfzorg",
    "examples": [
      "ik douche niet meer",
      "ik eet niet goed",
      "ik zorg niet voor mezelf",
      "ik kom mijn bed niet uit"
    ],
    "question": "Welke kleine stap is nu haalbaar?",
    "options": [
      {
        "id": "1",
        "label": "Eten of drinken regelen",
        "topic": "zelfzorg voeding",
        "suggestion": "Je kunt één haalbaar eet- of drinkmoment regelen, zo nodig met hulp.",
        "actions": [
          "plan",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Wassen of aankleden",
        "topic": "zelfzorg dagelijkse routine",
        "suggestion": "Kies één kleine handeling in plaats van de hele routine.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Ik heb hulp nodig",
        "topic": "zelfzorg ondersteuning",
        "suggestion": "Vraag iemand om praktische hulp en bespreek het als zelfzorg niet meer lukt.",
        "actions": [
          "contact"
        ]
      }
    ]
  },
  {
    "id": "practical",
    "title": "Geld en praktische zorgen",
    "examples": [
      "ik heb geldzorgen",
      "ik heb schulden",
      "ik durf mijn post niet te openen",
      "ik raak het overzicht kwijt"
    ],
    "question": "Wat zou het meeste verschil maken?",
    "options": [
      {
        "id": "1",
        "label": "Samen overzicht maken",
        "topic": "geld administratie",
        "suggestion": "Je kunt één stapel of één brief samen met iemand bekijken.",
        "actions": [
          "plan",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Hulp bij geld of wonen",
        "topic": "praktische ondersteuning",
        "suggestion": "Vraag je begeleider of maatschappelijk werker welke hulp beschikbaar is.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Eerst de spanning bespreken",
        "topic": "zorgen spanning",
        "suggestion": "Je kunt aangeven wat je tegenhoudt en welke steun nodig is.",
        "actions": [
          "contact",
          "learn"
        ]
      }
    ]
  },
  {
    "id": "meaning",
    "title": "Zingeving en richting",
    "examples": [
      "ik weet niet wat ik wil",
      "ik mis richting",
      "wat vind ik belangrijk",
      "ik mis een doel"
    ],
    "question": "Waar wil je bij stilstaan?",
    "options": [
      {
        "id": "1",
        "label": "Wat ik belangrijk vind",
        "topic": "waarden zingeving",
        "suggestion": "Je kunt één waarde of belangrijk levensgebied kiezen om te verkennen.",
        "actions": [
          "learn",
          "practice"
        ]
      },
      {
        "id": "2",
        "label": "Een haalbare veranderwens",
        "topic": "hersteldoel veranderwens",
        "suggestion": "Je kunt bedenken wat je in je dagelijks leven een beetje anders zou willen.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Iemand die meedenkt",
        "topic": "herstel steun",
        "suggestion": "Je kunt dit met een naaste, ervaringsdeskundige of behandelaar bespreken.",
        "actions": [
          "contact"
        ]
      }
    ]
  },
  {
    "id": "relapse",
    "title": "Terugvalsignalen",
    "examples": [
      "ik voel een terugval aankomen",
      "het gaat weer achteruit",
      "ik herken de signalen",
      "ik ben bang terug te vallen",
      "ik glijd weer af"
    ],
    "question": "Wat merk je het meest?",
    "options": [
      {
        "id": "1",
        "label": "Bekende vroege signalen",
        "topic": "terugval signaleringsplan",
        "suggestion": "Bekijk je signaleringsplan en kies een afgesproken stap.",
        "actions": [
          "signal",
          "contact"
        ]
      },
      {
        "id": "2",
        "label": "Nieuwe of sterkere klachten",
        "topic": "terugval verandering",
        "suggestion": "Neem contact op met je behandelaar om de verandering te bespreken.",
        "actions": [
          "contact"
        ]
      },
      {
        "id": "3",
        "label": "Vooral bang dat het misgaat",
        "topic": "terugval angst",
        "suggestion": "Je kunt onderscheid maken tussen wat je merkt en waar je bang voor bent, samen met iemand.",
        "actions": [
          "contact",
          "learn"
        ]
      }
    ]
  },
  {
    "id": "progress",
    "title": "Wat goed gaat",
    "examples": [
      "het gaat beter",
      "het is me gelukt",
      "ik ben trots op mezelf",
      "ik heb een goede dag",
      "vandaag ging het goed"
    ],
    "question": "Waar wil je bij stilstaan?",
    "options": [
      {
        "id": "1",
        "label": "Wat me heeft geholpen",
        "topic": "herstel krachtbronnen",
        "suggestion": "Je kunt opschrijven wat hielp en wie daarbij belangrijk was.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "2",
        "label": "Een stap vasthouden",
        "topic": "herstel routine",
        "suggestion": "Kies een kleine stap die je wilt blijven doen.",
        "actions": [
          "plan"
        ]
      },
      {
        "id": "3",
        "label": "Een actie afronden",
        "topic": "voltooide actie",
        "suggestion": "Je kunt de betreffende actie op je overzicht controleren en zelf als voltooid markeren.",
        "actions": [
          "actions"
        ]
      }
    ]
  }
];
export function normalizeMappingText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
// Alleen volledige voorbeeldzinnen/woordgroepen. Een losse term leidt niet tot een diagnose.
export function findLanguageMappings(text: string): LanguageMapping[] {
  const normalized = " " + normalizeMappingText(text) + " ";
  // Vermijd het toeschrijven van geciteerde, ontkende of andermans klachten.
  if (/\b(niet (?:meer )?(?:moe|bang|somber|eenzaam)|mijn (vriend|vriendin|partner|moeder|vader|patient)|hij zegt|zij zegt|iemand zegt)\b/.test(normalized)) return [];
  return buddyLanguageMapping.map(mapping => ({mapping, score: Math.max(0, ...mapping.examples.map(example => normalized.includes(" " + normalizeMappingText(example) + " ") ? normalizeMappingText(example).length : 0))}))
    .filter(item => item.score > 0).sort((a,b) => b.score - a.score).slice(0,3).map(item => item.mapping);
}
export function matchMappingOption(mapping: LanguageMapping, text: string): MappingOption | undefined {
  const normalized = normalizeMappingText(text);
  return mapping.options.find(option => normalizeMappingText(option.label) === normalized || option.id === normalized);
}
// Hooguit drie relevante kaarten meesturen: de hele catalogus vertraagt de modelaanroep.
export function mappingPromptContext(text: string): string {
  const matches = findLanguageMappings(text);
  return matches.length ? JSON.stringify(matches.map(({id,title,question,options}) => ({id,title,question,topics:options.map(option=>option.topic)}))) : "";
}
