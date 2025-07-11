document.getElementById("startCountdown").addEventListener("click", startCountdown);
document.getElementById("resetCountdown").addEventListener("click", resetCountdown);

// === Drag & Drop Background ===
function allowDrop(ev) {
    ev.preventDefault();
}

function drop(ev) {
    ev.preventDefault();
    const file = ev.dataTransfer.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
        const content = document.getElementById("content");
        content.style.backgroundImage =
            `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${reader.result})`;
        content.style.backgroundSize = "cover";
        shouldUpdateBackground = false;
    };
    if (file) {
        reader.readAsDataURL(file);
    }
}


// === Countdown Logic ===
let countdownfunction;
let updateSeconds;
let updateMinutes;
let countdownDatapass = [];

window.onload = () => {
    const storedData = localStorage.getItem('countdownDatapass');
    if (storedData) {
        countdownDatapass = JSON.parse(storedData);
    }
    displayCountdownDatapass();

    const now = new Date();
    document.getElementById("year").value = now.getFullYear();
    document.getElementById("month").value = now.getMonth() + 1;
    document.getElementById("day").value = now.getDate();
    document.getElementById("hour").value = now.getHours();
    document.getElementById("minute").value = now.getMinutes();
    document.getElementById("second").value = now.getSeconds();
};

function startCountdown() {
    const pastDate = getInputDate();
    const now = new Date();

    if (pastDate >= now) {
        document.getElementById("countdown").innerHTML = "ERROR";
        return;
    }

    clearInterval(countdownfunction);
    clearInterval(updateSeconds);
    clearInterval(updateMinutes);

    if (countdownDatapass.length >= 5) countdownDatapass.shift();
    countdownDatapass.push({
        year: String(pastDate.getFullYear()).padStart(4, '0'),
        month: String(pastDate.getMonth() + 1).padStart(2, '0'),
        day: String(pastDate.getDate()).padStart(2, '0'),
        hour: String(pastDate.getHours()).padStart(2, '0'),
        minute: String(pastDate.getMinutes()).padStart(2, '0')
    });

    saveData();
    displayCountdownDatapass();

    countdownfunction = setInterval(() => {
        const now = new Date();
        const diffMS = now.getTime() - pastDate.getTime();
        const diffSeconds = Math.floor(diffMS / 1000);
        const secondsStr = String(diffSeconds).padStart(10, '0');
        const millisecondsStr = String(diffMS % 1000).padStart(3, '0');
        const firstNonZeroIndex = secondsStr.split('').findIndex(c => c !== '0');

        document.getElementById("countdown").style.setProperty('--zero-count', firstNonZeroIndex);
        document.getElementById("countdown").innerHTML =
            secondsStr.substring(firstNonZeroIndex) + '.' + millisecondsStr;

        const diff = new Date(diffMS);
        const totalDays = Math.floor(diffSeconds / (24 * 3600));
        document.getElementById("time").innerHTML =
            `${String(diff.getUTCFullYear() - 1970).padStart(3, '0')}-` +
            `${String(diff.getUTCMonth()).padStart(2, '0')}-` +
            `${String(diff.getUTCDate() - 1).padStart(2, '0')}-` +
            `${String(diff.getUTCHours()).padStart(2, '0')}:` +
            `${String(diff.getUTCMinutes()).padStart(2, '0')}:` +
            `${String(diff.getUTCSeconds()).padStart(2, '0')}`;

        document.getElementById("totalDays").innerHTML = totalDays;
    }, 1);
}

function getInputDate() {
    return new Date(
        document.getElementById("year").value,
        document.getElementById("month").value - 1,
        document.getElementById("day").value,
        document.getElementById("hour").value,
        document.getElementById("minute").value,
        document.getElementById("second").value
    );
}

// === Display Countdown History ===
function displayCountdownDatapass() {
    const container = document.getElementById("countdownDatapass");
    container.innerHTML = "";
    const now = new Date();

    countdownDatapass.forEach((data, i) => {
        const formatField = (value, current) =>
            value !== current ? `<span style='color:#fb7c00;'>${value}</span>` : value;

        const item = document.createElement("div");
        item.innerHTML = `
      <span>data${i + 1}</span>：
      ${formatField(data.year, String(now.getFullYear()))}-
      ${formatField(data.month, String(now.getMonth() + 1).padStart(2, '0'))}-
      ${formatField(data.day, String(now.getDate()).padStart(2, '0'))}-
      ${formatField(data.hour, String(now.getHours()).padStart(2, '0'))}:
      ${formatField(data.minute, String(now.getMinutes()).padStart(2, '0'))}
    `;
        item.onclick = () => {
            Object.entries(data).forEach(([key, value]) => {
                document.getElementById(key).value = value;
            });
            item.style.color = "#fb7c00";
            startCountdown();
        };
        container.appendChild(item);
    });
}

// === Save Countdown Data ===
function saveData() {
    countdownDatapass.forEach(entry => delete entry.second);
    removeDuplicates();
    localStorage.setItem('countdownDatapass', JSON.stringify(countdownDatapass));
}

function removeDuplicates() {
    const uniqueSet = new Set(countdownDatapass.map(JSON.stringify));
    countdownDatapass = Array.from(uniqueSet).map(JSON.parse);
    localStorage.setItem('countdownDatapass', JSON.stringify(countdownDatapass));
}

// === Reset Countdown ===
function resetCountdown() {
    clearInterval(countdownfunction);
    clearInterval(updateSeconds);
    clearInterval(updateMinutes);

    document.getElementById("countdown").innerHTML = "0000000000.000";
    document.getElementById("time").innerHTML = "000-00-00-00:00:00";

    updateSeconds = setInterval(() => {
        document.getElementById("second").value =
            String(new Date().getSeconds()).padStart(2, '0');
    }, 1000);

    updateMinutes = setInterval(() => {
        document.getElementById("minute").value =
            String(new Date().getMinutes()).padStart(2, '0');
    }, 60000);
}
// === Shortcut Buttons Listener ===
document.querySelectorAll('.shortcut-buttons .button').forEach(button => {
    button.addEventListener('click', () => {
        const secondsAgo = parseInt(button.getAttribute('data-time'), 10);
        const past = new Date(Date.now() - secondsAgo * 1000);

        // 设置表单值
        document.getElementById("year").value = past.getFullYear();
        document.getElementById("month").value = past.getMonth() + 1;
        document.getElementById("day").value = past.getDate();
        document.getElementById("hour").value = past.getHours();
        document.getElementById("minute").value = past.getMinutes();
        document.getElementById("second").value = past.getSeconds();

        // 启动倒计时
        startCountdown();
    });
});
document.getElementById("about-button").addEventListener("click", () => {
    window.open("https://aj300542.github.io/", "_blank");
});
