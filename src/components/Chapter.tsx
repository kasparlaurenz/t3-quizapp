import React, { FC } from "react";
import { Chapter } from "@prisma/client";
import DeleteButton from "./Buttons/DeleteButton";
import Link from "next/link";
import HiddenIcon from "./Icons/HiddenIcon";
import VisibleIcon from "./Icons/VisibleIcon";
import { Draggable } from "react-beautiful-dnd";
import { getStyle } from "../utils/lockDragAxis";

interface Props {
  chapter: Chapter;
  handleVisibilityClick: (chapter: Chapter) => void;
  handleDeleteClick: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    chapter: Chapter
  ) => Promise<void>;
  deleteChapter: any;
  index: number;
}

const ChapterComponent: FC<Props> = ({
  chapter,
  handleVisibilityClick,
  handleDeleteClick,
  deleteChapter,
  index,
}) => {
  return (
    <Draggable draggableId={chapter.id} index={index}>
      {(provided, snapshot) => (
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
              handleVisibilityClick(chapter);
            }}
            className="p-4"
            title={
              chapter.isHidden ? "Kapitel einblenden" : "Kapitel ausblenden"
            }
          >
            {chapter.isHidden ? <HiddenIcon /> : <VisibleIcon />}
          </button>

          <Link
            href={`edit-questions/chapter/${chapter.number}`}
            key={chapter.id}
            className={`${
              chapter.isHidden ? "bg-zinc-700 text-zinc-500" : "bg-slate-500"
            } relative flex h-auto w-full items-center justify-start rounded-md p-4 transition hover:bg-slate-700 md:max-w-[400px]`}
          >
            <h2>
              <span className="font-bold">{index + 1}.</span>{" "}
              {chapter.description}
            </h2>

            <DeleteButton
              handleClick={handleDeleteClick}
              itemToDelete={chapter}
              deleteItem={deleteChapter}
            />
          </Link>
        </div>
      )}
    </Draggable>
  );
};

export default ChapterComponent;
