const STORAGE_KEY = "supportpilot_custom_products";

export const mockProducts = [
  {
    id: "thermocare-pro-900",
    name: "ThermoCare Pro 900",
    category: "Climate Control",
    model: "TCP-900",
    status: "Live",
    company: "Northwind Labs",
    description:
      "A connected HVAC monitor that helps facilities teams track temperature swings and service health across multiple zones.",
    lastUpdated: "2026-06-02",
    documents: [
      {
        id: "tcp-manual",
        title: "Installation Manual",
        type: "Manual",
        format: "PDF",
        updatedAt: "2026-05-18",
      },
      {
        id: "tcp-networking",
        title: "Network Pairing Checklist",
        type: "Checklist",
        format: "DOC",
        updatedAt: "2026-05-27",
      },
      {
        id: "tcp-warranty",
        title: "Warranty and Service Terms",
        type: "Policy",
        format: "PDF",
        updatedAt: "2026-04-11",
      },
    ],
    commonIssues: [
      "Device not connecting to facility Wi-Fi",
      "Zone sensor stuck in calibration",
      "Dashboard shows delayed readings",
    ],
    metrics: {
      openTickets: 12,
      aiAssistRate: "84%",
      docCoverage: "19 articles",
    },
  },
  {
    id: "voltmate-x2",
    name: "VoltMate X2",
    category: "Consumer Electronics",
    model: "VM-X2",
    status: "Beta",
    company: "Aster Devices",
    description:
      "A portable power hub for field teams, built with battery health telemetry, USB-C fast charging, and remote diagnostics.",
    lastUpdated: "2026-06-09",
    documents: [
      {
        id: "vmx-battery",
        title: "Battery Health Guide",
        type: "Guide",
        format: "PDF",
        updatedAt: "2026-06-01",
      },
      {
        id: "vmx-firmware",
        title: "Firmware Recovery Notes",
        type: "Playbook",
        format: "DOC",
        updatedAt: "2026-05-15",
      },
    ],
    commonIssues: [
      "Fast charging pauses unexpectedly",
      "Power indicator blinking amber",
      "Battery health drops after storage",
    ],
    metrics: {
      openTickets: 8,
      aiAssistRate: "79%",
      docCoverage: "11 articles",
    },
  },
  {
    id: "aquasense-mini",
    name: "AquaSense Mini",
    category: "IoT Sensor",
    model: "ASM-110",
    status: "Live",
    company: "Harbor Systems",
    description:
      "A water-quality sensor used in distributed field deployments, with alerts for pH drift, low battery, and offline nodes.",
    lastUpdated: "2026-05-28",
    documents: [
      {
        id: "asm-field",
        title: "Field Setup Guide",
        type: "Manual",
        format: "PDF",
        updatedAt: "2026-05-02",
      },
      {
        id: "asm-alerts",
        title: "Alert Escalation Matrix",
        type: "Policy",
        format: "DOC",
        updatedAt: "2026-04-19",
      },
      {
        id: "asm-cleaning",
        title: "Sensor Cleaning SOP",
        type: "Checklist",
        format: "PDF",
        updatedAt: "2026-03-23",
      },
    ],
    commonIssues: [
      "Sensor offline after transport",
      "Readings drift during long sessions",
      "Low-battery alerts not clearing",
    ],
    metrics: {
      openTickets: 5,
      aiAssistRate: "88%",
      docCoverage: "14 articles",
    },
  },
];

const fallbackPlaybook = {
  title: "General Troubleshooting",
  answer:
    "I wasn't able to match your question to a specific diagnostic. Here are some general steps that resolve most issues quickly.",
  checklist: [
    "Power cycle the device and wait 30 seconds before reconnecting.",
    "Check that firmware is up to date using the companion app or admin portal.",
    "Review the device's indicator lights and compare them with the status guide in the manual.",
  ],
  sources: [],
};

