import { supabase } from "./supabase";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export async function getAuthToken() {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {
    // Supabase offline
  }

  const localSessionStr = localStorage.getItem("doseloop_local_session");
  if (localSessionStr) {
    try {
      const parsed = JSON.parse(localSessionStr);
      return parsed.access_token || "local_token_aman";
    } catch {
      // ignore
    }
  }
  return "local_token_aman";
}

// Map the old mock URLs to the new backend endpoints to preserve locked frontend contracts
function mapUrl(url: string) {
  if (url === "/user/profile") return "/users/profile";
  if (url === "/dashboard/summary") return "/dashboard/summary";
  if (url === "/dashboard/analytics") return "/dashboard/analytics";
  if (url === "/medications/today") return "/medications/today";
  if (url === "/medications") return "/medications";
  if (url === "/emergency") return "/emergency";
  if (url === "/notifications") return "/notifications";
  if (url.startsWith("/notifications/")) return url;
  if (url === "/family") return "/family";
  if (url.startsWith("/family/")) return url;
  if (url.startsWith("/wellness/")) return url;
  if (url === "/feedback") return "/feedback";
  if (url === "/settings/preferences" || url === "/settings/export" || url === "/settings/account")
    return url;
  if (url === "/ai/chat") return "/ai/chat";
  if (url === "/doses/today") return "/medications/today";
  if (url.startsWith("/doses/")) {
    const id = url.split("/")[2];
    return `/medications/doses/${id}`;
  }
  return url;
}

// Helper to get local user info
function getActiveUser() {
  const saved = localStorage.getItem("doseloop_local_user");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        id: parsed.id || "usr_aman",
        firstName: parsed.user_metadata?.firstName || parsed.firstName || "Aman",
        lastName: parsed.user_metadata?.lastName || parsed.lastName || "Kumar",
        email: parsed.email || "aman@doseloop.com",
        role: "ADMIN",
        plan: "pro",
        theme: "system",
        privacyEnabled: false,
        emailNotifications: true,
        pushNotifications: true,
      };
    } catch {
      // ignore
    }
  }
  return {
    id: "usr_aman",
    firstName: "Aman",
    lastName: "Kumar",
    email: "aman@doseloop.com",
    role: "ADMIN",
    plan: "pro",
    theme: "system",
    privacyEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
  };
}

