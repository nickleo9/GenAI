// 載入題庫資料
let quizData = {
    'generative-ai': [],
    'ipas': [],
    'ai-basis': [],
    'ai-application': [],
    'ipas-combined': []
};

async function loadQuizDatabases() {
    try {
        console.log('🔍 開始載入題庫...');

        // 載入生成式AI題庫
        try {
            const response1 = await fetch('./模擬考題.json');
            if (response1.ok) {
                const data1 = await response1.json();
                if (Array.isArray(data1) && data1.length > 0) {
                    quizData['generative-ai'] = data1;
                    console.log('✅ 生成式AI題庫已載入:', quizData['generative-ai'].length + '題');
                } else {
                    throw new Error('題庫格式錯誤或為空');
                }
            } else {
                throw new Error(`HTTP ${response1.status}`);
            }
        } catch (error) {
            console.warn('⚠️ 生成式AI題庫載入失敗:', error.message);
            quizData['generative-ai'] = [];
        }

        // 載入人工智慧基礎概論題庫 (daily_answers_apply.json)
        try {
            const response2 = await fetch('./daily_answers_apply.json');
            if (response2.ok) {
                const data2 = await response2.json();
                if (Array.isArray(data2) && data2.length > 0) {
                    quizData['ai-basis'] = data2;
                    console.log('✅ 人工智慧基礎概論題庫已載入:', quizData['ai-basis'].length + '題');
                } else {
                    throw new Error('題庫格式錯誤或為空');
                }
            } else {
                throw new Error(`HTTP ${response2.status}`);
            }
        } catch (error) {
            console.warn('⚠️ 人工智慧基礎概論題庫載入失敗:', error.message);
            quizData['ai-basis'] = [];
        }

        // 載入生成式AI應用與規劃題庫 (daily_answers_basis.json)
        try {
            const response3 = await fetch('./daily_answers_basis.json');
            if (response3.ok) {
                const data3 = await response3.json();
                if (Array.isArray(data3) && data3.length > 0) {
                    quizData['ai-application'] = data3;
                    console.log('✅ 生成式AI應用與規劃題庫已載入:', quizData['ai-application'].length + '題');
                } else {
                    throw new Error('題庫格式錯誤或為空');
                }
            } else {
                throw new Error(`HTTP ${response3.status}`);
            }
        } catch (error) {
            console.warn('⚠️ 生成式AI應用與規劃題庫載入失敗:', error.message);
            quizData['ai-application'] = [];
        }

        // 載入原iPAS題庫 (保持向後兼容)
        try {
            const response4 = await fetch('./應用模擬考題.json');
            if (response4.ok) {
                const data4 = await response4.json();
                if (Array.isArray(data4) && data4.length > 0) {
                    quizData['ipas'] = data4;
                    console.log('✅ 原iPAS題庫已載入:', quizData['ipas'].length + '題');
                } else {
                    throw new Error('題庫格式錯誤或為空');
                }
            } else {
                throw new Error(`HTTP ${response4.status}`);
            }
        } catch (error) {
            console.warn('⚠️ 原iPAS題庫載入失敗:', error.message);
            quizData['ipas'] = [];
        }

        // 建立綜合考題 (合併兩個新題庫)
        if (quizData['ai-basis'].length > 0 || quizData['ai-application'].length > 0) {
            quizData['ipas-combined'] = [...quizData['ai-basis'], ...quizData['ai-application']];
            console.log('✅ 綜合考題已建立:', quizData['ipas-combined'].length + '題');
        }

        // 檢查是否需要生成示例數據
        if (quizData['ipas'].length === 0 && quizData['generative-ai'].length === 0) {
            console.log('📝 兩個題庫都載入失敗，生成示例題庫...');
            quizData['ipas'] = generateSampleQuestions();
            quizData['generative-ai'] = generateSampleAIQuestions();

            // 顯示提示訊息
            setTimeout(() => {
                if (typeof iPASQuizApp !== 'undefined' && iPASQuizApp.showAlert) {
                    iPASQuizApp.showAlert('題庫檔案未找到，已載入示例題目供測試！\n請確保 模擬考題.json 和 應用模擬考題.json 在正確位置。', 'warning');
                } else {
                    alert('題庫檔案未找到，已載入示例題目供測試！\n請確保 模擬考題.json 和 應用模擬考題.json 在正確位置。');
                }
            }, 1000);
        } else if (quizData['ipas'].length === 0) {
            console.log('📝 iPAS題庫載入失敗，生成示例iPAS題庫...');
            quizData['ipas'] = generateSampleQuestions();
        } else if (quizData['generative-ai'].length === 0) {
            console.log('📝 生成式AI題庫載入失敗，生成示例AI題庫...');
            quizData['generative-ai'] = generateSampleAIQuestions();
        }

        console.log('📚 題庫載入完成');
        console.log('📊 載入狀態:', {
            'iPAS題庫': quizData['ipas'].length + '題',
            '生成式AI題庫': quizData['generative-ai'].length + '題'
        });

    } catch (error) {
        console.error('❌ 題庫載入發生嚴重錯誤:', error);
        // 確保至少有一些題目可用
        quizData['ipas'] = generateSampleQuestions();
        quizData['generative-ai'] = generateSampleAIQuestions();

        setTimeout(() => {
            if (typeof iPASQuizApp !== 'undefined' && iPASQuizApp.showAlert) {
                iPASQuizApp.showAlert('題庫載入失敗，已載入示例題目！', 'error');
            } else {
                alert('題庫載入失敗，已載入示例題目！');
            }
        }, 1000);
    }
}

// 生成示例iPAS題目
function generateSampleQuestions() {
    return [
        {
            question: "根據經濟部iPAS認證標準，AI應用規劃師需要具備哪項核心能力？",
            options: [
                "程式設計與演算法開發",
                "AI技術應用與商業價值評估",
                "硬體設備維護與管理",
                "資料庫管理與網路安全"
            ],
            correct_answer_letter: "B",
            correct_answer_index: 1,
            explanation: "AI應用規劃師主要負責評估AI技術的商業應用價值，規劃AI專案的實施策略，而非純技術開發工作。",
            topic: "AI應用規劃",
            subtopic: "核心能力"
        },
        {
            question: "在AI專案規劃階段，以下哪個步驟最為重要？",
            options: [
                "選擇最先進的AI技術",
                "確保充足的硬體資源",
                "明確定義問題與目標",
                "招募更多技術人員"
            ],
            correct_answer_letter: "C",
            correct_answer_index: 2,
            explanation: "明確定義問題與目標是AI專案成功的基礎，只有清楚了解要解決什麼問題，才能選擇適合的技術方案。",
            topic: "專案管理",
            subtopic: "需求分析"
        },
        {
            question: "機器學習模型的「過度擬合」(Overfitting)會導致什麼問題？",
            options: [
                "訓練時間過長",
                "模型在新資料上表現不佳",
                "記憶體使用過多",
                "計算成本過高"
            ],
            correct_answer_letter: "B",
            correct_answer_index: 1,
            explanation: "過度擬合指模型過度學習訓練資料的細節，導致在未見過的新資料上泛化能力差，預測準確性下降。",
            topic: "機器學習",
            subtopic: "模型評估"
        },
        {
            question: "AI專案的ROI（投資報酬率）評估應該考慮哪些主要因素？",
            options: [
                "只考慮技術開發成本",
                "技術成本、人力成本、維護成本與預期效益",
                "只考慮軟體授權費用",
                "只考慮硬體採購成本"
            ],
            correct_answer_letter: "B",
            correct_answer_index: 1,
            explanation: "完整的ROI評估需要考慮所有相關成本（技術、人力、維護）以及預期的商業效益，才能做出正確的投資決策。",
            topic: "商業分析",
            subtopic: "成本效益分析"
        },
        {
            question: "在AI專案中，資料治理（Data Governance）的主要目的是什麼？",
            options: [
                "增加資料的數量",
                "確保資料的品質、安全性和合規性",
                "減少資料的儲存成本",
                "加快資料的處理速度"
            ],
            correct_answer_letter: "B",
            correct_answer_index: 1,
            explanation: "資料治理的核心是建立框架來管理資料的品質、安全性、隱私保護和法規遵循，確保AI專案使用高品質且合規的資料。",
            topic: "資料管理",
            subtopic: "資料治理"
        }
    ];
}

// 生成示例生成式AI題目
function generateSampleAIQuestions() {
    return [
        {
            question: "生成式AI的主要特徵是什麼？",
            options: [
                "只能分析現有資料",
                "能夠創造新的內容或資料",
                "只能處理數值型資料",
                "只能執行分類任務"
            ],
            correct_answer_letter: "B",
            correct_answer_index: 1,
            explanation: "生成式AI的核心特徵是能夠學習資料的分布並生成新的、類似的內容，如文字、圖像、音樂等。",
            topic: "生成式AI基礎",
            subtopic: "基本概念"
        },
        {
            question: "GPT模型中的'T'代表什麼？",
            options: [
                "Training（訓練）",
                "Transformer（轉換器）",
                "Testing（測試）",
                "Technology（技術）"
            ],
            correct_answer_letter: "B",
            correct_answer_index: 1,
            explanation: "GPT代表Generative Pre-trained Transformer，其中T指的是Transformer架構，這是GPT模型的核心技術基礎。",
            topic: "大型語言模型",
            subtopic: "GPT系列"
        },
        {
            question: "Prompt Engineering的主要目的是什麼？",
            options: [
                "提高模型的運算速度",
                "優化輸入指令以獲得更好的輸出結果",
                "減少模型的參數數量",
                "降低模型的記憶體使用"
            ],
            correct_answer_letter: "B",
            correct_answer_index: 1,
            explanation: "Prompt Engineering是設計和優化輸入提示詞的技術，目的是引導AI模型產生更準確、更符合需求的回應。",
            topic: "提示工程",
            subtopic: "基本原理"
        }
    ];
}

