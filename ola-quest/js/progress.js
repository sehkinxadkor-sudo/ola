(function () {
  "use strict";

  window.OlaQuestProgress = {
    formatTime(totalSeconds) {
      const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
      const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
      return `${minutes}:${seconds}`;
    },

    update({ index, total, hints }, elements) {
      const percent = Math.round((index / total) * 100);
      elements.bar.style.width = `${percent}%`;
      elements.label.textContent = `${percent}%`;
      elements.counter.textContent = `Вопрос ${Math.min(index + 1, total)} из ${total}`;
      elements.hints.textContent = `Подсказки: ${hints}`;
    }
  };
})();
