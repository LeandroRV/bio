const text = "Apenas um Analista de Sistemas que gosta de surf e cerveja!";
  const typingEffect = document.getElementById("typing-effect");
  let i = 0;

  function type() {
    if (i < text.length) {
      typingEffect.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, 50); // ajuste o tempo de delay aqui
    } else {
      // add cursor element
      const cursor = document.createElement("span");
      cursor.textContent = "|";
      cursor.style.animation = "blink 1s";
      typingEffect.appendChild(cursor);

      // remove cursor when animation is complete
      cursor.addEventListener("animationend", () => {
        cursor.remove();
      });
    }
  }

  type();