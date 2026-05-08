const ayaSelect =
    document.getElementById("ayaSelect");

const inputText =
    document.getElementById("inputText");

const checkButton =
    document.getElementById("checkButton");

const clearButton =
    document.getElementById("clearButton");

const status =
    document.getElementById("status");

const positionInfo =
    document.getElementById("positionInfo");

const userResult =
    document.getElementById("userResult");

let targetLines = [];

let enterCount = 0;

let enterTimer = null;

initialize();

async function initialize() {

    try {

        await loadAyaList();

        checkButton.addEventListener(
            "click",
            compareText
        );

        clearButton.addEventListener(
            "click",
            clearAll
        );

    } catch (error) {

        showError(error);
    }
}

async function loadAyaList() {

    const response =
        await fetch("./data/aya-list.json");

    if (!response.ok) {

        throw new Error(
            "aya-list.json を読み込めません"
        );
    }

    const ayaList =
        await response.json();

    ayaSelect.innerHTML = "";

    ayaList.forEach((aya) => {

        const option =
            document.createElement("option");

        option.value = aya.file;

        option.textContent =
            aya.title ||
            aya.id ||
            aya.file;

        ayaSelect.appendChild(option);
    });

    ayaSelect.addEventListener(
        "change",
        async () => {

            await loadAyaContent(
                ayaSelect.value
            );
        }
    );

    if (ayaList.length > 0) {

        ayaSelect.value =
            ayaList[0].file;

        await loadAyaContent(
            ayaList[0].file
        );
    }
}

async function loadAyaContent(fileName) {

    const response =
        await fetch(`./data/${fileName}`);

    if (!response.ok) {

        throw new Error(
            `${fileName} を読み込めません`
        );
    }

    const ayaData =
        await response.json();

    if (Array.isArray(ayaData)) {

        targetLines =
            ayaData.flatMap(
                page => page.行 || []
            );

    } else {

        targetLines =
            ayaData.lines ||
            ayaData.行 ||
            [];
    }

    clearAll();
}

inputText.addEventListener(
    "keydown",
    (e) => {

        if (e.key !== "Enter") {

            enterCount = 0;

            clearTimeout(enterTimer);

            return;
        }

        enterCount++;

        clearTimeout(enterTimer);

        enterTimer = setTimeout(() => {

            enterCount = 0;

        }, 700);

        if (enterCount >= 2) {

            e.preventDefault();

            compareText();

            enterCount = 0;

            clearTimeout(enterTimer);
        }
    }
);

function compareText() {

    try {

        const userLines =
            inputText.value
                .trimEnd()
                .split(/\r?\n/);

        if (
            userLines.length === 0 ||
            inputText.value.trim() === ""
        ) {

            status.innerHTML =
                `<span class="ng">入力が空です</span>`;

            positionInfo.innerHTML = "";

            userResult.innerHTML = "";

            return;
        }

        const bestStartLine =
            findBestStartLine(userLines);

        const correctLines =
            targetLines.slice(
                bestStartLine,
                bestStartLine + userLines.length
            );

        const userJoined =
            normalizeForCompare(
                userLines.join("\n")
            );

        const correctJoined =
            normalizeForCompare(
                correctLines.join("\n")
            );

        status.innerHTML =
            userJoined === correctJoined
                ? `<span class="ok">OK</span>`
                : `<span class="ng">差異あり</span>`;

        positionInfo.innerHTML =
            `判定位置：${bestStartLine + 1}行目から`;

        userResult.innerHTML =
            buildUserOnlyDiff(
                userJoined,
                correctJoined
            ).replace(/\n/g, "<br>");

    } catch (error) {

        showError(error);
    }
}

function clearAll() {

    inputText.value = "";

    status.innerHTML = "";

    positionInfo.innerHTML = "";

    userResult.innerHTML = "";

    inputText.focus();
}

function findBestStartLine(userLines) {

    let bestIndex = 0;

    let bestScore = Infinity;

    const userText =
        normalizeForCompare(
            userLines.join("\n")
        );

    for (
        let i = 0;
        i < targetLines.length;
        i++
    ) {

        const candidateLines =
            targetLines.slice(
                i,
                i + userLines.length
            );

        const candidateText =
            normalizeForCompare(
                candidateLines.join("\n")
            );

        const score =
            levenshteinDistance(
                userText,
                candidateText
            );

        if (score < bestScore) {

            bestScore = score;

            bestIndex = i;
        }
    }

    return bestIndex;
}

function normalizeForCompare(str) {

    return String(str)
        .replaceAll("　", " ");
}

function buildUserOnlyDiff(user, correct) {

    const diffs =
        diffChars(correct, user);

    let html = "";

    for (const part of diffs) {

        if (part.type === "equal") {

            html +=
                escapeHtml(part.text);

        } else if (
            part.type === "delete"
        ) {

            html +=
                `<span class="diff">□(<span style="color: green; font-weight: bold;">${escapeHtml(part.text)}</span>)</span>`;

        } else if (
            part.type === "insert"
        ) {

            html +=
                `<span class="diff">${escapeHtml(part.text)}(余分)</span>`;

        } else if (
            part.type === "replace"
        ) {

            html +=
                `<span class="diff">${escapeHtml(part.userText)}(<span style="color: green; font-weight: bold;">${escapeHtml(part.correctText)}</span>)</span>`;
        }
    }

    return html;
}

function levenshteinDistance(a, b) {

    const m = a.length;

    const n = b.length;

    const dp =
        Array.from(
            { length: m + 1 },
            () => Array(n + 1).fill(0)
        );

    for (let i = 0; i <= m; i++) {

        dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {

        dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {

        for (let j = 1; j <= n; j++) {

            if (
                a[i - 1] ===
                b[j - 1]
            ) {

                dp[i][j] =
                    dp[i - 1][j - 1];

            } else {

                dp[i][j] =
                    Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1,
                        dp[i - 1][j - 1] + 1
                    );
            }
        }
    }

    return dp[m][n];
}

function diffChars(correct, user) {

    return [
        {
            type: "equal",
            text: user
        }
    ];
}

function escapeHtml(str) {

    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function showError(error) {

    status.innerHTML =
        `<span class="ng">エラー: ${escapeHtml(error.message)}</span>`;

    console.error(error);
}