// 頁面載入時自動載入題庫
document.addEventListener('DOMContentLoaded', loadQuizDatabases);
// 全域狀態管理
const iPASQuizApp = {
    // 應用狀態
    state: {
        isQuizActive: false,
        selectedDatabase: null,
        currentMode: 'practice',
        selectedReviewMode: null,
        selectedTopicsForReview: [],
        explanationMode: 'database',
        selectedAIModel: 'gpt-4o',
        questions: [],
        currentQuestionIndex: 0,
        userAnswers: {},
        markedQuestions: [], // 新增：用於存儲標記的題目索引
        questionMapping: {}, // 用於存儲題目的選項隨機化映射
        score: 0,
        wrongQuestions: [],
        startTime: null,
        isTimerRunning: false,
        examDuration: 150, // iPAS: 150分鐘 (兩科各75分鐘)
        timerId: null,
        userData: null
    },

    // DOM 元素
    elements: {
        databaseSelector: document.getElementById('database-selector'),
        databaseCards: document.querySelectorAll('.database-card'),
        settingsPanel: document.getElementById('settings-panel'),
        quizContainer: document.getElementById('quiz-container'),
        startBtn: document.getElementById('start-btn'),
        reviewBtnMain: document.getElementById('review-btn-main'),
        reviewModesSection: document.getElementById('review-modes-section'),
        backBtn: document.getElementById('back-to-selection'),
        prevBtn: document.getElementById('prev-btn'),
        submitBtn: document.getElementById('submit-btn'),
        nextBtn: document.getElementById('next-btn'),
        finishBtn: document.getElementById('finish-btn'),
        overviewBtn: document.getElementById('overview-btn'), // 新增
        markReviewBtn: document.getElementById('mark-review-btn'), // 新增
        modifyAnswerBtn: document.getElementById('modify-answer-btn'), // 新增
        quizStatus: document.getElementById('quiz-status'),
        timerElement: document.getElementById('timer'),
        quizTimerDisplay: document.getElementById('quiz-timer-display'),
        questionNumber: document.getElementById('question-number'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        explanationBox: document.getElementById('explanation-box'),
        explanationContent: document.getElementById('explanation-content'),
        progressBar: document.getElementById('progress-bar'),
        statsDisplay: document.getElementById('stats-display'),
        topicBadge: document.getElementById('topic-badge'),
        subtopicBadge: document.getElementById('subtopic-badge'),
        loadingOverlay: document.getElementById('loading-overlay'),
        loadingText: document.getElementById('loading-text')
    },

    // 模態框
    modals: {
        result: new bootstrap.Modal(document.getElementById('result-modal')),
        stats: new bootstrap.Modal(document.getElementById('stats-modal')),
        help: new bootstrap.Modal(document.getElementById('help-modal')),
        topicSelection: new bootstrap.Modal(document.getElementById('topic-selection-modal')),
        overview: new bootstrap.Modal(document.getElementById('overview-modal')),
        ipasSubject: new bootstrap.Modal(document.getElementById('ipas-subject-modal')) // iPAS子項目選擇
    },

    // 考試規範配置
    examConfigs: {
        'ipas': {
            name: 'iPAS AI應用規劃師',
            defaultQuestions: 100,
            duration: 150, // 兩科各75分鐘
            passingScore: 70,
            description: '100題 | 150分鐘 | 70分及格 | 單科不低於60分'
        },
        'ai-basis': {
            name: '人工智慧基礎概論',
            defaultQuestions: 10,
            duration: 75,
            passingScore: 60,
            description: '10題 | 75分鐘 | 60分及格'
        },
        'ai-application': {
            name: '生成式AI應用與規劃',
            defaultQuestions: 10,
            duration: 75,
            passingScore: 60,
            description: '10題 | 75分鐘 | 60分及格'
        },
        'ipas-combined': {
            name: 'iPAS綜合考題',
            defaultQuestions: 20,
            duration: 150,
            passingScore: 70,
            description: '20題 | 150分鐘 | 70分及格'
        },
        'generative-ai': {
            name: '資策會生成式AI認證',
            defaultQuestions: 80,
            duration: 90,
            passingScore: 70,
            description: '80題 | 90分鐘 | 70分及格'
        }
    },

    // 初始化
    init() {
        this.state.userData = this.loadUserData();
        this.attachEventListeners();
        this.updateReviewButtonState();
        console.log('🚀 iPAS AI應用規劃師練習系統已初始化 (v2.3.1 登入整合版)');
    },

    // 載入使用者數據
    loadUserData() {
        try {
            const data = localStorage.getItem('iPASQuizUserData');
            return data ? JSON.parse(data) : {
                correct: [],
                incorrect: [],
                history: [],
                databaseStats: {}
            };
        } catch (error) {
            console.error('載入使用者數據錯誤:', error);
            return {
                correct: [],
                incorrect: [],
                history: [],
                databaseStats: {}
            };
        }
    },

    // 保存使用者數據
    saveUserData(showMessage = false) {
        try {
            localStorage.setItem('iPASQuizUserData', JSON.stringify(this.state.userData));
            if (showMessage) {
                this.showAlert('學習數據已儲存', 'success');
            }
            return true;
        } catch (error) {
            console.error('保存使用者數據錯誤:', error);
            if (showMessage) {
                this.showAlert('儲存失敗: ' + error.message, 'error');
            }
            return false;
        }
    },

    // 事件監聽器
    attachEventListeners() {
        // 題庫選擇
        this.elements.databaseCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (this.state.isQuizActive) {
                    this.showAlert('測驗進行中，無法切換題庫！', 'warning');
                    return;
                }

                const cardType = card.dataset.type;
                if (cardType === 'ipas') {
                    // 顯示iPAS子項目選擇模態框
                    this.modals.ipasSubject.show();
                } else {
                    this.selectDatabase(cardType);
                }
            });
        });

        document.getElementById('confirm-topic-selection-btn').addEventListener('click', () => this.confirmTopicSelection());
        document.getElementById('select-all-topics-btn').addEventListener('click', () => this.toggleAllTopics(true));
        document.getElementById('deselect-all-topics-btn').addEventListener('click', () => this.toggleAllTopics(false));

        // iPAS子項目選擇按鈕事件
        document.querySelectorAll('.ipas-subject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const subject = e.currentTarget.dataset.subject;
                this.selectDatabase(subject);
                this.modals.ipasSubject.hide();
            });
        });

        // 按鈕事件
        this.elements.startBtn.addEventListener('click', () => this.startQuiz());
        this.elements.reviewBtnMain.addEventListener('click', () => this.startReview());
        this.elements.backBtn.addEventListener('click', () => this.backToSelection());
        this.elements.prevBtn.addEventListener('click', () => this.prevQuestion());
        this.elements.submitBtn.addEventListener('click', () => this.submitAnswer());
        this.elements.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.elements.finishBtn.addEventListener('click', () => this.finishQuiz());
        this.elements.overviewBtn.addEventListener('click', () => this.showOverviewModal()); // 新增
        this.elements.markReviewBtn.addEventListener('click', () => this.toggleMarkForReview()); // 新增
        this.elements.modifyAnswerBtn.addEventListener('click', () => this.enableAnswerModification()); // 新增

        // 複習模式選擇事件
        document.querySelectorAll('.review-mode-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (this.state.isQuizActive) {
                    this.showAlert('測驗進行中，無法更改複習模式！', 'warning');
                    return;
                }
                const mode = item.dataset.reviewMode;
                this.selectReviewMode(mode);

                // 如果是主題複習，則打開選擇視窗
                if (mode === 'topic') {
                    this.openTopicSelectionModal();
                }
            });
        });

        // 導航按鈕
        document.getElementById('save-btn').addEventListener('click', () => this.saveUserData(true));
        document.getElementById('export-btn').addEventListener('click', () => this.exportWrongQuestions());
        document.getElementById('stats-btn').addEventListener('click', () => this.showStatistics());
        document.getElementById('help-btn').addEventListener('click', () => this.modals.help.show());

        // 模式選擇
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.state.isQuizActive) {
                    this.showAlert('測驗進行中，無法更改模式！', 'warning');
                    return;
                }
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.currentMode = btn.dataset.mode;
                this.updateModeUI();
            });
        });

        // 解析模式選擇
        document.querySelectorAll('[name="explanation-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.state.explanationMode = e.target.value;
                const aiModelSelect = document.getElementById('ai-model-select');
                if (this.state.explanationMode === 'ai') {
                    aiModelSelect.classList.remove('d-none');
                } else {
                    aiModelSelect.classList.add('d-none');
                }
            });
        });

        // AI模型選擇
        document.getElementById('ai-model').addEventListener('change', (e) => {
            this.state.selectedAIModel = e.target.value;
        });

        // 模態框按鈕
        document.getElementById('review-wrong-btn').addEventListener('click', () => this.reviewWrongQuestions());
        document.getElementById('restart-quiz-btn').addEventListener('click', () => this.restartQuiz());
        document.getElementById('reset-stats-btn').addEventListener('click', () => this.resetProgress());

        // 🔥 新增：結果模態框關閉時返回首頁
        document.getElementById('result-modal').addEventListener('hidden.bs.modal', () => {
            this.backToSelection();
        });

        // 頁面關閉前自動保存
        window.addEventListener('beforeunload', () => this.saveUserData(false));
    },

    // 選擇複習模式
    selectReviewMode(mode) {
        document.querySelectorAll('.review-mode-item').forEach(item => {
            item.classList.remove('selected');
        });

        const selectedItem = document.querySelector(`[data-review-mode="${mode}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
            this.state.selectedReviewMode = mode;
            this.updateReviewButtonState();
            console.log(`✅ 已選擇複習模式: ${mode}`);
        }
    },

    // 更新模式UI
    updateModeUI() {
        if (this.state.currentMode === 'practice' || this.state.currentMode === 'exam') {
            this.elements.reviewModesSection.style.display = 'none';
            this.elements.startBtn.style.display = 'block';
            this.elements.reviewBtnMain.style.display = 'none';
        }

        // 根據模式更新計時器顯示
        this.updateTimerForMode();
    },

    // 根據模式更新計時器顯示
    updateTimerForMode() {
        if (!this.state.selectedDatabase) return;

        const config = this.examConfigs[this.state.selectedDatabase];
        if (!config) return;

        if (this.state.currentMode === 'exam') {
            this.elements.timerElement.innerHTML =
                `<i class="fas fa-clock me-2"></i>${config.name} | 考試時間：${config.duration}分鐘`;
            this.elements.timerElement.classList.add('exam-mode');
        } else {
            this.elements.timerElement.innerHTML =
                `<i class="fas fa-clock me-2"></i>已選擇：${config.name}`;
            this.elements.timerElement.classList.remove('exam-mode');
        }
    },

    // 開始複習
    startReview() {
        if (!this.state.selectedDatabase) {
            this.showAlert('請先選擇題庫！', 'warning');
            return;
        }

        if (!this.state.selectedReviewMode) {
            this.showAlert('請選擇複習模式！', 'warning');
            return;
        }

        if (this.state.selectedReviewMode === 'topic' && (!this.state.selectedTopicsForReview || this.state.selectedTopicsForReview.length === 0)) {
            this.showAlert('請先點擊「主題複習」按鈕來選擇要複習的主題！', 'warning');
            this.openTopicSelectionModal();
            return;
        }

        this.showLoading('準備複習模式...');

        this.state.isQuizActive = true;
        this.state.currentMode = 'review';
        this.lockInterface();

        setTimeout(() => {
            if (this.loadReviewQuestions()) {
                this.state.currentQuestionIndex = 0;
                this.state.userAnswers = {};
                this.state.markedQuestions = []; // 新增這一行
                this.state.questionMapping = {};
                this.state.score = 0;
                this.state.wrongQuestions = [];
                this.state.startTime = new Date();

                this.elements.settingsPanel.classList.add('d-none');
                this.elements.quizContainer.classList.remove('d-none');
                this.elements.quizStatus.style.display = 'block';
                this.elements.quizStatus.classList.add('active');
                this.elements.quizStatus.innerHTML = '<i class="fas fa-redo me-1"></i>複習進行中';

                this.displayQuestion();
                this.hideLoading();
                console.log('✅ 複習已開始');
            } else {
                this.hideLoading();
                this.state.isQuizActive = false;
                this.unlockInterface();
            }
        }, 500);
    },

    // 載入複習題目
    loadReviewQuestions() {
        const currentQuizData = quizData[this.state.selectedDatabase];

        if (!currentQuizData || currentQuizData.length === 0) {
            this.showAlert(`${this.examConfigs[this.state.selectedDatabase]?.name || this.state.selectedDatabase}題庫尚未載入或為空！`, 'error');
            return false;
        }

        let questionsToReview = [];
        const questionCount = parseInt(document.getElementById('question-count').value);

        switch (this.state.selectedReviewMode) {
            case 'wrong':
                const incorrectQuestions = this.state.userData.incorrect || [];
                questionsToReview = currentQuizData.filter(q =>
                    incorrectQuestions.includes(q.question)
                );
                if (questionsToReview.length === 0) {
                    this.showAlert('目前沒有錯題記錄，請先進行練習！', 'info');
                    return false;
                }
                break;

            case 'all':
                questionsToReview = currentQuizData.slice(0, Math.min(questionCount, currentQuizData.length));
                break;

            case 'topic':
                const selectedTopics = this.state.selectedTopicsForReview;
                if (!selectedTopics || selectedTopics.length === 0) {
                    this.showAlert('錯誤：未找到選擇的主題。請重新選擇。', 'error');
                    return false;
                }
                questionsToReview = currentQuizData.filter(q => selectedTopics.includes(q.topic || '未分類'));

                if (questionsToReview.length === 0) {
                    this.showAlert(`在您選擇的主題中找不到任何題目。`, 'info');
                    return false;
                }
                questionsToReview = questionsToReview.sort(() => Math.random() - 0.5)
                    .slice(0, Math.min(questionCount, questionsToReview.length));
                break;

            case 'random':
                questionsToReview = [...currentQuizData].sort(() => Math.random() - 0.5)
                    .slice(0, Math.min(questionCount, currentQuizData.length));
                break;

            default:
                this.showAlert('未知的複習模式！', 'error');
                return false;
        }

        this.state.questions = questionsToReview;
        this.state.questions.forEach((q, index) => q.number = index + 1);

        return true;
    },

    selectDatabase(type) {
        this.elements.databaseCards.forEach(card => card.classList.remove('selected'));

        // 為iPAS相關的子科目，選中iPAS主卡
        if (['ai-basis', 'ai-application', 'ipas-combined'].includes(type)) {
            const iPASCard = document.querySelector(`[data-type="ipas"]`);
            if (iPASCard) iPASCard.classList.add('selected');
        } else {
            const selectedCard = document.querySelector(`[data-type="${type}"]`);
            if (selectedCard) selectedCard.classList.add('selected');
        }

        this.state.selectedDatabase = type;
        this.state.selectedIPASSubject = type;
        this.state.selectedTopicsForReview = [];
        this.updateDatabaseUI(type);
        this.elements.startBtn.disabled = false;
        this.updateReviewButtonState();

        console.log(`✅ 已選擇題庫: ${type}`);
    },

    // 更新題庫UI
    updateDatabaseUI(type) {
        const config = this.examConfigs[type];
        if (!config) return;

        // 更新考試時間
        this.state.examDuration = config.duration;

        // 更新預設題目數量
        document.getElementById('question-count').value = config.defaultQuestions;

        // 使用新的 updateTimerForMode 方法來更新計時器顯示
        if (this.state.currentMode === 'exam') {
            this.elements.timerElement.innerHTML =
                `<i class="fas fa-clock me-2"></i>${config.name} | 考試時間：${config.duration}分鐘`;
            this.elements.timerElement.classList.add('exam-mode');
        } else {
            this.elements.timerElement.innerHTML =
                `<i class="fas fa-clock me-2"></i>已選擇：${config.name}`;
            this.elements.timerElement.classList.remove('exam-mode');
        }

        // 如果是iPAS相關，設定為練習模式
        if (['ipas', 'ai-basis', 'ai-application', 'ipas-combined'].includes(type)) {
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('[data-mode="practice"]').classList.add('active');
            this.state.currentMode = 'practice';
        }
    },

    // 更新複習按鈕狀態
    updateReviewButtonState() {
        const hasWrongQuestions = this.state.userData.incorrect && this.state.userData.incorrect.length > 0;
        const hasSelectedDatabase = this.state.selectedDatabase !== null;

        if (hasSelectedDatabase) {
            this.elements.reviewModesSection.style.display = 'block';
            this.elements.startBtn.style.display = 'block';
            this.elements.reviewBtnMain.style.display = 'block';
        } else {
            this.elements.reviewModesSection.style.display = 'none';
            this.elements.reviewBtnMain.style.display = 'none';
        }

        const wrongModeItem = document.getElementById('review-wrong-mode');
        if (wrongModeItem) {
            if (hasWrongQuestions) {
                wrongModeItem.style.opacity = '1';
                wrongModeItem.style.pointerEvents = 'auto';
                wrongModeItem.title = '複習之前答錯的題目';
            } else {
                wrongModeItem.style.opacity = '0.5';
                wrongModeItem.style.pointerEvents = 'none';
                wrongModeItem.title = '尚無錯題記錄';
            }
        }

        this.elements.reviewBtnMain.disabled = !hasSelectedDatabase;
    },

    openTopicSelectionModal() {
        if (!this.state.selectedDatabase) {
            this.showAlert('請先選擇題庫！', 'warning');
            return;
        }

        const currentQuizData = quizData[this.state.selectedDatabase];
        if (!currentQuizData || currentQuizData.length === 0) {
            this.showAlert('此題庫無題目可供選擇主題！', 'error');
            return;
        }

        const allTopics = currentQuizData.map(q => q.topic || '未分類');
        const uniqueTopics = [...new Set(allTopics)].sort();

        const container = document.getElementById('topic-list-container');
        container.innerHTML = '';

        uniqueTopics.forEach((topic, index) => {
            const isChecked = this.state.selectedTopicsForReview.includes(topic) ? 'checked' : '';
            const topicHTML = `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${topic}" id="topic-check-${index}" ${isChecked}>
                            <label class="form-check-label" for="topic-check-${index}">
                                ${topic}
                            </label>
                        </div>
                    `;
            container.insertAdjacentHTML('beforeend', topicHTML);
        });

        this.modals.topicSelection.show();
    },

    confirmTopicSelection() {
        const selectedCheckboxes = document.querySelectorAll('#topic-list-container input[type="checkbox"]:checked');
        this.state.selectedTopicsForReview = Array.from(selectedCheckboxes).map(cb => cb.value);

        if (this.state.selectedTopicsForReview.length === 0) {
            this.showAlert('您尚未選擇任何主題！', 'warning');
            return;
        }

        this.modals.topicSelection.hide();
        this.showAlert(`已選擇 ${this.state.selectedTopicsForReview.length} 個主題，請點擊「開始複習」`, 'success');
        this.updateReviewButtonState();
    },

    toggleAllTopics(select) {
        const checkboxes = document.querySelectorAll('#topic-list-container input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = select;
        });
    },

    // 開始測驗
    async startQuiz() {
        // ========== 檢查使用次數限制 ==========
        const usageCheck = UsageManager.canUseSystem();

        if (!usageCheck.allowed) {
            // 根據會員等級顯示不同的提示訊息
            if (usageCheck.memberLevel === 'guest') {
                this.showAlert(
                    `⏰ ${usageCheck.period}免費體驗已達 ${usageCheck.limit} 次上限！\n\n` +
                    '💡 登入後可享有每月 100 次練習機會！',
                    'warning'
                );
            } else {
                this.showAlert(
                    `⏰ ${usageCheck.period}練習已達 ${usageCheck.limit} 次上限！\n\n` +
                    '💎 升級付費會員即可無限制使用！',
                    'warning'
                );
            }
            return;
        }


        if (!this.state.selectedDatabase) {
            this.showAlert('請先選擇題庫！', 'warning');
            return;
        }

        const config = this.examConfigs[this.state.selectedDatabase];

        // 如果是考試模式，加入確認機制
        if (this.state.currentMode === 'exam') {
            const confirmStart = confirm(
                `確定要開始${config.name}模擬考試嗎？\n\n` +
                '⚠️ 重要提醒：\n' +
                `• 考試時間：${config.duration}分鐘\n` +
                '• 一旦開始無法暫停或重置\n' +
                '• 無法返回題庫選擇\n' +
                '• 時間到將自動交卷\n\n' +
                '請確認您已準備就緒！'
            );

            if (!confirmStart) {
                return;
            }
        }

        this.showLoading('準備測驗中...');

        this.state.isQuizActive = true;
        this.lockInterface();

        const questionCount = parseInt(document.getElementById('question-count').value);

        setTimeout(() => {
            if (this.loadQuestions(questionCount)) {
                this.state.currentQuestionIndex = 0;
                this.state.userAnswers = {};
                this.state.markedQuestions = []; // 新增這一行
                this.state.questionMapping = {};
                this.state.score = 0;
                this.state.wrongQuestions = [];
                this.state.startTime = new Date();

                this.elements.settingsPanel.classList.add('d-none');
                this.elements.quizContainer.classList.remove('d-none');
                this.elements.quizStatus.style.display = 'block';
                this.elements.quizStatus.classList.add('active');

                this.displayQuestion();

                if (this.state.currentMode === 'exam') {
                    this.startTimer();
                }

                this.hideLoading();

                // 🔥 測驗成功開始後，增加使用次數
                UsageManager.incrementUsage();

                console.log('✅ 測驗已開始，剩餘次數:', UsageManager.getRemainingInfo());
            } else {
                this.hideLoading();
                this.state.isQuizActive = false;
                this.unlockInterface();
            }
        }, 500);
    },

    // 鎖定介面
    lockInterface() {
        this.elements.databaseSelector.classList.add('disabled');
        this.elements.settingsPanel.classList.add('disabled');
        this.elements.databaseCards.forEach(card => card.classList.add('disabled'));

        // 🔥 新增：考試模式時加入頁面離開警告
        if (this.state.currentMode === 'exam') {
            window.addEventListener('beforeunload', this.handleBeforeUnload);
        }
    },

    // 🔥 新增：處理頁面離開事件
    handleBeforeUnload(e) {
        e.preventDefault();
        e.returnValue = '考試進行中，確定要離開嗎？離開後進度將不會被保存。';
        return e.returnValue;
    },

    // 解鎖介面
    unlockInterface() {
        this.elements.databaseSelector.classList.remove('disabled');
        this.elements.settingsPanel.classList.remove('disabled');
        this.elements.databaseCards.forEach(card => card.classList.remove('disabled'));

        // 🔥 新增：移除頁面離開警告
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    },

    // 載入題目
    loadQuestions(count) {
        const currentQuizData = quizData[this.state.selectedDatabase];
        const config = this.examConfigs[this.state.selectedDatabase];

        if (!currentQuizData || currentQuizData.length === 0) {
            this.showAlert(`${config?.name || this.state.selectedDatabase}題庫尚未載入或為空！`, 'error');
            return false;
        }

        const shuffledQuestions = [...currentQuizData].sort(() => Math.random() - 0.5);
        this.state.questions = shuffledQuestions.slice(0, Math.min(count, shuffledQuestions.length));
        this.state.questions.forEach((q, index) => q.number = index + 1);

        return true;
    },

    // 顯示題目
    displayQuestion() {
        if (!this.state.questions || this.state.currentQuestionIndex >= this.state.questions.length) {
            this.finishQuiz();
            return false;
        }

        const question = this.state.questions[this.state.currentQuestionIndex];
        const questionId = this.state.currentQuestionIndex;
        const userAnswer = this.state.userAnswers[questionId];
        const isPracticeOrReview = this.state.currentMode === 'practice' || this.state.currentMode === 'review';

        this.elements.questionNumber.textContent = `問題 ${question.number}/${this.state.questions.length}`;
        this.elements.questionText.textContent = question.question;

        // 【核心修正點】確保在隨機化時，計算並儲存正確答案的新字母
        if (!this.state.questionMapping[questionId]) {
            const optionsWithIndex = question.options.map((option, index) => ({
                text: option,
                originalIndex: index,
                isCorrect: index === question.correct_answer_index // 加上這行來標記哪個是正確選項
            }));

            const shuffledOptions = [...optionsWithIndex].sort(() => Math.random() - 0.5);

            // 找到正確選項在新的隨機數組中的位置，並轉換為字母
            const correctLetter = String.fromCharCode(65 + shuffledOptions.findIndex(opt => opt.isCorrect));

            this.state.questionMapping[questionId] = {
                shuffledOptions: shuffledOptions,
                correctLetter: correctLetter // 把計算好的正確字母存起來
            };
        }

        const mapping = this.state.questionMapping[questionId];
        this.elements.optionsContainer.innerHTML = mapping.shuffledOptions.map((option, displayIndex) => {
            const letter = String.fromCharCode(65 + displayIndex);
            return `<div class="form-check mb-2">
                                <input class="option-input" type="radio" name="quiz-option" id="option-${letter}" value="${letter}" data-original-index="${option.originalIndex}">
                                <label class="option-label" for="option-${letter}">${letter}. ${option.text}</label>
                            </div>`;
        }).join('');

        this.elements.explanationBox.classList.add('d-none');
        this.elements.modifyAnswerBtn.classList.add('d-none');
        this.elements.submitBtn.classList.add('d-none'); // 隱藏提交按鈕
        document.querySelectorAll('input[name="quiz-option"]').forEach(input => input.disabled = false);

        // 🔥 新增：為選項添加自動暫存功能
        document.querySelectorAll('input[name="quiz-option"]').forEach(input => {
            input.addEventListener('change', () => this.autoSaveAnswer());
        });

        if (userAnswer) {
            const answerInput = document.getElementById(`option-${userAnswer.answer}`);
            if (answerInput) answerInput.checked = true;

            if (isPracticeOrReview) {
                // 練習/複習模式：顯示「查看解析」按鈕
                this.elements.submitBtn.classList.remove('d-none');
                this.elements.submitBtn.innerHTML = '<i class="fas fa-eye me-1"></i>查看解析';
                this.elements.submitBtn.onclick = () => {
                    const isCorrect = userAnswer.originalIndex === question.correct_answer_index;
                    this.showExplanation(question, userAnswer.answer, isCorrect);
                    document.querySelectorAll('input[name="quiz-option"]').forEach(input => input.disabled = true);
                    this.elements.modifyAnswerBtn.classList.remove('d-none');
                    this.elements.submitBtn.classList.add('d-none');
                };
            }
        }

        const isMarked = this.state.markedQuestions.includes(questionId);
        this.elements.markReviewBtn.classList.toggle('active', isMarked);
        this.elements.markReviewBtn.innerHTML = `<i class="fas fa-flag"></i> ${isMarked ? '已標記' : '標記此題'}`;

        const progress = (Object.keys(this.state.userAnswers).length / this.state.questions.length) * 100;
        this.elements.progressBar.style.width = `${progress}%`;

        this.updateButtonStates();
        this.updateStats();
        return true;
    },

    // 🔥 新增：自動暫存答案（選擇選項時自動觸發）
    autoSaveAnswer() {
        const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
        if (!selectedOption) {
            return false;
        }

        const question = this.state.questions[this.state.currentQuestionIndex];
        const questionId = this.state.currentQuestionIndex;
        const isPracticeOrReview = this.state.currentMode === 'practice' || this.state.currentMode === 'review';

        // 儲存或更新答案（暫存）
        this.state.userAnswers[questionId] = {
            answer: selectedOption.value,
            originalIndex: parseInt(selectedOption.dataset.originalIndex),
            timestamp: new Date()
        };

        // 靜默保存，不顯示提示（自動暫存）
        // this.showAlert(`答案已自動保存`, 'success');

        // 練習/複習模式：顯示「查看解析」按鈕
        if (isPracticeOrReview) {
            this.elements.submitBtn.classList.remove('d-none');
            this.elements.submitBtn.innerHTML = '<i class="fas fa-eye me-1"></i>查看解析';
            this.elements.submitBtn.onclick = () => {
                const isCorrect = this.state.userAnswers[questionId].originalIndex === question.correct_answer_index;
                this.showExplanation(question, this.state.userAnswers[questionId].answer, isCorrect);
                document.querySelectorAll('input[name="quiz-option"]').forEach(input => input.disabled = true);
                this.elements.modifyAnswerBtn.classList.remove('d-none');
                this.elements.submitBtn.classList.add('d-none');
            };
        }

        this.updateStats();
        this.updateButtonStates();
        this.saveUserData();
        return true;
    },

    // 提交答案（保留舊函數以兼容性，但改為調用 autoSaveAnswer）
    submitAnswer() {
        return this.autoSaveAnswer();
    },

    // 顯示解析
    showExplanation(question, userAnswerLetter, isCorrect) {
        const questionId = this.state.currentQuestionIndex;
        const mapping = this.state.questionMapping[questionId];
        const correctAnswerLetter = mapping.correctLetter;

        const resultClass = isCorrect ? 'correct' : 'incorrect';
        const resultIcon = isCorrect ? '✅' : '❌';
        const resultText = isCorrect ? '答對了！' : `答錯了！正確答案是 ${correctAnswerLetter}`;

        // 🔥 遊客延遲顯示解析
        const memberLevel = UsageManager.getMemberLevel();

        if (memberLevel === 'guest') {
            // 先顯示延遲提示
            this.elements.explanationBox.classList.remove('d-none');
            this.elements.explanationContent.innerHTML = `
            <div class="${resultClass} mb-3">
                ${resultIcon} ${resultText}
            </div>
            <div class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                <span class="text-muted">解析載入中... (遊客需等待 3 秒)</span>
                <div class="mt-2 small text-muted">💡 <a href="#" onclick="LoginManager.showLoginOptions(); return false;">登入</a>後可立即查看解析！</div>
            </div>
        `;

            // 3 秒後顯示真正的解析
            setTimeout(() => {
                this._displayExplanationContent(question, userAnswerLetter, isCorrect, resultClass, resultIcon, resultText);
            }, 3000);
        } else {
            // 已登入會員直接顯示
            this.elements.explanationBox.classList.remove('d-none');
            this._displayExplanationContent(question, userAnswerLetter, isCorrect, resultClass, resultIcon, resultText);
        }

        this.elements.topicBadge.textContent = question.topic || '未分類';
        this.elements.subtopicBadge.textContent = question.subtopic || '未分類';
    },

    // 🔥 新增：實際顯示解析內容的輔助函式
    _displayExplanationContent(question, userAnswerLetter, isCorrect, resultClass, resultIcon, resultText) {
        let explanationHTML = `
        <div class="${resultClass} mb-3">
            ${resultIcon} ${resultText}
        </div>
        <div class="fw-bold mb-2">解析:</div>
    `;

        if (this.state.explanationMode === 'database') {
            explanationHTML += `<div class="highlight">${question.explanation || '無解析'}</div>`;
        } else if (this.state.explanationMode === 'ai') {
            explanationHTML += '<div class="highlight" id="ai-explanation">正在生成解析，請稍候...</div>';
            this.generateAIExplanation(question, userAnswerLetter);
        }

        this.elements.explanationContent.innerHTML = explanationHTML;
    },

    // AI生成解析
    async generateAIExplanation(question, userAnswerLetter) {
        try {
            this.showLoading('AI正在生成解析...');

            const questionId = this.state.currentQuestionIndex;
            const mapping = this.state.questionMapping[questionId];
            const correctAnswerLetter = mapping ? mapping.correctLetter : question.correct_answer_letter;

            let optionsText = '';
            if (mapping && mapping.shuffledOptions) {
                optionsText = mapping.shuffledOptions.map((opt, idx) =>
                    `${String.fromCharCode(65 + idx)}. ${opt.text}`
                ).join('\n');
            } else {
                optionsText = question.options.map((opt, i) =>
                    `${String.fromCharCode(65 + i)}. ${opt}`
                ).join('\n');
            }

            const prompt = `
                    你是一個專業的iPAS AI應用規劃師認證考試輔導老師。請用繁體中文根據以下題目生成詳細的答案解析（150字以內）：
                    
                    題目：${question.question}
                    選項（按用戶看到的順序）: 
                    ${optionsText}
                    正確答案: ${correctAnswerLetter}
                    用戶答案: ${userAnswerLetter}
                    
                    請提供清晰完整的解釋，說明為什麼正確答案是正確的，以及為什麼其他選項是錯誤的。重點關注AI應用規劃的商業價值與實務考量。
                    `;

            let aiExplanation = null;

            try {
                const response = await fetch('https://back-9qb9.onrender.com/api/generate-explanation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: this.state.selectedAIModel,
                        prompt: prompt,
                    }),
                    timeout: 10000
                });

                if (response.ok) {
                    const data = await response.json();
                    aiExplanation = data.explanation || data.response || data.answer;
                }
            } catch (error) {
                console.warn('自定義API失敗，嘗試其他方案:', error);
            }

            if (!aiExplanation) {
                aiExplanation = this.generateMockAIExplanation(question, userAnswerLetter, correctAnswerLetter, mapping);
            }

            this.hideLoading();

            const explanationElement = document.getElementById('ai-explanation');
            if (explanationElement && aiExplanation) {
                const paragraphs = aiExplanation.split('\n').filter(p => p.trim()).map(p => `<p>${p.trim()}</p>`).join('');
                explanationElement.innerHTML = paragraphs;

                const aiLabel = document.createElement('div');
                aiLabel.className = 'text-muted small mt-2';
                aiLabel.innerHTML = '<i class="fas fa-robot me-1"></i>AI生成解析';
                explanationElement.appendChild(aiLabel);
            } else {
                this.fallbackToDatabaseExplanation();
            }

        } catch (error) {
            console.error('AI解析生成失敗:', error);
            this.hideLoading();
            this.fallbackToDatabaseExplanation();
        }
    },

    // 生成模擬AI解析
    generateMockAIExplanation(question, userAnswerLetter, correctAnswerLetter, mapping) {
        const isCorrect = userAnswerLetter === correctAnswerLetter;
        const topic = question.topic || 'AI應用規劃';
        const correctOptionText = mapping ?
            mapping.shuffledOptions.find(opt => opt.isCorrect)?.text || question.options[question.correct_answer_index] :
            question.options[question.correct_answer_index];

        let explanation = '';

        if (isCorrect) {
            explanation = `✅ 回答正確！\n\n`;
        } else {
            explanation = `❌ 此題答錯了，正確答案是 ${correctAnswerLetter}。\n\n`;
        }

        if (topic.includes('AI應用') || topic.includes('規劃')) {
            explanation += `在AI應用規劃領域，「${correctOptionText}」是最佳選擇，因為：\n\n`;
            explanation += `1. 符合iPAS認證對AI應用規劃師的核心能力要求\n`;
            explanation += `2. 反映了業界最佳實務和商業考量\n`;
            explanation += `3. 有助於確保AI專案的成功實施和價值實現\n\n`;
        } else if (topic.includes('機器學習') || topic.includes('模型')) {
            explanation += `從技術角度來看，「${correctOptionText}」是正確答案，因為：\n\n`;
            explanation += `1. 這是機器學習領域的重要概念\n`;
            explanation += `2. 直接影響模型的實際應用效果\n`;
            explanation += `3. 是AI專案評估的關鍵指標\n\n`;
        } else {
            explanation += `「${correctOptionText}」是正確答案，這個選項：\n\n`;
            explanation += `1. 符合AI應用規劃的基本原則\n`;
            explanation += `2. 體現了商業價值和實務考量\n`;
            explanation += `3. 是iPAS認證考試的重點內容\n\n`;
        }

        explanation += `建議進一步複習相關的${topic}知識點，加強對AI應用規劃實務的理解。`;

        return explanation;
    },

    // 回退到資料庫解析
    fallbackToDatabaseExplanation() {
        const explanationElement = document.getElementById('ai-explanation');
        if (explanationElement) {
            const question = this.state.questions[this.state.currentQuestionIndex];
            const databaseExplanation = question.explanation || '此題目暫無詳細解析。';

            explanationElement.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            AI解析服務暫時不可用，已切換至資料庫解析
                        </div>
                        <div>${databaseExplanation}</div>
                        <div class="text-muted small mt-2">
                            <i class="fas fa-database me-1"></i>資料庫解析
                        </div>
                    `;
        }
    },

    // 下一題
    nextQuestion() {
        if (this.state.currentQuestionIndex < this.state.questions.length - 1) {
            this.state.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            // 如果已經是最後一題，則提示用戶手動點擊完成
            this.showAlert('已經是最後一題了！請點擊「完成」按鈕來結束測驗。', 'info');
        }
    },

    // 上一題
    prevQuestion() {
        if (this.state.currentQuestionIndex > 0) {
            this.state.currentQuestionIndex--;
            this.displayQuestion();
        }
    },

    // 返回題庫選擇
    backToSelection() {
        // 考試模式下不允許返回
        if (this.state.currentMode === 'exam' && this.state.isQuizActive) {
            this.showAlert('考試進行中，無法返回題庫選擇！', 'error');
            return;
        }

        if (this.state.isQuizActive) {
            const confirmBack = confirm('確定要放棄當前測驗並返回題庫選擇嗎？\n進度將不會被保存。');
            if (!confirmBack) {
                return;
            }
        }

        this.state.isQuizActive = false;
        this.unlockInterface();
        this.stopTimer();

        this.elements.quizContainer.classList.add('d-none');
        this.elements.settingsPanel.classList.remove('d-none');
        this.elements.quizStatus.style.display = 'none';
        this.elements.quizStatus.classList.remove('active');

        console.log('🔙 已返回題庫選擇');
    },

    // 完成測驗
    async finishQuiz() {
        const totalQuestions = this.state.questions.length;
        const answeredCount = Object.keys(this.state.userAnswers).length;
        const unansweredCount = totalQuestions - answeredCount;

        // 🔥 改進：無論是否有未答題目，都顯示確認框
        let confirmMessage = '確定要完成測驗嗎？\n\n';
        confirmMessage += `📊 已作答：${answeredCount} / ${totalQuestions} 題\n`;

        if (unansweredCount > 0) {
            confirmMessage += `⚠️ 未作答：${unansweredCount} 題（將視為答錯）\n`;
        }

        confirmMessage += '\n⚠️ 完成後將無法修改答案！';

        if (!confirm(confirmMessage)) {
            return;
        }

        // 核心修改：在顯示結果前，根據最終答案計算分數和錯題
        this.calculateFinalResults();

        this.stopTimer();
        this.state.isQuizActive = false;
        this.unlockInterface();

        // 🔥 修改：根據會員等級處理同步邏輯 🔥
        const memberLevel = UsageManager.getMemberLevel();

        if (memberLevel === 'guest') {
            // 遊客：提示登入可解鎖雲端同步
            this.showAlert(
                '📝 測驗完成！成績已儲存於本機。\n\n' +
                '💡 登入後可解鎖雲端同步功能，跨裝置保存進度！',
                'info'
            );
        } else if (memberLevel === 'free') {
            // 免費會員：提示升級可解鎖雲端同步
            this.showAlert(
                '📝 測驗完成！成績已儲存於本機。\n\n' +
                '💎 升級 VIP 即可解鎖雲端同步，永久保存學習記錄！',
                'info'
            );
        } else {
            // 付費會員：執行雲端同步
            this.showLoading('正在上傳成績與錯題...');

            try {
                const [practiceSuccess, wrongSuccess] = await Promise.all([
                    this.syncPracticeRecord(),
                    this.updateWrongQuestions()
                ]);

                this.hideLoading();

                if (practiceSuccess && wrongSuccess) {
                    this.showAlert('✅ 雲端同步完成！(成績與錯題皆已儲存)', 'success');
                } else if (practiceSuccess) {
                    this.showAlert('⚠️ 成績上傳成功，但錯題同步失敗，請稍後再試。', 'warning');
                } else if (wrongSuccess) {
                    this.showAlert('⚠️ 錯題上傳成功，但成績同步失敗，請稍後再試。', 'warning');
                } else {
                    this.showAlert('❌ 雲端同步失敗，請檢查網路連線。', 'error');
                }
            } catch (error) {
                this.hideLoading();
                this.showAlert('❌ 發生未預期的錯誤', 'error');
                console.error('同步錯誤:', error);
            }
        }

        this.showResult();
        this.saveUserData(true);
        this.updateReviewButtonState();
    },

    // 顯示結果
    showResult() {
        const total = this.state.questions.length;
        const score = this.state.score;
        const percentage = total > 0 ? (score / total * 100).toFixed(1) : 0;
        const duration = this.calculateTimeTaken();

        let resultHTML = `
                    <div class="text-center mb-4">
                        <h3>📊 ${this.state.currentMode === 'review' ? '複習' : '測驗'}結果</h3>
                        <div class="progress my-3" style="height: 25px;">
                            <div class="progress-bar ${percentage >= 70 ? 'bg-success' : 'bg-warning'}" 
                                 style="width: ${percentage}%">${percentage}%</div>
                        </div>
                    </div>
                    <div class="row text-center mb-4">
                        <div class="col-3">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h4 class="text-primary">${score}</h4>
                                    <small>得分</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h4 class="text-info">${total}</h4>
                                    <small>總題數</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h4 class="text-warning">${percentage}%</h4>
                                    <small>正確率</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-3">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h4 class="text-secondary">${duration}分</h4>
                                    <small>用時</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="alert ${percentage >= 70 ? 'alert-success' : 'alert-warning'} mb-4">
                        <h5 class="alert-heading">${percentage >= 70 ? '🎉 恭喜通過！' : '💪 繼續努力！'}</h5>
                        <p class="mb-0">${percentage >= 70 ? '達到官方合格標準(70%)，考試準備良好！' : '距離合格標準還需要加強，建議多加練習錯題。'}</p>
                    </div>
                `;

        if (this.state.wrongQuestions.length > 0) {
            resultHTML += this._generateWrongQuestionsHTML();
        }

        document.getElementById('result-content').innerHTML = resultHTML;
        this.modals.result.show();
    },

    // 計算測驗時間
    calculateTimeTaken() {
        if (this.state.startTime) {
            return Math.round((new Date() - this.state.startTime) / 1000 / 60);
        }
        return 0;
    },

    // 產生錯題分析HTML
    _generateWrongQuestionsHTML() {
        let wrongQuestionsHTML = `
                    <div class="card mt-4">
                        <div class="card-header bg-danger text-white">
                            <h5 class="mb-0">❌ 錯題分析 (${this.state.wrongQuestions.length}題)</h5>
                        </div>
                        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                `;

        const topicWrongs = {};
        this.state.wrongQuestions.forEach(q => {
            const topic = q.topic || '未分類';
            if (!topicWrongs[topic]) topicWrongs[topic] = [];
            topicWrongs[topic].push(q);
        });

        for (const [topic, questions] of Object.entries(topicWrongs)) {
            wrongQuestionsHTML += `<div class="mb-4"><h6 class="border-bottom pb-2">【${topic}】: ${questions.length}題</h6>`;
            questions.forEach((q, index) => {
                const qOriginalIndex = this.state.questions.indexOf(q);
                const userAnswerData = this.state.userAnswers[qOriginalIndex];
                const qMapping = this.state.questionMapping[qOriginalIndex];
                const qId = `wrong-q-detail-${topic.replace(/\s+/g, '-')}-${index}`;

                let userAnswerText = '未作答', correctAnswerLetter = q.correct_answer_letter, correctAnswerText = q.options[q.correct_answer_index];

                if (userAnswerData && qMapping) {
                    const userSelectedOpt = qMapping.shuffledOptions.find(opt =>
                        opt.originalIndex === userAnswerData.originalIndex
                    );
                    if (userSelectedOpt) userAnswerText = userSelectedOpt.text;
                    correctAnswerLetter = qMapping.correctLetter;
                } else if (userAnswerData) {
                    userAnswerText = q.options[userAnswerData.originalIndex] || '未知';
                }

                wrongQuestionsHTML += `
                            <div class="mb-3">
                                <a class="fw-bold text-decoration-none text-dark" data-bs-toggle="collapse" href="#${qId}">
                                    ${index + 1}. ${q.question}
                                </a>
                                <div class="ps-3 mt-1">
                                    <div class="text-danger">您的答案: ${userAnswerData ? userAnswerData.answer : '未作答'} (${userAnswerText})</div>
                                    <div class="text-success">正確答案: ${correctAnswerLetter} (${correctAnswerText})</div>
                                    <div class="collapse mt-2" id="${qId}">
                                        <div class="card card-body bg-light">
                                            <h6 class="text-primary mb-2">題目解析:</h6>
                                            ${q.explanation || '無解析'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
            });
            wrongQuestionsHTML += `</div>`;
        }
        wrongQuestionsHTML += `</div></div>`;
        return wrongQuestionsHTML;
    },

    // 複習錯題
    reviewWrongQuestions() {
        if (this.state.wrongQuestions.length === 0) {
            this.showAlert('沒有錯題需要複習', 'info');
            return;
        }

        this.modals.result.hide();
        this.state.currentMode = 'review';
        this.state.selectedReviewMode = 'wrong';

        this.state.questions = [...this.state.wrongQuestions];
        this.state.currentQuestionIndex = 0;
        this.state.score = 0;
        this.state.userAnswers = {};
        this.state.markedQuestions = []; // 新增這一行
        this.state.questionMapping = {};
        this.state.wrongQuestions = [];

        this.state.questions.forEach((q, index) => q.number = index + 1);

        this.displayQuestion();
        this.updateButtonStates();
        this.showAlert('開始複習錯題', 'success');
    },

    // 重新測驗
    restartQuiz() {
        this.modals.result.hide();
        this.state.isQuizActive = false;
        this.stopTimer();
        this.unlockInterface();
        this.elements.quizContainer.classList.add('d-none');
        this.elements.settingsPanel.classList.remove('d-none');
        this.elements.quizStatus.style.display = 'none';
        this.elements.quizStatus.classList.remove('active');

        this.state.currentQuestionIndex = 0;
        this.state.userAnswers = {};
        this.state.markedQuestions = []; // 新增這一行
        this.state.questionMapping = {};
        this.state.score = 0;
        this.state.wrongQuestions = [];
        this.state.questions = [];
        this.state.startTime = null;

        if (this.state.selectedDatabase) this.elements.startBtn.disabled = false;
        this.showAlert('可以重新選擇題目數量和測驗設定了！', 'success');
    },

    // 更新按鈕狀態
    updateButtonStates() {
        const hasAnswered = this.state.currentQuestionIndex in this.state.userAnswers;
        const isFirst = this.state.currentQuestionIndex === 0;
        const isLast = this.state.currentQuestionIndex === this.state.questions.length - 1;
        const isPracticeOrReview = this.state.currentMode === 'practice' || this.state.currentMode === 'review';

        // 上一題：只要不是第一題，就可用
        this.elements.prevBtn.disabled = isFirst;

        // 🔥 修正：提交按鈕現在是「查看解析」按鈕，在練習模式下應該啟用
        // 練習/複習模式：如果已作答，按鈕顯示為「查看解析」且啟用
        // 考試模式：按鈕隱藏
        if (isPracticeOrReview && hasAnswered) {
            this.elements.submitBtn.disabled = false; // 啟用「查看解析」按鈕
        } else {
            this.elements.submitBtn.disabled = true;
        }

        // 下一題：只要不是最後一題，就可用
        this.elements.nextBtn.disabled = isLast;

        // 完成：恆定可用
        this.elements.finishBtn.disabled = false;
    },

    // 計算完成按鈕狀態
    calculateFinishButtonState() {
        const totalQuestions = this.state.questions.length;
        const answeredCount = Object.keys(this.state.userAnswers).length;

        switch (this.state.currentMode) {
            case 'exam':
                return answeredCount === totalQuestions || !this.state.isTimerRunning;
            case 'practice':
                const practiceMinimum = Math.ceil(totalQuestions * 0.5);
                return answeredCount >= practiceMinimum;
            case 'review':
                const reviewMinimum = Math.ceil(totalQuestions * 0.3);
                return answeredCount >= reviewMinimum;
            default:
                return false;
        }
    },

    // 更新完成按鈕文字
    updateFinishButtonText() {
        const totalQuestions = this.state.questions.length;
        const answeredCount = Object.keys(this.state.userAnswers).length;
        const finishBtn = this.elements.finishBtn;

        if (finishBtn.disabled) {
            let requiredCount;
            let modeText;

            switch (this.state.currentMode) {
                case 'exam':
                    requiredCount = totalQuestions;
                    modeText = '模擬考試需回答所有題目';
                    break;
                case 'practice':
                    requiredCount = Math.ceil(totalQuestions * 0.5);
                    modeText = '練習模式需回答至少50%';
                    break;
                case 'review':
                    requiredCount = Math.ceil(totalQuestions * 0.3);
                    modeText = '複習模式需回答至少30%';
                    break;
                default:
                    requiredCount = totalQuestions;
                    modeText = '需回答更多題目';
            }

            finishBtn.title = `${modeText} (${answeredCount}/${requiredCount})`;
            finishBtn.innerHTML = `
                        <i class="fas fa-flag-checkered me-1"></i> 
                        <span class="d-none d-sm-inline">完成 (${answeredCount}/${requiredCount})</span>
                    `;
        } else {
            finishBtn.title = '可以完成測驗了！';
            finishBtn.innerHTML = `
                        <i class="fas fa-flag-checkered me-1"></i> 
                        <span class="d-none d-sm-inline">完成測驗</span>
                    `;
        }
    },

    // 新增：允許修改答案
    enableAnswerModification() {
        this.elements.explanationBox.classList.add('d-none');
        this.elements.modifyAnswerBtn.classList.add('d-none');
        this.elements.submitBtn.classList.add('d-none'); // 隱藏解析按鈕
        document.querySelectorAll('input[name="quiz-option"]').forEach(input => {
            input.disabled = false;
        });

        // 🔥 重新添加自動暫存事件監聽器
        document.querySelectorAll('input[name="quiz-option"]').forEach(input => {
            input.addEventListener('change', () => this.autoSaveAnswer());
        });

        this.showAlert('您可以修改答案了，選擇新答案後會自動保存。', 'info');
    },

    // 新增：標記/取消標記題目
    toggleMarkForReview() {
        const index = this.state.currentQuestionIndex;
        const markedIndex = this.state.markedQuestions.indexOf(index);

        if (markedIndex > -1) {
            this.state.markedQuestions.splice(markedIndex, 1);
            this.elements.markReviewBtn.classList.remove('active');
            this.elements.markReviewBtn.innerHTML = '<i class="fas fa-flag"></i> 標記此題';
        } else {
            this.state.markedQuestions.push(index);
            this.elements.markReviewBtn.classList.add('active');
            this.elements.markReviewBtn.innerHTML = '<i class="fas fa-flag"></i> 已標記';
        }
    },

    // 新增：顯示題號總覽模態框
    showOverviewModal() {
        const grid = document.getElementById('overview-grid');
        grid.innerHTML = '';

        for (let i = 0; i < this.state.questions.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'btn overview-q-btn';
            btn.textContent = i + 1;

            if (i === this.state.currentQuestionIndex) {
                btn.classList.add('current');
            }
            if (i in this.state.userAnswers) {
                btn.classList.add('answered');
            }
            if (this.state.markedQuestions.includes(i)) {
                const flag = document.createElement('i');
                flag.className = 'fas fa-flag';
                btn.appendChild(flag);
                btn.classList.add('marked');
            }

            btn.addEventListener('click', () => {
                this.jumpToQuestion(i);
            });

            grid.appendChild(btn);
        }
        this.modals.overview.show();
    },

    // 新增：跳轉到指定題目
    jumpToQuestion(index) {
        this.state.currentQuestionIndex = index;
        this.displayQuestion();
        this.modals.overview.hide();
    },

    // 新增：計算最終結果的獨立函式
    calculateFinalResults() {
        this.state.score = 0;
        this.state.wrongQuestions = [];
        const sessionCorrectQuestions = new Set();
        const sessionIncorrectQuestions = new Set();

        this.state.questions.forEach((question, index) => {
            const userAnswerData = this.state.userAnswers[index];
            const isCorrect = userAnswerData ? userAnswerData.originalIndex === question.correct_answer_index : false;

            if (isCorrect) {
                this.state.score++;
                sessionCorrectQuestions.add(question.question);
            } else {
                this.state.wrongQuestions.push(question);
                sessionIncorrectQuestions.add(question.question);
            }

            // 記錄本次作答歷史
            if (userAnswerData) {
                const mapping = this.state.questionMapping[index];
                const historyEntry = {
                    timestamp: new Date().toISOString(),
                    database: this.state.selectedDatabase,
                    question: question.question,
                    options: question.options,
                    user_answer: userAnswerData.answer,
                    correct_answer_letter: mapping ? mapping.correctLetter : 'N/A',
                    is_correct: isCorrect,
                    topic: question.topic,
                    subtopic: question.subtopic,
                    explanation: question.explanation
                };
                this.state.userData.history.push(historyEntry);
            }
        });

        // 更新全域的對錯題記錄
        // 1. 將本次答對的題目，從全域錯題中移除
        this.state.userData.incorrect = (this.state.userData.incorrect || []).filter(q => !sessionCorrectQuestions.has(q));
        // 2. 將本次答錯的題目，加入全域錯題中 (去重)
        this.state.userData.incorrect = [...new Set([...(this.state.userData.incorrect || []), ...sessionIncorrectQuestions])];
    },


    // 更新統計顯示
    updateStats() {
        let score = 0;
        const answered = Object.keys(this.state.userAnswers).length;
        for (const index in this.state.userAnswers) {
            const question = this.state.questions[index];
            const userAnswer = this.state.userAnswers[index];
            if (userAnswer.originalIndex === question.correct_answer_index) {
                score++;
            }
        }
        const percentage = answered > 0 ? (score / answered * 100).toFixed(1) : 0;
        this.elements.statsDisplay.textContent = `得分: ${score}/${answered} (${percentage}%)`;
    },

    // 顯示統計資料
    showStatistics() {
        const correctCount = this.state.userData.correct ? this.state.userData.correct.length : 0;
        const incorrectCount = this.state.userData.incorrect ? this.state.userData.incorrect.length : 0;
        const totalAnswered = correctCount + incorrectCount;
        const accuracy = totalAnswered > 0 ? (correctCount / totalAnswered) * 100 : 0;

        const databaseStats = {};
        (this.state.userData.history || []).forEach(entry => {
            const db = entry.database || '未知';
            if (!databaseStats[db]) {
                databaseStats[db] = { correct: 0, total: 0 };
            }
            databaseStats[db].total += 1;
            if (entry.is_correct) {
                databaseStats[db].correct += 1;
            }
        });

        const topicStats = {};
        (this.state.userData.history || []).forEach(entry => {
            const topic = entry.topic || '未分類';
            if (!topicStats[topic]) {
                topicStats[topic] = { correct: 0, total: 0 };
            }
            topicStats[topic].total += 1;
            if (entry.is_correct) {
                topicStats[topic].correct += 1;
            }
        });

        let statsHTML = `
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card bg-primary text-white">
                                <div class="card-body text-center">
                                    <h4>${correctCount}</h4>
                                    <p class="mb-0">答對題數</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card bg-danger text-white">
                                <div class="card-body text-center">
                                    <h4>${incorrectCount}</h4>
                                    <p class="mb-0">答錯題數</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0">整體表現</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>總答題數:</strong> ${totalAnswered}</p>
                                    <p><strong>整體正確率:</strong> ${accuracy.toFixed(1)}%</p>
                                </div>
                                <div class="col-md-6">
                                    <div class="progress" style="height: 30px;">
                                        <div class="progress-bar ${accuracy >= 70 ? 'bg-success' : 'bg-warning'}" style="width: ${accuracy}%">
                                            ${accuracy.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0">各題庫表現</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>題庫</th>
                                            <th>正確率</th>
                                            <th>正確/總數</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;

        Object.keys(databaseStats).forEach(db => {
            const stats = databaseStats[db];
            const dbAccuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            const config = this.examConfigs[db];
            const dbName = config ? config.name : db;

            statsHTML += `
                        <tr>
                            <td>${dbName}</td>
                            <td>
                                <div class="progress" style="height: 15px;">
                                    <div class="progress-bar ${dbAccuracy < 60 ? 'bg-danger' : dbAccuracy < 80 ? 'bg-warning' : 'bg-success'}" 
                                         style="width: ${dbAccuracy}%;"></div>
                                </div>
                                ${dbAccuracy.toFixed(1)}%
                            </td>
                            <td>${stats.correct}/${stats.total}</td>
                        </tr>
                    `;
        });

        if (Object.keys(databaseStats).length === 0) {
            statsHTML += '<tr><td colspan="3" class="text-center">尚未有練習記錄</td></tr>';
        }

        statsHTML += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header bg-warning text-dark">
                            <h5 class="mb-0">主題分析</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>主題</th>
                                            <th>正確率</th>
                                            <th>建議</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                `;

        Object.keys(topicStats).forEach(topic => {
            const stats = topicStats[topic];
            const topicAccuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
            let suggestion = '';

            if (topicAccuracy < 60) {
                suggestion = '🔴 重點加強';
            } else if (topicAccuracy < 80) {
                suggestion = '🟡 持續練習';
            } else {
                suggestion = '🟢 表現良好';
            }

            statsHTML += `
                        <tr>
                            <td>${topic}</td>
                            <td>
                                <div class="progress" style="height: 15px;">
                                    <div class="progress-bar ${topicAccuracy < 60 ? 'bg-danger' : topicAccuracy < 80 ? 'bg-warning' : 'bg-success'}" 
                                         style="width: ${topicAccuracy}%;"></div>
                                </div>
                                ${topicAccuracy.toFixed(1)}%
                            </td>
                            <td>${suggestion}</td>
                        </tr>
                    `;
        });

        if (Object.keys(topicStats).length === 0) {
            statsHTML += '<tr><td colspan="3" class="text-center">尚未有練習記錄</td></tr>';
        }

        statsHTML += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;

        document.getElementById('stats-content').innerHTML = statsHTML;
        this.modals.stats.show();
    },

    // 匯出錯題
    exportWrongQuestions() {
        // 🔥 權限檢查
        const memberLevel = UsageManager.getMemberLevel();

        if (memberLevel === 'guest') {
            this.showAlert('⚠️ 請先登入才能匯出錯題！\n\n登入後免費會員每月可匯出 5 次。', 'warning');
            return;
        }

        // 免費會員匯出次數限制 (5次/月)
        if (memberLevel === 'free') {
            const exportKey = `export_monthly_${new Date().toISOString().slice(0, 7)}`;
            const exportCount = parseInt(localStorage.getItem(exportKey) || '0');

            if (exportCount >= 5) {
                this.showAlert('⏰ 本月匯出次數已達上限 (5次/月)！\n\n💎 升級付費會員即可無限次匯出！', 'warning');
                return;
            }

            // 增加匯出次數
            localStorage.setItem(exportKey, (exportCount + 1).toString());
        }
        if (!this.state.userData.incorrect || this.state.userData.incorrect.length === 0) {
            this.showAlert('目前沒有錯題記錄', 'info');
            return;
        }

        let exportText = "iPAS AI應用規劃師認證考試錯題集\n";
        exportText += `匯出時間: ${new Date().toLocaleString()}\n`;
        exportText += `總錯題數: ${this.state.userData.incorrect.length}\n\n`;
        exportText += "=".repeat(50) + "\n\n";

        const incorrectQuestions = this.state.userData.incorrect;
        const questionData = {};

        (this.state.userData.history || []).forEach(entry => {
            if (incorrectQuestions.includes(entry.question) && !questionData[entry.question]) {
                questionData[entry.question] = entry;
            }
        });

        incorrectQuestions.forEach((questionText, i) => {
            exportText += `【題目 ${i + 1}】\n${questionText}\n\n`;

            if (questionData[questionText]) {
                const data = questionData[questionText];

                const options = data.options || [];
                if (options.length > 0) {
                    exportText += "選項:\n";
                    options.forEach((option, j) => {
                        exportText += `${String.fromCharCode(65 + j)}. ${option}\n`;
                    });
                    exportText += "\n";
                }

                exportText += `正確答案: ${data.correct_answer_letter || '未知'}\n`;
                exportText += `您的答案: ${data.user_answer || '未知'}\n`;
                const config = this.examConfigs[data.database];
                exportText += `題庫來源: ${config ? config.name : data.database}\n`;
                exportText += `主題分類: ${data.topic || '未分類'} > ${data.subtopic || '未分類'}\n`;

                if (data.explanation) {
                    exportText += `解析: ${data.explanation}\n`;
                }
            }

            exportText += "\n" + "-".repeat(50) + "\n\n";
        });

        exportText += "\n建議復習重點:\n";
        exportText += "1. 重點關注答錯率高的主題\n";
        exportText += "2. 理解題目背後的商業邏輯\n";
        exportText += "3. 加強AI應用規劃的實務知識\n";
        exportText += "4. 定期回顧錯題，避免重複犯錯\n";

        const filename = `iPAS_AI應用規劃師_錯題集_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}.txt`;
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        this.showAlert(`錯題已匯出至 ${filename}`, 'success');
    },

    // 重置學習進度
    resetProgress() {
        if (confirm('確定要重置所有學習進度嗎？此操作不可逆。\n\n將清除：\n- 所有答題記錄\n- 錯題統計\n- 學習歷史')) {
            this.state.userData = {
                correct: [],
                incorrect: [],
                history: [],
                databaseStats: {}
            };
            this.saveUserData();
            this.updateReviewButtonState();
            this.modals.stats.hide();
            this.showAlert('學習進度已重置', 'success');
        }
    },

    // 計時器功能
    startTimer() {
        this.state.isTimerRunning = true;
        this.state.startTime = new Date();
        this.elements.quizTimerDisplay.style.display = 'block';
        this.updateTimer();
    },

    stopTimer() {
        this.state.isTimerRunning = false;
        this.elements.quizTimerDisplay.style.display = 'none';
        if (this.state.timerId) {
            clearTimeout(this.state.timerId);
            this.state.timerId = null;
        }
    },

    updateTimer() {
        if (!this.state.isTimerRunning) {
            return;
        }

        const currentTime = new Date();
        const elapsedSeconds = Math.floor((currentTime - this.state.startTime) / 1000);
        const remainingSeconds = (this.state.examDuration * 60) - elapsedSeconds;

        if (remainingSeconds <= 0) {
            this.updateTimerDisplay('00:00');
            this.elements.quizTimerDisplay.classList.add('warning');
            this.stopTimer();
            this.showAlert('⏰ 考試時間結束！系統將自動交卷並計算成績。', 'warning');
            this.finishQuiz();
            return;
        }

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.updateTimerDisplay(timeString);

        if (minutes < 5) {
            this.elements.quizTimerDisplay.classList.add('warning');
        } else {
            this.elements.quizTimerDisplay.classList.remove('warning');
        }

        this.state.timerId = setTimeout(() => this.updateTimer(), 1000);
    },

    updateTimerDisplay(timeString) {
        this.elements.quizTimerDisplay.innerHTML = `<i class="fas fa-clock me-2"></i>剩餘時間: ${timeString}`;
    },

    // 顯示提示訊息
    showAlert(message, type = 'info') {
        const alertTypes = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        };

        const alertClass = alertTypes[type] || 'alert-info';
        const iconMap = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-triangle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        const icon = iconMap[type] || 'fa-info-circle';

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = `
                    top: 100px; 
                    right: 20px; 
                    z-index: 9999; 
                    min-width: 300px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                `;
        alertDiv.innerHTML = `
                    <i class="fas ${icon} me-2"></i>${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    },

    // 顯示加載動畫
    showLoading(text = '處理中...') {
        this.elements.loadingText.textContent = text;
        this.elements.loadingOverlay.classList.remove('d-none');
    },

    // 隱藏加載動畫
    hideLoading() {
        this.elements.loadingOverlay.classList.add('d-none');
    },
    // ✨✨✨ 新增數據同步核心函數 ✨✨✨
    async syncPracticeRecord() {
        const generalUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const lineUserData = JSON.parse(localStorage.getItem('ipas_user_data') || '{}');
        const userId = generalUserData.google_id || generalUserData.userId || lineUserData.userId;

        // 未登入時回傳 false，但不顯示 alert（由 finishQuiz 統一處理）
        if (!userId) {
            console.log('⚠️ 未登入，成績不會上傳雲端');
            return false;
        }

        if (!this.state.questions || this.state.questions.length === 0) {
            return true; // 沒有題目視為成功（沒有需要同步的）
        }

        // 1. 組裝要傳送的資料
        const totalQuestions = this.state.questions.length;

        // 將 answers 轉換為 n8n Code 節點期望的格式
        const answersData = Object.keys(this.state.userAnswers).map(index => {
            const q = this.state.questions[index];
            const answer = this.state.userAnswers[index];
            const isCorrect = answer.originalIndex === q.correct_answer_index;
            return {
                q_index: parseInt(index),
                user_answer: answer.answer,
                user_original_index: answer.originalIndex,
                is_correct: isCorrect,
                time: answer.timestamp.toISOString()
            };
        });

        const accuracy = totalQuestions > 0 ? (this.state.score / totalQuestions * 100).toFixed(2) : 0;

        const syncPayload = {
            userId: userId,
            databaseType: this.state.selectedDatabase,
            questionCount: totalQuestions,
            startTime: this.state.startTime ? this.state.startTime.toISOString() : new Date().toISOString(),
            endTime: new Date().toISOString(),
            score: this.state.score,
            accuracy: parseFloat(accuracy),
            answers: answersData,
            markedQuestions: this.state.markedQuestions
        };

        const webhookUrl = 'https://nickleo9.zeabur.app/webhook/save-practice-record';

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(syncPayload)
            });

            if (response.ok) {
                console.log('✅ 成績同步成功');
                return true;
            } else {
                console.error('❌ 成績同步失敗:', response.status);
                return false;
            }
        } catch (error) {
            console.error('🚨 成績同步網路錯誤:', error);
            return false;
        }
    },   // <-- 這是 syncPracticeRecord 函式的結束

    async updateWrongQuestions() {
        const generalUserData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const lineUserData = JSON.parse(localStorage.getItem('ipas_user_data') || '{}');
        const userId = generalUserData.google_id || generalUserData.userId || lineUserData.userId;

        // 未登入時回傳 false
        if (!userId) {
            console.log('⚠️ 未登入，不記錄錯題');
            return false;
        }

        // 沒有答題記錄時視為成功（沒有需要同步的）
        if (Object.keys(this.state.userAnswers).length === 0) {
            console.log('⚠️ 沒有答題記錄');
            return true;
        }

        try {
            console.log('📤 開始更新錯題集...');

            // 🔥 關鍵修正:把打亂後的正確答案加到每個題目上
            const questionsWithCorrectMapping = this.state.questions.map((q, index) => {
                const mapping = this.state.questionMapping[index];
                return {
                    ...q,
                    // 保留原始資料
                    original_correct_answer_letter: q.correct_answer_letter,
                    original_correct_answer_index: q.correct_answer_index,
                    // 🔥 加上打亂後的正確答案
                    correct_answer_letter: mapping ? mapping.correctLetter : q.correct_answer_letter,
                    // 也可以加上打亂後的選項順序(可選)
                    shuffled_options: mapping ? mapping.shuffledOptions.map(opt => opt.text) : q.options
                };
            });

            const wrongQuestionsData = {
                userId: userId,
                databaseType: this.state.selectedDatabase,
                answers: this.state.userAnswers,
                questions: questionsWithCorrectMapping,
                timestamp: new Date().toISOString()
            };

            const response = await fetch('https://nickleo9.zeabur.app/webhook/update-wrong-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(wrongQuestionsData)
            });

            if (response.ok) {
                console.log('✅ 錯題集更新成功');
                return true;
            } else {
                console.error('❌ 錯題集更新失敗:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ 更新錯題集錯誤:', error);
            return false;
        }
    }




};  // <--- 這是 iPASQuizApp 物件的結束

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    iPASQuizApp.init();
});

