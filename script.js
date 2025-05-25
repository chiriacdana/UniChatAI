const API_KEY = "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";
const MODEL = "meta-llama/llama-3-8b-instruct";

const specializari = {
    "informatica": {
        name: "Informatică",
        url: "https://orar.ulbsibiu.ro/stiinte.php?p=226&a=1"
    },
    "matematica": {
        name: "Matematică-Informatică",
        url: "https://orar.ulbsibiu.ro/stiinte.php?p=224&a=1"
    },
    "info": {
        name: "Informatică",
        url: "https://orar.ulbsibiu.ro/stiinte.php?p=226&a=1"
    },
    "mate": {
        name: "Matematică-Informatică",
        url: "https://orar.ulbsibiu.ro/stiinte.php?p=224&a=1"
    }
};

document.getElementById("welcome-time").textContent = new Date().toLocaleString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

function appendMessage(message, sender) {
    const chatbox = document.getElementById("chatbox");
    const messageElement = document.createElement("div");
    messageElement.className = `${sender}-message message`;
    const now = new Date();
    const timestamp = now.toLocaleString('ro-RO', {
        hour: '2-digit',
        minute: '2-digit'
    });
    messageElement.innerHTML = `${message}<div class="timestamp">${timestamp}</div>`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function quickAction(action) {
    document.getElementById("userInput").value = action;
    sendMessage();
}

async function getOrar(specializare) {
    const specializareLower = specializare.toLowerCase();
    const specializareInfo = specializari[specializareLower] ||
        Object.values(specializari).find(s => s.name.toLowerCase().includes(specializareLower));
    if (!specializareInfo) {
        return `Nu am găsit specializarea "${specializare}".<br>
        Te rog încearcă cu una dintre următoarele:<br>
        - Informatică<br>
        - Matematică`;
    }
    return `
    <div class="orar-container">
        <strong>Orar ${specializareInfo.name}:</strong><br>
        <a href="${specializareInfo.url}" target="_blank" class="orar-btn">Vezi orarul oficial</a>
        <p style="margin-top:8px;font-size:0.8rem;">Dacă link-ul nu funcționează, accesează direct <a href="https://orar.ulbsibiu.ro" target="_blank">orar.ulbsibiu.ro</a></p>
    </div>
    `;
}

async function sendMessage() {
    const userInput = document.getElementById("userInput").value.trim();
    if (!userInput) return;

    appendMessage(userInput, "user");
    document.getElementById("userInput").value = "";

    if (userInput.toLowerCase().includes("orar")) {
        const loadingElement = document.createElement("div");
        loadingElement.className = "loading";
        loadingElement.textContent = "Se încarcă orarul...";
        document.getElementById("chatbox").appendChild(loadingElement);

        try {
            let specializare = "informatica";
            if (userInput.toLowerCase().includes("mate") || userInput.toLowerCase().includes("matematica")) {
                specializare = "matematica";
            }
            const raspunsOrar = await getOrar(specializare);
            document.getElementById("chatbox").removeChild(loadingElement);
            appendMessage(raspunsOrar, "bot");
        } catch (error) {
            document.getElementById("chatbox").removeChild(loadingElement);
            appendMessage("A apărut o eroare. Te rog încearcă direct pe <a href='https://orar.ulbsibiu.ro' target='_blank'>orar.ulbsibiu.ro</a>", "bot");
        }
        return;
    }

    const loadingElement = document.createElement("div");
    loadingElement.className = "loading";
    loadingElement.textContent = "Chatbot scrie...";
    document.getElementById("chatbox").appendChild(loadingElement);

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: `Ești un asistent IT pentru Universitatea "Lucian Blaga" din Sibiu. Răspunde profesionist în română la întrebări despre:
- WiFi (rețeaua Eduroam)
- Classroom (platforma de învățământ online)
- Resetare parole
- Conturi instituționale
- Software educațional
- Orarul cursurilor

Specializări disponibile:
- Informatică
- Matematică-Informatică

Fii concis și oferă soluții practice. Dacă nu știi răspunsul, îndrumă utilizatorul către departamentul IT.`
                    },
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        document.getElementById("chatbox").removeChild(loadingElement);

        if (data.choices && data.choices.length > 0) {
            const botReply = data.choices[0].message.content;
            appendMessage(botReply, "bot");
        } else {
            appendMessage("Îmi pare rău, nu am putut genera un răspuns acum. Te rog încearcă mai târziu.", "bot");
        }
    } catch (error) {
        document.getElementById("chatbox").removeChild(loadingElement);
        appendMessage("A apărut o eroare la conectarea cu serverul. Te rog încearcă din nou.", "bot");
    }
}

// Permite trimiterea mesajului la apăsarea tastei Enter
document.getElementById("userInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
