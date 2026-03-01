import { useState, useEffect, useCallback } from 'react';
import {
  Home, Utensils, Dumbbell, TrendingDown, Settings,
  CheckCircle, Plus, ChevronDown, ChevronUp, Flame,
  Scale, RefreshCw, X, Check, Info, Moon, Bell, BellOff, Droplets, Clock,
  Download, Smartphone, ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import {
  getNotificationSettings, saveNotificationSettings, requestPermission,
  startNotifications, stopNotifications, restartNotifications, sendTestNotification
} from './lib/notifications.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, ReferenceLine
} from 'recharts';

const COLORS = {
  bg: '#0d0f14',
  card: '#161b24',
  border: '#2a3142',
  accent: '#b8f400',
  teal: '#00c9a7',
  danger: '#ff6b6b',
  textPrimary: '#f0f4ff',
  textSecondary: '#8892a4',
};

const USER = {
  name: 'Ketan Bhoye',
  weight: 85.5,
  goal: 'Fat loss + Muscle Building',
  gymTime: '7:30 AM \u2013 8:30 AM',
  calories: 1750,
  protein: 140,
  carbs: 195,
  fat: 45,
  stepGoal: 10000,
  targetWeight: 75,
};

const TRAINING_SPLIT = {
  1: { type: 'A', label: 'Push Day (Workout A)', short: 'Push' },
  2: { type: 'B', label: 'Pull Day (Workout B)', short: 'Pull' },
  3: { type: 'C', label: 'Legs Day (Workout C)', short: 'Legs' },
  4: { type: 'A', label: 'Push Day (Workout A)', short: 'Push' },
  5: { type: 'B', label: 'Pull Day (Workout B)', short: 'Pull' },
  6: { type: 'C', label: 'Legs Day (Workout C)', short: 'Legs' },
  0: { type: 'REST', label: 'Rest Day \ud83d\udecf', short: 'Rest' },
};

const WORKOUTS = {
  A: {
    name: 'Push Day',
    exercises: [
      {
        name: 'Incline DB Press', sets: 3, reps: '6–12',
        notes: 'Think of bringing arms closer together, not pressing up',
        alt: 'Incline Barbell Press / Incline Smith Machine Press',
        form: 'Set bench to 30–45°. Grip slightly wider than shoulders. Lower dumbbells to upper chest level with elbows at 45° from torso. Press upward at a slight inward angle, squeezing chest at top. 3s down, 1s pause, 3s up.',
      },
      {
        name: 'DB Overhead Press', sets: 3, reps: '6–12',
        notes: 'Keep elbows under dumbbells throughout ROM',
        alt: 'Barbell Overhead Press / Seated Machine Shoulder Press',
        form: 'Sit upright or stand with core braced. Start with dumbbells at ear level, elbows at 90°. Press straight overhead until arms are fully extended. Don\'t lean back. Lower to ear level with control.',
      },
      {
        name: 'Dumbbell Press', sets: 3, reps: '6–12',
        notes: 'Arms 45–60° from torso',
        alt: 'Barbell Bench Press / Machine Chest Press',
        form: 'Lie flat on bench, feet planted firmly. Lower dumbbells to chest level keeping arms 45–60° from torso (not flared at 90°). Press up bringing dumbbells slightly together at top. Full stretch at bottom.',
      },
      {
        name: 'Cable Decline Crossover', sets: 3, reps: '6–12',
        notes: 'Targets lower chest fibers',
        alt: 'Decline DB Flyes / Decline DB Press / Dip Machine',
        form: 'Use high pulleys. Step forward into split stance with slight lean. Bring handles down and together in an arc to hip level, crossing slightly. Squeeze lower chest hard. Keep slight elbow bend throughout. Slow return.',
      },
      {
        name: 'Cable Side Raise', sets: 3, reps: '6–12',
        notes: 'Lower arm slowly; control the negative',
        alt: 'Dumbbell Lateral Raise / Machine Lateral Raise',
        form: 'Stand sideways to low cable pulley. Grab handle with far hand. Raise arm to shoulder height with 15° forward lean. Lead with elbow, pinky slightly higher than thumb. 2s up, 3s down. Don\'t swing.',
      },
      {
        name: 'Cross Body Tricep Pushdown', sets: 3, reps: '6–12',
        notes: 'Elbows in line with cable',
        alt: 'Rope Pushdown / Dumbbell Kickback / V-Bar Pushdown',
        form: 'Set cable at head height with single handle. Stand slightly to the side. Push handle across body and downward with one arm, elbow pinned to your side. Fully extend at bottom, squeeze tricep. 3s negative back up.',
      },
      {
        name: 'Overhead Tricep Extension', sets: 3, reps: '6–12',
        notes: 'Can do 1 hand at a time or with DB',
        alt: 'Skull Crushers (EZ Bar) / Dumbbell Overhead Extension / French Press',
        form: 'Face away from cable or hold dumbbell overhead. Upper arms close to ears and stationary. Hinge at elbows only, lowering weight behind head to 90° elbow angle. Extend fully overhead. Keep core tight to avoid arching.',
      },
      {
        name: 'AB Crunches', sets: 3, reps: '6–12',
        notes: 'Curl your spine, don\'t just sit up',
        alt: 'Cable Crunch / Hanging Knee Raise / Ab Roller',
        form: 'Lie face up, knees bent 90°, feet flat. Place hands across chest (not behind neck). Curl upper spine lifting shoulders off floor — think "ribs to pelvis". Hold top 1s, slow lower. Don\'t pull neck or use hip flexors.',
      },
    ],
  },
  B: {
    name: 'Pull Day',
    exercises: [
      {
        name: 'Neutral Grip Lat Pulldown', sets: 3, reps: '6–12',
        notes: 'Use pronated grip on straight bar if unavailable',
        alt: 'Wide Grip Lat Pulldown / Pull-ups / Band Assisted Pull-ups',
        form: 'Use neutral (palms facing) grip handle. Sit with thighs snug under pad. Lean back 10–15°. Pull bar to upper chest driving elbows down and back. Squeeze lats hard at bottom for 1s. Control return — don\'t let weight yank arms up.',
      },
      {
        name: 'Reverse Pec Deck', sets: 3, reps: '6–12',
        notes: 'Squeeze rear delts at full contraction',
        alt: 'Face Pulls (rope) / Bent-Over Dumbbell Reverse Flyes',
        form: 'Sit facing the pad, chest against it. Grip handles at shoulder height with arms nearly straight (slight elbow bend). Pull handles back in an arc squeezing rear delts. Hold 1s at peak contraction. 3s negative return.',
      },
      {
        name: 'Cable Row', sets: 3, reps: '6–12',
        notes: 'Pull elbows close to torso for lats',
        alt: 'Seated Machine Row / Single-Arm Dumbbell Row / Barbell Bent-Over Row',
        form: 'Sit upright with feet on platform, slight knee bend. Pull handle to lower chest / upper abs. Drive elbows straight back, close to body. Squeeze shoulder blades together at end. Return with control — don\'t round forward.',
      },
      {
        name: 'Wide Grip Rows', sets: 3, reps: '6–12',
        notes: 'Arms at 45° to torso — targets mid-back',
        alt: 'T-Bar Row / Wide Grip Dumbbell Row / Chest-Supported Row',
        form: 'Use wide grip handle on cable or wide grip barbell. Pull to mid-chest with elbows flared at 45° from torso. Focus on squeezing mid-back and rear delts. Keep chest up, avoid rounding lower back.',
      },
      {
        name: 'Hammer Curl', sets: 3, reps: '6–12',
        notes: 'Don\'t swing arms inward',
        alt: 'Cross-Body Hammer Curl / Rope Cable Curl / Reverse Curl',
        form: 'Stand with dumbbells at sides, palms facing each other (neutral grip). Curl weight up keeping wrist neutral throughout — don\'t rotate. Elbows stay pinned at sides, no swinging body. Squeeze bicep/brachialis at top. 3s negative.',
      },
      {
        name: 'Supported Bicep Curl', sets: 3, reps: '6–12',
        notes: 'Slight tension on biceps at start',
        alt: 'Preacher Curl Machine / Incline Dumbbell Curl / Spider Curl',
        form: 'Use preacher bench or incline bench to support arms. Start with slight tension on bicep (don\'t fully extend / hyperextend elbow). Curl up squeezing bicep hard at top. Slow 3-second negative. Keep upper arm stationary on pad.',
      },
      {
        name: 'BB Shrugs', sets: 3, reps: '6–12',
        notes: 'Lean forward, squeeze shoulder blades, 1.5x shoulder-width grip',
        alt: 'Dumbbell Shrugs / Smith Machine Shrugs / Trap Bar Shrugs',
        form: 'Grip barbell at 1.5× shoulder width. Lean forward slightly (15°) for better trap activation. Shrug shoulders straight up toward ears — don\'t roll. Squeeze traps at top for 2 seconds. 3s controlled lower.',
      },
      {
        name: 'Spinal Extension', sets: 3, reps: '6–12',
        notes: 'Strengthens spinal erectors',
        alt: 'Hyperextension (Roman Chair) / Superman (Floor) / Reverse Hyper',
        form: 'On hyperextension bench, cross arms at chest. Hinge at hips lowering torso toward floor. Extend back up to neutral spine position — don\'t hyperextend past neutral. Slow and controlled, squeeze lower back at top.',
      },
      {
        name: 'Wrist Flexions + Extensions', sets: 3, reps: '6–12',
        notes: 'Both directions for balanced forearms',
        alt: 'Wrist Roller / Grip Squeezer / Farmer\'s Walk',
        form: 'Rest forearms on bench, wrists hanging off edge. Flexion: palms up, curl weight up. Extension: palms down, lift weight up. Full range of motion each rep. Hold top for 2 seconds. Light weight, high quality reps.',
      },
    ],
  },
  C: {
    name: 'Legs Day',
    exercises: [
      {
        name: 'Smith Machine Squats', sets: 3, reps: '6–12',
        notes: 'Feet slightly forward for quad emphasis',
        alt: 'Barbell Back Squat / Goblet Squat / Hack Squat Machine',
        form: 'Position bar on upper traps. Feet shoulder-width, slightly forward of bar, toes turned out 15–30°. Squat to parallel or below keeping chest up. Drive through full foot (heel emphasis). Knees track over toes — don\'t cave inward.',
      },
      {
        name: 'Leg Extension', sets: 3, reps: '6–12',
        notes: 'Knee pointing straight up',
        alt: 'Sissy Squat / Bulgarian Split Squat (quad focus) / Front Squat',
        form: 'Sit with back flush against pad, ankles behind lower roller. Adjust pad so pivot aligns with knee joint. Extend legs fully, squeeze quads hard at top for 1s. Lower slowly (3s negative). Keep toes pointing straight up.',
      },
      {
        name: 'Seated Leg Curl', sets: 3, reps: '6–12',
        notes: 'Stabilize legs, focus on hamstring',
        alt: 'Lying Leg Curl / Nordic Hamstring Curl / Swiss Ball Hamstring Curl',
        form: 'Sit with pad behind ankles, thigh pad snug above knees (prevents hips rising). Curl weight down and under, squeezing hamstrings at full contraction. 1s hold. Slow release back up (3s). Keep hips stable throughout.',
      },
      {
        name: 'Leg Press', sets: 3, reps: '6–12',
        notes: 'Don\'t hyperextend knees at top',
        alt: 'Hack Squat Machine / Front Squat / Belt Squat',
        form: 'Sit at 45° leg press. Feet shoulder-width apart in middle of platform. Press up to near-lockout (don\'t fully lock / hyperextend knees). Lower until knees reach 90°. Keep lower back pressed into pad throughout. Full foot contact.',
      },
      {
        name: 'Romanian Deadlift', sets: 3, reps: '6–12',
        notes: 'Don\'t round the back',
        alt: 'Stiff-Leg Deadlift / Cable Pull-Through / Dumbbell RDL / Good Morning',
        form: 'Stand with barbell/dumbbells at hips, slight knee bend (15–20°). Hinge at hips pushing butt straight back, lower weight along legs. Stop when you feel max hamstring stretch (mid-shin). Drive hips forward to stand. Back stays flat throughout.',
      },
      {
        name: 'Standing Calf Raise', sets: 3, reps: '6–12',
        notes: 'No bouncing at bottom',
        alt: 'Seated Calf Raise / Leg Press Calf Raise / Single-Leg Calf Raise',
        form: 'Stand on edge of platform with balls of feet on edge. Rise up on toes fully, squeeze calves hard at top for 2s. Lower slowly below platform level to full stretch (3s). No bouncing — pause at bottom. Straight knees throughout.',
      },
    ],
  },
};

