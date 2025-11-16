/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy } from "lucide-react";

import { type Question } from "@/lib/data";

interface QuizData {
  roadmap_item_id: number;
  questions: Question[];
}

interface CompletionData {
  success: boolean;
  is_new_unlock: boolean;
  roadmap_item_id: number;
  item_title?: string;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/api/quiz/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Quiz not found');
        }
        return res.json();
      })
      .then(data => {
        setQuizData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Save progress when quiz is completed
  useEffect(() => {
    if (isComplete && quizData) {
      const questions = quizData?.questions || [];
      const isPerfectScore = score === questions.length;

      if (isPerfectScore) {
        // Save completion to backend
        fetch('http://localhost:8000/api/progress/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roadmap_item_id: parseInt(id),
            score: score,
            total_questions: questions.length,
            user_id: 'default_user'
          })
        })
          .then(res => res.json())
          .then(data => {
            console.log('Progress saved:', data);
            setCompletionData(data);

            if (data.is_new_unlock) {
              // Store new unlock in localStorage for session highlights
              const existingNewUnlocks = JSON.parse(localStorage.getItem('new_unlocks') || '[]');
              if (!existingNewUnlocks.includes(`title_${parseInt(id)}`)) {
                existingNewUnlocks.push(`title_${parseInt(id)}`);
                localStorage.setItem('new_unlocks', JSON.stringify(existingNewUnlocks));
              }

              // Fetch item title for modal
              fetch('http://localhost:8000/api/roadmaps/')
                .then(res => res.json())
                .then((roadmaps: any[]) => {
                  const item = roadmaps.flatMap((r: any) => r.items).find((item: any) => item.id === parseInt(id));
                  if (item) {
                    setCompletionData(prev => ({ ...prev!, item_title: item.title }));
                  }
                  setShowUnlockModal(true);
                })
                .catch(err => {
                  console.error('Error fetching item title:', err);
                  setShowUnlockModal(true); // Show anyway without title
                });
            }
          })
          .catch(err => {
            console.error('Error saving progress:', err);
          });
      }
    }
  }, [isComplete, score, id, quizData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p>Loading quiz...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error || 'The quiz for this topic is not available.'}</p>
            <Link href="/roadmap">
              <Button>Back to Study</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = quizData?.questions || [];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setIsComplete(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsComplete(false);
  };

  const getButtonClass = (index: number): string => {
    if (selectedAnswer === null) return "hover:bg-gray-100";
    if (index === questions[currentQuestion].correct) return "bg-green-100 border-green-500";
    if (selectedAnswer === index) return "bg-red-100 border-red-500";
    return "opacity-50";
  };

  if (isComplete) {
    // Show unlock modal if new unlock
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-4">
                Your Score: {score}/{questions.length}
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/roadmap" className="w-full">
                  <Button variant="outline" className="w-full">
                    Back to Study
                  </Button>
                </Link>
                <Button onClick={restartQuiz} className="w-full">
                  Take Quiz Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unlock Modal */}
        <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
          <DialogContent className="sm:max-w-md animate-bounce-in border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50">
            <DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Trophy className="w-16 h-16 text-yellow-500 animate-pulse-glow" />
                  <div className="absolute inset-0 animate-particle-burst">
                    {/* Particle elements */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-particle"
                        style={{
                          top: '50%',
                          left: '50%',
                          animationDelay: `${i * 0.2}s`,
                          transformOrigin: `${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}% ${50 + 40 * Math.sin((i * 60) * Math.PI / 180)}%`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <DialogTitle className="text-2xl font-bold text-center">
                  🎉 Node Unlocked!
                </DialogTitle>
                <p className="text-lg text-center text-gray-700">
                  {completionData?.item_title || 'New topic'}
                </p>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowUnlockModal(false);
                  router.push('/roadmap');
                }}
                className="w-full"
              >
                Back to Roadmap
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUnlockModal(false);
                  router.push(`/knowledge-graph?highlight=title_${id}`);
                }}
                className="w-full"
              >
                View in Knowledge Graph
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">This quiz doesn&apos;t have questions yet.</p>
            <Link href="/roadmap">
              <Button>Back to Study</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Quiz | Question {currentQuestion + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6 text-lg">
            {questions[currentQuestion].question}
          </p>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => selectedAnswer === null && handleAnswerSelect(index)}
                className={`w-full p-4 text-left border rounded-lg transition-all duration-300 ${getButtonClass(index)}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer !== null && index === questions[currentQuestion].correct && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {selectedAnswer === index && index !== questions[currentQuestion].correct && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 min-h-12 flex justify-center">
        {selectedAnswer !== null && (
          <Button onClick={handleNextQuestion}>
            {currentQuestion < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          </Button>
        )}
      </div>
    </div>
  );
}
