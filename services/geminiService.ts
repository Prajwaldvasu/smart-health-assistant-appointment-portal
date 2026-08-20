import { GoogleGenAI, Type } from "@google/genai";
import { Symptom, UserProfile, AnalysisResult, Location, TriageLevel, WellnessTip, HealthLog } from '../shared/types';

const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Use Gemini as primary, fallback to OpenAI if Gemini fails
const useGemini = !!GEMINI_API_KEY;
const useOpenAI = !!OPENAI_API_KEY;

if (!useGemini && !useOpenAI) {
  console.warn("Neither GEMINI_API_KEY nor OPENAI_API_KEY environment variables are set. Using mock responses for development.");
}

const geminiAI = useGemini ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    triageLevel: {
      type: Type.STRING,
      enum: [TriageLevel.Minor, TriageLevel.Moderate, TriageLevel.Severe],
      description: 'The assessed severity level of the symptoms.'
    },
    triageDescription: {
      type: Type.STRING,
      description: 'A brief, clear explanation for the triage classification.'
    },
    predictions: {
      type: Type.ARRAY,
      description: 'List of potential medical conditions based on symptoms.',
      items: {
        type: Type.OBJECT,
        properties: {
          condition: { type: Type.STRING, description: 'Name of the medical condition.' },
          probability: { type: Type.NUMBER, description: 'A score from 0 to 100 representing the likelihood.' },
          description: { type: Type.STRING, description: 'A brief, user-friendly description of the condition.' },
          specialty: { type: Type.STRING, description: 'The medical specialty that typically handles this condition (e.g., Cardiology, Dermatology).' }
        },
        required: ['condition', 'probability', 'description', 'specialty']
      }
    },
    selfCareAdvice: {
      type: Type.ARRAY,
      description: 'A list of 3-4 personalized, actionable self-care or wellness tips.',
      items: { type: Type.STRING }
    }
  },
  required: ['triageLevel', 'triageDescription', 'predictions', 'selfCareAdvice']
};