const MEALS = [
  {
    id: 'meal1',
    name: 'Pre-Workout',
    time: '6:45 AM',
    calories: 370,
    protein: 30,
    carbs: 38,
    fat: 13,
    items: [
      '1 scoop Whey Protein (25g) in 300ml water',
      '1 large banana (100g)',
      '1 date (8g)',
      '10 almonds (15g)',
      '4 walnut halves (8g)',
    ],
    swaps: [
      'Whey swap: 150g Greek yoghurt (low-fat)',
      'Replace dates with 1 dried fig',
      'Can use 2 elaichi bananas instead of 1 large',
      'Have items separately or blend as smoothie',
    ],
    goal: 'Fast fuel + protein hit before training (Scoop 1 of 2)',
  },
  {
    id: 'meal2',
    name: 'Post-Workout Breakfast',
    time: '9:00 AM',
    calories: 430,
    protein: 42,
    carbs: 52,
    fat: 7,
    items: [
      '1 scoop Whey Protein (25g) in 300ml water',
      'MuscleBlaze High Protein Muesli (50g) with 100ml low-fat milk',
      'Fruit: 100g pineapple or seasonal fruit',
      'Supplements: Vit D3+K2 (1 tab) + Multivitamins (1 tab)',
    ],
    swaps: [
      'Muesli swap: 60g oatmeal, 60g poha, 4 small idlis',
      'Whey swap: 1 whole egg + 4 egg whites, or 100g paneer',
      'Fruit swap: Papaya, kiwi, guava, orange, berries',
      'Milk swap: 100ml soy milk or almond milk',
    ],
    goal: 'Muscle protein synthesis + glycogen refill (Scoop 2 of 2)',
  },
  {
    id: 'meal3',
    name: 'Lunch',
    time: '1:00 PM',
    calories: 540,
    protein: 38,
    carbs: 62,
    fat: 15,
    items: [
      'Chicken Fried Rice: 60g white rice (raw) + 100g skinless chicken breast (raw)',
      'Veggies: 50g tomato + 50g carrot + 50g capsicum',
      'Salad: 25g cucumber + 25g carrot',
      '\u00bd cup yoghurt (80g)',
    ],
    swaps: [
      'Protein swap: 100g fish/prawns, 1 whole + 4 egg whites, 100g paneer/tofu',
      'Rice swap: 3 medium rotis (preferred: gluten-free flour)',
      'Recipe swap: Chicken Curry, Stir Fry, Korma, Kadai Chicken',
      'Salad swap: Stir-fried or sautéed low-FODMAP vegetables',
    ],
    goal: 'Main meal — balanced macros for sustained energy',
  },
  {
    id: 'meal4',
    name: 'Dinner',
    time: '7:30 PM',
    calories: 410,
    protein: 30,
    carbs: 43,
    fat: 10,
    items: [
      'Egg Curry Rice: 1 whole egg + 4 egg whites',
      '60g white rice (raw) + 100g tomato + 50g capsicum + 50g french beans',
      'Supplement: Creatine 3g — mix well in water',
    ],
    swaps: [
      'Protein swap: 100g chicken, 100g fish, 100g paneer/tofu',
      'Rice swap: 3 medium rotis',
      'Recipe swap: Egg Bhurji Rice, Palak Egg Rice, Lemon Rice + Eggs on side',
    ],
    goal: 'Evening recovery — high protein, moderate carbs',
  },
];
// Daily totals: ~1750 kcal | ~140g protein | ~195g carbs | ~45g fat
// Whey: 2 scoops/day (Meal 1 + Meal 2)
// MuscleBlaze High Protein Muesli: Meal 2 (Post-Workout Breakfast)

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getWeekKey = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const formatDate = (date = new Date()) =>
  date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const getDayName = (date = new Date()) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

