import type { FC } from "react";

type statusType = "created" | "updated" | "deleted";
interface ConfirmModalProps {
  handleModal: () => void;
  status: statusType;
  type?: string;
}
const ConfirmModal: FC<ConfirmModalProps> = ({ handleModal, status, type }) => {
  return (
    <div className="absolute z-50">
      <p className="text-lg">
        {type ?? type} has been {status}{" "}
      </p>
      <button onClick={handleModal} className="reg-button">
        Close
      </button>
    </div>
  );
};

export default ConfirmModal;
