import { EditFormState } from "@/components/LedgerPreviewTable";
import { LedgerPreviewRow } from "@/lib/ledgerPreviewRows";
import { Transaction } from "@/types";

export const emailRegex = /^\w+([+.-]\w+)*@\w+([.-]\w+)*\.\w{2,4}$/;

export const formatCurrencyIntoYen = (amount: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
};

export function getCurrentMonthRange() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  return { startOfMonth, endOfMonth };
}

export function getMonthRange(monthNumber: number, year?: number) {
  const targetYear = year ?? new Date().getFullYear();

  const monthIndex = monthNumber - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    throw new Error("Invalid month number. Must be between 1 and 12.");
  }

  const startOfMonth = new Date(targetYear, monthIndex, 1, 0, 0, 0, 0);
  const endOfMonth = new Date(targetYear, monthIndex + 1, 0, 23, 59, 59, 999);

  return { startOfMonth, endOfMonth };
}

export function getTimeOfDayGreeting() {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Good morning, ";
  } else if (currentHour >= 12 && currentHour < 18) {
    return "Good afternoon, ";
  } else {
    return "Good evening, ";
  }
}

export const formatNumber = (value?: number) =>
  typeof value === "number" ? new Intl.NumberFormat("ja-JP").format(value) : "";

export const CARRY_OVER_DESCRIPTIONS = new Set([
  "前頁より繰越",
  "前期より繰越",
]);

export function isCarryOverRow(row: LedgerPreviewRow) {
  return (
    row.kind === "carry" ||
    CARRY_OVER_DESCRIPTIONS.has((row.description ?? "").trim())
  );
}