const getTodayWorkout = (date = new Date()) => TRAINING_SPLIT[date.getDay()];

const useStorage = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const stored = window.storage?.get(key);
    return stored !== null && stored !== undefined ? stored : defaultValue;
  });
  const setStoredState = useCallback((value) => {
    setState(prev => {
      const newVal = typeof value === 'function' ? value(prev) : value;
      window.storage?.set(key, newVal);
      return newVal;
    });
  }, [key]);
  return [state, setStoredState];
};

const Card = ({ children, className = '', style = {} }) => (
  <div className={`rounded-xl border p-4 ${className}`}
    style={{ backgroundColor: COLORS.card, borderColor: COLORS.border, ...style }}>
    {children}
  </div>
);

const ProgressBar = ({ value, max, color = COLORS.accent, height = 6 }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="rounded-full overflow-hidden" style={{ height, backgroundColor: '#1e2535' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
};

const MacroBar = ({ label, value, max, color }) => (
  <div className="flex-1">
    <div className="flex justify-between text-xs mb-1" style={{ color: COLORS.textSecondary }}>
      <span>{label}</span>
      <span style={{ color: COLORS.textPrimary }}>{Math.round(value)}g</span>
    </div>
    <ProgressBar value={value} max={max} color={color} />
  </div>
);

const TodayTab = ({ setActiveTab, todayMeals, steps, setSteps, settings }) => {
  const today = new Date();
  const workout = getTodayWorkout(today);
  const dateKey = getDateKey(today);
  const [stepsInput, setStepsInput] = useState('');

  const caloriesEaten = MEALS.reduce((acc, m) => acc + (todayMeals[m.id] ? m.calories : 0), 0);
  const proteinEaten = MEALS.reduce((acc, m) => acc + (todayMeals[m.id] ? m.protein : 0), 0);
  const carbsEaten = MEALS.reduce((acc, m) => acc + (todayMeals[m.id] ? m.carbs : 0), 0);
  const fatEaten = MEALS.reduce((acc, m) => acc + (todayMeals[m.id] ? m.fat : 0), 0);

  const calTarget = settings.calorieGoal || USER.calories;
  const stepGoal = settings.stepGoal || USER.stepGoal;
  const stepsWalked = steps[dateKey] || 0;
  const stepsPct = Math.min((stepsWalked / stepGoal) * 100, 100);

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const handleLogSteps = () => {
    const n = parseInt(stepsInput, 10);
    if (!isNaN(n) && n >= 0) {
      setSteps(prev => ({ ...prev, [dateKey]: n }));
      setStepsInput('');
    }
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div>
        <h1 className="text-3xl font-bold"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", color: COLORS.accent }}>
          {greeting}, {USER.name.split(' ')[0]} 💪
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.textSecondary }}>{formatDate(today)}</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider mb-1" style={{ color: COLORS.textSecondary }}>Today's Workout</p>
            <p className="text-xl font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: COLORS.textPrimary }}>
              {getDayName(today)} → {workout.label}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${COLORS.accent}20` }}>
            {workout.type === 'REST' ? '\ud83d\udecf' : '\ud83c\udfcb\ufe0f'}
          </div>
        </div>
        {workout.type !== 'REST' && (
          <button onClick={() => setActiveTab('workout')}
            className="w-full py-2 rounded-2xl text-sm font-semibold"
            style={{ backgroundColor: COLORS.accent, color: '#0d0f14' }}>
            Log Workout →
          </button>
        )}
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Calories Today</p>
          <div className="text-right">
            <span className="text-2xl font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: COLORS.accent }}>{caloriesEaten}</span>
            <span className="text-sm ml-1" style={{ color: COLORS.textSecondary }}>/ {calTarget} kcal</span>
          </div>
        </div>
        <ProgressBar value={caloriesEaten} max={calTarget} height={10} />
        <div className="flex gap-3 mt-4">
          <MacroBar label="Protein" value={proteinEaten} max={USER.protein} color={COLORS.teal} />
          <MacroBar label="Carbs" value={carbsEaten} max={USER.carbs} color={COLORS.accent} />
          <MacroBar label="Fat" value={fatEaten} max={USER.fat} color={COLORS.danger} />
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-3">
          <p className="font-semibold"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Steps Today</p>
          <div className="text-right">
            <span className="text-2xl font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif",
                color: stepsWalked >= stepGoal ? COLORS.accent : COLORS.textPrimary }}>
              {stepsWalked.toLocaleString()}
            </span>
            <span className="text-sm ml-1" style={{ color: COLORS.textSecondary }}>/ {stepGoal.toLocaleString()}</span>
          </div>
        </div>
        <ProgressBar value={stepsWalked} max={stepGoal}
          color={stepsPct >= 100 ? COLORS.accent : stepsPct >= 70 ? '#f59e0b' : COLORS.danger} height={10} />
        {stepsWalked >= stepGoal && (
          <p className="text-sm mt-2 font-semibold" style={{ color: COLORS.accent }}>\ud83c\udf89 Step goal reached!</p>
        )}
        <div className="flex gap-2 mt-3">
          <input type="number" placeholder="Enter steps..."
            value={stepsInput} onChange={e => setStepsInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#1e2535', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} />
          <button onClick={handleLogSteps}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: COLORS.accent, color: '#0d0f14' }}>Log</button>
        </div>
      </Card>

      <Card>
        <p className="font-semibold mb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Meals Logged</p>
        <div className="grid grid-cols-2 gap-2">
          {MEALS.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{
                backgroundColor: todayMeals[m.id] ? `${COLORS.accent}15` : '#1e2535',
                border: `1px solid ${todayMeals[m.id] ? COLORS.accent : COLORS.border}`,
              }}>
              {todayMeals[m.id]
                ? <CheckCircle size={14} color={COLORS.accent} />
                : <div className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: COLORS.border }} />}
              <span className="text-xs"
                style={{ color: todayMeals[m.id] ? COLORS.textPrimary : COLORS.textSecondary }}>{m.name}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setActiveTab('meals')}
          className="w-full mt-3 py-2 rounded-xl text-sm font-semibold border"
          style={{ borderColor: COLORS.border, color: COLORS.textSecondary, backgroundColor: 'transparent' }}>
          Log Meals →
        </button>
      </Card>
    </div>
  );
};

const MealCard = ({ meal, isLogged, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const [showSwaps, setShowSwaps] = useState(false);

  return (
    <div className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        backgroundColor: COLORS.card,
        borderColor: isLogged ? COLORS.accent : COLORS.border,
        boxShadow: isLogged ? `0 0 12px ${COLORS.accent}30` : 'none',
      }}>
      <div className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ backgroundColor: `${COLORS.accent}20`, color: COLORS.accent,
              fontFamily: "'Barlow Condensed', sans-serif" }}>
            {meal.calories}
          </div>
          <div>
            <p className="font-semibold text-sm">{meal.name}</p>
            <p className="text-xs" style={{ color: COLORS.textSecondary }}>{meal.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp size={16} color={COLORS.textSecondary} /> : <ChevronDown size={16} color={COLORS.textSecondary} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex gap-3 text-xs p-2 rounded-lg" style={{ backgroundColor: '#1e2535' }}>
            <span style={{ color: COLORS.teal }}>P: {meal.protein}g</span>
            <span style={{ color: COLORS.accent }}>C: {meal.carbs}g</span>
            <span style={{ color: COLORS.danger }}>F: {meal.fat}g</span>
            <span style={{ color: COLORS.textSecondary }}>{meal.calories} kcal</span>
          </div>
          <ul className="space-y-1">
            {meal.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span style={{ color: COLORS.accent }}>•</span>
                <span style={{ color: COLORS.textSecondary }}>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs italic px-2 py-1 rounded"
            style={{ color: COLORS.teal, backgroundColor: `${COLORS.teal}10` }}>
            🎯 {meal.goal}
          </p>
          <button onClick={(e) => { e.stopPropagation(); setShowSwaps(!showSwaps); }}
            className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border"
            style={{ borderColor: COLORS.border, color: COLORS.textSecondary, backgroundColor: 'transparent' }}>
            <RefreshCw size={12} />
            {showSwaps ? 'Hide' : 'Show'} Swap Options
          </button>
          {showSwaps && (
            <div className="space-y-1 p-3 rounded-lg" style={{ backgroundColor: '#1e2535' }}>
              {meal.swaps.map((swap, i) => (
                <p key={i} className="text-xs" style={{ color: COLORS.textSecondary }}>\u21d4 {swap}</p>
              ))}
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="w-full py-2 rounded-xl text-sm font-semibold"
            style={{
              backgroundColor: isLogged ? `${COLORS.accent}20` : COLORS.accent,
              color: isLogged ? COLORS.accent : '#0d0f14',
              border: isLogged ? `1px solid ${COLORS.accent}` : 'none',
            }}>
            {isLogged ? '\u2705 Meal Logged' : 'Mark as Eaten'}
          </button>
        </div>
      )}
    </div>
  );
};

const MealsTab = ({ todayMeals, setTodayMeals }) => {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const totalCal = MEALS.reduce((a, m) => a + (todayMeals[m.id] ? m.calories : 0), 0);
  const toggleMeal = (mealId) => {
    setTodayMeals(prev => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold"
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Meal Plan</h2>
        <div className="text-right">
          <span className="text-lg font-bold"
            style={{ color: COLORS.accent, fontFamily: "'Barlow Condensed', sans-serif" }}>{totalCal}</span>
          <span className="text-xs ml-1" style={{ color: COLORS.textSecondary }}>/ {USER.calories} kcal</span>
        </div>
      </div>
      <ProgressBar value={totalCal} max={USER.calories} height={8} />
      {MEALS.map((meal) => (
        <MealCard key={meal.id} meal={meal}
          isLogged={!!todayMeals[meal.id]} onToggle={() => toggleMeal(meal.id)} />
      ))}
      <Card>
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
          🍳 <strong style={{ color: COLORS.textPrimary }}>Daily Cooking Oil:</strong> Up to 15ml Extra Virgin Olive Oil across all meals
        </p>
      </Card>
      <div className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
        <button className="w-full flex items-center justify-between p-4"
          onClick={() => setShowGuidelines(!showGuidelines)}>
          <div className="flex items-center gap-2">
            <Info size={16} color={COLORS.teal} />
            <span className="font-semibold text-sm">Nutrition Guidelines</span>
          </div>
          {showGuidelines ? <ChevronUp size={16} color={COLORS.textSecondary} /> : <ChevronDown size={16} color={COLORS.textSecondary} />}
        </button>
        {showGuidelines && (
          <div className="px-4 pb-4 space-y-2">
            {[
              '\ud83d\udca7 Drink 3\u20134 litres of water daily',
              '\ud83e\uddc2 Use only: Salt, Pepper, Turmeric, Lemon as condiments',
              '\ud83d\udc1f Eat fish (salmon, sardines, mackerel) 3x/week for Omega-3',
              '\ud83d\udeab Avoid smoking, alcohol, recreational drugs',
              '\ud83e\udd57 Low FODMAP veggies: cucumbers, carrots, lettuce, tomatoes, okra, spinach, bell peppers',
            ].map((tip, i) => (
              <p key={i} className="text-sm" style={{ color: COLORS.textSecondary }}>{tip}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WorkoutLogger = ({ workout, dateKey, workoutLog, setWorkoutLog }) => {
  const getInitialSets = (exercise) => {
    const allKeys = window.storage?.keys() || [];
    const prevLogs = allKeys
      .filter(k => k.startsWith('workout:') && k !== `workout:${dateKey}`)
      .map(k => window.storage.get(k))
      .filter(Boolean)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const prevLog = prevLogs.find(l => l.workoutType === workout.type);
    if (prevLog) {
      const prevEx = prevLog.exercises?.find(e => e.name === exercise.name);
      if (prevEx?.sets?.length) {
        return prevEx.sets.map((s, i) => ({ setNum: i + 1, weight: s.weight || '', reps: s.reps || '', done: false }));
      }
    }
    return Array.from({ length: exercise.sets }, (_, i) => ({ setNum: i + 1, weight: '', reps: '', done: false }));
  };

  const [exercises, setExercises] = useState(() =>
    workout.exercises.map(ex => ({ name: ex.name, notes: ex.notes, alt: ex.alt, form: ex.form, sets: getInitialSets(ex) }))
  );
  const [cardio, setCardio] = useState(workoutLog?.cardio || false);
  const [cardioNotes, setCardioNotes] = useState(workoutLog?.cardioNotes || '');
  const [saved, setSaved] = useState(false);
  const [expandedForm, setExpandedForm] = useState({});

  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises(prev => {
      const next = prev.map((ex, i) => i !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: value })
      });
      return next;
    });
  };

  const addSet = (exIdx) => {
    setExercises(prev => prev.map((ex, i) => i !== exIdx ? ex : {
      ...ex,
      sets: [...ex.sets, { setNum: ex.sets.length + 1, weight: '', reps: '', done: false }]
    }));
  };

  const checkPB = (exName, weight) => {
    const allKeys = window.storage?.keys() || [];
    for (const k of allKeys.filter(k => k.startsWith('workout:') && k !== `workout:${dateKey}`)) {
      const log = window.storage.get(k);
      const ex = log?.exercises?.find(e => e.name === exName);
      if (ex) {
        const maxW = Math.max(...(ex.sets || []).map(s => parseFloat(s.weight) || 0));
        if (maxW > 0 && parseFloat(weight) > maxW) return true;
      }
    }
    return false;
  };

  const handleSave = () => {
    const log = { date: dateKey, workoutType: workout.type, exercises, cardio, cardioNotes };
    setWorkoutLog(log);
    window.storage?.set(`workout:${dateKey}`, log);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {exercises.map((ex, exIdx) => {
        const hasPB = ex.sets.some(s => s.done && s.weight && checkPB(ex.name, s.weight));
        return (
          <Card key={ex.name}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm">{ex.name}</p>
              {hasPB && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: `${COLORS.accent}20`, color: COLORS.accent }}>
                  🏆 PB!
                </span>
              )}
            </div>
            {ex.notes && (
              <p className="text-xs mb-2 italic" style={{ color: COLORS.textSecondary }}>{ex.notes}</p>
            )}
            {/* Alternative exercise */}
            {ex.alt && (
              <div className="mb-2 px-2 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#1e2535' }}>
                <span style={{ color: COLORS.teal }}>↔ Alt:</span>{' '}
                <span style={{ color: COLORS.textSecondary }}>{ex.alt}</span>
              </div>
            )}
            {/* Form & technique toggle */}
            {ex.form && (
              <button
                onClick={() => setExpandedForm(prev => ({ ...prev, [ex.name]: !prev[ex.name] }))}
                className="mb-3 flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                style={{ backgroundColor: expandedForm[ex.name] ? `${COLORS.teal}15` : '#1e2535', color: COLORS.teal }}>
                <Info size={11} /> {expandedForm[ex.name] ? 'Hide' : 'Show'} Form Guide
              </button>
            )}
            {expandedForm[ex.name] && ex.form && (
              <div className="mb-3 px-3 py-2 rounded-lg text-xs leading-relaxed"
                style={{ backgroundColor: `${COLORS.teal}08`, border: `1px solid ${COLORS.teal}30`, color: COLORS.textSecondary }}>
                <span style={{ color: COLORS.teal, fontWeight: 600 }}>📐 Form:</span> {ex.form}
              </div>
            )}
            <div className="grid grid-cols-4 gap-2 text-xs mb-1" style={{ color: COLORS.textSecondary }}>
              <span>Set</span><span>Weight</span><span>Reps</span><span>Done</span>
            </div>
            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} className="grid grid-cols-4 gap-2 items-center p-2 rounded-lg mb-1 transition-all duration-200"
                style={{ backgroundColor: set.done ? `${COLORS.accent}10` : '#1e2535', opacity: set.done ? 0.8 : 1 }}>
                <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>#{set.setNum}</span>
                <input type="number" placeholder="0" value={set.weight}
                  onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                  className="w-full px-2 py-1 rounded text-sm text-center outline-none"
                  style={{ backgroundColor: '#0d0f14', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} />
                <input type="number" placeholder="0" value={set.reps}
                  onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                  className="w-full px-2 py-1 rounded text-sm text-center outline-none"
                  style={{ backgroundColor: '#0d0f14', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} />
                <button onClick={() => updateSet(exIdx, setIdx, 'done', !set.done)}
                  className="flex items-center justify-center w-8 h-8 rounded-lg mx-auto transition-all duration-200"
                  style={{ backgroundColor: set.done ? COLORS.accent : '#1e2535', border: `1px solid ${set.done ? COLORS.accent : COLORS.border}` }}>
                  {set.done ? <Check size={14} color="#0d0f14" /> : null}
                </button>
              </div>
            ))}
            <button onClick={() => addSet(exIdx)}
              className="mt-2 flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg"
              style={{ color: COLORS.textSecondary, backgroundColor: '#1e2535' }}>
              <Plus size={12} /> Add Set
            </button>
          </Card>
        );
      })}

      <Card>
        <p className="font-semibold mb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Cardio Log</p>
        <button onClick={() => setCardio(!cardio)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-3"
          style={{ backgroundColor: cardio ? `${COLORS.accent}20` : '#1e2535',
            border: `1px solid ${cardio ? COLORS.accent : COLORS.border}`,
            color: cardio ? COLORS.accent : COLORS.textSecondary }}>
          {cardio ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 rounded-full border" style={{ borderColor: COLORS.border }} />}
          30-min Jog / Cardio
        </button>
        <input type="text" placeholder="Optional notes..."
          value={cardioNotes} onChange={e => setCardioNotes(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ backgroundColor: '#1e2535', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} />
      </Card>

      <button onClick={handleSave}
        className="w-full py-3 rounded-2xl text-base font-bold"
        style={{ backgroundColor: saved ? COLORS.teal : COLORS.accent, color: '#0d0f14',
          fontFamily: "'Barlow Condensed', sans-serif" }}>
        {saved ? '\u2705 Workout Saved!' : 'Save Workout'}
      </button>
    </div>
  );
};

const WorkoutHistory = ({ dateKey }) => {
  const [expandedDate, setExpandedDate] = useState(null);
  const allKeys = window.storage?.keys() || [];
  const history = allKeys
    .filter(k => k.startsWith('workout:') && k !== `workout:${dateKey}`)
    .map(k => ({ key: k, date: k.replace('workout:', ''), ...window.storage.get(k) }))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  if (history.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold"
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Recent Sessions</h3>
      {history.map((session) => (
        <div key={session.date} className="rounded-xl border overflow-hidden cursor-pointer"
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}
          onClick={() => setExpandedDate(expandedDate === session.date ? null : session.date)}>
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-semibold">{session.date}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                Workout {session.workoutType} \u2014 {WORKOUTS[session.workoutType]?.name || 'Rest'}
              </p>
            </div>
            {expandedDate === session.date
              ? <ChevronUp size={14} color={COLORS.textSecondary} />
              : <ChevronDown size={14} color={COLORS.textSecondary} />}
          </div>
          {expandedDate === session.date && (
            <div className="px-3 pb-3 space-y-2">
              {session.exercises?.map((ex) => (
                <div key={ex.name} className="text-xs">
                  <p className="font-medium mb-1" style={{ color: COLORS.textPrimary }}>{ex.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {ex.sets?.filter(s => s.done).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded"
                        style={{ backgroundColor: '#1e2535', color: COLORS.textSecondary }}>
                        {s.weight}kg × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ExerciseInfoList = ({ exercises }) => {
  const [expandedIdx, setExpandedIdx] = useState(null);
  return (
    <div className="space-y-2">
      <p className="font-semibold text-sm" style={{ color: COLORS.textSecondary }}>
        Exercises ({exercises.length})
      </p>
      {exercises.map((ex, i) => (
        <div key={i} className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
          <button className="w-full flex items-center justify-between p-3"
            onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
            <div className="text-left">
              <p className="text-sm font-semibold">{ex.name}</p>
              <p className="text-xs" style={{ color: COLORS.textSecondary }}>{ex.sets}×{ex.reps}</p>
            </div>
            {expandedIdx === i
              ? <ChevronUp size={14} color={COLORS.textSecondary} />
              : <ChevronDown size={14} color={COLORS.textSecondary} />}
          </button>
          {expandedIdx === i && (
            <div className="px-3 pb-3 space-y-2">
              {ex.notes && (
                <p className="text-xs italic" style={{ color: COLORS.textSecondary }}>💡 {ex.notes}</p>
              )}
              {ex.form && (
                <div className="px-2 py-2 rounded-lg text-xs leading-relaxed"
                  style={{ backgroundColor: `${COLORS.teal}08`, border: `1px solid ${COLORS.teal}30`, color: COLORS.textSecondary }}>
                  <span style={{ color: COLORS.teal, fontWeight: 600 }}>📐 Form:</span> {ex.form}
                </div>
              )}
              {ex.alt && (
                <div className="px-2 py-1.5 rounded-lg text-xs" style={{ backgroundColor: '#1e2535' }}>
                  <span style={{ color: COLORS.teal }}>↔ Alternatives:</span>{' '}
                  <span style={{ color: COLORS.textSecondary }}>{ex.alt}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const WorkoutTab = ({ workoutLog, setWorkoutLog }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const workout = getTodayWorkout(selectedDate);
  const dateKey = getDateKey(selectedDate);
  const isToday = getDateKey(today) === dateKey;
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Load the workout log for the selected day
  const selectedLog = isToday ? workoutLog : window.storage?.get(`workout:${dateKey}`);

  // Generate week centered around selectedDate
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigate weeks
  const shiftWeek = (dir) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir * 7);
    setSelectedDate(d);
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Day Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shiftWeek(-1)} className="p-1 rounded-lg"
            style={{ color: COLORS.textSecondary }}>
            <ChevronLeft size={20} />
          </button>
          <p className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
            {selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <button onClick={() => shiftWeek(1)} className="p-1 rounded-lg"
            style={{ color: COLORS.textSecondary }}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {weekDays.map((d) => {
            const dk = getDateKey(d);
            const isSelected = dk === dateKey;
            const isTodayDay = dk === getDateKey(today);
            const dayWorkout = getTodayWorkout(d);
            const hasLog = !!window.storage?.get(`workout:${dk}`);
            return (
              <button key={dk} onClick={() => setSelectedDate(new Date(d))}
                className="flex-1 min-w-[48px] flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? COLORS.accent : isTodayDay ? `${COLORS.accent}15` : '#1e2535',
                  border: `1.5px solid ${isSelected ? COLORS.accent : isTodayDay ? COLORS.accent : 'transparent'}`,
                }}>
                <span className="text-[10px] font-medium"
                  style={{ color: isSelected ? '#0d0f14' : COLORS.textSecondary }}>
                  {dayNames[d.getDay()]}
                </span>
                <span className="text-base font-bold mt-0.5"
                  style={{ color: isSelected ? '#0d0f14' : COLORS.textPrimary }}>
                  {d.getDate()}
                </span>
                <span className="text-[9px] font-semibold mt-0.5"
                  style={{ color: isSelected ? '#0d0f14' : dayWorkout.type === 'REST' ? COLORS.textSecondary : COLORS.teal }}>
                  {dayWorkout.short}
                </span>
                {hasLog && (
                  <div className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: isSelected ? '#0d0f14' : COLORS.accent }} />
                )}
              </button>
            );
          })}
        </div>
        {!isToday && (
          <button onClick={() => setSelectedDate(new Date())}
            className="mt-2 text-xs flex items-center gap-1 mx-auto px-3 py-1 rounded-lg"
            style={{ color: COLORS.accent, backgroundColor: `${COLORS.accent}15` }}>
            <Calendar size={12} /> Go to Today
          </button>
        )}
      </div>

      {/* Rest Day View */}
      {workout.type === 'REST' ? (
        <div className="flex flex-col items-center text-center space-y-4 py-8">
          <Moon size={64} color={COLORS.textSecondary} />
          <h2 className="text-3xl font-bold"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", color: COLORS.accent }}>
            Rest Day 🛏️
          </h2>
          <p style={{ color: COLORS.textSecondary }}>Recovery is where growth happens.</p>
          <Card className="w-full text-left">
            <p className="font-semibold mb-2" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Recovery Tips</p>
            {['🚶 Walk 10,000 steps','🧘 Stretch for 15–20 minutes','😴 Sleep 8 hours',
              '💧 Hydrate well — 3–4 litres','🥗 Eat your full meal plan'].map((tip, i) => (
              <p key={i} className="text-sm py-1" style={{ color: COLORS.textSecondary }}>{tip}</p>
            ))}
          </Card>
        </div>
      ) : (
        /* Workout Day View */
        <>
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              {WORKOUTS[workout.type].name}
              <span className="ml-2 text-base font-normal" style={{ color: COLORS.textSecondary }}>
                — Workout {workout.type}
              </span>
            </h2>
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              {getDayName(selectedDate)}, {dateKey}
              {!isToday && <span style={{ color: COLORS.teal }}> (viewing past)</span>}
            </p>
          </div>

          {/* Exercise List with Alternatives & Form */}
          <ExerciseInfoList exercises={WORKOUTS[workout.type].exercises} />

          {/* Saved Log View (for past days) */}
          {!isToday && selectedLog && (
            <Card>
              <p className="font-semibold mb-3 text-sm flex items-center gap-2" style={{ color: COLORS.accent }}>
                <CheckCircle size={16} /> Logged Workout
              </p>
              {selectedLog.exercises?.map((ex) => (
                <div key={ex.name} className="mb-3">
                  <p className="text-sm font-medium mb-1">{ex.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {ex.sets?.filter(s => s.done).map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs"
                        style={{ backgroundColor: '#1e2535', color: COLORS.textSecondary }}>
                        {s.weight}kg × {s.reps}
                      </span>
                    ))}
                    {ex.sets?.filter(s => s.done).length === 0 && (
                      <span className="text-xs" style={{ color: COLORS.textSecondary }}>No sets logged</span>
                    )}
                  </div>
                </div>
              ))}
              {selectedLog.cardio && (
                <p className="text-sm mt-2" style={{ color: COLORS.teal }}>
                  ✅ Cardio completed{selectedLog.cardioNotes ? `: ${selectedLog.cardioNotes}` : ''}
                </p>
              )}
            </Card>
          )}

          {!isToday && !selectedLog && (
            <Card>
              <p className="text-sm text-center" style={{ color: COLORS.textSecondary }}>
                No workout logged for this day.
              </p>
            </Card>
          )}

          {/* Guidelines */}
          <div className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: COLORS.card, borderColor: COLORS.border }}>
            <button className="w-full flex items-center justify-between p-4"
              onClick={() => setShowGuidelines(!showGuidelines)}>
              <div className="flex items-center gap-2">
                <Info size={16} color={COLORS.teal} />
                <span className="font-semibold text-sm">Exercise Guidelines</span>
              </div>
              {showGuidelines ? <ChevronUp size={16} color={COLORS.textSecondary} /> : <ChevronDown size={16} color={COLORS.textSecondary} />}
            </button>
            {showGuidelines && (
              <div className="px-4 pb-4 space-y-2">
                {[
                  '🔥 Warm up: Same exercise at 50–80% weight for 1–3 sets',
                  '⚡ Stop 1–2 reps before failure (6–12 rep range)',
                  '⏱ Tempo: 3s up, 1s pause, 3s down',
                  '⏸ Rest 1–3 minutes between sets',
                  '📈 Each week: increase 1–2 reps; once exceeding rep range, increase weight',
                  '🆕 First week: do only 2 sets instead of 3',
                ].map((tip, i) => (
                  <p key={i} className="text-sm" style={{ color: COLORS.textSecondary }}>{tip}</p>
                ))}
              </div>
            )}
          </div>

          {/* Logger (today only) */}
          {isToday && (
            <WorkoutLogger workout={{ ...WORKOUTS[workout.type], type: workout.type }}
              dateKey={dateKey} workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />
          )}

          <WorkoutHistory dateKey={dateKey} />
        </>
      )}
    </div>
  );
};

const ProgressTab = ({ steps, settings }) => {
  const today = new Date();
  const weekKey = getWeekKey(today);
  const [weightInput, setWeightInput] = useState('');
  const [weeklyWeights, setWeeklyWeights] = useStorage('weights_all', { [weekKey]: USER.weight });

  const handleLogWeight = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0) {
      setWeeklyWeights(prev => ({ ...prev, [weekKey]: w }));
      setWeightInput('');
    }
  };

  const weightChartData = Object.entries(weeklyWeights)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, weight]) => ({ week: week.slice(-3), weight: Number(weight) }));

  const currentWeight = weeklyWeights[weekKey] || USER.weight;
  const sortedKeys = Object.keys(weeklyWeights).sort();
  const prevWeekKey = sortedKeys[sortedKeys.indexOf(weekKey) - 1];
  const prevWeight = prevWeekKey ? weeklyWeights[prevWeekKey] : null;
  const weightDiff = prevWeight ? (currentWeight - prevWeight).toFixed(1) : null;
  const weightMood = weightDiff === null ? '\ud83d\ude10' : parseFloat(weightDiff) < 0 ? '\ud83d\udd25' : parseFloat(weightDiff) > 0 ? '\u26a0\ufe0f' : '\ud83d\ude10';
  const targetWeight = settings.targetWeight || USER.targetWeight;

  const stepsChartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = getDateKey(d);
    const daySteps = steps[key] || 0;
    return {
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      steps: daySteps,
      fill: daySteps >= 10000 ? COLORS.accent : daySteps >= 7000 ? '#f59e0b' : COLORS.danger,
    };
  });

  const streak = (() => {
    let count = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const mealData = window.storage?.get(`meals:${key}`);
      if (mealData && MEALS.filter(m => mealData[m.id]).length >= 3) count++;
      else break;
    }
    return count;
  })();

  const monthlyStats = (() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    let totalSteps = 0, stepDays = 0, totalCal = 0, calDays = 0, workouts = 0;
    for (let d = 1; d <= today.getDate(); d++) {
      const date = new Date(year, month, d);
      const key = getDateKey(date);
      const s = steps[key];
      if (s) { totalSteps += s; stepDays++; }
      const mealData = window.storage?.get(`meals:${key}`);
      if (mealData) {
        const eaten = MEALS.reduce((acc, m) => acc + (mealData[m.id] ? m.calories : 0), 0);
        if (eaten > 0) { totalCal += eaten; calDays++; }
      }
      if (window.storage?.get(`workout:${key}`)?.exercises?.length) workouts++;
    }
    return {
      avgSteps: stepDays ? Math.round(totalSteps / stepDays) : 0,
      avgCal: calDays ? Math.round(totalCal / calDays) : 0,
      workouts,
    };
  })();

  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Progress</h2>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>
            Weekly Weight {weightMood}
          </p>
          <div className="text-right">
            <span className="text-2xl font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif", color: COLORS.accent }}>{currentWeight}</span>
            <span className="text-sm ml-1" style={{ color: COLORS.textSecondary }}>kg</span>
          </div>
        </div>
        {weightDiff !== null && (
          <p className="text-sm mb-3"
            style={{ color: parseFloat(weightDiff) <= 0 ? COLORS.accent : COLORS.danger }}>
            {parseFloat(weightDiff) <= 0 ? '\u2212' : '+'}{Math.abs(parseFloat(weightDiff))}kg this week
            {parseFloat(weightDiff) < 0 ? ' \u2705' : parseFloat(weightDiff) > 0 ? ' \u26a0\ufe0f' : ''}
          </p>
        )}
        <div className="flex gap-2">
          <input type="number" placeholder="Log weight (kg)"
            value={weightInput} onChange={e => setWeightInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: '#1e2535', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} />
          <button onClick={handleLogWeight}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: COLORS.accent, color: '#0d0f14' }}>Log</button>
        </div>
      </Card>

      <Card>
        <p className="font-semibold mb-4"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Weight Trend</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={weightChartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="week" tick={{ fill: COLORS.textSecondary, fontSize: 10 }} />
            <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              labelStyle={{ color: COLORS.textSecondary }} itemStyle={{ color: COLORS.accent }} />
            <ReferenceLine y={targetWeight} stroke={COLORS.danger} strokeDasharray="4 4"
              label={{ value: 'Goal', fill: COLORS.danger, fontSize: 10 }} />
            <Line type="monotone" dataKey="weight" stroke={COLORS.accent} strokeWidth={2}
              dot={{ fill: COLORS.accent, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <p className="font-semibold mb-4"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Daily Steps (7 days)</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={stepsChartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="day" tick={{ fill: COLORS.textSecondary, fontSize: 10 }} />
            <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8 }}
              labelStyle={{ color: COLORS.textSecondary }} itemStyle={{ color: COLORS.accent }} />
            <ReferenceLine y={10000} stroke={COLORS.accent} strokeDasharray="4 4" />
            <Bar dataKey="steps" radius={[4, 4, 0, 0]}
              fill={COLORS.accent}
              isAnimationActive={true} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          {[['\u226510k', COLORS.accent], ['7\u20139.9k', '#f59e0b'], ['<7k', COLORS.danger]].map(([label, color]) => (
            <div key={label} className="flex items-center gap-1 text-xs" style={{ color: COLORS.textSecondary }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Meal Logging Streak</p>
            <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>Days with 3+ meals logged</p>
          </div>
          <div className="flex items-center gap-2">
            <Flame size={24} color={streak > 0 ? '#f59e0b' : COLORS.border} />
            <span className="text-3xl font-bold"
              style={{ fontFamily: "'Barlow Condensed', sans-serif",
                color: streak > 0 ? '#f59e0b' : COLORS.textSecondary }}>{streak}</span>
          </div>
        </div>
      </Card>

      <Card>
        <p className="font-semibold mb-3"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>
          Monthly Summary ({today.toLocaleDateString('en-IN', { month: 'long' })})
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Avg Daily Steps', value: monthlyStats.avgSteps.toLocaleString(), color: COLORS.accent },
            { label: 'Avg Daily Calories', value: `${monthlyStats.avgCal} kcal`, color: COLORS.teal },
            { label: 'Workouts Done', value: String(monthlyStats.workouts), color: '#f59e0b' },
            { label: 'Current Weight', value: `${currentWeight} kg`, color: COLORS.textPrimary },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg" style={{ backgroundColor: '#1e2535' }}>
              <p className="text-xs mb-1" style={{ color: COLORS.textSecondary }}>{stat.label}</p>
              <p className="text-lg font-bold"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const SettingsRow = ({ label, value, children }) => (
  <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: COLORS.border }}>
    <p className="text-sm" style={{ color: COLORS.textSecondary }}>{label}</p>
    <div className="flex items-center gap-2">
      {children || <p className="font-semibold text-sm">{value}</p>}
    </div>
  </div>
);

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    // Listen for Chrome/Android install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled) return null;

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-3 mb-3">
        <Smartphone size={20} color={COLORS.accent} />
        <p className="font-semibold" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>
          Install App
        </p>
      </div>

      {isIOS ? (
        <div>
          <p className="text-sm mb-3" style={{ color: COLORS.textSecondary }}>
            Add this app to your iPhone home screen for the best experience:
          </p>
          <button onClick={() => setShowIOSGuide(!showIOSGuide)}
            className="w-full py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: COLORS.accent, color: '#0d0f14' }}>
            {showIOSGuide ? 'Hide Instructions' : 'Show How to Install'}
          </button>
          {showIOSGuide && (
            <div className="mt-3 space-y-3 text-sm" style={{ color: COLORS.textSecondary }}>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#1e2535' }}>
                <span className="text-lg">1️⃣</span>
                <p>Tap the <strong style={{ color: COLORS.textPrimary }}>Share</strong> button
                  <span style={{ fontSize: '18px' }}> ⬆️</span> at the bottom of Safari</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#1e2535' }}>
                <span className="text-lg">2️⃣</span>
                <p>Scroll down and tap <strong style={{ color: COLORS.textPrimary }}>Add to Home Screen</strong></p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#1e2535' }}>
                <span className="text-lg">3️⃣</span>
                <p>Tap <strong style={{ color: COLORS.textPrimary }}>Add</strong> in the top right corner</p>
              </div>
              <p className="text-xs italic" style={{ color: COLORS.teal }}>
                The app will open in fullscreen mode like a native app!
              </p>
            </div>
          )}
        </div>
      ) : deferredPrompt ? (
        <div>
          <p className="text-sm mb-3" style={{ color: COLORS.textSecondary }}>
            Install this app on your device for offline access and a better experience.
          </p>
          <button onClick={handleInstall}
            className="w-full py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ backgroundColor: COLORS.accent, color: '#0d0f14' }}>
            <Download size={16} /> Install App
          </button>
        </div>
      ) : (
        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
          Open this site in Chrome or Safari to install it as an app on your device.
        </p>
      )}
    </Card>
  );
};

const NotificationToggle = ({ label, icon: Icon, enabled, onToggle, description }) => (
  <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: COLORS.border }}>
    <div className="flex items-center gap-3">
      <Icon size={18} color={enabled ? COLORS.accent : COLORS.textSecondary} />
      <div>
        <p className="text-sm" style={{ color: COLORS.textPrimary }}>{label}</p>
        {description && <p className="text-xs" style={{ color: COLORS.textSecondary }}>{description}</p>}
      </div>
    </div>
    <button onClick={onToggle}
      className="w-11 h-6 rounded-full relative transition-colors duration-200"
      style={{ backgroundColor: enabled ? COLORS.accent : '#1e2535' }}>
      <div className="w-5 h-5 rounded-full absolute top-0.5 transition-all duration-200"
        style={{ backgroundColor: enabled ? '#0d0f14' : COLORS.textSecondary,
          left: enabled ? '22px' : '2px' }} />
    </button>
  </div>
);

const SettingsTab = ({ settings, setSettings }) => {
  const [editGoalWeight, setEditGoalWeight] = useState(false);
  const [editStepGoal, setEditStepGoal] = useState(false);
  const [tempGoalWeight, setTempGoalWeight] = useState(String(settings.targetWeight || USER.targetWeight));
  const [tempStepGoal, setTempStepGoal] = useState(String(settings.stepGoal || USER.stepGoal));
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [notifSettings, setNotifSettings] = useState(getNotificationSettings);
  const [notifPermission, setNotifPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  const toggleNotifications = async () => {
    if (!notifSettings.enabled) {
      const perm = await requestPermission();
      setNotifPermission(perm);
      if (perm !== 'granted') return;
      const updated = { ...notifSettings, enabled: true };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      startNotifications();
      sendTestNotification();
    } else {
      const updated = { ...notifSettings, enabled: false };
      setNotifSettings(updated);
      saveNotificationSettings(updated);
      stopNotifications();
    }
  };

  const toggleNotifType = (type) => {
    const updated = { ...notifSettings, [type]: !notifSettings[type] };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    restartNotifications();
  };

  const updateWaterInterval = (mins) => {
    const updated = { ...notifSettings, waterIntervalMin: mins };
    setNotifSettings(updated);
    saveNotificationSettings(updated);
    restartNotifications();
  };

  const handleSaveGoalWeight = () => {
    const w = parseFloat(tempGoalWeight);
    if (!isNaN(w) && w > 0) { setSettings(prev => ({ ...prev, targetWeight: w })); setEditGoalWeight(false); }
  };
  const handleSaveStepGoal = () => {
    const s = parseInt(tempStepGoal, 10);
    if (!isNaN(s) && s > 0) { setSettings(prev => ({ ...prev, stepGoal: s })); setEditStepGoal(false); }
  };
  const handleResetWeek = () => {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      window.storage?.remove(`workout:${getDateKey(d)}`);
    }
    setShowResetConfirm(false); setResetDone(true);
    setTimeout(() => setResetDone(false), 2000);
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      <h2 className="text-2xl font-bold" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Settings</h2>

      <Card>
        <p className="font-semibold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Profile</p>
        <SettingsRow label="Name" value={USER.name} />
        <SettingsRow label="Starting Weight" value={`${USER.weight} kg`} />
        <SettingsRow label="Goal" value={USER.goal} />
        <SettingsRow label="Gym Time" value={USER.gymTime} />
      </Card>

      <Card>
        <p className="font-semibold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Nutrition Targets</p>
        <SettingsRow label="Daily Calories" value={`${USER.calories} kcal`} />
        <SettingsRow label="Protein" value={`${USER.protein}g`} />
        <SettingsRow label="Carbohydrates" value={`${USER.carbs}g`} />
        <SettingsRow label="Fat" value={`${USER.fat}g`} />
      </Card>

      <Card>
        <p className="font-semibold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Fitness Goals</p>
        <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: COLORS.border }}>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Goal Weight</p>
          {editGoalWeight ? (
            <div className="flex items-center gap-2">
              <input type="number" value={tempGoalWeight} onChange={e => setTempGoalWeight(e.target.value)}
                className="w-20 px-2 py-1 rounded text-sm text-center outline-none"
                style={{ backgroundColor: '#1e2535', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} />
              <button onClick={handleSaveGoalWeight} className="p-1 rounded" style={{ color: COLORS.accent }}><Check size={14} /></button>
              <button onClick={() => setEditGoalWeight(false)} className="p-1 rounded" style={{ color: COLORS.danger }}><X size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{settings.targetWeight || USER.targetWeight} kg</p>
              <button onClick={() => setEditGoalWeight(true)} className="text-xs px-2 py-1 rounded"
                style={{ color: COLORS.textSecondary, backgroundColor: '#1e2535' }}>Edit</button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between py-3">
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Daily Step Goal</p>
          {editStepGoal ? (
            <div className="flex items-center gap-2">
              <input type="number" value={tempStepGoal} onChange={e => setTempStepGoal(e.target.value)}
                className="w-24 px-2 py-1 rounded text-sm text-center outline-none"
                style={{ backgroundColor: '#1e2535', border: `1px solid ${COLORS.border}`, color: COLORS.textPrimary }} />
              <button onClick={handleSaveStepGoal} className="p-1 rounded" style={{ color: COLORS.accent }}><Check size={14} /></button>
              <button onClick={() => setEditStepGoal(false)} className="p-1 rounded" style={{ color: COLORS.danger }}><X size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{(settings.stepGoal || USER.stepGoal).toLocaleString()}</p>
              <button onClick={() => setEditStepGoal(true)} className="text-xs px-2 py-1 rounded"
                style={{ color: COLORS.textSecondary, backgroundColor: '#1e2535' }}>Edit</button>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <p className="font-semibold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>
          <span className="flex items-center gap-2">
            {notifSettings.enabled ? <Bell size={18} color={COLORS.accent} /> : <BellOff size={18} color={COLORS.textSecondary} />}
            Notifications
          </span>
        </p>
        {notifPermission === 'unsupported' ? (
          <p className="text-sm" style={{ color: COLORS.danger }}>Your browser does not support notifications.</p>
        ) : notifPermission === 'denied' ? (
          <p className="text-sm" style={{ color: COLORS.danger }}>Notifications blocked. Please enable them in your browser settings.</p>
        ) : (
          <div>
            <NotificationToggle label="Enable Reminders" icon={Bell}
              enabled={notifSettings.enabled} onToggle={toggleNotifications}
              description={notifSettings.enabled ? 'Reminders are active' : 'Turn on to get meal, workout & water reminders'} />
            {notifSettings.enabled && (
              <div className="mt-2 space-y-0">
                <NotificationToggle label="Meal Reminders" icon={Utensils}
                  enabled={notifSettings.meals} onToggle={() => toggleNotifType('meals')}
                  description="Reminds you at each meal time" />
                <NotificationToggle label="Workout Reminder" icon={Dumbbell}
                  enabled={notifSettings.workout} onToggle={() => toggleNotifType('workout')}
                  description={`Daily at ${notifSettings.workoutTime}`} />
                <NotificationToggle label="Water Reminders" icon={Droplets}
                  enabled={notifSettings.water} onToggle={() => toggleNotifType('water')}
                  description={`Every ${notifSettings.waterIntervalMin} min (7 AM – 10 PM)`} />
                {notifSettings.water && (
                  <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: COLORS.border }}>
                    <div className="flex items-center gap-3">
                      <Clock size={18} color={COLORS.textSecondary} />
                      <p className="text-sm" style={{ color: COLORS.textPrimary }}>Water Interval</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[30, 45, 60, 90, 120].map(m => (
                        <button key={m} onClick={() => updateWaterInterval(m)}
                          className="px-2 py-1 rounded text-xs font-semibold transition-colors"
                          style={{
                            backgroundColor: notifSettings.waterIntervalMin === m ? COLORS.accent : '#1e2535',
                            color: notifSettings.waterIntervalMin === m ? '#0d0f14' : COLORS.textSecondary,
                          }}>
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={sendTestNotification}
                  className="w-full mt-3 py-2 rounded-xl text-sm font-semibold border"
                  style={{ borderColor: COLORS.border, color: COLORS.textSecondary, backgroundColor: 'transparent' }}>
                  Send Test Notification
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card>
        <p className="font-semibold mb-3" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '1.1rem' }}>Data Management</p>
        {showResetConfirm ? (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: COLORS.danger }}>
              ⚠️ This will delete all workout logs for the past 7 days. Are you sure?
            </p>
            <div className="flex gap-3">
              <button onClick={handleResetWeek}
                className="flex-1 py-2 rounded-xl text-sm font-semibold"
                style={{ backgroundColor: COLORS.danger, color: COLORS.textPrimary }}>Yes, Reset</button>
              <button onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: COLORS.border, color: COLORS.textSecondary, backgroundColor: 'transparent' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowResetConfirm(true)}
            className="w-full py-2 rounded-xl text-sm font-semibold border"
            style={{ borderColor: COLORS.danger, color: COLORS.danger, backgroundColor: 'transparent' }}>
            {resetDone ? '\u2705 Week Reset!' : 'Reset Week Workout Logs'}
          </button>
        )}
      </Card>

      <p className="text-xs text-center pb-4" style={{ color: COLORS.textSecondary }}>
        Ketan's Fitness Tracker v1.0 \u2022 Data synced to cloud
      </p>

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('today');
  const today = getDateKey();
  const [todayMeals, setTodayMeals] = useStorage(`meals:${today}`, {});
  const [steps, setSteps] = useStorage('steps_all', {});
  const [workoutLog, setWorkoutLog] = useStorage(`workout:${today}`, null);
  const [settings, setSettings] = useStorage('settings:goals', {
    stepGoal: USER.stepGoal,
    targetWeight: USER.targetWeight,
    calorieGoal: USER.calories,
  });

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(link);
  }, []);

  // Start notifications on app load if previously enabled
  useEffect(() => {
    const notifSettings = getNotificationSettings();
    if (notifSettings.enabled && 'Notification' in window && Notification.permission === 'granted') {
      startNotifications();
    }
    return () => stopNotifications();
  }, []);

  // Listen for MARK_DONE actions from notification buttons (service worker)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (event) => {
      if (event.data?.type !== 'MARK_DONE') return;
      const tag = event.data.tag;
      const mealIds = ['meal1', 'meal2', 'meal3', 'meal4'];

      if (tag.startsWith('meal-')) {
        const idx = parseInt(tag.replace('meal-', ''), 10);
        if (mealIds[idx]) {
          setTodayMeals(prev => ({ ...prev, [mealIds[idx]]: true }));
        }
      }
      // Water / workout done: just focus the app / no further state change needed
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [setTodayMeals]);

  const tabs = [
    { id: 'today', label: 'Today', icon: Home },
    { id: 'meals', label: 'Meals', icon: Utensils },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'progress', label: 'Progress', icon: TrendingDown },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'today': return <TodayTab setActiveTab={setActiveTab} todayMeals={todayMeals} steps={steps} setSteps={setSteps} settings={settings} />;
      case 'meals': return <MealsTab todayMeals={todayMeals} setTodayMeals={setTodayMeals} />;
      case 'workout': return <WorkoutTab workoutLog={workoutLog} setWorkoutLog={setWorkoutLog} />;
      case 'progress': return <ProgressTab steps={steps} settings={settings} />;
      case 'settings': return <SettingsTab settings={settings} setSettings={setSettings} />;
      default: return null;
    }
  };

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: '100vh', maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
      <div style={{ paddingBottom: '80px' }}>
        {renderTab()}
      </div>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] flex items-center justify-around px-2 py-2 border-t"
        style={{ backgroundColor: '#0a0c11', borderColor: COLORS.border, zIndex: 100 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200"
              style={{ color: isActive ? COLORS.accent : COLORS.textSecondary,
                backgroundColor: isActive ? `${COLORS.accent}10` : 'transparent' }}>
              <TabIcon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
