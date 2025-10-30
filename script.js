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


