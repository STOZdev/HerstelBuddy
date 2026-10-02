"use client";

import type { CSSProperties } from "react";

export type ActStage = "intro" | "video" | "exercise";

export type ActLanguageVersion = "simple" | "standard" | "scientific";

export const actLanguageVersionOptions: Array<{
  id: ActLanguageVersion;
  label: string;
  description: string;
  detail: string;
}> = [
  {
    id: "simple",
    label: "Eenvoudige taal",
    description: "Korte zinnen en weinig moeilijke woorden.",
    detail: "Past als je rustig en stap voor stap wilt lezen.",
  },
  {
    id: "standard",
    label: "Normale taal",
    description: "Heldere uitleg met de belangrijkste ACT-begrippen.",
    detail: "Past als je gewone uitleg met voorbeelden prettig vindt.",
  },
  {
    id: "scientific",
    label: "Uitgebreide taal met wetenschappelijke verdieping",
    description: "Meer theorie en wetenschappelijke verdieping.",
    detail: "Past als je ook wilt begrijpen hoe ACT mogelijk werkt.",
  },
];

export const actLanguageVersionLabels: Record<
  ActLanguageVersion,
  string
> = {
  simple: "Eenvoudige taal",
  standard: "Normale taal",
  scientific: "Uitgebreide taal met wetenschappelijke verdieping",
};

export const actProgressByStage: Record<ActStage, number> = {
  intro: 20,
  video: 60,
  exercise: 100,
};

// Productie-assets horen in object storage of /public/videos. De video is in
// deze code-only mock optioneel; de module blijft bruikbaar als het bestand
// nog niet is toegevoegd.
const actVideoUrl = "/videos/zelf-als-context.mp4";

type ActCopy = {
  introTitle: string;
  introText: string;
  introNotice: string;
  videoTitle: string;
  videoText: string;
  videoHelp: string;
  exerciseTitle: string;
  exerciseText: string;
  stepOneTitle: string;
  stepOneText: string;
  inputLabel: string;
  placeholder: string;
  stepTwoTitle: string;
  stepTwoText: string;
  quoteLead: string;
  quoteEmpty: string;
  quoteNote: string;
  stepThreeTitle: string;
  stepThreeText: string;
  willingnessOptions: string[];
};

