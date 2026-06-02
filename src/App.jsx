import { useMemo, useState } from "react";
import "./App.css";

const materials = [
  { name: "Thermo ECO", thickness: 0.129 },
  { name: "Thermo TOP", thickness: 0.140 },

  { name: "Papier", thickness: 0.125 },
  { name: "Papier lesklý", thickness: 0.140 },
  { name: "Papier pololesk", thickness: 0.123 },
  { name: "Inkjet papier", thickness: 0.148 },
  { name: "Kraftový papier", thickness: 0.160 },

  { name: "Polyetylén (PE)", thickness: 0.155 },
  { name: "LDPE", thickness: 0.155 },
  { name: "PVC", thickness: 0.158 },
  { name: "PVC Outdoor", thickness: 0.188 },

  { name: "Polypropylén", thickness: 0.125 },
  { name: "Polypropylén transparent", thickness: 0.119 },
  { name: "Polypropylén TOP", thickness: 0.148 },

  { name: "PET Void Blue", thickness: 0.126 },

  { name: "Etiketa záhradnícka", thickness: 0.145 },
  { name: "Etiketa záhradnícka zapichovacia", thickness: 0.250 },
];

function numberValue(value) {
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value, digits = 1) {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

function calculateDiameter(coreOuterDiameter, lengthMm, thickness) {
  if (coreOuterDiameter <= 0 || lengthMm <= 0 || thickness <= 0) return 0;

  return Math.sqrt(
    coreOuterDiameter ** 2 + (4 * thickness * lengthMm) / Math.PI
  );
}

function calculateMaxLabels(coreOuterDiameter, maxDiameter, step, thickness) {
  if (
    coreOuterDiameter <= 0 ||
    maxDiameter <= coreOuterDiameter ||
    step <= 0 ||
    thickness <= 0
  ) {
    return 0;
  }

  const lengthMm =
    (Math.PI * (maxDiameter ** 2 - coreOuterDiameter ** 2)) /
    (4 * thickness);

  return lengthMm / step;
}

export default function App() {
  const [mode, setMode] = useState("diameter");

  const [width, setWidth] = useState("100");
  const [length, setLength] = useState("150");
  const [gap, setGap] = useState("3");
  const [count, setCount] = useState("500");

  const [core, setCore] = useState("40");
  const [coreWall, setCoreWall] = useState("3.25");
  const [maxDiameter, setMaxDiameter] = useState("126");

  const [materialName, setMaterialName] = useState("Thermo ECO");

  // Predvolená rezerva je 3 %, ale používateľ ju môže ručne prepísať.
  const [reserve, setReserve] = useState("3");

  const selectedMaterial =
    materials.find((item) => item.name === materialName) || materials[0];

  const thickness = selectedMaterial.thickness;

  const result = useMemo(() => {
    const labelLength = numberValue(length);
    const labelGap = numberValue(gap);
    const labelCount = numberValue(count);

    const coreInnerDiameter = numberValue(core);
    const coreWallThickness = numberValue(coreWall);
    const coreOuterDiameter = coreInnerDiameter + coreWallThickness * 2;

    const maxRollDiameter = numberValue(maxDiameter);
    const reservePercent = numberValue(reserve);

    const step = labelLength + labelGap;

    if (mode === "diameter") {
      const totalLength = labelCount * step;

      const diameter = calculateDiameter(
        coreOuterDiameter,
        totalLength,
        thickness
      );

      const diameterWithReserve = diameter * (1 + reservePercent / 100);

      return {
        step,
        totalLength,
        totalLengthM: totalLength / 1000,
        diameter,
        diameterWithReserve,
        fits: diameterWithReserve <= maxRollDiameter,
        safeCount: 0,
        theoreticalCount: 0,
        coreOuterDiameter,
        reservePercent,
      };
    }

    const theoreticalCount = calculateMaxLabels(
      coreOuterDiameter,
      maxRollDiameter,
      step,
      thickness
    );

    const safeCount = theoreticalCount * (1 - reservePercent / 100);
    const totalLength = safeCount * step;

    return {
      step,
      totalLength,
      totalLengthM: totalLength / 1000,
      diameter: maxRollDiameter,
      diameterWithReserve: maxRollDiameter,
      fits: true,
      safeCount,
      theoreticalCount,
      coreOuterDiameter,
      reservePercent,
    };
  }, [
    mode,
    length,
    gap,
    count,
    core,
    coreWall,
    maxDiameter,
    reserve,
    thickness,
  ]);

  return (
    <main className="app">
      <section className="header">
        <p className="eyebrow">Kalkulačka roliek etikiet</p>
        <h1>Etiketka</h1>
        <p>
          Orientačný výpočet priemeru rolky alebo počtu etikiet podľa dutinky,
          materiálu, rozmeru etikety, medzery a počtu kusov.
        </p>
      </section>

      <section className="card">
        <div className="tabs">
          <button
            className={mode === "diameter" ? "active" : ""}
            onClick={() => setMode("diameter")}
          >
            Vypočítať priemer
          </button>

          <button
            className={mode === "count" ? "active" : ""}
            onClick={() => setMode("count")}
          >
            Koľko ks sa zmestí
          </button>
        </div>

        <div className="grid">
          <Field
            label="Šírka etikety"
            value={width}
            setValue={setWidth}
            unit="mm"
          />

          <Field
            label="Dĺžka etikety v smere návinu"
            value={length}
            setValue={setLength}
            unit="mm"
          />

          <Field
            label="Medzera medzi etiketami"
            value={gap}
            setValue={setGap}
            unit="mm"
          />

          {mode === "diameter" && (
            <Field
              label="Počet etikiet / radov na rolke"
              value={count}
              setValue={setCount}
              unit="ks"
            />
          )}

          <Field
            label="Vnútorný priemer dutinky"
            value={core}
            setValue={setCore}
            unit="mm"
          />

          <Field
            label="Hrúbka steny dutinky"
            value={coreWall}
            setValue={setCoreWall}
            unit="mm"
          />

          <Field
            label="Maximálny priemer rolky"
            value={maxDiameter}
            setValue={setMaxDiameter}
            unit="mm"
          />

          <div className="field">
            <label>Materiál</label>
            <select
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
            >
              {materials.map((material) => (
                <option key={material.name} value={material.name}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          <Field
            label="Bezpečnostná rezerva"
            value={reserve}
            setValue={setReserve}
            unit="%"
          />
        </div>
      </section>

      <section className="result">
        {mode === "diameter" ? (
          <>
            <div className="big">
              <span>Približný priemer rolky bez rezervy</span>
              <strong>{round(result.diameter, 1)} mm</strong>
            </div>

            <div className="big secondary">
              <span>Priemer s rezervou {round(result.reservePercent, 2)} %</span>
              <strong>{round(result.diameterWithReserve, 1)} mm</strong>
            </div>

            <div className={result.fits ? "status ok" : "status warning"}>
              {result.fits
                ? `Rolka by sa mala zmestiť do zadaného limitu aj s rezervou ${round(
                    result.reservePercent,
                    2
                  )} %.`
                : `Pozor, rolka môže byť nad zadaným limitom po započítaní rezervy ${round(
                    result.reservePercent,
                    2
                  )} %.`}
            </div>
          </>
        ) : (
          <>
            <div className="big">
              <span>Teoreticky sa zmestí</span>
              <strong>{Math.floor(result.theoreticalCount)} ks</strong>
            </div>

            <div className="big secondary">
              <span>Bezpečne odporúčané s rezervou {round(result.reservePercent, 2)} %</span>
              <strong>{Math.floor(result.safeCount)} ks</strong>
            </div>
          </>
        )}

        <div className="small-grid">
          <Info label="Krok etikety" value={`${round(result.step, 1)} mm`} />

          <Info
            label="Dĺžka návinu"
            value={`${round(result.totalLengthM, 2)} m`}
          />

          <Info label="Materiál" value={selectedMaterial.name} />

          <Info
            label="Vonkajší priemer dutinky"
            value={`${round(result.coreOuterDiameter, 1)} mm`}
          />
        </div>
      </section>

      <section className="note">
        Pozor: pri dutinke sa v produktoch často uvádza vnútorný priemer,
        napríklad 40 mm. Do výpočtu však vstupuje vonkajší priemer dutinky.
        Preto appka počíta: vnútorný priemer dutinky + 2 × hrúbka steny
        dutinky. Pri viacprodukcii si počet etikiet vydeľ počtom etikiet vedľa
        seba a do appky zadaj počet radov. Bezpečnostná rezerva je predvolená
        na 3 %, ale dá sa ručne upraviť.
      </section>
    </main>
  );
}

function Field({ label, value, setValue, unit }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="input-row">
        <input value={value} onChange={(e) => setValue(e.target.value)} />
        <span>{unit}</span>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}