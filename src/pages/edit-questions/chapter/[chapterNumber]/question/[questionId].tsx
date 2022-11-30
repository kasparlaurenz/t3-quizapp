import type { NextPage } from "next";
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import ConfirmModal from "../../../../../components/ConfirmationModal";
import Header from "../../../../../components/Header";
import NewQuestionInput from "../../../../../components/NewQuestionInput";
import TopSection from "../../../../../components/TopSection";
import { supabase } from "../../../../../utils/supabase";
import { trpc } from "../../../../../utils/trpc";
import type { InitialQuestionType } from "../../../../../utils/types";

const initialQuestionState: InitialQuestionType = {
  question: "",
  correct_answer: { answer: "", is_correct: true },
  wrong_answer1: { answer: "", is_correct: false },
  wrong_answer2: { answer: "", is_correct: false },
};

const ManageQuestion: NextPage = ({}) => {
  const { query, isReady } = useRouter();
  const questionId = query.questionId as string;

  const [newQuestion, setNewQuestion] =
    useState<InitialQuestionType>(initialQuestionState);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [image, setImage] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: question,
    isLoading,
    isError,
  } = trpc.question.getQuestionById.useQuery(
    { id: questionId },
    { enabled: isReady }
  );

  const utils = trpc.useContext();
  const updateQuestion = trpc.question.updateQuestion.useMutation({
    onMutate: () => {
      utils.question.getQuestionById.cancel();
      const optimisticUpdate = utils.question.getQuestionById.getData({
        id: questionId,
      });

      if (optimisticUpdate) {
        utils.question.getQuestionById.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.question.getQuestionById.invalidate();
    },
    onSuccess: () => {
      setShowConfirm(true);
      resetForm();
    },
  });

  const deleteImage = trpc.question.deleteImageOfQuestion.useMutation({
    onMutate: () => {
      utils.question.getQuestions.cancel();
      const optimisticUpdate = utils.question.getQuestionById.getData({
        id: questionId,
      });

      if (optimisticUpdate) {
        utils.question.getQuestionById.setData(optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.question.getQuestionById.invalidate();
    },
  });

  const handleModal = () => {
    setShowConfirm((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const imageData = await uploadImage();
    const publicUrl = imageData?.publicUrl;
    const imageName = imageData?.imageName;
    updateQuestion.mutate({
      id: questionId,
      question: newQuestion.question || question!.question,
      imageUrl: question?.imageUrl || publicUrl,
      imageName: question?.imageName || imageName,
      incorrect_one:
        newQuestion.wrong_answer1.answer || question!.answers[0]!.answer,
      incorrect_two:
        newQuestion.wrong_answer2.answer || question!.answers[1]!.answer,
      correct:
        newQuestion.correct_answer.answer || question!.answers[2]!.answer,
    });
  };

  const resetForm = () => {
    setNewQuestion(initialQuestionState);
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = "";
    }
    setPreviewUrl("");
    setImage(undefined);
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

  const handleDeleteClick = async () => {
    if (question?.imageName) {
      deleteImage.mutate({
        id: questionId,
      });
      await supabase.storage
        .from("question-images")
        .remove([`${question.imageName}`]);
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div>Loading</div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div>Error</div>
      </main>
    );
  }
  return (
    <>
      <Header>Create Question</Header>
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <TopSection title={`Manage Question`} />
        {showConfirm && (
          <>
            <ConfirmModal status="updated" handleModal={handleModal} />
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
              isRequired={false}
              placeholder={question!.question}
            >
              Current Question:{" "}
            </NewQuestionInput>
            <NewQuestionInput
              setNewQuestion={setNewQuestion}
              htmlFor="wrong_answer1"
              value={newQuestion.wrong_answer1.answer}
              isRequired={false}
              placeholder={question!.answers[0]!.answer}
            >
              Current first wrong:{" "}
            </NewQuestionInput>
            <NewQuestionInput
              setNewQuestion={setNewQuestion}
              htmlFor="wrong_answer2"
              value={newQuestion.wrong_answer2.answer}
              isRequired={false}
              placeholder={question!.answers[1]!.answer}
            >
              Current second wrong:{" "}
            </NewQuestionInput>
            <NewQuestionInput
              setNewQuestion={setNewQuestion}
              htmlFor="correct_answer"
              value={newQuestion.correct_answer.answer}
              isRequired={false}
              placeholder={question!.answers[2]!.answer}
            >
              Current right one:{" "}
            </NewQuestionInput>
            <div className="flex flex-col">
              {question?.imageUrl ? (
                // <img alt="preview" className="my-2 w-[80px]" src={previewUrl} />
                <div className="relative my-2 h-[70px] w-[90px]">
                  <Image
                    layout="fill"
                    src={question.imageUrl}
                    alt="previe-image"
                    sizes="max-width: 90px"
                  />
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="rounded-m absolute top-0 right-0 bg-red-400 py-1 px-2  transition hover:bg-red-500"
                  >
                    X
                  </button>
                </div>
              ) : (
                <>
                  <label htmlFor="image">
                    Upload Image <span className="italic">(optional)</span>
                  </label>
                  {image && (
                    // <img alt="preview" className="my-2 w-[80px]" src={previewUrl} />
                    <div className="relative my-2 h-[70px] w-[90px]">
                      <Image
                        layout="fill"
                        src={previewUrl}
                        alt="previe-image"
                      />
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
                </>
              )}
            </div>
            <button type="submit" className="menu-button">
              Update Question
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default ManageQuestion;
