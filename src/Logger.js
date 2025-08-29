import { stringify } from "./util";

function nowStr() {
  return stringify(new Date());
}

export default class Logger {
  maxLogLength = -1;

  event(text, format) {
    console.log(
      `%c${nowStr()}%c ${text}`,
      "color:black;background:skyblue;font-style:italic",
      format
    );
    const extraClass = text.startsWith("Completed") ? "completed" : "";
    this.writeDivLog(text, extraClass);
  }

  error(text) {
    const t = `${nowStr()}: ${text}`;
    console.error(t), this.writeDivLog(text, "error");
  }

  writeDivLog(msg, extraClass) {
    if (!logDiv) return;
    const clockEl = document.createElement("span");
    (clockEl.innerHTML = nowStr()), clockEl.classList.add("clock");
    const msgEl = document.createElement("span");
    this.maxLogLength > 0 &&
      msg.length > this.maxLogLength &&
      (msg = `${msg.substring(0, this.maxLogLength)}...`),
      (msgEl.innerHTML = msg),
      (msgEl.style.whiteSpace = "pre"),
      msgEl.classList.add("msg"),
      extraClass && msgEl.classList.add(extraClass);
    const item = document.createElement("div");
    item.appendChild(clockEl),
      item.appendChild(msgEl),
      logDiv.appendChild(item);
  }
}
