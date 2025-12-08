// --- 1. Navigation Logic (SPA) ---
const navLinksContainer = document.querySelector('.nav-links');
const sections = document.querySelectorAll('.page-section');
const navItems = document.querySelectorAll('.nav-links a');

// Fungsi Pindah Halaman
function showPage(pageId) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
        // Sedikit hack biar yang home/info displaynya flex
        if(section.id === 'info') section.style.display = 'none'; 
    });

    // Remove active class from all nav links
    navItems.forEach(link => link.classList.remove('active-link'));

    // Show target section
    const targetSection = document.getElementById(pageId);
    targetSection.classList.add('active');
    
    // Khusus page info kita set flex biar center
    if(pageId === 'info') targetSection.style.display = 'flex';

    // Highlight nav item
    document.getElementById(`nav-${pageId}`).classList.add('active-link');

    // Tutup menu di mobile kalau diklik
    navLinksContainer.classList.remove('nav-active');
}

// Hamburger Menu
function toggleMenu() {
    navLinksContainer.classList.toggle('nav-active');
}

// --- 2. Sewa Bot Logic (Redirect WA) ---
function orderBot(paket, harga) {
    const phone = "6285185032092";
    const text = `Halo Owner, saya mau sewa bot *Paket ${paket}* seharga Rp ${harga.toLocaleString('id-ID')}. Mohon info pembayarannya.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Copy Text Function (Donasi)
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Nomor berhasil disalin: " + text);
    });
}

// --- 3. Chat AI Logic (Xyon Bot) ---
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const apiKey = 'csk-mwxrfk94v8txn2nw2ym538hk38j6cm9vketfxrd9xcf6jc4t'; // API KEY

// System Prompt
const systemPrompt = `kamu adalah xyon bot, yang dibuat oleh shanove, kamu itu imut & lucu, gaya teks nya juga lucu, jika ada yang menanyakan ig owner @shnvnkonv_, jika ada yang menanyakan owner kamu itu adalah leo. Jawablah dengan emoji yang imut. Jika diminta kode, berikan kode yang rapi.`;

// Simpan History Chat
let conversationHistory = [
    { role: "system", content: systemPrompt }
];

async function sendChat() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Tampilkan Chat User
    addMessage(text, 'user-msg');
    userInput.value = '';

    // 2. Masukkan ke history
    conversationHistory.push({ role: "user", content: text });

    // 3. Tampilkan Loading
    const loadingId = addMessage("Xyon lagi mikir... 🌀", 'bot-msg', true);

    try {
        // 4. Hit API Cerebras (Pake fetch biar native)
        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b',
                messages: conversationHistory,
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        // Hapus loading
        const loadingBubble = document.getElementById(loadingId);
        if(loadingBubble) loadingBubble.remove();

        if (data.choices && data.choices.length > 0) {
            const botReply = data.choices[0].message.content;
            
            // 5. Tampilkan Balasan Bot
            addMessage(botReply, 'bot-msg');
            
            // 6. Masukkan balasan ke history
            conversationHistory.push({ role: "assistant", content: botReply });
        }

    } catch (error) {
        console.error(error);
        const loadingBubble = document.getElementById(loadingId);
        if(loadingBubble) loadingBubble.remove();
        addMessage("Maaf, Xyon lagi pusing nih (Error API) 😵‍💫", 'bot-msg');
    }
}

// Fungsi Helper Nambah Bubble
function addMessage(content, type, isItalic = false) {
    const div = document.createElement('div');
    div.classList.add('message', type);
    const id = 'msg-' + Date.now();
    div.id = id;

    // Cek ada code block (```) gak? Kalau ada format sederhana
    let formattedContent = content;
    
    // Simple logic buat deteksi code block (basic markdown parsing)
    if (content.includes("```")) {
        formattedContent = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        formattedContent = formattedContent.replace(/\n/g, "<br>"); // Line break text biasa
    } 

    div.innerHTML = `
        <div class="msg-bubble" style="${isItalic ? 'font-style:italic; color:#aaa;' : ''}">
            ${formattedContent}
        </div>
    `;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

// Event Listeners
sendBtn.addEventListener('click', sendChat);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChat();
});