const copyByVersion: Record<ActLanguageVersion, ActCopy> = {
  simple: {
    introTitle: "Lastige gedachten mogen er zijn",
    introText:
      "Wil je iets veranderen? Dan kun je lastige gedachten of gevoelens krijgen. Je hoeft ze niet weg te duwen. In deze module oefen je om ze op te merken en toch een kleine stap te zetten.",
    introNotice:
      "Dit is een korte oefening. Het is geen hele behandeling. Vraag je behandelaar om hulp als de oefening veel spanning geeft.",
    videoTitle: "Kijken naar je gedachten",
    videoText:
      "De video laat zien dat jij meer bent dan je gedachten en gevoelens. Je kunt merken wat er in je gebeurt, zonder dat je er meteen iets mee hoeft te doen.",
    videoHelp:
      "Je mag de video stoppen, terugspoelen of later nog een keer bekijken.",
    exerciseTitle: "Opmerken, een stap terug en ruimte maken",
    exerciseText:
      "Neem elke dag even de tijd. Kijk wat je denkt of voelt. Zet daarna een kleine stap terug. Laat het gevoel er even zijn.",
    stepOneTitle: "Opmerken",
    stepOneText: "Wat denk of voel je nu? Wat merk je in je lichaam?",
    inputLabel: "Ik merk…",
    placeholder: "Bijvoorbeeld: ik ben bang en voel spanning in mijn buik.",
    stepTwoTitle: "Een stap terug",
    stepTwoText:
      "Zeg eerst: ‘Ik merk dat…’. Zo maak je een beetje ruimte tussen jou en de gedachte of het gevoel.",
    quoteLead: "Ik merk dat ik dit denk of voel:",
    quoteEmpty: "vul eerst in wat je merkt",
    quoteNote:
      "Wat je denkt of voelt is er wel, maar het hoeft niet te bepalen wat je doet.",
    stepThreeTitle: "Ruimte maken",
    stepThreeText:
      "Kun je dit gevoel even laten bestaan terwijl je denkt aan wat belangrijk voor je is?",
    willingnessOptions: [
      "Ja, dat lukt nu",
      "Misschien, als ik het klein houd",
      "Nee, dat lukt nu nog niet",
    ],
  },
  standard: {
    introTitle: "Ruimte maken en toch een stap zetten",
    introText:
      "Soms komen er lastige gedachten of gevoelens op als je iets wilt veranderen. In deze oefening hoef je die niet weg te maken. Je onderzoekt hoe je toch een kleine stap in de richting van je hersteldoel kunt zetten.",
    introNotice:
      "Dit is een korte zelfhulpoefening en geen volledige ACT-behandeling. Bespreek vragen of sterke spanning met je behandelaar.",
    videoTitle: "Jezelf als context",
    videoText:
      "In deze video maak je kennis met het ACT-principe ‘jezelf als context’. Je oefent om gedachten en gevoelens op te merken zonder er volledig mee samen te vallen.",
    videoHelp:
      "Je kunt de video pauzeren, terugspoelen of later opnieuw bekijken.",
    exerciseTitle: "Opmerken, afstand nemen en ruimte maken",
    exerciseText:
      "Neem iedere dag een kort moment voor deze oefening. Je hoeft een lastige gedachte of een gevoel niet op te lossen. Je oefent om het op te merken, er wat afstand van te nemen en het even mee te dragen.",
    stepOneTitle: "Opmerken",
    stepOneText:
      "Welke gedachte, welk gevoel of welke lichamelijke reactie merk je nu op?",
    inputLabel: "Ik merk op…",
    placeholder:
      "Bijvoorbeeld: ik denk dat het niet gaat lukken en voel spanning in mijn buik.",
    stepTwoTitle: "Afstand nemen",
    stepTwoText:
      "Zet de woorden ‘Ik merk op dat…’ voor je ervaring. Daarmee maak je een klein beetje ruimte tussen jou en wat je ervaart.",
    quoteLead: "Ik merk op dat mijn hoofd of lichaam mij dit laat weten:",
    quoteEmpty: "vul hierboven eerst in wat je opmerkt",
    quoteNote:
      "Dit is een ervaring die je kunt opmerken, niet automatisch een opdracht die je moet volgen.",
    stepThreeTitle: "Ruimte maken",
    stepThreeText:
      "Kun je deze ervaring even laten bestaan terwijl je aandacht houdt voor wat belangrijk voor je is?",
    willingnessOptions: [
      "Ja, ik kan dit nu even laten bestaan",
      "Misschien, als ik het moment klein houd",
      "Nee, dat lukt nu nog niet",
    ],
  },
  scientific: {
    introTitle: "Psychologische flexibiliteit oefenen",
    introText:
      "ACT richt zich niet primair op het verwijderen van gedachten of gevoelens, maar op het flexibeler omgaan met innerlijke ervaringen. Het doel is dat je aandacht kunt geven aan het huidige moment en gedrag kunt kiezen dat aansluit bij wat voor jou van waarde is, ook wanneer ongemak aanwezig blijft.",
    introNotice:
      "Deze korte digitale oefening gebruikt enkele ACT-processen, maar is geen volledige, geïndiceerde ACT-behandeling. Bespreek de toepasbaarheid en eventuele sterke spanning met je behandelaar.",
    videoTitle: "Zelf-als-context en het observerende perspectief",
    videoText:
      "De video introduceert ‘zelf-als-context’: het perspectief van waaruit gedachten, emoties en lichamelijke sensaties kunnen worden waargenomen. De inhoud van een gedachte hoeft daardoor minder volledig samen te vallen met jouw identiteit of met de actie die je vervolgens kiest.",
    videoHelp:
      "Bekijk de video in je eigen tempo. Let op het onderscheid tussen de waargenomen ervaring en het perspectief van waaruit je die ervaring opmerkt.",
    exerciseTitle: "Aandacht, cognitieve defusie en acceptatie",
    exerciseText:
      "Deze dagelijkse oefening combineert contact met het huidige moment, cognitieve defusie en acceptatie. Je observeert een innerlijke ervaring, verandert de talige relatie ermee en onderzoekt je bereidheid om ongemak toe te laten zonder er automatisch naar te handelen.",
    stepOneTitle: "Contact met het huidige moment",
    stepOneText:
      "Observeer zo concreet mogelijk welke gedachte, emotie, impuls of lichamelijke sensatie nu aanwezig is. Beschrijf de ervaring zonder haar direct te verklaren of beoordelen.",
    inputLabel: "Mijn waarneming op dit moment",
    placeholder:
      "Bijvoorbeeld: de gedachte ‘dit lukt nooit’, druk op mijn borst en de neiging om de situatie te vermijden.",
    stepTwoTitle: "Cognitieve defusie",
    stepTwoText:
      "Plaats ‘Ik merk op dat…’ vóór de ervaring. Deze talige verschuiving is bedoeld om de functie en invloed van de gedachte te veranderen, niet om te bewijzen dat de gedachte onjuist is.",
    quoteLead: "Ik neem vanuit een observerend perspectief waar:",
    quoteEmpty: "beschrijf hierboven eerst de innerlijke ervaring",
    quoteNote:
      "De ervaring blijft beschikbaar voor aandacht, terwijl er meer ruimte kan ontstaan om bewust gedrag te kiezen.",
    stepThreeTitle: "Acceptatie en bereidheid",
    stepThreeText:
      "Onderzoek of je bereid bent deze ervaring tijdelijk toe te laten terwijl je aandacht houdt voor een herstelrichting die voor jou betekenisvol is.",
    willingnessOptions: [
      "Ja, ik ben bereid deze ervaring nu toe te laten",
      "Gedeeltelijk, als ik de stap concreet en klein maak",
      "Nee, mijn bereidheid is op dit moment nog beperkt",
    ],
  },
};

