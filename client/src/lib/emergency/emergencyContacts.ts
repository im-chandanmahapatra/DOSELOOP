/**
 * DoseLoop India Emergency Contacts & Official Services Registry
 *
 * Verified against official Government of India sources:
 * - Emergency Response Support System (ERSS / 112 India): https://112.gov.in (Ministry of Home Affairs)
 * - National Health Mission (NHM) Ambulance Services: https://nhm.gov.in (Ministry of Health & Family Welfare)
 * - Directorate General Fire Services, Civil Defence & Home Guards (MHA)
 * - Tele-MANAS (National Tele Mental Health Programme): https://telemanas.mohfw.gov.in
 */

export interface EmergencyContactInfo {
  id: string;
  name: string;
  number: string;
  dial: string;
  category: "all" | "medical" | "police" | "fire" | "specialized";
  scope: "nationwide" | "state_dependent";
  authority: string;
  officialSourceUrl: string;
  description: string;
  availabilityNote: string;
  recommendedFor: string;
  primary?: boolean;
}

export const INDIAN_EMERGENCY_SERVICES: EmergencyContactInfo[] = [
  {
    id: "erss-112",
    name: "National Emergency Response Support System (ERSS)",
    number: "112",
    dial: "tel:112",
    category: "all",
    scope: "nationwide",
    authority: "Ministry of Home Affairs (MHA), Govt. of India",
    officialSourceUrl: "https://112.gov.in",
    description:
      "Pan-India single unified emergency helpline for all critical emergencies. Automatically routes calls to nearest Police, Fire, Ambulance, or Disaster Response centers.",
    availabilityNote:
      "Nationwide 24/7 across all 28 States and 8 Union Territories. Works from all mobile phones & landlines, even without SIM balance, roaming, or screen unlock.",
    recommendedFor:
      "Immediate life-threatening situations, accidents, crimes in progress, severe medical crises, or when unsure which specific agency to dial.",
    primary: true,
  },
  {
    id: "ambulance-108",
    name: "Emergency Medical Response / Ambulance (108 EMS)",
    number: "108",
    dial: "tel:108",
    category: "medical",
    scope: "state_dependent",
    authority: "National Health Mission (NHM) / State Health Departments",
    officialSourceUrl: "https://nhm.gov.in",
    description:
      "Toll-free 24/7 emergency response ambulance service equipped with trained Emergency Medical Technicians (EMTs) for pre-hospital stabilization and critical trauma care.",
    availabilityNote:
      "Operational across 30+ States and Union Territories via Public-Private Partnerships (e.g. GVK-EMRI, ZHL). In integrated districts, calls may bridge to 112 ERSS. Availability is subject to state fleet allocation.",
    recommendedFor:
      "Road accidents, severe chest pain / heart attack, acute stroke, respiratory distress, severe trauma, poison ingestion, burns, or snakebite emergencies.",
  },
  {
    id: "ambulance-102",
    name: "National Ambulance Service (102 Maternal & Infant Transport)",
    number: "102",
    dial: "tel:102",
    category: "medical",
    scope: "state_dependent",
    authority: "Ministry of Health & Family Welfare / JSSK Scheme",
    officialSourceUrl: "https://nhm.gov.in",
    description:
      "Free patient transport service under Janani Shishu Suraksha Karyakram (JSSK) and Janani Suraksha Yojana (JSY), primarily connecting rural and urban homes with public health institutions.",
    availabilityNote:
      "State-dependent availability. Intended primarily for scheduled and referral maternal/infant transport rather than high-velocity trauma care. For critical trauma or accidents, dial 108 or 112.",
    recommendedFor:
      "Pregnant mothers going for institutional delivery, post-delivery hospital drop-backs, and transfer of sick newborns/infants up to 1 year of age to public healthcare facilities.",
  },
  {
    id: "fire-101",
    name: "Fire and Rescue Services",
    number: "101",
    dial: "tel:101",
    category: "fire",
    scope: "nationwide",
    authority: "Directorate General Fire Services, Civil Defence & Home Guards (MHA)",
    officialSourceUrl: "https://dgfscdhg.gov.in",
    description:
      "Direct municipal and state fire emergency response for building fires, industrial hazards, chemical leaks, structural collapses, and entrapment rescues.",
    availabilityNote:
      "Active nationwide. Calls in many modernized telecom circles and smart cities are automatically bridged to 112 ERSS integrated dispatch centers.",
    recommendedFor:
      "Fire outbreaks, electrical short-circuit fires, gas cylinder leaks, building collapses, and emergency physical rescues.",
  },
  {
    id: "police-100",
    name: "Police Emergency (Legacy PCR Helpline)",
    number: "100",
    dial: "tel:100",
    category: "police",
    scope: "nationwide",
    authority: "Ministry of Home Affairs / State Police Departments",
    officialSourceUrl: "https://mha.gov.in",
    description:
      "Traditional police control room helpline for crime reporting, public safety, and law enforcement dispatch.",
    availabilityNote:
      "112 is the primary pan-India integrated emergency number. 100 remains operational for legacy accessibility and routes to 112 ERSS in fully transitioned districts.",
    recommendedFor:
      "Crimes in progress, physical assault, theft, public disturbance, or urgent law-enforcement intervention.",
  },
];

