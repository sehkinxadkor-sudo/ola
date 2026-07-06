(function () {
  "use strict";

  const labels = {
    easy: "Лёгкая подсказка",
    hard: "Сложная подсказка"
  };

  window.OlaQuestHints = {
    render(container, openedHints, question) {
      container.innerHTML = "";
      openedHints.forEach((type) => {
        const hint = document.createElement("div");
        hint.className = "hint";
        hint.dataset.hint = type;
        hint.innerHTML = `
          <div>
            <strong>${labels[type]}</strong>
            <span>${question.hints[type]}</span>
          </div>
          <button type="button" aria-label="Закрыть подсказку" data-close-hint="${type}">×</button>
        `;
        container.appendChild(hint);
      });
    },

    syncButtons(buttons, openedHints) {
      Object.entries(buttons).forEach(([type, button]) => {
        const used = openedHints.includes(type);
        button.disabled = used;
        button.classList.toggle("is-used", used);
      });
    }
  };
})();
