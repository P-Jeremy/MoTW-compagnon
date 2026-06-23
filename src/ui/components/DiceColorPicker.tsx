import fr from '../../data/locales/fr.json';

const DICE_PRESET_COLORS = [
  { label: 'Rouge', value: '#c0392b' },
  { label: 'Bleu', value: '#2980b9' },
  { label: 'Vert', value: '#27ae60' },
  { label: 'Violet', value: '#8e44ad' },
  { label: 'Or', value: '#d4a017' },
  { label: 'Turquoise', value: '#16a085' },
  { label: 'Noir', value: '#2c2c2c' },
  { label: 'Rose', value: '#c0577d' },
];

interface DiceColorPickerProps {
  value: string | undefined;
  onChange: (color: string | undefined) => void;
}

export function DiceColorPicker({ value, onChange }: DiceColorPickerProps) {
  const isPreset = DICE_PRESET_COLORS.some((c) => c.value === value);
  const isCustom = !!value && !isPreset;

  return (
    <div className="max-w-md rounded-lg border border-stone-200 bg-white p-5 shadow-soft">
      <h2 className="text-base font-bold text-ink">{fr.preferences.diceColor}</h2>
      <p className="mt-1 text-sm text-stone-500">{fr.preferences.diceColorDescription}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
            !value
              ? 'border-ink shadow-md scale-110'
              : 'border-stone-300 text-stone-400 hover:border-stone-500'
          }`}
          title={fr.preferences.colorDefault}
        >
          —
        </button>
        {DICE_PRESET_COLORS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`h-10 w-10 rounded-full border-2 transition ${
              value === preset.value ? 'border-ink shadow-md scale-110' : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: preset.value }}
            title={preset.label}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-stone-700">{fr.preferences.colorCustom}</label>
        <input
          type="color"
          value={isCustom ? value : '#ffffff'}
          onChange={(e) => onChange(e.target.value)}
          className={`h-10 w-10 cursor-pointer rounded-full border-2 p-0.5 transition ${
            isCustom ? 'border-ink shadow-md' : 'border-stone-300 hover:border-stone-500'
          }`}
        />
        {value ? (
          <span className="font-mono text-xs text-stone-500">{value}</span>
        ) : null}
      </div>
    </div>
  );
}