export const SPECIALIZED_INDIAN_HELPLINES: EmergencyContactInfo[] = [
  {
    id: "tele-manas-14416",
    name: "Tele-MANAS (National Mental Health Helpline)",
    number: "14416 / 1800-891-4416",
    dial: "tel:14416",
    category: "specialized",
    scope: "nationwide",
    authority: "Ministry of Health & Family Welfare / NIMHANS",
    officialSourceUrl: "https://telemanas.mohfw.gov.in",
    description:
      "Comprehensive 24/7 mental health crisis support, psychological first-aid, and counseling delivered in 20+ Indian languages by trained counselors.",
    availabilityNote: "Toll-free, 24/7 nationwide service across all States & Union Territories.",
    recommendedFor:
      "Severe emotional distress, anxiety, depression, suicidal thoughts, and psychological crises.",
  },
  {
    id: "women-1091",
    name: "Women in Distress Helpline",
    number: "1091",
    dial: "tel:1091",
    category: "specialized",
    scope: "nationwide",
    authority: "Ministry of Women & Child Development / State Police",
    officialSourceUrl: "https://wcd.nic.in",
    description:
      "Emergency assistance and rescue helpline for women facing domestic violence, harassment, assault, or distress.",
    availabilityNote:
      "Toll-free 24/7 service operated in coordination with state police and one-stop crisis centers.",
    recommendedFor:
      "Women in immediate distress, domestic violence situations, stalking, or harassment.",
  },
  {
    id: "childline-1098",
    name: "Childline (Emergency Child Helpline)",
    number: "1098",
    dial: "tel:1098",
    category: "specialized",
    scope: "nationwide",
    authority: "Ministry of Women & Child Development (Integrated with ERSS 112)",
    officialSourceUrl: "https://wcd.nic.in",
    description:
      "Emergency outreach and rescue service for children in need of immediate care, protection, and medical aid.",
    availabilityNote: "24/7 toll-free nationwide service, integrated under Mission Vatsalya.",
    recommendedFor: "Runaway, abandoned, abused, medically neglected, or endangered children.",
  },
  {
    id: "cyber-1930",
    name: "National Cyber Financial Crime Helpline",
    number: "1930",
    dial: "tel:1930",
    category: "specialized",
    scope: "nationwide",
    authority: "Indian Cyber Crime Coordination Centre (I4C), MHA",
    officialSourceUrl: "https://cybercrime.gov.in",
    description:
      "Rapid financial fraud freeze helpline to prevent loss of funds within the golden hour following digital banking or UPI fraud.",
    availabilityNote: "Operational across all Indian banking networks and state cyber crime cells.",
    recommendedFor:
      "Immediate reporting of unauthorized UPI, credit card, net-banking, or phishing fraud.",
  },
];
