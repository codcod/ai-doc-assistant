const form = document.getElementById("chat-form");
const chat = document.getElementById("chat");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("question").value.trim();
  if (!q) return;

  const userMsg = document.createElement("div");
  userMsg.className = "text-right";
  userMsg.textContent = "🧑 " + q;
  chat.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "text-left text-blue-700 whitespace-pre-wrap";
  chat.appendChild(botMsg);

  const url = `http://localhost:8000/ask/stream?question=${encodeURIComponent(q)}`;
  const source = new EventSource(url);

  source.onmessage = (e) => {
    botMsg.textContent += e.data;
    chat.scrollTop = chat.scrollHeight;
  };

  source.addEventListener("done", () => {
    source.close();
  });

  form.reset();
});
