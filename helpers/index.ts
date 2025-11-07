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