// ==================== 登入管理系統 (LoginManager) ====================

const UsageManager = {
    // 使用限制設定
    LIMITS: {
        guest: { count: 5, period: 'daily' },      // 遊客：每日 5 次
        free: { count: 30, period: 'daily' },    // 免費會員：每日 30 次
        paid: { count: Infinity, period: null }    // 付費會員：無限制
    },

    // 取得會員等級
    getMemberLevel() {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const lineData = JSON.parse(localStorage.getItem('ipas_user_data') || '{}');

        // 未登入 = 遊客
        if (!userData.google_id && !userData.userId && !lineData.userId) {
            return 'guest';
        }

        // 已登入，檢查會員等級
        const memberLevel = userData.member_level || lineData.memberLevel || '免費會員';
        if (memberLevel.includes('付費') || memberLevel.includes('VIP') || memberLevel.includes('付費會員')) {
            // 有 paid_until 才驗證是否過期，沒有則信任 member_level（舊資料向下相容）
            const paidUntil = userData.paid_until || lineData.paid_until;
            if (paidUntil && new Date(paidUntil) <= new Date()) {
                return 'free'; // 到期降回免費
            }
            return 'paid';
        }
        return 'free';
    },

    // 取得儲存 key
    getStorageKey(period) {
        if (period === 'daily') {
            return `usage_daily_${new Date().toDateString()}`;
        } else if (period === 'monthly') {
            return `usage_monthly_${new Date().toISOString().slice(0, 7)}`; // YYYY-MM
        }
        return 'usage';
    },

    // 取得目前使用次數
    getUsageCount(period) {
        const key = this.getStorageKey(period);
        return parseInt(localStorage.getItem(key) || '0');
    },

    // 增加使用次數
    incrementUsage() {
        const memberLevel = this.getMemberLevel();
        const limit = this.LIMITS[memberLevel];

        if (limit.period) {
            const key = this.getStorageKey(limit.period);
            const currentUsage = this.getUsageCount(limit.period);
            localStorage.setItem(key, (currentUsage + 1).toString());
        }
    },

    // 檢查是否可以使用
    canUseSystem() {
        const memberLevel = this.getMemberLevel();
        const limit = this.LIMITS[memberLevel];

        // 付費會員無限制
        if (memberLevel === 'paid') return { allowed: true, memberLevel };

        const currentUsage = this.getUsageCount(limit.period);
        const remaining = limit.count - currentUsage;

        return {
            allowed: remaining > 0,
            memberLevel,
            currentUsage,
            limit: limit.count,
            remaining: Math.max(0, remaining),
            period: limit.period === 'daily' ? '今日' : '本月'
        };
    },

    // 取得剩餘次數（用於 UI 顯示）
    getRemainingInfo() {
        const result = this.canUseSystem();
        if (result.memberLevel === 'paid') {
            return '無限制';
        }
        return `${result.remaining}/${result.limit} (${result.period})`;
    }
};


