const form = document.getElementById("chat-form");
const chat = document.getElementById("chat");
let socket;

function connectSocket() {
  socket = new WebSocket("ws://localhost:8000/ws/ask");
  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.event === "ready") return;
      if (data.event === "done") return;
    } catch {
      // token text
      if (window.currentBot) {
        window.currentBot.textContent += event.data;
        chat.scrollTop = chat.scrollHeight;
      }
    }
  });
}
connectSocket();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("question").value.trim();
  if (!q) return;

  const userMsg = document.createElement("div");
  userMsg.className = "text-right";
  userMsg.textContent = "🧑 " + q;
  chat.appendChild(userMsg);

  const botMsg = document.createElement("div");
  botMsg.className = "text-left text-green-700 whitespace-pre-wrap";
  chat.appendChild(botMsg);
  window.currentBot = botMsg;

  socket.send(JSON.stringify({ question: q }));
  form.reset();
});
