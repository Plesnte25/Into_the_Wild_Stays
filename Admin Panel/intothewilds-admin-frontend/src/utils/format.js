export const number = (n = 0) => new Intl.NumberFormat("en-IN").format(n);

export const currencyINR = (n = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export const percent = (n = 0) => `${Number(n).toFixed(1)}%`;