const LoginManager = {
    // Line Login 設定
    LINE_CHANNEL_ID: '2008218944',  // ⚠️ 記得替換
    LINE_CALLBACK_URL: 'https://nickleo9.github.io/GenAI/login-callback.html',

    // Supabase Google Login 設定 (新增)
    // *** 請確保您已經將這些佔位符替換為您的真實專案值 ***
    SUPABASE_URL: 'https://naftwmajxuoauokuwpaz.supabase.co', // 您的 Supabase 專案 URL
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZnR3bWFqeHVvYXVva3V3cGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTgxNTgsImV4cCI6MjA3NjU3NDE1OH0.zf-eKQVC5PCFFC_ZucGNbFsc8n4627rRxZQ2A0S4FM4', // 您的 Supabase Anon Key

    // n8n Webhook URL
    N8N_WEBHOOK_URL: 'https://nickleo9.zeabur.app/webhook/line-login',  // ⚠️ 記得替換


    async checkMemberStatus(userId) {
        try {
            const response = await fetch('https://nickleo9.zeabur.app/webhook/check-member-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userId })
            });
            return await response.json();
        } catch (error) {
            return { isPaid: false, memberLevel: '免費會員' };
        }
    },

    // 初始化
    init() {
        this.attachEventListeners();
        this.checkLoginStatus();
        this.handlePaymentReturn(); // 新增：處理支付回傳
    },

    // 處理支付回傳
    handlePaymentReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            iPASQuizApp.showAlert('💎 感謝您的訂閱！會員權限已開通。', 'success');

            // 正確判斷用戶類型（Google 優先，其次 LINE）
            let userData = null;
            let storageKey = null;
            let userId = null;

            const googleUserStr = localStorage.getItem('user_data');
            if (googleUserStr) {
                try {
                    const parsed = JSON.parse(googleUserStr);
                    const id = parsed.google_id || parsed.userId;
                    if (id) {
                        userData = parsed;
                        storageKey = 'user_data';
                        userId = id;
                    }
                } catch (e) {}
            }

            if (!userId) {
                const lineUserStr = localStorage.getItem('ipas_user_data');
                if (lineUserStr) {
                    try {
                        const parsed = JSON.parse(lineUserStr);
                        if (parsed.userId) {
                            userData = parsed;
                            storageKey = 'ipas_user_data';
                            userId = parsed.userId;
                        }
                    } catch (e) {}
                }
            }

            if (userId && storageKey) {
                this.checkMemberStatus(userId).then(status => {
                    if (status && status.memberLevel) {
                        const updatedUser = {
                            ...userData,
                            member_level: status.memberLevel,
                            // 伺服器有回傳 paid_until 就更新，否則保留本地的
                            paid_until: status.paid_until || userData.paid_until
                        };
                        localStorage.setItem(storageKey, JSON.stringify(updatedUser));
                        this.showUserInfo(updatedUser);
                    }
                });
            }

            // 清除網址參數，避免重複提示
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    },



    // 綁定事件
    attachEventListeners() {
        // Line 登入按鈕
        const lineLoginBtn = document.getElementById('line-login-btn');
        if (lineLoginBtn) {
            lineLoginBtn.addEventListener('click', () => this.lineLogin());
        }

        // 導航欄登入按鈕
        const navLoginBtn = document.getElementById('nav-login-btn');
        if (navLoginBtn) {
            navLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // 點擊導航欄登入時，跳轉到登入區塊
                document.getElementById('login-section').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Google 登入按鈕 (實作 Google Login)
        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this.googleLogin());
        }

        // 登出按鈕
        document.querySelectorAll('[id$="logout-btn"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });
    },

    // Line 登入
    lineLogin() {
        const state = this.generateRandomString(32);
        const nonce = this.generateRandomString(32);

        // 儲存 state 用於驗證
        localStorage.setItem('line_login_state', state);

        // 建立 Line Login URL
        const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
            `response_type=code` +
            `&client_id=${this.LINE_CHANNEL_ID}` +
            `&redirect_uri=${encodeURIComponent(this.LINE_CALLBACK_URL)}` +
            `&state=${state}` +
            `&scope=profile%20openid%20email` +
            `&nonce=${nonce}` +
            `&prompt=consent`;

        console.log('🔗 跳轉到 Line 登入頁面...');
        window.location.href = lineLoginUrl;
    },

    // Google 登入 (新增)
    googleLogin() {
        // 由於用戶已經手動填寫了正確的 URL 和 KEY，我們直接移除錯誤檢查
        // 以便讓登入程序順利啟動

        try {
            // Supabase 的 Google OAuth URL
            const redirectUrl = `${this.SUPABASE_URL}/auth/v1/authorize?` +
                `provider=google&` +
                // 確保回調 URL 指向我們建立的 google-callback.html
                `redirect_to=${encodeURIComponent(window.location.origin + '/GenAI/google-callback.html')}`;

            iPASQuizApp.showAlert('正在跳轉 Google 登入...', 'info');
            window.location.href = redirectUrl;
        } catch (error) {
            console.error('Google 登入錯誤:', error);
            iPASQuizApp.showAlert('Google 登入發生錯誤，請稍後再試', 'error');
        }
    },

    // 檢查登入狀態 (更新，檢查 Google/General 優先)
    checkLoginStatus() {
        // 1. 檢查 Google/General 登入 (由 google-callback.html 儲存，優先)
        const generalUserData = localStorage.getItem('user_data');
        // 2. 檢查 Line 登入 (原有的 ipas_user_data)
        const lineUserData = localStorage.getItem('ipas_user_data');

        let user = null;

        if (generalUserData) {
            try {
                user = JSON.parse(generalUserData);
                user.login_type = user.login_type || 'google'; // 確保有 login_type
                this.showUserInfo(user);
                console.log('✅ 用戶已登入 (General/Google):', user.name || user.email);
                return;
            } catch (error) {
                console.error('❌ General 用戶資料解析失敗:', error);
                localStorage.removeItem('user_data');
            }
        } else if (lineUserData) {
            try {
                user = JSON.parse(lineUserData);
                user.login_type = 'line'; // 標記為 Line 登入
                this.showUserInfo(user);
                console.log('✅ 用戶已登入 (Line):', user.displayName);
                return;
            } catch (error) {
                console.error('❌ Line 用戶資料解析失敗:', error);
                localStorage.removeItem('ipas_user_data');
            }
        }

        // 未登入
        this.showLoginButton();
    },

    // 顯示用戶資訊 (更新，兼容 Line 和 Google 的資料結構)
    showUserInfo(user) {

        console.log('✅ showUserInfo 函式已啟動，用戶名:', user.displayName || user.name);
        // 隱藏登入區塊
        const loginSection = document.getElementById('login-section');
        if (loginSection) loginSection.classList.add('d-none');

        const loginNavItem = document.getElementById('login-nav-item');
        if (loginNavItem) loginNavItem.classList.add('d-none');

        // 決定顯示名稱、頭像、登入方式
        const displayName = user.displayName || user.name || user.email || '使用者';
        const pictureUrl = user.pictureUrl || user.avatar;
        const loginType = user.login_type === 'google' ? 'Google' : 'Line';
        const memberLevel = user.member_level || '免費會員';

        // 顯示用戶資訊區塊
        const userWelcome = document.getElementById('user-welcome');
        if (userWelcome) {
            userWelcome.classList.remove('d-none');
            document.getElementById('user-avatar').src = pictureUrl;
            document.getElementById('user-name').textContent = displayName;
            document.getElementById('login-method').textContent = loginType;

            const lastLogin = new Date().toLocaleString('zh-TW');
            document.getElementById('last-login').textContent = lastLogin;

            // 顯示會員等級
            const levelSpan = document.getElementById('user-level-badge');
            if (levelSpan) {
                levelSpan.textContent = memberLevel;
                levelSpan.className = `badge ${memberLevel.includes('付費') ? 'bg-warning text-dark' : 'bg-primary'} ms-2`
            }
        }

        // 導航欄顯示用戶資訊
        const userNavItem = document.getElementById('user-nav-item');
        if (userNavItem) {
            userNavItem.classList.remove('d-none');
            document.getElementById('nav-user-avatar').src = pictureUrl;
            document.getElementById('nav-user-name').textContent = displayName;
        }

        // 🔥 新增:顯示/隱藏升級按鈕的邏輯
        const isPaid = memberLevel.includes('付費');

        // 取得所有升級相關元素
        const upgradeBtnLarge = document.getElementById('upgrade-btn-large');
        const freeMemberNotice = document.getElementById('free-member-notice');
        const navUpgradeItem = document.getElementById('nav-upgrade-item');

        if (!isPaid) {
            // 免費會員:顯示所有升級入口
            if (upgradeBtnLarge) upgradeBtnLarge.style.display = 'inline-block';
            if (freeMemberNotice) freeMemberNotice.style.display = 'block';
            if (navUpgradeItem) navUpgradeItem.style.display = 'block';
        } else {
            // 付費會員:隱藏所有升級入口
            if (upgradeBtnLarge) upgradeBtnLarge.style.display = 'none';
            if (freeMemberNotice) freeMemberNotice.style.display = 'none';
            if (navUpgradeItem) navUpgradeItem.style.display = 'none';
        }
    },


    // 顯示登入按鈕
    showLoginButton() {
        const loginSection = document.getElementById('login-section');
        if (loginSection) loginSection.classList.remove('d-none');

        const loginNavItem = document.getElementById('login-nav-item');
        if (loginNavItem) loginNavItem.classList.remove('d-none');

        const userWelcome = document.getElementById('user-welcome');
        if (userWelcome) userWelcome.classList.add('d-none');

        const userNavItem = document.getElementById('user-nav-item');
        if (userNavItem) userNavItem.classList.add('d-none');
    },

    // 登出 (更新，移除所有用戶數據)
    logout() {
        if (confirm('確定要登出嗎？\n您的學習進度將保存在雲端。')) {
            localStorage.removeItem('ipas_user_data'); // Line 舊數據
            localStorage.removeItem('user_data'); // Google/General 新數據
            console.log('👋 用戶已登出');
            location.reload();
        }
    },

    // 生成隨機字串
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
};

