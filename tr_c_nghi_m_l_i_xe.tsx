import React, { useState, useEffect } from 'react';
import { 
  Timer, AlertCircle, ChevronLeft, ChevronRight, 
  CheckCircle2, XCircle, RefreshCw, Send, AlertTriangle, BookOpen, PenTool
} from 'lucide-react';

const questionBank = [
  { id: 1, text: "Phần của đường bộ được sử dụng cho phương tiện giao thông đường bộ đi lại là gì?", options: ["1. Phần mặt đường và lề đường.", "2. Phần đường xe chạy.", "3. Phần đường xe cơ giới."], answer: 1, isFatal: false },
  { id: 2, text: "Làn đường là gì?", options: ["1. Là một phần của phần đường xe chạy được chia theo chiều dọc của đường, sử dụng cho xe chạy.", "2. Là một phần của phần đường xe chạy được chia theo chiều dọc của đường, có đủ chiều rộng cho xe chạy an toàn.", "3. Là đường cho xe ô tô chạy, dừng, đỗ an toàn."], answer: 1, isFatal: false },
  { id: 3, text: "Khổ giới hạn của đường bộ được hiểu như thế nào là đúng?", options: ["1. Khổ giới hạn của đường bộ là khoảng trống có kích thước giới hạn về chiều rộng, chiều cao của đường bộ để các xe... đi qua được an toàn...", "2. Là khoảng trống có kích thước giới hạn về chiều rộng...", "3. Là khoảng trống có kích thước giới hạn về chiều cao..."], answer: 0, isFatal: false },
  { id: 4, text: "Dải phân cách được lắp đặt để làm gì?", options: ["1. Để phân chia các làn đường dành cho xe cơ giới và xe thô sơ trên đường cao tốc.", "2. Để phân chia phần đường xe chạy thành hai chiều riêng biệt hoặc để phân chia phần đường dành cho xe cơ giới và xe thô sơ...", "3. Để phân tách phần đường xe chạy và hành lang an toàn giao thông."], answer: 1, isFatal: false },
  { id: 14, text: "Hành vi nào dưới đây bị nghiêm cấm?", options: ["1. Sử dụng xe đạp đi trên các tuyến quốc lộ.", "2. Rải vật sắc nhọn, đổ chất gây trơn trượt trên đường bộ.", "3. Cả hai ý trên."], answer: 2, isFatal: true },
  { id: 15, text: "Hành vi đưa xe cơ giới, xe máy chuyên dùng tham gia giao thông đường bộ nào dưới đây bị cấm?", options: ["1. Không có chứng nhận kiểm định an toàn kỹ thuật và bảo vệ môi trường.", "2. Hết niên hạn sử dụng.", "3. Cả hai ý trên."], answer: 2, isFatal: true },
  { id: 16, text: "Tổ chức đua xe được phép thực hiện khi nào?", options: ["1. Trên đường phố không có người qua lại.", "2. Được người dân ủng hộ.", "3. Được cơ quan có thẩm quyền cấp phép."], answer: 2, isFatal: true },
  { id: 18, text: "Người điều khiển phương tiện tham gia giao thông đường bộ mà trong máu hoặc hơi thở có nồng độ cồn có bị nghiêm cấm không?", options: ["1. Bị nghiêm cấm.", "2. Không bị nghiêm cấm.", "3. Không bị nghiêm cấm, nếu nồng độ cồn trong máu ở mức nhẹ..."], answer: 0, isFatal: true },
  { id: 19, text: "Theo Luật Phòng chống tác hại của rượu, bia, đối tượng nào dưới đây bị cấm sử dụng rượu, bia khi tham gia giao thông?", options: ["1. Người điều khiển xe ô tô, xe mô tô, xe đạp, xe gắn máy.", "2. Người được chở trên xe cơ giới.", "3. Cả hai ý trên."], answer: 0, isFatal: true },
  { id: 20, text: "Hành vi giao xe ô tô, mô tô cho người nào sau đây tham gia giao thông đường bộ bị nghiêm cấm?", options: ["1. Người chưa đủ tuổi theo quy định.", "2. Người không có giấy phép lái xe.", "3. Người có giấy phép lái xe nhưng đã bị trừ hết 12 điểm.", "4. Cả ba ý trên."], answer: 3, isFatal: true }
];

