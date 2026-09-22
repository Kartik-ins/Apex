import React, { useState } from 'react';
import { 
  Dumbbell, 
  Utensils, 
  Clock, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldCheck, 
  ChefHat,
  Sparkles
} from 'lucide-react';
import { CoachResponse } from '../types';

interface CoachResultProps {
  result: CoachResponse;
  onReset: () => void;
}

export const CoachResult: React.FC<CoachResultProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const { executive_summary, habit_analysis, meal_plan } = result;
  const { recovery_score, fatigue_status, workout, actionable_insights } = habit_analysis;

  const handleCopy = () => {
    const text = `APEX PERFORMANCE BRIEFING
${executive_summary}

RECOVERY METRICS
Score: ${recovery_score}/100 (${fatigue_status})
Prescription: ${workout.type} (${workout.duration_minutes}m, ${workout.intensity} Intensity)

HIGH-PROTEIN FUELING: ${meal_plan.recipe_name}
Protein: ${meal_plan.macros.protein_g}g | Carbs: ${meal_plan.macros.carbs_g}g | Fat: ${meal_plan.macros.fat_g}g | Calories: ${meal_plan.macros.calories_kcal} kcal
Prep: ${meal_plan.prep_time_minutes}m | Cook: ${meal_plan.cook_time_minutes}m`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (score >= 45) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getIntensityBadge = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'moderate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-800">Plan Generated Successfully</span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-500 font-medium">Precision AI Architecture</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-subtle"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-subtle"
          >
            <RotateCcw className="w-3 h-3 text-blue-100" />
            <span>New Diagnostic</span>
          </button>
        </div>
      </div>

      {/* Performance Briefing Callout */}
      <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Daily Performance Directive</span>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed font-sans font-medium">
          {executive_summary}
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recovery Score */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Recovery Score</span>
            <span className="text-2xl font-bold text-slate-900 mt-0.5 block">
              {recovery_score}
              <span className="text-xs text-slate-400 font-normal ml-0.5">/100</span>
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getScoreBadge(recovery_score)}`}>
            {fatigue_status}
          </span>
        </div>

        {/* Workout Intensity */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Workout Protocol</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">
              {workout.intensity} Intensity
            </span>
          </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getIntensityBadge(workout.intensity)}`}>
            {workout.duration_minutes} min
          </span>
        </div>

        {/* Protein Target */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 block">Meal Protein</span>
            <span className="text-base font-bold text-blue-600 mt-0.5 block">
              {meal_plan.macros.protein_g}g Protein
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {meal_plan.prep_time_minutes + meal_plan.cook_time_minutes}m total
          </span>
        </div>
      </div>

      {/* Grid: Workout Protocol & Recipe Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Workout Routine */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Training Routine</h3>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {workout.type}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {habit_analysis.readiness_summary}
          </p>

          {/* Actionable Insights */}
          {actionable_insights.length > 0 && (
            <div className="space-y-2 py-1">
              {actionable_insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          )}

          {/* Exercise Items List */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Prescribed Movements ({workout.exercises.length})
            </span>
            <div className="space-y-2.5">
              {workout.exercises.map((ex, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-subtle"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-900 text-sm">{ex.name}</span>
                    <span className="font-medium text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded text-xs">
                      {ex.sets} sets × {ex.reps}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-sans leading-relaxed">
                    <span className="font-medium text-slate-700">Form Cue:</span> {ex.cue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: High-Protein Recipe */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">{meal_plan.recipe_name}</h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{meal_plan.prep_time_minutes + meal_plan.cook_time_minutes}m total</span>
            </div>
          </div>

          {/* Recipe Macro Strip */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Protein</span>
              <span className="text-blue-600 font-bold text-sm mt-0.5 block">{meal_plan.macros.protein_g}g</span>
            </div>
            <div className="text-center border-l border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Carbs</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">{meal_plan.macros.carbs_g}g</span>
            </div>
            <div className="text-center border-l border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Fat</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">{meal_plan.macros.fat_g}g</span>
            </div>
            <div className="text-center border-l border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Calories</span>
              <span className="text-slate-900 font-bold text-sm mt-0.5 block">{meal_plan.macros.calories_kcal}</span>
            </div>
          </div>

          {/* Ingredients list */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Ingredients
            </span>
            <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
              {meal_plan.ingredients_used.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-medium">{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cooking Instructions */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Cooking Steps
            </span>
            <ol className="space-y-2 text-xs text-slate-700">
              {meal_plan.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Chef Tip */}
          {meal_plan.chef_tip && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs">
              <ChefHat className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block mb-0.5">Culinary Tip:</span>
                <span className="text-amber-800 leading-relaxed font-medium">
                  {meal_plan.chef_tip}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