// 頁面載入完成後初始化登入管理
document.addEventListener('DOMContentLoaded', () => {
    LoginManager.init();
});
// 🔥 付費升級功能 JavaScript START

// 打開升級模態框
function openUpgradeModal() {
    const modal = new bootstrap.Modal(document.getElementById('upgrade-modal'));
    modal.show();
    console.log('📊 用戶點擊升級按鈕');
}

// 顯示功能鎖定模態框
function showFeatureLockedModal() {
    const modal = new bootstrap.Modal(document.getElementById('feature-locked-modal'));
    modal.show();
    console.log('🔒 用戶嘗試使用付費功能');
}

// 關閉模態框
function closeModal(modalId) {
    const modalElement = document.getElementById(modalId);
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
}

// 選擇方案
async function selectPlan(planType) {
    const plans = {
        monthly: { name: '月費會員', price: 199 },
        yearly: { name: '年費會員', price: 1999 }
    };

    const selectedPlan = plans[planType];
    const userData = JSON.parse(localStorage.getItem('user_data') || localStorage.getItem('ipas_user_data') || '{}');
    const userId = userData.id || userData.userId || userData.email || userData.displayName;

    if (!userId) {
        iPASQuizApp.showAlert('❌ 請先登入會員再執行升級！', 'warning');
        return;
    }

    console.log('🛒 選擇方案:', selectedPlan);
    closeModal('upgrade-modal');
    iPASQuizApp.showLoading('正在產生支付訂單...');

    try {
        const response = await fetch('https://nickleo9.zeabur.app/webhook/money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                plan: planType,
                amount: selectedPlan.price
            })
        });

        let result = await response.json();
        console.log('📡 n8n原始回應:', result);

        // 強制處理陣列或物件格式
        const data = Array.isArray(result) ? result[0] : result;
        console.log('📦 處理後回應資料:', data);

        if (data && data.success && data.ecpayParams) {
            iPASQuizApp.showAlert('✅ 訂單已產生，即將跳轉至綠界金流...', 'success');
            submitECPayForm(data.paymentUrl, data.ecpayParams);
        } else {
            const errorMsg = data ? (data.message || '後端回應成功但參數缺失') : '後端回應格式錯誤';
            console.error('❌ 金流參數校驗失敗:', errorMsg);
            throw new Error(errorMsg);
        }
    } catch (error) {
        console.error('支付錯誤:', error);
        iPASQuizApp.hideLoading();
        iPASQuizApp.showAlert('❌ 無法啟動支付流程，請稍後再試：' + error.message, 'error');
    }
}

