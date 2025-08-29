export const rnd = (min, max) =>
  min + Math.floor(Math.random() * (max - min + 1));

/**
 * @param {Date} date
 * @returns {string}
 */
export function stringify(date) {
  const t = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((e) => (e < 10 ? `0${e}` : `${e}`))
    .join(":");
  let ms = `${date.getMilliseconds()}`;
  return (ms = `.${"0".repeat(3 - ms.length)}${ms}`), `${t}${ms}`;
}