type ActModuleProps = {
  goal: string;
  version?: ActLanguageVersion;
  stage: ActStage;
  barrier: string;
  willingness: string;
  onStageChange: (stage: ActStage) => void;
  onBarrierChange: (value: string) => void;
  onWillingnessChange: (value: string) => void;
  onFinish: () => void;
};

export default function ActModule({
  goal,
  version = "standard",
  stage,
  barrier,
  willingness,
  onStageChange,
  onBarrierChange,
  onWillingnessChange,
  onFinish,
}: ActModuleProps) {
  const copy = copyByVersion[version];

  return (
    <div>
      {stage === "intro" && (
        <div>
          <p style={styles.eyebrow}>STAP 1 · UITLEG</p>
          <span style={styles.versionPill}>
            {actLanguageVersionLabels[version]}
          </span>
          <h1 style={styles.title}>{copy.introTitle}</h1>
          <p style={styles.intro}>{copy.introText}</p>

          <div style={styles.actionFocus}>
            <span style={styles.cardLabel}>Jouw hersteldoel</span>
            <strong>{goal || "Nog geen hersteldoel ingevuld"}</strong>
          </div>

          {version === "scientific" && <ScientificExplanation />}

          <div style={styles.infoBox}>
            <span aria-hidden="true">💡</span>
            <p style={styles.infoText}>{copy.introNotice}</p>
          </div>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => onStageChange("video")}
          >
            Verder naar de video
          </button>
        </div>
      )}

      {stage === "video" && (
        <div>
          <p style={styles.eyebrow}>STAP 2 · VIDEO</p>
          <span style={styles.versionPill}>
            {actLanguageVersionLabels[version]}
          </span>
          <h1 style={styles.title}>{copy.videoTitle}</h1>
          <p style={styles.intro}>{copy.videoText}</p>

          <div style={styles.videoCard}>
            <video style={styles.video} controls playsInline preload="metadata">
              <source src={actVideoUrl} type="video/mp4" />
              Je browser kan deze video niet afspelen.
            </video>
          </div>

          <p style={styles.videoHelpText}>{copy.videoHelp}</p>

          <button
            type="button"
            style={styles.primaryButton}
            onClick={() => onStageChange("exercise")}
          >
            Naar de dagelijkse oefening
          </button>
          <button
            type="button"
            style={styles.textButtonWide}
            onClick={() => onStageChange("intro")}
          >
            Terug
          </button>
        </div>
      )}

      {stage === "exercise" && (
        <div>
          <p style={styles.eyebrow}>STAP 3 · DAGELIJKSE ACTIE</p>
          <span style={styles.versionPill}>
            {actLanguageVersionLabels[version]}
          </span>
          <h1 style={styles.title}>{copy.exerciseTitle}</h1>
          <p style={styles.intro}>{copy.exerciseText}</p>

          <div style={styles.actionFocus}>
            <span style={styles.cardLabel}>Jouw hersteldoel</span>
            <strong>{goal || "Nog geen hersteldoel ingevuld"}</strong>
          </div>

          <section style={styles.exerciseStepCard}>
            <div style={styles.exerciseStepHeader}>
              <span style={styles.exerciseStepNumber}>1</span>
              <div>
                <h2 style={styles.exerciseStepTitle}>{copy.stepOneTitle}</h2>
                <p style={styles.exerciseStepText}>{copy.stepOneText}</p>
              </div>
            </div>

            <label style={styles.label} htmlFor="act-barrier">
              {copy.inputLabel}
            </label>
            <textarea
              id="act-barrier"
              style={styles.textarea}
              rows={4}
              value={barrier}
              onChange={(event) => onBarrierChange(event.target.value)}
              placeholder={copy.placeholder}
            />
          </section>

          <section style={styles.exerciseStepCard}>
            <div style={styles.exerciseStepHeader}>
              <span style={styles.exerciseStepNumber}>2</span>
              <div>
                <h2 style={styles.exerciseStepTitle}>{copy.stepTwoTitle}</h2>
                <p style={styles.exerciseStepText}>{copy.stepTwoText}</p>
              </div>
            </div>

            <div style={styles.exerciseCard}>
              <span style={styles.exerciseLabel}>
                Lees deze zin rustig voor jezelf
              </span>
              <p style={styles.exerciseQuote}>
                “{copy.quoteLead}
                <br />
                <strong>{barrier.trim() || copy.quoteEmpty}</strong>”
              </p>
              <p style={styles.exerciseNote}>{copy.quoteNote}</p>
            </div>
          </section>

          <section style={styles.exerciseStepCard}>
            <div style={styles.exerciseStepHeader}>
              <span style={styles.exerciseStepNumber}>3</span>
              <div>
                <h2 style={styles.exerciseStepTitle}>{copy.stepThreeTitle}</h2>
                <p style={styles.exerciseStepText}>{copy.stepThreeText}</p>
              </div>
            </div>

            {copy.willingnessOptions.map((answer) => {
              const isChosen = willingness === answer;

              return (
                <button
                  key={answer}
                  type="button"
                  aria-pressed={isChosen}
                  style={{
                    ...styles.choiceButton,
                    ...(isChosen ? styles.selectedChoice : {}),
                  }}
                  onClick={() => onWillingnessChange(answer)}
                >
                  {isChosen ? "✓ " : ""}
                  {answer}
                </button>
              );
            })}
          </section>

          {version === "scientific" && (
            <div style={styles.scientificExerciseNote}>
              <strong>Reflectie op het proces</strong>
              <span>
                Noteer niet alleen of ongemak afnam, maar vooral of je vrijer
                kon kiezen hoe je ermee omging. Dat sluit aan bij
                psychologische flexibiliteit als centraal ACT-proces.
              </span>
            </div>
          )}

          <button
            type="button"
            style={{
              ...styles.primaryButton,
              ...(!barrier.trim() || !willingness
                ? styles.disabledButton
                : {}),
            }}
            disabled={!barrier.trim() || !willingness}
            onClick={onFinish}
          >
            Dagelijkse actie afronden
          </button>
          <button
            type="button"
            style={styles.textButtonWide}
            onClick={() => onStageChange("video")}
          >
            Terug naar de video
          </button>
        </div>
      )}
    </div>
  );
}