const diagnosticPlaybooks = [
  {
    match: ["battery", "power", "charge", "charging"],
    title: "Power and Battery Recovery",
    answer:
      "The symptoms point to a power-management issue. Start by confirming cable integrity, battery temperature, and whether recent firmware changes modified charge behavior.",
    checklist: [
      "Inspect the cable and adapter for wattage compatibility.",
      "Leave the device disconnected for 60 seconds, then reconnect with a known-good charger.",
      "Review recent firmware updates and reset the battery profile if supported.",
    ],
    sources: ["Battery Health Guide", "Firmware Recovery Notes"],
  },
  {
    match: ["wifi", "network", "pair", "offline", "connect"],
    title: "Connectivity and Pairing Flow",
    answer:
      "This looks like a connectivity path issue. Most teams resolve it by re-running pairing, checking signal quality near the device, and verifying that the device is on the expected network segment.",
    checklist: [
      "Confirm the Wi-Fi credentials and network band are supported.",
      "Move the device closer to the access point during pairing.",
      "Verify the firewall or VLAN is not blocking outbound telemetry.",
    ],
    sources: ["Network Pairing Checklist", "Field Setup Guide"],
  },
  {
    match: ["temperature", "heat", "overheat", "sensor", "calibration"],
    title: "Sensor and Thermal Validation",
    answer:
      "The issue likely involves sensor calibration or thermal drift. Compare the live reading against a baseline instrument and check whether the device recently changed environments.",
    checklist: [
      "Re-run the calibration process from the device settings.",
      "Let the unit stabilize in the target environment for 10 minutes.",
      "Inspect vents or the sensor housing for dust or moisture.",
    ],
    sources: ["Installation Manual", "Sensor Cleaning SOP"],
  },
];

export function getStoredProducts() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getAllProducts() {
  return [...getStoredProducts(), ...mockProducts];
}

export function getProductById(productId) {
  return getAllProducts().find((product) => product.id === productId) || null;
}

export function saveProduct(product) {
  const products = getStoredProducts();
  const nextProducts = [product, ...products.filter((item) => item.id !== product.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts));
  return product;
}

export function updateProduct(productId, updates) {
  const existing = getProductById(productId);
  if (!existing) {
    return null;
  }

  const nextProduct = { ...existing, ...updates };
  saveProduct(nextProduct);
  return nextProduct;
}

export function getDashboardStats(products) {
  const totalProducts = products.length;
  const openTickets = products.reduce(
    (sum, product) => sum + (product.metrics?.openTickets || 0),
    0,
  );

  return {
    totalProducts,
    openTickets,
    aiResolutionRate: "82%",
    activeDocs: products.reduce(
      (sum, product) => sum + (product.documents?.length || 0),
      0,
    ),
  };
}

export function generateDiagnosticResponse(message, product) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("diagnostic checks")) {
    const hasChecked = normalizedMessage.includes("[x]");
    const hasUnchecked = normalizedMessage.includes("[ ]");

    if (hasChecked && !hasUnchecked) {
      return {
        title: "Root Cause Identified",
        content: `Excellent progress. Since all the safe inspection steps for ${product.name} are completed and verified, we have successfully ruled out cables, connections, and basic configurations. The most probable root cause is a component-level hardware failure or deep firmware corruption. I recommend checking the warranty terms or requesting a spare part replacement.`,
        checklist: [],
        sources: [
          {
            id: `${product.id}-source-warranty`,
            label: "Warranty and Service Terms",
            type: "Policy",
          }
        ],
      };
    } else if (hasChecked && hasUnchecked) {
      return {
        title: "Triage Progressing",
        content: `Thank you for the update. Since you verified some checklist items but some are still pending for ${product.name}, we are narrowing down the scope. Please complete the remaining checks (marked with [ ]) to help rule out the remaining external issues.`,
        checklist: [],
        sources: [],
      };
    } else {
      return {
        title: "Awaiting Diagnostic Verification",
        content: `It appears no inspection checks were confirmed yet for ${product.name}. Please try the steps listed in the previous diagnostic checklist and check them off when done. Let me know if you hit any safety or access obstacles.`,
        checklist: [],
        sources: [],
      };
    }
  }

  const matchedPlaybook =
    diagnosticPlaybooks.find((playbook) =>
      playbook.match.some((keyword) => normalizedMessage.includes(keyword)),
    ) || fallbackPlaybook;

  return {
    title: matchedPlaybook.title,
    content: `${matchedPlaybook.answer} For ${product.name}, I would prioritize the checks that affect the ${product.category.toLowerCase()} workflow first.`,
    checklist: matchedPlaybook.checklist,
    sources: matchedPlaybook.sources.map((label, index) => ({
      id: `${product.id}-source-${index + 1}`,
      label,
      type: "Document",
    })),
  };
}
