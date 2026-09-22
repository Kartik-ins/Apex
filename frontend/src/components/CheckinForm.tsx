import React, { useState } from 'react';
import { 
  Sparkles, 
  Moon, 
  Flame, 
  BatteryCharging, 
  Clock, 
  Plus, 
  X, 
  Check, 
  RotateCcw,
  Target
} from 'lucide-react';
import { CheckinRequest, MacroGoals } from '../types';

interface CheckinFormProps {
  onSubmit: (data: CheckinRequest) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_STAPLES = [
  'chicken breast',
  'eggs',
  'paneer',
  'soya chunks',
  'curd (dahi)',
  'fish fillet',
  'moong dal',
  'palak (spinach)',
  'chickpeas (chole)',
  'besan (gram flour)',
  'basmati rice',
  'rolled oats',
  'sprouted moong',
  'ghee',
  'tomato & onion',
  'almonds',
];

const MACRO_PRESETS: { label: string; goals: MacroGoals }[] = [
  {
    label: 'High-Protein Omnivore',
    goals: { protein_g: 175, carbs_g: 160, fat_g: 50, calories_kcal: 1790 },
  },
  {
    label: 'High-Protein Vegetarian',
    goals: { protein_g: 140, carbs_g: 160, fat_g: 45, calories_kcal: 1605 },
  },
  {
    label: 'Strength & Hypertrophy',
    goals: { protein_g: 180, carbs_g: 220, fat_g: 60, calories_kcal: 2140 },
  },
  {
    label: 'Daily Balance & Energy',
    goals: { protein_g: 130, carbs_g: 180, fat_g: 50, calories_kcal: 1690 },
  },
];

const DIETARY_OPTIONS = [
  { id: 'omnivore', label: 'Omnivore (Non-Veg & Veg)' },
  { id: 'high-protein-veg', label: 'High-Protein Vegetarian' },
  { id: 'eggetarian', label: 'Eggetarian' },
  { id: 'lacto-vegetarian', label: 'Lacto-Vegetarian' },
  { id: 'satvik-clean', label: 'Satvik / No Onion-Garlic' },
  { id: 'vegan', label: '100% Plant-Based (Vegan)' },
];

export const CheckinForm: React.FC<CheckinFormProps> = ({ onSubmit, isLoading }) => {
  const [sleepHours, setSleepHours] = useState<number>(7.0);
  const [stressLevel, setStressLevel] = useState<number>(4);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [timeAvailable, setTimeAvailable] = useState<number>(30);
  const [dietaryPref, setDietaryPref] = useState<string>('high-protein-veg');
  const [macroGoals, setMacroGoals] = useState<MacroGoals>(MACRO_PRESETS[0].goals);
  const [pantryItems, setPantryItems] = useState<string[]>([
    'paneer',
    'moong dal',
    'palak (spinach)',
    'curd (dahi)',
    'basmati rice',
  ]);
  const [customItem, setCustomItem] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const togglePantryItem = (item: string) => {
    if (pantryItems.includes(item)) {
      setPantryItems(pantryItems.filter((i) => i !== item));
    } else {
      setPantryItems([...pantryItems, item]);
    }
  };

  const handleAddCustomItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customItem.trim().toLowerCase();
    if (trimmed && !pantryItems.includes(trimmed)) {
      setPantryItems([...pantryItems, trimmed]);
      setCustomItem('');
    }
  };

