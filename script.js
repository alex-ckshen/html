// --- DOM REFERENCES & CONSTANTS ---
const codeEditor = document.getElementById('code-editor');
const lineNumbersDiv = document.getElementById('line-numbers');
const previewFrame = document.getElementById('preview-frame');
const desktopBtn = document.getElementById('desktop-btn');
const tabletBtn = document.getElementById('tablet-btn');
const phoneBtn = document.getElementById('phone-btn');
const deviceControlBtns = [desktopBtn, tabletBtn, phoneBtn];
const copyBtn = document.getElementById('copy-btn');
const copyIcon = document.getElementById('copy-icon');
const copyText = document.getElementById('copy-text');
const wipeBtn = document.getElementById('wipe-btn');
const runBtn = document.getElementById('run-btn');
const toggleEditorBtn = document.getElementById('toggle-editor-btn');
const editorContainer = document.getElementById('editor-container');
const previewContainer = document.getElementById('preview-container');
const customMessageDiv = document.getElementById('custom-message');

const initialEditorCode = ''; // Editor starts empty
const initialPreviewCode = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:sans-serif;color:#4b5563;text-align:center;padding:1rem;"><div><h1 style="font-size:2rem;font-weight:bold;color:#1f2937;margin-bottom:1rem;">Welcome!</h1><p>Your code preview appears here.</p></div></div>`;

// --- UTILITY FUNCTIONS ---
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// --- CORE FUNCTIONS ---
function updateAllPanes() {
    updateLineNumbers();
    updatePreview();
}

function updatePreview() {
    const code = codeEditor.value;
    const content = code.trim() === '' ? initialPreviewCode : code;
    // Note: The `<\/script>` is necessary here to prevent the browser from closing the main script tag prematurely.
    previewFrame.srcdoc = `<html><head><script src="https://cdn.tailwindcss.com"><\/script><style>body{margin:0}</style></head><body>${content}</body></html>`;
}

function updateLineNumbers() {
    const lineCount = codeEditor.value.split('\n').length;
    lineNumbersDiv.innerHTML = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
    synchronizeScroll();
}

function synchronizeScroll() {
    lineNumbersDiv.scrollTop = codeEditor.scrollTop;
}

async function copyCode() {
    const codeToCopy = codeEditor.value;
    let copied = false;
    
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(codeToCopy);
            copied = true;
        } catch (err) {
            console.error('Async copy failed:', err);
        }
    }
    
    if (!copied) {
        const textArea = document.createElement("textarea");
        textArea.value = codeToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            copied = true;
        } catch (err) {
            console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
    }

    if (copied) {
        copyIcon.classList.add('hidden');
        copyText.classList.remove('hidden');
        setTimeout(() => {
            copyIcon.classList.remove('hidden');
            copyText.classList.add('hidden');
        }, 2000);
    }
}

function showEditorView() {
    previewContainer.classList.add('hidden');
    editorContainer.classList.remove('hidden', 'flex-col');
    editorContainer.classList.add('flex', 'flex-col');
}

function showPreviewView() {
    editorContainer.classList.add('hidden');
    previewContainer.classList.remove('hidden');
    previewContainer.classList.add('flex', 'flex-col');
}

function handlePreviewClick(width, button) {
    updatePreview();
    previewFrame.style.width = width;
    if (button) {
        deviceControlBtns.forEach(btn => btn.classList.remove('bg-cyan-500', 'text-white'));
        button.classList.add('bg-cyan-500', 'text-white');
    }
    showPreviewView();
}

// --- EVENT HANDLERS ---
const debouncedUpdate = debounce(updateAllPanes, 250);

codeEditor.addEventListener('input', debouncedUpdate);
codeEditor.addEventListener('scroll', synchronizeScroll);

codeEditor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 2;
    }
});

copyBtn.addEventListener('click', copyCode);

wipeBtn.addEventListener('click', () => {
    customMessageDiv.textContent = '';
    customMessageDiv.classList.add('is-empty');
    codeEditor.value = '';
    updateAllPanes();
    showEditorView();
});

customMessageDiv.addEventListener('input', () => {
    customMessageDiv.classList.toggle('is-empty', customMessageDiv.textContent.trim() === '');
});

toggleEditorBtn.addEventListener('click', showEditorView);
desktopBtn.addEventListener('click', () => handlePreviewClick('100%', desktopBtn));
tabletBtn.addEventListener('click', () => handlePreviewClick('768px', tabletBtn));
phoneBtn.addEventListener('click', () => handlePreviewClick('375px', phoneBtn));
runBtn.addEventListener('click', () => handlePreviewClick('100%', desktopBtn));

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => { // Use DOMContentLoaded for faster script execution
    codeEditor.value = initialEditorCode;
    updateAllPanes();
    desktopBtn.classList.add('bg-cyan-500', 'text-white');
    showEditorView();
});
