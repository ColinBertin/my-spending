export const emailRegex = /^\w+([+.-]\w+)*@\w+([.-]\w+)*\.\w{2,4}$/;

export const formatCurrencyIntoYen = (amount: number) => {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
};
