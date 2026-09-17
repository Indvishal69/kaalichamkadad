import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Award, Check, RotateCcw, X } from 'lucide-react';
import { quizQuestions } from '../data/channel';
import { useAdvancements } from '../lib/advancements';
import { fireConfetti } from '../lib/confetti';
import { play } from '../lib/sound';

const BEST_KEY = 'kaali-chamkadad:quiz-best';

export function rankFor(ratio: number): { title: string; blurb: string } {
  if (ratio === 1) return { title: 'CERTIFIED GENIUS', blurb: 'Perfect score. You have been watching too closely. Kaali would be proud.' };
  if (ratio >= 0.7) return { title: 'BAT GANG VETERAN', blurb: 'Very strong. You clearly spend a lot of time in this cave.' };
  if (ratio >= 0.4) return { title: 'CASUAL CAVE DWELLER', blurb: 'Respectable. A few more videos and you are there.' };
  return { title: 'FRESH SPAWN', blurb: 'Everyone starts somewhere. Go watch a video and come back for revenge.' };
}

export function Quiz() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const { unlock } = useAdvancements();

  const question = quizQuestions[step];
  const progress = ((step + (picked === null ? 0 : 1)) / quizQuestions.length) * 100;
  const ratio = score / quizQuestions.length;
  const rank = useMemo(() => rankFor(ratio), [ratio]);

  function choose(index: number) {
    if (picked !== null) return;
    setPicked(index);
    const correct = index === question.answer;
    if (correct) setScore((value) => value + 1);
    play(correct ? 'pop' : 'error');
  }

  function next() {
    const isLast = step === quizQuestions.length - 1;
    if (isLast) {
      const finalScore = score;
      try {
        const previous = Number(window.localStorage.getItem(BEST_KEY)) || 0;
        window.localStorage.setItem(BEST_KEY, String(Math.max(previous, finalScore)));
      } catch {
        /* fine */
      }
      window.dispatchEvent(new CustomEvent('cave:update'));
      if (finalScore === quizQuestions.length) {
        unlock('scholar');
        fireConfetti({ count: 200 });
        play('levelup');
      } else {
        play('ding');
      }
      setFinished(true);
      return;
    }
    setStep((value) => value + 1);
    setPicked(null);
  }

  function restart() {
    setStep(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  }

  return (
    <section className="quiz-section section-space" id="quiz" aria-labelledby="quiz-title">
      <div className="container quiz-layout">
        <div className="quiz-intro">
          <p className="eyebrow section-eyebrow">SEVEN QUESTIONS. NO MERCY.</p>
          <h2 className="section-title" id="quiz-title">HOW WELL DO YOU<br />KNOW THE CAVE<span className="accent-text">?</span></h2>
          <p className="section-description">
            Every answer comes from the channel itself. No trick questions, only terrible plans.
          </p>
          <div className="quiz-scorecard">
            <Award size={20} />
            <span>SCORE</span>
            <strong>{score}<em>/{quizQuestions.length}</em></strong>
          </div>
        </div>

        <div className="quiz-card">
          <AnimatePresence mode="wait">
            {finished ? (
              <motion.div
                key="result"
                className="quiz-result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <span className="quiz-result-score">{score}<em>/{quizQuestions.length}</em></span>
                <h3 className="quiz-result-rank">{rank.title}</h3>
                <p>{rank.blurb}</p>
                <div className="quiz-result-actions">
                  <button className="button button-lime" onClick={restart}>
                    <RotateCcw size={16} /> Try again
                  </button>
                  <a className="text-link" href="#card">Put it on my ID card <ArrowRight size={15} /></a>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28 }}
              >
                <div className="quiz-progress">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <p className="quiz-counter">QUESTION {step + 1} OF {quizQuestions.length}</p>
                <h3 className="quiz-question">{question.question}</h3>
                <div className="quiz-options">
                  {question.options.map((option, index) => {
                    const isAnswer = index === question.answer;
                    const isPicked = picked === index;
                    const revealed = picked !== null;
                    const state = revealed && isAnswer ? 'is-correct' : revealed && isPicked ? 'is-wrong' : '';
                    return (
                      <button
                        key={option}
                        className={`quiz-option ${state}`}
                        onClick={() => choose(index)}
                        disabled={revealed}
                      >
                        <span className="quiz-option-mark">
                          {revealed && isAnswer ? <Check size={14} /> : revealed && isPicked ? <X size={14} /> : null}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {picked !== null && (
                    <motion.div
                      className="quiz-note"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p>{picked === question.answer ? 'Correct. ' : 'Not quite. '}{question.note}</p>
                      <button className="text-link quiz-next" onClick={next}>
                        {step === quizQuestions.length - 1 ? 'See my result' : 'Next question'} <ArrowRight size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