const MOCK_TEST_DURATION = 19 * 60; // 19 minutes in seconds
const REQUIRED_PASS_SCORE = 21;
const TARGET_MOCK_QUESTIONS = 25;

export default function DrivingQuizApp() {
  const [appState, setAppState] = useState('welcome'); // 'welcome', 'playing', 'result'
  const [mode, setMode] = useState('mock'); // 'mock' or 'practice'
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // Timer Logic (Only for Mock mode)
  useEffect(() => {
    if (appState !== 'playing' || mode !== 'mock') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto submit when time is up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appState, mode]);

  const generateMockTest = () => {
    let shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    const fatals = shuffled.filter(q => q.isFatal);
    const nonFatals = shuffled.filter(q => !q.isFatal);
    
    let selected = [];
    if (fatals.length > 0) {
      selected.push(fatals.pop()); // Guarantee at least 1 fatal
    }
    
    const remainingPool = [...fatals, ...nonFatals].sort(() => 0.5 - Math.random());
    while(selected.length < TARGET_MOCK_QUESTIONS && remainingPool.length > 0) {
      selected.push(remainingPool.pop());
    }
    
    return selected.sort(() => 0.5 - Math.random());
  };

  const startQuiz = (selectedMode) => {
    setMode(selectedMode);
    
    if (selectedMode === 'mock') {
      setCurrentQuestions(generateMockTest());
      setTimeLeft(MOCK_TEST_DURATION);
    } else {
      // Practice mode: load all available questions in order
      setCurrentQuestions([...questionBank]);
      setTimeLeft(0);
    }

    setAppState('playing');
    setCurrentIndex(0);
    setAnswers({});
    setShowConfirm(false);
  };

  const selectAnswer = (optIndex) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optIndex
    }));
  };

  const handleFinalSubmit = () => {
    setShowConfirm(false);
    setAppState('result');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Evaluate Results
  const evaluateResult = () => {
    let correctCount = 0;
    let hasFatalError = false;

    currentQuestions.forEach((q, i) => {
      if (answers[i] === q.answer) {
        correctCount++;
      } else if (q.isFatal && answers[i] !== undefined) {
        // Only count as fatal error if they answered it wrong. 
        // Unanswered fatal questions also cause failure, which is standard.
        hasFatalError = true;
      } else if (q.isFatal && answers[i] === undefined) {
        hasFatalError = true; // Unanswered fatal = fail
      }
    });

    // In a scenario where we have fewer than 25 questions in DB (like the 10 provided), 
    // dynamically adjust pass score for demonstration purposes.
    const dynamicPassScore = currentQuestions.length < TARGET_MOCK_QUESTIONS 
      ? Math.ceil(currentQuestions.length * (REQUIRED_PASS_SCORE / TARGET_MOCK_QUESTIONS)) 
      : REQUIRED_PASS_SCORE;

    const isPass = correctCount >= dynamicPassScore && !hasFatalError;
    
    return { correctCount, hasFatalError, isPass, dynamicPassScore };
  };

  if (appState === 'welcome') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Hệ Thống Sát Hạch Lý Thuyết A1</h1>
            <p className="text-slate-500 text-lg max-w-md mx-auto">
              Chuẩn bị cho kỳ thi cấp giấy phép lái xe với bộ 250 câu hỏi tiêu chuẩn, bao gồm các câu điểm liệt.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {/* Mock Test Button */}
            <button 
              onClick={() => startQuiz('mock')}
              className="group flex flex-col items-center p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Thi Thử Sát Hạch</h2>
              <p className="text-sm text-slate-500 mb-4">Mô phỏng như thi thật</p>
              <div className="w-full space-y-2 text-sm text-left bg-white/60 p-4 rounded-xl">
                <p className="flex justify-between"><span>Thời gian:</span> <strong>19 Phút</strong></p>
                <p className="flex justify-between"><span>Số lượng:</span> <strong>25 Câu</strong></p>
                <p className="flex justify-between"><span>Yêu cầu:</span> <strong className="text-green-600">≥21/25</strong></p>
              </div>
            </button>

            {/* Practice Mode Button */}
            <button 
              onClick={() => startQuiz('practice')}
              className="group flex flex-col items-center p-8 bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Ôn Tập Trọn Bộ</h2>
              <p className="text-sm text-slate-500 mb-4">Luyện tập không giới hạn</p>
              <div className="w-full space-y-2 text-sm text-left bg-white/60 p-4 rounded-xl">
                <p className="flex justify-between"><span>Thời gian:</span> <strong>Không có</strong></p>
                <p className="flex justify-between"><span>Số lượng:</span> <strong>Toàn bộ</strong></p>
                <p className="flex justify-between"><span>Phản hồi:</span> <strong className="text-emerald-600">Ngay lập tức</strong></p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'playing') {
    const question = currentQuestions[currentIndex];
    const isLowTime = mode === 'mock' && timeLeft < 60;
    
    // For practice mode, show immediate feedback if answered
    const showImmediateFeedback = mode === 'practice' && answers[currentIndex] !== undefined;

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="font-bold text-lg hidden sm:block text-slate-700">
              {mode === 'mock' ? 'Thi Thử Sát Hạch A1' : 'Chế Độ Ôn Tập'}
            </h1>
            
            <div className="flex gap-4 items-center">
              {mode === 'mock' && (
                <div className={`flex items-center gap-2 font-bold text-lg px-4 py-1.5 rounded-lg ${isLowTime ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                  <Timer className="w-5 h-5" />
                  {formatTime(timeLeft)}
                </div>
              )}

              <button 
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-medium transition-colors"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{mode === 'mock' ? 'Nộp bài' : 'Kết thúc ôn tập'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full flex flex-col md:flex-row gap-8">
          
          {/* Main Question Area */}
          <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold">Câu hỏi {currentIndex + 1} / {currentQuestions.length}</h2>
              {question.isFatal && (
                <span className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  Câu điểm liệt
                </span>
              )}
            </div>

            <p className="text-lg md:text-xl font-medium mb-8 leading-relaxed">
              {question.text}
            </p>

            <div className="space-y-3 mb-8">
              {question.options.map((opt, idx) => {
                const isSelected = answers[currentIndex] === idx;
                const isCorrectAnswer = question.answer === idx;
                
                // Styling based on mode
                let buttonStyle = "border-slate-200 hover:border-blue-300 hover:bg-slate-50";
                let iconStyle = "border-slate-300";
                
                if (isSelected) {
                  buttonStyle = "border-blue-500 bg-blue-50 shadow-sm";
                  iconStyle = "border-blue-500";
                }

                // Apply immediate feedback colors in practice mode
                if (showImmediateFeedback) {
                  if (isCorrectAnswer) {
                    buttonStyle = "border-green-500 bg-green-50 shadow-sm";
                    iconStyle = "border-green-500 bg-green-500";
                  } else if (isSelected && !isCorrectAnswer) {
                    buttonStyle = "border-red-400 bg-red-50";
                    iconStyle = "border-red-400";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${buttonStyle}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${iconStyle}`}>
                        {(!showImmediateFeedback || !isCorrectAnswer) && isSelected && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                        {showImmediateFeedback && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-white bg-green-500 rounded-full" />}
                        {showImmediateFeedback && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                      </div>
                      <span className="text-base">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
                Câu trước
              </button>
              
              <button
                onClick={() => setCurrentIndex(prev => Math.min(currentQuestions.length - 1, prev + 1))}
                disabled={currentIndex === currentQuestions.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Câu tiếp
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="w-full md:w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="font-semibold text-slate-700 mb-4">Danh sách câu hỏi</h3>
              <div className="grid grid-cols-5 gap-2">
                {currentQuestions.map((q, idx) => {
                  const isAnswered = answers[idx] !== undefined;
                  const isCurrent = currentIndex === idx;
                  
                  let gridItemStyle = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
                  
                  if (isAnswered) {
                    gridItemStyle = "bg-blue-500 text-white border-blue-500";
                    
                    // Specific coloring for practice mode grid
                    if (mode === 'practice') {
                      if (answers[idx] === q.answer) {
                        gridItemStyle = "bg-green-500 text-white border-green-500";
                      } else {
                        gridItemStyle = "bg-red-500 text-white border-red-500";
                      }
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`
                        h-10 rounded-lg text-sm font-medium transition-colors border
                        ${isCurrent ? 'ring-2 ring-slate-900 ring-offset-2' : ''}
                        ${gridItemStyle}
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                  <span>Đã trả lời ({Object.keys(answers).length}/{currentQuestions.length})</span>
                </div>
                {mode === 'practice' && (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                      <span>Trả lời đúng</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
                      <span>Trả lời sai</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-slate-200 rounded-sm"></div>
                  <span>Chưa trả lời</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Submit Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xác nhận {mode === 'mock' ? 'nộp bài' : 'kết thúc'}?</h3>
              <p className="text-slate-600 mb-6">
                Bạn đã trả lời {Object.keys(answers).length}/{currentQuestions.length} câu hỏi. 
                Bạn có chắc chắn muốn kết thúc ngay bây giờ?
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleFinalSubmit}
                  className="px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  Đồng ý nộp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (appState === 'result') {
    const { correctCount, hasFatalError, isPass, dynamicPassScore } = evaluateResult();

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Result Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 text-center">
            {isPass ? (
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
            
            <h1 className={`text-4xl font-bold mb-2 ${isPass ? 'text-green-600' : 'text-red-600'}`}>
              {isPass ? 'ĐẠT YÊU CẦU' : 'KHÔNG ĐẠT'}
            </h1>
            <p className="text-slate-500 mb-6 text-lg">
              {mode === 'mock' ? 'Kết quả bài thi thử sát hạch' : 'Kết quả phiên ôn tập'}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-slate-600 text-lg mb-8">
              <span className="bg-slate-100 px-5 py-3 rounded-xl">
                Số câu đúng: <strong className="text-slate-900 text-xl">{correctCount}/{currentQuestions.length}</strong>
              </span>
              {mode === 'mock' && (
                <span className="bg-slate-100 px-5 py-3 rounded-xl">
                  Yêu cầu đạt: <strong className="text-slate-900 text-xl">≥ {dynamicPassScore}</strong>
                </span>
              )}
              {hasFatalError && (
                <span className="bg-red-50 text-red-700 px-5 py-3 rounded-xl flex items-center gap-2 font-medium">
                  <AlertCircle className="w-6 h-6" />
                  Sai câu điểm liệt
                </span>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setAppState('welcome')}
                className="inline-flex items-center gap-2 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl font-medium transition-all"
              >
                Về trang chủ
              </button>
              <button 
                onClick={() => startQuiz(mode)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-200"
              >
                <RefreshCw className="w-5 h-5" />
                Làm lại
              </button>
            </div>
          </div>

          {/* Review Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 px-2">Chi tiết bài làm</h2>
            
            {currentQuestions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.answer;
              const isUnanswered = userAnswer === undefined;

              return (
                <div key={idx} className={`bg-white rounded-2xl p-6 shadow-sm border-2 ${q.isFatal && !isCorrect && !isUnanswered ? 'border-red-300' : 'border-slate-200'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    `}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-800 leading-snug">
                        {q.text}
                      </p>
                      {q.isFatal && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-medium mt-2">
                          <AlertCircle className="w-3 h-3" /> Câu điểm liệt
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pl-12 space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswer === oIdx;
                      const isRightOption = q.answer === oIdx;
                      
                      let optionClass = "text-slate-600";
                      let bgClass = "bg-slate-50 border-slate-200";

                      if (isRightOption) {
                        bgClass = "bg-green-50 border-green-300 shadow-sm";
                        optionClass = "text-green-800 font-medium";
                      } else if (isSelected && !isRightOption) {
                        bgClass = "bg-red-50 border-red-200";
                        optionClass = "text-red-700 opacity-80";
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border ${bgClass} flex items-start gap-3`}>
                           <div className="mt-0.5 shrink-0">
                             {isRightOption && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                             {isSelected && !isRightOption && <XCircle className="w-5 h-5 text-red-500" />}
                             {!isRightOption && !isSelected && <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />}
                           </div>
                           <span className={optionClass}>{opt}</span>
                        </div>
                      );
                    })}
                    {isUnanswered && (
                      <p className="text-sm text-amber-600 font-medium mt-3 flex items-center gap-1.5">
                         <AlertTriangle className="w-4 h-4"/> Bạn chưa trả lời câu hỏi này
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    );
  }

  return null;
}