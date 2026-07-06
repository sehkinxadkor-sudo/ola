(function () {
  "use strict";

  const bg = new Image();
  bg.src = "assets/images/certificate-bg.jpg";

  function drawWrapped(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    words.forEach((word, index) => {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > maxWidth && index > 0) {
        ctx.fillText(line.trim(), x, y);
        line = `${word} `;
        y += lineHeight;
      } else {
        line = test;
      }
    });
    ctx.fillText(line.trim(), x, y);
  }

  window.OlaQuestCertificate = {
    createId() {
      const date = new Date();
      const stamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
      ].join("");
      return `OQ-${stamp}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
    },

    draw(canvas, { name, time, hints, id }) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bg.complete) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#0B0B11";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.fillStyle = "rgba(7, 7, 11, 0.82)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#D8B86A";
      ctx.lineWidth = 8;
      ctx.strokeRect(72, 72, canvas.width - 144, canvas.height - 144);
      ctx.strokeStyle = "rgba(216, 184, 106, 0.38)";
      ctx.lineWidth = 2;
      ctx.strokeRect(104, 104, canvas.width - 208, canvas.height - 208);

      const date = new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date());

      ctx.textAlign = "center";
      ctx.fillStyle = "#D8B86A";
      ctx.font = "800 82px Georgia";
      ctx.fillText("Сертификат", 800, 250);

      ctx.fillStyle = "#B7AD9A";
      ctx.font = "700 34px Arial";
      ctx.fillText("подтверждает, что ты прошла мой квест", 800, 310);

      ctx.fillStyle = "#F7F0DF";
      ctx.font = "italic 92px Georgia";
      ctx.fillText(name || "Оля", 800, 430);

      ctx.fillStyle = "#B7AD9A";
      ctx.font = "700 30px Arial";
      drawWrapped(ctx, `15 загадок решены. Время: ${time}. Использовано подсказок: ${hints}.`, 800, 510, 980, 42);

      ctx.fillStyle = "#D8B86A";
      ctx.font = "800 32px Arial";
      ctx.fillText(date, 800, 646);

      ctx.fillStyle = "#8C7CFF";
      ctx.font = "700 26px Arial";
      ctx.fillText(id, 800, 704);

      ctx.fillStyle = "#D88491";
      ctx.font = "52px Brush Script MT";
      ctx.fillText("Секретный приз ждёт дальше", 800, 784);
    },

    download(canvas, filename, statusElement) {
      canvas.toBlob((blob) => {
        if (!blob) {
          if (statusElement) statusElement.textContent = "Не получилось создать файл. Попробуй ещё раз.";
          return;
        }
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
        if (statusElement) {
          statusElement.innerHTML = `Сертификат готов. Если файл не скачался автоматически, <a href="${url}" target="_blank" rel="noopener">открой его здесь</a>.`;
        }
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      }, "image/png");
    }
  };
})();
