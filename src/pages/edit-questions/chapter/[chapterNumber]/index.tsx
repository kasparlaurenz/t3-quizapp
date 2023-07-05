import type { Question } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import DeleteButton from "../../../../components/Buttons/DeleteButton";
import Header from "../../../../components/Header";
import HiddenIcon from "../../../../components/Icons/HiddenIcon";
import VisibleIcon from "../../../../components/Icons/VisibleIcon";
import TopSection from "../../../../components/TopSection";
import { getStyle } from "../../../../utils/lockDragAxis";
import { supabase } from "../../../../utils/supabase";
import { trpc } from "../../../../utils/trpc";
import { useState } from "react";

const ManageQuestions: NextPage = () => {
  const { query, isReady } = useRouter();
  const chapterNumber = query.chapterNumber as string;
  const [questions, setQuestions] = useState<Question[]>([]);

  const {
    data,
    isLoading,
    isError,
    refetch: refetchQuestions,
  } = trpc.question.getAllQuestionsByChapter.useQuery(
    { chapter: parseInt(chapterNumber) },
    { enabled: isReady, onSuccess: (data) => setQuestions(data) }
  );
  const deleteQuestion = trpc.question.deleteQuestion.useMutation({
    onSuccess: () => {
      refetchQuestions();
    },
  });

  const { data: chapterDescription } = trpc.chapter.getChapterDesc.useQuery(
    { chapter: parseInt(chapterNumber) },
    { enabled: isReady }
  );

  const { data: categories, refetch: refetchCategories } =
    trpc.category.getAllCategories.useQuery();

  const { data: categoriesByChapter, refetch: refetchCategoriesByChapter } =
    trpc.category.getCategoriesOfChapter.useQuery(
      { chapterId: chapterDescription?.id ?? "" },
      { enabled: isReady }
    );

  const addChapterToCategory = trpc.chapter.addChapterToCategory.useMutation({
    onSuccess: () => {
      refetchCategories();
      refetchCategoriesByChapter();
    },
  });

  const removeChapterFromCategory =
    trpc.category.removeCategoryFromChapter.useMutation({
      onSuccess: () => {
        refetchCategories();
        refetchCategoriesByChapter();
      },
    });

  const hideQuestion = trpc.question.updateQuestionVisibility.useMutation({
    onSuccess: () => {
      refetchQuestions();
    },
  });

  const updateQuestionPosition =
    trpc.question.updateQuestionPosition.useMutation({});

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

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    question: Question
  ) => {
    e.preventDefault();
    deleteQuestion.mutate({
      id: question.id,
    });
    await supabase.storage
      .from("question-images")
      .remove([`${question.imageName}`]);
  };

  const handleVisibilityClick = (question: Question) => {
    hideQuestion.mutate({
      id: question.id,
      isHidden: !question.isHidden,
    });
  };

  const checkIfCategoryIsInChapter = (category: string): boolean => {
    const categoryInChapter = categoriesByChapter?.find(
        (categoryInChapter) => categoryInChapter.name === category
      ),
      categoryInChapterId = categoryInChapter?.id;
    return categoryInChapterId ? true : false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const category = e.target.id;

    if (e.target.checked) {
      addChapterToCategory.mutate({
        chapterId: chapterDescription?.id ?? "",
        categoryId: category,
      });
    } else {
      removeChapterFromCategory.mutate({
        chapterId: chapterDescription?.id ?? "",
        categoryId: category,
      });
    }
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const draggedQuestionId = draggableId;

    updateQuestionPosition.mutate({
      id: draggedQuestionId,
      chapter: parseInt(chapterNumber),
      position: destination.index + 1,
    });

    const newQuestions = Array.from(questions);
    const question = newQuestions.find(
      (question) => question.id === draggableId
    );
    if (question) {
      newQuestions.splice(source.index, 1);
      newQuestions.splice(destination.index, 0, question);
    }

    setQuestions(newQuestions);
  };

  return (
    <>
      <Header>Fragen</Header>
      <TopSection title={chapterDescription?.description ?? ""} />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 pt-20">
        <div className="relative mt-4 flex w-full flex-col items-center justify-start gap-5 p-2">
          {categories && categories.length > 0 && (
            <>
              <h3 className="text-xl">Kategorien</h3>
              <div className="max-w-96 grid grid-cols-3 gap-x-4">
                {categories?.map((category) => (
                  <div key={category.id} className="flex items-center gap-1">
                    <input
                      className="mr-2 h-[18px] w-[18px] accent-sky-500"
                      type="checkbox"
                      id={category.id}
                      checked={checkIfCategoryIsInChapter(category.name)}
                      onChange={handleInputChange}
                    />
                    <label
                      className="text-lg text-white"
                      htmlFor={category.name}
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
          <Link
            className="menu-button mt-2"
            href={`/create-question/chapter/${chapterNumber}`}
          >
            Neue Frage
          </Link>
          {questions.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex w-1/2 flex-col items-center gap-5"
                  >
                    {questions?.map((question, index) => (
                      <Draggable
                        draggableId={question.id}
                        index={index}
                        key={question.id}
                      >
                        {(provided) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className="flex w-full justify-center"
                            style={getStyle({
                              ...provided.draggableProps.style,
                            })}
                          >
                            <button
                              onClick={() => {
                                handleVisibilityClick(question);
                              }}
                              className="p-4"
                            >
                              {question.isHidden ? (
                                <HiddenIcon />
                              ) : (
                                <VisibleIcon />
                              )}
                            </button>
                            <Link
                              href={`/edit-questions/chapter/${chapterNumber}/question/${question.id}`}
                              key={question.id}
                              className={`${
                                question.isHidden
                                  ? "bg-zinc-700 text-zinc-500"
                                  : "bg-slate-500"
                              } relative flex h-auto w-full items-center justify-start rounded-md p-4 transition hover:bg-slate-700 md:max-w-[400px]`}
                            >
                              <h2>
                                <span className="font-bold">{index + 1}.</span>{" "}
                                {question.question}
                              </h2>
                              <DeleteButton
                                handleClick={handleClick}
                                itemToDelete={question}
                                deleteItem={deleteQuestion}
                              />
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="flex flex-col items-center">
              <p className="mt-5 text-3xl font-bold text-red-500">
                Keine Fragen
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ManageQuestions;