// Intelligent mock response generator based on symptoms
const generateIntelligentMockResponse = (symptoms: Symptom[], profile: UserProfile): Omit<AnalysisResult, 'doctors'> => {
  // Calculate severity score based on symptom keywords
  const severityWeights: { [key: string]: number } = {
    'chest pain': 10, 'breathless': 9, 'fainting': 10, 'confusion': 9,
    'left arm pain': 8, 'jaw pain': 8, 'sudden sweating': 8, 'shortness of breath': 9,
    'abdominal pain': 7, 'vomiting': 6, 'dizziness': 6, 'nausea': 5,
    'back pain': 5, 'headache': 4, 'joint pain': 4, 'diarrhea': 4,
    'fever': 3, 'fatigue': 3, 'rash': 3, 'cough': 2, 'sore throat': 2, 'sneezing': 1,
    'stomach pain': 7, 'migraine': 6, 'body ache': 3, 'running nose': 1,
    'itching': 2, 'swelling': 5, 'bleeding': 8, 'vision problem': 7
  };

  let totalScore = 0;
  const symptomTypes: string[] = [];

  symptoms.forEach(symptom => {
    const name = symptom.name.toLowerCase();
    symptomTypes.push(name);

    // Check against severity weights
    let matched = false;
    for (const [key, weight] of Object.entries(severityWeights)) {
      if (name.includes(key)) {
        totalScore += weight * (symptom.severity / 10);
        matched = true;
        break;
      }
    }

    // If no match, use generic severity-based score
    if (!matched) {
      totalScore += symptom.severity * 0.5;
    }
  });

  // Determine triage level and conditions based on symptoms
  let triageLevel: TriageLevel;
  let triageDescription: string;
  let predictions: Array<{ condition: string; probability: number; description: string; specialty: string }>;
  let selfCareAdvice: string[];

  // Check for specific symptom patterns
  const symptomText = symptomTypes.join(' ');
  const hasRespiratory = /cough|sore throat|sneezing|running nose|breathless|shortness of breath/.test(symptomText);
  const hasFever = /fever/.test(symptomText);
  const hasHeadache = /headache|migraine/.test(symptomText);
  const hasDigestive = /nausea|vomiting|diarrhea|stomach pain|abdominal pain/.test(symptomText);
  const hasSkin = /rash|itching/.test(symptomText);
  const hasMusculoskeletal = /back pain|joint pain|body ache/.test(symptomText);

  if (totalScore >= 8) {
    triageLevel = TriageLevel.Severe;
    triageDescription = "Severe symptoms detected. Immediate medical attention recommended.";

    if (hasRespiratory && (symptomText.includes('breathless') || symptomText.includes('chest pain'))) {
      predictions = [
        {
          condition: "Respiratory Distress / Pneumonia",
          probability: 75,
          description: "Severe respiratory symptoms that may indicate pneumonia or other serious lung conditions.",
          specialty: "Pulmonology"
        },
        {
          condition: "Acute Bronchitis",
          probability: 60,
          description: "Inflammation of the bronchial tubes causing severe breathing difficulties.",
          specialty: "Pulmonology"
        }
      ];
      selfCareAdvice = [
        "Seek immediate medical attention",
        "Avoid strenuous activities",
        "Monitor oxygen levels if possible",
        "Keep emergency contacts ready"
      ];
    } else if (symptomText.includes('chest pain') && symptomText.includes('left arm pain')) {
      predictions = [
        {
          condition: "Suspected Heart Attack",
          probability: 90,
          description: "Classic cardiac symptoms requiring immediate emergency care.",
          specialty: "Cardiology"
        }
      ];
      selfCareAdvice = [
        "🚨 IMMEDIATE EMERGENCY: Call 108 or go to nearest emergency room NOW",
        " aspirin: If not allergic, chew one adult aspirin (325mg) while waiting for help",
        "🛏️ REST: Stop all activity and rest in a comfortable position",
        "📞 HAVE SOMEONE STAY: Don't drive yourself to hospital",
        "⏰ TIME CRITICAL: Note time symptoms started - heart muscle dies without blood flow",
        "⚠️ AVOID: Eating, drinking, or taking other medications until evaluated",
        "👨‍⚕️ EMERGENCY CARDIAC CARE: Requires immediate ECG, blood tests, and possible angioplasty"
      ];
    } else if (hasDigestive && symptomText.includes('vomiting')) {
      predictions = [
        {
          condition: "Acute Gastroenteritis",
          probability: 70,
          description: "Severe stomach inflammation causing vomiting and abdominal pain.",
          specialty: "Gastroenterology"
        },
        {
          condition: "Food Poisoning",
          probability: 65,
          description: "Foodborne illness requiring medical evaluation.",
          specialty: "General Medicine"
        }
      ];
      selfCareAdvice = [
        "Stay hydrated with oral rehydration solutions",
        "Avoid solid foods temporarily",
        "Seek medical care if symptoms worsen",
        "Rest and avoid exertion"
      ];
    } else if (symptomText.includes('confusion') && symptomText.includes('severe headache')) {
      predictions = [
        {
          condition: "Stroke (Suspected)",
          probability: 85,
          description: "Neurological emergency requiring immediate medical intervention.",
          specialty: "Neurology"
        }
      ];
      selfCareAdvice = [
        "🚨 IMMEDIATE EMERGENCY: Call 108 or go to nearest emergency room NOW",
        "⏰ TIME CRITICAL: Note exact time symptoms started - clot-busting drugs only work within 3-4.5 hours",
        "🛏️ POSITION: Lie on side with head slightly elevated to prevent choking if vomiting",
        "📞 HAVE SOMEONE STAY: Don't drive yourself to hospital",
        "🚫 NOTHING BY MOUTH: Do not eat, drink, or take medications",
        "⚠️ FAST TEST: Face drooping? Arm weakness? Speech difficulty? Time to call 108",
        "👨‍⚕️ EMERGENCY NEUROLOGICAL CARE: Requires immediate CT scan and possible thrombolytic therapy"
      ];
    } else if (symptomText.includes('severe abdominal pain') && symptomText.includes('rigid abdomen')) {
      predictions = [
        {
          condition: "Peritonitis",
          probability: 80,
          description: "Inflammation of the abdominal lining, often due to organ rupture or infection.",
          specialty: "General Surgery"
        }
      ];
      selfCareAdvice = [
        "🚨 IMMEDIATE EMERGENCY: Call 108 or go to nearest emergency room NOW",
        "🛏️ POSITION: Lie still with knees drawn up to reduce abdominal tension",
        "🚫 NOTHING BY MOUTH: Do not eat, drink, or take medications",
        "🧊 COLD COMPRESS: Apply to painful area to reduce inflammation",
        "📞 HAVE SOMEONE STAY: Don't drive yourself to hospital",
        "⏰ TIME CRITICAL: Peritonitis can be fatal within hours without treatment",
        "👨‍⚕️ EMERGENCY SURGICAL CARE: Requires immediate surgery to repair perforation and antibiotics"
      ];
    } else {
      predictions = [
        {
          condition: "Severe Infection",
          probability: 70,
          description: "High severity symptoms suggesting a serious infection.",
          specialty: "Internal Medicine"
        }
      ];
      selfCareAdvice = [
        "🚨 URGENT: Seek immediate medical attention or call emergency services (108)",
        "💊 Do NOT take aspirin if you have bleeding disorders or ulcers",
        "🛑 Stop all physical activities immediately and rest in a comfortable position",
        "💧 Take small sips of water but avoid eating until medical help arrives",
        "📞 Have someone stay with you and keep emergency contacts ready",
        "⏰ Note the time symptoms started - this is important for medical evaluation"
      ];
    }
  } else if (totalScore >= 4) {
    triageLevel = TriageLevel.Moderate;
    triageDescription = "Moderate symptoms detected. Medical consultation recommended.";

    if (hasRespiratory && hasFever) {
      predictions = [
        {
          condition: "Flu (Influenza)",
          probability: 75,
          description: "Viral infection causing fever, cough, and respiratory symptoms.",
          specialty: "General Medicine"
        },
        {
          condition: "Viral Upper Respiratory Infection",
          probability: 65,
          description: "Common viral infection affecting the upper respiratory tract.",
          specialty: "General Medicine"
        }
      ];
      selfCareAdvice = [
        "🛏️ REST: Get 7-8 hours of sleep and take naps during the day to help your body fight infection",
        "💧 HYDRATION: Drink 8-10 glasses of water, warm herbal teas (ginger, tulsi), and warm lemon water with honey",
        "🍲 NUTRITION: Eat warm soups (chicken/vegetable), khichdi, fresh fruits rich in Vitamin C (oranges, amla)",
        "🌡️ FEVER MANAGEMENT: Use cold compress on forehead, take lukewarm baths, wear light clothing",
        "🏠 HOME REMEDY: Gargle with warm salt water 3-4 times daily for sore throat relief",
        "🍯 TIP: Take 1 tsp honey with warm water before bed to soothe throat and boost immunity",
        "⚠️ PRECAUTION: Avoid cold drinks, ice cream, and oily/spicy foods",
        "👨‍⚕️ Consult a doctor if fever exceeds 102°F or symptoms persist beyond 3-4 days"
      ];
    } else if (hasHeadache && symptoms.some(s => s.severity > 7)) {
      predictions = [
        {
          condition: "Migraine",
          probability: 70,
          description: "Severe headache that may be accompanied by sensitivity to light and sound.",
          specialty: "Neurology"
        },
        {
          condition: "Tension Headache",
          probability: 60,
          description: "Common headache caused by stress or muscle tension.",
          specialty: "General Medicine"
        }
      ];
      selfCareAdvice = [
        "🌙 REST: Lie down in a quiet, dark room and close your eyes for 30-60 minutes",
        "❄️ COLD THERAPY: Apply ice pack wrapped in cloth to forehead and temples for 15 minutes",
        "🔥 HEAT THERAPY: Use warm compress on neck and shoulders to relieve tension",
        "💧 HYDRATION: Drink plenty of water - dehydration can trigger headaches",
        "☕ HOME REMEDY: Drink ginger tea or peppermint tea to reduce headache intensity",
        "💆 MASSAGE: Gently massage temples, scalp, neck, and shoulders in circular motions",
        "🧘 RELAXATION: Practice deep breathing exercises - inhale for 4 counts, hold, exhale for 6 counts",
        "⚠️ AVOID: Loud noises, bright screens, strong smells, alcohol, and caffeine (if migraine)",
        "🍎 TIP: Eat small, regular meals - low blood sugar can worsen headaches",
        "👨‍⚕️ See a doctor if headaches are severe, frequent, or accompanied by vision changes"
      ];
    } else if (hasDigestive) {
      predictions = [
        {
          condition: "Gastritis",
          probability: 70,
          description: "Inflammation of the stomach lining causing digestive discomfort.",
          specialty: "Gastroenterology"
        },
        {
          condition: "Indigestion",
          probability: 65,
          description: "Digestive discomfort that may require dietary changes.",
          specialty: "General Medicine"
        }
      ];
      selfCareAdvice = [
        "🍽️ DIET: Eat small, frequent meals - bland foods like rice, banana, toast, boiled potatoes, khichdi",
        "🚫 AVOID: Spicy, oily, fried foods, citrus fruits, coffee, alcohol, and carbonated drinks",
        "💧 HYDRATION: Sip water slowly, drink coconut water, buttermilk (chaas), or ORS if vomiting",
        "🌿 HOME REMEDY: Drink jeera (cumin) water or ajwain (carom seeds) water for digestion",
        "🍯 GINGER TEA: Boil fresh ginger in water, add honey - excellent for nausea and stomach pain",
        "🥄 CURD/YOGURT: Eat plain yogurt with a pinch of salt to restore gut bacteria",
        "🛏️ REST: Sleep with head slightly elevated; avoid lying down immediately after eating",
        "⚠️ WARNING: If you have severe pain, blood in vomit/stool, or high fever - seek immediate care",
        "💊 Avoid pain relievers on empty stomach - they can worsen gastritis",
        "👨‍⚕️ Consult doctor if symptoms persist for more than 2-3 days"
      ];
    } else if (hasMusculoskeletal) {
      predictions = [
        {
          condition: "Musculoskeletal Pain",
          probability: 75,
          description: "Pain in muscles, joints, or bones that may require evaluation.",
          specialty: "Orthopedics"
        },
        {
          condition: "Arthritis",
          probability: 50,
          description: "Joint inflammation causing pain and stiffness.",
          specialty: "Rheumatology"
        }
      ];
      selfCareAdvice = [
        "❄️ ICE THERAPY: Apply ice pack for 15-20 minutes every 2-3 hours for first 48 hours (for injuries)",
        "🔥 HEAT THERAPY: After 48 hours, use heating pad or warm compress for chronic pain (20 min sessions)",
        "🛏️ REST: Avoid strenuous activities and movements that worsen pain",
        "💪 GENTLE STRETCHING: Do light stretches 2-3 times daily to maintain flexibility (no pain should occur)",
        "🧘 POSTURE: Maintain good posture while sitting/standing; use ergonomic support",
        "🌿 HOME REMEDY: Massage with warm coconut oil mixed with 2-3 drops of eucalyptus oil",
        "🧂 EPSOM SALT BATH: Soak in warm water with Epsom salt for 15-20 minutes to relax muscles",
        "🍍 ANTI-INFLAMMATORY FOODS: Eat turmeric (haldi), ginger, pineapple, fatty fish to reduce inflammation",
        "⚖️ WEIGHT MANAGEMENT: Maintain healthy weight to reduce stress on joints",
        "⚠️ AVOID: Heavy lifting, repetitive movements, prolonged sitting/standing",
        "👨‍⚕️ See a doctor if pain is severe, accompanied by swelling, numbness, or limits mobility"
      ];
    } else if (symptomTypes.some(s => s.includes('fever') && s.includes('body ache'))) {
      predictions = [
        {
          condition: "Dengue Fever (Suspected)",
          probability: 75,
          description: "Viral infection causing high fever, body aches, and fatigue. Requires careful monitoring.",
          specialty: "General Medicine"
        },
        {
          condition: "Chikungunya",
          probability: 60,
          description: "Viral disease transmitted by mosquitoes causing fever and severe joint pain.",
          specialty: "General Medicine"
        }
      ];
      selfCareAdvice = [
        "⚠️ URGENT: Get a complete blood count (CBC) and dengue test immediately",
        "🛏️ COMPLETE REST: Strict bed rest for at least 5-7 days; avoid any physical activity",
        "💧 HYDRATION: Drink 3-4 liters of fluids daily - water, ORS, coconut water, fresh juices",
        "🌡️ TEMPERATURE MONITORING: Check temperature every 4 hours and maintain a log",
        "🍎 PAPAYA LEAF JUICE: Crush fresh papaya leaves, extract juice - 2 tsp twice daily (may increase platelets)",
        "🍯 HONEY & TULSI: Mix 1 tsp honey with tulsi leaf juice - natural immunity booster",
        "🚫 NO ASPIRIN: Avoid aspirin/ibuprofen - can cause bleeding; use only paracetamol for fever",
        "🥦 PLATELET FOODS: Eat pomegranate, papaya, kiwi, spinach, beetroot to support platelet production",
        "🧼 HYGIENE: Keep surroundings clean to prevent mosquito breeding",
        "👨‍⚕️ IMMEDIATELY CONSULT DOCTOR if platelet count drops, bleeding occurs, or severe abdominal pain develops"
      ];
    } else if (symptomTypes.some(s => s.includes('cough') && s.includes('chest'))) {
      predictions = [
        {
          condition: "Bronchitis",
          probability: 75,
          description: "Inflammation of the bronchial tubes causing persistent cough and chest discomfort.",
          specialty: "Pulmonology"
        }
      ];
      selfCareAdvice = [
        "🛏️ REST: Get adequate sleep to allow your respiratory system to heal",
        "💧 HYDRATION: Drink warm fluids - herbal teas, warm water with honey, broths (3-4 liters daily)",
        "🍯 HONEY & TURMERIC: Mix 1 tsp honey with 1/2 tsp turmeric - anti-inflammatory for throat",
        "🌿 STEAM INHALATION: Inhale steam 3-4 times daily with eucalyptus oil to loosen mucus",
        "🍵 GINGER TEA: Boil fresh ginger in water, add honey - natural expectorant",
        "🧼 HYGIENE: Wash hands frequently, use mask to prevent spreading",
        "🚫 AVOID: Smoking, pollution, cold air, dairy products (can increase mucus)",
        "💊 EXPECTORANTS: Consider over-the-counter expectorants to help clear mucus",
        "👨‍⚕️ See doctor if cough persists beyond 2 weeks, blood in sputum, or breathing difficulty"
      ];
    } else if (symptomTypes.some(s => s.includes('joint') || s.includes('muscle'))) {
      predictions = [
        {
          condition: "Muscle Strain",
          probability: 75,
          description: "Overuse or injury to muscles causing pain and stiffness.",
          specialty: "Orthopedics"
        },
        {
          condition: "Fibromyalgia",
          probability: 50,
          description: "Chronic condition causing widespread muscle pain and tenderness.",
          specialty: "Rheumatology"
        }
      ];
      selfCareAdvice = [
        "🧊 ICE THERAPY: Apply ice pack for 15-20 minutes for acute pain (first 48 hours)",
        "🔥 HEAT THERAPY: After 48 hours, use heating pad or warm compress for 20 minutes",
        "🛏️ REST: Avoid activities that worsen the pain for 2-3 days",
        "🧘 GENTLE STRETCHING: Light stretches 2-3 times daily to prevent stiffness",
        "🌿 EUCALYPTUS MASSAGE: Mix 2-3 drops eucalyptus oil with coconut oil and massage",
        "🧂 EPSOM SALT BATH: Soak in warm bath with Epsom salt for 15-20 minutes",
        "🍍 BROMELAIN: Eat fresh pineapple or take supplements (natural anti-inflammatory)",
        "⚠️ AVOID: Heavy lifting, repetitive motions, prolonged sitting/standing",
        "👨‍⚕️ Consult doctor if pain persists beyond a week, severe swelling, or numbness"
      ];
    } else if (symptomTypes.some(s => s.includes('high') && s.includes('blood pressure'))) {
      predictions = [
        {
          condition: "Hypertension (High Blood Pressure)",
          probability: 75,
          description: "Elevated blood pressure that can lead to serious health problems if not managed.",
          specialty: "Cardiology"
        }
      ];
      selfCareAdvice = [
        "🩺 MONITORING: Check blood pressure regularly at home and keep a log",
        "🥗 DASH DIET: Follow Dietary Approaches to Stop Hypertension - rich in fruits, vegetables, whole grains, low-fat dairy",
        "🧂 SALT REDUCTION: Limit sodium intake to less than 1,500mg daily (about 1/2 tsp of salt)",
        "💧 HYDRATION: Drink adequate water but avoid excessive intake",
        "🚶 EXERCISE: Aim for 30 minutes of moderate exercise (brisk walking) most days",
        "⚖️ WEIGHT: Maintain healthy BMI (18.5-24.9) - even 5-10 lbs loss can help",
        "🚫 ALCOHOL: Limit to max 1 drink/day for women, 2 drinks/day for men",
        "🚭 SMOKING: Quit smoking completely - nicotine raises blood pressure",
        "🧘 STRESS: Practice relaxation techniques like deep breathing, meditation, yoga",
        "⏰ SLEEP: Get 7-9 hours of quality sleep nightly - poor sleep raises BP",
        "👨‍⚕️ Consult cardiologist for medication evaluation and cardiovascular risk assessment"
      ];
    } else if (symptomTypes.some(s => s.includes('palpitations') || s.includes('irregular heartbeat'))) {
      predictions = [
        {
          condition: "Arrhythmia",
          probability: 70,
          description: "Irregular heartbeat that may be too fast, too slow, or erratic.",
          specialty: "Cardiology"
        }
      ];
      selfCareAdvice = [
        "🩺 MONITORING: Keep track of episodes - when they occur, duration, triggers",
        "🧘 STRESS MANAGEMENT: Practice relaxation techniques as anxiety can trigger palpitations",
        "🚫 CAFFEINE: Avoid or limit coffee, tea, energy drinks, chocolate",
        "🚭 SMOKING: Quit smoking - nicotine can cause irregular heartbeat",
        "🍷 ALCOHOL: Limit or avoid alcohol as it can trigger arrhythmias",
        "💊 MEDICATION: Take prescribed medications exactly as directed",
        "😴 SLEEP: Maintain regular sleep schedule and ensure adequate rest",
        "⚖️ WEIGHT: Maintain healthy weight to reduce strain on heart",
        "⚠️ AVOID: Stimulants, decongestants, diet pills without doctor approval",
        "👨‍⚕️ See cardiologist immediately for ECG and possible heart monitoring"
      ];
    } else {
      predictions = [
        {
          condition: "General Viral Infection",
          probability: 70,
          description: "Moderate symptoms suggesting a viral infection.",
          specialty: "General Medicine"
        }
      ];
      selfCareAdvice = [
        "🛏️ REST: Get adequate sleep (7-8 hours) to help your immune system fight the infection",
        "💧 HYDRATION: Drink 8-10 glasses of water, herbal teas, fresh fruit juices daily",
        "🍊 VITAMIN C: Eat citrus fruits, amla, guava to boost immunity",
        "🌿 HOME REMEDY: Drink warm turmeric milk before bed (anti-inflammatory and immunity booster)",
        "🍯 HONEY & GINGER: Mix honey with ginger juice for natural antibacterial benefits",
        "🧼 HYGIENE: Wash hands frequently, avoid touching face, cover mouth when coughing/sneezing",
        "🌡️ Monitor body temperature and keep track of symptom changes",
        "👨‍⚕️ Consult a doctor if symptoms worsen or new symptoms develop"
      ];
    }
  } else {
    triageLevel = TriageLevel.Minor;
    triageDescription = "Mild symptoms detected. Self-care and monitoring recommended.";

    if (hasRespiratory) {
      predictions = [
        {
          condition: "Common Cold",
          probability: 80,
          description: "Mild viral infection causing runny nose, sneezing, and sore throat.",
          specialty: "General Medicine"
        },
        {
          condition: "Seasonal Allergies",
          probability: 50,
          description: "Allergic reaction to environmental allergens.",
          specialty: "Allergy & Immunology"
        }
      ];
      selfCareAdvice = [
        "🛏️ REST: Get plenty of rest and sleep to help your body recover naturally",
        "💧 HYDRATION: Drink warm water, ginger tea, tulsi tea, or honey-lemon water throughout the day",
        "🍲 STEAM INHALATION: Inhale steam 2-3 times daily to clear nasal congestion (add eucalyptus oil if available)",
        "🌿 HOME REMEDY: Gargle with warm salt water (1 tsp salt in warm water) 3-4 times daily for sore throat",
        "🍯 HONEY & TULSI: Mix 1 tsp honey with fresh tulsi leaves juice for cough relief",
        "🧄 NATURAL ANTIBIOTICS: Consume ginger, garlic, turmeric in your diet for immunity boost",
        "🧼 HYGIENE: Wash hands frequently with soap, use tissues for sneezing, avoid touching your face",
        "⚠️ AVOID: Cold foods/drinks, ice cream, fried foods, smoking, and exposure to pollutants",
        "😷 PREVENT SPREAD: Wear a mask around others, maintain distance from elderly and children",
        "🍊 NUTRITION: Eat vitamin C-rich foods (oranges, amla, lemon), warm soups, and light meals",
        "💤 Symptoms typically improve within 3-7 days; see doctor if they persist or worsen"
      ];
    } else if (hasSkin) {
      predictions = [
        {
          condition: "Allergic Reaction / Dermatitis",
          probability: 75,
          description: "Mild skin reaction that may be due to allergens or irritants.",
          specialty: "Dermatology"
        }
      ];
      selfCareAdvice = [
        "🧴 SKINCARE: Keep affected area clean and dry; wash gently with mild, fragrance-free soap",
        "❌ AVOID: Known allergens, harsh soaps, perfumes, tight clothing, and excessive scratching",
        "🧊 COLD COMPRESS: Apply cool, damp cloth to reduce itching and inflammation",
        "🧴 MOISTURIZE: Use hypoallergenic, fragrance-free moisturizer or aloe vera gel",
        "🌿 HOME REMEDY: Apply fresh aloe vera gel or coconut oil to soothe irritated skin",
        "🍯 NATURAL RELIEF: Mix turmeric with coconut oil - natural anti-inflammatory for skin",
        "🧼 GENTLE CARE: Pat skin dry (don't rub), wear soft cotton clothing",
        "💊 OTC OPTIONS: Consider calamine lotion or anti-itch cream (consult pharmacist)",
        "🍃 NEEM WATER: Boil neem leaves and use the cooled water to wash affected area",
        "⚠️ WARNING: Don't scratch - it can lead to infection and scarring",
        "👨‍⚕️ See a doctor if rash spreads, develops blisters, oozes, or doesn't improve in 1 week"
      ];
    } else {
      // More specific predictions for mild symptoms based on symptom patterns
      if (hasFever && !hasRespiratory && !hasDigestive) {
        predictions = [
          {
            condition: "Viral Fever",
            probability: 75,
            description: "Fever without respiratory symptoms, likely viral infection.",
            specialty: "General Medicine"
          }
        ];
        selfCareAdvice = [
          "🌡️ FEVER MANAGEMENT: Take paracetamol (as per age-appropriate dosage) to reduce fever",
          "💧 HYDRATION: Drink plenty of fluids - water, ORS, coconut water, fresh fruit juices",
          "🛏️ REST: Complete bed rest for at least 2-3 days to allow body to fight infection",
          "❄️ COOL COMPRESS: Apply cold compress on forehead and neck to bring down temperature",
          "🍲 LIGHT DIET: Eat easily digestible foods like khichdi, porridge, soups, boiled vegetables",
          "🌿 TULSI TEA: Boil 10-15 tulsi leaves in water, strain and drink 2-3 times daily",
          "🍯 HONEY-GINGER: Mix 1 tsp honey + ginger juice + few drops of lemon - natural immunity booster",
          "🧄 GARLIC: Consume 2-3 raw garlic cloves or add to food - natural antibiotic",
          "⚠️ AVOID: Cold foods/drinks, oily/fried foods, heavy meals",
          "👨‍⚕️ Consult doctor if fever exceeds 102°F, persists beyond 3 days, or accompanied by severe symptoms"
        ];
      } else if (hasHeadache && !hasFever) {
        predictions = [
          {
            condition: "Tension Headache",
            probability: 70,
            description: "Common headache often caused by stress, poor posture, or eye strain.",
            specialty: "General Medicine"
          },
          {
            condition: "Dehydration Headache",
            probability: 60,
            description: "Headache caused by insufficient fluid intake.",
            specialty: "General Medicine"
          }
        ];
        selfCareAdvice = [
          "💧 IMMEDIATE ACTION: Drink 2-3 glasses of water immediately",
          "🌙 DARK ROOM: Rest in a quiet, dark room for 20-30 minutes",
          "❄️ COLD/WARM THERAPY: Apply cold pack on forehead OR warm compress on neck/shoulders",
          "💆 MASSAGE: Gently massage temples, scalp, neck in circular motions for 5-10 minutes",
          "☕ CAFFEINE: Small cup of coffee/tea can help (but don't overdo)",
          "🧘 RELAXATION: Do deep breathing - inhale 4 counts, hold 4, exhale 6",
          "🌿 PEPPERMINT OIL: Apply diluted peppermint oil on temples for cooling relief",
          "🍵 GINGER TEA: Boil fresh ginger in water, add honey - natural pain reliever",
          "⚠️ AVOID: Bright screens, loud noises, strong smells, alcohol",
          "👨‍⚕️ See doctor if headache is severe, sudden, or accompanied by vision changes/vomiting"
        ];
      } else if (symptomTypes.some(s => s.includes('tired') || s.includes('weakness') || s.includes('fatigue'))) {
        predictions = [
          {
            condition: "Fatigue / Weakness",
            probability: 75,
            description: "General tiredness possibly due to overwork, poor sleep, or nutritional deficiency.",
            specialty: "General Medicine"
          },
          {
            condition: "Iron Deficiency Anemia",
            probability: 50,
            description: "Low iron levels causing weakness and fatigue.",
            specialty: "General Medicine"
          }
        ];
        selfCareAdvice = [
          "😴 SLEEP: Get 8-9 hours of quality sleep; maintain consistent sleep schedule",
          "🍎 IRON-RICH FOODS: Eat spinach, dates, raisins, jaggery, beetroot, pomegranate",
          "🥛 VITAMIN C: Drink lemon water/orange juice with meals to improve iron absorption",
          "🍌 ENERGY FOODS: Bananas, almonds, walnuts, eggs for quick energy boost",
          "💧 HYDRATION: Drink 8-10 glasses of water; dehydration causes fatigue",
          "🌿 ASHWAGANDHA: 1 tsp ashwagandha powder with warm milk before bed (consult Ayurvedic doctor)",
          "☕ LIMIT CAFFEINE: Too much coffee/tea can worsen fatigue - max 2 cups/day",
          "🚶 LIGHT EXERCISE: Short 15-20 minute walks boost energy levels",
          "⚠️ AVOID: Junk food, excessive sugar, staying up late",
          "👨‍⚕️ Get blood test if weakness persists - check for anemia, vitamin B12, thyroid"
        ];
      } else if (symptomTypes.some(s => s.includes('stomach') || s.includes('bloat') || s.includes('gas'))) {
        predictions = [
          {
            condition: "Indigestion / Acidity",
            probability: 75,
            description: "Digestive discomfort due to improper eating habits or food intolerance.",
            specialty: "Gastroenterology"
          }
        ];
        selfCareAdvice = [
          "🚫 IMMEDIATE: Stop eating for 2-3 hours to rest your stomach",
          "💧 SIP WATER: Drink small sips of warm water every 15 minutes",
          "🌿 JEERA WATER: Boil 1 tsp cumin seeds in water, strain and drink",
          "🧂 AJWAIN: Chew 1/2 tsp carom seeds with pinch of salt for instant relief",
          "🍯 HONEY-LEMON: Mix 1 tsp each honey & lemon in warm water - drink on empty stomach",
          "🥛 BUTTERMILK: Drink fresh chaas (buttermilk) with roasted jeera powder",
          "🍌 BLAND DIET: Eat banana, rice, toast, boiled potato for next 24 hours",
          "⚠️ AVOID: Spicy, oily, fried, citrus, carbonated drinks, coffee for 2-3 days",
          "🛏️ SLEEP ELEVATED: Keep head slightly raised while sleeping",
          "👨‍⚕️ Consult doctor if pain is severe, blood in stool, or symptoms persist 3+ days"
        ];
      } else if (hasSkin) {
        predictions = [
          {
            condition: "Contact Dermatitis",
            probability: 70,
            description: "Skin irritation caused by contact with an irritant or allergen.",
            specialty: "Dermatology"
          },
          {
            condition: "Eczema",
            probability: 55,
            description: "Chronic skin condition causing itchy, inflamed patches.",
            specialty: "Dermatology"
          }
        ];
        selfCareAdvice = [
          "🚫 AVOID IRRITANTS: Identify and avoid the substance that caused the reaction",
          "🧊 COLD COMPRESS: Apply cool, damp cloth to affected area for 10-15 minutes",
          "🧴 MOISTURIZE: Apply fragrance-free moisturizer immediately after bathing",
          "🌿 ALOE VERA: Apply fresh aloe vera gel to soothe irritated skin",
          " oatmeal BATH: Add colloidal oatmeal to lukewarm bath water for 15-20 minutes",
          "🧼 GENTLE CLEANSE: Use mild, fragrance-free soap; pat skin dry (don't rub)",
          "👕 LOOSE CLOTHING: Wear soft, breathable fabrics like cotton",
          "⚠️ DON'T SCRATCH: Keep fingernails short to prevent skin damage",
          "👨‍⚕️ See doctor if rash spreads, blisters, or doesn't improve in 3-5 days"
        ];
      } else if (symptomTypes.some(s => s.includes('urine') || s.includes('urinary'))) {
        predictions = [
          {
            condition: "Urinary Tract Infection (UTI)",
            probability: 75,
            description: "Infection in any part of the urinary system, causing burning sensation during urination and frequent urges.",
            specialty: "Urology"
          }
        ];
        selfCareAdvice = [
          "💧 HYDRATION: Drink 2-3 liters of water daily to flush out bacteria",
          "🍋 CRANBERRY: Drink unsweetened cranberry juice or take supplements - may prevent bacteria adhesion",
          "🧼 HYGIENE: Wipe front to back after using toilet to prevent bacterial spread",
          "👙 CLOTHING: Wear loose-fitting cotton underwear and change immediately if wet",
          "🛁 BATHING: Take showers instead of baths; avoid harsh soaps in genital area",
          "🛏️ URINATION: Urinate immediately after sexual activity to flush out bacteria",
          "🚫 HOLD URINE: Don't hold urine for long periods; empty bladder completely",
          "⚠️ AVOID: Bubble baths, feminine hygiene sprays, tight jeans",
          "👨‍⚕️ See urologist or gynecologist immediately for urine test and antibiotics"
        ];
      } else if (symptomTypes.some(s => s.includes('dizziness') && s.includes('vertigo'))) {
        predictions = [
          {
            condition: "Benign Paroxysmal Positional Vertigo (BPPV)",
            probability: 70,
            description: "Inner ear problem causing brief episodes of intense dizziness with head movement.",
            specialty: "ENT"
          },
          {
            condition: "Vestibular Neuritis",
            probability: 60,
            description: "Inflammation of the vestibular nerve causing severe vertigo without hearing loss.",
            specialty: "ENT"
          }
        ];
        selfCareAdvice = [
          "🛏️ POSITIONAL AVOIDANCE: Move slowly when changing positions (sitting to standing, lying down)",
          "🧘 EPLEY MANEUVER: If BPPV suspected, consult doctor for this specific head movement technique",
          "🧊 REST: Sit or lie down immediately when feeling dizzy to prevent falls",
          "👁️ FOCUS: Keep eyes fixed on a stationary object during dizzy spells",
          "💧 HYDRATION: Maintain adequate fluid intake as dehydration can worsen dizziness",
          "🧂 SALT INTAKE: Maintain normal salt intake - very low salt can worsen symptoms",
          "🚫 ALCOHOL: Avoid alcohol completely as it can worsen vertigo",
          "⚠️ SAFETY: Avoid driving, operating machinery, or climbing stairs during severe episodes",
          "👨‍⚕️ Consult ENT specialist for vestibular testing and specific treatment"
        ];
      } else if (symptomTypes.some(s => s.includes('eye') || s.includes('vision'))) {
        predictions = [
          {
            condition: "Eye Strain",
            probability: 75,
            description: "Tired, dry, or irritated eyes from extended screen time or poor lighting.",
            specialty: "Ophthalmology"
          },
          {
            condition: "Conjunctivitis (Pink Eye)",
            probability: 50,
            description: "Inflammation of the conjunctiva, often caused by infection or allergy.",
            specialty: "Ophthalmology"
          }
        ];
        selfCareAdvice = [
          "👁️ 20-20-20 RULE: Every 20 minutes, look at something 20 feet away for 20 seconds",
          "💧 ARTIFICIAL TEARS: Use preservative-free eye drops to lubricate dry eyes",
          "🌙 SCREEN BREAKS: Take 5-minute breaks every hour from digital screens",
          "🛋️ PROPER LIGHTING: Ensure adequate lighting when reading; avoid glare on screens",
          "🧊 WARM COMPRESS: For eye strain, apply warm compress for 5 minutes",
          "🧊 COLD COMPRESS: For pink eye, apply cold compress to reduce swelling",
          "🧼 HAND HYGIENE: Wash hands frequently to prevent spreading infection",
          "⚠️ AVOID RUBBING: Don't rub eyes, especially if irritated or infected",
          "👨‍⚕️ See doctor immediately if vision changes, severe pain, or discharge occurs"
        ];
      } else if (symptomTypes.some(s => s.includes('ear') || s.includes('hearing'))) {
        predictions = [
          {
            condition: "Ear Wax Buildup",
            probability: 70,
            description: "Excessive earwax causing blockage and temporary hearing loss.",
            specialty: "ENT"
          },
          {
            condition: "Ear Infection",
            probability: 55,
            description: "Infection in the ear causing pain, discharge, and hearing issues.",
            specialty: "ENT"
          }
        ];
        selfCareAdvice = [
          "👂 DON'T USE COTTON SWABS: Never insert objects into the ear canal",
          "💧 WARM OIL: Put 2-3 drops of warm olive or mineral oil in affected ear",
          "🧊 WARM COMPRESS: Apply to outer ear for pain relief (10-15 minutes)",
          "🧼 GENTLE CLEANING: Wipe outer ear with damp cloth only",
          "🛌 SLEEP POSITION: Sleep with affected ear facing up to help drain",
          "🚫 AVOID WATER: Keep ears dry while bathing/showering",
          "🍵 GARLIC OIL: Mix crushed garlic with warm oil, apply 2 drops (if no perforation)",
          "⚠️ NO HOME REMOVAL: Don't attempt to remove wax or foreign objects",
          "👨‍⚕️ See doctor for persistent pain, discharge, hearing loss, or dizziness"
        ];
      } else if (symptomTypes.some(s => s.includes('throat') || s.includes('sore'))) {
        predictions = [
          {
            condition: "Pharyngitis",
            probability: 75,
            description: "Inflammation of the throat causing pain and discomfort.",
            specialty: "General Medicine"
          },
          {
            condition: "Tonsillitis",
            probability: 50,
            description: "Inflammation of the tonsils, often caused by bacterial or viral infection.",
            specialty: "General Medicine"
          }
        ];
        selfCareAdvice = [
          " gargle: Salt water gargle 3-4 times daily (1/2 tsp salt in warm water)",
          "🍯 HONEY: Take 1 tsp honey directly or mix with warm tea/lemon",
          "🌡️ WARM LIQUIDS: Drink warm broth, herbal tea, or warm water with honey",
          "🧊 LOZENGES: Suck on throat lozenges to keep throat moist",
          " humidifier: Use humidifier or place bowl of water near bed",
          "🚫 SMOKING: Avoid smoking and secondhand smoke completely",
          "REST VOICE: Speak softly or rest voice as much as possible",
          "⚠️ AVOID: Spicy, acidic, or rough foods that irritate throat",
          "👨‍⚕️ See doctor if severe pain, high fever, white patches, or difficulty swallowing"
        ];
      } else if (symptomTypes.some(s => s.includes('back') || s.includes('spine'))) {
        predictions = [
          {
            condition: "Muscle Strain",
            probability: 75,
            description: "Overuse or injury to back muscles causing pain and stiffness.",
            specialty: "Orthopedics"
          },
          {
            condition: "Herniated Disc",
            probability: 45,
            description: "Compression of spinal nerves causing back pain and possible leg pain.",
            specialty: "Orthopedics"
          }
        ];
        selfCareAdvice = [
          "🧊 ICE THERAPY: Apply ice pack for 15-20 minutes (first 48 hours for acute pain)",
          "🔥 HEAT THERAPY: After 48 hours, use heating pad for 20 minutes to relax muscles",
          "🛏️ PROPER SLEEP: Sleep on firm mattress; place pillow between knees when lying on side",
          "🧘 GENTLE STRETCHING: Knee-to-chest stretch, cat-cow stretch, child's pose",
          "🚶 LIGHT ACTIVITY: Short walks to prevent stiffness (avoid bed rest > 2 days)",
          "🧎 PROPER POSTURE: Maintain good posture while sitting, standing, and lifting",
          "🏋️ AVOID HEAVY LIFTING: Don't lift anything heavy until pain subsides",
          "⚠️ RED FLAGS: Seek immediate care for numbness, tingling, or loss of bladder control",
          "👨‍⚕️ See doctor if pain persists > 3 days, radiates down legs, or severe stiffness"
        ];
      } else if (symptomTypes.some(s => s.includes('joint') && s.includes('stiffness'))) {
        predictions = [
          {
            condition: "Osteoarthritis",
            probability: 70,
            description: "Degenerative joint disease causing pain and stiffness, commonly affecting knees, hips, and fingers.",
            specialty: "Rheumatology"
          },
          {
            condition: "Rheumatoid Arthritis",
            probability: 55,
            description: "Autoimmune condition causing joint inflammation, stiffness, and swelling.",
            specialty: "Rheumatology"
          }
        ];
        selfCareAdvice = [
          "🔥 WARM COMPRESS: Apply warm compress or heating pad to stiff joints for 15-20 minutes",
          "🧘 GENTLE EXERCISE: Do low-impact activities like swimming, walking, or tai chi to maintain joint mobility",
          "💪 STRENGTHENING: Perform gentle resistance exercises to strengthen muscles around joints",
          "🧘 STRETCHING: Do daily stretching exercises to maintain flexibility and reduce stiffness",
          "🌿 TURMERIC: Take turmeric supplements or add to food - natural anti-inflammatory",
          "🐟 OMEGA-3: Eat fatty fish (salmon, mackerel) or take fish oil supplements to reduce inflammation",
          "🧊 COLD THERAPY: Apply ice pack for 10-15 minutes to reduce swelling during flare-ups",
          "⚖️ WEIGHT MANAGEMENT: Maintain healthy weight to reduce stress on weight-bearing joints",
          "🛏️ SLEEP: Get 7-9 hours of quality sleep to allow body to repair and reduce inflammation",
          "⚠️ AVOID: Repetitive motions, heavy lifting, high-impact activities during flare-ups",
          "👨‍⚕️ Consult rheumatologist if joint pain/stiffness persists or worsens"
        ];
      } else if (symptomTypes.some(s => s.includes('cough') && s.includes('blood'))) {
        predictions = [
          {
            condition: "Hemoptysis (Blood in Sputum)",
            probability: 75,
            description: "Coughing up blood, which may indicate respiratory tract infection or other serious conditions.",
            specialty: "Pulmonology"
          }
        ];
        selfCareAdvice = [
          "🚨 IMMEDIATE CARE: Seek urgent medical attention - blood in sputum requires evaluation",
          "🛑 STOP SMOKING: Completely avoid smoking and secondhand smoke",
          "💧 HYDRATION: Drink warm fluids to soothe throat and thin secretions",
          "🧼 HYGIENE: Cover mouth when coughing, dispose tissues properly, wash hands frequently",
          "🛏️ REST: Get adequate rest to allow body to heal",
          "🚫 AVOID: Irritants like dust, chemicals, strong perfumes",
          "👨‍⚕️ See pulmonologist immediately for chest X-ray and further evaluation"
        ];
      } else if (symptomTypes.some(s => s.includes('chest') && s.includes('tightness'))) {
        predictions = [
          {
            condition: "Asthma",
            probability: 70,
            description: "Chronic respiratory condition causing airway constriction, chest tightness, and breathing difficulty.",
            specialty: "Pulmonology"
          }
        ];
        selfCareAdvice = [
          "💨 BREATHING TECHNIQUE: Practice pursed-lip breathing - inhale through nose, exhale through pursed lips",
          "🧘 RELAXATION: Manage stress through meditation/yoga as anxiety can trigger attacks",
          "🧹 ENVIRONMENT: Keep living spaces clean, dust-free, use air purifiers if possible",
          "🚫 TRIGGERS: Identify and avoid triggers (pollen, dust, pet dander, smoke, strong odors)",
          "💧 HYDRATION: Drink plenty of water to keep airways moist",
          "🛏️ SLEEP: Elevate head while sleeping to ease breathing",
          "💊 MEDICATION: If prescribed inhaler, keep it accessible and use as directed",
          "⚠️ AVOID: Smoking, exposure to pollutants, extreme temperatures, intense exercise",
          "👨‍⚕️ Consult pulmonologist for pulmonary function tests and asthma action plan"
        ];
      } else if (symptomTypes.some(s => s.includes('abdominal') && s.includes('cramping'))) {
        predictions = [
          {
            condition: "Irritable Bowel Syndrome (IBS)",
            probability: 70,
            description: "Functional gastrointestinal disorder causing abdominal pain, cramping, bloating, and altered bowel habits.",
            specialty: "Gastroenterology"
          }
        ];
        selfCareAdvice = [
          "🍽️ LOW FODMAP DIET: Avoid high-FODMAP foods (onions, garlic, beans, certain fruits) that trigger symptoms",
          "🥦 FIBER INTAKE: Gradually increase soluble fiber (oats, psyllium) but avoid insoluble fiber during flare-ups",
          "💧 HYDRATION: Drink 8-10 glasses of water daily to aid digestion",
          "🧘 STRESS MANAGEMENT: Practice relaxation techniques as stress worsens IBS symptoms",
          "🕒 REGULAR MEALS: Eat small, frequent meals at regular intervals to regulate digestion",
          "🚫 AVOID: Carbonated drinks, chewing gum, artificial sweeteners, spicy/oily foods",
          "🚶 PHYSICAL ACTIVITY: Regular gentle exercise helps regulate bowel movements",
          "⚠️ FOOD DIARY: Keep track of foods that trigger symptoms to identify personal triggers",
          "👨‍⚕️ Consult gastroenterologist for proper diagnosis and treatment plan"
        ];
      } else if (symptomTypes.some(s => s.includes('memory') || s.includes('forgetfulness'))) {
        predictions = [
          {
            condition: "Mild Cognitive Impairment",
            probability: 65,
            description: "Subtle decline in cognitive abilities that's more than normal aging but not severe enough to interfere significantly with daily life.",
            specialty: "Neurology"
          }
        ];
        selfCareAdvice = [
          "🧠 MENTAL EXERCISE: Engage in brain-stimulating activities like puzzles, reading, learning new skills",
          "💪 PHYSICAL EXERCISE: Regular aerobic exercise improves blood flow to the brain",
          "🌙 QUALITY SLEEP: Maintain consistent sleep schedule (7-9 hours) as sleep is crucial for memory consolidation",
          "🥗 MEDITERRANEAN DIET: Eat fish, nuts, olive oil, fruits, vegetables - proven to support brain health",
          "👥 SOCIAL ENGAGEMENT: Stay socially active to maintain cognitive function",
          "📏 ORGANIZATION: Use calendars, lists, reminders to compensate for memory lapses",
          "🚫 AVOID: Excessive alcohol, smoking, chronic stress which can impair cognitive function",
          "⚠️ MONITOR: Keep track of memory changes and report significant worsening to doctor",
          "👨‍⚕️ Consult neurologist for cognitive screening and neurological evaluation"
        ];
      } else {
        // Generic mild symptoms
        predictions = [
          {
            condition: "General Malaise",
            probability: 65,
            description: "Mild symptoms suggesting general discomfort or early stage of illness.",
            specialty: "General Medicine"
          }
        ];
        selfCareAdvice = [
          "🛏️ REST: Get adequate sleep (7-8 hours) and listen to your body",
          "💧 HYDRATION: Drink 8-10 glasses of water, herbal teas, fresh juices",
          "🍊 IMMUNITY BOOST: Eat vitamin C rich foods - amla, oranges, lemon, guava",
          "🌿 KADHA: Boil tulsi, ginger, cinnamon, black pepper in water - drink warm",
          "🍯 TURMERIC MILK: Add 1/2 tsp turmeric to warm milk before bed",
          "🧘 STRESS RELIEF: Practice yoga, meditation, or deep breathing for 15 minutes",
          "🧼 HYGIENE: Wash hands frequently with soap and water",
          "🌡️ MONITOR: Keep track of any new symptoms or changes",
          "⚠️ AVOID: Smoking, alcohol, processed foods, staying up late",
          "👨‍⚕️ Consult doctor if symptoms worsen or don't improve in 3-4 days"
        ];
      }
    }
  }

  return {
    triageLevel,
    triageDescription,
    predictions,
    selfCareAdvice
  };
};


