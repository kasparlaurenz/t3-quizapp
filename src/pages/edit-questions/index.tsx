import type { Category, Chapter } from "@prisma/client";
import type { NextPage } from "next";
import Link from "next/link";
import type { FC, SetStateAction } from "react";
import { useState } from "react";
import DeleteButton from "../../components/Buttons/DeleteButton";
import Header from "../../components/Header";
import HiddenIcon from "../../components/Icons/HiddenIcon";
import PlusIcon from "../../components/Icons/PlusIcon";
import VisibleIcon from "../../components/Icons/VisibleIcon";
import TopSection from "../../components/TopSection";
import { trpc } from "../../utils/trpc";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import ChapterComponent from "../../components/Chapter";

const ManageChapters: NextPage = () => {
  const [showChapterDetails, setShowChapterDetails] = useState<boolean>(false);
  const [hidden, setHidden] = useState<boolean>(true);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const {
    data: chapters,
    isLoading,
    isError,
    refetch: refetchChapters,
  } = trpc.chapter.getAllChapters.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setFilteredChapters(data);
    },
  });

  const { data: categories, refetch: refetchCategories } =
    trpc.category.getAllCategories.useQuery();

  const deleteChapter = trpc.chapter.deleteChapter.useMutation({
    onSuccess: () => {
      refetchChapters();
    },
  });

  const createNewChapter = trpc.chapter.createChapter.useMutation({
    onSuccess: () => {
      refetchChapters();
    },
    onError: ({ message }) => {
      console.log("ERROR FE", message);
    },
  });

  const createNewCategory = trpc.category.createNewCategory.useMutation({
    onSuccess: () => {
      refetchCategories();
      setNewCategory("");
    },
  });

  const deleteCategory = trpc.category.deleteCategory.useMutation({
    onSuccess: () => {
      refetchCategories();
    },
  });

  const hideCategory = trpc.category.updateCategoryVisibility.useMutation({
    onSuccess: () => {
      refetchCategories();
    },
  });

  const hideChapter = trpc.chapter.updateChapterVisibility.useMutation({
    onSuccess: () => {
      refetchChapters();
    },
  });

  const updateChapterPosition =
    trpc.chapter.updateChapterPosition.useMutation();

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

  const handleDeleteClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    chapter: Chapter
  ) => {
    e.preventDefault();
    deleteChapter.mutate({
      id: chapter.id,
    });
  };

  const handleDeleteCategoryClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault();
    deleteCategory.mutate({
      id: id,
    });
  };

  const handleCreateChapterClick = (desc: string) => {
    createNewChapter.mutate({
      description: desc,
    });
    setShowChapterDetails(false);
  };

  const handleCreateCategoryClick = () => {
    createNewCategory.mutate({
      name: newCategory,
    });
  };

  const handleVisibilityClick = (chapter: Chapter) => {
    hideChapter.mutate({
      id: chapter.id,
      isHidden: !chapter.isHidden,
    });
  };

  const handleCategoryVisibilityClick = (category: Category) => {
    hideCategory.mutate({
      id: category.id,
      isHidden: !category.isHidden,
    });
  };

  const dragEnd = (result: any) => {
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
    const draggedChapterId = draggableId;

    updateChapterPosition.mutate({
      id: draggedChapterId,
      position: destination.index + 1,
    });

    const newChapters = Array.from(filteredChapters);
    const [removed] = newChapters.splice(source.index, 1);
    if (!removed) return;
    newChapters.splice(destination.index, 0, removed);
    setFilteredChapters(newChapters);
  };

  return (
    <>
      <Header>Kapitel</Header>
      <TopSection title="Kapitel" />
      <main className="container mx-auto flex min-h-screen flex-col items-center justify-start p-4 pt-20">
        {showChapterDetails && (
          <>
            <ChapterModal
              setShowChapterDetails={setShowChapterDetails}
              handleClick={handleCreateChapterClick}
            />
            <div className="absolute top-0 z-10 h-screen w-screen bg-slate-900 opacity-95"></div>
          </>
        )}
        <div className=" relative mt-4 flex  w-full flex-col items-center justify-start gap-5 p-2">
          <button
            onClick={() => setHidden(!hidden)}
            className={`${hidden ? "" : "bg-slate-500"} menu-button mt-0`}
          >
            Kategorien
          </button>
          <div
            className={`${
              hidden ? "hidden" : "block"
            } flex w-[300px] flex-col items-center justify-center gap-4 rounded-md px-6`}
          >
            {categories?.map((category) => (
              <div
                key={category.id}
                className={`
                ${
                  category.isHidden
                    ? "bg-zinc-700 text-zinc-500"
                    : "bg-slate-500"
                } relative flex h-auto w-full select-none items-center justify-start gap-2 rounded-md p-2 transition

                `}
              >
                <DeleteButton
                  handleClick={handleDeleteCategoryClick}
                  itemToDelete={category.id}
                  deleteItem={deleteCategory}
                />
                <button onClick={() => handleCategoryVisibilityClick(category)}>
                  {category.isHidden ? <HiddenIcon /> : <VisibleIcon />}
                </button>
                <p className="w-[70%] break-words">{category.name}</p>
              </div>
            ))}
            <div className="relative flex w-full flex-1">
              <form
                className="relative flex w-full items-center justify-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCategory.length > 0) {
                    handleCreateCategoryClick();
                  }
                }}
              >
                <input
                  className="w-full cursor-pointer rounded-md bg-slate-700 p-2"
                  type="text"
                  id="neue-kategorie"
                  name="neue-kategorie"
                  placeholder="Neue Kategorie"
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateCategoryClick();
                    }
                  }}
                />
                <button
                  type="submit"
                  className="absolute top-1 right-0 flex scale-75 items-center justify-center hover:scale-100"
                >
                  <PlusIcon />
                </button>
              </form>
            </div>
          </div>

          <button
            onClick={() => setShowChapterDetails(true)}
            className="menu-button mt-0"
          >
            Neues Kapitel
          </button>

          {filteredChapters.length > 0 ? (
            <DragDropContext onDragEnd={dragEnd}>
              <Droppable droppableId="chapters">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex w-full flex-col gap-2"
                  >
                    {filteredChapters.map((chapter, index) => (
                      <ChapterComponent
                        key={chapter.id}
                        chapter={chapter}
                        handleVisibilityClick={handleVisibilityClick}
                        handleDeleteClick={handleDeleteClick}
                        deleteChapter={deleteChapter}
                        index={index}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="flex flex-col items-center">
              <p className="mt-2 text-lg font-bold text-red-500">
                Keine Kapitel
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ManageChapters;

interface ChapterModalProps {
  handleClick: (desc: string) => void;
  setShowChapterDetails: React.Dispatch<SetStateAction<boolean>>;
}
const ChapterModal: FC<ChapterModalProps> = ({
  handleClick,
  setShowChapterDetails,
}) => {
  const [description, setDescription] = useState<string>("");
  return (
    <div className="absolute z-50 flex w-[300px] flex-col items-center">
      <button
        onClick={() => setShowChapterDetails(false)}
        className="absolute right-0 rounded-md bg-red-400 py-1 px-2 transition hover:bg-red-500"
      >
        X
      </button>
      <p className="text-2xl font-bold">Kapitel</p>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="mt-2 w-full bg-slate-700 p-2"
        id="desc"
        placeholder="Titel"
        required
      />
      <button
        onClick={() => handleClick(description)}
        className="menu-button mt-4"
      >
        Erstelle neues Kapitel
      </button>
    </div>
  );
};