export function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function toInputDate(value: Date | string) {
  const date = toDate(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toIsoDateStart(value: string) {
  return `${value}T00:00:00.000Z`;
}

export function buildInitialEditState(transaction: Transaction): EditFormState {
  return {
    title: transaction.title,
    type: transaction.type,
    categoryId: transaction.category_id ?? "",
    amount: String(transaction.amount),
    date: toInputDate(transaction.date),
    currency: (transaction.currency || "JPY").toUpperCase() as
      | "JPY"
      | "EUR"
      | "USD",
  };
}

export const colorCodes = {
  // Reds & Warm Pinks
  rose: "#FEE2E2",
  coral: "#F87171",
  salmon: "#FB7185",
  ruby: "#F43F5E",
  watermelon: "#FF6B6B",
  flamingo: "#FCA5A5",
  blush: "#FDA4AF",
  hibiscus: "#E11D48",
  dustyPink: "#F9A8D4",
  softRed: "#FCA5A5",

  // Oranges & Ambers
  apricot: "#FED7AA",
  peach: "#FDBA74",
  tangerine: "#FB923C",
  amber: "#FACC15",
  honey: "#FCD34D",
  pumpkin: "#F97316",
  carrot: "#EA580C",
  clay: "#FCA652",
  copper: "#D97706",
  sunset: "#FB923C",

  // Yellows
  butter: "#FEF3C7",
  lemon: "#FDE68A",
  gold: "#FBBF24",
  sunflower: "#FCD34D",
  mustard: "#EAB308",
  straw: "#FACC15",
  flax: "#EABF9F",
  vanilla: "#FAE1B9",
  sand: "#FCE7B2",
  mellowYellow: "#FFF7AE",

  // Greens
  mint: "#86EFAC",
  jade: "#4ADE80",
  emerald: "#34D399",
  sage: "#A3E635",
  olive: "#A3B18A",
  pistachio: "#93C5FD",
  lime: "#84CC16",
  moss: "#65A30D",
  fern: "#4D7C0F",
  basil: "#15803D",

  // Blues
  sky: "#7DD3FC",
  babyBlue: "#BAE6FD",
  azure: "#60A5FA",
  denim: "#3B82F6",
  ocean: "#2563EB",
  navy: "#1D4ED8",
  teal: "#2DD4BF",
  turquoise: "#22D3EE",
  cyan: "#06B6D4",
  powderBlue: "#93C5FD",

  // Purples & Violets
  lavender: "#C4B5FD",
  violet: "#A78BFA",
  orchid: "#D8B4FE",
  lilac: "#E9D5FF",
  indigo: "#818CF8",
  grape: "#7C3AED",
  mauve: "#C084FC",
  amethyst: "#A855F7",
  iris: "#8B5CF6",
  periwinkle: "#93A8FB",

  // Browns & Earthy tones
  beige: "#F5F5DC",
  sandBrown: "#E4C590",
  caramel: "#D6A76A",
  toffee: "#C67C48",
  mocha: "#B08968",
  taupe: "#A78B71",
  coffee: "#8B5E3C",
  chestnut: "#7F5539",
  sienna: "#A0522D",
  terracotta: "#E07A5F",

  // Grays & Cool Neutrals
  gray: "#9CA3AF",
  coolGray: "#94A3B8",
  slate: "#64748B",
  warmGray: "#A8A29E",
  ash: "#B0B8C5",
  stone: "#D6D3D1",
  cloud: "#E5E7EB",
  silver: "#D1D5DB",
  smoke: "#737373",
  graphite: "#4B5563",

  // Extra Accents
  seafoam: "#99F6E4",
  aqua: "#67E8F9",
  skyMint: "#5EEAD4",
  blushPink: "#F9A8D4",
  iceBlue: "#E0F2FE",
  lavenderBlush: "#F5E1FF",
  peachCream: "#FFE4C4",
  // mintCream: "#F0FFF4",
  // ivory: "#FFFFF0",
  // alabaster: "#FAFAFA",
};

export const months = [
  { id: "1", name: "January" },
  { id: "2", name: "February" },
  { id: "3", name: "March" },
  { id: "4", name: "April" },
  { id: "5", name: "May" },
  { id: "6", name: "June" },
  { id: "7", name: "July" },
  { id: "8", name: "August" },
  { id: "9", name: "September" },
  { id: "10", name: "October" },
  { id: "11", name: "November" },
  { id: "12", name: "December" },
];

export const financeIcons = {
  hi: [
    // Essentials / everyday
    "HiShoppingBag",
    "HiBolt",
    "HiSun",
    "HiPhone",
    "HiWifi",
    "HiShoppingCart",
    "HiCake",
    "HiUserGroup",
    "HiCoffee",
    "HiEmojiHappy",
    "HiHeart",
    "HiSparkles",
    "HiLightBulb",

    // Travel / outdoors
    "HiMap",
    "HiCompass",
    "HiGlobeAlt",
    "HiSunrise",
    "HiCloud",
    "HiDeviceMobile",
    "HiPaperAirplane",
    "HiCamera",

    // Leisure / fun
    "HiMusicNote",
    "HiDeviceGamepad",
    "HiBookOpen",
    "HiTicket",
    "HiGift",

    // Work / learning / productivity
    "HiAcademicCap",
    "HiClipboardCheck",
    "HiChartBar",
    "HiChartPie",

    // Finance
    "HiCurrencyDollar",
    "HiCreditCard",
    "HiBanknotes",
    "HiTag",

    // Health & wellness
    "HiPill",
    "HiPaw",

    // New lifestyle additions
    "HiFire", // energy / fitness
    "HiBeaker", // science / self-improvement
    "HiGlobe", // travel
    "HiChatAlt2", // communication

    "HiHome",
    "HiOfficeBuilding",
    "HiBuildingLibrary",
  ],

  fa: [
    // Everyday / communication
    "FaCoffee",
    "FaSmile",
    "FaHeart",
    "FaPhone",
    "FaSun",
    "FaWifi",
    "FaPaperPlane",

    // Travel / leisure
    "FaCar",
    "FaBus",
    "FaPlane",
    "FaBicycle",
    "FaCamera",
    "FaMapMarkedAlt",
    "FaUmbrellaBeach",

    // Fitness / lifestyle
    "FaRunning",
    "FaDumbbell",
    "FaSwimmer",

    // Food / drink
    "FaAppleAlt",
    "FaPizzaSlice",
    "FaGlassCheers",
    "FaBeer",

    // Entertainment / hobbies
    "FaMusic",
    "FaFilm",
    "FaGamepad",
    "FaBook",
    "FaGift",

    // Finance
    "FaChartPie",
    "FaCreditCard",
    "FaMoneyBillWave",
  ],

  md: [
    // Wellness / nature
    "MdHealthAndSafety",
    "MdOutlineLocalPharmacy",
    "MdOutlinePets",
    "MdOutlineSpa",
    "MdOutlineEmojiNature",
    "MdOutlineSelfImprovement",

    // Fitness
    "MdOutlineSportsSoccer",
    "MdOutlineFitnessCenter",

    // Food & drink
    "MdRestaurantMenu",
    "MdFastfood",
    "MdLocalDrink",
    "MdLocalDining",

    // Entertainment / leisure
    "MdOutlineMovie",
    "MdMusicNote",
    "MdSportsEsports",
    "MdOutlineCameraAlt",
    "MdMenuBook",
    "MdOutlineLibraryBooks",
    "MdConfirmationNumber",
    "MdCardGiftcard",

    // Travel / exploration
    "MdExplore",
    "MdOutlineMap",
    "MdWbSunny",
    "MdCloud",
    "MdFlightTakeoff",
    "MdFlight",
    "MdOutlineBeachAccess",

    // Finance / productivity
    "MdAttachMoney",
    "MdCreditCard",
    "MdAccountBalance",
    "MdBarChart",
    "MdPieChart",
    "MdLabel",
    "MdAccessTime",
    "MdLightbulb",
    "MdPhoneIphone",

    // Housing / essentials
    "MdElectricBolt",
    "MdWaterDrop",
    "MdOutlineHome",
    "MdOutlineBusiness",
    "MdOutlineApartment",
  ],

  bi: [
    "BiDumbbell", // fitness
    "BiDrink", // beverage / relax
    "BiSpa", // relaxation / self-care
    "BiMusic", // music
    "BiCamera", // photography
    "BiCycling", // sports / outdoor
    "BiMoviePlay", // entertainment
    "BiPlanet", // travel / nature
    "BiHeartCircle", // wellness
  ],
};