export const getAnalysis = async (symptoms: Symptom[], location: Location, profile: UserProfile): Promise<Omit<AnalysisResult, 'doctors'>> => {
  try {
    const symptomsString = symptoms.map(s =>
      `- ${s.name} (in ${s.bodyPart}), Severity: ${s.severity}/10, Duration: ${s.duration}${s.notes ? `, Notes: ${s.notes}` : ''}`
    ).join('\n');

    const prompt = `
      You are a Smart Health Assistant AI. Analyze the user's symptoms and provide a triage assessment. Respond ONLY with a valid JSON object matching the schema. No additional text.

      Patient Profile:
      - Age: ${profile.age}
      - Gender: ${profile.gender}

      Symptoms:
      ${symptomsString}

      CRITICAL FIRST STEP: Check for CARDIAC EMERGENCY symptoms
      Cardiac emergency indicators: chest pain, breathlessness, shortness of breath, left arm pain, left shoulder pain, jaw pain, neck pain, fainting, dizziness with chest pain, confusion, sudden sweating, severe weakness

      IF ANY cardiac emergency symptoms are present:
      - triageLevel: "Severe"
      - triageDescription: "CARDIAC EMERGENCY - Call emergency services immediately (108)"
      - predictions: [{"condition": "Heart Attack / Cardiac Emergency", "probability": 95, "description": "Critical cardiac symptoms detected requiring immediate medical attention", "specialty": "Cardiology"}]
      - selfCareAdvice: ["Call 108 emergency services immediately", "Do not attempt to drive yourself", "Stay calm and rest", "If available, take aspirin if no allergies"]

      IF NO cardiac emergency symptoms:
      Calculate severity score using these weights:
      chest pain=10, breathlessness=9, fainting=10, confusion=9, left arm pain=8, jaw pain=8, sudden sweating=8
      abdominal pain=7, vomiting=6, dizziness=6, nausea=5, back pain=5, headache=4, joint pain=4, diarrhea=4
      fever=3, fatigue=3, rash=3, cough=2, sore throat=2, sneezing=1

      Based on total severity score:
      - Score >= 8: triageLevel = "Severe", appropriate serious condition
      - Score 4-7: triageLevel = "Moderate", appropriate condition
      - Score < 4: triageLevel = "Minor", can be "Common Cold" for mild respiratory symptoms

      IMPORTANT: Never diagnose "Common Cold" if severity score >= 4 or if symptoms suggest serious conditions.
      `;

    // Try Gemini first, then OpenAI as fallback
    let response;
    let usedGemini = false;

    if (useGemini && geminiAI) {
      try {
        response = await geminiAI.models.generateContent({
          model: "gemini-1.5-pro",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: analysisResponseSchema,
            temperature: 0.1,
          },
        });
        usedGemini = true;
      } catch (geminiError) {
        console.warn("Gemini API failed, trying OpenAI:", geminiError);
      }
    }

    if (!response && useOpenAI) {
      // OpenAI fallback
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 1000,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const openaiText = openaiData.choices[0].message.content;

      // Parse OpenAI response as JSON
      try {
        const parsedResponse = JSON.parse(openaiText);
        response = { text: () => JSON.stringify(parsedResponse) };
      } catch (parseError) {
        throw new Error("Invalid JSON response from OpenAI");
      }
    }

    if (!response) {
      throw new Error("No AI service available");
    }

    const jsonText = response.text.trim();
    console.log("Raw AI response:", jsonText); // For debugging

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Invalid JSON response from AI");
    }

    // Validate required fields
    if (!result.triageLevel || !result.triageDescription || !result.predictions || !result.selfCareAdvice) {
      throw new Error("Incomplete response from AI: missing required fields");
    }

    const typedResult: Omit<AnalysisResult, 'doctors'> = {
      ...result,
      predictions: result.predictions.map((p: any) => ({ ...p, probability: Math.round(p.probability) })),
    };

    return typedResult;
  } catch (error) {
    console.warn("Error in getAnalysis, falling back to mock response:", error);

    // Check for cardiac emergency symptoms even in mock fallback
    const hasCardiacSymptoms = symptoms.some(s =>
      s.name.toLowerCase().includes('chest pain') ||
      s.name.toLowerCase().includes('breathless') ||
      s.name.toLowerCase().includes('shortness of breath') ||
      s.name.toLowerCase().includes('left arm pain') ||
      s.name.toLowerCase().includes('jaw pain') ||
      s.name.toLowerCase().includes('fainting') ||
      s.name.toLowerCase().includes('confusion') ||
      s.name.toLowerCase().includes('sudden sweating')
    );

    if (hasCardiacSymptoms) {
      return {
        triageLevel: TriageLevel.Severe,
        triageDescription: "CARDIAC EMERGENCY - Call emergency services immediately (108)",
        predictions: [
          {
            condition: "Heart Attack / Cardiac Emergency",
            probability: 95,
            description: "Critical cardiac symptoms detected requiring immediate medical attention",
            specialty: "Cardiology"
          }
        ],
        selfCareAdvice: [
          "Call 108 emergency services immediately",
          "Do not attempt to drive yourself",
          "Stay calm and rest",
          "If available, take aspirin if no allergies"
        ]
      };
    }

    // Intelligent mock response based on actual symptoms
    return generateIntelligentMockResponse(symptoms, profile);
  }
};