// Local mock database for offline fallback
function getLocalFallback(url: string): unknown {
  const user = getActiveUser();

  if (url === "/user/profile" || url === "/users/profile") {
    return user;
  }

  if (url === "/dashboard/summary") {
    return {
      familyHealthScore: { score: 96, delta: "+4% this week" },
      nextDose: {
        medicationName: "Metformin",
        time: "02:00 PM",
        dosage: "500mg",
        inLabel: "in 2 hrs",
      },
      familyPulse: [
        {
          id: "fam_1",
          name: "Priya",
          relation: "Sister",
          initials: "P",
          mood: "great",
          meds: "done",
          hydration: 85,
        },
        {
          id: "fam_2",
          name: "Papa",
          relation: "Father",
          initials: "P",
          mood: "okay",
          meds: "due",
          hydration: 65,
        },
      ],
      healthRings: [
        {
          id: "ring_meds",
          value: 4,
          goal: 4,
          label: "Meds",
          unit: "doses",
          color: "primary",
        },
        {
          id: "ring_water",
          value: 1800,
          goal: 2500,
          label: "Water",
          unit: "ml",
          color: "info",
        },
        {
          id: "ring_wellness",
          value: 8,
          goal: 10,
          label: "Wellness",
          unit: "pts",
          color: "gold",
        },
      ],
    };
  }

  if (url === "/dashboard/analytics") {
    return {
      stats: [
        {
          label: "7-day adherence",
          chip: "bg-primary/10 text-primary",
          icon: "Target",
          value: "96%",
          sub: "+3% vs last week",
        },
        {
          label: "Current streak",
          chip: "bg-warning/10 text-warning",
          icon: "Flame",
          value: "14 days",
          sub: "Personal best: 28",
        },
        {
          label: "Avg hydration",
          chip: "bg-info/10 text-info",
          icon: "Droplets",
          value: "2,250 ml",
          sub: "90% of daily goal",
        },
        {
          label: "Family check-ins",
          chip: "bg-success/10 text-success",
          icon: "TrendingUp",
          value: "100%",
          sub: "All circles active",
        },
      ],
      adherenceWeek: [
        { day: "Mon", taken: 4, total: 4 },
        { day: "Tue", taken: 4, total: 4 },
        { day: "Wed", taken: 3, total: 4 },
        { day: "Thu", taken: 4, total: 4 },
        { day: "Fri", taken: 4, total: 4 },
        { day: "Sat", taken: 4, total: 4 },
        { day: "Sun", taken: 4, total: 4 },
      ],
    };
  }

  if (url === "/doses/today" || url === "/medications/today") {
    const saved = localStorage.getItem("doseloop_local_doses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const defaultDoses = [
      {
        id: "dose_1",
        medicationId: "med_1",
        name: "Metformin",
        medicationName: "Metformin",
        dosage: "500mg",
        time: "08:00 AM",
        status: "taken",
        critical: true,
        color: "#3B82F6",
      },
      {
        id: "dose_2",
        medicationId: "med_2",
        name: "Vitamin D3",
        medicationName: "Vitamin D3",
        dosage: "2000 IU",
        time: "01:00 PM",
        status: "upcoming",
        critical: false,
        color: "#F59E0B",
      },
      {
        id: "dose_3",
        medicationId: "med_3",
        name: "Omega-3 Fish Oil",
        medicationName: "Omega-3 Fish Oil",
        dosage: "1000mg",
        time: "08:00 PM",
        status: "upcoming",
        critical: false,
        color: "#10B981",
      },
    ];
    localStorage.setItem("doseloop_local_doses", JSON.stringify(defaultDoses));
    return defaultDoses;
  }

  if (url === "/medications") {
    const saved = localStorage.getItem("doseloop_local_medications");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const defaultMeds = [
      {
        id: "med_1",
        name: "Metformin",
        dosage: "500mg",
        form: "PILL",
        frequency: "Twice daily",
        critical: true,
        color: "#3B82F6",
        refillIn: 12,
        notes: "Take after food",
      },
      {
        id: "med_2",
        name: "Vitamin D3",
        dosage: "2000 IU",
        form: "PILL",
        frequency: "Once daily",
        critical: false,
        color: "#F59E0B",
        refillIn: 25,
        notes: "Morning with breakfast",
      },
      {
        id: "med_3",
        name: "Omega-3 Fish Oil",
        dosage: "1000mg",
        form: "PILL",
        frequency: "Once daily",
        critical: false,
        color: "#10B981",
        refillIn: 18,
        notes: "Night after dinner",
      },
    ];
    localStorage.setItem("doseloop_local_medications", JSON.stringify(defaultMeds));
    return defaultMeds;
  }

  if (url === "/family") {
    return [
      {
        id: "fam_1",
        name: "Priya Sharma",
        relation: "Sister",
        role: "OWNER",
        sharesMedication: true,
        sharesWellness: true,
      },
      {
        id: "fam_2",
        name: "Rajesh Kumar",
        relation: "Father",
        role: "CONNECTED",
        sharesMedication: true,
        sharesWellness: false,
      },
    ];
  }

  if (url === "/emergency") {
    return {
      contacts: [
        {
          id: "emg_1",
          name: "Priya Sharma",
          relation: "Sister",
          phone: "+91 98765 43210",
          email: "priya@example.com",
          isPrimary: true,
        },
      ],
      events: [],
    };
  }

  if (url === "/notifications") {
    return [
      {
        id: "notif_1",
        title: "Afternoon Dose Reminder",
        body: "Time to take Vitamin D3 (2000 IU)",
        type: "REMINDER",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "notif_2",
        title: "Family Circle Update",
        body: "Papa completed his morning wellness check-in.",
        type: "SYSTEM",
        isRead: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  if (url === "/wellness/history") {
    return {
      moods: [{ date: new Date().toISOString(), score: 4 }],
      waterLogs: [{ date: new Date().toISOString(), amountMl: 1500 }],
    };
  }

  if (url.startsWith("/settings/")) {
    return {
      theme: "system",
      emailNotifications: true,
      pushNotifications: true,
      privacyEnabled: false,
    };
  }

  return [];
}

export const fetcher = async (url: string) => {
  const token = await getAuthToken();
  const backendUrl = mapUrl(url);

  try {
    const res = await fetch(`${API_BASE}${backendUrl}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data && json.meta) return json.data;
      if (json.data) return json.data;
      return json;
    }
  } catch {
    // Fall back to local mock data on network / server error
  }

  return getLocalFallback(url);
};

export const updater = async (url: string, data: unknown, method: string = "POST") => {
  const token = await getAuthToken();
  const backendUrl = mapUrl(url);

  try {
    const res = await fetch(`${API_BASE}${backendUrl}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      return res.json();
    }
  } catch {
    // Fall back to local simulation
  }

  // Handle local state updates
  if (url.startsWith("/doses/")) {
    const doseId = url.split("/")[2];
    const status = (data as { status?: string })?.status;
    const saved = localStorage.getItem("doseloop_local_doses");
    if (saved && status) {
      try {
        const doses = JSON.parse(saved);
        const updated = doses.map((d: { id: string }) => (d.id === doseId ? { ...d, status } : d));
        localStorage.setItem("doseloop_local_doses", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    return { success: true, id: doseId, status };
  }

  if (url === "/medications" && method === "POST") {
    const saved = localStorage.getItem("doseloop_local_medications");
    const meds = saved ? JSON.parse(saved) : [];
    const newMed = {
      id: `med_${Date.now()}`,
      ...(data as object),
    };
    meds.push(newMed);
    localStorage.setItem("doseloop_local_medications", JSON.stringify(meds));
    return newMed;
  }

  return { success: true, data };
};
