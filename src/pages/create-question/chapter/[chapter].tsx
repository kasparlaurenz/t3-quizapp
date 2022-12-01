import Image from "next/image";
import React, { useRef, useState } from "react";

import Header from "../../../components/Header";
import NewQuestionInput from "../../../components/NewQuestionInput";
import { supabase } from "../../../utils/supabase";
import { trpc } from "../../../utils/trpc";

import type { NextPage } from "next";
import { useRouter } from "next/router";
import type { FC } from "react";
import TopSection from "../../../components/TopSection";
import type { InitialQuestionType } from "../../../utils/types";
import ConfirmModal from "../../../components/ConfirmationModal";

const initialQuestionState: InitialQuestionType = {
  question: "",
  correct_answer: { answer: "", is_correct: true },
  wrong_answer1: { answer: "", is_correct: false },
  wrong_answer2: { answer: "", is_correct: false },
  chapter: null,
  description: "",
};

const CreateQuestion: NextPage = () => {
  const [newQuestion, setNewQuestion] =
    useState<InitialQuestionType>(initialQuestionState);

  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [image, setImage] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { query, isReady } = useRouter();

  const chapter = query.chapter as string;
  const { data: chapterDescription } = trpc.chapter.getChapterDesc.useQuery(
    { chapter: parseInt(chapter) },
    { enabled: isReady }
  );

  const createNewQuestion = trpc.question.createQuestion.useMutation();

  const handleModal = () => {
    setShowConfirm((prev) => !prev);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    setImage(file || undefined);
    setPreviewUrl(URL.createObjectURL(file as Blob));
  };

  const uploadImage = async () => {
    if (image) {
      const imageName = `${Date.now()}_${image.name}`;
      const { data, error } = await supabase.storage
        .from("question-images")
        .upload(imageName, image);

      if (error) {
        console.log(error);
      }

      if (data) {
        const res = supabase.storage
          .from("question-images")
          .getPublicUrl(imageName);
        const publicUrl = res.data.publicUrl;
        return {
          publicUrl: publicUrl,
          imageName: imageName,
        };
      }
    }
  };

  const resetForm = () => {
    setShowConfirm(true);
    setNewQuestion(initialQuestionState);
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = "";
    }
    setPreviewUrl("");
    setImage(undefined);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const imageData = await uploadImage();
    const publicUrl = imageData?.publicUrl;
    const imageName = imageData?.imageName;
    createNewQuestion.mutate({
      question: newQuestion.question,
      imageUrl: publicUrl ?? "",
      imageName: imageName ?? "",
      incorrect_one: newQuestion.wrong_answer1.answer,
      incorrect_two: newQuestion.wrong_answer2.answer,
      correct: newQuestion.correct_answer.answer,
      chapter: parseInt(chapter),
      description: chapterDescription?.description ?? "",
    });
    resetForm();
  };

  return (
    <>
      <Header>Create Question</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <TopSection title={`Question for Chapter ${chapter}`} />
        {showConfirm && (
          <>
            <ConfirmModal status="created" handleModal={handleModal} />
            <div className="absolute z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
          </>
        )}
        <div className="flex w-full flex-col items-center">
          <form
            className="mt-6 w-full md:max-w-[650px]"
            action="submit"
            onSubmit={handleSubmit}
          >
            <NewQuestionInput
              setNewQuestion={setNewQuestion}
              htmlFor="question"
              value={newQuestion.question}
              isRequired={true}
              placeholder="Frage.."
            >
              Frage
            </NewQuestionInput>
            <NewQuestionInput
              setNewQuestion={setNewQuestion}
              htmlFor="wrong_answer1"
              value={newQuestion.wrong_answer1.answer}
              isRequired={true}
              placeholder="Falsche Antwort.."
            >
              Erste falsche Antwort
            </NewQuestionInput>
            <NewQuestionInput
              setNewQuestion={setNewQuestion}
              htmlFor="wrong_answer2"
              value={newQuestion.wrong_answer2.answer}
              isRequired={true}
              placeholder="Falsche Antwort.."
            >
              Zweite falsche Antwort
            </NewQuestionInput>
            <NewQuestionInput
              setNewQuestion={setNewQuestion}
              htmlFor="correct_answer"
              value={newQuestion.correct_answer.answer}
              isRequired={true}
              placeholder="Richtige Antwort.."
            >
              Richtige Antwort
            </NewQuestionInput>
            <div className="flex flex-col">
              <label htmlFor="image">
                Bild <span className="italic">(optional)</span>
              </label>
              {image && (
                // <img alt="preview" className="my-2 w-[80px]" src={previewUrl} />
                <div className="relative my-2 h-[70px] w-[90px]">
                  <Image layout="fill" src={previewUrl} alt="previe-image" />
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current !== null) {
                        fileInputRef.current.value = "";
                      }
                      setPreviewUrl("");
                      setImage(undefined);
                    }}
                    className="rounded-m absolute top-0 right-0 bg-red-400 py-1 px-2  transition hover:bg-red-500"
                  >
                    X
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                name="image"
                type="file"
                accept="image/*"
                onChange={onFileChange}
              />
            </div>
            <button type="submit" className="menu-button">
              Frage erstellen
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateQuestion;