const wellnessTipsSchema = {
  type: Type.OBJECT,
  properties: {
    tips: {
      type: Type.ARRAY,
      description: 'List of personalized wellness tips.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'A short, catchy title for the tip.' },
          description: { type: Type.STRING, description: 'A brief, user-friendly explanation of the tip.' },
          category: {
            type: Type.STRING,
            enum: ['Mindfulness', 'Nutrition', 'Sleep', 'Activity'],
            description: 'The category of the wellness tip.'
          }
        },
        required: ['title', 'description', 'category']
      }
    }
  },
  required: ['tips']
};

export const getWellnessTips = async (logs: HealthLog[]): Promise<WellnessTip[]> => {
  try {
    if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
      throw new Error("API key not set");
    }

    const logsSummary = logs.map(log =>
      `- Date: ${log.date}, Mood: ${log.mood}, Sleep: ${log.sleepHours}h, Water: ${log.waterIntake} glasses`
    ).join('\n');

    const prompt = `
          You are an AI Wellness Coach. Based on the user's health logs for the past week, provide 3-4 personalized, actionable wellness tips.
          Focus on areas where the user might be struggling (e.g., low sleep, stressed mood) or could improve.

          User's Recent Health Logs:
          ${logsSummary}

          Instructions:
          1. Analyze the trends in the user's logs.
          2. Generate 3-4 diverse and practical wellness tips.
          3. For each tip, provide a title, description, and assign it to one of the following categories: 'Mindfulness', 'Nutrition', 'Sleep', 'Activity'.
          4. Your entire response MUST be a single JSON object that strictly adheres to the provided schema. Do not include any text outside of the JSON object.
      `;

    const response = await geminiAI!.models.generateContent({
      model: "gemini-1.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: wellnessTipsSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result.tips;
  } catch (error) {
    console.warn("Error in getWellnessTips, falling back to mock response:", error);
    // Mock response for development when API key is not set or API fails
    return [
      {
        title: "Improve Sleep Hygiene",
        description: "Establish a consistent sleep schedule and create a relaxing bedtime routine.",
        category: "Sleep"
      },
      {
        title: "Stay Hydrated",
        description: "Drink at least 8 glasses of water daily to maintain energy levels.",
        category: "Nutrition"
      },
      {
        title: "Practice Mindfulness",
        description: "Spend 10 minutes daily meditating to reduce stress and improve focus.",
        category: "Mindfulness"
      }
    ];
  }
};
