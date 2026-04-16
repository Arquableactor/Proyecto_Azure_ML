const dropZone       = document.getElementById("dropZone");
const fileInput      = document.getElementById("fileInput");
const preview        = document.getElementById("preview");
const btn            = document.getElementById("btnClasificar");
const resultadoDiv   = document.getElementById("resultado");

const previewWrapper = document.getElementById("previewWrapper");
const previewBadge   = document.getElementById("previewBadge");
const spinner        = document.getElementById("spinner");
const btnText        = document.getElementById("btnText");
const errorMsg       = document.getElementById("errorMsg");
const resultIcon     = document.getElementById("resultIcon");
const resultLabel    = document.getElementById("resultLabel");
const resultPct      = document.getElementById("resultPct");
const progressFill   = document.getElementById("progressFill");
const tipBox         = document.getElementById("tipBox");

let selectedFile = null;

const recycleTips = {
    default:      { icon: "♻️",  tip: "Verifica el símbolo de reciclaje antes de desechar." },
    plastico:     { icon: "🧴",  tip: "<strong>Plástico:</strong> Vacía y enjuaga el envase. Coloca en el contenedor amarillo." },
    vidrio:       { icon: "🫙",  tip: "<strong>Vidrio:</strong> Deposita en el contenedor verde. No mezcles con cerámicas." },
    papel:        { icon: "📄",  tip: "<strong>Papel/Cartón:</strong> Asegúrate de que esté seco y limpio. Contenedor azul." },
    metal:        { icon: "🥫",  tip: "<strong>Metal:</strong> Lata limpia va al contenedor amarillo. El aluminio es 100% reciclable." },
    organico:     { icon: "🍂",  tip: "<strong>Orgánico:</strong> Úsalo para compostaje o depósitalo en el contenedor marrón." },
    electronico:  { icon: "💻",  tip: "<strong>Electrónico:</strong> Lleva a un punto limpio. No tires en contenedores normales." },
    peligroso:    { icon: "⚠️",  tip: "<strong>Peligroso:</strong> Requiere gestión especial. Lleva a un punto de recogida autorizado." },
};

function getTip(tagName) {
    const key = Object.keys(recycleTips).find(k => tagName.toLowerCase().includes(k));
    return recycleTips[key] || recycleTips.default;
}

dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    handleFile(e.target.files[0]);
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFile(e.dataTransfer.files[0]);
});

function handleFile(file) {
    if (!file) return;
    selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
        preview.src = reader.result;
        previewWrapper.classList.add("visible");
        const name = file.name.length > 22 ? file.name.slice(0, 20) + "…" : file.name;
        previewBadge.textContent = name;
        resultadoDiv.classList.remove("visible");
        errorMsg.classList.remove("visible");
    };
    reader.readAsDataURL(file);
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add("visible");
}

function setLoading(loading) {
    btn.disabled = loading;
    spinner.style.display = loading ? "block" : "none";
    btnText.textContent   = loading ? "Clasificando…" : "Clasificar residuo";
}

btn.addEventListener("click", async () => {
    if (!selectedFile) {
        showError("Selecciona una imagen primero.");
        return;
    }

    errorMsg.classList.remove("visible");
    resultadoDiv.classList.remove("visible");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        const response = await fetch("http://localhost:5200/api/clasificacion", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        const mejor = data.predictions[0];

        const pct  = (mejor.probability * 100).toFixed(1);
        const info = getTip(mejor.tagName);

        resultIcon.textContent  = info.icon;
        resultLabel.textContent = mejor.tagName;
        resultPct.textContent   = pct + "%";
        tipBox.innerHTML        = info.tip;

        resultadoDiv.classList.add("visible");

        setTimeout(() => {
            progressFill.style.width = pct + "%";
        }, 50);

    } catch (error) {
        console.error(error);
        showError("No se pudo conectar con la API. Verifica que el servidor esté activo.");
    } finally {
        setLoading(false);
    }
});