function ScientificExplanation() {
  return (
    <section style={styles.scientificBox}>
      <p style={styles.scientificEyebrow}>WETENSCHAPPELIJKE VERDIEPING</p>
      <h2 style={styles.scientificTitle}>
        Het psychologische-flexibiliteitsmodel
      </h2>
      <p style={styles.scientificText}>
        ACT beschrijft zes onderling verbonden processen: acceptatie,
        cognitieve defusie, contact met het huidige moment, zelf-als-context,
        waarden en toegewijd handelen. Deze korte module oefent vooral de
        eerste vier; je hersteldoel geeft richting aan betekenisvol handelen.
      </p>
      <div style={styles.sourceLinks}>
        <a
          style={styles.sourceLink}
          href="https://contextualscience.org/six_core_processes_act"
          target="_blank"
          rel="noreferrer"
        >
          Bekijk de zes ACT-processen
        </a>
        <a
          style={styles.sourceLink}
          href="https://www.matrix.nhs.scot/explore-the-recommended-interventions-therapies/acceptance-and-commitment-therapy-act/"
          target="_blank"
          rel="noreferrer"
        >
          Bekijk het NHS-overzicht
        </a>
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    color: "#645bb5",
    backgroundColor: "#eeebff",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1.15px",
    padding: "7px 10px",
    margin: "0 0 10px",
  },
  versionPill: {
    display: "block",
    width: "fit-content",
    color: "#8a3f68",
    backgroundColor: "#fff0f6",
    border: "1px solid #f3cada",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
    padding: "6px 10px",
    marginBottom: "15px",
  },
  title: {
    color: "#262343",
    fontSize: "29px",
    fontWeight: 800,
    letterSpacing: "-0.8px",
    lineHeight: 1.2,
    margin: "0 0 16px",
  },
  intro: {
    color: "#66617f",
    fontSize: "16px",
    lineHeight: 1.58,
    margin: "0 0 26px",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    border: "1px solid rgba(210, 203, 238, 0.72)",
    borderRadius: "8px 22px 22px 22px",
    padding: "16px 17px",
    textAlign: "left",
    boxShadow: "0 8px 22px rgba(73, 62, 130, 0.07)",
  },
  videoCard: {
    overflow: "hidden",
    border: "1px solid rgba(210, 203, 238, 0.9)",
    borderRadius: "22px",
    backgroundColor: "#211e3a",
    boxShadow: "0 14px 30px rgba(45, 39, 91, 0.18)",
  },
  video: {
    display: "block",
    width: "100%",
    maxHeight: "420px",
    backgroundColor: "#211e3a",
  },
  videoHelpText: {
    color: "#716b82",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: "12px 2px 18px",
  },
  cardLabel: {
    display: "block",
    color: "#6961a9",
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "7px",
  },
  label: {
    display: "block",
    color: "#484265",
    fontSize: "14px",
    fontWeight: 800,
    margin: "18px 0 8px",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1.5px solid #d8d2eb",
    borderRadius: "17px",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    color: "#38334f",
    fontFamily: "\"Segoe UI\", \"Avenir Next\", Arial, sans-serif",
    fontSize: "16px",
    lineHeight: 1.55,
    padding: "15px 16px",
    resize: "vertical",
    outlineColor: "#6962d7",
  },
  primaryButton: {
    width: "100%",
    border: 0,
    borderRadius: "18px",
    background: "linear-gradient(135deg, #5657df 0%, #6f5ee7 100%)",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 800,
    padding: "16px 20px",
    cursor: "pointer",
    marginTop: "14px",
    boxShadow: "0 10px 24px rgba(82, 78, 205, 0.26)",
  },
  disabledButton: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  choiceButton: {
    width: "100%",
    border: "1.5px solid #dad4fa",
    borderRadius: "18px",
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    color: "#39345c",
    fontSize: "16px",
    fontWeight: 700,
    textAlign: "left",
    padding: "17px 19px",
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 7px 20px rgba(73, 62, 130, 0.08)",
  },
  selectedChoice: {
    border: "2px solid #5f59d5",
    backgroundColor: "#efecff",
    color: "#4740a5",
    padding: "16.5px 18.5px",
  },
  textButtonWide: {
    width: "100%",
    border: 0,
    background: "transparent",
    color: "#676188",
    fontWeight: 700,
    cursor: "pointer",
    padding: "14px",
    marginTop: "5px",
  },
  actionFocus: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    background: "linear-gradient(145deg, #eeeaff, #ffeef4)",
    border: "1px solid #ddd5f6",
    borderRadius: "19px",
    color: "#37315b",
    padding: "17px",
    marginBottom: "18px",
    lineHeight: 1.45,
  },
  exerciseStepCard: {
    marginBottom: "16px",
    padding: "18px",
    border: "1px solid #dfd9f3",
    borderRadius: "22px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    boxShadow: "0 8px 22px rgba(69, 59, 120, 0.07)",
  },
  exerciseStepHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  exerciseStepNumber: {
    width: "30px",
    height: "30px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    backgroundColor: "#e9e5ff",
    color: "#5b54c3",
    fontSize: "13px",
    fontWeight: 900,
  },
  exerciseStepTitle: {
    color: "#37315d",
    fontSize: "18px",
    lineHeight: 1.3,
    margin: "2px 0 5px",
  },
  exerciseStepText: {
    color: "#6e6885",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: 0,
  },
  infoBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    borderRadius: "17px",
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    border: "1px solid #e2ddef",
    color: "#716b82",
    fontSize: "12px",
    lineHeight: 1.5,
    padding: "13px",
  },
  infoText: {
    margin: 0,
  },
  exerciseCard: {
    background: "linear-gradient(150deg, #39336f, #6558bb)",
    color: "#ffffff",
    borderRadius: "24px",
    padding: "23px 20px",
    boxShadow: "0 14px 30px rgba(62, 51, 132, 0.2)",
  },
  exerciseLabel: {
    display: "block",
    color: "#d9d4ff",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.5px",
    marginBottom: "14px",
  },
  exerciseQuote: {
    fontSize: "18px",
    lineHeight: 1.65,
    margin: "0 0 15px",
  },
  exerciseNote: {
    color: "#e5e1ff",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: 0,
  },
  scientificBox: {
    border: "1px solid #cfc7ee",
    borderRadius: "20px",
    background: "linear-gradient(145deg, #f7f5ff, #eef4ff)",
    padding: "18px",
    marginBottom: "18px",
  },
  scientificEyebrow: {
    color: "#5e57a2",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.9px",
    margin: "0 0 8px",
  },
  scientificTitle: {
    color: "#36315d",
    fontSize: "18px",
    lineHeight: 1.3,
    margin: "0 0 10px",
  },
  scientificText: {
    color: "#615b79",
    fontSize: "14px",
    lineHeight: 1.58,
    margin: "0 0 13px",
  },
  sourceLinks: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  sourceLink: {
    color: "#5550ba",
    fontSize: "13px",
    fontWeight: 800,
  },
  scientificExerciseNote: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    borderLeft: "4px solid #625bd0",
    borderRadius: "8px 17px 17px 8px",
    backgroundColor: "#f2f0ff",
    color: "#5f5876",
    fontSize: "13px",
    lineHeight: 1.55,
    padding: "14px 15px",
    marginBottom: "16px",
  },
};