// 動態產生綠界表單並送出 (新增)
function submitECPayForm(url, params) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;
    form.style.display = 'none';

    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = params[key];
            form.appendChild(input);
        }
    }

    document.body.appendChild(form);
    form.submit();
}

// 檢查功能權限(用於鎖定付費功能)
function checkFeatureAccess(feature) {
    const memberLevel = UsageManager.getMemberLevel();

    // 付費功能列表
    const paidFeatures = ['exam', 'export', 'cloud-sync', 'ai-analysis'];

    // 如果功能在付費清單中且不是付費會員
    if (paidFeatures.includes(feature) && memberLevel !== 'paid') {

        // --- 特別處理：免費會員每月 5 次模擬考試 ---
        if (feature === 'exam' && memberLevel === 'free') {
            const examKey = `exam_monthly_${new Date().toISOString().slice(0, 7)}`;
            const examCount = parseInt(localStorage.getItem(examKey) || '0');

            if (examCount < 5) {
                // 還有額度，允許進入並增加計數
                localStorage.setItem(examKey, (examCount + 1).toString());
                iPASQuizApp.showAlert(`📊 模擬考試額度：本月已使用 ${examCount + 1}/5 次`, 'info');
                return true;
            } else {
                iPASQuizApp.showAlert('⏰ 本月模擬考試次數已達上限 (5次/月)！\n\n💎 升級付費會員即可無限次參與模擬考！', 'warning');
                return false;
            }
        }

        // 其他付費功能或額度用完，顯示功能鎖定模態框
        showFeatureLockedModal();
        return false;
    }
    return true;
}

// 🔥 付費升級功能 JavaScript END