  const handlePrefillDemo = () => {
    setSleepHours(7.0);
    setStressLevel(4);
    setEnergyLevel(7);
    setTimeAvailable(30);
    setPantryItems(['paneer', 'moong dal', 'palak (spinach)', 'curd (dahi)', 'basmati rice', 'ghee']);
    setMacroGoals({ protein_g: 140, carbs_g: 160, fat_g: 45, calories_kcal: 1605 });
    setDietaryPref('high-protein-veg');
    setNotes('Focus on quick Indian vegetarian preparation with clean ingredients.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      sleep_hours: Number(sleepHours),
      stress_level: Number(stressLevel),
      energy_level: Number(energyLevel),
      time_available_minutes: Number(timeAvailable),
      pantry_items: pantryItems,
      macro_goals: macroGoals,
      dietary_preference: dietaryPref,
      notes: notes.trim() ? notes.trim() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Daily Diagnostic & Check-in
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Input current recovery biometrics and available ingredients to generate your training and meal plan.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrefillDemo}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors shadow-subtle"
        >
          <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
          <span>Prefill Sample Data</span>
        </button>
      </div>

      {/* Section 1: Physiological State */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center font-mono">
            01
          </span>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Recovery & Readiness
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sleep */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Moon className="w-4 h-4 text-blue-600" />
                Sleep Duration
              </span>
              <span className="font-semibold text-slate-900 text-sm">{sleepHours} hrs</span>
            </div>
            <input
              type="range"
              min="3"
              max="11"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2">
              <span>3h</span>
              <span className="text-blue-600 font-semibold">7-8h Optimal</span>
              <span>11h</span>
            </div>
          </div>

          {/* Stress */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Flame className="w-4 h-4 text-amber-500" />
                Stress Level
              </span>
              <span className="font-semibold text-slate-900 text-sm">{stressLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2">
              <span>1 Low</span>
              <span>5 Moderate</span>
              <span>10 High</span>
            </div>
          </div>

          {/* Energy */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <BatteryCharging className="w-4 h-4 text-emerald-600" />
                Energy Level
              </span>
              <span className="font-semibold text-slate-900 text-sm">{energyLevel} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-2">
              <span>1 Low</span>
              <span>5 Balanced</span>
              <span>10 Peak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Goals & Schedule */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center font-mono">
            02
          </span>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Schedule & Nutritional Targets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Workout Window */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-3">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              Workout Window
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 35, 45].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeAvailable(mins)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-all ${
                    timeAvailable === mins
                      ? 'bg-blue-600 text-white font-semibold border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Macro Presets */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card space-y-3">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              Nutritional Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MACRO_PRESETS.map((preset) => {
                const isSelected = macroGoals.protein_g === preset.goals.protein_g;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMacroGoals(preset.goals)}
                    className={`py-2 px-2 text-xs font-medium text-center rounded-lg border transition-all truncate ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed Macro Indicators */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-card">
          <div className="text-center">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">Protein</span>
            <span className="text-slate-900 font-bold text-base mt-0.5 block">{macroGoals.protein_g}g</span>
          </div>
          <div className="text-center border-l border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">Carbohydrates</span>
            <span className="text-slate-900 font-bold text-base mt-0.5 block">{macroGoals.carbs_g}g</span>
          </div>
          <div className="text-center border-l border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">Fat</span>
            <span className="text-slate-900 font-bold text-base mt-0.5 block">{macroGoals.fat_g}g</span>
          </div>
          <div className="text-center border-l border-slate-200">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">Daily Energy</span>
            <span className="text-blue-600 font-bold text-base mt-0.5 block">{macroGoals.calories_kcal} kcal</span>
          </div>
        </div>

        {/* Dietary Preference Selector */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-slate-700">
            Dietary Protocol
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDietaryPref(opt.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  dietaryPref === opt.id
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Available Pantry Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center font-mono">
              03
            </span>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Pantry Inventory
            </h3>
          </div>
          <span className="text-slate-500 text-xs font-medium">
            {pantryItems.length} ingredients selected
          </span>
        </div>

        {/* Quick staple pills */}
        <div className="flex flex-wrap gap-2">
          {DEFAULT_STAPLES.map((item) => {
            const isSelected = pantryItems.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => togglePantryItem(item)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-semibold shadow-subtle'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                <span className="capitalize">{item}</span>
              </button>
            );
          })}
        </div>

        {/* Custom pantry tag adder */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Add specific ingredient (e.g. chicken breast, eggs, paneer, soya chunks, moong dal)..."
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomItem();
              }
            }}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-subtle"
          />
          <button
            type="button"
            onClick={() => handleAddCustomItem()}
            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Add</span>
          </button>
        </div>

        {/* Selected custom chips */}
        {pantryItems.filter((i) => !DEFAULT_STAPLES.includes(i)).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {pantryItems
              .filter((i) => !DEFAULT_STAPLES.includes(i))
              .map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-medium"
                >
                  <span className="capitalize">{item}</span>
                  <button
                    type="button"
                    onClick={() => togglePantryItem(item)}
                    className="hover:text-rose-500 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Section 4: Context / Additional Notes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center font-mono">
            04
          </span>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            Schedule Context & Notes (Optional)
          </h3>
        </div>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Travel day tomorrow, focus on shoulder mobility, early client dinner..."
          className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none shadow-subtle font-sans"
        />
      </div>

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={isLoading || pantryItems.length === 0}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-card transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generating Personalized Plan...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Generate Performance Plan</span>
          </>
        )}
      </button>
    </form>
  );
};
