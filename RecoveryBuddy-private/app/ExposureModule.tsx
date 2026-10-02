"use client";

type Props = { onFinish: () => void; onBack: () => void };

export default function ExposureModule({ onFinish, onBack }: Props) {
  return (
    <div>
      <p style={styles.eyebrow}>OEFENEN · EXPOSURE</p>
      <h1 style={styles.title}>Een kleine stap richting wat belangrijk is</h1>
      <p style={styles.intro}>
        Bij exposure oefen je om een haalbare, veilige situatie niet automatisch
        te vermijden. Je blijft kort aanwezig en merkt op wat er gebeurt.
      </p>
      <ol style={styles.list}>
        <li>Kies een kleine situatie die je normaal uit de weg gaat.</li>
        <li>Blijf er kort bij en merk gedachten, gevoelens en lichaamssensaties op.</li>
        <li>Adem rustig door en laat de ervaring komen en gaan zonder jezelf te forceren.</li>
        <li>Stop of schaal af wanneer het niet passend of veilig voelt.</li>
      </ol>
      <p style={styles.note}>
        Exposure hoort afgestemd te worden op jouw situatie. Bespreek de opbouw
        met je behandelaar, zeker bij trauma, dissociatie of sterke ontregeling.
      </p>
      <button type="button" style={styles.primary} onClick={onFinish}>Oefening afronden</button>
      <button type="button" style={styles.secondary} onClick={onBack}>Terug</button>
    </div>
  );
}

const styles = {
  eyebrow: { fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", color: "#6550ab" },
  title: { fontSize: "28px", lineHeight: 1.15, color: "#302b45" },
  intro: { fontSize: "17px", lineHeight: 1.6, color: "#4c4660" },
  list: { paddingLeft: "22px", lineHeight: 1.7, color: "#302b45" },
  note: { padding: "14px", borderRadius: "12px", background: "#fff8e8", color: "#5d4b25", lineHeight: 1.5 },
  primary: { display: "block", marginTop: "20px", padding: "12px 18px", border: 0, borderRadius: "12px", background: "#6550ab", color: "white", font: "inherit", cursor: "pointer" },
  secondary: { display: "block", marginTop: "10px", padding: "10px 16px", border: "0", background: "transparent", color: "#6550ab", font: "inherit", cursor: "pointer" },
};
