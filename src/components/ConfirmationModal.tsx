import { FC } from "react";

type statusType = "created" | "updated" | "deleted";
interface ConfirmModalProps {
  handleModal: () => void;
  status: statusType;
}
const ConfirmModal: FC<ConfirmModalProps> = ({ handleModal, status }) => {
  return (
    <div className="absolute z-50">
      <p className="text-lg">Question has been {status} </p>
      <button onClick={handleModal} className="reg-button">
        Close
      </button>
    </div>
  );
};

export default ConfirmModal;
