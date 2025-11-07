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

export const financeIcons = {
  hi: [
    "HiHome",
    "HiOfficeBuilding",
    "HiShoppingBag",
    "HiKey",
    "HiBolt",
    "HiSun",
    "HiPhone",
    "HiWifi",
    "HiDesktopComputer",
    "HiShoppingCart",
    "HiCake",
    "HiUserGroup",
    "HiCoffee",
    "HiEmojiHappy",
    "HiCar",
    "HiBus",
    "HiAcademicCap",
    "HiTrain",
    "HiPaperAirplane",
    "HiHeart",
    "HiPill",
    "HiClipboardCheck",
    "HiBandage",
    "HiPaw",
    "HiFilm",
    "HiMusicNote",
    "HiDeviceGamepad",
    "HiCamera",
    "HiBookOpen",
    "HiTicket",
    "HiCurrencyDollar",
    "HiCreditCard",
    "HiBanknotes",
    "HiChartBar",
    "HiChartPie",
    "HiGift",
    "HiTag",
    "HiClock",
    "HiGlasses",
    "HiScissors",
    "HiSparkles",
    "HiGlobeAlt",
    "HiMap",
    "HiCompass",
    "HiSunrise",
    "HiCloud",
    "HiLightBulb",
    "HiDeviceMobile",
    "HiCurrencyYen",
  ],
  fa: [
    "FaHome",
    "FaBuilding",
    "FaShoppingBag",
    "FaKey",
    "FaBolt",
    "FaSun",
    "FaPhone",
    "FaWifi",
    "FaDesktop",
    "FaShoppingCart",
    "FaBirthdayCake",
    "FaUsers",
    "FaCoffee",
    "FaSmile",
    "FaCar",
    "FaBus",
    "FaGraduationCap",
    "FaTrain",
    "FaPaperPlane",
    "FaHeart",
  ],
  md: [
    "MdHealthAndSafety",
    "MdOutlineLocalPharmacy",
    "MdOutlinePets",
    "MdOutlineMovie",
    "MdMusicNote",
    "MdSportsEsports",
    "MdOutlineCameraAlt",
    "MdMenuBook",
    "MdConfirmationNumber",
    "MdAttachMoney",
    "MdCreditCard",
    "MdAccountBalance",
    "MdBarChart",
    "MdPieChart",
    "MdCardGiftcard",
    "MdLabel",
    "MdAccessTime",
    "MdOutlineWatch",
    "MdOutlineMap",
    "MdExplore",
    "MdWbSunny",
    "MdCloud",
    "MdLightbulb",
    "MdPhoneIphone",
    "MdCurrencyYen",
    "MdOutlineSportsSoccer",
  ],
  bi: ["BiDumbbell"],
};
